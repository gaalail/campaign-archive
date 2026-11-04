import React, { useState, useEffect, useRef } from 'react';
import { archiveDb, getSourceBadgeInfo, getRarityColor } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import { Search, X, ChevronRight, Sparkles, BookOpen, Shield, Sword } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntry: (entryId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectEntry }) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for ESC and Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectEntry(results[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const results = React.useMemo(() => {
    if (!query.trim()) {
      // Suggest popular starter entries
      return archiveDb.entries
        .filter(e => e.id === 'character-builder' || e.category === 'classes' || e.category === 'campaigns')
        .slice(0, 12);
    }

    const q = query.toLowerCase().trim();
    const matches: { entry: ArchiveEntry; score: number }[] = [];

    for (const e of archiveDb.entries) {
      if (e.id.endsWith('/index') && e.id !== 'index') continue;

      let score = 0;
      const titleLower = e.title.toLowerCase();

      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 50;
      else if (titleLower.includes(q)) score += 30;

      if (e.aliases.some(a => String(a).toLowerCase().includes(q))) score += 25;
      if (e.category.toLowerCase().includes(q)) score += 15;
      if (e.summary && e.summary.toLowerCase().includes(q)) score += 10;
      if (e.tags.some(t => t.toLowerCase().includes(q))) score += 10;

      if (score > 0) {
        matches.push({ entry: e, score });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 20).map(m => m.entry);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search classes, subclasses, races, magic items, feats, rules..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm md:text-base text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 p-2 divide-y divide-slate-800/40">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No entries found matching "{query}".
            </div>
          ) : (
            results.map((entry, idx) => {
              const isSelected = idx === selectedIndex;
              const badge = getSourceBadgeInfo(entry.source_type, entry.source);

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    onSelectEntry(entry.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 shadow'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-800 text-amber-400 shrink-0 mt-0.5">
                      {entry.category === 'classes' ? <Sword className="w-4 h-4" /> :
                       entry.category === 'items' ? <Sparkles className="w-4 h-4" /> :
                       entry.category === 'rules' ? <BookOpen className="w-4 h-4" /> :
                       <Shield className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-fantasy font-bold text-slate-100 text-sm truncate">
                          {entry.title}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                          {entry.category.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {entry.summary || entry.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>ESC Close</span>
          </div>
          <span>{archiveDb.stats.totalEntries} archive entries indexed</span>
        </div>
      </div>
    </div>
  );
};
