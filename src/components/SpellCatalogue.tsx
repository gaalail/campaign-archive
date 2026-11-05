import React, { useState, useMemo } from 'react';
import { archiveDb, getSpellLevelLabel, getSourceBadgeInfo } from '../utils/archiveUtils';
import { ArchiveEntry } from '../types/archive';
import {
  Search,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';

interface SpellCatalogueProps {
  onSelectSpell: (spellId: string) => void;
  initialClass?: string;
  initialLevel?: number | 'all';
  hideClassSelector?: boolean;
}

const CLASS_LIST = [
  'All Spells',
  'Artificer',
  'Bard',
  'Cleric',
  'Druid',
  'Paladin',
  'Ranger',
  'Sorcerer',
  'Thanatomancer',
  'Tamer',
  'Warlock',
  'Wizard',
  'Arcane Knight',
  'Mystic',
  'Witchblade',
  'Way of the Wu Jen'
];

const SCHOOL_LIST = [
  'All Schools',
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
  'Biomancy'
];

const LEVEL_LIST: { id: number | 'all'; label: string }[] = [
  { id: 'all', label: 'All Levels' },
  { id: 0, label: 'Cantrips' },
  { id: 1, label: '1st' },
  { id: 2, label: '2nd' },
  { id: 3, label: '3rd' },
  { id: 4, label: '4th' },
  { id: 5, label: '5th' },
  { id: 6, label: '6th' },
  { id: 7, label: '7th' },
  { id: 8, label: '8th' },
  { id: 9, label: '9th' }
];

export const SpellCatalogue: React.FC<SpellCatalogueProps> = ({
  onSelectSpell,
  initialClass = 'All Spells',
  initialLevel = 'all',
  hideClassSelector = false
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>(initialLevel);
  const [selectedSchool, setSelectedSchool] = useState<string>('All Schools');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const [selectedConcentration, setSelectedConcentration] = useState<string>('all');
  const [selectedRitual, setSelectedRitual] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [groupByLevel, setGroupByLevel] = useState<boolean>(true);

  // Collect all spells
  const allSpells = useMemo(() => {
    return archiveDb.entries.filter(e => e.category === 'spells' && !e.id.endsWith('/index'));
  }, []);

  // Filter spells
  const filteredSpells = useMemo(() => {
    return allSpells.filter(spell => {
      // Class filter
      if (selectedClass !== 'All Spells') {
        const normTarget = selectedClass.toLowerCase();
        const mainClasses = (spell.classes || spell.frontmatter?.classes || []).map((c: string) => c.toLowerCase());
        const subLists = (spell.subclass_spell_lists || spell.frontmatter?.subclass_spell_lists || []).map((s: string) => s.toLowerCase());

        const matchesMain = mainClasses.includes(normTarget);
        const matchesSub = subLists.some((s: string) => {
          if (normTarget === 'way of the wu jen' && (s === 'wu jen' || s === 'way of the wu jen')) return true;
          return s === normTarget;
        });

        if (!matchesMain && !matchesSub) return false;
      }

      // Level filter
      if (selectedLevel !== 'all') {
        const lvl = spell.level !== null && spell.level !== undefined ? spell.level : (spell.frontmatter?.level ?? 0);
        if (Number(lvl) !== Number(selectedLevel)) return false;
      }

      // School filter
      if (selectedSchool !== 'All Schools') {
        const sc = (spell.school || spell.frontmatter?.school || '').toLowerCase();
        if (sc !== selectedSchool.toLowerCase()) return false;
      }

      // Source type filter
      if (selectedSourceType !== 'all') {
        const st = (spell.source_type || spell.frontmatter?.source_type || '').toLowerCase();
        if (selectedSourceType === 'srd' && !st.includes('srd')) return false;
        if (selectedSourceType === 'homebrew' && !st.includes('homebrew') && !st.includes('campaign')) return false;
        if (selectedSourceType === 'third-party' && !st.includes('third-party')) return false;
      }

      // Concentration filter
      if (selectedConcentration === 'yes') {
        const conc = spell.concentration ?? Boolean(spell.frontmatter?.concentration);
        if (!conc) return false;
      } else if (selectedConcentration === 'no') {
        const conc = spell.concentration ?? Boolean(spell.frontmatter?.concentration);
        if (conc) return false;
      }

      // Ritual filter
      if (selectedRitual === 'yes') {
        const rit = spell.ritual ?? Boolean(spell.frontmatter?.ritual);
        if (!rit) return false;
      } else if (selectedRitual === 'no') {
        const rit = spell.ritual ?? Boolean(spell.frontmatter?.ritual);
        if (rit) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = spell.title.toLowerCase().includes(q);
        const summaryMatch = spell.summary.toLowerCase().includes(q);
        const schoolMatch = (spell.school || spell.frontmatter?.school || '').toLowerCase().includes(q);
        const classMatch = (spell.classes || spell.frontmatter?.classes || []).some((c: string) => c.toLowerCase().includes(q));
        if (!titleMatch && !summaryMatch && !schoolMatch && !classMatch) return false;
      }

      return true;
    });
  }, [allSpells, selectedClass, selectedLevel, selectedSchool, selectedSourceType, selectedConcentration, selectedRitual, searchQuery]);

  // Group by level
  const groupedSpells = useMemo(() => {
    const groups: { level: number; label: string; spells: ArchiveEntry[] }[] = [];
    const map = new Map<number, ArchiveEntry[]>();

    for (const spell of filteredSpells) {
      const lvl = spell.level !== null && spell.level !== undefined ? spell.level : (spell.frontmatter?.level ?? 0);
      const lvlNum = Number(lvl);
      if (!map.has(lvlNum)) {
        map.set(lvlNum, []);
      }
      map.get(lvlNum)!.push(spell);
    }

    const sortedLevels = Array.from(map.keys()).sort((a, b) => a - b);
    for (const lvl of sortedLevels) {
      const spells = map.get(lvl)!.sort((a, b) => a.title.localeCompare(b.title));
      groups.push({
        level: lvl,
        label: getSpellLevelLabel(lvl),
        spells
      });
    }

    return groups;
  }, [filteredSpells]);

  const totalMatching = filteredSpells.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>5e Spell Compendium & Grimoire</span>
            </div>
            <h1 className="font-fantasy text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-3">
              <span>{selectedClass === 'All Spells' ? 'All Spells' : `${selectedClass} Spells`}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-violet-950/70 text-violet-300 border border-violet-500/40 font-mono">
                {totalMatching} {totalMatching === 1 ? 'spell' : 'spells'}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setGroupByLevel(!groupByLevel)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                groupByLevel
                  ? 'bg-violet-950/60 border-violet-500/50 text-violet-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Group Spells by Level"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Group by Level</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Table View (Dynamic style)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Class Filter Bar */}
        {!hideClassSelector && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Filter by Class Spell List:
            </div>
            <div className="flex flex-wrap gap-1.5 pb-2">
              {CLASS_LIST.map(cls => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/30'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Level Pills Filter */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Spell Level:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LEVEL_LIST.map(lvl => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={String(lvl.id)}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Secondary Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search spell name, school, class..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* School filter */}
          <div>
            <select
              value={selectedSchool}
              onChange={e => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              {SCHOOL_LIST.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Concentration filter */}
          <div>
            <select
              value={selectedConcentration}
              onChange={e => setSelectedConcentration(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Concentration: Any</option>
              <option value="yes">Requires Concentration</option>
              <option value="no">No Concentration</option>
            </select>
          </div>

          {/* Ritual filter */}
          <div>
            <select
              value={selectedRitual}
              onChange={e => setSelectedRitual(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="all">Ritual: Any</option>
              <option value="yes">Ritual Castable</option>
              <option value="no">Non-Ritual</option>
            </select>
          </div>
        </div>

        {/* Source type & Reset filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Source:</span>
            {['all', 'srd', 'homebrew', 'third-party'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedSourceType(st)}
                className={`px-2 py-0.5 rounded capitalize ${
                  selectedSourceType === st
                    ? 'bg-slate-700 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'All' : st === 'srd' ? 'SRD 5.1' : st}
              </button>
            ))}
          </div>

          {(selectedClass !== initialClass ||
            selectedLevel !== initialLevel ||
            selectedSchool !== 'All Schools' ||
            selectedSourceType !== 'all' ||
            selectedConcentration !== 'all' ||
            selectedRitual !== 'all' ||
            searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setSelectedClass(initialClass);
                setSelectedLevel(initialLevel);
                setSelectedSchool('All Schools');
                setSelectedSourceType('all');
                setSelectedConcentration('all');
                setSelectedRitual('all');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Spells List Container */}
      {filteredSpells.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-fantasy text-lg text-slate-300 font-bold">No Spells Match Your Criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your class, level, school, or search query filters above to locate the spells you need.
          </p>
        </div>
      ) : groupByLevel && selectedLevel === 'all' ? (
        <div className="space-y-8">
          {groupedSpells.map(group => (
            <div key={group.level} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="font-fantasy text-xl font-bold text-amber-300 flex items-center gap-2">
                  <span>{group.label}</span>
                  <span className="text-xs font-mono font-normal text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {group.spells.length}
                  </span>
                </h2>
              </div>

              {viewMode === 'table' ? (
                <SpellTableView spells={group.spells} onSelectSpell={onSelectSpell} showLevel={false} />
              ) : (
                <SpellGridView spells={group.spells} onSelectSpell={onSelectSpell} />
              )}
            </div>
          ))}
        </div>
      ) : viewMode === 'table' ? (
        <SpellTableView spells={filteredSpells} onSelectSpell={onSelectSpell} showLevel={true} />
      ) : (
        <SpellGridView spells={filteredSpells} onSelectSpell={onSelectSpell} />
      )}
    </div>
  );
};

/* Table View component matching Quartz/Dynamic tables */
const SpellTableView: React.FC<{
  spells: ArchiveEntry[];
  onSelectSpell: (id: string) => void;
  showLevel?: boolean;
}> = ({ spells, onSelectSpell, showLevel = true }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase font-semibold tracking-wider text-[11px]">
            <th className="p-3">Spell Name</th>
            {showLevel && <th className="p-3">Level</th>}
            <th className="p-3">School</th>
            <th className="p-3">Casting Time</th>
            <th className="p-3">Range</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Components</th>
            <th className="p-3">Tags</th>
            <th className="p-3">Classes</th>
            <th className="p-3">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-sans">
          {spells.map(spell => {
            const badge = getSourceBadgeInfo(spell.source_type, spell.source);
            const levelNum = spell.level !== null && spell.level !== undefined ? spell.level : (spell.frontmatter?.level ?? 0);
            const school = spell.school || spell.frontmatter?.school || 'Magic';
            const castingTime = spell.casting_time || spell.frontmatter?.casting_time || '1 action';
            const range = spell.range || spell.frontmatter?.range || 'Touch';
            const duration = spell.duration || spell.frontmatter?.duration || 'Instantaneous';
            const components = spell.components || spell.frontmatter?.components || 'V, S';
            const conc = spell.concentration ?? Boolean(spell.frontmatter?.concentration);
            const rit = spell.ritual ?? Boolean(spell.frontmatter?.ritual);
            const classes: string[] = spell.classes || spell.frontmatter?.classes || [];
            const sublists: string[] = spell.subclass_spell_lists || spell.frontmatter?.subclass_spell_lists || [];

            return (
              <tr
                key={spell.id}
                onClick={() => onSelectSpell(spell.id)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                <td className="p-3 font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                  <div className="flex items-center gap-1.5">
                    <span>{spell.title}</span>
                  </div>
                  {spell.summary && (
                    <div className="text-[11px] font-normal text-slate-400 line-clamp-1 mt-0.5">
                      {spell.summary}
                    </div>
                  )}
                </td>
                {showLevel && (
                  <td className="p-3 text-slate-300 font-mono">
                    {levelNum === 0 ? 'Cantrip' : `${levelNum}`}
                  </td>
                )}
                <td className="p-3 text-violet-300 font-medium">
                  {school}
                </td>
                <td className="p-3 text-slate-300 whitespace-nowrap">
                  {castingTime}
                </td>
                <td className="p-3 text-slate-300 whitespace-nowrap">
                  {range}
                </td>
                <td className="p-3 text-slate-300 whitespace-nowrap">
                  {duration}
                </td>
                <td className="p-3 text-slate-400 font-mono text-[11px]">
                  {components}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {conc && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40 text-[10px]" title="Requires Concentration">
                        C
                      </span>
                    )}
                    {rit && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px]" title="Ritual">
                        R
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-slate-400 text-[11px]">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {classes.slice(0, 3).map(c => (
                      <span key={c} className="px-1.5 py-0.5 bg-slate-950 rounded text-slate-300 border border-slate-800">
                        {c}
                      </span>
                    ))}
                    {classes.length > 3 && (
                      <span className="px-1 py-0.5 text-slate-500">+{classes.length - 3}</span>
                    )}
                    {sublists.map(s => (
                      <span key={s} className="px-1.5 py-0.5 bg-violet-950/50 rounded text-violet-300 border border-violet-800/40">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* Grid View component */
const SpellGridView: React.FC<{
  spells: ArchiveEntry[];
  onSelectSpell: (id: string) => void;
}> = ({ spells, onSelectSpell }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {spells.map(spell => {
        const badge = getSourceBadgeInfo(spell.source_type, spell.source);
        const levelNum = spell.level !== null && spell.level !== undefined ? spell.level : (spell.frontmatter?.level ?? 0);
        const school = spell.school || spell.frontmatter?.school || 'Magic';
        const castingTime = spell.casting_time || spell.frontmatter?.casting_time || '1 action';
        const range = spell.range || spell.frontmatter?.range || 'Touch';
        const conc = spell.concentration ?? Boolean(spell.frontmatter?.concentration);
        const rit = spell.ritual ?? Boolean(spell.frontmatter?.ritual);
        const classes: string[] = spell.classes || spell.frontmatter?.classes || [];

        return (
          <div
            key={spell.id}
            onClick={() => onSelectSpell(spell.id)}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-violet-500/50 hover:bg-slate-850 cursor-pointer transition-all space-y-2 group shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-fantasy font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {spell.title}
                </h3>
                <span className="text-xs text-violet-300 font-medium">
                  {levelNum === 0 ? `${school} Cantrip` : `${getSpellLevelLabel(levelNum)} ${school}`}
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
            </div>

            {spell.summary && (
              <p className="text-xs text-slate-400 line-clamp-2">
                {spell.summary}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                ⏱ {castingTime}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                🎯 {range}
              </span>
              {conc && (
                <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30">
                  Conc.
                </span>
              )}
              {rit && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                  Ritual
                </span>
              )}
            </div>

            {classes.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
                {classes.map(c => (
                  <span key={c} className="bg-slate-950/60 px-1.5 py-0.5 rounded text-slate-400">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
