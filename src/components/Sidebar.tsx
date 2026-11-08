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
  X
} from 'lucide-react';

interface SidebarProps {
  currentEntryId: string | null;
  currentView: 'reader' | 'builder' | 'graph' | 'items' | 'campaigns' | 'spells';
  onNavigateToEntry: (id: string) => void;
  onSetView: (view: 'reader' | 'builder' | 'graph' | 'items' | 'campaigns' | 'spells') => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentEntryId,
  currentView,
  onNavigateToEntry,
  onSetView,
  isOpen,
  onClose
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
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onSetView('reader');
              onNavigateToEntry('index');
              onClose();
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              ⚔️
            </div>
            <div>
              <div className="font-fantasy font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors">
                Campaign Archive
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                5e D&D Reference
              </div>
            </div>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Views Hub */}
        <div className="p-3 border-b border-slate-800 space-y-1">
          <button
            onClick={() => {
              onSetView('reader');
              onNavigateToEntry('index');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'reader' && currentEntryId === 'index'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home Hub</span>
          </button>

          <button
            onClick={() => {
              onSetView('builder');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'builder'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Character Builder</span>
          </button>

          <button
            onClick={() => {
              onSetView('graph');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'graph'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Knowledge Graph</span>
          </button>

          <button
            onClick={() => {
              onSetView('spells');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'spells'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Spell Compendium ({spells.length})</span>
          </button>

          <button
            onClick={() => {
              onSetView('reader');
              onNavigateToEntry('rules/index');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'reader' && currentEntryId?.startsWith('rules/')
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Rules Compendium ({rules.length})</span>
          </button>

          <button
            onClick={() => {
              onSetView('reader');
              onNavigateToEntry('monsters/index');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'reader' && currentEntryId?.startsWith('monsters/')
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-red-400" />
            <span>Bestiary ({monsters.length})</span>
          </button>

          <button
            onClick={() => {
              onSetView('items');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'items'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Items Compendium</span>
          </button>

          <button
            onClick={() => {
              onSetView('campaigns');
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'campaigns'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Campaign Directory</span>
          </button>
        </div>

        {/* Scrollable Tree Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* CAMPAIGNS ACCORDION */}
          <div>
            <button
              onClick={() => toggleSection('campaigns')}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 font-semibold uppercase text-[11px] tracking-wider py-1"
            >
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Campaigns</span>
              </div>
              {openSections.campaigns ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.campaigns && (
              <div className="pl-2 mt-1 space-y-0.5 border-l border-slate-800">
                {[
                  { id: 'campaigns/ra-golvek/index', title: "Ra Gol'vek" },
                  { id: 'campaigns/vyrun/index', title: 'Vyrun' },
                  { id: 'campaigns/curse-of-strahd/index', title: 'Curse of Strahd' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSetView('reader');
                      onNavigateToEntry(c.id);
                      onClose();
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors truncate ${
                      currentView === 'reader' && currentEntryId === c.id
                        ? 'text-amber-400 bg-amber-500/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {c.title}
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
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 flex items-center justify-between">
          <span>SRD 5.1 & Homebrew</span>
          <span className="text-amber-400 font-mono">{archiveDb.stats.totalEntries} entries</span>
        </div>
      </aside>
    </>
  );
};
