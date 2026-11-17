import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const pastePath = path.join(rootDir, 'public', 'assets', 'aistudio', 'Paste_November_17__2026_-_12_35AM_22f1d8f5');
const spellsDir = path.join(rootDir, 'content', 'spells');

const rawLines = fs.readFileSync(pastePath, 'utf8').split(/\r?\n/);
const L = (start, end) => rawLines.slice(start - 1, end);

// Exact 1-indexed line segments per spell (preserving verbatim rules text while stitching PDF two-column splits)
const spellSegments = [
  { name: 'Arcanomagnetic Storm', segs: [[688, 714]] },
  { name: 'Aura of Impurity', segs: [[715, 731]] },
  { name: 'Acid Rain', segs: [[732, 748]] },
  { name: 'Arcanomagnetic Repulsion', segs: [[749, 769]] },
  { name: "Can't Trip", segs: [[774, 788]] },
  { name: "Can'trip", segs: [[789, 805]] },
  { name: 'Cannotrip', segs: [[806, 815], [906, 910]] },
  { name: 'Blinding Radiance', segs: [[816, 834]] },
  { name: 'Bone Cage', segs: [[835, 861], [771, 773]], subclassLists: ['Necromancer'] },
  { name: 'Conjure Anomaly', segs: [[863, 888]] },
  { name: 'Corrupting Ichor', segs: [[889, 905]] },
  { name: 'Chameleon Skin', segs: [[911, 928]] },
  { name: 'Concussion', segs: [[929, 943]] },
  { name: 'Dreamwalk', segs: [[945, 960]] },
  { name: 'Eelskin', segs: [[961, 981]] },
  { name: 'Daydream', segs: [[982, 1004]] },
  { name: 'Depth Charge', segs: [[1005, 1022]] },
  { name: 'Enrage', segs: [[1028, 1063]] },
  { name: 'Ferocious Strike', segs: [[1064, 1070], [1157, 1163]] },
  { name: 'Endoleech', segs: [[1071, 1086]] },
  { name: 'Endure', segs: [[1087, 1113], [1024, 1027]] },
  { name: 'Fixit', segs: [[1138, 1156]] },
  { name: 'Feverskin', segs: [[1164, 1182]] },
  { name: "Firther's Shadow", segs: [[1183, 1196], [1115, 1137]] },
  { name: 'Frogskin', segs: [[1212, 1236]] },
  { name: 'Fungal Infection', segs: [[1237, 1243], [1332, 1369]] },
  { name: 'Flare', segs: [[1244, 1265]] },
  { name: 'Flipperform', segs: [[1266, 1280]] },
  { name: 'Food Coma', segs: [[1281, 1289], [1198, 1211]] },
  { name: 'Gravity Smash', segs: [[1307, 1331]] },
  { name: 'Gravity Repulsion', segs: [[1370, 1376], [1291, 1306]] },
  { name: 'Inequality', segs: [[1399, 1425], [1517, 1520]] },
  { name: 'Howl', segs: [[1426, 1444]] },
  { name: "Humperdink's Halitosis", segs: [[1445, 1463]] },
  { name: 'Incorporeality', segs: [[1464, 1470], [1378, 1398]] },
  { name: 'Lungburst', segs: [[1475, 1498]] },
  { name: 'Magnetite Shard', segs: [[1499, 1516]] },
  { name: 'Influenza', segs: [[1521, 1548]], subclassLists: ['Necromancer'] },
  { name: 'Initiative', segs: [[1549, 1562], [1472, 1474]] },
  { name: 'Mireball', segs: [[1589, 1610], [1704, 1706]] },
  { name: 'Magnetobolt', segs: [[1611, 1626]] },
  { name: 'Mass Leech', segs: [[1627, 1644]] },
  { name: 'Mechamagic', segs: [[1645, 1655], [1564, 1588]] },
  { name: 'Power Word Shield', segs: [[1668, 1683]] },
  { name: 'Preserve', segs: [[1684, 1703], [1796, 1803]] },
  { name: 'Mortiferous Pulse', segs: [[1707, 1722]] },
  { name: 'Peppermint Plate', segs: [[1723, 1739]] },
  { name: 'Pins & Needles', segs: [[1740, 1746], [1657, 1667]] },
  { name: 'Riptide', segs: [[1748, 1767]], subclassLists: ['Infuser'] },
  { name: 'Shackles of Pain', segs: [[1768, 1785]] },
  { name: 'Shielding Word', segs: [[1786, 1795], [1884, 1893]] },
  { name: 'Primal Scent', segs: [[1804, 1821]] },
  { name: 'Protection', segs: [[1822, 1839]] },
  { name: 'Spore Cloud', segs: [[1841, 1854]] },
  { name: "Stalker's Eye", segs: [[1855, 1869]] },
  { name: 'Stench', segs: [[1870, 1883], [1977, 1983]] },
  { name: 'Smokescreen', segs: [[1894, 1913]] },
  { name: 'Spark', segs: [[1914, 1929]] },
  { name: 'Switcheroo', segs: [[1931, 1953]] },
  { name: 'Tentacle Lash', segs: [[1954, 1976]] },
  { name: 'Sugar Rush', segs: [[1984, 2001]] },
  { name: 'Swarm', segs: [[2002, 2018]] },
  { name: 'Water Whip', segs: [[2047, 2063]] },
  { name: 'The Bends', segs: [[2064, 2080]] },
  { name: 'Totem Arrows', segs: [[2081, 2104], [2020, 2046]] },
  { name: 'Zippit!', segs: [[2123, 2147]], subclassLists: ['Splicer'] },
  { name: 'Weavebend', segs: [[2148, 2170]] },
  { name: 'Weave Entanglement', segs: [[2171, 2194], [2106, 2122]] },
];

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

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

