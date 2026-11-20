import React from 'react';
import { ChevronRight, Compass, Layers, ScrollText, Sparkles, Wand2 } from 'lucide-react';
import { ArchiveEntry } from '../types/archive';

interface WarlockOverviewProps {
  classOptions: ArchiveEntry[];
  subclasses: ArchiveEntry[];
  classSpells: ArchiveEntry[];
  subclassIndex?: ArchiveEntry;
  effectiveTab: 'content' | 'spells' | 'subclasses' | 'options' | 'backlinks';
  onSelectTab: (
    tab: 'content' | 'spells' | 'subclasses' | 'options' | 'backlinks',
    poolSubcategory?: string
  ) => void;
  onNavigate: (entryId: string) => void;
}

const SECTION_JUMPS = [
  { id: 'the-warlock-table', label: 'Progression Table' },
  { id: 'eldritch-invocations-1st-level', label: 'Invocations · Lv 1' },
  { id: 'otherworldly-patron-2nd-level', label: 'Patron · Lv 2' },
  { id: 'pact-magic-2nd-level', label: 'Pact Magic · Lv 2' },
  { id: 'pact-focus-3rd-level', label: 'Pact Focus · Lv 3' },
  { id: 'elder-arcanum-11th-level', label: 'Elder Arcanum · Lv 11' },
  { id: 'seat-at-the-table-20th-level', label: 'Seat at the Table · Lv 20' }
];

