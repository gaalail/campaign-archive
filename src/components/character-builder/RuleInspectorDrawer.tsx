import React, { useEffect } from 'react';
import { ArchiveEntry } from '../../types/archive';
import { MarkdownView } from '../MarkdownView';
import { X, Check, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { getSourceBadgeInfo } from '../../utils/archiveUtils';

interface RuleInspectorDrawerProps {
  entry: ArchiveEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption?: (entry: ArchiveEntry) => void;
  isSelected?: boolean;
  onNavigateToEntry: (id: string) => void;
}

export const RuleInspectorDrawer: React.FC<RuleInspectorDrawerProps> = ({
  entry,
  isOpen,
  onClose,
  onSelectOption,
  isSelected,
  onNavigateToEntry
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const badge = getSourceBadgeInfo(entry.source_type, entry.source);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-stone-900 border-l border-amber-900/60 shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
          
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-stone-800 bg-stone-950/90 flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>RAW Compendium Inspector</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  {entry.category}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-amber-100 truncate">
                {entry.title}
              </h2>
              {entry.summary && (
                <p className="text-xs text-stone-400 line-clamp-2 italic">
                  {entry.summary}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onSelectOption && (
                <button
                  onClick={() => {
                    onSelectOption(entry);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'Selected' : 'Select Option'}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                aria-label="Close inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="px-6 py-2.5 bg-stone-950/50 border-b border-stone-800/80 flex items-center justify-between text-xs text-stone-400 font-mono">
            <span>Canonical ID: <code className="text-amber-400/90">{entry.id}</code></span>
            <button
              onClick={() => {
                onClose();
                onNavigateToEntry(entry.id);
              }}
              className="text-amber-400 hover:text-amber-200 flex items-center gap-1 transition-colors"
            >
              <span>Open in Full Codex</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Main Markdown View Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <MarkdownView
              content={entry.body || entry.summary || ''}
              currentEntryId={entry.id}
              onNavigate={onNavigateToEntry}
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-1.5 text-stone-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Full rules loaded directly from local archive data</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
            >
              Done Reading
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
