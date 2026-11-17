import { CharacterState, AbilityKey, AbilityScores } from './types';
import { ArchiveEntry } from '../../types/archive';
import { computeRuleAutomation, FightingStyleEffects, RuleAutomationSummary } from './rulesEngine';

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
  casterType: 'full' | 'half' | 'pact' | 'third' | 'none';
  slots: Record<number, number>; // slot level (1-9) -> max slots
  pactSlots?: number;
  pactSlotLevel?: number;
}

export function getAsiCountForLevel(classTitle: string, level: number): number {
  const lower = classTitle.toLowerCase();
  const thresholds = lower.includes('fighter')
    ? [4, 6, 8, 12, 14, 16, 19]
    : lower.includes('rogue')
    ? [4, 8, 10, 12, 16, 19]
    : [4, 8, 12, 16, 19];
  return thresholds.filter((t) => level >= t).length;
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
  hpBreakdown: string;
  hitDie: string;
  hitDiceTotal: string;
  armorClass: number;
  acBreakdown: string;
  initiative: number;
  initiativeNote?: string;
  speed: string;
  proficiencyBonus: number;
  passivePerception: number;
  savingThrows: Record<AbilityKey, { proficient: boolean; bonus: number }>;
  spellcastingAbility?: AbilityKey;
  allowsSpellcastingChoice: boolean;
  spellSaveDc?: number;
  spellAttackBonus?: number;
  spellSlots: SpellSlotProgression;
  cantripsKnown: number;
  spellsKnown: number | null;
  preparedSpellLimit: number | null;
  classOptionsKnown: number;
  classOptionsLabel: string | null;
  asiCount: number;
  rules: RuleAutomationSummary;
}

