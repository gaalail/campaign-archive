import React, { useState, useMemo } from 'react';
import { getAllMonsters } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import { MonsterStatblock } from './MonsterStatblock';
import {
  GothicBat,
  GothicRaven,
  CrossedSwords,
  WaxSeal,
  DragonShield,
  DndFleuronDivider
} from './GothicIcons';
import {
  Search,
  Shield,
  Heart,
  Zap,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Filter,
  X
} from 'lucide-react';

interface BestiaryCatalogueProps {
  onSelectMonster: (id: string) => void;
}

export const BestiaryCatalogue: React.FC<BestiaryCatalogueProps> = ({ onSelectMonster }) => {
  const monsters = useMemo(() => getAllMonsters(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCr, setSelectedCr] = useState<string>('all');
  const [expandedMonsterId, setExpandedMonsterId] = useState<string | null>(null);

  // Extract unique monster types & CRs
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    monsters.forEach(m => {
      const t = m.monster_type || m.frontmatter?.type;
      if (t) types.add(t.toLowerCase());
    });
    return Array.from(types).sort();
  }, [monsters]);

  const availableCrs = useMemo(() => {
    const crs = new Set<string>();
    monsters.forEach(m => {
      const cr = m.cr || m.frontmatter?.cr;
      if (cr !== undefined && cr !== null) crs.add(String(cr));
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

  // Filtering
  const filteredMonsters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return monsters.filter(m => {
      // Search
      if (q) {
        const matchesName = m.title.toLowerCase().includes(q);
        const matchesSummary = (m.summary || '').toLowerCase().includes(q);
        const matchesBody = (m.body || '').toLowerCase().includes(q);
        const matchesType = (m.monster_type || m.frontmatter?.type || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSummary && !matchesBody && !matchesType) return false;
      }

      // Campaign
      if (selectedCampaign !== 'all') {
        if (selectedCampaign === 'curse-of-strahd') {
          if (m.campaign_id !== 'curse-of-strahd' && !m.path.includes('curse-of-strahd') && !m.id.includes('strahd')) return false;
        } else if (selectedCampaign === 'ra-golvek') {
          if (m.campaign_id !== 'ra-golvek') return false;
        } else if (selectedCampaign === 'vyrun') {
          if (m.campaign_id !== 'vyrun') return false;
        } else if (selectedCampaign === 'hexbound') {
          if (!m.source.toLowerCase().includes('hexbound')) return false;
        } else if (selectedCampaign === 'srd') {
          if (m.source_type !== 'SRD' && !m.source.includes('SRD')) return false;
        }
      }

      // Type
      if (selectedType !== 'all') {
        const t = (m.monster_type || m.frontmatter?.type || '').toLowerCase();
        if (!t.includes(selectedType.toLowerCase())) return false;
      }

      // CR
      if (selectedCr !== 'all') {
        const cr = String(m.cr || m.frontmatter?.cr || '');
        if (cr !== selectedCr) return false;
      }

      return true;
    });
  }, [monsters, searchQuery, selectedCampaign, selectedType, selectedCr]);

  const toggleStatblock = (id: string) => {
    setExpandedMonsterId(prev => prev === id ? null : id);
  };

  const getCreatureIcon = (m: ArchiveEntry) => {
    const t = (m.monster_type || m.frontmatter?.type || '').toLowerCase();
    const isStrahd = m.campaign_id === 'curse-of-strahd' || m.id.includes('strahd');
    if (isStrahd) return <GothicBat className="w-5 h-5 text-rose-400" />;
    if (t.includes('undead')) return <GothicBat className="w-5 h-5 text-rose-400" />;
    if (t.includes('construct') || t.includes('beast')) return <GothicRaven className="w-5 h-5 text-amber-400" />;
    return <CrossedSwords className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Bestiary Codex Header */}
      <div className="relative rounded-2xl border-2 border-amber-900/60 bg-gradient-to-b from-[#1c1815] via-[#14100e] to-[#0c0a09] p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-950/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 shadow-md">
                <GothicBat className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <h1 className="font-fantasy text-3xl sm:text-4xl font-bold text-amber-200 tracking-wide">
                  5e Bestiary & Monster Manual
                </h1>
                <p className="font-serif text-xs text-amber-500/80 tracking-widest uppercase font-semibold">
                  Compendium of Beasts, Horrors & Darklords • {monsters.length} Registered Creatures
                </p>
              </div>
            </div>
            <p className="text-sm font-serif text-stone-300 max-w-2xl leading-relaxed">
              Explore combat statistics, ability scores, legendary traits, and lair powers for monsters encountered across Castle Ravenloft, the high-seas of Ra Gol'vek, Vyrun's primordial frontiers, and witch familiars.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs font-serif">
              <WaxSeal label="5e" className="w-5 h-5 text-[9px]" />
              <span className="text-stone-300 font-semibold">{filteredMonsters.length} of {monsters.length} Creatures</span>
            </div>
          </div>
        </div>

        {/* Decorative manuscript divider */}
        <div className="mt-6 pt-4 border-t border-amber-900/30 flex items-center justify-center">
          <div className="text-[11px] text-amber-700/60 flex items-center gap-2 select-none">
            <span>❖</span>
            <span className="w-24 h-px bg-amber-800/40"></span>
            <span>⚔</span>
            <span className="w-24 h-px bg-amber-800/40"></span>
            <span>❖</span>
          </div>
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
            placeholder="Search by creature name, trait, action, or monster type..."
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

        {/* Realm / Campaign Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-800/60">
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 font-serif mr-1">Realm:</span>
          {[
            { id: 'all', label: 'All Realms' },
            { id: 'curse-of-strahd', label: 'Curse of Strahd', icon: '🦇' },
            { id: 'ra-golvek', label: "Ra Gol'vek", icon: '⚓' },
            { id: 'vyrun', label: 'Vyrun', icon: '🌲' },
            { id: 'hexbound', label: 'Hexbound Familiars', icon: '✨' },
            { id: 'srd', label: 'SRD Core', icon: '📜' }
          ].map(realm => (
            <button
              key={realm.id}
              onClick={() => setSelectedCampaign(realm.id)}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-semibold transition-all flex items-center gap-1.5 ${
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

          {(selectedCampaign !== 'all' || selectedType !== 'all' || selectedCr !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCampaign('all');
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

      {/* Monster Cards List */}
      <div className="space-y-4">
        {filteredMonsters.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-stone-800 bg-stone-950/40 space-y-3">
            <GothicBat className="w-10 h-10 text-stone-600 mx-auto" />
            <h3 className="font-fantasy text-lg text-stone-300">No Monsters Match Your Search</h3>
            <p className="text-xs text-stone-500 font-serif">
              Try adjusting your challenge rating, creature type, or realm filters.
            </p>
          </div>
        ) : (
          filteredMonsters.map(monster => {
            const isExpanded = expandedMonsterId === monster.id;
            const isStrahd = monster.campaign_id === 'curse-of-strahd' || monster.id.includes('strahd');
            const cr = monster.cr || monster.frontmatter?.cr || '0';
            const ac = monster.ac || monster.frontmatter?.ac || '10';
            const hp = monster.hp || monster.frontmatter?.hp || '10';
            const speed = monster.speed || monster.frontmatter?.speed || '30 ft.';
            const monsterType = monster.monster_type || monster.frontmatter?.type || 'creature';
            const size = monster.size || monster.frontmatter?.size || 'Medium';

            return (
              <div
                key={monster.id}
                className={`rounded-xl border-2 transition-all overflow-hidden ${
                  isStrahd
                    ? 'bg-stone-950/90 border-rose-950 hover:border-rose-800/80 shadow-[0_4px_20px_rgba(136,19,55,0.15)]'
                    : 'bg-stone-950/90 border-stone-800 hover:border-amber-700/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                }`}
              >
                {/* Summary Header Bar */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${
                      isStrahd
                        ? 'bg-rose-950/60 border-rose-900/60 text-rose-400'
                        : 'bg-stone-900 border-amber-900/40 text-amber-400'
                    }`}>
                      {getCreatureIcon(monster)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onSelectMonster(monster.id)}
                          className={`font-fantasy text-lg sm:text-xl font-bold tracking-wide hover:underline text-left transition-colors ${
                            isStrahd ? 'text-rose-200 hover:text-white' : 'text-amber-200 hover:text-white'
                          }`}
                        >
                          {monster.title}
                        </button>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-serif tracking-widest uppercase border ${
                          isStrahd
                            ? 'bg-rose-950/80 text-rose-300 border-rose-900/70'
                            : 'bg-amber-950/80 text-amber-300 border-amber-900/70'
                        }`}>
                          CR {cr}
                        </span>

                        {isStrahd && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-serif tracking-widest uppercase border bg-stone-900 text-rose-400 border-rose-950">
                            Barovia
                          </span>
                        )}
                      </div>

                      <div className="text-xs italic text-stone-400 capitalize font-serif">
                        {size} {monsterType} {monster.alignment || monster.frontmatter?.alignment ? `• ${monster.alignment || monster.frontmatter?.alignment}` : ''}
                      </div>

                      {monster.summary && (
                        <p className="text-xs text-stone-300 line-clamp-2 max-w-2xl font-serif mt-1">
                          {monster.summary}
                        </p>
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
                      onClick={() => toggleStatblock(monster.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isExpanded
                          ? (isStrahd ? 'bg-rose-900 text-white shadow' : 'bg-amber-600 text-stone-950 shadow')
                          : (isStrahd
                              ? 'bg-rose-950/60 border border-rose-900/60 text-rose-300 hover:bg-rose-900/40'
                              : 'bg-stone-900 border border-amber-900/40 text-amber-300 hover:border-amber-600')
                      }`}
                    >
                      <span>{isExpanded ? 'Hide Statblock' : 'Inspect Statblock'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Open Entry */}
                    <button
                      onClick={() => onSelectMonster(monster.id)}
                      title="Open full codex entry"
                      className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Full Statblock Expansion */}
                {isExpanded && (
                  <div className="border-t border-amber-900/40 p-4 sm:p-6 bg-stone-950/95 animate-fadeIn">
                    <MonsterStatblock entry={monster} onNavigate={onSelectMonster} />
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
