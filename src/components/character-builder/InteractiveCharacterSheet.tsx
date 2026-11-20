import React, { useState, useMemo, useRef } from 'react';
import { CharacterState, AbilityKey, ABILITY_LABELS, ALL_SKILLS, CustomAttack } from './types';
import { ArchiveEntry } from '../../types/archive';
import { getCampaignDisplayName } from '../../utils/archiveUtils';
import { DerivedStats, formatModifier, generateDefaultAttacks, getCantripDiceCount } from './builderUtils';
import { useOptionalDice } from '../DiceRoller';
import {
  Shield,
  Heart,
  Zap,
  Eye,
  Copy,
  Share2,
  Download,
  RotateCcw,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  BookOpen,
  Sword,
  Crosshair,
  Printer,
  FileText,
  Upload,
  Moon,
  MoreHorizontal,
  Backpack,
  BookmarkPlus
} from 'lucide-react';
import { D20GothicIcon, CrossedSwords, DragonShield } from '../GothicIcons';
import { PrintableCharacterSheet } from './PrintableCharacterSheet';

interface InteractiveCharacterSheetProps {
  state: CharacterState;
  selectedRace: ArchiveEntry | null;
  selectedClass: ArchiveEntry | null;
  selectedSubclass: ArchiveEntry | null;
  selectedBackground: ArchiveEntry | null;
  selectedFeats: ArchiveEntry[];
  selectedFightingStyle: ArchiveEntry | null;
  selectedClassOptions: ArchiveEntry[];
  selectedSpells: ArchiveEntry[];
  selectedDeity?: ArchiveEntry | null;
  derived: DerivedStats;
  onSetName: (name: string) => void;
  onSetGenderOrTitle: (title: string) => void;
  onSetAlignment: (align: string) => void;
  onSetLevel: (level: number) => void;
  onSetSpellcastingAbility: (ability: AbilityKey | null) => void;
  onToggleSkill: (skill: string) => void;
  onToggleSkillExpertise: (skill: string) => void;
  onSetArmor: (armor: string) => void;
  onToggleShield: () => void;
  onSetHpBonus: (bonus: number) => void;
  onSetCurrentHp: (hp: number | null) => void;
  onSetTempHp: (hp: number) => void;
  onToggleSpellSlot: (level: number, slotIndex: number) => void;
  onLongRest: () => void;
  onAddEquipment: (item: string) => void;
  onRemoveEquipment: (index: number) => void;
  onRemoveClassOption: (id: string) => void;
  onRemoveSpell: (id: string) => void;
  onRemoveFeat: (id: string) => void;
  onClearFightingStyle: () => void;
  onSetNotes: (notes: string) => void;
  onAddAttack: (attack: CustomAttack) => void;
  onRemoveAttack: (id: string) => void;
  onImportState: (raw: Partial<CharacterState>) => void;
  onSaveToRoster: () => void;
  onInspectEntry: (entry: ArchiveEntry) => void;
  onReset: () => void;
}