function cleanText(s) {
  return s
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/10-footcube/g, '10-foot cube')
    .replace(/\s+/g, ' ')
    .trim();
}

function joinWrappedLines(lines) {
  let out = '';
  for (const raw of lines) {
    const l = cleanText(raw);
    if (!l) continue;
    if (!out) {
      out = l;
    } else if (out.endsWith('-')) {
      // keep hyphen for compound words like 10-foot, cranberry-coloured
      out += l;
    } else {
      out += ' ' + l;
    }
  }
  return out;
}

function formatBodyParagraphs(bodyLines) {
  // Handle special tables and bullet lists cleanly
  const paragraphs = [];
  let buf = [];
  const flushBuf = () => {
    if (buf.length > 0) {
      paragraphs.push(joinWrappedLines(buf));
      buf = [];
    }
  };

  let i = 0;
  while (i < bodyLines.length) {
    const line = cleanText(bodyLines[i]);
    if (!line || line === '*See Appendix B') {
      i++;
      continue;
    }

    // Bone Cage table
    if (line === 'Size Temporary Hit Points Gained') {
      flushBuf();
      const rows = ['| Size | Temporary Hit Points Gained |', '| --- | --- |'];
      i++;
      while (i < bodyLines.length && /^(Small|Medium|Large|Huge|Gargantuan)\s+/.test(cleanText(bodyLines[i]))) {
        const [sz, hp] = cleanText(bodyLines[i]).split(/\s+/, 2);
        rows.push(`| ${sz} | ${hp} |`);
        i++;
      }
      paragraphs.push(rows.join('\n'));
      continue;
    }

    // Firther's Shadow d6 table
    if (line === 'd6 Thing Learnt') {
      flushBuf();
      const rows = ['| d6 | Thing Learnt |', '| --- | --- |'];
      i++;
      while (i < bodyLines.length && /^[1-6]\s+/.test(cleanText(bodyLines[i]))) {
        let entry = cleanText(bodyLines[i]);
        const num = entry.slice(0, 1);
        let text = entry.slice(2).trim();
        while (
          i + 1 < bodyLines.length &&
          !/^[1-6]\s+/.test(cleanText(bodyLines[i + 1])) &&
          !/^On a successful/.test(cleanText(bodyLines[i + 1]))
        ) {
          i++;
          text += ' ' + cleanText(bodyLines[i]);
        }
        rows.push(`| ${num} | ${text} |`);
        i++;
      }
      paragraphs.push(rows.join('\n'));
      continue;
    }

    // Weave Entanglement d10 table
    if (line === 'd10 Effect') {
      flushBuf();
      const rows = ['| d10 | Effect |', '| --- | --- |'];
      i++;
      while (i < bodyLines.length) {
        const cur = cleanText(bodyLines[i]);
        if (cur === '*See Appendix B') {
          i++;
          continue;
        }
        if (!/^(\d{1,2})\s+/.test(cur)) break;
        const m = cur.match(/^(\d{1,2})\s+(.*)$/);
        if (!m) break;
        const num = m[1];
        let text = m[2];
        while (
          i + 1 < bodyLines.length &&
          cleanText(bodyLines[i + 1]) !== '*See Appendix B' &&
          !/^(\d{1,2})\s+/.test(cleanText(bodyLines[i + 1])) &&
          !/^Any additional/.test(cleanText(bodyLines[i + 1]))
        ) {
          i++;
          text += ' ' + cleanText(bodyLines[i]);
        }
        rows.push(`| ${num} | ${text} |`);
        i++;
      }
      paragraphs.push(rows.join('\n'));
      continue;
    }

    // Bullet item
    if (line.startsWith('• ')) {
      flushBuf();
      const bulletLines = [line.slice(2).trim()];
      i++;
      while (
        i < bodyLines.length &&
        !cleanText(bodyLines[i]).startsWith('• ') &&
        !/^(An affected creature|You can end this spell|The spell ends if|At Higher Levels)/.test(cleanText(bodyLines[i]))
      ) {
        bulletLines.push(bodyLines[i]);
        i++;
      }
      let item = joinWrappedLines(bulletLines);
      item = item.replace(/^([A-Z][A-Za-z' ]+\.)\s*/, '**$1** ');
      paragraphs.push(`- ${item}`);
      continue;
    }

    // Paragraph-starting subheadings / lead-ins
    if (/^(At Higher Levels\.|Magnetic Pulse\.|Slimy\.|Gravity Pulse\.|Cat\.|Elk\.|Hawk\.|Hogweed\.|Psilocybin\.|Roc\.|Snake\.|Spider\.|Alternatively,|When you reach|The spell creates|The number of creatures|The maximum level|This spell’s damage|This spell's damage|This spell augments|A creature that succeeds|Any additional spell|In addition,|As an action on a subsequent|At the end of each of its turns|Creatures other than|The fumes linger|Each creature that starts|The area is difficult terrain|If your concentration is broken|The aberration is friendly|If the target did not move|Whilst poisoned|For the duration, your walking speed|While enraged, a target|An enraged creature|With a flare|If the creature is still alive|When the spell ends|A creature that does not need)/.test(line)) {
      flushBuf();
    }

    buf.push(line);
    i++;
  }
  flushBuf();

  // Style bold lead-ins and merge bullet blocks cleanly
  const out = [];
  for (let idx = 0; idx < paragraphs.length; idx++) {
    let p = paragraphs[idx];
    p = p.replace(
      /^(At Higher Levels\.|Magnetic Pulse\.|Slimy\.|Gravity Pulse\.|Cat\.|Elk\.|Hawk\.|Hogweed\.|Psilocybin\.|Roc\.|Snake\.|Spider\.)\s*/,
      '**$1** '
    );
    if (p.startsWith('- ') && out.length > 0 && out[out.length - 1].startsWith('- ')) {
      out[out.length - 1] += '\n' + p;
    } else {
      out.push(p);
    }
  }
  return out.join('\n\n');
}

function makeSummary(title, bodyText) {
  const firstPara = bodyText.split('\n\n').find(p => p && !p.startsWith('|') && !p.startsWith('- ')) || '';
  const sentences = firstPara.replace(/\*\*/g, '').match(/[^.!?]+[.!?]+/g);
  let s = sentences ? sentences.slice(0, 2).join(' ').trim() : firstPara;
  if (s.length > 180) {
    s = s.slice(0, 177).replace(/\s+\S*$/, '') + '...';
  }
  return s || `${title} spell from Appendix B.`;
}

let createdCount = 0;
let updatedCount = 0;

for (const spec of spellSegments) {
  const lines = spec.segs.flatMap(([s, e]) => L(s, e));
  // Remove title line (line 0)
  const rawTitle = cleanText(lines[0]);
  if (rawTitle !== spec.name) {
    throw new Error(`Title mismatch: expected "${spec.name}", got "${rawTitle}"`);
  }

  const subtitle = cleanText(lines[1]);
  let level = 0;
  let school = '';
  let altSchool = null;
  let ritual = false;

  const lvlMatch = subtitle.match(/^(\d+)(?:st|nd|rd|th)-level\s+([a-z]+)(\*)?(?:\s*\(([^)]+)\))?/i);
  const cantripMatch = subtitle.match(/^([A-Z][a-z]+)(\*)?\s+cantrip(?:\s*\(([^)]+)\))?/i);

  if (lvlMatch) {
    level = Number(lvlMatch[1]);
    school = cap(lvlMatch[2]);
    const note = lvlMatch[4] || '';
    if (/ritual/i.test(note)) ritual = true;
    const alt = note.match(/\*can be replaced with ([a-z]+)/i);
    if (alt) altSchool = cap(alt[1]);
  } else if (cantripMatch) {
    level = 0;
    school = cap(cantripMatch[1]);
    const note = cantripMatch[3] || '';
    const alt = note.match(/\*can be replaced with ([a-z]+)/i);
    if (alt) altSchool = cap(alt[1]);
  } else {
    throw new Error(`Could not parse subtitle for ${spec.name}: "${subtitle}"`);
  }

  // Parse Casting Time, Range, Components, Duration, Class (handling multi-line wrapped fields)
  let idx = 2;
  const metaLines = [];
  while (idx < lines.length) {
    const cl = cleanText(lines[idx]);
    metaLines.push(cl);
    idx++;
    if (/^Class:/i.test(cl)) {
      // Class list can wrap to the next line (e.g. "Wizard")
      while (idx < lines.length && /^(Wizard|Warlock|Sorcerer|Tamer|Paladin|Ranger|Druid|Cleric|Bard)$/i.test(cleanText(lines[idx]))) {
        metaLines[metaLines.length - 1] += ' ' + cleanText(lines[idx]);
        idx++;
      }
      break;
    }
  }

  const metaJoined = [];
  for (const ml of metaLines) {
    if (/^(Casting Time|Range|Components|Duration|Class):/i.test(ml)) {
      metaJoined.push(ml);
    } else if (metaJoined.length > 0) {
      metaJoined[metaJoined.length - 1] += ' ' + ml;
    }
  }

  const metaMap = {};
  for (const mj of metaJoined) {
    const m = mj.match(/^(Casting Time|Range|Components|Duration|Class):\s*(.*)$/i);
    if (m) metaMap[m[1].toLowerCase()] = m[2].trim();
  }

  const casting_time = metaMap['casting time'];
  const range = metaMap['range'];
  const components = metaMap['components'];
  const duration = metaMap['duration'];
  const classesRaw = metaMap['class'];

  if (!casting_time || !range || !components || !duration || !classesRaw) {
    throw new Error(`Missing metadata field on ${spec.name}: ${JSON.stringify(metaMap)}`);
  }

  const concentration = /^Concentration/i.test(duration);
  const classes = classesRaw.split(',').map(c => c.trim()).filter(Boolean);
  const bodyFormatted = formatBodyParagraphs(lines.slice(idx));
  const summary = makeSummary(spec.name, bodyFormatted);
  const folder = FOLDER_BY_LEVEL[level];
  const levelLabel = level === 0 ? 'Cantrips' : folder.replace('-', ' ');

  const fmLines = [
    '---',
    `title: "${spec.name}"`,
    `level: ${level}`,
    `school: ${school}`,
  ];
  if (altSchool) fmLines.push(`alternate_school: ${altSchool}`);
  fmLines.push(
    `casting_time: "${casting_time.replace(/"/g, '\\"')}"`,
    `range: "${range.replace(/"/g, '\\"')}"`,
    `duration: "${duration.replace(/"/g, '\\"')}"`,
    `components: "${components.replace(/"/g, '\\"')}"`,
    `ritual: ${ritual}`,
    `concentration: ${concentration}`,
    `source: "Heliana's Guide to Monster Hunting (Appendix B)"`,
    `source_type: third-party`,
    `summary: "${summary.replace(/"/g, '\\"')}"`,
    'classes:'
  );
  for (const c of classes) fmLines.push(`  - ${c}`);
  if (spec.subclassLists && spec.subclassLists.length > 0) {
    fmLines.push('subclass_spell_lists:');
    for (const sc of spec.subclassLists) fmLines.push(`  - ${sc}`);
  }
  fmLines.push('---');

  const md = [
    fmLines.join('\n'),
    '',
    `_${subtitle}_`,
    '',
    bodyFormatted,
    '',
    '---',
    '',
    '## Related Content',
    '',
    `**Spell Level:** [[spells/${folder}|${levelLabel}]]`,
    '',
    `**School:** ${school}${altSchool ? ` (or ${altSchool})` : ''}`,
    '',
    `**Available to:** ${classes.map(c => `[[${c}]]`).join(', ')}`,
    '',
    `**Source:** Heliana's Guide to Monster Hunting (Appendix B)`,
    '',
  ].join('\n');

  const dir = path.join(spellsDir, folder);
  fs.mkdirSync(dir, { recursive: true });
  const safeFileName = spec.name.replace(/&/g, 'and');
  const targetFile = path.join(dir, `${safeFileName}.md`);
  const existed = fs.existsSync(targetFile);
  fs.writeFileSync(targetFile, md, 'utf8');
  if (existed) updatedCount++;
  else createdCount++;
}

// Tag existing SRD spells that are also on the Tamer Spell List
const existingTamerSrd = [
  'spells/1st-level/Cure Wounds.md',
  'spells/1st-level/Faerie Fire.md',
  'spells/1st-level/Grease.md',
  'spells/1st-level/Sleep.md',
  'spells/2nd-level/Detect Thoughts.md',
  'spells/2nd-level/Enlarge-Reduce.md',
  'spells/2nd-level/Silence.md',
  'spells/2nd-level/Warding Bond.md',
  'spells/3rd-level/Daylight.md',
  'spells/3rd-level/Dispel Magic.md',
  'spells/3rd-level/Fear.md',
  'spells/3rd-level/Fly.md',
  'spells/3rd-level/Haste.md',
  'spells/3rd-level/Nondetection.md',
  'spells/4th-level/Control Water.md',
  'spells/4th-level/Death Ward.md',
  'spells/4th-level/Fire Shield.md',
  'spells/4th-level/Freedom of Movement.md',
  'spells/4th-level/Greater Invisibility.md',
  'spells/4th-level/Locate Creature.md',
  'spells/5th-level/Dispel Evil and Good.md',
  'spells/5th-level/Legend Lore.md',
];

let taggedCount = 0;
for (const rel of existingTamerSrd) {
  const full = path.join(rootDir, 'content', rel);
  if (!fs.existsSync(full)) continue;
  let txt = fs.readFileSync(full, 'utf8');
  // Repair accidental placement after ---
  txt = txt.replace(/\r?\n---\r?\n  - Tamer\r?\n/, '\n  - Tamer\n---\n');
  if (!/^  - Tamer$/m.test(txt)) {
    txt = txt.replace(/(classes:\r?\n(?:  - [^\r\n]+\r?\n)+)/, (m) => `${m}  - Tamer\n`);
    txt = txt.replace(/(\*\*Available to:\*\*[^\r\n]+)/, (m) => m.includes('[[Tamer]]') ? m : `${m}, [[Tamer]]`);
  }
  fs.writeFileSync(full, txt, 'utf8');
  taggedCount++;
}

console.log(`Imported Appendix B spells: ${createdCount} created, ${updatedCount} updated. Tagged ${taggedCount} existing SRD spells with Tamer.`);
