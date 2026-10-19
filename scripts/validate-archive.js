#!/usr/bin/env node

/**
 * Archive Validation Script
 *
 * Checks:
 * - Unresolved and ambiguous wikilinks/embeds
 * - Pages without explicit incoming or outgoing wikilinks
 * - Metadata consistency
 * - Class, subclass, and spell-catalogue relationships
 * - Duplicate entries
 * - Incomplete entries
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { parse as parseYaml } from "yaml"
import {
  createLinkHealthAllowlist,
  extractWikilinks,
  findGeneratedViewPages,
  loadLinkIndex,
  resolveWikilink,
} from "./link-health.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.resolve(__dirname, "../content")
const LINK_ALLOWLIST_PATH = path.join(__dirname, "link-health-allowlist.json")
const RESULTS = {
  errors: [],
  warnings: [],
  info: [],
}

// File cache: { filepath -> { title, links, metadata } }
const fileCache = {}

// Walk directory recursively
function walkDir(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  items.forEach((item) => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory() && !item.startsWith(".")) {
      files.push(...walkDir(fullPath))
    } else if (stat.isFile() && item.endsWith(".md") && !item.startsWith(".")) {
      files.push(fullPath)
    }
  })

  return files
}

// Parse frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const fm = {}
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":")
    if (key.trim()) {
      fm[key.trim()] = rest.join(":").trim()
    }
  })

  return fm
}

function parseYamlFrontmatter(filepath) {
  const content = fs.readFileSync(filepath, "utf-8")
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    return {}
  }

  try {
    return parseYaml(match[1]) || {}
  } catch (error) {
    const displayPath = path.relative(path.dirname(CONTENT_DIR), filepath).replaceAll("\\", "/")
    RESULTS.errors.push(`Invalid YAML frontmatter: ${displayPath}: ${error.message}`)
    return {}
  }
}

// Check for broken links
function checkWikilinks(linkIndex, allowlist) {
  console.log("\n📍 Checking wikilinks...")
  let brokenCount = 0
  let ambiguousCount = 0
  let allowlistedCount = 0

  for (const [filepath, data] of Object.entries(fileCache)) {
    const sourcePath = path
      .relative(CONTENT_DIR, filepath)
      .replaceAll("\\", "/")
      .replace(/\.md$/i, "")
    const allowlistSource = path.relative(CONTENT_DIR, filepath).replaceAll("\\", "/")
    const displayPath = path.relative(path.dirname(CONTENT_DIR), filepath).replaceAll("\\", "/")
    data.links.forEach((link) => {
      const result = resolveWikilink(link, sourcePath, linkIndex)
      if (result.status === "missing" || result.status === "ambiguous") {
        const kind = link.embed ? "embed" : "wikilink"
        const allowlisted = allowlist.consume({
          source: allowlistSource,
          target: link.target,
          fragment: link.fragment,
          kind,
          status: result.status,
          candidates: result.candidates,
        })
        if (allowlisted) {
          allowlistedCount++
          RESULTS.info.push(
            `Allowlisted ${result.status} ${kind}: ${displayPath}:${link.line}:${link.column} [[${link.target}${link.fragment ? `#${link.fragment}` : ""}]] (${allowlisted.reason})`,
          )
          link.result = result
          return
        }
        const destination = `${link.target}${link.fragment ? `#${link.fragment}` : ""}`
        RESULTS.errors.push(
          result.status === "missing"
            ? `${displayPath}:${link.line}:${link.column}: unresolved ${kind} [[${destination}]]`
            : `${displayPath}:${link.line}:${link.column}: ambiguous ${kind} [[${destination}]] matches ${result.candidates.join(", ")}`,
        )
        if (result.status === "missing") brokenCount++
        else ambiguousCount++
      }
      link.result = result
    })
  }

  for (const entry of allowlist.unused()) {
    RESULTS.errors.push(
      `Unused link-health allowlist entry: ${entry.source}: ${entry.status} ${entry.kind} [[${entry.target}${entry.fragment ? `#${entry.fragment}` : ""}]]`,
    )
  }

  RESULTS.info.push(
    `Wikilinks checked: ${Object.values(fileCache).reduce((count, data) => count + data.links.length, 0)}; unresolved: ${brokenCount}; ambiguous: ${ambiguousCount}; allowlisted: ${allowlistedCount}.`,
  )
}

// Report content pages with neither incoming nor outgoing wikilinks.
function checkUnlinkedPages(linkIndex) {
  console.log("\n📍 Checking for unlinked pages...")
  const incomingLinks = new Map()
  const outgoingLinks = new Map()
  const generatedViewPages = findGeneratedViewPages(linkIndex)
  RESULTS.info.push(`Pages included in generated .base views: ${generatedViewPages.size}.`)

  for (const [filepath, data] of Object.entries(fileCache)) {
    outgoingLinks.set(
      filepath,
      data.links.some((link) => link.result?.status === "resolved"),
    )
    for (const link of data.links) {
      if (link.result?.status === "resolved" && link.result.filePath) {
        const destination = path.resolve(CONTENT_DIR, link.result.filePath)
        incomingLinks.set(destination, true)
      }
    }
  }

  const orphaned = []
  for (const [filepath, data] of Object.entries(fileCache)) {
    const relativePath = path.relative(CONTENT_DIR, filepath)
    const generatedViewPath = relativePath.replaceAll("\\", "/")
    if (
      path.basename(filepath).toLowerCase() === "index.md" ||
      !relativePath.includes(path.sep) ||
      data.metadata.incomplete
    ) {
      continue
    }
    if (
      !incomingLinks.has(filepath) &&
      !outgoingLinks.get(filepath) &&
      !generatedViewPages.has(generatedViewPath)
    ) {
      orphaned.push(path.relative(path.dirname(CONTENT_DIR), filepath).replaceAll("\\", "/"))
    }
  }

  if (orphaned.length > 0) {
    RESULTS.warnings.push(
      `⚠ ${orphaned.length} pages have no incoming wikilinks, generated-view inclusion, or outgoing wikilinks`,
    )
    orphaned.slice(0, 5).forEach((f) => {
      RESULTS.info.push(`  - ${f}`)
    })
  } else {
    RESULTS.info.push(`✓ No orphaned files detected`)
  }
}

// Check metadata consistency
function checkMetadata() {
  console.log("\n📍 Checking metadata consistency...")

  const contentEntries = Object.values(fileCache).filter(
    (data) => path.basename(data.filepath).toLowerCase() !== "index.md",
  )
  const spells = contentEntries.filter((data) =>
    path.relative(CONTENT_DIR, data.filepath).replaceAll("\\", "/").startsWith("spells/"),
  )
  const items = contentEntries.filter((data) =>
    path.relative(CONTENT_DIR, data.filepath).replaceAll("\\", "/").startsWith("items/"),
  )

  let missingMetadata = 0

  spells.forEach((spell) => {
    if (!Object.hasOwn(spell.metadata, "level") && !spell.metadata.incomplete) {
      RESULTS.warnings.push(
        `Spell missing level: ${path.relative(path.dirname(CONTENT_DIR), spell.filepath).replaceAll("\\", "/")}`,
      )
      missingMetadata++
    }
    if (!Object.hasOwn(spell.metadata, "classes") && !spell.metadata.incomplete) {
      RESULTS.warnings.push(
        `Spell missing classes: ${path.relative(path.dirname(CONTENT_DIR), spell.filepath).replaceAll("\\", "/")}`,
      )
      missingMetadata++
    }
  })

  items.forEach((item) => {
    if (!Object.hasOwn(item.metadata, "item_type") && !item.metadata.incomplete) {
      RESULTS.warnings.push(
        `Item missing item_type: ${path.relative(path.dirname(CONTENT_DIR), item.filepath).replaceAll("\\", "/")}`,
      )
      missingMetadata++
    }
    if (!Object.hasOwn(item.metadata, "rarity") && !item.metadata.incomplete) {
      RESULTS.warnings.push(
        `Item missing rarity: ${path.relative(path.dirname(CONTENT_DIR), item.filepath).replaceAll("\\", "/")}`,
      )
      missingMetadata++
    }
  })

  if (missingMetadata === 0) {
    RESULTS.info.push(`✓ All metadata complete (${spells.length} spells, ${items.length} items)`)
  }
}

function checkContentRelationships() {
  console.log("\n📍 Checking content relationships...")
  const initialErrorCount = RESULTS.errors.length
  const contentEntries = Object.values(fileCache)
  const relativePath = (filepath) => path.relative(CONTENT_DIR, filepath).replaceAll("\\", "/")
  const classPages = new Map(
    contentEntries
      .filter((entry) => {
        const relative = relativePath(entry.filepath)
        return (
          relative.startsWith("character-options/classes/") &&
          path.basename(entry.filepath).toLowerCase() !== "index.md"
        )
      })
      .map((entry) => [path.basename(entry.filepath, ".md").toLowerCase(), entry.filepath]),
  )
  const subclassPages = contentEntries.filter((entry) => {
    const relative = relativePath(entry.filepath)
    return (
      relative.startsWith("character-options/subclasses/") &&
      path.basename(entry.filepath).toLowerCase() !== "index.md"
    )
  })

  let validParentRelationships = 0
  for (const subclass of subclassPages) {
    const metadata = parseYamlFrontmatter(subclass.filepath)
    const parentClass = metadata.parent_class
    const displayPath = relativePath(subclass.filepath)
    if (typeof parentClass !== "string" || !parentClass.trim()) {
      RESULTS.errors.push(`Subclass missing parent_class metadata: ${displayPath}`)
      continue
    }

    const parentKey = parentClass.trim().toLowerCase()
    if (!classPages.has(parentKey)) {
      RESULTS.errors.push(`Unknown parent_class "${parentClass}" on ${displayPath}`)
      continue
    }

    const subclassDirectory = path.basename(path.dirname(subclass.filepath)).toLowerCase()
    if (subclassDirectory !== parentKey) {
      RESULTS.errors.push(
        `Subclass directory "${subclassDirectory}" does not match parent_class "${parentClass}" on ${displayPath}`,
      )
      continue
    }

    validParentRelationships++
  }

  const listDirectory = path.join(CONTENT_DIR, "lists")
  const listFiles = fs
    .readdirSync(listDirectory)
    .filter((filename) => filename.endsWith(".base"))
    .map((filename) => path.join(listDirectory, filename))
  const catalogues = new Map()
  const filterPattern = /^subclass_spell_lists\.contains\(["'](.+)["']\)$/
  const collectFilterLabels = (value, labels) => {
    if (typeof value === "string") {
      const match = value.trim().match(filterPattern)
      if (match) {
        labels.add(match[1])
      }
    } else if (Array.isArray(value)) {
      value.forEach((item) => collectFilterLabels(item, labels))
    } else if (value && typeof value === "object") {
      Object.values(value).forEach((item) => collectFilterLabels(item, labels))
    }
  }

  for (const listFile of listFiles) {
    let parsed = {}
    try {
      parsed = parseYaml(fs.readFileSync(listFile, "utf-8")) || {}
    } catch (error) {
      RESULTS.errors.push(`Invalid YAML catalogue: ${relativePath(listFile)}: ${error.message}`)
    }

    const labels = new Set()
    collectFilterLabels(parsed.filters, labels)
    for (const label of labels) {
      if (catalogues.has(label)) {
        RESULTS.errors.push(
          `Multiple spell catalogues filter subclass_spell_lists "${label}": ${path.basename(catalogues.get(label))}, ${path.basename(listFile)}`,
        )
        continue
      }
      catalogues.set(label, listFile)
    }
  }

  const linkedCatalogues = new Set()
  for (const entry of contentEntries) {
    for (const link of entry.links) {
      if (link.embed && link.target.toLowerCase().endsWith("-spells.base")) {
        linkedCatalogues.add(path.basename(link.target).toLowerCase())
      }
    }
  }

  const taggedSpellCounts = new Map()
  const spells = contentEntries.filter((entry) =>
    relativePath(entry.filepath).startsWith("spells/"),
  )
  for (const spell of spells) {
    const metadata = parseYamlFrontmatter(spell.filepath)
    if (!Object.hasOwn(metadata, "subclass_spell_lists")) {
      continue
    }

    if (
      !Array.isArray(metadata.subclass_spell_lists) ||
      metadata.subclass_spell_lists.length === 0
    ) {
      RESULTS.errors.push(
        `subclass_spell_lists must be a non-empty list: ${relativePath(spell.filepath)}`,
      )
      continue
    }

    for (const label of metadata.subclass_spell_lists) {
      if (typeof label !== "string" || !catalogues.has(label)) {
        RESULTS.errors.push(
          `Unknown subclass spell-list label "${label}" on ${relativePath(spell.filepath)}`,
        )
        continue
      }

      const catalogue = catalogues.get(label)
      if (!linkedCatalogues.has(path.basename(catalogue).toLowerCase())) {
        RESULTS.errors.push(
          `Spell catalogue for "${label}" is not embedded by a content page: ${relativePath(catalogue)}`,
        )
        continue
      }

      taggedSpellCounts.set(label, (taggedSpellCounts.get(label) || 0) + 1)
    }
  }

  for (const [label, catalogue] of catalogues) {
    if (!taggedSpellCounts.has(label)) {
      RESULTS.errors.push(
        `Spell catalogue for "${label}" has no matching tagged spells: ${relativePath(catalogue)}`,
      )
    }
  }

  if (RESULTS.errors.length === initialErrorCount) {
    RESULTS.info.push(
      `✓ Content relationships verified (${validParentRelationships} subclass parents, ${taggedSpellCounts.size} subclass spell catalogues)`,
    )
  } else {
    RESULTS.info.push(
      `Content relationships scanned (${validParentRelationships}/${subclassPages.length} subclass parents, ${taggedSpellCounts.size}/${catalogues.size} subclass spell catalogues)`,
    )
  }
}

// Check for duplicate content
function checkDuplicates() {
  console.log("\n📍 Checking for duplicates...")

  const titles = {}
  let duplicates = 0

  for (const [filepath, data] of Object.entries(fileCache)) {
    const title = data.metadata.title || ""
    if (title) {
      if (titles[title]) {
        RESULTS.warnings.push(`Duplicate title "${title}": ${filepath} and ${titles[title]}`)
        duplicates++
      } else {
        titles[title] = filepath
      }
    }
  }

  if (duplicates === 0) {
    RESULTS.info.push(`✓ No duplicate titles found`)
  }
}

// Check for incomplete entries
function checkIncomplete() {
  console.log("\n📍 Checking incomplete entries...")

  const incomplete = Object.values(fileCache).filter((d) => d.metadata.incomplete)

  RESULTS.info.push(`ℹ ${incomplete.length} incomplete entries marked`)

  if (incomplete.length > 0 && incomplete.length < 500) {
    RESULTS.info.push(`Categories:`)
    const byType = {}
    incomplete.forEach((entry) => {
      const type = path.relative(CONTENT_DIR, entry.filepath).split(path.sep)[0] || "other"
      byType[type] = (byType[type] || 0) + 1
    })
    Object.entries(byType).forEach(([type, count]) => {
      RESULTS.info.push(`  - ${type}: ${count}`)
    })
  }
}

// Main validation
function validate() {
  console.log("🔍 Campaign Archive Validation\n")
  console.log(`Scanning ${CONTENT_DIR}...`)

  const files = walkDir(CONTENT_DIR)
  console.log(`Found ${files.length} markdown files\n`)
  const linkIndex = loadLinkIndex(CONTENT_DIR)
  const allowlist = createLinkHealthAllowlist(
    JSON.parse(fs.readFileSync(LINK_ALLOWLIST_PATH, "utf-8")),
  )

  // Cache all files
  files.forEach((filepath) => {
    const content = fs.readFileSync(filepath, "utf-8")
    const metadata = parseFrontmatter(content)
    const links = extractWikilinks(content)

    fileCache[filepath] = {
      filepath,
      metadata,
      links,
      size: content.length,
    }
  })

  // Run checks
  checkWikilinks(linkIndex, allowlist)
  checkUnlinkedPages(linkIndex)
  checkMetadata()
  checkContentRelationships()
  checkDuplicates()
  checkIncomplete()

  // Print results
  console.log("\n" + "=".repeat(60))
  console.log("VALIDATION RESULTS")
  console.log("=".repeat(60))

  if (RESULTS.errors.length > 0) {
    console.log(`\n❌ ERRORS (${RESULTS.errors.length}):`)
    RESULTS.errors.slice(0, 25).forEach((e) => console.log(`  ${e}`))
    if (RESULTS.errors.length > 25) {
      console.log(`  ... and ${RESULTS.errors.length - 25} more`)
    }
  }

  if (RESULTS.warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${RESULTS.warnings.length}):`)
    RESULTS.warnings.slice(0, 25).forEach((w) => console.log(`  ${w}`))
    if (RESULTS.warnings.length > 25) {
      console.log(`  ... and ${RESULTS.warnings.length - 25} more`)
    }
  }

  console.log(`\nℹ️  INFO (${RESULTS.info.length}):`)
  RESULTS.info.slice(0, 15).forEach((i) => console.log(`  ${i}`))
  if (RESULTS.info.length > 15) {
    console.log(`  ... and ${RESULTS.info.length - 15} more`)
  }

  console.log("\n" + "=".repeat(60))

  const hasErrors = RESULTS.errors.length > 0
  const status = process.argv.includes("--report-only")
    ? "REPORT ONLY — findings reported; exit code will be 0"
    : hasErrors
      ? "❌ FAILED"
      : "✅ PASSED"
  console.log(`Status: ${status}`)
  console.log(`Errors: ${RESULTS.errors.length} | Warnings: ${RESULTS.warnings.length}\n`)

  process.exit(hasErrors && !process.argv.includes("--report-only") ? 1 : 0)
}

validate()
