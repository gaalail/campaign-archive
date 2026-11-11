import React, { useMemo } from 'react';
import { ArchiveEntry } from '../types/archive';
import { WaxSeal, GothicBat, CrossedSwords, DndFleuronDivider } from './GothicIcons';
import { InlineContent } from './MarkdownView';
import { useOptionalDice } from './DiceRoller';

interface MonsterStatblockProps {
  entry: ArchiveEntry;
  onNavigate?: (id: string) => void;
  className?: string;
  isCompact?: boolean;
}

export interface ParsedMonsterData {
  name: string;
  sizeType: string;
  ac: string;
  hp: string;
  speed: string;
  stats: {
    str: { score: number; mod: string };
    dex: { score: number; mod: string };
    con: { score: number; mod: string };
    int: { score: number; mod: string };
    wis: { score: number; mod: string };
    cha: { score: number; mod: string };
  };
  savingThrows?: string;
  skills?: string;
  damageVulnerabilities?: string;
  damageResistances?: string;
  damageImmunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  challenge?: string;
  traits: Array<{ name: string; desc: string }>;
  actions: Array<{ name: string; desc: string }>;
  bonusActions: Array<{ name: string; desc: string }>;
  legendaryActions: Array<{ name: string; desc: string }>;
  legendaryIntro?: string;
}

