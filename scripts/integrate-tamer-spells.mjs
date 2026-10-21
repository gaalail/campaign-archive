import fs from "node:fs"
import path from "node:path"
import { parse, stringify } from "yaml"

const root = path.resolve(".")
const spellsRoot = path.join(root, "content", "spells")
const entries = {
  0: [
    "Can't Trip",
    "Can'trip",
    "Guidance",
    "Howl",
    "Light",
    "Primal Scent",
    "Resistance",
    "Smokescreen",
    "Spare the Dying",
    "Stalker's Eye",
    "Vicious Mockery",
  ],
  1: [
    "Chameleon Skin",
    "Cure Wounds",
    "Detect Magic",
    "Expeditious Retreat",
    "Faerie Fire",
    "False Life",
    "Longstrider",
    "Peppermint Plate",
    "Protection from Evil and Good",
    "Purify Food and Drink",
    "Sanctuary",
    "Shield of Faith",
    "Silent Image",
    "Sleep",
    "Speak with Animals",
  ],
  2: [
    "Aid",
    "Alter Self",
    "Animal Messenger",
    "Barkskin",
    "Blur",
    "Calm Emotions",
    "Darkvision",
    "Detect Thoughts",
    "Eelskin",
    "Feather Fall",
    "Enhance Ability",
    "Grease",
    "Healing Word",
    "Heroism",
    "Identify",
    "Initiative",
    "Jump",
    "Enlarge/Reduce",
    "Inequality",
    "Invisibility",
    "Lesser Restoration",
    "Levitate",
    "Locate Animals or Plants",
    "Locate Object",
    "Mirror Image",
    "Pass without Trace",
    "Preserve",
    "Protection",
    "Protection from Poison",
    "See Invisibility",
    "Shielding Word",
    "Silence",
    "Spider Climb",
    "Sugar Rush",
    "Warding Bond",
  ],
  3: [
    "Blink",
    "Create Food and Water",
    "Daylight",
    "Dispel Magic",
    "Fear",
    "Fly",
    "Food Coma",
    "Haste",
    "Mass Leech",
    "Nondetection",
    "Protection from Energy",
    "Remove Curse",
    "Switcheroo",
    "Tongues",
    "Water Breathing",
    "Water Walk",
  ],
  4: [
    "Aura of Impurity",
    "Control Water",
    "Death Ward",
    "Dimension Door",
    "Fire Shield",
    "Freedom of Movement",
    "Greater Invisibility",
    "Resilient Sphere",
    "Stoneskin",
  ],
}

const folders = { 0: "cantrips", 1: "1st-level", 2: "2nd-level", 3: "3rd-level", 4: "4th-level" }
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "")
const files = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith(".md") && entry.name !== "index.md") files.push(full)
  }
}
walk(spellsRoot)
const byName = new Map()
for (const file of files) {
  const content = fs.readFileSync(file, "utf8")
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) continue
  const metadata = parse(match[1]) ?? {}
  if (metadata.title) byName.set(normalize(metadata.title), { file, content, metadata, match })
}

let updated = 0
let created = 0
for (const [level, names] of Object.entries(entries)) {
  for (const name of names) {
    const existing = byName.get(normalize(name))
    if (existing) {
      const classes = Array.isArray(existing.metadata.classes) ? existing.metadata.classes : []
      if (!classes.some((value) => normalize(String(value)) === "tamer")) {
        existing.metadata.classes = [...classes, "Tamer"]
        const replacement = `---\n${stringify(existing.metadata).trimEnd()}\n---${existing.content.slice(existing.match[0].length)}`
        fs.writeFileSync(existing.file, replacement)
        updated++
      }
      continue
    }

    const numericLevel = Number(level)
    const folder = folders[numericLevel]
    const filename = `${name.replaceAll("/", "-")}.md`
    const file = path.join(spellsRoot, folder, filename)
    const metadata = {
      entity_type: "spell",
      canonical_id: `spell.tamer.${normalize(name)}`,
      title: name,
      level: numericLevel,
      school: "Unspecified",
      classes: ["Tamer"],
      source: "User-provided Tamer spell list",
      source_type: "homebrew",
      edition: "system-neutral",
      adaptation: "curated",
      license_status: "original",
      content_status: "incomplete",
      incomplete_reason:
        "Spell name and Tamer list placement supplied; full spell text and structured metadata were not supplied.",
    }
    const body = `\n> [!warning]- Spell details incomplete\n> This Tamer spell is listed by name and level, but its full definition was not included in the supplied material.\n\n`
    fs.writeFileSync(file, `---\n${stringify(metadata).trimEnd()}\n---\n${body}`)
    created++
  }
}

console.log(`Updated existing spell records: ${updated}`)
console.log(`Created incomplete Tamer spell records: ${created}`)
