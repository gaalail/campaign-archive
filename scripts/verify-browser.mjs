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

try {
  const context = await browser.newContext()
  const page = await context.newPage()
  const targets = [
    ...[...site.browserTargets]
      .filter((url) => url !== basePath)
      .map((url) => ({ url, expected: `${url}/` })),
    ...[...site.aliases]
      .filter(({ url, target }) => url !== target)
      .map(({ url, target }) => ({ url, expected: target })),
  ]
  const seen = new Set()

  for (const { url, expected } of targets) {
    if (seen.has(url)) continue
    seen.add(url)
    const expectedPath = new URL(expected, localOrigin).pathname
    try {
      const response = await page.goto(`${localOrigin}${url}`, {
        waitUntil: "domcontentloaded",
        timeout: 10_000,
      })
      await page.waitForURL((current) => current.pathname === expectedPath, {
        timeout: 10_000,
      })
      const finalPath = new URL(page.url()).pathname
      if (finalPath !== expectedPath) {
        failures.push(`${url} resolved to ${finalPath}, expected ${expectedPath}`)
      }
      if (response && response.status() >= 400) {
        failures.push(`${url} returned HTTP ${response.status()}`)
      }
    } catch (error) {
      failures.push(`${url}: ${error.message}`)
    }
  }

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
