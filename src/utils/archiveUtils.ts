import archiveDataRaw from '../data/archiveData.json';
import { ArchiveDatabase, ArchiveEntry, SourceType } from '../types/archive';

export const archiveDb = archiveDataRaw as unknown as ArchiveDatabase;

// Indexed lookups
const entriesById = new Map<string, ArchiveEntry>();
const entriesByNormalizedTitle = new Map<string, ArchiveEntry>();
const entriesByNormalizedAlias = new Map<string, ArchiveEntry>();
const entriesBySlug = new Map<string, ArchiveEntry>();

// 1. Authoritative: Register exact IDs
for (const entry of archiveDb.entries) {
  entriesById.set(entry.id, entry);
  entriesById.set(entry.id.toLowerCase().trim(), entry);

  // If this is a folder index (e.g. spells/index, character-options/classes/index),
  // also register the folder path alias so [[spells]] or [[character-options/classes]] work seamlessly
  if (entry.id.endsWith('/index')) {
    const folderPath = entry.id.replace(/\/index$/, '');
    if (folderPath && !entriesById.has(folderPath)) {
      entriesById.set(folderPath, entry);
      entriesById.set(folderPath.toLowerCase().trim(), entry);
    }
  }
}

// 2. Titles, Aliases, and Stems
for (const entry of archiveDb.entries) {
  const normTitle = entry.title.toLowerCase().trim();
  if (!entriesByNormalizedTitle.has(normTitle)) {
    entriesByNormalizedTitle.set(normTitle, entry);
  }

  const titleSlug = normTitle.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (titleSlug && !entriesBySlug.has(titleSlug)) {
    entriesBySlug.set(titleSlug, entry);
  }

  // File stem (e.g. 'fireball' from 'spells/3rd-level/fireball.md')
  // CRITICAL: NEVER register 'index' from a subfolder as a stem!
  const baseFileName = entry.path.split('/').pop()?.replace(/\.md$/, '').toLowerCase().trim();
  if (baseFileName && baseFileName !== 'index') {
    if (!entriesById.has(baseFileName)) {
      entriesById.set(baseFileName, entry);
    }
    if (!entriesByNormalizedTitle.has(baseFileName)) {
      entriesByNormalizedTitle.set(baseFileName, entry);
    }
  }

  if (entry.aliases) {
    for (const alias of entry.aliases) {
      const normAlias = String(alias).toLowerCase().trim();
      if (!entriesByNormalizedAlias.has(normAlias)) {
        entriesByNormalizedAlias.set(normAlias, entry);
      }
      const aliasSlug = normAlias.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (aliasSlug && !entriesBySlug.has(aliasSlug)) {
        entriesBySlug.set(aliasSlug, entry);
      }
    }
  }
}

// 3. Absolute Lock: The root Home Hub must always resolve to content/index.md
const rootIndexEntry = archiveDb.entries.find(e => e.id === 'index' || e.path === 'index.md');
if (rootIndexEntry) {
  entriesById.set('index', rootIndexEntry);
  entriesById.set('home', rootIndexEntry);
  entriesByNormalizedTitle.set('index', rootIndexEntry);
  entriesByNormalizedTitle.set('campaign archive', rootIndexEntry);
  entriesByNormalizedTitle.set('home hub', rootIndexEntry);
}

