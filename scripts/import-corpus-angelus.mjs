import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'public', 'assets', 'aistudio', 'Paste_November_17__2026_-_9_45PM_69fe25c3');
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

// Exact canonical spell titles keyed by lowercase OCR-normalized heading
const CANONICAL_TITLES = {
  'aid of the holy mages': 'Aid of the Holy Mages',
  'almighty weapon': 'Almighty Weapon',
  'anchor': 'Anchor',
  'anchor point': 'Anchor Point',
  'angel feathers': 'Angel Feathers',
  'angelfall': 'Angelfall',
  'angelic execvtioner': 'Angelic Executioner',
  'angelic might': 'Angelic Might',
  'angelic smite': 'Angelic Smite',
  'awakeninc the flesh': 'Awakening the Flesh',
  'bind soul': 'Bind Soul',
  'blessed wine': 'Blessed Wine',
  'blessing of the martyr': 'Blessing of the Martyr',
  'blood of a seint': 'Blood of a Saint',
  'bone of the blessed': 'Bone of the Blessed',
  'burden of sins': 'Burden of Sins',
  'burning halo': 'Burning Halo',
  'calm mind': 'Calm Mind',
  'celestial chains': 'Celestial Chains',
  'chain smite': 'Chain Smite',
  'changing feather': 'Changing Feather',
  'charge of glory': 'Charge of Glory',
  'chime of arrogance': 'Chime of Arrogance',
  'cleaving smite': 'Cleaving Smite',
  'condemn thievery': 'Condemn Thievery',
  'conjure starfly': 'Conjure Starfly',
  'constant reshape': 'Constant Reshape',
  'curse of false armor': 'Curse of False Armor',
  'cutting leaves': 'Cutting Leaves',
  'dedicated': 'Dedicated',
  'delayed healing aura': 'Delayed Healing Aura',
  'dictate moralitty': 'Dictate Morality',
  'divime visions': 'Divine Visions',
  'endow life': 'Endow Life',
  'enhance perception': 'Enhance Perception',
  'exclusion': 'Exclusion',
  'eyes of the celestial warriors': 'Eyes of the Celestial Warriors',
  'faith burst': 'Faith Burst',
  'fall from heaven': 'Fall From Heaven',
  'final words': 'Final Words',
  'fountain of blessing': 'Fountain of Blessing',
  'garden of heaveen': 'Garden of Heaven',
  'gates of heaven': 'Gates of Heaven',
  'glass wings': 'Glass Wings',
  'golden fog': 'Golden Fog',
  'grace': 'Grace',
  'hallowed altar': 'Hallowed Altar',
  'healing ball': 'Healing Ball',
  "heretics' mark": "Heretic's Mark",
  'holy chains of the divine': 'Holy Chains of the Divine',
  'holy verdict: mercy': 'Holy Verdict: Mercy',
  'holy verdict: redemption': 'Holy Verdict: Redemption',
  'holy verdict: retribution': 'Holy Verdict: Retribution',
  'holy verdict: vengeance': 'Holy Verdict: Vengeance',
  'holy verdict: wrath': 'Holy Verdict: Wrath',
  'illusionary divine choir': 'Illusionary Divine Choir',
  'inure': 'Inure',
  "invisible to mind's eye": "Invisible to Mind's Eye",
  'judgment of the sun': 'Judgment of the Sun',
  'kingdom come': 'Kingdom Come',
  'lawmaker': 'Lawmaker',
  'licht at the end of the tunnel': 'Light at the End of the Tunnel',
  'light sensitivity': 'Light Sensitivity',
  'locate soul': 'Locate Soul',
  'look of righteousmess': 'Look of Righteousness',
  'mark of righteous return': 'Mark of Righteous Return',
  "martyr's spear": "Martyr's Spear",
  'mass purification': 'Mass Purification',
  'merciful gesture': 'Merciful Gesture',
  'merciful touch': 'Merciful Touch',
  'might of mature': 'Might of Nature',
  'might of the divine ruler': 'Might of the Divine Ruler',
  'mindful insight': 'Mindful Insight',
  'mnemonic residue': 'Mnemonic Residue',
  "night's veil": "Night's Veil",
  'persomal heaven': 'Personal Heaven',
  'piercing rain': 'Piercing Rain',
  'pillar of thousand blessings': 'Pillar of Thousand Blessings',
  'radiant storm': 'Radiant Storm',
  'radiant wayfinder': 'Radiant Wayfinder',
  'rain of holy fire': 'Rain of Holy Fire',
  'redeemer of souls': 'Redeemer of Souls',
  'redemption through pain': 'Redemption Through Pain',
  'reflecting ward': 'Reflecting Ward',
  'relentless fortitude': 'Relentless Fortitude',
  'scourging smite': 'Scourging Smite',
  'shape of the wind': 'Shape of the Wind',
  'shielded by the graves': 'Shielded by the Graves',
  'silver grapple': 'Silver Grapple',
  "sinner's mark": "Sinner's Mark",
  'slaying light': 'Slaying Light',
  'sleep of the sinful': 'Sleep of the Sinful',
  'solar apocalypse': 'Solar Apocalypse',
  'sphere of protection': 'Sphere of Protection',
  'sphere of vitality': 'Sphere of Vitality',
  'split spirit': 'Split Spirit',
  'teleport to companion': 'Teleport to Companion',
  "temple's denial": "Temple's Denial",
  'trick question': 'Trick Question',
  'twin of light': 'Twin of Light',
  'vital warning': 'Vital Warning',
  'weapon of holy divines': 'Weapon of Holy Divines',
  'weapon of the hero': 'Weapon of the Hero',
  'weaponification': 'Weaponification',
};

