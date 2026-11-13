import { ArchiveEntry } from '../../types/archive';

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export type AbilityMode = 'standard' | 'pointbuy' | 'custom';

export interface CustomAttack {
  id: string;
  name: string;
  type: 'melee' | 'ranged' | 'spell';
  bonus: number;
  damageDice: string;
  damageType: string;
}

export interface CharacterState {
  step: number; // 1 to 6
  name: string;
  genderOrTitle: string;
  alignment: string;
  level: number;
  raceId: string | null;
  classId: string | null;
  subclassId: string | null;
  backgroundId: string | null;
  featId: string | null;
  campaignId: string | null;
  deityId: string | null;
  
  // Ability scores
  abilityMode: AbilityMode;
  baseAbilities: AbilityScores;
  racialBonuses: {
    primary: AbilityKey;
    secondary: AbilityKey;
  };
  
  // Proficiencies
  selectedSkills: string[];
  customArmor: string;
  shieldEquipped: boolean;
  notes: string;
  customAttacks: CustomAttack[];
}

export interface SkillDefinition {
  name: string;
  ability: AbilityKey;
  description: string;
}

export const ALL_SKILLS: SkillDefinition[] = [
  { name: 'Acrobatics', ability: 'dex', description: 'Balance, tumbling, and agility' },
  { name: 'Animal Handling', ability: 'wis', description: 'Calming, intuiting, and directing beasts' },
  { name: 'Arcana', ability: 'int', description: 'Spells, magical lore, and planes of existence' },
  { name: 'Athletics', ability: 'str', description: 'Climbing, jumping, grappling, and swimming' },
  { name: 'Deception', ability: 'cha', description: 'Concealing truth, fast-talking, disguises' },
  { name: 'History', ability: 'int', description: 'Historical events, legends, wars, and kingdoms' },
  { name: 'Insight', ability: 'wis', description: 'Determining motives, sensing deception' },
  { name: 'Intimidation', ability: 'cha', description: 'Coercing, threats, and imposing presence' },
  { name: 'Investigation', ability: 'int', description: 'Searching clues, deducing secrets and locks' },
  { name: 'Medicine', ability: 'wis', description: 'Stabilizing dying allies and diagnosing illness' },
  { name: 'Nature', ability: 'int', description: 'Flora, fauna, weather, terrain, and natural lore' },
  { name: 'Perception', ability: 'wis', description: 'Spotting, hearing, and detecting hidden threats' },
  { name: 'Performance', ability: 'cha', description: 'Music, theatricals, oration, and entertainment' },
  { name: 'Persuasion', ability: 'cha', description: 'Diplomacy, honest negotiation, and cordiality' },
  { name: 'Religion', ability: 'int', description: 'Deities, sacred rites, holy symbols, and cults' },
  { name: 'Sleight of Hand', ability: 'dex', description: 'Pickpocketing, concealment, and manual agility' },
  { name: 'Stealth', ability: 'dex', description: 'Moving unseen, sneaking, and hiding' },
  { name: 'Survival', ability: 'wis', description: 'Tracking, foraging, navigation, and wild guides' },
];

export const ABILITY_LABELS: Record<AbilityKey, { name: string; abbr: string; desc: string }> = {
  str: { name: 'Strength', abbr: 'STR', desc: 'Physical power and athletic prowess' },
  dex: { name: 'Dexterity', abbr: 'DEX', desc: 'Agility, reflexes, and balance' },
  con: { name: 'Constitution', abbr: 'CON', desc: 'Endurance, stamina, and vital health' },
  int: { name: 'Intelligence', abbr: 'INT', desc: 'Mental acuity, memory, and analytical reasoning' },
  wis: { name: 'Wisdom', abbr: 'WIS', desc: 'Awareness, intuition, and spiritual attunement' },
  cha: { name: 'Charisma', abbr: 'CHA', desc: 'Force of personality, persuasion, and presence' },
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
};

export const INITIAL_CHARACTER_STATE: CharacterState = {
  step: 1,
  name: 'Valerius of the Obsidian Gate',
  genderOrTitle: 'Knight-Errant',
  alignment: 'Lawful Neutral',
  level: 1,
  raceId: null,
  classId: null,
  subclassId: null,
  backgroundId: null,
  featId: null,
  campaignId: null,
  deityId: null,
  abilityMode: 'standard',
  baseAbilities: {
    str: 15,
    dex: 13,
    con: 14,
    int: 10,
    wis: 12,
    cha: 8
  },
  racialBonuses: {
    primary: 'str',
    secondary: 'con'
  },
  selectedSkills: ['Athletics', 'Perception'],
  customArmor: 'Chain Mail',
  shieldEquipped: true,
  notes: 'Sworn oath upon the tomb of ancestors. Wandering the fog-veiled reaches of the valley.',
  customAttacks: []
};
