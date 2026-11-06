import React, { useState, useMemo } from 'react';
import { archiveDb, getRarityColor, getSourceBadgeInfo } from '../utils/archiveUtils';
import { Search, Sparkles, Filter, ChevronRight, Shield, Swords, Layers, ExternalLink } from 'lucide-react';

interface ItemCatalogueProps {
  onSelectItem: (id: string) => void;
}

export const ItemCatalogue: React.FC<ItemCatalogueProps> = ({ onSelectItem }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [attunementOnly, setAttunementOnly] = useState<boolean>(false);

  const allItems = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'items' && !e.id.endsWith('/index'))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of allItems) {
      if (item.subcategory) set.add(item.subcategory);
    }
    return Array.from(set).sort();
  }, [allItems]);

  const rarities = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (selectedCategory !== 'all' && item.subcategory?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedRarity !== 'all' && item.rarity?.toLowerCase() !== selectedRarity.toLowerCase()) {
        return false;
      }
      if (attunementOnly && !item.attunement) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.summary?.toLowerCase().includes(q);
        const matchesCategory = item.subcategory?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesCategory) return false;
      }
      return true;
    });
  }, [allItems, selectedCategory, selectedRarity, attunementOnly, search]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>5e Armory & Vault</span>
            </div>
            <h1 className="font-fantasy text-3xl md:text-4xl font-bold text-slate-100">
              Magic Items Compendium
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Browse {allItems.length} magical weapons, enchanted armors, rings, scrolls, potions, and wondrous relics.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-300">
              Showing <span className="font-bold text-slate-100">{filteredItems.length}</span> items
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search items by name, properties, effects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Categories ({allItems.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Rarity Dropdown */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">All Rarities</option>
            {rarities.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Attunement Checkbox Button */}
          <button
            onClick={() => setAttunementOnly(!attunementOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              attunementOnly
                ? 'bg-purple-950/80 border-purple-500/60 text-purple-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Attunement Only</span>
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredItems.map(item => {
          const rarity = item.rarity ? getRarityColor(item.rarity) : null;
          const badge = getSourceBadgeInfo(item.source_type, item.source);

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className="group p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-fantasy font-bold text-slate-100 group-hover:text-amber-300 transition-colors text-base">
                    {item.title}
                  </h3>
                  {rarity ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${rarity.bg} ${rarity.text} ${rarity.border} shrink-0`}>
                      {item.rarity}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-800 text-slate-300 border-slate-700 shrink-0">
                      Standard
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span className="capitalize">{item.subcategory || item.item_type || 'Item'}</span>
                  {item.attunement && (
                    <>
                      <span>•</span>
                      <span className="text-purple-400 font-medium">Attunement</span>
                    </>
                  )}
                </div>

                {item.summary && (
                  <p className="text-xs text-slate-300 line-clamp-3 mt-2 leading-relaxed">
                    {item.summary}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>{badge.label}</span>
                <span className="text-amber-400 group-hover:text-amber-300 font-medium flex items-center gap-0.5">
                  View Item <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 rounded-xl border border-slate-800 bg-slate-900/30">
            No magic items found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