const ALIASES_BY_TITLE = {
  "Heretic's Mark": ["Heretics' Mark"],
  'Illusionary Divine Choir': ['Divine Choir'],
};

// Exact class lists from pages 162-164 of Corpus Angelus (corrected for the 2-column PDF wrap between Bard and Cleric)
const CLASS_SPELLS = {
  Bard: [
    'Inure', 'Look of Righteousness', 'Shielded by the Graves',
    'Blessed Wine', 'Final Words', 'Radiant Wayfinder', 'Trick Question',
    'Chime of Arrogance', 'Light at the End of the Tunnel', 'Mnemonic Residue', 'Weapon of the Hero',
    'Dedicated',
    'Dictate Morality',
    'Aid of the Holy Mages', 'Condemn Thievery', 'Illusionary Divine Choir', "Sinner's Mark",
    'Exclusion', "Invisible to Mind's Eye", 'Merciful Touch', 'Teleport to Companion',
    'Holy Verdict: Mercy', 'Holy Verdict: Redemption', 'Holy Verdict: Wrath',
    'Eyes of the Celestial Warriors', 'Lawmaker',
    'Holy Verdict: Retribution', 'Holy Verdict: Vengeance', 'Merciful Gesture', 'Solar Apocalypse',
  ],
  Cleric: [
    'Calm Mind', 'Faith Burst', 'Look of Righteousness', 'Shielded by the Graves',
    'Delayed Healing Aura', 'Final Words', "Heretic's Mark",
    'Angelic Executioner', 'Bone of the Blessed', 'Garden of Heaven',
    'Angel Feathers', 'Healing Ball', 'Sleep of the Sinful',
    'Angelic Might', 'Blessing of the Martyr', 'Dictate Morality', 'Locate Soul', 'Radiant Storm',
    'Blood of a Saint', 'Fountain of Blessing', "Martyr's Spear", 'Mass Purification', 'Sphere of Vitality',
    'Burning Halo', 'Divine Visions', 'Merciful Touch', 'Twin of Light',
    'Angelfall', 'Endow Life', 'Hallowed Altar', 'Holy Verdict: Mercy', 'Holy Verdict: Redemption', 'Holy Verdict: Wrath', 'Relentless Fortitude', "Temple's Denial",
    'Gates of Heaven', 'Holy Chains of the Divine', 'Lawmaker', 'Mark of Righteous Return', 'Pillar of Thousand Blessings', 'Rain of Holy Fire',
    'Grace', 'Holy Verdict: Retribution', 'Holy Verdict: Vengeance', 'Kingdom Come', 'Redeemer of Souls', 'Weapon of Holy Divines',
  ],
  Druid: [
    'Changing Feather', 'Conjure Starfly', 'Inure', 'Shape of the Wind',
    'Blessed Wine', 'Delayed Healing Aura',
    'Bone of the Blessed', 'Garden of Heaven', 'Piercing Rain',
    'Angel Feathers', 'Split Spirit',
    'Curse of False Armor', 'Might of Nature', 'Radiant Storm',
    'Fountain of Blessing', 'Golden Fog',
    'Awakening the Flesh', 'Cutting Leaves', 'Merciful Touch',
    'Endow Life', 'Holy Verdict: Mercy',
    'Eyes of the Celestial Warriors', 'Judgment of the Sun', 'Mark of Righteous Return',
    'Grace', 'Solar Apocalypse', 'Weapon of Holy Divines',
  ],
  Paladin: [
    'Celestial Chains', "Heretic's Mark",
    'Cleaving Smite', 'Weapon of the Hero',
    'Chain Smite', 'Glass Wings', 'Sleep of the Sinful',
    'Almighty Weapon', 'Angelic Might', 'Blessing of the Martyr', 'Reflecting Ward', 'Scourging Smite',
    'Angelic Smite', 'Burden of Sins', "Martyr's Spear", 'Might of the Divine Ruler',
  ],
  Ranger: [
    'Vital Warning',
    'Chime of Arrogance', 'Weapon of the Hero',
    'Anchor Point', 'Angel Feathers', 'Slaying Light',
    'Curse of False Armor', 'Enhance Perception',
    'Condemn Thievery', "Martyr's Spear",
  ],
  Sorcerer: [
    'Inure', 'Shape of the Wind', 'Silver Grapple',
    'Charge of Glory',
    'Angelic Executioner', 'Piercing Rain', 'Weapon of the Hero',
    'Glass Wings',
    'Personal Heaven', 'Radiant Storm',
    'Aid of the Holy Mages', 'Blood of a Saint', 'Golden Fog',
    'Exclusion', 'Twin of Light',
    'Holy Verdict: Wrath', 'Relentless Fortitude', "Temple's Denial",
    'Judgment of the Sun', 'Rain of Holy Fire',
    'Holy Verdict: Retribution', 'Holy Verdict: Vengeance', 'Solar Apocalypse',
  ],
  Warlock: [
    'Inure', 'Mindful Insight', 'Shielded by the Graves', 'Silver Grapple',
    'Charge of Glory', "Night's Veil",
    'Bone of the Blessed', 'Chime of Arrogance', 'Mnemonic Residue',
    'Anchor Point',
    'Blessing of the Martyr', 'Enhance Perception', 'Locate Soul',
    'Aid of the Holy Mages', 'Blood of a Saint', "Sinner's Mark", 'Sphere of Vitality',
    'Awakening the Flesh', 'Bind Soul', "Invisible to Mind's Eye", 'Twin of Light',
    'Holy Verdict: Mercy', 'Holy Verdict: Redemption', 'Holy Verdict: Wrath', 'Weaponification',
    'Fall From Heaven', 'Gates of Heaven', 'Holy Chains of the Divine',
    'Holy Verdict: Retribution', 'Holy Verdict: Vengeance', 'Merciful Gesture', 'Redeemer of Souls', 'Redemption Through Pain', 'Weapon of Holy Divines',
  ],
  Wizard: [
    'Calm Mind', 'Changing Feather', 'Conjure Starfly', 'Mindful Insight', 'Silver Grapple',
    "Night's Veil", 'Radiant Wayfinder', 'Trick Question',
    'Anchor', 'Mnemonic Residue',
    'Anchor Point', 'Split Spirit', 'Sphere of Protection',
    'Enhance Perception', 'Personal Heaven', 'Reflecting Ward',
    'Aid of the Holy Mages', 'Burden of Sins', 'Light Sensitivity',
    'Bind Soul', 'Exclusion', "Invisible to Mind's Eye", 'Teleport to Companion',
    'Relentless Fortitude', 'Weaponification',
    'Eyes of the Celestial Warriors',
    'Constant Reshape', 'Merciful Gesture', 'Redemption Through Pain',
  ],
};

