import React, { useMemo } from 'react';
import { CharacterState, AbilityKey, ABILITY_LABELS, ALL_SKILLS } from './types';
import { ArchiveEntry } from '../../types/archive';
import { DerivedStats, formatModifier, getCantripDiceCount } from './builderUtils';
import { Shield, Skull } from 'lucide-react';

interface PrintableCharacterSheetProps {
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
  allAttacks: { name: string; type: 'melee' | 'ranged' | 'spell'; bonus: number; damageDice: string; damageType: string }[];
}

const ABILITY_ORDER: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const SKILL_GROUP_ORDER: AbilityKey[] = ['str', 'dex', 'int', 'wis', 'cha'];

export const PrintableCharacterSheet: React.FC<PrintableCharacterSheetProps> = ({
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
  allAttacks,
}) => {
  const effectiveCurrentHp = state.currentHp === null ? derived.maxHp : state.currentHp;

  const groupedSkills = useMemo(() => {
    return SKILL_GROUP_ORDER.map((ab) => ({
      ability: ab,
      abbr: ABILITY_LABELS[ab].abbr,
      skills: ALL_SKILLS.filter((s) => s.ability === ab),
    }));
  }, []);

  const spellsByLevel = useMemo(() => {
    const map = new Map<number, ArchiveEntry[]>();
    selectedSpells
      .slice()
      .sort((a, b) => (a.level || 0) - (b.level || 0) || a.title.localeCompare(b.title))
      .forEach((sp) => {
        const lvl = typeof sp.level === 'number' ? sp.level : 0;
        if (!map.has(lvl)) map.set(lvl, []);
        map.get(lvl)!.push(sp);
      });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [selectedSpells]);

  const proficienciesList = useMemo(() => {
    const items: string[] = [];

    if (derived.rules.effectiveArmorProficiencies.length > 0) {
      items.push(`Armor: ${derived.rules.effectiveArmorProficiencies.join(', ')}`);
    }
    if (derived.rules.effectiveWeapons.length > 0) {
      items.push(`Weapons: ${derived.rules.effectiveWeapons.join(', ')}`);
    }
    if (derived.rules.effectiveTools.length > 0) {
      items.push(`Tools: ${derived.rules.effectiveTools.join(', ')}`);
    }
    if (derived.rules.effectiveLanguages.length > 0) {
      items.push(`Languages: ${derived.rules.effectiveLanguages.join(', ')}`);
    }
    if (selectedClass?.saving_throws && selectedClass.saving_throws.length > 0) {
      items.push(
        `Saving Throws: ${selectedClass.saving_throws.join(', ')}${
          derived.rules.allSavesBonus > 0 ? ` (+${derived.rules.allSavesBonus} all saves)` : ''
        }`
      );
    } else if (derived.rules.allSavesBonus > 0) {
      items.push(`Saving Throws: +${derived.rules.allSavesBonus} to all saves`);
    }

    return items;
  }, [derived.rules, selectedClass]);

  const joatBonus = derived.rules.classProg.jackOfAllTrades
    ? Math.floor(derived.proficiencyBonus / 2)
    : 0;

  const spellSlotEntries = Object.entries(derived.spellSlots.slots).sort(
    ([a], [b]) => Number(a) - Number(b)
  );

  // Fill up to 5 attack rows cleanly
  const blankAttackRows = Math.max(0, 5 - allAttacks.length);
  const equipmentItems = derived.rules.effectiveEquipment || [];
  const blankInventoryLines = Math.max(0, 9 - equipmentItems.length);

  return (
    <div className="hidden print:block bg-white text-black font-sans text-[10px] leading-tight">
      {/* ==================== PAGE 1: MAIN CHARACTER SHEET ==================== */}
      <div className="space-y-2">
        {/* TOP HEADER BANNER */}
        <div className="grid grid-cols-12 gap-2 items-stretch">
          {/* Left Header: Inspiration, Proficiency Bonus, Passive Perception */}
          <div className="col-span-4 flex flex-col justify-between gap-1.5">
            <div className="grid grid-cols-12 gap-1.5 items-center">
              <div className="col-span-4 border-[1.5px] border-black rounded h-9 flex items-center justify-center bg-white">
                <div className="w-4 h-4 border border-black rounded-sm" />
              </div>
              <div className="col-span-8 border-[1.5px] border-black rounded px-2 py-1 bg-gray-100 font-serif font-bold uppercase tracking-wider text-[9px] text-center">
                Inspiration
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1.5 items-center">
              <div className="col-span-8 border-[1.5px] border-black rounded px-2 py-1 bg-gray-100 font-serif font-bold uppercase tracking-wider text-[8.5px]">
                Proficiency Bonus
              </div>
              <div className="col-span-4 border-[1.5px] border-black rounded h-7 flex items-center justify-center font-mono font-bold text-sm bg-white">
                +{derived.proficiencyBonus}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1.5 items-center">
              <div className="col-span-4 border-[1.5px] border-black rounded h-7 flex items-center justify-center font-mono font-bold text-sm bg-white">
                {derived.passivePerception}
              </div>
              <div className="col-span-8 border-[1.5px] border-black rounded px-2 py-1 bg-gray-100 font-serif font-bold uppercase tracking-wider text-[8.5px]">
                Passive Perception
              </div>
            </div>
          </div>

          {/* Center Header: Character Name & AC Shield */}
          <div className="col-span-4 border-[1.5px] border-black rounded p-2 flex flex-col items-center justify-between bg-white relative">
            <div className="w-full text-center border-b border-gray-300 pb-1">
              <div className="text-[7.5px] uppercase tracking-widest text-gray-600 font-bold">
                Character Name
              </div>
              <div className="font-serif font-bold text-base leading-tight truncate">
                {state.name || 'Nameless Hero'}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex flex-col items-center justify-center border-2 border-black rounded-b-2xl rounded-t-md px-3.5 py-1 bg-gray-50">
                <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-gray-700">
                  <Shield className="w-2.5 h-2.5" />
                  <span>AC</span>
                </div>
                <div className="font-mono font-bold text-lg leading-none">{derived.armorClass}</div>
              </div>
              <div className="text-[8.5px] text-gray-700 max-w-[115px] leading-snug">
                <div className="font-bold text-black truncate">{state.customArmor}</div>
                {state.shieldEquipped && <div>+ Shield (+2 AC)</div>}
                {derived.spellSaveDc && (
                  <div className="font-mono text-[8px] mt-0.5">
                    Save DC {derived.spellSaveDc}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Header: Title/Alignment, Level/Class, Race/Background */}
          <div className="col-span-4 flex flex-col justify-between gap-1.5">
            <div className="grid grid-cols-12 border-[1.5px] border-black rounded overflow-hidden">
              <div className="col-span-8 px-2 py-1 border-r border-black">
                <div className="text-[7px] uppercase font-bold text-gray-600">Title / Archetype</div>
                <div className="font-semibold text-[9.5px] truncate">{state.genderOrTitle || '—'}</div>
              </div>
              <div className="col-span-4 px-2 py-1">
                <div className="text-[7px] uppercase font-bold text-gray-600">Alignment</div>
                <div className="font-semibold text-[9px] truncate">{state.alignment || '—'}</div>
              </div>
            </div>

            <div className="border-[1.5px] border-black rounded px-2 py-1">
              <div className="text-[7px] uppercase font-bold text-gray-600">Level &amp; Class</div>
              <div className="font-semibold text-[9.5px] truncate">
                Level {derived.level} {selectedClass?.title || 'Unset'}
                {selectedSubclass ? ` (${selectedSubclass.title})` : ''}
              </div>
            </div>

            <div className="border-[1.5px] border-black rounded px-2 py-1">
              <div className="text-[7px] uppercase font-bold text-gray-600">Race / Background</div>
              <div className="font-semibold text-[9.5px] truncate">
                {selectedRace?.title || 'Unset'}
                {derived.rules.raceProfile.activeSubrace ? ` (${derived.rules.raceProfile.activeSubrace.name})` : ''}
                {' · '}
                {selectedBackground?.title || 'Unset'}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN 3-COLUMN BODY */}
        <div className="grid grid-cols-12 gap-2 items-start">
          {/* ==================== COLUMN 1 (LEFT): ABILITIES, SAVES, SKILLS, WEAPONS ==================== */}
          <div className="col-span-4 space-y-2">
            {/* Upper Split: Ability Stack + Saves & Skills */}
            <div className="flex gap-1.5 items-stretch">
              {/* 6 Vertical Ability Score Boxes */}
              <div className="w-[62px] shrink-0 flex flex-col justify-between gap-1.5">
                {ABILITY_ORDER.map((ab) => {
                  const score = derived.finalAbilities[ab];
                  const mod = derived.modifiers[ab];
                  return (
                    <div
                      key={ab}
                      className="border-[1.5px] border-black rounded bg-white flex flex-col items-center overflow-hidden"
                    >
                      <div className="w-full bg-gray-200 border-b border-black text-center py-0.5 text-[7px] font-bold uppercase tracking-tight">
                        {ABILITY_LABELS[ab].abbr}
                      </div>
                      <div className="font-mono font-bold text-sm py-1.5 leading-none">{score}</div>
                      <div className="w-full border-t border-black bg-gray-50 text-center py-0.5 font-mono font-bold text-[10px]">
                        {formatModifier(mod)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Saving Throws + Grouped Skills */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                {/* Saving Throws Box */}
                <div className="border-[1.5px] border-black rounded bg-white overflow-hidden">
                  <div className="bg-gray-200 border-b border-black text-center py-0.5 font-serif font-bold text-[8.5px] uppercase tracking-wider">
                    Saving Throws
                  </div>
                  <div className="p-1.5 grid grid-cols-2 gap-x-2 gap-y-1">
                    {ABILITY_ORDER.map((ab) => {
                      const save = derived.savingThrows[ab];
                      return (
                        <div key={ab} className="flex items-center gap-1 text-[8.5px]">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full border border-black shrink-0 ${
                              save.proficient ? 'bg-black' : 'bg-white'
                            }`}
                          />
                          <span className="font-mono font-bold w-5 text-right border-b border-gray-400">
                            {formatModifier(save.bonus)}
                          </span>
                          <span className="uppercase font-semibold">{ABILITY_LABELS[ab].abbr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Skills Box Grouped by Ability */}
                <div className="border-[1.5px] border-black rounded bg-white overflow-hidden flex-1 flex flex-col">
                  <div className="bg-gray-200 border-b border-black text-center py-0.5 font-serif font-bold text-[8.5px] uppercase tracking-wider">
                    Skills
                  </div>
                  <div className="p-1.5 space-y-1.5 flex-1">
                    {groupedSkills.map((group) => (
                      <div key={group.ability} className="space-y-0.5">
                        <div className="text-[7px] font-bold uppercase text-gray-600 border-b border-gray-300 text-right pr-0.5">
                          {group.abbr}
                        </div>
                        {group.skills.map((sk) => {
                          const isProf = derived.rules.effectiveSkills.includes(sk.name);
                          const isExp = derived.rules.effectiveExpertSkills.includes(sk.name);
                          const mod =
                            derived.modifiers[sk.ability] +
                            (isExp
                              ? derived.proficiencyBonus * 2
                              : isProf
                              ? derived.proficiencyBonus
                              : joatBonus);

                          return (
                            <div key={sk.name} className="flex items-center gap-1 text-[8px] leading-tight">
                              <span
                                className={`inline-flex items-center justify-center w-2.5 h-2.5 rounded-full border border-black shrink-0 ${
                                  isExp ? 'bg-black ring-1 ring-inset ring-white' : isProf ? 'bg-black' : 'bg-white'
                                }`}
                              />
                              <span className="font-mono font-bold w-4 text-right border-b border-gray-400 shrink-0">
                                {formatModifier(mod)}
                              </span>
                              <span className={`truncate ${isProf || isExp ? 'font-bold' : ''}`}>
                                {sk.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 px-1.5 py-0.5 text-[6.5px] text-gray-600 flex justify-between">
                    <span>○ Untrained{joatBonus > 0 ? ` (+${joatBonus} JoAT)` : ''}</span>
                    <span>● Proficient</span>
                    <span>◉ Expertise</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weapons & Attacks Table */}
            <div className="border-[1.5px] border-black rounded bg-white overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-200 border-b border-black text-[7.5px] font-bold uppercase">
                <div className="col-span-4 px-1.5 py-1 border-r border-black">Weapon / Atk</div>
                <div className="col-span-2 px-1 py-1 border-r border-black text-center">Type</div>
                <div className="col-span-2 px-1 py-1 border-r border-black text-center">Bonus</div>
                <div className="col-span-4 px-1.5 py-1">Damage / Type</div>
              </div>
              <div className="divide-y divide-gray-300">
                {allAttacks.map((atk, idx) => (
                  <div key={`${atk.name}_${idx}`} className="grid grid-cols-12 text-[8px] items-center">
                    <div className="col-span-4 px-1.5 py-1 border-r border-gray-300 font-semibold truncate">
                      {atk.name}
                    </div>
                    <div className="col-span-2 px-1 py-1 border-r border-gray-300 text-center uppercase text-[7px]">
                      {atk.type}
                    </div>
                    <div className="col-span-2 px-1 py-1 border-r border-gray-300 text-center font-mono font-bold">
                      {formatModifier(atk.bonus)}
                    </div>
                    <div className="col-span-4 px-1.5 py-1 font-mono truncate">
                      {atk.damageDice} {atk.damageType}
                    </div>
                  </div>
                ))}
                {Array.from({ length: blankAttackRows }).map((_, i) => (
                  <div key={`blank_atk_${i}`} className="grid grid-cols-12 text-[8px] h-5">
                    <div className="col-span-4 border-r border-gray-300" />
                    <div className="col-span-2 border-r border-gray-300" />
                    <div className="col-span-2 border-r border-gray-300" />
                    <div className="col-span-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Armor, Shield & Currency Bar */}
            <div className="border-[1.5px] border-black rounded bg-white overflow-hidden">
              <div className="grid grid-cols-4 bg-gray-200 border-b border-black text-[7.5px] font-bold uppercase text-center">
                <div className="py-0.5 border-r border-black">PP</div>
                <div className="py-0.5 border-r border-black">GP</div>
                <div className="py-0.5 border-r border-black">SP</div>
                <div className="py-0.5">CP</div>
              </div>
              <div className="grid grid-cols-4 h-6 border-b border-black">
                <div className="border-r border-gray-300" />
                <div className="border-r border-gray-300" />
                <div className="border-r border-gray-300" />
                <div />
              </div>
              <div className="px-2 py-1 text-[8px] flex justify-between">
                <span><strong>Armor:</strong> {state.customArmor}</span>
                <span><strong>Shield:</strong> {state.shieldEquipped ? 'Yes (+2)' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* ==================== COLUMN 2 (CENTER): VITALS, DEATH SAVES, RESOURCES, INVENTORY ==================== */}
          <div className="col-span-4 space-y-2">
            {/* HP, Initiative & Speed */}
            <div className="border-[1.5px] border-black rounded bg-white p-2 space-y-2">
              <div className="grid grid-cols-2 gap-2 border-b border-gray-300 pb-1.5">
                <div>
                  <div className="text-[7px] uppercase font-bold text-gray-600">Max HP</div>
                  <div className="font-mono font-bold text-sm">{derived.maxHp}</div>
                </div>
                <div className="text-right">
                  <div className="text-[7px] uppercase font-bold text-gray-600">Temp HP</div>
                  <div className="font-mono font-bold text-sm">{state.tempHp > 0 ? state.tempHp : '—'}</div>
                </div>
              </div>

              <div className="border border-black rounded py-1.5 text-center bg-gray-50">
                <div className="text-[7.5px] uppercase font-bold text-gray-600">Current Hit Points</div>
                <div className="font-mono font-bold text-xl leading-none mt-0.5">{effectiveCurrentHp}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="border border-black rounded p-1 text-center">
                  <div className="text-[7px] uppercase font-bold text-gray-600">Initiative</div>
                  <div className="font-mono font-bold text-sm">{formatModifier(derived.initiative)}</div>
                </div>
                <div className="border border-black rounded p-1 text-center">
                  <div className="text-[7px] uppercase font-bold text-gray-600">Speed</div>
                  <div className="font-mono font-bold text-sm">{derived.speed}</div>
                </div>
              </div>
            </div>

            {/* Death Saves, Hit Dice & Exhaustion */}
            <div className="border-[1.5px] border-black rounded bg-white p-2 space-y-2">
              <div className="flex items-center justify-between border-b border-gray-300 pb-1.5">
                <div className="text-center">
                  <div className="text-[7px] font-bold uppercase mb-1">Success</div>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-full border border-black inline-block" />
                    <span className="w-3 h-3 rounded-full border border-black inline-block" />
                    <span className="w-3 h-3 rounded-full border border-black inline-block" />
                  </div>
                </div>

                <Skull className="w-5 h-5 text-black" />

                <div className="text-center">
                  <div className="text-[7px] font-bold uppercase mb-1">Failure</div>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-full border border-black inline-block" />
                    <span className="w-3 h-3 rounded-full border border-black inline-block" />
                    <span className="w-3 h-3 rounded-full border border-black inline-block" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 items-center">
                <div>
                  <div className="text-[7px] uppercase font-bold text-gray-600">Hit Dice</div>
                  <div className="font-mono font-bold text-xs">{derived.hitDiceTotal}</div>
                </div>
                <div className="text-right">
                  <div className="text-[7px] uppercase font-bold text-gray-600 mb-0.5">Exhaustion</div>
                  <div className="flex justify-end gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className="w-2.5 h-2.5 rounded-full border border-black inline-block" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Spell Slots / Class Resource Pips */}
            <div className="border-[1.5px] border-black rounded bg-white overflow-hidden">
              <div className="bg-gray-200 border-b border-black text-center py-0.5 font-serif font-bold text-[8px] uppercase tracking-wider">
                {spellSlotEntries.length > 0 ? 'Spell Slots & Casting' : 'Class Resources & Charges'}
              </div>
              <div className="p-2 space-y-1">
                {spellSlotEntries.length > 0 ? (
                  <>
                    {derived.spellSaveDc && (
                      <div className="flex justify-between text-[8px] font-mono border-b border-gray-300 pb-1 mb-1">
                        <span>
                          <strong>Ability:</strong> {ABILITY_LABELS[derived.spellcastingAbility || 'cha'].abbr}
                        </span>
                        <span>
                          <strong>Save DC:</strong> {derived.spellSaveDc}
                        </span>
                        <span>
                          <strong>Atk:</strong> {formatModifier(derived.spellAttackBonus || 0)}
                        </span>
                      </div>
                    )}
                    {spellSlotEntries.map(([lvlStr, maxSlots]) => {
                      const slotLvl = Number(lvlStr);
                      const used = Math.min(maxSlots, state.usedSpellSlots[slotLvl] || 0);
                      return (
                        <div key={lvlStr} className="flex items-center justify-between text-[8.5px] border-b border-gray-200 pb-0.5">
                          <span className="font-semibold">
                            {derived.spellSlots.casterType === 'pact' ? `Pact Level ${lvlStr}` : `Level ${lvlStr} Slots`}
                          </span>
                          <div className="flex gap-1">
                            {Array.from({ length: maxSlots }).map((_, idx) => (
                              <span
                                key={idx}
                                className={`w-3 h-3 rounded-full border border-black inline-block ${
                                  idx < used ? 'bg-black' : 'bg-white'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {derived.rules.classProg.resources.map((res) => (
                      <div key={res.label} className="flex items-center justify-between text-[8px] border-b border-gray-200 pb-0.5">
                        <span className="font-semibold">{res.label}</span>
                        <span className="font-mono font-bold">{res.value}</span>
                      </div>
                    ))}
                  </>
                ) : derived.rules.classProg.resources.length > 0 ? (
                  <>
                    {derived.rules.classProg.resources.map((res) => (
                      <div key={res.label} className="flex items-center justify-between border-b border-gray-300 py-0.5 text-[8.5px]">
                        <span className="font-semibold">{res.label}</span>
                        <span className="font-mono font-bold">{res.value}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`res_${i}`} className="flex items-center justify-between border-b border-gray-300 h-4">
                      <span className="text-[7.5px] text-gray-400">Resource</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((c) => (
                          <span key={c} className="w-2.5 h-2.5 rounded-full border border-black inline-block" />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Inventory & Equipment */}
            <div className="border-[1.5px] border-black rounded bg-white overflow-hidden">
              <div className="bg-gray-200 border-b border-black text-center py-0.5 font-serif font-bold text-[8.5px] uppercase tracking-wider">
                Inventory
              </div>
              <div className="divide-y divide-gray-300 px-2 py-0.5">
                {equipmentItems.map((item, idx) => (
                  <div key={`${item}_${idx}`} className="py-1 text-[8.5px] truncate">
                    • {item}
                  </div>
                ))}
                {Array.from({ length: blankInventoryLines }).map((_, idx) => (
                  <div key={`inv_blank_${idx}`} className="h-[18px]" />
                ))}
              </div>
            </div>

            {/* Proficiencies & Faith */}
            <div className="border-[1.5px] border-black rounded bg-white overflow-hidden">
              <div className="bg-gray-200 border-b border-black text-center py-0.5 font-serif font-bold text-[8.5px] uppercase tracking-wider">
                Proficiencies &amp; Faith
              </div>
              <div className="p-2 space-y-1 text-[8px] leading-snug">
                {proficienciesList.length > 0 ? (
                  proficienciesList.map((line, i) => <div key={i}>{line}</div>)
                ) : (
                  <div className="text-gray-600">
                    Saves: {(selectedClass?.saving_throws || []).join(', ') || 'See Class'}
                  </div>
                )}
                {selectedDeity && (
                  <div className="pt-1 border-t border-gray-300">
                    <strong>Patron:</strong> {selectedDeity.title} ({selectedDeity.alignment || 'Unaligned'})
                    {selectedDeity.domains && selectedDeity.domains.length > 0 && (
                      <span> · Domains: {selectedDeity.domains.join(', ')}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================== COLUMN 3 (RIGHT): NOTES & TRAITS/FEATURES ==================== */}
          <div className="col-span-4 space-y-2">
            {/* Character Notes / Backstory Box */}
            <div className="border-[1.5px] border-black rounded bg-white overflow-hidden">
              <div className="bg-gray-200 border-b border-black px-2 py-0.5 font-serif font-bold text-[8px] uppercase tracking-wider">
                Personality, Bonds &amp; Notes
              </div>
              <div className="p-2 text-[8.5px] leading-snug min-h-[115px] whitespace-pre-wrap">
                {state.notes || ' '}
              </div>
            </div>

            {/* Traits, Features, Options & Feats */}
            <div className="border-[1.5px] border-black rounded bg-white overflow-hidden">
              <div className="bg-gray-200 border-b border-black text-center py-0.5 font-serif font-bold text-[8.5px] uppercase tracking-wider">
                Traits, Features &amp; Feats
              </div>
              <div className="p-2 space-y-1.5 text-[8px] leading-snug">
                {selectedRace && (
                  <div className="border-b border-gray-200 pb-1">
                    <div className="font-bold uppercase text-[7.5px]">
                      Ancestry: {selectedRace.title}
                      {derived.rules.raceProfile.activeSubrace ? ` (${derived.rules.raceProfile.activeSubrace.name})` : ''}
                      {derived.rules.raceProfile.darkvision ? ` · Darkvision ${derived.rules.raceProfile.darkvision} ft.` : ''}
                    </div>
                    {selectedRace.traits && selectedRace.traits.length > 0 ? (
                      <div>{selectedRace.traits.join(' · ')}</div>
                    ) : selectedRace.summary ? (
                      <div>{selectedRace.summary}</div>
                    ) : null}
                    {derived.rules.innateSpells.length > 0 && (
                      <div className="text-[7.5px] text-gray-800 mt-0.5">
                        <strong>Innate Spells:</strong> {derived.rules.innateSpells.map(s => s.name).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {selectedClass && (
                  <div className="border-b border-gray-200 pb-1">
                    <div className="font-bold uppercase text-[7.5px]">
                      Class: {selectedClass.title} (Hit Die {selectedClass.hit_die || 'd8'})
                    </div>
                    {selectedClass.summary && <div>{selectedClass.summary}</div>}
                  </div>
                )}

                {selectedSubclass && (
                  <div className="border-b border-gray-200 pb-1">
                    <div className="font-bold uppercase text-[7.5px]">Archetype: {selectedSubclass.title}</div>
                    {selectedSubclass.summary && <div>{selectedSubclass.summary}</div>}
                  </div>
                )}

                {selectedBackground && (
                  <div className="border-b border-gray-200 pb-1">
                    <div className="font-bold uppercase text-[7.5px]">Background: {selectedBackground.title}</div>
                    {selectedBackground.summary && <div>{selectedBackground.summary}</div>}
                  </div>
                )}

                {selectedFightingStyle && (
                  <div className="border-b border-gray-200 pb-1">
                    <div className="font-bold uppercase text-[7.5px]">Fighting Style: {selectedFightingStyle.title}</div>
                    {selectedFightingStyle.summary && <div>{selectedFightingStyle.summary}</div>}
                  </div>
                )}

                {selectedClassOptions.length > 0 && (
                  <div className="border-b border-gray-200 pb-1 space-y-0.5">
                    <div className="font-bold uppercase text-[7.5px]">Class Options &amp; Invocations</div>
                    {selectedClassOptions.map((opt) => (
                      <div key={opt.id}>
                        <strong>{opt.title}</strong>
                        {opt.min_level ? ` (Lv ${opt.min_level})` : ''}
                        {opt.summary ? `: ${opt.summary}` : ''}
                      </div>
                    ))}
                  </div>
                )}

                {selectedFeats.length > 0 && (
                  <div className="border-b border-gray-200 pb-1 space-y-0.5">
                    <div className="font-bold uppercase text-[7.5px]">Feats</div>
                    {selectedFeats.map((feat) => (
                      <div key={feat.id}>
                        <strong>{feat.title}</strong>
                        {feat.summary ? `: ${feat.summary}` : ''}
                      </div>
                    ))}
                  </div>
                )}

                {selectedSpells.length > 0 && (
                  <div className="pt-0.5">
                    <div className="font-bold uppercase text-[7.5px]">
                      Prepared / Known Spells ({selectedSpells.length} — full list on Page 2)
                    </div>
                    <div className="text-[7.5px] text-gray-800">
                      {selectedSpells.map((s) => s.title).join(', ')}
                    </div>
                  </div>
                )}

                {/* Extra ruled lines for tabletop notes */}
                <div className="divide-y divide-gray-300 pt-1">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`trait_line_${idx}`} className="h-[18px]" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PAGE 2: SPELLBOOK GRIMOIRE (ONLY WHEN SPELLS SELECTED) ==================== */}
      {selectedSpells.length > 0 && (
        <div className="break-before-page pt-2 space-y-2.5">
          <div className="border-[1.5px] border-black rounded p-2.5 bg-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[8px] uppercase font-bold tracking-wider text-gray-700">
                Spellcasting Grimoire
              </div>
              <div className="font-serif font-bold text-base">
                {state.name || 'Nameless Hero'} — Level {derived.level} {selectedClass?.title || 'Caster'}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              {derived.spellSaveDc && (
                <>
                  <div>
                    <span className="text-[8px] uppercase block text-gray-600">Ability</span>
                    <strong>{ABILITY_LABELS[derived.spellcastingAbility || 'cha'].abbr}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase block text-gray-600">Save DC</span>
                    <strong>{derived.spellSaveDc}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase block text-gray-600">Spell Atk</span>
                    <strong>{formatModifier(derived.spellAttackBonus || 0)}</strong>
                  </div>
                </>
              )}
              <div>
                <span className="text-[8px] uppercase block text-gray-600">Cantrip Scaling</span>
                <strong>×{getCantripDiceCount(derived.level)}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {spellsByLevel.map(([lvl, list]) => (
              <div key={lvl} className="border-[1.5px] border-black rounded overflow-hidden break-inside-avoid">
                <div className="bg-gray-200 border-b border-black px-2.5 py-1 flex items-center justify-between">
                  <span className="font-serif font-bold text-[9.5px] uppercase tracking-wider">
                    {lvl === 0 ? 'Cantrips (At Will)' : `Level ${lvl} Spells`}
                  </span>
                  {derived.spellSlots.slots[lvl] && (
                    <div className="flex items-center gap-1.5 text-[8px]">
                      <span className="font-bold">Slots:</span>
                      {Array.from({ length: derived.spellSlots.slots[lvl] }).map((_, idx) => (
                        <span key={idx} className="w-3 h-3 rounded-full border border-black bg-white inline-block" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-300">
                  {list.map((sp) => (
                    <div key={sp.id} className="p-2 border-b border-gray-300 space-y-0.5 text-[8px]">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-serif font-bold text-[9px]">{sp.title}</span>
                        <span className="text-[7px] font-mono uppercase text-gray-700">
                          {sp.school || 'Spell'}
                          {sp.concentration ? ' · Conc' : ''}
                          {sp.ritual ? ' · Ritual' : ''}
                        </span>
                      </div>
                      {(sp.casting_time || sp.range || sp.duration) && (
                        <div className="text-[7.5px] text-gray-700">
                          {[sp.casting_time, sp.range, sp.duration].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      {sp.summary && <div className="text-gray-800 leading-snug">{sp.summary}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
