import React, { useState } from 'react';
import { CharacterState, AbilityKey, ABILITY_LABELS } from './types';
import { ArchiveEntry } from '../../types/archive';
import { DerivedStats, formatModifier } from './builderUtils';
import { Shield, Heart, Zap, Eye, Wind, ChevronDown, ChevronUp, Sparkles, BookOpen, Award } from 'lucide-react';
import { DragonShield } from '../GothicIcons';

interface CharacterHudProps {
  state: CharacterState;
  selectedRace: ArchiveEntry | null;
  selectedClass: ArchiveEntry | null;
  selectedSubclass: ArchiveEntry | null;
  selectedBackground: ArchiveEntry | null;
  derived: DerivedStats;
  onJumpToStep: (step: number) => void;
}

export const CharacterHud: React.FC<CharacterHudProps> = ({
  state,
  selectedRace,
  selectedClass,
  selectedSubclass,
  selectedBackground,
  derived,
  onJumpToStep
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="sticky top-2 z-30 transition-all duration-200">
      <div className="rounded-2xl border border-amber-900/60 bg-stone-900/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Main Header Bar */}
        <div className="p-3 md:px-5 md:py-3.5 flex items-center justify-between gap-3 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <DragonShield className="w-4 h-4 text-amber-400" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-stone-100 text-sm md:text-base truncate">
                  {state.name || 'Nameless Hero'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-900/60 shrink-0">
                  Lvl 1
                </span>
              </div>
              
              <div className="text-xs text-stone-400 truncate flex items-center gap-1.5 font-sans">
                <span className="text-amber-200/90 font-medium">
                  {selectedRace?.title || 'Race Unset'}
                </span>
                <span>•</span>
                <span className="text-stone-200 font-medium">
                  {selectedClass?.title || 'Class Unset'}
                  {selectedSubclass ? ` (${selectedSubclass.title})` : ''}
                </span>
                {selectedBackground && (
                  <>
                    <span>•</span>
                    <span className="text-stone-400 hidden sm:inline">{selectedBackground.title}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Highlights */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* HP */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-900 text-rose-300 text-xs font-mono font-bold shadow-inner" title="Maximum Hit Points">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
              <span>{derived.maxHp} HP</span>
            </div>

            {/* AC */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-900 text-emerald-300 text-xs font-mono font-bold shadow-inner" title="Armor Class">
              <Shield className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />
              <span>{derived.armorClass} AC</span>
            </div>

            {/* Initiative */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-900 text-cyan-300 text-xs font-mono font-bold shadow-inner" title="Initiative Modifier">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatModifier(derived.initiative)} Init</span>
            </div>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              title={isCollapsed ? 'Expand Live Stats HUD' : 'Collapse HUD'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Expanded Panel */}
        {!isCollapsed && (
          <div className="p-3 md:p-4 bg-stone-900/60 space-y-3">
            {/* Ability Scores Grid */}
            <div className="grid grid-cols-6 gap-1.5 md:gap-2">
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as AbilityKey[]).map((ability) => {
                const score = derived.finalAbilities[ability];
                const mod = derived.modifiers[ability];
                const isProfSave = derived.savingThrows[ability]?.proficient;
                const isPrimary = selectedClass?.frontmatter?.primary_ability?.toLowerCase()?.includes(ability) ||
                                  selectedClass?.frontmatter?.primary_stat?.toLowerCase()?.includes(ability);

                return (
                  <div
                    key={ability}
                    className={`rounded-xl p-1.5 md:p-2 text-center border transition-all ${
                      isPrimary
                        ? 'border-amber-500/80 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'border-stone-800 bg-stone-950/80'
                    }`}
                  >
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center justify-center gap-0.5">
                      <span>{ABILITY_LABELS[ability].abbr}</span>
                      {isProfSave && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Proficient in Saving Throw" />}
                    </div>
                    <div className="text-sm md:text-base font-mono font-bold text-stone-100">
                      {score}
                    </div>
                    <div className={`text-[11px] md:text-xs font-mono font-semibold ${
                      mod >= 0 ? 'text-amber-400' : 'text-stone-400'
                    }`}>
                      {formatModifier(mod)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tactical Secondary Row: Speed, Passive Perception, Proficiency Bonus, Spell DC */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans">
              <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-stone-400" />
                  <span>Speed:</span>
                </span>
                <span className="font-mono font-semibold text-stone-200">{derived.speed}</span>
              </div>

              <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>Pass. Percept.:</span>
                </span>
                <span className="font-mono font-semibold text-teal-300">{derived.passivePerception}</span>
              </div>

              <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Proficiency:</span>
                </span>
                <span className="font-mono font-semibold text-amber-300">+{derived.proficiencyBonus}</span>
              </div>

              <div className="p-2 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Spell Save DC:</span>
                </span>
                <span className="font-mono font-semibold text-violet-300">
                  {derived.spellSaveDc ? derived.spellSaveDc : '—'}
                </span>
              </div>
            </div>

            {/* Quick jump to step 6 */}
            {state.step < 6 && (
              <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
                <span>Changes to race, class, and ability scores update stats in real-time.</span>
                <button
                  onClick={() => onJumpToStep(6)}
                  className="text-amber-400 hover:text-amber-200 underline font-medium cursor-pointer"
                >
                  Preview Final Sheet →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