export const WarlockOverview: React.FC<WarlockOverviewProps> = ({
  classOptions,
  subclasses,
  classSpells,
  subclassIndex,
  effectiveTab,
  onSelectTab,
  onNavigate
}) => {
  const invocationsCount = classOptions.filter(o => o.subcategory === 'eldritch-invocations').length;
  const pactFociCount = classOptions.filter(o => o.subcategory === 'pact-foci').length;
  const familiarsCount = classOptions.filter(o => o.subcategory === 'familiars').length;
  const elderArcanaCount = classOptions.filter(o => o.subcategory === 'elder-arcana').length;

  const scrollToHeading = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      aria-label="Warlock Pact Architecture"
      className="bg-stone-950/90 border border-stone-800 rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
    >
      {/* Top Archival Header Strip */}
      <div className="px-5 py-3.5 border-b border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h2 className="font-fantasy text-sm md:text-base font-bold uppercase tracking-wider text-amber-300">
            Warlock Pact Architecture
          </h2>
          <span className="text-xs text-stone-400 font-serif">
            Alternate Warlock · Levels <span className="font-mono tabular-nums text-stone-200">1–20</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {subclassIndex && (
            <button
              type="button"
              onClick={() => onNavigate(subclassIndex.id)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Patrons Catalogue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('companions')}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-xs font-medium text-stone-200 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Familiars &amp; Companions</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('builder?class=Warlock')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-xs font-semibold text-amber-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Open in Builder</span>
          </button>
        </div>
      </div>

      {/* Core Chassis Definition List */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-stone-800/80 border-b border-stone-800/80">
        <div className="px-5 py-3.5">
          <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
            Hit Die
          </dt>
          <dd className="mt-1 text-sm font-semibold text-stone-100 font-mono tabular-nums">
            1d8 <span className="font-sans font-normal text-xs text-stone-400">· 8 + CON at 1st Lv</span>
          </dd>
        </div>

        <div className="px-5 py-3.5">
          <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
            Pact Ability
          </dt>
          <dd className="mt-1 text-sm font-semibold text-amber-200">
            INT, WIS, or CHA <span className="font-normal text-xs text-stone-400">choice</span>
          </dd>
        </div>

        <div className="px-5 py-3.5">
          <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
            Saving Throws
          </dt>
          <dd className="mt-1 text-sm font-semibold text-stone-100">
            Wisdom, Intelligence
          </dd>
        </div>

        <div className="px-5 py-3.5">
          <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
            Base Proficiencies
          </dt>
          <dd className="mt-1 text-xs text-stone-200 leading-snug">
            Light armor · Simple weapons · <span className="font-mono tabular-nums text-stone-300">2</span> skills
          </dd>
        </div>
      </dl>

      {/* 5-Axis Pact Progression Matrix */}
      <div className="px-5 py-4 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-stone-400">
          <span className="flex items-center gap-1.5">
            <ScrollText className="w-3.5 h-3.5 text-amber-400" />
            <span>Pact Customization Axes (Click to Inspect Pool)</span>
          </span>
          <span className="font-mono tabular-nums text-stone-500">
            {classOptions.length} options · {subclasses.length} patrons · {classSpells.length} spells
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 border border-stone-800/80 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-stone-800/80 bg-stone-900/30">
          {/* Axis 01: Eldritch Invocations */}
          <button
            type="button"
            onClick={() => onSelectTab('options', 'eldritch-invocations')}
            className="p-3.5 text-left hover:bg-stone-900/80 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>01</span>
                <span>Lv 1–18</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                Eldritch Invocations
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                Trinket-bound powers · <span className="font-mono tabular-nums text-stone-300">2–8</span> known
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono tabular-nums text-amber-300">
              <span>{invocationsCount} invocations</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Axis 02: Otherworldly Patron */}
          <button
            type="button"
            onClick={() => onSelectTab('subclasses')}
            className="p-3.5 text-left hover:bg-stone-900/80 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>02</span>
                <span>Lv 2 &amp; 20</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                Otherworldly Patron
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                Patron Magic + features · 2nd Patron at <span className="font-mono tabular-nums text-stone-300">Lv 20</span>
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono tabular-nums text-amber-300">
              <span>{subclasses.length} patrons</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Axis 03: Pact Magic & Blast */}
          <button
            type="button"
            onClick={() => onSelectTab('spells')}
            className="p-3.5 text-left hover:bg-stone-900/80 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>03</span>
                <span>Lv 2–20</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>Pact Magic</span>
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                Short-rest slots up to <span className="font-mono tabular-nums text-stone-300">5th</span> tier + Empowered Blast
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono tabular-nums text-violet-300">
              <span>{classSpells.length} spells</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-violet-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Axis 04: Pact Focus & Familiars */}
          <div className="p-3.5 text-left flex flex-col justify-between gap-2">
            <button
              type="button"
              onClick={() => onSelectTab('options', 'pact-foci')}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>04</span>
                <span>Lv 3</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                Pact Focus &amp; Familiars
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                Blade, Chalice, Familiar, Flesh, Hourglass, Instrument, Shroud, Tome
              </p>
            </button>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between gap-2 text-xs font-mono tabular-nums">
              <button
                type="button"
                onClick={() => onSelectTab('options', 'pact-foci')}
                className="text-amber-300 hover:text-amber-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                {pactFociCount} foci
              </button>
              <span className="text-stone-600" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => onSelectTab('options', 'familiars')}
                className="text-violet-300 hover:text-violet-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                {familiarsCount} familiars
              </button>
            </div>
          </div>

          {/* Axis 05: Elder Arcana */}
          <button
            type="button"
            onClick={() => onSelectTab('options', 'elder-arcana')}
            className="p-3.5 text-left hover:bg-stone-900/80 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>05</span>
                <span>Lv 11–17</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                Elder Arcana
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                Permanent high-tier secrets · <span className="font-mono tabular-nums text-stone-300">1–4</span> learned
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono tabular-nums text-amber-300">
              <span>{elderArcanaCount} arcana</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick Section Jump Bar (active on Class Features & Rules tab) */}
      {effectiveTab === 'content' && (
        <div className="px-5 py-2.5 border-t border-stone-800/80 bg-stone-950/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 whitespace-nowrap shrink-0">
            Jump to:
          </span>
          <div className="flex items-center gap-1.5">
            {SECTION_JUMPS.map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToHeading(sec.id)}
                className="px-2.5 py-1 rounded-md border border-stone-800 bg-stone-900/70 hover:border-amber-500/50 hover:text-amber-200 text-xs text-stone-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