// Map title -> sorted classes list
const CLASSES_BY_TITLE = new Map();
for (const [cls, list] of Object.entries(CLASS_SPELLS)) {
  for (const title of list) {
    if (!CLASSES_BY_TITLE.has(title)) CLASSES_BY_TITLE.set(title, []);
    CLASSES_BY_TITLE.get(title).push(cls);
  }
}

const cyrMap = {
  'А': 'A', 'Α': 'A', 'В': 'B', 'Β': 'B', 'С': 'C', 'Е': 'E', 'Ε': 'E', 'Н': 'H', 'Η': 'H',
  'І': 'I', 'Ι': 'I', 'К': 'K', 'Κ': 'K', 'М': 'M', 'Μ': 'M', 'Ν': 'N', 'О': 'O', 'Ο': 'O',
  'Р': 'P', 'Ρ': 'P', 'Т': 'T', 'Τ': 'T', 'Х': 'X', 'Χ': 'X', 'Ζ': 'Z',
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'і': 'i',
  'П': 'N', 'Π': 'N', 'п': 'n', 'ρ': 'd', 'т': 't',
};

function normCyr(str) {
  return str.replace(/[АΑВΒСВЕΕНΗІΙКΚМΜΝОΟРΡТΤХΧΖаеорсхіПΠпρт]/g, ch => cyrMap[ch] || ch);
}

