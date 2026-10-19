import fs from "node:fs"
import path from "node:path"
import { parse as parseYaml } from "yaml"

const EMBEDDABLE_EXTENSIONS = new Set([
  ".md",
  ".base",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".avif",
])

export function createLinkHealthAllowlist(entries) {
  if (!Array.isArray(entries)) {
    throw new TypeError("Link-health allowlist must be an array")
  }

  const allowed = new Map()
  entries.forEach((entry, index) => {
    const label = `Link-health allowlist entry ${index + 1}`
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new TypeError(`${label} must be an object`)
    }
    const { source, target, fragment, kind, status, reason, candidates } = entry
    if (
      typeof source !== "string" ||
      !source.endsWith(".md") ||
      source.startsWith("/") ||
      source.includes("\\") ||
      source.split("/").some((part) => part === "." || part === "..") ||
      typeof target !== "string" ||
      !target.trim() ||
      !["wikilink", "embed"].includes(kind) ||
      !["missing", "ambiguous"].includes(status) ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      throw new TypeError(
        `${label} requires a content-relative Markdown source, target, kind, status, and reason`,
      )
    }
    if (fragment !== undefined && (typeof fragment !== "string" || !fragment.trim())) {
      throw new TypeError(`${label} fragment must be a non-empty string when provided`)
    }
    if (
      status === "ambiguous" &&
      (!Array.isArray(candidates) ||
        candidates.length < 2 ||
        candidates.some((candidate) => typeof candidate !== "string" || !candidate))
    ) {
      throw new TypeError(`${label} must specify candidates for an ambiguous link`)
    }
    if (status === "missing" && candidates !== undefined) {
      throw new TypeError(`${label} cannot specify candidates for a missing link`)
    }

    const key = JSON.stringify([source, target, fragment ?? "", kind, status])
    if (allowed.has(key)) throw new TypeError(`${label} duplicates an earlier entry`)
    allowed.set(key, {
      source,
      target,
      fragment,
      kind,
      status,
      reason,
      candidates: candidates ? [...candidates].sort() : undefined,
      used: false,
    })
  })

  return {
    consume(finding) {
      const key = JSON.stringify([
        finding.source,
        finding.target,
        finding.fragment ?? "",
        finding.kind,
        finding.status,
      ])
      const entry = allowed.get(key)
      if (!entry) return undefined
      if (
        entry.candidates &&
        (!Array.isArray(finding.candidates) ||
          JSON.stringify(entry.candidates) !== JSON.stringify([...finding.candidates].sort()))
      ) {
        return undefined
      }
      entry.used = true
      return entry
    },
    unused() {
      return [...allowed.values()].filter((entry) => !entry.used)
    },
  }
}

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

function parseBaseFile(content) {
  const parsed = parseYaml(content)
  return {
    filters: parsed?.filters,
    views: Array.isArray(parsed?.views) ? parsed.views : [],
  }
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
      if (
        fenceMatch &&
        fenceMatch[1][0] === fence.character &&
        fenceMatch[1].length >= fence.length
      ) {
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
  const metadata = (() => {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
    return match ? (parseYaml(match[1]) ?? {}) : {}
  })()
  const aliases = Array.isArray(metadata.aliases)
    ? metadata.aliases
    : typeof metadata.aliases === "string"
      ? [metadata.aliases]
      : []
  return {
    filePath,
    fullPath: normalizeTarget(withoutExtension),
    routePath: normalizeTarget(routePath),
    filename: isIndex ? undefined : normalizeTarget(path.posix.basename(withoutExtension)),
    title: metadata.title,
    aliases: aliases.map((alias) => normalizeTarget(String(alias))),
    metadata,
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
        base: extension === ".base" ? parseBaseFile(file.content ?? "") : undefined,
      })
    }
  }

  return { pages, resources }
}

