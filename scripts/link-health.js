import fs from "node:fs"
import path from "node:path"

const EMBEDDABLE_EXTENSIONS = new Set([".md", ".base", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".avif"])

function normalizeTarget(value) {
  return value
    .replaceAll("\\", "/")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^\.\//, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.md$/i, "")
    .normalize("NFC")
    .toLocaleLowerCase("en-US")
}

function parseFrontmatterTitle(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return undefined

  const title = match[1].match(/^title:\s*(.*?)\s*$/m)?.[1]
  return title?.replace(/^(['"])(.*)\1$/, "$2").trim()
}

function maskInlineCode(line) {
  return line.replace(/(`+)(.*?)\1/g, (match) => " ".repeat(match.length))
}

export function extractWikilinks(content) {
  const links = []
  const lines = content.split(/\r?\n/)
  let frontmatter = lines[0]?.trim() === "---"
  let fence

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    if (frontmatter) {
      if (index > 0 && line.trim() === "---") frontmatter = false
      continue
    }

    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fence) {
      if (fenceMatch && fenceMatch[1][0] === fence.character && fenceMatch[1].length >= fence.length) {
        fence = undefined
      }
      continue
    }
    if (fenceMatch) {
      fence = { character: fenceMatch[1][0], length: fenceMatch[1].length }
      continue
    }
    if (/^(?: {4}|\t)/.test(line)) continue

    const visibleLine = maskInlineCode(line)
    const pattern = /(!?)\[\[([^\]\r\n]+)\]\]/g
    let match
    while ((match = pattern.exec(visibleLine)) !== null) {
      const [linkTarget, alias] = match[2].split("|", 2)
      const [pageTarget, fragment] = linkTarget.split("#", 2)
      links.push({
        target: pageTarget.trim(),
        alias: alias?.trim(),
        fragment: fragment?.trim(),
        embed: match[1] === "!",
        line: index + 1,
        column: match.index + 1,
      })
    }
  }

  return links
}

function createPageRecord(filePath, content = "") {
  const withoutExtension = filePath.replace(/\.md$/i, "")
  const isIndex = /(?:^|\/)index$/i.test(withoutExtension)
  const routePath = withoutExtension.replace(/(?:^|\/)index$/i, "")
  return {
    filePath,
    fullPath: normalizeTarget(withoutExtension),
    routePath: normalizeTarget(routePath),
    filename: isIndex ? undefined : normalizeTarget(path.posix.basename(withoutExtension)),
    title: parseFrontmatterTitle(content),
  }
}

export function createLinkIndex(files) {
  const pages = []
  const resources = []

  for (const file of files) {
    const filePath = file.path.replaceAll("\\", "/")
    const extension = path.posix.extname(filePath).toLowerCase()
    if (extension === ".md") {
      pages.push(createPageRecord(filePath, file.content ?? ""))
    } else if (EMBEDDABLE_EXTENSIONS.has(extension)) {
      resources.push({
        filePath,
        fullPath: normalizeTarget(filePath),
        basename: normalizeTarget(path.posix.basename(filePath)),
      })
    }
  }

  return { pages, resources }
}

export function loadLinkIndex(contentDirectory) {
  const files = []
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(fullPath)
      } else if (entry.isFile()) {
        const extension = path.extname(entry.name).toLowerCase()
        if (!EMBEDDABLE_EXTENSIONS.has(extension)) continue
        files.push({
          path: path.relative(contentDirectory, fullPath).replaceAll("\\", "/"),
          content: extension === ".md" ? fs.readFileSync(fullPath, "utf8") : "",
        })
      }
    }
  }

  visit(contentDirectory)
  return createLinkIndex(files)
}

function uniqueRecords(records) {
  return [...new Map(records.map((record) => [record.filePath, record])).values()]
}

function resolveFromCandidates(candidates, requested, getKeys) {
  const normalized = normalizeTarget(requested)
  if (!normalized) return { status: "resolved" }

  const exact = uniqueRecords(candidates.filter((record) => getKeys(record).includes(normalized)))
  const suffix = uniqueRecords(
    candidates.filter((record) => getKeys(record).some((key) => key.endsWith(`/${normalized}`))),
  )

  const matches = normalized.includes("/") && exact.length > 0
    ? exact
    : uniqueRecords([...exact, ...suffix])
  if (matches.length === 1) return { status: "resolved", filePath: matches[0].filePath }
  if (matches.length > 1) return { status: "ambiguous", candidates: matches.map((record) => record.filePath) }
  return { status: "missing" }
}

export function resolveWikilink(link, sourcePath, index) {
  let target = link.target.trim()
  if (!target && link.fragment) target = sourcePath
  if (/^(?:\.{1,2})\//.test(target)) {
    target = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), target))
    if (target === ".." || target.startsWith("../")) return { status: "missing" }
  }

  const normalized = normalizeTarget(target)
  let pageResult

  if (normalized.includes("/")) {
    pageResult = resolveFromCandidates(index.pages, normalized, (page) => [page.fullPath, page.routePath])
  } else {
    const directMatches = uniqueRecords(
      index.pages.filter(
        (page) => page.filename === normalized || (page.title && normalizeTarget(page.title) === normalized),
      ),
    )
    if (directMatches.length === 1) {
      pageResult = { status: "resolved", filePath: directMatches[0].filePath }
    } else if (directMatches.length > 1) {
      pageResult = {
        status: "ambiguous",
        candidates: directMatches.map((page) => page.filePath),
      }
    } else {
      pageResult = resolveFromCandidates(index.pages, normalized, (page) => [
        page.fullPath,
        page.routePath,
      ])
    }
  }

  if (pageResult.status !== "missing" || !link.embed) return pageResult

  return resolveFromCandidates(index.resources, target, (resource) => [
    resource.fullPath,
    resource.basename,
  ])
}
