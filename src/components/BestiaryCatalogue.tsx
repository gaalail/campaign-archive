import React, { useState, useMemo, useEffect } from 'react';
import {
  getAllMonsters,
  getAllFamiliarsAndCompanions,
  getEntryById
} from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import { MonsterStatblock } from './MonsterStatblock';
import {
  GothicBat,
  GothicRaven,
  CrossedSwords,
  WaxSeal
} from './GothicIcons';
import {
  Search,
  Shield,
  Heart,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Link2,
  X
} from 'lucide-react';

export type BestiaryTab = 'monsters' | 'companions';

interface BestiaryCatalogueProps {
  onSelectMonster: (id: string) => void;
  initialTab?: BestiaryTab;
}

export const BestiaryCatalogue: React.FC<BestiaryCatalogueProps> = ({
  onSelectMonster,
  initialTab = 'monsters'
}) => {
  const monsters = useMemo(() => getAllMonsters(), []);
  const companions = useMemo(() => getAllFamiliarsAndCompanions(), []);

  const [activeTab, setActiveTab] = useState<BestiaryTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCr, setSelectedCr] = useState<string>('all');
  const [expandedMonsterId, setExpandedMonsterId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setSelectedType('all');
    setSelectedCr('all');
    setExpandedMonsterId(null);
  }, [initialTab]);

  const activePool = activeTab === 'monsters' ? monsters : companions;

  // Extract unique creature types for the active tab
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    activePool.forEach(m => {
      const t = m.monster_type || m.frontmatter?.type;
      if (t) types.add(String(t).toLowerCase());
    });
    return Array.from(types).sort();
  }, [activePool]);

  // Extract unique CRs for Monsters tab
  const availableCrs = useMemo(() => {
    const crs = new Set<string>();
    monsters.forEach(m => {
      const cr = m.cr ?? m.frontmatter?.cr;
      if (cr !== undefined && cr !== null && cr !== '') crs.add(String(cr));
    });
    return Array.from(crs).sort((a, b) => {
      const parseCr = (v: string) => {
        if (v.includes('/')) {
          const [num, den] = v.split('/').map(Number);
          return num / den;
        }
        return parseFloat(v) || 0;
      };
      return parseCr(a) - parseCr(b);
    });
  }, [monsters]);

  // Extract dynamic origin / source pools for Familiars & Companions tab
  const companionOrigins = useMemo(() => {
    const origins = new Map<string, string>();
    companions.forEach(c => {
      const src = (c.source || '').trim();
      if (src) {
        const key = src.toLowerCase();
        if (!origins.has(key)) origins.set(key, src);
      }
    });
    return Array.from(origins.entries()).map(([key, label]) => ({ key, label }));
  }, [companions]);

  // Filtering
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return activePool.filter(m => {
      if (q) {
        const matchesName = m.title.toLowerCase().includes(q);
        const matchesSummary = (m.summary || '').toLowerCase().includes(q);
        const matchesBody = (m.body || '').toLowerCase().includes(q);
        const matchesType = (m.monster_type || m.frontmatter?.type || '').toLowerCase().includes(q);
        const matchesSource = (m.source || '').toLowerCase().includes(q);
        const matchesGrantor = (m.granted_by || []).some(g => g.toLowerCase().includes(q));
        if (!matchesName && !matchesSummary && !matchesBody && !matchesType && !matchesSource && !matchesGrantor) {
          return false;
        }
      }

      if (activeTab === 'monsters') {
        if (selectedCampaign !== 'all') {
          if (selectedCampaign === 'curse-of-strahd') {
            if (m.campaign_id !== 'curse-of-strahd' && !m.path.includes('curse-of-strahd') && !m.id.includes('strahd')) return false;
          } else if (selectedCampaign === 'ra-golvek') {
            if (m.campaign_id !== 'ra-golvek') return false;
          } else if (selectedCampaign === 'vyrun') {
            if (m.campaign_id !== 'vyrun') return false;
          } else if (selectedCampaign === 'srd') {
            if (m.source_type !== 'SRD' && !m.source.includes('SRD')) return false;
          }
        }

        if (selectedCr !== 'all') {
          const cr = String(m.cr ?? m.frontmatter?.cr ?? '');
          if (cr !== selectedCr) return false;
        }
      } else {
        if (selectedOrigin !== 'all') {
          if ((m.source || '').trim().toLowerCase() !== selectedOrigin) return false;
        }
      }

      if (selectedType !== 'all') {
        const t = (m.monster_type || m.frontmatter?.type || '').toLowerCase();
        if (!t.includes(selectedType.toLowerCase())) return false;
      }

      return true;
    });
  }, [activePool, activeTab, searchQuery, selectedCampaign, selectedOrigin, selectedType, selectedCr]);

  const toggleStatblock = (id: string) => {
    setExpandedMonsterId(prev => prev === id ? null : id);
  };

  const handleSwitchTab = (tab: BestiaryTab) => {
    setActiveTab(tab);
    setSelectedType('all');
    setSelectedCr('all');
    setExpandedMonsterId(null);
  };

  const getCreatureIcon = (m: ArchiveEntry) => {
    const t = (m.monster_type || m.frontmatter?.type || '').toLowerCase();
    const isStrahd = m.campaign_id === 'curse-of-strahd' || m.id.includes('strahd');
    if (isStrahd) return <GothicBat className="w-5 h-5 text-rose-400" />;
    if (m.creature_role === 'familiar' || m.creature_role === 'companion' || m.creature_role === 'summon') {
      return <Sparkles className="w-5 h-5 text-violet-400" />;
    }
    if (t.includes('undead')) return <GothicBat className="w-5 h-5 text-rose-400" />;
    if (t.includes('construct') || t.includes('beast')) return <GothicRaven className="w-5 h-5 text-amber-400" />;
    return <CrossedSwords className="w-5 h-5 text-amber-500" />;
  };

  const resolveGrantors = (m: ArchiveEntry) => {
    const rawList: string[] = Array.isArray(m.granted_by)
      ? m.granted_by
      : Array.isArray(m.frontmatter?.granted_by)
        ? m.frontmatter.granted_by
        : [];
    const out: Array<{ id?: string; label: string }> = [];
    const seen = new Set<string>();
    for (const raw of rawList) {
      const cleanRaw = String(raw).replace(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/, '$1').trim();
      const displayMatch = String(raw).match(/^\[\[[^|\]]+\|([^\]]+)\]\]$/);
      const target = getEntryById(cleanRaw);
      const key = (target?.id || cleanRaw).toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: target?.id,
        label: displayMatch?.[1]?.trim() || target?.title || cleanRaw.split('/').pop() || cleanRaw
      });
    }
    return out;
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedType !== 'all' ||
    (activeTab === 'monsters' ? (selectedCampaign !== 'all' || selectedCr !== 'all') : selectedOrigin !== 'all')
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Bestiary Codex Header */}
      <div className={`relative rounded-2xl border-2 bg-gradient-to-b from-[#1c1815] via-[#14100e] to-[#0c0a09] p-6 sm:p-8 shadow-2xl overflow-hidden ${
        activeTab === 'companions' ? 'border-violet-900/60' : 'border-amber-900/60'
      }`}>
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
          activeTab === 'companions' ? 'bg-violet-950/25' : 'bg-rose-950/20'
        }`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border shadow-md ${
                activeTab === 'companions'
                  ? 'bg-violet-950/60 border-violet-800/60 text-violet-300'
                  : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
              }`}>
                {activeTab === 'companions'
                  ? <Sparkles className="w-7 h-7 text-violet-300" />
                  : <GothicBat className="w-7 h-7 text-rose-400" />}
              </div>
              <div>
                <h1 className={`font-fantasy text-3xl sm:text-4xl font-bold tracking-wide ${
                  activeTab === 'companions' ? 'text-violet-200' : 'text-amber-200'
                }`}>
                  {activeTab === 'companions' ? 'Familiars & Companions' : '5e Bestiary & Monster Manual'}
                </h1>
                <p className={`font-serif text-xs tracking-widest uppercase font-semibold ${
                  activeTab === 'companions' ? 'text-violet-400/80' : 'text-amber-500/80'
                }`}>
                  {activeTab === 'companions'
                    ? `Spellbound Forms, Pact Familiars & Summons • ${companions.length} Registered Forms`
                    : `Compendium of Beasts, Horrors & Darklords • ${monsters.length} Registered Monsters`}
                </p>
              </div>
            </div>
            <p className="text-sm font-serif text-stone-300 max-w-2xl leading-relaxed">
              {activeTab === 'companions'
                ? 'Stat blocks for player-accessible familiars, companions, and conjured spirits—each linked directly to the spells, patrons, and class features that grant them.'
                : "Explore combat statistics, ability scores, legendary traits, and lair powers for monsters encountered across Castle Ravenloft, the mythic realms of Ra Gol'vek, and Vyrun's primordial frontiers."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs font-serif">
              <WaxSeal label="5e" className="w-5 h-5 text-[9px]" />
              <span className="text-stone-300 font-semibold">
                {filteredEntries.length} of {activePool.length} {activeTab === 'companions' ? 'Forms' : 'Creatures'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Mode Tabs: Monsters vs Familiars & Companions */}
        <div className="relative z-10 mt-6 pt-4 border-t border-amber-900/30 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSwitchTab('monsters')}
            className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'monsters'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-amber-200 hover:border-amber-800/60'
            }`}
          >
            <GothicBat className={`w-4 h-4 ${activeTab === 'monsters' ? 'text-stone-950' : 'text-rose-400'}`} />
            <span>Monsters ({monsters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('companions')}
            className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'companions'
                ? 'bg-violet-600 text-white shadow-md'
                : 'bg-stone-900/80 border border-stone-800 text-stone-300 hover:text-violet-200 hover:border-violet-800/60'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'companions' ? 'text-white' : 'text-violet-400'}`} />
            <span>Familiars & Companions ({companions.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'companions'
                ? 'Search familiars, companions, spells, features, traits, or creature types...'
                : 'Search by creature name, trait, action, or monster type...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-950/80 border border-stone-800 focus:border-amber-500/60 text-stone-200 placeholder-stone-500 text-sm focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Realm / Source Filters */}
        {activeTab === 'monsters' ? (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-800/60">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 font-serif mr-1">Realm:</span>
            {[
              { id: 'all', label: 'All Realms' },
              { id: 'curse-of-strahd', label: 'Curse of Strahd', icon: '🦇' },
              { id: 'ra-golvek', label: "Ra Gol'vek", icon: '⏳' },
              { id: 'vyrun', label: 'Vyrun', icon: '🌲' },
              { id: 'srd', label: 'SRD Core', icon: '📜' }
            ].map(realm => (
              <button
                key={realm.id}
                onClick={() => setSelectedCampaign(realm.id)}
                className={`px-3 py-1 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCampaign === realm.id
                    ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                    : 'bg-stone-950/60 border border-stone-800 text-stone-300 hover:text-amber-300 hover:border-amber-800/60'
                }`}
              >
                {realm.icon && <span>{realm.icon}</span>}
                <span>{realm.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-800/60">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 font-serif mr-1">Origin:</span>
            <button
              onClick={() => setSelectedOrigin('all')}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                selectedOrigin === 'all'
                  ? 'bg-violet-600 text-white shadow-md font-bold'
                  : 'bg-stone-950/60 border border-stone-800 text-stone-300 hover:text-violet-300 hover:border-violet-800/60'
              }`}
            >
              All Sources
            </button>
            {companionOrigins.map(orig => (
              <button
                key={orig.key}
                onClick={() => setSelectedOrigin(orig.key)}
                className={`px-3 py-1 rounded-lg text-xs font-serif font-semibold transition-all cursor-pointer ${
                  selectedOrigin === orig.key
                    ? 'bg-violet-600 text-white shadow-md font-bold'
                    : 'bg-stone-950/60 border border-stone-800 text-stone-300 hover:text-violet-300 hover:border-violet-800/60'
                }`}
              >
                {orig.label}
              </button>
            ))}
          </div>
        )}

        {/* Type & CR Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-stone-800/60 text-xs font-serif">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1 text-stone-200 text-xs focus:outline-none focus:border-amber-500 capitalize"
            >
              <option value="all">All Types</option>
              {availableTypes.map(t => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>

          {activeTab === 'monsters' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">CR:</span>
              <select
                value={selectedCr}
                onChange={(e) => setSelectedCr(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Challenge Ratings</option>
                {availableCrs.map(cr => (
                  <option key={cr} value={cr}>CR {cr}</option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedCampaign('all');
                setSelectedOrigin('all');
                setSelectedType('all');
                setSelectedCr('all');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] text-amber-400 hover:text-amber-200 underline font-serif cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Creature Cards List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-stone-800 bg-stone-950/40 space-y-3">
            {activeTab === 'companions'
              ? <Sparkles className="w-10 h-10 text-stone-600 mx-auto" />
              : <GothicBat className="w-10 h-10 text-stone-600 mx-auto" />}
            <h3 className="font-fantasy text-lg text-stone-300">
              {activeTab === 'companions' ? 'No Familiars or Companions Match Your Search' : 'No Monsters Match Your Search'}
            </h3>
            <p className="text-xs text-stone-500 font-serif">
              Try adjusting your creature type, source, or search filters.
            </p>
          </div>
        ) : (
          filteredEntries.map(creature => {
            const isExpanded = expandedMonsterId === creature.id;
            const isStrahd = creature.campaign_id === 'curse-of-strahd' || creature.id.includes('strahd');
            const isCompanion = activeTab === 'companions';
            const cr = creature.cr ?? creature.frontmatter?.cr;
            const ac = creature.ac || creature.frontmatter?.ac || '10';
            const hp = creature.hp || creature.frontmatter?.hp || '—';
            const monsterType = creature.monster_type || creature.frontmatter?.type || 'creature';
            const size = creature.size || creature.frontmatter?.size || 'Medium';
            const alignment = creature.alignment || creature.frontmatter?.alignment;
            const grantors = isCompanion ? resolveGrantors(creature) : [];

            return (
              <div
                key={creature.id}
                className={`rounded-xl border-2 transition-all overflow-hidden ${
                  isStrahd
                    ? 'bg-stone-950/90 border-rose-950 hover:border-rose-800/80 shadow-[0_4px_20px_rgba(136,19,55,0.15)]'
                    : isCompanion
                      ? 'bg-stone-950/90 border-stone-800 hover:border-violet-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                      : 'bg-stone-950/90 border-stone-800 hover:border-amber-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                }`}
              >
                {/* Summary Header Bar */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      isStrahd
                        ? 'bg-rose-950/60 border-rose-900/60 text-rose-400'
                        : isCompanion
                          ? 'bg-violet-950/50 border-violet-900/50 text-violet-300'
                          : 'bg-stone-900 border-amber-900/40 text-amber-400'
                    }`}>
                      {getCreatureIcon(creature)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onSelectMonster(creature.id)}
                          className={`font-fantasy text-lg sm:text-xl font-bold tracking-wide hover:underline text-left transition-colors cursor-pointer ${
                            isStrahd ? 'text-rose-200 hover:text-white' : isCompanion ? 'text-violet-200 hover:text-white' : 'text-amber-200 hover:text-white'
                          }`}
                        >
                          {creature.title}
                        </button>

                        {cr !== null && cr !== undefined && cr !== '' ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-serif tracking-widest uppercase border ${
                            isStrahd
                              ? 'bg-rose-950/80 text-rose-300 border-rose-900/70'
                              : isCompanion
                                ? 'bg-violet-950/80 text-violet-300 border-violet-900/70'
                                : 'bg-amber-950/80 text-amber-300 border-amber-900/70'
                          }`}>
                            CR {cr}
                          </span>
                        ) : isCompanion ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-serif tracking-widest uppercase border bg-violet-950/80 text-violet-300 border-violet-900/70">
                            {creature.min_level ? `Lv ${creature.min_level}+ Familiar` : (creature.creature_role || 'Familiar')}
                          </span>
                        ) : null}

                        {isStrahd && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-serif tracking-widest uppercase border bg-stone-900 text-rose-400 border-rose-950">
                            Barovia
                          </span>
                        )}
                      </div>

                      <div className="text-xs italic text-stone-400 capitalize font-serif">
                        {size} {monsterType} {alignment ? `• ${alignment}` : ''}
                      </div>

                      {creature.summary && (
                        <p className="text-xs text-stone-300 line-clamp-2 max-w-2xl font-serif mt-1">
                          {creature.summary}
                        </p>
                      )}

                      {grantors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Granted by:</span>
                          {grantors.map((gb, idx) => (
                            gb.id ? (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => onSelectMonster(gb.id!)}
                                className="px-2 py-0.5 rounded border border-violet-800/50 bg-violet-950/40 hover:bg-violet-900/60 text-violet-300 hover:text-white text-[11px] font-sans font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Link2 className="w-2.5 h-2.5 text-violet-400" />
                                <span>{gb.label}</span>
                              </button>
                            ) : (
                              <span key={idx} className="text-[11px] text-stone-400">{gb.label}</span>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vitals & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:self-center">
                    {/* Quick Vitals */}
                    <div className="hidden sm:flex items-center gap-2 text-xs font-serif">
                      <div className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 flex items-center gap-1.5" title="Armor Class">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        <span>AC {ac}</span>
                      </div>
                      <div className="px-2.5 py-1 rounded bg-stone-900 border border-stone-800 text-stone-300 flex items-center gap-1.5" title="Hit Points">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>HP {hp}</span>
                      </div>
                    </div>

                    {/* Statblock Toggle */}
                    <button
                      onClick={() => toggleStatblock(creature.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isExpanded
                          ? (isStrahd ? 'bg-rose-900 text-white shadow' : isCompanion ? 'bg-violet-600 text-white shadow' : 'bg-amber-600 text-stone-950 shadow')
                          : (isStrahd
                              ? 'bg-rose-950/60 border border-rose-900/60 text-rose-300 hover:bg-rose-900/40'
                              : isCompanion
                                ? 'bg-stone-900 border border-violet-900/50 text-violet-300 hover:border-violet-500'
                                : 'bg-stone-900 border border-amber-900/40 text-amber-300 hover:border-amber-600')
                      }`}
                    >
                      <span>{isExpanded ? 'Hide Statblock' : 'Inspect Statblock'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Open Entry */}
                    <button
                      onClick={() => onSelectMonster(creature.id)}
                      title="Open full codex entry"
                      className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Full Statblock Expansion */}
                {isExpanded && (
                  <div className="border-t border-amber-900/40 p-4 sm:p-6 bg-stone-950/95 animate-fadeIn">
                    <MonsterStatblock entry={creature} onNavigate={onSelectMonster} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
