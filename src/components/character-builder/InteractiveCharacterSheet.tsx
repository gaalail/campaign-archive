import React, { useState, useMemo } from 'react';
import { CharacterState, AbilityKey, ABILITY_LABELS, ALL_SKILLS, CustomAttack } from './types';
import { ArchiveEntry } from '../../types/archive';
import { getCampaignDisplayName } from '../../utils/archiveUtils';
import { DerivedStats, formatModifier, generateDefaultAttacks } from './builderUtils';
import { useOptionalDice } from '../DiceRoller';
import {
  Shield,
  Heart,
  Zap,
  Eye,
  Wind,
  Copy,
  Share2,
  Download,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Check,
  BookOpen,
  Sword,
  Crosshair
} from 'lucide-react';
import { D20GothicIcon, CrossedSwords, DragonShield } from '../GothicIcons';

interface InteractiveCharacterSheetProps {
  state: CharacterState;
  selectedRace: ArchiveEntry | null;
  selectedClass: ArchiveEntry | null;
  selectedSubclass: ArchiveEntry | null;
  selectedBackground: ArchiveEntry | null;
  selectedFeat: ArchiveEntry | null;
  selectedDeity?: ArchiveEntry | null;
  derived: DerivedStats;
  onSetName: (name: string) => void;
  onSetGenderOrTitle: (title: string) => void;
  onSetAlignment: (align: string) => void;
  onToggleSkill: (skill: string) => void;
  onSetArmor: (armor: string) => void;
  onToggleShield: () => void;
  onSetNotes: (notes: string) => void;
  onAddAttack: (attack: CustomAttack) => void;
  onRemoveAttack: (id: string) => void;
  onInspectEntry: (entry: ArchiveEntry) => void;
  onReset: () => void;
}