// Bulleted section start prefixes per spell (so list items format as markdown bullets)
const BULLET_RULES = {
  Grace: {
    introEnd: 'for the duration:',
    bullets: [
      'Successful weapon attacks',
      'Creatures have advantage on weapon',
      'Creatures have advantage against being',
      'Creatures regain 1 hit point',
      'Creatures have resistance against necrotic',
      'The number of hit points regained',
    ],
    outroStart: 'Evil aberrations,',
  },
  'Merciful Touch': {
    introEnd: 'takes place:',
    bullets: [
      'It regains 10 hit points.',
      'A condition of your choice',
      'If the target is at the brink',
    ],
  },
  'Might of Nature': {
    introEnd: 'benefits for the duration:',
    bullets: [
      'One of its ability scores',
      'It gains a +2 bonus to AC.',
      'It gains temporary hit points',
    ],
    outroStart: "The chosen creature's challenge rating",
  },
  'Pillar of Thousand Blessings': {
    introEnd: 'if they are 8th-level spells.',
    bullets: [
      'You have advantage on Strength,',
      'You have advantage on Intelligence,',
      'You have advantage on attack rolls.',
      'Your weapon attacks deal an extra 1d4 damage.',
      'Your weapon attacks are magical.',
      'Your weapon attacks deal an additional 2 damage',
      'Your carrying capacity is doubled.',
      'Choose one ability. You have advantage',
      'You gain 4 temporary hit points',
      'Your spell save DC increases by 1.',
      'If you cast a spell with a range',
      'Your spell attacks deal 2d4 extra damage.',
      'Your spells that deal damage in an area',
      'You can change the damage type of a spell',
      'If you deal acid damage to a creature',
      'If you deal poison damage to a creature',
      'If you deal lightning damage to a creature',
      'If you deal thunder damage to a creature',
      'Your speed increases by 10 feet.',
      'You gain the ability to breathe underwater.',
      'You gain a swimming speed of 30 feet.',
      'You gain a flying speed of 30 feet.',
      'You gain the benefits of the spider climb',
      'You gain resistance to one damage type',
      'You gain resistance to bludgeoning, piercing',
      'You gain the benefits of the death ward',
      'You need to succeed on two death saving',
      'Your jump distance is tripled.',
      'Melee weapon attacks against you',
      'Ranged weapon attacks against you',
      'Melee spell attacks against you',
      'Ranged spell attacks against you',
      'Your weapon attacks score a critical hit',
      'When you are subjected to damage, roll 1d6',
      'You can touch a creature as a bonus action',
      'Each time you heal a creature,',
      'Each creature affected by your healing spells',
      'You have darkvision out to a range of 60 feet.',
      'You become invisible.',
      'You gain the benefits of the tongues',
      'You have advantage on your initiative rolls.',
    ],
  },
  'Shape of the Wind': {
    introEnd: 'range:',
    bullets: [
      'A creature of your choice within',
      'Ranged weapon attacks passing through',
      'Nonmagical flames go out.',
      'You can warm the area up or cool it down.',
    ],
  },
  'Twin of Light': {
    introEnd: 'properties:',
    bullets: [
      'It has 40 hit points',
      'It has resistance to bludgeoning',
      'Its proficiency bonus is +4.',
      'It can make two melee weapon',
      'It has no Strength score',
      'It has a flying (hover) speed',
    ],
  },
  Weaponification: {
    introEnd: 'actions and benefits:',
    bullets: [
      'Attacks made with the weapon are magical',
      'If the weapon is a ranged or thrown weapon',
      'If the weapon is a melee weapon',
      'The wielder can communicate with the weapon',
      'When a creature holds the weapon',
      'The weapon can teleport back to the hands',
      "When the weapon's wielder takes the Attack",
      "The wielder can't be possessed",
      'The weapon can use its action to imbue',
    ],
    outroStart: 'You can have only one weapon',
  },
};

