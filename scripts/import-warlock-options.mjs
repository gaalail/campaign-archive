import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const contentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../content")
const optionsRoot = path.join(contentRoot, "character-options/class-options")
const slug = (value) =>
  value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
const provenance = `edition: system-neutral\nadaptation: curated\nlicense_status: reference-only\nsource: Alternate Warlock\nsource_type: third-party\ncontent_status: incomplete\nincomplete_reason: The source text lists this option but does not include its complete mechanics. Transcribe and verify the full entry before use.`
const records = [
  [
    "Pact Focus",
    "Eldritch Blade",
    3,
    "None",
    "Conjure a nonmagical melee weapon as a bonus action. It is proficient, uses your Pact modifier for attacks and damage, can hold one invocation, and deals your Eldritch Blast damage type. A bonded magic weapon can be summoned or dismissed.",
  ],
  [
    "Pact Focus",
    "Eldritch Familiar",
    3,
    "None",
    "Learn conjure familiar as a ritual without counting against Spells Known. Your familiar acts on your initiative and can deliver your Warlock spells and Eldritch Blast from within 60 feet.",
  ],
  [
    "Pact Focus",
    "Eldritch Tome",
    3,
    "None",
    "Your Tome holds your known Warlock spells and grants one additional invocation without prerequisites. After a long rest, replace one eligible invocation and one known spell; cast ritual-tagged spells in the Tome as rituals.",
  ],
]
const familiarNames = [
  "Aberrant",
  "Draconic",
  "Faerie",
  "Fiendish",
  "Angelic",
  "Golem",
  "Gruntling",
  "Oozing",
  "Protean",
  "Risen",
  "Savage",
  "Verdant",
]
for (const name of familiarNames)
  records.push([
    "Warlock Familiar",
    `${name} Familiar`,
    3,
    "Eldritch Familiar",
    `${name} creature option for conjure familiar. The source supplies its specific stat block; transcribe that block before use.`,
  ])
