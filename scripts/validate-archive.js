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
import { validateItemCounts, validateSpellCounts } from "./content-counts.js"
import { validateMetadata } from "./metadata-schema.js"
import {
  createLinkHealthAllowlist,
  extractWikilinks,
  findAliasConflicts,
  findGeneratedViewPages,
  loadLinkIndex,
  resolveWikilink,
} from "./link-health.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONTENT_DIR = path.resolve(__dirname, "../content")
const LINK_ALLOWLIST_PATH = path.join(__dirname, "link-health-allowlist.json")
const CONTENT_METADATA_SCHEMA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "content-metadata-schema.json"), "utf-8"),
)
const CONTENT_REGISTRY = JSON.parse(
  fs.readFileSync(path.join(__dirname, "content-registry.json"), "utf-8"),
)
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

function parseFrontmatter(content, filepath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  try {
    return parseYaml(match[1]) || {}
  } catch (error) {
    if (filepath) {
      const displayPath = path.relative(path.dirname(CONTENT_DIR), filepath).replaceAll("\\", "/")
      RESULTS.errors.push(`Invalid YAML frontmatter: ${displayPath}: ${error.message}`)
    }
    return {}
  }
}

function parseYamlFrontmatter(filepath) {
  return parseFrontmatter(fs.readFileSync(filepath, "utf-8"), filepath)
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
function checkRegistry() {
  console.log("\n📍 Checking expansion registry...")
  let errors = 0

  const classDirectory = path.join(CONTENT_DIR, "character-options", "classes")
  const registeredClasses = new Set(
    Object.keys(CONTENT_REGISTRY.classes ?? {}).map((name) => name.toLowerCase()),
  )
  for (const filename of fs.readdirSync(classDirectory)) {
    if (!filename.endsWith(".md") || filename.toLowerCase() === "index.md") continue
    const className = path.basename(filename, ".md")
    if (!registeredClasses.has(className.toLowerCase())) {
      RESULTS.errors.push(
        `Class is missing from expansion registry: character-options/classes/${filename}`,
      )
      errors++
    }
  }

  for (const [className, expected] of Object.entries(CONTENT_REGISTRY.classes ?? {})) {
    const classPath = path.join(CONTENT_DIR, "character-options", "classes", `${className}.md`)
    if (!fs.existsSync(classPath)) {
      RESULTS.errors.push(`Registry class is missing: character-options/classes/${className}.md`)
      errors++
      continue
    }
    const metadata = parseFrontmatter(fs.readFileSync(classPath, "utf-8"), classPath)
    for (const field of ["source", "source_type"]) {
      if (expected[field] !== undefined && metadata[field] !== expected[field]) {
        RESULTS.errors.push(
          `Registry mismatch for ${className}: ${field} is "${metadata[field] ?? "missing"}", expected "${expected[field]}"`,
        )
        errors++
      }
    }
    if (expected.spell_catalogue) {
      const cataloguePath = path.join(CONTENT_DIR, "lists", expected.spell_catalogue)
      if (!fs.existsSync(cataloguePath)) {
        RESULTS.errors.push(`Registry catalogue is missing: lists/${expected.spell_catalogue}`)
        errors++
      } else {
        const classEntry = fileCache[classPath]
        const expectedCatalogue = expected.spell_catalogue.toLowerCase()
        const embedsCatalogue = classEntry?.links.some(
          (link) =>
            link.embed && path.posix.basename(link.target).toLowerCase() === expectedCatalogue,
        )
        if (!embedsCatalogue) {
          RESULTS.errors.push(
            `Registry class ${className} does not embed lists/${expected.spell_catalogue}`,
          )
          errors++
        }
      }
    }
  }

  if (errors === 0) {
    RESULTS.info.push("✓ Expansion registry matches class provenance and catalogues")
  }
}

function checkCanonicalIdentity() {
  console.log("\n📍 Checking canonical identities and provenance...")
  const ids = new Map()
  let checked = 0
  let errors = 0
  const validTypes = new Set([
    "class",
    "spell",
    "item",
    "campaign",
    "monster",
    "rule",
    "character_option",
  ])

  for (const data of Object.values(fileCache)) {
    const metadata = data.metadata
    if (!metadata.entity_type && !metadata.canonical_id) continue
    const relative = path.relative(CONTENT_DIR, data.filepath).replaceAll("\\", "/")
    checked++

    if (!validTypes.has(metadata.entity_type)) {
      RESULTS.errors.push(`${relative}: invalid entity_type "${metadata.entity_type ?? "missing"}"`)
      errors++
    }
    if (typeof metadata.canonical_id !== "string" || !metadata.canonical_id.trim()) {
      RESULTS.errors.push(`${relative}: missing canonical_id`)
      errors++
      continue
    }
    const owner = ids.get(metadata.canonical_id)
    if (owner) {
      RESULTS.errors.push(
        `Duplicate canonical_id "${metadata.canonical_id}": ${owner} and ${relative}`,
      )
      errors++
    } else {
      ids.set(metadata.canonical_id, relative)
    }

    if (typeof metadata.source === "string" && metadata.source.trim()) {
      if (!CONTENT_METADATA_SCHEMA.source_types.includes(metadata.source_type)) {
        RESULTS.errors.push(
          `${relative}: invalid or missing source_type for source "${metadata.source}"`,
        )
        errors++
      }
      if (
        !CONTENT_METADATA_SCHEMA.editions.includes(metadata.edition) &&
        metadata.entity_type !== "campaign"
      ) {
        RESULTS.errors.push(`${relative}: invalid or missing edition`)
        errors++
      }
      if (!CONTENT_METADATA_SCHEMA.adaptations.includes(metadata.adaptation)) {
        RESULTS.errors.push(`${relative}: invalid or missing adaptation`)
        errors++
      }
      if (!CONTENT_METADATA_SCHEMA.license_statuses.includes(metadata.license_status)) {
        RESULTS.errors.push(`${relative}: invalid or missing license_status`)
        errors++
      }
    }
  }

  if (errors === 0) {
    RESULTS.info.push(`✓ Canonical identities validated (${checked} pages, ${ids.size} unique IDs)`)
  }
}

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
  const monsters = contentEntries.filter((data) =>
    path.relative(CONTENT_DIR, data.filepath).replaceAll("\\", "/").startsWith("monsters/"),
  )
  if (monsters.length === 0) {
    RESULTS.warnings.push("No monster records found")
  }
  for (const monster of monsters) {
    for (const field of ["habitats", "roles", "tags", "campaigns", "encounters"]) {
      if (monster.metadata[field] !== undefined && !Array.isArray(monster.metadata[field])) {
        RESULTS.errors.push(
          `Monster ${path.relative(CONTENT_DIR, monster.filepath).replaceAll("\\", "/")}: ${field} must be an array`,
        )
      }
    }
    for (const field of ["legendary", "lair", "spellcaster"]) {
      if (monster.metadata[field] !== undefined && typeof monster.metadata[field] !== "boolean") {
        RESULTS.errors.push(
          `Monster ${path.relative(CONTENT_DIR, monster.filepath).replaceAll("\\", "/")}: ${field} must be boolean`,
        )
      }
    }
  }

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
    RESULTS.info.push(
      `✓ All metadata complete (${spells.length} spells, ${items.length} items, ${monsters.length} monsters)`,
    )
  }

  const schemaPages = Object.values(fileCache).flatMap((data) => {
    const relative = path.relative(CONTENT_DIR, data.filepath).replaceAll("\\", "/")
    const parts = relative.split("/")
    const isIndex = path.basename(data.filepath).toLowerCase() === "index.md"
    const schemaName =
      parts[0] === "spells" && !isIndex
        ? "spell"
        : parts[0] === "items" && !isIndex
          ? "item"
          : parts[0] === "campaigns"
            ? "campaign"
            : parts[0] === "monsters" && !isIndex
              ? "monster"
              : parts[0] === "character-options" && parts[1] === "classes" && !isIndex
                ? "class"
                : parts[0] === "character-options"
                  ? "character_option"
                  : undefined
    return schemaName ? [{ data, relative, schemaName }] : []
  })

  let schemaErrorCount = 0
  for (const { data, relative, schemaName } of schemaPages) {
    const schema = CONTENT_METADATA_SCHEMA.schemas[schemaName]
    const failures = validateMetadata(data.metadata, schema, CONTENT_METADATA_SCHEMA)
    for (const failure of failures) {
      RESULTS.errors.push(`${relative}: invalid ${schemaName} metadata: ${failure}`)
      schemaErrorCount++
    }
  }

  const schemaPagePaths = new Set(schemaPages.map(({ data }) => data.filepath))
  const sourceTypeSchema = {
    required: [],
    fields: {
      source_type: CONTENT_METADATA_SCHEMA.schemas.character_option.fields.source_type,
    },
  }
  for (const data of Object.values(fileCache)) {
    if (
      schemaPagePaths.has(data.filepath) ||
      typeof data.metadata.source !== "string" ||
      !data.metadata.source.trim()
    ) {
      continue
    }
    const relative = path.relative(CONTENT_DIR, data.filepath).replaceAll("\\", "/")
    const failures = validateMetadata(data.metadata, sourceTypeSchema, CONTENT_METADATA_SCHEMA)
    for (const failure of failures) {
      RESULTS.errors.push(`${relative}: invalid source metadata: ${failure}`)
      schemaErrorCount++
    }
  }

  const legacyIncomplete = schemaPages.filter(
    ({ data }) => data.metadata.incomplete === true && !data.metadata.content_status,
  ).length
  if (legacyIncomplete > 0) {
    RESULTS.warnings.push(
      `${legacyIncomplete} content entries still use legacy incomplete metadata without content_status`,
    )
  }
  if (schemaErrorCount === 0) {
    RESULTS.info.push(
      `✓ Metadata schemas validated (${schemaPages.length} class, spell, item, campaign, and character-option pages)`,
    )
  }
}

