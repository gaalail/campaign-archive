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

export interface SpellSlotProgression {
  casterType: 'full' | 'half' | 'pact' | 'none';
  slots: Record<number, number>; // slot level (1-9) -> max slots
  pactSlots?: number;
  pactSlotLevel?: number;
}

const FULL_CASTER_SLOTS: Record<number, number[]> = {
  1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6:  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8:  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9:  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

export function getSpellSlotsForClass(classTitle: string, rawLevel: number): SpellSlotProgression {
  const level = Math.max(1, Math.min(20, rawLevel || 1));
  const lower = classTitle.toLowerCase();

  if (lower.includes('warlock')) {
    const pactSlots = level === 1 ? 1 : level < 11 ? 2 : level < 17 ? 3 : 4;
    const pactSlotLevel = Math.min(5, Math.ceil(level / 2));
    return {
      casterType: 'pact',
      slots: { [pactSlotLevel]: pactSlots },
      pactSlots,
      pactSlotLevel
    };
  }

  if (
    lower.includes('bard') ||
    lower.includes('cleric') ||
    lower.includes('druid') ||
    lower.includes('sorcerer') ||
    lower.includes('thanatomancer') ||
    lower.includes('wizard')
  ) {
    const arr = FULL_CASTER_SLOTS[level];
    const slots: Record<number, number> = {};
    arr.forEach((count, i) => {
      if (count > 0) slots[i + 1] = count;
    });
    return { casterType: 'full', slots };
  }

  const isArtificer = lower.includes('artificer');
  const isHalfCaster =
    isArtificer ||
    lower.includes('paladin') ||
    lower.includes('paragon') ||
    lower.includes('primal') ||
    lower.includes('ranger') ||
    lower.includes('tamer');

  if (isHalfCaster) {
    if (!isArtificer && level < 2) {
      return { casterType: 'half', slots: {} };
    }
    const effectiveLevel = Math.max(1, Math.ceil(level / 2));
    const arr = FULL_CASTER_SLOTS[effectiveLevel];
    const slots: Record<number, number> = {};
    arr.forEach((count, i) => {
      if (count > 0 && i < 5) slots[i + 1] = count;
    });
    return { casterType: 'half', slots };
  }

  return { casterType: 'none', slots: {} };
}

export function getAsiCountForLevel(classTitle: string, level: number): number {
  const lower = classTitle.toLowerCase();
  const thresholds = lower.includes('fighter')
    ? [4, 6, 8, 12, 14, 16, 19]
    : lower.includes('rogue')
    ? [4, 8, 10, 12, 16, 19]
    : [4, 8, 12, 16, 19];
  return thresholds.filter(t => level >= t).length;
}

export function getCantripDiceCount(level: number): number {
  if (level >= 17) return 4;
  if (level >= 11) return 3;
  if (level >= 5) return 2;
  return 1;
}

export interface DerivedStats {
  level: number;
  finalAbilities: AbilityScores;
  modifiers: Record<AbilityKey, number>;
  maxHp: number;
  hitDie: string;
  hitDiceTotal: string;
  armorClass: number;
  initiative: number;
  speed: string;
  proficiencyBonus: number;
  passivePerception: number;
  savingThrows: Record<AbilityKey, { proficient: boolean; bonus: number }>;
  spellcastingAbility?: AbilityKey;
  allowsSpellcastingChoice: boolean;
  spellSaveDc?: number;
  spellAttackBonus?: number;
  spellSlots: SpellSlotProgression;
  asiCount: number;
}

export function calculateDerivedStats(
  state: CharacterState,
  selectedRace: ArchiveEntry | null,
  selectedClass: ArchiveEntry | null
): DerivedStats {
  const level = Math.max(1, Math.min(20, state.level || 1));
  const finalAbilities = getFinalAbilityScores(state);
  const modifiers: Record<AbilityKey, number> = {
    str: getAbilityModifier(finalAbilities.str),
    dex: getAbilityModifier(finalAbilities.dex),
    con: getAbilityModifier(finalAbilities.con),
    int: getAbilityModifier(finalAbilities.int),
    wis: getAbilityModifier(finalAbilities.wis),
    cha: getAbilityModifier(finalAbilities.cha),
  };

  const proficiencyBonus = Math.ceil(level / 4) + 1;

  // Hit Points: 1st level max hit die + fixed average per additional level + CON*level
  const hitDieNumber = parseHitDieMax(selectedClass?.hit_die);
  const avgPerLevel = Math.floor(hitDieNumber / 2) + 1;
  const rawMaxHp =
    hitDieNumber +
    (level - 1) * avgPerLevel +
    level * modifiers.con +
    (state.hpModifierBonus || 0);
  const maxHp = Math.max(level, rawMaxHp);

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

  // Passive Perception (supports Expertise)
  const isPerceptionExpert = (state.expertSkills || []).includes('Perception');
  const isPerceptionProficient = state.selectedSkills.includes('Perception');
  const passivePerception =
    10 +
    modifiers.wis +
    (isPerceptionExpert ? proficiencyBonus * 2 : isPerceptionProficient ? proficiencyBonus : 0);

  // Spellcasting
  let spellcastingAbility: AbilityKey | undefined = undefined;
  const spellAbilityStr = String(selectedClass?.frontmatter?.spellcasting_ability || '').toLowerCase();
  const allowsSpellcastingChoice = spellAbilityStr === 'choice' || classTitle.includes('warlock') || classTitle.includes('tamer');

  if (allowsSpellcastingChoice && state.spellcastingAbilityOverride) {
    spellcastingAbility = state.spellcastingAbilityOverride;
  } else if (spellAbilityStr && spellAbilityStr !== 'choice') {
    if (spellAbilityStr.includes('int')) spellcastingAbility = 'int';
    else if (spellAbilityStr.includes('wis')) spellcastingAbility = 'wis';
    else if (spellAbilityStr.includes('cha')) spellcastingAbility = 'cha';
  } else if (classTitle.includes('wizard') || classTitle.includes('artificer') || classTitle.includes('thanatomancer')) {
    spellcastingAbility = 'int';
  } else if (classTitle.includes('cleric') || classTitle.includes('druid') || classTitle.includes('ranger') || classTitle.includes('primal')) {
    spellcastingAbility = 'wis';
  } else if (
    classTitle.includes('bard') ||
    classTitle.includes('paladin') ||
    classTitle.includes('paragon') ||
    classTitle.includes('sorcerer') ||
    classTitle.includes('warlock') ||
    classTitle.includes('tamer')
  ) {
    spellcastingAbility = 'cha';
  }

  const spellSlots = getSpellSlotsForClass(selectedClass?.title || '', level);

  let spellSaveDc: number | undefined = undefined;
  let spellAttackBonus: number | undefined = undefined;
  if (spellcastingAbility) {
    spellSaveDc = 8 + proficiencyBonus + modifiers[spellcastingAbility];
    spellAttackBonus = proficiencyBonus + modifiers[spellcastingAbility];
  }

  const hitDie = selectedClass?.hit_die || 'd8';

  return {
    level,
    finalAbilities,
    modifiers,
    maxHp,
    hitDie,
    hitDiceTotal: `${level}${hitDie}`,
    armorClass: baseAc,
    initiative: modifiers.dex,
    speed,
    proficiencyBonus,
    passivePerception,
    savingThrows,
    spellcastingAbility,
    allowsSpellcastingChoice,
    spellSaveDc,
    spellAttackBonus,
    spellSlots,
    asiCount: getAsiCountForLevel(selectedClass?.title || '', level),
  };
}

export function generateDefaultAttacks(
  selectedClass: ArchiveEntry | null,
  modifiers: Record<AbilityKey, number>,
  profBonus: number,
  level = 1,
  spellMod?: number
): { name: string; type: 'melee' | 'ranged' | 'spell'; bonus: number; damageDice: string; damageType: string }[] {
  const title = (selectedClass?.title || '').toLowerCase();
  const cDice = getCantripDiceCount(level);
  const castMod = spellMod ?? Math.max(modifiers.int, modifiers.wis, modifiers.cha);

  if (title.includes('rogue')) {
    const sneakDice = Math.ceil(level / 2);
    return [
      { name: 'Rapier', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: `piercing (+${sneakDice}d6 Sneak Attack)` },
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
    const maDie = level >= 17 ? '1d10' : level >= 11 ? '1d8' : level >= 5 ? '1d6' : '1d4';
    const atkStat = Math.max(modifiers.dex, modifiers.str);
    return [
      { name: 'Unarmed Strike', type: 'melee', bonus: atkStat + profBonus, damageDice: `${maDie}${formatModifier(atkStat)}`, damageType: 'bludgeoning (Martial Arts)' },
      { name: 'Quarterstaff', type: 'melee', bonus: atkStat + profBonus, damageDice: `1d8${formatModifier(atkStat)}`, damageType: 'bludgeoning (versatile)' },
    ];
  }

  if (title.includes('ranger')) {
    return [
      { name: 'Longbow', type: 'ranged', bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: 'piercing (150/600 ft)' },
      { name: 'Shortsword', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d6${formatModifier(modifiers.dex)}`, damageType: 'piercing (finesse)' },
    ];
  }

  if (title.includes('warlock')) {
    return [
      { name: 'Eldritch Blast', type: 'spell', bonus: castMod + profBonus, damageDice: `${cDice}d10`, damageType: 'force (120 ft)' },
      { name: 'Dagger', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d4${formatModifier(modifiers.dex)}`, damageType: 'piercing (finesse)' },
    ];
  }

  if (title.includes('thanatomancer')) {
    return [
      { name: 'Death’s Toll / Ray', type: 'spell', bonus: modifiers.int + profBonus, damageDice: `${cDice}d8`, damageType: 'necrotic (60 ft)' },
      { name: 'Sickle / Dagger', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d4${formatModifier(modifiers.dex)}`, damageType: 'slashing / finesse' },
    ];
  }

  if (title.includes('wizard') || title.includes('sorcerer')) {
    return [
      { name: 'Fire Bolt', type: 'spell', bonus: castMod + profBonus, damageDice: `${cDice}d10`, damageType: 'fire (120 ft)' },
      { name: 'Dagger', type: 'melee', bonus: modifiers.dex + profBonus, damageDice: `1d4${formatModifier(modifiers.dex)}`, damageType: 'piercing (finesse)' },
    ];
  }

  if (title.includes('artificer')) {
    return [
      { name: 'Light Crossbow', type: 'ranged', bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: 'piercing (80/320 ft)' },
      { name: 'Arcane Cantrip', type: 'spell', bonus: modifiers.int + profBonus, damageDice: `${cDice}d8`, damageType: 'force / fire' },
    ];
  }

  if (title.includes('cleric') || title.includes('druid') || title.includes('bard')) {
    const weapon = title.includes('bard')
      ? { name: 'Rapier', type: 'melee' as const, bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: 'piercing (finesse)' }
      : { name: 'Quarterstaff / Mace', type: 'melee' as const, bonus: modifiers.str + profBonus, damageDice: `1d6${formatModifier(modifiers.str)}`, damageType: 'bludgeoning' };
    return [
      weapon,
      { name: 'Spell Attack Cantrip', type: 'spell', bonus: castMod + profBonus, damageDice: `${cDice}d8`, damageType: 'radiant / thunder' },
    ];
  }

  if (title.includes('warden') || title.includes('primal') || title.includes('paragon') || title.includes('paladin')) {
    return [
      { name: 'Warhammer / Longsword', type: 'melee', bonus: modifiers.str + profBonus, damageDice: `1d8${formatModifier(modifiers.str)}`, damageType: 'bludgeoning / slashing' },
      { name: 'Javelin', type: 'ranged', bonus: modifiers.str + profBonus, damageDice: `1d6${formatModifier(modifiers.str)}`, damageType: 'piercing (thrown 30/120)' },
    ];
  }

  if (title.includes('tamer')) {
    return [
      { name: 'Light Crossbow', type: 'ranged', bonus: modifiers.dex + profBonus, damageDice: `1d8${formatModifier(modifiers.dex)}`, damageType: 'piercing (80/320 ft)' },
      { name: 'Quarterstaff', type: 'melee', bonus: modifiers.str + profBonus, damageDice: `1d6${formatModifier(modifiers.str)}`, damageType: 'bludgeoning (versatile)' },
    ];
  }

  // Fighter / default martial
  return [
    { name: 'Longsword', type: 'melee', bonus: modifiers.str + profBonus, damageDice: `1d8${formatModifier(modifiers.str)}`, damageType: 'slashing (versatile 1d10)' },
    { name: 'Javelin', type: 'ranged', bonus: modifiers.str + profBonus, damageDice: `1d6${formatModifier(modifiers.str)}`, damageType: 'piercing (thrown 30/120)' },
  ];
}
