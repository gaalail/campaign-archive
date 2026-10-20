import fs from "node:fs"
import path from "node:path"
import { parse, stringify } from "yaml"

const contentDir = path.resolve("content")
const validSourceTypes = new Set(["SRD", "homebrew", "third-party", "campaign-original"])

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : []
  })
}

function slug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

function entityType(relative) {
  const parts = relative.split("/")
  if (parts[0] === "spells" && parts.at(-1) !== "index.md") return "spell"
  if (parts[0] === "items" && parts.at(-1) !== "index.md") return "item"
  if (parts[0] === "campaigns" && parts.at(-1) !== "index.md") return "campaign"
  if (parts[0] === "monsters" && parts.at(-1) !== "index.md") return "monster"
  if (parts[0] === "rules" && parts.at(-1) !== "index.md") return "rule"
  if (parts[0] === "character-options" && parts.at(-1) !== "index.md") {
    return parts[1] === "classes" ? "class" : "character_option"
  }
  return undefined
}

function canonicalId(relative, type) {
  const parts = relative.replace(/\.md$/i, "").split("/")
  const leaf = parts.pop()
  const meaningful = parts.filter((part) => part.toLowerCase() !== "index")
  meaningful.push(leaf)
  return `${type}.${meaningful.map(slug).filter(Boolean).join(".")}`
}

function defaultsForSource(sourceType) {
  if (sourceType === "SRD") {
    return { edition: "2014", adaptation: "curated", license_status: "CC-BY-4.0" }
  }
  if (sourceType === "third-party") {
    return { edition: "2014", adaptation: "curated", license_status: "reference-only" }
  }
  if (sourceType === "homebrew" || sourceType === "campaign-original") {
    return { edition: "system-neutral", adaptation: "original", license_status: "original" }
  }
  return {}
}

let changed = 0
for (const filePath of walk(contentDir)) {
  const relative = path.relative(contentDir, filePath).replaceAll("\\", "/")
  const type = entityType(relative)
  if (!type) continue

  const content = fs.readFileSync(filePath, "utf8")
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) continue

  const metadata = parse(match[1]) ?? {}
  const sourceType = validSourceTypes.has(metadata.source_type) ? metadata.source_type : undefined
  const next = {
    entity_type: metadata.entity_type ?? type,
    canonical_id: metadata.canonical_id ?? canonicalId(relative, type),
    ...defaultsForSource(sourceType),
    ...metadata,
  }

  const output = `---\n${stringify(next).trimEnd()}\n---${content.slice(match[0].length)}`
  if (output !== content) {
    fs.writeFileSync(filePath, output)
    changed++
  }
}

console.log(`Added canonical metadata to ${changed} content pages.`)
