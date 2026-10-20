import fs from "node:fs"
import path from "node:path"
import { parse } from "yaml"

const root = path.resolve(".")
const schema = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/content-metadata-schema.json"), "utf8"),
)
const manifestPath = process.argv[2]

if (!manifestPath) {
  console.error("Usage: node scripts/validate-expansion-manifest.mjs <manifest.json>")
  process.exit(1)
}

const filePath = path.resolve(manifestPath)
const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"))
const errors = []

const required = [
  "manifest_version",
  "name",
  "source",
  "source_type",
  "edition",
  "adaptation",
  "license_status",
  "content_status",
  "entities",
  "attribution",
]
for (const field of required) {
  if (manifest[field] === undefined || manifest[field] === "")
    errors.push(`Missing required field: ${field}`)
}

for (const [field, values] of [
  ["source_type", schema.source_types],
  ["edition", schema.editions],
  ["adaptation", schema.adaptations],
  ["license_status", schema.license_statuses],
  ["content_status", schema.content_status],
]) {
  if (manifest[field] !== undefined && !values.includes(manifest[field])) {
    errors.push(`${field} must be one of: ${values.join(", ")}`)
  }
}

for (const category of ["classes", "spells", "items", "monsters", "character_options"]) {
  if (!Array.isArray(manifest.entities?.[category])) {
    errors.push(`entities.${category} must be an array`)
    continue
  }
  for (const [index, entry] of manifest.entities[category].entries()) {
    if (typeof entry !== "string" || !entry.trim())
      errors.push(`entities.${category}[${index}] must be a non-empty canonical_id`)
  }
}

if (!Array.isArray(manifest.catalogues)) errors.push("catalogues must be an array")
else
  for (const [index, catalogue] of manifest.catalogues.entries()) {
    if (typeof catalogue !== "string" || !catalogue.endsWith(".base"))
      errors.push(`catalogues[${index}] must name a .base catalogue file`)
  }

if (errors.length) {
  console.error(`Expansion manifest failed: ${path.relative(root, filePath)}`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`Expansion manifest valid: ${path.relative(root, filePath)}`)
console.log(
  `Entities: ${Object.values(manifest.entities).reduce((total, entries) => total + entries.length, 0)}`,
)
console.log(`Catalogues: ${manifest.catalogues.length}`)
