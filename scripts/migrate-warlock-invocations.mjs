import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../content/character-options/class-options",
)
const source = "Alternate Warlock"
const provenance = `edition: system-neutral\nadaptation: curated\nlicense_status: reference-only\nsource: ${source}\nsource_type: third-party`
const kebab = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const invocations = [
  [
    "Aspect of the Moon",
    2,
    "None",
    "You no longer need sleep and cannot be magically put to sleep. To gain a long rest, spend 8 hours in light activity.",
  ],
  [
    "Beguiling Influence",
    2,
    "None",
    "Gain proficiency in one of Deception, Insight, Intimidation, or Persuasion. Use your Pact Ability for checks with that skill. You can choose this invocation more than once.",
  ],
  [
    "Eldritch Sight",
    2,
    "None",
    "As an action, sense magic on visible creatures and objects within 30 feet while you concentrate. Learn each aura's school, if any. The sense is blocked by 1 foot of stone, 1 inch of metal, thin lead, or 3 feet of wood or dirt.",
  ],
  [
    "Eyes of the Rune Keeper",
    2,
    "None",
    "You can read and understand written words, symbols, and scripts.",
  ],
  [
    "Gaze of Two Minds",
    2,
    "None",
    "As an action, touch a willing Humanoid and perceive through its senses while you concentrate. For the duration, you gain its special senses but are Blinded and Deafened to your own surroundings.",
  ],
  [
    "Gift of the Deep Ones",
    2,
    "None",
    "You can breathe underwater and gain a swimming speed equal to your walking speed. At 5th level, you learn water breathing and can cast it once per long rest without a spell slot.",
  ],
  [
    "Infernal Sight",
    2,
    "None",
    "You see normally in dim light and darkness, magical and nonmagical, to 120 feet.",
  ],
  [
    "Misty Visions",
    2,
    "None",
    "As an action, create a silent, scentless visual illusion no larger than a 15-foot cube within 60 feet. It lasts 10 minutes. As an action, move it to another spot within 60 feet. A creature can discern the illusion with an Intelligence (Investigation) check against your spell save DC. Creating another illusion ends the first.",
  ],
  [
    "Mask of Many Faces",
    2,
    "None",
    "As an action, change your appearance and voice to resemble a creature you have seen. The new form has the same arrangement of limbs and your size and game statistics do not change. Clothing is unaffected.",
  ],
  [
    "Sylvan Speech",
    2,
    "None",
    "You learn Sylvan and can communicate verbally with Beasts while speaking it. At 7th level, you can communicate with Plants as if affected by speak with plants.",
  ],
  [
    "Accursed Armor",
    3,
    "Eldritch Blade",
    "Over 1 hour, perform a ritual on armor you touch to make it your Accursed Armor. You are proficient with it and can don or doff it when conjuring your Eldritch Blade. You can have one set bound; binding another ends the first bond.",
  ],
  [
    "Armor of Shadows",
    3,
    "None",
    "As an action, manifest or dismiss living shadow armor. While wearing no armor or shield, your AC equals 10 + your Pact modifier + your Dexterity modifier. The armor is visibly magical and frightening.",
  ],
  [
    "Cloak of Decay",
    3,
    "None",
    "As a bonus action, conjure or dismiss a 5-foot-radius swarm of infernal insects. Creatures of your choice that start their turn in it take Piercing damage equal to your Pact modifier (minimum 0). You have advantage on Intimidation checks and disadvantage on other checks to influence creatures.",
  ],
  [
    "Eldritch Spear",
    3,
    "None",
    "Double the range of Eldritch Blast and Warlock spells that require a ranged spell attack.",
  ],
  [
    "Grasp of Hadar",
    3,
    "None",
    "Once per turn when you hit a creature with Eldritch Blast, pull it up to 10 feet toward you in a straight line. The distance is halved for each size category the target is above Large.",
  ],
  [
    "Lance of Lethargy",
    3,
    "None",
    "Once per turn when you damage a creature with Eldritch Blast, halve its speed until the start of your next turn.",
  ],
  [
    "Otherworldly Vigor",
    3,
    "None",
    "As a bonus action, gain temporary hit points equal to your Pact modifier (minimum 1).",
  ],
  [
    "Repelling Blast",
    3,
    "None",
    "When you hit a creature with Eldritch Blast, push it up to 10 feet away from you in a straight line. The distance is halved for each size category the target is above Large.",
  ],
  [
    "Thief of Five Fates",
    3,
    "None",
    "As an action, force a creature you can see within 30 feet to make a Charisma saving throw. On a failure, it subtracts 1d4 from d20 rolls for 1 minute while you concentrate. It repeats the save at the end of each turn. A creature that succeeds is immune until the next dawn.",
  ],
  [
    "Tome of Ancient Secrets",
    3,
    "Eldritch Tome",
    "Your Tome gains two 1st-level ritual spells from any class. They are Warlock spells for you and do not count against Spells Known. You can add a ritual spell no higher than your Slot Level by burning a scroll and performing a 1-hour ritual with materials pleasing to your Patron worth 50 gp per spell level. Added spells can only be cast as rituals.",
  ],
  [
    "Voice of the Master",
    3,
    "Eldritch Familiar",
    "You can communicate telepathically with your familiar and perceive through its senses while you are on the same plane. While perceiving through it, you can speak in your own voice through it.",
  ],
  [
    "Blasphemous Prayer",
    5,
    "Eldritch Tome",
    "Your Tome contains one Channel Divinity option available to a 3rd-level Cleric. Use your Warlock level, Pact modifier, and Warlock spell save DC for it. You can invoke it once, then regain use after a short or long rest.",
  ],
  [
    "Erupting Blast",
    5,
    "None",
    "When you damage a creature with Eldritch Blast, use a bonus action to deal damage of the same type equal to your Pact modifier (minimum 1) to other creatures of your choice within 5 feet of it.",
  ],
  [
    "One with Shadows",
    5,
    "None",
    "Once per long rest, cast invisibility on yourself without a spell slot while in dim light or darkness. At 9th level, you can do so at will.",
  ],
  [
    "Thirsting Blade",
    5,
    "Eldritch Blade",
    "You can attack with your Eldritch Blade twice, instead of once, whenever you take the Attack action. If you cast a Warlock spell or use Eldritch Blast as your action, you can make one Eldritch Blade attack as a bonus action.",
  ],
  [
    "Vitality of the Ageless",
    5,
    "Eldritch Familiar",
    "When you or your familiar regain hit points while within 30 feet of one another, treat any hit point dice rolled as their maximum value.",
  ],
  [
    "Arcane Secrets",
    7,
    "None",
    "Choose a Warlock spell of 4th level or lower. You learn it and can cast it once at its lowest level without a spell slot, regaining use after a long rest. You can choose this invocation more than once, choosing a different spell each time; you can learn only one spell of each level this way.",
  ],
  [
    "Ascendant Step",
    7,
    "None",
    "As a bonus action, gain a flying speed equal to your walking speed until the end of the current turn. You cannot hover; if not supported at turn end, you fall.",
  ],
  [
    "Enspelled Blade",
    7,
    "Eldritch Blade",
    "When you hit with your Eldritch Blade, apply the non-damage effects of your Eldritch Blast invocations and Patron features.",
  ],
  [
    "Ethereal Sight",
    7,
    "None",
    "As an action, see through solid objects within 30 feet for 1 minute. You gain Darkvision if you do not already have it. You must concentrate on this effect.",
  ],
  [
    "Favored Servant",
    7,
    "None",
    "Once per long rest, cast one of your Patron Spells at your Slot Level without a spell slot. You can choose this invocation more than once, selecting a different Patron Spell each time.",
  ],
  [
    "Otherworldly Nature",
    7,
    "None",
    "You no longer need to eat, breathe, or sleep. To gain a long rest, spend 8 hours in light activity. You age only 1 year for every 10 years that pass.",
  ],
  [
    "Whispers of the Grave",
    7,
    "None",
    "You can cast speak with dead at will without expending a Pact Magic spell slot.",
  ],
  [
    "Commune with Patron",
    9,
    "None",
    "You learn contact other plane. Once per long rest, cast it without a spell slot to contact your Patron, automatically succeeding on the spell's saving throw.",
  ],
  [
    "Favor of the Master",
    9,
    "Eldritch Familiar",
    "At the end of a long rest, choose a Warlock spell of 1st level or higher that you know. Your familiar can cast it once at your Slot Level without a spell slot.",
  ],
  [
    "Witch Sight",
    9,
    "None",
    "While conscious, you have Truesight out to 10 feet. At 15th level, the range becomes 30 feet.",
  ],
  [
    "Tomb of Frost",
    5,
    "None",
    "When you take damage, use your reaction to encase yourself in ice with hit points equal to 10 times your Warlock level and AC 10. The ice takes as much of the triggering damage as possible. While it remains, you cannot be targeted and have Immunity to all damage, but are Incapacitated and Restrained. At the start of your turn, you can end the effect. You can use this invocation once between rests, then expend a Pact Magic slot for further uses.",
  ],
  [
    "Eldritch Focus",
    3,
    "None",
    "When you fail a saving throw to maintain concentration on a Warlock spell, you can choose to succeed instead. You can do this a number of times equal to your Pact modifier, regaining all uses after a long rest.",
  ],
  [
    "Eldritch Strike",
    3,
    "Eldritch Flesh",
    "When you use Eldritch Blast, replace any number of beams with melee spell attacks that deal a beam's damage and effects. After hitting with an Eldritch Strike, you can use a bonus action to automatically Grapple the target.",
  ],
  [
    "Harmonic Spellcasting",
    3,
    "Eldritch Instrument",
    "When a creature within 30 feet casts a spell with a Verbal component, use your reaction to play alien harmonies on your Instrument. One target of the spell has disadvantage on its initial saving throw.",
  ],
  [
    "Piercing Note",
    3,
    "Eldritch Instrument",
    "When you deal Thunder damage with Eldritch Blast using your Instrument, forgo adding your Pact modifier to damage to Deafened the target until the start of your next turn.",
  ],
  [
    "Unearthly Chorus",
    3,
    "Eldritch Instrument",
    "When producing an Eldritch Blast beam with your Instrument, forgo its attack roll to force a creature that can hear you within 60 feet to make a Constitution saving throw. On a failure, it suffers one beam's effects and damage.",
  ],
  [
    "Cauldron of Lost Knowledge",
    5,
    "Eldritch Chalice",
    "During a 1-hour ritual, pour a vial or potion into your Chalice and add that liquid to those you can conjure after a short or long rest. The poured liquid is destroyed.",
  ],
  [
    "Eldritch Smite",
    5,
    "None",
    "When you hit a creature with Eldritch Blast, expend a Pact Magic spell slot to deal additional damage equal to 1d8 + 1d8 per Slot Level.",
  ],
  [
    "Iron Grip",
    5,
    "Eldritch Flesh",
    "You gain a climb speed equal to your walking speed and can climb vertical surfaces and ceilings without checks, leaving your hands free.",
  ],
  [
    "Protective Cowl",
    5,
    "Eldritch Shroud",
    "When you take damage while your Shroud is equipped, use your reaction to halve the damage. The Shroud disappears. You can do this a number of times equal to your Pact modifier (minimum 1); regain one use after a short rest and all uses after a long rest. With no uses left, you cannot conjure the Shroud.",
  ],
  [
    "Otherworldly Stasis",
    5,
    "Eldritch Hourglass",
    "As an action, shatter your Hourglass over a willing creature to place it in stasis for 1 minute. If it takes no damage and makes no checks or saves during that time, it gains a short rest. You cannot conjure the Hourglass again until you expend a Pact Magic slot or finish a long rest.",
  ],
  [
    "Incomprehensible Might",
    7,
    "Eldritch Flesh",
    "While transformed by Eldritch Flesh, use your Pact Ability for Strength checks. You can Grapple creatures up to two sizes larger than you.",
  ],
  [
    "Stalker's Curse",
    7,
    "None",
    "When you damage a creature with a Warlock spell or Eldritch Blast, use a bonus action to teleport to an unoccupied space you can see within 5 feet of it.",
  ],
  [
    "Stolen Seconds",
    7,
    "Eldritch Hourglass",
    "Once per turn when you hit a creature with Eldritch Blast using your Hourglass, forgo the damage to force a Charisma saving throw. On a failure, its speed becomes 0 until your next turn, then you gain the benefits of Dash for the rest of this turn.",
  ],
  [
    "Time Dilation",
    7,
    "Eldritch Hourglass",
    "Once per long rest, cast haste or slow at your Slot Level without expending a spell slot.",
  ],
  [
    "Umbral Shroud",
    7,
    "Eldritch Shroud",
    "While your Shroud is equipped and you are in darkness or shadow, creatures relying on Darkvision or a feature that sees in darkness cannot see you.",
  ],
  [
    "Crawling Armor",
    9,
    "Eldritch Flesh",
    "While transformed by Eldritch Flesh, use your reaction when damaged to reduce the damage by your Pact modifier (minimum 1).",
  ],
  [
    "Enchanting Melody",
    9,
    "Eldritch Instrument",
    "You learn charm monster. Once per long rest, cast it without a spell slot using your Instrument. While using your bonus action to continue playing each turn, your concentration cannot be broken.",
  ],
  [
    "Sanguine Obligation",
    9,
    "None",
    "Perform a 1-hour ritual with a willing creature to inscribe its name on your body. You can hold a number of names equal to your Pact modifier. When a named creature is reduced to 0 hit points but not killed outright, its name disappears and it instead falls to 1 hit point.",
  ],
]

