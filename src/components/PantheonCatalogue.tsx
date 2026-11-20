import React, { useState, useMemo, useEffect } from 'react';
import {
  getAllDeities,
  getPantheonOverviewForCampaign,
  getCampaignDisplayName,
  getEntryById
} from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import {
  Search,
  Sun,
  Compass,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flame,
  AlertTriangle,
  LayoutList,
  Table2,
  X
} from 'lucide-react';
import { GothicRaven, CrossedSwords } from './GothicIcons';

interface PantheonCatalogueProps {
  onSelectEntry: (id: string) => void;
  initialCampaign?: string;
  hideCampaignSelector?: boolean;
}

type ViewMode = 'directory' | 'ledger';

const CAMPAIGN_REALMS = [
  {
    id: 'ra-golvek',
    name: "Ra Gol'vek",
    subtitle: 'Deitric Realms, Archangels, Avehrneol, Heralds & Forbidden Cataclysms',
    accentText: 'text-cyan-300'
  },
  {
    id: 'curse-of-strahd',
    name: 'Curse of Strahd',
    subtitle: 'Faiths of Barovia · Eternal Twilight & Intercepted Prayers',
    accentText: 'text-rose-300'
  },
  {
    id: 'vyrun',
    name: 'Vyrun',
    subtitle: 'The Reawakened Old Gods · Frontier Hearths & Ley Resonance',
    accentText: 'text-emerald-300'
  }
];

const LEDGER_PAGE_SIZE = 30;

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

function getDeitySignatureText(deity: ArchiveEntry): string {
  if (deity.primary_title) return deity.primary_title;
  if (deity.sin && deity.dominion) return `${deity.sin} · ${deity.dominion}`;
  if (deity.sin) return `Sin of ${deity.sin}`;
  if (deity.virtue) return `Virtue of ${deity.virtue}`;
  if (deity.harbinger) return `Harbinger of ${deity.harbinger}`;
  if (deity.element) return `Primaeval of ${deity.element}`;
  return deity.summary || '';
}

function getDeityAttributeLine(deity: ArchiveEntry): string {
  const portfolios = deity.portfolios || [];
  const domains = deity.domains || [];
  if (portfolios.length > 0) {
    const shown = portfolios.slice(0, 3).join(', ');
    return portfolios.length > 3 ? `${shown} +${portfolios.length - 3}` : shown;
  }
  if (domains.length > 0) {
    const shown = domains.slice(0, 3).join(', ');
    return domains.length > 3 ? `${shown} +${domains.length - 3}` : shown;
  }
  return deity.divine_rank || deity.alignment || '';
}

