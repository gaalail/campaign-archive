import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const outDir = path.join(rootDir, 'src', 'data');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function parseFrontmatter(fileText) {
  const match = fileText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: fileText };
  }
  const rawYml = match[1];
  const body = match[2];
  const frontmatter = {};

  const lines = rawYml.split(/\r?\n/);
  let currentKey = null;
  let isList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey && isList) {
      let val = listMatch[1].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      frontmatter[currentKey].push(val);
      continue;
    }

    const continuationMatch = line.match(/^\s+([^:].*)$/);
    if (continuationMatch && currentKey && !isList && typeof frontmatter[currentKey] === 'string') {
      let extra = continuationMatch[1].trim();
      if ((extra.startsWith('"') && extra.endsWith('"')) || (extra.startsWith("'") && extra.endsWith("'"))) {
        extra = extra.slice(1, -1);
      }
      frontmatter[currentKey] = (frontmatter[currentKey] + ' ' + extra).trim();
      continue;
    }

    const keyValMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyValMatch) {
      currentKey = keyValMatch[1].trim();
      let val = keyValMatch[2].trim();

      if (val === '') {
        isList = true;
        frontmatter[currentKey] = [];
      } else if (val.startsWith('[') && val.endsWith(']')) {
        isList = false;
        const items = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
        frontmatter[currentKey] = items;
      } else {
        isList = false;
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        } else if (val === 'true') {
          val = true;
        } else if (val === 'false') {
          val = false;
        } else if (!isNaN(Number(val)) && val !== '') {
          val = Number(val);
        }
        frontmatter[currentKey] = val;
      }
    }
  }

  return { frontmatter, body };
}

function extractWikilinks(text) {
  const regex = /\[\[(.*?)\]\]/g;
  const links = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[1];
    const parts = raw.split('|');
    const target = parts[0].split('#')[0].trim();
    if (target && !target.endsWith('.base')) {
      links.add(target);
    }
  }
  return Array.from(links);
}

