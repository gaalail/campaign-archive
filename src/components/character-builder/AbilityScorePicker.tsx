import React, { useState, useMemo } from 'react';
import { CharacterState, AbilityKey, AbilityMode, ABILITY_LABELS, STANDARD_ARRAY, POINT_BUY_COSTS } from './types';
import { ArchiveEntry } from '../../types/archive';
import { DerivedStats, formatModifier, getAbilityModifier } from './builderUtils';
import { checkFeatPrerequisite, getFeatMetadata } from './rulesEngine';
import { Sparkles, Plus, Minus, RotateCcw, BookOpen, Search, Check, Flame, AlertTriangle } from 'lucide-react';

interface AbilityScorePickerProps {
  state: CharacterState;
  derived: DerivedStats;
  selectedRace: ArchiveEntry | null;
  selectedClass: ArchiveEntry | null;
  onSetMode: (mode: AbilityMode) => void;
  onSetAsiSystem: (sys: 'racial' | 'flexible') => void;
  onSetAbility: (ability: AbilityKey, score: number) => void;
  onSetAllAbilities: (scores: Record<AbilityKey, number>) => void;
  onSetRacialBonus: (type: 'primary' | 'secondary', ability: AbilityKey) => void;
  onSetRacialChoiceAbilities: (abilities: AbilityKey[]) => void;
  onSetFeatAbilityChoice: (featId: string, ability: AbilityKey) => void;
  onToggleFeat: (featId: string) => void;
  onClearFeats: () => void;
  onInspectEntry: (entry: ArchiveEntry) => void;
  feats: ArchiveEntry[];
}