export function parseMonsterFromEntry(entry: ArchiveEntry): ParsedMonsterData {
  const body = entry.body || '';
  const lines = body.split(/\r?\n/);

  const data: ParsedMonsterData = {
    name: entry.title,
    sizeType: [entry.size, entry.monster_type || entry.frontmatter?.type, entry.alignment || entry.frontmatter?.alignment].filter(Boolean).join(' • ') || 'Medium creature, unaligned',
    ac: String(entry.ac || entry.frontmatter?.ac || '10'),
    hp: String(entry.hp || entry.frontmatter?.hp || '10'),
    speed: String(entry.speed || entry.frontmatter?.speed || '30 ft.'),
    stats: {
      str: { score: 10, mod: '+0' },
      dex: { score: 10, mod: '+0' },
      con: { score: 10, mod: '+0' },
      int: { score: 10, mod: '+0' },
      wis: { score: 10, mod: '+0' },
      cha: { score: 10, mod: '+0' }
    },
    traits: [],
    actions: [],
    bonusActions: [],
    legendaryActions: []
  };

  let currentSection: 'header' | 'traits' | 'actions' | 'bonus' | 'legendary' = 'header';
  let currentItem: { name: string; desc: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check size & type line: *Medium undead, lawful evil*
    const sizeTypeMatch = line.match(/^\*([^*]+)\*$/);
    if (sizeTypeMatch && currentSection === 'header') {
      data.sizeType = sizeTypeMatch[1].trim();
      continue;
    }

    // Core vitals
    const acMatch = line.match(/-\s*\*\*Armor Class:\*\*\s*(.*)/i);
    if (acMatch) { data.ac = acMatch[1].trim(); continue; }

    const hpMatch = line.match(/-\s*\*\*Hit Points:\*\*\s*(.*)/i);
    if (hpMatch) { data.hp = hpMatch[1].trim(); continue; }

    const speedMatch = line.match(/-\s*\*\*Speed:\*\*\s*(.*)/i);
    if (speedMatch) { data.speed = speedMatch[1].trim(); continue; }

    const savesMatch = line.match(/-\s*\*\*Saving Throws:\*\*\s*(.*)/i);
    if (savesMatch) { data.savingThrows = savesMatch[1].trim(); continue; }

    const skillsMatch = line.match(/-\s*\*\*Skills:\*\*\s*(.*)/i);
    if (skillsMatch) { data.skills = skillsMatch[1].trim(); continue; }

    const vulnMatch = line.match(/-\s*\*\*Damage Vulnerabilities:\*\*\s*(.*)/i);
    if (vulnMatch) { data.damageVulnerabilities = vulnMatch[1].trim(); continue; }

    const resMatch = line.match(/-\s*\*\*Damage Resistances:\*\*\s*(.*)/i);
    if (resMatch) { data.damageResistances = resMatch[1].trim(); continue; }

    const immMatch = line.match(/-\s*\*\*Damage Immunities:\*\*\s*(.*)/i);
    if (immMatch) { data.damageImmunities = immMatch[1].trim(); continue; }

    const condMatch = line.match(/-\s*\*\*Condition Immunities:\*\*\s*(.*)/i);
    if (condMatch) { data.conditionImmunities = condMatch[1].trim(); continue; }

    const sensesMatch = line.match(/-\s*\*\*Senses:\*\*\s*(.*)/i);
    if (sensesMatch) { data.senses = sensesMatch[1].trim(); continue; }

    const langMatch = line.match(/-\s*\*\*Languages:\*\*\s*(.*)/i);
    if (langMatch) { data.languages = langMatch[1].trim(); continue; }

    const crMatch = line.match(/-\s*\*\*Challenge:\*\*\s*(.*)/i);
    if (crMatch) { data.challenge = crMatch[1].trim(); continue; }

    // Ability scores table: | STR | DEX | CON | INT | WIS | CHA |
    if (line.includes('| STR |') || line.includes('|STR|')) {
      // Find the row containing scores (skip separator)
      for (let j = i + 1; j < lines.length && j < i + 4; j++) {
        const row = lines[j].trim();
        if (row.startsWith('|') && !row.includes('---') && !row.includes('STR')) {
          const cells = row.split('|').map(c => c.trim()).filter(Boolean);
          if (cells.length >= 6) {
            const parseCell = (cell: string) => {
              const numMatch = cell.match(/(\d+)/);
              const modMatch = cell.match(/\(([+-]?\d+)\)/);
              const score = numMatch ? parseInt(numMatch[1], 10) : 10;
              let mod = modMatch ? modMatch[1] : '';
              if (!mod) {
                const calculated = Math.floor((score - 10) / 2);
                mod = calculated >= 0 ? `+${calculated}` : `${calculated}`;
              }
              if (!mod.startsWith('+') && !mod.startsWith('-')) mod = `+${mod}`;
              return { score, mod };
            };

            data.stats = {
              str: parseCell(cells[0]),
              dex: parseCell(cells[1]),
              con: parseCell(cells[2]),
              int: parseCell(cells[3]),
              wis: parseCell(cells[4]),
              cha: parseCell(cells[5])
            };
            i = j;
            break;
          }
        }
      }
      continue;
    }

    // Section headers
    if (/^###\s+(special\s+traits|traits)/i.test(line)) {
      if (currentItem) pushCurrentItem();
      currentSection = 'traits';
      continue;
    }
    if (/^###\s+actions/i.test(line)) {
      if (currentItem) pushCurrentItem();
      currentSection = 'actions';
      continue;
    }
    if (/^###\s+bonus\s+actions/i.test(line)) {
      if (currentItem) pushCurrentItem();
      currentSection = 'bonus';
      continue;
    }
    if (/^###\s+legendary\s+actions/i.test(line)) {
      if (currentItem) pushCurrentItem();
      currentSection = 'legendary';
      continue;
    }

    function pushCurrentItem() {
      if (!currentItem) return;
      if (currentSection === 'traits') data.traits.push(currentItem);
      else if (currentSection === 'actions') data.actions.push(currentItem);
      else if (currentSection === 'bonus') data.bonusActions.push(currentItem);
      else if (currentSection === 'legendary') data.legendaryActions.push(currentItem);
      currentItem = null;
    }

    // Item inside section: - **Feature Name:** Description
    const itemMatch = line.match(/^-\s*\*\*([^:*]+)[:*]+\s*(.*)$/);
    if (itemMatch && currentSection !== 'header') {
      pushCurrentItem();
      currentItem = {
        name: itemMatch[1].trim(),
        desc: itemMatch[2].trim()
      };
      continue;
    }

    // Additional paragraphs for the current item or legendary intro
    if (currentItem) {
      if (line.startsWith('- ') || line.startsWith('### ')) {
        pushCurrentItem();
      } else {
        currentItem.desc += '\n' + line;
      }
    } else if (currentSection === 'legendary' && !line.startsWith('-') && !line.startsWith('#')) {
      data.legendaryIntro = (data.legendaryIntro ? data.legendaryIntro + ' ' : '') + line;
    }
  }

  if (currentItem) {
    if (currentSection === 'traits') data.traits.push(currentItem);
    else if (currentSection === 'actions') data.actions.push(currentItem);
    else if (currentSection === 'bonus') data.bonusActions.push(currentItem);
    else if (currentSection === 'legendary') data.legendaryActions.push(currentItem);
  }

  // Fallback for challenge if missing
  if (!data.challenge && entry.cr !== undefined && entry.cr !== null) {
    data.challenge = `CR ${entry.cr}`;
  }

  return data;
}