export function calculateDerivedStats(
  state: CharacterState,
  selectedRace: ArchiveEntry | null,
  selectedClass: ArchiveEntry | null,
  selectedSubclass: ArchiveEntry | null = null,
  selectedBackground: ArchiveEntry | null = null,
  selectedFeats: ArchiveEntry[] = [],
  selectedFightingStyle: ArchiveEntry | null = null,
  allSpells: ArchiveEntry[] = []
): DerivedStats {
  const level = Math.max(1, Math.min(20, state.level || 1));

  const rules = computeRuleAutomation(
    state,
    selectedRace,
    selectedClass,
    selectedSubclass,
    selectedBackground,
    selectedFeats,
    selectedFightingStyle,
    allSpells
  );

  const finalAbilities = rules.abilityBonuses.total;
  const modifiers: Record<AbilityKey, number> = {
    str: getAbilityModifier(finalAbilities.str),
    dex: getAbilityModifier(finalAbilities.dex),
    con: getAbilityModifier(finalAbilities.con),
    int: getAbilityModifier(finalAbilities.int),
    wis: getAbilityModifier(finalAbilities.wis),
    cha: getAbilityModifier(finalAbilities.cha),
  };

  const proficiencyBonus = rules.classProg.proficiencyBonus;

  // Hit Points: 1st level max hit die + fixed average per additional level + CON*level + rule bonuses (Hill Dwarf, etc.)
  const hitDieNumber = parseHitDieMax(selectedClass?.hit_die);
  const avgPerLevel = Math.floor(hitDieNumber / 2) + 1;
  const rawMaxHp =
    hitDieNumber +
    (level - 1) * avgPerLevel +
    level * modifiers.con +
    rules.hpBonusFromRules +
    (state.hpModifierBonus || 0);
  const maxHp = Math.max(level, rawMaxHp);

  const hpParts = [`${hitDieNumber}+${(level - 1) * avgPerLevel} hit die`, `${level * modifiers.con >= 0 ? '+' : ''}${level * modifiers.con} CON`];
  if (rules.hpBonusFromRules > 0) hpParts.push(`+${rules.hpBonusFromRules} ancestry`);
  if (state.hpModifierBonus) hpParts.push(`${formatModifier(state.hpModifierBonus)} misc`);

  // Armor Class Calculation
  const armor = (state.customArmor || '').toLowerCase();
  const classTitle = (selectedClass?.title || '').toLowerCase();
  const isUnarmored = armor === 'unarmored' || !armor;
  const hasHardyPhysique = selectedFeats.some((f) => f.title.toLowerCase() === 'hardy physique');
  const hasMartialArtist = selectedFeats.some((f) => f.title.toLowerCase() === 'martial artist');

  // Determine armor-adjusted DEX equivalent (supports Hardy Physique CON & Primal Mystic Bulwark WIS)
  const isLightArmor = armor.includes('leather') || armor.includes('padded') || armor.includes('studded');
  const isMediumArmor =
    armor.includes('hide') ||
    armor.includes('chain shirt') ||
    armor.includes('scale') ||
    armor.includes('breastplate') ||
    armor.includes('half plate');

  let armorStatMod = modifiers.dex;
  let armorStatLabel = 'DEX';
  if (!isUnarmored && hasHardyPhysique && modifiers.con > armorStatMod) {
    armorStatMod = modifiers.con;
    armorStatLabel = 'CON (Hardy Physique)';
  }
  if ((isLightArmor || isMediumArmor) && rules.classProg.mysticBulwark && modifiers.wis > armorStatMod) {
    armorStatMod = modifiers.wis;
    armorStatLabel = 'WIS (Mystic Bulwark)';
  }

  let baseAc = 10 + modifiers.dex;
  let acSourceLabel = `10 + DEX`;

  if (isUnarmored) {
    const candidates: { ac: number; label: string }[] = [
      { ac: 10 + modifiers.dex, label: 'Unarmored (10 + DEX)' },
    ];
    if (classTitle.includes('barbarian')) {
      candidates.push({ ac: 10 + modifiers.dex + modifiers.con, label: 'Unarmored Defense (10 + DEX + CON)' });
    }
    if (classTitle.includes('monk') && !state.shieldEquipped) {
      candidates.push({ ac: 10 + modifiers.dex + modifiers.wis, label: 'Unarmored Defense (10 + DEX + WIS)' });
    }
    if (hasMartialArtist && !state.shieldEquipped) {
      candidates.push({ ac: 10 + modifiers.str + modifiers.dex, label: 'Martial Artist (10 + STR + DEX)' });
    }
    if (rules.raceProfile.naturalArmorBase) {
      candidates.push({
        ac: rules.raceProfile.naturalArmorBase + modifiers.dex,
        label: `Natural Armor (${rules.raceProfile.naturalArmorBase} + DEX)`,
      });
    }
    const best = candidates.reduce((a, b) => (b.ac > a.ac ? b : a));
    baseAc = best.ac;
    acSourceLabel = best.label;
  } else if (armor.includes('studded')) {
    baseAc = 12 + armorStatMod;
    acSourceLabel = `Studded Leather (12 + ${armorStatLabel})`;
  } else if (armor.includes('leather') || armor.includes('padded')) {
    baseAc = 11 + armorStatMod;
    acSourceLabel = `Light Armor (11 + ${armorStatLabel})`;
  } else if (armor.includes('hide')) {
    baseAc = 12 + Math.min(armorStatMod, 2);
    acSourceLabel = `Hide (12 + max2 ${armorStatLabel})`;
  } else if (armor.includes('chain shirt')) {
    baseAc = 13 + Math.min(armorStatMod, 2);
    acSourceLabel = `Chain Shirt (13 + max2 ${armorStatLabel})`;
  } else if (armor.includes('scale') || armor.includes('breastplate')) {
    baseAc = 14 + Math.min(armorStatMod, 2);
    acSourceLabel = `${state.customArmor} (14 + max2 ${armorStatLabel})`;
  } else if (armor.includes('half plate')) {
    baseAc = 15 + Math.min(armorStatMod, 2);
    acSourceLabel = `Half Plate (15 + max2 ${armorStatLabel})`;
  } else if (armor.includes('ring mail')) {
    baseAc = 14;
    acSourceLabel = 'Ring Mail (14)';
  } else if (armor.includes('chain mail')) {
    baseAc = 16;
    acSourceLabel = 'Chain Mail (16)';
  } else if (armor.includes('splint')) {
    baseAc = 17;
    acSourceLabel = 'Splint (17)';
  } else if (armor.includes('plate')) {
    baseAc = 18;
    acSourceLabel = 'Plate (18)';
  }

  // Natural armor minimum check when worn armor would be lower (Golynn)
  if (!isUnarmored && rules.raceProfile.naturalArmorBase) {
    const nat = rules.raceProfile.naturalArmorBase + modifiers.dex;
    if (nat > baseAc) {
      baseAc = nat;
      acSourceLabel = `Natural Armor (${rules.raceProfile.naturalArmorBase} + DEX)`;
    }
  }

  if (state.shieldEquipped) {
    baseAc += 2;
    acSourceLabel += ' + Shield (+2)';
  }

  if (rules.styleEffects.acBonus > 0) {
    baseAc += rules.styleEffects.acBonus;
    acSourceLabel += ` + ${rules.styleEffects.acBonus} (${rules.styleEffects.acCondition || 'Style'})`;
  }

  // Saving throws (Class proficiencies + Magical Birthmarks +1)
  const classSaves = (selectedClass?.saving_throws || []).map((s) => s.toLowerCase());
  const makeSave = (ab: AbilityKey, fullName: string) => {
    const prof = classSaves.includes(ab) || classSaves.includes(fullName);
    return {
      proficient: prof,
      bonus: modifiers[ab] + (prof ? proficiencyBonus : 0) + rules.allSavesBonus,
    };
  };
  const savingThrows: Record<AbilityKey, { proficient: boolean; bonus: number }> = {
    str: makeSave('str', 'strength'),
    dex: makeSave('dex', 'dexterity'),
    con: makeSave('con', 'constitution'),
    int: makeSave('int', 'intelligence'),
    wis: makeSave('wis', 'wisdom'),
    cha: makeSave('cha', 'charisma'),
  };

  // Jack of All Trades bonus (Bard Lv 2+)
  const joatBonus = rules.classProg.jackOfAllTrades ? Math.floor(proficiencyBonus / 2) : 0;

  // Passive Perception (auto-granted + manual skills + Expertise + Jack of All Trades)
  const isPerceptionExpert = rules.effectiveExpertSkills.includes('Perception');
  const isPerceptionProficient = rules.effectiveSkills.includes('Perception');
  const passivePerception =
    10 +
    modifiers.wis +
    (isPerceptionExpert ? proficiencyBonus * 2 : isPerceptionProficient ? proficiencyBonus : joatBonus);

  // Initiative (DEX + Jack of All Trades if Bard Lv 2+)
  const initiative = modifiers.dex + joatBonus;
  const initiativeNote = joatBonus > 0 ? `DEX + ${joatBonus} (Jack of All Trades)` : 'Dexterity Modifier';

  // Spellcasting & Prepared Limit
  const spellcastingAbility = rules.classProg.spellcastingAbility;
  const spellSlots: SpellSlotProgression = {
    casterType: rules.classProg.casterType,
    slots: rules.classProg.spellSlots,
    pactSlots: rules.classProg.pactSlots,
    pactSlotLevel: rules.classProg.pactSlotLevel,
  };

  let spellSaveDc: number | undefined = undefined;
  let spellAttackBonus: number | undefined = undefined;
  if (spellcastingAbility) {
    spellSaveDc = 8 + proficiencyBonus + modifiers[spellcastingAbility];
    spellAttackBonus = proficiencyBonus + modifiers[spellcastingAbility];
  }

  let preparedSpellLimit: number | null = null;
  if (rules.classProg.preparedFormula && rules.classProg.hasSpellcastingAtLevel) {
    const { ability, halfLevel } = rules.classProg.preparedFormula;
    preparedSpellLimit = Math.max(
      1,
      modifiers[ability] + (halfLevel ? Math.floor(level / 2) : level)
    );
  }

  const hitDie = selectedClass?.hit_die || 'd8';

  return {
    level,
    finalAbilities,
    modifiers,
    maxHp,
    hpBreakdown: hpParts.join(' '),
    hitDie,
    hitDiceTotal: `${level}${hitDie}`,
    armorClass: baseAc,
    acBreakdown: acSourceLabel,
    initiative,
    initiativeNote,
    speed: rules.speedDisplay,
    proficiencyBonus,
    passivePerception,
    savingThrows,
    spellcastingAbility,
    allowsSpellcastingChoice: rules.classProg.allowsSpellcastingChoice,
    spellSaveDc,
    spellAttackBonus,
    spellSlots,
    cantripsKnown: rules.classProg.cantripsKnown,
    spellsKnown: rules.classProg.spellsKnown,
    preparedSpellLimit,
    classOptionsKnown: rules.classProg.classOptionsKnown + rules.extraClassOptions,
    classOptionsLabel: rules.classProg.classOptionsLabel,
    asiCount: getAsiCountForLevel(selectedClass?.title || '', level) + rules.raceProfile.grantsBonusFeat,
    rules,
  };
}

