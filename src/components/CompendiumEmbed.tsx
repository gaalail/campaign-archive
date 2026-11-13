import React, { useState, useMemo } from 'react';
import { archiveDb, getSourceBadgeInfo, getRarityColor, cleanFlavorText } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import { Search, Sparkles, Shield, Heart, ExternalLink, ChevronRight, Filter, Zap } from 'lucide-react';
import { InlineContent } from './MarkdownView';

interface CompendiumEmbedProps {
  target: string;
  currentEntryId?: string;
  onNavigate: (id: string) => void;
}

export const CompendiumEmbed: React.FC<CompendiumEmbedProps> = ({ target, currentEntryId, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('all');

  // Determine what entries to show based on the target
  const { title, entries, isSubclassesOf, isClassOptionsOf, itemCategory } = useMemo(() => {
    let title = 'Compendium';
    let filtered: ArchiveEntry[] = [];
    let isSubclassesOf = false;
    let isClassOptionsOf = false;
    let itemCategory: string | null = null;

    // Current entry context for context-sensitive queries
    const currentEntry = currentEntryId ? archiveDb.entries.find(e => e.id === currentEntryId) : undefined;
    const currentClass = currentEntry?.title || '';

    if (target === 'backgrounds.base') {
      title = 'Character Backgrounds';
      filtered = archiveDb.entries.filter(e => e.category === 'backgrounds' && !e.id.endsWith('/index'));
    } else if (target === 'races.base') {
      title = 'Races & Lineages';
      filtered = archiveDb.entries.filter(e => e.category === 'races' && !e.id.endsWith('/index'));
    } else if (target === 'classes.base') {
      title = 'Character Classes';
      filtered = archiveDb.entries.filter(e => e.category === 'classes' && !e.id.endsWith('/index'));
    } else if (target === 'subclasses-of.base') {
      isSubclassesOf = true;
      title = currentClass ? `${currentClass} Subclasses & Archetypes` : 'Subclasses';
      filtered = archiveDb.entries.filter(e => 
        e.category === 'subclasses' && 
        !e.id.endsWith('/index') &&
        (currentClass ? (e.parentClass?.toLowerCase() === currentClass.toLowerCase() || e.path.toLowerCase().includes(`/subclasses/${currentClass.toLowerCase()}/`)) : true)
      );
    } else if (target === 'class-options-of.base') {
      isClassOptionsOf = true;
      title = currentClass ? `${currentClass} Class Options` : 'Class Options';
      filtered = archiveDb.entries.filter(e =>
        e.category === 'class-options' &&
        !e.id.endsWith('/index') &&
        (currentClass ? e.parentClass?.toLowerCase() === currentClass.toLowerCase() : true)
      );
    } else if (target === 'feats.base') {
      title = 'Feats';
      filtered = archiveDb.entries.filter(e => e.category === 'feats' && !e.id.endsWith('/index'));
    } else if (target === 'fighting-styles.base') {
      title = 'Fighting Styles';
      filtered = archiveDb.entries.filter(e => e.category === 'fighting-styles' && !e.id.endsWith('/index'));
    } else if (target === 'templates.base') {
      title = 'Character Templates';
      filtered = archiveDb.entries.filter(e => e.category === 'templates' && !e.id.endsWith('/index'));
    } else if (target.startsWith('items.base')) {
      const hashPart = target.split('#')[1];
      itemCategory = hashPart || null;
      title = itemCategory ? `${itemCategory} Items` : 'Magic Items Compendium';
      filtered = archiveDb.entries.filter(e => {
        if (e.category !== 'items' || e.id.endsWith('/index')) return false;
        if (itemCategory) {
          return e.subcategory?.toLowerCase() === itemCategory.toLowerCase() || 
                 e.item_type?.toLowerCase() === itemCategory.toLowerCase() ||
                 e.path.toLowerCase().includes(`/items/${itemCategory.toLowerCase()}/`);
        }
        return true;
      });
    } else if (
      target in {
        'martial-exploits.base': true,
        'savage-exploits.base': true,
        'eldritch-invocations.base': true,
        'avatar-features.base': true,
        'metamagic.base': true,
        'monk-techniques.base': true,
        'smite-paths.base': true,
        'primal-manifestations.base': true,
        'veil-techniques.base': true,
        'warden-alternate-features.base': true,
        'warlock-elder-arcana.base': true,
        'warlock-pact-foci.base': true,
        'warlock-familiars.base': true
      }
    ) {
      const CLASS_OPTION_BASE_MAP: Record<string, { subcategory: string; title: string }> = {
        'martial-exploits.base': { subcategory: 'martial-exploits', title: 'Martial Exploits' },
        'savage-exploits.base': { subcategory: 'savage-exploits', title: 'Savage Exploits' },
        'eldritch-invocations.base': { subcategory: 'eldritch-invocations', title: 'Eldritch Invocations' },
        'avatar-features.base': { subcategory: 'avatar-features', title: 'Avatar Features' },
        'metamagic.base': { subcategory: 'metamagic', title: 'Metamagic Options' },
        'monk-techniques.base': { subcategory: 'monk-techniques', title: 'Mystic Techniques' },
        'smite-paths.base': { subcategory: 'smite-paths', title: 'Smite Paths' },
        'primal-manifestations.base': { subcategory: 'primal-manifestations', title: 'Primal Manifestations' },
        'veil-techniques.base': { subcategory: 'veil-techniques', title: 'Veil Techniques' },
        'warden-alternate-features.base': { subcategory: 'warden-alternate-features', title: 'Warden Alternate Class Features' },
        'warlock-elder-arcana.base': { subcategory: 'elder-arcana', title: 'Elder Arcana' },
        'warlock-pact-foci.base': { subcategory: 'pact-foci', title: 'Pact Foci' },
        'warlock-familiars.base': { subcategory: 'familiars', title: 'Eldritch Familiars' }
      };
      const pool = CLASS_OPTION_BASE_MAP[target];
      title = pool.title;
      filtered = archiveDb.entries.filter(
        e => e.category === 'class-options' && e.subcategory === pool.subcategory && !e.id.endsWith('/index')
      );
    } else if (target === 'class-options.base') {
      title = 'Class Options & Powers Directory';
      filtered = archiveDb.entries.filter(e => e.category === 'class-options' && !e.id.endsWith('/index'));
    } else if (target === 'curse-of-strahd.base') {
      title = 'Curse of Strahd Directory';
      filtered = archiveDb.entries.filter(e => e.campaign_id === 'curse-of-strahd' && !e.id.endsWith('/index'));
    } else if (target === 'ra-golvek.base') {
      title = "Ra Gol'vek Directory";
      filtered = archiveDb.entries.filter(e => e.campaign_id === 'ra-golvek' && !e.id.endsWith('/index'));
    } else if (target === 'vyrun.base') {
      title = 'Vyrun Directory';
      filtered = archiveDb.entries.filter(e => e.campaign_id === 'vyrun' && !e.id.endsWith('/index'));
    } else if (target === 'character-options.base') {
      title = 'Character Options Directory';
      filtered = archiveDb.entries.filter(e => 
        ['classes', 'subclasses', 'races', 'backgrounds', 'feats', 'fighting-styles', 'class-options'].includes(e.category) && 
        !e.id.endsWith('/index')
      );
    } else {
      title = target.replace('.base', '').replace(/-/g, ' ');
      filtered = archiveDb.entries.filter(e => !e.id.endsWith('/index'));
    }

    // Sort alphabetically by title
    filtered.sort((a, b) => a.title.localeCompare(b.title));

    return { title, entries: filtered, isSubclassesOf, isClassOptionsOf, itemCategory };
  }, [target, currentEntryId]);

  // Extract distinct subcategories or rarities for filtering
  const subcategories = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      if (e.subcategory) set.add(e.subcategory);
      if (e.rarity) set.add(e.rarity);
    }
    return Array.from(set).sort();
  }, [entries]);

  // Apply search and filter
  const displayedEntries = useMemo(() => {
    let list = entries;
    if (selectedSubtype !== 'all') {
      list = list.filter(e => e.subcategory === selectedSubtype || e.rarity === selectedSubtype);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.summary.toLowerCase().includes(q) ||
        (e.parentClass && e.parentClass.toLowerCase().includes(q))
      );
    }
    return list;
  }, [entries, search, selectedSubtype]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="my-6 not-prose rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:p-5 shadow-inner space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-fantasy text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-mono font-normal text-slate-400">({displayedEntries.length} entries)</span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {subcategories.length > 0 && (
            <select
              value={selectedSubtype}
              onChange={(e) => setSelectedSubtype(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              {subcategories.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none w-36 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Grid or Table layout depending on quantity */}
      <div className={`grid ${isSubclassesOf ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5'} max-h-[550px] overflow-y-auto pr-1`}>
        {displayedEntries.map(entry => {
          const badge = getSourceBadgeInfo(entry.source_type, entry.source);
          const rarity = entry.rarity ? getRarityColor(entry.rarity) : null;
          const features = entry.features || [];

          if (isSubclassesOf) {
            return (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-left hover:border-amber-500/50 hover:bg-slate-900/60 transition-all flex flex-col justify-between group space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div>
                      <h4 className="font-fantasy font-bold text-slate-100 group-hover:text-amber-300 text-base transition-colors">
                        {entry.title}
                      </h4>
                      {entry.parentClass && (
                        <div className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
                          {entry.parentClass} Archetype
                        </div>
                      )}
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${badge.bg} ${badge.text} ${badge.border} shrink-0`}>
                      {badge.label}
                    </span>
                  </div>

                  {(entry.flavor || entry.summary) && (
                    <div className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed border-l-2 border-amber-500/50 pl-2 py-0.5 bg-slate-900/40 rounded-r">
                      <InlineContent text={cleanFlavorText(entry.flavor || entry.summary)} onNavigate={onNavigate} />
                    </div>
                  )}

                  {features.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
                      <div className="text-[10px] uppercase font-semibold text-amber-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Core Features ({features.length})</span>
                      </div>
                      <div className="space-y-1">
                        {features.slice(0, 2).map((feat, fIdx) => (
                          <div key={fIdx} className="bg-slate-900/80 rounded p-1.5 text-xs border border-slate-800/60">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-medium text-slate-200 text-[11px]">{feat.name}</span>
                              {feat.level && (
                                <span className="text-[9px] font-mono px-1 rounded bg-amber-950/60 text-amber-300">
                                  {feat.level}
                                </span>
                              )}
                            </div>
                            {feat.description && (
                              <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                                <InlineContent text={feat.description} onNavigate={onNavigate} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {features.length > 2 ? `+${features.length - 2} more features` : 'Complete mechanics'}
                  </span>
                  <button
                    onClick={() => onNavigate(entry.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 group/btn"
                  >
                    <span>View Archetype</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          }

          return (
            <button
              key={entry.id}
              onClick={() => onNavigate(entry.id)}
              className="rounded-lg border border-slate-800/90 bg-slate-950/70 p-3 text-left hover:border-amber-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between group space-y-1.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-slate-200 group-hover:text-amber-300 text-sm transition-colors">
                    {entry.title}
                  </h4>
                  {rarity ? (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${rarity.bg} ${rarity.text} ${rarity.border} shrink-0`}>
                      {entry.rarity}
                    </span>
                  ) : (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border} shrink-0`}>
                      {badge.label}
                    </span>
                  )}
                </div>

                {(entry.flavor || entry.summary) && (
                  <div className="text-xs text-slate-400 line-clamp-2 mt-1 leading-normal">
                    <InlineContent text={cleanFlavorText(entry.flavor || entry.summary)} onNavigate={onNavigate} />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 w-full">
                <span className="capitalize">
                  {entry.subcategory?.replace(/-/g, ' ') || entry.category}
                </span>
                <span className="text-amber-400/80 group-hover:text-amber-300 flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
