import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parse as parseYaml } from "yaml"

const root = path.resolve("public")
const config = parseYaml(fs.readFileSync("quartz.config.yaml", "utf8"))
const baseUrl = config.configuration.baseUrl
const origin = new URL(`https://${baseUrl}`).origin
const basePath = new URL(`https://${baseUrl}`).pathname.replace(/\/$/, "")

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filepath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(filepath) : [filepath]
  })
}

function pageUrl(filepath) {
  const relative = path.relative(root, filepath).replaceAll(path.sep, "/")
  const route = relative.endsWith("/index.html")
    ? relative.slice(0, -"index.html".length)
    : relative.replace(/\.html$/, "")
  return new URL(`${basePath}/${route}`, origin)
}

function outputFile(pathname) {
  if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) return undefined
  let relative = decodeURIComponent(pathname.slice(basePath.length)).replace(/^\/+/, "")
  const candidates = [relative]
  if (!relative || relative.endsWith("/")) candidates.unshift(`${relative}index.html`)
  else {
    candidates.push(`${relative}.html`, `${relative}/index.html`)
  }
  for (const candidate of candidates) {
    const filepath = path.resolve(root, candidate)
    if (!filepath.startsWith(`${root}${path.sep}`) && filepath !== root) continue
    if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) return filepath
  }
  return undefined
}

function hrefs(html) {
  return [...html.matchAll(/\b(?:href|src|poster|data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)]
    .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
    .filter(Boolean)
}

export function canonicalUrl(html, fromUrl) {
  const canonical = html.match(/<link\b[^>]*\brel=(["'])canonical\1[^>]*\bhref=(["'])(.*?)\2/i)
  if (!canonical) return undefined
  try {
    return new URL(canonical[3], fromUrl)
  } catch {
    return undefined
  }
}

export function collectSite() {
  const htmlFiles = walk(root).filter((filepath) => filepath.endsWith(".html"))
  const documents = htmlFiles.map((filepath) => {
    const url = pageUrl(filepath)
    const html = fs.readFileSync(filepath, "utf8")
    return { filepath, url, html, canonical: canonicalUrl(html, url) }
  })
  const incoming = new Set()
  const errors = []
  const browserTargets = new Set()
  const aliases = []

  for (const document of documents) {
    for (const raw of hrefs(document.html)) {
      if (/^(?:#|data:|mailto:|tel:|javascript:|blob:)/i.test(raw)) continue
      let url
      try {
        url = new URL(raw, document.url)
      } catch {
        errors.push(`${path.relative(root, document.filepath)}: invalid URL ${raw}`)
        continue
      }
      if (url.origin !== origin) continue
      if (url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`)) {
        errors.push(
          `${path.relative(root, document.filepath)}: internal URL leaves ${basePath}: ${raw}`,
        )
        continue
      }
      const target = outputFile(url.pathname)
      if (!target) {
        errors.push(`${path.relative(root, document.filepath)}: missing target ${raw}`)
        continue
      }
      if (target.endsWith(".html") && !document.canonical) incoming.add(target)
      if (target.endsWith(`${path.sep}index.html`) && !url.pathname.endsWith("/")) {
        browserTargets.add(url.pathname)
      }
    }
    if (document.canonical) {
      const target = outputFile(document.canonical.pathname)
      if (document.canonical.origin !== origin || !target) {
        errors.push(
          `${path.relative(root, document.filepath)}: canonical target is missing or outside ${basePath}`,
        )
      } else {
        aliases.push({ url: document.url.pathname, target: document.canonical.pathname })
      }
    }
  }

  const sitemapPath = path.join(root, "sitemap.xml")
  if (!fs.existsSync(sitemapPath)) {
    errors.push("public/sitemap.xml is missing")
  } else {
    const sitemap = fs.readFileSync(sitemapPath, "utf8")
    for (const [, location] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      let url
      try {
        url = new URL(location)
      } catch {
        errors.push(`sitemap.xml: invalid URL ${location}`)
        continue
      }
      if (url.origin !== origin || !outputFile(url.pathname)) {
        errors.push(`sitemap.xml: missing or out-of-base page ${location}`)
      }
    }
  }

  const aliasFiles = new Set(documents.filter((doc) => doc.canonical).map((doc) => doc.filepath))
  const orphanFiles = documents
    .filter((doc) => !aliasFiles.has(doc.filepath) && !incoming.has(doc.filepath))
    .map((doc) => path.relative(root, doc.filepath).replaceAll(path.sep, "/"))
    .filter((filepath) => filepath !== "404.html" && filepath !== "index.html")
  return {
    errors,
    orphans: orphanFiles.sort(),
    aliases,
    browserTargets: [...browserTargets].sort(),
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = collectSite()
  const allowlistPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "built-site-allowlist.json",
  )
  const allowlist = JSON.parse(fs.readFileSync(allowlistPath, "utf8"))
  const allowed = new Set(allowlist.orphans ?? [])
  for (const orphan of result.orphans) {
    if (!allowed.has(orphan)) result.errors.push(`New unlinked page: ${orphan}`)
  }
  for (const orphan of allowed) {
    if (!result.orphans.includes(orphan))
      result.errors.push(`Remove stale built-site allowlist entry: ${orphan}`)
  }
  if (result.errors.length) {
    console.error(result.errors.join("\n"))
    console.error(`Site verification failed with ${result.errors.length} issue(s).`)
    process.exitCode = 1
  } else {
    console.log(
      `Built site verified: ${result.aliases.length} aliases, ${result.browserTargets.length} folder redirects, ${result.orphans.length} allowlisted unlinked pages.`,
    )
  }
}