function cleanOcrText(text) {
  return normCyr(text)
    .replace(/\r/g, '')
    .replace(/\b15-footradius\b/g, '15-foot-radius')
    .replace(/\b60-\s+foot\b/g, '60-foot')
    .replace(/\boror\b/g, 'or')
    .replace(/\bona\b/g, 'on a')
    .replace(/\banda\b/g, 'and a')
    .replace(/\bwitha\b/g, 'with a')
    .replace(/\bhavea\b/g, 'have a')
    .replace(/\bofthe\b/g, 'of the')
    .replace(/\bofwhich\b/g, 'of which')
    .replace(/\bsouland\b/g, 'soul and')
    .replace(/\btransforma\b/g, 'transform a')
    .replace(/\bforma\b/g, 'form a')
    .replace(/\bIfthis\b/g, 'If this')
    .replace(/\bof6th\b/g, 'of 6th')
    .replace(/\bdeal1d8\b/g, 'deal 1d8')
    .replace(/\bYourjump\b/g, 'Your jump')
    .replace(/\bspellyou\b/g, 'spell you')
    .replace(/\ban Strength\b/g, 'a Strength')
    .replace(/\bbelonging the\b/g, 'belonging to the')
    .replace(/([a-z])\.([A-Z])/g, '$1. $2')
    .replace(/,([a-zA-Z])/g, ', $1')
    .replace(/\+20\b/g, '+ 20')
    .replace(/V S M \(/g, 'V, S, M (')
    .replace(/\s+/g, ' ')
    .trim();
}

function reconstructBody(title, rawLines) {
  // Drop stray page number lines (78, 84, 163-184)
  const lines = rawLines
    .map(l => l.trim())
    .filter(l => l && !/^(78|84|1[6-8]\d)$/.test(l));

  // If this spell has explicit bullet rules, merge lines per bullet cleanly
  const bulletSpec = BULLET_RULES[title];
  if (bulletSpec) {
    const joined = cleanOcrText(lines.join(' '));
    // Split on known markers
    const parts = [];
    let rest = joined;
    const introIdx = rest.indexOf(bulletSpec.introEnd);
    if (introIdx !== -1) {
      const cut = introIdx + bulletSpec.introEnd.length;
      const introText = rest.slice(0, cut).trim();
      // Special split inside Pillar of Thousand Blessings intro if needed
      if (title === 'Pillar of Thousand Blessings') {
        parts.push(introText.replace(' The pillar offers special benefits', '\n\nThe pillar offers special benefits'));
      } else {
        parts.push(introText);
      }
      rest = rest.slice(cut).trim();
    }
    let outro = '';
    if (bulletSpec.outroStart) {
      const outroIdx = rest.indexOf(bulletSpec.outroStart);
      if (outroIdx !== -1) {
        outro = rest.slice(outroIdx).trim();
        rest = rest.slice(0, outroIdx).trim();
      }
    }
    const bulletPositions = [];
    let searchFrom = 0;
    for (const prefix of bulletSpec.bullets) {
      const idx = rest.indexOf(prefix, searchFrom);
      if (idx === -1) throw new Error(`Bullet prefix not found in ${title}: ${prefix}`);
      bulletPositions.push(idx);
      searchFrom = idx + prefix.length;
    }
    const bullets = [];
    for (let i = 0; i < bulletPositions.length; i++) {
      const start = bulletPositions[i];
      const end = i + 1 < bulletPositions.length ? bulletPositions[i + 1] : rest.length;
      bullets.push(`- ${rest.slice(start, end).trim()}`);
    }
    parts.push(bullets.join('\n'));
    if (outro) {
      if (title === 'Grace') {
        parts.push(outro.replace('If you are within 150 feet', '\n\nIf you are within 150 feet').replace('Evil aberrations,', 'Evil aberrations,'));
      } else {
        parts.push(outro);
      }
    }
    return parts.join('\n\n');
  }

  // Standard paragraph reconstruction:
  // Detect paragraph breaks when a line ends with sentence punctuation AND either starts a new section ("At Higher Levels.")
  // OR is noticeably shorter than the PDF column width (meaning the first word of the next line would have fit!)
  const paragraphs = [];
  let current = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Handle hyphenation at end of line (like "60-")
    if (line.endsWith('-') && i + 1 < lines.length) {
      const next = lines[i + 1];
      line = line + next;
      i++;
    }
    current.push(line);

    const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
    if (!nextLine) break;

    const firstWordNext = nextLine.split(/\s+/)[0];
    const endsSentence = /[.!?]$/.test(line);
    const nextStartsHigher = /^At Higher Levels\./i.test(nextLine);
    const fitsPreviousLine = line.length + 1 + firstWordNext.length <= 56;

    if (nextStartsHigher || (endsSentence && fitsPreviousLine)) {
      paragraphs.push(cleanOcrText(current.join(' ')));
      current = [];
    }
  }
  if (current.length > 0) {
    paragraphs.push(cleanOcrText(current.join(' ')));
  }

  return paragraphs
    .map(p => p.replace(/^At Higher Levels\.\s*/i, '**At Higher Levels.** '))
    .join('\n\n');
}