export function findAliasConflicts(index) {
  const canonicalPages = new Map()
  const aliasPages = new Map()

  for (const page of index.pages) {
    for (const route of new Set([page.fullPath, page.routePath])) {
      const pages = canonicalPages.get(route) ?? []
      pages.push(page)
      canonicalPages.set(route, pages)
    }
    for (const alias of page.aliases) {
      const pages = aliasPages.get(alias) ?? []
      pages.push(page)
      aliasPages.set(alias, pages)
    }
  }

  const conflicts = []
  for (const [alias, pages] of aliasPages) {
    const owners = [...new Map(pages.map((page) => [page.filePath, page])).values()]
    if (owners.length > 1) {
      conflicts.push({
        alias,
        reason: `assigned to multiple pages: ${owners.map((page) => page.filePath).join(", ")}`,
      })
      continue
    }

    const canonicalOwners = [
      ...new Map((canonicalPages.get(alias) ?? []).map((page) => [page.filePath, page])).values(),
    ]
    const otherCanonicalOwners = canonicalOwners.filter(
      (page) => page.filePath !== owners[0].filePath,
    )
    if (otherCanonicalOwners.length > 0) {
      conflicts.push({
        alias,
        reason: `conflicts with canonical page path: ${otherCanonicalOwners.map((page) => page.filePath).join(", ")}`,
      })
    }
  }

  return conflicts
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
          content: [".md", ".base"].includes(extension) ? fs.readFileSync(fullPath, "utf8") : "",
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

  const matches =
    normalized.includes("/") && exact.length > 0 ? exact : uniqueRecords([...exact, ...suffix])
  if (matches.length === 1) return { status: "resolved", filePath: matches[0].filePath }
  if (matches.length > 1)
    return { status: "ambiguous", candidates: matches.map((record) => record.filePath) }
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
    pageResult = resolveFromCandidates(index.pages, normalized, (page) => [
      page.fullPath,
      page.routePath,
      ...page.aliases,
    ])
  } else {
    const directMatches = uniqueRecords(
      index.pages.filter(
        (page) =>
          page.filename === normalized ||
          (page.title && normalizeTarget(page.title) === normalized) ||
          page.aliases.includes(normalized),
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
        ...page.aliases,
      ])
    }
  }

  if (pageResult.status !== "missing" || !link.embed) return pageResult

  const resourceResult = resolveFromCandidates(index.resources, target, (resource) => [
    resource.fullPath,
    resource.basename,
  ])
  if (resourceResult.status !== "resolved" || !link.fragment) return resourceResult

  const resource = index.resources.find(
    (candidate) => candidate.filePath === resourceResult.filePath,
  )
  if (!resource?.base) return resourceResult

  const requestedView = normalizeTarget(link.fragment)
  const matchingView = resource.base.views.some(
    (view) => normalizeTarget(view.name ?? "") === requestedView,
  )
  return matchingView
    ? resourceResult
    : { status: "missing", reason: "base view", filePath: resource.filePath }
}

function evaluateFilter(filter, page) {
  if (!filter) return true
  if (Array.isArray(filter)) return filter.every((entry) => evaluateFilter(entry, page))
  if (typeof filter === "object") {
    if (Array.isArray(filter.and)) return filter.and.every((entry) => evaluateFilter(entry, page))
    if (Array.isArray(filter.or)) return filter.or.some((entry) => evaluateFilter(entry, page))
    if ("not" in filter) return !evaluateFilter(filter.not, page)
    return true
  }
  if (typeof filter !== "string") return true

  const folderMatch = filter.match(/^file\.inFolder\(["'](.+)["']\)$/)
  if (folderMatch) {
    const folder = normalizeTarget(folderMatch[1])
    const pagePath = normalizeTarget(page.filePath.replace(/\.md$/i, ""))
    return pagePath.startsWith(`${folder}/`)
  }

  const nameMatch = filter.match(/^file\.name\s*(==|!=)\s*["']([^"']+)["']$/)
  if (nameMatch) {
    const matches = page.filename === normalizeTarget(nameMatch[2])
    return nameMatch[1] === "==" ? matches : !matches
  }

  const containsMatch = filter.match(/^([a-zA-Z_][\w.]*)\.contains\(["']([^"']+)["']\)$/)
  if (containsMatch) {
    const value = page.metadata[containsMatch[1]]
    return (
      Array.isArray(value) &&
      value.some((entry) => normalizeTarget(String(entry)) === normalizeTarget(containsMatch[2]))
    )
  }

  const comparisonMatch = filter.match(/^([a-zA-Z_][\w.]*)\s*(==|!=)\s*(.+)$/)
  if (comparisonMatch && comparisonMatch[1] !== "parent_class") {
    const [, key, operator, rawValue] = comparisonMatch
    const quoted = rawValue.match(/^(["'])(.*)\1$/)
    const expected = quoted
      ? quoted[2]
      : rawValue === "true"
        ? true
        : rawValue === "false"
          ? false
          : Number.isNaN(Number(rawValue))
            ? rawValue
            : Number(rawValue)
    const actual = page.metadata[key]
    const matches = Array.isArray(actual)
      ? actual.some((entry) => normalizeTarget(String(entry)) === normalizeTarget(String(expected)))
      : typeof actual === "string" && typeof expected === "string"
        ? normalizeTarget(actual) === normalizeTarget(expected)
        : actual === expected
    return operator === "==" ? matches : !matches
  }

  return true
}

export function findGeneratedViewPages(index) {
  const referencedPages = new Set()
  const bases = index.resources.filter((resource) => resource.base)

  for (const page of index.pages) {
    for (const resource of bases) {
      if (!evaluateFilter(resource.base.filters, page)) continue
      const includedByView =
        resource.base.views.length === 0 ||
        resource.base.views.some((view) => evaluateFilter(view.filters, page))
      if (includedByView) {
        referencedPages.add(page.filePath)
        break
      }
    }
  }

  return referencedPages
}
