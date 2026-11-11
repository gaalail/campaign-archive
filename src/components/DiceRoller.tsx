import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X, RotateCcw, History, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { D20GothicIcon, CrossedSwords } from './GothicIcons';

export interface DiceRollResult {
  id: string;
  formula: string;
  label?: string;
  rolls: number[];
  modifier: number;
  total: number;
  isD20: boolean;
  isCritSuccess: boolean;
  isCritFail: boolean;
  advantageMode?: 'normal' | 'advantage' | 'disadvantage';
  d20Rolls?: [number, number];
  keptIndex?: number;
  timestamp: number;
}

interface DiceContextType {
  roll: (formula: string, label?: string, advMode?: 'normal' | 'advantage' | 'disadvantage') => DiceRollResult;
  lastRoll: DiceRollResult | null;
  history: DiceRollResult[];
  clearHistory: () => void;
  openTray: () => void;
}

const DiceContext = createContext<DiceContextType | null>(null);

export const useDice = () => {
  const ctx = useContext(DiceContext);
  if (!ctx) {
    throw new Error('useDice must be used within a DiceProvider');
  }
  return ctx;
};

export const useOptionalDice = () => {
  return useContext(DiceContext);
};

export function parseAndRollFormula(
  formula: string,
  label?: string,
  advMode: 'normal' | 'advantage' | 'disadvantage' = 'normal'
): DiceRollResult {
  const cleanFormula = formula.trim().replace(/\s+/g, '');
  // Match forms like "2d6+3", "1d20-2", "d20", "4d8", "1d20"
  const regex = /^(\d*)d(\d+)(?:([+-])(\d+))?$/i;
  const match = cleanFormula.match(regex);

  let numDice = 1;
  let diceSides = 20;
  let modifier = 0;

  if (match) {
    numDice = match[1] ? parseInt(match[1], 10) : 1;
    diceSides = parseInt(match[2], 10);
    if (match[3] && match[4]) {
      const sign = match[3] === '-' ? -1 : 1;
      modifier = sign * parseInt(match[4], 10);
    }
  } else {
    // Fallback: check if just pure number or weird formula
    const numOnly = parseInt(cleanFormula, 10);
    if (!isNaN(numOnly)) {
      numDice = 1;
      diceSides = 20;
      modifier = numOnly;
    }
  }

  // Safety limits
  numDice = Math.max(1, Math.min(100, numDice));
  diceSides = Math.max(2, Math.min(1000, diceSides));

  const isD20 = diceSides === 20 && numDice === 1;
  let rolls: number[] = [];
  let d20Rolls: [number, number] | undefined = undefined;
  let keptIndex: number | undefined = undefined;

  if (isD20 && (advMode === 'advantage' || advMode === 'disadvantage')) {
    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    d20Rolls = [roll1, roll2];

    if (advMode === 'advantage') {
      keptIndex = roll1 >= roll2 ? 0 : 1;
    } else {
      keptIndex = roll1 <= roll2 ? 0 : 1;
    }
    rolls = [d20Rolls[keptIndex]];
  } else {
    for (let i = 0; i < numDice; i++) {
      rolls.push(Math.floor(Math.random() * diceSides) + 1);
    }
  }

  const diceSum = rolls.reduce((acc, v) => acc + v, 0);
  const total = diceSum + modifier;

  const isCritSuccess = isD20 && rolls[0] === 20;
  const isCritFail = isD20 && rolls[0] === 1;

  if (isCritSuccess) {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8, x: 0.85 },
        colors: ['#f59e0b', '#fbbf24', '#d97706', '#fef08a']
      });
    } catch {
      // Ignored in non-browser or test contexts
    }
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    formula,
    label,
    rolls,
    modifier,
    total,
    isD20,
    isCritSuccess,
    isCritFail,
    advantageMode: isD20 ? advMode : 'normal',
    d20Rolls,
    keptIndex,
    timestamp: Date.now()
  };
}

