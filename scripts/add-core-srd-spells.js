import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spellsDir = path.resolve(__dirname, '..', 'content', 'spells');

const missingSpells = [
  // 1st-level
  {
    level: 1,
    folder: '1st-level',
    title: 'Bless',
    school: 'Enchantment',
    classes: ['Cleric', 'Paladin'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '30 feet',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S, M (a sprinkling of holy water)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Bless up to three creatures of your choice, adding 1d4 to attack rolls and saving throws.',
    body: `_1st-level enchantment_

You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Cure Wounds',
    school: 'Evocation',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Artificer'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Touch',
    duration: 'Instantaneous',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A creature you touch regains hit points equal to 1d8 + your spellcasting ability modifier.',
    body: `_1st-level evocation_

A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Guiding Bolt',
    school: 'Evocation',
    classes: ['Cleric'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '120 feet',
    duration: '1 round',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A flash of light streaks toward a creature, dealing 4d6 radiant damage and granting advantage on the next attack roll against it.',
    body: `_1st-level evocation_

A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage, thanks to the mystical dim light glittering on the target until then.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Burning Hands',
    school: 'Evocation',
    classes: ['Sorcerer', 'Wizard'],
    subclass_spell_lists: ['Light Domain', 'Fiend Patron'],
    casting_time: '1 action',
    range: 'Self (15-foot cone)',
    duration: 'Instantaneous',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A thin sheet of flames shoots from your outspread fingertips, dealing 3d6 fire damage to creatures in a 15-foot cone.',
    body: `_1st-level evocation_

As you hold your hands with thumbs touching and fingers spread, a thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a Dexterity saving throw. A creature takes 3d6 fire damage on a failed save, or half as much damage on a successful one.

The fire ignites any flammable objects in the area that aren't being worn or carried.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Command',
    school: 'Enchantment',
    classes: ['Cleric', 'Paladin'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '60 feet',
    duration: '1 round',
    components: 'V',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Speak a one-word command to a creature; on a failed Wisdom save, it must obey on its next turn.',
    body: `_1st-level enchantment_

You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. The spell has no effect if the target is undead, if it doesn't understand your language, or if your command is directly harmful to it.

Some typical commands include: **Approach**, **Drop**, **Flee**, **Grovel**, or **Halt**.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional creature for each slot level above 1st.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Faerie Fire',
    school: 'Evocation',
    classes: ['Bard', 'Druid', 'Artificer'],
    subclass_spell_lists: ['Light Domain', 'Archfey Patron'],
    casting_time: '1 action',
    range: '60 feet',
    duration: 'Concentration, up to 1 minute',
    components: 'V',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Outline objects and creatures in a 20-foot cube with colorful light, shedding dim light and giving attackers advantage.',
    body: `_1st-level evocation_

Each object in a 20-foot cube within range is outlined in blue, green, or violet light (your choice). Any creature in the area when the spell is cast is also outlined in light if it fails a Dexterity saving throw. For the duration, objects and affected creatures shed dim light in a 10-foot radius.

Any attack roll against an affected creature or object has advantage if the attacker can see it, and the affected creature or object can't benefit from being invisible.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Grease',
    school: 'Conjuration',
    classes: ['Artificer', 'Wizard'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '60 feet',
    duration: '1 minute',
    components: 'V, S, M (a bit of pork rind or butter)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Slick grease covers the ground in a 10-foot square, turning it into difficult terrain and causing creatures to slip and fall prone.',
    body: `_1st-level conjuration_

Slick grease covers the ground in a 10-foot square centered on a point within range and turns it into difficult terrain for the duration.

When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or fall prone. A creature that enters the area or ends its turn there must also succeed on a Dexterity saving throw or fall prone.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Inflict Wounds',
    school: 'Necromancy',
    classes: ['Cleric', 'Thanatomancer'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Touch',
    duration: 'Instantaneous',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Make a melee spell attack to channel necrotic decay, dealing 3d10 necrotic damage on a hit.',
    body: `_1st-level necromancy_

Make a melee spell attack against a creature you can reach. On a hit, the target takes 3d10 necrotic damage.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Detect Evil and Good',
    school: 'Divination',
    classes: ['Cleric', 'Paladin'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Self',
    duration: 'Concentration, up to 10 minutes',
    components: 'V, S',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Sense if there is an aberration, celestial, elemental, fey, fiend, or undead within 30 feet of you.',
    body: `_1st-level divination_

For the duration, you know if there is an aberration, celestial, elemental, fey, fiend, or undead within 30 feet of you, as well as where the creature is located. Similarly, you know if there is a place or object within 30 feet of you that has been magically consecrated or desecrated.`
  },
  {
    level: 1,
    folder: '1st-level',
    title: 'Sleep',
    school: 'Enchantment',
    classes: ['Bard', 'Sorcerer', 'Wizard'],
    subclass_spell_lists: ['Archfey Patron'],
    casting_time: '1 action',
    range: '90 feet',
    duration: '1 minute',
    components: 'V, S, M (a pinch of fine sand, rose petals, or a cricket)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Roll 5d8; creatures within 20 feet fall into a magical slumber in ascending order of their current hit points.',
    body: `_1st-level enchantment_

This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points (ignoring unconscious creatures).

Starting with the creature that has the lowest current hit points, each creature affected by this spell falls unconscious until the spell ends, the sleeper takes damage, or someone uses an action to shake or slap the sleeper awake. Subtract each creature's hit points from the total before moving on to the creature with the next lowest hit points. A creature's hit points must be equal to or less than the remaining total for that creature to be affected.

Undead and creatures immune to being charmed aren't affected by this spell.

**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.`
  },

  // 2nd-level
  {
    level: 2,
    folder: '2nd-level',
    title: 'Misty Step',
    school: 'Conjuration',
    classes: ['Sorcerer', 'Warlock', 'Wizard'],
    subclass_spell_lists: ['Arcane Knight', 'Ancient Oath', 'Coast Land'],
    casting_time: '1 bonus action',
    range: 'Self',
    duration: 'Instantaneous',
    components: 'V',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see.',
    body: `_2nd-level conjuration_

Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space that you can see.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Flaming Sphere',
    school: 'Conjuration',
    classes: ['Druid', 'Wizard'],
    subclass_spell_lists: ['Light Domain'],
    casting_time: '1 action',
    range: '60 feet',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S, M (a bit of tallow, a pinch of brimstone, and a dusting of powdered iron)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A 5-foot-diameter sphere of fire rolls across the battlefield, ramming into creatures for 2d6 fire damage.',
    body: `_2nd-level conjuration_

A 5-foot-diameter sphere of fire appears in an unoccupied space of your choice within range and lasts for the duration. Any creature that ends its turn within 5 feet of the sphere must make a Dexterity saving throw. The creature takes 2d6 fire damage on a failed save, or half as much damage on a successful one.

As a bonus action, you can move the sphere up to 30 feet. If you ram the sphere into a creature, that creature must make the saving throw against the sphere's damage, and the sphere stops moving this turn.

**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d6 for each slot level above 2nd.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Scorching Ray',
    school: 'Evocation',
    classes: ['Sorcerer', 'Wizard'],
    subclass_spell_lists: ['Light Domain', 'Fiend Patron'],
    casting_time: '1 action',
    range: '120 feet',
    duration: 'Instantaneous',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Create three rays of fire and hurl them at targets within range, dealing 2d6 fire damage per hitting ray.',
    body: `_2nd-level evocation_

You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several.

Make a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.

**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Shatter',
    school: 'Evocation',
    classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    subclass_spell_lists: ['Tempest Domain'],
    casting_time: '1 action',
    range: '60 feet',
    duration: 'Instantaneous',
    components: 'V, S, M (a chip of mica)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A sudden loud ringing noise painfully deafens creatures in a 10-foot radius, dealing 3d8 thunder damage on a failed Con save.',
    body: `_2nd-level evocation_

A sudden loud ringing noise, painfully intense, erupts from a point of your choice within range. Each creature in a 10-foot-radius sphere centered on that point must make a Constitution saving throw. A creature takes 3d8 thunder damage on a failed save, or half as much damage on a successful one. A creature made of inorganic material such as stone, crystal, or metal has disadvantage on this saving throw.

A nonmagical object that isn't being worn or carried also takes the damage if it's in the spell's area.

**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for each slot level above 2nd.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Silence',
    school: 'Illusion',
    classes: ['Bard', 'Cleric', 'Ranger'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '120 feet',
    duration: 'Concentration, up to 10 minutes',
    components: 'V, S',
    ritual: true,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'No sound can be created within or pass through a 20-foot-radius sphere, completely preventing verbal spellcasting.',
    body: `_2nd-level illusion (ritual)_

For the duration, no sound can be created within or pass through a 20-foot-radius sphere centered on a point you choose within range. Any creature or object entirely inside the sphere is immune to thunder damage, and creatures are deafened while entirely inside it. Casting a spell that includes a verbal component is impossible there.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Warding Bond',
    school: 'Abjuration',
    classes: ['Cleric'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Touch',
    duration: '1 hour',
    components: 'V, S, M (a pair of platinum rings worth at least 50 gp each, which you and the target must wear for the duration)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Touch a willing creature to create a mystic ward; it gains +1 AC and saving throws and resistance to all damage, while you take identical damage.',
    body: `_2nd-level abjuration_

This spell wards a willing creature you touch and creates a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has resistance to all damage. Also, each time it takes damage, you take the same amount of damage.

The spell ends if you drop to 0 hit points or if you and the target become separated by more than 60 feet.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Zone of Truth',
    school: 'Enchantment',
    classes: ['Bard', 'Cleric', 'Paladin'],
    subclass_spell_lists: ['Devotion Oath'],
    casting_time: '1 action',
    range: '60 feet',
    duration: '10 minutes',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Create a magical zone in a 15-foot radius that guards against deception; creatures cannot speak a deliberate lie on a failed Charisma save.',
    body: `_2nd-level enchantment_

You create a magical zone that guards against deception in a 15-foot-radius sphere centered on a point of your choice within range. Until the spell ends, a creature that enters the spell's area for the first time on a turn or starts its turn there must make a Charisma saving throw. On a failed save, a creature can't speak a deliberate lie while in the radius. You know whether each creature succeeds or fails on its saving throw.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Blindness-Deafness',
    school: 'Necromancy',
    classes: ['Bard', 'Cleric', 'Sorcerer', 'Wizard', 'Thanatomancer'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '30 feet',
    duration: '1 minute',
    components: 'V',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Blind or deafen a foe on a failed Constitution save, repeating the save at the end of each of its turns.',
    body: `_2nd-level necromancy_

You can blind or deafen a foe. Choose one creature that you can see within range to make a Constitution saving throw. If it fails, the target is either blinded or deafened (your choice) for the duration. At the end of each of its turns, the target can make a Constitution saving throw. On a success, the spell ends.

**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Gust of Wind',
    school: 'Evocation',
    classes: ['Druid', 'Sorcerer', 'Wizard'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Self (60-foot line)',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S, M (a legume seed)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A 60-foot line of strong wind blasts from you, pushing creatures 15 feet away and dispersing gas or vapor.',
    body: `_2nd-level evocation_

A line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the spell's duration. Each creature that starts its turn in the line must succeed on a Strength saving throw or be pushed 15 feet away from you in a direction following the line. Any creature in the line must spend 2 feet of movement for every 1 foot it moves when moving closer to you.

The gust disperses gas or vapor, and it extinguishes candles, torches, and similar unprotected flames in the area.`
  },
  {
    level: 2,
    folder: '2nd-level',
    title: 'Prayer of Healing',
    school: 'Evocation',
    classes: ['Cleric'],
    subclass_spell_lists: [],
    casting_time: '10 minutes',
    range: '30 feet',
    duration: 'Instantaneous',
    components: 'V',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Up to six creatures of your choice within range regain hit points equal to 2d8 + your spellcasting ability modifier.',
    body: `_2nd-level evocation_

Up to six creatures of your choice that you can see within range each regain hit points equal to 2d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.

**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the healing increases by 1d8 for each slot level above 2nd.`
  },

  // 3rd-level
  {
    level: 3,
    folder: '3rd-level',
    title: 'Fireball',
    school: 'Evocation',
    classes: ['Sorcerer', 'Wizard'],
    subclass_spell_lists: ['Light Domain', 'Fiend Patron'],
    casting_time: '1 action',
    range: '150 feet',
    duration: 'Instantaneous',
    components: 'V, S, M (a tiny ball of bat guano and sulfur)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A bright streak flashes to a point and blooms into an explosion of flame dealing 8d6 fire damage in a 20-foot radius.',
    body: `_3rd-level evocation_

A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.

The fire spreads around corners. It ignites flammable objects in the area that aren't being worn or carried.

**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Lightning Bolt',
    school: 'Evocation',
    classes: ['Sorcerer', 'Wizard'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Self (100-foot line)',
    duration: 'Instantaneous',
    components: 'V, S, M (a bit of fur and a rod of amber, crystal, or glass)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you, dealing 8d6 lightning damage.',
    body: `_3rd-level evocation_

A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose. Each creature in the line must make a Dexterity saving throw. A creature takes 8d6 lightning damage on a failed save, or half as much damage on a successful one.

The lightning ignites flammable objects in the area that aren't being worn or carried.

**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Haste',
    school: 'Transmutation',
    classes: ['Artificer', 'Sorcerer', 'Wizard'],
    subclass_spell_lists: ['Vengeance Oath'],
    casting_time: '1 action',
    range: '30 feet',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S, M (a shaving of licorice root)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Target gains doubled speed, +2 AC, advantage on Dex saves, and an additional action each turn to Attack, Dash, Disengage, Hide, or Use an Object.',
    body: `_3rd-level transmutation_

Choose a willing creature that you can see within range. Until the spell ends, the target's speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns. That action can be used only to take the Attack (one weapon attack only), Dash, Disengage, Hide, or Use an Object action.

When the spell ends, the target can't move or take actions until after its next turn, as a wave of lethargy sweeps over it.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Fly',
    school: 'Transmutation',
    classes: ['Artificer', 'Sorcerer', 'Warlock', 'Wizard'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Touch',
    duration: 'Concentration, up to 10 minutes',
    components: 'V, S, M (a wing feather from any bird)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Touch a willing creature; it gains a flying speed of 60 feet for the duration.',
    body: `_3rd-level transmutation_

You touch a willing creature. The target gains a flying speed of 60 feet for the duration. When the spell ends, the target falls if it is still aloft, unless it can stop the fall.

**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, you can target one additional creature for each slot level above 3rd.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Revivify',
    school: 'Necromancy',
    classes: ['Cleric', 'Paladin', 'Artificer'],
    subclass_spell_lists: ['Life Domain'],
    casting_time: '1 action',
    range: 'Touch',
    duration: 'Instantaneous',
    components: 'V, S, M (diamonds worth 300 gp, which the spell consumes)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Touch a creature that has died within the last minute; it returns to life with 1 hit point.',
    body: `_3rd-level necromancy_

You touch a creature that has died within the last minute. That creature returns to life with 1 hit point. This spell can't return to life a creature that has died of old age, nor can it restore any missing body parts.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Beacon of Hope',
    school: 'Abjuration',
    classes: ['Cleric'],
    subclass_spell_lists: ['Life Domain', 'Devotion Oath'],
    casting_time: '1 action',
    range: '30 feet',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Targets gain advantage on Wisdom saves and death saves, and regain the maximum possible hit points from any healing.',
    body: `_3rd-level abjuration_

This spell bestows hope and vitality. Choose any number of creatures within range. For the duration, each target has advantage on Wisdom saving throws and death saving throws, and regains the maximum number of hit points possible from any healing.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Daylight',
    school: 'Evocation',
    classes: ['Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '60 feet',
    duration: '1 hour',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A 60-foot-radius sphere of bright light sheds daylight, dispelling darkness created by spells of 3rd level or lower.',
    body: `_3rd-level evocation_

A 60-foot-radius sphere of light spreads out from a point you choose within range. The sphere is bright light and sheds dim light for an additional 60 feet.

If any of this spell's area overlaps with an area of darkness created by a spell of 3rd level or lower, the spell that created the darkness is dispelled.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Dispel Magic',
    school: 'Abjuration',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Sorcerer', 'Warlock', 'Wizard', 'Artificer'],
    subclass_spell_lists: ['Devotion Oath'],
    casting_time: '1 action',
    range: '120 feet',
    duration: 'Instantaneous',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'End spells of 3rd level or lower on one creature, object, or magical effect; make an ability check to end higher-level spells.',
    body: `_3rd-level abjuration_

Choose one creature, object, or magical effect within range. Any spell of 3rd level or lower on the target ends. For each spell of 4th level or higher on the target, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a successful check, the spell ends.

**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, you automatically end the effects of a spell on the target if the spell's level is equal to or less than the level of the spell slot you used.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Spirit Guardians',
    school: 'Conjuration',
    classes: ['Cleric'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Self (15-foot radius)',
    duration: 'Concentration, up to 10 minutes',
    components: 'V, S, M (a holy symbol)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Spirits flit around you in a 15-foot radius, halving enemy speed and dealing 3d8 radiant or necrotic damage on failed Wis saves.',
    body: `_3rd-level conjuration_

You call forth spirits to protect you. They flit around you to a distance of 15 feet for the duration. If you are good or neutral, their spectral form appears angelic or fey (your choice). If you are evil, they appear fiendish.

When you cast this spell, you can designate any number of creatures you can see to be unaffected by it. An affected creature's speed is halved in the area, and when the creature enters the area for the first time on a turn or starts its turn there, it must make a Wisdom saving throw. On a failed save, the creature takes 3d8 radiant damage (if you are good or neutral) or 3d8 necrotic damage (if you are evil). On a successful save, the creature takes half as much damage.

**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d8 for each slot level above 3rd.`
  },
  {
    level: 3,
    folder: '3rd-level',
    title: 'Fear',
    school: 'Illusion',
    classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Self (30-foot cone)',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S, M (a white feather or the heart of a hen)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: "Project a phantasmal image of a creature's worst fears in a 30-foot cone, forcing targets to drop what they hold and flee.",
    body: `_3rd-level illusion_

You project a phantasmal image of a creature's worst fears. Each creature in a 30-foot cone must succeed on a Wisdom saving throw or drop whatever it is holding and become frightened for the duration.

While frightened by this spell, a creature must take the Dash action and move away from you by the safest available route on each of its turns, unless there is nowhere to move.`
  },

  // 4th-level
  {
    level: 4,
    folder: '4th-level',
    title: 'Banishment',
    school: 'Abjuration',
    classes: ['Cleric', 'Paladin', 'Sorcerer', 'Warlock', 'Wizard'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '60 feet',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S, M (an item distasteful to the target)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Attempt to send one creature to another plane of existence on a failed Charisma save.',
    body: `_4th-level abjuration_

You attempt to send one creature that you can see within range to another plane of existence. The target must succeed on a Charisma saving throw or be banished.

If the target is native to the plane of existence you're on, you banish the target to a harmless demiplane. While there, the target is incapacitated. The target remains there until the spell ends, at which point the target reappears in the space it left or in the nearest unoccupied space if that space is occupied.

If the target is native to a different plane of existence than the one you're on, the target is banished with a faint popping noise, returning to its home plane. If the spell ends before 1 minute has elapsed, the target reappears. Otherwise, the target doesn't return.

**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, you can target one additional creature for each slot level above 4th.`
  },
  {
    level: 4,
    folder: '4th-level',
    title: 'Death Ward',
    school: 'Abjuration',
    classes: ['Cleric', 'Paladin'],
    subclass_spell_lists: ['Life Domain'],
    casting_time: '1 action',
    range: 'Touch',
    duration: '8 hours',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Touch a creature to grant it protection from death: the first time it would drop to 0 HP, it drops to 1 HP instead.',
    body: `_4th-level abjuration_

You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point, and the spell ends.

If the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends.`
  },
  {
    level: 4,
    folder: '4th-level',
    title: 'Freedom of Movement',
    school: 'Abjuration',
    classes: ['Bard', 'Cleric', 'Druid', 'Ranger', 'Artificer'],
    subclass_spell_lists: ['Devotion Oath', 'Hunter'],
    casting_time: '1 action',
    range: 'Touch',
    duration: '1 hour',
    components: 'V, S, M (a strap of leather, bound around the arm or a similar appendage)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Touch a willing creature; its movement is unaffected by difficult terrain and spells cannot reduce its speed or paralyze or restrain it.',
    body: `_4th-level abjuration_

You touch a willing creature. For the duration, the target's movement is unaffected by difficult terrain, and spells and other magical effects can neither reduce the target's speed nor cause the target to be paralyzed or restrained.

The target can also spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature that has it grappled. Finally, being underwater imposes no penalties on the target's movement or attacks.`
  },
  {
    level: 4,
    folder: '4th-level',
    title: 'Guardian of Faith',
    school: 'Conjuration',
    classes: ['Cleric'],
    subclass_spell_lists: ['Life Domain', 'Light Domain', 'Devotion Oath'],
    casting_time: '1 action',
    range: '30 feet',
    duration: '8 hours',
    components: 'V',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A large spectral guardian appears to defend a space, dealing 20 radiant damage to hostile creatures that come within 10 feet.',
    body: `_4th-level conjuration_

A Large bipedal spectral guardian appears and hovers for the duration in an unoccupied space of your choice that you can see within range. The guardian occupies that space and is indistinct except for a gleaming sword and shield emblazoned with the symbol of your deity.

Any creature hostile to you that moves to a space within 10 feet of the guardian for the first time on a turn must succeed on a Dexterity saving throw. The creature takes 20 radiant damage on a failed save, or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage.`
  },
  {
    level: 4,
    folder: '4th-level',
    title: 'Wall of Fire',
    school: 'Evocation',
    classes: ['Druid', 'Sorcerer', 'Wizard'],
    subclass_spell_lists: ['Light Domain', 'Fiend Patron'],
    casting_time: '1 action',
    range: '120 feet',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S, M (a small piece of phosphorus)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Create a wall of fire up to 60 feet long or a 20-foot ring dealing 5d8 fire damage to creatures in its area or passing through.',
    body: `_4th-level evocation_

You create a wall of fire on a solid surface within range. You can make the wall up to 60 feet long, 20 feet high, and 1 foot thick, or a ringed wall up to 20 feet in diameter, 20 feet high, and 1 foot thick. The wall is opaque and lasts for the duration.

When the wall appears, each creature within its area must make a Dexterity saving throw. On a failed save, a creature takes 5d8 fire damage, or half as much damage on a successful save. One side of the wall deals 5d8 fire damage to each creature that ends its turn within 10 feet of that side or inside the wall. A creature takes the same damage when it enters the wall for the first time on a turn or ends its turn there.

**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8 for each slot level above 4th.`
  },
  {
    level: 4,
    folder: '4th-level',
    title: 'Fire Shield',
    school: 'Evocation',
    classes: ['Wizard'],
    subclass_spell_lists: ['Fiend Patron'],
    casting_time: '1 action',
    range: 'Self',
    duration: '10 minutes',
    components: 'V, S, M (a bit of phosphorus or a firefly)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Thin flames wreathe your body, granting resistance to fire or cold damage and dealing 2d8 damage to creatures that strike you in melee.',
    body: `_4th-level evocation_

Thin and wispy flames wreathe your body for the duration, shedding bright light in a 10-foot radius and dim light for an additional 10 feet. You can end the spell early by using an action to dismiss it.

The flames provide you with a warm shield or a chill shield, as you choose:
- **Warm Shield:** You have resistance to cold damage, and whenever a creature within 5 feet of you hits you with a melee attack, the shield erupts with flame, dealing 2d8 fire damage to the attacker.
- **Chill Shield:** You have resistance to fire damage, and whenever a creature within 5 feet of you hits you with a melee attack, the shield erupts with frost, dealing 2d8 cold damage to the attacker.`
  },
  {
    level: 4,
    folder: '4th-level',
    title: 'Blight',
    school: 'Necromancy',
    classes: ['Druid', 'Sorcerer', 'Warlock', 'Wizard', 'Thanatomancer'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: '30 feet',
    duration: 'Instantaneous',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Necromantic energy washes over a creature, dealing 8d8 necrotic damage on a failed Con save (plants make save with disadvantage and take maximum damage).',
    body: `_4th-level necromancy_

Necromantic energy washes over a creature of your choice that you can see within range, draining moisture and vitality from it. The target must make a Constitution saving throw. The target takes 8d8 necrotic damage on a failed save, or half as much damage on a successful one. This spell has no effect on undead or constructs.

If you target a plant creature or a magical plant, it makes the saving throw with disadvantage, and the spell deals maximum damage to it.

**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d8 for each slot level above 4th.`
  },
  {
    level: 4,
    folder: '4th-level',
    title: 'Greater Invisibility',
    school: 'Illusion',
    classes: ['Bard', 'Sorcerer', 'Wizard'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Touch',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'You or a creature you touch becomes invisible, and does NOT become visible when attacking or casting a spell.',
    body: `_4th-level illusion_

You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target's person.`
  },

  // 5th-level
  {
    level: 5,
    folder: '5th-level',
    title: 'Flame Strike',
    school: 'Evocation',
    classes: ['Cleric'],
    subclass_spell_lists: ['Light Domain', 'Fiend Patron'],
    casting_time: '1 action',
    range: '60 feet',
    duration: 'Instantaneous',
    components: 'V, S, M (pinch of sulfur)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A vertical column of divine fire roars down from heaven, dealing 4d6 fire and 4d6 radiant damage in a 10-foot radius.',
    body: `_5th-level evocation_

A vertical column of divine fire roars down from the heavens in a location you specify. Each creature in a 10-foot-radius, 40-foot-high cylinder centered on a point within range must make a Dexterity saving throw. A creature takes 4d6 fire damage and 4d6 radiant damage on a failed save, or half as much damage on a successful one.

**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the fire damage or the radiant damage (your choice) increases by 1d6 for each slot level above 5th.`
  },
  {
    level: 5,
    folder: '5th-level',
    title: 'Mass Cure Wounds',
    school: 'Evocation',
    classes: ['Bard', 'Cleric', 'Druid'],
    subclass_spell_lists: ['Life Domain'],
    casting_time: '1 action',
    range: '60 feet',
    duration: 'Instantaneous',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Up to six creatures in a 30-foot sphere regain hit points equal to 3d8 + your spellcasting ability modifier.',
    body: `_5th-level evocation_

A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains hit points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.

**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the healing increases by 1d8 for each slot level above 5th.`
  },
  {
    level: 5,
    folder: '5th-level',
    title: 'Raise Dead',
    school: 'Necromancy',
    classes: ['Bard', 'Cleric', 'Paladin'],
    subclass_spell_lists: ['Life Domain'],
    casting_time: '1 hour',
    range: 'Touch',
    duration: 'Instantaneous',
    components: 'V, S, M (a diamond worth at least 500 gp, which the spell consumes)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Return a dead creature to life if it has been dead no longer than 10 days, curing nonmagical diseases and neutralizing poisons.',
    body: `_5th-level necromancy_

You return a dead creature you touch to life, provided that it has been dead no longer than 10 days. If the creature's soul is both willing and at peace with its departure, the creature returns to life with 1 hit point.

This spell also neutralizes any poisons and cures normal diseases afflicting the creature when it died. It doesn't, however, remove magical diseases, curses, or similar effects; if these aren't first removed prior to casting the spell, they take effect when the creature returns to life. The spell can't return an undead creature to life.`
  },
  {
    level: 5,
    folder: '5th-level',
    title: 'Cone of Cold',
    school: 'Evocation',
    classes: ['Sorcerer', 'Wizard'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Self (60-foot cone)',
    duration: 'Instantaneous',
    components: 'V, S, M (a small crystal or glass cone)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'A blast of cold air erupts from your hands, dealing 8d8 cold damage in a 60-foot cone (creatures killed become frozen statues).',
    body: `_5th-level evocation_

A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a Constitution saving throw. A creature takes 8d8 cold damage on a failed save, or half as much damage on a successful one.

A creature killed by this spell becomes a frozen statue until it thaws.

**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th.`
  },
  {
    level: 5,
    folder: '5th-level',
    title: 'Greater Restoration',
    school: 'Abjuration',
    classes: ['Bard', 'Cleric', 'Druid', 'Artificer'],
    subclass_spell_lists: ['Life Domain', 'Devotion Oath'],
    casting_time: '1 action',
    range: 'Touch',
    duration: 'Instantaneous',
    components: 'V, S, M (diamond dust worth at least 100 gp, which the spell consumes)',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Touch a creature to end one exhaustion level, charm/petrify effect, curse, ability score reduction, or max HP reduction.',
    body: `_5th-level abjuration_

You imbue a creature you touch with positive energy to undo a debilitating effect. You can reduce the target's exhaustion level by one, or end one of the following effects on the target:
- One effect that charmed or petrified the target
- One curse, including the target's attunement to a cursed magic item
- Any reduction to one of the target's ability scores
- One effect reducing the target's hit point maximum`
  },
  {
    level: 5,
    folder: '5th-level',
    title: 'Contagion',
    school: 'Necromancy',
    classes: ['Cleric', 'Druid', 'Thanatomancer'],
    subclass_spell_lists: [],
    casting_time: '1 action',
    range: 'Touch',
    duration: '7 days',
    components: 'V, S',
    ritual: false,
    concentration: false,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Your touch inflicts a virulent natural disease chosen from Blinding Sickness, Filth Fever, Flesh Rot, Mindfire, Seizure, or Slimy Doom.',
    body: `_5th-level necromancy_

Your touch inflicts disease. Make a melee spell attack against a creature within your reach. On a hit, you afflict the creature with a disease of your choice from any of the following: **Blinding Sickness**, **Filth Fever**, **Flesh Rot**, **Mindfire**, **Seizure**, or **Slimy Doom**.

At the end of each of the target's turns, it must make a Constitution saving throw. After accruing three failures, the disease's effects last for the duration, and the creature stops making the saves. After three successes, the target recovers and the spell ends.`
  },
  {
    level: 5,
    folder: '5th-level',
    title: 'Dispel Evil and Good',
    school: 'Abjuration',
    classes: ['Cleric', 'Paladin'],
    subclass_spell_lists: ['Devotion Oath'],
    casting_time: '1 action',
    range: 'Self',
    duration: 'Concentration, up to 1 minute',
    components: 'V, S, M (holy water or powdered silver and iron)',
    ritual: false,
    concentration: true,
    source: 'SRD 5.1',
    source_type: 'SRD',
    summary: 'Shimmering energy protects you from extraplanar beings: celestials, elementals, fey, fiends, and undead have disadvantage on attack rolls against you.',
    body: `_5th-level abjuration_

Shimmering energy surrounds and protects you from fey, undead, and creatures originating from beyond the Material Plane. For the duration, celestials, elementals, fey, fiends, and undead have disadvantage on attack rolls against you.

You can also end the spell early using one of two special effects: **Break Enchantment** (touch a creature to end charm/frighten/possession) or **Dismissal** (make a melee spell attack to banish an extraplanar creature back to its native plane).`
  }
];

let created = 0;
for (const spell of missingSpells) {
  const dir = path.join(spellsDir, spell.folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${spell.title}.md`);
  if (!fs.existsSync(filePath)) {
    const lines = [
      '---',
      `title: "${spell.title}"`,
      `level: ${spell.level}`,
      `school: ${spell.school}`,
      `casting_time: "${spell.casting_time}"`,
      `range: "${spell.range}"`,
      `duration: "${spell.duration}"`,
      `components: "${spell.components}"`,
      `ritual: ${spell.ritual}`,
      `concentration: ${spell.concentration}`,
      `source: "${spell.source}"`,
      `source_type: ${spell.source_type}`,
      `summary: "${spell.summary.replace(/"/g, '\\"')}"`,
      'classes:'
    ];
    for (const c of spell.classes) lines.push(`  - ${c}`);
    if (spell.subclass_spell_lists.length > 0) {
      lines.push('subclass_spell_lists:');
      for (const sc of spell.subclass_spell_lists) lines.push(`  - ${sc}`);
    }
    lines.push('---');
    lines.push('');
    lines.push(spell.body);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Related Content');
    lines.push('');
    lines.push(`**Spell Level:** [[spells/${spell.folder}|${spell.level === 0 ? 'Cantrips' : spell.folder.replace('-', ' ')}]]`);
    lines.push('');
    lines.push(`**School:** ${spell.school}`);
    lines.push('');
    if (spell.classes.length > 0) {
      lines.push(`**Available to:** ${spell.classes.map(c => `[[${c}]]`).join(', ')}`);
      lines.push('');
    }
    lines.push(`**Source:** ${spell.source}`);
    lines.push('');

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    created++;
  }
}

console.log(`Successfully generated ${created} missing SRD and domain spells.`);
