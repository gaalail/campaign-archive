import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const dir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../content/character-options/class-options/familiars",
)
const common =
  "Eldritch Bond. When the familiar is forced to make an ability check or saving throw, add the Warlock’s Proficiency Bonus.\n\nHit Dice. The familiar has a number of d4 Hit Dice equal to the Warlock level and gains the normal benefits of short and long rests.\n\nMagic Resistance. The familiar has advantage on saving throws against spells and other magical effects."
const forms = [
  [
    "Aberrant",
    "Tiny Aberration",
    "11 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "10 ft., fly 40 ft. (hover)",
    "Str 3 (-4), Dex 16 (+3), Con 12 (+1), Int 13 (+1), Wis 10 (+0), Cha 8 (-1)",
    "Resistance: Psychic; Darkvision 120 ft.; Deep Speech, understands its Warlock.",
    common,
    "Aberrant Whispers. One creature the familiar can see within 30 feet makes an Intelligence save or takes 1d4 + PB Psychic damage and subtracts 1d4 from its first d20 roll before the familiar’s next turn.",
  ],
  [
    "Draconic",
    "Tiny Dragon",
    "13 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "20 ft., fly 60 ft.",
    "Str 3 (-4), Dex 16 (+3), Con 12 (+1), Int 10 (+0), Wis 8 (-1), Cha 13 (+1)",
    "Resistance: chosen Draconic Essence; Blindsight 10 ft., Darkvision 60 ft.; Draconic, understands its Warlock.",
    `Draconic Essence. When conjured, choose Acid, Cold, Fire, Lightning, or Poison. The choice determines the familiar’s resistance and Bite damage.\n\n${common}`,
    "Bite. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d4 + 3 + PB Piercing plus 1d4 Essence damage.",
  ],
  [
    "Faerie",
    "Tiny Fey",
    "11 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "20 ft., fly 40 ft.",
    "Str 3 (-4), Dex 16 (+3), Con 10 (+0), Int 8 (-1), Wis 13 (+1), Cha 12 (+1)",
    "Immunity: Charmed, Frightened; Elvish, Sylvan, understands its Warlock.",
    common,
    "Invisibility. The familiar turns invisible until it attacks or forces a creature to make a check or save. It concentrates as if concentrating on a spell.\n\nSting. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d4 + 3 + PB Piercing damage; the familiar learns the target’s emotional state.",
  ],
  [
    "Fiendish",
    "Tiny Fiend",
    "11 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "20 ft., fly 40 ft.",
    "Str 3 (-4), Dex 16 (+3), Con 12 (+1), Int 10 (+0), Wis 8 (-1), Cha 13 (+1)",
    "Immunity: Poisoned; Resistance: Cold, Fire, Poison; Devil’s Sight; Abyssal, Infernal, understands its Warlock.",
    common,
    "Claw. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d4 + 3 + PB Slashing damage; target makes a Constitution save or is Poisoned until the familiar’s next turn.\n\nShapechanger. Transform into a rat (20-ft. speed, 20-ft. climb), lizard (20-ft. speed, 20-ft. swim), raven (20-ft. speed, 60-ft. fly), or its true form. Equipment does not transform; it returns to true form if it dies.",
  ],
  [
    "Angelic",
    "Tiny Celestial",
    "11 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "25 ft., fly 30 ft.",
    "Str 3 (-4), Dex 16 (+3), Con 8 (-1), Int 10 (+0), Wis 2 (-4), Cha 13 (+1)",
    "Resistance: Necrotic, Radiant; Darkvision 60 ft.; Celestial, understands its Warlock.",
    common,
    "Divine Gift. Touch a creature to grant temporary hit points equal to the Pact modifier. Using this again removes temporary hit points previously granted by this feature.\n\nStrike. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d4 + 3 + PB Radiant damage.",
  ],
  [
    "Golem",
    "Small Construct",
    "13 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "30 ft.",
    "Str 12 (+1), Dex 8 (-1), Con 16 (+3), Int 1 (-5), Wis 8 (-1), Cha 2 (-4)",
    "Resistance: Lightning, Poison; Darkvision 60 ft.; understands its Warlock.",
    `${common}\n\nWondrous Servant. When conjured, choose one tool set. The familiar is proficient and uses the Warlock’s Pact Ability and Proficiency Bonus for checks with it.`,
    "Lockdown. One creature within 5 feet makes a Strength save or is Grappled; Large or larger creatures have advantage.\n\nRend. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d6 + 3 + PB Bludgeoning damage.",
  ],
  [
    "Gruntling",
    "Small Giant",
    "10 + PB (natural armor)",
    "5 + 4 × Warlock level",
    "25 ft.",
    "Str 15 (+2), Dex 8 (-1), Con 16 (+3), Int 6 (-2), Wis 8 (-1), Cha 2 (-4)",
    "Resistance: Cold, Poison, Thunder; Giant, understands its Warlock.",
    `${common}\n\nMythic Might. Counts as two sizes larger for Grapples, Shoves, and carrying capacity.`,
    "Hurl. Ranged Spell Attack: Warlock spell attack modifier to hit, range 25/50 ft., one target. Hit: 1d4 + 3 + PB Bludgeoning damage.\n\nFist. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d6 + 3 + PB Bludgeoning damage, or forgo damage to automatically Grapple the target.",
  ],
  [
    "Oozing",
    "Tiny Ooze",
    "10 + PB (natural armor)",
    "5 + 4 × Warlock level",
    "25 ft., climb 25 ft.",
    "Str 12 (+1), Dex 8 (-1), Con 16 (+3), Int 1 (-5), Wis 8 (-1), Cha 2 (-4)",
    "Resistance: Bludgeoning, Cold, Fire; Immunity: Acid, Grappled, Prone, Restrained; Blindsight 60 ft. (blind beyond); understands its Warlock.",
    `${common}\n\nAmorphous. Can move through a space as narrow as 1 inch without squeezing or extra movement.`,
    "Pseudopod. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d4 + 3 + PB Acid damage; a Medium or smaller target is Grappled (escape DC equals Warlock spell save DC). While grappling, the familiar can attack only that creature.",
  ],
  [
    "Protean",
    "Tiny Elemental",
    "11 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "10 ft., fly 40 ft. (hover)",
    "Str 3 (-4), Dex 16 (+3), Con 12 (+1), Int 8 (-1), Wis 10 (+0), Cha 12 (+1)",
    "Immunity: Exhaustion, Grappled, Paralyzed, Petrified, Poisoned, Prone, Restrained, Unconscious; Darkvision 120 ft.; Primordial, understands its Warlock.",
    `Elemental Chaos. When conjured, roll a d4: Air (Lightning), Earth (Acid), Fire (Fire), Water (Cold). The familiar is immune to its Essence damage type.\n\n${common}`,
    "Elemental Spark. Ranged Spell Attack: Warlock spell attack modifier to hit, range 60/90 ft., one target. Hit: 1d6 + 3 + PB Essence damage; target cannot take reactions until the familiar’s next turn.",
  ],
  [
    "Risen",
    "Small or Medium Undead",
    "11 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "25 ft., climb 25 ft.",
    "Str 10 (+0), Dex 13 (+1), Con 16 (+3), Int 3 (-4), Wis 8 (-1), Cha 8 (-1)",
    "Resistance: Cold, Necrotic; Immunity: Poison, Exhaustion, Poisoned; Darkvision 60 ft.; understands its Warlock.",
    `${common}\n\nDeathless Nature. Does not need to breathe, eat, drink, or sleep. It can spend rest duration in light activity to gain rest benefits.\n\nUndead Fortitude. When reduced to 0 HP by non-Radiant damage, make a Constitution save (DC 5 + damage taken); on success, drop to 1 HP.`,
    "Slam. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d4 + 3 + PB Bludgeoning damage. A living target cannot regain hit points or temporary hit points until the familiar’s next turn.",
  ],
  [
    "Savage",
    "Small Monstrosity",
    "12 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "30 ft., climb 30 ft.",
    "Str 15 (+2), Dex 10 (+0), Con 16 (+3), Int 6 (-2), Wis 8 (-1), Cha 2 (-4)",
    "Resistance: Acid, Cold, Poison; Immunity: Poisoned; Darkvision 120 ft.; understands its Warlock.",
    `${common}\n\nIron Claws. Can climb sheer surfaces and ceilings without checks.`,
    "Bite. Melee Spell Attack: Warlock spell attack modifier to hit, reach 5 ft., one target. Hit: 1d4 + 3 + PB Slashing damage; target makes a Constitution save or is Poisoned until the familiar’s next turn.",
  ],
  [
    "Verdant",
    "Tiny Plant",
    "10 + PB (natural armor)",
    "5 + 3 × Warlock level",
    "25 ft., climb 40 ft.",
    "Str 10 (+0), Dex 13 (+1), Con 16 (+3), Int 3 (-4), Wis 8 (-1), Cha 8 (-1)",
    "Resistance: Acid, Poison; Immunity: Blinded, Deafened, Exhaustion, Poisoned; Blindsight 60 ft.; Sylvan, understands its Warlock.",
    `${common}\n\nEvergreen. Gains temporary hit points equal to the Pact modifier at the start of each turn.\n\nNatural Camouflage. While still, it is indistinguishable from ordinary plants and foliage.`,
    "Lash. Melee Spell Attack: Warlock spell attack modifier to hit, reach 10 ft., one target. Hit: 1d4 + 3 + PB Slashing damage.",
  ],
]
for (const [name, kind, ac, hp, speed, abilities, senses, traits, actions] of forms) {
  const filename = path.join(dir, `${name} Familiar.md`)
  const table = `| Ability | Score | Modifier | Save |\n| ------- | ----: | -------: | ---: |\n${abilities
    .split(", ")
    .map((entry) => {
      const m = entry.match(/^(Str|Dex|Con|Int|Wis|Cha)\s+(\d+)\s+\(([-+]?\d+)\)$/i)
      if (!m) throw new Error(`Bad ability ${entry} in ${name}`)
      return `| ${m[1].toUpperCase()} | ${m[2]} | ${m[3]} | ${m[3]} |`
    })
    .join("\n")}`
  const body = `## Stat Block\n\n**${kind}, Patron Alignment**\n\n- **Armor Class:** ${ac}\n- **Hit Points:** ${hp}\n- **Speed:** ${speed}\n- **Ability Scores:** ${abilities}\n- **Other:** ${senses}\n\n### Traits\n\n${traits}\n\n### Actions\n\n${actions}`
  const contents = `---\nentity_type: character_option\ncanonical_id: character_option.character-options.class-options.${name.toLowerCase()}-familiar\nedition: system-neutral\nadaptation: curated\nlicense_status: reference-only\ntitle: ${name} Familiar\noption_group: Eldritch Familiar\nparent_class: Warlock\nmin_level: 3\nprerequisite: Eldritch Familiar\nsummary: ${JSON.stringify(`${kind} familiar form.`)}\nsource: Alternate Warlock\nsource_type: third-party\ncontent_status: complete\n---\n\n${body}\n\n**Ability modifiers and saves**\n\n${table}\n\n**Prerequisite:** Eldritch Familiar  \n**Minimum level:** 3\n`
  fs.writeFileSync(filename, contents)
}
