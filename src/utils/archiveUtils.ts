import archiveDataRaw from '../data/archiveData.json';
import { ArchiveDatabase, ArchiveEntry, SourceType } from '../types/archive';

export const archiveDb = archiveDataRaw as unknown as ArchiveDatabase;

// Indexed lookups
const entriesById = new Map<string, ArchiveEntry>();
const entriesByNormalizedTitle = new Map<string, ArchiveEntry>();
const entriesByNormalizedAlias = new Map<string, ArchiveEntry>();

for (const entry of archiveDb.entries) {
  entriesById.set(entry.id, entry);
  entriesById.set(entry.id.toLowerCase().trim(), entry);
  entriesByNormalizedTitle.set(entry.title.toLowerCase().trim(), entry);
  entriesByNormalizedTitle.set(entry.id.toLowerCase().trim(), entry);

  const baseFileName = entry.path.split('/').pop()?.replace(/\.md$/, '').toLowerCase().trim();
  if (baseFileName) {
    entriesByNormalizedTitle.set(baseFileName, entry);
    entriesById.set(baseFileName, entry);
  }

  if (entry.aliases) {
    for (const alias of entry.aliases) {
      entriesByNormalizedAlias.set(String(alias).toLowerCase().trim(), entry);
    }
  }
}

export function cleanFlavorText(text?: string | null): string {
  if (!text) return '';
  let str = text.trim();
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

export function getEntryById(id: string): ArchiveEntry | undefined {
  if (!id) return undefined;
  const trimmed = id.trim();
  const lower = trimmed.toLowerCase();
  return (
    entriesById.get(trimmed) ||
    entriesById.get(lower) ||
    entriesByNormalizedAlias.get(lower) ||
    entriesByNormalizedTitle.get(lower)
  );
}

export function resolveWikilink(linkText: string): ArchiveEntry | undefined {
  const clean = linkText.split('|')[0].split('#')[0].trim().toLowerCase();
  return (
    entriesById.get(clean) ||
    entriesByNormalizedAlias.get(clean) ||
    entriesByNormalizedTitle.get(clean)
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
