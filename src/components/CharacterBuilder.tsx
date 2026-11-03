import React, { useState, useMemo } from 'react';
import {
  archiveDb,
  getSubclassesForClass,
  getClassOptionsForClass,
  calculateModifier,
  formatModifier,
  calculateProficiencyBonus
} from '../utils/archiveUtils';
import { AbilityScores, CharacterBuild } from '../types/archive';
import { MarkdownView } from './MarkdownView';
import confetti from 'canvas-confetti';
import {
  User,
  Shield,
  Heart,
  Zap,
  BookOpen,
  Award,
  Sparkles,
  Download,
  Copy,
  Printer,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw,
  Plus,
  Trash2
} from 'lucide-react';

interface CharacterBuilderProps {
  onNavigateToEntry: (entryId: string) => void;
}

const DEFAULT_ABILITIES: AbilityScores = {
  str: 15,
  dex: 14,
  con: 13,
  int: 12,
  wis: 10,
  cha: 8
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ onNavigateToEntry }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [characterName, setCharacterName] = useState<string>('Valeros');
  const [selectedRaceId, setSelectedRaceId] = useState<string>('character-options/races/Human');
  const [selectedClassId, setSelectedClassId] = useState<string>('character-options/classes/Fighter');
  const [selectedSubclassId, setSelectedSubclassId] = useState<string>('character-options/subclasses/Fighter/Champion');
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<string>('character-options/backgrounds/Acolyte');
  const [level, setLevel] = useState<number>(3);
  const [abilities, setAbilities] = useState<AbilityScores>(DEFAULT_ABILITIES);
  const [alignment, setAlignment] = useState<string>('Neutral Good');
  const [selectedFeats, setSelectedFeats] = useState<string[]>([]);
  const [selectedFightingStyles, setSelectedFightingStyles] = useState<string[]>(['character-options/fighting-styles/Defensive Fighting']);
  const [selectedClassOptions, setSelectedClassOptions] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('Eager adventurer journeying into the unknown realm.');
  const [copied, setCopied] = useState<boolean>(false);

  // Available options
  const allRaces = useMemo(() => {
    return archiveDb.entries.filter(e => e.category === 'races' && !e.id.endsWith('/index'));
  }, []);

  const allClasses = useMemo(() => {
    return archiveDb.entries.filter(e => e.category === 'classes' && !e.id.endsWith('/index'));
  }, []);

  const allBackgrounds = useMemo(() => {
    return archiveDb.entries.filter(e => e.category === 'backgrounds' && !e.id.endsWith('/index'));
  }, []);

  const allFeats = useMemo(() => {
    return archiveDb.entries.filter(e => e.category === 'feats' && !e.id.endsWith('/index'));
  }, []);

  const allFightingStyles = useMemo(() => {
    return archiveDb.entries.filter(e => e.category === 'fighting-styles' && !e.id.endsWith('/index'));
  }, []);

  // Current selections
  const currentRace = useMemo(() => allRaces.find(r => r.id === selectedRaceId) || allRaces[0], [allRaces, selectedRaceId]);
  const currentClass = useMemo(() => allClasses.find(c => c.id === selectedClassId) || allClasses[0], [allClasses, selectedClassId]);

  const availableSubclasses = useMemo(() => {
    if (!currentClass) return [];
    return getSubclassesForClass(currentClass.title);
  }, [currentClass]);

  const currentSubclass = useMemo(() => {
    return availableSubclasses.find(s => s.id === selectedSubclassId) || availableSubclasses[0] || null;
  }, [availableSubclasses, selectedSubclassId]);

  const currentBackground = useMemo(() => {
    return allBackgrounds.find(b => b.id === selectedBackgroundId) || allBackgrounds[0];
  }, [allBackgrounds, selectedBackgroundId]);

  const availableClassOptions = useMemo(() => {
    if (!currentClass) return [];
    return getClassOptionsForClass(currentClass.title);
  }, [currentClass]);

  // Derived stats
  const proficiencyBonus = calculateProficiencyBonus(level);
  const conMod = calculateModifier(abilities.con);
  const dexMod = calculateModifier(abilities.dex);
  const strMod = calculateModifier(abilities.str);

  // Hit die parsing
  const hitDieNumber = parseInt(currentClass?.hit_die?.replace('d', '') || '8', 10);
  const maxHp = (hitDieNumber + conMod) + Math.max(0, level - 1) * (Math.floor(hitDieNumber / 2) + 1 + conMod);
  const armorClass = 10 + dexMod + (selectedFightingStyles.some(s => s.toLowerCase().includes('defensive')) ? 1 : 0);

  // When class changes, reset subclass
  const handleSelectClass = (clsId: string) => {
    setSelectedClassId(clsId);
    const cls = allClasses.find(c => c.id === clsId);
    if (cls) {
      const subs = getSubclassesForClass(cls.title);
      setSelectedSubclassId(subs[0]?.id || '');
    }
  };

  const handleFinish = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setCurrentStep(6);
  };

  const generateMarkdownSheet = () => {
    return `# ${characterName}
**Level ${level} ${currentRace?.title || 'Adventurer'} ${currentClass?.title || 'Fighter'} (${currentSubclass?.title || 'None'})**
*${alignment} | Background: ${currentBackground?.title || 'None'}*

---

## Combat Statistics
- **Hit Points:** ${maxHp} (${level}d${hitDieNumber} + ${conMod * level})
- **Armor Class:** ${armorClass}
- **Proficiency Bonus:** +${proficiencyBonus}
- **Speed:** 30 ft.

## Ability Scores
| Ability | Score | Modifier |
|---|---|---|
| STR | ${abilities.str} | ${formatModifier(strMod)} |
| DEX | ${abilities.dex} | ${formatModifier(dexMod)} |
| CON | ${abilities.con} | ${formatModifier(conMod)} |
| INT | ${abilities.int} | ${formatModifier(calculateModifier(abilities.int))} |
| WIS | ${abilities.wis} | ${formatModifier(calculateModifier(abilities.wis))} |
| CHA | ${abilities.cha} | ${formatModifier(calculateModifier(abilities.cha))} |

## Proficiencies & Features
- **Saving Throws:** ${(currentClass?.saving_throws || []).join(', ')}
- **Subclass:** ${currentSubclass?.title || 'None'}
- **Feats:** ${selectedFeats.length > 0 ? selectedFeats.map(f => f.split('/').pop()).join(', ') : 'None'}
- **Fighting Styles:** ${selectedFightingStyles.length > 0 ? selectedFightingStyles.map(f => f.split('/').pop()).join(', ') : 'None'}
- **Class Options:** ${selectedClassOptions.length > 0 ? selectedClassOptions.map(f => f.split('/').pop()).join(', ') : 'None'}

## Notes & Backstory
${notes}
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMarkdownSheet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const build: CharacterBuild = {
      id: `char-${Date.now()}`,
      name: characterName,
      race: currentRace?.title || '',
      className: currentClass?.title || '',
      subclass: currentSubclass?.title || '',
      background: currentBackground?.title || '',
      alignment,
      level,
      abilities,
      selectedFeats,
      selectedFightingStyles,
      selectedClassOptions,
      equipmentChoices: [],
      notes,
      createdAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(build, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterName.toLowerCase().replace(/\s+/g, '-')}-character.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Builder Header & Stepper */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Interactive 5e Character Builder</span>
            </div>
            <h1 className="font-fantasy text-2xl md:text-3xl font-bold text-slate-100">
              Create Your Adventurer
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCharacterName('Erevan Starfall');
                setSelectedRaceId('character-options/races/Elf');
                setSelectedClassId('character-options/classes/Wizard');
                setSelectedBackgroundId('character-options/backgrounds/Acolyte');
                setLevel(3);
                setAbilities({ str: 8, dex: 14, con: 13, int: 16, wis: 12, cha: 10 });
              }}
              className="text-xs text-amber-400 hover:text-amber-200 border border-amber-500/30 rounded-lg px-3 py-1.5 transition-colors"
            >
              Load Example Character
            </button>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-5">
          {[
            { num: 1, title: 'Race / Ancestry' },
            { num: 2, title: 'Class' },
            { num: 3, title: 'Subclass' },
            { num: 4, title: 'Background' },
            { num: 5, title: 'Abilities & Feats' },
            { num: 6, title: 'Character Sheet' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                currentStep === s.num
                  ? 'border-amber-500 bg-amber-500/10 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                  : currentStep > s.num
                  ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>Step {s.num}</span>
                {currentStep > s.num && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <div className="text-xs truncate font-medium">{s.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: RACE */}
          {currentStep === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="font-fantasy text-xl font-bold text-amber-300">
                  Step 1: Choose Your Race & Ancestry
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Your race defines your origin, physical attributes, innate capabilities, and traits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allRaces.map(race => {
                  const isSelected = selectedRaceId === race.id;
                  return (
                    <div
                      key={race.id}
                      onClick={() => setSelectedRaceId(race.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 shadow-md ring-1 ring-amber-500/40'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-fantasy text-base font-bold text-slate-100">
                          {race.title}
                        </h3>
                        {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">
                        {race.summary || 'Ancestral traits and abilities.'}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                        <span className="text-amber-400 font-medium">Source: {race.source_type}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToEntry(race.id);
                          }}
                          className="hover:text-amber-300 underline"
                        >
                          View Lore →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentRace && (
                <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-fantasy text-sm font-semibold text-amber-300">
                      {currentRace.title} Traits Preview
                    </span>
                    <button
                      onClick={() => onNavigateToEntry(currentRace.id)}
                      className="text-xs text-amber-400 hover:text-amber-200 underline"
                    >
                      Full Details
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto pr-2 text-xs text-slate-300">
                    <MarkdownView content={currentRace.body.slice(0, 1000)} onNavigate={onNavigateToEntry} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CLASS */}
          {currentStep === 2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="font-fantasy text-xl font-bold text-amber-300">
                  Step 2: Choose Your Class
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Your class is your vocation, defining your martial exploits, spellcasting, or roguish talents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allClasses.map(cls => {
                  const isSelected = selectedClassId === cls.id;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleSelectClass(cls.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/15 shadow-md ring-1 ring-rose-500/40'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-fantasy text-base font-bold text-slate-100">
                          {cls.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                          {cls.hit_die || 'd8'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">
                        {cls.summary || 'Class features, combat proficiencies, and abilities.'}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                        <span>Saves: {cls.saving_throws?.join(', ') || 'N/A'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToEntry(cls.id);
                          }}
                          className="hover:text-amber-300 underline"
                        >
                          View Class →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SUBCLASS */}
          {currentStep === 3 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-fantasy text-xl font-bold text-amber-300">
                    Step 3: Choose Subclass for {currentClass.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Specialized archetypes granting distinct powers ({availableSubclasses.length} available).
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Change Class
                </button>
              </div>

              {availableSubclasses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  No subclasses specifically listed for this class. Proceed to the next step.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {availableSubclasses.map(sub => {
                    const isSelected = selectedSubclassId === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubclassId(sub.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/15 shadow-md ring-1 ring-orange-500/40'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-fantasy text-base font-bold text-slate-100">
                            {sub.title}
                          </h3>
                          {isSelected && <Check className="w-4 h-4 text-orange-400" />}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                          {sub.summary || 'Subclass specialization features.'}
                        </p>
                        <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                          <span className="text-amber-400">{sub.source_type}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToEntry(sub.id);
                            }}
                            className="hover:text-amber-300 underline"
                          >
                            Read Features →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: BACKGROUND & IDENTITY */}
          {currentStep === 4 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="font-fantasy text-xl font-bold text-amber-300">
                  Step 4: Character Identity & Background
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Name your adventurer, select their background upbringing, and set their alignment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Starting Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => (
                      <option key={lvl} value={lvl}>Level {lvl} (Prof: +{calculateProficiencyBonus(lvl)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Alignment
                  </label>
                  <select
                    value={alignment}
                    onChange={(e) => setAlignment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                  >
                    <option value="Lawful Good">Lawful Good</option>
                    <option value="Neutral Good">Neutral Good</option>
                    <option value="Chaotic Good">Chaotic Good</option>
                    <option value="Lawful Neutral">Lawful Neutral</option>
                    <option value="True Neutral">True Neutral</option>
                    <option value="Chaotic Neutral">Chaotic Neutral</option>
                    <option value="Lawful Evil">Lawful Evil</option>
                    <option value="Neutral Evil">Neutral Evil</option>
                    <option value="Chaotic Evil">Chaotic Evil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Background
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allBackgrounds.map(bg => {
                    const isSelected = selectedBackgroundId === bg.id;
                    return (
                      <div
                        key={bg.id}
                        onClick={() => setSelectedBackgroundId(bg.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500/15 shadow-md ring-1 ring-teal-500/40'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-fantasy text-sm font-bold text-slate-100">
                          {bg.title}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                          {bg.summary || 'Background feature, proficiencies, equipment.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ABILITIES, FEATS & OPTIONS */}
          {currentStep === 5 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="font-fantasy text-xl font-bold text-amber-300">
                  Step 5: Ability Scores, Feats & Options
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Tune ability scores and select customized martial exploits, invocations, or feats.
                </p>
              </div>

              {/* Ability Scores Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Core Ability Scores
                  </span>
                  <button
                    onClick={() => setAbilities(DEFAULT_ABILITIES)}
                    className="text-xs text-amber-400 hover:text-amber-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Standard Array
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as (keyof AbilityScores)[]).map(attr => {
                    const val = abilities[attr];
                    const mod = calculateModifier(val);
                    return (
                      <div key={attr} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                        <span className="text-xs font-bold uppercase text-amber-300 tracking-wider">
                          {attr}
                        </span>
                        <div className="text-xl font-bold text-slate-100 my-1 font-mono">
                          {formatModifier(mod)}
                        </div>
                        <input
                          type="number"
                          min={3}
                          max={20}
                          value={val}
                          onChange={(e) => setAbilities({ ...abilities, [attr]: Number(e.target.value) })}
                          className="w-14 text-center bg-slate-900 border border-slate-700 rounded text-xs py-1 text-slate-200"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Class specific options (e.g. Invocations / Exploits) */}
              {availableClassOptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-300 mb-2">
                    Class Specializations ({currentClass.title})
                  </h3>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                    {availableClassOptions.slice(0, 30).map(opt => {
                      const isChecked = selectedClassOptions.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedClassOptions(selectedClassOptions.filter(x => x !== opt.id));
                                } else {
                                  setSelectedClassOptions([...selectedClassOptions, opt.id]);
                                }
                              }}
                              className="rounded border-slate-700 text-amber-500 focus:ring-0"
                            />
                            <span className="text-slate-200 font-medium">{opt.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onNavigateToEntry(opt.id)}
                            className="text-amber-400 hover:underline"
                          >
                            Details
                          </button>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feats Selector */}
              <div>
                <h3 className="text-sm font-semibold text-amber-300 mb-2">
                  Optional Feats & Talents
                </h3>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {allFeats.map(feat => {
                    const isChecked = selectedFeats.includes(feat.id);
                    return (
                      <label
                        key={feat.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedFeats(selectedFeats.filter(x => x !== feat.id));
                              } else {
                                setSelectedFeats([...selectedFeats, feat.id]);
                              }
                            }}
                            className="rounded border-slate-700 text-amber-500 focus:ring-0"
                          />
                          <span className="text-slate-200 font-medium">{feat.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigateToEntry(feat.id)}
                          className="text-amber-400 hover:underline"
                        >
                          View Feat
                        </button>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: FINISHED CHARACTER SHEET */}
          {currentStep === 6 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-emerald-400">Character Ready</span>
                  <h2 className="font-fantasy text-2xl font-bold text-slate-100">
                    {characterName}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Level {level} {currentRace?.title} {currentClass?.title} • {currentSubclass?.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
                  </button>
                  <button
                    onClick={downloadJson}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Combat Core Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Max HP</span>
                    <div className="text-xl font-bold text-slate-100 font-mono">{maxHp}</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Armor Class</span>
                    <div className="text-xl font-bold text-slate-100 font-mono">{armorClass}</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Proficiency</span>
                    <div className="text-xl font-bold text-slate-100 font-mono">+{proficiencyBonus}</div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Hit Die</span>
                    <div className="text-xl font-bold text-slate-100 font-mono">
                      {level}{currentClass?.hit_die || 'd8'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ability Modifiers Bar */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="grid grid-cols-6 gap-2 text-center">
                  {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as (keyof AbilityScores)[]).map(attr => {
                    const score = abilities[attr];
                    const mod = calculateModifier(score);
                    return (
                      <div key={attr} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-[11px] font-bold text-amber-400 uppercase">{attr}</span>
                        <div className="text-lg font-bold text-slate-100 font-mono">{formatModifier(mod)}</div>
                        <span className="text-[10px] text-slate-400 font-mono">({score})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chosen Features Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-fantasy font-semibold text-amber-300">Class & Heritage Details</span>
                  <div><strong>Race:</strong> {currentRace?.title}</div>
                  <div><strong>Class:</strong> {currentClass?.title} ({currentClass?.hit_die})</div>
                  <div><strong>Subclass:</strong> {currentSubclass?.title || 'None'}</div>
                  <div><strong>Saving Throws:</strong> {currentClass?.saving_throws?.join(', ')}</div>
                  <div><strong>Background:</strong> {currentBackground?.title}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-fantasy font-semibold text-amber-300">Special Options & Feats</span>
                  <div>
                    <strong>Feats ({selectedFeats.length}):</strong>{' '}
                    {selectedFeats.length ? selectedFeats.map(f => f.split('/').pop()).join(', ') : 'None'}
                  </div>
                  <div>
                    <strong>Fighting Styles:</strong>{' '}
                    {selectedFightingStyles.length ? selectedFightingStyles.map(f => f.split('/').pop()).join(', ') : 'None'}
                  </div>
                  <div>
                    <strong>Class Options ({selectedClassOptions.length}):</strong>{' '}
                    {selectedClassOptions.length ? selectedClassOptions.map(f => f.split('/').pop()).join(', ') : 'None'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : currentStep === 5 ? (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-xl ring-2 ring-amber-400/50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Finish Character!</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Right 1 Col: Live Character Summary Card */}
        <div className="space-y-4">
          <div className="sticky top-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-fantasy text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                <span>Adventurer Card</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono border border-amber-500/30">
                Lv {level}
              </span>
            </div>

            <div>
              <div className="text-base font-bold text-slate-100 font-fantasy">{characterName}</div>
              <div className="text-xs text-amber-400 font-medium">
                {currentRace?.title} • {currentClass?.title}
              </div>
              {currentSubclass && (
                <div className="text-[11px] text-slate-400">
                  {currentSubclass.title} Archetype
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">HP</span>
                <span className="font-bold text-rose-400 font-mono">{maxHp}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">AC</span>
                <span className="font-bold text-blue-400 font-mono">{armorClass}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Prof.</span>
                <span className="font-bold text-amber-400 font-mono">+{proficiencyBonus}</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 pt-1 border-t border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Background:</span>
                <span className="text-slate-200 font-medium">{currentBackground?.title}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Alignment:</span>
                <span className="text-slate-200 font-medium">{alignment}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hit Die:</span>
                <span className="text-slate-200 font-mono">1{currentClass?.hit_die || 'd8'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1.5">
                Ability Modifiers
              </span>
              <div className="grid grid-cols-6 gap-1 text-center font-mono text-[11px]">
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as (keyof AbilityScores)[]).map(a => (
                  <div key={a} className="bg-slate-950 py-1 rounded border border-slate-800">
                    <div className="text-[9px] uppercase text-slate-500">{a}</div>
                    <div className="font-bold text-amber-300">{formatModifier(calculateModifier(abilities[a]))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
