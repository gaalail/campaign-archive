import React, { useState, useMemo, useEffect } from 'react';
import {
  getAllDeities,
  getDeityDomains,
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
  Crosshair,
  Shield,
  Sparkles,
  Flame,
  Anchor
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
    subtitle: 'The Tide-Sworn & Sunken Court · Civic Temples & Deep Covenants',
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
      return <Anchor className="w-4 h-4 text-cyan-400 shrink-0" />;
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
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedAlignment, setSelectedAlignment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setSelectedCampaign(initialCampaign || 'all');
  }, [initialCampaign]);

  const allDeities = useMemo(() => getAllDeities(), []);
  const allDomains = useMemo(() => getDeityDomains(), []);

  const allAlignments = useMemo(() => {
    const set = new Set<string>();
    for (const d of allDeities) {
      if (d.alignment) set.add(d.alignment);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allDeities]);

  const filteredDeities = useMemo(() => {
    return allDeities.filter(deity => {
      if (selectedCampaign !== 'all' && deity.campaign_id !== selectedCampaign) {
        return false;
      }

      if (selectedDomain !== 'all') {
        const domains = (deity.domains || []).map(d => d.toLowerCase());
        if (!domains.includes(selectedDomain.toLowerCase())) return false;
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
          deity.summary || '',
          deity.symbol || '',
          deity.worshippers || '',
          ...(deity.domains || []),
          ...(deity.recommended_oaths || [])
        ];
        if (!haystacks.some(h => h.toLowerCase().includes(q))) {
          return false;
        }
      }

      return true;
    });
  }, [allDeities, selectedCampaign, selectedDomain, selectedAlignment, searchQuery]);

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
    setSelectedDomain('all');
    setSelectedAlignment('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    (!hideCampaignSelector && selectedCampaign !== 'all') ||
    selectedDomain !== 'all' ||
    selectedAlignment !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header & Filter Controls */}
      {!hideCampaignSelector && (
        <section className="rounded-2xl border border-amber-900/50 bg-stone-900/90 p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-800 pb-5">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-serif uppercase tracking-widest text-amber-500 font-semibold">
                Cosmology & Setting Faiths · {filteredDeities.length} Deities Indexed
              </div>
              <h1 className="font-fantasy text-3xl md:text-4xl font-bold tracking-tight text-amber-100">
                Pantheons & Worship
              </h1>
              <p className="text-sm text-stone-300 leading-relaxed font-sans">
                Each campaign world shapes what answers when mortals pray. Browse deities by realm, divine domain, or alignment—or adopt a patron directly inside the Character Builder.
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
            {/* Campaign Segmented Bar */}
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
                    onClick={() => setSelectedCampaign(tab.id)}
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

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-serif text-amber-400 hover:text-amber-200 underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Search, Domain & Alignment */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search deity, holy symbol, domain, or oath..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedDomain}
                  onChange={e => setSelectedDomain(e.target.value)}
                  aria-label="Filter by divine domain"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Domains ({allDomains.length})</option>
                  {allDomains.map(dom => (
                    <option key={dom} value={dom}>
                      {dom} Domain
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
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
      )}

      {/* Empty State */}
      {filteredDeities.length === 0 ? (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-10 text-center space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-200">No Matching Deities</h2>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            No deities matched your current realm, domain, or search criteria.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
          >
            Show All Deities
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedByCampaign.map(([campaignId, deities]) => {
            const realmMeta = CAMPAIGN_REALMS.find(r => r.id === campaignId);
            const overviewEntry = getPantheonOverviewForCampaign(campaignId);

            return (
              <section key={campaignId} className="space-y-4">
                {/* Realm Header Strip */}
                {!hideCampaignSelector && (
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-stone-400">
                        {getRealmIcon(campaignId)}
                        <span>{realmMeta?.name || getCampaignDisplayName(campaignId)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{deities.length} {deities.length === 1 ? 'Power' : 'Powers'}</span>
                      </div>
                      <p className="text-xs text-stone-400">
                        {realmMeta?.subtitle || overviewEntry?.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {overviewEntry && (
                        <button
                          onClick={() => onSelectEntry(overviewEntry.id)}
                          className="text-xs font-serif font-semibold text-amber-400 hover:text-amber-200 flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Cosmology</span>
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

                {/* Deity Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deities.map(deity => {
                    const domains = deity.domains || [];
                    const oaths = deity.recommended_oaths || [];
                    const builderUrl = `builder?campaign=${encodeURIComponent(
                      deity.campaign_id || ''
                    )}&deity=${encodeURIComponent(deity.id)}`;

                    return (
                      <article
                        key={deity.id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between space-y-5 transition-colors ${
                          realmMeta?.borderClass || 'border-stone-800'
                        } ${realmMeta?.hoverBorderClass || 'hover:border-amber-700/60'} ${
                          realmMeta?.bgClass || 'bg-stone-900/90'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Clean Unboxed Metadata Kicker */}
                          <div className="text-[11px] font-serif text-stone-400 flex flex-wrap items-center gap-1.5">
                            <span className={realmMeta?.accentText || 'text-amber-300'}>
                              {deity.alignment || 'Unaligned'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{deity.pantheon || getCampaignDisplayName(deity.campaign_id)}</span>
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
                          <dl className="pt-3 border-t border-stone-800/80 space-y-2 text-xs">
                            {domains.length > 0 && (
                              <div className="flex items-baseline justify-between gap-2">
                                <dt className="text-stone-500 font-serif shrink-0">Domains</dt>
                                <dd className="text-amber-200/90 text-right font-medium">
                                  {domains.join(' · ')}
                                </dd>
                              </div>
                            )}
                            {deity.symbol && (
                              <div className="flex items-baseline justify-between gap-3">
                                <dt className="text-stone-500 font-serif shrink-0">Symbol</dt>
                                <dd className="text-stone-300 text-right line-clamp-2">
                                  {deity.symbol}
                                </dd>
                              </div>
                            )}
                            {deity.favored_weapon && (
                              <div className="flex items-baseline justify-between gap-2">
                                <dt className="text-stone-500 font-serif shrink-0">Weapon</dt>
                                <dd className="text-stone-300 text-right">{deity.favored_weapon}</dd>
                              </div>
                            )}
                            {oaths.length > 0 && (
                              <div className="flex items-baseline justify-between gap-2">
                                <dt className="text-stone-500 font-serif shrink-0">Paths</dt>
                                <dd className="text-stone-400 text-right text-[11px] truncate">
                                  {oaths.slice(0, 3).join(' · ')}
                                </dd>
                              </div>
                            )}
                          </dl>
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

                          <button
                            onClick={() => onSelectEntry(builderUrl)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-serif font-semibold text-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                            title={`Start building a hero devoted to ${deity.title}`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Adopt Patron</span>
                          </button>
                        </div>
                      </article>
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
