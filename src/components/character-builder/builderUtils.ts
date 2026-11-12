import { CharacterState, AbilityKey, AbilityScores } from './types';
import { ArchiveEntry } from '../../types/archive';

export function getFinalAbilityScores(state: CharacterState): AbilityScores {
  const scores: AbilityScores = { ...state.baseAbilities };
  if (state.racialBonuses.primary) {
    scores[state.racialBonuses.primary] += 2;
  }
  if (state.racialBonuses.secondary && state.racialBonuses.secondary !== state.racialBonuses.primary) {
    scores[state.racialBonuses.secondary] += 1;
  }
  return scores;
}

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function parseHitDieMax(hitDieStr?: string | null): number {
  if (!hitDieStr) return 8;
  const match = hitDieStr.match(/d(\d+)/i);
  return match ? parseInt(match[1], 10) : 8;
}

export interface DerivedStats {
  finalAbilities: AbilityScores;
  modifiers: Record<AbilityKey, number>;
  maxHp: number;
  hitDie: string;
  armorClass: number;
  initiative: number;
  speed: string;
  proficiencyBonus: number;
  passivePerception: number;
  savingThrows: Record<AbilityKey, { proficient: boolean; bonus: number }>;
  spellcastingAbility?: AbilityKey;
  spellSaveDc?: number;
  spellAttackBonus?: number;
}

export function calculateDerivedStats(
  state: CharacterState,
  selectedRace: ArchiveEntry | null,
  selectedClass: ArchiveEntry | null
): DerivedStats {
  const finalAbilities = getFinalAbilityScores(state);
  const modifiers: Record<AbilityKey, number> = {
    str: getAbilityModifier(finalAbilities.str),
    dex: getAbilityModifier(finalAbilities.dex),
    con: getAbilityModifier(finalAbilities.con),
    int: getAbilityModifier(finalAbilities.int),
    wis: getAbilityModifier(finalAbilities.wis),
    cha: getAbilityModifier(finalAbilities.cha),
  };

  const proficiencyBonus = 2; // Level 1 default

  // Hit Points
  const hitDieNumber = parseHitDieMax(selectedClass?.hit_die);
  const maxHp = Math.max(1, hitDieNumber + modifiers.con);

  // Speed
  let speed = '30 ft.';
  if (selectedRace?.speed) {
    speed = selectedRace.speed;
  } else if (selectedRace?.title) {
    const lower = selectedRace.title.toLowerCase();
    if (lower.includes('dwarf') || lower.includes('gnome') || lower.includes('halfling')) {
      speed = '25 ft.';
    } else if (lower.includes('wood elf')) {
      speed = '35 ft.';
    }
  }

  // Armor Class Calculation
  let baseAc = 10 + modifiers.dex;
  const armor = state.customArmor.toLowerCase();
  const classTitle = (selectedClass?.title || '').toLowerCase();

  if (armor === 'unarmored' || !armor) {
    if (classTitle.includes('barbarian')) {
      baseAc = 10 + modifiers.dex + modifiers.con;
    } else if (classTitle.includes('monk')) {
      baseAc = 10 + modifiers.dex + modifiers.wis;
    } else {
      baseAc = 10 + modifiers.dex;
    }
  } else if (armor.includes('leather') || armor.includes('padded')) {
    baseAc = 11 + modifiers.dex;
  } else if (armor.includes('studded')) {
    baseAc = 12 + modifiers.dex;
  } else if (armor.includes('hide')) {
    baseAc = 12 + Math.min(modifiers.dex, 2);
  } else if (armor.includes('chain shirt')) {
    baseAc = 13 + Math.min(modifiers.dex, 2);
  } else if (armor.includes('scale') || armor.includes('breastplate')) {
    baseAc = 14 + Math.min(modifiers.dex, 2);
  } else if (armor.includes('half plate')) {
    baseAc = 15 + Math.min(modifiers.dex, 2);
  } else if (armor.includes('ring mail')) {
    baseAc = 14;
  } else if (armor.includes('chain mail')) {
    baseAc = 16;
  } else if (armor.includes('splint')) {
    baseAc = 17;
  } else if (armor.includes('plate')) {
    baseAc = 18;
  }

  if (state.shieldEquipped) {
    baseAc += 2;
  }

  // Saving throws
  const classSaves = (selectedClass?.saving_throws || []).map(s => s.toLowerCase());
  const savingThrows: Record<AbilityKey, { proficient: boolean; bonus: number }> = {
    str: {
      proficient: classSaves.includes('str') || classSaves.includes('strength'),
      bonus: modifiers.str + ((classSaves.includes('str') || classSaves.includes('strength')) ? proficiencyBonus : 0)
    },
    dex: {
      proficient: classSaves.includes('dex') || classSaves.includes('dexterity'),
      bonus: modifiers.dex + ((classSaves.includes('dex') || classSaves.includes('dexterity')) ? proficiencyBonus : 0)
    },
    con: {
      proficient: classSaves.includes('con') || classSaves.includes('constitution'),
      bonus: modifiers.con + ((classSaves.includes('con') || classSaves.includes('constitution')) ? proficiencyBonus : 0)
    },
    int: {
      proficient: classSaves.includes('int') || classSaves.includes('intelligence'),
      bonus: modifiers.int + ((classSaves.includes('int') || classSaves.includes('intelligence')) ? proficiencyBonus : 0)
    },
    wis: {
      proficient: classSaves.includes('wis') || classSaves.includes('wisdom'),
      bonus: modifiers.wis + ((classSaves.includes('wis') || classSaves.includes('wisdom')) ? proficiencyBonus : 0)
    },
    cha: {
      proficient: classSaves.includes('cha') || classSaves.includes('charisma'),
      bonus: modifiers.cha + ((classSaves.includes('cha') || classSaves.includes('charisma')) ? proficiencyBonus : 0)
    },
  };

  // Passive Perception
  const isPerceptionProficient = state.selectedSkills.includes('Perception');
  const passivePerception = 10 + modifiers.wis + (isPerceptionProficient ? proficiencyBonus : 0);

  // Spellcasting
  let spellcastingAbility: AbilityKey | undefined = undefined;
  const spellAbilityStr = selectedClass?.frontmatter?.spellcasting_ability;
  if (spellAbilityStr) {
    const lower = spellAbilityStr.toLowerCase();
    if (lower.includes('int')) spellcastingAbility = 'int';
    else if (lower.includes('wis')) spellcastingAbility = 'wis';
    else if (lower.includes('cha')) spellcastingAbility = 'cha';
  } else if (classTitle.includes('wizard') || classTitle.includes('artificer')) {
    spellcastingAbility = 'int';
  } else if (classTitle.includes('cleric') || classTitle.includes('druid') || classTitle.includes('ranger')) {
    spellcastingAbility = 'wis';
  } else if (classTitle.includes('bard') || classTitle.includes('paladin') || classTitle.includes('sorcerer') || classTitle.includes('warlock')) {
    spellcastingAbility = 'cha';
  }

  let spellSaveDc: number | undefined = undefined;
  let spellAttackBonus: number | undefined = undefined;
  if (spellcastingAbility) {
    spellSaveDc = 8 + proficiencyBonus + modifiers[spellcastingAbility];
    spellAttackBonus = proficiencyBonus + modifiers[spellcastingAbility];
  }

  return {
    finalAbilities,
    modifiers,
    maxHp,
    hitDie: selectedClass?.hit_die || '1d8',
    armorClass: baseAc,
    initiative: modifiers.dex,
    speed,
    proficiencyBonus,
    passivePerception,
    savingThrows,
    spellcastingAbility,
    spellSaveDc,
    spellAttackBonus,
  };
}