export const AbilityScorePicker: React.FC<AbilityScorePickerProps> = ({
  state,
  derived,
  selectedRace,
  selectedClass,
  onSetMode,
  onSetAsiSystem,
  onSetAbility,
  onSetAllAbilities,
  onSetRacialBonus,
  onSetRacialChoiceAbilities,
  onSetFeatAbilityChoice,
  onToggleFeat,
  onClearFeats,
  onInspectEntry,
  feats
}) => {
  const [featSearch, setFeatSearch] = useState('');

  const abilities: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const { rules } = derived;

  // Point buy calculation
  const totalPointsSpent = useMemo(() => {
    return abilities.reduce((sum, key) => {
      const score = state.baseAbilities[key] || 8;
      return sum + (POINT_BUY_COSTS[score] ?? 0);
    }, 0);
  }, [state.baseAbilities]);

  const pointsRemaining = 27 - totalPointsSpent;

  const handleStandardArrayChange = (targetAbility: AbilityKey, newScore: number) => {
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
    if (targetCost - currentCost > pointsRemaining) return;

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

  const toggleRacialChoiceAbility = (ab: AbilityKey) => {
    const spec = rules.raceProfile.asiChoice;
    if (!spec) return;
    const current = (state.racialChoiceAbilities || []).filter(k => spec.allowed.includes(k));
    if (current.includes(ab)) {
      onSetRacialChoiceAbilities(current.filter(k => k !== ab));
    } else if (current.length < spec.count) {
      onSetRacialChoiceAbilities([...current, ab]);
    } else {
      onSetRacialChoiceAbilities([...current.slice(1), ab]);
    }
  };

  // Filtered feats
  const filteredFeats = useMemo(() => {
    if (!featSearch.trim()) return feats;
    const q = featSearch.toLowerCase();
    return feats.filter(
      f =>
        f.title.toLowerCase().includes(q) ||
        f.summary?.toLowerCase().includes(q) ||
        f.prerequisite?.toLowerCase().includes(q)
    );
  }, [feats, featSearch]);

  const selectedFeatEntries = useMemo(() => {
    return feats.filter(f => state.selectedFeatIds.includes(f.id));
  }, [feats, state.selectedFeatIds]);

  const featsWithChoiceAsi = useMemo(() => {
    return selectedFeatEntries
      .map(feat => ({ feat, meta: getFeatMetadata(feat) }))
      .filter(item => Boolean(item.meta.asiChoice));
  }, [selectedFeatEntries]);

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-bold text-stone-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Step 5: Ability Scores &amp; Feats</span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Racial and Feat ASIs apply automatically. At Level {state.level}, your class
            {rules.raceProfile.grantsBonusFeat > 0 ? ' + Variant Human' : ''} grants{' '}
            <strong className="text-amber-300">{derived.asiCount}</strong> ASI / Feat milestone{derived.asiCount === 1 ? '' : 's'}.
          </p>
        </div>

        {/* Mode Buttons */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 shrink-0">
          <button
            onClick={() => {
              onSetMode('standard');
              resetToStandard();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              state.abilityMode === 'pointbuy'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Point Buy (27)
          </button>
          <button
            onClick={() => onSetMode('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
              Points Left:{' '}
              <strong className={pointsRemaining >= 0 ? 'text-amber-300 font-bold' : 'text-rose-400 font-bold'}>
                {pointsRemaining}
              </strong>{' '}
              / 27
            </span>
            <button
              onClick={resetToPointBuy}
              className="text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1 cursor-pointer"
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
          const racialBonus = rules.abilityBonuses.racial[ability] || 0;
          const featBonus = rules.abilityBonuses.feats[ability] || 0;
          const total = derived.finalAbilities[ability];
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
                      className="p-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-stone-100 text-sm w-6 text-center">
                      {base}
                    </span>
                    <button
                      onClick={() => handlePointBuyAdjust(ability, 1)}
                      disabled={base >= 15 || pointsRemaining <= 0}
                      className="p-1 rounded bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {state.abilityMode === 'custom' && (
                  <input
                    type="number"
                    min={3}
                    max={30}
                    value={base}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) onSetAbility(ability, Math.max(1, Math.min(30, val)));
                    }}
                    className="w-16 bg-stone-900 border border-stone-700 text-stone-100 text-xs font-mono font-bold rounded-lg px-2 py-1 text-center focus:border-amber-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Automated Bonus Breakdown */}
              {(racialBonus > 0 || featBonus > 0) && (
                <div className="space-y-1">
                  {racialBonus > 0 && (
                    <div className="text-[10px] font-mono text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40 flex items-center justify-between">
                      <span>
                        {state.asiSystem === 'flexible'
                          ? 'Flexible Ancestry:'
                          : `${selectedRace?.title || 'Ancestry'}${rules.raceProfile.activeSubrace ? ` (${rules.raceProfile.activeSubrace.name})` : ''}:`}
                      </span>
                      <span className="font-bold">+{racialBonus}</span>
                    </div>
                  )}
                  {featBonus > 0 && (
                    <div className="text-[10px] font-mono text-emerald-300/90 bg-emerald-950/35 px-2 py-0.5 rounded border border-emerald-900/40 flex items-center justify-between">
                      <span>Feats Bonus:</span>
                      <span className="font-bold">+{featBonus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Racial / Ancestry Modifiers Panel */}
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-serif text-sm font-bold text-stone-100">
                Ancestry Ability Increases ({selectedRace?.title || 'No Race Selected'})
              </h3>
              <p className="text-[11px] text-stone-400 font-sans">
                {state.asiSystem === 'racial'
                  ? 'Automatically applying exact archive racial + subrace bonuses.'
                  : 'Custom override active: assign +2 Primary and +1 Secondary anywhere.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800 shrink-0 text-[11px]">
            <button
              onClick={() => onSetAsiSystem('racial')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                state.asiSystem === 'racial'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Race Archive ASIs
            </button>
            <button
              onClick={() => onSetAsiSystem('flexible')}
              className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                state.asiSystem === 'flexible'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Flexible (+2 / +1)
            </button>
          </div>
        </div>

        {state.asiSystem === 'racial' ? (
          <div className="space-y-3 pt-1">
            {!selectedRace ? (
              <div className="text-xs text-stone-500 italic">
                Select a race in Step 1 to automatically apply its Ancestry bonuses.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {abilities
                    .filter((ab) => (rules.raceProfile.fixedAsi[ab] || 0) > 0)
                    .map((ab) => (
                      <span
                        key={ab}
                        className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 font-bold"
                      >
                        +{rules.raceProfile.fixedAsi[ab]} {ABILITY_LABELS[ab].abbr} (Fixed)
                      </span>
                    ))}
                </div>

                {rules.raceProfile.asiChoice && (
                  <div className="p-3 rounded-xl bg-stone-900/70 border border-amber-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-200">
                        {rules.raceProfile.asiChoice.label}
                      </span>
                      <span className="font-mono text-[11px] text-amber-400">
                        {(state.racialChoiceAbilities || []).filter((a) =>
                          rules.raceProfile.asiChoice!.allowed.includes(a)
                        ).length}{' '}
                        / {rules.raceProfile.asiChoice.count} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rules.raceProfile.asiChoice.allowed.map((ab) => {
                        const active = (state.racialChoiceAbilities || []).includes(ab);
                        return (
                          <button
                            key={ab}
                            onClick={() => toggleRacialChoiceAbility(ab)}
                            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                              active
                                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow'
                                : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-700'
                            }`}
                          >
                            +{rules.raceProfile.asiChoice!.amount} {ABILITY_LABELS[ab].abbr}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-300 block">+2 Primary Bonus:</label>
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
              <label className="text-xs font-medium text-stone-300 block">+1 Secondary Bonus:</label>
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
        )}
      </div>

      {/* Multi-Feat Selection Section */}
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-900 pb-3">
          <div>
            <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Feats &amp; Origin Talents ({selectedFeatEntries.length} selected · {feats.length} available)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Half-feat ability bonuses, speeds, skills, saves, and AC modifiers apply automatically.
            </p>
          </div>

          {selectedFeatEntries.length > 0 && (
            <button
              onClick={onClearFeats}
              className="text-xs text-rose-400 hover:text-rose-200 underline font-mono shrink-0 cursor-pointer"
            >
              Clear All ({selectedFeatEntries.length})
            </button>
          )}
        </div>

        {/* Selected Feat Chips */}
        {selectedFeatEntries.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {selectedFeatEntries.map(f => {
                const warn = rules.featPrereqWarnings[f.id];
                return (
                  <span
                    key={f.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-serif ${
                      warn
                        ? 'bg-rose-950/50 border-rose-700/70 text-rose-200'
                        : 'bg-amber-950/60 border-amber-700/70 text-amber-200'
                    }`}
                  >
                    <span>{f.title}</span>
                    {warn && (
                      <span className="text-[10px] font-mono text-rose-300" title={warn}>
                        ({warn})
                      </span>
                    )}
                    <button
                      onClick={() => onToggleFeat(f.id)}
                      className="text-amber-400 hover:text-white text-xs font-mono cursor-pointer"
                      title={`Remove ${f.title}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            {/* Choice ASI pickers for selected feats that grant +1 choice */}
            {featsWithChoiceAsi.map(({ feat, meta }) => {
              const choice = meta.asiChoice!;
              const picked = state.featAbilityChoices?.[feat.id];
              return (
                <div
                  key={`asi_${feat.id}`}
                  className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <span className="text-emerald-200 font-semibold">
                    {feat.title}: {choice.label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {choice.allowed.map(ab => (
                      <button
                        key={ab}
                        onClick={() => onSetFeatAbilityChoice(feat.id, ab)}
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border cursor-pointer ${
                          picked === ab
                            ? 'bg-emerald-500 text-stone-950 border-emerald-400'
                            : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-emerald-700'
                        }`}
                      >
                        +1 {ABILITY_LABELS[ab].abbr}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feat Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feats by name, trait, or prerequisite..."
            value={featSearch}
            onChange={(e) => setFeatSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Feats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredFeats.map((feat) => {
            const isSelected = state.selectedFeatIds.includes(feat.id);
            const meta = getFeatMetadata(feat);
            const prereqStatus = checkFeatPrerequisite(
              feat,
              derived.finalAbilities,
              selectedRace?.title || '',
              selectedClass?.title || '',
              rules.effectiveSkills,
              rules.classProg.hasSpellcastingAtLevel
            );

            // Brief automation badge label
            const autoBadges: string[] = [];
            if (meta.fixedAsi) {
              Object.entries(meta.fixedAsi).forEach(([k, v]) =>
                autoBadges.push(`+${v} ${k.toUpperCase()}`)
              );
            }
            if (meta.asiChoice) autoBadges.push(meta.asiChoice.label);
            if (meta.flySpeed) autoBadges.push(`Fly ${meta.flySpeed} ft.`);
            if (meta.overrideFlySpeed) autoBadges.push(`Fly ${meta.overrideFlySpeed} ft.`);
            if (meta.swimSpeed) autoBadges.push(`Swim ${meta.swimSpeed} ft.`);
            if (meta.fixedSkills) autoBadges.push(meta.fixedSkills.join(', '));
            if (meta.allSavesBonus) autoBadges.push(`+${meta.allSavesBonus} Saves`);
            if (meta.hardyPhysique) autoBadges.push('CON Armor AC');
            if (meta.martialArtist) autoBadges.push('10+STR+DEX AC');

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

                  {feat.prerequisite && (
                    <div
                      className={`text-[10px] font-mono mt-0.5 flex items-center gap-1 truncate ${
                        prereqStatus.met ? 'text-stone-400' : 'text-rose-400'
                      }`}
                    >
                      {!prereqStatus.met && <AlertTriangle className="w-2.5 h-2.5 shrink-0" />}
                      <span className="truncate">Prereq: {feat.prerequisite}</span>
                    </div>
                  )}

                  {autoBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {autoBadges.map((b, idx) => (
                        <span
                          key={idx}
                          className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-900/50"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {feat.summary && (
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">
                      {feat.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 text-[10px]">
                  <button
                    onClick={() => onToggleFeat(feat.id)}
                    className={`font-semibold hover:underline cursor-pointer ${
                      isSelected ? 'text-amber-400' : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Remove Feat' : 'Add Feat'}
                  </button>

                  <button
                    onClick={() => onInspectEntry(feat)}
                    className="text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
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
