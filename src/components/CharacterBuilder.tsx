import React, { useReducer, useState, useMemo, useEffect } from 'react';
import { archiveDb, getSubclassesForClass, getEntryById } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import { characterReducer } from './character-builder/characterReducer';
import { INITIAL_CHARACTER_STATE, CharacterState } from './character-builder/types';
import { calculateDerivedStats } from './character-builder/builderUtils';
import { CharacterHud } from './character-builder/CharacterHud';
import { RuleInspectorDrawer } from './character-builder/RuleInspectorDrawer';
import { AbilityScorePicker } from './character-builder/AbilityScorePicker';
import { InteractiveCharacterSheet } from './character-builder/InteractiveCharacterSheet';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LOCAL_STORAGE_KEY = 'gothic_codex_character_builder_state_v2';

interface CharacterBuilderProps {
  onNavigateToEntry: (id: string) => void;
  initialParams?: Record<string, string>;
}

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ onNavigateToEntry, initialParams }) => {
  const [state, dispatch] = useReducer(characterReducer, INITIAL_CHARACTER_STATE);

  // Inspector Drawer state
  const [inspectedEntry, setInspectedEntry] = useState<ArchiveEntry | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Search filters per step
  const [raceSearch, setRaceSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [subclassSearch, setSubclassSearch] = useState('');
  const [backgroundSearch, setBackgroundSearch] = useState('');

  // 1. Restore from URL Hash or LocalStorage on mount
  useEffect(() => {
    try {
      const hash = window.location.hash;
      const buildMatch = hash.match(/build=([A-Za-z0-9+/=_-]+)/);
      if (buildMatch) {
        const decoded = decodeURIComponent(atob(buildMatch[1]));
        const parsed = JSON.parse(decoded);
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            ...INITIAL_CHARACTER_STATE,
            name: parsed.name || INITIAL_CHARACTER_STATE.name,
            genderOrTitle: parsed.title || INITIAL_CHARACTER_STATE.genderOrTitle,
            alignment: parsed.alignment || INITIAL_CHARACTER_STATE.alignment,
            raceId: parsed.race || null,
            classId: parsed.class || null,
            subclassId: parsed.subclass || null,
            backgroundId: parsed.background || null,
            featId: parsed.feat || null,
            baseAbilities: parsed.abilities || INITIAL_CHARACTER_STATE.baseAbilities,
            racialBonuses: parsed.racialBonuses || INITIAL_CHARACTER_STATE.racialBonuses,
            selectedSkills: parsed.skills || INITIAL_CHARACTER_STATE.selectedSkills,
            customArmor: parsed.armor || INITIAL_CHARACTER_STATE.customArmor,
            shieldEquipped: parsed.shield ?? INITIAL_CHARACTER_STATE.shieldEquipped,
            notes: parsed.notes || '',
            step: 6
          }
        });
        return;
      }

      // If initialParams provided from navigation (e.g. builder?class=Paladin), apply them
      if (initialParams && Object.keys(initialParams).length > 0) {
        if (initialParams.subclass) {
          const sub = getEntryById(initialParams.subclass);
          if (sub) {
            const parent = sub.parentClass || sub.subcategory;
            const parentClassEntry = parent ? getEntryById(`character-options/classes/${parent}`) : null;
            if (parentClassEntry) {
              dispatch({ type: 'SELECT_CLASS', payload: parentClassEntry.id });
            }
            dispatch({ type: 'SELECT_SUBCLASS', payload: sub.id });
            dispatch({ type: 'SET_STEP', payload: 3 });
            return;
          }
        }

        if (initialParams.class) {
          const cls = getEntryById(initialParams.class);
          if (cls) {
            dispatch({ type: 'SELECT_CLASS', payload: cls.id });
            dispatch({ type: 'SET_STEP', payload: 3 });
            return;
          }
        }

        if (initialParams.race) {
          const r = getEntryById(initialParams.race);
          if (r) {
            dispatch({ type: 'SELECT_RACE', payload: r.id });
            dispatch({ type: 'SET_STEP', payload: 2 });
            return;
          }
        }

        if (initialParams.background) {
          const bg = getEntryById(initialParams.background);
          if (bg) {
            dispatch({ type: 'SELECT_BACKGROUND', payload: bg.id });
            dispatch({ type: 'SET_STEP', payload: 4 });
            return;
          }
        }

        if (initialParams.feat) {
          const f = getEntryById(initialParams.feat);
          if (f) {
            dispatch({ type: 'SELECT_FEAT', payload: f.id });
            dispatch({ type: 'SET_STEP', payload: 5 });
            return;
          }
        }
      }

      // If no URL hash build, check local storage
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        if (parsedState && typeof parsedState === 'object') {
          dispatch({ type: 'LOAD_STATE', payload: parsedState });
        }
      }
    } catch {
      // Storage parsing failure, fallback to initial state
    }
  }, [initialParams]);

  // 2. Auto-save to LocalStorage on every state update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  // Archive data collections
  const races = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'races' && !e.id.endsWith('/index'))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const classes = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'classes' && !e.id.endsWith('/index'))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const backgrounds = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'backgrounds' && !e.id.endsWith('/index'))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const feats = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'feats' || e.id.startsWith('character-options/feats/'))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  // Selected entry lookups
  const selectedRace = useMemo(() => {
    return races.find(r => r.id === state.raceId) || null;
  }, [races, state.raceId]);

  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === state.classId) || null;
  }, [classes, state.classId]);

  const subclasses = useMemo(() => {
    if (!selectedClass) return [];
    return getSubclassesForClass(selectedClass.title).sort((a, b) => a.title.localeCompare(b.title));
  }, [selectedClass]);

  const selectedSubclass = useMemo(() => {
    return subclasses.find(s => s.id === state.subclassId) || null;
  }, [subclasses, state.subclassId]);

  const selectedBackground = useMemo(() => {
    return backgrounds.find(b => b.id === state.backgroundId) || null;
  }, [backgrounds, state.backgroundId]);

  const selectedFeat = useMemo(() => {
    return feats.find(f => f.id === state.featId) || null;
  }, [feats, state.featId]);

  // Derived stats live calculation
  const derived = useMemo(() => {
    return calculateDerivedStats(state, selectedRace, selectedClass);
  }, [state, selectedRace, selectedClass]);

  // Filtered queries
  const filteredRaces = useMemo(() => {
    if (!raceSearch.trim()) return races;
    const q = raceSearch.toLowerCase();
    return races.filter(r => r.title.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q));
  }, [races, raceSearch]);

  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return classes;
    const q = classSearch.toLowerCase();
    return classes.filter(c => c.title.toLowerCase().includes(q) || c.summary?.toLowerCase().includes(q));
  }, [classes, classSearch]);

  const filteredSubclasses = useMemo(() => {
    if (!subclassSearch.trim()) return subclasses;
    const q = subclassSearch.toLowerCase();
    return subclasses.filter(s => s.title.toLowerCase().includes(q) || s.summary?.toLowerCase().includes(q));
  }, [subclasses, subclassSearch]);

  const filteredBackgrounds = useMemo(() => {
    if (!backgroundSearch.trim()) return backgrounds;
    const q = backgroundSearch.toLowerCase();
    return backgrounds.filter(b => b.title.toLowerCase().includes(q) || b.summary?.toLowerCase().includes(q));
  }, [backgrounds, backgroundSearch]);

  const openInspector = (entry: ArchiveEntry) => {
    setInspectedEntry(entry);
    setIsInspectorOpen(true);
  };

  const handleFinishToSheet = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    dispatch({ type: 'SET_STEP', payload: 6 });
  };

  const stepsList = [
    { num: 1, label: 'Ancestry' },
    { num: 2, label: 'Class' },
    { num: 3, label: 'Archetype' },
    { num: 4, label: 'Background' },
    { num: 5, label: 'Abilities' },
    { num: 6, label: 'Sheet' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Step Progress Tracker */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5 font-serif">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gothic Compendium Character Builder</span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-100">
              Hero Creator & Armory
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
              Step {state.step} of 6
            </span>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 text-xs transition-colors"
              title="Reset builder"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="grid grid-cols-6 gap-1.5 md:gap-2 text-center text-xs">
          {stepsList.map(s => {
            const isCurrent = state.step === s.num;
            const isCompleted = state.step > s.num;

            return (
              <button
                key={s.num}
                onClick={() => dispatch({ type: 'SET_STEP', payload: s.num })}
                className={`py-2 px-1 rounded-xl font-medium transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-lg ring-1 ring-amber-400'
                    : isCompleted
                    ? 'bg-stone-950 text-stone-300 hover:text-white border border-stone-800 hover:border-amber-900/60'
                    : 'text-stone-500 bg-stone-950/40 border border-stone-900 hover:text-stone-300'
                }`}
              >
                <span className="text-[10px] font-mono opacity-80">0{s.num}</span>
                <span className="truncate w-full font-serif text-[11px] md:text-xs">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating / Sticky Live-Calc HUD (Visible on Steps 1 - 5) */}
      {state.step < 6 && (
        <CharacterHud
          state={state}
          selectedRace={selectedRace}
          selectedClass={selectedClass}
          selectedSubclass={selectedSubclass}
          selectedBackground={selectedBackground}
          derived={derived}
          onJumpToStep={(s) => dispatch({ type: 'SET_STEP', payload: s })}
        />
      )}

      {/* Step 1: Ancestry & Race */}
      {state.step === 1 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-100">Step 1: Choose Ancestry / Race</h2>
              <p className="text-xs text-stone-400">
                Pick your lineage to gain innate traits, movement speed, and physical abilities.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ancestry..."
                value={raceSearch}
                onChange={(e) => setRaceSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredRaces.map(r => {
              const isSelected = selectedRace?.id === r.id;
              return (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 shadow-md'
                      : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="font-serif font-bold text-stone-200 text-sm truncate">{r.title}</div>
                      {isSelected && (
                        <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </span>
                      )}
                    </div>
                    {r.summary && <div className="text-xs text-stone-400 mt-1 line-clamp-2">{r.summary}</div>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-900 text-xs">
                    <button
                      onClick={() => dispatch({ type: 'SELECT_RACE', payload: r.id })}
                      className={`font-semibold hover:underline cursor-pointer ${
                        isSelected ? 'text-amber-400' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Choose Race'}
                    </button>

                    <button
                      onClick={() => openInspector(r)}
                      className="text-stone-400 hover:text-amber-300 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                      title="Inspect full ancestry traits in rulebook"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-800">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
              disabled={!selectedRace}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedRace
                  ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow font-bold'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Class</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Class */}
      {state.step === 2 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-100">Step 2: Choose Your Class</h2>
              <p className="text-xs text-stone-400">
                Your class determines your combat prowess, hit die, saving throws, and magic.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search classes..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredClasses.map(c => {
              const isSelected = selectedClass?.id === c.id;
              return (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 shadow-md'
                      : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-serif font-bold text-stone-200 text-sm truncate">{c.title}</span>
                      {c.hit_die && (
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-900 px-1.5 py-0.5 rounded font-bold shrink-0">
                          {c.hit_die}
                        </span>
                      )}
                    </div>
                    {c.summary && <div className="text-xs text-stone-400 mt-1 line-clamp-2">{c.summary}</div>}
                    {c.saving_throws && c.saving_throws.length > 0 && (
                      <div className="text-[10px] text-stone-500 font-mono mt-1.5">
                        Saves: {c.saving_throws.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-900 text-xs">
                    <button
                      onClick={() => dispatch({ type: 'SELECT_CLASS', payload: c.id })}
                      className={`font-semibold hover:underline cursor-pointer ${
                        isSelected ? 'text-amber-400' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Choose Class'}
                    </button>

                    <button
                      onClick={() => openInspector(c)}
                      className="text-stone-400 hover:text-amber-300 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                      title="Inspect full class features & spell progression in rulebook"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-stone-800">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
              className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
              disabled={!selectedClass}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedClass
                  ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow font-bold'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Archetype</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Pick Subclass */}
      {state.step === 3 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-100">Step 3: Archetype / Subclass</h2>
              <p className="text-xs text-stone-400">
                Specializations, Sacred Oaths, and Paths for {selectedClass?.title || 'your class'}.
              </p>
            </div>

            {subclasses.length > 4 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter archetypes..."
                  value={subclassSearch}
                  onChange={(e) => setSubclassSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {subclasses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredSubclasses.map(sub => {
                const isSelected = selectedSubclass?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 shadow-md'
                        : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-serif font-bold text-stone-200 text-sm">{sub.title}</div>
                        {isSelected && (
                          <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5 shrink-0">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                      {sub.summary && <div className="text-xs text-stone-400 mt-1 line-clamp-2">{sub.summary}</div>}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-900 text-xs">
                      <button
                        onClick={() => dispatch({ type: 'SELECT_SUBCLASS', payload: isSelected ? null : sub.id })}
                        className={`font-semibold hover:underline cursor-pointer ${
                          isSelected ? 'text-amber-400' : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Choose Archetype'}
                      </button>

                      <button
                        onClick={() => openInspector(sub)}
                        className="text-stone-400 hover:text-amber-300 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                        title="Read tenets, archetype spells, and mechanics in rulebook"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Inspect Tenets & Rules</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-stone-400 rounded-xl bg-stone-950 border border-stone-800 text-xs">
              No specific archetype required at 1st level for {selectedClass?.title || 'this class'}. You can proceed to Background.
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-stone-800">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
              className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 shadow font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Background</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pick Background */}
      {state.step === 4 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-100">Step 4: Choose Background</h2>
              <p className="text-xs text-stone-400">
                Your character's upbringing, cultural roots, narrative features, and skill proficiencies.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search backgrounds..."
                value={backgroundSearch}
                onChange={(e) => setBackgroundSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredBackgrounds.map(b => {
              const isSelected = selectedBackground?.id === b.id;
              return (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 shadow-md'
                      : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="font-serif font-bold text-stone-200 text-sm truncate">{b.title}</div>
                      {isSelected && (
                        <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </span>
                      )}
                    </div>
                    {b.summary && <div className="text-xs text-stone-400 mt-1 line-clamp-2">{b.summary}</div>}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-900 text-xs">
                    <button
                      onClick={() => dispatch({ type: 'SELECT_BACKGROUND', payload: b.id })}
                      className={`font-semibold hover:underline cursor-pointer ${
                        isSelected ? 'text-amber-400' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Choose Background'}
                    </button>

                    <button
                      onClick={() => openInspector(b)}
                      className="text-stone-400 hover:text-amber-300 flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                      title="Inspect background narrative features"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-stone-800">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
              className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}
              disabled={!selectedBackground}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedBackground
                  ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow font-bold'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Abilities & Feats</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Ability Scores & Feats */}
      {state.step === 5 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-6">
          <AbilityScorePicker
            state={state}
            onSetMode={(mode) => dispatch({ type: 'SET_ABILITY_MODE', payload: mode })}
            onSetAbility={(ability, score) => dispatch({ type: 'SET_BASE_ABILITY', payload: { ability, score } })}
            onSetAllAbilities={(scores) => dispatch({ type: 'SET_ALL_BASE_ABILITIES', payload: scores })}
            onSetRacialBonus={(type, ability) => dispatch({ type: 'SET_RACIAL_BONUS', payload: { type, ability } })}
            onSelectFeat={(featId) => dispatch({ type: 'SELECT_FEAT', payload: featId })}
            onInspectEntry={openInspector}
            feats={feats}
          />

          <div className="flex justify-between pt-4 border-t border-stone-800">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
              className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white cursor-pointer"
            >
              Back to Background
            </button>
            <button
              onClick={handleFinishToSheet}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Generate Interactive Character Sheet</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Final Interactive Sheet & Armory */}
      {state.step === 6 && (
        <InteractiveCharacterSheet
          state={state}
          selectedRace={selectedRace}
          selectedClass={selectedClass}
          selectedSubclass={selectedSubclass}
          selectedBackground={selectedBackground}
          selectedFeat={selectedFeat}
          derived={derived}
          onSetName={(name) => dispatch({ type: 'SET_NAME', payload: name })}
          onSetGenderOrTitle={(title) => dispatch({ type: 'SET_GENDER_OR_TITLE', payload: title })}
          onSetAlignment={(align) => dispatch({ type: 'SET_ALIGNMENT', payload: align })}
          onToggleSkill={(skill) => dispatch({ type: 'TOGGLE_SKILL', payload: skill })}
          onSetArmor={(armor) => dispatch({ type: 'SET_ARMOR', payload: armor })}
          onToggleShield={() => dispatch({ type: 'TOGGLE_SHIELD' })}
          onSetNotes={(notes) => dispatch({ type: 'SET_NOTES', payload: notes })}
          onAddAttack={(atk) => dispatch({ type: 'ADD_ATTACK', payload: atk })}
          onRemoveAttack={(id) => dispatch({ type: 'REMOVE_ATTACK', payload: id })}
          onInspectEntry={openInspector}
          onReset={() => dispatch({ type: 'RESET' })}
        />
      )}

      {/* Rulebook Side Drawer Inspector */}
      <RuleInspectorDrawer
        entry={inspectedEntry}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onSelectOption={(entry) => {
          if (entry.category === 'races') dispatch({ type: 'SELECT_RACE', payload: entry.id });
          else if (entry.category === 'classes') dispatch({ type: 'SELECT_CLASS', payload: entry.id });
          else if (entry.category === 'subclasses') dispatch({ type: 'SELECT_SUBCLASS', payload: entry.id });
          else if (entry.category === 'backgrounds') dispatch({ type: 'SELECT_BACKGROUND', payload: entry.id });
          else if (entry.category === 'feats') dispatch({ type: 'SELECT_FEAT', payload: entry.id });
          setIsInspectorOpen(false);
        }}
        isSelected={
          inspectedEntry
            ? inspectedEntry.id === state.raceId ||
              inspectedEntry.id === state.classId ||
              inspectedEntry.id === state.subclassId ||
              inspectedEntry.id === state.backgroundId ||
              inspectedEntry.id === state.featId
            : false
        }
        onNavigateToEntry={onNavigateToEntry}
      />

    </div>
  );
};
