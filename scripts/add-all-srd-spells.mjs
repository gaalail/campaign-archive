import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const spellsDir = path.join(rootDir, 'content', 'spells');

const FOLDER_BY_LEVEL = {
  0: 'cantrips',
  1: '1st-level',
  2: '2nd-level',
  3: '3rd-level',
  4: '4th-level',
  5: '5th-level',
  6: '6th-level',
  7: '7th-level',
  8: '8th-level',
  9: '9th-level',
};

const LEVEL_LABEL = {
  0: 'Cantrip',
  1: '1st-level',
  2: '2nd-level',
  3: '3rd-level',
  4: '4th-level',
  5: '5th-level',
  6: '6th-level',
  7: '7th-level',
  8: '8th-level',
  9: '9th-level',
};

// [title, level, school, casting_time, range, components, duration, ritual, concentration, classes, summary, body, aliases]
const SRD_SPELLS = [
  // ================= CANTRIPS =================
  [
    'Acid Splash', 0, 'Conjuration', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Sorcerer', 'Wizard'],
    'Hurl a bubble of acid at one or two adjacent creatures, dealing 1d6 acid damage on a failed Dexterity save.',
    `You hurl a bubble of acid. Choose one creature within range, or choose two creatures within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage.\n\nThis spell's damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6).`
  ],
  [
    'Chill Touch', 0, 'Necromancy', '1 action', '120 feet', 'V, S', '1 round', false, false,
    ['Sorcerer', 'Thanatomancer', 'Warlock', 'Wizard'],
    'A ghostly skeletal hand strikes a creature for 1d8 necrotic damage and prevents it from regaining hit points.',
    `You create a ghostly, skeletal hand in the space of a creature within range. Make a ranged spell attack against the creature to assail it with the chill of the grave. On a hit, the target takes 1d8 necrotic damage, and it can't regain hit points until the start of your next turn. Until then, the hand clings to the target. If you hit an undead target, it also has disadvantage on attack rolls against you until the end of your next turn.\n\nThis spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).`
  ],
  [
    'Dancing Lights', 0, 'Evocation', '1 action', '120 feet', 'V, S, M (a bit of phosphorus or wychwood, or a glowworm)', 'Concentration, up to 1 minute', false, true,
    ['Artificer', 'Bard', 'Sorcerer', 'Wizard'],
    'Create up to four torch-sized floating lights or one glowing humanoid form that shed dim light.',
    `You create up to four torch-sized lights within range, making them appear as torches, lanterns, or glowing orbs that hover in the air for the duration. You can also combine the four lights into one glowing vaguely humanoid form of Medium size. Whichever form you choose, each light sheds dim light in a 10-foot radius. As a bonus action on your turn, you can move the lights up to 60 feet to a new spot within range.`
  ],
  [
    'Druidcraft', 0, 'Transmutation', '1 action', '30 feet', 'V, S', 'Instantaneous', false, false,
    ['Druid'],
    'Create tiny natural sensory effects, predict local weather, bloom flowers, or snuff small flames.',
    `Whispering to the spirits of nature, you create one of the following effects within range: predict the weather for the next 24 hours, make a flower blossom or seed pod open, create an instantaneous harmless sensory effect (such as falling leaves or a breeze), or light/snuff out a candle, torch, or small campfire.`
  ],
  [
    'Eldritch Blast', 0, 'Evocation', '1 action', '120 feet', 'V, S', 'Instantaneous', false, false,
    ['Warlock'],
    'A beam of crackling force streaks toward a creature for 1d10 force damage, firing additional beams at higher levels.',
    `A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage.\n\nThe spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level, and four beams at 17th level. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam.`
  ],
  [
    'Fire Bolt', 0, 'Evocation', '1 action', '120 feet', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Sorcerer', 'Wizard'],
    'Hurl a mote of fire at a creature or object for 1d10 fire damage and ignite unattended flammables.',
    `You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn't being worn or carried.\n\nThis spell's damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10).`
  ],
  [
    'Guidance', 0, 'Divination', '1 action', 'Touch', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Artificer', 'Cleric', 'Druid', 'Tamer'],
    'Touch one willing creature so it can add 1d4 to one ability check of its choice before the spell ends.',
    `You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends.`
  ],
  [
    'Light', 0, 'Evocation', '1 action', 'Touch', 'V, M (a firefly or phosphorescent moss)', '1 hour', false, false,
    ['Artificer', 'Bard', 'Cleric', 'Sorcerer', 'Tamer', 'Wizard'],
    'Cause an object to shed bright light in a 20-foot radius and dim light for an additional 20 feet.',
    `You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like. Completely covering the object with something opaque blocks the light. The spell ends if you cast it again or dismiss it as an action.`
  ],
  [
    'Mage Hand', 0, 'Conjuration', '1 action', '30 feet', 'V, S', '1 minute', false, false,
    ['Artificer', 'Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Conjure a spectral floating hand that can manipulate objects, open unlocked doors, or stow items up to 10 pounds.',
    `A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. You can use your action to control the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item, or pour out a vial. The hand can't attack, activate magic items, or carry more than 10 pounds.`
  ],
  [
    'Mending', 0, 'Transmutation', '1 minute', 'Touch', 'V, S, M (two lodestones)', 'Instantaneous', false, false,
    ['Artificer', 'Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'],
    'Repair a single break or tear up to 1 foot in any dimension in an object you touch.',
    `This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin. As long as the break or tear is no larger than 1 foot in any dimension, you mend it, leaving no trace of the former damage. It can physically repair a magic item or construct, but can't restore magic to such an object.`
  ],
  [
    'Message', 0, 'Transmutation', '1 action', '120 feet', 'V, S, M (a short piece of copper wire)', '1 round', false, false,
    ['Artificer', 'Bard', 'Sorcerer', 'Wizard'],
    'Point toward a creature within range and whisper a message that only it can hear and reply to.',
    `You point your finger toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear. You can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier, though magical silence, 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood blocks the spell.`
  ],
  [
    'Minor Illusion', 0, 'Illusion', '1 action', '30 feet', 'S, M (a bit of fleece)', '1 minute', false, false,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Create a sound or an image of an object within range that lasts for 1 minute.',
    `You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it as an action or cast this spell again. A sound can range from a whisper to a scream. An image of an object must be no larger than a 5-foot cube and cannot create sound, light, smell, or any other sensory effect. A creature that uses its action to examine the sound or image can determine it is an illusion with a successful Intelligence (Investigation) check against your spell save DC.`
  ],
  [
    'Poison Spray', 0, 'Conjuration', '1 action', '10 feet', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'],
    'Project a puff of noxious gas at a creature within 10 feet, dealing 1d12 poison damage on a failed Constitution save.',
    `You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm. The creature must succeed on a Constitution saving throw or take 1d12 poison damage.\n\nThis spell's damage increases by 1d12 when you reach 5th level (2d12), 11th level (3d12), and 17th level (4d12).`
  ],
  [
    'Prestidigitation', 0, 'Transmutation', '1 action', '10 feet', 'V, S', 'Up to 1 hour', false, false,
    ['Artificer', 'Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Perform minor magical tricks such as sensory effects, lighting/snuffing candles, cleaning/soiling, chilling/warming, or conjuring trinkets.',
    `This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects within range: an instantaneous harmless sensory effect; lighting or snuffing a candle, torch, or small campfire; cleaning or soiling an object no larger than 1 cubic foot; chilling, warming, or flavoring up to 1 cubic foot of nonliving material for 1 hour; making a color, mark, or symbol appear for 1 hour; or creating a nonmagical trinket or illusory image that fits in your hand until the end of your next turn.`
  ],
  [
    'Produce Flame', 0, 'Conjuration', '1 action', 'Self', 'V, S', '10 minutes', false, false,
    ['Druid'],
    'A flickering flame appears in your hand for light, or can be hurled at a creature within 30 feet for 1d8 fire damage.',
    `A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment. The flame sheds bright light in a 10-foot radius and dim light for an additional 10 feet. You can also attack with the flame (hurling it up to 30 feet) as a ranged spell attack on the turn you cast it or as an action on a later turn, dealing 1d8 fire damage on a hit.\n\nThis spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).`
  ],
  [
    'Ray of Frost', 0, 'Evocation', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Sorcerer', 'Wizard'],
    'A frigid beam streaks toward a creature for 1d8 cold damage and reduces its speed by 10 feet.',
    `A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 cold damage, and its speed is reduced by 10 feet until the start of your next turn.\n\nThe spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).`
  ],
  [
    'Resistance', 0, 'Abjuration', '1 action', 'Touch', 'V, S, M (a miniature cloak)', 'Concentration, up to 1 minute', false, true,
    ['Artificer', 'Cleric', 'Druid', 'Tamer'],
    'Touch one willing creature so it can add 1d4 to one saving throw of its choice before the spell ends.',
    `You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice. It can roll the die before or after making the saving throw. The spell then ends.`
  ],
  [
    'Sacred Flame', 0, 'Evocation', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Cleric'],
    'Flame-like radiance descends on a creature for 1d8 radiant damage on a failed Dexterity save, ignoring cover.',
    `Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage. The target gains no benefit from cover for this saving throw.\n\nThe spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).`
  ],
  [
    'Shillelagh', 0, 'Transmutation', '1 bonus action', 'Touch', 'V, S, M (mistletoe, a shamrock leaf, and a club or quarterstaff)', '1 minute', false, false,
    ['Druid'],
    'Imbue a club or quarterstaff with nature magic to use your spellcasting ability and deal 1d8 magical bludgeoning damage.',
    `The wood of a club or quarterstaff you are holding is imbued with nature's power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon's damage die becomes a d8. The weapon also becomes magical, if it isn't already.`
  ],
  [
    'Shocking Grasp', 0, 'Evocation', '1 action', 'Touch', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Sorcerer', 'Wizard'],
    'Lightning springs from your hand in a melee spell attack for 1d8 lightning damage and denies reactions.',
    `Lightning springs from your hand to deliver a shock to a creature you try to touch. Make a melee spell attack against the target. You have advantage on the attack roll if the target is wearing armor made of metal. On a hit, the target takes 1d8 lightning damage, and it can't take reactions until the start of its next turn.\n\nThe spell's damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).`
  ],
  [
    'Spare the Dying', 0, 'Necromancy', '1 action', 'Touch', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Cleric', 'Tamer', 'Thanatomancer'],
    'Touch a living creature that has 0 hit points to stabilize it.',
    `You touch a living creature that has 0 hit points. The creature becomes stable. This spell has no effect on undead or constructs.`
  ],
  [
    'Thaumaturgy', 0, 'Transmutation', '1 action', '30 feet', 'V', 'Up to 1 minute', false, false,
    ['Cleric'],
    'Manifest a minor wonder such as booming voice, flickering flames, harmless tremors, phantom sounds, opening unlocked doors, or altering your eyes.',
    `You manifest a minor wonder, a sign of supernatural power, within range. You create one of the following magical effects within range: your voice booms up to three times as loud as normal for 1 minute; you cause flames to flicker, brighten, dim, or change color for 1 minute; you cause harmless tremors in the ground for 1 minute; you create an instantaneous sound originating from a point of your choice; you instantaneously cause an unlocked door or window to fly open or slam shut; or you alter the appearance of your eyes for 1 minute.`
  ],
  [
    'True Strike', 0, 'Divination', '1 action', '30 feet', 'S', 'Concentration, up to 1 round', false, true,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Gain brief insight into a target defenses, granting advantage on your first attack roll against it on your next turn.',
    `You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target's defenses. On your next turn, you gain advantage on your first attack roll against the target, provided that this spell hasn't ended.`
  ],
  [
    'Vicious Mockery', 0, 'Enchantment', '1 action', '60 feet', 'V', 'Instantaneous', false, false,
    ['Bard', 'Tamer'],
    'Unleash laced insults at a creature that can hear you for 1d4 psychic damage and disadvantage on its next attack roll.',
    `You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you (though it need not understand you), it must succeed on a Wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn.\n\nThis spell's damage increases by 1d4 when you reach 5th level (2d4), 11th level (3d4), and 17th level (4d4).`
  ],

  // ================= 1ST LEVEL =================
  [
    'Alarm', 1, 'Abjuration', '1 minute', '30 feet', 'V, S, M (a tiny bell and a piece of fine silver wire)', '8 hours', true, false,
    ['Artificer', 'Ranger', 'Wizard'],
    'Set an invisible ward around a door, window, or 20-foot cube that alerts you mentally or audibly when a Tiny or larger creature enters.',
    `You set an alarm against unwanted intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot cube. Until the spell ends, an alarm alerts you whenever a Tiny or larger creature touches or enters the warded area. When you cast the spell, you can designate creatures that won't set off the alarm, and choose whether the alarm is mental (pinging your mind within 1 mile) or audible (a hand bell ringing for 10 seconds within 60 feet).`
  ],
  [
    'Bane', 1, 'Enchantment', '1 action', '30 feet', 'V, S, M (a drop of blood)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Cleric'],
    'Up to three creatures make Charisma saves or subtract 1d4 from all attack rolls and saving throws for the duration.',
    `Up to three creatures of your choice that you can see within range must make Charisma saving throws. Whenever a target that fails this saving throw makes an attack roll or a saving throw before the spell ends, the target must roll a d4 and subtract the number rolled from the attack roll or saving throw.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.`
  ],
  [
    'Charm Person', 1, 'Enchantment', '1 action', '30 feet', 'V, S', '1 hour', false, false,
    ['Bard', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'],
    'Attempt to charm a humanoid within range (with advantage if fighting you), making it regard you as a friendly acquaintance.',
    `You attempt to charm a humanoid you can see within range. It must make a Wisdom saving throw, and does so with advantage if you or your companions are fighting it. If it fails the saving throw, it is charmed by you until the spell ends or until you or your companions do anything harmful to it. The charmed creature regards you as a friendly acquaintance. When the spell ends, the creature knows it was charmed by you.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.`
  ],
  [
    'Comprehend Languages', 1, 'Divination', '1 action', 'Self', 'V, S, M (a pinch of soot and salt)', '1 hour', true, false,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Understand the literal meaning of any spoken language you hear or written language you touch for 1 hour.',
    `For the duration, you understand the literal meaning of any spoken language that you hear. You also understand any written language that you see, but you must be touching the surface on which the words are written. It takes about 1 minute to read one page of text. This spell doesn't decode secret messages in a text or a glyph, such as an arcane sigil, that isn't part of a written language.`
  ],
  [
    'Create or Destroy Water', 1, 'Transmutation', '1 action', '30 feet', 'V, S, M (a drop of water if creating or a few grains of sand if destroying)', 'Instantaneous', false, false,
    ['Cleric', 'Druid'],
    'Create up to 10 gallons of clean water or rain in a 30-foot cube, or destroy an equal amount of water or fog.',
    `You either create or destroy water.\n\n- **Create Water.** You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot cube within range, extinguishing exposed flames in the area.\n- **Destroy Water.** You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot cube within range.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you create or destroy 10 additional gallons of water, or the size of the cube increases by 5 feet, for each slot level above 1st.`,
    ['Create Water']
  ],
  [
    'Detect Magic', 1, 'Divination', '1 action', 'Self', 'V, S', 'Concentration, up to 10 minutes', true, true,
    ['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Tamer', 'Wizard'],
    'Sense the presence of magic within 30 feet and learn the school of magic of visible magical auras.',
    `For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any. The spell can penetrate most barriers, but is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.`
  ],
  [
    'Detect Poison and Disease', 1, 'Divination', '1 action', 'Self', 'V, S, M (a yew leaf)', 'Concentration, up to 10 minutes', true, true,
    ['Cleric', 'Druid', 'Paladin', 'Ranger'],
    'Sense the presence and location of poisons, poisonous creatures, and diseases within 30 feet.',
    `For the duration, you can sense the presence and location of poisons, poisonous creatures, and diseases within 30 feet of you. You also identify the kind of poison, poisonous creature, or disease in each case. The spell can penetrate most barriers, but is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.`
  ],
  [
    'Disguise Self', 1, 'Illusion', '1 action', 'Self', 'V, S', '1 hour', false, false,
    ['Artificer', 'Bard', 'Sorcerer', 'Wizard'],
    'Change your apparent height, build, and clothing with an illusion for 1 hour.',
    `You make yourself—including your clothing, armor, weapons, and other belongings on your person—look different until the spell ends or until you use your action to dismiss it. You can seem 1 foot shorter or taller and can appear thin, fat, or in between. The changes fail to hold up to physical inspection, and a creature can use its action to inspect your appearance with an Intelligence (Investigation) check against your spell save DC.`
  ],
  [
    'Divine Favor', 1, 'Evocation', '1 bonus action', 'Self', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Paladin'],
    'Your weapon strikes deal an extra 1d4 radiant damage on a hit for the duration.',
    `Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.`
  ],
  [
    'Entangle', 1, 'Conjuration', '1 action', '90 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Druid'],
    'Grasping weeds and vines sprout in a 20-foot square, turning it into difficult terrain and restraining creatures.',
    `Grasping weeds and vines sprout from the ground in a 20-foot square starting from a point within range. For the duration, these plants turn the ground in the area into difficult terrain. A creature in the area when you cast the spell must succeed on a Strength saving throw or be restrained by the entangling plants until the spell ends. A creature restrained by the plants can use its action to make a Strength check against your spell save DC, freeing itself on a success.`
  ],
  [
    'Expeditious Retreat', 1, 'Transmutation', '1 bonus action', 'Self', 'V, S', 'Concentration, up to 10 minutes', false, true,
    ['Artificer', 'Sorcerer', 'Tamer', 'Warlock', 'Wizard'],
    'Take the Dash action immediately and as a bonus action on each of your turns for up to 10 minutes.',
    `This spell allows you to move at an incredible pace. When you cast this spell, and then as a bonus action on each of your turns until the spell ends, you can take the Dash action.`
  ],
  [
    'False Life', 1, 'Necromancy', '1 action', 'Self', 'V, S, M (a small amount of alcohol or distilled spirits)', '1 hour', false, false,
    ['Artificer', 'Sorcerer', 'Tamer', 'Thanatomancer', 'Wizard'],
    'Gain 1d4 + 4 temporary hit points for 1 hour.',
    `Bolstering yourself with a necromantic facsimile of life, you gain 1d4 + 4 temporary hit points for the duration.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you gain 5 additional temporary hit points for each slot level above 1st.`
  ],
  [
    'Feather Fall', 1, 'Transmutation', '1 reaction, which you take when you or a creature within 60 feet of you falls', '60 feet', 'V, M (a small feather or piece of down)', '1 minute', false, false,
    ['Artificer', 'Bard', 'Sorcerer', 'Tamer', 'Wizard'],
    'Slow the descent of up to five falling creatures to 60 feet per round, preventing falling damage.',
    `Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If the creature lands before the spell ends, it takes no falling damage and can land on its feet, and the spell ends for that creature.`
  ],
  [
    'Find Familiar', 1, 'Conjuration', '1 hour', '10 feet', 'V, S, M (10 gp worth of charcoal, incense, and herbs that must be consumed by fire in a brass brazier)', 'Instantaneous', true, false,
    ['Wizard'],
    'Gain the service of a spirit taking an animal form that acts independently, shares senses, and can deliver touch spells.',
    `You gain the service of a familiar, a spirit that takes an animal form you choose (such as a bat, cat, crab, frog, hawk, lizard, octopus, owl, poisonous snake, fish, rat, raven, sea horse, spider, or weasel). Your familiar acts independently of you, but it always obeys your commands. In combat, it rolls its own initiative and can't attack. When you cast a spell with a range of touch, your familiar can deliver the spell as if it had cast the spell.`
  ],
  [
    'Floating Disk', 1, 'Conjuration', '1 action', '30 feet', 'V, S, M (a drop of mercury)', '1 hour', true, false,
    ['Wizard'],
    'Create a floating 3-foot-diameter disk of force that follows you and carries up to 500 pounds.',
    `This spell creates a circular, horizontal plane of force, 3 feet in diameter and 1 inch thick, that floats 3 feet above the ground in an unoccupied space of your choice that you can see within range. The disk remains for the duration, and can hold up to 500 pounds. The disk is immobile while you are within 20 feet of it; if you move more than 20 feet away, it follows you so that it remains within 20 feet of you.`,
    ["Tenser's Floating Disk"]
  ],
  [
    'Fog Cloud', 1, 'Conjuration', '1 action', '120 feet', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Ranger', 'Sorcerer', 'Wizard'],
    'Create a 20-foot-radius sphere of heavily obscuring fog.',
    `You create a 20-foot-radius sphere of fog centered on a point within range. The sphere spreads around corners, and its area is heavily obscured. It lasts for the duration or until a wind of moderate or greater speed (at least 10 miles per hour) disperses it.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the radius of the fog increases by 20 feet for each slot level above 1st.`
  ],
  [
    'Goodberry', 1, 'Transmutation', '1 action', 'Touch', 'V, S, M (a sprig of mistletoe)', 'Instantaneous', false, false,
    ['Druid', 'Ranger'],
    'Conjure up to ten berries that restore 1 hit point each and provide nourishment for a day.',
    `Up to ten berries appear in your hand and are infused with magic for the duration. A creature can use its action to eat one berry. Eating a berry restores 1 hit point, and the berry provides enough nourishment to sustain a creature for one day. The berries lose their potency if they have not been consumed within 24 hours of the casting of this spell.`
  ],
  [
    'Healing Word', 1, 'Evocation', '1 bonus action', '60 feet', 'V', 'Instantaneous', false, false,
    ['Bard', 'Cleric', 'Druid', 'Tamer'],
    'As a bonus action, restore 1d4 + your spellcasting ability modifier hit points to a creature within 60 feet.',
    `A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d4 for each slot level above 1st.`
  ],
  [
    'Hellish Rebuke', 1, 'Evocation', '1 reaction, which you take in response to being damaged by a creature within 60 feet of you that you can see', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Warlock'],
    'As a reaction when damaged, surround your attacker in hellish flames for 2d10 fire damage on a failed Dexterity save.',
    `You point your finger, and the creature that damaged you is momentarily surrounded by hellish flames. The creature must make a Dexterity saving throw. It takes 2d10 fire damage on a failed save, or half as much damage on a successful one.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d10 for each slot level above 1st.`
  ],
  [
    'Heroism', 1, 'Enchantment', '1 action', 'Touch', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Paladin', 'Tamer'],
    'Imbue a willing creature with bravery: immunity to frightened and temporary hit points equal to your casting modifier each turn.',
    `A willing creature you touch is imbued with bravery. Until the spell ends, the creature is immune to being frightened and gains temporary hit points equal to your spellcasting ability modifier at the start of each of its turns. When the spell ends, the target loses any remaining temporary hit points from this spell.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.`
  ],
  [
    'Hideous Laughter', 1, 'Enchantment', '1 action', '30 feet', 'V, S, M (tiny tarts and a feather that is waved in the air)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Wizard'],
    'A creature perceives everything as hilariously funny, falling prone and incapacitated in fits of laughter.',
    `A creature of your choice that you can see within range perceives everything as hilariously funny and falls into fits of laughter if this spell affects it. The target must succeed on a Wisdom saving throw or fall prone, becoming incapacitated and unable to stand up for the duration. A creature with an Intelligence score of 4 or less isn't affected. At the end of each of its turns, and each time it takes damage, the target can make another Wisdom saving throw (with advantage if triggered by damage).`,
    ["Tasha's Hideous Laughter"]
  ],
  [
    "Hunter's Mark", 1, 'Divination', '1 bonus action', '90 feet', 'V', 'Concentration, up to 1 hour', false, true,
    ['Ranger'],
    'Mark a quarry to deal an extra 1d6 weapon damage and gain advantage on checks to find it.',
    `You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it. If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn of yours to mark a new creature.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd or 4th level, you can maintain your concentration on the spell for up to 8 hours. At 5th level or higher, up to 24 hours.`
  ],
  [
    'Identify', 1, 'Divination', '1 minute', 'Touch', 'V, S, M (a pearl worth at least 100 gp and an owl feather)', 'Instantaneous', true, false,
    ['Artificer', 'Bard', 'Tamer', 'Wizard'],
    'Learn the magical properties, attunement requirements, charges, and active spells on an object or creature.',
    `You choose one object that you must touch throughout the casting of the spell. If it is a magic item or some other magic-imbued object, you learn its properties and how to use them, whether it requires attunement to use, and how many charges it has, if any. You learn whether any spells are affecting the item and what they are. If you instead touch a creature throughout the casting, you learn what spells, if any, are currently affecting it.`
  ],
  [
    'Illusory Script', 1, 'Illusion', '1 minute', 'Touch', 'S, M (a lead-based ink worth at least 10 gp, which the spell consumes)', '10 days', true, false,
    ['Bard', 'Warlock', 'Wizard'],
    'Write a message that appears normal to intended recipients and unintelligible or different to others.',
    `You write on parchment, paper, or some other suitable writing material and imbue it with a potent illusion that lasts for the duration. To you and any creatures you designate when you cast the spell, the writing appears normal, written in your hand, and conveys whatever meaning you intended. To all others, the writing appears as if it were written in an unknown or magical script that is unintelligible, or a different message if you choose.`
  ],
  [
    'Jump', 1, 'Transmutation', '1 action', 'Touch', 'V, S, M (a grasshopper’s hind leg)', '1 minute', false, false,
    ['Artificer', 'Druid', 'Ranger', 'Sorcerer', 'Tamer', 'Wizard'],
    "Triple a touched creature's jump distance for 1 minute.",
    `You touch a creature. The creature's jump distance is tripled until the spell ends.`
  ],
  [
    'Longstrider', 1, 'Transmutation', '1 action', 'Touch', 'V, S, M (a pinch of dirt)', '1 hour', false, false,
    ['Artificer', 'Bard', 'Druid', 'Ranger', 'Tamer', 'Wizard'],
    "Increase a touched creature's speed by 10 feet for 1 hour.",
    `You touch a creature. The target's speed increases by 10 feet until the spell ends.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.`
  ],
  [
    'Mage Armor', 1, 'Abjuration', '1 action', 'Touch', 'V, S, M (a piece of cured leather)', '8 hours', false, false,
    ['Sorcerer', 'Wizard'],
    'Protective force surrounds an unarmored willing creature, setting its base AC to 13 + Dexterity modifier.',
    `You touch a willing creature who isn't wearing armor, and a protective magical force surrounds it until the spell ends. The target's base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.`
  ],
  [
    'Magic Missile', 1, 'Evocation', '1 action', '120 feet', 'V, S', 'Instantaneous', false, false,
    ['Sorcerer', 'Wizard'],
    'Create three glowing darts of force that automatically strike targets for 1d4 + 1 force damage each.',
    `You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.`
  ],
  [
    'Protection from Evil and Good', 1, 'Abjuration', '1 action', 'Touch', 'V, S, M (holy water or powdered silver and iron, which the spell consumes)', 'Concentration, up to 10 minutes', false, true,
    ['Cleric', 'Paladin', 'Tamer', 'Warlock', 'Wizard'],
    'Protect a creature against aberrations, celestials, elementals, fey, fiends, and undead (disadvantage on attacks and immunity to charm/frighten/possession).',
    `Until the spell ends, one willing creature you touch is protected against certain types of creatures: aberrations, celestials, elementals, fey, fiends, and undead. Creatures of those types have disadvantage on attack rolls against the target. The target also can't be charmed, frightened, or possessed by them. If the target is already charmed, frightened, or possessed by such a creature, the target has advantage on any new saving throw against the relevant effect.`
  ],
  [
    'Purify Food and Drink', 1, 'Transmutation', '1 action', '10 feet', 'V, S', 'Instantaneous', true, false,
    ['Artificer', 'Cleric', 'Druid', 'Paladin', 'Tamer'],
    'Render all nonmagical food and drink within a 5-foot-radius sphere free of poison and disease.',
    `All nonmagical food and drink within a 5-foot-radius sphere centered on a point of your choice within range is purified and rendered free of poison and disease.`
  ],
  [
    'Ray of Sickness', 1, 'Necromancy', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Sorcerer', 'Thanatomancer', 'Wizard'],
    'A ray of sickening greenish energy deals 2d8 poison damage on a hit and can poison the target.',
    `A ray of sickening greenish energy lashes out toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 poison damage and must make a Constitution saving throw. On a failed save, it is also poisoned until the end of your next turn.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.`
  ],
  [
    'Sanctuary', 1, 'Abjuration', '1 bonus action', '30 feet', 'V, S, M (a small silver mirror)', '1 minute', false, false,
    ['Artificer', 'Cleric', 'Tamer'],
    'Ward a creature so attackers must pass a Wisdom save or choose a new target or lose the attack.',
    `You ward a creature within range against attack. Until the spell ends, any creature who targets the warded creature with an attack or a harmful spell must first make a Wisdom saving throw. On a failed save, the creature must choose a new target or lose the attack or spell. This spell doesn't protect the warded creature from area effects. If the warded creature makes an attack, casts a spell that affects an enemy, or deals damage to another creature, this spell ends.`
  ],
  [
    'Shield', 1, 'Abjuration', '1 reaction, which you take when you are hit by an attack or targeted by the magic missile spell', 'Self', 'V, S', '1 round', false, false,
    ['Sorcerer', 'Wizard'],
    'As a reaction, gain +5 AC until the start of your next turn and take no damage from magic missile.',
    `An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.`
  ],
  [
    'Shield of Faith', 1, 'Abjuration', '1 bonus action', '60 feet', 'V, S, M (a small parchment with a bit of holy text written on it)', 'Concentration, up to 10 minutes', false, true,
    ['Cleric', 'Paladin', 'Tamer'],
    'A shimmering field surrounds a creature within range, granting a +2 bonus to AC.',
    `A shimmering field appears and surrounds a creature of your choice within range, granting it a +2 bonus to AC for the duration.`
  ],
  [
    'Silent Image', 1, 'Illusion', '1 action', '60 feet', 'V, S, M (a bit of fleece)', 'Concentration, up to 10 minutes', false, true,
    ['Bard', 'Sorcerer', 'Tamer', 'Wizard'],
    'Create the visual illusion of an object, creature, or phenomenon no larger than a 15-foot cube.',
    `You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 15-foot cube. The image appears at a spot within range and lasts for the duration. The image is purely visual; it isn't accompanied by sound, smell, or other sensory effects. You can use your action to cause the image to move. A creature can use its action to examine the image with an Intelligence (Investigation) check against your spell save DC.`
  ],
  [
    'Speak with Animals', 1, 'Divination', '1 action', 'Self', 'V, S', '10 minutes', true, false,
    ['Bard', 'Druid', 'Ranger', 'Tamer'],
    'Comprehend and verbally communicate with beasts for 10 minutes.',
    `You gain the ability to comprehend and verbally communicate with beasts for the duration. The knowledge and awareness of many beasts is limited by their intelligence, but at minimum, beasts can give you information about nearby locations and monsters, including whatever they can perceive or have perceived within the past day.`
  ],
  [
    'Thunderwave', 1, 'Evocation', '1 action', 'Self (15-foot cube)', 'V, S', 'Instantaneous', false, false,
    ['Bard', 'Druid', 'Sorcerer', 'Wizard'],
    'A wave of thunderous force deals 2d8 thunder damage and pushes creatures 10 feet away.',
    `A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn't pushed. The spell emits a thunderous boom audible out to 300 feet.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.`
  ],
  [
    'Unseen Servant', 1, 'Conjuration', '1 action', '60 feet', 'V, S, M (a piece of string and a bit of wood)', '1 hour', true, false,
    ['Bard', 'Warlock', 'Wizard'],
    'Create an invisible, mindless, shapeless force that performs simple tasks at your command.',
    `This spell creates an invisible, mindless, shapeless, Medium force that performs simple tasks at your command until the spell ends. The servant springs into existence in an unoccupied space on the ground within range. It has AC 10, 1 hit point, and a Strength of 2, and it can't attack. Once on each of your turns as a bonus action, you can mentally command the servant to move up to 15 feet and interact with an object.`
  ],

  // ================= 2ND LEVEL =================
  [
    'Acid Arrow', 2, 'Evocation', '1 action', '90 feet', 'V, S, M (powdered rhubarb leaf and an adder’s stomach)', 'Instantaneous', false, false,
    ['Wizard'],
    'A shimmering green arrow streaks toward a target for 4d4 acid damage immediately and 2d4 at the end of its next turn.',
    `A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 acid damage immediately and 2d4 acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage and no damage at the end of its next turn.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the damage (both initial and later) increases by 1d4 for each slot level above 2nd.`,
    ["Melf's Acid Arrow"]
  ],
  [
    'Aid', 2, 'Abjuration', '1 action', '30 feet', 'V, S, M (a tiny strip of white cloth)', '8 hours', false, false,
    ['Artificer', 'Cleric', 'Paladin', 'Tamer'],
    'Bolster up to three creatures, increasing their hit point maximum and current hit points by 5 for 8 hours.',
    `Your spell bolsters your allies with toughness and resolve. Choose up to three creatures within range. Each target's hit point maximum and current hit points increase by 5 for the duration.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, a target's hit points increase by an additional 5 for each slot level above 2nd.`
  ],
  [
    'Alter Self', 2, 'Transmutation', '1 action', 'Self', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Sorcerer', 'Tamer', 'Wizard'],
    'Assume a different form for aquatic adaptation, changed appearance, or magical +1 natural weapons.',
    `You assume a different form. When you cast the spell, choose one of the following options, the effects of which last for the duration of the spell. While the spell lasts, you can end one option as an action to gain the benefits of a different one:\n\n- **Aquatic Adaptation.** You sprout gills and webbing, allowing you to breathe underwater and gain a swimming speed equal to your walking speed.\n- **Change Appearance.** You transform your appearance, including height, weight, facial features, voice, hair, and race.\n- **Natural Weapons.** You grow claws, fangs, spines, horns, or a different natural weapon that deals 1d6 damage, counts as magical, and has a +1 bonus to attack and damage rolls.`
  ],
  [
    'Animal Messenger', 2, 'Enchantment', '1 action', '30 feet', 'V, S, M (a morsel of food)', '24 hours', true, false,
    ['Bard', 'Druid', 'Ranger', 'Tamer'],
    'Use a Tiny beast to deliver a spoken message up to 25 words to a described recipient at a familiar location.',
    `By means of this spell, you use an animal to deliver a message. Choose a Tiny beast you can see within range, such as a squirrel, a blue jay, or a bat. You specify a location, which you must have visited, and a recipient who matches a general description. You also speak a message of up to twenty-five words. The target beast travels for the duration toward the specified location and speaks your message upon arrival.`
  ],
  [
    'Arcane Lock', 2, 'Abjuration', '1 action', 'Touch', 'V, S, M (gold dust worth at least 25 gp, which the spell consumes)', 'Until dispelled', false, false,
    ['Artificer', 'Wizard'],
    'Magically lock a closed door, window, gate, chest, or entryway, raising the DC to break or pick it by 10.',
    `You touch a closed door, window, gate, chest, or other entryway, and it becomes locked for the duration. You and the creatures you designate when you cast this spell can open the object normally. You can also set a password that, when spoken within 5 feet of the object, suppresses this spell for 1 minute. While affected by this spell, the object is more difficult to break or force open; the DC to break it or pick any locks on it increases by 10.`
  ],
  [
    'Augury', 2, 'Divination', '1 minute', 'Self', 'V, S, M (specially marked sticks, bones, or similar tokens worth at least 25 gp)', 'Instantaneous', true, false,
    ['Cleric'],
    'Receive an omen (Weal, Woe, Weal and Woe, or Nothing) about a specific course of action within the next 30 minutes.',
    `By casting gem-inlaid sticks, rolling dragon bones, laying out ornate cards, or employing some other divining tool, you receive an omen from an otherworldly entity about the results of a specific course of action that you plan to take within the next 30 minutes. The GM chooses from Weal, Woe, Weal and Woe, or Nothing.`
  ],
  [
    'Barkskin', 2, 'Transmutation', '1 action', 'Touch', 'V, S, M (a handful of oak bark)', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Ranger', 'Tamer'],
    "A willing creature's skin takes a bark-like appearance so its AC cannot be less than 16.",
    `You touch a willing creature. Until the spell ends, the target's skin has a rough, bark-like appearance, and the target's AC can't be less than 16, regardless of what kind of armor it is wearing.`
  ],
  [
    'Blur', 2, 'Illusion', '1 action', 'Self', 'V', 'Concentration, up to 1 minute', false, true,
    ['Artificer', 'Sorcerer', 'Tamer', 'Wizard'],
    'Your body becomes blurred, shifting and wavering so attackers have disadvantage on attack rolls against you.',
    `Your body becomes blurred, shifting and wavering to all who can see you. For the duration, any creature has disadvantage on attack rolls against you. An attacker is immune to this effect if it doesn't rely on sight, as with blindsight, or can see through illusions, as with truesight.`
  ],
  [
    'Calm Emotions', 2, 'Enchantment', '1 action', '60 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Cleric', 'Tamer'],
    'Suppress strong emotions in a 20-foot-radius sphere, suppressing charmed/frightened or rendering creatures indifferent.',
    `You attempt to suppress strong emotions in a group of people. Each humanoid in a 20-foot-radius sphere centered on a point you choose within range must make a Charisma saving throw; a creature can choose to fail this saving throw if it wishes. On a failed save, you can suppress any effect causing a target to be charmed or frightened, or make a target indifferent about creatures of your choice that it is hostile toward.`
  ],
  [
    'Darkness', 2, 'Evocation', '1 action', '60 feet', 'V, M (bat fur and a drop of pitch or piece of coal)', 'Concentration, up to 10 minutes', false, true,
    ['Sorcerer', 'Warlock', 'Wizard'],
    'Magical darkness spreads in a 15-foot-radius sphere that darkvision cannot see through.',
    `Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere for the duration. The darkness spreads around corners. A creature with darkvision can't see through this darkness, and nonmagical light can't illuminate it. If the point you choose is on an object you are holding or one that isn't being worn or carried, the darkness emanates from the object and moves with it. Completely covering the source blocks the darkness.`
  ],
  [
    'Darkvision', 2, 'Transmutation', '1 action', 'Touch', 'V, S, M (either a pinch of dried carrot or an agate)', '8 hours', false, false,
    ['Artificer', 'Druid', 'Ranger', 'Sorcerer', 'Tamer', 'Wizard'],
    'Grant a willing creature darkvision out to a range of 60 feet for 8 hours.',
    `You touch a willing creature to grant it the ability to see in the dark. For the duration, that creature has darkvision out to a range of 60 feet.`
  ],
  [
    'Enhance Ability', 2, 'Transmutation', '1 action', 'Touch', 'V, S, M (fur or a feather from a beast)', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Bard', 'Cleric', 'Druid', 'Sorcerer', 'Tamer'],
    'Grant a creature advantage on ability checks with one chosen ability (Bear’s Endurance, Bull’s Strength, Cat’s Grace, Eagle’s Splendor, Fox’s Cunning, or Owl’s Wisdom).',
    `You touch a creature and bestow upon it a magical enhancement. Choose one of the following effects; the target gains that effect until the spell ends: Bear's Endurance (advantage on Constitution checks, 2d6 temporary HP), Bull's Strength (advantage on Strength checks, double carrying capacity), Cat's Grace (advantage on Dexterity checks, no falling damage from 20 feet or less), Eagle's Splendor (advantage on Charisma checks), Fox's Cunning (advantage on Intelligence checks), or Owl's Wisdom (advantage on Wisdom checks).\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.`
  ],
  [
    'Enthrall', 2, 'Enchantment', '1 action', '60 feet', 'V, S', '1 minute', false, false,
    ['Bard', 'Warlock'],
    'Weave distracting words that cause creatures to fail Wisdom saves and have disadvantage on Perception checks made to notice others.',
    `You weave a distracting string of words, causing creatures of your choice that you can see within range and that can hear you to make a Wisdom saving throw. Any creature that can't be charmed succeeds on this saving throw automatically, and if you or your companions are fighting a creature, it has advantage on the save. On a failed save, the target has disadvantage on Wisdom (Perception) checks made to perceive any creature other than you until the spell ends or until the target can no longer hear you.`
  ],
  [
    'Find Traps', 2, 'Divination', '1 action', '120 feet', 'V, S', 'Instantaneous', false, false,
    ['Cleric', 'Druid', 'Ranger'],
    'Sense the presence of any trap within 120 feet that is within line of sight and learn the general nature of the danger.',
    `You sense the presence of any trap within range that is within line of sight. A trap, for the purpose of this spell, includes anything that would inflict a sudden or unexpected effect you consider harmful or undesirable, which was specifically intended as such by its creator. Thus, the spell would sense an area affected by the alarm spell, a glyph of warding, or a mechanical pit trap, but it would not reveal a natural weakness in the floor. This spell merely reveals that a trap is present; you don't learn its exact location, but you do learn the general nature of the danger posed by a trap you sense.`
  ],
  [
    'Flame Blade', 2, 'Evocation', '1 bonus action', 'Self', 'V, S, M (leaf of sumac)', 'Concentration, up to 10 minutes', false, true,
    ['Druid'],
    'Evoke a fiery scimitar-like blade in your hand for melee spell attacks dealing 3d6 fire damage.',
    `You evoke a fiery blade in your free hand. The blade is similar in size and shape to a scimitar, and it lasts for the duration. You can use your action to make a melee spell attack with the fiery blade. On a hit, the target takes 3d6 fire damage. The flaming blade sheds bright light in a 10-foot radius and dim light for an additional 10 feet.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for every two slot levels above 2nd.`
  ],
  [
    'Gentle Repose', 2, 'Necromancy', '1 action', 'Touch', 'V, S, M (a pinch of salt and one copper piece placed on each of the corpse’s eyes)', '10 days', true, false,
    ['Cleric', 'Thanatomancer', 'Wizard'],
    'Protect a corpse from decay and prevent it from becoming undead for 10 days, extending raise-dead time limits.',
    `You touch a corpse or other remains. For the duration, the target is protected from decay and can't become undead. The spell also effectively extends the time limit on raising the target from the dead, since days spent under the influence of this spell don't count against the time limit of spells such as raise dead.`
  ],
  [
    'Heat Metal', 2, 'Transmutation', '1 action', '60 feet', 'V, S, M (a piece of iron and a flame)', 'Concentration, up to 1 minute', false, true,
    ['Artificer', 'Bard', 'Druid'],
    'Cause a manufactured metal object to glow red-hot, dealing 2d8 fire damage and forcing creatures holding or wearing it to drop it or suffer disadvantage.',
    `Choose a manufactured metal object, such as a metal weapon or a suit of heavy or medium metal armor, that you can see within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes 2d8 fire damage when you cast the spell. Until the spell ends, you can use a bonus action on each of your subsequent turns to cause this damage again. If a creature is holding or wearing the object and takes the damage from it, the creature must succeed on a Constitution saving throw or drop the object if it can; if it doesn't drop it, it has disadvantage on attack rolls and ability checks until the start of your next turn.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for each slot level above 2nd.`
  ],
  [
    'Hold Person', 2, 'Enchantment', '1 action', '60 feet', 'V, S, M (a small, straight piece of iron)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'],
    'Choose a humanoid within range; it must succeed on a Wisdom saving throw or be paralyzed for the duration.',
    `Choose a humanoid that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration. At the end of each of its turns, the target can make another Wisdom saving throw. On a success, the spell ends on the target.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, you can target one additional humanoid for each slot level above 2nd.`
  ],
  [
    'Invisibility', 2, 'Illusion', '1 action', 'Touch', 'V, S, M (an eyelash encased in gum arabic)', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Bard', 'Sorcerer', 'Tamer', 'Warlock', 'Wizard'],
    'A creature you touch becomes invisible for up to 1 hour, or until it attacks or casts a spell.',
    `A creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target's person. The spell ends for a target that attacks or casts a spell.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, you can target one additional creature for each slot level above 2nd.`
  ],
  [
    'Knock', 2, 'Transmutation', '1 action', '60 feet', 'V', 'Instantaneous', false, false,
    ['Bard', 'Sorcerer', 'Wizard'],
    'Unlock a stuck, barred, or locked door, box, or chest (or suppress arcane lock for 10 minutes), emitting a loud knock.',
    `Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access. A target that is held shut by a mundane lock or that is stuck or barred becomes unlocked, unstuck, or unbarred. If you choose a target that is held shut with arcane lock, that spell is suppressed for 10 minutes. When you cast the spell, a loud knock, audible from as far away as 300 feet, emanates from the target object.`
  ],
  [
    'Lesser Restoration', 2, 'Abjuration', '1 action', 'Touch', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Tamer'],
    'Touch a creature to end one disease or one condition (blinded, deafened, paralyzed, or poisoned).',
    `You touch a creature and can end either one disease or one condition afflicting it. The condition can be blinded, deafened, paralyzed, or poisoned.`
  ],
  [
    'Levitate', 2, 'Transmutation', '1 action', '60 feet', 'V, S, M (either a small leather loop or a piece of golden wire bent into a cup shape with a long shank on one end)', 'Concentration, up to 10 minutes', false, true,
    ['Artificer', 'Sorcerer', 'Tamer', 'Wizard'],
    'Rise vertically up to 20 feet and remain suspended in the air; unwilling creatures get a Constitution save.',
    `One creature or loose object of your choice that you can see within range rises vertically, up to 20 feet, and remains suspended there for the duration. The spell can levitate a target that weighs up to 500 pounds. An unwilling creature that succeeds on a Constitution saving throw is unaffected. The target can move only by pushing or pulling against a fixed object or surface within reach (such as a wall or a ceiling). You can change the target's altitude by up to 20 feet in either direction on your turn.`
  ],
  [
    'Locate Animals or Plants', 2, 'Divination', '1 action', 'Self', 'V, S, M (a bit of fur from a bloodhound)', 'Instantaneous', true, false,
    ['Bard', 'Druid', 'Ranger', 'Tamer'],
    'Learn the direction and distance to the closest specific kind of beast or plant within 5 miles.',
    `Describe or name a specific kind of beast or plant. Concentrating on the voice of nature in your surroundings, you learn the direction and distance to the closest creature or plant of that kind within 5 miles, if any are present.`
  ],
  [
    'Locate Object', 2, 'Divination', '1 action', 'Self', 'V, S, M (a forked twig)', 'Concentration, up to 10 minutes', false, true,
    ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Tamer', 'Wizard'],
    'Sense the direction to a specific familiar object or the nearest object of a particular kind within 1,000 feet.',
    `Describe or name an object that is familiar to you. You sense the direction to the object's location, as long as that object is within 1,000 feet of you. If the object is in motion, you know the direction of its movement. Alternatively, the spell can locate the nearest object of a particular kind. This spell can't locate an object if any thickness of lead blocks a direct path between you and the object.`
  ],
  [
    'Magic Aura', 2, 'Illusion', '1 action', 'Touch', 'V, S, M (a small square of silk)', '24 hours', false, false,
    ['Wizard'],
    'Mask or falsify the magical aura and creature-type signature of an object or willing creature.',
    `You place an illusion on a creature or an object you touch so that divination spells reveal false information about it. The target can be a willing creature or an object that isn't being carried or worn by another creature. You can choose False Aura (make nonmagical seem magical, magical seem nonmagical, or change its school) or Mask (change how the target appears to spells and effects that detect creature types).`,
    ["Nystul's Magic Aura", "Arcanist's Magic Aura"]
  ],
  [
    'Magic Mouth', 2, 'Illusion', '1 minute', '30 feet', 'V, S, M (a small bit of honeycomb and jade dust worth at least 10 gp, which the spell consumes)', 'Until dispelled', true, false,
    ['Artificer', 'Bard', 'Wizard'],
    'Implant a spoken message of up to 25 words within an object that triggers when a specific condition is met.',
    `You implant a message within an object in range, a message that is uttered when a trigger condition is met. Choose an object that you can see and that isn't being worn or carried by another creature. Then speak the message, which must be 25 words or less, though it can be delivered over as long as 10 minutes. Finally, determine the circumstance that will trigger the spell to deliver your message.`
  ],
  [
    'Magic Weapon', 2, 'Transmutation', '1 bonus action', 'Touch', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Paladin', 'Ranger', 'Wizard'],
    'Touch a nonmagical weapon to turn it into a +1 magic weapon (+2 at 4th level, +3 at 6th level).',
    `You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the bonus increases to +2. When you use a spell slot of 6th level or higher, the bonus increases to +3.`
  ],
  [
    'Mirror Image', 2, 'Illusion', '1 action', 'Self', 'V, S', '1 minute', false, false,
    ['Bard', 'Sorcerer', 'Tamer', 'Warlock', 'Wizard'],
    'Create three illusory duplicates of yourself that may intercept incoming attacks.',
    `Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it's impossible to track which image is real. Each time a creature targets you with an attack during the spell's duration, roll a d20 to determine whether the attack instead targets one of your duplicates (AC 10 + your Dexterity modifier).`
  ],
  [
    'Moonbeam', 2, 'Evocation', '1 action', '120 feet', 'V, S, M (several seeds of any moonseed plant and a piece of opalescent feldspar)', 'Concentration, up to 1 minute', false, true,
    ['Druid'],
    'A 5-foot-radius, 40-foot-high cylinder of silvery light deals 2d10 radiant damage and forces shapechangers into their original form.',
    `A silvery beam of pale light shines down in a 5-foot-radius, 40-foot-high cylinder centered on a point within range. Until the spell ends, dim light fills the cylinder. When a creature enters the spell's area for the first time on a turn or starts its turn there, it is engulfed in ghostly flames and must make a Constitution saving throw, taking 2d10 radiant damage on a failed save, or half as much on a successful one. A shapechanger makes its saving throw with disadvantage and reverts to its original form on a failure. On each of your turns after you cast this spell, you can use an action to move the beam up to 60 feet.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d10 for each slot level above 2nd.`
  ],
  [
    'Pass without Trace', 2, 'Abjuration', '1 action', 'Self', 'V, S, M (ashes from a burned leaf of mistletoe and a sprig of spruce)', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Ranger', 'Tamer'],
    'Radiate a veil of shadows and silence, granting each chosen creature within 30 feet +10 to Stealth checks and leaving no tracks.',
    `A veil of shadows and silence radiates from you, masking you and your companions from detection. For the duration, each creature you choose within 30 feet of you (including you) has a +10 bonus to Dexterity (Stealth) checks and can't be tracked except by magical means. A creature that receives this bonus leaves behind no tracks or other traces of its passage.`
  ],
  [
    'Protection from Poison', 2, 'Abjuration', '1 action', 'Touch', 'V, S', '1 hour', false, false,
    ['Artificer', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Tamer'],
    'Neutralize one poison affecting a creature and grant advantage on saves against poison plus resistance to poison damage.',
    `You touch a creature. If it is poisoned, you neutralize the poison. If more than one poison afflicts the target, you neutralize one poison that you know is present, or you neutralize one at random. For the duration, the target has advantage on saving throws against being poisoned, and it has resistance to poison damage.`
  ],
  [
    'Rope Trick', 2, 'Transmutation', '1 action', 'Touch', 'V, S, M (powdered corn extract and a twisted loop of parchment)', '1 hour', false, false,
    ['Artificer', 'Wizard'],
    'Cause a rope up to 60 feet long to rise into an invisible extradimensional space that holds up to eight creatures.',
    `You touch a length of rope that is up to 60 feet long. One end of the rope then rises into the air until the whole rope hangs perpendicular to the ground. At the upper end of the rope, an invisible entrance opens to an extradimensional space that lasts until the spell ends. The space can hold as many as eight Medium or smaller creatures. Attacks and spells can't cross through the entrance into or out of the extradimensional space.`
  ],
  [
    'See Invisibility', 2, 'Divination', '1 action', 'Self', 'V, S, M (a pinch of talc and a small sprinkling of powdered silver)', '1 hour', false, false,
    ['Artificer', 'Bard', 'Sorcerer', 'Tamer', 'Wizard'],
    'See invisible creatures and objects as if they were visible, and see into the Ethereal Plane.',
    `For the duration, you see invisible creatures and objects as if they were visible, and you can see into the Ethereal Plane. Ethereal creatures and objects appear ghostly and translucent.`
  ],
  [
    'Spider Climb', 2, 'Transmutation', '1 action', 'Touch', 'V, S, M (a drop of bitumen and a spider)', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Sorcerer', 'Tamer', 'Warlock', 'Wizard'],
    'Grant a willing creature a climbing speed equal to its walking speed and the ability to walk on walls and ceilings.',
    `Until the spell ends, one willing creature you touch gains the ability to move up, down, and across vertical surfaces and upside down along ceilings, while leaving its hands free. The target also gains a climbing speed equal to its walking speed.`
  ],
  [
    'Spike Growth', 2, 'Transmutation', '1 action', '150 feet', 'V, S, M (seven sharp thorns or seven small twigs, each sharpened to a point)', 'Concentration, up to 10 minutes', false, true,
    ['Druid', 'Ranger'],
    'Transform a 20-foot-radius circle into hard spikes that make difficult terrain and deal 2d4 piercing damage per 5 feet moved.',
    `The ground in a 20-foot radius centered on a point within range twists and sprouts hard spikes and thorns. The area becomes difficult terrain for the duration. When a creature moves into or within the area, it takes 2d4 piercing damage for every 5 feet it travels. The transformation of the ground is camouflaged to look natural.`
  ],
  [
    'Spiritual Weapon', 2, 'Evocation', '1 bonus action', '60 feet', 'V, S', '1 minute', false, false,
    ['Cleric'],
    'Create a floating spectral weapon that attacks on cast and as a bonus action for 1d8 + spellcasting modifier force damage.',
    `You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again. When you cast the spell, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes force damage equal to 1d8 + your spellcasting ability modifier. As a bonus action on your turn, you can move the weapon up to 20 feet and repeat the attack against a creature within 5 feet of it.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for every two slot levels above 2nd.`
  ],
  [
    'Suggestion', 2, 'Enchantment', '1 action', '30 feet', 'V, M (a snake’s tongue and either a bit of honeycomb or a drop of sweet oil)', 'Concentration, up to 8 hours', false, true,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Suggest a reasonable-sounding course of activity up to two sentences to a creature that can hear and understand you.',
    `You suggest a course of activity (limited to a sentence or two) and magically influence a creature you can see within range that can hear and understand you. Creatures that can't be charmed are immune to this effect. The suggestion must be worded in such a manner as to make the course of action sound reasonable. The target must make a Wisdom saving throw. On a failed save, it pursues the course of action you described to the best of its ability for up to 8 hours.`
  ],
  [
    'Web', 2, 'Conjuration', '1 action', '60 feet', 'V, S, M (a bit of spiderweb)', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Sorcerer', 'Wizard'],
    'Conjure sticky, flammable webs in a 20-foot cube that create difficult terrain and restrain creatures.',
    `You conjure a mass of thick, sticky webbing at a point of your choice within range. The webs fill a 20-foot cube from that point for the duration. The webs are difficult terrain and lightly obscure their area. Each creature that starts its turn in the webs or that enters them during its turn must make a Dexterity saving throw or become restrained. The webs are flammable; any 5-foot cube of webs exposed to fire burns away in 1 round, dealing 2d4 fire damage to any creature starting its turn in the fire.`
  ],

  // ================= 3RD LEVEL =================
  [
    'Animate Dead', 3, 'Necromancy', '1 minute', '10 feet', 'V, S, M (a drop of blood, a piece of flesh, and a pinch of bone dust)', 'Instantaneous', false, false,
    ['Cleric', 'Thanatomancer', 'Wizard'],
    'Raise a pile of bones as a skeleton or a humanoid corpse as a zombie under your mental command for 24 hours.',
    `This spell creates an undead servant. Choose a pile of bones or a corpse of a Medium or Small humanoid within range. Your spell imbues the target with a foul mimicry of life, raising it as an undead creature (a skeleton or a zombie). On each of your turns, you can use a bonus action to mentally command any creature you made with this spell if the creature is within 60 feet of you. The creature is under your control for 24 hours, after which it stops obeying unless you cast this spell on it again.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, you animate or reassert control over two additional undead creatures for each slot level above 3rd.`
  ],
  [
    'Blink', 3, 'Transmutation', '1 action', 'Self', 'V, S', '1 minute', false, false,
    ['Artificer', 'Sorcerer', 'Tamer', 'Wizard'],
    'Roll a d20 at the end of each of your turns; on 11 or higher, vanish into the Ethereal Plane until the start of your next turn.',
    `Roll a d20 at the end of each of your turns for the duration of the spell. On a roll of 11 or higher, you vanish from your current plane of existence and appear in the Ethereal Plane (the spell fails and the casting is wasted if you were already on that plane). At the start of your next turn, you return to an unoccupied space of your choice that you can see within 10 feet of the space you vanished from.`
  ],
  [
    'Call Lightning', 3, 'Conjuration', '1 action', '120 feet', 'V, S', 'Concentration, up to 10 minutes', false, true,
    ['Druid'],
    'Create a storm cloud and call down bolts of lightning each turn as an action, dealing 3d10 lightning damage in a 5-foot radius.',
    `A storm cloud appears in the shape of a cylinder that is 10 feet tall with a 60-foot radius, centered on a point you can see within range directly above you. When you cast the spell, choose a point you can see under the cloud. A bolt of lightning flashes down from the cloud to that point. Each creature within 5 feet of that point must make a Dexterity saving throw, taking 3d10 lightning damage on a failed save, or half as much on a success. On each of your turns until the spell ends, you can use your action to call down lightning in this way again. If you are outdoors in stormy conditions, the damage increases by 1d10.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d10 for each slot level above 3rd.`
  ],
  [
    'Conjure Animals', 3, 'Conjuration', '1 action', '60 feet', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Ranger'],
    'Summon fey spirits that take the forms of beasts (one CR 2, two CR 1, four CR 1/2, or eight CR 1/4) to obey your commands.',
    `You summon fey spirits that take the form of beasts and appear in unoccupied spaces that you can see within range. Choose one of the following options: one beast of challenge rating 2 or lower; two beasts of challenge rating 1 or lower; four beasts of challenge rating 1/2 or lower; or eight beasts of challenge rating 1/4 or lower. They are friendly to you and your companions and obey your verbal commands.\n\n**At Higher Levels.** When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 5th-level slot, three times as many with a 7th-level slot, and four times as many with a 9th-level slot.`
  ],
  [
    'Counterspell', 3, 'Abjuration', '1 reaction, which you take when you see a creature within 60 feet of you casting a spell', '60 feet', 'S', 'Instantaneous', false, false,
    ['Sorcerer', 'Warlock', 'Wizard'],
    'Interrupt a creature casting a spell; automatically fails 3rd-level or lower spells, or requires an ability check for higher spells.',
    `You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a success, the creature's spell fails and has no effect.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the interrupted spell has no effect if its level is less than or equal to the level of the spell slot you used.`
  ],
  [
    'Create Food and Water', 3, 'Conjuration', '1 action', '30 feet', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Cleric', 'Paladin', 'Tamer'],
    'Create 45 pounds of bland nourishing food and 30 gallons of water, enough to sustain fifteen humanoids or five steeds.',
    `You create 45 pounds of food and 30 gallons of water on the ground or in containers within range, enough to sustain up to fifteen humanoids or five steeds for 24 hours. The food is bland but nourishing, and spoils if uneaten after 24 hours. The water is clean and doesn't go bad.`
  ],
  [
    'Gaseous Form', 3, 'Transmutation', '1 action', 'Touch', 'V, S, M (a bit of gauze and a wisp of smoke)', 'Concentration, up to 1 hour', false, true,
    ['Sorcerer', 'Warlock', 'Wizard'],
    'Transform a willing creature and its gear into a misty cloud with a 10-foot flying speed and resistance to nonmagical damage.',
    `You transform a willing creature you touch, along with everything it's wearing and carrying, into a misty cloud for the duration. While in this form, the target's only method of movement is a flying speed of 10 feet, it can enter and occupy another creature's space, it has resistance to nonmagical damage, and it has advantage on Strength, Dexterity, and Constitution saving throws. It can pass through small holes and narrow openings, though it can't attack, cast spells, or manipulate objects.`
  ],
  [
    'Glyph of Warding', 3, 'Abjuration', '1 hour', 'Touch', 'V, S, M (incense and powdered diamond worth at least 200 gp, which the spell consumes)', 'Until dispelled or triggered', false, false,
    ['Artificer', 'Bard', 'Cleric', 'Wizard'],
    'Inscribe a nearly invisible glyph on a surface or closable object that triggers explosive runes (5d8 damage) or a stored spell.',
    `When you cast this spell, you inscribe a glyph that harms other creatures, either upon a surface (such as a table or a section of floor or wall) or within an object that can be closed (such as a book, a scroll, or a treasure chest) to conceal the glyph. You decide what triggers the glyph when you cast the spell. When triggered, it erupts as Explosive Runes (5d8 acid, cold, fire, lightning, or thunder damage in a 20-foot radius) or a Spell Glyph casting a prepared 3rd-level or lower spell.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage of an explosive runes glyph increases by 1d8 for each slot level above 3rd, and a spell glyph can store a spell of up to the same level.`
  ],
  [
    'Hypnotic Pattern', 3, 'Illusion', '1 action', '120 feet', 'S, M (a glowing stick of incense or a crystal vial filled with phosphorescent material)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Weave twisting colors in a 30-foot cube; creatures failing a Wisdom save are charmed, incapacitated, and speed 0.',
    `You create a twisting pattern of colors that weaves through the air inside a 30-foot cube within range. The pattern appears for a moment and vanishes. Each creature in the area who sees the pattern must make a Wisdom saving throw. On a failed save, the creature becomes charmed for the duration. While charmed by this spell, the creature is incapacitated and has a speed of 0. The spell ends for an affected creature if it takes any damage or if someone else uses an action to shake the creature out of its stupor.`
  ],
  [
    'Magic Circle', 3, 'Abjuration', '1 minute', '10 feet', 'V, S, M (holy water or powdered silver and iron worth at least 100 gp, which the spell consumes)', '1 hour', false, false,
    ['Cleric', 'Paladin', 'Warlock', 'Wizard'],
    'Create a 10-foot-radius, 20-foot-tall ward against celestials, elementals, fey, fiends, or undead (or invert it to trap them).',
    `You create a 10-foot-radius, 20-foot-tall cylinder of magical energy centered on a point on the ground that you can see within range. Choose one or more of the following types of creatures: celestials, elementals, fey, fiends, or undead. The circle affects a creature of the chosen type: it can't willingly enter the cylinder by nonmagical means, has disadvantage on attack rolls against targets inside, and targets inside can't be charmed, frightened, or possessed by it. You can reverse the circle to trap creatures inside instead.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the duration increases by 1 hour for each slot level above 3rd.`
  ],
  [
    'Major Image', 3, 'Illusion', '1 action', '120 feet', 'V, S, M (a bit of fleece)', 'Concentration, up to 10 minutes', false, true,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Create a full sensory illusion (sight, sound, smell, temperature) up to a 20-foot cube.',
    `You create the image of an object, a creature, or some other visible phenomenon that is no larger than a 20-foot cube. It appears at a spot that you can see within range and lasts for the duration. It seems completely real, including sounds, smells, and temperature appropriate to the thing depicted.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the spell lasts until dispelled, without requiring your concentration.`
  ],
  [
    'Meld into Stone', 3, 'Transmutation', '1 action', 'Touch', 'V, S', '8 hours', true, false,
    ['Cleric', 'Druid'],
    'Step into a stone object or surface large enough to contain you, remaining hidden for up to 8 hours.',
    `You step into a stone object or surface large enough to fully contain your body, melding yourself and all the equipment you carry with the stone for the duration. While merged with the stone, you can't see what occurs outside it, and any Wisdom (Perception) checks you make to hear sounds outside it are made with disadvantage. You remain aware of the passage of time and can cast spells on yourself while merged in the stone.`
  ],
  [
    'Phantom Steed', 3, 'Illusion', '1 minute', '30 feet', 'V, S', '1 hour', true, false,
    ['Wizard'],
    'Create a quasi-real horselike creature with a 100-foot speed that you or a designated creature can ride.',
    `A Large quasi-real, horselike creature appears on the ground in an unoccupied space of your choice within range. You decide the creature's appearance, but it is equipped with a saddle, bit, and bridle. For the duration, you or a creature you choose can ride the steed. The creature uses the statistics for a riding horse, except it has a speed of 100 feet and can travel 10 miles in an hour, or 13 miles at a fast pace. When the spell ends, the steed gradually fades, giving the rider 1 minute to dismount.`
  ],
  [
    'Plant Growth', 3, 'Transmutation', '1 action or 8 hours', '150 feet', 'V, S', 'Instantaneous', false, false,
    ['Bard', 'Druid', 'Ranger'],
    'Overgrow plants in a 100-foot radius to cost 4 feet of movement per foot, or enrich land over 8 hours to double crop yields for a year.',
    `This spell channels vitality into plants within a specific area. There are two possible uses for the spell, granting either immediate or long-term benefits. If you cast this spell using 1 action, choose a point within range; all normal plants in a 100-foot radius become thick and overgrown (4 feet of movement per 1 foot moved). If you cast this spell over 8 hours, you enrich the land in a half-mile radius for 1 year, yielding twice the normal amount of food when harvested.`
  ],
  [
    'Protection from Energy', 3, 'Abjuration', '1 action', 'Touch', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Cleric', 'Druid', 'Ranger', 'Sorcerer', 'Tamer', 'Wizard'],
    'Grant a willing creature resistance to acid, cold, fire, lightning, or thunder damage for up to 1 hour.',
    `For the duration, the willing creature you touch has resistance to one damage type of your choice: acid, cold, fire, lightning, or thunder.`
  ],
  [
    'Remove Curse', 3, 'Abjuration', '1 action', 'Touch', 'V, S', 'Instantaneous', false, false,
    ['Cleric', 'Paladin', 'Tamer', 'Warlock', 'Wizard'],
    'End all curses affecting one creature or break attunement to a cursed magic item.',
    `At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner's attunement to the object so it can be removed or discarded.`
  ],
  [
    'Sending', 3, 'Evocation', '1 action', 'Unlimited', 'V, S, M (a short piece of fine copper wire)', '1 round', false, false,
    ['Bard', 'Cleric', 'Wizard'],
    'Send a 25-word message across any distance or plane to a familiar creature, which can immediately reply.',
    `You send a short message of twenty-five words or less to a creature with which you are familiar. The creature hears the message in its mind, recognizes you as the sender if it knows you, and can answer in a like manner immediately. You can send the message across any distance and even to other planes of existence, though interplanar sending has a 5 percent chance of failing.`
  ],
  [
    'Sleet Storm', 3, 'Conjuration', '1 action', '150 feet', 'V, S, M (a pinch of dust and a few drops of water)', 'Concentration, up to 1 minute', false, true,
    ['Druid', 'Sorcerer', 'Wizard'],
    'Freezing rain and sleet fill a 40-foot-radius cylinder, obscuring sight, extinguishing flames, knocking prone, and breaking concentration.',
    `Until the spell ends, freezing rain and sleet fall in a 20-foot-tall cylinder with a 40-foot radius centered on a point you choose within range. The area is heavily obscured, and exposed flames in the area are doused. The ground in the area is covered with slick ice, making it difficult terrain. When a creature enters the spell's area for the first time on a turn or starts its turn there, it must make a Dexterity saving throw or fall prone, and concentrating casters must pass a Constitution save against your spell save DC or lose concentration.`
  ],
  [
    'Slow', 3, 'Transmutation', '1 action', '120 feet', 'V, S, M (a drop of molasses)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Sorcerer', 'Wizard'],
    'Alter time around up to six creatures in a 40-foot cube, halving speed, -2 AC/Dex saves, no reactions, and delaying spells.',
    `You alter time around up to six creatures of your choice in a 40-foot cube within range. Each target must succeed on a Wisdom saving throw or be affected by this spell for the duration. An affected target's speed is halved, it takes a -2 penalty to AC and Dexterity saving throws, and it can't use reactions. On its turn, it can use either an action or a bonus action, not both, and can't make more than one melee or ranged attack. If it attempts to cast a spell with a casting time of 1 action, roll a d20; on an 11 or higher, the spell doesn't take effect until the creature's next turn.`
  ],
  [
    'Speak with Dead', 3, 'Necromancy', '1 action', '10 feet', 'V, S, M (burning incense)', '10 minutes', false, false,
    ['Bard', 'Cleric', 'Thanatomancer', 'Wizard'],
    'Grant the semblance of life and intelligence to a corpse with a mouth, letting you ask up to five questions.',
    `You grant the semblance of life and intelligence to a corpse of your choice within range, allowing it to answer the questions you pose. The corpse must still have a mouth and can't be undead. The spell fails if the corpse was the target of this spell within the last 10 days. Until the spell ends, you can ask the corpse up to five questions. Answers are usually brief, cryptic, or repetitive, and the corpse is under no compulsion to offer a truthful answer if you are hostile to it.`
  ],
  [
    'Speak with Plants', 3, 'Transmutation', '1 action', 'Self (30-foot radius)', 'V, S', '10 minutes', false, false,
    ['Bard', 'Druid', 'Ranger'],
    'Imbue plants within 30 feet with limited sentience and animation to answer questions or clear difficult terrain.',
    `You imbue plants within 30 feet of you with limited sentience and animation, giving them the ability to communicate with you and follow your simple commands. You can question plants about events in the spell's area within the past day, and you can also turn difficult terrain caused by plant growth into ordinary terrain or vice versa.`
  ],
  [
    'Stinking Cloud', 3, 'Conjuration', '1 action', '90 feet', 'V, S, M (a rotten egg or several skunk cabbage leaves)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Sorcerer', 'Wizard'],
    'Create a 20-foot-radius sphere of nauseating yellow gas that heavily obscures and causes creatures to waste their action.',
    `You create a 20-foot-radius sphere of yellow, nauseating gas centered on a point within range. The cloud spreads around corners, and its area is heavily obscured. The cloud lingers in the air for the duration. Each creature that is completely within the cloud at the start of its turn must make a Constitution saving throw against poison. On a failed save, the creature spends its action that turn retching and reeling.`
  ],
  [
    'Tiny Hut', 3, 'Evocation', '1 minute', 'Self (10-foot-radius hemisphere)', 'V, S, M (a small crystal bead)', '8 hours', true, false,
    ['Bard', 'Wizard'],
    'Create a 10-foot-radius immobile dome of force that shelters up to nine Medium or smaller creatures from weather, attacks, and spells.',
    `A 10-foot-radius immobile dome of force springs into existence around and above you and remains stationary for the duration. The spell ends if you leave its area. Nine creatures of Medium size or smaller can fit inside the dome with you. Creatures and objects within the dome when you cast this spell can move through it freely; all other creatures and objects are barred from passing through it, and spells and other magical effects can't extend through the dome or be cast through it.`,
    ["Leomund's Tiny Hut"]
  ],
  [
    'Tongues', 3, 'Divination', '1 action', 'Touch', 'V, M (a small clay model of a ziggurat)', '1 hour', false, false,
    ['Bard', 'Cleric', 'Sorcerer', 'Tamer', 'Warlock', 'Wizard'],
    'Touch a creature so it understands any spoken language and is understood by any creature that knows at least one language.',
    `This spell grants the creature you touch the ability to understand any spoken language it hears. Moreover, when the target speaks, any creature that knows at least one language and can hear the target understands what it says.`
  ],
  [
    'Vampiric Touch', 3, 'Necromancy', '1 action', 'Self', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Sorcerer', 'Thanatomancer', 'Warlock', 'Wizard'],
    'Make a melee spell attack each turn for 3d6 necrotic damage, regaining hit points equal to half the necrotic damage dealt.',
    `The touch of your shadow-wreathed hand can siphon life force from others to heal your wounds. Make a melee spell attack against a creature within your reach. On a hit, the target takes 3d6 necrotic damage, and you regain hit points equal to half the amount of necrotic damage dealt. Until the spell ends, you can make the attack again on each of your turns as an action.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.`
  ],
  [
    'Water Breathing', 3, 'Transmutation', '1 action', '30 feet', 'V, S, M (a short reed or piece of straw)', '24 hours', true, false,
    ['Artificer', 'Druid', 'Ranger', 'Sorcerer', 'Tamer', 'Wizard'],
    'Grant up to ten willing creatures within 30 feet the ability to breathe underwater for 24 hours.',
    `This spell grants up to ten willing creatures you can see within range the ability to breathe underwater until the spell ends. Affected creatures also retain their normal mode of respiration.`
  ],
  [
    'Water Walk', 3, 'Transmutation', '1 action', '30 feet', 'V, S, M (a piece of cork)', '1 hour', true, false,
    ['Artificer', 'Cleric', 'Druid', 'Ranger', 'Sorcerer', 'Tamer'],
    'Allow up to ten willing creatures to move across any liquid surface as if it were harmless solid ground.',
    `This spell grants the ability to move across any liquid surface—such as water, acid, mud, snow, quicksand, or lava—as if it were harmless solid ground (creatures can still take damage from the heat of lava). Up to ten willing creatures you can see within range gain this ability for the duration.`
  ],
  [
    'Wind Wall', 3, 'Evocation', '1 action', '120 feet', 'V, S, M (a tiny fan and a feather of exotic origin)', 'Concentration, up to 1 minute', false, true,
    ['Druid', 'Ranger'],
    'Raise a 50-foot-long, 15-foot-high wall of strong wind that deals 3d8 bludgeoning damage, disperses gases, and blocks arrows.',
    `A wall of strong wind rises from the ground at a point you choose within range. You can make the wall up to 50 feet long, 15 feet high, and 1 foot thick, shaped along any continuous path. When the wall appears, each creature within its area must make a Strength saving throw, taking 3d8 bludgeoning damage on a failed save, or half as much on a success. The strong wind keeps fog, smoke, and other gases at bay, and arrows, bolts, and other ordinary projectiles launched at targets behind the wall are deflected upward and automatically miss.`
  ],

  // ================= 4TH LEVEL =================
  [
    'Arcane Eye', 4, 'Divination', '1 action', '30 feet', 'V, S, M (a bit of bat fur)', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Wizard'],
    'Create an invisible floating magical eye with 30-foot darkvision that moves up to 30 feet per turn and sends you visual information.',
    `You create an invisible, magical eye within range that hovers in the air for the duration. You mentally receive visual information from the eye, which has normal vision and darkvision out to 30 feet. The eye can look in every direction. As an action, you can move the eye up to 30 feet in any direction.`
  ],
  [
    'Black Tentacles', 4, 'Conjuration', '1 action', '90 feet', 'V, S, M (a piece of tentacle from a giant octopus or a giant squid)', 'Concentration, up to 1 minute', false, true,
    ['Wizard'],
    'Squirming ebony tentacles fill a 20-foot square, creating difficult terrain, restraining creatures, and dealing 3d6 bludgeoning damage.',
    `Squirming, ebony tentacles fill a 20-foot square on ground that you can see within range. For the duration, these tentacles turn the ground in the area into difficult terrain. When a creature enters the affected area for the first time on a turn or starts its turn there, the creature must succeed on a Dexterity saving throw or take 3d6 bludgeoning damage and be restrained by the tentacles until the spell ends. A creature that starts its turn in the area and is already restrained by the tentacles takes 3d6 bludgeoning damage.`,
    ["Evard's Black Tentacles"]
  ],
  [
    'Compulsion', 4, 'Enchantment', '1 action', '30 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Bard'],
    'Force creatures within 30 feet that can hear you to use all their movement to travel in a direction you choose each turn.',
    `Creatures of your choice that you can see within range and that can hear you must make a Wisdom saving throw. A target automatically succeeds on this saving throw if it can't be charmed. On a failed save, a target is affected by this spell. Until the spell ends, you can use a bonus action on each of your turns to designate a direction that is horizontal to you; each affected target must use as much of its movement as possible to move in that direction on its next turn.`
  ],
  [
    'Confusion', 4, 'Enchantment', '1 action', '90 feet', 'V, S, M (three nut shells)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Druid', 'Sorcerer', 'Wizard'],
    'Assault the minds of creatures in a 10-foot-radius sphere, causing erratic random behavior each turn.',
    `This spell assaults and twists creatures' minds, spawning delusions and provoking uncontrolled action. Each creature in a 10-foot-radius sphere centered on a point you choose within range must succeed on a Wisdom saving throw when you cast this spell or be affected by it. An affected target can't take reactions and must roll a d10 at the start of each of its turns to determine its behavior for that turn. At the end of each of its turns, an affected target can make a Wisdom saving throw to end the effect.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, the radius of the sphere increases by 5 feet for each slot level above 4th.`
  ],
  [
    'Conjure Minor Elementals', 4, 'Conjuration', '1 minute', '90 feet', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Wizard'],
    'Summon elementals (one CR 2, two CR 1, four CR 1/2, or eight CR 1/4) that obey your verbal commands.',
    `You summon elementals that appear in unoccupied spaces that you can see within range. You choose one of the following options: one elemental of challenge rating 2 or lower; two elementals of challenge rating 1 or lower; four elementals of challenge rating 1/2 or lower; or eight elementals of challenge rating 1/4 or lower.\n\n**At Higher Levels.** When you cast this spell using certain higher-level spell slots, you choose one of the summoning options above, and more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot.`
  ],
  [
    'Conjure Woodland Beings', 4, 'Conjuration', '1 action', '60 feet', 'V, S, M (one holly berry per creature summoned)', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Ranger'],
    'Summon fey creatures (one CR 2, two CR 1, four CR 1/2, or eight CR 1/4) that obey your verbal commands.',
    `You summon fey creatures that appear in unoccupied spaces that you can see within range. Choose one of the following options: one fey creature of challenge rating 2 or lower; two fey creatures of challenge rating 1 or lower; four fey creatures of challenge rating 1/2 or lower; or eight fey creatures of challenge rating 1/4 or lower.\n\n**At Higher Levels.** When you cast this spell using certain higher-level spell slots, more creatures appear: twice as many with a 6th-level slot and three times as many with an 8th-level slot.`
  ],
  [
    'Dimension Door', 4, 'Conjuration', '1 action', '500 feet', 'V', 'Instantaneous', false, false,
    ['Bard', 'Sorcerer', 'Tamer', 'Warlock', 'Wizard'],
    'Teleport yourself and up to one willing creature of your size or smaller up to 500 feet to any spot you can visualize or describe.',
    `You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction. You can bring along objects as long as their weight doesn't exceed what you can carry, plus one willing creature of your size or smaller who is within 5 feet of you.`
  ],
  [
    'Divination', 4, 'Divination', '1 action', 'Self', 'V, S, M (incense and a sacrificial offering appropriate to your religion, together worth at least 25 gp, which the spell consumes)', 'Instantaneous', true, false,
    ['Cleric', 'Druid', 'Wizard'],
    'Ask your deity or its servants a single question concerning a specific goal, event, or activity to occur within 7 days.',
    `Your magic and an offering put you in contact with a god or a god's servants. You ask a single question concerning a specific goal, event, or activity to occur within 7 days. The GM offers a truthful reply. The reply might be a short phrase, a cryptic rhyme, or an omen.`
  ],
  [
    'Dominate Beast', 4, 'Enchantment', '1 action', '60 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Druid', 'Sorcerer', 'Tamer'],
    'Attempt to beguile a beast within 60 feet, establishing a telepathic link and issuing commands.',
    `You attempt to beguile a beast that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw. While the beast is charmed, you have a telepathic link with it and can issue commands to it (no action required), or take total and precise control using your action.\n\n**At Higher Levels.** When you cast this spell using a 5th-level spell slot, the duration is concentration, up to 10 minutes (1 hour at 6th, 8 hours at 7th or higher).`
  ],
  [
    'Fabricate', 4, 'Transmutation', '10 minutes', '120 feet', 'V, S', 'Instantaneous', false, false,
    ['Artificer', 'Wizard'],
    'Convert raw materials into finished products of the same material within a 10-foot cube (or 5-foot cube for metal/mineral).',
    `You convert raw materials into products of the same material. Choose raw materials that you can see within range. You can fabricate a Large or smaller object (contained within a 10-foot cube, or eight connected 5-foot cubes), given a sufficient quantity of raw material. If you are working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium. You can't use this spell to create magic items, and complex items require proficiency with the appropriate artisan's tools.`
  ],
  [
    'Faithful Hound', 4, 'Conjuration', '1 action', '30 feet', 'V, S, M (a tiny silver whistle, a piece of bone, and a thread)', '8 hours', false, false,
    ['Artificer', 'Wizard'],
    'Conjure an invisible phantom watchdog that barks at intruders within 30 feet and bites hostile creatures within 5 feet for 4d8 piercing damage.',
    `You conjure a phantom watchdog in an unoccupied space that you can see within range, where it remains for the duration, until you dismiss it as an action, or until you move more than 100 feet away from it. The hound is invisible to all creatures except you and can't be harmed. When a Small or larger creature comes within 30 feet of it without first speaking the password, the hound starts barking loudly. The hound sees invisible creatures and into the Ethereal Plane, and on your turns it bites an intruder within 5 feet (+your spell attack bonus) for 4d8 piercing damage.`,
    ["Mordenkainen's Faithful Hound"]
  ],
  [
    'Giant Insect', 4, 'Transmutation', '1 action', '30 feet', 'V, S', 'Concentration, up to 10 minutes', false, true,
    ['Druid'],
    'Transform up to ten centipedes, three spiders, five wasps, or one scorpion into giant versions under your command.',
    `You transform up to ten centipedes, three spiders, five wasps, or one scorpion within range into giant versions of their natural forms for the duration. Each creature obeys your verbal commands, and in combat, they act on your turn each round.`
  ],
  [
    'Hallucinatory Terrain', 4, 'Illusion', '10 minutes', '300 feet', 'V, S, M (a stone, a twig, and a bit of green plant)', '24 hours', false, false,
    ['Bard', 'Druid', 'Warlock', 'Wizard'],
    'Make natural terrain in a 150-foot cube look, sound, and smell like some other sort of natural terrain.',
    `You make natural terrain in a 150-foot cube in range look, sound, and smell like some other sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. Manufactured structures, equipment, and creatures within the area aren't changed in appearance. Tactile characteristics remain unchanged.`
  ],
  [
    'Ice Storm', 4, 'Evocation', '1 action', '300 feet', 'V, S, M (a pinch of dust and a few drops of water)', 'Instantaneous', false, false,
    ['Druid', 'Sorcerer', 'Wizard'],
    'Hail pounds a 20-foot-radius, 40-foot-high cylinder for 2d8 bludgeoning and 4d6 cold damage and creates difficult terrain.',
    `A hail of rock-hard ice pounds to the ground in a 20-foot-radius, 40-foot-high cylinder centered on a point within range. Each creature in the cylinder must make a Dexterity saving throw. A creature takes 2d8 bludgeoning damage and 4d6 cold damage on a failed save, or half as much damage on a successful one. Hailstones turn the storm's area of effect into difficult terrain until the end of your next turn.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, the bludgeoning damage increases by 1d8 for each slot level above 4th.`
  ],
  [
    'Phantasmal Killer', 4, 'Illusion', '1 action', '120 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Wizard'],
    'Manifest a creature’s deepest fears as an illusory nightmare that frightens it and deals 4d10 psychic damage each turn.',
    `You tap into the nightmares of a creature you can see within range and create an illusory manifestation of its deepest fears, visible only to that creature. The target must make a Wisdom saving throw. On a failed save, the target becomes frightened for the duration. At the end of each of the target's turns before the spell ends, the target must succeed on a Wisdom saving throw or take 4d10 psychic damage. On a successful save, the spell ends.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, the damage increases by 1d10 for each slot level above 4th.`
  ],
  [
    'Polymorph', 4, 'Transmutation', '1 action', '60 feet', 'V, S, M (a caterpillar cocoon)', 'Concentration, up to 1 hour', false, true,
    ['Bard', 'Druid', 'Sorcerer', 'Wizard'],
    'Transform a creature into a new beast form with CR up to its level or CR.',
    `This spell transforms a creature that you can see within range into a new form. An unwilling creature must make a Wisdom saving throw to avoid the effect. The spell has no effect on a shapechanger or a creature with 0 hit points. The transformation lasts for the duration, or until the target drops to 0 hit points or dies. The new form can be any beast whose challenge rating is equal to or less than the target's (or the target's level, if it doesn't have a challenge rating). The target's game statistics, including mental ability scores, are replaced by the statistics of the chosen beast, though it retains its alignment and personality.`
  ],
  [
    'Private Sanctum', 4, 'Abjuration', '10 minutes', '120 feet', 'V, S, M (a thin sheet of lead, a piece of opaque glass, a wad of cotton or cloth, and powdered chrysolite)', '24 hours', false, false,
    ['Artificer', 'Wizard'],
    'Make a cube up to 100 feet on a side magically secure against sound, darkvision, divination sensors, and teleportation.',
    `You make an area within range magically secure. The area is a cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration or until you use an action to dismiss it. You choose any combination of wards: sound cannot pass the barrier, the barrier appears dark and foggy, sensors created by divination spells cannot appear inside, creatures inside cannot be targeted by divination spells, and nothing can teleport into or out of the sanctum.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 5th level or higher, you can increase the size of the cube by 100 feet for each slot level above 4th.`,
    ["Mordenkainen's Private Sanctum"]
  ],
  [
    'Resilient Sphere', 4, 'Evocation', '1 action', '30 feet', 'V, S, M (a hemispherical piece of clear crystal and a matching hemispherical piece of gum arabic)', 'Concentration, up to 1 minute', false, true,
    ['Artificer', 'Tamer', 'Wizard'],
    'Enclose a Large or smaller creature or object in an impenetrable shimmering sphere of force.',
    `A sphere of shimmering force encloses a creature or object of Large size or smaller within range. An unwilling creature must make a Dexterity saving throw. On a failed save, the creature is enclosed for the duration. Nothing—not physical objects, energy, or other spell effects—can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature inside can use its action to push the sphere's walls, rolling it at half its speed.`,
    ["Otiluke's Resilient Sphere", "otiluke's-resilient-sphere"]
  ],
  [
    'Secret Chest', 4, 'Conjuration', '1 action', 'Touch', 'V, S, M (an exquisite chest, 3 feet by 2 feet by 2 feet, constructed from rare materials worth at least 5,000 gp, and a Tiny replica made from the same materials worth at least 50 gp)', 'Instantaneous', false, false,
    ['Artificer', 'Wizard'],
    'Hide an exquisite chest and its contents on the Ethereal Plane and recall it using a miniature replica.',
    `You hide a chest, and all its contents, on the Ethereal Plane. You must touch the chest and the miniature replica that serves as a material component for the spell. The chest can contain up to 12 cubic feet of nonliving material (3 feet by 2 feet by 2 feet). While the chest remains on the Ethereal Plane, you can use an action and touch the replica to recall the chest.`,
    ["Leomund's Secret Chest"]
  ],
  [
    'Stone Shape', 4, 'Transmutation', '1 action', 'Touch', 'V, S, M (soft clay, which must be worked into roughly the desired shape of the stone object)', 'Instantaneous', false, false,
    ['Artificer', 'Cleric', 'Druid', 'Wizard'],
    'Reshape a Medium or smaller stone object or section of stone no more than 5 feet in any dimension.',
    `You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape that suits your purpose. So, for example, you could shape a large rock into a weapon, idol, or coffer, or make a small passage through a wall, as long as the wall is less than 5 feet thick.`
  ],
  [
    'Stoneskin', 4, 'Abjuration', '1 action', 'Touch', 'V, S, M (diamond dust worth 100 gp, which the spell consumes)', 'Concentration, up to 1 hour', false, true,
    ['Artificer', 'Druid', 'Ranger', 'Sorcerer', 'Tamer', 'Wizard'],
    'Turn a willing creature’s flesh as hard as stone, granting resistance to nonmagical bludgeoning, piercing, and slashing damage.',
    `This spell turns the flesh of a willing creature you touch as hard as stone. Until the spell ends, the target has resistance to nonmagical bludgeoning, piercing, and slashing damage.`
  ],

  // ================= 5TH LEVEL =================
  [
    'Animate Objects', 5, 'Transmutation', '1 action', '120 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Artificer', 'Bard', 'Sorcerer', 'Wizard'],
    'Bring up to ten nonmagical objects to life as constructs under your mental command.',
    `Objects come to life at your command. Choose up to ten nonmagical objects within range that are not being worn or carried. Medium targets count as two objects, Large targets count as four objects, Huge targets count as eight objects. Each target animates and becomes a creature under your control until the spell ends or until reduced to 0 hit points. As a bonus action, you can mentally command any creature you made with this spell.\n\n**At Higher Levels.** If you cast this spell using a spell slot of 6th level or higher, you can animate two additional objects for each slot level above 5th.`
  ],
  [
    'Antilife Shell', 5, 'Abjuration', '1 action', 'Self (10-foot radius)', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Tamer'],
    'A shimmering 10-foot-radius barrier hedges out all living creatures except undead and constructs.',
    `A shimmering barrier extends out from you in a 10-foot radius and moves with you, remaining centered on you and hedging out creatures other than undead and constructs. The barrier lasts for the duration. The barrier prevents an affected creature from passing or reaching through. An affected creature can cast spells or make attacks with ranged or reach weapons through the barrier.`
  ],
  [
    'Arcane Hand', 5, 'Evocation', '1 action', '120 feet', 'V, S, M (an eggshell and a snakeskin glove)', 'Concentration, up to 1 minute', false, true,
    ['Artificer', 'Sorcerer', 'Wizard'],
    'Create a Large shimmering hand of force that can strike (4d8 force), shove, grapple, or interpose as cover.',
    `You create a Large hand of shimmering, translucent force in an unoccupied space that you can see within range. The hand lasts for the spell's duration, and it moves at your command, mimicking the movements of your own hand. When you cast the spell and as a bonus action on your subsequent turns, you can move the hand up to 60 feet and then cause Clenched Fist (4d8 force damage), Forceful Hand (push creature), Grasping Hand (grapple and crush for 2d6 + modifier bludgeoning), or Interposing Hand (half cover and block movement).\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, Clenched Fist damage increases by 2d8 and Grasping Hand damage increases by 2d6 for each slot level above 5th.`,
    ["Bigby's Hand"]
  ],
  [
    'Awaken', 5, 'Transmutation', '8 hours', 'Touch', 'V, S, M (an agate worth at least 1,000 gp, which the spell consumes)', 'Instantaneous', false, false,
    ['Bard', 'Druid', 'Tamer'],
    'Give a beast or plant with Intelligence 3 or less an Intelligence of 10 and the ability to speak one language.',
    `After spending the casting time tracing magical pathways within a precious gemstone, you touch a Huge or smaller beast or plant. The target must have either no Intelligence score or an Intelligence of 3 or less. The target gains an Intelligence of 10. The target also gains the ability to speak one language you know. If the target is a plant, it gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human's. The awakened beast or plant is charmed by you for 30 days or until you or your companions do anything harmful to it.`
  ],
  [
    'Cloudkill', 5, 'Conjuration', '1 action', '120 feet', 'V, S', 'Concentration, up to 10 minutes', false, true,
    ['Sorcerer', 'Wizard'],
    'Create a 20-foot-radius sphere of poisonous fog that moves 10 feet away each round and deals 5d8 poison damage.',
    `You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point you choose within range. The fog spreads around corners. It lasts for the duration or until strong wind disperses the fog, ending the spell. Its area is heavily obscured. When a creature enters the spell's area for the first time on a turn or starts its turn there, that creature must make a Constitution saving throw, taking 5d8 poison damage on a failed save, or half as much on a success. The fog moves 10 feet away from you at the start of each of your turns.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th.`
  ],
  [
    'Commune', 5, 'Divination', '1 minute', 'Self', 'V, S, M (incense and a vial of holy or unholy water)', '1 minute', true, false,
    ['Cleric'],
    'Contact your deity or a divine proxy and ask up to three questions that can be answered with a yes or no.',
    `You contact your deity or a divine proxy and ask up to three questions that can be answered with a yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question. Divine beings aren't necessarily omniscient, so you might receive "unclear" as an answer if a question pertains to information that lies beyond the deity's knowledge.`
  ],
  [
    'Commune with Nature', 5, 'Divination', '1 minute', 'Self', 'V, S', 'Instantaneous', true, false,
    ['Druid', 'Ranger'],
    'Gain knowledge of the surrounding territory within 3 miles (or 300 feet underground) across up to three natural facts.',
    `You briefly become one with nature and gain knowledge of the surrounding territory. In the outdoors, the spell gives you knowledge of the land within 3 miles of you. In caves and other natural underground settings, the radius is limited to 300 feet. You instantly gain knowledge of up to three facts of your choice about terrain, prevalent plants and animals, powerful celestials/fey/fiends/elementals/undead, or the influence of other planes.`
  ],
  [
    'Conjure Elemental', 5, 'Conjuration', '1 minute', '90 feet', 'V, S, M (burning incense for air, soft clay for earth, sulfur and phosphorus for fire, or water and sand for water)', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Wizard'],
    'Call forth an elemental of CR 5 or lower from a 10-foot cube of air, earth, fire, or water.',
    `You call forth an elemental servant. Choose an area of air, earth, fire, or water that fills a 10-foot cube within range. An elemental of challenge rating 5 or lower appropriate to the area you chose appears in an unoccupied space within 10 feet of it. The elemental is friendly to you and your companions and obeys your verbal commands. If your concentration is broken, the elemental doesn't disappear; instead, it becomes hostile toward you and your companions for the remaining hour.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the challenge rating increases by 1 for each slot level above 5th.`
  ],
  [
    'Contact Other Plane', 5, 'Divination', '1 minute', 'Self', 'V', '1 minute', true, false,
    ['Warlock', 'Wizard'],
    'Mentally contact an extraplanar intelligence; pass a DC 15 Intelligence save or suffer 6d6 psychic damage and insanity, otherwise ask 5 questions.',
    `You mentally contact a demigod, the spirit of a long-dead sage, or some other mysterious entity from another plane. Contacting this extraplanar intelligence can strain or even break your mind. When you cast this spell, make a DC 15 Intelligence saving throw. On a failure, you take 6d6 psychic damage and are insane until you finish a long rest. On a successful save, you can ask the entity up to five questions, receiving one-word answers.`
  ],
  [
    'Creation', 5, 'Illusion', '1 minute', '30 feet', 'V, S, M (a tiny piece of matter of the same type of the item you plan to create)', 'Special', false, false,
    ['Artificer', 'Sorcerer', 'Wizard'],
    'Pull wisps of shadow material from the Shadowfell to create a nonliving object of vegetable matter, stone, metal, or gems within a 5-foot cube.',
    `You pull wisps of shadow material from the Shadowfell to create a nonliving object of vegetable matter within range: soft goods, rope, wood, or something similar. You can also use this spell to create mineral objects such as stone, crystal, or metal. The object created must be no larger than a 5-foot cube, and the object must be of a form and material that you have seen before. Duration depends on material: 1 day (vegetable matter), 12 hours (stone/crystal), 1 hour (precious metals), 10 minutes (gems), or 1 minute (adamantine/mithral).\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the cube increases by 5 feet for each slot level above 5th.`
  ],
  [
    'Dominate Person', 5, 'Enchantment', '1 action', '60 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Sorcerer', 'Tamer', 'Wizard'],
    'Attempt to beguile a humanoid within 60 feet, establishing a telepathic link and controlling its actions.',
    `You attempt to beguile a humanoid that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw. While the target is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence, and you can issue commands or use your action to take total control.\n\n**At Higher Levels.** When you cast this spell using a 6th-level spell slot, the duration is concentration, up to 10 minutes (1 hour at 7th, 8 hours at 8th or higher).`
  ],
  [
    'Dream', 5, 'Illusion', '1 minute', 'Special', 'V, S, M (a handful of sand, a dab of ink, and a writing quill plucked from a sleeping bird)', '8 hours', false, false,
    ['Bard', 'Warlock', 'Wizard'],
    'Shape a sleeping creature’s dreams on the same plane, conversing with it or sending a terrifying nightmare for 3d6 psychic damage.',
    `This spell shapes a creature's dreams. Choose a creature known to you as the target of this spell. The target must be on the same plane of existence as you. Creatures that don't sleep, such as elves, can't be contacted by this spell. You, or a willing creature you touch, enters a trance state, acting as a messenger. The messenger appears in the target's dreams and can converse with it, or appear monstrous and force a Wisdom saving throw against 3d6 psychic damage and no benefit from the rest.`
  ],
  [
    'Geas', 5, 'Enchantment', '1 minute', '60 feet', 'V', '30 days', false, false,
    ['Bard', 'Cleric', 'Druid', 'Paladin', 'Tamer', 'Wizard'],
    'Command a creature to perform a service or refrain from an action for 30 days, dealing 5d10 psychic damage once per day if it disobeys.',
    `You place a magical command on a creature that you can see within range, forcing it to carry out some service or refrain from some action or course of activity as you decide. If the creature can understand you, it must succeed on a Wisdom saving throw or become charmed by you for the duration. While charmed by you, it takes 5d10 psychic damage each time it acts in a manner directly counter to your instructions, but no more than once each day.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th or 8th level, the duration is 1 year; with a 9th-level slot, the spell lasts until ended by remove curse, greater restoration, or wish.`
  ],
  [
    'Hallow', 5, 'Evocation', '24 hours', 'Touch', 'V, S, M (herbs, oils, and incense worth at least 1,000 gp, which the spell consumes)', 'Until dispelled', false, false,
    ['Cleric'],
    'Infuse an area up to 60 feet in radius with holy or unholy power, barring chosen extraplanar types and imposing a secondary effect.',
    `You touch a point and infuse an area around it with holy (or unholy) power. The area can have a radius up to 60 feet, and the spell fails if the radius includes an area already under the effect a hallow spell. First, celestials, elementals, fey, fiends, and undead can't enter the area nor charm, frighten, or possess creatures within it. Second, you can bind an extra effect to the area (such as Courage, Darkness, Daylight, Energy Protection, Energy Vulnerability, Everlasting Rest, Extradimensional Interference, Fear, Silence, or Tongues).`
  ],
  [
    'Hold Monster', 5, 'Enchantment', '1 action', '90 feet', 'V, S, M (a small, straight piece of iron)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Choose a creature within 90 feet (no effect on undead); it must succeed on a Wisdom save or be paralyzed.',
    `Choose a creature that you can see within range. The target must succeed on a Wisdom saving throw or be paralyzed for the duration. This spell has no effect on undead. At the end of each of its turns, the target can make another Wisdom saving throw. On a success, the spell ends on the target.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, you can target one additional creature for each slot level above 5th.`
  ],
  [
    'Insect Plague', 5, 'Conjuration', '1 action', '300 feet', 'V, S, M (a few grains of sugar, some kernels of grain, and a smear of fat)', 'Concentration, up to 10 minutes', false, true,
    ['Cleric', 'Druid', 'Sorcerer'],
    'Swarming biting locusts fill a 20-foot-radius sphere, creating difficult terrain and dealing 4d10 piercing damage.',
    `Swarming, biting locusts fill a 20-foot-radius sphere centered on a point you choose within range. The sphere spreads around corners. The sphere remains for the duration, and its area is lightly obscured. The sphere's area is difficult terrain. When the area appears, each creature in it must make a Constitution saving throw, taking 4d10 piercing damage on a failed save, or half as much on a success. A creature must also make this save when it enters the area for the first time on a turn or ends its turn there.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d10 for each slot level above 5th.`
  ],
  [
    'Mislead', 5, 'Illusion', '1 action', 'Self', 'S', 'Concentration, up to 1 hour', false, true,
    ['Bard', 'Tamer', 'Wizard'],
    'Become invisible while an illusory double appears in your place and can move, speak, and transmit its senses.',
    `You become invisible at the same time that an illusory double of you appears where you are standing. The double lasts for the duration, but the invisibility ends if you attack or cast a spell. You can use your action to move your illusory double up to twice your speed and make it gesture, speak, and behave in whatever way you choose. You can see through its eyes and hear through its ears as if you were located where it is.`
  ],
  [
    'Modify Memory', 5, 'Enchantment', '1 action', '30 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Wizard'],
    'Attempt to reshape a creature’s memories of an event lasting up to 10 minutes within the last 24 hours.',
    `You attempt to reshape another creature's memories. One creature that you can see must make a Wisdom saving throw. If you are fighting the creature, it has advantage on the saving throw. On a failed save, the target becomes charmed by you for the duration. The charmed target is incapacitated and unaware of its surroundings, though it can still hear you. You can permanently eliminate, recall, or alter its memory of an event lasting up to 10 minutes that occurred within the last 24 hours.\n\n**At Higher Levels.** If you cast this spell using a spell slot of 6th level or higher, you can alter memories from up to 7 days ago (6th), 30 days ago (7th), 1 year ago (8th), or any time in the creature's past (9th).`
  ],
  [
    'Passwall', 5, 'Transmutation', '1 action', '30 feet', 'V, S, M (a pinch of sesame seeds)', '1 hour', false, false,
    ['Wizard'],
    'Create a 5-foot-wide, 8-foot-tall, 20-foot-deep passage through a wooden, plaster, or stone wall.',
    `A passage appears at a point of your choice that you can see on a wooden, plaster, or stone surface (such as a wall, a ceiling, or a floor) within range, and lasts for the duration. You choose the opening's dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it.`
  ],
  [
    'Planar Binding', 5, 'Abjuration', '1 hour', '60 feet', 'V, S, M (a jewel worth at least 1,000 gp, which the spell consumes)', '24 hours', false, false,
    ['Bard', 'Cleric', 'Druid', 'Wizard'],
    'Attempt to bind a celestial, elemental, fey, or fiend to your service for 24 hours.',
    `With this spell, you attempt to bind a celestial, an elemental, a fey, or a fiend to your service. The creature must be within range for the entire casting of the spell. At the completion of the casting, the target must make a Charisma saving throw. On a failed save, it is bound to serve you for the duration. A bound creature must follow your instructions to the best of its ability.\n\n**At Higher Levels.** When you cast this spell using a spell slot of a higher level, the duration increases to 10 days (6th), 30 days (7th), 180 days (8th), or a year and a day (9th).`
  ],
  [
    'Scrying', 5, 'Divination', '10 minutes', 'Self', 'V, S, M (a focus worth at least 1,000 gp, such as a crystal ball, a silver mirror, or a font filled with holy water)', 'Concentration, up to 10 minutes', false, true,
    ['Bard', 'Cleric', 'Druid', 'Tamer', 'Warlock', 'Wizard'],
    'See and hear a particular creature on the same plane of existence through an invisible sensor.',
    `You can see and hear a particular creature you choose that is on the same plane of existence as you. The target must make a Wisdom saving throw, which is modified by how well you know the target and the sort of physical connection you have to it. On a failed save, the spell creates an invisible sensor within 10 feet of the target, allowing you to see and hear through it as if you were there. Alternatively, you can choose a location you have seen before as the target.`
  ],
  [
    'Telekinesis', 5, 'Transmutation', '1 action', '60 feet', 'V, S', 'Concentration, up to 10 minutes', false, true,
    ['Sorcerer', 'Wizard'],
    'Move and manipulate Huge or smaller creatures or objects up to 1,000 pounds by thought each turn.',
    `You gain the ability to move or manipulate creatures or objects by thought. When you cast the spell, and as your action each round for the duration, you can exert your will on one creature or object that you can see within range, causing the appropriate effect. You can restrain and move a Huge or smaller creature (with a contested spellcasting ability check against its Strength check) up to 30 feet, or move an object weighing up to 1,000 pounds.`
  ],
  [
    'Telepathic Bond', 5, 'Divination', '1 action', '30 feet', 'V, S, M (pieces of eggshell from two different kinds of creatures)', '1 hour', true, false,
    ['Tamer', 'Wizard'],
    'Forge a telepathic link among up to eight willing creatures anywhere on the same plane for 1 hour.',
    `You forge a telepathic link among up to eight willing creatures of your choice within range, psychically linking each creature to all the others for the duration. Creatures with Intelligence scores of 2 or less aren't affected by this spell. Until the spell ends, the targets can communicate telepathically through the bond whether or not they have a common language, across any distance on the same plane.`,
    ["Rary's Telepathic Bond"]
  ],
  [
    'Tree Stride', 5, 'Conjuration', '1 action', 'Self', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Druid', 'Ranger'],
    'Step into a living tree and instantly teleport to another tree of the same kind within 500 feet.',
    `You gain the ability to enter a tree and move from inside it to inside another tree of the same kind within 500 feet. Both trees must be living and at least the same size as you. You must use 5 feet of movement to enter a tree. You instantly know the location of all other trees of the same kind within 500 feet and can pass into one as part of the movement used to enter the first tree.`
  ],
  [
    'Wall of Force', 5, 'Evocation', '1 action', '120 feet', 'V, S, M (a pinch of powder made by crushing a clear gemstone)', 'Concentration, up to 10 minutes', false, true,
    ['Wizard'],
    'Create an invisible wall of force immune to all damage that blocks physical passage and cannot be dispelled by dispel magic.',
    `An invisible wall of force springs into existence at a point you choose within range. The wall appears in any orientation you choose, as a horizontal or vertical barrier or at an angle. You can form it into a hemispherical dome or a sphere with a radius of up to 10 feet, or shape a flat surface made up of ten 10-foot-by-10-foot panels. Nothing can physically pass through the wall. It is immune to all damage and can't be dispelled by dispel magic, though a disintegrate spell destroys it instantly.`
  ],
  [
    'Wall of Stone', 5, 'Evocation', '1 action', '120 feet', 'V, S, M (a small block of granite)', 'Concentration, up to 10 minutes', false, true,
    ['Artificer', 'Druid', 'Sorcerer', 'Wizard'],
    'Create a nonmagical wall of solid stone up to ten 10-foot panels that becomes permanent if concentrated on for the full duration.',
    `A nonmagical wall of solid stone springs into existence at a point you choose within range. The wall is 6 inches thick and is composed of ten 10-foot-by-10-foot panels. Each panel must be contiguous with at least one other panel. You can shape the wall as a bridge, flat barrier, or enclosure. If you maintain your concentration on this spell for its whole duration, the wall becomes permanent and can't be dispelled.`
  ],

  // ================= 6TH LEVEL =================
  [
    'Blade Barrier', 6, 'Evocation', '1 action', '90 feet', 'V, S', 'Concentration, up to 10 minutes', false, true,
    ['Cleric'],
    'Create a vertical wall of whirling razor-sharp blades that provides three-quarters cover and deals 6d10 slashing damage.',
    `You create a vertical wall of whirling, razor-sharp blades made of magical energy. The wall appears within range and lasts for the duration. You can make a straight wall up to 100 feet long, 20 feet high, and 5 feet thick, or a ringed wall up to 60 feet in diameter, 20 feet high, and 5 feet thick. The wall provides three-quarters cover to creatures behind it, and its space is difficult terrain. When a creature enters the wall's area for the first time on a turn or starts its turn there, it must make a Dexterity saving throw, taking 6d10 slashing damage on a failed save, or half as much on a success.`
  ],
  [
    'Chain Lightning', 6, 'Evocation', '1 action', '150 feet', 'V, S, M (a bit of fur; a piece of amber, glass, or a crystal rod; and three silver pins)', 'Instantaneous', false, false,
    ['Sorcerer', 'Wizard'],
    'A bolt of lightning strikes one target and leaps to up to three others within 30 feet for 10d8 lightning damage.',
    `You create a bolt of lightning that arcs toward a target of your choice that you can see within range. Three bolts then leap from that target to as many as three other targets, each of which must be within 30 feet of the first target. A target must make a Dexterity saving throw, taking 10d8 lightning damage on a failed save, or half as much damage on a successful one.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, one additional bolt leaps from the first target to another target for each slot level above 6th.`
  ],
  [
    'Circle of Death', 6, 'Necromancy', '1 action', '150 feet', 'V, S, M (the powder of a crushed black pearl worth at least 500 gp)', 'Instantaneous', false, false,
    ['Sorcerer', 'Thanatomancer', 'Warlock', 'Wizard'],
    'A 60-foot-radius sphere of negative energy deals 8d6 necrotic damage on a failed Constitution save.',
    `A sphere of negative energy ripples out in a 60-foot-radius sphere from a point within range. Each creature in that area must make a Constitution saving throw. A target takes 8d6 necrotic damage on a failed save, or half as much damage on a successful one.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, the damage increases by 2d6 for each slot level above 6th.`
  ],
  [
    'Conjure Fey', 6, 'Conjuration', '1 minute', '90 feet', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Warlock'],
    'Summon a fey creature of CR 6 or lower (or a fey spirit in beast form) to obey your verbal commands.',
    `You summon a fey creature of challenge rating 6 or lower, or a fey spirit that takes the form of a beast of challenge rating 6 or lower. It appears in an unoccupied space that you can see within range. The fey creature disappears when it drops to 0 hit points or when the spell ends. If your concentration is broken, the fey creature doesn't disappear; instead, you lose control of it for the remainder of the hour.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, the challenge rating increases by 1 for each slot level above 6th.`
  ],
  [
    'Contingency', 6, 'Evocation', '10 minutes', 'Self', 'V, S, M (a statuette of yourself carved from ivory and decorated with gems worth at least 1,500 gp)', '10 days', false, false,
    ['Wizard'],
    'Store a 5th-level or lower self-targeting spell that casts automatically when a specified trigger circumstance occurs.',
    `Choose a spell of 5th level or lower that you can cast, that has a casting time of 1 action, and that can target you. You cast that spell—called the contingent spell—as part of casting contingency, expending spell slots for both, but the contingent spell doesn't come into effect. Instead, it takes effect when a certain circumstance occurs. You describe that circumstance when you cast the two spells.`
  ],
  [
    'Create Undead', 6, 'Necromancy', '1 minute', '10 feet', 'V, S, M (one clay pot filled with grave dirt, one clay pot filled with brackish water, and one 150 gp black onyx stone for each corpse)', 'Instantaneous', false, false,
    ['Cleric', 'Thanatomancer', 'Warlock', 'Wizard'],
    'Animate up to three Medium or Small humanoid corpses as ghouls under your control (can only be cast at night).',
    `You can cast this spell only at night. Choose up to three corpses of Medium or Small humanoids within range. Each corpse becomes a ghoul under your control. As a bonus action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you. The creature is under your control for 24 hours.\n\n**At Higher Levels.** When you cast this spell using a 7th-level spell slot, you can animate or reassert control over four ghouls; with an 8th-level slot, five ghouls or two ghasts or wights; with a 9th-level slot, six ghouls, three ghasts or wights, or two mummies.`
  ],
  [
    'Disintegrate', 6, 'Transmutation', '1 action', '60 feet', 'V, S, M (a lodestone and a pinch of dust)', 'Instantaneous', false, false,
    ['Sorcerer', 'Wizard'],
    'A thin green ray deals 10d6 + 40 force damage on a failed Dexterity save, reducing creatures at 0 HP to fine gray dust.',
    `A thin green ray springs from your pointing finger to a target that you can see within range. The target can be a creature, an object, or a creation of magical force, such as the wall created by wall of force. A creature targeted by this spell must make a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 force damage. If this damage reduces the target to 0 hit points, it is disintegrated. This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, the damage increases by 3d6 for each slot level above 6th.`
  ],
  [
    'Eyebite', 6, 'Necromancy', '1 action', 'Self', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Your eyes become inky black; on each turn, force a creature within 60 feet to save or be put asleep, panicked, or sickened.',
    `For the spell's duration, your eyes become an inky void imbued with dread power. One creature of your choice within 60 feet of you that you can see must succeed on a Wisdom saving throw or be affected by one of the following effects of your choice for the duration. On each of your turns until the spell ends, you can use your action to target another creature:\n\n- **Asleep.** The target falls unconscious.\n- **Panicked.** The target is frightened of you and must take the Dash action and move away from you by the safest and shortest available route.\n- **Sickened.** The target has disadvantage on attack rolls and ability checks.`
  ],
  [
    'Find the Path', 6, 'Divination', '1 minute', 'Self', 'V, S, M (a set of divinatory tools—such as bones, ivory sticks, cards, teeth, or carved runes—worth 100 gp and an object from the location you wish to find)', 'Concentration, up to 1 day', false, true,
    ['Bard', 'Cleric', 'Druid'],
    'Sense the shortest, most direct physical route to a specific fixed destination on the same plane of existence.',
    `This spell allows you to find the shortest, most direct physical route to a specific fixed location that you are familiar with on the same plane of existence. For the duration, as long as you are on the same plane of existence as the destination, you know how far it is and in what direction it lies, and whenever you are presented with a choice of paths along the way, you automatically determine which path is the shortest and most direct route.`
  ],
  [
    'Flesh to Stone', 6, 'Transmutation', '1 action', '60 feet', 'V, S, M (a pinch of lime, water, and earth)', 'Concentration, up to 1 minute', false, true,
    ['Warlock', 'Wizard'],
    'Attempt to turn a creature made of flesh to stone; restrain on initial fail, petrify after three failed saves.',
    `You attempt to turn one creature that you can see within range into stone. If the target's body is made of flesh, the creature must make a Constitution saving throw. On a failed save, it is restrained as its flesh begins to harden. On a successful save, the creature isn't affected. A creature restrained by this spell must make another Constitution saving throw at the end of each of its turns; if it successfully saves against this spell three times, the spell ends, while three failures turn it to stone and subject it to the petrified condition.`
  ],
  [
    'Globe of Invulnerability', 6, 'Abjuration', '1 action', 'Self (10-foot radius)', 'V, S, M (a glass or crystal bead that shatters when the spell ends)', 'Concentration, up to 1 minute', false, true,
    ['Sorcerer', 'Wizard'],
    'Create a 10-foot-radius immobile barrier that blocks any spell of 5th level or lower cast from outside.',
    `An immobile, faintly shimmering barrier springs into existence in a 10-foot radius around you and remains for the duration. Any spell of 5th level or lower cast from outside the barrier can't affect creatures or objects within it, even if the spell is cast using a higher level spell slot. Such a spell can target creatures and objects within the barrier, but the spell has no effect on them.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, the barrier blocks spells of one level higher for each slot level above 6th.`
  ],
  [
    'Harm', 6, 'Necromancy', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Cleric', 'Thanatomancer'],
    'Unleash a virulent disease on a creature within 60 feet for 14d6 necrotic damage and reduce its hit point maximum.',
    `You unleash a virulent disease on a creature that you can see within range. The target must make a Constitution saving throw. On a failed save, it takes 14d6 necrotic damage, or half as much damage on a successful save. The damage can't reduce the target's hit points below 1. If the target fails the saving throw, its hit point maximum is reduced for 1 hour by an amount equal to the necrotic damage it took.`
  ],
  [
    'Heal', 6, 'Evocation', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Cleric', 'Druid'],
    'Channel positive energy into a creature within 60 feet to restore 70 hit points and end blindness, deafness, and diseases.',
    `Choose a creature that you can see within range. A surge of positive energy washes through the creature, causing it to regain 70 hit points. This spell also ends blindness, deafness, and any diseases affecting the target. This spell has no effect on constructs or undead.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, the amount of healing increases by 10 for each slot level above 6th.`
  ],
  [
    "Heroes' Feast", 6, 'Conjuration', '10 minutes', '30 feet', 'V, S, M (a gem-encrusted bowl worth at least 1,000 gp, which the spell consumes)', 'Instantaneous', false, false,
    ['Bard', 'Cleric', 'Druid'],
    'Conjure a feast for up to twelve creatures granting immunity to poison/frightened, advantage on Wisdom saves, and +2d10 max HP for 24 hours.',
    `You bring forth a great feast, including magnificent food and drink. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don't set in until this hour is over. Up to twelve creatures can partake of the feast. A creature that partakes gains several benefits for 24 hours: it is cured of all diseases and poison, becomes immune to poison and being frightened, makes all Wisdom saving throws with advantage, and increases its hit point maximum by 2d10.`
  ],
  [
    'Irresistible Dance', 6, 'Enchantment', '1 action', '30 feet', 'V', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Wizard'],
    'Force a creature to dance comically in place, halving speed to 0 and granting advantage on attacks against it.',
    `Choose one creature that you can see within range. The target begins a comic dance in place: shuffling, tapping its feet, and capering for the duration. Creatures that can't be charmed are immune to this spell. A dancing creature must use all its movement to dance without leaving its space and has disadvantage on Dexterity saving throws and attack rolls. While the target is affected by this spell, other creatures have advantage on attack rolls against it. As an action, a dancing creature makes a Wisdom saving throw to regain control of itself.`,
    ["Otto's Irresistible Dance", "otto's-irresistible-dance"]
  ],
  [
    'Mass Suggestion', 6, 'Enchantment', '1 action', '60 feet', 'V, M (a snake’s tongue and either a bit of honeycomb or a drop of sweet oil)', '24 hours', false, false,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Suggest a reasonable course of activity to up to twelve creatures within 60 feet for up to 24 hours.',
    `You suggest a course of activity (limited to a sentence or two) and magically influence up to twelve creatures of your choice that you can see within range and that can hear and understand you. Creatures that can't be charmed are immune to this effect. Each creature must make a Wisdom saving throw or pursue the course of action you described.\n\n**At Higher Levels.** When you cast this spell using a 7th-level spell slot, the duration is 10 days (30 days at 8th level, a year and a day at 9th level).`
  ],
  [
    'Move Earth', 6, 'Transmutation', '1 action', '120 feet', 'V, S, M (an iron blade and a small bag containing a mixture of soils—clay, loam, and sand)', 'Concentration, up to 2 hours', false, true,
    ['Druid', 'Sorcerer', 'Wizard'],
    'Reshape terrain of dirt, sand, or clay in areas up to 40 feet on a side every 10 minutes.',
    `Choose an area of terrain no larger than 40 feet on a side within range. You can reshape dirt, sand, or clay in the area in any manner you choose for the duration. You can raise or lower the area's elevation, create or fill in a trench, erect or flatten a wall, or form a pillar. Because the terrain's transformation occurs slowly, creatures in the area can't usually be trapped or injured by the ground's movement.`
  ],
  [
    'Planar Ally', 6, 'Conjuration', '10 minutes', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Cleric'],
    'Beseech an otherworldly entity for aid, summoning a celestial, elemental, or fiend that may bargain for payment.',
    `You beseech an otherworldly entity for aid. The being must be known to you: a god, a primordial, a demon prince, or some other being of cosmic power. That entity sends a celestial, an elemental, or a fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. The creature isn't under your compulsion to fight for you and may ask for payment or a quest in return for its service.`
  ],
  [
    'Sunbeam', 6, 'Evocation', '1 action', 'Self (60-foot line)', 'V, S, M (a magnifying glass)', 'Concentration, up to 1 minute', false, true,
    ['Druid', 'Sorcerer', 'Wizard'],
    'Shoot a 5-foot-wide, 60-foot-long beam of sunlight each turn that blinds and deals 6d8 radiant damage.',
    `A beam of brilliant light flashes out from your hand in a 5-foot-wide, 60-foot-long line. Each creature in the line must make a Constitution saving throw. On a failed save, a creature takes 6d8 radiant damage and is blinded until your next turn. On a successful save, it takes half as much damage and isn't blinded by this spell. Undead and oozes have disadvantage on this saving throw. You can create a new line of radiance as your action on any turn until the spell ends.`
  ],
  [
    'True Seeing', 6, 'Divination', '1 action', 'Touch', 'V, S, M (an ointment for the eyes that costs 25 gp; is made from mushroom powder, saffron, and fat; and is consumed by the spell)', '1 hour', false, false,
    ['Bard', 'Cleric', 'Sorcerer', 'Warlock', 'Wizard'],
    'Grant a willing creature truesight out to 120 feet for 1 hour.',
    `This spell gives the willing creature you touch the ability to see things as they actually are. For the duration, the creature has truesight, notices secret doors hidden by magic, and can see into the Ethereal Plane, all out to a range of 120 feet.`
  ],
  [
    'Wall of Ice', 6, 'Evocation', '1 action', '120 feet', 'V, S, M (a small piece of quartz)', 'Concentration, up to 10 minutes', false, true,
    ['Wizard'],
    'Create a wall of ice up to ten 10-foot panels that deals 10d6 cold damage on appearance and 5d6 cold damage to creatures passing through breaches.',
    `You create a wall of ice on a solid surface within range. You can form it into a hemispherical dome or a sphere with a radius of up to 10 feet, or shape a flat surface made up of ten 10-foot-square panels. If the wall cuts through a creature's space when it appears, the creature must make a Dexterity saving throw, taking 10d6 cold damage on a failure or half on a success. Destroying a 10-foot section leaves behind a sheet of frigid air that deals 5d6 cold damage.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, the damage the wall deals when it appears increases by 2d6, and the frigid air damage increases by 1d6, for each slot level above 6th.`
  ],
  [
    'Wall of Thorns', 6, 'Conjuration', '1 action', '120 feet', 'V, S, M (a handful of thorns)', 'Concentration, up to 10 minutes', false, true,
    ['Druid'],
    'Create a tough, tangled wall of razor-sharp thorns that deals 7d8 piercing/slashing damage and costs 4 feet of movement per foot.',
    `You create a wall of tough, pliable, tangled brush bristling with needle-sharp thorns. The wall appears within range on a solid surface and lasts for the duration. You choose to make the wall up to 60 feet long, 10 feet high, and 5 feet thick or a circle that has a 20-foot diameter and is up to 20 feet high and 5 feet thick. Creatures in the wall or moving through it take 7d8 piercing or slashing damage (Dexterity save for half).\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, both types of damage increase by 1d8 for each slot level above 6th.`
  ],
  [
    'Wind Walk', 6, 'Transmutation', '1 minute', '30 feet', 'V, S, M (fire and holy water)', '8 hours', false, false,
    ['Druid'],
    'Transform up to ten willing creatures into wispy clouds with a 300-foot flying speed for 8 hours.',
    `You and up to ten willing creatures you can see within range assume a gaseous form for the duration, appearing as wisps of cloud. While in this cloud form, a creature has a flying speed of 300 feet and has resistance to damage from nonmagical weapons. The only actions a creature can take in this form are the Dash action or to revert to its normal form.`
  ],
  [
    'Word of Recall', 6, 'Conjuration', '1 action', '5 feet', 'V', 'Instantaneous', false, false,
    ['Cleric'],
    'Instantly teleport yourself and up to five willing creatures to a previously designated sanctuary on the same plane.',
    `You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary. To designate a sanctuary, you cast this spell within a location such as a temple dedicated to or strongly linked to your deity.`
  ],

  // ================= 7TH LEVEL =================
  [
    'Arcane Sword', 7, 'Evocation', '1 action', '60 feet', 'V, S, M (a miniature platinum sword with a grip and pommel of copper and zinc, worth 250 gp)', 'Concentration, up to 1 minute', false, true,
    ['Bard', 'Wizard'],
    'Create a floating sword of force that strikes twice on cast and as a bonus action for 3d10 force damage.',
    `You create a sword-shaped plane of force that hovers within range. It lasts for the duration. When the sword appears, you make a melee spell attack against a target of your choice within 5 feet of the sword. On a hit, the target takes 3d10 force damage. Until the spell ends, you can use a bonus action on each of your turns to move the sword up to 20 feet to a spot you can see and repeat this attack against the same target or a different one.`,
    ["Mordenkainen's Sword"]
  ],
  [
    'Conjure Celestial', 7, 'Conjuration', '1 minute', '90 feet', 'V, S', 'Concentration, up to 1 hour', false, true,
    ['Cleric'],
    'Summon a celestial of challenge rating 4 or lower to serve and obey your verbal commands.',
    `You summon a celestial of challenge rating 4 or lower, which appears in an unoccupied space that you can see within range. The celestial disappears when it drops to 0 hit points or when the spell ends. The celestial is friendly to you and your companions for the duration and obeys any verbal commands that you issue to it.\n\n**At Higher Levels.** When you cast this spell using a 9th-level spell slot, you summon a celestial of challenge rating 5 or lower.`
  ],
  [
    'Delayed Blast Fireball', 7, 'Evocation', '1 action', '150 feet', 'V, S, M (a tiny ball of bat guano and sulfur)', 'Concentration, up to 1 minute', false, true,
    ['Sorcerer', 'Wizard'],
    'A glowing bead gathers energy each round (+1d6 per round) before detonating in a 20-foot-radius 12d6+ fire explosion.',
    `A beam of yellow light flashes from your pointing finger, then condenses to linger at a chosen point within range as a glowing bead for the duration. When the spell ends, either because your concentration is broken or because you decide to end it, the bead blossoms with a low roar into an explosion of flame that spreads around corners. Each creature in a 20-foot-radius sphere must make a Dexterity saving throw, taking 12d6 fire damage on a failed save (increased by 1d6 for each round the bead lingered), or half on a success.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 8th level or higher, the base damage increases by 1d6 for each slot level above 7th.`
  ],
  [
    'Divine Word', 7, 'Evocation', '1 bonus action', '30 feet', 'V', 'Instantaneous', false, false,
    ['Cleric'],
    'Utter a divine word that deafens, blinds, stuns, or instantly kills creatures based on remaining hit points, and banishes extraplanars.',
    `You utter a divine word, imbued with the power that shaped the world at the dawn of creation. Choose any number of creatures you can see within range. Each creature that can hear you must make a Charisma saving throw. On a failed save, a creature suffers an effect based on its current hit points: 50 HP or fewer (deafened 1 minute), 40 HP or fewer (deafened and blinded 10 minutes), 30 HP or fewer (blinded, deafened, and stunned 1 hour), or 20 HP or fewer (killed instantly). Regardless of its hit points, a celestial, elemental, fey, or fiend that fails its save is forced back to its home plane.`
  ],
  [
    'Etherealness', 7, 'Transmutation', '1 action', 'Self', 'V, S', 'Up to 8 hours', false, false,
    ['Bard', 'Cleric', 'Sorcerer', 'Warlock', 'Wizard'],
    'Step into the Border Ethereal for up to 8 hours, moving in any direction and through solid objects.',
    `You step into the border regions of the Ethereal Plane, in the area where it overlaps with your current plane. You remain in the Border Ethereal for the duration or until you use your action to dismiss the spell. During this time, you can move in any direction, and solid objects on the plane you left behind don't impede you. You can only affect and be affected by other creatures on the Ethereal Plane.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 8th level or higher, you can target up to three willing creatures (including you) for each slot level above 7th.`
  ],
  [
    'Finger of Death', 7, 'Necromancy', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Sorcerer', 'Thanatomancer', 'Warlock', 'Wizard'],
    'Send negative energy through a creature for 7d8 + 30 necrotic damage; a humanoid killed by it rises permanently as a zombie.',
    `You send negative energy coursing through a creature that you can see within range, causing it searing pain. The target must make a Constitution saving throw. It takes 7d8 + 30 necrotic damage on a failed save, or half as much damage on a successful one. A humanoid killed by this spell rises at the start of your next turn as a zombie that is permanently under your command, following your verbal orders to the best of its ability.`
  ],
  [
    'Fire Storm', 7, 'Evocation', '1 action', '150 feet', 'V, S', 'Instantaneous', false, false,
    ['Cleric', 'Druid', 'Sorcerer'],
    'Roaring sheets of flame fill up to ten contiguous 10-foot cubes, dealing 7d10 fire damage on a failed Dexterity save.',
    `A storm made up of sheets of roaring flame appears in a location you choose within range. The area of the storm consists of up to ten 10-foot cubes, which you can arrange as you wish. Each cube must have at least one face adjacent to the face of another cube. Each creature in the area must make a Dexterity saving throw, taking 7d10 fire damage on a failed save, or half as much damage on a successful one.`
  ],
  [
    'Forcecage', 7, 'Evocation', '1 action', '100 feet', 'V, S, M (ruby dust worth 1,500 gp)', '1 hour', false, false,
    ['Bard', 'Warlock', 'Wizard'],
    'Trap creatures inside an immobile invisible 20-foot barred cage or 10-foot solid box of magical force for 1 hour.',
    `An immobile, invisible, cube-shaped prison composed of magical force springs into existence around an area you choose within range. The prison can be a cage (20 feet on a side) or a solid box (10 feet on a side), chosen when you cast the spell. A creature inside the cage can't leave it by nonmagical means, and teleportation or interplanar travel requires a Charisma saving throw.`
  ],
  [
    'Magnificent Mansion', 7, 'Conjuration', '1 minute', '300 feet', 'V, S, M (a miniature portal carved from ivory, a small piece of polished marble, and a tiny silver spoon, each item worth at least 5 gp)', '24 hours', false, false,
    ['Bard', 'Wizard'],
    'Conjure an extradimensional dwelling with space for 100 guests, 100 unseen servants, and nine-course banquets for 24 hours.',
    `You conjure an extradimensional dwelling in range that lasts for the duration. You choose where its one entrance is located. The entrance shimmers faintly and is 5 feet wide and 10 feet tall. You and any creature you designate when you cast the spell can enter the extradimensional dwelling as long as the portal remains open. Inside is a foyer and any floor plan up to fifty 10-foot cubes, furnished, staffed by 100 near-transparent servants, and stocked with food for a nine-course banquet.`,
    ["Mordenkainen's Magnificent Mansion"]
  ],
  [
    'Mirage Arcane', 7, 'Illusion', '10 minutes', 'Sight', 'V, S', '10 days', false, false,
    ['Bard', 'Druid', 'Wizard'],
    'Create a tactile, audible, olfactory, and visual illusion transforming a 1-mile-square area for 10 days.',
    `You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain. The terrain's general shape remains the same, however. Unlike hallucinatory terrain, the illusion includes audible, tactile, and olfactory elements, so it can turn clear ground into difficult terrain or vice versa.`
  ],
  [
    'Plane Shift', 7, 'Conjuration', '1 action', 'Touch', 'V, S, M (a forked, metal rod worth at least 250 gp, attuned to a particular plane of existence)', 'Instantaneous', false, false,
    ['Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard'],
    'Transport yourself and up to eight willing creatures to another plane of existence, or banish an unwilling creature.',
    `You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, and you appear in or near that destination. Alternatively, if you know the sigil sequence of a teleportation circle on another plane of existence, this spell can take you to that circle. You can also use this spell to banish an unwilling creature to another plane on a melee spell attack and failed Charisma saving throw.`
  ],
  [
    'Prismatic Spray', 7, 'Evocation', '1 action', 'Self (60-foot cone)', 'V, S', 'Instantaneous', false, false,
    ['Bard', 'Sorcerer', 'Wizard'],
    'Eight multicolored rays flash in a 60-foot cone, striking creatures with random elemental damage, petrification, or banishment.',
    `Eight multicolored rays of light flash from your hand. Each ray is a different color and has a different power and purpose. Each creature in a 60-foot cone must make a Dexterity saving throw. For each target, roll a d8 to determine which color ray affects it: 1 Red (10d6 fire), 2 Orange (10d6 acid), 3 Yellow (10d6 lightning), 4 Green (10d6 poison), 5 Blue (10d6 cold), 6 Indigo (restrained/petrified), 7 Violet (blinded/banished), or 8 Special (struck by two rays).`
  ],
  [
    'Project Image', 7, 'Illusion', '1 action', '500 miles', 'V, S, M (a small replica of you made from materials worth at least 5 gp)', 'Concentration, up to 1 day', false, true,
    ['Bard', 'Wizard'],
    'Create an illusory copy of yourself anywhere within 500 miles that can move, speak, and transmit your senses.',
    `You create an illusory copy of yourself that lasts for the duration. The copy can appear at any location within range that you have seen before, regardless of intervening obstacles. The illusion looks and sounds like you, but it is intangible. You can use your action to move this illusion up to twice your speed, and make it gesture, speak, and behave in whatever way you choose, seeing and hearing through it.`
  ],
  [
    'Regenerate', 7, 'Transmutation', '1 minute', 'Touch', 'V, S, M (a prayer wheel and holy water)', '1 hour', false, false,
    ['Bard', 'Cleric', 'Druid'],
    'Restore 4d8 + 15 hit points, 1 hit point per turn for 1 hour, and regrow severed body members.',
    `You touch a creature and stimulate its natural healing ability. The target regains 4d8 + 15 hit points. For the duration of the spell, the target regains 1 hit point at the start of each of its turns (10 hit points each minute). The target's severed body members (fingers, legs, tails, and so on), if any, are restored after 2 minutes.`
  ],
  [
    'Resurrection', 7, 'Necromancy', '1 hour', 'Touch', 'V, S, M (a diamond worth at least 1,000 gp, which the spell consumes)', 'Instantaneous', false, false,
    ['Bard', 'Cleric', 'Thanatomancer'],
    'Restore a creature dead no longer than a century to life with all hit points, curing wounds, poisons, and diseases.',
    `You touch a dead creature that has been dead for no more than a century, that didn't die of old age, and that isn't undead. If its soul is free and willing, the target returns to life with all its hit points. This spell neutralizes any poisons and cures normal diseases afflicting the creature when it died, closes all mortal wounds, and restores any missing body parts.`
  ],
  [
    'Reverse Gravity', 7, 'Transmutation', '1 action', '100 feet', 'V, S, M (a lodestone and iron filings)', 'Concentration, up to 1 minute', false, true,
    ['Druid', 'Sorcerer', 'Wizard'],
    'Reverse gravity in a 50-foot-radius, 100-foot-high cylinder, causing unanchored objects and creatures to fall upward.',
    `This spell reverses gravity in a 50-foot-radius, 100-foot-high cylinder centered on a point within range. All creatures and objects that aren't somehow anchored to the ground in the area fall upward and reach the top of the area when you cast this spell. A creature can make a Dexterity saving throw to grab onto a fixed object it can reach, thus avoiding the fall.`
  ],
  [
    'Sequester', 7, 'Transmutation', '1 action', 'Touch', 'V, S, M (a powder composed of diamond, emerald, ruby, and sapphire dust worth at least 5,000 gp, which the spell consumes)', 'Until dispelled', false, false,
    ['Wizard'],
    'Make a willing creature or object invisible, undetectable by divination, and placed in suspended animation until a trigger condition.',
    `By means of this spell, a willing creature or an object can be hidden away, safe from detection for the duration. When you cast the spell and touch the target, it becomes invisible and can't be targeted by divination spells or perceived through scrying sensors created by divination spells. If the target is a creature, it falls into a state of suspended animation until the condition you set occurs.`
  ],
  [
    'Simulacrum', 7, 'Illusion', '12 hours', 'Touch', 'V, S, M (snow or ice in quantities sufficient to make a life-size copy of the duplicated creature; some hair, fingernail clippings, or other piece of that creature’s body; and powdered ruby worth 1,500 gp, sprinkled over the duplicate and consumed)', 'Until dispelled', false, false,
    ['Wizard'],
    'Sculpt an illusory snow-and-ice duplicate of a beast or humanoid with half its hit point maximum that obeys your commands.',
    `You shape an illusory duplicate of one beast or humanoid that is within range for the entire casting time of the spell. The duplicate is a creature, partially real and formed from ice or snow, and it can take actions and otherwise be affected as a normal creature. It appears to be the same as the original, but it has half the creature's hit point maximum and is formed without any equipment.`
  ],
  [
    'Symbol', 7, 'Abjuration', '1 minute', 'Touch', 'V, S, M (mercury, phosphorus, and powdered diamond and opal with a total value of at least 1,000 gp, which the spell consumes)', 'Until dispelled or triggered', false, false,
    ['Bard', 'Cleric', 'Druid', 'Wizard'],
    'Inscribe a harmful magical glyph that triggers death (10d10 necrotic), discord, fear, hopelessness, insanity, pain, sleep, or stunning.',
    `When you cast this spell, you inscribe a harmful glyph either on a surface (such as a section of floor, a wall, or a table) or within an object that can be closed to conceal the glyph. Once triggered, the glyph glows, filling a 60-foot-radius sphere with dim light for 10 minutes and subjecting creatures within to your chosen effect: Death (10d10 necrotic), Discord, Fear, Hopelessness, Insanity, Pain, Sleep, or Stunning.`
  ],
  [
    'Teleport', 7, 'Conjuration', '1 action', '10 feet', 'V', 'Instantaneous', false, false,
    ['Bard', 'Sorcerer', 'Wizard'],
    'Instantly transport yourself and up to eight willing creatures to a known destination on the same plane.',
    `This spell instantly transports you and up to eight willing creatures of your choice that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be able to fit entirely inside a 10-foot cube, and it can't be held or carried by an unwilling creature. Your familiarity with the destination determines whether you arrive there successfully.`
  ],

  // ================= 8TH LEVEL =================
  [
    'Animal Shapes', 8, 'Transmutation', '1 action', '30 feet', 'V, S', 'Concentration, up to 24 hours', false, true,
    ['Druid'],
    'Transform any number of willing creatures within 30 feet into beasts of CR 4 or lower for up to 24 hours.',
    `Your magic turns others into beasts. Choose any number of willing creatures that you can see within range. You transform each target into the form of a Large or smaller beast with a challenge rating of 4 or lower. On subsequent turns, you can use your action to transform affected creatures into new forms.`
  ],
  [
    'Antimagic Field', 8, 'Abjuration', '1 action', 'Self (10-foot-radius sphere)', 'V, S, M (a pinch of powdered iron or iron filings)', 'Concentration, up to 1 hour', false, true,
    ['Cleric', 'Wizard'],
    'Create a 10-foot-radius invisible sphere around you in which spells and magical effects are suppressed.',
    `A 10-foot-radius invisible sphere of antimagic surrounds you. This area is divorced from the magical energy that suffuses the multiverse. Within the sphere, spells can't be cast, summoned creatures disappear, and even magic items become mundane. Until the spell ends, the sphere moves with you, centered on you.`
  ],
  [
    'Antipathy/Sympathy', 8, 'Enchantment', '1 hour', '60 feet', 'V, S, M (either a lump of alum soaked in vinegar for the antipathy effect or a drop of honey for the sympathy effect)', '10 days', false, false,
    ['Druid', 'Wizard'],
    'Attract or repel a specified kind of intelligent creature to or from a Huge or smaller target for 10 days.',
    `This spell attracts or repels creatures of your choice. You target something within range, either a Huge or smaller object or creature or an area that is no larger than a 200-foot cube. Then specify a kind of intelligent creature, such as red dragons, goblins, or vampires. Creatures of the designated kind within 60 feet must make a Wisdom saving throw or be frightened/compelled away (Antipathy) or charmed/drawn toward the target (Sympathy).`
  ],
  [
    'Clone', 8, 'Necromancy', '1 hour', 'Touch', 'V, S, M (a diamond worth at least 1,000 gp and at least 1 cubic inch of flesh of the creature that is to be cloned, which the spell consumes, and a vessel worth at least 2,000 gp that has a sealable lid and is large enough to hold a Medium creature, such as a huge urn, coffin, mud-filled cyst in the ground, or crystal container filled with salt water)', 'Instantaneous', false, false,
    ['Thanatomancer', 'Wizard'],
    'Grow an inert duplicate of a living creature in a sealed vessel over 120 days to receive its soul upon death.',
    `This spell grows an inert duplicate of a living creature as a safeguard against death. This clone forms inside a sealed vessel and grows to full size and maturity after 120 days; you can also choose to have the clone be a younger version of the same creature. It remains inert and endures indefinitely, as long as its vessel remains undisturbed. At any time after the clone matures, if the original creature dies, its soul transfers to the clone.`
  ],
  [
    'Control Weather', 8, 'Transmutation', '10 minutes', 'Self (5-mile radius)', 'V, S, M (burning incense and bits of earth and wood mixed in water)', 'Concentration, up to 8 hours', false, true,
    ['Cleric', 'Druid', 'Wizard'],
    'Gradually alter precipitation, temperature, and wind within 5 miles over the course of 8 hours.',
    `You take control of the weather within 5 miles of you for the duration. You must be outdoors to cast this spell. Moving to a place where you don't have a clear path to the sky ends the spell early. When you cast the spell, you change the current weather conditions, which are determined by the GM based on the climate and season. You can change precipitation, temperature, and wind by one stage every 1d4 x 10 minutes.`
  ],
  [
    'Demiplane', 8, 'Conjuration', '1 action', '60 feet', 'S', '1 hour', false, false,
    ['Warlock', 'Wizard'],
    'Create a shadowy door on a flat surface leading into a 30-foot cube extradimensional room.',
    `You create a shadowy door on a flat solid surface that you can see within range. The door is large enough to allow Medium creatures to pass through unhindered. When opened, the door leads to a demiplane that appears to be an empty room 30 feet in each dimension, made of wood or stone. When the spell ends, the door disappears, and any creatures or objects inside the demiplane remain trapped there, though each casting can connect to a previously created demiplane.`
  ],
  [
    'Earthquake', 8, 'Evocation', '1 action', '500 feet', 'V, S, M (a pinch of dirt, a piece of rock, and a lump of clay)', 'Concentration, up to 1 minute', false, true,
    ['Cleric', 'Druid', 'Sorcerer'],
    'Trigger an intense seismic tremor in a 100-foot radius, knocking prone, opening fissures, and collapsing structures.',
    `You create a seismic disturbance at a point on the ground that you can see within range. For the duration, an intense tremor rips through the ground in a 100-foot-radius circle centered on that point and shakes creatures and structures in contact with the ground in that area. The ground becomes difficult terrain, creatures must pass Dexterity saves or be knocked prone, concentrating casters risk losing concentration, fissures open, and structures take 50 bludgeoning damage per round.`
  ],
  [
    'Feeblemind', 8, 'Enchantment', '1 action', '150 feet', 'V, S, M (a handful of clay, crystal, glass, or mineral spheres)', 'Instantaneous', false, false,
    ['Bard', 'Druid', 'Warlock', 'Wizard'],
    'Shatter a creature’s intellect and personality for 4d6 psychic damage and reduce its Intelligence and Charisma to 1.',
    `You blast the mind of a creature that you can see within range, attempting to shatter its intellect and personality. The target takes 4d6 psychic damage and must make an Intelligence saving throw. On a failed save, the creature's Intelligence and Charisma scores become 1. The creature can't cast spells, activate magic items, understand language, or communicate in any intelligible way. At the end of every 30 days, the creature can repeat its saving throw against this spell.`
  ],
  [
    'Glibness', 8, 'Transmutation', '1 action', 'Self', 'V', '1 hour', false, false,
    ['Bard', 'Warlock'],
    'Replace any Charisma check roll under 15 with a 15, and appear to tell the truth against magic detection.',
    `Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indicates that you are being truthful.`
  ],
  [
    'Holy Aura', 8, 'Abjuration', '1 action', 'Self', 'V, S, M (a tiny reliquary worth at least 1,000 gp containing a sacred relic)', 'Concentration, up to 1 minute', false, true,
    ['Cleric'],
    'Divine light grants allies within 30 feet advantage on all saving throws, disadvantage on incoming attacks, and blinds hitting fiends/undead.',
    `Divine light washes out from you and coalesces in a soft radiance in a 30-foot radius around you. Creatures of your choice in that radius when you cast this spell shed dim light in a 5-foot radius and have advantage on all saving throws, and other creatures have disadvantage on attack rolls against them until the spell ends. In addition, when a fiend or an undead hits an affected creature with a melee attack, the aura flashes with brilliant light and forces a Constitution saving throw or blinds the attacker.`
  ],
  [
    'Incendiary Cloud', 8, 'Conjuration', '1 action', '150 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Sorcerer', 'Wizard'],
    'Create a swirling 20-foot-radius cloud of smoke and white-hot embers that moves 10 feet away and deals 10d8 fire damage.',
    `A swirling cloud of smoke shot through with white-hot embers appears in a 20-foot-radius sphere centered on a point within range. The cloud spreads around corners and is heavily obscured. When the cloud appears, each creature in it must make a Dexterity saving throw, taking 10d8 fire damage on a failed save, or half as much on a success. A creature must also make this save when it enters the area for the first time on a turn or ends its turn there. The cloud moves 10 feet directly away from you at the start of each of your turns.`
  ],
  [
    'Maze', 8, 'Conjuration', '1 action', '60 feet', 'V, S', 'Concentration, up to 10 minutes', false, true,
    ['Wizard'],
    'Banish a creature into a labyrinthine demiplane with no initial save; requires a DC 20 Intelligence check to escape.',
    `You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze. The target can use its action to attempt to escape, making a DC 20 Intelligence check. If it succeeds, it escapes, and the spell ends (minotaurs and goristro demons automatically succeed).`
  ],
  [
    'Mind Blank', 8, 'Abjuration', '1 action', 'Touch', 'V, S', '24 hours', false, false,
    ['Bard', 'Wizard'],
    'Grant a willing creature immunity to psychic damage, mind-reading, divination, and the charmed condition for 24 hours.',
    `Until the spell ends, one willing creature you touch is immune to psychic damage, any effect that would sense its emotions or read its thoughts, divination spells, and the charmed condition. The spell even foils wish spells and spells or effects of similar power used to affect the target's mind or to gain information about the target.`
  ],
  [
    'Power Word Stun', 8, 'Enchantment', '1 action', '60 feet', 'V', 'Instantaneous', false, false,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Speak a word of power that stuns a creature with 150 hit points or fewer until it passes a Constitution save.',
    `You speak a word of power that can overwhelm the mind of one creature you can see within range, leaving it dumbfounded. If the target has 150 hit points or fewer, it is stunned. Otherwise, the spell has no effect. The stunned target must make a Constitution saving throw at the end of each of its turns. On a successful save, this stunning effect ends.`
  ],
  [
    'Sunburst', 8, 'Evocation', '1 action', '150 feet', 'V, S, M (fire and a piece of sunstone)', 'Instantaneous', false, false,
    ['Druid', 'Sorcerer', 'Wizard'],
    'Brilliant sunlight flashes in a 60-foot-radius sphere, dealing 12d6 radiant damage and blinding creatures for 1 minute.',
    `Brilliant sunlight flashes in a 60-foot radius centered on a point you choose within range. Each creature in that light must make a Constitution saving throw. On a failed save, a creature takes 12d6 radiant damage and is blinded for 1 minute. On a successful save, it takes half as much damage and isn't blinded by this spell. Undead and oozes have disadvantage on this saving throw. This spell dispels any darkness in its area created by a spell.`
  ],

  // ================= 9TH LEVEL =================
  [
    'Astral Projection', 9, 'Necromancy', '1 hour', '10 feet', 'V, S, M (for each creature you affect with this spell, you must provide one jacinth worth at least 1,000 gp and one ornately carved bar of silver worth at least 100 gp, all of which the spell consumes)', 'Special', false, false,
    ['Cleric', 'Warlock', 'Wizard'],
    'Project your astral body and up to eight companions into the Astral Plane while your physical bodies remain in suspended animation.',
    `You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell fails and the casting is wasted if you are already on that plane). The material body you leave behind is unconscious and in a state of suspended animation; it doesn't need food or air and doesn't age. Your astral form resembles your mortal form in almost every way, tethered to your material body by a silver cord.`
  ],
  [
    'Foresight', 9, 'Divination', '1 minute', 'Touch', 'V, S, M (a hummingbird feather)', '8 hours', false, false,
    ['Bard', 'Druid', 'Warlock', 'Wizard'],
    'Grant a willing creature limited future sight: cannot be surprised, advantage on attacks/checks/saves, and disadvantage on incoming attacks.',
    `You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target can't be surprised and has advantage on attack rolls, ability checks, and saving throws. Additionally, other creatures have disadvantage on attack rolls against the target for the duration.`
  ],
  [
    'Gate', 9, 'Conjuration', '1 action', '60 feet', 'V, S, M (a diamond worth at least 5,000 gp)', 'Concentration, up to 1 minute', false, true,
    ['Cleric', 'Sorcerer', 'Wizard'],
    'Open a portal to another plane of existence or speak a creature’s true name to pull it through the portal.',
    `You conjure a portal linking an unoccupied space you can see within range to a precise location on a different plane of existence. The portal is a circular opening, which you can make 5 to 20 feet in diameter. When you cast this spell, you can speak the name of a specific creature (a pseudonym, title, or nickname doesn't work); if that creature is on a plane other than the one you are on, the portal opens in the named creature's immediate vicinity and draws the creature through it.`
  ],
  [
    'Imprisonment', 9, 'Abjuration', '1 minute', '30 feet', 'V, S, M (a vellum depiction or a carved statuette in the likeness of the target, and a special component that varies according to the version of the spell you choose, worth at least 500 gp per Hit Die of the target)', 'Until dispelled', false, false,
    ['Warlock', 'Wizard'],
    'Create a magical restraint to bind a creature indefinitely via Burial, Chaining, Hedged Prison, Minimus Containment, or Slumber.',
    `You create a magical restraint to hold a creature that you can see within range. The target must succeed on a Wisdom saving throw or be bound by the spell; if it succeeds, it is immune to this spell if you cast it again. Choose one form of imprisonment: Burial, Chaining, Hedged Prison, Minimus Containment, or Slumber. Specify a condition that will cause the spell to end and release the target.`
  ],
  [
    'Mass Heal', 9, 'Evocation', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Cleric'],
    'Restore up to 700 hit points divided among any number of creatures within 60 feet and cure diseases, blindness, and deafness.',
    `A flood of healing energy flows from you into injured creatures around you. You restore up to 700 hit points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell are also cured of all diseases and any effect making them blinded or deafened. This spell has no effect on undead or constructs.`
  ],
  [
    'Meteor Swarm', 9, 'Evocation', '1 action', '1 mile', 'V, S', 'Instantaneous', false, false,
    ['Sorcerer', 'Wizard'],
    'Blazing orbs of fire strike four points within 1 mile, dealing 20d6 fire and 20d6 bludgeoning damage in 40-foot-radius spheres.',
    `Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius sphere centered on each point you choose must make a Dexterity saving throw. The sphere spreads around corners. A creature takes 20d6 fire damage and 20d6 bludgeoning damage on a failed save, or half as much damage on a successful one. A creature in the area of more than one fiery burst is affected only once.`
  ],
  [
    'Power Word Kill', 9, 'Enchantment', '1 action', '60 feet', 'V', 'Instantaneous', false, false,
    ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
    'Utter a word of power that compels one creature with 100 hit points or fewer to die instantly.',
    `You utter a word of power that can compel one creature you can see within range to die instantly. If the creature you chose has 100 hit points or fewer, it dies. Otherwise, the spell has no effect.`
  ],
  [
    'Prismatic Wall', 9, 'Abjuration', '1 action', '60 feet', 'V, S', '10 minutes', false, false,
    ['Wizard'],
    'Create a shimmering multicolored wall of seven layers that blinds nearby creatures and must be bypassed layer by layer.',
    `A shimmering, multicolored plane of light forms a vertical opaque wall—up to 90 feet long, 30 feet high, and 1 inch thick—centered on a point you can see within range, or a globe up to 30 feet in diameter. Creatures within 20 feet must pass a Constitution saving throw or be blinded. The wall consists of seven layers (Red, Orange, Yellow, Green, Blue, Indigo, Violet), each blocking different things and requiring a specific spell or effect to destroy in order.`
  ],
  [
    'Shapechange', 9, 'Transmutation', '1 action', 'Self', 'V, S, M (a jade circlet worth at least 1,500 gp, which you must place on your head before you cast the spell)', 'Concentration, up to 1 hour', false, true,
    ['Druid', 'Wizard'],
    'Assume the form of any creature (not construct or undead) with CR equal to or lower than your level, changing forms with an action.',
    `You assume the form of a different creature for the duration. The new form can be of any creature with a challenge rating equal to your level or lower. The creature can't be a construct or an undead, and you must have seen the sort of creature at least once. You retain your alignment, personality, Intelligence, Wisdom, Charisma, hit points, and class features that your new form is physically capable of using, and you can use your action to assume a different form.`
  ],
  [
    'Storm of Vengeance', 9, 'Conjuration', '1 action', 'Sight', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Druid'],
    'A churning 360-foot-radius storm cloud rains acid, hail, lightning bolts, and freezing gusts across ten rounds.',
    `A churning storm cloud forms, centered on a point you can see and spreading to a radius of 360 feet. Lightning flashes in the area, thunder booms, and strong winds roar. Each creature under the cloud (no more than 5,000 feet beneath the cloud) when it appears must make a Constitution saving throw, taking 2d6 thunder damage and becoming deafened for 5 minutes on a failure. Each round you maintain concentration, the storm produces different effects: Round 2 acid rain (1d6 acid), Round 3 lightning bolts (10d6 lightning), Round 4 hail (5d6 bludgeoning), Rounds 5-10 freezing gusts (1d6 cold).`
  ],
  [
    'Time Stop', 9, 'Transmutation', '1 action', 'Self', 'V', 'Instantaneous', false, false,
    ['Sorcerer', 'Wizard'],
    'Briefly stop the flow of time for everyone but you, taking 1d4 + 1 turns in a row.',
    `You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal. This spell ends if one of the actions you use during this period, or any effects that you create during this period, affects a creature other than you or an object being worn or carried by someone other than you.`
  ],
  [
    'True Polymorph', 9, 'Transmutation', '1 action', '30 feet', 'V, S, M (a drop of mercury, a dollop of gum arabic, and a wisp of smoke)', 'Concentration, up to 1 hour', false, true,
    ['Bard', 'Warlock', 'Wizard'],
    'Transform a creature into another creature, a creature into an object, or an object into a creature (permanent if held for 1 hour).',
    `Choose one creature or nonmagical object that you can see within range. You transform the creature into a different creature, the creature into an object, or the object into a creature (the object must be neither worn nor carried by another creature). The transformation lasts for the duration, or until the target drops to 0 hit points or dies. If you concentrate on this spell for the full duration, the transformation lasts until it is dispelled.`
  ],
  [
    'True Resurrection', 9, 'Necromancy', '1 hour', 'Touch', 'V, S, M (a sprinkle of holy water and diamonds worth at least 25,000 gp, which the spell consumes)', 'Instantaneous', false, false,
    ['Cleric', 'Druid'],
    'Restore a creature dead up to 200 years to life with full hit points, even providing a new body if none remains.',
    `You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. If the creature's soul is free and willing, the creature is restored to life with all its hit points. This spell closes all wounds, neutralizes any poison, cures all diseases, and lifts any curses affecting the creature when it died. The spell can even provide a new body if the original no longer exists.`
  ],
  [
    'Weird', 9, 'Illusion', '1 action', '120 feet', 'V, S', 'Concentration, up to 1 minute', false, true,
    ['Wizard'],
    'Draw on deepest fears of creatures in a 30-foot-radius sphere, frightening them and dealing 4d10 psychic damage each turn.',
    `Drawing on the deepest fears of a group of creatures, you create illusory creatures in their minds, visible only to them. Each creature in a 30-foot-radius sphere centered on a point of your choice within range must make a Wisdom saving throw. On a failed save, a creature becomes frightened for the duration, and at the end of each of its turns must succeed on a Wisdom saving throw or take 4d10 psychic damage.`
  ],
  [
    'Wish', 9, 'Conjuration', '1 action', 'Self', 'V', 'Instantaneous', false, false,
    ['Sorcerer', 'Wizard'],
    'Duplicate any 8th-level or lower spell instantaneously, or reshape reality at the risk of stress and never casting wish again.',
    `Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires. The basic use of this spell is to duplicate any other spell of 8th level or lower (requiring no components or casting time). Alternatively, you can create greater effects or reshape reality, though doing anything other than duplicating a spell causes wish stress.`
  ],

  // ================= REMAINING SRD 5.1 SPELLS =================
  [
    'Animal Friendship', 1, 'Enchantment', '1 action', '30 feet', 'V, S, M (a morsel of food)', '24 hours', false, false,
    ['Bard', 'Druid', 'Ranger', 'Tamer'],
    'Convince a beast with Intelligence 3 or less that you mean it no harm, charming it for 24 hours.',
    `This spell lets you convince a beast that you mean it no harm. Choose a beast that you can see within range. It must see and hear you. If the beast's Intelligence is 4 or higher, the spell fails. Otherwise, the beast must succeed on a Wisdom saving throw or be charmed by you for the spell's duration. If you or one of your companions harms the target, the spell ends.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, you can affect one additional beast for each slot level above 1st.`
  ],
  [
    'Color Spray', 1, 'Illusion', '1 action', 'Self (15-foot cone)', 'V, S, M (a pinch of powder or sand that is colored red, yellow, and blue)', '1 round', false, false,
    ['Sorcerer', 'Wizard'],
    'A dazzling array of flashing, colored light springs from your hand, blinding 6d10 hit points of creatures in a 15-foot cone.',
    `A dazzling array of flashing, colored light springs from your hand. Roll 6d10; the total is how many hit points of creatures this spell can affect. Creatures in a 15-foot cone originating from you are affected in ascending order of their current hit points (ignoring unconscious creatures and creatures that can't see). Starting with the creature that has the lowest current hit points, each creature affected by this spell is blinded until the end of your next turn.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d10 for each slot level above 1st.`
  ],
  [
    'Branding Smite', 2, 'Evocation', '1 bonus action', 'Self', 'V', 'Concentration, up to 1 minute', false, true,
    ['Paladin'],
    'Your next weapon hit deals an extra 2d6 radiant damage and causes the target to shed dim light and become visible.',
    `The next time you hit a creature with a weapon attack before this spell ends, the weapon gleams with astral radiance as you strike. The attack deals an extra 2d6 radiant damage to the target, which becomes visible if it's invisible, and the target sheds dim light in a 5-foot radius and can't become invisible until the spell ends.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the extra damage increases by 1d6 for each slot level above 2nd.`
  ],
  [
    'Greater Restoration', 5, 'Abjuration', '1 action', 'Touch', 'V, S, M (diamond dust worth at least 100 gp, which the spell consumes)', 'Instantaneous', false, false,
    ['Artificer', 'Bard', 'Cleric', 'Druid', 'Ranger', 'Tamer'],
    'Imbue a touched creature with positive energy to end one exhaustion level, charmed/petrified condition, curse, ability reduction, or max HP reduction.',
    `You imbue a creature you touch with positive energy to undo a debilitating effect. You can reduce the target's exhaustion level by one, or end one of the following effects on the target: one effect that charmed or petrified the target, one curse (including the target's attunement to a cursed magic item), any reduction to one of the target's ability scores, or one effect reducing the target's hit point maximum.`
  ],
  [
    'Mass Cure Wounds', 5, 'Evocation', '1 action', '60 feet', 'V, S', 'Instantaneous', false, false,
    ['Bard', 'Cleric', 'Druid'],
    'A wave of healing energy washes out from a point within 60 feet, restoring 3d8 + spellcasting modifier HP to up to six creatures.',
    `A wave of healing energy washes out from a point of your choice within range. Choose up to six creatures in a 30-foot-radius sphere centered on that point. Each target regains hit points equal to 3d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 6th level or higher, the healing increases by 1d8 for each slot level above 5th.`
  ],
  [
    'Raise Dead', 5, 'Necromancy', '1 hour', 'Touch', 'V, S, M (a diamond worth at least 500 gp, which the spell consumes)', 'Instantaneous', false, false,
    ['Bard', 'Cleric', 'Paladin', 'Thanatomancer'],
    'Return a dead creature that died within 10 days to life with 1 hit point, curing poisons and nonmagical diseases.',
    `You return a dead creature you touch to life, provided that it has been dead no longer than 10 days. If the creature's soul is both willing and at liberty to rejoin the body, the creature returns to life with 1 hit point. This spell also neutralizes any poisons and cures nonmagical diseases that affected the creature at the time it died, and closes all mortal wounds, though it doesn't restore missing body parts. Returning from the dead is an ordeal: the target takes a -4 penalty to all attack rolls, saving throws, and ability checks, reduced by 1 after each long rest.`
  ],
  [
    'Teleportation Circle', 5, 'Conjuration', '1 minute', '10 feet', 'V, M (rare chalks and inks infused with precious gems with 50 gp, which the spell consumes)', '1 round', false, false,
    ['Bard', 'Sorcerer', 'Wizard'],
    'Draw a 10-foot-diameter circle on the ground linking your location to a permanent teleportation circle on the same plane.',
    `As you cast the spell, you draw a 10-foot-diameter circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you. A shimmering portal opens within the circle you drew and remains open until the end of your next turn. Any creature that enters the portal instantly appears within 5 feet of the destination circle or in the nearest unoccupied space.`
  ],
  [
    'Forbiddance', 6, 'Abjuration', '10 minutes', 'Touch', 'V, S, M (a sprinkling of holy water, rare incense, and powdered ruby worth at least 1,000 gp)', '1 day', true, false,
    ['Cleric'],
    'Ward up to 40,000 square feet against planar travel/teleportation and damage celestials, elementals, fey, fiends, or undead entering the area.',
    `You create a ward against magical travel that protects up to 40,000 square feet of floor space to a height of 30 feet above the floor. For the duration, creatures can't teleport into the area or use portals, such as those created by the gate spell, to enter the area. In addition, the spell damages types of creatures that you choose when you cast it (celestials, elementals, fey, fiends, or undead), dealing 5d10 radiant or necrotic damage when entering or starting a turn there.`
  ],
  [
    'Freezing Sphere', 6, 'Evocation', '1 action', '300 feet', 'V, S, M (a small crystal sphere)', 'Instantaneous', false, false,
    ['Wizard'],
    'Hurl a frigid globe of energy that explodes in a 60-foot-radius sphere for 10d6 cold damage and freezes water.',
    `A frigid globe of cold energy streaks from your fingertips to a point of your choice within range, where it explodes in a 60-foot-radius sphere. Each creature within the area must make a Constitution saving throw. On a failed save, a creature takes 10d6 cold damage. On a successful save, it takes half as much damage. If the globe strikes a body of water or a liquid that is principally water, it freezes the liquid to a depth of 6 inches over an area 30 feet square. You can refrain from firing the globe after completing the spell, holding it for up to 1 minute.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 7th level or higher, the damage increases by 1d6 for each slot level above 6th.`,
    ["Otiluke's Freezing Sphere"]
  ],
  [
    'Guards and Wards', 6, 'Abjuration', '10 minutes', 'Touch', 'V, S, M (burning incense, a small measure of brimstone and oil, a knotted string, a small amount of umber hulk blood, and a small silver rod worth at least 10 gp)', '24 hours', false, false,
    ['Bard', 'Wizard'],
    'Ward up to 2,500 square feet of an interior space with fog, arcane locks, webs, confusion, and optional magical defenses.',
    `You create a ward that protects up to 2,500 square feet of floor space (an area 50 feet square, or one hundred 5-foot squares or twenty-five 10-foot squares). The warded area can be up to 20 feet tall, and shaped as you desire. You can ward several stories of a stronghold by dividing the area among them, filling corridors with fog, locking doors as with arcane lock, placing webs on stairs, and imposing stinking cloud, magic mouth, gust of wind, or suggestion effects.`
  ],
  [
    'Instant Summons', 6, 'Conjuration', '1 minute', 'Touch', 'V, S, M (a sapphire worth 1,000 gp)', 'Until dispelled', true, false,
    ['Wizard'],
    'Mark a nonmagical object up to 10 pounds and summon it to your hand later by crushing a linked 1,000 gp sapphire.',
    `You touch an object weighing 10 pounds or less whose longest dimension is 6 feet or less. The spell leaves an invisible mark on its surface and invisibly inscribes the name of the item on the sapphire you use as the material component. Each time you cast this spell, you must use a different sapphire. At any time thereafter, you can use your action to speak the item's name and crush the sapphire; the item instantly appears in your hand regardless of physical or planar distances, provided no other creature is holding or carrying it.`,
    ["Drawmij's Instant Summons"]
  ],
  [
    'Magic Jar', 6, 'Necromancy', '1 minute', 'Self', 'V, S, M (a gem, crystal, reliquary, or some other ornamental container worth at least 500 gp)', 'Until dispelled', false, false,
    ['Thanatomancer', 'Wizard'],
    'Project your soul into a gem container and attempt to possess the body of a humanoid within 100 feet.',
    `Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell's material component. While your soul inhabits the container, you are aware of your surroundings as if you were in the container's space. As an action, you can project yourself from the container to attempt to possess a humanoid's body within 100 feet of you (Charisma saving throw). You retain your alignment, Intelligence, Wisdom, Charisma, and class features while using the host body's physical statistics.`
  ],
  [
    'Programmed Illusion', 6, 'Illusion', '1 action', '120 feet', 'V, S, M (a bit of fleece and jade dust worth at least 25 gp)', 'Until dispelled', false, false,
    ['Bard', 'Wizard'],
    'Create a visual and audible illusion of up to a 30-foot cube that activates automatically when a specific trigger occurs.',
    `You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific condition occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes, then vanishes and remains dormant for 10 minutes before it can trigger again.`
  ],
  [
    'Transport via Plants', 6, 'Conjuration', '1 action', '10 feet', 'V, S', '1 round', false, false,
    ['Druid'],
    'Create a magical link between a Large or larger inanimate plant within 10 feet and another plant you have seen on the same plane.',
    `This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement.`
  ],
];