interface DeityInspectorProps {
  deity: ArchiveEntry;
  onSelectEntry: (id: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const DeityInspector: React.FC<DeityInspectorProps> = ({
  deity,
  onSelectEntry,
  onClose,
  isModal = false
}) => {
  const domains = deity.domains || [];
  const portfolios = deity.portfolios || [];
  const oaths = deity.recommended_oaths || [];
  const realmMeta = CAMPAIGN_REALMS.find(r => r.id === deity.campaign_id);
  const builderUrl = `builder?campaign=${encodeURIComponent(
    deity.campaign_id || ''
  )}&deity=${encodeURIComponent(deity.id)}`;

  const detailRows: { label: string; value: string; accent?: string }[] = [];
  if (deity.sin) {
    detailRows.push({ label: 'Sin', value: deity.sin, accent: 'text-rose-300 font-medium' });
  }
  if (deity.virtue) {
    detailRows.push({ label: 'Virtue', value: deity.virtue, accent: 'text-cyan-200 font-medium' });
  }
  if (deity.harbinger) {
    detailRows.push({ label: 'Harbinger', value: deity.harbinger, accent: 'text-rose-300 font-medium' });
  }
  if (deity.element) {
    detailRows.push({ label: 'Element', value: deity.element, accent: 'text-emerald-300 font-medium' });
  }
  if (deity.dominion) {
    detailRows.push({ label: 'Dominion', value: deity.dominion });
  }
  if (deity.binding_condition) {
    detailRows.push({ label: 'Binding Condition', value: deity.binding_condition, accent: 'text-rose-200' });
  }
  if (portfolios.length > 0) {
    detailRows.push({
      label: 'Portfolios',
      value: portfolios.join(' · '),
      accent: 'text-amber-200 font-medium'
    });
  }
  if (domains.length > 0) {
    detailRows.push({
      label: 'Divine Domains',
      value: domains.join(' · '),
      accent: 'text-amber-200 font-medium'
    });
  }
  if (deity.symbol) {
    detailRows.push({ label: 'Holy Symbol', value: deity.symbol });
  }
  if (deity.favored_weapon) {
    detailRows.push({ label: 'Favored Weapon', value: deity.favored_weapon });
  }
  if (deity.worshippers) {
    detailRows.push({ label: 'Worshippers', value: deity.worshippers });
  }

  return (
    <div
      className={`rounded-xl border p-6 space-y-5 ${
        deity.worship_forbidden
          ? 'border-rose-900/60 bg-stone-950/95'
          : 'border-stone-800 bg-stone-950/95'
      } ${isModal ? 'shadow-2xl max-h-[85vh] overflow-y-auto' : ''}`}
    >
      {/* Top Meta & Optional Close */}
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-serif text-stone-400 flex flex-wrap items-center gap-1.5 leading-relaxed">
          <span className={deity.worship_forbidden ? 'text-rose-300 font-medium' : realmMeta?.accentText || 'text-amber-300'}>
            {deity.pantheon || getCampaignDisplayName(deity.campaign_id)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{deity.alignment || 'Unaligned'}</span>
          {deity.divine_rank && (
            <>
              <span aria-hidden="true">·</span>
              <span>{deity.divine_rank}</span>
            </>
          )}
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

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close deity details"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Title & Primary Title */}
      <div className="space-y-1.5">
        <h2 className="font-fantasy text-2xl sm:text-3xl font-bold text-amber-100 leading-tight">
          {deity.title}
        </h2>
        {deity.primary_title && (
          <p className="font-serif text-sm text-amber-300/90 leading-snug">
            {deity.primary_title}
          </p>
        )}
        {deity.summary && (
          <p className="text-sm text-stone-300 leading-relaxed pt-2 font-sans">
            {deity.summary}
          </p>
        )}
      </div>

      {/* Forbidden Notice */}
      {deity.worship_forbidden && (
        <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-rose-200 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            <strong className="font-semibold text-rose-100">Worship Forbidden:</strong>{' '}
            Cataclysms belong to no Pantheon and are outlawed across most mortal lands.
          </span>
        </div>
      )}

      {/* Structured Key-Value Profile */}
      {detailRows.length > 0 && (
        <dl className="border-t border-stone-800/80 divide-y divide-stone-800/70 text-xs">
          {detailRows.map(row => (
            <div key={row.label} className="py-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
              <dt className="text-stone-500 font-serif shrink-0">{row.label}</dt>
              <dd className={`sm:text-right leading-relaxed ${row.accent || 'text-stone-200'}`}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Recommended Subclasses / Paths */}
      {oaths.length > 0 && (
        <div className="pt-3 border-t border-stone-800/80 space-y-2">
          <div className="text-[11px] font-serif text-stone-400">
            Aligned Oaths, Domains & Patrons
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            {oaths.map((oath, idx) => {
              const target = getEntryById(oath);
              return (
                <React.Fragment key={oath}>
                  {idx > 0 && (
                    <span className="text-stone-700 select-none" aria-hidden="true">
                      ·
                    </span>
                  )}
                  {target ? (
                    <button
                      onClick={() => onSelectEntry(target.id)}
                      className="text-amber-300 hover:text-amber-100 underline underline-offset-4 decoration-stone-700 hover:decoration-amber-400 font-serif transition-colors cursor-pointer"
                    >
                      {oath}
                    </button>
                  ) : (
                    <span className="text-stone-300 font-serif">{oath}</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Actions */}
      <div className="pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => onSelectEntry(deity.id)}
          className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-serif font-semibold text-stone-100 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Read Full Lore</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </button>

        {!deity.worship_forbidden && (
          <button
            onClick={() => onSelectEntry(builderUrl)}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-serif font-bold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Adopt Patron Deity</span>
          </button>
        )}
      </div>
    </div>
  );
};

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
  const [viewMode, setViewMode] = useState<ViewMode>('directory');
  const [selectedDeityId, setSelectedDeityId] = useState<string | null>(null);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState<boolean>(false);
  const [ledgerPage, setLedgerPage] = useState<number>(1);

  const switchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    setMobileInspectorOpen(false);
  };

  useEffect(() => {
    setSelectedCampaign(initialCampaign || 'all');
    setSelectedPantheon('all');
    setLedgerPage(1);
  }, [initialCampaign]);

  const allDeities = useMemo(() => getAllDeities(), []);

  const campaignScopedDeities = useMemo(() => {
    if (selectedCampaign === 'all') return allDeities;
    return allDeities.filter(d => d.campaign_id === selectedCampaign);
  }, [allDeities, selectedCampaign]);

  const availablePantheons = useMemo(() => {
    const counts = new Map<string, { count: number; campaignId: string; hasForbidden: boolean }>();
    for (const d of campaignScopedDeities) {
      const p = d.pantheon || getCampaignDisplayName(d.campaign_id);
      const prev = counts.get(p);
      counts.set(p, {
        count: (prev?.count || 0) + 1,
        campaignId: d.campaign_id || prev?.campaignId || 'other',
        hasForbidden: Boolean(prev?.hasForbidden || d.worship_forbidden)
      });
    }
    return Array.from(counts.entries())
      .map(([name, meta]) => ({ name, ...meta }))
      .sort((a, b) => {
        if (a.name === 'Cataclysms') return 1;
        if (b.name === 'Cataclysms') return -1;
        if (selectedCampaign === 'all' && a.campaignId !== b.campaignId) {
          return a.campaignId.localeCompare(b.campaignId);
        }
        return a.name.localeCompare(b.name);
      });
  }, [campaignScopedDeities, selectedCampaign]);

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

  // Reset pagination when filter changes
  useEffect(() => {
    setLedgerPage(1);
  }, [selectedCampaign, selectedPantheon, selectedDomain, selectedAlignment, hideForbidden, searchQuery]);

  // Keep an active deity selected in Directory mode
  const activeDeity = useMemo(() => {
    if (filteredDeities.length === 0) return null;
    if (selectedDeityId) {
      const found = filteredDeities.find(d => d.id === selectedDeityId);
      if (found) return found;
    }
    return filteredDeities[0];
  }, [filteredDeities, selectedDeityId]);

  const groupedDeities = useMemo(() => {
    const groups = new Map<string, { pantheonName: string; campaignId: string; items: ArchiveEntry[] }>();
    for (const d of filteredDeities) {
      const pName = d.pantheon || getCampaignDisplayName(d.campaign_id);
      const key = `${d.campaign_id || 'other'}::${pName}`;
      if (!groups.has(key)) {
        groups.set(key, {
          pantheonName: pName,
          campaignId: d.campaign_id || 'other',
          items: []
        });
      }
      groups.get(key)!.items.push(d);
    }
    return Array.from(groups.values()).sort((a, b) => {
      if (a.pantheonName === 'Cataclysms') return 1;
      if (b.pantheonName === 'Cataclysms') return -1;
      if (a.campaignId !== b.campaignId) return a.campaignId.localeCompare(b.campaignId);
      return a.pantheonName.localeCompare(b.pantheonName);
    });
  }, [filteredDeities]);

  const totalLedgerPages = Math.max(1, Math.ceil(filteredDeities.length / LEDGER_PAGE_SIZE));
  const paginatedLedgerDeities = useMemo(() => {
    const start = (ledgerPage - 1) * LEDGER_PAGE_SIZE;
    return filteredDeities.slice(start, start + LEDGER_PAGE_SIZE);
  }, [filteredDeities, ledgerPage]);

  const resetFilters = () => {
    if (!hideCampaignSelector) setSelectedCampaign('all');
    setSelectedPantheon('all');
    setSelectedDomain('all');
    setSelectedAlignment('all');
    setHideForbidden(false);
    setSearchQuery('');
    setLedgerPage(1);
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

  const activeOverviewEntry = useMemo(
    () => (selectedCampaign !== 'all' ? getPantheonOverviewForCampaign(selectedCampaign) : undefined),
    [selectedCampaign]
  );

  const handleSelectDeityRow = (deity: ArchiveEntry, openModal = false) => {
    setSelectedDeityId(deity.id);
    if (openModal) {
      setMobileInspectorOpen(true);
    } else if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileInspectorOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header & Operational Filter Strip */}
      {!hideCampaignSelector ? (
        <section className="rounded-xl border border-stone-800 bg-stone-900/85 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-800 pb-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-serif tracking-wider text-amber-400/90 tabular-nums">
                Cosmology & Setting Faiths · {filteredDeities.length} of {allDeities.length} Powers
              </div>
              <h1 className="font-fantasy text-3xl sm:text-4xl font-bold tracking-tight text-amber-100">
                Pantheons & Worship
              </h1>
              <p className="text-sm text-stone-300 leading-relaxed font-sans">
                Browse deities, Archangels, Archdevils, Spirits, and Sovereigns by pantheon, domain, or portfolio—or adopt a patron inside the Character Builder.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onSelectEntry('campaigns')}
                className="px-3.5 py-2 rounded-lg border border-stone-700 bg-stone-950 hover:bg-stone-800 text-xs font-serif text-stone-200 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
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

          {/* Controls Row 1: Realm Switcher & View Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-stone-950 border border-stone-800">
              {[
                { id: 'all', label: 'All Realms' },
                { id: 'ra-golvek', label: "Ra Gol'vek" },
                { id: 'curse-of-strahd', label: 'Curse of Strahd' },
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
                  className={`px-3 py-1.5 rounded-md text-xs font-serif transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCampaign === tab.id
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {activeOverviewEntry && (
                <button
                  onClick={() => onSelectEntry(activeOverviewEntry.id)}
                  className="text-xs font-serif text-amber-300 hover:text-amber-200 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Read Realm Registry →
                </button>
              )}

              {selectedCampaign === 'ra-golvek' && (
                <button
                  onClick={() =>
                    onSelectEntry('campaigns/ra-golvek/rules/Divine Portfolios and Mythic Rank')
                  }
                  className="text-xs font-serif text-cyan-300 hover:text-cyan-200 underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Portfolios & Mythic Rules →
                </button>
              )}

              {/* View Mode Switch */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-950 border border-stone-800" role="group" aria-label="View layout">
                <button
                  onClick={() => switchViewMode('directory')}
                  className={`px-2.5 py-1 rounded-md text-xs font-serif flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'directory'
                      ? 'bg-stone-800 text-amber-200 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Directory</span>
                </button>
                <button
                  onClick={() => switchViewMode('ledger')}
                  className={`px-2.5 py-1 rounded-md text-xs font-serif flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'ledger'
                      ? 'bg-stone-800 text-amber-200 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Controls Row 2: Search & Facets */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, title, sin, virtue, symbol..."
                className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                aria-label="Filter by divine domain or portfolio"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
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
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Alignments</option>
                {allAlignments.map(align => (
                  <option key={align} value={align}>
                    {align}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3">
              {hasForbiddenInScope && (
                <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer select-none whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={hideForbidden}
                    onChange={e => setHideForbidden(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Hide Forbidden</span>
                </label>
              )}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-serif text-amber-400 hover:text-amber-200 underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>
      ) : (
        /* Embedded Filter Bar inside Campaign Pantheon Index pages */
        <section className="rounded-xl border border-stone-800 bg-stone-950/75 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-serif tracking-wider text-amber-400 font-semibold tabular-nums">
              {getCampaignDisplayName(selectedCampaign)} Registry · {filteredDeities.length} Powers
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectedCampaign === 'ra-golvek' && (
                <button
                  onClick={() => onSelectEntry('campaigns/ra-golvek/rules/Divine Portfolios and Mythic Rank')}
                  className="text-xs font-serif font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Divine Portfolios & Mythic Rank →
                </button>
              )}

              <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-900 border border-stone-800" role="group" aria-label="View layout">
                <button
                  onClick={() => switchViewMode('directory')}
                  className={`px-2.5 py-1 rounded-md text-xs font-serif flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'directory'
                      ? 'bg-stone-800 text-amber-200 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Directory</span>
                </button>
                <button
                  onClick={() => switchViewMode('ledger')}
                  className={`px-2.5 py-1 rounded-md text-xs font-serif flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    viewMode === 'ledger'
                      ? 'bg-stone-800 text-amber-200 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
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

            <div className="sm:col-span-3">
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                aria-label="Filter by divine domain or portfolio"
                className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Domains & Portfolios</option>
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

            <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3">
              {hasForbiddenInScope && (
                <label className="flex items-center gap-1.5 text-xs text-stone-300 cursor-pointer select-none whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={hideForbidden}
                    onChange={e => setHideForbidden(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Hide Forbidden</span>
                </label>
              )}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-serif text-amber-400 hover:text-amber-200 underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Pantheon Select (Shown below lg so directory doesn't push list far down) */}
      <div className="lg:hidden">
        <select
          value={selectedPantheon}
          onChange={e => setSelectedPantheon(e.target.value)}
          aria-label="Select pantheon or divine structure"
          className="w-full bg-stone-900 border border-stone-800 rounded-lg px-3 py-2.5 text-xs font-serif text-stone-100 focus:border-amber-500 focus:outline-none"
        >
          <option value="all">
            All Pantheons & Structures ({campaignScopedDeities.length})
          </option>
          {availablePantheons.map(p => (
            <option key={p.name} value={p.name}>
              {p.name} ({p.count}) {selectedCampaign === 'all' ? `· ${getCampaignDisplayName(p.campaignId)}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredDeities.length === 0 ? (
        <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-10 text-center space-y-3">
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
      ) : viewMode === 'directory' ? (
        /* DIRECTORY VIEW: 3-Pane Master-Detail Codex */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Pane 1: Pantheon & Structure Index Rail (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 rounded-xl border border-stone-800 bg-stone-950/75 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between">
              <span className="text-xs font-serif font-semibold text-stone-300">
                Pantheons & Structures
              </span>
              <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                {availablePantheons.length}
              </span>
            </div>

            <nav className="max-h-[68vh] overflow-y-auto divide-y divide-stone-800/50" aria-label="Pantheons">
              <button
                onClick={() => setSelectedPantheon('all')}
                className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  selectedPantheon === 'all'
                    ? 'bg-stone-800/90 text-amber-200 font-semibold'
                    : 'text-stone-300 hover:bg-stone-900/70 hover:text-stone-100'
                }`}
              >
                <span className="font-serif truncate">All Structures</span>
                <span className="text-[11px] font-mono text-stone-400 tabular-nums shrink-0">
                  {campaignScopedDeities.length}
                </span>
              </button>

              {availablePantheons.map(p => {
                const isActive = selectedPantheon === p.name;
                const isCataclysm = p.name === 'Cataclysms';
                return (
                  <button
                    key={`${p.campaignId}-${p.name}`}
                    onClick={() => setSelectedPantheon(p.name)}
                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-stone-800/90 text-amber-200 font-semibold'
                        : 'text-stone-300 hover:bg-stone-900/70 hover:text-stone-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className={`font-serif truncate ${isCataclysm ? 'text-rose-300' : ''}`}>
                        {p.name}
                      </div>
                      {selectedCampaign === 'all' && (
                        <div className="text-[11px] text-stone-500 truncate">
                          {getCampaignDisplayName(p.campaignId)}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 tabular-nums shrink-0">
                      {p.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Pane 2: Compact Deity Roster */}
          <div className="lg:col-span-4 rounded-xl border border-stone-800 bg-stone-950/75 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-2">
              <div className="text-xs font-serif font-semibold text-stone-200 truncate">
                {selectedPantheon === 'all' ? 'Registered Powers' : selectedPantheon}
              </div>
              <span className="text-[11px] font-mono text-stone-400 tabular-nums shrink-0">
                {filteredDeities.length} {filteredDeities.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <div className="lg:max-h-[68vh] overflow-y-auto divide-y divide-stone-800/70">
              {groupedDeities.map(group => {
                const showGroupHeader = selectedPantheon === 'all' && groupedDeities.length > 1;
                return (
                  <div key={`${group.campaignId}-${group.pantheonName}`}>
                    {showGroupHeader && (
                      <div className="sticky top-0 z-10 px-4 py-2 bg-stone-900/95 backdrop-blur-sm border-b border-stone-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 text-[11px] font-serif">
                          {getRealmIcon(group.campaignId)}
                          <span className={`font-semibold truncate ${group.pantheonName === 'Cataclysms' ? 'text-rose-300' : 'text-amber-200'}`}>
                            {group.pantheonName}
                          </span>
                          <span className="text-stone-500 font-mono tabular-nums shrink-0">
                            {group.items.length}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedPantheon(group.pantheonName)}
                          className="text-[11px] font-serif text-stone-400 hover:text-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Focus →
                        </button>
                      </div>
                    )}

                    <div className="divide-y divide-stone-800/60">
                      {group.items.map(deity => {
                        const isSelected = activeDeity?.id === deity.id;
                        const signature = getDeitySignatureText(deity);
                        const attrLine = getDeityAttributeLine(deity);

                        return (
                          <button
                            key={deity.id}
                            onClick={() => handleSelectDeityRow(deity, false)}
                            className={`w-full px-4 py-3 text-left transition-colors cursor-pointer block ${
                              isSelected
                                ? 'bg-stone-800/85'
                                : 'hover:bg-stone-900/70'
                            }`}
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                className={`font-fantasy text-sm font-bold truncate ${
                                  isSelected
                                    ? 'text-amber-200'
                                    : deity.worship_forbidden
                                    ? 'text-rose-200'
                                    : 'text-stone-100'
                                }`}
                              >
                                {deity.title}
                              </span>
                              <span
                                className={`text-[11px] font-serif shrink-0 ${
                                  deity.worship_forbidden ? 'text-rose-400' : 'text-stone-500'
                                }`}
                              >
                                {deity.alignment || 'Unaligned'}
                              </span>
                            </div>

                            {(signature || attrLine) && (
                              <div className="mt-1 text-xs text-stone-400 truncate">
                                {signature || attrLine}
                              </div>
                            )}

                            {attrLine && signature && attrLine !== signature && (
                              <div className="mt-0.5 text-[11px] text-stone-500 truncate">
                                {attrLine}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pane 3: Sticky Deity Inspector (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-6">
            {activeDeity && (
              <DeityInspector deity={activeDeity} onSelectEntry={onSelectEntry} />
            )}
          </div>
        </div>
      ) : (
        /* LEDGER VIEW: Compact Scannable Table with Pagination */
        <div className="space-y-4">
          <div className="rounded-xl border border-stone-800 bg-stone-950/85 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-serif font-semibold text-stone-200">
                  {selectedPantheon === 'all' ? 'All Pantheons Ledger' : `${selectedPantheon} Ledger`}
                </span>
                {selectedPantheon !== 'all' && (
                  <button
                    onClick={() => setSelectedPantheon('all')}
                    className="text-xs font-serif text-amber-400 hover:text-amber-200 underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    Show All Structures
                  </button>
                )}
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <select
                  value={selectedPantheon}
                  onChange={e => setSelectedPantheon(e.target.value)}
                  aria-label="Filter ledger by pantheon"
                  className="bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Pantheons ({availablePantheons.length})</option>
                  {availablePantheons.map(p => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-800 bg-stone-900/70 text-stone-400 font-serif">
                    <th className="py-2.5 px-4 font-semibold">Power</th>
                    <th className="py-2.5 px-4 font-semibold">Pantheon</th>
                    <th className="py-2.5 px-4 font-semibold">Alignment</th>
                    <th className="py-2.5 px-4 font-semibold">Portfolios & Domains</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/70">
                  {paginatedLedgerDeities.map(deity => {
                    const attrLine = getDeityAttributeLine(deity);
                    const sig = getDeitySignatureText(deity);
                    return (
                      <tr
                        key={deity.id}
                        className="hover:bg-stone-900/60 transition-colors"
                      >
                        <td className="py-2.5 px-4 align-top">
                          <button
                            onClick={() => handleSelectDeityRow(deity, true)}
                            className={`font-fantasy font-bold text-sm text-left hover:text-amber-300 transition-colors cursor-pointer ${
                              deity.worship_forbidden ? 'text-rose-300' : 'text-stone-100'
                            }`}
                          >
                            {deity.title}
                          </button>
                          {sig && (
                            <div className="text-[11px] text-stone-400 mt-0.5 max-w-xs truncate">
                              {sig}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-4 align-top text-stone-300 whitespace-nowrap">
                          <span>{deity.pantheon || getCampaignDisplayName(deity.campaign_id)}</span>
                          {selectedCampaign === 'all' && (
                            <div className="text-[11px] text-stone-500">
                              {getCampaignDisplayName(deity.campaign_id)}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-4 align-top whitespace-nowrap">
                          <span className={deity.worship_forbidden ? 'text-rose-400 font-medium' : 'text-stone-300'}>
                            {deity.alignment || 'Unaligned'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 align-top text-stone-300 max-w-xs">
                          <span className="line-clamp-2">{attrLine || '—'}</span>
                        </td>
                        <td className="py-2.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-3">
                            <button
                              onClick={() => handleSelectDeityRow(deity, true)}
                              className="text-xs font-serif text-stone-300 hover:text-amber-200 underline underline-offset-4 cursor-pointer"
                            >
                              Quick View
                            </button>
                            <button
                              onClick={() => onSelectEntry(deity.id)}
                              className="text-xs font-serif font-semibold text-amber-400 hover:text-amber-200 cursor-pointer"
                            >
                              Lore →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalLedgerPages > 1 && (
              <div className="px-4 py-3 border-t border-stone-800 flex items-center justify-between gap-3 text-xs text-stone-400">
                <span className="tabular-nums">
                  Showing {(ledgerPage - 1) * LEDGER_PAGE_SIZE + 1}–
                  {Math.min(ledgerPage * LEDGER_PAGE_SIZE, filteredDeities.length)} of{' '}
                  {filteredDeities.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                    disabled={ledgerPage === 1}
                    className="px-2.5 py-1 rounded-md border border-stone-800 bg-stone-900 text-stone-200 disabled:opacity-40 hover:bg-stone-800 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <span className="font-mono tabular-nums px-1">
                    {ledgerPage} / {totalLedgerPages}
                  </span>
                  <button
                    onClick={() => setLedgerPage(p => Math.min(totalLedgerPages, p + 1))}
                    disabled={ledgerPage === totalLedgerPages}
                    className="px-2.5 py-1 rounded-md border border-stone-800 bg-stone-900 text-stone-200 disabled:opacity-40 hover:bg-stone-800 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspector Modal (Mobile in Directory mode, or any screen in Table/Ledger mode) */}
      {mobileInspectorOpen && activeDeity && (
        <div
          className={`fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 ${
            viewMode === 'directory' ? 'lg:hidden' : ''
          }`}
          onClick={() => setMobileInspectorOpen(false)}
        >
          <div className="w-full max-w-xl" onClick={e => e.stopPropagation()}>
            <DeityInspector
              deity={activeDeity}
              onSelectEntry={id => {
                setMobileInspectorOpen(false);
                onSelectEntry(id);
              }}
              onClose={() => setMobileInspectorOpen(false)}
              isModal
            />
          </div>
        </div>
      )}
    </div>
  );
};
