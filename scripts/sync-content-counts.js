import fs from "node:fs"
import path from "node:path"
import { parse as parseYaml } from "yaml"
import { syncItemCounts, syncSpellCounts } from "./content-counts.js"

const contentRoot = path.resolve("content")

function readEntries(section) {
  const directory = path.join(contentRoot, section)
  const entries = []
  const files = []

  function walk(current) {
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const filepath = path.join(current, item.name)
      if (item.isDirectory()) walk(filepath)
      else if (
        item.isFile() &&
        item.name.endsWith(".md") &&
        item.name.toLowerCase() !== "index.md"
      ) {
        files.push(filepath)
      }
    }
  }

  walk(directory)
  for (const filepath of files) {
    const text = fs.readFileSync(filepath, "utf8")
    const frontmatter = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
    if (!frontmatter) continue
    entries.push(parseYaml(frontmatter[1]) ?? {})
  }
  return entries
}

for (const [section, syncCounts] of [
  ["spells", syncSpellCounts],
  ["items", syncItemCounts],
]) {
  const filepath = path.join(contentRoot, section, "index.md")
  const original = fs.readFileSync(filepath, "utf8")
  const updated = syncCounts(original, readEntries(section))
  if (updated !== original) {
    fs.writeFileSync(filepath, updated)
    console.log(`Updated generated ${section} counts in ${path.relative(process.cwd(), filepath)}.`)
  }
}
