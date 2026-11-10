import React, { useState } from 'react';
import { archiveDb } from '../utils/archiveUtils';
import {
  BookOpen,
  Compass,
  Sparkles,
  Sword,
  Shield,
  User,
  Layers,
  ChevronDown,
  ChevronRight,
  Flame,
  FileText,
  Network,
  Home,
  Menu,
  X,
  Anchor
} from 'lucide-react';
import {
  GothicRaven,
  GothicBat,
  CrossedSwords,
  SpellTome,
  DragonShield
} from './GothicIcons';

interface SidebarProps {
  currentEntryId: string | null;
  currentView: 'reader' | 'builder' | 'graph' | 'items' | 'campaigns' | 'spells' | 'monsters';
  onNavigateToEntry: (id: string) => void;
  onSetView: (view: 'reader' | 'builder' | 'graph' | 'items' | 'campaigns' | 'spells' | 'monsters') => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenChangelog?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentEntryId,
  currentView,
  onNavigateToEntry,
  onSetView,
  isOpen,
  onClose,
  onOpenChangelog
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    classes: true,
    campaigns: true,
    spells: true,
    races: false,
    backgrounds: false,
    feats: false,
    fightingStyles: false,
    classOptions: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const spells = archiveDb.entries.filter(e => e.category === 'spells' && !e.id.endsWith('/index'));
  const rules = archiveDb.entries.filter(e => e.category === 'rules' && !e.id.endsWith('/index'));
  const monsters = archiveDb.entries.filter(e => e.category === 'monsters' && !e.id.endsWith('/index'));
  const classes = archiveDb.entries.filter(e => e.category === 'classes' && !e.id.endsWith('/index'));
  const races = archiveDb.entries.filter(e => e.category === 'races' && !e.id.endsWith('/index'));
  const backgrounds = archiveDb.entries.filter(e => e.category === 'backgrounds' && !e.id.endsWith('/index'));
  const feats = archiveDb.entries.filter(e => e.category === 'feats' && !e.id.endsWith('/index'));
  const fightingStyles = archiveDb.entries.filter(e => e.category === 'fighting-styles' && !e.id.endsWith('/index'));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <button
            onClick={() => {
              onSetView('reader');
              onNavigateToEntry('index');
              onClose();
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border border-amber-500/40 flex items-center justify-center text-amber-200 font-bold shadow-md shadow-amber-950/80">
              <CrossedSwords className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <div className="font-fantasy font-bold text-amber-100 text-sm tracking-wide group-hover:text-amber-300 transition-colors">
                Campaign Archive
              </div>
              <div className="text-[10px] text-amber-600/90 uppercase tracking-widest font-serif font-bold">
                5e Codex & Grimoire
              </div>
            </div>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Views Hub */}
        <div className="p-3 border-b border-stone-800 space-y-1">
          <button
            onClick={() => {
              onSetView('reader');
              onNavigateToEntry('index');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all ${
              currentView === 'reader' && (currentEntryId === 'index' || !currentEntryId)
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Home Hub</span>
          </button>

          <button
            onClick={() => {
              onSetView('builder');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all ${
              currentView === 'builder'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <CrossedSwords className="w-4 h-4 text-amber-400" />
            <span>Character Builder</span>
          </button>

          <button
            onClick={() => {
              onSetView('graph');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all ${
              currentView === 'graph'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Network className="w-4 h-4 text-amber-300" />
            <span>Knowledge Graph</span>
          </button>

          <button
            onClick={() => {
              onSetView('spells');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all ${
              currentView === 'spells'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <SpellTome className="w-4 h-4 text-violet-400" />
            <span>Grimoire ({spells.length})</span>
          </button>

          <button
            onClick={() => {
              onSetView('reader');
              onNavigateToEntry('rules/index');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all ${
              currentView === 'reader' && currentEntryId?.startsWith('rules/')
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Rules Codex ({rules.length})</span>
          </button>

          <button
            onClick={() => {
              onSetView('monsters');
              onNavigateToEntry('monsters/index');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all ${
              currentView === 'monsters' || (currentView === 'reader' && currentEntryId?.startsWith('monsters/'))
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <GothicBat className={`w-4 h-4 ${currentView === 'monsters' ? 'text-stone-950' : 'text-rose-400'}`} />
            <span>Bestiary ({monsters.length})</span>
          </button>

          <button
            onClick={() => {
              onSetView('items');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all ${
              currentView === 'items'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <DragonShield className="w-4 h-4 text-amber-400" />
            <span>Armory & Relics</span>
          </button>

          <button
            onClick={() => {
              onSetView('campaigns');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold transition-all ${
              currentView === 'campaigns'
                ? 'bg-amber-600 text-stone-950 shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <GothicRaven className="w-4 h-4 text-rose-400" />
            <span>Campaign Chronicles</span>
          </button>
        </div>

        {/* Scrollable Tree Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-sans">
          {/* CAMPAIGNS ACCORDION */}
          <div>
            <button
              onClick={() => toggleSection('campaigns')}
              className="w-full flex items-center justify-between text-stone-400 hover:text-stone-200 font-serif font-semibold uppercase text-[11px] tracking-wider py-1"
            >
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>Campaign Realms</span>
              </div>
              {openSections.campaigns ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.campaigns && (
              <div className="pl-2 mt-1 space-y-0.5 border-l border-stone-800">
                {[
                  {
                    id: 'campaigns/curse-of-strahd/index',
                    title: 'Curse of Strahd',
                    icon: <GothicRaven className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
                    activeClass: 'text-rose-200 bg-rose-950/60 font-serif font-bold border-l-2 border-rose-600'
                  },
                  {
                    id: 'campaigns/ra-golvek/index',
                    title: "Ra Gol'vek",
                    icon: <Anchor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
                    activeClass: 'text-cyan-200 bg-cyan-950/60 font-serif font-bold border-l-2 border-cyan-600'
                  },
                  {
                    id: 'campaigns/vyrun/index',
                    title: 'Vyrun',
                    icon: <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
                    activeClass: 'text-emerald-200 bg-emerald-950/60 font-serif font-bold border-l-2 border-emerald-600'
                  }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSetView('reader');
                      onNavigateToEntry(c.id);
                      onClose();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors truncate flex items-center gap-2 ${
                      currentView === 'reader' && currentEntryId === c.id
                        ? c.activeClass
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 font-serif'
                    }`}
                  >
                    {c.icon}
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SPELLS ACCORDION */}
          <div>
            <button
              onClick={() => toggleSection('spells')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold uppercase text-[11px] tracking-wider py-1"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Spells ({spells.length})</span>
              </div>
              {openSections.spells ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.spells && (
              <div className="pl-2 mt-1 space-y-0.5 border-l border-slate-800">
                {[
                  ['cantrips', 'Cantrips'],
                  ['1st-level', '1st Level'], ['2nd-level', '2nd Level'], ['3rd-level', '3rd Level'],
                  ['4th-level', '4th Level'], ['5th-level', '5th Level'], ['6th-level', '6th Level'],
                  ['7th-level', '7th Level'], ['8th-level', '8th Level'], ['9th-level', '9th Level']
                ].map(([folder, label]) => {
                  const levelSpells = spells.filter(spell => spell.subcategory === folder);
                  return (
                    <button
                      key={folder}
                      onClick={() => {
                        onSetView('reader');
                        onNavigateToEntry(`spells/${folder}/index`);
                        onClose();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg transition-colors truncate text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 flex items-center justify-between"
                    >
                      <span>{label}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{levelSpells.length}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* CLASSES ACCORDION */}
          <div>
            <button
              onClick={() => toggleSection('classes')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold uppercase text-[11px] tracking-wider py-1"
            >
              <div className="flex items-center gap-1.5">
                <Sword className="w-3.5 h-3.5 text-rose-400" />
                <span>Classes ({classes.length})</span>
              </div>
              {openSections.classes ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.classes && (
              <div className="pl-2 mt-1 space-y-0.5 border-l border-slate-800">
                {classes.map(cls => (
                  <React.Fragment key={cls.id}>
                    <button
                      onClick={() => {
                        onSetView('reader');
                        onNavigateToEntry(cls.id);
                        onClose();
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                        currentView === 'reader' && currentEntryId === cls.id
                          ? 'text-rose-400 bg-rose-500/10 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="truncate">{cls.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{cls.hit_die}</span>
                    </button>
                    {(() => {
                      const classOptionMap: Record<string, { folder: string; label: string }[]> = {
                        Warlock: [
                          { folder: 'eldritch-invocations', label: 'Eldritch Invocations' },
                          { folder: 'pact-foci', label: 'Pact Foci' },
                          { folder: 'familiars', label: 'Eldritch Familiars' },
                          { folder: 'elder-arcana', label: 'Elder Arcana' }
                        ],
                        Primal: [
                          { folder: 'primal-manifestations', label: 'Primal Manifestations' }
                        ],
                        Paragon: [
                          { folder: 'avatar-features', label: 'Avatar Features' }
                        ],
                        Paladin: [
                          { folder: 'smite-paths', label: 'Smite Paths' }
                        ],
                        Fighter: [
                          { folder: 'martial-exploits', label: 'Martial Exploits' }
                        ],
                        Sorcerer: [
                          { folder: 'metamagic', label: 'Metamagic Options' }
                        ],
                        Monk: [
                          { folder: 'monk-techniques', label: 'Monk Techniques' }
                        ]
                      };
                      const options = classOptionMap[cls.title];
                      if (!options) return null;
                      return (
                        <div className="ml-3 mb-1 border-l border-slate-800 pl-2 space-y-0.5">
                          {options.map(({ folder, label }) => {
                            const id = `character-options/class-options/${folder}/index`;
                            return (
                              <button
                                key={folder}
                                onClick={() => {
                                  onSetView('reader');
                                  onNavigateToEntry(id);
                                  onClose();
                                }}
                                className={`w-full text-left px-2 py-1 rounded-lg transition-colors truncate text-[11px] ${
                                  currentView === 'reader' && currentEntryId === id
                                    ? 'text-amber-300 bg-amber-500/10 font-semibold'
                                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* RACES ACCORDION */}
          <div>
            <button
              onClick={() => toggleSection('races')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold uppercase text-[11px] tracking-wider py-1"
            >
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Races & Ancestries ({races.length})</span>
              </div>
              {openSections.races ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.races && (
              <div className="pl-2 mt-1 space-y-0.5 border-l border-slate-800">
                {races.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSetView('reader');
                      onNavigateToEntry(r.id);
                      onClose();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors truncate ${
                      currentView === 'reader' && currentEntryId === r.id
                        ? 'text-emerald-400 bg-emerald-500/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BACKGROUNDS ACCORDION */}
          <div>
            <button
              onClick={() => toggleSection('backgrounds')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold uppercase text-[11px] tracking-wider py-1"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                <span>Backgrounds ({backgrounds.length})</span>
              </div>
              {openSections.backgrounds ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.backgrounds && (
              <div className="pl-2 mt-1 space-y-0.5 border-l border-slate-800">
                {backgrounds.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSetView('reader');
                      onNavigateToEntry(b.id);
                      onClose();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors truncate ${
                      currentView === 'reader' && currentEntryId === b.id
                        ? 'text-teal-400 bg-teal-500/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {b.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FEATS ACCORDION */}
          <div>
            <button
              onClick={() => toggleSection('feats')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold uppercase text-[11px] tracking-wider py-1"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Feats ({feats.length})</span>
              </div>
              {openSections.feats ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.feats && (
              <div className="pl-2 mt-1 space-y-0.5 border-l border-slate-800 max-h-48 overflow-y-auto">
                {feats.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSetView('reader');
                      onNavigateToEntry(f.id);
                      onClose();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors truncate ${
                      currentView === 'reader' && currentEntryId === f.id
                        ? 'text-blue-400 bg-blue-500/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {f.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FIGHTING STYLES ACCORDION */}
          <div>
            <button
              onClick={() => toggleSection('fightingStyles')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold uppercase text-[11px] tracking-wider py-1"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Fighting Styles ({fightingStyles.length})</span>
              </div>
              {openSections.fightingStyles ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.fightingStyles && (
              <div className="pl-2 mt-1 space-y-0.5 border-l border-slate-800 max-h-48 overflow-y-auto">
                {fightingStyles.map(fs => (
                  <button
                    key={fs.id}
                    onClick={() => {
                      onSetView('reader');
                      onNavigateToEntry(fs.id);
                      onClose();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors truncate ${
                      currentView === 'reader' && currentEntryId === fs.id
                        ? 'text-cyan-400 bg-cyan-500/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {fs.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GUIDES & RULES */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold px-2 mb-1">
              Guides & Mechanics
            </div>
            <button
              onClick={() => {
                onSetView('reader');
                onNavigateToEntry('character-builder');
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
            >
              How to Build a Character
            </button>
            <button
              onClick={() => {
                onSetView('reader');
                onNavigateToEntry('discovery-features');
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
            >
              Discovery & Cross-Linking
            </button>
            <button
              onClick={() => {
                onSetView('reader');
                onNavigateToEntry('getting-started');
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
            >
              Getting Started Guide
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/80 text-[11px] text-stone-400 flex items-center justify-between font-serif">
          {onOpenChangelog ? (
            <button
              onClick={onOpenChangelog}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-200 transition-colors font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>What's New</span>
            </button>
          ) : (
            <span>5e Codex & Grimoire</span>
          )}
          <span className="text-amber-400/90 font-mono text-[10px]">{archiveDb.stats.totalEntries} entries</span>
        </div>
      </aside>
    </>
  );
};
