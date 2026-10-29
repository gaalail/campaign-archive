import fs from "node:fs"
import http from "node:http"
import path from "node:path"
import { chromium } from "playwright"
import { collectSite } from "./site-checks.js"

const root = path.resolve("public")
const basePath = "/campaign-archive"
const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
}

function resolveFile(url) {
  if (url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`)) return undefined
  let relative = decodeURIComponent(url.pathname.slice(basePath.length)).replace(/^\/+/, "")
  const candidates = []
  if (!relative) candidates.push("index.html")
  else if (relative.endsWith("/")) candidates.push(`${relative}index.html`)
  else candidates.push(relative, `${relative}.html`, `${relative}/index.html`)
  for (const candidate of candidates) {
    const filepath = path.resolve(root, candidate)
    if (!filepath.startsWith(`${root}${path.sep}`) && filepath !== root) continue
    if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) return filepath
  }
  return undefined
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1")
  const relative = decodeURIComponent(url.pathname.slice(basePath.length)).replace(/^\/+/, "")
  const directory = path.resolve(root, relative)
  if (
    url.pathname.startsWith(`${basePath}/`) &&
    !url.pathname.endsWith("/") &&
    fs.existsSync(directory) &&
    fs.statSync(directory).isDirectory() &&
    fs.existsSync(path.join(directory, "index.html"))
  ) {
    response.writeHead(301, { location: `${url.pathname}/${url.search}` }).end()
    return
  }

  const filepath = resolveFile(url)
  if (!filepath) {
    response.writeHead(404).end("Not Found")
    return
  }
  response.writeHead(200, {
    "content-type": mimeTypes[path.extname(filepath)] ?? "application/octet-stream",
  })
  fs.createReadStream(filepath).pipe(response)
})

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
const address = server.address()
const localOrigin = `http://127.0.0.1:${address.port}`
let browser

try {
  browser = await chromium.launch({ headless: true })
} catch (error) {
  server.close()
  console.error(
    `Could not start a browser. Install Chromium with \`npx playwright install chromium\`.\n${error.message}`,
  )
  process.exit(1)
}

const site = collectSite()
const failures = []
const badResponses = new Set()
const page = await browser.newPage()
page.on("response", (response) => {
  if (response.url().startsWith(localOrigin) && response.status() >= 400) {
    badResponses.add(`${response.status()} ${response.url()}`)
  }
})
page.on("requestfailed", (request) => {
  if (request.url().startsWith(localOrigin)) {
    badResponses.add(
      `request failed ${request.url()}: ${request.failure()?.errorText ?? "unknown"}`,
    )
  }
})

try {
  await page.goto(`${localOrigin}${basePath}/`, { waitUntil: "domcontentloaded" })
  const folder = site.browserTargets.find((url) => url !== basePath)
  const alias = site.aliases.find(({ url, target }) => url !== target)
  const targets = [
    ...(folder ? [{ url: folder, expected: `${folder}/` }] : []),
    ...(alias ? [{ url: alias.url, expected: alias.target }] : []),
  ]
  const seen = new Set()

  for (const { url, expected } of targets) {
    if (seen.has(url)) continue
    seen.add(url)
    const priorPath = new URL(page.url()).pathname
    if (priorPath === expected || priorPath === url) continue
    try {
      await page.evaluate((href) => {
        const anchor = document.createElement("a")
        anchor.href = href
        anchor.textContent = "navigation check"
        document.body.append(anchor)
        anchor.click()
        anchor.remove()
      }, `${localOrigin}${url}`)
      await page.waitForFunction(
        ({ before, target, requested }) =>
          location.pathname !== before &&
          !document.querySelector(".navigation-progress") &&
          (location.pathname === target || location.pathname === requested),
        { before: priorPath, target: expected, requested: url },
        { timeout: 12000 },
      )
      const result = await page.evaluate(() => ({
        pathname: location.pathname,
        title: document.title,
        heading: document.querySelector("h1")?.textContent ?? "",
        body: document.body.innerText.slice(0, 500),
      }))
      if (!result.pathname.startsWith(`${basePath}/`)) {
        failures.push(`${url} left the base path at ${result.pathname}`)
      }
      if (/not found|404/i.test(`${result.title} ${result.heading}`)) {
        failures.push(`${url} opened a Not Found page (${result.title || result.heading})`)
      }
      if (result.pathname !== expected && result.pathname !== url) {
        failures.push(`${url} ended at unexpected path ${result.pathname}`)
      }
    } catch (error) {
      const state = await page.evaluate(() => ({
        pathname: location.pathname,
        title: document.title,
        progress: Boolean(document.querySelector(".navigation-progress")),
      }))
      failures.push(`${url}: ${error.message}; current=${JSON.stringify(state)}`)
      await page.goto(`${localOrigin}${basePath}/`, { waitUntil: "domcontentloaded" })
    }
  }

  for (const failure of badResponses) failures.push(failure)

  if (failures.length) {
    console.error(failures.join("\n"))
    console.error(`Browser navigation verification failed: ${failures.length} issue(s).`)
    process.exitCode = 1
  } else {
    console.log(
      `Browser navigation verified: ${seen.size} folder and alias URLs stayed within ${basePath}/.`,
    )
  }
} finally {
  await browser.close()
  server.close()
}