function cleanFlavorString(str) {
  if (!str) return '';
  let s = str.trim();
  while (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'")) ||
    (s.startsWith('_') && s.endsWith('_')) ||
    (s.startsWith('*') && s.endsWith('*'))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function extractFlavorAndFeatures(bodyText, category = '') {
  if (!bodyText || category === 'monsters') return { flavor: '', features: [] };
  const lines = bodyText.split(/\r?\n/);
  const flavorLines = [];
  let inFlavor = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (category === 'races' && flavorLines.length > 0) {
        inFlavor = false;
        break;
      }
      continue;
    }
    if (line.startsWith('# ') && !line.startsWith('## ') && !line.startsWith('### ')) continue;
    if (line.startsWith('**') && line.endsWith('**') && (line.includes('subclasses available') || line.includes('Choose at'))) continue;
    if (line.startsWith('## ') || line.startsWith('### ') || line.startsWith('> [!info')) {
      inFlavor = false;
      break;
    }
    // Stop flavor parsing if a table or stat line is reached
    if (
      line.startsWith('|') ||
      line.startsWith('- **Armor Class') ||
      line.startsWith('- **Hit Points') ||
      line.startsWith('- **Speed') ||
      line.startsWith('- **Challenge') ||
      /^\*\*(?:Ability [Ss]core [Ii]ncrease|Age|Alignment|Size|Speed|Languages|Creature Type):/i.test(line)
    ) {
      inFlavor = false;
      break;
    }
    if (inFlavor) {
      if (line === '---' || line.startsWith('- [[')) continue;
      flavorLines.push(line);
    }
  }
  let flavor = flavorLines.join(' ').replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1').trim();
  flavor = cleanFlavorString(flavor);

  if (category === 'races') {
    if (
      flavor.toLowerCase().includes('ability score increase') ||
      flavor.toLowerCase().includes('speed:') ||
      flavor.toLowerCase().includes('size:')
    ) {
      flavor = '';
    }
  }

  const features = [];
  const seenFeatureNames = new Set();

  // 1. Obsidian callouts: > [!info]- Name (level X)
  const calloutRegex = />\s*\[!info\]-?\s*([^(>\n]+)(?:\(([^)]+)\))?\r?\n((?:>[^\n]*\r?\n?)+)/g;
  let match;
  while ((match = calloutRegex.exec(bodyText)) !== null) {
    const rawName = match[1].trim();
    const rawLevel = match[2]?.trim() || '';
    const rawContent = match[3]
      .split('\n')
      .map(l => l.replace(/^>\s?/, '').trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1');

    if (!seenFeatureNames.has(rawName.toLowerCase())) {
      seenFeatureNames.add(rawName.toLowerCase());
      features.push({
        name: rawName,
        level: rawLevel,
        description: rawContent
      });
    }
  }

  // 2. Headings: ## or ###
  const headingRegex = /^(?:##|###)\s+([^\n]+)\r?\n+([\s\S]*?)(?=(?:^##\s+|^###\s+|^---\s*$|$))/gm;
  let hMatch;
  while ((hMatch = headingRegex.exec(bodyText)) !== null) {
    const rawTitle = hMatch[1].trim();
    if (/^(features|how to choose|all .* options|credits|bibliography|source)/i.test(rawTitle)) continue;
    if (seenFeatureNames.has(rawTitle.toLowerCase())) continue;

    const sectionBody = hMatch[2].trim();
    if (!sectionBody) continue;

    let level = '';
    let levelMatch = sectionBody.match(/(?:\*\*|_|\*)([0-9]+(?:st|nd|rd|th)[^._*\n]+)(?:\*\*|_|\*)/i);
    if (!levelMatch) levelMatch = sectionBody.match(/([0-9]+(?:st|nd|rd|th)-level[^\n.]*)/i);
    if (levelMatch) level = levelMatch[1].trim();

    let cleanDesc = sectionBody
      .replace(/^(?:\*\*|_|\*)[0-9]+(?:st|nd|rd|th)[^._*\n]+(?:\*\*|_|\*)\.?\s*/i, '')
      .replace(/^(?:\*\*|_|\*)[^._*\n]+(?:\*\*|_|\*)\.?\s*/i, '')
      .replace(/^\|[^\n]+\|(?:\r?\n\|[^\n]+\|)*/gm, '')
      .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
      .replace(/\r?\n+/g, ' ')
      .trim();

    let tableSummary = '';
    if (sectionBody.includes('|')) {
      const tableLines = sectionBody.split('\n').filter(l => l.trim().startsWith('|'));
      if (tableLines.length >= 3) {
        const rowItems = tableLines.slice(2).map(r => {
          const cells = r.split('|').map(c => c.trim()).filter(Boolean);
          return cells.join(': ');
        }).join('; ');
        if (rowItems) {
          tableSummary = '[' + rowItems.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1') + ']';
        }
      }
    }

    const finalDesc = (cleanDesc + (tableSummary ? (cleanDesc ? ' ' : '') + tableSummary : '')).trim();

    if (finalDesc || level) {
      seenFeatureNames.add(rawTitle.toLowerCase());
      features.push({
        name: rawTitle,
        level: level,
        description: finalDesc
      });
    }
  }

  return { flavor, features };
}

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = getAllFiles(contentDir);
const entries = [];
const linkIndex = new Map();
const titleToId = new Map();
const aliasToId = new Map();

for (const filePath of files) {
  const relPath = path.relative(contentDir, filePath).replace(/\\/g, '/');
  const cleanId = relPath.replace(/\.md$/, '');
  const rawText = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(rawText);

  const fileNameWithoutExt = path.basename(filePath, '.md');
  const title = frontmatter.title || fileNameWithoutExt;

  const parts = relPath.split('/');
  let category = 'other';
  let subcategory = null;
  let parentClass = null;

  if (parts[0] === 'character-options') {
    if (parts[1] === 'classes') {
      category = 'classes';
    } else if (parts[1] === 'subclasses') {
      category = 'subclasses';
      parentClass = parts[2] || frontmatter.parent_class || null;
      subcategory = parentClass;
    } else if (parts[1] === 'races') {
      category = 'races';
    } else if (parts[1] === 'backgrounds') {
      category = 'backgrounds';
    } else if (parts[1] === 'feats') {
      category = 'feats';
    } else if (parts[1] === 'fighting-styles') {
      category = 'fighting-styles';
    } else if (parts[1] === 'class-options') {
      category = 'class-options';
      subcategory = parts[2] || null;
      // map subcategory to class if relevant
      if (subcategory === 'eldritch-invocations' || subcategory === 'pact-foci' || subcategory === 'elder-arcana') parentClass = 'Warlock';
      if (subcategory === 'martial-exploits') parentClass = 'Fighter';
      if (subcategory === 'metamagic') parentClass = 'Sorcerer';
      if (subcategory === 'monk-techniques') parentClass = 'Monk';
      if (subcategory === 'avatar-features') parentClass = 'Paragon';
      if (subcategory === 'smite-paths') parentClass = 'Paladin';
      if (subcategory === 'primal-manifestations') parentClass = 'Primal';
    } else if (parts[1] === 'templates') {
      category = 'templates';
    } else {
      category = 'character-options';
    }
  } else if (parts[0] === 'spells') {
    category = 'spells';
    subcategory = parts[1] === 'index.md' ? null : (parts[1] || null);
  } else if (parts[0] === 'monsters') {
    category = 'monsters';
    subcategory = parts[1] || null;
  } else if (parts[0] === 'items') {
    category = 'items';
    if (parts.length > 2) {
      subcategory = parts[1];
    }
  } else if (parts[0] === 'campaigns') {
    category = 'campaigns';
    subcategory = parts[1] || null;
  } else if (parts[0] === 'rules') {
    category = 'rules';
  } else if (cleanId === 'index') {
    category = 'home';
  } else if (cleanId === 'character-builder') {
    category = 'builder';
  } else if (cleanId === 'discovery-features' || cleanId === 'getting-started') {
    category = 'guide';
  }

  const wikilinks = extractWikilinks(body);

  const entry = {
    id: cleanId,
    title,
    path: relPath,
    category,
    subcategory,
    parentClass,
    summary: frontmatter.summary || '',
    source: frontmatter.source || (frontmatter.source_type === 'SRD' ? 'SRD 5.1' : (category === 'campaigns' ? 'Campaign Archive' : '')),
    source_type: frontmatter.source_type || (frontmatter.source === 'SRD 5.1' ? 'SRD' : 'homebrew'),
    entity_type: frontmatter.entity_type || '',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? [frontmatter.tags] : []),
    aliases: Array.isArray(frontmatter.aliases) ? frontmatter.aliases : (frontmatter.aliases ? [frontmatter.aliases] : []),
    rarity: frontmatter.rarity || null,
    item_type: frontmatter.item_type || null,
    attunement: frontmatter.attunement || false,
    hit_die: frontmatter.hit_die || null,
    saving_throws: frontmatter.saving_throws || [],
    campaign_id: frontmatter.campaign_id || frontmatter.campaign || (parts[0] === 'campaigns' ? parts[1] : null),
    content_status: frontmatter.content_status || 'complete',
    level: frontmatter.level !== undefined ? Number(frontmatter.level) : null,
    school: frontmatter.school || null,
    classes: Array.isArray(frontmatter.classes) ? frontmatter.classes : (frontmatter.classes ? [frontmatter.classes] : []),
    subclass_spell_lists: Array.isArray(frontmatter.subclass_spell_lists) ? frontmatter.subclass_spell_lists : (frontmatter.subclass_spell_lists ? [frontmatter.subclass_spell_lists] : []),
    casting_time: frontmatter.casting_time || null,
    range: frontmatter.range || null,
    duration: frontmatter.duration || null,
    components: frontmatter.components || null,
    ritual: Boolean(frontmatter.ritual),
    concentration: Boolean(frontmatter.concentration),
    cr: frontmatter.cr !== undefined ? String(frontmatter.cr) : null,
    ac: frontmatter.ac !== undefined ? String(frontmatter.ac) : null,
    hp: frontmatter.hp !== undefined ? String(frontmatter.hp) : null,
    monster_type: frontmatter.type || null,
    size: frontmatter.size || null,
    speed: frontmatter.speed || null,
    alignment: frontmatter.alignment || null,
    frontmatter,
    body,
    wikilinks
  };

  const { flavor, features } = extractFlavorAndFeatures(body, category);
  if (flavor) {
    entry.flavor = flavor;
  }
  if (features && features.length > 0) {
    entry.features = features;
  }

  if (category === 'races' && !cleanId.endsWith('/index')) {
    let asi = '';
    const asiMatch = body.match(/\*\*Ability [Ss]core [Ii]ncrease:?\*\*?\s*:?\s*([^\n\r]+)/i) ||
                     body.match(/>\s*\[!info\]-?\s*Ability Score Increase\r?\n>([^\n\r]+)/i);
    if (asiMatch) {
      asi = asiMatch[1].trim()
        .replace(/^Your\s+/i, '')
        .replace(/^score increases by\s*/i, '')
        .replace(/^score increases\s*/i, '')
        .replace(/\.$/, '');
    } else {
      const sumAsi = (frontmatter.summary || '').match(/((\+[0-9]|STR|DEX|CON|INT|WIS|CHA)[^;\n\r"]+)/i);
      if (sumAsi) asi = sumAsi[1].trim();
    }
    entry.asi = asi || null;

    let raceSize = frontmatter.size || null;
    if (!raceSize) {
      const sizeMatch = body.match(/\*\*Size:?\*\*?\s*:?\s*([^\n\r]+)/i) ||
                        body.match(/>\s*\[!info\]-?\s*Size[^\r\n]*\r?\n>([^\n\r]+)/i);
      if (sizeMatch) {
        const sStr = sizeMatch[1];
        if (sStr.includes('Larva')) raceSize = 'Small (Larva) / Medium (Adult)';
        else if (/medium.*?or.*?small|small.*?or.*?medium/i.test(sStr)) raceSize = 'Medium or Small';
        else if (/\bsmall\b/i.test(sStr)) raceSize = 'Small';
        else if (/\blarge\b/i.test(sStr)) raceSize = 'Large';
        else raceSize = 'Medium';
      } else if (frontmatter.summary) {
        if (frontmatter.summary.includes('Larva')) raceSize = 'Small (Larva) / Medium (Adult)';
        else if (/medium.*?or.*?small|small.*?or.*?medium/i.test(frontmatter.summary)) raceSize = 'Medium or Small';
        else if (/\bsmall\b/i.test(frontmatter.summary)) raceSize = 'Small';
        else raceSize = 'Medium';
      }
    }
    entry.size = raceSize || 'Medium';

    let raceSpeed = frontmatter.speed || null;
    if (!raceSpeed) {
      const speedMatch = body.match(/\*\*Speed:?\*\*?\s*:?\s*([^\n\r]+)/i) ||
                         body.match(/>\s*\[!info\]-?\s*Speed\r?\n>([^\n\r]+)/i);
      if (speedMatch) {
        const sp = speedMatch[1].trim();
        const spNum = sp.match(/([0-9]+\s*(?:feet|ft)[^\n\r.;]*)/i);
        if (spNum) raceSpeed = spNum[1].replace(/feet/gi, 'ft.');
      } else if (frontmatter.summary) {
        const sumSp = frontmatter.summary.match(/speed\s+([0-9]+\s*(?:ft|feet)[^\n\r;"]*)/i);
        if (sumSp) raceSpeed = sumSp[1].replace(/feet/gi, 'ft.');
      }
    }
    entry.speed = raceSpeed || '30 ft.';

    const raceTraits = [];
    const tRegex = />\s*\[!info\]-?\s*([^(>\n]+)/g;
    let tMatch;
    while ((tMatch = tRegex.exec(body)) !== null) {
      const tName = tMatch[1].trim();
      if (!/ability score increase|age|alignment|size|speed|languages|creature type|subrace/i.test(tName)) {
        if (!raceTraits.includes(tName)) {
          raceTraits.push(tName);
        }
      }
    }
    entry.traits = raceTraits;

    const subraces = [];
    const subHeadingRegex = /^##\s+([^\n]+)/gm;
    let shMatch;
    while ((shMatch = subHeadingRegex.exec(body)) !== null) {
      const shTitle = shMatch[1].trim();
      if (!/traits|looks of|life without|society|names|statblock|brave cowards|avian ascendency|disperse and deploy|living coral|redemption|fiendish bloodline|a secluded life|nameless and cursed|lost eternity|different but the same/i.test(shTitle) && !shTitle.toLowerCase().includes(title.toLowerCase())) {
        subraces.push(shTitle);
      }
    }
    entry.subraces = subraces;
  }

  entries.push(entry);

  titleToId.set(title.toLowerCase(), cleanId);
  titleToId.set(cleanId.toLowerCase(), cleanId);
  if (cleanId.endsWith('/index')) {
    const folderName = cleanId.replace(/\/index$/, '').toLowerCase();
    if (!titleToId.has(folderName)) {
      titleToId.set(folderName, cleanId);
    }
  }
  if (fileNameWithoutExt.toLowerCase() !== 'index') {
    if (!titleToId.has(fileNameWithoutExt.toLowerCase())) {
      titleToId.set(fileNameWithoutExt.toLowerCase(), cleanId);
    }
  }

  if (entry.aliases) {
    for (const alias of entry.aliases) {
      aliasToId.set(String(alias).toLowerCase(), cleanId);
    }
  }
}

// Ensure root index points strictly to 'index'
titleToId.set('index', 'index');
titleToId.set('home', 'index');
titleToId.set('campaign archive', 'index');

// Build incoming links
for (const entry of entries) {
  for (const link of entry.wikilinks) {
    const normalized = link.toLowerCase();
    const resolvedId = aliasToId.get(normalized) || titleToId.get(normalized);
    if (resolvedId) {
      if (!linkIndex.has(resolvedId)) {
        linkIndex.set(resolvedId, new Set());
      }
      linkIndex.get(resolvedId).add(entry.id);
    }
  }
}

for (const entry of entries) {
  const incoming = linkIndex.get(entry.id);
  entry.incomingLinks = incoming ? Array.from(incoming) : [];
}

// Build graph nodes and links
const graphNodes = [];
const graphEdges = [];
const edgeSet = new Set();

const validEntities = entries.filter(e => !e.id.endsWith('/index') && e.id !== 'index');

for (const e of validEntities) {
  graphNodes.push({
    id: e.id,
    title: e.title,
    category: e.category,
    subcategory: e.subcategory,
    parentClass: e.parentClass,
    source: e.source,
    source_type: e.source_type,
    campaign: e.campaign_id,
    linkCount: (e.incomingLinks?.length || 0) + (e.wikilinks?.length || 0)
  });

  // Explicit wikilinks
  for (const link of e.wikilinks) {
    const normalized = link.toLowerCase();
    const resolvedId = aliasToId.get(normalized) || titleToId.get(normalized);
    if (resolvedId && resolvedId !== e.id && !resolvedId.endsWith('/index')) {
      const edgeKey = [e.id, resolvedId].sort().join('---');
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        graphEdges.push({ source: e.id, target: resolvedId, type: 'mention', weight: 1 });
      }
    }
  }

  // Structural relationship: Subclass -> Class
  if (e.category === 'subclasses' && e.parentClass) {
    const classId = `character-options/classes/${e.parentClass}`;
    const edgeKey = [e.id, classId].sort().join('---');
    if (!edgeSet.has(edgeKey)) {
      edgeSet.add(edgeKey);
      graphEdges.push({ source: e.id, target: classId, type: 'subclass_of', weight: 4 });
    }
  }

  // Structural relationship: Class-option -> Class
  if (e.category === 'class-options' && e.parentClass) {
    const classId = `character-options/classes/${e.parentClass}`;
    const edgeKey = [e.id, classId].sort().join('---');
    if (!edgeSet.has(edgeKey)) {
      edgeSet.add(edgeKey);
      graphEdges.push({ source: e.id, target: classId, type: 'option_of', weight: 3 });
    }
  }

  // Structural relationship: Spell -> Class spell list
  if (e.category === 'spells' && Array.isArray(e.classes)) {
    for (const cls of e.classes) {
      const resolved = titleToId.get(cls.toLowerCase());
      if (resolved && resolved !== e.id) {
        const edgeKey = [e.id, resolved].sort().join('---');
        if (!edgeSet.has(edgeKey)) {
          edgeSet.add(edgeKey);
          graphEdges.push({ source: e.id, target: resolved, type: 'spell_list', weight: 2.5 });
        }
      }
    }
  }

  // Structural relationship: Campaign entry -> Campaign hub
  if (e.category === 'campaigns' && e.campaign_id && e.id !== `campaigns/${e.campaign_id}/index`) {
    const hubId = `campaigns/${e.campaign_id}/index`;
    const edgeKey = [e.id, hubId].sort().join('---');
    if (!edgeSet.has(edgeKey)) {
      edgeSet.add(edgeKey);
      graphEdges.push({ source: e.id, target: hubId, type: 'campaign_content', weight: 3 });
    }
  }
}

const outputData = {
  generatedAt: new Date().toISOString(),
  stats: {
    totalEntries: entries.length,
    classes: entries.filter(e => e.category === 'classes' && !e.id.endsWith('/index')).length,
    subclasses: entries.filter(e => e.category === 'subclasses' && !e.id.endsWith('/index')).length,
    races: entries.filter(e => e.category === 'races' && !e.id.endsWith('/index')).length,
    backgrounds: entries.filter(e => e.category === 'backgrounds' && !e.id.endsWith('/index')).length,
    feats: entries.filter(e => e.category === 'feats' && !e.id.endsWith('/index')).length,
    fightingStyles: entries.filter(e => e.category === 'fighting-styles' && !e.id.endsWith('/index')).length,
    classOptions: entries.filter(e => e.category === 'class-options' && !e.id.endsWith('/index')).length,
    spells: entries.filter(e => e.category === 'spells' && !e.id.endsWith('/index')).length,
    monsters: entries.filter(e => e.category === 'monsters' && !e.id.endsWith('/index')).length,
    items: entries.filter(e => e.category === 'items' && !e.id.endsWith('/index')).length,
    campaigns: entries.filter(e => e.category === 'campaigns').length,
    rules: entries.filter(e => e.category === 'rules' || e.id.includes('/rules/')).length
  },
  entries,
  graph: {
    nodes: graphNodes,
    edges: graphEdges
  }
};

const targetPath = path.join(outDir, 'archiveData.json');
fs.writeFileSync(targetPath, JSON.stringify(outputData), 'utf-8');
console.log(`Generated ${targetPath} with ${entries.length} entries and ${graphEdges.length} graph connections.`);
