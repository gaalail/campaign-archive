import fs from "node:fs"
import path from "node:path"
import { parse, stringify } from "yaml"

const contentRoot = path.resolve("content")
const spellsRoot = path.join(contentRoot, "spells")
const levelFolders = {
  0: "cantrips",
  1: "1st-level",
  2: "2nd-level",
  3: "3rd-level",
  4: "4th-level",
  5: "5th-level",
  6: "6th-level",
  7: "7th-level",
  8: "8th-level",
  9: "9th-level",
}

const appendix = [
  {
    title: "Acid Rain",
    level: 3,
    school: "Conjuration",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet (20-foot-radius, 60-foot-tall cylinder)
Components: V, S, M (a drop of acid)
Duration: Concentration, up to 1 minute

With a gentle patter, corrosive raindrops build to an acidic deluge in a 20-foot-radius, 60-foot-tall cylinder, centred on a point within range. When the rain begins, each creature in the area must make a Dexterity saving throw, taking 4d6 acid damage on failure or half as much damage on a success. For the duration, a creature must also make this saving throw when it enters the spell's area for the first time on its turn or ends its turn there.

**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the acid damage increases by 1d6 for each slot level above 3rd.`,
  },
  {
    title: "Arcanomagnetic Repulsion",
    level: 2,
    school: "Abjuration",
    classes: ["Cleric", "Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Self (20-foot-radius sphere)
Components: V, S
Duration: Concentration, up to 1 minute

You emit waves of arcanomagnetic energy, distorting the trajectories of ferrous items. For the duration, attacks using ferrous weapons or ammunition made against you have disadvantage. In addition, the area within 20 feet of you is difficult terrain for creatures that are made of ferrous metal or are wearing ferrous armour.

**Magnetic Pulse.** When you cast this spell and as a bonus action on your subsequent turns, you can force one Huge or smaller creature that is experiencing this difficult terrain to make a Strength saving throw. On a failure, it takes 1d6 force damage and is knocked prone.

**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the radius of the difficult terrain increases by 5 feet and the damage increases by 1d6 for each slot level above 2nd.`,
  },
  {
    title: "Arcanomagnetic Storm",
    level: 7,
    school: "Evocation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 150 feet (ten 10-foot cubes)
Components: V, S, M (a piece of bismuth)
Duration: Concentration, up to 1 minute

A storm made of crackling lightning and arcanomagnetic winds appears in a location you choose within range. The area of the storm consists of up to ten 10-foot cubes, which you can arrange as you wish and last until the spell ends. Each cube must have at least one face adjacent to the face of another cube. As a bonus action at the start of each of your turns, you can remove one 10-foot cube, and place another 10-foot cube adjacent to the face of another cube.

Each creature that starts its turn in the area or enters the area for the first time on its turn must make a Dexterity saving throw, taking 4d8 lightning damage on a failure, or half as much damage on a success. Each creature that ends its turn in the area must make a Strength saving throw, taking 4d8 force damage and being knocked prone on a failure, or taking half as much damage and not being knocked prone on a success. A creature made of ferrous metal or wearing ferrous armour has disadvantage on this Strength saving throw. The area is difficult terrain for any creatures made of ferrous metal or wearing ferrous armour.

**At Higher Levels.** When you cast this spell using a spell slot of 8th level or higher, the lightning and force damage both increase by 1d8 for each slot level above 7th.`,
  },
  {
    title: "Aura of Impurity",
    level: 4,
    school: "Abjuration",
    classes: ["Paladin", "Tamer", "Warlock"],
    body: `Casting Time: 1 action
Range: Self (30-foot-radius sphere)
Components: V
Duration: Concentration, up to 1 minute

Enervating energy radiates from you in an aura with a 30-foot radius. Until the spell ends, the aura moves with you, centred on you. Each creature of your choice that enters the aura for the first time on its turn or starts its turn there must succeed on a Charisma saving throw or become drained until the end of its next turn. While drained, a creature must roll a d4 and subtract the number rolled from each ability check, attack roll, or saving throw it makes, and any hit points a creature regains are reduced by half.`,
  },
  {
    title: "Blinding Radiance",
    level: 4,
    school: "Evocation",
    classes: ["Cleric", "Paladin", "Sorcerer", "Warlock"],
    body: `Casting Time: 1 action
Range: Self (10-foot-radius sphere)
Components: V, S, M (a strip of magnesium)
Duration: Concentration, up to 1 minute

Bright light erupts from your form and dazzles those around you. For the duration, you emit bright light in a 50-foot radius and dim light for an additional 50 feet. Each creature that moves within 10 feet of you for the first time on its turn or that starts its turn there must make a Constitution saving throw. On a failure, a creature takes 3d10 radiant damage and is blinded until the start of its next turn. On a success, a creature takes half as much damage and isn't blinded.

**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d10 for each slot level above 4th.`,
  },
  {
    title: "Bone Cage",
    level: 5,
    school: "Biomancy",
    alternateSchool: "Necromancy",
    classes: ["Cleric", "Druid", "Paladin", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Self (20-foot-radius sphere)
Components: V, S, M (the bones of at least one non-animated corpse, which the spell consumes)
Duration: 1 minute

You draw the bones from all corpses within range, forming a carapace of ribcages and femurs. You gain temporary hit points for each Small or larger corpse wholly or partly within range, according to its size, that last for the duration:

| Size | Temporary Hit Points Gained |
| --- | ---: |
| Small | 1d6 + 1 |
| Medium | 1d8 + 2 |
| Large | 1d10 + 5 |
| Huge | 1d12 + 12 |
| Gargantuan | 1d20 + 25 |

As an action on a subsequent turn, you can cause your armour of bones to erupt, expending all remaining temporary hit points. Each other creature within range must make a Dexterity saving throw, taking piercing damage equal to your expended temporary hit points on a failure, or half as much damage on a success. Whatever the manner in which the temporary hit points are lost, the bones shatter and can't be used in this way again.

**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the radius increases by 10 feet for each slot level above 5th.`,
  },
  {
    title: "Can't Trip",
    level: 0,
    school: "Abjuration",
    classes: ["Bard", "Cleric", "Druid", "Tamer", "Wizard"],
    body: `Casting Time: 1 action
Range: 30 feet
Components: V, S
Duration: 1 round

Choose a willing creature within range that you can see. Until the end of your next turn, that creature is immune to the prone condition. If it is already prone and is not restrained, this spell sets it on its feet. The number of creatures you can simultaneously target increases by 1 when you reach 5th level (2 creatures), 11th level (3 creatures), and 17th level (4 creatures).`,
  },
  {
    title: "Can'trip",
    level: 0,
    school: "Abjuration",
    classes: ["Bard", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S
Duration: 1 round

You temporarily tangle the Weave around a creature within range that you can see. Until the start of your next turn, each time the creature tries to cast a cantrip whilst this spell affects it, it must succeed on a spellcasting ability check against your spell save DC or waste its action (but not a spell slot). The spell ends if the target moves out of the spell's range. The maximum level of spell inhibited by this cantrip increases when you reach 5th level (1st-level spells), 11th level (2nd-level spells), and 17th level (3rd-level spells).`,
  },
  {
    title: "Cannotrip",
    level: 1,
    school: "Abjuration",
    classes: ["Bard", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S
Duration: Concentration, up to 1 minute

Choose a creature you can see within range. Each time the target tries to cast a spell of equal or lower level than this spell, it must succeed on a spellcasting ability check against your spell save DC or waste its action (but not its spell slot).

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you inhibit spells 1 spell level higher for each slot level above 1st.`,
  },
  {
    title: "Chameleon Skin",
    level: 1,
    school: "Biomancy",
    alternateSchool: "Transmutation",
    classes: ["Bard", "Druid", "Ranger", "Tamer", "Wizard"],
    body: `Casting Time: 1 action
Range: Touch
Components: V, S, M (red, yellow, and blue pigment)
Duration: Concentration, up to 10 minutes

You imbue a creature you touch with pigment so that its skin, and anything it wears or carries, slowly shifts hues to match its surroundings. For the duration, the target can take the Hide action as a bonus action on each of its turns, even when only lightly obscured. If the target did not move during its last turn, creatures have disadvantage on any Wisdom (Perception) checks made to see the target. Creatures who do not rely on sight, such as those with tremorsense, are immune to this effect.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.`,
  },
  {
    title: "Concussion",
    level: 0,
    school: "Evocation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S
Duration: Instantaneous

With a thdoom that can be heard 100 feet away, you cause a sudden increase in the air pressure surrounding a creature you can see within range. The target must succeed on a Constitution saving throw or take 1d8 thunder damage and become deafened until the start of your next turn. This spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).`,
  },
  {
    title: "Conjure Anomaly",
    level: 5,
    school: "Conjuration",
    classes: ["Warlock", "Wizard"],
    body: `Casting Time: 1 minute
Range: 90 feet
Components: V, S, M (an aberration component)
Duration: Concentration, up to 1 hour

You call forth an aberration at random from the Anomalies, a distant and bizarre plane. Choose an unoccupied space within range. An aberration of challenge rating 5 or lower (GM's choice) appears in the space. The aberration disappears when it drops to 0 hit points or when the spell ends.

The aberration is friendly to you and your companions for the duration. Roll initiative for the aberration, which has its own turns. It obeys any verbal commands that you issue to it (no action required by you). If you don't issue any commands to the aberration, it defends itself from hostile creatures, but otherwise takes no actions.

If your concentration is broken, the aberration doesn't disappear. Instead, you lose control of it, it becomes hostile towards you and your companions, and it might attack. An uncontrolled aberration can't be dismissed by you, and it disappears 1 hour after you summoned it.

**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the challenge rating increases by 1 for each slot level above 5th.`,
  },
  {
    title: "Corrupting Ichor",
    level: 1,
    school: "Necromancy",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: S, M (some phlegm)
Duration: Instantaneous

You spit a globule of phlegm at one creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 necrotic damage. In addition, until it uses its action to wipe off the phlegm, it takes 1d4 necrotic damage at the start of each of its turns and any hit points regained are reduced by half.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage at the start of the target's next turn increases by 1d4 for each slot level above 1st.`,
  },
  {
    title: "Daydream",
    level: 1,
    school: "Enchantment",
    classes: ["Bard", "Druid", "Warlock"],
    body: `Casting Time: 1 action
Range: 30 feet
Components: V, S, M (a tiny, four-panelled window)
Duration: Concentration, up to 1 minute

You float mildly distracting thoughts into the mind of a humanoid you can see within range. The target must succeed on a Wisdom saving throw or have disadvantage on Wisdom (Perception) checks (taking a −5 penalty to passive Perception as a result) until the spell ends. A creature immune to being charmed is unaffected.

A creature that succeeds on the save by 5 or more knows that magic was attempted. Otherwise, it remains unaware.

**At Higher Levels.** For each slot level above 1st, target one additional creature or extend the range by 30 feet.`,
  },
  {
    title: "Depth Charge",
    level: 3,
    school: "Evocation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet (20-foot-radius sphere)
Components: V, S, M (some metamorphic rock)
Duration: Instantaneous

With a boom audible 300 feet away (or 1,000 feet in a liquid), a pulse of thunder ripples from a point you choose within range. Each creature in a 20-foot-radius sphere makes a Constitution saving throw, taking 7d6 thunder damage on a failure or half as much on a success. A submerged creature takes 9d6 damage instead.

**At Higher Levels.** Damage increases by 1d6 per slot level above 3rd.`,
  },
  {
    title: "Dreamwalk",
    level: 2,
    school: "Enchantment",
    ritual: true,
    classes: ["Bard", "Druid", "Ranger", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 30 feet
Components: V, S, M (a tiny dreamcatcher)
Duration: 24 hours

Choose up to ten willing creatures you can see within range. For the duration, they can lucidly dream whenever they sleep and always know if the dream spell is being used to target them. When you cast this spell, each affected creature can choose to fall asleep instantly, even if it has a trait that normally prevents it from being magically put to sleep, such as Fey Ancestry.`,
  },
  {
    title: "Eelskin",
    level: 2,
    school: "Biomancy",
    alternateSchool: "Evocation",
    classes: ["Druid", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action or 1 bonus action
Range: Touch
Components: V, S, M (some jellied eel)
Duration: Concentration, up to 1 minute

You cause the skin of a willing creature you touch to produce slimy, electrified mucous. Its unarmed strikes and natural weapon attacks become magical for the duration. The first time it hits with an unarmed strike or natural weapon attack on its turn, it deals an additional 1d8 lightning damage.

**Slimy.** The creature has advantage on checks and saves made to avoid being grappled or restrained, and disadvantage on attempts it makes to grapple another creature.

**At Higher Levels.** When cast using a 4th-level or higher slot, the damage increases by 1d8 for every two slot levels above 2nd.`,
  },
  {
    title: "Endoleech",
    level: 2,
    school: "Biomancy",
    alternateSchool: "Evocation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Touch
Components: V, S, M (a toenail lost to frostbite)
Duration: Instantaneous

You touch a creature, absorb energy from its body, and bolster your metabolism. Make a melee spell attack against a creature you can reach. On a hit, it takes 5d6 cold damage and cannot take reactions until the end of its next turn. Until then, its speed is reduced by 15 feet and your speed increases by 15 feet.

**At Higher Levels.** Damage increases by 1d6 per slot level above 2nd.`,
  },
  {
    title: "Endure",
    level: 5,
    school: "Necromancy",
    classes: ["Cleric", "Druid", "Paladin", "Ranger", "Tamer", "Warlock"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S, M (a gem-encrusted cockroach worth 250 gp, consumed)
Duration: 1 minute

Choose a willing creature you can see. It ignores exhaustion and the poisoned condition and cannot be incapacitated, stunned, paralyzed, or fall unconscious. When damage would reduce it to 0 hit points, it makes a death saving throw instead. Three failed death saves kill it.

When the spell ends, the creature gains one exhaustion level for each failed death save. If it is resurrected after dying from these failed saves, it does not regain consciousness for a duration equal to the spell's duration, then gains 3 exhaustion levels. If alive when the spell ends, it falls unconscious for a duration equal to the spell's duration and cannot be awakened except by wish.

**At Higher Levels.** Duration increases to 10 minutes with a 6th-level slot, 1 hour with 7th, 8 hours with 8th, or 1 day with 9th.`,
  },
  {
    title: "Enrage",
    level: 3,
    school: "Enchantment",
    classes: ["Bard", "Sorcerer", "Warlock"],
    body: `Casting Time: 1 action
Range: 120 feet (20-foot-radius sphere)
Components: V, S, M (a red handkerchief)
Duration: Concentration, up to 1 minute

Each humanoid in the sphere makes a Charisma saving throw; it can choose to fail. On a failure, it becomes hostile toward all creatures. An enraged creature concentrating on a spell makes a DC 10 Constitution save at the start of each turn or loses concentration.

As an action, force an enraged creature to use its reaction to make a melee weapon attack against a randomly determined creature within its reach. If that target was friendly before the spell, the enraged creature repeats its save after the attack. An enraged creature also repeats its save whenever it takes damage. The spell ends for a creature on a successful save.

**At Higher Levels.** When you use an action to force an enraged creature to attack, you can force one additional enraged creature to attack per slot level above 3rd.`,
  },
  {
    title: "Ferocious Strike",
    level: 0,
    school: "Biomancy",
    alternateSchool: "Transmutation",
    classes: ["Bard", "Druid", "Sorcerer", "Tamer", "Warlock"],
    body: `Casting Time: 1 action
Range: Self
Components: V, S
Duration: Instantaneous

With a pulse of adrenaline, make one weapon attack against a target within reach or range. On a hit, the target takes an additional 1d4 damage of the weapon's type. This damage increases by 1d4 at 5th level (2d4), 11th level (3d4), and 17th level (4d4).`,
  },
  {
    title: "Feverskin",
    level: 5,
    school: "Biomancy",
    alternateSchool: "Evocation",
    classes: ["Cleric", "Druid", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Self
Components: V, S, M (a red-hot chili pepper, consumed)
Duration: Concentration, up to 1 minute

You eat a chili pepper, increasing your metabolism and making your skin burn to the touch. Make a melee spell attack against a creature within reach. On a hit, it takes 6d6 fire damage. You can repeat this attack as an action on later turns. Your walking speed increases by 15 feet, and you gain 2d6 temporary hit points at the start of each of your turns.

**At Higher Levels.** Damage increases by 1d6 per slot level above 5th.`,
  },
  {
    title: "Firther's Shadow",
    level: 3,
    school: "Enchantment",
    classes: ["Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet
Components: V, S
Duration: Concentration, up to 1 minute

A creature you can see makes an Intelligence saving throw. On a failure, it takes 4d10 psychic damage and you learn one fact about it, determined by rolling a d6: its name; something it fears; something it desires; its condition immunities; its damage vulnerabilities, resistances, and immunities; or its skill and saving throw proficiencies. On a success, it takes half damage and you learn nothing. A creature with Intelligence 4 or lower automatically succeeds.

If it fails the initial save, on each of your turns you can use your action to force another Intelligence save. On a failure, it takes 4d6 psychic damage and you learn another fact. On a success, it takes half damage, reveals nothing, and the spell ends. The spell also ends if the target leaves range.

**At Higher Levels.** Initial and ongoing damage increase by 1d10 and 1d6, respectively, per slot level above 3rd.`,
  },
  {
    title: "Fixit",
    level: 1,
    school: "Transmutation",
    classes: ["Bard", "Cleric", "Sorcerer", "Wizard"],
    body: `Casting Time: 1 minute
Range: Touch
Components: V, S, M (adhesive tape with ducks drawn on it)
Duration: 10 minutes

You imbue a broken item no larger than 20 feet in any dimension with pure belief. The item becomes whole for the duration. If you know its magical function (GM's discretion) and its rarity is Common or lower, it regains its magical properties for the duration.

**At Higher Levels.** The maximum rarity increases to Uncommon with a 3rd-level slot, Rare at 5th, Very Rare at 7th, or Legendary at 9th.`,
  },
  {
    title: "Flare",
    level: 0,
    school: "Evocation",
    classes: ["Cleric", "Sorcerer", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S, M (a strip of magnesium)
Duration: Instantaneous

Make a ranged spell attack against a target. On a hit, it takes 1d8 radiant damage. On a critical hit, attacks against it have advantage until the end of your next turn. Alternatively, launch the pulse at a point in the air; it falls slowly and sheds bright light in a 20-foot radius and dim light for another 20 feet until the end of your next turn.

Damage increases by 1d8 and both light radii increase by 10 feet at 5th level (2d8, 30 feet), 11th (3d8, 40 feet), and 17th (4d8, 50 feet).`,
  },
  {
    title: "Flipperform",
    level: 1,
    school: "Biomancy",
    alternateSchool: "Transmutation",
    ritual: true,
    classes: ["Druid", "Ranger", "Sorcerer", "Tamer", "Wizard"],
    body: `Casting Time: 1 action
Range: 30 feet
Components: V, S, M (a fish's fin)
Duration: 1 hour

You change the morphology of a willing creature within range. It grows webbed fingers and gains a swimming speed equal to its walking speed.

**At Higher Levels.** For each slot level above 1st, affect one additional creature and double the duration.`,
  },
  {
    title: "Food Coma",
    level: 3,
    school: "Enchantment",
    ritual: true,
    classes: ["Bard", "Cleric", "Druid", "Paladin", "Tamer"],
    body: `Casting Time: 1 minute
Range: Touch
Components: V, S, M (a turkey drumstick and a cranberry-colored ruby worth at least 50 gp, both consumed)
Duration: 1 hour

You crush the ruby into dust and sprinkle it over a turkey drumstick, which wafts with an alluring aroma. A willing creature that entirely consumes the meat falls asleep and is unconscious for 1 hour. It can be woken early only by taking damage, greater restoration, or wish. At the end of the hour, it wakes with all its hit points restored. If woken prematurely, the spell ends with no effect and it is grumpy.

**At Higher Levels.** You can enchant one additional drumstick for each slot level above 3rd.`,
  },
  {
    title: "Frogskin",
    level: 4,
    school: "Biomancy",
    alternateSchool: "Transmutation",
    classes: ["Druid", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Self
Components: V, S, M (some frogspawn)
Duration: Concentration, up to 1 minute

You morph your skin and clothing into that of a slimy, poisonous frog. Make a melee spell attack against a creature within reach. On a hit, it takes 3d10 poison damage and is poisoned until the end of your next turn. You can repeat the attack as an action on later turns.

**Slimy.** You have advantage on checks and saves to avoid being grappled or restrained, and disadvantage on attempts to grapple. Each creature grappling you or grappled by you makes a Constitution save at the start of each of its turns, taking 3d10 poison damage on a failure or half on success.

**At Higher Levels.** Both damage values increase by 1d10 per slot level above 4th.`,
  },
  {
    title: "Fungal Infection",
    level: 4,
    school: "Biomancy",
    alternateSchool: "Necromancy",
    classes: ["Druid", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet (15-foot-radius sphere)
Components: V, S, M (a mushroom)
Duration: Concentration, up to 1 minute

Creatures in the sphere make Constitution saves or become cursed. When you cast the spell, choose one fungus to grow on affected creatures:

- **Amanita Rotgut:** The creature takes 2d6 poison damage and is poisoned; while poisoned this way, it takes 2d6 poison damage at the end of each turn.
- **Necrotising Zygomycosis:** The creature takes 2d8 necrotic damage immediately and 2d8 at the start of each turn.
- **Psilocybin Quickitrippiae:** At the start of each turn, the creature rolls a d4; on a 1 it cannot move or act that turn.
- **Paralysing Mucorales:** At the end of each turn, the creature is stunned until the start of its next turn. If it failed its initial save by 5 or more, it is paralyzed instead.
- **Raging Henbane:** The creature is charmed by you and must use its reaction at the start of each turn to attack a randomly determined creature other than you.
- **Veiled Lady:** The creature's vision narrows; it has disadvantage on Dexterity saves and ranged attacks against it have advantage.

An affected creature repeats the saving throw at the end of each turn, after the effects trigger, ending the spell on itself on a success.

**At Higher Levels.** At 5th level or higher, Amanita Rotgut and Necrotising Zygomycosis damage increase by 1d6 and 1d8 per slot level above 4th. At 6th level or higher, choose two different fungi.`,
  },
  {
    title: "Gravity Repulsion",
    level: 4,
    school: "Evocation",
    classes: ["Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Self (20-foot-radius sphere)
Components: V, S
Duration: Concentration, up to 1 minute

You emit waves of gravitational energy. Ranged weapon attacks against you have disadvantage, and the area within 20 feet of you is difficult terrain for creatures of your choice that you can see.

**Gravity Pulse.** When you cast the spell and as a bonus action on later turns, force one Huge or smaller creature you can see within 20 feet to make a Strength save. On a failure, push it 10 feet in a direction of your choice, knock it prone, and deal 3d6 force damage.

**At Higher Levels.** The difficult-terrain radius increases by 5 feet, and Gravity Pulse's damage and push distance increase by 1d6 and 5 feet, respectively, per slot level above 4th.`,
  },
  {
    title: "Gravity Smash",
    level: 5,
    school: "Evocation",
    classes: ["Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 120 feet (40-foot-radius, 100-foot-high cylinder)
Components: V, S
Duration: Concentration, up to 1 round

Choose a point within range. The cylinder becomes difficult terrain until the start of your next turn. When the spell ends, each creature in the area makes a Strength save. If the spell lasted its full duration, a failure deals 8d10 force damage and knocks the creature prone. If the spell ended early, a failure deals 4d10 force damage instead. On a success, the creature takes half damage and isn't knocked prone.

**At Higher Levels.** Both damage values increase by 1d10 per slot level above 5th.`,
  },
  {
    title: "Howl",
    level: 0,
    school: "Transmutation",
    classes: ["Druid", "Tamer"],
    body: `Casting Time: 1 action
Range: Self (1,000-foot-radius sphere)
Components: V
Duration: 1 round

You utter a bestial, magically augmented howl audible for 1,000 feet. Choose one familiar creature as its recipient. If it hears your howl, it understands your meaning and can respond in a similar manner. Other creatures that hear it and can understand beasts, or are affected by comprehend languages or similar magic, can understand the howl. Otherwise, it is unintelligible.`,
  },
  {
    title: "Humperdink's Halitosis",
    level: 1,
    school: "Transmutation",
    classes: ["Bard", "Sorcerer", "Warlock"],
    body: `Casting Time: 1 action
Range: Self (15-foot cone)
Components: V, S
Duration: Concentration, up to 1 round

You belch acidic fumes into a 15-foot cone. The fumes spread around corners. Each creature in the area makes a Constitution save, taking 3d4 acid damage on a failure or half as much on success. The fumes linger until the end of your next turn or until dispersed by a moderate or stronger wind. A creature ending its turn in the area saves against the damage again.

**At Higher Levels.** Both initial and later damage increase by 1d4 per slot level above 1st.`,
  },
  {
    title: "Incorporeality",
    level: 5,
    school: "Transmutation",
    classes: ["Bard", "Cleric", "Druid", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Touch
Components: V, S
Duration: Concentration, up to 1 minute

You touch a willing creature, causing it and everything it wears and carries to become translucent. At the start of each of its turns, it can become incorporeal until the end of that turn without an action. While incorporeal, it has advantage on Stealth checks, resistance to nonmagical bludgeoning, piercing, and slashing damage, and can move through creatures and objects as difficult terrain. If it ends its turn inside an object, it is shunted to the nearest unoccupied space, taking 1d10 force damage for every 5 feet moved.

**At Higher Levels.** For each slot level above 5th, increase duration or target count. If increasing duration, it becomes 10 minutes at 6th, 1 hour at 7th, 8 hours at 8th, or 24 hours at 9th. If increasing targets, add one target per slot level.`,
  },
  {
    title: "Inequality",
    level: 2,
    school: "Enchantment",
    classes: ["Bard", "Cleric", "Paladin", "Tamer"],
    body: `Casting Time: 1 action
Range: 30 feet
Components: V, S, M (a drop of blood and water, mixed)
Duration: Concentration, up to 1 minute

Choose two creatures you can see within range, favoring one and disfavoring the other. The disfavored creature makes a Charisma save. On a failure, the favored creature can add 1d4 to its attack rolls and saving throws; the disfavored creature subtracts 1d4 from its attack rolls and saving throws. The disfavored creature's speed is halved, while the favored creature's speed increases by half. The effect ends for both creatures if either is knocked unconscious or killed or the spell ends. The favored creature cannot benefit from bless, and the disfavored creature cannot be affected by bane.

**At Higher Levels.** With a 4th-level or higher slot, link two additional creatures for each two slot levels above 2nd, favoring one and disfavoring one in each pair.`,
  },
  {
    title: "Influenza",
    level: 3,
    school: "Biomancy",
    alternateSchool: "Necromancy",
    classes: ["Cleric", "Druid", "Warlock"],
    body: `Casting Time: 1 action
Range: Self (30-foot cone)
Components: V, S, M (some pollen)
Duration: Concentration, up to 1 minute

You blast a cone of phlegm, bad breath, and viral pathogens. Each creature in the area makes a Dexterity save. On a failure, it takes 3d6 poison damage and is poisoned for the duration; on success, it takes half damage and isn't poisoned. A poisoned creature repeats a Constitution save at the end of each turn, ending the effect on success.

While poisoned this way, a creature rolls a d12 at the start of each turn. On a 1–3, it suffers a coughing fit and is incapacitated until the start of its next turn. Each creature within 5 feet of it when this occurs makes a Constitution save or also becomes poisoned for the spell's duration.

**At Higher Levels.** Damage and the d12 coughing threshold increase by 1d6 and 1, respectively, per slot level above 3rd.`,
  },
  {
    title: "Lungburst",
    level: 6,
    school: "Biomancy",
    alternateSchool: "Evocation",
    classes: ["Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet
Components: V, S
Duration: Instantaneous

A creature you can see makes a Constitution save, with disadvantage if it is holding its breath. On a failure, it takes 7d6 thunder damage and 7d6 necrotic damage and begins suffocating. On a success, it takes half damage and does not begin suffocating. A creature suffocating this way repeats the save at the end of each turn, ending the suffocation on a success. Creatures that do not need to breathe are immune. Greater restoration, heal, or wish can restore its ability to breathe and end the suffocation.

**At Higher Levels.** Both damage types increase by 1d6 per slot level above 6th.`,
  },
  {
    title: "Magnetite Shard",
    level: 3,
    school: "Evocation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet (20-foot-radius sphere)
Components: V, S, M (a piece of magnetite)
Duration: Instantaneous

A supercooled piece of magnetite detonates at a point within range. Each creature in a 20-foot-radius sphere makes a Dexterity save, taking 4d6 cold damage and 3d6 piercing damage on a failure or half as much on a success. Creatures made of ferrous material or wearing ferrous armor have disadvantage on the save.

**At Higher Levels.** Cold damage increases by 1d6 per slot level above 3rd.`,
  },
  {
    title: "Magnetobolt",
    level: 0,
    school: "Evocation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet
Components: V, S
Duration: Instantaneous

Make a ranged spell attack with a near-invisible arcanomagnetic pulse. On a hit, the target takes 1d6 force damage and must succeed on a Strength save or be knocked prone. Ferrous creatures or creatures wearing ferrous armor have disadvantage on this save. Damage increases by 1d6 at 5th, 11th, and 17th level.`,
  },
  {
    title: "Mass Leech",
    level: 3,
    school: "Necromancy",
    classes: ["Cleric", "Tamer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Self (20-foot-radius sphere)
Components: V, S, M (a live leech that has fed on humanoid blood in the past 24 hours)
Duration: Instantaneous

Each creature of your choice within 20 feet makes a Constitution save. A target takes 2d8 necrotic damage on a failure or half as much on a success. You regain hit points equal to half the total necrotic damage dealt to Small or larger creatures.

**At Higher Levels.** Damage increases by 1d8 per slot level above 3rd.`,
  },
  {
    title: "Mechamagic",
    level: 4,
    school: "Transmutation",
    classes: ["Bard", "Wizard"],
    body: `Casting Time: 1 action
Range: Touch
Components: V, S, M (adhesive tape with gorillas drawn on it)
Duration: 1 hour

Touch one item and grant it a property based on its type:

- **Armor:** Its wearer gains 1d4 temporary hit points at the start of each turn.
- **Belt:** Its wearer gains a flying speed of 30 feet.
- **Boots:** Its wearer's walking speed increases by 10 feet and jump distance is tripled.
- **Cloak:** Its wearer has advantage on Stealth checks to hide and can hide while lightly obscured.
- **Gloves:** Its wearer gains a climbing speed equal to walking speed, can climb difficult surfaces including ceilings without checks, and has advantage on grapple-related checks.
- **Headwear:** Its wearer does not need to breathe, has advantage on saves against poison, and has resistance to poison damage.

Touch the item to end the spell early. The spell ends if you cast it again.

**At Higher Levels.** Target one additional item per slot level above 4th.`,
  },
  {
    title: "Mireball",
    level: 3,
    school: "Conjuration",
    classes: ["Bard", "Druid", "Sorcerer", "Warlock"],
    body: `Casting Time: 1 action
Range: 150 feet (15-foot-radius sphere)
Components: V, S, M (a tiny ball of guano and mud)
Duration: 1 minute

A blob of mud explodes at a point within range. Each creature in a 15-foot-radius sphere makes a Strength save, taking 3d10 bludgeoning damage and falling prone on a failure or taking half damage without falling prone on a success. Surfaces in the area become slick, sticky mud. The first time a creature moves through the area on a turn, it makes a Dexterity save against your spell save DC or falls prone. Moving at half speed avoids the save.

**At Higher Levels.** Damage increases by 1d10 per slot level above 3rd.`,
  },
  {
    title: "Mortiferous Pulse",
    level: 2,
    school: "Biomancy",
    alternateSchool: "Necromancy",
    classes: ["Druid", "Warlock"],
    body: `Casting Time: 1 action
Range: Self (50-foot line)
Components: V, S, M (a dead animal)
Duration: Instantaneous

You summon negative energy that decays the viscera of those before you. Each creature in a 5-foot-wide, 50-foot-long line makes a Dexterity save, taking 3d8 necrotic damage on a failure or half as much on a success.

**At Higher Levels.** Damage increases by 1d8 per slot level above 2nd.`,
  },
  {
    title: "Peppermint Plate",
    level: 1,
    school: "Abjuration",
    classes: ["Cleric", "Paladin", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Self
Components: V, S, M (well-chewed peppermint chewing gum)
Duration: Concentration, up to 1 hour

A protective layer of hot, hard peppermint icing coats you. You gain +1 AC for the duration. A creature that hits you with a melee attack takes 1d4 fire damage, no more than once per turn.

**At Higher Levels.** Fire damage increases by 1d4 per slot level above 1st.`,
  },
  {
    title: "Pins & Needles",
    level: 0,
    school: "Biomancy",
    alternateSchool: "Evocation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S
Duration: Instantaneous

You disrupt a small part of a creature's nervous system, then overstimulate it with pain. The creature makes a Constitution save or takes 1d8 psychic damage. If it fails by 5 or more, it has disadvantage on its next attack roll before the end of its next turn.

Damage increases by 1d8 at 5th, 11th, and 17th level.`,
  },
  {
    title: "Power Word Shield",
    level: 7,
    school: "Abjuration",
    classes: ["Bard", "Cleric", "Sorcerer", "Wizard"],
    body: `Casting Time: 1 reaction, which you take when a creature you can see is targeted by an attack or spell
Range: 60 feet
Components: V
Duration: 1 round

A translucent shield surrounds a creature you can see within range. Until the end of its next turn, it is immune to all damage except psychic, has advantage on all saving throws, and is unaffected by other power word spells. The spell also removes poison from the creature and extinguishes any flames on it.`,
  },
  {
    title: "Preserve",
    level: 2,
    school: "Biomancy",
    alternateSchool: "Abjuration",
    classes: ["Cleric", "Druid", "Paladin", "Ranger", "Tamer", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S, M (some ether)
Duration: 24 hours

Creatures in a 10-foot-radius sphere centered on a point you can see within range make Charisma saves or become soulbound for the duration, their magical essence tied to their physical or incorporeal form. If a soulbound creature dies, its magic remains bound to its components for 24 hours, allowing harvesting to begin during this period. The spell ends for that corpse once harvesting begins. Creatures with robust or stronger essence (typically CR 7 or higher) automatically succeed.

**At Higher Levels.** With a 4th-level or higher slot, the essence tier that automatically succeeds rises by one tier per two slot levels above 2nd: potent (typically CR 12+) at 4th, mythic (typically CR 18+) at 6th, and deific (typically CR 25+) at 8th.`,
  },
  {
    title: "Primal Scent",
    level: 0,
    school: "Divination",
    classes: ["Druid", "Tamer"],
    body: `Casting Time: 1 action
Range: Self
Components: S
Duration: Concentration, up to 1 minute

You enhance the scents around you. You have advantage on the next ability check relying on smell and can treat a roll of 4 or lower as 5. At 5th level, smell-based checks treat d20 rolls of 7 or lower as 8; at 11th level, 10 or lower as 11; at 17th level, 13 or lower as 14.`,
  },
  {
    title: "Protection",
    level: 2,
    school: "Abjuration",
    classes: ["Bard", "Cleric", "Druid", "Paladin", "Ranger", "Tamer"],
    body: `Casting Time: 1 action
Range: 30 feet
Components: V, S, M (a miniature silver shield worth 10 gp, consumed)
Duration: Concentration, up to 1 hour

You send a warding sigil to circle a willing creature you can see. Immediately before the target next takes damage other than psychic damage, the ward grants resistance to all damage except psychic until the end of its next turn, including the triggering damage. The sigil then disappears and the spell ends on that creature.

**At Higher Levels.** Target one additional creature per slot level above 2nd.`,
  },
  {
    title: "Riptide",
    level: 2,
    school: "Transmutation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 300 feet
Components: V, S
Duration: Concentration, up to 1 minute

Choose a creature you can see within range that is in at least 2 feet of water, and choose a direction. At the start of each of its turns, it makes a Strength save. On a failure, it is dragged 30 feet in that direction and its swimming speed becomes 0 until the start of its next turn. On a success, it moves normally until then. As a bonus action, change the current's direction. The spell ends if the creature leaves range or is no longer in water at least 2 feet deep.`,
  },
  {
    title: "Shackles of Pain",
    level: 4,
    school: "Abjuration",
    classes: ["Bard", "Cleric", "Paladin", "Warlock"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S, M (a pair of manacles)
Duration: Concentration, up to 1 minute

Link a willing creature (the source) to another creature (the target). The target makes a Charisma save or becomes linked for one minute. Each time the source takes damage, the target takes psychic damage equal to half the damage the source took. If you are the source, the linked creature takes this damage immediately before you make a Constitution save to maintain concentration. Whenever the target takes this damage, it can repeat its save, ending the effect on success.`,
  },
  {
    title: "Shielding Word",
    level: 2,
    school: "Abjuration",
    classes: ["Bard", "Cleric", "Paladin", "Sorcerer", "Tamer"],
    body: `Casting Time: 1 reaction, when a creature within range that you can see is hit by an attack or fails a Strength or Dexterity save
Range: 30 feet
Components: V
Duration: 1 round

The creature gains 15 temporary hit points immediately before taking the triggering damage. They last until the start of its next turn.

**At Higher Levels.** Per slot level above 2nd, increase the range by 30 feet or the temporary hit points by 5.`,
  },
  {
    title: "Smokescreen",
    level: 0,
    school: "Conjuration",
    classes: ["Druid", "Sorcerer", "Tamer", "Wizard"],
    body: `Casting Time: 1 action
Range: Self (5-foot-radius, 10-foot-high cylinder)
Components: V, S, M (a puffball mushroom)
Duration: Concentration, up to 1 round

You spew dense black smoke that heavily obscures a cylinder centered on you until the start of your next turn. Choose whether the cloud stays in place or moves with you. Its maximum diameter and height increase to 15 feet at 5th level, 25 feet at 11th, and 40 feet at 17th level. Each time you cast it, choose its dimensions up to those maxima.`,
  },
  {
    title: "Spark",
    level: 0,
    school: "Evocation",
    classes: ["Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S
Duration: Instantaneous

Make a ranged spell attack against a creature. On a hit, it takes 1d8 lightning damage. On a critical hit, it is blinded until the end of its next turn. The spell creates two sparks at 5th level, three at 11th, and four at 17th. Make a separate attack roll for each spark; they can target the same or different creatures.`,
  },
  {
    title: "Spore Cloud",
    level: 0,
    school: "Biomancy",
    alternateSchool: "Conjuration",
    classes: ["Druid", "Sorcerer", "Warlock"],
    body: `Casting Time: 1 action
Range: Self (5-foot-radius sphere)
Components: V, S, M (a toadstool)
Duration: Instantaneous

Each creature other than you within 5 feet makes a Constitution save or takes 1d4 poison damage. A creature that fails by 5 or more is poisoned until the end of its next turn. Damage increases by 1d4 at 5th, 11th, and 17th level.`,
  },
  {
    title: "Stalker's Eye",
    level: 0,
    school: "Enchantment",
    classes: ["Bard", "Druid", "Tamer"],
    body: `Casting Time: 1 action
Range: Touch
Components: V, S, M (a small magnifying lens)
Duration: Concentration, up to 1 minute

A willing creature gains a preternatural ability to perceive defensive weaknesses. Its first attack under the spell has advantage, then the spell ends. At 5th level, that attack scores a critical hit on 19–20; at 11th level on 18–20; and at 17th level on 17–20.`,
  },
  {
    title: "Stench",
    level: 3,
    school: "Conjuration",
    classes: ["Bard", "Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet (20-foot-radius sphere)
Components: V, S, M (a skunk's tail)
Duration: Concentration, up to 1 minute

A noxious, colorless miasma fills a 20-foot-radius sphere centered on a point within range. A creature entering the area for the first time on a turn or starting there makes a Constitution save. On failure, it takes 3d6 poison damage and is poisoned until the end of its next turn; on success, it takes half damage and is not poisoned. While poisoned this way, it has disadvantage on concentration saves.

**At Higher Levels.** Damage increases by 1d6 per slot level above 3rd.`,
  },
  {
    title: "Sugar Rush",
    level: 2,
    school: "Biomancy",
    alternateSchool: "Transmutation",
    classes: ["Bard", "Cleric", "Paladin", "Sorcerer", "Tamer"],
    body: `Casting Time: 1 action
Range: 30 feet
Components: V, S, M (some candy)
Duration: Concentration, up to 1 minute

A willing creature gains 15 feet of speed and +1 AC. As a bonus action on each of its turns, it can Dash, Disengage, Hide, or Use an Object. When the spell ends, or if it ends a turn without spending movement up to its walking speed, it becomes poisoned until the end of its next turn.

**At Higher Levels.** Target one additional creature per slot level above 2nd.`,
  },
  {
    title: "Swarm",
    level: 0,
    school: "Biomancy",
    alternateSchool: "Conjuration",
    classes: ["Druid", "Sorcerer", "Warlock"],
    body: `Casting Time: 1 action
Range: 90 feet
Components: V, S, M (a spider sac)
Duration: 1 round

A cloud of tiny poisonous spiders flies toward a target. It makes a Dexterity save or is poisoned until the end of its next turn. On a failed save, the spell also deals poison damage at higher levels: 1d10 at 5th level, 2d10 at 11th, and 3d10 at 17th.`,
  },
  {
    title: "Switcheroo",
    level: 3,
    school: "Transmutation",
    classes: ["Bard", "Cleric", "Sorcerer", "Tamer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet
Components: V, S
Duration: Instantaneous

Attempt to switch places with a Large or smaller creature you can see. It makes a Charisma save or instantly teleports to your space while you teleport to its former space. It automatically succeeds if either creature cannot fit in the other's space. A willing creature can choose to fail.

**At Higher Levels.** Range increases by 30 feet per slot level above 3rd. The maximum target size becomes Huge at 6th level and Gargantuan at 9th.`,
  },
  {
    title: "Tentacle Lash",
    level: 4,
    school: "Biomancy",
    alternateSchool: "Transmutation",
    classes: ["Druid", "Ranger", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: Self
Components: V, S, M (a miniature plunger)
Duration: Concentration, up to 1 minute

One arm elongates into a suckered tentacle. When cast and as an action on later turns, make a melee spell attack against a creature within 30 feet. On a hit, it takes 5d8 bludgeoning damage and, if Huge or smaller, makes a Strength save. On a failure, choose one: knock it prone, shove it 5 feet in a direction of your choice, or disarm it and take one held item. The tentacle can also serve as a grappling hook or rope at the GM's discretion.

**At Higher Levels.** Damage increases by 1d8 per slot level above 4th.`,
  },
  {
    title: "The Bends",
    level: 3,
    school: "Biomancy",
    alternateSchool: "Transmutation",
    classes: ["Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet
Components: V, S
Duration: Instantaneous

A creature you can see makes a Constitution save as nitrogen bubbles form in its blood. On failure, it takes 5d8 poison damage and is poisoned for 1 minute. On success, it takes half damage and is not poisoned. If fully submerged, the damage dice become d10s. The target repeats the save at the end of each turn, ending the effect on success.

**At Higher Levels.** Damage increases by 1d8 per slot level above 3rd.`,
  },
  {
    title: "Totem Arrows",
    level: 4,
    school: "Transmutation",
    classes: ["Druid", "Ranger"],
    body: `Casting Time: 1 action
Range: Touch
Components: V, S, M (a quiver containing at least one piece of ammunition)
Duration: Concentration, up to 1 hour

You imbue the ammunition in a quiver with a creature, plant, or fungus spirit. As a bonus action, change the spirit. A creature hit by a piece of ammunition is subject to that spirit's effect in addition to the normal attack:

- **Cat:** Extra 1d6 slashing damage, or 2d6 if the attack had advantage.
- **Elk:** Extra 1d6 bludgeoning damage; Strength save or knock prone or shove 5 feet.
- **Hawk:** Ignore half and three-quarters cover.
- **Hogweed:** Constitution save or become blinded until the end of its next turn.
- **Psilocybin:** Wisdom save or begin tripping; at the start of its turns, roll a d4. On 1 it is incapacitated until end of turn and the effect ends; on 2–4 it acts normally and the effect continues.
- **Roc:** Strength save or speed becomes 0 and it is lifted 20 feet until the end of its next turn, then falls. If space is limited, lift it as high as possible.
- **Snake:** Extra 1d6 poison damage; Constitution save or become poisoned for the duration, repeating the save at the end of each turn.
- **Spider:** Dexterity save or become restrained until the end of its next turn. It can use an action to make a Strength (Athletics) or Dexterity (Acrobatics) check against your spell save DC to end the effect.

**At Higher Levels.** With a 5th-level or higher slot, duration becomes concentration, up to 8 hours.`,
  },
  {
    title: "Water Whip",
    level: 0,
    school: "Transmutation",
    classes: ["Druid", "Sorcerer", "Wizard"],
    body: `Casting Time: 1 action
Range: 60 feet
Components: V, S
Duration: Instantaneous

Choose a visible water source within range containing at least 4 pints. Make a melee spell attack against a creature within 30 feet of that source. On a hit, it takes 1d6 slashing damage. If it is Large or smaller, it makes a Strength save or is pulled up to 10 feet toward the water.

Damage increases by 1d6 and pull distance by 5 feet at 5th level (2d6 and 15 feet), 11th (3d6 and 20 feet), and 17th (4d6 and 25 feet).`,
  },
  {
    title: "Weavebend",
    level: 4,
    school: "Abjuration",
    classes: ["Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 reaction, which you take when you see a creature within range casting a spell
Range: 60 feet
Components: S
Duration: Instantaneous

You attempt to redirect a spell cast by a creature you can see. A spell of 3rd level or lower can be redirected. If it involves a ranged spell attack, choose a different target within 10 feet of the original target. If it has an area, shift the area up to 10 feet. For a spell of 4th level or higher, make a spellcasting ability check against DC 10 + the spell's level; on a success, redirect it as described.

**At Higher Levels.** With a 5th-level or higher slot, the spell is automatically redirected if its level is lower than the slot used.`,
  },
  {
    title: "Weave Entanglement",
    level: 6,
    school: "Abjuration",
    classes: ["Bard", "Sorcerer", "Wizard"],
    body: `Casting Time: 1 action
Range: 90 feet (20-foot-radius sphere)
Components: V, S, M (a piece of felt)
Duration: Concentration, up to 1 minute

You tangle the Weave in a 20-foot-radius sphere centered on a point you can see. Whenever a creature attempts to cast a spell of 1st level or higher in the area, it makes a spellcasting ability check against your spell save DC. On a success, the spell is cast normally. On a failure, the spell is cast and an additional effect occurs; roll a d10: 1 gravity smash; 2 phantasmal killer; 3 confusion; 4 fireball; 5 zippit!; 6 web; 7 darkness; 8 silence; 9 the spellcaster regains 2d10 hit points; 10 the spellcaster does not expend a spell slot. Additional spells target or center on the spellcaster, which has no control over them. Added spells require no concentration. At initiative count 20, roll a d20 for each ongoing added effect; it ends on 11 or higher.

**At Higher Levels.** Radius increases by 10 feet per slot level above 6th.`,
  },
  {
    title: "Zippit!",
    level: 3,
    school: "Biomancy",
    alternateSchool: "Transmutation",
    classes: ["Bard", "Druid", "Sorcerer", "Warlock", "Wizard"],
    body: `Casting Time: 1 reaction, which you take when a creature within range vocalizes
Range: 60 feet
Components: V, S
Duration: Concentration, up to 1 minute

The target makes a Constitution save or its mouth fuses shut and it is silenced for the duration. If it was casting a spell with verbal components, its spell slot is not expended but its action is wasted. At the end of each turn, it can make a Strength save; on a success, it takes 1d8 slashing damage and the silence ends. Alternatively, it can use an action and a bladed implement to cut its mouth open, taking 1d8 slashing damage and ending the spell.

**At Higher Levels.** Slashing damage increases by 1d8 per slot level above 3rd.`,
  },
]

const folders = {
  0: "cantrips",
  1: "1st-level",
  2: "2nd-level",
  3: "3rd-level",
  4: "4th-level",
  5: "5th-level",
  6: "6th-level",
  7: "7th-level",
  8: "8th-level",
  9: "9th-level",
}
const slug = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
for (const spell of definitions) {
  const filename = spell.title === "Protection" ? "Protection.md" : `${spell.title}.md`
  const file = path.join(root, folders[spell.level], filename)
  if (!fs.existsSync(file)) throw new Error(`Missing expected spell record: ${file}`)
  const old = fs.readFileSync(file, "utf8")
  const match = old.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) throw new Error(`Missing frontmatter: ${file}`)
  const previous = parse(match[1]) ?? {}
  const metadata = {
    ...previous,
    entity_type: "spell",
    canonical_id: previous.canonical_id || `spell.appendix-b.${slug(spell.title)}`,
    title: spell.title === "Protection" ? "Protection (Tamer Spell)" : spell.title,
    spell_name: spell.title,
    level: spell.level,
    school: spell.school,
    classes: spell.classes,
    source: "Appendix B — Spells",
    source_type: "third-party",
    edition: "system-neutral",
    adaptation: "curated",
    license_status: "reference-only",
    content_status: "complete",
  }
  if (spell.alternateSchool) metadata.alternate_school = spell.alternateSchool
  if (spell.ritual) metadata.ritual = true
  delete metadata.incomplete_reason
  const levelName =
    spell.level === 0
      ? "Cantrips"
      : `${spell.level}${spell.level === 1 ? "st" : spell.level === 2 ? "nd" : spell.level === 3 ? "rd" : "th"}-Level`
  const body = `---\n${stringify(metadata).trimEnd()}\n---\n\n${spell.body}\n\n## Related Content\n\n**Spell Level:** [[spells/${folders[spell.level]}|${levelName}]]\n\n**School:** ${spell.school}${spell.alternateSchool ? ` (optional alternate school: ${spell.alternateSchool})` : ""}\n\n**Source:** Appendix B — Spells\n\n**Available to:** ${spell.classes.map((name) => `[[character-options/classes/${name}|${name}]]`).join(", ")}\n\n**Related:** [[spells|All Spells]] | [[character-options/classes/Tamer|Tamer]]\n`
  fs.writeFileSync(file, body)
}
console.log(`Transcribed ${definitions.length} Appendix B spell definitions.`)
