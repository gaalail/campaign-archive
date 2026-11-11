import React from 'react';
import { X, Sparkles, Sword, BookOpen, Shield, Flame, Network, CheckCircle2, Search } from 'lucide-react';
import { WaxSeal, CrossedSwords, GothicBat, DragonShield, DndFleuronDivider, D20GothicIcon } from './GothicIcons';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border-2 border-amber-900/70 bg-gradient-to-b from-[#1c1815] via-[#14100e] to-[#0d0a09] shadow-2xl overflow-hidden font-serif">
        {/* Header */}
        <div className="p-6 border-b border-amber-900/40 flex items-center justify-between shrink-0 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <WaxSeal label="5e" className="w-6 h-6 text-[10px]" />
            <div>
              <h2 className="font-fantasy text-2xl font-bold text-amber-200 tracking-wide">
                Codex Chronicles & What's New
              </h2>
              <p className="text-xs text-amber-500/80 uppercase tracking-widest font-semibold">
                Major Campaign Archive Releases & Homebrew Integrations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Changelog Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-stone-300 text-sm leading-relaxed">
          {/* Release: Interactive Living Archive */}
          <div className="space-y-3 rounded-xl border border-amber-500/60 bg-gradient-to-br from-amber-950/40 via-stone-950/80 to-stone-900/90 p-5 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/50 pb-2">
              <div className="flex items-center gap-2">
                <D20GothicIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-fantasy text-lg font-bold text-amber-200">
                  Living Archive & Interactive Tabletop Tools
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                Latest Update
              </span>
            </div>

            <p className="text-xs text-stone-300 font-serif">
              Transformed the compendium into a fully interactive digital tabletop suite:
            </p>

            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <D20GothicIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Universal Dice Engine & Toast: </strong>
                  <span>Every dice formula in spells, traits, and monster attacks (e.g. <code>2d6 + 3</code>, <code>1d20 + 5</code>) is now a clickable roll chip. Features Advantage/Disadvantage toggles, roll breakdown, history drawer, and golden confetti on Natural 20s.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Command Palette (Ctrl+K / Cmd+K): </strong>
                  <span>Instant keyboard-navigable search across all 1,223 spells, monsters, magic items, rules, and campaigns with instant category filtering.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Wikilink Hover Cards: </strong>
                  <span>Hover over any <code>[[wikilink]]</code> to inspect its source badge, key attributes (CR, AC/HP, Spell School & Level, Item Rarity), and narrative excerpt without leaving your reading place.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Release 1: Classes & Barbarian Primal Paths */}
          <div className="space-y-3 rounded-xl border border-amber-900/40 bg-stone-950/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/30 pb-2">
              <div className="flex items-center gap-2">
                <CrossedSwords className="w-4 h-4 text-amber-400" />
                <h3 className="font-fantasy text-lg font-bold text-amber-300">
                  New Classes & Primal Archetypes
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60">
                Major Release
              </span>
            </div>

            <p className="text-xs text-stone-300 font-serif">
              Integrated complete progression tables, spell lists, and archetypes for newly added base classes and martial disciplines:
            </p>

            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <button
                    onClick={() => { onNavigate('character-options/classes/Paragon'); onClose(); }}
                    className="font-bold text-amber-300 hover:underline mr-1"
                  >
                    Paragon Class:
                  </button>
                  <span>Ascendant warrior achieving physical perfection, featuring Avatar Features progression.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <button
                    onClick={() => { onNavigate('character-options/classes/Primal'); onClose(); }}
                    className="font-bold text-amber-300 hover:underline mr-1"
                  >
                    Primal Class:
                  </button>
                  <span>Guardian of the wild realms (formerly Warden), harnessing Primal Manifestations.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <button
                    onClick={() => { onNavigate('character-options/classes/Spirit Knight'); onClose(); }}
                    className="font-bold text-amber-300 hover:underline mr-1"
                  >
                    Spirit Knight Class:
                  </button>
                  <span>Mystical spellblade channeling esoteric martial arts (distinct from the Hexbound Witchblade).</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">New Barbarian Paths: </strong>
                  <span>Path of the Colossus (giant war-hulk), Path of the Fin (shark predator), Path of the Branded (occult Greatweapon imbuement), Path of the Muscle Wizard, Heavy Metal, and Tranquility.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Release 2: 5e Bestiary & Monster Manual */}
          <div className="space-y-3 rounded-xl border border-rose-950 bg-stone-950/70 p-5 shadow-[0_0_20px_rgba(136,19,55,0.15)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-950 pb-2">
              <div className="flex items-center gap-2">
                <GothicBat className="w-4 h-4 text-rose-400" />
                <h3 className="font-fantasy text-lg font-bold text-rose-300">
                  5e Bestiary & Monster Manual
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-900/60">
                17 Statblocks
              </span>
            </div>

            <p className="text-xs text-stone-300 font-serif">
              Full combat statistics, ability scores, legendary powers, and lair traits:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❖</span>
                <button onClick={() => { onNavigate('monsters/Strahd von Zarovich'); onClose(); }} className="hover:underline font-bold text-rose-200">
                  Count Strahd von Zarovich (CR 15)
                </button>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❖</span>
                <button onClick={() => { onNavigate('monsters/Vampire Spawn'); onClose(); }} className="hover:underline font-bold text-rose-200">
                  Vampire Spawn (CR 5)
                </button>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❖</span>
                <button onClick={() => { onNavigate('monsters/Werewolf'); onClose(); }} className="hover:underline font-bold text-rose-200">
                  Werewolf (CR 3)
                </button>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❖</span>
                <button onClick={() => { onNavigate('monsters/Ancient Treant'); onClose(); }} className="hover:underline font-bold text-rose-200">
                  Ancient Treant (CR 9)
                </button>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❖</span>
                <button onClick={() => { onNavigate('monsters/Sahuagin Baron'); onClose(); }} className="hover:underline font-bold text-rose-200">
                  Sahuagin Baron (CR 5)
                </button>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400">❖</span>
                <button onClick={() => { onNavigate('monsters/Jackalope'); onClose(); }} className="hover:underline font-bold text-rose-200">
                  Hexbound Witch Familiars (6)
                </button>
              </li>
            </ul>
          </div>

          {/* Release 3: Gothic Vampire Horror & Ambiance Overhaul */}
          <div className="space-y-3 rounded-xl border border-stone-800 bg-stone-950/70 p-5">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
              <DragonShield className="w-4 h-4 text-amber-400" />
              <h3 className="font-fantasy text-lg font-bold text-amber-300">
                Gothic Horror Ambiance & Architecture Upgrades
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>• <strong>Zero-Pill Discipline:</strong> Replaced generic tech neon badges with authentic medieval small-caps stamps and wax seals.</li>
              <li>• <strong>Barovian Ambiance:</strong> Obsidian stone styling, Castle Ravenloft heraldry, and Count Strahd's famous epistolary quotes.</li>
              <li>• <strong>Codex Fleuron Dividers:</strong> Markdown dividers now render as ornate illuminated manuscripts (<code className="text-amber-300">─── ❖ ⚔ ❖ ───</code>).</li>
              <li>• <strong>Universal Inverse Backlinks:</strong> Every rule, spell, condition, and monster now prominently displays "Referenced By" links.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-900/40 bg-stone-950/80 flex items-center justify-between text-xs text-stone-400">
          <span>Campaign Archive • 5e Codex & Grimoire</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
