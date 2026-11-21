import React from 'react';
import { BookOpen, ChevronRight, Compass, Layers, ScrollText, Sparkles } from 'lucide-react';
import { ArchiveEntry } from '../types/archive';

interface ClericOverviewProps {
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
  { id: 'the-cleric-table', label: 'Progression Table' },
  { id: 'sacred-calling-1st-level', label: 'Sacred Calling · Lv 1' },
  { id: 'spellcasting-1st-level', label: 'Spellcasting · Lv 1' },
  { id: 'divine-domain-2nd-level', label: 'Divine Domain · Lv 2' },
  { id: 'channel-divinity-3rd-level', label: 'Channel Divinity · Lv 3' },
  { id: 'greater-calling-7th-level', label: 'Greater Calling · Lv 7' },
  { id: 'divine-intervention-10th-level', label: 'Intervention · Lv 10' },
  { id: 'sanctified-calling-14th-level', label: 'Sanctified · Lv 14' },
  { id: 'miraculous-intervention-20th-level', label: 'Miraculous · Lv 20' }
];

export const ClericOverview: React.FC<ClericOverviewProps> = ({
  classOptions,
  subclasses,
  classSpells,
  subclassIndex,
  effectiveTab,
  onSelectTab,
  onNavigate
}) => {
  const sacredCallingsCount = classOptions.filter(o => o.subcategory === 'sacred-callings').length;

  const scrollToHeading = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      aria-label="Cleric Sacred Architecture"
      className="bg-stone-950/90 border border-stone-800 rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
    >
      {/* Top Archival Header Strip */}
      <div className="px-5 py-3.5 border-b border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h2 className="font-fantasy text-sm md:text-base font-bold uppercase tracking-wider text-amber-300">
            Cleric Sacred Architecture
          </h2>
          <span className="text-xs text-stone-400 font-serif">
            Alternate Cleric · Levels <span className="font-mono tabular-nums text-stone-200">1–20</span>
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
              <span>Domains Catalogue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('character-options/class-options/sacred-callings/index')}
            className="px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-xs font-medium text-stone-200 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Sacred Callings</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('builder?class=Cleric')}
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
            Spellcasting
          </dt>
          <dd className="mt-1 text-sm font-semibold text-amber-200">
            Wisdom <span className="font-normal text-xs text-stone-400">· Prepared full caster</span>
          </dd>
        </div>

        <div className="px-5 py-3.5">
          <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
            Saving Throws
          </dt>
          <dd className="mt-1 text-sm font-semibold text-stone-100">
            Wisdom, Charisma
          </dd>
        </div>

        <div className="px-5 py-3.5">
          <dt className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
            Base Proficiencies
          </dt>
          <dd className="mt-1 text-xs text-stone-200 leading-snug">
            Light &amp; medium armor, shields · Simple weapons · <span className="font-mono tabular-nums text-stone-300">1</span> instrument · <span className="font-mono tabular-nums text-stone-300">2</span> skills
          </dd>
        </div>
      </dl>

      {/* 4-Axis Sacred Progression Matrix */}
      <div className="px-5 py-4 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-stone-400">
          <span className="flex items-center gap-1.5">
            <ScrollText className="w-3.5 h-3.5 text-amber-400" />
            <span>Sacred Calling &amp; Domain Axes (Click to Inspect)</span>
          </span>
          <span className="font-mono tabular-nums text-stone-500">
            {sacredCallingsCount} callings · {subclasses.length} domains · {classSpells.length} spells
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 border border-stone-800/80 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-stone-800/80 bg-stone-900/30">
          {/* Axis 01: Sacred Calling */}
          <button
            type="button"
            onClick={() => onSelectTab('options', 'sacred-callings')}
            className="p-3.5 text-left hover:bg-stone-900/80 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>01</span>
                <span>Lv 1, 7 &amp; 14</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                Sacred Calling
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                Crusader, Monastic, or Scholastic vocation scaling with level
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono tabular-nums text-amber-300">
              <span>{sacredCallingsCount} callings</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Axis 02: Divine Domain */}
          <button
            type="button"
            onClick={() => onSelectTab('subclasses')}
            className="p-3.5 text-left hover:bg-stone-900/80 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>02</span>
                <span>Lv 2, 3, 6 &amp; 18</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                Divine Domain
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                Always-prepared Domain Spells + two Domain Channel Divinities
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono tabular-nums text-amber-300">
              <span>{subclasses.length} domains</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Axis 03: Divine Spellcasting */}
          <button
            type="button"
            onClick={() => onSelectTab('spells')}
            className="p-3.5 text-left hover:bg-stone-900/80 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>03</span>
                <span>Lv 1–20</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>Divine Spellcasting</span>
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                Full <span className="font-mono tabular-nums text-stone-300">1st–9th</span> slots · Prepare WIS + Level · <span className="font-mono tabular-nums text-stone-300">2–4</span> cantrips
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono tabular-nums text-violet-300">
              <span>{classSpells.length} spells</span>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-violet-300 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Axis 04: Channel Divinity & Intervention */}
          <button
            type="button"
            onClick={() => {
              if (effectiveTab !== 'content') onSelectTab('content');
              setTimeout(() => scrollToHeading('channel-divinity-3rd-level'), 80);
            }}
            className="p-3.5 text-left hover:bg-stone-900/80 transition-colors cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-[11px] font-mono tabular-nums text-amber-400">
                <span>04</span>
                <span>Lv 3, 10 &amp; 20</span>
              </div>
              <div className="mt-1 font-fantasy text-sm font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                Channel &amp; Miracles
              </div>
              <p className="mt-1 text-xs text-stone-400 leading-snug">
                <span className="font-mono tabular-nums text-stone-300">2–4</span> uses + Divine Restoration · Intervention Lv <span className="font-mono tabular-nums text-stone-300">10</span> &amp; <span className="font-mono tabular-nums text-stone-300">20</span>
              </p>
            </div>
            <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono tabular-nums text-amber-300">
              <span>Read rules</span>
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