export const InteractiveCharacterSheet: React.FC<InteractiveCharacterSheetProps> = ({
  state,
  selectedRace,
  selectedClass,
  selectedSubclass,
  selectedBackground,
  selectedFeat,
  selectedDeity,
  derived,
  onSetName,
  onSetGenderOrTitle,
  onSetAlignment,
  onToggleSkill,
  onSetArmor,
  onToggleShield,
  onSetNotes,
  onAddAttack,
  onRemoveAttack,
  onInspectEntry,
  onReset
}) => {
  const dice = useOptionalDice();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // New attack form
  const [showAddAttack, setShowAddAttack] = useState(false);
  const [newAttackName, setNewAttackName] = useState('');
  const [newAttackBonus, setNewAttackBonus] = useState(4);
  const [newAttackDice, setNewAttackDice] = useState('1d8+2');
  const [newAttackType, setNewAttackType] = useState('slashing');

  const defaultAttacks = useMemo(() => {
    return generateDefaultAttacks(selectedClass, derived.modifiers, derived.proficiencyBonus);
  }, [selectedClass, derived.modifiers, derived.proficiencyBonus]);

  const allAttacks = useMemo(() => {
    const list = [...defaultAttacks];
    state.customAttacks.forEach(a => {
      list.push({
        name: a.name,
        type: a.type === 'ranged' ? 'ranged' : 'melee',
        bonus: a.bonus,
        damageDice: a.damageDice,
        damageType: a.damageType
      });
    });
    return list;
  }, [defaultAttacks, state.customAttacks]);

  // Dice roll actions
  const rollCheck = (ability: AbilityKey, name: string) => {
    const mod = derived.modifiers[ability];
    const formula = `1d20${formatModifier(mod)}`;
    dice?.roll(formula, `${name} Check`);
  };

  const rollSave = (ability: AbilityKey, name: string) => {
    const saveInfo = derived.savingThrows[ability];
    const formula = `1d20${formatModifier(saveInfo.bonus)}`;
    dice?.roll(formula, `${name} Saving Throw`);
  };

  const rollSkill = (skillName: string, ability: AbilityKey) => {
    const isProf = state.selectedSkills.includes(skillName);
    const mod = derived.modifiers[ability] + (isProf ? derived.proficiencyBonus : 0);
    const formula = `1d20${formatModifier(mod)}`;
    dice?.roll(formula, `${skillName} (${ABILITY_LABELS[ability].abbr}) Check`);
  };

  const rollInitiative = () => {
    const formula = `1d20${formatModifier(derived.initiative)}`;
    dice?.roll(formula, 'Initiative Check');
  };

  const rollHitDie = () => {
    const formula = `${derived.hitDie}${formatModifier(derived.modifiers.con)}`;
    dice?.roll(formula, 'Hit Die Recovery');
  };

  const rollAttackToHit = (atkName: string, bonus: number) => {
    const formula = `1d20${formatModifier(bonus)}`;
    dice?.roll(formula, `${atkName} Attack`);
  };

  const rollAttackDamage = (atkName: string, diceFormula: string, dmgType: string) => {
    dice?.roll(diceFormula, `${atkName} Damage (${dmgType})`);
  };

  // Share link generator
  const copyShareLink = () => {
    try {
      const payload = {
        name: state.name,
        title: state.genderOrTitle,
        alignment: state.alignment,
        race: state.raceId,
        class: state.classId,
        subclass: state.subclassId,
        background: state.backgroundId,
        feat: state.featId,
        campaign: state.campaignId,
        deity: state.deityId,
        abilities: state.baseAbilities,
        racialBonuses: state.racialBonuses,
        skills: state.selectedSkills,
        armor: state.customArmor,
        shield: state.shieldEquipped,
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

  // Export Markdown
  const exportMarkdown = () => {
    const lines = [
      `# ${state.name} — ${state.genderOrTitle || 'Hero'}`,
      `**Level 1 ${selectedRace?.title || 'Unknown Ancestry'} ${selectedClass?.title || 'Adventurer'}${selectedSubclass ? ` (${selectedSubclass.title})` : ''}** | ${state.alignment}`,
      `**Background:** ${selectedBackground?.title || 'None'}${state.campaignId ? ` | **Campaign:** ${getCampaignDisplayName(state.campaignId)}` : ''}${selectedDeity ? ` | **Patron Deity:** ${selectedDeity.title}` : ''}`,
      '',
      '---',
      '',
      `### Core Combat Statistics`,
      `- **Armor Class (AC):** ${derived.armorClass} (${state.customArmor}${state.shieldEquipped ? ' + Shield' : ''})`,
      `- **Hit Points (HP):** ${derived.maxHp} (Hit Die: 1${derived.hitDie})`,
      `- **Speed:** ${derived.speed}`,
      `- **Initiative:** ${formatModifier(derived.initiative)}`,
      `- **Proficiency Bonus:** +${derived.proficiencyBonus}`,
      `- **Passive Perception:** ${derived.passivePerception}`,
      ...(derived.spellSaveDc ? [`- **Spell Save DC:** ${derived.spellSaveDc} | **Spell Attack:** ${formatModifier(derived.spellAttackBonus || 0)}`] : []),
      '',
      `### Ability Scores`,
      `| Ability | Score | Modifier | Saving Throw |`,
      `| :--- | :---: | :---: | :---: |`,
      `| Strength | ${derived.finalAbilities.str} | ${formatModifier(derived.modifiers.str)} | ${formatModifier(derived.savingThrows.str.bonus)} ${derived.savingThrows.str.proficient ? '(Proficient)' : ''} |`,
      `| Dexterity | ${derived.finalAbilities.dex} | ${formatModifier(derived.modifiers.dex)} | ${formatModifier(derived.savingThrows.dex.bonus)} ${derived.savingThrows.dex.proficient ? '(Proficient)' : ''} |`,
      `| Constitution | ${derived.finalAbilities.con} | ${formatModifier(derived.modifiers.con)} | ${formatModifier(derived.savingThrows.con.bonus)} ${derived.savingThrows.con.proficient ? '(Proficient)' : ''} |`,
      `| Intelligence | ${derived.finalAbilities.int} | ${formatModifier(derived.modifiers.int)} | ${formatModifier(derived.savingThrows.int.bonus)} ${derived.savingThrows.int.proficient ? '(Proficient)' : ''} |`,
      `| Wisdom | ${derived.finalAbilities.wis} | ${formatModifier(derived.modifiers.wis)} | ${formatModifier(derived.savingThrows.wis.bonus)} ${derived.savingThrows.wis.proficient ? '(Proficient)' : ''} |`,
      `| Charisma | ${derived.finalAbilities.cha} | ${formatModifier(derived.modifiers.cha)} | ${formatModifier(derived.savingThrows.cha.bonus)} ${derived.savingThrows.cha.proficient ? '(Proficient)' : ''} |`,
      '',
      `### Trained Skills`,
      state.selectedSkills.map(s => `- **${s}**`).join('\n') || '- None chosen',
      '',
      `### Weapons & Attacks`,
      ...allAttacks.map(a => `- **${a.name}**: ${formatModifier(a.bonus)} to hit, ${a.damageDice} ${a.damageType}`),
      '',
      ...(selectedFeat ? [`### Feat: ${selectedFeat.title}`, `${selectedFeat.summary || ''}`, ''] : []),
      `### Character Notes & Background`,
      state.notes || 'None recorded.',
      '',
      `*Generated with Campaign Archive 5e Codex Character Builder*`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2500);
  };

  // Download JSON
  const downloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${state.name.toLowerCase().replace(/\s+/g, '_')}_sheet.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header Information */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          
          {/* Identity fields */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
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
                className="bg-transparent font-serif text-2xl md:text-3xl font-bold text-stone-100 border-b border-transparent hover:border-stone-700 focus:border-amber-500 focus:outline-none min-w-[240px]"
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
              <span className="text-stone-200 font-semibold">
                Level 1 {selectedClass?.title || 'Class Unset'}
                {selectedSubclass ? ` (${selectedSubclass.title})` : ''}
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
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={copyShareLink}
              className="px-3.5 py-2 rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              title="Copy URL hash link with your build"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Build'}</span>
            </button>

            <button
              onClick={exportMarkdown}
              className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy markdown character sheet to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedMarkdown ? 'Markdown Copied!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={downloadJson}
              className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 text-xs transition-colors"
              title="Download character JSON file"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-xl bg-stone-950 hover:bg-rose-950/60 border border-stone-800 hover:border-rose-900 text-stone-400 hover:text-rose-300 text-xs transition-colors"
              title="Reset character builder"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Core Vitals Quad: HP, AC, Initiative, Speed */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Hit Points */}
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Hit Points</span>
              <span className="text-2xl font-mono font-bold text-rose-200">{derived.maxHp}</span>
              <span className="text-[10px] text-rose-400/80 block mt-0.5">Die: 1{derived.hitDie}</span>
            </div>
            <button
              onClick={rollHitDie}
              className="p-2 rounded-lg bg-rose-900/50 hover:bg-rose-800/60 text-rose-200 text-xs flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              title={`Roll Hit Die recovery (1${derived.hitDie} + Con)`}
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] font-mono font-bold">Roll</span>
            </button>
          </div>

          {/* Armor Class */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Armor Class</span>
              <span className="text-2xl font-mono font-bold text-emerald-200">{derived.armorClass}</span>
              <span className="text-[10px] text-emerald-400/80 block mt-0.5 truncate max-w-[120px]">
                {state.customArmor}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-900/40 text-emerald-300">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Initiative */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-900/60 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">Initiative</span>
              <span className="text-2xl font-mono font-bold text-cyan-200">{formatModifier(derived.initiative)}</span>
              <span className="text-[10px] text-cyan-400/80 block mt-0.5">Dexterity</span>
            </div>
            <button
              onClick={rollInitiative}
              className="p-2 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/60 text-cyan-200 text-xs flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              title="Roll Initiative check"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold">Roll</span>
            </button>
          </div>

          {/* Speed & Perception */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Speed / Pass.</span>
              <span className="text-xl font-mono font-bold text-stone-200">{derived.speed}</span>
              <span className="text-[10px] text-teal-400 block mt-0.5">
                Pass. Percept: <strong>{derived.passivePerception}</strong>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-stone-900 text-stone-400">
              <Eye className="w-5 h-5 text-teal-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Sheet Grid: Left (Abilities & Skills) / Right (Armory, Features, Spells) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Abilities & Skills */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Ability Scores Cards */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-3">
            <h3 className="font-serif text-sm font-bold text-amber-200 flex items-center gap-2">
              <D20GothicIcon className="w-4 h-4 text-amber-500" />
              <span>Attributes & Saving Throws (Click to Roll)</span>
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
                      {/* Ability Check Roll */}
                      <button
                        onClick={() => rollCheck(ability, ABILITY_LABELS[ability].name)}
                        className="flex-1 py-1 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title={`Roll ${ABILITY_LABELS[ability].name} Check (${formatModifier(mod)})`}
                      >
                        <span>Check: {formatModifier(mod)}</span>
                      </button>

                      {/* Save Roll */}
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
                        <span>Save: {formatModifier(save.bonus)}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trained Skills List */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Skills & Proficiencies ({state.selectedSkills.length} selected)</span>
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">
                Prof: +{derived.proficiencyBonus}
              </span>
            </div>

            <div className="divide-y divide-stone-900 max-h-[360px] overflow-y-auto pr-1">
              {ALL_SKILLS.map((skill) => {
                const isProf = state.selectedSkills.includes(skill.name);
                const abilityMod = derived.modifiers[skill.ability];
                const totalMod = abilityMod + (isProf ? derived.proficiencyBonus : 0);

                return (
                  <div
                    key={skill.name}
                    className="py-1.5 flex items-center justify-between text-xs hover:bg-stone-950/60 px-2 rounded transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        checked={isProf}
                        onChange={() => onToggleSkill(skill.name)}
                        className="rounded border-stone-700 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-stone-950 cursor-pointer"
                        title="Toggle skill proficiency"
                      />
                      <span className={`font-sans truncate ${isProf ? 'font-bold text-amber-300' : 'text-stone-300'}`}>
                        {skill.name}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500 uppercase">
                        ({ABILITY_LABELS[skill.ability].abbr})
                      </span>
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

        {/* Right Column (7 cols): Combat Armory, Equipment, Feats, Notes */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Armory & Attacks with Click-to-Roll */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
                <CrossedSwords className="w-4 h-4 text-rose-400" />
                <span>Weapons & Actions (Click to Roll)</span>
              </h3>

              <button
                onClick={() => setShowAddAttack(!showAddAttack)}
                className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-[11px] text-amber-400 hover:text-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Attack</span>
              </button>
            </div>

            {/* Custom attack form if opened */}
            {showAddAttack && (
              <form onSubmit={handleCreateAttack} className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="text-xs font-bold text-stone-200">Add Weapon or Spell Attack</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Attack Name (e.g. Eldritch Blast)"
                    value={newAttackName}
                    onChange={(e) => setNewAttackName(e.target.value)}
                    className="sm:col-span-2 bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Bonus (+5)"
                    value={newAttackBonus}
                    onChange={(e) => setNewAttackBonus(parseInt(e.target.value, 10))}
                    className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dice (1d10)"
                    value={newAttackDice}
                    onChange={(e) => setNewAttackDice(e.target.value)}
                    className="bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAttack(false)}
                    className="px-3 py-1 rounded-lg text-xs text-stone-400 hover:text-stone-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400"
                  >
                    Save Attack
                  </button>
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

                    {/* Delete custom attack */}
                    {index >= defaultAttacks.length && (
                      <button
                        onClick={() => onRemoveAttack(state.customAttacks[index - defaultAttacks.length]?.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-400"
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

          {/* Features, Feats & Lore with Rule Inspection Links */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-4">
            <h3 className="font-serif text-sm font-bold text-stone-200 flex items-center gap-2">
              <DragonShield className="w-4 h-4 text-amber-500" />
              <span>Features, Ancestry & Feats</span>
            </h3>

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
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0"
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
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0"
                    title="Read full class rules & spell lists in rulebook"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Subclass Card */}
              {selectedSubclass && (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Archetype</span>
                    <span className="font-serif font-bold text-stone-200 text-xs truncate block">{selectedSubclass.title}</span>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{selectedSubclass.summary}</p>
                  </div>
                  <button
                    onClick={() => onInspectEntry(selectedSubclass)}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0"
                    title="Read archetype tenets & features"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Feat Card */}
              {selectedFeat ? (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Feat</span>
                    <span className="font-serif font-bold text-stone-200 text-xs truncate block">{selectedFeat.title}</span>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{selectedFeat.summary}</p>
                  </div>
                  <button
                    onClick={() => onInspectEntry(selectedFeat)}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0"
                    title="Inspect feat details"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800/60 flex items-center text-xs text-stone-500 italic">
                  No starting feat chosen.
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
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 hover:text-amber-200 transition-colors shrink-0 cursor-pointer"
                    title="Read deity lore & tenets"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes & Backstory */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-2">
            <h3 className="font-serif text-sm font-bold text-stone-200">
              Character Lore, Quests & Equipment Notes
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
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
                className="px-4 py-2 rounded-xl text-xs text-stone-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onReset();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
