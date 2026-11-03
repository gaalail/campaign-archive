import React, { useState, useMemo } from 'react';
import { archiveDb, getRarityColor, getSourceBadgeInfo } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import { Search, Filter, Shield, Sparkles, LayoutGrid, List } from 'lucide-react';

interface ItemCatalogueProps {
  onSelectItem: (itemId: string) => void;
}

export const ItemCatalogue: React.FC<ItemCatalogueProps> = ({ onSelectItem }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedAttunement, setSelectedAttunement] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const allItems = useMemo(() => {
    return archiveDb.entries.filter(e => e.category === 'items' && !e.id.endsWith('/index'));
  }, []);

  const itemTypes = useMemo(() => {
    const types = new Set<string>();
    for (const item of allItems) {
      if (item.subcategory) types.add(item.subcategory);
    }
    return Array.from(types).sort();
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (selectedType !== 'all' && item.subcategory !== selectedType) return false;

      if (selectedRarity !== 'all') {
        const r = (item.rarity || '').toLowerCase();
        if (selectedRarity === 'common' && (r !== 'common' || r.includes('uncommon'))) return false;
        if (selectedRarity === 'uncommon' && !r.includes('uncommon')) return false;
        if (selectedRarity === 'rare' && (r.includes('very') || !r.includes('rare'))) return false;
        if (selectedRarity === 'very-rare' && !r.includes('very rare')) return false;
        if (selectedRarity === 'legendary' && !r.includes('legendary') && !r.includes('artifact')) return false;
      }

      if (selectedAttunement === 'yes' && !item.attunement) return false;
      if (selectedAttunement === 'no' && item.attunement) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.summary.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [allItems, selectedType, selectedRarity, selectedAttunement, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Catalogue Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Magic Items & Equipment Archive</span>
            </div>
            <h1 className="font-fantasy text-2xl md:text-3xl font-bold text-slate-100">
              Items Compendium
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Item Category Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 capitalize"
            >
              <option value="all">All Item Types ({allItems.length})</option>
              {itemTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="very-rare">Very Rare</option>
              <option value="legendary">Legendary / Artifact</option>
            </select>
          </div>

          {/* Attunement Filter */}
          <div>
            <select
              value={selectedAttunement}
              onChange={(e) => setSelectedAttunement(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="all">Attunement: Any</option>
              <option value="yes">Requires Attunement</option>
              <option value="no">No Attunement</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Showing {filteredItems.length} of {allItems.length} magic items</span>
          {(selectedType !== 'all' || selectedRarity !== 'all' || selectedAttunement !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedRarity('all');
                setSelectedAttunement('all');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-200 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const rarityBadge = getRarityColor(item.rarity);
            const sourceBadge = getSourceBadgeInfo(item.source_type, item.source);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item.id)}
                className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/50 p-5 rounded-2xl cursor-pointer transition-all duration-200 shadow-md group space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-fantasy font-bold text-slate-100 group-hover:text-amber-300 transition-colors text-base">
                      {item.title}
                    </h3>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">
                      {item.subcategory}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {item.summary || 'Click to view magic item description and mechanics.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${rarityBadge.bg} ${rarityBadge.text} ${rarityBadge.border}`}
                    >
                      {item.rarity || 'Common'}
                    </span>
                    {item.attunement && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        Attune
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-medium ${sourceBadge.text}`}>
                    {sourceBadge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/70 text-slate-300 font-semibold border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Rarity</th>
                <th className="px-4 py-3">Attunement</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map(item => {
                const rarityBadge = getRarityColor(item.rarity);
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item.id)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-fantasy font-bold text-amber-300 whitespace-nowrap">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {item.subcategory}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${rarityBadge.bg} ${rarityBadge.text} ${rarityBadge.border}`}>
                        {item.rarity || 'Common'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {item.attunement ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {item.source || item.source_type}
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                      {item.summary}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
