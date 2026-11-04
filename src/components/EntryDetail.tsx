import React, { useState } from 'react';
import { ArchiveEntry } from '../types/archive';
import {
  getSourceBadgeInfo,
  getRarityColor,
  getSubclassesForClass,
  getClassOptionsForClass,
  getEntryById
} from '../utils/archiveUtils';
import { MarkdownView } from './MarkdownView';
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
  Info
} from 'lucide-react';

interface EntryDetailProps {
  entry: ArchiveEntry;
  onNavigate: (entryId: string) => void;
  onBack?: () => void;
}

export const EntryDetail: React.FC<EntryDetailProps> = ({ entry, onNavigate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'subclasses' | 'options' | 'backlinks'>('content');

  const sourceBadge = getSourceBadgeInfo(entry.source_type, entry.source);
  const rarityBadge = entry.rarity ? getRarityColor(entry.rarity) : null;

  // Breadcrumbs
  const breadcrumbParts = entry.path.replace(/\.md$/, '').split('/');

  // If this entry is a class, find its subclasses and options
  const isClass = entry.category === 'classes' && !entry.id.endsWith('/index');
  const subclasses = isClass ? getSubclassesForClass(entry.title) : [];
  const classOptions = isClass ? getClassOptionsForClass(entry.title) : [];

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

        {/* Navigation Tabs for Classes (Content | Subclasses | Class Options | Backlinks) */}
        {isClass && (
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'content'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Class Features & Rules
            </button>

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

            {/* If not a class, show backlinks directly at bottom */}
            {!isClass && entry.incomingLinks && entry.incomingLinks.length > 0 && (
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