records.push(
  [
    "Warlock Elder Arcanum",
    "Elder Focus",
    11,
    "None",
    "Gain an additional Pact Focus. You cannot choose the same Pact Focus more than once. This Arcanum may be selected more than once for different Foci.",
  ],
  [
    "Warlock Elder Arcanum",
    "Minion of Chaos",
    11,
    "Eldritch Familiar",
    "Transform your familiar into a CR 6 or lower creature of its type that you have seen alive. It retains its alignment, personality, and hit points, gains temporary hit points equal to twice your Warlock level, and transforms for 1 minute or until reduced to 0 hit points. Once per long rest.",
  ],
  [
    "Warlock Elder Arcanum",
    "Minor Arcanum",
    11,
    "None",
    "Choose a spell from the supplied Minor Arcanum list. Cast it at 6th level once per long rest without a spell slot.",
  ],
  [
    "Warlock Elder Arcanum",
    "Occult Scholar",
    11,
    "Eldritch Tome",
    "Perform a 1-hour ritual with your Tome to replace any number of known Warlock spells with spells no higher than your Slot Level. Once per long rest, you may replace one eligible invocation instead.",
  ],
  [
    "Warlock Elder Arcanum",
    "Occult Warrior",
    11,
    "Eldritch Blade",
    "Your Eldritch Blade deals 1d8 extra damage matching Eldritch Blast. A target hit by it has disadvantage on the first saving throw against your effects before the end of your next turn.",
  ],
  [
    "Warlock Elder Arcanum",
    "Bond of the Master",
    13,
    "Eldritch Familiar",
    "While you and your familiar are within 30 feet, both have advantage on saves against spells and magical effects. A Warlock spell targeting you can also affect your familiar within 30 feet.",
  ],
  [
    "Warlock Elder Arcanum",
    "Greater Arcanum",
    13,
    "None",
    "Choose a spell from the supplied Greater Arcanum list. Cast it at 7th level once per long rest without a spell slot.",
  ],
  [
    "Warlock Elder Arcanum",
    "Greater Magicks",
    13,
    "Eldritch Tome",
    "Your Pact Magic spell slots increase by one. This Arcanum may be selected more than once.",
  ],
  [
    "Warlock Elder Arcanum",
    "Otherworldly Step",
    13,
    "Eldritch Blade",
    "When you attack with your Eldritch Blade, teleport up to 10 feet before or after the attack. When you take the Attack action using only Eldritch Blade attacks, make one additional attack.",
  ],
  [
    "Warlock Elder Arcanum",
    "Arcana of the Ancients",
    15,
    "Eldritch Tome",
    "Learn three additional Eldritch Invocations; your Invocations Known increases by three.",
  ],
  [
    "Warlock Elder Arcanum",
    "Chains of the Abyss",
    15,
    "Eldritch Familiar",
    "Learn hold monster. Cast it without a spell slot or material components against Aberrations, Celestials, Elementals, Fey, and Fiends. A creature that succeeds is immune until dawn unless you expend a Pact Magic slot.",
  ],
  [
    "Warlock Elder Arcanum",
    "Eldritch Wind",
    15,
    "Eldritch Blade",
    "Attack up to five creatures within 60 feet with your Eldritch Blade. Each hit deals 6d10 Eldritch Blast damage and applies its additional effects. Then teleport within 5 feet of one target. Once per short or long rest; further uses expend a Pact Magic slot.",
  ],
  [
    "Warlock Elder Arcanum",
    "Mystic Arcanum",
    15,
    "None",
    "Choose a spell from the supplied Mystic Arcanum list. Cast it at 8th level once per long rest without a spell slot.",
  ],
  [
    "Warlock Elder Arcanum",
    "Awakened Blade",
    17,
    "Eldritch Blade",
    "While holding your Eldritch Blade, you cannot have disadvantage on attack rolls and add your Pact modifier (minimum +1) to saves to maintain concentration. Once per long rest, creatures you choose within 30 feet save or take 10d6 Eldritch Blast damage and fall Prone; half damage on a success.",
  ],
  [
    "Warlock Elder Arcanum",
    "Ancient Arcanum",
    17,
    "None",
    "Choose a spell from the supplied Ancient Arcanum list. Cast it at 9th level once per long rest without a spell slot.",
  ],
  [
    "Warlock Elder Arcanum",
    "Distort Reality",
    17,
    "Eldritch Tome",
    "Your Tome contains wish. Cast it once per long rest without a spell slot. If duplicating a spell, it must have a casting time of one action or bonus action.",
  ],
  [
    "Warlock Elder Arcanum",
    "Eldritch Domination",
    17,
    "Eldritch Familiar",
    "Once per short or long rest, cast dominate creature at 8th level without a spell slot. A target under your hold monster automatically fails its save, and that spell ends.",
  ],
)
for (const [group, title, level, prerequisite, body] of records) {
  const folder =
    group === "Pact Focus"
      ? "pact-foci"
      : group === "Warlock Familiar"
        ? "familiars"
        : "elder-arcana"
  const target = path.join(optionsRoot, folder)
  fs.mkdirSync(target, { recursive: true })
  const summary = body.split(/[.!?]/)[0].trim()
  const id = `character_option.character-options.class-options.${slug(title)}`
  const file = `---\nentity_type: character_option\ncanonical_id: ${id}\nedition: system-neutral\nadaptation: curated\nlicense_status: reference-only\ntitle: ${title}\noption_group: ${group}\nparent_class: Warlock\nmin_level: ${level}\nprerequisite: ${prerequisite}\nsummary: ${JSON.stringify(summary)}\nsource: Alternate Warlock\nsource_type: third-party\ncontent_status: incomplete\nincomplete_reason: ${provenance.split("\n").at(-1).replace("incomplete_reason: ", "")}\n---\n\n${body}\n\n**Prerequisite:** ${prerequisite}  \n**Minimum level:** ${level}\n`
  fs.writeFileSync(path.join(target, `${title}.md`), file)
}
