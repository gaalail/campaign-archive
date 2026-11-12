import React, { useState, useMemo } from 'react';
import { CharacterState, AbilityKey, AbilityMode, ABILITY_LABELS, STANDARD_ARRAY, POINT_BUY_COSTS } from './types';
import { ArchiveEntry } from '../../types/archive';
import { formatModifier, getAbilityModifier } from './builderUtils';
import { Sparkles, Plus, Minus, RotateCcw, BookOpen, Search, Check, Flame } from 'lucide-react';

interface AbilityScorePickerProps {
  state: CharacterState;
  onSetMode: (mode: AbilityMode) => void;
  onSetAbility: (ability: AbilityKey, score: number) => void;
  onSetAllAbilities: (scores: Record<AbilityKey, number>) => void;
  onSetRacialBonus: (type: 'primary' | 'secondary', ability: AbilityKey) => void;
  onSelectFeat: (featId: string | null) => void;
  onInspectEntry: (entry: ArchiveEntry) => void;
  feats: ArchiveEntry[];
}

export const AbilityScorePicker: React.FC<AbilityScorePickerProps> = ({
  state,
  onSetMode,
  onSetAbility,
  onSetAllAbilities,
  onSetRacialBonus,
  onSelectFeat,
  onInspectEntry,
  feats
}) => {
  const [featSearch, setFeatSearch] = useState('');

  const abilities: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  // Point buy calculation
  const totalPointsSpent = useMemo(() => {
    return abilities.reduce((sum, key) => {
      const score = state.baseAbilities[key] || 8;
      return sum + (POINT_BUY_COSTS[score] ?? 0);
    }, 0);
  }, [state.baseAbilities]);

  const pointsRemaining = 27 - totalPointsSpent;

  // Standard array assignment helpers
  const handleStandardArrayChange = (targetAbility: AbilityKey, newScore: number) => {
    // If another ability already had this score, swap them
    const newAbilities = { ...state.baseAbilities };
    const oldScore = newAbilities[targetAbility];

    const currentOwner = abilities.find(a => a !== targetAbility && newAbilities[a] === newScore);
    if (currentOwner) {
      newAbilities[currentOwner] = oldScore;
    }
    newAbilities[targetAbility] = newScore;
    onSetAllAbilities(newAbilities);
  };

  const handlePointBuyAdjust = (ability: AbilityKey, delta: number) => {
    const current = state.baseAbilities[ability];
    const target = current + delta;
    if (target < 8 || target > 15) return;

    const currentCost = POINT_BUY_COSTS[current] || 0;
    const targetCost = POINT_BUY_COSTS[target] || 0;
    const diff = targetCost - currentCost;

    if (diff > pointsRemaining) return; // Not enough points

    onSetAbility(ability, target);
  };

  const resetToStandard = () => {
    onSetAllAbilities({
      str: 15,
      dex: 14,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8
    });
  };

  const resetToPointBuy = () => {
    onSetAllAbilities({
      str: 8,
      dex: 8,
      con: 8,
      int: 8,
      wis: 8,
      cha: 8
    });
  };

  // Filtered feats
  const filteredFeats = useMemo(() => {
    if (!featSearch.trim()) return feats;
    const q = featSearch.toLowerCase();
    return feats.filter(f => f.title.toLowerCase().includes(q) || f.summary?.toLowerCase().includes(q));
  }, [feats, featSearch]);

  const selectedFeatEntry = useMemo(() => {
    return feats.find(f => f.id === state.featId) || null;
  }, [feats, state.featId]);

  return (
    <div className="space-y-6">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-bold text-stone-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Step 5: Ability Scores & Feats</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Determine your six core attributes and pick an optional starting or background feat.
          </p>
        </div>

        {/* Mode Buttons */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 shrink-0">
          <button
            onClick={() => {
              onSetMode('standard');
              resetToStandard();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              state.abilityMode === 'standard'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Standard Array
          </button>
          <button
            onClick={() => {
              onSetMode('pointbuy');
              resetToPointBuy();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              state.abilityMode === 'pointbuy'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Point Buy (27)
          </button>
          <button
            onClick={() => onSetMode('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              state.abilityMode === 'custom'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Custom / Manual
          </button>
        </div>
      </div>

      {/* Point Buy Status Bar */}
      {state.abilityMode === 'pointbuy' && (
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-semibold">Point Buy Pool:</span>
            <span className="text-stone-300">Scores 8 to 15</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm">
              Points Left: <strong className={pointsRemaining >= 0 ? 'text-amber-300 font-bold' : 'text-rose-400 font-bold'}>{pointsRemaining}</strong> / 27
            </span>
            <button
              onClick={resetToPointBuy}
              className="text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Ability Scores Configurator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {abilities.map((ability) => {
          const base = state.baseAbilities[ability];
          const isPrimaryBonus = state.racialBonuses.primary === ability;
          const isSecondaryBonus = state.racialBonuses.secondary === ability;
          const bonus = (isPrimaryBonus ? 2 : 0) + (isSecondaryBonus ? 1 : 0);
          const total = base + bonus;
          const mod = getAbilityModifier(total);

          return (
            <div
              key={ability}
              className="p-4 rounded-xl border border-stone-800 bg-stone-950/80 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400 font-serif">
                    {ABILITY_LABELS[ability].name}
                  </span>
                  <div className="text-[11px] text-stone-400 font-sans">
                    {ABILITY_LABELS[ability].desc}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-100">
                    Total: <strong className="text-sm text-amber-300">{total}</strong>
                  </span>
                  <div className="text-[11px] font-mono text-amber-400 font-bold">
                    {formatModifier(mod)} Mod
                  </div>
                </div>
              </div>

              {/* Mode-Specific Controls */}
              <div className="pt-2 border-t border-stone-900 flex items-center justify-between gap-2">
                <span className="text-xs text-stone-400 font-sans">Base Score:</span>

                {state.abilityMode === 'standard' && (
                  <select
                    value={base}
                    onChange={(e) => handleStandardArrayChange(ability, parseInt(e.target.value, 10))}
                    className="bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono font-bold rounded-lg px-2.5 py-1 focus:border-amber-500 focus:outline-none"
                  >
                    {STANDARD_ARRAY.map((score) => (
                      <option key={score} value={score}>
                        {score}
                      </option>
                    ))}
                  </select>
                )}

                {state.abilityMode === 'pointbuy' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePointBuyAdjust(ability, -1)}
                      disabled={base <= 8}
                      className="p-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-stone-100 text-sm w-6 text-center">
                      {base}
                    </span>
                    <button
                      onClick={() => handlePointBuyAdjust(ability, 1)}
                      disabled={base >= 15 || pointsRemaining <= 0}
                      className="p-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {state.abilityMode === 'custom' && (
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={base}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onSetAbility(ability, Math.max(1, Math.min(20, val)));
                    }}
                    className="w-16 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono font-bold rounded-lg px-2 py-1 text-center focus:border-amber-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Bonus Breakdown */}
              {bonus > 0 && (
                <div className="text-[10px] font-mono text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40 flex items-center justify-between">
                  <span>Ancestry Bonus:</span>
                  <span className="font-bold">+{bonus}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Racial / Ancestry Modifiers Selector (+2 / +1) */}
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="font-serif text-sm font-bold text-stone-100">
            Ancestry Ability Increases (+2 Primary, +1 Secondary)
          </h3>
        </div>
        <p className="text-xs text-stone-400 font-sans">
          Under flexible 5e rules, allocate +2 to your primary attribute and +1 to a secondary attribute.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-300 block">
              +2 Primary Bonus:
            </label>
            <select
              value={state.racialBonuses.primary}
              onChange={(e) => onSetRacialBonus('primary', e.target.value as AbilityKey)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs font-sans rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
            >
              {abilities.map((key) => (
                <option key={key} value={key}>
                  {ABILITY_LABELS[key].name} ({ABILITY_LABELS[key].abbr})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-300 block">
              +1 Secondary Bonus:
            </label>
            <select
              value={state.racialBonuses.secondary}
              onChange={(e) => onSetRacialBonus('secondary', e.target.value as AbilityKey)}
              className="w-full bg-stone-900 border border-stone-700 text-stone-100 text-xs font-sans rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
            >
              {abilities
                .filter((key) => key !== state.racialBonuses.primary)
                .map((key) => (
                  <option key={key} value={key}>
                    {ABILITY_LABELS[key].name} ({ABILITY_LABELS[key].abbr})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feat Selection Section */}
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-900 pb-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Optional Starting / Bonus Feat ({feats.length} available)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Select a feat granted by your background, variant ancestry, or house rules.
            </p>
          </div>

          {selectedFeatEntry && (
            <button
              onClick={() => onSelectFeat(null)}
              className="text-xs text-rose-400 hover:text-rose-200 underline font-mono shrink-0"
            >
              Clear Feat
            </button>
          )}
        </div>

        {/* Feat Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feats by name or trait..."
            value={featSearch}
            onChange={(e) => setFeatSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Feats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {filteredFeats.map((feat) => {
            const isSelected = state.featId === feat.id;
            return (
              <div
                key={feat.id}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 shadow-md'
                    : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-serif font-bold text-stone-200 text-xs truncate">
                      {feat.title}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5 shrink-0">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                  {feat.summary && (
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">
                      {feat.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 text-[10px]">
                  <button
                    onClick={() => onSelectFeat(isSelected ? null : feat.id)}
                    className={`font-semibold hover:underline ${
                      isSelected ? 'text-amber-400' : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Deselect' : 'Choose Feat'}
                  </button>

                  <button
                    onClick={() => onInspectEntry(feat)}
                    className="text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                    title="Inspect RAW feat rules"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