const dir = path.join(root, "eldritch-invocations")
const existing = fs
  .readdirSync(dir)
  .filter((name) => name.endsWith(".md") && name.toLowerCase() !== "index.md")
const byTitle = new Map(existing.map((name) => [path.basename(name, ".md").toLowerCase(), name]))
const kept = new Set()
for (const [title, level, prerequisite, body] of invocations) {
  const filename = byTitle.get(title.toLowerCase()) ?? `${title}.md`
  kept.add(filename)
  const summary = body.split(/[.!?]/)[0].trim().replace(/\s+/g, " ")
  const canonical = `character_option.character-options.class-options.eldritch-invocations.${kebab(title)}`
  const content = `---\nentity_type: character_option\ncanonical_id: ${canonical}\n${provenance}\ntitle: ${title}\noption_group: Eldritch Invocation\nparent_class: Warlock\nmin_level: ${level}\nprerequisite: ${prerequisite}\nsummary: ${JSON.stringify(summary)}\ncontent_status: complete\n---\n\n${body}\n\n**Prerequisite:** ${prerequisite}  \n**Minimum level:** ${level}\n`
  fs.writeFileSync(path.join(dir, filename), content)
}
for (const name of existing) {
  if (!kept.has(name)) fs.rmSync(path.join(dir, name))
}
