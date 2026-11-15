import React, { useState, useMemo, useEffect } from 'react';
import {
  getAllDeities,
  getPantheonOverviewForCampaign,
  getCampaignDisplayName
} from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import {
  Search,
  Sun,
  Compass,
  BookOpen,
  ChevronRight,
  Sparkles,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { GothicRaven, CrossedSwords } from './GothicIcons';

interface PantheonCatalogueProps {
  onSelectEntry: (id: string) => void;
  initialCampaign?: string;
  hideCampaignSelector?: boolean;
}

const CAMPAIGN_REALMS = [
  {
    id: 'curse-of-strahd',
    name: 'Curse of Strahd',
    subtitle: 'Faiths of Barovia · Eternal Twilight & Intercepted Prayers',
    accentText: 'text-rose-300',
    borderClass: 'border-rose-900/50',
    hoverBorderClass: 'hover:border-rose-700/80',
    bgClass: 'bg-stone-950/85'
  },
  {
    id: 'ra-golvek',
    name: "Ra Gol'vek",
    subtitle: 'Gods, Spirits & Sovereigns · Deitric Realms, Archangels, Avehrneol & Forbidden Cataclysms',
    accentText: 'text-cyan-300',
    borderClass: 'border-cyan-900/50',
    hoverBorderClass: 'hover:border-cyan-700/80',
    bgClass: 'bg-stone-950/85'
  },
  {
    id: 'vyrun',
    name: 'Vyrun',
    subtitle: 'The Reawakened Old Gods · Frontier Hearths & Ley Resonance',
    accentText: 'text-emerald-300',
    borderClass: 'border-emerald-900/50',
    hoverBorderClass: 'hover:border-emerald-700/80',
    bgClass: 'bg-stone-950/85'
  }
];

function getRealmIcon(campaignId?: string | null) {
  switch (campaignId) {
    case 'curse-of-strahd':
      return <GothicRaven className="w-4 h-4 text-rose-400 shrink-0" />;
    case 'ra-golvek':
      return <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />;
    case 'vyrun':
      return <Flame className="w-4 h-4 text-emerald-400 shrink-0" />;
    default:
      return <Sun className="w-4 h-4 text-amber-400 shrink-0" />;
  }
}

export const PantheonCatalogue: React.FC<PantheonCatalogueProps> = ({
  onSelectEntry,
  initialCampaign = 'all',
  hideCampaignSelector = false
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>(initialCampaign || 'all');
  const [selectedPantheon, setSelectedPantheon] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedAlignment, setSelectedAlignment] = useState<string>('all');
  const [hideForbidden, setHideForbidden] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setSelectedCampaign(initialCampaign || 'all');
    setSelectedPantheon('all');
  }, [initialCampaign]);

  const allDeities = useMemo(() => getAllDeities(), []);

  const campaignScopedDeities = useMemo(() => {
    if (selectedCampaign === 'all') return allDeities;
    return allDeities.filter(d => d.campaign_id === selectedCampaign);
  }, [allDeities, selectedCampaign]);

  const availablePantheons = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of campaignScopedDeities) {
      const p = d.pantheon || getCampaignDisplayName(d.campaign_id);
      counts.set(p, (counts.get(p) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => {
      if (a[0] === 'Cataclysms') return 1;
      if (b[0] === 'Cataclysms') return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [campaignScopedDeities]);

  const availableDomainsAndPortfolios = useMemo(() => {
    const set = new Set<string>();
    for (const d of campaignScopedDeities) {
      for (const dom of d.domains || []) {
        if (dom) set.add(String(dom));
      }
      for (const port of d.portfolios || []) {
        if (port) set.add(String(port));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [campaignScopedDeities]);

  const allAlignments = useMemo(() => {
    const set = new Set<string>();
    for (const d of campaignScopedDeities) {
      if (d.alignment) set.add(d.alignment);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [campaignScopedDeities]);

  const filteredDeities = useMemo(() => {
    return allDeities.filter(deity => {
      if (selectedCampaign !== 'all' && deity.campaign_id !== selectedCampaign) {
        return false;
      }

      if (hideForbidden && deity.worship_forbidden) {
        return false;
      }

      if (selectedPantheon !== 'all') {
        const p = deity.pantheon || getCampaignDisplayName(deity.campaign_id);
        if (p !== selectedPantheon) return false;
      }

      if (selectedDomain !== 'all') {
        const attrs = [
          ...(deity.domains || []),
          ...(deity.portfolios || [])
        ].map(d => d.toLowerCase());
        if (!attrs.includes(selectedDomain.toLowerCase())) return false;
      }

      if (selectedAlignment !== 'all') {
        if ((deity.alignment || '').toLowerCase() !== selectedAlignment.toLowerCase()) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const haystacks = [
          deity.title,
          deity.pantheon || '',
          deity.divine_rank || '',
          deity.primary_title || '',
          deity.sin || '',
          deity.virtue || '',
          deity.harbinger || '',
          deity.element || '',
          deity.dominion || '',
          deity.binding_condition || '',
          deity.summary || '',
          deity.symbol || '',
          deity.worshippers || '',
          ...(deity.domains || []),
          ...(deity.portfolios || []),
          ...(deity.recommended_oaths || [])
        ];
        if (!haystacks.some(h => h.toLowerCase().includes(q))) {
          return false;
        }
      }

      return true;
    });
  }, [
    allDeities,
    selectedCampaign,
    hideForbidden,
    selectedPantheon,
    selectedDomain,
    selectedAlignment,
    searchQuery
  ]);

  const groupedByCampaign = useMemo(() => {
    const map = new Map<string, ArchiveEntry[]>();
    for (const realm of CAMPAIGN_REALMS) {
      map.set(realm.id, []);
    }

    for (const deity of filteredDeities) {
      const key = deity.campaign_id || 'other';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(deity);
    }

    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [filteredDeities]);

  const resetFilters = () => {
    if (!hideCampaignSelector) setSelectedCampaign('all');
    setSelectedPantheon('all');
    setSelectedDomain('all');
    setSelectedAlignment('all');
    setHideForbidden(false);
    setSearchQuery('');
  };

  const hasActiveFilters =
    (!hideCampaignSelector && selectedCampaign !== 'all') ||
    selectedPantheon !== 'all' ||
    selectedDomain !== 'all' ||
    selectedAlignment !== 'all' ||
    hideForbidden ||
    searchQuery.trim() !== '';

  const hasForbiddenInScope = useMemo(
    () => campaignScopedDeities.some(d => d.worship_forbidden),
    [campaignScopedDeities]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Filter Controls */}
      {!hideCampaignSelector ? (
        <section className="rounded-2xl border border-amber-900/50 bg-stone-900/90 p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-800 pb-5">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-serif uppercase tracking-widest text-amber-500 font-semibold tabular-nums">
                Cosmology & Setting Faiths · {filteredDeities.length} Powers Indexed
              </div>
              <h1 className="font-fantasy text-3xl md:text-4xl font-bold tracking-tight text-amber-100">
                Pantheons & Worship
              </h1>
              <p className="text-sm text-stone-300 leading-relaxed font-sans">
                Each campaign world shapes what answers when mortals pray. Browse deities, Archangels, Archdevils, Spirits, and Sovereigns by realm or structure—or adopt a patron directly inside the Character Builder.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => onSelectEntry('campaigns')}
                className="px-4 py-2 rounded-lg border border-stone-700 bg-stone-950 hover:bg-stone-800 text-xs font-serif text-stone-200 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Campaign Hub</span>
              </button>
              <button
                onClick={() =>
                  onSelectEntry(
                    selectedCampaign !== 'all'
                      ? `builder?campaign=${encodeURIComponent(selectedCampaign)}`
                      : 'builder'
                  )
                }
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold font-serif transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <CrossedSwords className="w-4 h-4" />
                <span>Create Devoted Hero</span>
              </button>
            </div>
          </div>

          {/* Interactive Filters Row */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-stone-950 border border-stone-800">
                {[
                  { id: 'all', label: 'All Realms' },
                  { id: 'curse-of-strahd', label: 'Curse of Strahd' },
                  { id: 'ra-golvek', label: "Ra Gol'vek" },
                  { id: 'vyrun', label: 'Vyrun' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedCampaign(tab.id);
                      setSelectedPantheon('all');
                      setSelectedDomain('all');
                      setSelectedAlignment('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-serif transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCampaign === tab.id
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'text-stone-400 hover:text-stone-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {hasForbiddenInScope && (
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hideForbidden}
                      onChange={e => setHideForbidden(e.target.checked)}
                      className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-amber-500"
                    />
                    <span>Hide Forbidden Cataclysms</span>
                  </label>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-serif text-amber-400 hover:text-amber-200 underline cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4 relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name, sin, virtue, element, domain..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedPantheon}
                  onChange={e => setSelectedPantheon(e.target.value)}
                  aria-label="Filter by pantheon or structure"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Pantheons ({availablePantheons.length})</option>
                  {availablePantheons.map(([pantheonName, count]) => (
                    <option key={pantheonName} value={pantheonName}>
                      {pantheonName} ({count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  aria-label="Filter by divine domain or portfolio"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Domains & Portfolios ({availableDomainsAndPortfolios.length})</option>
                  {availableDomainsAndPortfolios.map(dom => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={selectedAlignment}
                  onChange={e => setSelectedAlignment(e.target.value)}
                  aria-label="Filter by alignment"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Alignments</option>
                  {allAlignments.map(align => (
                    <option key={align} value={align}>
                      {align}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Embedded Filter Bar inside Campaign Pantheon Overview pages */
        <section className="rounded-xl border border-stone-800 bg-stone-950/75 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-serif uppercase tracking-widest text-amber-400 font-semibold tabular-nums">
              Filter {getCampaignDisplayName(selectedCampaign)} Registry · {filteredDeities.length} Powers
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {selectedCampaign === 'ra-golvek' && (
                <button
                  onClick={() => onSelectEntry('campaigns/ra-golvek/rules/Divine Portfolios and Mythic Rank')}
                  className="text-xs font-serif font-semibold text-cyan-300 hover:text-cyan-200 underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  Divine Portfolios & Mythic Rank →
                </button>
              )}
              {hasForbiddenInScope && (
                <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideForbidden}
                    onChange={e => setHideForbidden(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Hide Forbidden Cataclysms</span>
                </label>
              )}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-serif text-amber-400 hover:text-amber-200 underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, sin, virtue, element, dominion..."
                className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedPantheon}
                onChange={e => setSelectedPantheon(e.target.value)}
                aria-label="Filter by pantheon or structure"
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Structures ({availablePantheons.length})</option>
                {availablePantheons.map(([pantheonName, count]) => (
                  <option key={pantheonName} value={pantheonName}>
                    {pantheonName} ({count})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedAlignment}
                onChange={e => setSelectedAlignment(e.target.value)}
                aria-label="Filter by alignment"
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Alignments</option>
                {allAlignments.map(align => (
                  <option key={align} value={align}>
                    {align}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredDeities.length === 0 ? (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-10 text-center space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-200">No Matching Powers</h2>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            No deities, spirits, or sovereigns matched your current realm, pantheon, or search criteria.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
          >
            Show All Powers
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedByCampaign.map(([campaignId, deities]) => {
            const realmMeta = CAMPAIGN_REALMS.find(r => r.id === campaignId);
            const overviewEntry = getPantheonOverviewForCampaign(campaignId);

            // Group entries within this campaign by Pantheon / Structure
            const pantheonGroupsMap = new Map<string, ArchiveEntry[]>();
            for (const d of deities) {
              const groupKey = d.pantheon || getCampaignDisplayName(campaignId);
              if (!pantheonGroupsMap.has(groupKey)) pantheonGroupsMap.set(groupKey, []);
              pantheonGroupsMap.get(groupKey)!.push(d);
            }
            const pantheonGroups = Array.from(pantheonGroupsMap.entries()).sort((a, b) => {
              if (a[0] === 'Cataclysms') return 1;
              if (b[0] === 'Cataclysms') return -1;
              return a[0].localeCompare(b[0]);
            });
            const showSubheadings = pantheonGroups.length > 1 || campaignId === 'ra-golvek';

            return (
              <section key={campaignId} className="space-y-6">
                {/* Realm Header Strip */}
                {!hideCampaignSelector && (
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-stone-400">
                        {getRealmIcon(campaignId)}
                        <span>{realmMeta?.name || getCampaignDisplayName(campaignId)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {deities.length} {deities.length === 1 ? 'Power' : 'Powers'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">
                        {realmMeta?.subtitle || overviewEntry?.summary}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {campaignId === 'ra-golvek' && (
                        <button
                          onClick={() =>
                            onSelectEntry('campaigns/ra-golvek/rules/Divine Portfolios and Mythic Rank')
                          }
                          className="text-xs font-serif font-semibold text-cyan-300 hover:text-cyan-200 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Portfolios & Mythic Rules →
                        </button>
                      )}
                      {overviewEntry && (
                        <button
                          onClick={() => onSelectEntry(overviewEntry.id)}
                          className="text-xs font-serif font-semibold text-amber-400 hover:text-amber-200 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Registry</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onSelectEntry(`campaigns/${campaignId}/index`)}
                        className="text-xs font-serif text-stone-400 hover:text-stone-200 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Campaign Hub →
                      </button>
                    </div>
                  </div>
                )}

                {/* Grouped Pantheon Sections */}
                <div className="space-y-8">
                  {pantheonGroups.map(([pantheonName, groupDeities]) => {
                    const isCataclysmGroup = pantheonName === 'Cataclysms';

                    return (
                      <div key={pantheonName} className="space-y-3.5">
                        {showSubheadings && (
                          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-800/70 pb-2">
                            <div className="flex items-baseline gap-2.5">
                              <h2
                                className={`font-fantasy text-lg font-bold tracking-wide ${
                                  isCataclysmGroup ? 'text-rose-300' : 'text-amber-200'
                                }`}
                              >
                                {pantheonName}
                              </h2>
                              <span className="text-xs font-mono text-stone-400 tabular-nums">
                                {groupDeities.length} {groupDeities.length === 1 ? 'entry' : 'entries'}
                              </span>
                            </div>
                            {isCataclysmGroup && (
                              <span className="text-xs font-serif text-rose-400 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>No Pantheon · Worship Forbidden Across Most Lands</span>
                              </span>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupDeities.map(deity => {
                            const domains = deity.domains || [];
                            const portfolios = deity.portfolios || [];
                            const oaths = deity.recommended_oaths || [];
                            const builderUrl = `builder?campaign=${encodeURIComponent(
                              deity.campaign_id || ''
                            )}&deity=${encodeURIComponent(deity.id)}`;

                            const rows: { label: string; value: string; accent?: string }[] = [];
                            if (deity.primary_title) {
                              rows.push({ label: 'Title', value: deity.primary_title, accent: 'text-amber-200' });
                            }
                            if (deity.sin) {
                              rows.push({ label: 'Sin', value: deity.sin, accent: 'text-rose-300 font-medium' });
                            }
                            if (deity.virtue) {
                              rows.push({ label: 'Virtue', value: deity.virtue, accent: 'text-cyan-200 font-medium' });
                            }
                            if (deity.harbinger) {
                              rows.push({ label: 'Harbinger', value: deity.harbinger, accent: 'text-rose-300 font-medium' });
                            }
                            if (deity.element) {
                              rows.push({ label: 'Element', value: deity.element, accent: 'text-emerald-300 font-medium' });
                            }
                            if (deity.dominion) {
                              rows.push({ label: 'Dominion', value: deity.dominion });
                            }
                            if (deity.binding_condition) {
                              rows.push({ label: 'Binding', value: deity.binding_condition, accent: 'text-rose-200/90' });
                            }
                            if (portfolios.length > 0) {
                              rows.push({
                                label: 'Portfolios',
                                value: portfolios.join(' · '),
                                accent: 'text-amber-200/90 font-medium'
                              });
                            }
                            if (domains.length > 0) {
                              rows.push({
                                label: 'Domains',
                                value: domains.join(' · '),
                                accent: 'text-amber-200/90 font-medium'
                              });
                            }
                            if (deity.symbol) {
                              rows.push({ label: 'Symbol', value: deity.symbol });
                            }
                            if (deity.favored_weapon) {
                              rows.push({ label: 'Weapon', value: deity.favored_weapon });
                            }
                            if (oaths.length > 0) {
                              rows.push({
                                label: 'Paths',
                                value: oaths.slice(0, 3).join(' · '),
                                accent: 'text-stone-400 text-[11px]'
                              });
                            }

                            return (
                              <article
                                key={deity.id}
                                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-5 transition-colors ${
                                  deity.worship_forbidden
                                    ? 'border-rose-900/50 hover:border-rose-700/80 bg-stone-950/90'
                                    : `${realmMeta?.borderClass || 'border-stone-800'} ${
                                        realmMeta?.hoverBorderClass || 'hover:border-amber-700/60'
                                      } ${realmMeta?.bgClass || 'bg-stone-900/90'}`
                                }`}
                              >
                                <div className="space-y-3">
                                  {/* Unboxed Metadata Kicker */}
                                  <div className="text-[11px] font-serif text-stone-400 flex flex-wrap items-center gap-1.5">
                                    <span
                                      className={
                                        deity.worship_forbidden
                                          ? 'text-rose-300'
                                          : realmMeta?.accentText || 'text-amber-300'
                                      }
                                    >
                                      {deity.alignment || 'Unaligned'}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span>
                                      {deity.divine_rank || deity.pantheon || getCampaignDisplayName(deity.campaign_id)}
                                    </span>
                                    {deity.worship_forbidden && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="text-rose-400 font-semibold">Forbidden</span>
                                      </>
                                    )}
                                    {deity.content_status === 'draft' && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <span className="text-amber-400/90">Draft Canon</span>
                                      </>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <div>
                                    <h3 className="font-fantasy text-xl font-bold text-stone-100 leading-snug">
                                      <button
                                        onClick={() => onSelectEntry(deity.id)}
                                        className="text-left hover:text-amber-300 transition-colors cursor-pointer"
                                      >
                                        {deity.title}
                                      </button>
                                    </h3>
                                    <p className="text-xs text-stone-300 mt-1.5 leading-relaxed font-sans">
                                      {deity.summary}
                                    </p>
                                  </div>

                                  {/* Clean Key-Value Details */}
                                  {rows.length > 0 && (
                                    <dl className="pt-3 border-t border-stone-800/80 space-y-2 text-xs">
                                      {rows.map(row => (
                                        <div key={row.label} className="flex items-baseline justify-between gap-3">
                                          <dt className="text-stone-500 font-serif shrink-0">{row.label}</dt>
                                          <dd className={`text-right ${row.accent || 'text-stone-300'}`}>
                                            {row.value}
                                          </dd>
                                        </div>
                                      ))}
                                    </dl>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                                  <button
                                    onClick={() => onSelectEntry(deity.id)}
                                    className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-serif text-stone-200 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Read Lore</span>
                                  </button>

                                  {deity.worship_forbidden ? (
                                    <span className="text-[11px] font-serif text-rose-400/90 flex items-center gap-1 whitespace-nowrap shrink-0">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                      <span>Worship Forbidden</span>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => onSelectEntry(builderUrl)}
                                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-serif font-semibold text-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                                      title={`Start building a hero devoted to ${deity.title}`}
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>Adopt Patron</span>
                                    </button>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