export function generateDefaultAttacks(
  selectedClass: ArchiveEntry | null,
  modifiers: Record<AbilityKey, number>,
  profBonus: number
): { name: string; type: 'melee' | 'ranged'; bonus: number; damageDice: string; damageType: string }[] {
  const title = (selectedClass?.title || '').toLowerCase();
  
  if (title.includes('rogue')) {
    return [
      { name: 'Rapier', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: 'piercing (finesse)' },
      { name: 'Shortbow', type: 'ranged', bonus: modifiers.dex + profBonus, damageDice: `1d6${formatModifier(modifiers.dex)}`, damageType: 'piercing (80/320 ft)' },
    ];
  }

  if (title.includes('barbarian')) {
    return [
      { name: 'Greataxe', type: 'melee', bonus: modifiers.str + profBonus, damageDice: `1d12${formatModifier(modifiers.str)}`, damageType: 'slashing (heavy)' },
      { name: 'Handaxe', type: 'melee', bonus: modifiers.str + profBonus, damageDice: `1d6${formatModifier(modifiers.str)}`, damageType: 'slashing (thrown 20/60)' },
    ];
  }

  if (title.includes('monk')) {
    return [
      { name: 'Unarmed Strike', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d4${formatModifier(modifiers.dex)}`, damageType: 'bludgeoning' },
      { name: 'Quarterstaff', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: 'bludgeoning (versatile)' },
    ];
  }

  if (title.includes('ranger')) {
    return [
      { name: 'Longbow', type: 'ranged', bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: 'piercing (150/600 ft)' },
      { name: 'Shortsword', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d6${formatModifier(modifiers.dex)}`, damageType: 'piercing (finesse)' },
    ];
  }

  if (title.includes('wizard') || title.includes('sorcerer') || title.includes('warlock')) {
    return [
      { name: 'Dagger', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d4${formatModifier(modifiers.dex)}`, damageType: 'piercing (finesse)' },
      { name: 'Quarterstaff', type: 'melee', bonus: modifiers.str + profBonus, damageDice: `1d6${formatModifier(modifiers.str)}`, damageType: 'bludgeoning' },
    ];
  }

  if (title.includes('cleric')) {
    return [
      { name: 'Mace', type: 'melee', bonus: modifiers.str + profBonus, damageDice: `1d6${formatModifier(modifiers.str)}`, damageType: 'bludgeoning' },
      { name: 'Light Crossbow', type: 'ranged', bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: 'piercing (80/320 ft)' },
    ];
  }

  // Fighter, Paladin, default martial
  return [
    { name: 'Longsword', type: 'melee', bonus: modifiers.str + profBonus, damageDice: `1d8${formatModifier(modifiers.str)}`, damageType: 'slashing (versatile 1d10)' },
    { name: 'Javelin', type: 'ranged', bonus: modifiers.str + profBonus, damageDice: `1d6${formatModifier(modifiers.str)}`, damageType: 'piercing (thrown 30/120)' },
  ];
}
