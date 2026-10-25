import fs from "node:fs"
import path from "node:path"
import { parse } from "yaml"

const root = "content/spells"
const eligibleSchools = new Set(["Necromancy", "Enchantment", "Divination"])
const sourceClasses = new Set(["Cleric", "Druid", "Wizard"])
const files = []
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(file)
  }
}
walk(root)
let eligible = 0
const missing = []
for (const file of files) {
  const content = fs.readFileSync(file, "utf8")
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) continue
  const metadata = parse(match[1]) ?? {}
  if (metadata.entity_type !== "spell") continue
  const classes = Array.isArray(metadata.classes) ? metadata.classes : []
  const eligibleClass = classes.some((name) => sourceClasses.has(name))
  const eligibleSchool =
    eligibleSchools.has(metadata.school) || eligibleSchools.has(metadata.alternate_school)
  if (!eligibleClass || !eligibleSchool) continue
  eligible++
  if (!classes.includes("Thanatomancer")) {
    missing.push({
      file,
      title: metadata.title,
      school: metadata.school,
      alternate_school: metadata.alternate_school,
    })
  }
}
console.log(`Eligible: ${eligible}; missing Thanatomancer metadata tag: ${missing.length}`)
for (const entry of missing) console.log(JSON.stringify(entry))
