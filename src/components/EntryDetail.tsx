import React, { useState } from 'react';
import { ArchiveEntry } from '../types/archive';
import {
  getSourceBadgeInfo,
  getRarityColor,
  getSubclassesForClass,
  getClassOptionsForClass,
  getSpellsForClass,
  getSpellLevelLabel,
  getEntryById,
  archiveDb
} from '../utils/archiveUtils';
import { MarkdownView } from './MarkdownView';
import { SpellCatalogue } from './SpellCatalogue';
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
  Target
} from 'lucide-react';

interface EntryDetailProps {
  entry: ArchiveEntry;
  onNavigate: (entryId: string) => void;
  onBack?: () => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({ entry, onNavigate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'spells' | 'subclasses' | 'options' | 'backlinks'>('content');

  const sourceBadge = getSourceBadgeInfo(entry.source_type, entry.source);
  const rarityBadge = entry.rarity ? getRarityColor(entry.rarity) : null;

  // Breadcrumbs
  const breadcrumbParts = entry.path.replace(/\.md$/, '').split('/');

  // If this entry is a class, find its subclasses and options
  const isClass = entry.category === 'classes' && !entry.id.endsWith('/index');
  const isSubclass = entry.category === 'subclasses' && !entry.id.endsWith('/index');
  const subclasses = isClass ? getSubclassesForClass(entry.title) : [];
  const classOptions = isClass ? getClassOptionsForClass(entry.title) : [];
  const classSpells = (isClass || isSubclass) ? getSpellsForClass(entry.title) : [];

  // If this entry is an individual spell
  const isSpell = entry.category === 'spells' && !entry.id.endsWith('/index');
  const spellLevel = entry.level !== null && entry.level !== undefined ? entry.level : (entry.frontmatter?.level ?? 0);
  const spellSchool = entry.school || entry.frontmatter?.school || '';
  const castingTime = entry.casting_time || entry.frontmatter?.casting_time || '';
  const range = entry.range || entry.frontmatter?.range || '';
  const duration = entry.duration || entry.frontmatter?.duration || '';
  const components = entry.components || entry.frontmatter?.components || '';
  const ritual = entry.ritual ?? Boolean(entry.frontmatter?.ritual);
  const concentration = entry.concentration ?? Boolean(entry.frontmatter?.concentration);
  const spellClasses: string[] = entry.classes || entry.frontmatter?.classes || [];
  const subclassSpellLists: string[] = entry.subclass_spell_lists || entry.frontmatter?.subclass_spell_lists || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400 overflow-x-auto py-0.5">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-200 font-medium transition-colors mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('index')}
            className="hover:text-slate-200 transition-colors"
          >
            Archive
          </button>

          {breadcrumbParts.map((part, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className={`capitalize ${idx === breadcrumbParts.length - 1 ? 'text-amber-300 font-semibold' : 'text-slate-400'}`}>
                {part.replace(/-/g, ' ')}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Source Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${sourceBadge.bg} ${sourceBadge.text} ${sourceBadge.border}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>{sourceBadge.label}</span>
          </div>

          {entry.content_status === 'incomplete' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Incomplete Entry</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Entry Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Entry Title & Metadata Header */}
        <div className="border-b border-slate-800 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 block mb-1">
                {entry.category.replace('-', ' ')}
                {entry.subcategory ? ` • ${entry.subcategory.replace('-', ' ')}` : ''}
              </span>
              <h1 className="font-fantasy text-3xl md:text-4xl font-bold text-slate-100">
                {entry.title}
              </h1>
            </div>

            {/* Subclass parent link */}
            {entry.parentClass && (
              <button
                onClick={() => onNavigate(`character-options/classes/${entry.parentClass}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 hover:text-amber-200 hover:border-amber-500/40 flex items-center gap-1.5 transition-colors font-medium"
              >
                <span>Class: {entry.parentClass}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {entry.summary && (
            <p className="text-slate-300 text-sm md:text-base mt-2.5 italic">
              {entry.summary}
            </p>
          )}

          {/* Quick Stat Chips */}
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
        </div>

        {/* Dedicated Rich Spell Stat Block Card */}
        {isSpell && (
          <div className="bg-slate-950/80 border border-violet-500/30 rounded-xl p-5 space-y-4 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="text-base font-semibold text-violet-300">
                {spellLevel === 0 ? `${spellSchool} Cantrip` : `${getSpellLevelLabel(spellLevel)} ${spellSchool}`}
              </div>
              <div className="flex items-center gap-2">
                {concentration && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/70 text-blue-300 border border-blue-500/40">
                    Concentration
                  </span>
                )}
                {ritual && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                    Ritual
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Casting Time</span>
                <span className="text-slate-200 font-medium">{castingTime || '1 action'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Range</span>
                <span className="text-slate-200 font-medium">{range || 'Self'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Components</span>
                <span className="text-slate-200 font-mono">{components || 'V, S'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">Duration</span>
                <span className="text-slate-200 font-medium">{duration || 'Instantaneous'}</span>
              </div>
            </div>

            {(spellClasses.length > 0 || subclassSpellLists.length > 0) && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                {spellClasses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Classes:</span>
                    {spellClasses.map(cls => (
                      <button
                        key={cls}
                        onClick={() => onNavigate(`character-options/classes/${cls}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-violet-500 text-slate-200 hover:text-violet-300 transition-colors font-medium text-xs"
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                )}

                {subclassSpellLists.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-violet-400 font-medium">Subclass Lists:</span>
                    {subclassSpellLists.map(sc => (
                      <span
                        key={sc}
                        className="px-2.5 py-1 rounded-lg bg-violet-950/60 border border-violet-800/50 text-violet-200 text-[11px]"
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

        {/* Navigation Tabs for Classes and Subclasses with Spells */}
        {(isClass || (isSubclass && classSpells.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'content'
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
                  activeTab === 'spells'
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
                  activeTab === 'subclasses'
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
                  activeTab === 'options'
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
                  activeTab === 'backlinks'
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
        {activeTab === 'content' && (
          <div className="space-y-6">
            <MarkdownView content={entry.body} onNavigate={onNavigate} />

            {/* If this is the spells index page or a level index page */}
            {entry.category === 'spells' && entry.id.endsWith('/index') && (
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

            {/* Backlinks at bottom for non-class entries */}
            {!isClass && !isSubclass && entry.incomingLinks && entry.incomingLinks.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  <Link2 className="w-4 h-4 text-amber-400" />
                  <span>Incoming References ({entry.incomingLinks.length} backlinks)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {entry.incomingLinks.map(linkId => {
                    const linked = getEntryById(linkId);
                    return (
                      <button
                        key={linkId}
                        onClick={() => onNavigate(linkId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1"
                      >
                        <span>{linked?.title || linkId.split('/').pop()}</span>
                        <ChevronRight className="w-3 h-3 opacity-50" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Dedicated Class/Subclass Spells */}
        {activeTab === 'spells' && classSpells.length > 0 && (
          <div className="space-y-4">
            <SpellCatalogue
              initialClass={entry.title}
              hideClassSelector={true}
              onSelectSpell={onNavigate}
            />
          </div>
        )}

        {/* Tab 2: Subclasses Grid */}
        {activeTab === 'subclasses' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Archetypes and paths available to the {entry.title} class.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subclasses.map(sub => {
                const subBadge = getSourceBadgeInfo(sub.source_type, sub.source);
                return (
                  <div
                    key={sub.id}
                    onClick={() => onNavigate(sub.id)}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/40 hover:bg-slate-800/40 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-fantasy font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {sub.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${subBadge.bg} ${subBadge.text} ${subBadge.border}`}>
                        {subBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {sub.summary || 'Click to view archetype features and spells.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Class Options Grid */}
        {activeTab === 'options' && (
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
        {activeTab === 'backlinks' && entry.incomingLinks && (
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