export const InteractiveCharacterSheet: React.FC<InteractiveCharacterSheetProps> = ({
  state,
  selectedRace,
  selectedClass,
  selectedSubclass,
  selectedBackground,
  selectedFeats,
  selectedFightingStyle,
  selectedClassOptions,
  selectedSpells,
  selectedDeity,
  derived,
  onSetName,
  onSetGenderOrTitle,
  onSetAlignment,
  onSetLevel,
  onSetSpellcastingAbility,
  onToggleSkill,
  onToggleSkillExpertise,
  onSetArmor,
  onToggleShield,
  onSetHpBonus,
  onSetCurrentHp,
  onSetTempHp,
  onToggleSpellSlot,
  onLongRest,
  onAddEquipment,
  onRemoveEquipment,
  onRemoveClassOption,
  onRemoveSpell,
  onRemoveFeat,
  onClearFightingStyle,
  onSetNotes,
  onAddAttack,
  onRemoveAttack,
  onImportState,
  onSaveToRoster,
  onInspectEntry,
  onReset
}) => {
  const dice = useOptionalDice();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showJsonMenu, setShowJsonMenu] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  // New attack form
  const [showAddAttack, setShowAddAttack] = useState(false);
  const [newAttackName, setNewAttackName] = useState('');
  const [newAttackBonus, setNewAttackBonus] = useState(4);
  const [newAttackDice, setNewAttackDice] = useState('1d8+2');
  const [newAttackType, setNewAttackType] = useState('slashing');

  // Equipment input
  const [newGearItem, setNewGearItem] = useState('');

  const spellMod = derived.spellcastingAbility ? derived.modifiers[derived.spellcastingAbility] : undefined;

  const isMartialArtist = selectedFeats.some(f => f.title.toLowerCase() === 'martial artist');
  const joatBonus = derived.rules.classProg.jackOfAllTrades ? Math.floor(derived.proficiencyBonus / 2) : 0;

  const defaultAttacks = useMemo(() => {
    return generateDefaultAttacks(
      selectedClass,
      derived.modifiers,
      derived.proficiencyBonus,
      derived.level,
      spellMod,
      derived.rules.styleEffects,
      isMartialArtist
    );
  }, [selectedClass, derived.modifiers, derived.proficiencyBonus, derived.level, spellMod, derived.rules.styleEffects, isMartialArtist]);

  const allAttacks = useMemo(() => {
    const list = [...defaultAttacks];
    state.customAttacks.forEach(a => {
      list.push({
        name: a.name,
        type: a.type === 'ranged' ? 'ranged' : a.type === 'spell' ? 'spell' : 'melee',
        bonus: a.bonus,
        damageDice: a.damageDice,
        damageType: a.damageType
      });
    });
    return list;
  }, [defaultAttacks, state.customAttacks]);

  const effectiveCurrentHp = state.currentHp === null ? derived.maxHp : state.currentHp;

  const adjustCurrentHp = (delta: number) => {
    const next = Math.max(0, Math.min(derived.maxHp + 50, effectiveCurrentHp + delta));
    onSetCurrentHp(next === derived.maxHp ? null : next);
  };

  // Dice roll actions
  const rollCheck = (ability: AbilityKey, name: string) => {
    const mod = derived.modifiers[ability];
    dice?.roll(`1d20${formatModifier(mod)}`, `${name} Check`);
  };

  const rollSave = (ability: AbilityKey, name: string) => {
    const saveInfo = derived.savingThrows[ability];
    dice?.roll(`1d20${formatModifier(saveInfo.bonus)}`, `${name} Saving Throw`);
  };

  const rollSkill = (skillName: string, ability: AbilityKey) => {
    const isProf = derived.rules.effectiveSkills.includes(skillName);
    const isExp = derived.rules.effectiveExpertSkills.includes(skillName);
    const bonus = isExp ? derived.proficiencyBonus * 2 : isProf ? derived.proficiencyBonus : joatBonus;
    const mod = derived.modifiers[ability] + bonus;
    dice?.roll(`1d20${formatModifier(mod)}`, `${skillName} (${ABILITY_LABELS[ability].abbr}) Check`);
  };

  const rollInitiative = () => {
    dice?.roll(`1d20${formatModifier(derived.initiative)}`, 'Initiative Check');
  };

  const rollHitDie = () => {
    dice?.roll(`1${derived.hitDie}${formatModifier(derived.modifiers.con)}`, 'Hit Die Recovery');
  };

  const rollAttackToHit = (atkName: string, bonus: number) => {
    dice?.roll(`1d20${formatModifier(bonus)}`, `${atkName} Attack`);
  };

  const rollAttackDamage = (atkName: string, diceFormula: string, dmgType: string) => {
    dice?.roll(diceFormula, `${atkName} Damage (${dmgType})`);
  };

  // Generate complete Markdown sheet
  const buildMarkdownText = () => {
    const spellSlotEntries = Object.entries(derived.spellSlots.slots)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([lvl, count]) => `Level ${lvl}: ${count} slot${count === 1 ? '' : 's'}`);

    const spellsByLevel = new Map<number, ArchiveEntry[]>();
    selectedSpells.forEach(sp => {
      const lvl = typeof sp.level === 'number' ? sp.level : 0;
      if (!spellsByLevel.has(lvl)) spellsByLevel.set(lvl, []);
      spellsByLevel.get(lvl)!.push(sp);
    });

    const lines = [
      `# ${state.name || 'Nameless Hero'}${state.genderOrTitle ? ` — ${state.genderOrTitle}` : ''}`,
      `**Level ${derived.level} ${selectedRace?.title || 'Unknown Ancestry'} ${selectedClass?.title || 'Adventurer'}${selectedSubclass ? ` (${selectedSubclass.title})` : ''}** | ${state.alignment}`,
      `**Background:** ${selectedBackground?.title || 'None'}${state.campaignId ? ` | **Campaign:** ${getCampaignDisplayName(state.campaignId)}` : ''}${selectedDeity ? ` | **Patron Deity:** ${selectedDeity.title}` : ''}`,
      '',
      '---',
      '',
      `### Core Combat Statistics`,
      `- **Armor Class (AC):** ${derived.armorClass} (${state.customArmor}${state.shieldEquipped ? ' + Shield' : ''})`,
      `- **Hit Points (HP):** ${effectiveCurrentHp} / ${derived.maxHp}${state.tempHp > 0 ? ` (+${state.tempHp} Temp)` : ''} | **Hit Dice:** ${derived.hitDiceTotal}`,
      `- **Speed:** ${derived.speed}`,
      `- **Initiative:** ${formatModifier(derived.initiative)}`,
      `- **Proficiency Bonus:** +${derived.proficiencyBonus}`,
      `- **Passive Perception:** ${derived.passivePerception}`,
      ...(derived.spellSaveDc
        ? [
            `- **Spellcasting (${ABILITY_LABELS[derived.spellcastingAbility || 'cha'].abbr}):** Save DC ${derived.spellSaveDc} | Attack ${formatModifier(derived.spellAttackBonus || 0)}`,
          ]
        : []),
      ...(spellSlotEntries.length > 0 ? [`- **Spell Slots:** ${spellSlotEntries.join(', ')}`] : []),
      '',
      `### Ability Scores`,
      `| Ability | Score | Modifier | Saving Throw |`,
      `| :--- | :---: | :---: | :---: |`,
      ...(['str', 'dex', 'con', 'int', 'wis', 'cha'] as AbilityKey[]).map(
        ab =>
          `| ${ABILITY_LABELS[ab].name} | ${derived.finalAbilities[ab]} | ${formatModifier(derived.modifiers[ab])} | ${formatModifier(derived.savingThrows[ab].bonus)} ${derived.savingThrows[ab].proficient ? '(Proficient)' : ''} |`
      ),
      '',
      `### Skills`,
      ...ALL_SKILLS.filter(s => derived.rules.effectiveSkills.includes(s.name)).map(s => {
        const isExp = derived.rules.effectiveExpertSkills.includes(s.name);
        const mod = derived.modifiers[s.ability] + (isExp ? derived.proficiencyBonus * 2 : derived.proficiencyBonus);
        return `- **${s.name}** (${ABILITY_LABELS[s.ability].abbr}): ${formatModifier(mod)}${isExp ? ' *(Expertise)*' : ''}`;
      }),
      ...(derived.rules.effectiveSkills.length === 0 ? ['- No skill proficiencies selected'] : []),
      '',
      `### Weapons & Attacks`,
      ...allAttacks.map(a => `- **${a.name}** (${a.type}): ${formatModifier(a.bonus)} to hit, ${a.damageDice} ${a.damageType}`),
      '',
      ...(selectedFightingStyle ? [`### Fighting Style: ${selectedFightingStyle.title}`, `${selectedFightingStyle.summary || ''}`, ''] : []),
      ...(selectedClassOptions.length > 0
        ? [
            `### Class Options & Invocations`,
            ...selectedClassOptions.map(
              opt => `- **${opt.title}**${opt.min_level ? ` (Lv ${opt.min_level})` : ''}${opt.summary ? `: ${opt.summary}` : ''}`
            ),
            '',
          ]
        : []),
      ...(selectedFeats.length > 0
        ? [
            `### Feats`,
            ...selectedFeats.map(f => `- **${f.title}**${f.summary ? `: ${f.summary}` : ''}`),
            '',
          ]
        : []),
      ...(derived.rules.innateSpells.length > 0
        ? [
            `### Innate Spells`,
            ...derived.rules.innateSpells.map(s => `- **${s.name}** (${s.source}${s.note ? ` · ${s.note}` : ''})`),
            '',
          ]
        : []),
      ...(selectedSpells.length > 0
        ? [
            `### Known / Prepared Spells`,
            ...Array.from(spellsByLevel.entries())
              .sort(([a], [b]) => a - b)
              .map(([lvl, list]) => `- **${lvl === 0 ? 'Cantrips' : `Level ${lvl}`}:** ${list.map(sp => sp.title).join(', ')}`),
            '',
          ]
        : []),
      `### Proficiencies, Languages & Resources`,
      ...(derived.rules.effectiveArmorProficiencies.length > 0
        ? [`- **Armor:** ${derived.rules.effectiveArmorProficiencies.join(', ')}`]
        : []),
      ...(derived.rules.effectiveWeapons.length > 0
        ? [`- **Weapons:** ${derived.rules.effectiveWeapons.join(', ')}`]
        : []),
      ...(derived.rules.effectiveTools.length > 0
        ? [`- **Tools:** ${derived.rules.effectiveTools.join(', ')}`]
        : []),
      ...(derived.rules.effectiveLanguages.length > 0
        ? [`- **Languages:** ${derived.rules.effectiveLanguages.join(', ')}`]
        : []),
      ...(derived.rules.classProg.resources.length > 0
        ? [`- **Class Resources:** ${derived.rules.classProg.resources.map(r => `${r.label} (${r.value})`).join(', ')}`]
        : []),
      '',
      `### Equipment & Inventory`,
      `- **Armor:** ${state.customArmor}${state.shieldEquipped ? ' + Shield' : ''}`,
      ...derived.rules.effectiveEquipment.map(item => `- ${item}`),
      '',
      `### Character Notes & Backstory`,
      state.notes || 'None recorded.',
      '',
      `*Generated with Campaign Archive 5e Codex Character Builder*`
    ];
    return lines.join('\n');
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(buildMarkdownText());
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  // Download Markdown (.md)
  const handleDownloadMarkdown = () => {
    const content = buildMarkdownText();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (state.name || 'character').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'character';
    a.download = `${slug}_lvl${derived.level}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Share link generator
  const copyShareLink = () => {
    try {
      const payload = {
        name: state.name,
        title: state.genderOrTitle,
        alignment: state.alignment,
        level: derived.level,
        race: state.raceId,
        class: state.classId,
        subclass: state.subclassId,
        background: state.backgroundId,
        feat: state.featId,
        feats: state.selectedFeatIds,
        fightingStyle: state.selectedFightingStyleId,
        classOptions: state.selectedClassOptionIds,
        spells: state.selectedSpellIds,
        spellAbility: state.spellcastingAbilityOverride,
        campaign: state.campaignId,
        deity: state.deityId,
        subrace: state.subrace,
        asiSystem: state.asiSystem,
        racialChoiceAbilities: state.racialChoiceAbilities,
        racialSkillChoices: state.racialSkillChoices,
        featAbilityChoices: state.featAbilityChoices,
        classSkillChoices: state.classSkillChoices,
        backgroundSkillChoices: state.backgroundSkillChoices,
        applyBackgroundGear: state.applyBackgroundGear,
        includeSubclassSpells: state.includeSubclassSpells,
        abilities: state.baseAbilities,
        racialBonuses: state.racialBonuses,
        skills: state.selectedSkills,
        expertSkills: state.expertSkills,
        armor: state.customArmor,
        shield: state.shieldEquipped,
        hpBonus: state.hpModifierBonus,
        equipment: state.equipment,
        customAttacks: state.customAttacks,
        notes: state.notes
      };
      const jsonString = JSON.stringify(payload);
      const encoded = btoa(encodeURIComponent(jsonString));
      const url = `${window.location.origin}${window.location.pathname}#character-builder?build=${encoded}`;

      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Backup Download JSON
  const downloadJsonBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (state.name || 'character').toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'character';
    a.download = `${slug}_backup.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setShowJsonMenu(false);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (!parsed || typeof parsed !== 'object') {
          setImportError('Invalid character backup file.');
          return;
        }
        onImportState({ ...parsed, step: 6 });
        setShowJsonMenu(false);
      } catch {
        setImportError('Could not parse JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveHeroClick = () => {
    onSaveToRoster();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2200);
  };

  const handleCreateAttack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttackName.trim()) return;
    onAddAttack({
      id: `atk_${Date.now()}`,
      name: newAttackName.trim(),
      type: 'melee',
      bonus: newAttackBonus,
      damageDice: newAttackDice,
      damageType: newAttackType
    });
    setNewAttackName('');
    setShowAddAttack(false);
  };

  const handleAddEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGearItem.trim()) return;
    onAddEquipment(newGearItem.trim());
    setNewGearItem('');
  };

  // Group selected spells by level for display
  const spellsByLevel = useMemo(() => {
    const map = new Map<number, ArchiveEntry[]>();
    selectedSpells
      .slice()
      .sort((a, b) => (a.level || 0) - (b.level || 0) || a.title.localeCompare(b.title))
      .forEach(sp => {
        const lvl = typeof sp.level === 'number' ? sp.level : 0;
        if (!map.has(lvl)) map.set(lvl, []);
        map.get(lvl)!.push(sp);
      });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [selectedSpells]);

  const subclassBonusSpellIds = useMemo(() => {
    return new Set(
      derived.rules.subclassSpellsUnlocked
        .map(b => b.entry?.id)
        .filter((id): id is string => Boolean(id))
    );
  }, [derived.rules.subclassSpellsUnlocked]);

  const showSpellcastingPanel =
    derived.spellSaveDc !== undefined ||
    selectedSpells.length > 0 ||
    derived.rules.classProg.hasSpellcastingAtLevel ||
    derived.rules.innateSpells.length > 0;

  return (
    <>
      <PrintableCharacterSheet
        state={state}
        selectedRace={selectedRace}
        selectedClass={selectedClass}
        selectedSubclass={selectedSubclass}
        selectedBackground={selectedBackground}
        selectedFeats={selectedFeats}
        selectedFightingStyle={selectedFightingStyle}
        selectedClassOptions={selectedClassOptions}
        selectedSpells={selectedSpells}
        selectedDeity={selectedDeity}
        derived={derived}
        allAttacks={allAttacks}
      />
      <div className="space-y-6 print:hidden">
      
      {/* Top Banner & Header Information */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 md:p-6 shadow-2xl space-y-4 print-card">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          
          {/* Identity fields */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 print:hidden">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-900/60 font-semibold">
                Interactive Character Sheet
              </span>
              <span className="text-[10px] uppercase font-mono text-stone-400">
                5e SRD / Homebrew Hybrid
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <input
                type="text"
                value={state.name}
                onChange={(e) => onSetName(e.target.value)}
                placeholder="Character Name..."
                className="bg-transparent font-serif text-2xl md:text-3xl font-bold text-stone-100 border-b border-transparent hover:border-stone-700 focus:border-amber-500 focus:outline-none min-w-[220px]"
              />
              <input
                type="text"
                value={state.genderOrTitle}
                onChange={(e) => onSetGenderOrTitle(e.target.value)}
                placeholder="Title / Archetype..."
                className="bg-transparent font-sans text-sm text-stone-400 border-b border-transparent hover:border-stone-700 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 pt-1 font-sans">
              <span className="text-amber-300 font-semibold">{selectedRace?.title || 'Ancestry Unset'}</span>
              <span>•</span>

              {/* Level Stepper */}
              <span className="inline-flex items-center gap-1.5 text-stone-200 font-semibold">
                <button
                  onClick={() => onSetLevel(derived.level - 1)}
                  disabled={derived.level <= 1}
                  className="w-5 h-5 rounded bg-stone-950 border border-stone-700 hover:border-amber-500 text-stone-300 disabled:opacity-40 flex items-center justify-center cursor-pointer print:hidden"
                  title="Decrease character level"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span>
                  Level {derived.level} {selectedClass?.title || 'Class Unset'}
                  {selectedSubclass ? ` (${selectedSubclass.title})` : ''}
                </span>
                <button
                  onClick={() => onSetLevel(derived.level + 1)}
                  disabled={derived.level >= 20}
                  className="w-5 h-5 rounded bg-stone-950 border border-stone-700 hover:border-amber-500 text-stone-300 disabled:opacity-40 flex items-center justify-center cursor-pointer print:hidden"
                  title="Increase character level"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </span>

              <span>•</span>
              <span className="text-stone-400">{selectedBackground?.title || 'Background Unset'}</span>
              {selectedDeity && (
                <>
                  <span>•</span>
                  <span className="text-amber-200 font-medium">{selectedDeity.title}</span>
                </>
              )}
              {state.campaignId && !selectedDeity && (
                <>
                  <span>•</span>
                  <span className="text-stone-400">{getCampaignDisplayName(state.campaignId)}</span>
                </>
              )}
              <span>•</span>
              <input
                type="text"
                value={state.alignment}
                onChange={(e) => onSetAlignment(e.target.value)}
                className="bg-stone-950 px-2 py-0.5 rounded text-[11px] text-stone-300 border border-stone-800 w-28 text-center focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="Print character sheet or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Download portable Markdown character sheet (.md)"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Copy Markdown character sheet to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedMarkdown ? 'Copied!' : 'Copy MD'}</span>
            </button>

            <button
              onClick={copyShareLink}
              className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Copy shareable URL link with your build"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copiedLink ? 'Link Copied!' : 'Share URL'}</span>
            </button>

            <button
              onClick={handleSaveHeroClick}
              className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-amber-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Save hero to local roster"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{savedFeedback ? 'Saved!' : 'Save'}</span>
            </button>

            <button
              onClick={onLongRest}
              className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-indigo-950/60 border border-stone-800 hover:border-indigo-800 text-indigo-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Restore HP & expended spell slots"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Long Rest</span>
            </button>

            {/* Secondary Backup Menu (JSON Export/Import + Reset) */}
            <div className="relative">
              <button
                onClick={() => setShowJsonMenu(!showJsonMenu)}
                className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs transition-colors cursor-pointer"
                title="Backup JSON & Reset options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showJsonMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl bg-stone-900 border border-stone-700 shadow-2xl p-1.5 z-40 space-y-1 text-xs">
                  <button
                    onClick={downloadJsonBackup}
                    className="w-full px-3 py-2 rounded-lg text-left text-stone-200 hover:bg-stone-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-400" />
                    <span>Export Backup (.json)</span>
                  </button>
                  <button
                    onClick={() => jsonInputRef.current?.click()}
                    className="w-full px-3 py-2 rounded-lg text-left text-stone-200 hover:bg-stone-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-400" />
                    <span>Import Backup (.json)</span>
                  </button>
                  <div className="border-t border-stone-800 my-1" />
                  <button
                    onClick={() => {
                      setShowJsonMenu(false);
                      setShowResetConfirm(true);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-rose-400 hover:bg-rose-950/60 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Builder</span>
                  </button>
                </div>
              )}

              <input
                ref={jsonInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {importError && (
          <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center justify-between print:hidden">
            <span>{importError}</span>
            <button onClick={() => setImportError(null)} className="underline text-rose-200 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Core Vitals Quad: Interactive HP, AC, Initiative, Speed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Hit Points */}
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 flex flex-col justify-between gap-2 shadow-inner print-card">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Hit Points</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-mono font-bold text-rose-200">{effectiveCurrentHp}</span>
                  <span className="text-xs font-mono text-rose-400/80">/ {derived.maxHp}</span>
                  {state.tempHp > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300">
                      +{state.tempHp} Temp
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-rose-400/80 block mt-0.5">
                  Hit Dice: {derived.hitDiceTotal} · PB +{derived.proficiencyBonus}
                </span>
              </div>
              <button
                onClick={rollHitDie}
                className="p-2 rounded-lg bg-rose-900/50 hover:bg-rose-800/60 text-rose-200 text-xs flex flex-col items-center gap-0.5 transition-colors cursor-pointer print:hidden"
                title={`Roll Hit Die recovery (1${derived.hitDie} + Con)`}
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span className="text-[10px] font-mono font-bold">Roll</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-1 pt-1 border-t border-rose-900/40 text-[10px] font-mono print:hidden">
              <div className="flex items-center gap-1">
                <button onClick={() => adjustCurrentHp(-5)} className="px-1.5 py-0.5 rounded bg-stone-950 hover:bg-rose-950 text-rose-300 border border-rose-900/50 cursor-pointer">-5</button>
                <button onClick={() => adjustCurrentHp(-1)} className="px-1.5 py-0.5 rounded bg-stone-950 hover:bg-rose-950 text-rose-300 border border-rose-900/50 cursor-pointer">-1</button>
                <button onClick={() => adjustCurrentHp(1)} className="px-1.5 py-0.5 rounded bg-stone-950 hover:bg-emerald-950 text-emerald-300 border border-emerald-900/50 cursor-pointer">+1</button>
                <button onClick={() => adjustCurrentHp(5)} className="px-1.5 py-0.5 rounded bg-stone-950 hover:bg-emerald-950 text-emerald-300 border border-emerald-900/50 cursor-pointer">+5</button>
              </div>
              <label className="flex items-center gap-1 text-stone-400" title="Temporary Hit Points">
                <span>Temp:</span>
                <input
                  type="number"
                  min={0}
                  value={state.tempHp}
                  onChange={(e) => onSetTempHp(parseInt(e.target.value, 10) || 0)}
                  className="w-10 bg-stone-950 border border-stone-800 rounded px-1 py-0.5 text-center text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </label>
            </div>
          </div>

          {/* Armor Class */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-between shadow-inner print-card" title={derived.acBreakdown}>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Armor Class</span>
              <span className="text-2xl font-mono font-bold text-emerald-200">{derived.armorClass}</span>
              <span className="text-[10px] text-emerald-400/80 block mt-0.5 truncate max-w-[170px]">
                {derived.acBreakdown}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-300 print:hidden">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Initiative */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-between shadow-inner print-card">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">Initiative</span>
              <span className="text-2xl font-mono font-bold text-cyan-200">{formatModifier(derived.initiative)}</span>
              <span className="text-[10px] text-cyan-400/80 block mt-0.5 truncate max-w-[160px]">
                {derived.initiativeNote || 'Dexterity Modifier'}
              </span>
            </div>
            <button
              onClick={rollInitiative}
              className="p-2 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/60 text-cyan-200 text-xs flex flex-col items-center gap-0.5 transition-colors cursor-pointer print:hidden"
              title="Roll Initiative check"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold">Roll</span>
            </button>
          </div>

          {/* Speed & Perception */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between gap-2 shadow-inner print-card">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Speed / Pass.</span>
                <span className="text-xl font-mono font-bold text-stone-200">{derived.speed}</span>
                <span className="text-[10px] text-teal-400 block mt-0.5">
                  Pass. Percept: <strong>{derived.passivePerception}</strong>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900 text-stone-400 print:hidden">
                <Eye className="w-5 h-5 text-teal-400" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-900 print:hidden">
              <span>Misc Max HP Bonus:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSetHpBonus(state.hpModifierBonus - 1)}
                  className="px-1.5 py-0.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 cursor-pointer"
                >
                  -
                </button>
                <span className="w-7 text-center text-stone-200 font-bold">
                  {formatModifier(state.hpModifierBonus)}
                </span>
                <button
                  onClick={() => onSetHpBonus(state.hpModifierBonus + 1)}
                  className="px-1.5 py-0.5 rounded bg-stone-900 hover:bg-stone-800 border border-stone-800 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sheet Grid: Left (Abilities & Skills) / Right (Spellbook, Armory, Equipment, Features, Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Abilities & Skills */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Ability Scores Cards */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-3 print-card">
            <h3 className="font-serif text-sm font-bold text-amber-200 flex items-center gap-2">
              <D20GothicIcon className="w-4 h-4 text-amber-500" />
              <span>Attributes & Saving Throws</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as AbilityKey[]).map((ability) => {
                const score = derived.finalAbilities[ability];
                const mod = derived.modifiers[ability];
                const save = derived.savingThrows[ability];

                return (
                  <div
                    key={ability}
                    className="p-3 rounded-xl border border-stone-800 bg-stone-950 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-serif font-bold text-stone-300">
                        {ABILITY_LABELS[ability].name}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-100">
                        {score}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => rollCheck(ability, ABILITY_LABELS[ability].name)}
                        className="flex-1 py-1 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title={`Roll ${ABILITY_LABELS[ability].name} Check (${formatModifier(mod)})`}
                      >
                        <span>{formatModifier(mod)}</span>
                      </button>

                      <button
                        onClick={() => rollSave(ability, ABILITY_LABELS[ability].name)}
                        className={`py-1 px-2 rounded-lg text-xs font-mono font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                          save.proficient
                            ? 'bg-amber-950/70 text-amber-300 border-amber-800 hover:bg-amber-900/80'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-stone-200'
                        }`}
                        title={`Roll ${ABILITY_LABELS[ability].name} Save (${formatModifier(save.bonus)}) ${save.proficient ? '(Proficient)' : ''}`}
                      >
                        {save.proficient && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        <span>Sv {formatModifier(save.bonus)}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trained Skills List w/ Automated Sources, Expertise & Jack of All Trades */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-3 print-card">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  Skills ({derived.rules.effectiveSkills.length} Prof
                  {derived.rules.effectiveExpertSkills.length > 0 ? ` · ${derived.rules.effectiveExpertSkills.length} Exp` : ''})
                </span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">
                PB +{derived.proficiencyBonus}{joatBonus > 0 ? ` · JoAT +${joatBonus}` : ''}
              </span>
            </div>

            <div className="divide-y divide-stone-900 max-h-[420px] overflow-y-auto pr-1">
              {ALL_SKILLS.map((skill) => {
                const autoEntry = derived.rules.autoSkills.find(a => a.name === skill.name);
                const isAuto = Boolean(autoEntry);
                const isManual = state.selectedSkills.includes(skill.name);
                const isProf = isAuto || isManual;
                const isExpert = derived.rules.effectiveExpertSkills.includes(skill.name);
                const abilityMod = derived.modifiers[skill.ability];
                const totalMod =
                  abilityMod +
                  (isExpert ? derived.proficiencyBonus * 2 : isProf ? derived.proficiencyBonus : joatBonus);

                return (
                  <div
                    key={skill.name}
                    className="py-1.5 flex items-center justify-between text-xs hover:bg-stone-950/60 px-2 rounded transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isProf}
                        disabled={isAuto}
                        onChange={() => onToggleSkill(skill.name)}
                        className="rounded border-stone-700 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-stone-950 cursor-pointer disabled:opacity-80"
                        title={isAuto ? `Granted by ${autoEntry!.sources.join(', ')}` : 'Toggle bonus proficiency (+PB)'}
                      />
                      <button
                        onClick={() => onToggleSkillExpertise(skill.name)}
                        className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
                          isExpert
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-stone-950 text-stone-500 border-stone-800 hover:text-amber-300 print:hidden'
                        }`}
                        title="Toggle Expertise (2× Proficiency Bonus)"
                      >
                        E
                      </button>
                      <span className={`font-sans truncate ${isExpert ? 'font-bold text-amber-200' : isProf ? 'font-semibold text-amber-300' : 'text-stone-300'}`}>
                        {skill.name}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500 uppercase">
                        ({ABILITY_LABELS[skill.ability].abbr})
                      </span>
                      {autoEntry && (
                        <span className="text-[9px] font-mono text-amber-400/80 bg-amber-950/40 px-1 rounded truncate max-w-[72px]" title={`Granted by ${autoEntry.sources.join(', ')}`}>
                          {autoEntry.sources[0]}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => rollSkill(skill.name, skill.ability)}
                      className="px-2 py-0.5 rounded bg-stone-900 group-hover:bg-amber-950/60 border border-stone-800 group-hover:border-amber-800 font-mono text-[11px] font-bold text-stone-200 group-hover:text-amber-300 transition-colors cursor-pointer shrink-0"
                      title={`Roll ${skill.name} (${formatModifier(totalMod)})`}
                    >
                      {formatModifier(totalMod)}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Spellbook, Combat Armory, Equipment, Features, Notes */}
        <div className="lg:col-span-7 space-y-6">

          {/* Spellcasting & Spellbook Card */}
          {showSpellcastingPanel && (
            <div className="rounded-2xl border border-violet-900/50 bg-stone-900/80 p-4 space-y-4 print-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <h3 className="font-serif text-sm font-bold text-violet-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Spellcasting & Grimoire</span>
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {derived.allowsSpellcastingChoice && (
                    <select
                      value={derived.spellcastingAbility || 'cha'}
                      onChange={(e) => onSetSpellcastingAbility(e.target.value as AbilityKey)}
                      className="bg-stone-950 border border-violet-800/60 text-violet-200 rounded-lg px-2 py-0.5 text-[11px] focus:outline-none print:hidden"
                      title="Choose Spellcasting Ability"
                    >
                      <option value="int">INT</option>
                      <option value="wis">WIS</option>
                      <option value="cha">CHA</option>
                    </select>
                  )}
                  {derived.spellSaveDc !== undefined && (
                    <>
                      <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/60 text-violet-200">
                        DC {derived.spellSaveDc}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/60 text-violet-200">
                        Atk {formatModifier(derived.spellAttackBonus || 0)}
                      </span>
                    </>
                  )}
                  {derived.cantripsKnown > 0 && (
                    <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                      Cantrips: {derived.cantripsKnown}
                    </span>
                  )}
                  {derived.spellsKnown !== null && derived.spellsKnown > 0 && (
                    <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                      Known: {derived.spellsKnown}
                    </span>
                  )}
                  {derived.preparedSpellLimit !== null && (
                    <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                      Prepare: {derived.preparedSpellLimit}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                    Cantrip ×{getCantripDiceCount(derived.level)}
                  </span>
                </div>
              </div>

              {/* Innate Spells from Ancestry & Feats */}
              {derived.rules.innateSpells.length > 0 && (
                <div className="rounded-xl bg-stone-950/90 border border-violet-900/40 p-2.5 space-y-1.5">
                  <div className="text-[10px] uppercase font-mono text-violet-300">
                    Innate Spells (Ancestry / Feats)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {derived.rules.innateSpells.map((sp, i) => (
                      <span
                        key={`${sp.name}_${i}`}
                        className="px-2 py-0.5 rounded bg-violet-950/60 border border-violet-800/50 text-[11px] text-violet-200"
                      >
                        {sp.name} <span className="text-[9px] text-violet-400">({sp.source})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Spell Slot Tracker */}
              {Object.keys(derived.spellSlots.slots).length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-serif uppercase tracking-wider text-stone-400">
                    {derived.spellSlots.casterType === 'pact' ? 'Pact Magic Slots (Short Rest)' : 'Spell Slots (Click Pips to Expend / Recover)'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(derived.spellSlots.slots)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([lvlStr, maxSlots]) => {
                        const slotLvl = Number(lvlStr);
                        const used = Math.min(maxSlots, state.usedSpellSlots[slotLvl] || 0);
                        return (
                          <div
                            key={slotLvl}
                            className="px-2.5 py-1.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-2"
                          >
                            <span className="text-[11px] font-mono text-violet-300 font-bold">
                              Lv {slotLvl}
                            </span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: maxSlots }).map((_, idx) => {
                                const isExpended = idx < used;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => onToggleSpellSlot(slotLvl, idx)}
                                    className={`w-4 h-4 rounded-sm border transition-all cursor-pointer ${
                                      isExpended
                                        ? 'bg-stone-900 border-stone-700 opacity-40'
                                        : 'bg-violet-500 border-violet-300 shadow-[0_0_6px_rgba(139,92,246,0.5)]'
                                    }`}
                                    title={isExpended ? 'Recover slot' : 'Expend slot'}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Selected Spells List */}
              {spellsByLevel.length > 0 ? (
                <div className="space-y-2.5">
                  {spellsByLevel.map(([lvl, list]) => (
                    <div key={lvl} className="space-y-1">
                      <div className="text-[10px] uppercase font-mono text-stone-400">
                        {lvl === 0 ? 'Cantrips' : `Level ${lvl} Spells`}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {list.map(sp => {
                          const isManualSpell = state.selectedSpellIds.includes(sp.id);
                          const isSubclassAuto = !isManualSpell && subclassBonusSpellIds.has(sp.id);
                          return (
                            <div
                              key={sp.id}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between gap-2 text-xs"
                            >
                              <button
                                onClick={() => onInspectEntry(sp)}
                                className="text-left text-stone-200 hover:text-amber-300 font-serif truncate cursor-pointer"
                                title="Inspect full spell description"
                              >
                                {sp.title}
                              </button>
                              <div className="flex items-center gap-1.5 shrink-0 print:hidden">
                                {isSubclassAuto && (
                                  <span
                                    className="text-[9px] font-mono px-1 rounded bg-violet-950 text-violet-300 border border-violet-800/60"
                                    title="Always prepared / granted by archetype"
                                  >
                                    Sub
                                  </span>
                                )}
                                {sp.concentration && (
                                  <span className="text-[9px] font-mono text-cyan-400" title="Concentration">C</span>
                                )}
                                {sp.ritual && (
                                  <span className="text-[9px] font-mono text-amber-400" title="Ritual">R</span>
                                )}
                                {isManualSpell && (
                                  <button
                                    onClick={() => onRemoveSpell(sp.id)}
                                    className="text-stone-500 hover:text-rose-400 cursor-pointer"
                                    title={`Remove ${sp.title}`}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">
                  No spells added to your grimoire yet. Pick spells in Step 4 to see them here.
                </p>
              )}
            </div>
          )}

          {/* Armory & Attacks with Click-to-Roll */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-4 print-card">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
                <CrossedSwords className="w-4 h-4 text-rose-400" />
                <span>Weapons & Actions</span>
              </h3>

              <button
                onClick={() => setShowAddAttack(!showAddAttack)}
                className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-[11px] text-amber-400 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer print:hidden"
              >
                <Plus className="w-3 h-3" />
                <span>Add Attack</span>
              </button>
            </div>

            {/* Custom attack form if opened */}
            {showAddAttack && (
              <form onSubmit={handleCreateAttack} className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-3 print:hidden">
                <div className="text-xs font-bold text-stone-200">Add Weapon or Spell Attack</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Attack Name (e.g. Greatsword)"
                    value={newAttackName}
                    onChange={(e) => setNewAttackName(e.target.value)}
                    className="sm:col-span-2 bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Bonus (+5)"
                    value={newAttackBonus}
                    onChange={(e) => setNewAttackBonus(parseInt(e.target.value, 10) || 0)}
                    className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dice (1d10+3)"
                    value={newAttackDice}
                    onChange={(e) => setNewAttackDice(e.target.value)}
                    className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Damage Type (e.g. slashing, radiant)"
                    value={newAttackType}
                    onChange={(e) => setNewAttackType(e.target.value)}
                    className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAttack(false)}
                      className="px-3 py-1 rounded-lg text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
                    >
                      Save Attack
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Attacks Table */}
            <div className="space-y-2">
              {allAttacks.map((atk, index) => (
                <div
                  key={`${atk.name}_${index}`}
                  className="p-3 rounded-xl border border-stone-800/90 bg-stone-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-amber-900/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-stone-200 text-sm">{atk.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                        {atk.type}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">
                      {atk.damageDice} {atk.damageType}
                    </div>
                  </div>

                  {/* Dual Roll Buttons: Attack & Damage */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => rollAttackToHit(atk.name, atk.bonus)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-900 text-rose-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-inner"
                      title={`Roll ${atk.name} To-Hit attack (1d20${formatModifier(atk.bonus)})`}
                    >
                      <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                      <span>{formatModifier(atk.bonus)} Hit</span>
                    </button>

                    <button
                      onClick={() => rollAttackDamage(atk.name, atk.damageDice, atk.damageType)}
                      className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-900 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-inner"
                      title={`Roll ${atk.name} Damage (${atk.damageDice})`}
                    >
                      <Sword className="w-3.5 h-3.5 text-amber-400" />
                      <span>Damage</span>
                    </button>

                    {index >= defaultAttacks.length && (
                      <button
                        onClick={() => onRemoveAttack(state.customAttacks[index - defaultAttacks.length]?.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-400 cursor-pointer print:hidden"
                        title="Delete custom attack"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Armor & Shield Equipment Configuration */}
            <div className="pt-3 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-stone-400 block">Equipped Armor:</label>
                <select
                  value={state.customArmor}
                  onChange={(e) => onSetArmor(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded-xl p-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="Unarmored">Unarmored (10 + Dex mod)</option>
                  <option value="Leather">Leather Armor (11 + Dex mod)</option>
                  <option value="Studded Leather">Studded Leather (12 + Dex mod)</option>
                  <option value="Scale Mail">Scale Mail (14 + min(Dex, 2))</option>
                  <option value="Breastplate">Breastplate (14 + min(Dex, 2))</option>
                  <option value="Half Plate">Half Plate (15 + min(Dex, 2))</option>
                  <option value="Ring Mail">Ring Mail (14 flat)</option>
                  <option value="Chain Mail">Chain Mail (16 flat)</option>
                  <option value="Plate">Plate Armor (18 flat)</option>
                </select>
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={state.shieldEquipped}
                    onChange={onToggleShield}
                    className="rounded border-stone-700 text-amber-500 focus:ring-0 bg-stone-950 cursor-pointer"
                  />
                  <span>Equip Shield (+2 AC)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Equipment & Inventory (Background Gear + Manual Gear) */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-3 print-card">
            <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
              <Backpack className="w-4 h-4 text-amber-400" />
              <span>Equipment &amp; Inventory</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {derived.rules.effectiveEquipment.length > 0 ? (
                derived.rules.effectiveEquipment.map((item, idx) => {
                  const manualIdx = (state.equipment || []).indexOf(item);
                  const isManual = manualIdx >= 0;
                  return (
                    <span
                      key={`${item}_${idx}`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${
                        isManual
                          ? 'bg-stone-950 border-stone-800 text-stone-200'
                          : 'bg-amber-950/30 border-amber-900/50 text-amber-200'
                      }`}
                    >
                      <span>{item}</span>
                      {!isManual && (
                        <span className="text-[9px] font-mono text-amber-400/80" title="Auto-granted by background">
                          BG
                        </span>
                      )}
                      {isManual && (
                        <button
                          onClick={() => onRemoveEquipment(manualIdx)}
                          className="text-stone-500 hover:text-rose-400 cursor-pointer print:hidden"
                          title={`Remove ${item}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-stone-500 italic">No gear listed yet.</span>
              )}
            </div>

            <form onSubmit={handleAddEquipmentSubmit} className="flex gap-2 print:hidden">
              <input
                type="text"
                placeholder="Add item, potion, focus, or coin pouch..."
                value={newGearItem}
                onChange={(e) => setNewGearItem(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!newGearItem.trim()}
                className="px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 disabled:opacity-40 border border-stone-800 text-xs text-amber-300 font-semibold cursor-pointer"
              >
                Add Item
              </button>
            </form>
          </div>

          {/* Features, Fighting Style, Class Options, Feats & Patron */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-4 print-card">
            <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
              <DragonShield className="w-4 h-4 text-amber-500" />
              <span>Features, Style, Class Options &amp; Feats</span>
            </h3>

            {/* Proficiencies, Languages & Active Class Resources Strip */}
            {(derived.rules.effectiveArmorProficiencies.length > 0 ||
              derived.rules.effectiveWeapons.length > 0 ||
              derived.rules.effectiveTools.length > 0 ||
              derived.rules.effectiveLanguages.length > 0 ||
              derived.rules.classProg.resources.length > 0) && (
              <div className="rounded-xl bg-stone-950/90 border border-stone-800/90 p-3 space-y-2 text-[11px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-stone-300">
                  {derived.rules.effectiveArmorProficiencies.length > 0 && (
                    <div>
                      <span className="text-stone-500 font-mono uppercase text-[10px]">Armor: </span>
                      <span>{derived.rules.effectiveArmorProficiencies.join(', ')}</span>
                    </div>
                  )}
                  {derived.rules.effectiveWeapons.length > 0 && (
                    <div>
                      <span className="text-stone-500 font-mono uppercase text-[10px]">Weapons: </span>
                      <span>{derived.rules.effectiveWeapons.join(', ')}</span>
                    </div>
                  )}
                  {derived.rules.effectiveTools.length > 0 && (
                    <div>
                      <span className="text-stone-500 font-mono uppercase text-[10px]">Tools: </span>
                      <span>{derived.rules.effectiveTools.join(', ')}</span>
                    </div>
                  )}
                  {derived.rules.effectiveLanguages.length > 0 && (
                    <div>
                      <span className="text-stone-500 font-mono uppercase text-[10px]">Languages: </span>
                      <span>{derived.rules.effectiveLanguages.join(', ')}</span>
                    </div>
                  )}
                </div>

                {derived.rules.classProg.resources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-stone-900">
                    {derived.rules.classProg.resources.map(res => (
                      <span
                        key={res.label}
                        className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 font-mono text-[10px] text-amber-300"
                      >
                        {res.label}: {res.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Race Card */}
              {selectedRace && (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Ancestry</span>
                    <span className="font-serif font-bold text-stone-200 text-xs truncate block">{selectedRace.title}</span>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{selectedRace.summary}</p>
                  </div>
                  <button
                    onClick={() => onInspectEntry(selectedRace)}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0 cursor-pointer print:hidden"
                    title="Read full ancestry traits in rulebook"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Class Card */}
              {selectedClass && (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Class Features</span>
                    <span className="font-serif font-bold text-stone-200 text-xs truncate block">{selectedClass.title}</span>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{selectedClass.summary}</p>
                  </div>
                  <button
                    onClick={() => onInspectEntry(selectedClass)}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0 cursor-pointer print:hidden"
                    title="Read full class rules & progression in rulebook"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Subclass Card */}
              {selectedSubclass && (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      {selectedClass?.title.toLowerCase() === 'warlock' ? 'Otherworldly Patron' : 'Archetype'}
                    </span>
                    <span className="font-serif font-bold text-stone-200 text-xs truncate block">{selectedSubclass.title}</span>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{selectedSubclass.summary}</p>
                  </div>
                  <button
                    onClick={() => onInspectEntry(selectedSubclass)}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0 cursor-pointer print:hidden"
                    title="Read subclass tenets & features"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Fighting Style Card */}
              {selectedFightingStyle && (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Fighting Style</span>
                    <span className="font-serif font-bold text-stone-200 text-xs truncate block">{selectedFightingStyle.title}</span>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{selectedFightingStyle.summary}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 print:hidden">
                    <button
                      onClick={() => onInspectEntry(selectedFightingStyle)}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
                      title="Inspect fighting style"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onClearFightingStyle}
                      className="p-1 text-stone-500 hover:text-rose-400 text-xs cursor-pointer"
                      title="Clear fighting style"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Class Options Cards */}
              {selectedClassOptions.map(opt => (
                <div key={opt.id} className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                      Class Option{opt.min_level ? ` · Lv ${opt.min_level}` : ''}
                    </span>
                    <span className="font-serif font-bold text-stone-200 text-xs truncate block">{opt.title}</span>
                    {opt.prerequisite && (
                      <span className="text-[10px] text-stone-400 font-mono block truncate">Prereq: {opt.prerequisite}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 print:hidden">
                    <button
                      onClick={() => onInspectEntry(opt)}
                      className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
                      title="Inspect class option"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveClassOption(opt.id)}
                      className="p-1 text-stone-500 hover:text-rose-400 text-xs cursor-pointer"
                      title={`Remove ${opt.title}`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {/* Selected Feats Cards */}
              {selectedFeats.length > 0 ? (
                selectedFeats.map(feat => (
                  <div key={feat.id} className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">Feat</span>
                      <span className="font-serif font-bold text-stone-200 text-xs truncate block">{feat.title}</span>
                      <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{feat.summary}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 print:hidden">
                      <button
                        onClick={() => onInspectEntry(feat)}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors cursor-pointer"
                        title="Inspect feat details"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveFeat(feat.id)}
                        className="p-1 text-stone-500 hover:text-rose-400 text-xs cursor-pointer"
                        title={`Remove ${feat.title}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/60 flex items-center text-xs text-stone-500 italic">
                  No feats chosen.
                </div>
              )}

              {/* Deity / Patron Card */}
              {selectedDeity && (
                <div className="sm:col-span-2 p-3 rounded-xl bg-stone-950 border border-amber-900/50 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">
                      Patron Deity · {getCampaignDisplayName(selectedDeity.campaign_id)}
                    </span>
                    <span className="font-serif font-bold text-stone-200 text-xs truncate block">
                      {selectedDeity.title} ({selectedDeity.alignment || 'Unaligned'})
                    </span>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                      Domains: {(selectedDeity.domains || []).join(', ')}
                      {selectedDeity.symbol ? ` · Symbol: ${selectedDeity.symbol}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => onInspectEntry(selectedDeity)}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0 cursor-pointer print:hidden"
                    title="Read deity lore & tenets"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes & Backstory */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-2 print-card">
            <h3 className="font-serif text-sm font-bold text-stone-200">
              Character Lore, Quests & Notes
            </h3>
            <textarea
              value={state.notes}
              onChange={(e) => onSetNotes(e.target.value)}
              placeholder="Record your character's personality traits, bonds, sacred relics, or backstory notes..."
              rows={4}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in print:hidden">
          <div className="bg-stone-900 border border-amber-900/80 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Reset Character Builder?
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              This will clear your current character selections, scores, and notes back to the starting step. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs text-stone-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onReset();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow cursor-pointer"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  );
};
