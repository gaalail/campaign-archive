import React, { useState, useEffect, useRef, useMemo } from 'react';
import { archiveDb, getSourceBadgeInfo, getSpellLevelLabel } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import {
  Search,
  X,
  Sparkles,
  BookOpen,
  Sword,
  Shield,
  ExternalLink,
  Flame,
  ArrowRight,
  Sun
} from 'lucide-react';
import { GothicBat, DragonShield, CrossedSwords, D20GothicIcon } from './GothicIcons';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

type FilterCategory = 'all' | 'spells' | 'monsters' | 'items' | 'rules' | 'classes' | 'races' | 'campaigns' | 'pantheons';

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Category counts
  const counts = useMemo(() => {
    const total = archiveDb.entries.filter(e => !e.id.endsWith('/index')).length;
    const spells = archiveDb.entries.filter(e => e.category === 'spells' && !e.id.endsWith('/index')).length;
    const monsters = archiveDb.entries.filter(e => e.category === 'monsters' && !e.id.endsWith('/index')).length;
    const items = archiveDb.entries.filter(e => e.category === 'items' && !e.id.endsWith('/index')).length;
    const rules = archiveDb.entries.filter(e => e.category === 'rules' && !e.id.endsWith('/index')).length;
    const classes = archiveDb.entries.filter(e => e.category === 'classes' && !e.id.endsWith('/index')).length;
    const races = archiveDb.entries.filter(e => e.category === 'races' && !e.id.endsWith('/index')).length;
    const campaigns = archiveDb.entries.filter(e => e.category === 'campaigns' && !e.id.endsWith('/index')).length;
    const pantheons = archiveDb.entries.filter(e => e.category === 'pantheons' && !e.id.endsWith('/index')).length;
    return { total, spells, monsters, items, rules, classes, races, campaigns, pantheons };
  }, []);

  // Primary interactive tools pool
  const toolShortcuts: ArchiveEntry[] = useMemo(() => [
    {
      id: 'builder',
      title: 'Character Builder & Armory',
      path: 'character-builder',
      category: 'classes',
      subcategory: 'Creation Tool',
      parentClass: null,
      summary: 'Interactive 6-step hero creator with live-calc HUD, 27-pt buy, click-to-roll sheet, and exports.',
      source: 'Codex Tool',
      source_type: 'SRD',
      entity_type: 'tool',
      tags: ['character', 'builder', 'creator', 'sheet', 'hero', 'statblock', 'rolls'],
      aliases: ['character builder', 'hero creator', 'sheet builder'],
      content_status: 'complete',
      frontmatter: {},
      body: '',
      wikilinks: []
    },
    {
      id: 'graph',
      title: 'Knowledge Graph (Interactive Network)',
      path: 'knowledge-graph',
      category: 'rules',
      subcategory: 'Cosmic Network',
      parentClass: null,
      summary: 'Force-directed visual network mapping connections between classes, subclasses, spells, monsters, and campaigns.',
      source: 'Codex Tool',
      source_type: 'SRD',
      entity_type: 'tool',
      tags: ['graph', 'network', 'map', 'relationships', 'visual', 'nodes'],
      aliases: ['knowledge graph', 'codex graph', 'network map'],
      content_status: 'complete',
      frontmatter: {},
      body: '',
      wikilinks: []
    },
    {
      id: 'spells',
      title: 'Grimoire (Spellbook Catalogue)',
      path: 'spells',
      category: 'spells',
      subcategory: 'All Circles',
      parentClass: null,
      summary: 'Search, filter, and cast spells from cantrips to 9th-level across all spellcasting classes.',
      source: 'Codex Grimoire',
      source_type: 'SRD',
      entity_type: 'catalogue',
      tags: ['spells', 'grimoire', 'magic', 'casting', 'slots', 'cantrip'],
      aliases: ['spellbook', 'grimoire', 'spells catalogue'],
      content_status: 'complete',
      frontmatter: {},
      body: '',
      wikilinks: []
    },
    {
      id: 'monsters',
      title: 'Bestiary (Creatures & NPC Statblocks)',
      path: 'monsters',
      category: 'monsters',
      subcategory: 'All CRs',
      parentClass: null,
      summary: 'Filtered compendium of undead, fiends, dragons, and beasts with interactive dice-rollable statblocks.',
      source: 'Codex Bestiary',
      source_type: 'SRD',
      entity_type: 'catalogue',
      tags: ['monsters', 'bestiary', 'creatures', 'statblock', 'cr', 'enemies'],
      aliases: ['bestiary', 'monster manual', 'creatures'],
      content_status: 'complete',
      frontmatter: {},
      body: '',
      wikilinks: []
    },
    {
      id: 'items',
      title: 'Armory & Magic Items Catalogue',
      path: 'items',
      category: 'items',
      subcategory: 'Magic Relics',
      parentClass: null,
      summary: 'Browse enchanted weapons, armor, rings, potions, scrolls, and wondrous artifacts sorted by rarity.',
      source: 'Codex Armory',
      source_type: 'SRD',
      entity_type: 'catalogue',
      tags: ['items', 'weapons', 'armor', 'magic items', 'relics', 'artifacts', 'loot'],
      aliases: ['magic items', 'armory', 'items catalogue'],
      content_status: 'complete',
      frontmatter: {},
      body: '',
      wikilinks: []
    },
    {
      id: 'campaigns',
      title: 'Campaign Worlds & Gothic Chronicles',
      path: 'campaigns',
      category: 'campaigns',
      subcategory: 'Setting Hub',
      parentClass: null,
      summary: 'Explore Barovia, Curse of Strahd alterations to magic, Ra Golvek, and Vyrun campaign archives.',
      source: 'Campaigns Hub',
      source_type: 'campaign-original',
      entity_type: 'catalogue',
      tags: ['campaigns', 'barovia', 'strahd', 'ra golvek', 'vyrun', 'worlds'],
      aliases: ['campaigns', 'campaign hub', 'settings'],
      content_status: 'complete',
      frontmatter: {},
      body: '',
      wikilinks: []
    },
    {
      id: 'pantheons',
      title: 'Pantheons & Deities',
      path: 'pantheons',
      category: 'pantheons',
      subcategory: 'Cosmology & Worship',
      parentClass: null,
      summary: 'Browse campaign-specific deities, divine domains, holy symbols, and recommended oaths across all realms.',
      source: 'Codex Cosmology',
      source_type: 'campaign-original',
      entity_type: 'catalogue',
      tags: ['pantheons', 'deities', 'gods', 'religion', 'domains', 'cleric', 'paladin'],
      aliases: ['pantheons', 'deities', 'gods'],
      content_status: 'complete',
      frontmatter: {},
      body: '',
      wikilinks: []
    }
  ], []);

  // Filter & match entries
  const results = useMemo(() => {
    const cleanQ = query.trim().toLowerCase();
    let pool = [...toolShortcuts, ...archiveDb.entries.filter(e => !e.id.endsWith('/index'))];

    if (categoryFilter !== 'all') {
      pool = pool.filter(e => e.category === categoryFilter);
    }

    if (!cleanQ) {
      return pool.slice(0, 15);
    }

    const scored: { entry: ArchiveEntry; score: number }[] = [];

    for (const e of pool) {
      const titleLower = e.title.toLowerCase();
      let score = 0;

      if (titleLower === cleanQ) {
        score = 1000;
      } else if (titleLower.startsWith(cleanQ)) {
        score = 500;
      } else if (titleLower.includes(cleanQ)) {
        score = 200;
      } else if (e.aliases?.some(a => a.toLowerCase().includes(cleanQ))) {
        score = 150;
      } else if (e.subcategory?.toLowerCase().includes(cleanQ)) {
        score = 80;
      } else if (e.tags?.some(t => t.toLowerCase().includes(cleanQ))) {
        score = 60;
      } else if (e.summary?.toLowerCase().includes(cleanQ)) {
        score = 30;
      }

      if (score > 0) {
        scored.push({ entry: e, score });
      }
    }

    scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
    return scored.slice(0, 40).map(s => s.entry);
  }, [query, categoryFilter, toolShortcuts]);

  // Keep selected index in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, categoryFilter]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
      scrollToIndex(selectedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
      scrollToIndex(selectedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onNavigate(results[selectedIndex].id);
        onClose();
      }
    }
  };

  const scrollToIndex = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-result-item]');
    if (items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'spells':
        return <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />;
      case 'monsters':
        return <GothicBat className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'items':
        return <DragonShield className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'classes':
      case 'subclasses':
        return <CrossedSwords className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'rules':
        return <BookOpen className="w-4 h-4 text-teal-400 shrink-0" />;
      case 'campaigns':
        return <Flame className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'pantheons':
        return <Sun className="w-4 h-4 text-amber-300 shrink-0" />;
      default:
        return <Shield className="w-4 h-4 text-stone-400 shrink-0" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-stone-900 border border-amber-900/70 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search spells, monsters, items, rules, classes (Ctrl+K)..."
            className="flex-1 bg-transparent text-stone-100 placeholder-stone-500 text-sm md:text-base font-sans focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-stone-400 hover:text-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] text-stone-500 font-mono px-1.5 py-0.5 rounded border border-stone-800 bg-stone-900">
            ESC
          </span>
        </div>

        {/* Category Filters Pill Row */}
        <div className="px-3.5 py-2 bg-stone-950/60 border-b border-stone-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-serif">
          {[
            { id: 'all', label: `All (${counts.total})` },
            { id: 'spells', label: `Spells (${counts.spells})` },
            { id: 'monsters', label: `Monsters (${counts.monsters})` },
            { id: 'items', label: `Items (${counts.items})` },
            { id: 'rules', label: `Rules (${counts.rules})` },
            { id: 'classes', label: `Classes (${counts.classes})` },
            { id: 'races', label: `Races (${counts.races})` },
            { id: 'pantheons', label: `Pantheons (${counts.pantheons})` },
            { id: 'campaigns', label: `Campaigns (${counts.campaigns})` }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as FilterCategory)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-stone-800/70 text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Launch Suggestions when query is empty */}
        {!query && (
          <div className="px-3.5 py-2.5 bg-stone-950/40 border-b border-stone-800/60">
            <div className="text-[10px] uppercase tracking-wider font-serif font-bold text-stone-400 mb-1.5">
              Quick Portals
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'spells', label: 'Grimoire (Spells)', icon: <Sparkles className="w-3.5 h-3.5 text-violet-400" /> },
                { id: 'monsters', label: 'Bestiary (Monsters)', icon: <GothicBat className="w-3.5 h-3.5 text-rose-400" /> },
                { id: 'items', label: 'Armory & Relics', icon: <DragonShield className="w-3.5 h-3.5 text-amber-400" /> },
                { id: 'builder', label: 'Character Builder', icon: <CrossedSwords className="w-3.5 h-3.5 text-amber-400" /> }
              ].map(portal => (
                <button
                  key={portal.id}
                  onClick={() => {
                    onNavigate(portal.id);
                    onClose();
                  }}
                  className="p-2 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-700/60 hover:bg-stone-800/80 text-left flex items-center gap-2 text-xs font-serif text-stone-300 hover:text-amber-200 transition-colors"
                >
                  {portal.icon}
                  <span className="truncate">{portal.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm font-serif">
              <p>No archives matched "{query}".</p>
              <p className="text-xs text-stone-500 mt-1">Try another title, spell school, or monster name.</p>
            </div>
          ) : (
            results.map((entry, idx) => {
              const isSelected = idx === selectedIndex;
              const badge = getSourceBadgeInfo(entry.source_type, entry.source);

              // Secondary detail
              let metaHint = '';
              if (entry.category === 'spells') {
                metaHint = `${getSpellLevelLabel(entry.level)} • ${entry.school || 'Magic'}`;
              } else if (entry.category === 'monsters') {
                metaHint = `CR ${entry.cr ?? '—'} • ${entry.frontmatter.type || 'Creature'}`;
              } else if (entry.category === 'items') {
                metaHint = `${entry.rarity || 'Common'} • ${entry.item_type || 'Item'}`;
              } else if (entry.category === 'classes') {
                metaHint = `Hit Die: ${entry.hit_die || 'd8'}`;
              } else if (entry.category === 'pantheons') {
                const doms = entry.domains?.slice(0, 2).join(', ');
                metaHint = [entry.alignment, doms].filter(Boolean).join(' • ');
              } else if (entry.subcategory) {
                metaHint = entry.subcategory;
              }

              return (
                <div
                  key={entry.id}
                  data-result-item
                  onClick={() => {
                    onNavigate(entry.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-600/20 border border-amber-500/50 text-white'
                      : 'hover:bg-stone-800/50 text-stone-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 shrink-0">
                      {getCategoryIcon(entry.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-stone-100 text-sm truncate flex items-center gap-2">
                        <span>{entry.title}</span>
                        {metaHint && (
                          <span className="text-[11px] font-sans font-normal text-stone-400 truncate hidden sm:inline">
                            ({metaHint})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400 truncate font-sans">
                        <span className="capitalize text-amber-400/90 font-serif font-semibold mr-1.5">{entry.category}</span>
                        {entry.summary ? (
                          <span className="italic">{entry.summary}</span>
                        ) : (
                          <span className="font-mono text-[10px] text-stone-500">{entry.path}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-2.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to open</span>
            <span>ESC to close</span>
          </div>
          <span className="text-amber-400/90 font-serif">{results.length} results</span>
        </div>
      </div>
    </div>
  );
};