export const MonsterStatblock: React.FC<MonsterStatblockProps> = ({
  entry,
  onNavigate = () => {},
  className = '',
  isCompact = false
}) => {
  const data = useMemo(() => parseMonsterFromEntry(entry), [entry]);
  const isStrahd = entry.campaign_id === 'curse-of-strahd' || entry.id.includes('strahd');
  const dice = useOptionalDice();

  const statList = [
    { label: 'STR', ...data.stats.str },
    { label: 'DEX', ...data.stats.dex },
    { label: 'CON', ...data.stats.con },
    { label: 'INT', ...data.stats.int },
    { label: 'WIS', ...data.stats.wis },
    { label: 'CHA', ...data.stats.cha }
  ];

  return (
    <div
      className={`rounded-xl border-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] font-serif p-5 sm:p-6 transition-all ${
        isStrahd
          ? 'bg-gradient-to-b from-[#181113] via-[#120d0f] to-[#0a0708] border-rose-900/80 shadow-[0_0_35px_rgba(136,19,55,0.25)]'
          : 'bg-gradient-to-b from-[#1c1815] via-[#161311] to-[#120f0d] border-amber-800/80'
      } ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-amber-900/40 pb-3">
        <div>
          <div className="flex items-center gap-2">
            {isStrahd && <WaxSeal label="S" className="w-5 h-5 text-[9px]" />}
            <h2 className={`font-fantasy text-2xl sm:text-3xl font-bold tracking-wide uppercase ${
              isStrahd ? 'text-rose-200' : 'text-amber-300'
            }`}>
              {data.name}
            </h2>
          </div>
          <div className="text-xs italic text-stone-400 capitalize mt-0.5">
            {data.sizeType}
          </div>
        </div>

        {data.challenge && (
          <div className={`px-3 py-1 rounded text-xs font-bold font-serif tracking-widest uppercase border ${
            isStrahd
              ? 'bg-rose-950/70 text-rose-300 border-rose-900/80'
              : 'bg-amber-950/70 text-amber-300 border-amber-900/80'
          }`}>
            {data.challenge}
          </div>
        )}
      </div>

      {/* Decorative Fleuron */}
      <div className="my-2 text-[10px] flex items-center justify-center gap-2 select-none opacity-60">
        <span className={isStrahd ? 'text-rose-500' : 'text-amber-600'}>❖</span>
        <span className={`w-20 h-px ${isStrahd ? 'bg-rose-900/60' : 'bg-amber-800/40'}`}></span>
        <span>⚔</span>
        <span className={`w-20 h-px ${isStrahd ? 'bg-rose-900/60' : 'bg-amber-800/40'}`}></span>
        <span className={isStrahd ? 'text-rose-500' : 'text-amber-600'}>❖</span>
      </div>

      {/* AC, HP, Speed Vitals */}
      <div className="space-y-1.5 text-xs border-b border-amber-900/30 pb-3 text-stone-300">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <strong className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">Armor Class:</strong>
          <span className="text-stone-200 font-sans font-medium">{data.ac}</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <strong className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">Hit Points:</strong>
          <span className="text-stone-200 font-sans font-medium">{data.hp}</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <strong className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">Speed:</strong>
          <span className="text-stone-200 font-sans font-medium">{data.speed}</span>
        </div>
      </div>

      {/* 6 Ability Scores Grid */}
      <div className="my-3.5 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center bg-stone-900/70 p-2.5 rounded-lg border border-amber-900/30">
        {statList.map((st) => (
          <button
            key={st.label}
            type="button"
            onClick={() => {
              const modNum = parseInt(st.mod, 10) || 0;
              const formula = `1d20${modNum >= 0 ? `+${modNum}` : `${modNum}`}`;
              dice?.roll(formula, `${data.name}: ${st.label} Check`);
            }}
            title={`Click to roll ${st.label} check (1d20${st.mod})`}
            className="space-y-0.5 p-1 rounded-lg hover:bg-stone-800/80 hover:border-amber-500/40 border border-transparent transition-all group/stat cursor-pointer text-center"
          >
            <div className="text-[10px] font-bold text-amber-400 tracking-wider group-hover/stat:text-amber-300">{st.label}</div>
            <div className="text-sm font-semibold text-stone-100 font-sans">{st.score}</div>
            <div className="text-[11px] font-mono text-stone-400 group-hover/stat:text-amber-300">({st.mod})</div>
          </button>
        ))}
      </div>

      {/* Defenses, Senses & Languages */}
      <div className="space-y-1 text-xs border-b border-amber-900/30 pb-3 text-stone-300">
        {data.savingThrows && (
          <div><strong className="text-amber-400 uppercase tracking-wider text-[11px] font-bold">Saving Throws:</strong> <span className="font-sans ml-1">{data.savingThrows}</span></div>
        )}
        {data.skills && (
          <div><strong className="text-amber-400 uppercase tracking-wider text-[11px] font-bold">Skills:</strong> <span className="font-sans ml-1">{data.skills}</span></div>
        )}
        {data.damageVulnerabilities && (
          <div><strong className="text-amber-400 uppercase tracking-wider text-[11px] font-bold">Damage Vulnerabilities:</strong> <span className="font-sans ml-1">{data.damageVulnerabilities}</span></div>
        )}
        {data.damageResistances && (
          <div><strong className="text-amber-400 uppercase tracking-wider text-[11px] font-bold">Damage Resistances:</strong> <span className="font-sans ml-1">{data.damageResistances}</span></div>
        )}
        {data.damageImmunities && (
          <div><strong className="text-amber-400 uppercase tracking-wider text-[11px] font-bold">Damage Immunities:</strong> <span className="font-sans ml-1">{data.damageImmunities}</span></div>
        )}
        {data.conditionImmunities && (
          <div><strong className="text-amber-400 uppercase tracking-wider text-[11px] font-bold">Condition Immunities:</strong> <span className="font-sans ml-1">{data.conditionImmunities}</span></div>
        )}
        {data.senses && (
          <div><strong className="text-amber-400 uppercase tracking-wider text-[11px] font-bold">Senses:</strong> <span className="font-sans ml-1">{data.senses}</span></div>
        )}
        {data.languages && (
          <div><strong className="text-amber-400 uppercase tracking-wider text-[11px] font-bold">Languages:</strong> <span className="font-sans ml-1">{data.languages}</span></div>
        )}
      </div>

      {/* Special Traits */}
      {data.traits.length > 0 && (
        <div className="my-3 space-y-2 border-b border-amber-900/30 pb-3">
          {data.traits.map((tr, idx) => (
            <div key={idx} className="text-xs leading-relaxed text-stone-300">
              <strong className="text-amber-300 font-bold italic mr-1 text-[13px]">{tr.name}.</strong>
              <span className="font-sans">
                <InlineContent text={tr.desc} onNavigate={onNavigate} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {data.actions.length > 0 && (
        <div className="my-3 space-y-2.5">
          <h3 className={`font-fantasy text-sm font-bold uppercase tracking-widest border-b pb-1 flex items-center gap-1.5 ${
            isStrahd ? 'text-rose-400 border-rose-950' : 'text-amber-400 border-amber-950'
          }`}>
            <span>Actions</span>
          </h3>
          {data.actions.map((act, idx) => (
            <div key={idx} className="text-xs leading-relaxed text-stone-300">
              <strong className="text-amber-300 font-bold italic mr-1 text-[13px]">{act.name}.</strong>
              <span className="font-sans">
                <InlineContent text={act.desc} onNavigate={onNavigate} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bonus Actions */}
      {data.bonusActions.length > 0 && (
        <div className="my-3 space-y-2.5 border-t border-amber-900/30 pt-3">
          <h3 className="font-fantasy text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-amber-950 pb-1">
            Bonus Actions
          </h3>
          {data.bonusActions.map((ba, idx) => (
            <div key={idx} className="text-xs leading-relaxed text-stone-300">
              <strong className="text-amber-300 font-bold italic mr-1 text-[13px]">{ba.name}.</strong>
              <span className="font-sans">
                <InlineContent text={ba.desc} onNavigate={onNavigate} />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legendary Actions */}
      {data.legendaryActions.length > 0 && (
        <div className="my-3 space-y-2.5 border-t border-amber-900/40 pt-3">
          <h3 className={`font-fantasy text-sm font-bold uppercase tracking-widest border-b pb-1 ${
            isStrahd ? 'text-rose-400 border-rose-950' : 'text-amber-400 border-amber-950'
          }`}>
            Legendary Actions
          </h3>
          {data.legendaryIntro && (
            <p className="text-xs italic text-stone-400 leading-relaxed font-sans">
              {data.legendaryIntro}
            </p>
          )}
          {data.legendaryActions.map((la, idx) => (
            <div key={idx} className="text-xs leading-relaxed text-stone-300">
              <strong className="text-amber-300 font-bold italic mr-1 text-[13px]">{la.name}.</strong>
              <span className="font-sans">
                <InlineContent text={la.desc} onNavigate={onNavigate} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
