import React, { useState, useEffect, useMemo } from 'react';
import { ArchiveEntry } from '../types/archive';
import {
  getSourceBadgeInfo,
  getRarityColor,
  getSubclassesForClass,
  getClassOptionsForClass,
  getSpellsForClass,
  getSpellLevelLabel,
  getEntryById,
  cleanFlavorText,
  archiveDb
} from '../utils/archiveUtils';
import { MarkdownView, InlineContent } from './MarkdownView';
import { SpellCatalogue } from './SpellCatalogue';
import { MonsterStatblock } from './MonsterStatblock';
import { BestiaryCatalogue } from './BestiaryCatalogue';
import {
  ArrowLeft,
  BookOpen,
  Shield,
  Heart,
  Sparkles,
  Link2,
  ChevronRight,
  ExternalLink,
  Layers,
  MapPin,
  Compass,
  AlertTriangle,
  Info,
  Clock,
  Zap,
  Target,
  Search,
  ChevronDown,
  ChevronUp,
  Sword,
  Wand2,
  Package,
  Network
} from 'lucide-react';
import {
  GothicRaven,
  GothicBat,
  GothicChalice,
  CrossedSwords,
  SpellTome,
  DragonShield,
  RavenloftCrest,
  WaxSeal,
  DndFleuronDivider
} from './GothicIcons';

