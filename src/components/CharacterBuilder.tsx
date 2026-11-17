import React, { useReducer, useState, useMemo, useEffect, useRef } from 'react';
import { archiveDb, getSubclassesForClass, getEntryById, getAllDeities, getDeitiesForCampaign, getCampaignDisplayName } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import { characterReducer } from './character-builder/characterReducer';
import { INITIAL_CHARACTER_STATE, CharacterState, AbilityKey, SavedCharacterRecord } from './character-builder/types';
import { calculateDerivedStats } from './character-builder/builderUtils';
import { CharacterHud } from './character-builder/CharacterHud';
import { RuleInspectorDrawer } from './character-builder/RuleInspectorDrawer';
import { AbilityScorePicker } from './character-builder/AbilityScorePicker';
import { InteractiveCharacterSheet } from './character-builder/InteractiveCharacterSheet';
import {
  Sparkles,
  ArrowRight,
  Check,
  BookOpen,
  RotateCcw,
  Search,
  Sun,
  Swords,
  Users,
  BookmarkPlus,
  Copy,
  Trash2,
  Plus,
  Upload,
  Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LOCAL_STORAGE_KEY = 'gothic_codex_character_builder_state_v2';
const ROSTER_STORAGE_KEY = 'gothic_codex_character_roster_v1';

interface CharacterBuilderProps {
  onNavigateToEntry: (id: string) => void;
  initialParams?: Record<string, string>;
}

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ onNavigateToEntry, initialParams }) => {
  const [state, dispatch] = useReducer(characterReducer, INITIAL_CHARACTER_STATE);
  const hasHydratedRef = useRef(false);

  // Saved characters roster
  const [roster, setRoster] = useState<SavedCharacterRecord[]>(() => {
    try {
      const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return [];
  });
  const [showRoster, setShowRoster] = useState(false);
  const [rosterMessage, setRosterMessage] = useState<string | null>(null);
  const rosterImportRef = useRef<HTMLInputElement | null>(null);

  // Inspector Drawer state
  const [inspectedEntry, setInspectedEntry] = useState<ArchiveEntry | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Search & filter states per step
  const [raceSearch, setRaceSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [subclassSearch, setSubclassSearch] = useState('');
  const [styleSearch, setStyleSearch] = useState('');
  const [backgroundSearch, setBackgroundSearch] = useState('');
  const [classOptSearch, setClassOptSearch] = useState('');
  const [spellSearch, setSpellSearch] = useState('');
  const [spellLevelFilter, setSpellLevelFilter] = useState<'all' | number>('all');
  const [spellClassOnly, setSpellClassOnly] = useState(true);

  // Persist roster
  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
    } catch {
      // Ignore quota errors
    }
  }, [roster]);

  // 1. Restore from URL Hash, LocalStorage, and initialParams on mount / param change
  useEffect(() => {
    try {
      const buildParam = initialParams?.build;
      const hash = window.location.hash;
      const buildMatch = !buildParam ? hash.match(/build=([A-Za-z0-9+/=_-]+)/) : null;
      const encodedBuild = buildParam || (buildMatch ? buildMatch[1] : null);

      if (encodedBuild) {
        const decoded = decodeURIComponent(atob(encodedBuild));
        const parsed = JSON.parse(decoded);
        dispatch({
          type: 'LOAD_STATE',
          payload: {
            ...INITIAL_CHARACTER_STATE,
            name: parsed.name || INITIAL_CHARACTER_STATE.name,
            genderOrTitle: parsed.title || INITIAL_CHARACTER_STATE.genderOrTitle,
            alignment: parsed.alignment || INITIAL_CHARACTER_STATE.alignment,
            level: Number(parsed.level) || 1,
            raceId: parsed.race || null,
            classId: parsed.class || null,
            subclassId: parsed.subclass || null,
            backgroundId: parsed.background || null,
            featId: parsed.feat || null,
            selectedFeatIds: Array.isArray(parsed.feats) ? parsed.feats : parsed.feat ? [parsed.feat] : [],
            selectedFightingStyleId: parsed.fightingStyle || null,
            selectedClassOptionIds: Array.isArray(parsed.classOptions) ? parsed.classOptions : [],
            selectedSpellIds: Array.isArray(parsed.spells) ? parsed.spells : [],
            spellcastingAbilityOverride: parsed.spellAbility || null,
            campaignId: parsed.campaign || null,
            deityId: parsed.deity || null,
            subrace: parsed.subrace || null,
            asiSystem: parsed.asiSystem === 'flexible' ? 'flexible' : 'racial',
            racialChoiceAbilities: Array.isArray(parsed.racialChoiceAbilities) ? parsed.racialChoiceAbilities : [],
            racialSkillChoices: Array.isArray(parsed.racialSkillChoices) ? parsed.racialSkillChoices : [],
            featAbilityChoices: parsed.featAbilityChoices && typeof parsed.featAbilityChoices === 'object' ? parsed.featAbilityChoices : {},
            classSkillChoices: Array.isArray(parsed.classSkillChoices) ? parsed.classSkillChoices : [],
            backgroundSkillChoices: Array.isArray(parsed.backgroundSkillChoices) ? parsed.backgroundSkillChoices : [],
            applyBackgroundGear: typeof parsed.applyBackgroundGear === 'boolean' ? parsed.applyBackgroundGear : true,
            includeSubclassSpells: typeof parsed.includeSubclassSpells === 'boolean' ? parsed.includeSubclassSpells : true,
            baseAbilities: parsed.abilities || INITIAL_CHARACTER_STATE.baseAbilities,
            racialBonuses: parsed.racialBonuses || INITIAL_CHARACTER_STATE.racialBonuses,
            selectedSkills: Array.isArray(parsed.skills) ? parsed.skills : [],
            expertSkills: Array.isArray(parsed.expertSkills) ? parsed.expertSkills : [],
            customArmor: parsed.armor || INITIAL_CHARACTER_STATE.customArmor,
            shieldEquipped: parsed.shield ?? INITIAL_CHARACTER_STATE.shieldEquipped,
            hpModifierBonus: Number(parsed.hpBonus) || 0,
            equipment: Array.isArray(parsed.equipment) ? parsed.equipment : INITIAL_CHARACTER_STATE.equipment,
            customAttacks: Array.isArray(parsed.customAttacks) ? parsed.customAttacks : [],
            notes: parsed.notes || '',
            step: 6
          }
        });
        hasHydratedRef.current = true;
        return;
      }

      // Restore draft from local storage first
      if (!hasHydratedRef.current) {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsedState = JSON.parse(saved);
          if (parsedState && typeof parsedState === 'object') {
            dispatch({ type: 'LOAD_STATE', payload: parsedState });
          }
        }
      }

      // Apply initialParams overrides if navigated via entry connectors (e.g. builder?class=...)
      if (initialParams && Object.keys(initialParams).length > 0) {
        if (initialParams.campaign) {
          dispatch({ type: 'SELECT_CAMPAIGN', payload: initialParams.campaign });
        }
        if (initialParams.deity) {
          const d = getEntryById(initialParams.deity);
          if (d) {
            if (d.campaign_id && !initialParams.campaign) {
              dispatch({ type: 'SELECT_CAMPAIGN', payload: d.campaign_id });
            }
            dispatch({ type: 'SELECT_DEITY', payload: d.id });
            if (!initialParams.class && !initialParams.subclass && !initialParams.race) {
              dispatch({ type: 'SET_STEP', payload: 2 });
            }
          }
        }

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
          }
        } else if (initialParams.class) {
          const cls = getEntryById(initialParams.class);
          if (cls) {
            dispatch({ type: 'SELECT_CLASS', payload: cls.id });
            dispatch({ type: 'SET_STEP', payload: 3 });
          }
        } else if (initialParams.race) {
          const r = getEntryById(initialParams.race);
          if (r) {
            dispatch({ type: 'SELECT_RACE', payload: r.id });
            dispatch({ type: 'SET_STEP', payload: 2 });
          }
        } else if (initialParams.background) {
          const bg = getEntryById(initialParams.background);
          if (bg) {
            dispatch({ type: 'SELECT_BACKGROUND', payload: bg.id });
            dispatch({ type: 'SET_STEP', payload: 4 });
          }
        } else if (initialParams.feat) {
          const f = getEntryById(initialParams.feat);
          if (f) {
            dispatch({ type: 'TOGGLE_FEAT', payload: f.id });
            dispatch({ type: 'SET_STEP', payload: 5 });
          }
        }
      }
    } catch {
      // Storage parsing failure, fallback to initial state
    } finally {
      hasHydratedRef.current = true;
    }
  }, [initialParams]);

  // 2. Auto-save to LocalStorage on every state update after hydration
  useEffect(() => {
    if (!hasHydratedRef.current) return;
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
      .filter(e => (e.category === 'feats' || e.id.startsWith('character-options/feats/')) && !e.id.endsWith('/index'))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const fightingStyles = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'fighting-styles' && !e.id.endsWith('/index'))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const allClassOptions = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'class-options' && !e.id.endsWith('/index'));
  }, []);

  const allSpells = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'spells' && !e.id.endsWith('/index'))
      .sort((a, b) => (a.level || 0) - (b.level || 0) || a.title.localeCompare(b.title));
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

  const selectedFeats = useMemo(() => {
    return feats.filter(f => state.selectedFeatIds.includes(f.id));
  }, [feats, state.selectedFeatIds]);

  const selectedFightingStyle = useMemo(() => {
    return fightingStyles.find(s => s.id === state.selectedFightingStyleId) || null;
  }, [fightingStyles, state.selectedFightingStyleId]);

  const classOptionsForClass = useMemo(() => {
    if (!selectedClass) return [];
    const target = selectedClass.title.toLowerCase();
    return allClassOptions
      .filter(opt => (opt.parentClass || '').toLowerCase() === target)
      .sort((a, b) => {
        const lvlA = a.min_level ?? 99;
        const lvlB = b.min_level ?? 99;
        if (lvlA !== lvlB) return lvlA - lvlB;
        return a.title.localeCompare(b.title);
      });
  }, [allClassOptions, selectedClass]);

  const selectedClassOptions = useMemo(() => {
    return allClassOptions.filter(opt => state.selectedClassOptionIds.includes(opt.id));
  }, [allClassOptions, state.selectedClassOptionIds]);

  const selectedSpells = useMemo(() => {
    return allSpells.filter(sp => state.selectedSpellIds.includes(sp.id));
  }, [allSpells, state.selectedSpellIds]);

  const allDeities = useMemo(() => getAllDeities(), []);
  const availableDeities = useMemo(() => {
    return getDeitiesForCampaign(state.campaignId || 'all');
  }, [state.campaignId]);

  const selectedDeity = useMemo(() => {
    if (!state.deityId) return null;
    return allDeities.find(d => d.id === state.deityId) || getEntryById(state.deityId) || null;
  }, [allDeities, state.deityId]);

  // Derived stats live calculation (with complete rule automation)
  const derived = useMemo(() => {
    return calculateDerivedStats(
      state,
      selectedRace,
      selectedClass,
      selectedSubclass,
      selectedBackground,
      selectedFeats,
      selectedFightingStyle,
      allSpells
    );
  }, [
    state,
    selectedRace,
    selectedClass,
    selectedSubclass,
    selectedBackground,
    selectedFeats,
    selectedFightingStyle,
    allSpells
  ]);

  // Combine manually selected spells + unlocked subclass Domain/Oath/Circle/Patron spells when enabled
  const effectiveSelectedSpells = useMemo(() => {
    if (!state.includeSubclassSpells || derived.rules.subclassSpellsUnlocked.length === 0) {
      return selectedSpells;
    }
    const existingIds = new Set(selectedSpells.map(s => s.id));
    const bonusEntries = derived.rules.subclassSpellsUnlocked
      .map(b => b.entry)
      .filter((e): e is ArchiveEntry => Boolean(e) && !existingIds.has(e.id));
    return [...selectedSpells, ...bonusEntries];
  }, [selectedSpells, state.includeSubclassSpells, derived.rules.subclassSpellsUnlocked]);

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

  const filteredStyles = useMemo(() => {
    if (!styleSearch.trim()) return fightingStyles;
    const q = styleSearch.toLowerCase();
    return fightingStyles.filter(s => s.title.toLowerCase().includes(q) || s.summary?.toLowerCase().includes(q));
  }, [fightingStyles, styleSearch]);

  const filteredBackgrounds = useMemo(() => {
    if (!backgroundSearch.trim()) return backgrounds;
    const q = backgroundSearch.toLowerCase();
    return backgrounds.filter(b => b.title.toLowerCase().includes(q) || b.summary?.toLowerCase().includes(q));
  }, [backgrounds, backgroundSearch]);

  const filteredClassOptions = useMemo(() => {
    if (!classOptSearch.trim()) return classOptionsForClass;
    const q = classOptSearch.toLowerCase();
    return classOptionsForClass.filter(
      o =>
        o.title.toLowerCase().includes(q) ||
        o.summary?.toLowerCase().includes(q) ||
        o.prerequisite?.toLowerCase().includes(q)
    );
  }, [classOptionsForClass, classOptSearch]);

  const classMatchedSpellCount = useMemo(() => {
    if (!selectedClass) return 0;
    const clsLower = selectedClass.title.toLowerCase();
    return allSpells.filter(sp => (sp.classes || []).some(c => c.toLowerCase() === clsLower)).length;
  }, [allSpells, selectedClass]);

  const filteredSpells = useMemo(() => {
    const q = spellSearch.toLowerCase().trim();
    const clsLower = selectedClass?.title.toLowerCase() || '';
    const enforceClass = spellClassOnly && classMatchedSpellCount > 0;

    return allSpells.filter(sp => {
      if (enforceClass && !(sp.classes || []).some(c => c.toLowerCase() === clsLower)) {
        return false;
      }
      if (spellLevelFilter !== 'all' && (sp.level ?? 0) !== spellLevelFilter) {
        return false;
      }
      if (q) {
        const hay = `${sp.title} ${sp.school || ''} ${sp.summary || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allSpells, selectedClass, spellClassOnly, classMatchedSpellCount, spellLevelFilter, spellSearch]);

  // Roster helpers
  const saveCurrentHeroToRoster = (asNew = false) => {
    const heroId = !asNew && state.id ? state.id : `hero_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nextState: CharacterState = { ...state, id: heroId };
    if (nextState.id !== state.id) {
      dispatch({ type: 'LOAD_STATE', payload: nextState });
    }
    const summary = `Lvl ${derived.level} ${selectedRace?.title || 'Ancestry Unset'} ${selectedClass?.title || 'Adventurer'}${selectedSubclass ? ` (${selectedSubclass.title})` : ''}`;
    const record: SavedCharacterRecord = {
      id: heroId,
      updatedAt: new Date().toISOString(),
      summary,
      state: nextState
    };
    setRoster(prev => [record, ...prev.filter(r => r.id !== heroId)]);
    setRosterMessage(`Saved "${nextState.name || 'Nameless Hero'}" to roster.`);
    setTimeout(() => setRosterMessage(null), 2600);
  };

  const loadFromRoster = (record: SavedCharacterRecord) => {
    dispatch({ type: 'LOAD_STATE', payload: { ...record.state, id: record.id, step: 6 } });
    setShowRoster(false);
  };

  const deleteFromRoster = (id: string) => {
    setRoster(prev => prev.filter(r => r.id !== id));
  };

  const startNewCharacter = () => {
    dispatch({ type: 'RESET' });
    setShowRoster(false);
  };

  const handleRosterImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (parsed && typeof parsed === 'object') {
          dispatch({ type: 'LOAD_STATE', payload: { ...parsed, step: 6 } });
          setShowRoster(false);
        }
      } catch {
        setRosterMessage('Could not parse JSON character file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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

  const isInspectedSelected = useMemo(() => {
    if (!inspectedEntry) return false;
    return (
      inspectedEntry.id === state.raceId ||
      inspectedEntry.id === state.classId ||
      inspectedEntry.id === state.subclassId ||
      inspectedEntry.id === state.backgroundId ||
      inspectedEntry.id === state.selectedFightingStyleId ||
      inspectedEntry.id === state.deityId ||
      state.selectedFeatIds.includes(inspectedEntry.id) ||
      state.selectedClassOptionIds.includes(inspectedEntry.id) ||
      state.selectedSpellIds.includes(inspectedEntry.id)
    );
  }, [inspectedEntry, state]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 print:max-w-none print:pb-0 print:space-y-0">
      
      {/* Step Progress Tracker & Roster Bar (Hidden on Print) */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-4 print:hidden">
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRoster(!showRoster)}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                showRoster
                  ? 'bg-amber-500 text-stone-950 border-amber-400'
                  : 'bg-stone-950 text-stone-200 border-stone-800 hover:border-amber-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Saved Heroes ({roster.length})</span>
            </button>

            <button
              onClick={() => saveCurrentHeroToRoster(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-serif font-semibold bg-stone-950 hover:bg-stone-800 text-amber-300 border border-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Save current character to browser roster"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save Hero</span>
            </button>

            <span className="text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
              Step {state.step} of 6
            </span>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 text-xs transition-colors cursor-pointer"
              title="Reset builder"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Saved Heroes Roster Panel */}
        {showRoster && (
          <div className="rounded-xl border border-amber-900/50 bg-stone-950/90 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
              <div>
                <h3 className="font-serif text-sm font-bold text-amber-200">Saved Character Roster</h3>
                <p className="text-[11px] text-stone-400">Stored locally in your browser. Switch heroes anytime or import a JSON backup.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => saveCurrentHeroToRoster(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Save Copy</span>
                </button>
                <button
                  onClick={startNewCharacter}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Hero</span>
                </button>
                <button
                  onClick={() => rosterImportRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Import .json</span>
                </button>
                <input
                  ref={rosterImportRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRosterImportJson}
                  className="hidden"
                />
              </div>
            </div>

            {rosterMessage && (
              <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-900/50 rounded-lg px-3 py-1.5">
                {rosterMessage}
              </div>
            )}

            {roster.length === 0 ? (
              <div className="text-xs text-stone-500 italic py-3 text-center">
                No saved heroes yet. Click &quot;Save Hero&quot; to bookmark your current build here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {roster.map(rec => {
                  const isCurrent = state.id === rec.id;
                  return (
                    <div
                      key={rec.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        isCurrent ? 'border-amber-500 bg-amber-950/20' : 'border-stone-800 bg-stone-900/70'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-serif font-bold text-stone-100 text-xs truncate">
                          {rec.state.name || 'Nameless Hero'}
                        </div>
                        <div className="text-[11px] text-stone-400 truncate">{rec.summary}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => loadFromRoster(rec)}
                          className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-amber-500 hover:text-stone-950 border border-stone-700 text-xs text-amber-300 font-semibold transition-colors cursor-pointer"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => deleteFromRoster(rec.id)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                          title="Delete saved hero"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
          selectedDeity={selectedDeity}
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

          {/* Ancestry Configurator: Subraces, Speeds, Innate Spells & Racial Skill Choices */}
          {selectedRace && (
            <div className="rounded-xl border border-amber-900/40 bg-stone-950/90 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-900 pb-2.5">
                <div>
                  <h3 className="font-serif text-sm font-bold text-amber-200">
                    {selectedRace.title} Ancestry Traits &amp; Morphologies
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Speed: <strong className="text-stone-200">{derived.speed}</strong>
                    {' · '}Size: <strong className="text-stone-200">{derived.rules.raceProfile.size}</strong>
                    {derived.rules.raceProfile.darkvision ? ` · Darkvision ${derived.rules.raceProfile.darkvision} ft.` : ''}
                    {derived.rules.raceProfile.naturalArmorBase ? ` · Natural Armor ${derived.rules.raceProfile.naturalArmorBase} + DEX` : ''}
                    {derived.rules.raceProfile.fixedSkills.length > 0 ? ` · Auto Skills: ${derived.rules.raceProfile.fixedSkills.join(', ')}` : ''}
                    {derived.rules.raceProfile.languages.length > 0 ? ` · Languages: ${derived.rules.raceProfile.languages.join(', ')}` : ''}
                  </p>
                  {derived.rules.innateSpells.length > 0 && (
                    <p className="text-[11px] text-violet-300 mt-1">
                      Innate Spells: {derived.rules.innateSpells.map(s => s.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {derived.rules.raceProfile.subraces.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-serif font-semibold text-stone-300">
                    Choose Subrace / Variant:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {derived.rules.raceProfile.subraces.map(sub => {
                      const active = derived.rules.raceProfile.activeSubrace?.name === sub.name;
                      return (
                        <button
                          key={sub.name}
                          onClick={() => dispatch({ type: 'SELECT_SUBRACE', payload: sub.name })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500'
                              : 'border-stone-800 bg-stone-900/70 hover:border-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-serif font-bold text-xs text-stone-100">{sub.name}</span>
                            {active && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-stone-400 mt-1">{sub.summary}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {derived.rules.raceProfile.skillChoice && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-semibold text-amber-200">
                      {derived.rules.raceProfile.skillChoice.label}
                    </span>
                    <span className="font-mono text-[11px] text-amber-400">
                      {(state.racialSkillChoices || []).filter(s => derived.rules.raceProfile.skillChoice!.from.includes(s)).length} / {derived.rules.raceProfile.skillChoice.count} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {derived.rules.raceProfile.skillChoice.from.map(sk => {
                      const active = (state.racialSkillChoices || []).includes(sk);
                      return (
                        <button
                          key={sk}
                          onClick={() =>
                            dispatch({
                              type: 'TOGGLE_RACIAL_SKILL',
                              payload: { skill: sk, max: derived.rules.raceProfile.skillChoice!.count }
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                            active
                              ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                              : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-700'
                          }`}
                        >
                          {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

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

      {/* Step 2: Class, Level & Faith */}
      {state.step === 2 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-100">Step 2: Choose Your Class & Level</h2>
              <p className="text-xs text-stone-400">
                Set your character level (1–20), combat class, hit die, saving throws, and patron faith.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1">
                <span className="text-[11px] font-serif text-amber-300 font-semibold">Level:</span>
                <select
                  value={derived.level}
                  onChange={(e) => dispatch({ type: 'SET_LEVEL', payload: parseInt(e.target.value, 10) })}
                  className="bg-transparent text-xs font-mono font-bold text-stone-100 focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => (
                    <option key={lvl} value={lvl} className="bg-stone-900">
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-56">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
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

          {/* Automated Class Proficiencies, Skills & Progression Preview */}
          {selectedClass && (
            <div className="rounded-xl border border-amber-900/40 bg-stone-950/90 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-900 pb-2.5">
                <div>
                  <h3 className="font-serif text-sm font-bold text-amber-200">
                    {selectedClass.title} (Level {derived.level}) — Automated Class Features
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {[
                      derived.rules.classProg.armorProficiencies.length > 0
                        ? `Armor: ${derived.rules.classProg.armorProficiencies.join(', ')}`
                        : 'Armor: None',
                      derived.rules.classProg.weaponProficiencies.length > 0
                        ? `Weapons: ${derived.rules.classProg.weaponProficiencies.join(', ')}`
                        : '',
                      derived.rules.classProg.toolProficiencies.length > 0
                        ? `Tools: ${derived.rules.classProg.toolProficiencies.join(', ')}`
                        : ''
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  {derived.cantripsKnown > 0 && (
                    <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/60 text-violet-200">
                      {derived.cantripsKnown} Cantrips
                    </span>
                  )}
                  {derived.spellsKnown !== null && derived.spellsKnown > 0 && (
                    <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/60 text-violet-200">
                      {derived.spellsKnown} Spells Known
                    </span>
                  )}
                  {derived.preparedSpellLimit !== null && (
                    <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/60 text-violet-200">
                      Prepare {derived.preparedSpellLimit} Spells
                    </span>
                  )}
                  {derived.classOptionsKnown > 0 && (
                    <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-200">
                      {derived.classOptionsKnown} {derived.classOptionsLabel || 'Class Options'}
                    </span>
                  )}
                  {derived.rules.classProg.resources.map(res => (
                    <span
                      key={res.label}
                      className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300"
                    >
                      {res.label}: {res.value}
                    </span>
                  ))}
                </div>
              </div>

              {/* Class Starting Skill Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-semibold text-stone-200">
                    {derived.rules.classProg.skillChoice.label}
                  </span>
                  <span className="font-mono text-[11px] text-amber-400">
                    {(state.classSkillChoices || []).filter(s => derived.rules.classProg.skillChoice.from.includes(s)).length} / {derived.rules.classProg.skillChoice.count} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {derived.rules.classProg.skillChoice.from.map(sk => {
                    const active = (state.classSkillChoices || []).includes(sk);
                    return (
                      <button
                        key={sk}
                        onClick={() =>
                          dispatch({
                            type: 'TOGGLE_CLASS_SKILL',
                            payload: { skill: sk, max: derived.rules.classProg.skillChoice.count }
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                          active
                            ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                            : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-700'
                        }`}
                      >
                        {sk}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Flexible Spellcasting Ability Choice (Warlock / Tamer) */}
          {selectedClass && derived.allowsSpellcastingChoice && (
            <div className="rounded-xl border border-violet-900/50 bg-violet-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-violet-200">
                  {selectedClass.title} Spellcasting Ability Choice
                </h3>
                <p className="text-[11px] text-stone-400">
                  This class lets you select Intelligence, Wisdom, or Charisma as your spellcasting modifier.
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {(['int', 'wis', 'cha'] as AbilityKey[]).map(ab => {
                  const active = (derived.spellcastingAbility || 'cha') === ab;
                  return (
                    <button
                      key={ab}
                      onClick={() => dispatch({ type: 'SET_SPELLCASTING_ABILITY', payload: ab })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-violet-500 text-stone-950 border-violet-400'
                          : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-violet-700'
                      }`}
                    >
                      {ab.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional Campaign & Patron Deity Selector */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-serif text-sm font-bold text-stone-200">
                    Campaign Setting & Patron Faith (Optional)
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Filter deities by campaign world—recommended for Clerics, Paladins, and Paragons.
                  </p>
                </div>
              </div>
              {selectedDeity && (
                <button
                  onClick={() => openInspector(selectedDeity)}
                  className="text-xs font-serif text-amber-400 hover:text-amber-200 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Inspect {selectedDeity.title}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-serif text-stone-400 block">Campaign World</label>
                <select
                  value={state.campaignId || ''}
                  onChange={e => dispatch({ type: 'SELECT_CAMPAIGN', payload: e.target.value || null })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="">Any / Unspecified Realm</option>
                  <option value="curse-of-strahd">Curse of Strahd (Barovia)</option>
                  <option value="ra-golvek">Ra Gol&apos;vek</option>
                  <option value="vyrun">Vyrun</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-serif text-stone-400 block">Patron Deity / Power</label>
                <select
                  value={state.deityId || ''}
                  onChange={e => dispatch({ type: 'SELECT_DEITY', payload: e.target.value || null })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                >
                  <option value="">No Patron Chosen</option>
                  {(() => {
                    const groups = new Map<string, ArchiveEntry[]>();
                    for (const d of availableDeities) {
                      const label = state.campaignId
                        ? d.pantheon || getCampaignDisplayName(d.campaign_id)
                        : `${getCampaignDisplayName(d.campaign_id)} — ${d.pantheon || 'General'}`;
                      if (!groups.has(label)) groups.set(label, []);
                      groups.get(label)!.push(d);
                    }
                    return Array.from(groups.entries())
                      .sort((a, b) => {
                        if (a[0].includes('Cataclysms')) return 1;
                        if (b[0].includes('Cataclysms')) return -1;
                        return a[0].localeCompare(b[0]);
                      })
                      .map(([groupLabel, list]) => (
                        <optgroup key={groupLabel} label={groupLabel}>
                          {list.map(d => (
                            <option key={d.id} value={d.id} disabled={Boolean(d.worship_forbidden)}>
                              {d.title}
                              {d.worship_forbidden
                                ? ' (Worship Forbidden)'
                                : ` (${d.alignment || 'Unaligned'})`}
                            </option>
                          ))}
                        </optgroup>
                      ));
                  })()}
                </select>
              </div>
            </div>

            {selectedDeity && (
              <div className="text-[11px] text-stone-300 pt-2 border-t border-stone-900 flex flex-wrap items-center gap-2">
                <span className="text-amber-300 font-semibold">{selectedDeity.title}</span>
                {selectedDeity.pantheon && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{selectedDeity.pantheon}</span>
                  </>
                )}
                {selectedDeity.sin && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Sin: {selectedDeity.sin}</span>
                  </>
                )}
                {selectedDeity.virtue && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Virtue: {selectedDeity.virtue}</span>
                  </>
                )}
                {selectedDeity.harbinger && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Harbinger: {selectedDeity.harbinger}</span>
                  </>
                )}
                {selectedDeity.element && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Element: {selectedDeity.element}</span>
                  </>
                )}
                {selectedDeity.domains && selectedDeity.domains.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Domains: {selectedDeity.domains.join(', ')}</span>
                  </>
                )}
                {selectedDeity.portfolios && selectedDeity.portfolios.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Portfolios: {selectedDeity.portfolios.join(', ')}</span>
                  </>
                )}
                {selectedDeity.recommended_oaths && selectedDeity.recommended_oaths.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-400">
                      Aligned Paths: {selectedDeity.recommended_oaths.join(', ')}
                    </span>
                  </>
                )}
              </div>
            )}
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

      {/* Step 3: Archetype & Fighting Style */}
      {state.step === 3 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-100">Step 3: Archetype & Fighting Style</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredSubclasses.map(sub => {
                  const isSelected = selectedSubclass?.id === sub.id;
                  const isDeityAligned = Boolean(
                    selectedDeity?.recommended_oaths?.some(
                      o => o.toLowerCase() === sub.title.toLowerCase()
                    )
                  );
                  return (
                    <div
                      key={sub.id}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500 shadow-md'
                          : isDeityAligned
                          ? 'border-amber-700/60 bg-stone-950 hover:border-amber-500/80'
                          : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <div className="font-serif font-bold text-stone-200 text-sm">{sub.title}</div>
                          {isSelected ? (
                            <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5 shrink-0">
                              <Check className="w-3.5 h-3.5" /> Selected
                            </span>
                          ) : isDeityAligned ? (
                            <span className="text-amber-300/90 text-[11px] font-serif shrink-0">
                              Aligned with {selectedDeity?.title}
                            </span>
                          ) : null}
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
              <div className="p-6 text-center text-stone-400 rounded-xl bg-stone-950 border border-stone-800 text-xs">
                No specific archetype required at 1st level for {selectedClass?.title || 'this class'}. You can choose a Fighting Style below or proceed to Background.
              </div>
            )}
          </div>

          {/* Unlocked Subclass Domain / Oath / Patron Spells Preview */}
          {selectedSubclass && derived.rules.subclassSpellsUnlocked.length > 0 && (
            <div className="rounded-xl border border-violet-900/40 bg-violet-950/15 p-3.5 space-y-1.5">
              <div className="text-xs font-serif font-bold text-violet-200 flex items-center justify-between gap-2">
                <span>
                  {selectedSubclass.title} — Always-Prepared / Bonus Spells (Lv {derived.level})
                </span>
                <span className="text-[10px] font-mono text-violet-300">Auto-included on sheet</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {derived.rules.subclassSpellsUnlocked.map(sp => (
                  <span
                    key={sp.name}
                    className="px-2 py-0.5 rounded bg-violet-950/60 border border-violet-800/60 text-[11px] text-violet-200"
                  >
                    {sp.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fighting Styles Picker (30 archive styles) */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
                    <span>
                      Fighting Style ({derived.rules.grantsFightingStyleCount > 0 ? `${derived.rules.grantsFightingStyleCount} Granted` : 'Optional'} · {fightingStyles.length} styles)
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {derived.rules.grantsFightingStyleCount > 0
                      ? 'Active Fighting Style combat & AC modifiers apply automatically to your sheet.'
                      : 'Granted at Fighter Lv1, Paladin Lv1, Ranger/Warden Lv2, or via Alternate Fighting Initiate feat.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedFightingStyle && (
                  <button
                    onClick={() => dispatch({ type: 'SELECT_FIGHTING_STYLE', payload: null })}
                    className="text-xs text-rose-400 hover:text-rose-200 underline font-mono cursor-pointer"
                  >
                    Clear Style
                  </button>
                )}
                <div className="relative w-48">
                  <Search className="w-3 h-3 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter styles..."
                    value={styleSearch}
                    onChange={(e) => setStyleSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredStyles.map(style => {
                const isSelected = state.selectedFightingStyleId === style.id;
                return (
                  <div
                    key={style.id}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500'
                        : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-serif font-bold text-stone-200 text-xs truncate">{style.title}</div>
                      {style.summary && (
                        <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">{style.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-800/70 text-[10px]">
                      <button
                        onClick={() =>
                          dispatch({ type: 'SELECT_FIGHTING_STYLE', payload: isSelected ? null : style.id })
                        }
                        className={`font-semibold hover:underline cursor-pointer ${
                          isSelected ? 'text-emerald-300' : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Choose Style'}
                      </button>
                      <button
                        onClick={() => openInspector(style)}
                        className="text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
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
              <span>Continue to Background &amp; Options</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Background, Class Options & Spellbook */}
      {state.step === 4 && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 md:p-6 space-y-6">
          {/* Backgrounds */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-100">Step 4: Background, Class Options &amp; Spells</h2>
                <p className="text-xs text-stone-400">
                  Choose your background, plus class invocations/exploits and spells for your build.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
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
            {/* Automated Background Benefits & Choices */}
            {derived.rules.bgProfile && (
              <div className="rounded-xl border border-amber-900/40 bg-stone-950/90 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-900 pb-2">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-amber-200">
                      {derived.rules.bgProfile.title} — Automated Background Benefits
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      {[
                        derived.rules.bgProfile.fixedSkills.length > 0
                          ? `Auto Skills: ${derived.rules.bgProfile.fixedSkills.join(', ')}`
                          : '',
                        derived.rules.bgProfile.tools.length > 0
                          ? `Tools: ${derived.rules.bgProfile.tools.join(', ')}`
                          : '',
                        derived.rules.bgProfile.languages.length > 0
                          ? `Languages: ${derived.rules.bgProfile.languages.join(', ')}`
                          : ''
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Choose your background skill proficiencies below.'}
                    </p>
                  </div>

                  {derived.rules.bgProfile.equipment.length > 0 && (
                    <label className="inline-flex items-center gap-1.5 text-[11px] text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.applyBackgroundGear}
                        onChange={() => dispatch({ type: 'TOGGLE_APPLY_BACKGROUND_GEAR' })}
                        className="rounded border-stone-700 text-amber-500 bg-stone-900"
                      />
                      <span>Include Background Gear ({derived.rules.bgProfile.equipment.length} items)</span>
                    </label>
                  )}
                </div>

                {derived.rules.bgProfile.skillChoices.map(pool => {
                  const pickedInPool = (state.backgroundSkillChoices || []).filter(s =>
                    pool.from.includes(s)
                  );
                  const totalBgMax = derived.rules.bgProfile!.skillChoices.reduce(
                    (acc, c) => acc + c.count,
                    0
                  );
                  return (
                    <div key={pool.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-amber-200">{pool.label}</span>
                        <span className="font-mono text-[11px] text-amber-400">
                          {Math.min(pickedInPool.length, pool.count)} / {pool.count} selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {pool.from.map(sk => {
                          const active = (state.backgroundSkillChoices || []).includes(sk);
                          return (
                            <button
                              key={sk}
                              onClick={() =>
                                dispatch({
                                  type: 'TOGGLE_BACKGROUND_SKILL',
                                  payload: {
                                    skill: sk,
                                    max: totalBgMax,
                                    groupPool: pool.from,
                                    groupMax: pool.count
                                  }
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                                active
                                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                                  : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-700'
                              }`}
                            >
                              {sk}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Class Options Pool (Invocations, Maneuvers, Metamagic, Disciplines, etc.) */}
          {classOptionsForClass.length > 0 && (
            <div className="rounded-xl border border-cyan-900/40 bg-stone-950/80 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-sm font-bold text-cyan-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>
                      {selectedClass?.title} {derived.classOptionsLabel || 'Class Options'} (
                      {selectedClassOptions.length}
                      {derived.classOptionsKnown > 0 ? ` / ${derived.classOptionsKnown}` : ''} selected · {classOptionsForClass.length} available)
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {derived.classOptionsKnown > 0
                      ? `At Level ${derived.level}, your build knows ${derived.classOptionsKnown} ${derived.classOptionsLabel || 'options'}.`
                      : `Sorted by level prerequisite. Options above Level ${derived.level} remain dimmed until unlocked.`}
                  </p>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3 h-3 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter class options..."
                    value={classOptSearch}
                    onChange={(e) => setClassOptSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredClassOptions.map(opt => {
                  const isSelected = state.selectedClassOptionIds.includes(opt.id);
                  const minLvl = opt.min_level ?? 1;
                  const isUnlocked = derived.level >= minLvl;
                  return (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                          : isUnlocked
                          ? 'border-stone-800 bg-stone-900/70 hover:border-stone-700'
                          : 'border-stone-900 bg-stone-950/60 opacity-65'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-serif font-bold text-stone-200 text-xs truncate">{opt.title}</span>
                          {opt.min_level && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                              isUnlocked ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'bg-stone-900 text-stone-500 border border-stone-800'
                            }`}>
                              Lv {opt.min_level}
                            </span>
                          )}
                        </div>
                        {opt.prerequisite && (
                          <div className="text-[10px] text-amber-300/80 font-mono truncate mt-0.5">
                            {opt.prerequisite}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-800/70 text-[10px]">
                        <button
                          onClick={() => dispatch({ type: 'TOGGLE_CLASS_OPTION', payload: opt.id })}
                          className={`font-semibold hover:underline cursor-pointer ${
                            isSelected ? 'text-cyan-300' : 'text-stone-300 hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Remove Option' : 'Add Option'}
                        </button>
                        <button
                          onClick={() => openInspector(opt)}
                          className="text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
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
          )}

          {/* Spellbook Picker */}
          <div className="rounded-xl border border-violet-900/40 bg-stone-950/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-sm font-bold text-violet-200 flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-violet-400" />
                  <span>
                    Known &amp; Prepared Spells ({selectedSpells.filter(s => (s.level ?? 0) === 0).length}
                    {derived.cantripsKnown > 0 ? `/${derived.cantripsKnown}` : ''} cantrips ·{' '}
                    {selectedSpells.filter(s => (s.level ?? 0) > 0).length}
                    {derived.spellsKnown !== null
                      ? `/${derived.spellsKnown} known`
                      : derived.preparedSpellLimit !== null
                      ? `/${derived.preparedSpellLimit} prep`
                      : ' leveled'})
                  </span>
                </h3>
                <p className="text-[11px] text-stone-400">
                  {derived.rules.classProg.hasSpellcastingAtLevel
                    ? 'Budgets read dynamically from your archive class table at Level ' + derived.level + '.'
                    : selectedClass
                    ? `${selectedClass.title} has no class spell slots at Level ${derived.level}${derived.rules.innateSpells.length > 0 ? ' (innate spells still apply).' : '.'}`
                    : 'Add cantrips and leveled spells to your interactive sheet grimoire.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {derived.rules.subclassSpellsUnlocked.length > 0 && (
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-950/40 border border-violet-800/50 text-[11px] text-violet-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.includeSubclassSpells}
                      onChange={() => dispatch({ type: 'TOGGLE_INCLUDE_SUBCLASS_SPELLS' })}
                      className="rounded border-violet-700 text-violet-500 bg-stone-900"
                    />
                    <span>Include Subclass Spells ({derived.rules.subclassSpellsUnlocked.length})</span>
                  </label>
                )}

                {selectedClass && classMatchedSpellCount > 0 && (
                  <button
                    onClick={() => setSpellClassOnly(!spellClassOnly)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-serif border transition-colors cursor-pointer ${
                      spellClassOnly
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-stone-900 text-stone-300 border-stone-800'
                    }`}
                  >
                    {spellClassOnly ? `${selectedClass.title} Spells (${classMatchedSpellCount})` : 'All Codex Spells'}
                  </button>
                )}

                <select
                  value={spellLevelFilter}
                  onChange={(e) => setSpellLevelFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                  className="bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-[11px] font-mono text-stone-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="all">All Levels</option>
                  <option value={0}>Cantrips (0)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>

                <div className="relative w-44">
                  <Search className="w-3 h-3 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search spells..."
                    value={spellSearch}
                    onChange={(e) => setSpellSearch(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {derived.rules.innateSpells.length > 0 && (
              <div className="rounded-lg bg-violet-950/20 border border-violet-900/40 px-3 py-2 text-[11px] text-violet-200 flex flex-wrap items-center gap-1.5">
                <span className="font-mono uppercase text-[10px] text-violet-400">Innate Spells:</span>
                {derived.rules.innateSpells.map((sp, i) => (
                  <span key={`${sp.name}_${i}`} className="px-2 py-0.5 rounded bg-violet-950/60 border border-violet-800/50">
                    {sp.name} ({sp.source})
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {filteredSpells.map(sp => {
                const isSelected = state.selectedSpellIds.includes(sp.id);
                const isSubclassAuto =
                  state.includeSubclassSpells &&
                  derived.rules.subclassSpellsUnlocked.some(b => b.entry?.id === sp.id);
                const lvlLabel = (sp.level ?? 0) === 0 ? 'Cantrip' : `Lv ${sp.level}`;
                return (
                  <div
                    key={sp.id}
                    className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                      isSelected || isSubclassAuto
                        ? 'border-violet-500 bg-violet-950/30 ring-1 ring-violet-500'
                        : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-serif font-bold text-stone-200 text-xs truncate">{sp.title}</span>
                        <span className="text-[10px] font-mono text-violet-300 bg-violet-950/70 px-1.5 py-0.2 rounded shrink-0">
                          {lvlLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400 truncate mt-0.5">
                        {sp.school || 'Magic'}{sp.concentration ? ' · Conc.' : ''}{sp.ritual ? ' · Ritual' : ''}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-800/70 text-[10px]">
                      {isSubclassAuto && !isSelected ? (
                        <span className="text-violet-300 font-mono font-semibold">Auto (Subclass)</span>
                      ) : (
                        <button
                          onClick={() => dispatch({ type: 'TOGGLE_SPELL', payload: sp.id })}
                          className={`font-semibold hover:underline cursor-pointer ${
                            isSelected ? 'text-violet-300' : 'text-stone-300 hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Remove' : 'Prepare / Learn'}
                        </button>
                      )}
                      <button
                        onClick={() => openInspector(sp)}
                        className="text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
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
              <span>Continue to Abilities &amp; Feats</span>
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
            derived={derived}
            selectedRace={selectedRace}
            selectedClass={selectedClass}
            onSetMode={(mode) => dispatch({ type: 'SET_ABILITY_MODE', payload: mode })}
            onSetAsiSystem={(sys) => dispatch({ type: 'SET_ASI_SYSTEM', payload: sys })}
            onSetAbility={(ability, score) => dispatch({ type: 'SET_BASE_ABILITY', payload: { ability, score } })}
            onSetAllAbilities={(scores) => dispatch({ type: 'SET_ALL_BASE_ABILITIES', payload: scores })}
            onSetRacialBonus={(type, ability) => dispatch({ type: 'SET_RACIAL_BONUS', payload: { type, ability } })}
            onSetRacialChoiceAbilities={(abs) => dispatch({ type: 'SET_RACIAL_CHOICE_ABILITIES', payload: abs })}
            onSetFeatAbilityChoice={(featId, ability) =>
              dispatch({ type: 'SET_FEAT_ABILITY_CHOICE', payload: { featId, ability } })
            }
            onToggleFeat={(featId) => dispatch({ type: 'TOGGLE_FEAT', payload: featId })}
            onClearFeats={() => dispatch({ type: 'SELECT_FEAT', payload: null })}
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
          selectedFeats={selectedFeats}
          selectedFightingStyle={selectedFightingStyle}
          selectedClassOptions={selectedClassOptions}
          selectedSpells={effectiveSelectedSpells}
          selectedDeity={selectedDeity}
          derived={derived}
          onSetName={(name) => dispatch({ type: 'SET_NAME', payload: name })}
          onSetGenderOrTitle={(title) => dispatch({ type: 'SET_GENDER_OR_TITLE', payload: title })}
          onSetAlignment={(align) => dispatch({ type: 'SET_ALIGNMENT', payload: align })}
          onSetLevel={(lvl) => dispatch({ type: 'SET_LEVEL', payload: lvl })}
          onSetSpellcastingAbility={(ab) => dispatch({ type: 'SET_SPELLCASTING_ABILITY', payload: ab })}
          onToggleSkill={(skill) => dispatch({ type: 'TOGGLE_SKILL', payload: skill })}
          onToggleSkillExpertise={(skill) => dispatch({ type: 'TOGGLE_SKILL_EXPERTISE', payload: skill })}
          onSetArmor={(armor) => dispatch({ type: 'SET_ARMOR', payload: armor })}
          onToggleShield={() => dispatch({ type: 'TOGGLE_SHIELD' })}
          onSetHpBonus={(bonus) => dispatch({ type: 'SET_HP_BONUS', payload: bonus })}
          onSetCurrentHp={(hp) => dispatch({ type: 'SET_CURRENT_HP', payload: hp })}
          onSetTempHp={(hp) => dispatch({ type: 'SET_TEMP_HP', payload: hp })}
          onToggleSpellSlot={(level, slotIndex) =>
            dispatch({ type: 'TOGGLE_SPELL_SLOT', payload: { level, slotIndex } })
          }
          onLongRest={() => dispatch({ type: 'LONG_REST' })}
          onAddEquipment={(item) => dispatch({ type: 'ADD_EQUIPMENT', payload: item })}
          onRemoveEquipment={(index) => dispatch({ type: 'REMOVE_EQUIPMENT', payload: index })}
          onRemoveClassOption={(id) => dispatch({ type: 'TOGGLE_CLASS_OPTION', payload: id })}
          onRemoveSpell={(id) => dispatch({ type: 'TOGGLE_SPELL', payload: id })}
          onRemoveFeat={(id) => dispatch({ type: 'TOGGLE_FEAT', payload: id })}
          onClearFightingStyle={() => dispatch({ type: 'SELECT_FIGHTING_STYLE', payload: null })}
          onSetNotes={(notes) => dispatch({ type: 'SET_NOTES', payload: notes })}
          onAddAttack={(atk) => dispatch({ type: 'ADD_ATTACK', payload: atk })}
          onRemoveAttack={(id) => dispatch({ type: 'REMOVE_ATTACK', payload: id })}
          onImportState={(raw) => dispatch({ type: 'LOAD_STATE', payload: raw })}
          onSaveToRoster={() => saveCurrentHeroToRoster(false)}
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
          else if (entry.category === 'fighting-styles') dispatch({ type: 'SELECT_FIGHTING_STYLE', payload: entry.id });
          else if (entry.category === 'class-options') dispatch({ type: 'TOGGLE_CLASS_OPTION', payload: entry.id });
          else if (entry.category === 'spells') dispatch({ type: 'TOGGLE_SPELL', payload: entry.id });
          else if (entry.category === 'feats') dispatch({ type: 'TOGGLE_FEAT', payload: entry.id });
          else if (entry.category === 'pantheons') {
            if (entry.campaign_id && entry.campaign_id !== state.campaignId) {
              dispatch({ type: 'SELECT_CAMPAIGN', payload: entry.campaign_id });
            }
            dispatch({ type: 'SELECT_DEITY', payload: entry.id });
          }
          setIsInspectorOpen(false);
        }}
        isSelected={isInspectedSelected}
        onNavigateToEntry={onNavigateToEntry}
      />

    </div>
  );
};