export function generateDefaultAttacks(
  selectedClass: ArchiveEntry | null,
  modifiers: Record<AbilityKey, number>,
  profBonus: number,
  level = 1,
  spellMod?: number,
  styleEffects?: FightingStyleEffects,
  martialArtist = false
): { name: string; type: 'melee' | 'ranged' | 'spell'; bonus: number; damageDice: string; damageType: string }[] {
  const title = (selectedClass?.title || '').toLowerCase();
  const cDice = getCantripDiceCount(level);
  const castMod = spellMod ?? Math.max(modifiers.int, modifiers.wis, modifiers.cha);
  const rAtkBonus = styleEffects?.rangedAttackBonus || 0;
  const mAtkBonus = styleEffects?.meleeAttackBonus || 0;
  const mDmgBonus = styleEffects?.meleeDamageBonus || 0;

  const bowStat =
    styleEffects?.useStrForBows && modifiers.str > modifiers.dex
      ? modifiers.str
      : modifiers.dex;
  const bowDmgExtra = styleEffects?.useStrForBows && modifiers.str >= modifiers.dex ? 1 : 0;

  if (title.includes('rogue')) {
    const sneakDice = Math.ceil(level / 2);
    return [
      {
        name: 'Rapier',
        type: 'melee',
        bonus: modifiers.dex + profBonus + mAtkBonus,
        damageDice: `1d8${formatModifier(modifiers.dex + mDmgBonus)}`,
        damageType: `piercing (+${sneakDice}d6 Sneak Attack)`,
      },
      {
        name: 'Shortbow',
        type: 'ranged',
        bonus: bowStat + profBonus + rAtkBonus,
        damageDice: `1d6${formatModifier(bowStat + bowDmgExtra)}`,
        damageType: 'piercing (80/320 ft)',
      },
    ];
  }

  if (title.includes('barbarian')) {
    return [
      {
        name: 'Greataxe',
        type: 'melee',
        bonus: modifiers.str + profBonus + mAtkBonus,
        damageDice: `1d12${formatModifier(modifiers.str + mDmgBonus)}`,
        damageType: 'slashing (heavy)',
      },
      {
        name: 'Handaxe',
        type: 'melee',
        bonus: modifiers.str + profBonus + mAtkBonus,
        damageDice: `1d6${formatModifier(modifiers.str + mDmgBonus)}`,
        damageType: 'slashing (thrown 20/60)',
      },
    ];
  }

  if (title.includes('monk')) {
    const maDie = level >= 17 ? '1d12' : level >= 11 ? '1d10' : level >= 5 ? '1d8' : '1d6';
    const atkStat = Math.max(modifiers.dex, modifiers.str);
    return [
      {
        name: 'Unarmed Strike',
        type: 'melee',
        bonus: atkStat + profBonus + mAtkBonus,
        damageDice: `${maDie}${formatModifier(atkStat + mDmgBonus)}`,
        damageType: 'bludgeoning (Martial Arts)',
      },
      {
        name: 'Quarterstaff',
        type: 'melee',
        bonus: atkStat + profBonus + mAtkBonus,
        damageDice: `1d8${formatModifier(atkStat + mDmgBonus)}`,
        damageType: 'bludgeoning (versatile)',
      },
    ];
  }

  if (title.includes('ranger')) {
    return [
      {
        name: 'Longbow',
        type: 'ranged',
        bonus: bowStat + profBonus + rAtkBonus,
        damageDice: `1d8${formatModifier(bowStat + bowDmgExtra)}`,
        damageType: 'piercing (150/600 ft)',
      },
      {
        name: 'Shortsword',
        type: 'melee',
        bonus: modifiers.dex + profBonus + mAtkBonus,
        damageDice: `1d6${formatModifier(modifiers.dex + mDmgBonus)}`,
        damageType: 'piercing (finesse)',
      },
    ];
  }

  if (title.includes('warlock')) {
    return [
      {
        name: 'Eldritch Blast',
        type: 'spell',
        bonus: castMod + profBonus,
        damageDice: `${cDice}d10`,
        damageType: 'force (120 ft)',
      },
      {
        name: 'Dagger',
        type: 'melee',
        bonus: modifiers.dex + profBonus + mAtkBonus,
        damageDice: `1d4${formatModifier(modifiers.dex + mDmgBonus)}`,
        damageType: 'piercing (finesse)',
      },
    ];
  }

  if (title.includes('thanatomancer')) {
    return [
      {
        name: 'Death’s Toll / Ray',
        type: 'spell',
        bonus: modifiers.int + profBonus,
        damageDice: `${cDice}d8`,
        damageType: 'necrotic (60 ft)',
      },
      {
        name: 'Sickle / Dagger',
        type: 'melee',
        bonus: modifiers.dex + profBonus + mAtkBonus,
        damageDice: `1d4${formatModifier(modifiers.dex + mDmgBonus)}`,
        damageType: 'slashing / finesse',
      },
    ];
  }

  if (title.includes('wizard') || title.includes('sorcerer')) {
    return [
      {
        name: 'Fire Bolt',
        type: 'spell',
        bonus: castMod + profBonus,
        damageDice: `${cDice}d10`,
        damageType: 'fire (120 ft)',
      },
      {
        name: 'Dagger',
        type: 'melee',
        bonus: modifiers.dex + profBonus + mAtkBonus,
        damageDice: `1d4${formatModifier(modifiers.dex + mDmgBonus)}`,
        damageType: 'piercing (finesse)',
      },
    ];
  }

  if (title.includes('artificer')) {
    return [
      {
        name: 'Light Crossbow',
        type: 'ranged',
        bonus: modifiers.dex + profBonus + rAtkBonus,
        damageDice: `1d8${formatModifier(modifiers.dex)}`,
        damageType: 'piercing (80/320 ft)',
      },
      {
        name: 'Arcane Cantrip',
        type: 'spell',
        bonus: modifiers.int + profBonus,
        damageDice: `${cDice}d8`,
        damageType: 'force / fire',
      },
    ];
  }

  if (title.includes('cleric') || title.includes('druid') || title.includes('bard')) {
    const weapon = title.includes('bard')
      ? {
          name: 'Rapier',
          type: 'melee' as const,
          bonus: modifiers.dex + profBonus + mAtkBonus,
          damageDice: `1d8${formatModifier(modifiers.dex + mDmgBonus)}`,
          damageType: 'piercing (finesse)',
        }
      : {
          name: 'Quarterstaff / Mace',
          type: 'melee' as const,
          bonus: modifiers.str + profBonus + mAtkBonus,
          damageDice: `1d6${formatModifier(modifiers.str + mDmgBonus)}`,
          damageType: 'bludgeoning',
        };
    return [
      weapon,
      {
        name: 'Spell Attack Cantrip',
        type: 'spell',
        bonus: castMod + profBonus,
        damageDice: `${cDice}d8`,
        damageType: 'radiant / thunder',
      },
    ];
  }

  if (
    title.includes('warden') ||
    title.includes('primal') ||
    title.includes('paragon') ||
    title.includes('paladin')
  ) {
    return [
      {
        name: 'Warhammer / Longsword',
        type: 'melee',
        bonus: modifiers.str + profBonus + mAtkBonus,
        damageDice: `1d8${formatModifier(modifiers.str + mDmgBonus)}`,
        damageType: 'bludgeoning / slashing',
      },
      {
        name: 'Javelin',
        type: 'ranged',
        bonus: modifiers.str + profBonus + rAtkBonus,
        damageDice: `1d6${formatModifier(modifiers.str)}`,
        damageType: 'piercing (thrown 30/120)',
      },
    ];
  }

  if (title.includes('tamer')) {
    return [
      {
        name: 'Light Crossbow',
        type: 'ranged',
        bonus: modifiers.dex + profBonus + rAtkBonus,
        damageDice: `1d8${formatModifier(modifiers.dex)}`,
        damageType: 'piercing (80/320 ft)',
      },
      {
        name: 'Quarterstaff',
        type: 'melee',
        bonus: modifiers.str + profBonus + mAtkBonus,
        damageDice: `1d6${formatModifier(modifiers.str + mDmgBonus)}`,
        damageType: 'bludgeoning (versatile)',
      },
    ];
  }

  // Brawling / Martial Artist unarmed override if selected on Fighter/default
  const unarmedDie = styleEffects?.unarmedDie || (martialArtist ? '1d4' : null);
  if (unarmedDie) {
    const stat = Math.max(modifiers.str, modifiers.dex);
    return [
      {
        name: 'Unarmed Strike',
        type: 'melee',
        bonus: stat + profBonus + mAtkBonus,
        damageDice: `${unarmedDie}${formatModifier(stat + mDmgBonus)}`,
        damageType: 'bludgeoning',
      },
      {
        name: 'Longsword',
        type: 'melee',
        bonus: modifiers.str + profBonus + mAtkBonus,
        damageDice: `1d8${formatModifier(modifiers.str + mDmgBonus)}`,
        damageType: 'slashing (versatile 1d10)',
      },
    ];
  }

  // Fighter / default martial
  return [
    {
      name: 'Longsword',
      type: 'melee',
      bonus: modifiers.str + profBonus + mAtkBonus,
      damageDice: `1d8${formatModifier(modifiers.str + mDmgBonus)}`,
      damageType: 'slashing (versatile 1d10)',
    },
    {
      name: 'Javelin',
      type: 'ranged',
      bonus: modifiers.str + profBonus + rAtkBonus,
      damageDice: `1d6${formatModifier(modifiers.str)}`,
      damageType: 'piercing (thrown 30/120)',
    },
  ];
}