export function cleanFlavorText(text?: string | null): string {
  if (!text) return '';
  let str = text.trim();
  // If the text is actually an unparsed raw stat table or mechanical block, do not treat as flavor quote
  if (
    str.includes('| STR |') ||
    str.includes('Armor Class:') ||
    str.includes('Hit Points:') ||
    str.toLowerCase().startsWith('**ability score increase') ||
    str.toLowerCase().startsWith('ability score increase') ||
    str.toLowerCase().includes('**ability score increase:**')
  ) {
    return '';
  }
  // Strip surrounding quotes or formatting marks
  while (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'")) ||
    (str.startsWith('_') && str.endsWith('_')) ||
    (str.startsWith('*') && str.endsWith('*'))
  ) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export function getEntryById(id: string): ArchiveEntry | undefined {
  if (!id) return undefined;
  const decoded = safeDecode(id);
  const rawClean = decoded.trim().split('#')[0].split('?')[0].trim();
  const trimmed = rawClean.replace(/^\.\//, '').replace(/^\/+|\/+$/g, '').replace(/\.md$/, '');
  const lower = trimmed.toLowerCase();

  // Root home page guard
  if (lower === 'index' || lower === 'home' || lower === '' || lower === '/') {
    return rootIndexEntry || entriesById.get('index');
  }

  return (
    entriesById.get(trimmed) ||
    entriesById.get(lower) ||
    entriesById.get(`${lower}/index`) ||
    entriesByNormalizedTitle.get(lower) ||
    entriesByNormalizedAlias.get(lower) ||
    entriesBySlug.get(lower) ||
    entriesBySlug.get(lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) ||
    entriesByNormalizedTitle.get(lower.replace(/-/g, ' '))
  );
}

export function resolveWikilink(linkText: string): ArchiveEntry | undefined {
  if (!linkText) return undefined;
  const decoded = safeDecode(linkText);
  const rawTarget = decoded.split('|')[0].split('#')[0].split('?')[0].trim();
  const clean = rawTarget.replace(/^\.\//, '').replace(/^\/+|\/+$/g, '').replace(/\.md$/, '');
  const lower = clean.toLowerCase();

  if (lower === 'index' || lower === 'home') {
    return rootIndexEntry || entriesById.get('index');
  }

  return (
    entriesById.get(clean) ||
    entriesById.get(lower) ||
    entriesById.get(`${lower}/index`) ||
    entriesByNormalizedTitle.get(lower) ||
    entriesByNormalizedAlias.get(lower) ||
    entriesBySlug.get(lower) ||
    entriesBySlug.get(lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) ||
    entriesByNormalizedTitle.get(lower.replace(/-/g, ' '))
  );
}

export function getEntriesByCategory(category: string, subcategory?: string | null): ArchiveEntry[] {
  return archiveDb.entries.filter(e => {
    if (e.id.endsWith('/index')) return false;
    if (e.category !== category) return false;
    if (subcategory && e.subcategory !== subcategory) return false;
    return true;
  });
}

export function getSubclassesForClass(className: string): ArchiveEntry[] {
  return archiveDb.entries.filter(e => 
    e.category === 'subclasses' && 
    (e.parentClass?.toLowerCase() === className.toLowerCase() ||
     e.path.toLowerCase().includes(`/subclasses/${className.toLowerCase()}/`))
  );
}

export function getClassOptionsForClass(className: string): ArchiveEntry[] {
  return archiveDb.entries.filter(e =>
    e.category === 'class-options' &&
    (e.parentClass?.toLowerCase() === className.toLowerCase() ||
     e.path.toLowerCase().includes(className.toLowerCase()))
  );
}

export function getSourceBadgeInfo(sourceType?: SourceType, sourceName?: string): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  const normalized = (sourceType || '').toLowerCase();
  const name = sourceName || sourceType || 'SRD';

  if (normalized.includes('srd')) {
    return {
      label: name || 'SRD 5.1',
      bg: 'bg-blue-950/70',
      text: 'text-blue-300',
      border: 'border-blue-500/40'
    };
  }

  if (normalized.includes('homebrew') || normalized.includes('campaign-original')) {
    return {
      label: name || 'Homebrew',
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-500/40'
    };
  }

  if (normalized.includes('third-party') || name.toLowerCase().includes('angelus')) {
    return {
      label: name || 'Third-Party',
      bg: 'bg-purple-950/70',
      text: 'text-purple-300',
      border: 'border-purple-500/40'
    };
  }

  return {
    label: name || 'Official Supplement',
    bg: 'bg-emerald-950/70',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40'
  };
}

export function getRarityColor(rarity?: string | null): { bg: string; text: string; border: string } {
  const r = (rarity || '').toLowerCase();
  if (r.includes('common') && !r.includes('uncommon')) {
    return { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-600' };
  }
  if (r.includes('uncommon')) {
    return { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-500/50' };
  }
  if (r.includes('rare') && !r.includes('very')) {
    return { bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-500/50' };
  }
  if (r.includes('very rare')) {
    return { bg: 'bg-purple-950/60', text: 'text-purple-400', border: 'border-purple-500/50' };
  }
  if (r.includes('legendary') || r.includes('artifact')) {
    return { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-500/50' };
  }
  return { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' };
}

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calculateProficiencyBonus(level: number): number {
  return Math.floor((Math.max(1, Math.min(20, level)) - 1) / 4) + 2;
}

export function getSpellsForClass(className: string): ArchiveEntry[] {
  const normalized = className.trim().toLowerCase();
  return archiveDb.entries.filter(e => {
    if (e.category !== 'spells' || e.id.endsWith('/index')) return false;

    // Direct classes list
    const classes = e.classes || (Array.isArray(e.frontmatter.classes) ? e.frontmatter.classes : []);
    if (classes.some((c: string) => c.toLowerCase() === normalized)) return true;

    // Subclass spell lists
    const sublists = e.subclass_spell_lists || (Array.isArray(e.frontmatter.subclass_spell_lists) ? e.frontmatter.subclass_spell_lists : []);
    if (sublists.some((s: string) => {
      const sl = s.toLowerCase();
      return sl === normalized || (normalized === 'way of the wu jen' && sl === 'wu jen') || (normalized === 'wu jen' && sl === 'wu jen');
    })) return true;

    return false;
  });
}

export function getSpellLevelLabel(level: number | null | undefined): string {
  if (level === 0) return 'Cantrip';
  if (level === 1) return '1st-Level';
  if (level === 2) return '2nd-Level';
  if (level === 3) return '3rd-Level';
  if (level !== null && level !== undefined) return `${level}th-Level`;
  return 'Cantrip';
}

export function getAllMonsters(): ArchiveEntry[] {
  return archiveDb.entries.filter(e => e.category === 'monsters' && !e.id.endsWith('/index'));
}

export function getAllDeities(): ArchiveEntry[] {
  return archiveDb.entries
    .filter(e => (e.category === 'pantheons' || e.entity_type === 'deity') && !e.id.endsWith('/index'))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getDeitiesForCampaign(campaignId?: string | null): ArchiveEntry[] {
  const deities = getAllDeities();
  if (!campaignId || campaignId === 'all') return deities;
  return deities.filter(d => d.campaign_id === campaignId || d.subcategory === campaignId);
}

export function getPantheonOverviewForCampaign(campaignId: string): ArchiveEntry | undefined {
  return archiveDb.entries.find(
    e => (e.category === 'pantheons' || e.id.includes('/pantheon/')) && e.id.endsWith('/index') && e.campaign_id === campaignId
  );
}

export function getDeityDomains(): string[] {
  const domains = new Set<string>();
  for (const d of getAllDeities()) {
    const list = d.domains || (Array.isArray(d.frontmatter?.domains) ? d.frontmatter.domains : []);
    for (const dom of list) {
      if (dom) domains.add(String(dom));
    }
  }
  return Array.from(domains).sort((a, b) => a.localeCompare(b));
}

export function getCampaignDisplayName(campaignId?: string | null): string {
  switch (campaignId) {
    case 'curse-of-strahd':
      return 'Curse of Strahd';
    case 'ra-golvek':
      return "Ra Gol'vek";
    case 'vyrun':
      return 'Vyrun';
    default:
      return campaignId ? campaignId.replace(/-/g, ' ') : 'All Realms';
  }
}