function makeSummary(title, body) {
  // Take first 1-2 sentences cleanly without markdown bullets
  const plain = body
    .replace(/\*\*At Higher Levels\.\*\*/g, '')
    .replace(/^- /gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const sentences = plain.match(/[^.!?]+[.!?]+/g) || [plain];
  let summary = sentences[0].trim();
  if (summary.length < 75 && sentences.length > 1) {
    const two = `${sentences[0].trim()} ${sentences[1].trim()}`;
    if (two.length <= 185) summary = two;
  }
  if (summary.length > 185) {
    summary = summary.slice(0, 182).replace(/\s+\S*$/, '') + '...';
  }
  return summary;
}

const rawLines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/);
const levelRe = /^(\d+(?:st|nd|rd|th)-level\s+[a-z]+|[A-Za-z]+\s+cantrip)(?:\s*\(ritual\))?$/i;

const spellStarts = [];
for (let i = 297; i < rawLines.length; i++) {
  if (levelRe.test(rawLines[i].trim())) {
    spellStarts.push(i);
  }
}

console.log(`Detected ${spellStarts.length} Corpus Angelus spells in source text.`);

// Delete old mismatched 5th-level/Radiant Storm.md stub before writing 4th-level/Radiant Storm.md
const oldRadiantStorm = path.join(spellsDir, '5th-level', 'Radiant Storm.md');
if (fs.existsSync(oldRadiantStorm)) {
  fs.unlinkSync(oldRadiantStorm);
  console.log('Removed outdated 5th-level/Radiant Storm.md stub (true spell is 4th-level Corpus Angelus).');
}

let created = 0;
let updated = 0;