function checkDisplayedCounts() {
  console.log("\n📍 Checking displayed content counts...")
  const entriesIn = (section) =>
    Object.values(fileCache)
      .filter((data) => {
        const relative = path.relative(CONTENT_DIR, data.filepath).replaceAll("\\", "/")
        return (
          relative.startsWith(`${section}/`) &&
          path.basename(data.filepath).toLowerCase() !== "index.md"
        )
      })
      .map((data) => data.metadata)

  const checks = [
    {
      section: "spells",
      result: validateSpellCounts(
        fs.readFileSync(path.join(CONTENT_DIR, "spells/index.md"), "utf-8"),
        entriesIn("spells"),
      ),
    },
    {
      section: "items",
      result: validateItemCounts(
        fs.readFileSync(path.join(CONTENT_DIR, "items/index.md"), "utf-8"),
        entriesIn("items"),
      ),
    },
  ]

  for (const { section, result } of checks) {
    for (const error of result.errors) {
      RESULTS.errors.push(`${section}/index.md: ${error}`)
    }
    if (result.errors.length === 0) {
      RESULTS.info.push(
        `✓ ${section} count table matches metadata (${result.metadataTotal} entries across all displayed categories)`,
      )
    }
  }
}

function checkContentRelationships() {
  console.log("\n📍 Checking content relationships...")
  const initialErrorCount = RESULTS.errors.length
  const contentEntries = Object.values(fileCache)
  const relativePath = (filepath) => path.relative(CONTENT_DIR, filepath).replaceAll("\\", "/")
  const classPages = new Map()
  for (const entry of contentEntries) {
    const relative = relativePath(entry.filepath)
    if (
      !relative.startsWith("character-options/classes/") ||
      path.basename(entry.filepath).toLowerCase() === "index.md"
    ) {
      continue
    }
    const title = String(entry.metadata.title || path.basename(entry.filepath, ".md"))
      .trim()
      .toLocaleLowerCase("en-US")
    classPages.set(title, [...(classPages.get(title) ?? []), entry])
  }
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
    if (!classPages.has(parentKey) || classPages.get(parentKey).length !== 1) {
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

  const spellClasses = new Map()
  const spellEntries = contentEntries.filter((entry) =>
    relativePath(entry.filepath).startsWith("spells/"),
  )
  for (const spell of spellEntries) {
    const metadata = spell.metadata
    if (!Array.isArray(metadata.classes)) continue
    for (const className of metadata.classes) {
      if (typeof className !== "string" || !className.trim()) continue
      const normalized = className.trim().toLocaleLowerCase("en-US")
      const coverage = spellClasses.get(normalized) ?? {
        name: className.trim(),
        count: 0,
        sources: new Map(),
      }
      coverage.count++
      const source = String(metadata.source || "Unspecified")
      coverage.sources.set(source, (coverage.sources.get(source) ?? 0) + 1)
      spellClasses.set(normalized, coverage)
    }
  }

  const classFiltersIn = (value, labels) => {
    if (typeof value === "string") {
      const match = value.trim().match(/^classes\.contains\(["'](.+)["']\)$/)
      if (match) labels.add(match[1].trim().toLocaleLowerCase("en-US"))
    } else if (Array.isArray(value)) {
      value.forEach((item) => classFiltersIn(item, labels))
    } else if (value && typeof value === "object") {
      Object.values(value).forEach((item) => classFiltersIn(item, labels))
    }
  }
  for (const [classKey, coverage] of spellClasses) {
    const matches = classPages.get(classKey) ?? []
    if (matches.length !== 1) {
      RESULTS.errors.push(
        `Spell class "${coverage.name}" resolves to ${matches.length} class pages instead of exactly one`,
      )
      continue
    }

    const classPage = matches[0]
    const catalogueName =
      path.basename(classPage.filepath, ".md").toLocaleLowerCase("en-US").replace(/\s+/g, "-") +
      "-spells.base"
    const cataloguePath = path.join(listDirectory, catalogueName)
    if (!fs.existsSync(cataloguePath)) {
      RESULTS.errors.push(
        `Class "${coverage.name}" has tagged spells but no spell catalogue ${relativePath(cataloguePath)}`,
      )
      continue
    }
    const linked = classPage.links.some(
      (link) =>
        link.embed && path.posix.basename(link.target).toLocaleLowerCase("en-US") === catalogueName,
    )
    if (!linked) {
      RESULTS.errors.push(
        `Class page does not embed its spell catalogue: ${relativePath(classPage.filepath)} -> ${relativePath(cataloguePath)}`,
      )
    }

    try {
      const catalogue = parseYaml(fs.readFileSync(cataloguePath, "utf-8")) || {}
      const filters = new Set()
      classFiltersIn(catalogue.filters, filters)
      if (!filters.has(classKey)) {
        RESULTS.errors.push(
          `Spell catalogue does not filter classes.contains("${coverage.name}"): ${relativePath(cataloguePath)}`,
        )
      }
    } catch (error) {
      RESULTS.errors.push(
        `Invalid YAML catalogue: ${relativePath(cataloguePath)}: ${error.message}`,
      )
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

  const spellCoverage = [...spellClasses.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, count }) => `${name}: ${count}`)
  RESULTS.info.push(`Class spell coverage: ${spellCoverage.join("; ")}.`)
  const artificerCoverage = spellClasses.get("artificer")
  if (artificerCoverage) {
    RESULTS.info.push(
      `Artificer catalogue source coverage: ${[...artificerCoverage.sources]
        .map(([source, count]) => `${source} ${count}`)
        .join(", ")}; spell metadata does not establish complete Artificer supplement coverage.`,
    )
  }
  if (spellClasses.has("thanatomancer")) {
    RESULTS.info.push(
      "Thanatomancer spell access is additionally constrained by its class rules: eligible schools are necromancy, enchantment, and divination from the cleric, druid, and wizard lists.",
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

  const incomplete = Object.values(fileCache).filter(
    (d) => d.metadata.content_status === "incomplete" || d.metadata.incomplete === true,
  )

  const withoutSpecificReason = incomplete.filter(
    (d) =>
      d.metadata.content_status === "incomplete" &&
      d.metadata.incomplete_reason ===
        "The legacy record did not specify which details are missing or unverified; review needed.",
  ).length
  RESULTS.info.push(`ℹ ${incomplete.length} incomplete entries marked`)
  if (withoutSpecificReason > 0) {
    RESULTS.info.push(
      `ℹ ${withoutSpecificReason} migrated entries still need a specific incomplete_reason`,
    )
  }

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
  const aliasCount = linkIndex.pages.reduce((total, page) => total + page.aliases.length, 0)
  const aliasConflicts = findAliasConflicts(linkIndex)
  for (const conflict of aliasConflicts) {
    RESULTS.errors.push(`Alias "${conflict.alias}" ${conflict.reason}`)
  }
  if (aliasConflicts.length === 0) {
    RESULTS.info.push(
      `✓ ${aliasCount} legacy URL aliases are unique and do not shadow canonical routes`,
    )
  }
  const allowlist = createLinkHealthAllowlist(
    JSON.parse(fs.readFileSync(LINK_ALLOWLIST_PATH, "utf-8")),
  )

  // Cache all files
  files.forEach((filepath) => {
    const content = fs.readFileSync(filepath, "utf-8")
    const metadata = parseFrontmatter(content, filepath)
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
  checkCanonicalIdentity()
  checkRegistry()
  checkDisplayedCounts()
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