let created = 0;
let skipped = 0;

for (const row of SRD_SPELLS) {
  const [title, level, school, casting_time, range, components, duration, ritual, concentration, classes, summary, body, aliases] = row;
  const folder = FOLDER_BY_LEVEL[level];
  const safeFile = title.replace(/\//g, '-').replace(/&/g, 'and');
  const dir = path.join(spellsDir, folder);
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `${safeFile}.md`);

  if (fs.existsSync(target)) {
    skipped++;
    continue;
  }

  const levelLabel = level === 0 ? 'Cantrips' : folder.replace('-', ' ');
  const fm = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
  ];
  if (aliases && aliases.length > 0) {
    fm.push('aliases:');
    for (const a of aliases) fm.push(`  - "${a.replace(/"/g, '\\"')}"`);
  }
  fm.push(
    `level: ${level}`,
    `school: ${school}`,
    `casting_time: "${casting_time.replace(/"/g, '\\"')}"`,
    `range: "${range.replace(/"/g, '\\"')}"`,
    `duration: "${duration.replace(/"/g, '\\"')}"`,
    `components: "${components.replace(/"/g, '\\"')}"`,
    `ritual: ${ritual}`,
    `concentration: ${concentration}`,
    `source: "SRD 5.1"`,
    `source_type: SRD`,
    `summary: "${summary.replace(/"/g, '\\"')}"`,
    'classes:'
  );
  for (const c of classes) fm.push(`  - ${c}`);
  fm.push('---');

  const subtitle = level === 0
    ? `_${school} cantrip${ritual ? ' (ritual)' : ''}_`
    : `_${LEVEL_LABEL[level]} ${school.toLowerCase()}${ritual ? ' (ritual)' : ''}_`;

  const md = [
    fm.join('\n'),
    '',
    subtitle,
    '',
    body,
    '',
    '---',
    '',
    '## Related Content',
    '',
    `**Spell Level:** [[spells/${folder}|${levelLabel}]]`,
    '',
    `**School:** ${school}`,
    '',
    `**Available to:** ${classes.map(c => `[[${c}]]`).join(', ')}`,
    '',
    '**Source:** SRD 5.1',
    '',
  ].join('\n');

  fs.writeFileSync(target, md, 'utf8');
  created++;
}

console.log(`SRD 5.1 import complete: ${created} created, ${skipped} already existed.`);
