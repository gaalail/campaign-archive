import fs from "node:fs"
import path from "node:path"
import { parse, stringify } from "yaml"

const root = path.resolve("content/spells")
const validSourceClasses = new Set(["Cleric", "Druid", "Wizard"])
const eligibleSchools = new Set(["Necromancy", "Enchantment", "Divination"])
const files = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full)
  }
}
walk(root)
let updated = 0
for (const file of files) {
  const content = fs.readFileSync(file, "utf8")
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) continue
  const metadata = parse(match[1]) ?? {}
  const classes = Array.isArray(metadata.classes) ? metadata.classes : []
  const eligible =
    classes.some((entry) => validSourceClasses.has(entry)) &&
    (eligibleSchools.has(metadata.school) || eligibleSchools.has(metadata.alternate_school))
  if (metadata.entity_type !== "spell" || !eligible || classes.includes("Thanatomancer")) continue

  metadata.classes = [...classes, "Thanatomancer"]
  let next = `---\n${stringify(metadata).trimEnd()}\n---${content.slice(match[0].length)}`
  const relation =
    "\n**Thanatomancer access:** Eligible school and Cleric, Druid, or Wizard list.\n\n**Class:** [[character-options/classes/Thanatomancer|Thanatomancer]]\n"
  if (next.includes("## Related Content")) {
    next = next.replace("## Related Content", `## Related Content\n${relation}`)
  } else {
    next = `${next.trimEnd()}\n\n---\n\n## Related Content\n${relation}`
  }
  fs.writeFileSync(file, next)
  updated++
}
console.log(`Added Thanatomancer access metadata to ${updated} eligible spells.`)