export const DiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<DiceRollResult[]>([]);
  const [lastRoll, setLastRoll] = useState<DiceRollResult | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);

  const roll = (formula: string, label?: string, advMode: 'normal' | 'advantage' | 'disadvantage' = 'normal') => {
    const res = parseAndRollFormula(formula, label, advMode);
    setLastRoll(res);
    setHistory(prev => [res, ...prev.slice(0, 49)]);
    setShowToast(true);

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setShowToast(false);
    }, 7000);

    return res;
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <DiceContext.Provider value={{ roll, lastRoll, history, clearHistory, openTray: () => setTrayOpen(true) }}>
      {children}

      {/* Floating Roll Result HUD / Toast */}
      {showToast && lastRoll && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm w-80 animate-in slide-in-from-bottom-4 duration-200">
          <div className={`p-4 rounded-xl border shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all ${
            lastRoll.isCritSuccess
              ? 'bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900/80 border-amber-500 ring-2 ring-amber-500/50 shadow-amber-950/80'
              : lastRoll.isCritFail
              ? 'bg-gradient-to-br from-rose-950 via-stone-900 to-rose-950/80 border-rose-600 ring-2 ring-rose-500/50 shadow-rose-950/80'
              : 'bg-stone-900/95 border-amber-900/70 text-stone-200'
          }`}>
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-serif font-bold text-xs uppercase tracking-wider">
                <D20GothicIcon className={`w-4 h-4 ${lastRoll.isCritSuccess ? 'text-amber-400' : lastRoll.isCritFail ? 'text-rose-400' : 'text-amber-500'}`} />
                <span className={lastRoll.isCritSuccess ? 'text-amber-300' : lastRoll.isCritFail ? 'text-rose-300' : 'text-stone-300'}>
                  {lastRoll.label || `Roll: ${lastRoll.formula}`}
                </span>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-stone-400 hover:text-white p-1 rounded hover:bg-stone-800/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Total and critical indicators */}
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <div className="text-3xl font-fantasy font-bold text-amber-200 flex items-baseline gap-2">
                  <span>{lastRoll.total}</span>
                  {lastRoll.isCritSuccess && (
                    <span className="text-xs font-serif font-bold tracking-widest text-amber-400 uppercase bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                      Natural 20!
                    </span>
                  )}
                  {lastRoll.isCritFail && (
                    <span className="text-xs font-serif font-bold tracking-widest text-rose-400 uppercase bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
                      Natural 1!
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-stone-400 mt-0.5">
                  {lastRoll.d20Rolls ? (
                    <span>
                      [{lastRoll.d20Rolls[0]}, {lastRoll.d20Rolls[1]}]{' '}
                      <span className="text-amber-400">({lastRoll.advantageMode})</span>
                      {lastRoll.modifier !== 0 && ` ${lastRoll.modifier >= 0 ? `+ ${lastRoll.modifier}` : `- ${Math.abs(lastRoll.modifier)}`}`}
                    </span>
                  ) : (
                    <span>
                      [{lastRoll.rolls.join(' + ')}]
                      {lastRoll.modifier !== 0 && ` ${lastRoll.modifier >= 0 ? `+ ${lastRoll.modifier}` : `- ${Math.abs(lastRoll.modifier)}`}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Reroll button */}
              <button
                onClick={() => roll(lastRoll.formula, lastRoll.label, lastRoll.advantageMode)}
                title="Reroll this formula"
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-100 border border-stone-700 transition-colors flex items-center gap-1 text-xs font-serif"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reroll</span>
              </button>
            </div>

            {/* d20 Quick Modifiers if applicable */}
            {lastRoll.isD20 && (
              <div className="flex items-center gap-1.5 pt-2 border-t border-stone-800/80 text-[10px] font-serif">
                <button
                  onClick={() => roll(lastRoll.formula, lastRoll.label, 'advantage')}
                  className={`px-2 py-1 rounded transition-colors ${
                    lastRoll.advantageMode === 'advantage'
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-emerald-300'
                  }`}
                >
                  Advantage
                </button>
                <button
                  onClick={() => roll(lastRoll.formula, lastRoll.label, 'disadvantage')}
                  className={`px-2 py-1 rounded transition-colors ${
                    lastRoll.advantageMode === 'disadvantage'
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-500/50 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-rose-300'
                  }`}
                >
                  Disadvantage
                </button>
                <button
                  onClick={() => roll(lastRoll.formula, lastRoll.label, 'normal')}
                  className={`px-2 py-1 rounded transition-colors ${
                    lastRoll.advantageMode === 'normal'
                      ? 'bg-amber-900/60 text-amber-300 border border-amber-500/50 font-bold'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Normal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating d20 Launcher Toggle */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setTrayOpen(!trayOpen)}
          className="group relative flex items-center gap-2 rounded-full border border-amber-600/60 bg-gradient-to-r from-amber-700 via-stone-900 to-amber-900 px-4 py-2.5 text-xs font-serif font-bold text-amber-200 shadow-xl shadow-amber-950/60 hover:border-amber-400 hover:text-amber-100 transition-all hover:scale-105 active:scale-95"
        >
          <D20GothicIcon className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
          <span>Dice Tray</span>
          {history.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Interactive Dice Tray Drawer */}
      {trayOpen && (
        <DiceTrayModal
          isOpen={trayOpen}
          onClose={() => setTrayOpen(false)}
          onRoll={(f, l, a) => roll(f, l, a)}
          history={history}
          onClearHistory={clearHistory}
        />
      )}
    </DiceContext.Provider>
  );
};

interface DiceTrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoll: (formula: string, label?: string, adv?: 'normal' | 'advantage' | 'disadvantage') => void;
  history: DiceRollResult[];
  onClearHistory: () => void;
}

const DiceTrayModal: React.FC<DiceTrayModalProps> = ({
  onClose,
  onRoll,
  history,
  onClearHistory
}) => {
  const [customFormula, setCustomFormula] = useState('');
  const [modifier, setModifier] = useState<number>(0);
  const [advMode, setAdvMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');
  const [activeTab, setActiveTab] = useState<'roller' | 'history'>('roller');

  const dicePresets = [
    { label: 'd4', sides: 4 },
    { label: 'd6', sides: 6 },
    { label: 'd8', sides: 8 },
    { label: 'd10', sides: 10 },
    { label: 'd12', sides: 12 },
    { label: 'd20', sides: 20 },
    { label: 'd100', sides: 100 }
  ];

  const handlePresetRoll = (sides: number) => {
    let formula = `1d${sides}`;
    if (modifier !== 0) {
      formula += modifier > 0 ? `+${modifier}` : `${modifier}`;
    }
    onRoll(formula, sides === 20 ? 'd20 Check' : `1d${sides}`, advMode);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormula.trim()) return;
    onRoll(customFormula.trim(), 'Custom Roll', advMode);
    setCustomFormula('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-3 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md bg-stone-900 border border-amber-900/60 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <D20GothicIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-fantasy font-bold text-amber-200 text-base">Grimoire Dice Tray</h3>
              <p className="text-[10px] text-stone-400 font-serif">Quick tabletop rolls & history</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab(activeTab === 'roller' ? 'history' : 'roller')}
              className={`p-1.5 rounded-lg text-xs font-serif flex items-center gap-1 transition-colors ${
                activeTab === 'history'
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Toggle Roll History"
            >
              <History className="w-3.5 h-3.5" />
              <span>{history.length}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'roller' ? (
          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Advantage Mode Selector */}
            <div>
              <label className="text-[11px] font-serif font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                D20 Roll Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAdvMode('normal')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-serif font-medium border transition-colors ${
                    advMode === 'normal'
                      ? 'bg-amber-600 text-stone-950 border-amber-500 font-bold'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setAdvMode('advantage')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-serif font-medium border transition-colors ${
                    advMode === 'advantage'
                      ? 'bg-emerald-600 text-stone-950 border-emerald-500 font-bold'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-emerald-300'
                  }`}
                >
                  Advantage
                </button>
                <button
                  type="button"
                  onClick={() => setAdvMode('disadvantage')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-serif font-medium border transition-colors ${
                    advMode === 'disadvantage'
                      ? 'bg-rose-600 text-stone-950 border-rose-500 font-bold'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-rose-300'
                  }`}
                >
                  Disadvantage
                </button>
              </div>
            </div>

            {/* Modifier input */}
            <div className="flex items-center justify-between bg-stone-950 p-2.5 rounded-xl border border-stone-800">
              <span className="text-xs font-serif text-stone-300 font-medium">Flat Modifier:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModifier(prev => prev - 1)}
                  className="w-7 h-7 rounded bg-stone-800 text-stone-200 hover:bg-stone-700 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono text-sm font-bold text-amber-300">
                  {modifier >= 0 ? `+${modifier}` : modifier}
                </span>
                <button
                  type="button"
                  onClick={() => setModifier(prev => prev + 1)}
                  className="w-7 h-7 rounded bg-stone-800 text-stone-200 hover:bg-stone-700 flex items-center justify-center font-bold"
                >
                  +
                </button>
                {modifier !== 0 && (
                  <button
                    type="button"
                    onClick={() => setModifier(0)}
                    className="text-[10px] text-stone-500 hover:text-stone-300 ml-1 underline"
                  >
                    reset
                  </button>
                )}
              </div>
            </div>

            {/* Standard Polyhedral Dice Buttons */}
            <div>
              <label className="text-[11px] font-serif font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Polyhedral Dice
              </label>
              <div className="grid grid-cols-4 gap-2">
                {dicePresets.map(d => (
                  <button
                    key={d.label}
                    onClick={() => handlePresetRoll(d.sides)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-stone-800 to-stone-900 border border-stone-700 hover:border-amber-500/70 text-amber-200 hover:text-amber-100 hover:shadow-lg transition-all active:scale-95 group"
                  >
                    <span className="font-fantasy font-bold text-lg group-hover:scale-110 transition-transform">
                      {d.label}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : 'roll'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Formula Expression */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-stone-800">
              <label className="text-[11px] font-serif font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Custom Expression
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="e.g. 3d6+4, 8d6, 1d12+5"
                  className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm font-mono text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!customFormula.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-serif font-bold text-xs transition-colors"
                >
                  Roll
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* History View */
          <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs font-serif text-stone-400 font-semibold">Past Rolls</span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline font-serif"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs font-serif">
                No rolls yet in this session.
              </div>
            ) : (
              <div className="space-y-1.5">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between text-xs font-sans"
                  >
                    <div>
                      <div className="font-serif font-bold text-stone-200 flex items-center gap-1.5">
                        <span>{h.label || h.formula}</span>
                        {h.isCritSuccess && <span className="text-[9px] text-amber-400 font-mono">NAT 20</span>}
                        {h.isCritFail && <span className="text-[9px] text-rose-400 font-mono">NAT 1</span>}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {h.d20Rolls ? `[${h.d20Rolls.join(', ')}]` : `[${h.rolls.join(', ')}]`}
                        {h.modifier !== 0 && ` ${h.modifier >= 0 ? `+${h.modifier}` : `${h.modifier}`}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-fantasy font-bold text-base text-amber-300">
                        {h.total}
                      </span>
                      <button
                        onClick={() => onRoll(h.formula, h.label, h.advantageMode)}
                        title="Roll again"
                        className="p-1 text-stone-500 hover:text-amber-300"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