for (let idx = 0; idx < spellStarts.length; idx++) {
  const metaIdx = spellStarts[idx];
  const titleIdx = metaIdx - 1;
  const endIdx = idx + 1 < spellStarts.length ? spellStarts[idx + 1] - 1 : rawLines.length;

  const rawTitleNorm = normCyr(rawLines[titleIdx].trim()).toLowerCase();
  const title = CANONICAL_TITLES[rawTitleNorm];
  if (!title) {
    throw new Error(`Unmapped spell title at line ${titleIdx + 1}: "${rawLines[titleIdx].trim()}" (norm: "${rawTitleNorm}")`);
  }

  const metaLine = rawLines[metaIdx].trim();
  const ritual = /\(ritual\)/i.test(metaLine);
  const metaClean = metaLine.replace(/\s*\(ritual\)/i, '').trim();

  let level = 0;
  let school = '';
  const cantripMatch = metaClean.match(/^([A-Za-z]+)\s+cantrip$/i);
  if (cantripMatch) {
    level = 0;
    school = cantripMatch[1][0].toUpperCase() + cantripMatch[1].slice(1).toLowerCase();
  } else {
    const lvlMatch = metaClean.match(/^(\d+)(?:st|nd|rd|th)-level\s+([A-Za-z]+)$/i);
    if (!lvlMatch) throw new Error(`Cannot parse meta line for ${title}: "${metaLine}"`);
    level = Number(lvlMatch[1]);
    school = lvlMatch[2][0].toUpperCase() + lvlMatch[2].slice(1).toLowerCase();
  }

  // Parse Casting Time, Range, Components, Duration (which can span 2-3 wrapped lines)
  const blockLines = rawLines
    .slice(metaIdx + 1, endIdx)
    .filter(l => !/^\s*(78|84|1[6-8]\d)\s*$/.test(l));
  const headers = {};
  let currentHeader = null;
  let bodyStartLine = 0;

  for (let b = 0; b < blockLines.length; b++) {
    const l = blockLines[b].trim();
    const hm = l.match(/^(Casting Time|Range|Components|Duration):\s*(.*)$/i);
    if (hm) {
      currentHeader = hm[1].toLowerCase().replace(/\s+/g, '_');
      headers[currentHeader] = hm[2].trim();
      if (currentHeader === 'duration') {
        bodyStartLine = b + 1;
        break;
      }
    } else if (currentHeader) {
      headers[currentHeader] += ' ' + l;
    }
  }

  // Handle multi-line Duration? None of Duration values wrap, verify just in case
  const casting_time = cleanOcrText(headers.casting_time || '');
  const range = cleanOcrText(headers.range || '');
  const components = cleanOcrText(headers.components || '');
  const duration = cleanOcrText(headers.duration || '');
  const concentration = /^Concentration,/i.test(duration);

  if (!casting_time || !range || !components || !duration) {
    throw new Error(`Missing header fields on ${title}: ${JSON.stringify(headers)}`);
  }

  const classes = (CLASSES_BY_TITLE.get(title) || []).slice().sort();
  if (classes.length === 0) {
    throw new Error(`No classes found for ${title}`);
  }

  const body = reconstructBody(title, blockLines.slice(bodyStartLine));
  const summary = makeSummary(title, body);
  const aliases = ALIASES_BY_TITLE[title] || [];

  const folder = FOLDER_BY_LEVEL[level];
  const levelLabel = level === 0 ? 'Cantrips' : folder.replace('-', ' ');
  const safeFile = title.replace(/\//g, '-').replace(/&/g, 'and').replace(/:\s*/g, ' - ');
  const target = path.join(spellsDir, folder, `${safeFile}.md`);

  const existed = fs.existsSync(target);
  const fm = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
  ];
  if (aliases.length > 0) {
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
    'source: "Corpus Angelus"',
    'source_type: third-party',
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
    '**Source:** Corpus Angelus',
    '',
  ].join('\n');

  fs.writeFileSync(target, md, 'utf8');
  if (existed) updated++;
  else created++;
}

console.log(`Corpus Angelus import complete: ${created} created, ${updated} updated.`);
