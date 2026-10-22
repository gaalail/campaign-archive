import fs from "node:fs"
import path from "node:path"
import { parse, stringify } from "yaml"

const root = path.resolve("content/spells")
const spells = {
  "Chameleon Skin": [
    1,
    "Biomancy",
    ["Bard", "Druid", "Ranger", "Tamer", "Wizard"],
    "Touch a willing creature, causing its skin and carried equipment to shift hues. The target can Hide as a bonus action even when lightly obscured. If it did not move during its last turn, creatures have disadvantage on Perception checks to see it.",
  ],
  "Peppermint Plate": [
    1,
    "Abjuration",
    ["Cleric", "Paladin", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    "A protective layer of hot peppermint icing coats you. You gain +1 AC, and a creature that hits you with a melee attack takes 1d4 fire damage, once per turn.",
  ],
  Eelskin: [
    2,
    "Biomancy",
    ["Druid", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    "A willing creature's skin becomes slimy and electrified. Its unarmed strikes and natural weapons become magical, and the first hit each turn deals an extra 1d8 lightning damage. It has advantage against grapples and restraints, but disadvantage on attempts to grapple.",
  ],
  Inequality: [
    2,
    "Enchantment",
    ["Bard", "Cleric", "Paladin", "Tamer"],
    "Choose two creatures, favoring one and disfavouring the other. The disfavoured creature makes a Charisma save. The favored creature adds 1d4 to attacks and saves, while the disfavoured creature subtracts 1d4; their speed changes as described in the source.",
  ],
  Initiative: [
    1,
    "Enchantment",
    ["Bard", "Ranger", "Sorcerer", "Tamer", "Wizard"],
    "As a reaction when initiative is rolled, choose a willing creature within 30 feet. If surprised, it is no longer surprised; otherwise it gains advantage on that initiative roll.",
  ],
  Preserve: [
    2,
    "Biomancy",
    ["Cleric", "Druid", "Paladin", "Ranger", "Tamer", "Wizard"],
    "Creatures in a 10-foot sphere make Charisma saves or become soulbound for 24 hours. If a soulbound creature dies, its magical essence remains bound to its components for harvesting.",
  ],
  Protection: [
    2,
    "Abjuration",
    ["Bard", "Cleric", "Druid", "Paladin", "Ranger", "Tamer"],
    "Ward a willing creature within 30 feet. Immediately before it takes non-psychic damage, it gains resistance to all damage except psychic until the end of its next turn, then the ward ends.",
  ],
  "Shielding Word": [
    2,
    "Abjuration",
    ["Bard", "Cleric", "Paladin", "Sorcerer", "Tamer"],
    "As a reaction when a creature within 30 feet is hit or fails a Strength or Dexterity save, grant it 15 temporary hit points until the start of its next turn.",
  ],
  "Sugar Rush": [
    2,
    "Biomancy",
    ["Bard", "Cleric", "Paladin", "Sorcerer", "Tamer"],
    "A willing creature gains 15 feet of speed, +1 AC, and can Dash, Disengage, Hide, or Use an Object as a bonus action. When the spell ends, it becomes poisoned until the end of its next turn if it failed to spend its movement.",
  ],
  "Food Coma": [
    3,
    "Enchantment",
    ["Bard", "Cleric", "Druid", "Paladin", "Tamer"],
    "Enchant a turkey drumstick. A willing creature that eats it falls unconscious for one hour, regains all hit points when it wakes, and can be awakened early only by damage, greater restoration, or wish.",
  ],
  "Mass Leech": [
    3,
    "Necromancy",
    ["Cleric", "Tamer", "Warlock", "Wizard"],
    "Creatures of your choice within 20 feet make Constitution saves, taking 2d8 necrotic damage on a failure or half on success. You regain hit points equal to half the damage dealt to Small or larger creatures.",
  ],
  Switcheroo: [
    3,
    "Transmutation",
    ["Bard", "Cleric", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    "Attempt to switch places with a Large or smaller creature within 90 feet. The target makes a Charisma save or teleports to your space while you occupy its former space.",
  ],
  "Aura of Impurity": [
    4,
    "Abjuration",
    ["Paladin", "Tamer", "Warlock"],
    "A 30-foot aura moves with you. Creatures you choose that enter or start their turn in it make Charisma saves or become drained, subtracting 1d4 from checks, attacks, and saves and regaining half hit points.",
  ],
  "Can't Trip": [
    0,
    "Abjuration",
    ["Bard", "Cleric", "Druid", "Tamer", "Wizard"],
    "A willing creature within 30 feet becomes immune to prone until the end of your next turn; if already prone and not restrained, it stands. You can target more creatures at higher levels.",
  ],
  "Can'trip": [
    0,
    "Abjuration",
    ["Bard", "Sorcerer", "Warlock", "Wizard"],
    "Tangle the Weave around a creature within 60 feet. Until your next turn, each cantrip it attempts requires a spellcasting ability check or its action is wasted.",
  ],
  Howl: [
    0,
    "Transmutation",
    ["Druid", "Tamer"],
    "Emit a magically amplified animal howl audible for 1,000 feet. A familiar recipient understands your meaning and can respond similarly.",
  ],
  "Primal Scent": [
    0,
    "Divination",
    ["Druid", "Tamer"],
    "Enhance your sense of smell. You gain advantage on the next smell-based check and can treat low d20 results as higher minimum results as you gain levels.",
  ],
  Smokescreen: [
    0,
    "Conjuration",
    ["Druid", "Sorcerer", "Tamer", "Wizard"],
    "Create a heavily obscuring black-smoke cylinder centered on you. It can remain in place or move with you, and grows at higher levels.",
  ],
  "Stalker's Eye": [
    0,
    "Enchantment",
    ["Bard", "Druid", "Tamer"],
    "Touch a willing creature. Its first attack under the spell has advantage; at higher levels the attack scores a critical hit on an expanded range.",
  ],
}
const levelFolders = {
  0: "cantrips",
  1: "1st-level",
  2: "2nd-level",
  3: "3rd-level",
  4: "4th-level",
}
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
for (const [title, [level, school, classes, text]] of Object.entries(spells)) {
  const file = path.join(root, levelFolders[level], `${title}.md`)
  const old = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : ""
  const match = old.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const oldMeta = match ? parse(match[1]) : {}
  const meta = {
    ...oldMeta,
    entity_type: "spell",
    canonical_id: oldMeta.canonical_id || `spell.tamer.${slug(title)}`,
    title,
    level,
    school,
    classes,
    source: "Appendix B — Spells",
    source_type: "third-party",
    edition: "system-neutral",
    adaptation: "curated",
    license_status: "reference-only",
    content_status: "complete",
  }
  delete meta.incomplete_reason
  const content = `---\n${stringify(meta).trimEnd()}\n---\n\n${text}\n\n## Related Content\n\n**Spell Level:** [[spells/${levelFolders[level]}|${level === 0 ? "Cantrips" : `${level}${level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th"}-Level`}]]\n\n**Source:** Appendix B — Spells\n\n**Available to:** ${classes.map((c) => `[[character-options/classes/${c}|${c}]]`).join(", ")}\n\n**Related:** [[spells|All Spells]] | [[character-options/classes/Tamer|Tamer]]\n`
  fs.writeFileSync(file, content)
}
console.log(`Replaced ${Object.keys(spells).length} Appendix B Tamer spell pages.`)
