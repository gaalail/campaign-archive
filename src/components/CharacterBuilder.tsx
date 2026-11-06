import React, { useState, useMemo } from 'react';
import { archiveDb, getSubclassesForClass } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import { Sparkles, Shield, Heart, ArrowRight, ArrowLeft, Check, RefreshCw, Copy, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CharacterBuilderProps {
  onNavigateToEntry: (id: string) => void;
}

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ onNavigateToEntry }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedRace, setSelectedRace] = useState<ArchiveEntry | null>(null);
  const [selectedClass, setSelectedClass] = useState<ArchiveEntry | null>(null);
  const [selectedSubclass, setSelectedSubclass] = useState<ArchiveEntry | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<ArchiveEntry | null>(null);
  const [characterName, setCharacterName] = useState<string>('Hero of the Realm');
  const [copied, setCopied] = useState<boolean>(false);

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

  const subclasses = useMemo(() => {
    if (!selectedClass) return [];
    return getSubclassesForClass(selectedClass.title).sort((a, b) => a.title.localeCompare(b.title));
  }, [selectedClass]);

  const backgrounds = useMemo(() => {
    return archiveDb.entries
      .filter(e => e.category === 'backgrounds' && !e.id.endsWith('/index'))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const handleFinish = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setStep(5);
  };

  const copySummary = () => {
    const text = `=== 5e D&D Character ===
Name: ${characterName}
Race: ${selectedRace?.title || 'None'}
Class: ${selectedClass?.title || 'None'}${selectedSubclass ? ` (${selectedSubclass.title})` : ''}
Hit Die: ${selectedClass?.hit_die || '1d8'}
Saving Throws: ${selectedClass?.saving_throws?.join(', ') || 'None'}
Background: ${selectedBackground?.title || 'None'}
Background Summary: ${selectedBackground?.summary || 'None'}
Generated via Campaign Archive 5e Wiki`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Progress Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step-by-Step Creation</span>
            </div>
            <h1 className="font-fantasy text-2xl md:text-3xl font-bold text-slate-100">
              5e Character Builder
            </h1>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Step {step} of 5
          </div>
        </div>

        {/* Wizard Steps Navigation */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { num: 1, label: 'Race' },
            { num: 2, label: 'Class' },
            { num: 3, label: 'Subclass' },
            { num: 4, label: 'Background' },
            { num: 5, label: 'Review' }
          ].map(s => (
            <button
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              disabled={s.num > step}
              className={`py-2 px-1 rounded-xl font-medium transition-all flex flex-col items-center gap-1 ${
                step === s.num
                  ? 'bg-amber-500 text-slate-950 shadow font-bold'
                  : s.num < step
                  ? 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  : 'text-slate-600 bg-slate-950/40 cursor-not-allowed'
              }`}
            >
              <span className="text-[10px] font-mono opacity-80">0{s.num}</span>
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Pick Race */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-fantasy text-xl font-bold text-slate-100">Step 1: Choose Your Race</h2>
            <p className="text-xs text-slate-400">Select your character's ancestry, physical traits, and racial features.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {races.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRace(r)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  selectedRace?.id === r.id
                    ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-fantasy font-bold text-slate-200 text-sm">{r.title}</div>
                  {r.summary && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{r.summary}</div>}
                </div>
                {selectedRace?.id === r.id && (
                  <div className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedRace}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedRace
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Class</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Pick Class */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-fantasy text-xl font-bold text-slate-100">Step 2: Choose Your Class</h2>
              <p className="text-xs text-slate-400">Your class governs your role, hit die, weapon/armor proficiencies, and combat features.</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Race
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedClass(c);
                  setSelectedSubclass(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  selectedClass?.id === c.id
                    ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-fantasy font-bold text-slate-200 text-sm">{c.title}</span>
                    {c.hit_die && (
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-900 px-1.5 py-0.5 rounded">
                        {c.hit_die}
                      </span>
                    )}
                  </div>
                  {c.summary && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{c.summary}</div>}
                  {c.saving_throws && c.saving_throws.length > 0 && (
                    <div className="text-[10px] text-slate-500 mt-2">
                      Saves: {c.saving_throws.join(', ')}
                    </div>
                  )}
                </div>
                {selectedClass?.id === c.id && (
                  <div className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedClass}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedClass
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Subclass</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Pick Subclass */}
      {step === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-fantasy text-xl font-bold text-slate-100">Step 3: Pick Archetype / Subclass</h2>
              <p className="text-xs text-slate-400">Available specializations for {selectedClass?.title || 'your class'}.</p>
            </div>
            <button onClick={() => setStep(2)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Class
            </button>
          </div>

          {subclasses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {subclasses.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubclass(sub)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                    selectedSubclass?.id === sub.id
                      ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-fantasy font-bold text-slate-200 text-sm">{sub.title}</div>
                    {sub.summary && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{sub.summary}</div>}
                  </div>
                  {selectedSubclass?.id === sub.id && (
                    <div className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              No specific subclasses found for {selectedClass?.title}. You can continue to Background.
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white">
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow flex items-center gap-2"
            >
              <span>Continue to Background</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pick Background */}
      {step === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-fantasy text-xl font-bold text-slate-100">Step 4: Choose Background</h2>
              <p className="text-xs text-slate-400">Background defines your character's upbringing, proficiencies, and unique narrative perk.</p>
            </div>
            <button onClick={() => setStep(3)} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Subclass
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {backgrounds.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBackground(b)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  selectedBackground?.id === b.id
                    ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-fantasy font-bold text-slate-200 text-sm">{b.title}</div>
                  {b.summary && <div className="text-xs text-slate-400 mt-1 line-clamp-2">{b.summary}</div>}
                </div>
                {selectedBackground?.id === b.id && (
                  <div className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button onClick={() => setStep(3)} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white">
              Back
            </button>
            <button
              onClick={handleFinish}
              disabled={!selectedBackground}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedBackground
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Complete Character Review</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Character Review & Sheet */}
      {step === 5 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">Character Sheet Preview</div>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="bg-transparent font-fantasy text-2xl md:text-3xl font-bold text-slate-100 border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copySummary}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Race</span>
              <span className="text-base font-bold text-slate-100 block">{selectedRace?.title || 'None'}</span>
              {selectedRace && (
                <button
                  onClick={() => onNavigateToEntry(selectedRace.id)}
                  className="text-xs text-amber-400 hover:text-amber-200 underline pt-1 block"
                >
                  View Details →
                </button>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Class</span>
              <span className="text-base font-bold text-slate-100 block">{selectedClass?.title || 'None'}</span>
              {selectedClass && (
                <button
                  onClick={() => onNavigateToEntry(selectedClass.id)}
                  className="text-xs text-amber-400 hover:text-amber-200 underline pt-1 block"
                >
                  View Class & Spells →
                </button>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Subclass</span>
              <span className="text-base font-bold text-slate-100 block">{selectedSubclass?.title || 'Standard Progression'}</span>
              {selectedSubclass && (
                <button
                  onClick={() => onNavigateToEntry(selectedSubclass.id)}
                  className="text-xs text-amber-400 hover:text-amber-200 underline pt-1 block"
                >
                  View Archetype →
                </button>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Background</span>
              <span className="text-base font-bold text-slate-100 block">{selectedBackground?.title || 'None'}</span>
              {selectedBackground && (
                <button
                  onClick={() => onNavigateToEntry(selectedBackground.id)}
                  className="text-xs text-amber-400 hover:text-amber-200 underline pt-1 block"
                >
                  View Background Perks →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