interface EntryDetailProps {
  entry: ArchiveEntry;
  onNavigate: (entryId: string) => void;
  onBack?: () => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({ entry, onNavigate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'spells' | 'subclasses' | 'options' | 'backlinks'>('content');
  const [expandedSubclasses, setExpandedSubclasses] = useState<Set<string>>(new Set());
  const [subclassSearch, setSubclassSearch] = useState('');

  // Whenever entry changes, reset activeTab to 'content'
  useEffect(() => {
    setActiveTab('content');
    setExpandedSubclasses(new Set());
    setSubclassSearch('');
  }, [entry.id]);

  const toggleSubclassExpand = (id: string) => {
    setExpandedSubclasses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sourceBadge = getSourceBadgeInfo(entry.source_type, entry.source);
  const rarityBadge = entry.rarity ? getRarityColor(entry.rarity) : null;

  // Breadcrumbs & Navigation state
  const breadcrumbParts = useMemo(() => entry.path.split('/').filter(Boolean), [entry.path]);
  const isHome = entry.id === 'index' || entry.id === 'home' || entry.category === 'home';
  const isClass = entry.category === 'classes' || entry.entity_type === 'class';
  const isSubclass = entry.category === 'subclasses' || entry.entity_type === 'subclass';
  const isSpell = entry.category === 'spells' || entry.entity_type === 'spell';

  // Spell attributes
  const spellLevel = entry.level ?? (entry.frontmatter?.level !== undefined ? Number(entry.frontmatter.level) : 0);
  const spellSchool = entry.school || entry.frontmatter?.school || 'Universal';
  const castingTime = entry.casting_time || entry.frontmatter?.casting_time || '';
  const range = entry.range || entry.frontmatter?.range || '';
  const components = entry.components || entry.frontmatter?.components || '';
  const duration = entry.duration || entry.frontmatter?.duration || '';
  const concentration = entry.concentration ?? entry.frontmatter?.concentration ?? false;
  const ritual = entry.ritual ?? entry.frontmatter?.ritual ?? false;
  const spellClasses: string[] = entry.classes || (Array.isArray(entry.frontmatter?.classes) ? entry.frontmatter.classes : []);
  const subclassSpellLists: string[] = entry.subclass_spell_lists || (Array.isArray(entry.frontmatter?.subclasses) ? entry.frontmatter.subclasses : []);

  // Class & Subclass related compendiums
  const subclasses = useMemo(() => isClass ? getSubclassesForClass(entry.title || entry.id) : [], [isClass, entry.title, entry.id]);
  const classOptions = useMemo(() => isClass ? getClassOptionsForClass(entry.title || entry.id) : [], [isClass, entry.title, entry.id]);
  const classSpells = useMemo(() => (isClass || isSubclass) ? getSpellsForClass(entry.title || entry.id) : [], [isClass, isSubclass, entry.title, entry.id]);

  const effectiveTab = useMemo(() => {
    const validTabs: string[] = ['content'];
    if (classSpells.length > 0) validTabs.push('spells');
    if (subclasses.length > 0) validTabs.push('subclasses');
    if (classOptions.length > 0) validTabs.push('options');
    if (entry.incomingLinks && entry.incomingLinks.length > 0) validTabs.push('backlinks');
    return validTabs.includes(activeTab) ? activeTab : 'content';
  }, [activeTab, classSpells.length, subclasses.length, classOptions.length, entry.incomingLinks]);

  // Campaign ambiance detection
  const isStrahd = entry.campaign_id === 'curse-of-strahd' || entry.path.includes('curse-of-strahd') || entry.id.includes('curse-of-strahd');
  const isStrahdIndex = isStrahd && (entry.id.endsWith('/index') || entry.id === 'campaigns/curse-of-strahd');

  const isMonster = entry.category === 'monsters' && !entry.id.endsWith('/index');
  const isMonsterIndex = entry.id === 'monsters/index' || entry.id === 'monsters' || (entry.category === 'monsters' && entry.id.endsWith('/index'));

  // If this is the Bestiary index, render the dedicated Bestiary Catalogue
  if (isMonsterIndex) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-stone-800 bg-stone-900/80 text-stone-400 text-xs font-serif">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="text-amber-400 hover:text-amber-200 flex items-center gap-1 font-semibold mr-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('index')}
              className="hover:text-stone-200 uppercase tracking-wider font-semibold transition-colors"
            >
              Archive
            </button>
            <span className="text-stone-600 font-serif">❖</span>
            <span className="text-amber-300 font-bold capitalize">Bestiary Codex</span>
          </div>

          <div className="flex items-center gap-2">
            <WaxSeal label="5e" className="w-5 h-5 text-[9px]" />
            <span className="font-serif tracking-widest text-[10px] uppercase font-bold text-amber-300 px-2 py-0.5 rounded border border-amber-900/60 bg-amber-950/40">
              Monster Manual
            </span>
          </div>
        </div>

        <BestiaryCatalogue onSelectMonster={onNavigate} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border-2 transition-all ${
        isStrahd
          ? 'bg-stone-950/90 border-rose-950/80 text-rose-300/80 shadow-[0_2px_15px_rgba(136,19,55,0.15)]'
          : 'bg-stone-900/80 border-stone-800 text-stone-400'
      }`}>
        <div className="flex items-center gap-2 text-xs font-serif overflow-x-auto py-0.5">
          {onBack && (
            <button
              onClick={onBack}
              className={`flex items-center gap-1 font-serif transition-colors mr-1 ${
                isStrahd ? 'text-rose-400 hover:text-rose-200' : 'text-amber-400 hover:text-amber-200'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('index')}
            className="hover:text-stone-200 transition-colors uppercase tracking-wider font-semibold"
          >
            Archive
          </button>

          {breadcrumbParts.map((part, idx) => (
            <React.Fragment key={idx}>
              <span className="text-stone-600 font-serif">❖</span>
              <span className={`capitalize ${
                idx === breadcrumbParts.length - 1
                  ? (isStrahd ? 'text-rose-300 font-bold' : 'text-amber-300 font-bold')
                  : 'text-stone-400'
              }`}>
                {part.replace(/-/g, ' ')}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Source Badge - Medieval Wax / Heraldic Style */}
        <div className="flex items-center gap-2">
          {isStrahd ? (
            <div className="flex items-center gap-2">
              <WaxSeal label="S" className="w-5 h-5 text-[9px]" />
              <span className="font-serif tracking-widest text-[10px] uppercase font-bold text-rose-300 px-2 py-0.5 rounded border border-rose-900/60 bg-rose-950/40">
                Ravenloft Saga
              </span>
            </div>
          ) : (
            <div
              className={`px-2.5 py-0.5 rounded border text-[10px] font-serif uppercase tracking-widest font-bold flex items-center gap-1.5 ${sourceBadge.bg} ${sourceBadge.text} ${sourceBadge.border}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{sourceBadge.label}</span>
            </div>
          )}

          {entry.content_status === 'incomplete' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-serif uppercase tracking-wider font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Incomplete</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Entry Container with Gothic or Codex theme */}
      <div className={`relative rounded-2xl p-6 md:p-8 space-y-6 transition-all ${
        isStrahd
          ? 'bg-gradient-to-b from-stone-950 via-stone-900 to-rose-950/30 border-2 border-rose-900/60 shadow-[0_0_40px_rgba(136,19,55,0.22)]'
          : 'bg-stone-900/90 border-2 border-stone-800 shadow-2xl'
      }`}>
        {/* Decorative corner brackets */}
        <div className={`absolute top-2.5 left-2.5 text-xs font-serif select-none pointer-events-none ${isStrahd ? 'text-rose-800/40' : 'text-amber-800/30'}`}>╔</div>
        <div className={`absolute top-2.5 right-2.5 text-xs font-serif select-none pointer-events-none ${isStrahd ? 'text-rose-800/40' : 'text-amber-800/30'}`}>╗</div>
        <div className={`absolute bottom-2.5 left-2.5 text-xs font-serif select-none pointer-events-none ${isStrahd ? 'text-rose-800/40' : 'text-amber-800/30'}`}>╚</div>
        <div className={`absolute bottom-2.5 right-2.5 text-xs font-serif select-none pointer-events-none ${isStrahd ? 'text-rose-800/40' : 'text-amber-800/30'}`}>╝</div>

        {/* Strahd Gothic Banner */}
        {isStrahd && (
          <div className="p-4 rounded-xl border border-rose-900/70 bg-gradient-to-r from-rose-950/90 via-stone-950 to-rose-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start gap-3">
              <RavenloftCrest className="w-8 h-8 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-fantasy font-bold text-xs uppercase tracking-widest text-rose-300">
                    Domain of Dread • Barovia
                  </span>
                  <span className="text-[10px] font-serif text-rose-400 italic">Land of the Vampire Lord</span>
                </div>
                <p className="text-xs text-rose-200/90 font-serif italic leading-relaxed">
                  "The mists hem in the valley. The dead walk unquiet, and Count Strahd watches from his perch upon the pillarstone of Ravenloft."
                </p>
              </div>
            </div>

            {!entry.id.endsWith('alterations-to-magic') && (
              <button
                onClick={() => onNavigate('campaigns/curse-of-strahd/rules/alterations-to-magic')}
                className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-xs font-serif uppercase tracking-wider text-rose-200 transition-colors shrink-0 flex items-center gap-1.5"
              >
                <GothicBat className="w-3.5 h-3.5 text-rose-400" />
                <span>Alterations to Magic →</span>
              </button>
            )}
          </div>
        )}

        {/* Strahd Index Portal Cards */}
        {isStrahdIndex && (
          <div className="my-5 space-y-3.5">
            <div className="text-xs font-fantasy uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <GothicRaven className="w-4 h-4 text-rose-400" />
              <span>Barovian Sagas & Gothic Records</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('campaigns/curse-of-strahd/rules/alterations-to-magic')}
                className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 hover:border-rose-700 transition-all text-left space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <GothicChalice className="w-5 h-5 text-rose-400" />
                  <span className="text-[10px] font-serif uppercase tracking-widest text-rose-400 font-bold">Rules</span>
                </div>
                <h4 className="font-fantasy font-bold text-sm text-rose-100 group-hover:text-rose-200">
                  Alterations to Magic
                </h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Cosmetic horrors, planar entrapment, and corrupted divine magic.
                </p>
              </button>

              <button
                onClick={() => onNavigate('campaigns/curse-of-strahd/rules/index')}
                className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 hover:border-rose-700 transition-all text-left space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <SpellTome className="w-5 h-5 text-rose-400" />
                  <span className="text-[10px] font-serif uppercase tracking-widest text-rose-400 font-bold">Codex</span>
                </div>
                <h4 className="font-fantasy font-bold text-sm text-rose-100 group-hover:text-rose-200">
                  Barovian Calendar & Lore
                </h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Day cycle, the Mists, the Dark Powers, and geography.
                </p>
              </button>

              <button
                onClick={() => onNavigate('builder')}
                className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 hover:border-rose-700 transition-all text-left space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <CrossedSwords className="w-5 h-5 text-rose-400" />
                  <span className="text-[10px] font-serif uppercase tracking-widest text-rose-400 font-bold">Builder</span>
                </div>
                <h4 className="font-fantasy font-bold text-sm text-rose-100 group-hover:text-rose-200">
                  Create Barovian Hero
                </h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Haunted One background, grim subclasses, and gothic lineage.
                </p>
              </button>

              <button
                onClick={() => onNavigate('spells')}
                className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-950/60 hover:border-rose-700 transition-all text-left space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <GothicBat className="w-5 h-5 text-rose-400" />
                  <span className="text-[10px] font-serif uppercase tracking-widest text-rose-400 font-bold">Spells</span>
                </div>
                <h4 className="font-fantasy font-bold text-sm text-rose-100 group-hover:text-rose-200">
                  Spells in the Shadows
                </h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Necromancy, radiant wards, and abjurations to survive the night.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Entry Title & Metadata Header */}
        <div className={`border-b pb-5 ${isStrahd ? 'border-rose-900/60' : 'border-stone-800'}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className={`text-xs font-serif uppercase tracking-widest block mb-1 font-bold ${
                isStrahd ? 'text-rose-400' : 'text-stone-400'
              }`}>
                {isStrahd
                  ? 'Curse of Strahd • Gothic Campaign Chronicle'
                  : isHome
                    ? '5e D&D Reference Vault'
                    : (entry.category.replace('-', ' ') + (entry.subcategory ? ` • ${entry.subcategory.replace('-', ' ')}` : ''))}
              </span>
              <h1 className={`font-fantasy text-3xl md:text-5xl font-bold tracking-tight drop-shadow-sm ${
                isStrahd ? 'text-rose-100' : 'text-amber-100'
              }`}>
                {entry.title}
              </h1>
            </div>

            {/* Subclass parent link */}
            {entry.parentClass && (
              <button
                onClick={() => onNavigate(`character-options/classes/${entry.parentClass}`)}
                className="px-3.5 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs font-serif tracking-wider uppercase text-amber-400 hover:text-amber-200 hover:border-amber-500/40 flex items-center gap-1.5 transition-colors font-medium"
              >
                <span>Class: {entry.parentClass}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Home Hub Quick-Access Portals */}
          {isHome && (
            <div className="mt-5 space-y-3.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick-Access Compendium Portals</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <button
                  onClick={() => onNavigate('builder')}
                  className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-500/60 transition-all text-left group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 group-hover:text-amber-300 text-sm transition-colors">
                      Character Builder
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Step-by-step visual character creation & sheet export.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('spells')}
                  className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-950/20 hover:bg-violet-950/40 hover:border-violet-500/60 transition-all text-left group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform shrink-0">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 group-hover:text-violet-300 text-sm transition-colors">
                      Spell Catalogue
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Search 150+ spells by level, school, and class.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('items')}
                  className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-500/60 transition-all text-left group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 group-hover:text-emerald-300 text-sm transition-colors">
                      Magic Items Compendium
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Browse weapons, armor, potions, and wondrous artifacts.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('campaigns')}
                  className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 hover:border-rose-500/60 transition-all text-left group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 group-hover:text-rose-300 text-sm transition-colors">
                      Campaign Worlds
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Barovia, Ra Gol'vek, Vyrun: lore, sessions, and NPCs.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('graph')}
                  className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/40 hover:border-indigo-500/60 transition-all text-left group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 group-hover:text-indigo-300 text-sm transition-colors">
                      Knowledge Graph
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Interactive network simulation connecting 1,200+ entries.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('character-options/classes/index')}
                  className="p-3.5 rounded-xl border border-amber-500/30 bg-slate-950/60 hover:bg-slate-900 hover:border-amber-500/60 transition-all text-left group flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300 group-hover:scale-105 transition-transform shrink-0">
                    <Sword className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 group-hover:text-amber-300 text-sm transition-colors">
                      Classes & Archetypes
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Core and homebrew classes with all mechanics & features.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Subclass Parent Class Banner */}
          {isSubclass && entry.parentClass && (
            <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-300">
                  Specialized Archetype for the <strong className="text-amber-300">{entry.parentClass}</strong> class
                </span>
              </div>
              <button
                onClick={() => onNavigate(`character-options/classes/${entry.parentClass}`)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 self-start sm:self-auto shrink-0 transition-colors"
              >
                <span>View {entry.parentClass} Class Rules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Subclass Flavor Quote or Summary */}
          {isMonster ? (
            entry.summary ? (
              <div className="mt-3.5 p-4 rounded-xl bg-stone-950/70 border-l-4 border-amber-600 text-stone-300 text-sm md:text-base italic leading-relaxed shadow-sm font-serif">
                <InlineContent text={cleanFlavorText(entry.summary)} onNavigate={onNavigate} />
              </div>
            ) : null
          ) : entry.flavor ? (
            <div className="mt-3.5 p-4 rounded-xl bg-slate-950/70 border-l-4 border-amber-500 text-slate-200 text-sm md:text-base italic leading-relaxed shadow-sm">
              <InlineContent text={cleanFlavorText(entry.flavor)} onNavigate={onNavigate} />
            </div>
          ) : entry.summary ? (
            <div className="text-slate-300 text-sm md:text-base mt-2.5 italic">
              <InlineContent text={cleanFlavorText(entry.summary)} onNavigate={onNavigate} />
            </div>
          ) : null}

          {/* Subclass quick feature progression banner */}
          {isSubclass && entry.features && entry.features.length > 0 && (
            <div className="mt-3.5 p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/20 space-y-2">
              <div className="text-[11px] uppercase font-semibold tracking-wider text-amber-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Archetype Features ({entry.features.length})</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.features.map((feat, fIdx) => (
                  <div
                    key={fIdx}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center gap-1.5"
                  >
                    {feat.level && (
                      <span className="text-[10px] font-mono text-amber-400 font-semibold px-1 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                        {feat.level}
                      </span>
                    )}
                    <span className="font-semibold text-slate-200">{feat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stat Chips (omitted for home hub) */}
          {!isHome && Boolean(entry.hit_die || (entry.saving_throws && entry.saving_throws.length > 0) || rarityBadge || entry.attunement || entry.campaign_id) && (
            <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-slate-800/60">
              {entry.hit_die && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hit Die: {entry.hit_die}</span>
                </div>
              )}

              {entry.saving_throws && entry.saving_throws.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Saves: {entry.saving_throws.join(', ')}</span>
                </div>
              )}

              {rarityBadge && (
                <div
                  className={`px-3 py-1 rounded-lg border text-xs font-semibold ${rarityBadge.bg} ${rarityBadge.text} ${rarityBadge.border}`}
                >
                  {entry.rarity} {entry.item_type || ''}
                </div>
              )}

              {entry.attunement && (
                <div className="px-3 py-1 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 font-medium">
                  Requires Attunement
                </div>
              )}

              {entry.campaign_id && (
                <button
                  onClick={() => onNavigate(`campaigns/${entry.campaign_id}/index`)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 hover:text-amber-200"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Campaign: {entry.campaign_id}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dedicated Rich Spell Stat Block Card */}
        {isSpell && (
          <div className="bg-stone-950/90 border-2 border-amber-900/50 rounded-xl p-5 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/30 pb-3">
              <div className="flex items-center gap-2.5">
                <SpellTome className="w-5 h-5 text-amber-400" />
                <div className="font-fantasy text-lg font-bold text-amber-300 tracking-wide">
                  {spellLevel === 0 ? `${spellSchool} Cantrip` : `${getSpellLevelLabel(spellLevel)} ${spellSchool}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {concentration && (
                  <span className="font-serif tracking-widest text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border border-blue-900/70 bg-blue-950/40 text-blue-300">
                    Concentration
                  </span>
                )}
                {ritual && (
                  <span className="font-serif tracking-widest text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border border-emerald-900/70 bg-emerald-950/40 text-emerald-300">
                    Ritual
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-serif">
              <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                <span className="text-amber-500/80 uppercase tracking-widest block font-bold text-[10px]">Casting Time</span>
                <span className="text-stone-200 font-sans font-medium text-xs mt-0.5 block">{castingTime || '1 action'}</span>
              </div>
              <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                <span className="text-amber-500/80 uppercase tracking-widest block font-bold text-[10px]">Range</span>
                <span className="text-stone-200 font-sans font-medium text-xs mt-0.5 block">{range || 'Self'}</span>
              </div>
              <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                <span className="text-amber-500/80 uppercase tracking-widest block font-bold text-[10px]">Components</span>
                <span className="text-amber-200/90 font-mono text-xs mt-0.5 block">{components || 'V, S'}</span>
              </div>
              <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                <span className="text-amber-500/80 uppercase tracking-widest block font-bold text-[10px]">Duration</span>
                <span className="text-stone-200 font-sans font-medium text-xs mt-0.5 block">{duration || 'Instantaneous'}</span>
              </div>
            </div>

            {(spellClasses.length > 0 || subclassSpellLists.length > 0) && (
              <div className="pt-3 border-t border-amber-900/30 space-y-2 text-xs">
                {spellClasses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-stone-400 font-serif font-bold uppercase tracking-wider text-[11px]">Classes:</span>
                    {spellClasses.map(cls => (
                      <button
                        key={cls}
                        onClick={() => onNavigate(`character-options/classes/${cls}`)}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/60 text-stone-300 hover:text-amber-200 transition-colors font-serif text-xs font-semibold"
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                )}

                {subclassSpellLists.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-violet-400 font-serif font-bold uppercase tracking-wider text-[11px]">Subclasses:</span>
                    {subclassSpellLists.map(sc => (
                      <span
                        key={sc}
                        className="px-2.5 py-1 rounded-lg bg-violet-950/50 border border-violet-900/50 text-violet-300 font-serif text-[11px]"
                      >
                        {sc}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dedicated Magic Item Quick Card */}
        {entry.category === 'items' && !entry.id.endsWith('/index') && (
          <div className="bg-stone-950/90 border-2 border-amber-900/50 rounded-xl p-5 space-y-4 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/30 pb-3">
              <div className="flex items-center gap-2.5">
                <DragonShield className="w-5 h-5 text-amber-400" />
                <div className="font-fantasy text-lg font-bold text-amber-200 tracking-wide">
                  {entry.item_type || entry.subcategory || 'Magic Item'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rarityBadge && (
                  <span className={`font-serif tracking-widest text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border ${rarityBadge.bg} ${rarityBadge.text} ${rarityBadge.border}`}>
                    {entry.rarity}
                  </span>
                )}
                {entry.attunement && (
                  <span className="font-serif tracking-widest text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border border-purple-900/70 bg-purple-950/40 text-purple-300">
                    Attunement Required
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-serif">
              <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                <span className="text-amber-500/80 uppercase tracking-widest block font-bold text-[10px]">Category</span>
                <span className="text-stone-200 font-sans font-medium text-xs mt-0.5 block">{entry.subcategory || entry.item_type || 'Item'}</span>
              </div>
              <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                <span className="text-amber-500/80 uppercase tracking-widest block font-bold text-[10px]">Source</span>
                <span className="text-stone-200 font-sans font-medium text-xs mt-0.5 block">{entry.source || 'SRD 5.1'}</span>
              </div>
              {entry.frontmatter?.weight && (
                <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                  <span className="text-amber-500/80 uppercase tracking-widest block font-bold text-[10px]">Weight</span>
                  <span className="text-stone-200 font-sans font-medium text-xs mt-0.5 block">{entry.frontmatter.weight}</span>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Navigation Tabs for Classes and Subclasses with Spells */}
        {(isClass || (isSubclass && classSpells.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                effectiveTab === 'content'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isClass ? 'Class Features & Rules' : 'Subclass Features'}
            </button>

            {classSpells.length > 0 && (
              <button
                onClick={() => setActiveTab('spells')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  effectiveTab === 'spells'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Spells ({classSpells.length})</span>
              </button>
            )}

            {subclasses.length > 0 && (
              <button
                onClick={() => setActiveTab('subclasses')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  effectiveTab === 'subclasses'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Subclasses ({subclasses.length})</span>
              </button>
            )}

            {classOptions.length > 0 && (
              <button
                onClick={() => setActiveTab('options')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  effectiveTab === 'options'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Options & Exploits ({classOptions.length})</span>
              </button>
            )}

            {entry.incomingLinks && entry.incomingLinks.length > 0 && (
              <button
                onClick={() => setActiveTab('backlinks')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  effectiveTab === 'backlinks'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Backlinks ({entry.incomingLinks.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 1: Markdown Content */}
        {effectiveTab === 'content' && (
          <div className="space-y-6">
            {isMonster ? (
              <MonsterStatblock entry={entry} onNavigate={onNavigate} />
            ) : (
              <MarkdownView content={entry.body} currentEntryId={entry.id} onNavigate={onNavigate} />
            )}

            {/* If this is the spells index page or a level index page */}
            {entry.category === 'spells' && entry.id.endsWith('/index') && entry.id !== 'index' && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <SpellCatalogue
                  initialClass="All Spells"
                  initialLevel={
                    entry.subcategory === 'cantrips' ? 0 :
                    entry.subcategory?.includes('1st') ? 1 :
                    entry.subcategory?.includes('2nd') ? 2 :
                    entry.subcategory?.includes('3rd') ? 3 :
                    entry.subcategory?.includes('4th') ? 4 :
                    entry.subcategory?.includes('5th') ? 5 :
                    entry.subcategory?.includes('6th') ? 6 :
                    entry.subcategory?.includes('7th') ? 7 :
                    entry.subcategory?.includes('8th') ? 8 :
                    entry.subcategory?.includes('9th') ? 9 : 'all'
                  }
                  onSelectSpell={onNavigate}
                />
              </div>
            )}

            {entry.category === 'class-options' && entry.id.endsWith('/index') && (
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-violet-300">
                  Available {entry.title}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {archiveDb.entries
                    .filter(candidate => candidate.category === 'class-options' && candidate.subcategory === entry.subcategory && !candidate.id.endsWith('/index'))
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map(option => (
                      <button
                        key={option.id}
                        onClick={() => onNavigate(option.id)}
                        className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-left transition-colors hover:border-violet-500/50"
                      >
                        <span className="block text-sm font-semibold text-slate-200">{option.title}</span>
                        {option.summary && <span className="mt-1 block text-xs text-slate-400">{option.summary}</span>}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Rich Codex Cross-References / Where is this referenced? */}
            {entry.incomingLinks && entry.incomingLinks.length > 0 && (
              <div className="mt-8 pt-6 border-t-2 border-stone-800/80 space-y-3 font-serif">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-amber-400">
                    <Network className="w-4 h-4 text-amber-500" />
                    <span>Codex Cross-References • Referenced By ({entry.incomingLinks.length})</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-sans">Inbound graph edges</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {entry.incomingLinks.map(linkId => {
                    const linked = getEntryById(linkId);
                    const title = linked?.title || linkId.split('/').pop()?.replace(/-/g, ' ');
                    const cat = linked?.category || 'entry';
                    const isStrahdLink = linkId.includes('strahd') || linked?.campaign_id === 'curse-of-strahd';

                    return (
                      <button
                        key={linkId}
                        onClick={() => onNavigate(linkId)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                          isStrahdLink
                            ? 'bg-stone-950/80 border-rose-950 hover:border-rose-700/60 hover:bg-rose-950/30'
                            : 'bg-stone-900/60 border-stone-800 hover:border-amber-600/60 hover:bg-stone-900'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-xs text-stone-200 group-hover:text-amber-300 transition-colors truncate">
                            {title}
                          </div>
                          <div className="text-[10px] text-stone-400 capitalize flex items-center gap-1.5 mt-0.5 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70"></span>
                            <span>{cat}</span>
                            {linked?.parentClass && (
                              <span className="text-amber-400/80 font-serif">({linked.parentClass})</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Dedicated Class/Subclass Spells */}
        {effectiveTab === 'spells' && classSpells.length > 0 && (
          <div className="space-y-4">
            <SpellCatalogue
              initialClass={entry.title}
              hideClassSelector={true}
              onSelectSpell={onNavigate}
            />
          </div>
        )}

        {/* Tab 2: Subclasses Grid with Flavor Text and Game Mechanics */}
        {effectiveTab === 'subclasses' && (
          <div className="space-y-5">
            {/* Header & Subclass Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-fantasy text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{entry.title} Archetypes & Subclasses</span>
                  <span className="text-xs font-mono font-normal text-slate-400">({subclasses.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete narrative flavor text, core game mechanics, and feature progressions.
                </p>
              </div>

              {subclasses.length > 3 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter archetypes..."
                    value={subclassSearch}
                    onChange={(e) => setSubclassSearch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none w-48"
                  />
                </div>
              )}
            </div>

            {/* Subclass Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {subclasses
                .filter(sub => {
                  if (!subclassSearch.trim()) return true;
                  const q = subclassSearch.toLowerCase().trim();
                  return sub.title.toLowerCase().includes(q) ||
                    (sub.flavor && sub.flavor.toLowerCase().includes(q)) ||
                    (sub.summary && sub.summary.toLowerCase().includes(q)) ||
                    (sub.features && sub.features.some(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)));
                })
                .map(sub => {
                  const subBadge = getSourceBadgeInfo(sub.source_type, sub.source);
                  const isExpanded = expandedSubclasses.has(sub.id);
                  const features = sub.features || [];

                  return (
                    <div
                      key={sub.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4 hover:border-amber-500/40 transition-colors shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        {/* Subclass Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                          <div>
                            <div className="text-[10px] uppercase font-semibold tracking-wider text-amber-400 mb-0.5">
                              {entry.title} Archetype
                            </div>
                            <h4 className="font-fantasy text-xl font-bold text-slate-100">
                              {sub.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${subBadge.bg} ${subBadge.text} ${subBadge.border}`}>
                              {subBadge.label}
                            </span>
                          </div>
                        </div>

                        {/* Narrative Flavor Text */}
                        {(sub.flavor || sub.summary) && (
                          <div className="bg-slate-900/70 border-l-2 border-amber-500/70 rounded-r-xl p-3 text-xs text-slate-300 italic leading-relaxed">
                            <InlineContent text={cleanFlavorText(sub.flavor || sub.summary)} onNavigate={onNavigate} />
                          </div>
                        )}

                        {/* Game Mechanics & Core Features */}
                        {features.length > 0 ? (
                          <div className="space-y-2 pt-1 border-t border-slate-800/80">
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                              <span className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                <span>Core Game Mechanics & Features ({features.length})</span>
                              </span>
                              {features.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => toggleSubclassExpand(sub.id)}
                                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium capitalize text-[10px] transition-colors"
                                >
                                  <span>{isExpanded ? 'Show fewer' : `All ${features.length} features`}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>

                            <div className="space-y-2">
                              {(isExpanded ? features : features.slice(0, 2)).map((feat, fIdx) => (
                                <div
                                  key={fIdx}
                                  className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3 space-y-1 text-xs"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                                    <span className="font-semibold text-slate-200">{feat.name}</span>
                                    {feat.level && (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/50">
                                        {feat.level}
                                      </span>
                                    )}
                                  </div>
                                  {feat.description && (
                                    <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                                      <InlineContent text={feat.description} onNavigate={onNavigate} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic py-1">
                            Complete progression tables and spells available in the full archetype entry.
                          </div>
                        )}
                      </div>

                      {/* Card Footer Navigation */}
                      <div className="pt-3 border-t border-slate-800/80">
                        <button
                          onClick={() => onNavigate(sub.id)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-slate-800 hover:border-amber-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group"
                        >
                          <span>Open Full {sub.title} Entry</span>
                          <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Tab 3: Class Options Grid */}
        {effectiveTab === 'options' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Specialized choices, exploits, and invocations for {entry.title}.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-2">
              {classOptions.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => onNavigate(opt.id)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/40 hover:bg-slate-800/40 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="font-fantasy font-bold text-slate-100 text-sm">
                    {opt.title}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {opt.summary || 'View power description and prerequisites.'}
                  </p>
                  <div className="text-[10px] text-amber-400/80">
                    {opt.subcategory?.replace('-', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Backlinks Tab */}
        {effectiveTab === 'backlinks' && entry.incomingLinks && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400">
              Pages and resources in the archive that cite or reference {entry.title}.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {entry.incomingLinks.map(linkId => {
                const linked = getEntryById(linkId);
                return (
                  <button
                    key={linkId}
                    onClick={() => onNavigate(linkId)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-200 text-xs">
                        {linked?.title || linkId.split('/').pop()}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {linked?.category || 'entry'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
