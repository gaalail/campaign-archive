import { ArchiveEntry } from '../../types/archive';
import { AbilityKey, AbilityScores, ALL_SKILLS, CharacterState } from './types';

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ALL_SKILL_NAMES = ALL_SKILLS.map((s) => s.name);

export interface SpeedProfile {
  walk: number;
  fly?: number;
  swim?: number;
  climb?: number;
  burrow?: number;
  notes?: string[];
}

export interface AsiChoiceSpec {
  id: string;
  count: number;
  amount: number;
  allowed: AbilityKey[];
  distinct: boolean;
  label: string;
}

export interface SkillChoiceSpec {
  id: string;
  count: number;
  from: string[];
  label: string;
}

export interface SubraceDefinition {
  name: string;
  summary: string;
  fixedAsi: Partial<AbilityScores>;
  asiChoice?: AsiChoiceSpec;
  fixedSkills?: string[];
  skillChoice?: SkillChoiceSpec;
  languages?: string[];
  weapons?: string[];
  tools?: string[];
  hpPerLevel?: number;
  innateSpells?: { name: string; minLevel: number; ability?: string; note?: string }[];
  grantsBonusFeat?: number;
}

export interface RaceRuleProfile {
  raceTitle: string;
  subraces: SubraceDefinition[];
  activeSubrace: SubraceDefinition | null;
  fixedAsi: Partial<AbilityScores>;
  asiChoice: AsiChoiceSpec | null;
  size: string;
  speeds: SpeedProfile;
  darkvision: number | null;
  languages: string[];
  fixedSkills: string[];
  skillChoice: SkillChoiceSpec | null;
  weapons: string[];
  tools: string[];
  hpPerLevel: number;
  naturalArmorBase: number | null;
  innateSpells: { name: string; minLevel: number; ability?: string; note?: string }[];
  grantsBonusFeat: number;
}

export interface BackgroundRuleProfile {
  title: string;
  fixedSkills: string[];
  skillChoices: SkillChoiceSpec[];
  tools: string[];
  languages: string[];
  equipment: string[];
}

export interface ClassProgressionProfile {
  proficiencyBonus: number;
  casterType: 'full' | 'half' | 'pact' | 'third' | 'none';
  hasSpellcastingAtLevel: boolean;
  spellSlots: Record<number, number>;
  pactSlots?: number;
  pactSlotLevel?: number;
  cantripsKnown: number;
  spellsKnown: number | null;
  preparedFormula: { ability: AbilityKey; halfLevel: boolean } | null;
  spellcastingAbility: AbilityKey | undefined;
  allowsSpellcastingChoice: boolean;
  classOptionsKnown: number;
  classOptionsLabel: string | null;
  fightingStyleLevel: number | null;
  grantsFightingStyle: boolean;
  expertiseSlots: number;
  jackOfAllTrades: boolean;
  mysticBulwark: boolean;
  unarmoredMovement: number;
  martialArtsDie: string | null;
  sneakAttack: string | null;
  resources: { label: string; value: string }[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoice: SkillChoiceSpec;
  subclassBonusSpells: { name: string; entry?: ArchiveEntry; unlockLevel: number }[];
}

export interface FeatRuleMetadata {
  fixedAsi?: Partial<AbilityScores>;
  asiChoice?: Omit<AsiChoiceSpec, 'id'>;
  fixedSkills?: string[];
  expertiseIfProficient?: boolean;
  flySpeed?: number;
  overrideFlySpeed?: number;
  swimSpeed?: number;
  hardyPhysique?: boolean;
  martialArtist?: boolean;
  allSavesBonus?: number;
  grantsFightingStyle?: boolean;
  extraClassOptions?: number;
  grantsWeaponProficiency?: string;
  innateSpells?: string[];
  notes?: string[];
}

export interface FightingStyleEffects {
  acBonus: number;
  acCondition?: string;
  walkSpeedBonus: number;
  swimMatchesWalk: boolean;
  climbMatchesWalk: boolean;
  rangedAttackBonus: number;
  meleeAttackBonus: number;
  meleeDamageBonus: number;
  unarmedDie?: string;
  useStrForBows?: boolean;
  extraClassOptions?: number;
  blindsightRange?: number;
  notes: string[];
}

// ---------- Markdown Utilities ----------

function cleanMarkdown(text: string): string {
  return text
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, ' ')
    .trim();
}

function parseAbilityName(token: string): AbilityKey | null {
  const t = token.trim().toLowerCase();
  if (t.startsWith('str')) return 'str';
  if (t.startsWith('dex')) return 'dex';
  if (t.startsWith('con')) return 'con';
  if (t.startsWith('int')) return 'int';
  if (t.startsWith('wis')) return 'wis';
  if (t.startsWith('cha')) return 'cha';
  return null;
}

function matchSkillNames(text: string): string[] {
  const lower = text.toLowerCase();
  return ALL_SKILL_NAMES.filter((skill) => {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
  });
}

function splitMarkdownTableRow(rowStr: string): string[] {
  const trimmed = rowStr.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells: string[] = [];
  let current = '';
  let linkDepth = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    const next = trimmed[i + 1];
    if (ch === '[' && next === '[') {
      linkDepth++;
      current += '[[';
      i++;
      continue;
    }
    if (ch === ']' && next === ']' && linkDepth > 0) {
      linkDepth--;
      current += ']]';
      i++;
      continue;
    }
    if (ch === '\\' && next === '|') {
      current += '|';
      i++;
      continue;
    }
    if (ch === '|' && linkDepth === 0) {
      cells.push(cleanMarkdown(current));
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(cleanMarkdown(current));
  return cells;
}

function parseMarkdownTables(body: string): { headers: string[]; rows: string[][] }[] {
  const lines = body.split('\n');
  const tables: { headers: string[]; rows: string[][] }[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const next = i + 1 < lines.length ? lines[i + 1].trim() : '';

    if (line.startsWith('|') && next.startsWith('|') && /[-:]{2,}/.test(next)) {
      const headers = splitMarkdownTableRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitMarkdownTableRow(lines[i].trim()));
        i++;
      }
      tables.push({ headers, rows });
      continue;
    }
    i++;
  }

  return tables;
}

function parseCellInt(val?: string): number {
  if (!val) return 0;
  const trimmed = val.trim();
  if (!trimmed || trimmed === '-' || trimmed === '—' || trimmed === '─' || trimmed === '–') return 0;
  const m = trimmed.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

// ---------- Race Curated & Parsed Profiles (All 24 Archive Races) ----------

export function getRaceRuleProfile(
  raceEntry: ArchiveEntry | null,
  selectedSubrace: string | null,
  level: number
): RaceRuleProfile {
  const title = raceEntry?.title || '';
  const body = raceEntry?.body || '';
  const lower = title.toLowerCase();

  let subraces: SubraceDefinition[] = [];
  let fixedAsi: Partial<AbilityScores> = {};
  let asiChoice: AsiChoiceSpec | null = null;
  let size = raceEntry?.size || 'Medium';
  let speeds: SpeedProfile = { walk: 30 };
  let darkvision: number | null = /darkvision/i.test(body) ? 60 : null;
  const fmLanguages = raceEntry?.frontmatter?.languages;
  let languages: string[] = Array.isArray(fmLanguages) ? fmLanguages.map(String) : ['Common'];
  let fixedSkills: string[] = [];
  let skillChoice: SkillChoiceSpec | null = null;
  let weapons: string[] = [];
  let tools: string[] = [];
  let hpPerLevel = 0;
  let naturalArmorBase: number | null = null;
  let innateSpells: { name: string; minLevel: number; ability?: string; note?: string }[] = [];
  let grantsBonusFeat = 0;

  if (lower === 'aengel') {
    fixedAsi = { str: 1, con: 1, cha: 1 };
    speeds = { walk: 30, fly: 30 };
    languages = ['Common', 'Celestial', '+1 Choice'];
  } else if (lower === 'cnidaran') {
    fixedAsi = { con: 1 };
    speeds = { walk: 30, swim: 30 };
    languages = ['Common', '+1 Choice'];
    subraces = [
      {
        name: 'Nematocyst',
        summary: '+1 DEX, +1 CON · 1d4 finesse natural weapon + poison resistance & paralyzing neurotoxin',
        fixedAsi: { dex: 1, con: 1 },
      },
      {
        name: 'Shimmerskin',
        summary: '+2 CHA · Advantage on Charisma checks 1/rest & Hypnotic Phosphorescence spells',
        fixedAsi: { cha: 2 },
        innateSpells: [
          { name: 'Minor Illusion', minLevel: 1, ability: 'CHA' },
          { name: 'Charm Person', minLevel: 3, ability: 'CHA' },
          { name: 'Suggestion', minLevel: 5, ability: 'CHA' },
        ],
      },
    ];
  } else if (lower === 'cyclopian') {
    fixedAsi = { int: 2 };
    asiChoice = {
      id: 'race_cyclopian',
      count: 1,
      amount: 1,
      allowed: ['dex', 'wis'],
      distinct: true,
      label: 'Cyclopian +1 (DEX or WIS)',
    };
    speeds = { walk: 30, climb: 20 };
    languages = ['Common', 'Undercommon', '+1 Choice'];
    skillChoice = {
      id: 'race_cyclopian_skills',
      count: 2,
      from: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Perception', 'Religion', 'Stealth'],
      label: 'Knowledge Seeker (choose 2)',
    };
  } else if (lower === 'dragonborn') {
    fixedAsi = { str: 2, cha: 1 };
    speeds = { walk: 30 };
    darkvision = null;
    languages = ['Common', 'Draconic'];
  } else if (lower === 'dwarf') {
    fixedAsi = { con: 2 };
    speeds = { walk: 25 };
    languages = ['Common', 'Dwarvish'];
    weapons = ['Battleaxe', 'Handaxe', 'Light Hammer', 'Warhammer'];
    tools = ["Artisan's Tools (Smith's / Brewer's / Mason's)"];
    subraces = [
      {
        name: 'Hill Dwarf',
        summary: '+1 WIS · Dwarven Toughness (+1 Max HP per level)',
        fixedAsi: { wis: 1 },
        hpPerLevel: 1,
      },
    ];
  } else if (lower === 'elf') {
    fixedAsi = { dex: 2 };
    speeds = { walk: 30 };
    languages = ['Common', 'Elvish'];
    fixedSkills = ['Perception'];
    subraces = [
      {
        name: 'High Elf',
        summary: '+1 INT · Longsword, Shortsword, Shortbow, Longbow & 1 Wizard Cantrip',
        fixedAsi: { int: 1 },
        weapons: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow'],
        languages: ['+1 Extra Language'],
        innateSpells: [{ name: '1 Wizard Cantrip (High Elf)', minLevel: 1, ability: 'INT' }],
      },
    ];
  } else if (lower === 'gnome') {
    fixedAsi = { int: 2 };
    size = 'Small';
    speeds = { walk: 25 };
    languages = ['Common', 'Gnomish'];
    subraces = [
      {
        name: 'Rock Gnome',
        summary: "+1 CON · Tinker's Tools & Artificer's Lore",
        fixedAsi: { con: 1 },
        tools: ["Tinker's Tools"],
      },
    ];
  } else if (lower === 'gobboc') {
    fixedAsi = { dex: 2 };
    asiChoice = {
      id: 'race_gobboc',
      count: 1,
      amount: 1,
      allowed: ['cha', 'wis'],
      distinct: true,
      label: 'Gobboc +1 (CHA or WIS)',
    };
    size = 'Small';
    speeds = { walk: 25 };
    darkvision = null;
    languages = ['Common', '+1 Choice'];
    innateSpells = [{ name: 'Polymorph (Chicken Form, 1/long rest)', minLevel: 1, ability: 'CHA' }];
  } else if (lower === 'golynn') {
    fixedAsi = { con: 2, str: 1 };
    speeds = { walk: 30, burrow: 15 };
    darkvision = null;
    languages = ['Common', 'Terran'];
    naturalArmorBase = 13;
  } else if (lower === 'half-elf') {
    fixedAsi = { cha: 2 };
    asiChoice = {
      id: 'race_half_elf',
      count: 2,
      amount: 1,
      allowed: ['str', 'dex', 'con', 'int', 'wis'],
      distinct: true,
      label: 'Half-Elf +1 to two other scores',
    };
    speeds = { walk: 30 };
    languages = ['Common', 'Elvish', '+1 Choice'];
    skillChoice = {
      id: 'race_half_elf_skills',
      count: 2,
      from: ALL_SKILL_NAMES,
      label: 'Skill Versatility (choose 2)',
    };
  } else if (lower === 'half-orc') {
    fixedAsi = { str: 2, con: 1 };
    speeds = { walk: 30 };
    languages = ['Common', 'Orc'];
    fixedSkills = ['Intimidation'];
  } else if (lower === 'halfling') {
    fixedAsi = { dex: 2 };
    size = 'Small';
    speeds = { walk: 25 };
    darkvision = null;
    languages = ['Common', 'Halfling'];
    subraces = [
      {
        name: 'Lightfoot Halfling',
        summary: '+1 CHA · Naturally Stealthy behind larger creatures',
        fixedAsi: { cha: 1 },
      },
    ];
  } else if (lower === 'human') {
    speeds = { walk: 30 };
    darkvision = null;
    languages = ['Common', '+1 Choice'];
    subraces = [
      {
        name: 'Standard Human',
        summary: '+1 to all six ability scores (STR, DEX, CON, INT, WIS, CHA)',
        fixedAsi: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
      },
      {
        name: 'Variant Human',
        summary: '+1 to two different scores · +1 Skill Proficiency · +1 Bonus Feat',
        fixedAsi: {},
        asiChoice: {
          id: 'race_human_variant',
          count: 2,
          amount: 1,
          allowed: ABILITY_KEYS,
          distinct: true,
          label: 'Variant Human +1 to two scores',
        },
        skillChoice: {
          id: 'race_human_variant_skill',
          count: 1,
          from: ALL_SKILL_NAMES,
          label: 'Variant Human Skill (choose 1)',
        },
        grantsBonusFeat: 1,
      },
    ];
  } else if (lower === 'light-touched') {
    fixedAsi = { cha: 2 };
    speeds = { walk: 30 };
    darkvision = null;
    languages = ['Common', '+1 Choice'];
    innateSpells = [
      { name: 'Dancing Lights', minLevel: 1, ability: 'CHA' },
      { name: 'Light', minLevel: 1, ability: 'CHA' },
      { name: 'Daylight (1/day)', minLevel: 5, ability: 'CHA' },
    ];
    subraces = [
      {
        name: 'Goldenborn',
        summary: '+1 CON · Wrath of the Light (+1d4 to +1d10 radiant melee damage)',
        fixedAsi: { con: 1 },
      },
      {
        name: 'Iridescent Ones',
        summary: '+1 any · Artisan Tool proficiency & Insight or Persuasion',
        fixedAsi: {},
        asiChoice: {
          id: 'race_iridescent',
          count: 1,
          amount: 1,
          allowed: ABILITY_KEYS,
          distinct: true,
          label: 'Iridescent +1 to one score',
        },
        skillChoice: {
          id: 'race_iridescent_skill',
          count: 1,
          from: ['Insight', 'Persuasion'],
          label: 'Social Beings (Insight or Persuasion)',
        },
        tools: ["Artisan's Tool (Choice)"],
      },
      {
        name: 'Silver Born',
        summary: '+1 INT or WIS · Radiant Magic (+1 DC on radiant spells)',
        fixedAsi: {},
        asiChoice: {
          id: 'race_silverborn',
          count: 1,
          amount: 1,
          allowed: ['wis', 'int'],
          distinct: true,
          label: 'Silver Born +1 (WIS or INT)',
        },
      },
    ];
  } else if (lower === 'lotol') {
    fixedAsi = { wis: 2, con: 1 };
    speeds = { walk: 30, notes: ['Adaptive Polymorphism (swim 30 ft. or climb 30 ft. option)'] };
    languages = ['Common', 'Aquan'];
  } else if (lower === 'mycelian') {
    fixedAsi = { con: 2 };
    asiChoice = {
      id: 'race_mycelian',
      count: 1,
      amount: 1,
      allowed: ['str', 'dex', 'int', 'wis', 'cha'],
      distinct: true,
      label: 'Mycelian +1 to one other score',
    };
    size = 'Medium / Small';
    speeds = { walk: 30, notes: ['25 ft. if Small host'] };
    languages = ['Common', '+1 Host Language'];
    skillChoice = {
      id: 'race_mycelian_skills',
      count: 2,
      from: ALL_SKILL_NAMES,
      label: 'Muscle Memory (up to 2 skills/tools)',
    };
  } else if (lower === 'ombrask') {
    fixedAsi = { dex: 2 };
    asiChoice = {
      id: 'race_ombrask',
      count: 1,
      amount: 1,
      allowed: ['str', 'con', 'int', 'wis', 'cha'],
      distinct: true,
      label: 'Ombrask +1 to one other score',
    };
    size = 'Medium / Small';
    speeds = { walk: 30 };
    languages = ['Common (written)', 'Undercommon (written)'];
    fixedSkills = ['Stealth'];
    innateSpells = [{ name: 'Invisibility (1/long rest)', minLevel: 5, ability: 'CON' }];
  } else if (lower === 'oozekin') {
    fixedAsi = { con: 2, str: 1 };
    size = 'Medium / Small';
    speeds = { walk: 30, notes: ['Cube 20 ft. / Puddle climb 20 ft.'] };
    languages = ['Common', 'Primordial (Aquan)'];
    innateSpells = [{ name: 'Acid Splash', minLevel: 1, ability: 'CON' }];
  } else if (lower === 'opteran') {
    fixedAsi = { cha: 2 };
    asiChoice = {
      id: 'race_opteran',
      count: 1,
      amount: 1,
      allowed: ['str', 'dex', 'con', 'int', 'wis'],
      distinct: true,
      label: 'Opteran +1 to one other score',
    };
    size = level >= 5 ? 'Medium (Adult)' : 'Small (Larval)';
    speeds = level >= 5 ? { walk: 30, fly: 20, notes: ['Fly 20 ft. (no medium/heavy armor)'] } : { walk: 25 };
    darkvision = null;
    languages = ['Common', 'Sylvan'];
  } else if (lower === 'peri') {
    fixedAsi = { cha: 2 };
    speeds = { walk: 30 };
    languages = ['Common', 'Elvish', 'Sylvan'];
    fixedSkills = ['Insight', 'Perception'];
    tools = ["Teamaker's Tools", "1 Artisan's Tool"];
    subraces = [
      {
        name: 'Curiosity Peri',
        summary: '+1 INT · Eidetic recall & Comprehend Languages (1/short rest)',
        fixedAsi: { int: 1 },
        innateSpells: [{ name: 'Comprehend Languages (1/short rest)', minLevel: 1 }],
      },
      {
        name: 'Love Peri',
        summary: '+1 WIS · Performance proficiency & Charm Person (1/short rest)',
        fixedAsi: { wis: 1 },
        fixedSkills: ['Performance'],
        innateSpells: [{ name: 'Charm Person (1/short rest)', minLevel: 1, ability: 'CHA' }],
      },
      {
        name: 'Valor Peri',
        summary: '+1 STR · Proficiency with Greataxe, Greatsword, Longbow & Maul',
        fixedAsi: { str: 1 },
        weapons: ['Greataxe', 'Greatsword', 'Longbow', 'Maul'],
      },
    ];
  } else if (lower === 'rakin') {
    fixedAsi = { dex: 2 };
    size = 'Small';
    speeds = { walk: 30, climb: 30 };
    languages = ['Common', '+1 Choice'];
    subraces = [
      {
        name: 'Urkin (Raccoon-Kin)',
        summary: 'Sleight of Hand or Stealth proficiency · Thieves’ Cant · Nimble Dodge',
        fixedAsi: {},
        skillChoice: {
          id: 'race_urkin_skill',
          count: 1,
          from: ['Sleight of Hand', 'Stealth'],
          label: 'Urkin Skill (Sleight of Hand or Stealth)',
        },
        languages: ["Thieves' Cant"],
      },
      {
        name: 'Posskin (Possum-Kin)',
        summary: 'Poison resistance & Play Dead reaction',
        fixedAsi: {},
      },
      {
        name: 'Tanukin (Tanuki-Kin)',
        summary: 'Deception or Persuasion proficiency · Minor Illusion, Disguise Self (Lv3), Alter Self (Lv5)',
        fixedAsi: {},
        skillChoice: {
          id: 'race_tanukin_skill',
          count: 1,
          from: ['Deception', 'Persuasion'],
          label: 'Tanukin Skill (Deception or Persuasion)',
        },
        innateSpells: [
          { name: 'Minor Illusion', minLevel: 1, ability: 'CHA/WIS' },
          { name: 'Disguise Self', minLevel: 3, ability: 'CHA/WIS' },
          { name: 'Alter Self', minLevel: 5, ability: 'CHA/WIS' },
        ],
      },
    ];
  } else if (lower === 'redeemed fiend') {
    fixedAsi = { wis: 2 };
    speeds = { walk: 30 };
    skillChoice = {
      id: 'race_redeemed_fiend_skills',
      count: 2,
      from: ALL_SKILL_NAMES,
      label: "Fiend's Lifestyle (choose 2 skills)",
    };
    subraces = [
      {
        name: 'Redeemed Succubus/Incubus',
        summary: '+1 CHA · Invigorating Kiss & Shapechanger · Common + Abyssal/Infernal',
        fixedAsi: { cha: 1 },
        languages: ['Common', 'Abyssal or Infernal'],
      },
      {
        name: 'Redeemed Chain Devil',
        summary: "+1 STR or CON · Devil's Chains (1d8 reach/finesse) & Devil's Sight",
        fixedAsi: {},
        asiChoice: {
          id: 'race_chain_devil',
          count: 1,
          amount: 1,
          allowed: ['str', 'con'],
          distinct: true,
          label: 'Chain Devil +1 (STR or CON)',
        },
        languages: ['Common', 'Infernal'],
      },
    ];
  } else if (lower === 'stranger') {
    fixedAsi = { wis: 2 };
    asiChoice = {
      id: 'race_stranger',
      count: 3,
      amount: 1,
      allowed: ABILITY_KEYS,
      distinct: true,
      label: 'Stranger +1 to three different scores',
    };
    speeds = { walk: 30 };
    languages = ['Common', 'Abyssal', 'Infernal', '+1 Choice'];
  } else if (lower === 'tiefling') {
    fixedAsi = { int: 1, cha: 2 };
    speeds = { walk: 30 };
    languages = ['Common', 'Infernal'];
    innateSpells = [
      { name: 'Thaumaturgy', minLevel: 1, ability: 'CHA' },
      { name: 'Hellish Rebuke (2nd-lvl, 1/long rest)', minLevel: 3, ability: 'CHA' },
      { name: 'Darkness (1/long rest)', minLevel: 5, ability: 'CHA' },
    ];
  } else if (raceEntry) {
    // Fallback generic markdown parser for future homebrew races added to the archive
    const asiMatch = body.match(/\*\*Ability [Ss]core [Ii]ncrease:?\*\*\s*([^\n]+)/i);
    if (asiMatch) {
      const asiText = asiMatch[1];
      const shortMatches = [...asiText.matchAll(/\+(\d+)\s*(STR|DEX|CON|INT|WIS|CHA)/gi)];
      shortMatches.forEach((m) => {
        const key = parseAbilityName(m[2]);
        if (key) fixedAsi[key] = (fixedAsi[key] || 0) + parseInt(m[1], 10);
      });
    }
    if (raceEntry.speed) {
      const walkM = raceEntry.speed.match(/(\d+)\s*(?:ft|feet)/i);
      if (walkM) speeds.walk = parseInt(walkM[1], 10);
    }
  }

  // Merge active subrace if race defines subraces
  const activeSubrace =
    subraces.length > 0
      ? subraces.find((s) => s.name.toLowerCase() === (selectedSubrace || '').toLowerCase()) || subraces[0]
      : null;

  if (activeSubrace) {
    Object.entries(activeSubrace.fixedAsi).forEach(([k, val]) => {
      const ab = k as AbilityKey;
      fixedAsi[ab] = (fixedAsi[ab] || 0) + (val || 0);
    });
    if (activeSubrace.asiChoice) asiChoice = activeSubrace.asiChoice;
    if (activeSubrace.fixedSkills) fixedSkills = [...new Set([...fixedSkills, ...activeSubrace.fixedSkills])];
    if (activeSubrace.skillChoice && !skillChoice) skillChoice = activeSubrace.skillChoice;
    if (activeSubrace.languages) languages = [...new Set([...languages, ...activeSubrace.languages])];
    if (activeSubrace.weapons) weapons = [...new Set([...weapons, ...activeSubrace.weapons])];
    if (activeSubrace.tools) tools = [...new Set([...tools, ...activeSubrace.tools])];
    if (activeSubrace.hpPerLevel) hpPerLevel += activeSubrace.hpPerLevel;
    if (activeSubrace.innateSpells) innateSpells = [...innateSpells, ...activeSubrace.innateSpells];
    if (activeSubrace.grantsBonusFeat) grantsBonusFeat += activeSubrace.grantsBonusFeat;
  }

  return {
    raceTitle: title,
    subraces,
    activeSubrace,
    fixedAsi,
    asiChoice,
    size,
    speeds,
    darkvision,
    languages,
    fixedSkills,
    skillChoice,
    weapons,
    tools,
    hpPerLevel,
    naturalArmorBase,
    innateSpells,
    grantsBonusFeat,
  };
}

// ---------- Background Parser & Choice Definitions (All 21 Archive Backgrounds) ----------

const BACKGROUND_SKILL_CHOICES_BY_TITLE: Record<string, SkillChoiceSpec[]> = {
  'blessed child': [
    {
      id: 'bg_blessed_child',
      count: 2,
      from: ALL_SKILL_NAMES,
      label: 'Blessed Child: Choose 2 skills (Religion recommended)',
    },
  ],
  commoner: [
    {
      id: 'bg_commoner',
      count: 2,
      from: ['Animal Handling', 'Medicine', 'Nature', 'Survival'],
      label: 'Commoner: Choose 2 from Animal Handling, Medicine, Nature, Survival',
    },
  ],
  gravekeeper: [
    {
      id: 'bg_gravekeeper',
      count: 2,
      from: ['Medicine', 'Perception', 'Religion'],
      label: 'Gravekeeper: Choose 2 from Medicine, Perception, Religion',
    },
  ],
  martyr: [
    {
      id: 'bg_martyr_1',
      count: 1,
      from: ['Arcana', 'History', 'Religion'],
      label: 'Martyr Lore: Choose 1 (Arcana, History, or Religion)',
    },
    {
      id: 'bg_martyr_2',
      count: 1,
      from: ['Athletics', 'Persuasion', 'Insight'],
      label: 'Martyr Resolve: Choose 1 (Athletics, Persuasion, or Insight)',
    },
  ],
  penitent: [
    {
      id: 'bg_penitent',
      count: 1,
      from: ALL_SKILL_NAMES,
      label: 'Penitent: Choose 1 skill related to your past life',
    },
  ],
};

function extractMarkdownField(body: string, labelPattern: RegExp): string | null {
  const lines = body.split('\n');
  for (const line of lines) {
    const cleaned = line.replace(/\*\*/g, '').replace(/^\s*[-*•]\s*/, '').trim();
    const match = cleaned.match(labelPattern);
    if (match && match[1]) {
      return cleanMarkdown(match[1]);
    }
  }
  return null;
}

function splitEquipmentItems(rawEq: string): string[] {
  // Split nicely by comma while respecting parenthetical lists (such as tarot cards, ...)
  const items: string[] = [];
  let buf = '';
  let depth = 0;
  for (let i = 0; i < rawEq.length; i++) {
    const ch = rawEq[i];
    if (ch === '(') depth++;
    else if (ch === ')' && depth > 0) depth--;

    if (ch === ',' && depth === 0) {
      const part = buf.replace(/^(?:and\s+)/i, '').trim();
      if (part) items.push(part);
      buf = '';
    } else {
      buf += ch;
    }
  }
  const tail = buf.replace(/^(?:and\s+)/i, '').trim();
  if (tail) items.push(tail);
  return items.map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/\.$/, ''));
}

export function getBackgroundRuleProfile(bgEntry: ArchiveEntry | null): BackgroundRuleProfile | null {
  if (!bgEntry) return null;
  const title = bgEntry.title;
  const body = bgEntry.body || '';
  const lower = title.toLowerCase();

  const skillChoices = BACKGROUND_SKILL_CHOICES_BY_TITLE[lower] || [];
  let fixedSkills: string[] = [];

  if (skillChoices.length === 0) {
    const rawSkills = extractMarkdownField(body, /^Skill [Pp]roficiencies:\s*(.+)$/);
    if (rawSkills) {
      fixedSkills = matchSkillNames(rawSkills);
    }
  }

  const rawTools = extractMarkdownField(body, /^Tool [Pp]roficiencies:\s*(.+)$/);
  const tools = rawTools ? rawTools.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const rawLangs = extractMarkdownField(body, /^Languages?:\s*(.+)$/);
  const languages = rawLangs ? rawLangs.split(',').map((l) => l.trim()).filter(Boolean) : [];

  const rawEquip = extractMarkdownField(body, /^Equipment:\s*(.+)$/);
  const equipment = rawEquip ? splitEquipmentItems(rawEquip) : [];

  return {
    title,
    fixedSkills,
    skillChoices,
    tools,
    languages,
    equipment,
  };
}

// ---------- Class & Subclass Progression Parser (All 18 Classes + 1/3 Casters + Domain/Oath Spells) ----------

function resolveSpellByName(name: string, allSpells: ArchiveEntry[] = []): ArchiveEntry | undefined {
  const cleaned = cleanMarkdown(name)
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+ll\b/gi, '')
    .trim()
    .toLowerCase();
  if (!cleaned || allSpells.length === 0) return undefined;
  const slug = cleaned.replace(/[\/\s]+/g, '-');
  return (
    allSpells.find((sp) => sp.title.toLowerCase() === cleaned) ||
    allSpells.find((sp) => (sp.aliases || []).some((a) => String(a).toLowerCase() === cleaned)) ||
    allSpells.find((sp) => sp.id.toLowerCase().endsWith(`/${slug}`)) ||
    allSpells.find((sp) => sp.id.toLowerCase().endsWith(`/${cleaned.replace(/\s+/g, '-')}`)) ||
    allSpells.find((sp) => sp.id.toLowerCase().endsWith(`/${cleaned}`))
  );
}

export function parseSubclassBonusSpells(
  subclassEntry: ArchiveEntry | null,
  level: number,
  allSpells: ArchiveEntry[] = [],
  highestSlotLevel: number = 0
): { name: string; entry?: ArchiveEntry; unlockLevel: number }[] {
  if (!subclassEntry) return [];
  const tables = parseMarkdownTables(subclassEntry.body || '');
  const results: { name: string; entry?: ArchiveEntry; unlockLevel: number }[] = [];

  for (const tbl of tables) {
    const h0 = (tbl.headers[0] || '').toLowerCase();
    const h1 = (tbl.headers[1] || '').toLowerCase();
    if (!h1.includes('spell')) continue;

    // Style A: "Cleric level", "Paladin level", "Druid Level", "Ranger level" -> row 1st..20th
    // Style B: "Spell level" (Warlock Patrons / some spell tables) -> row 1st..5th spell level (unlocks at char level 2*s - 1, or for Warlock Lv2 for 1st)
    const isSpellLevelCol = h0.includes('spell level');

    for (const row of tbl.rows) {
      const lvlNum = parseCellInt(row[0]);
      if (!lvlNum) continue;

      const unlocked = isSpellLevelCol
        ? Math.max(highestSlotLevel, Math.ceil(level / 2)) >= lvlNum && highestSlotLevel >= lvlNum
        : level >= lvlNum;

      if (!unlocked) continue;

      const spellListStr = row[1] || '';
      const names = spellListStr
        .split(',')
        .map((s) => cleanMarkdown(s).replace(/\s*\(ll\)/gi, '').replace(/\s+ll\b/gi, '').trim())
        .filter(Boolean);

      for (const spName of names) {
        if (/choose|option|none|your genie spell/i.test(spName)) continue;
        const entry = resolveSpellByName(spName, allSpells);
        if (!results.some((r) => r.name.toLowerCase() === (entry?.title || spName).toLowerCase())) {
          results.push({
            name: entry?.title || spName,
            entry,
            unlockLevel: isSpellLevelCol ? lvlNum * 2 - 1 : lvlNum,
          });
        }
      }
    }
  }

  return results;
}

export function parseClassSkillPool(classEntry: ArchiveEntry | null): SkillChoiceSpec {
  if (!classEntry) {
    return { id: 'class_skills', count: 2, from: ALL_SKILL_NAMES, label: 'Choose 2 Class Skills' };
  }
  const body = classEntry.body || '';
  const line = body.match(/\*\*Skills?:\*\*\s*([^\n]+)/i)?.[1] || body.match(/Skills?:\s*([^\n]+)/i)?.[1] || '';
  const cleaned = cleanMarkdown(line);

  let count = 2;
  if (/choose (?:any )?(four|4)/i.test(cleaned)) count = 4;
  else if (/choose (?:any )?(three|3)/i.test(cleaned)) count = 3;
  else if (/choose (?:any )?(one|1)/i.test(cleaned)) count = 1;

  const isAny = /choose any/i.test(cleaned);
  const matched = isAny ? ALL_SKILL_NAMES : matchSkillNames(cleaned);
  const from = matched.length > 0 ? matched : ALL_SKILL_NAMES;

  return {
    id: 'class_skills',
    count,
    from,
    label: `${classEntry.title} Skills (Choose ${count}${isAny ? ' of any' : ''})`,
  };
}

export function parseClassProficiencies(classEntry: ArchiveEntry | null): {
  armor: string[];
  weapons: string[];
  tools: string[];
} {
  if (!classEntry) return { armor: [], weapons: [], tools: [] };
  const body = classEntry.body || '';

  const armLine = extractMarkdownField(body, /^Armor:\s*(.+)$/);
  const wpnLine = extractMarkdownField(body, /^Weapons:\s*(.+)$/);
  const toolLine = extractMarkdownField(body, /^Tools:\s*(.+)$/);
  const combinedLine = extractMarkdownField(body, /^Armor, weapons, and tools:\s*(.+)$/);

  const armor: string[] = [];
  const weapons: string[] = [];
  const tools: string[] = [];

  if (armLine && armLine.toLowerCase() !== 'none') {
    armor.push(...armLine.split(',').map((s) => s.trim()).filter(Boolean));
  }
  if (wpnLine && wpnLine.toLowerCase() !== 'none') {
    weapons.push(...wpnLine.split(',').map((s) => s.trim()).filter(Boolean));
  }
  if (toolLine && toolLine.toLowerCase() !== 'none') {
    tools.push(...toolLine.split(',').map((s) => s.trim()).filter(Boolean));
  }

  if (combinedLine && armor.length === 0 && weapons.length === 0) {
    const normalizedCombined = combinedLine.replace(/Crossbows,\s*light/gi, 'Light crossbows');
    const parts = normalizedCombined.split(',').map((s) => s.trim()).filter(Boolean);
    parts.forEach((p) => {
      const pl = p.toLowerCase();
      if (pl.includes('armor') || pl.includes('shield')) armor.push(p);
      else if (pl.includes('tool') || pl.includes('kit') || pl.includes('instrument')) tools.push(p);
      else weapons.push(p);
    });
  }

  return { armor, weapons, tools };
}

export function parseClassAndSubclassProgression(
  classEntry: ArchiveEntry | null,
  subclassEntry: ArchiveEntry | null,
  level: number,
  abilityOverride: AbilityKey | null,
  allSpells: ArchiveEntry[] = []
): ClassProgressionProfile {
  const lvl = Math.max(1, Math.min(20, level || 1));
  const title = classEntry?.title || '';
  const lower = title.toLowerCase();
  const pb = Math.ceil(lvl / 4) + 1;

  // Spellcasting Ability resolution
  const fmAbility = String(classEntry?.frontmatter?.spellcasting_ability || '').toLowerCase();
  const allowsSpellcastingChoice =
    fmAbility === 'choice' || lower.includes('warlock') || lower.includes('tamer');

  let spellcastingAbility: AbilityKey | undefined = undefined;
  if (allowsSpellcastingChoice && abilityOverride) {
    spellcastingAbility = abilityOverride;
  } else if (fmAbility && fmAbility !== 'choice') {
    spellcastingAbility = parseAbilityName(fmAbility) || undefined;
  } else if (lower.includes('wizard') || lower.includes('artificer') || lower.includes('thanatomancer')) {
    spellcastingAbility = 'int';
  } else if (lower.includes('cleric') || lower.includes('druid') || lower.includes('ranger')) {
    spellcastingAbility = 'wis';
  } else if (
    lower.includes('bard') ||
    lower.includes('paladin') ||
    lower.includes('sorcerer') ||
    lower.includes('warlock') ||
    lower.includes('tamer')
  ) {
    spellcastingAbility = 'cha';
  }

  // Parse Main Class Markdown Table
  const classTables = classEntry ? parseMarkdownTables(classEntry.body || '') : [];
  const mainTable = classTables.find((t) =>
    (t.headers[0] || '').toLowerCase().includes('level') && t.rows.length >= 10
  );

  let casterType: ClassProgressionProfile['casterType'] = 'none';
  const spellSlots: Record<number, number> = {};
  let pactSlots: number | undefined = undefined;
  let pactSlotLevel: number | undefined = undefined;
  let cantripsKnown = 0;
  let spellsKnown: number | null = null;
  let classOptionsKnown = 0;
  let classOptionsLabel: string | null = null;
  let unarmoredMovement = 0;
  let martialArtsDie: string | null = null;
  let sneakAttack: string | null = null;
  const resources: { label: string; value: string }[] = [];

  if (mainTable) {
    const row = mainTable.rows.find((r) => parseCellInt(r[0]) === lvl) || mainTable.rows[lvl - 1];
    if (row) {
      const headers = mainTable.headers.map((h) => h.toLowerCase());

      // Check standard slot columns (1st .. 9th)
      const ordinalHeaders = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
      let maxSlotHeader = 0;
      ordinalHeaders.forEach((ord, idx) => {
        const colIdx = headers.findIndex((h) => h === ord || h === `${ord} level`);
        if (colIdx >= 0) {
          maxSlotHeader = Math.max(maxSlotHeader, idx + 1);
          const cnt = parseCellInt(row[colIdx]);
          if (cnt > 0) spellSlots[idx + 1] = cnt;
        }
      });

      // Check Pact Magic columns ("Spell Slots" & "Slot Level")
      const pactSlotsCol = headers.findIndex((h) => h.includes('spell slots'));
      const pactLvlCol = headers.findIndex((h) => h.includes('slot level'));
      if (pactSlotsCol >= 0 && pactLvlCol >= 0) {
        const pCount = parseCellInt(row[pactSlotsCol]);
        const pLvl = parseCellInt(row[pactLvlCol]);
        if (pCount > 0 && pLvl > 0) {
          casterType = 'pact';
          pactSlots = pCount;
          pactSlotLevel = pLvl;
          spellSlots[pLvl] = pCount;
        }
      } else if (maxSlotHeader >= 6) {
        casterType = 'full';
      } else if (maxSlotHeader > 0) {
        casterType = 'half';
      }

      // Cantrips Known
      const cantripCol = headers.findIndex((h) => h.includes('cantrip'));
      if (cantripCol >= 0) {
        cantripsKnown = parseCellInt(row[cantripCol]);
      }

      // Spells Known
      const spellsCol = headers.findIndex((h) => h.includes('spells known'));
      if (spellsCol >= 0) {
        spellsKnown = parseCellInt(row[spellsCol]);
      }

      // Class Options Known
      const optConfigs: { match: string; label: string }[] = [
        { match: 'invocations known', label: 'Eldritch Invocations' },
        { match: 'exploits known', label: lower.includes('barbarian') ? 'Savage Exploits' : 'Martial Exploits' },
        { match: 'techniques known', label: 'Mystic Techniques' },
        { match: 'avatar feature', label: 'Avatar Features' },
        { match: 'infusions known', label: 'Artificer Infusions' },
        { match: 'metamagic', label: 'Metamagic Options' },
        { match: 'manifestations known', label: 'Primal Manifestations' },
      ];
      for (const cfg of optConfigs) {
        const col = headers.findIndex((h) => h.includes(cfg.match));
        if (col >= 0) {
          classOptionsKnown = parseCellInt(row[col]);
          classOptionsLabel = cfg.label;
          break;
        }
      }

      // Martial Arts & Unarmored Movement
      const maCol = headers.findIndex((h) => h.includes('martial arts'));
      if (maCol >= 0 && row[maCol] && row[maCol] !== '-' && row[maCol] !== '—') {
        martialArtsDie = row[maCol];
        resources.push({ label: 'Martial Arts Die', value: row[maCol] });
      }
      const umCol = headers.findIndex((h) => h.includes('unarmored movement'));
      if (umCol >= 0) {
        unarmoredMovement = parseCellInt(row[umCol]);
      }

      // Sneak Attack
      const saCol = headers.findIndex((h) => h.includes('sneak attack'));
      if (saCol >= 0 && row[saCol] && row[saCol] !== '-' && row[saCol] !== '—') {
        sneakAttack = row[saCol];
        resources.push({ label: 'Sneak Attack', value: row[saCol] });
      }

      // Track key class resources
      const resCols: { colMatch: string; label: string }[] = [
        { colMatch: 'rages', label: 'Rages' },
        { colMatch: 'exploit die', label: 'Exploit Die' },
        { colMatch: 'exploit dice', label: 'Exploit Dice' },
        { colMatch: 'sorcery points', label: 'Sorcery Points' },
        { colMatch: 'mortis points', label: 'Mortis Points' },
        { colMatch: 'resolve', label: 'Resolve' },
        { colMatch: 'aura radius', label: 'Aura Radius' },
        { colMatch: 'channel divinity', label: 'Channel Divinity' },
        { colMatch: 'endurance dice', label: 'Endurance Dice' },
        { colMatch: 'infused items', label: 'Max Infused Items' },
        { colMatch: 'bardic inspiration', label: 'Bardic Inspiration' },
      ];
      resCols.forEach((rc) => {
        const col = headers.findIndex((h) => h === rc.colMatch || h.includes(rc.colMatch));
        if (col >= 0 && row[col] && !/^[-—─–]$/.test(row[col])) {
          resources.push({ label: rc.label, value: row[col] });
        }
      });
    }
  }

  // Fallback for Third-Caster Subclasses when base class has no slots (e.g. Arcane Knight, Curseblade, Witchblade, Loreseeker, Wu Jen, Rage Mage)
  if (casterType === 'none' && subclassEntry) {
    const subTables = parseMarkdownTables(subclassEntry.body || '');
    const subSpellTable = subTables.find((t) => {
      const hJoined = t.headers.join(' ').toLowerCase();
      return (
        t.headers[0]?.toLowerCase().includes('level') &&
        (hJoined.includes('1st') || hJoined.includes('spell slots'))
      );
    });

    if (subSpellTable) {
      const headers = subSpellTable.headers.map((h) => h.toLowerCase());
      const subRow = subSpellTable.rows.find((r) => parseCellInt(r[0]) === lvl);
      if (subRow) {
        const pactSlotsCol = headers.findIndex((h) => h.includes('spell slots'));
        const pactLvlCol = headers.findIndex((h) => h.includes('slot level'));
        if (pactSlotsCol >= 0 && pactLvlCol >= 0) {
          const pCount = parseCellInt(subRow[pactSlotsCol]);
          const pLvl = parseCellInt(subRow[pactLvlCol]);
          if (pCount > 0 && pLvl > 0) {
            casterType = 'pact';
            pactSlots = pCount;
            pactSlotLevel = pLvl;
            spellSlots[pLvl] = pCount;
          }
        } else {
          ['1st', '2nd', '3rd', '4th'].forEach((ord, idx) => {
            const colIdx = headers.findIndex((h) => h === ord || h === `${ord} level`);
            if (colIdx >= 0) {
              const cnt = parseCellInt(subRow[colIdx]);
              if (cnt > 0) spellSlots[idx + 1] = cnt;
            }
          });
          if (Object.keys(spellSlots).length > 0) casterType = 'third';
        }

        const cCol = headers.findIndex((h) => h.includes('cantrip'));
        if (cCol >= 0) cantripsKnown = parseCellInt(subRow[cCol]);
        const sCol = headers.findIndex((h) => h.includes('spells known'));
        if (sCol >= 0) spellsKnown = parseCellInt(subRow[sCol]);
      }

      // Detect subclass spellcasting ability from body if base class had none
      if (!spellcastingAbility) {
        const m = (subclassEntry.body || '').match(/(Intelligence|Wisdom|Charisma)\s+is\s+your\s+spellcasting\s+ability/i);
        if (m) {
          spellcastingAbility = parseAbilityName(m[1]) || 'int';
        } else if (/arcane knight|loreseeker|arcane/i.test(subclassEntry.title)) {
          spellcastingAbility = 'int';
        } else if (/shaman|wu jen/i.test(subclassEntry.title)) {
          spellcastingAbility = 'wis';
        } else {
          spellcastingAbility = 'cha';
        }
      }
    }
  }

  // Prepared caster formula (Cleric, Druid, Wizard, Artificer)
  let preparedFormula: { ability: AbilityKey; halfLevel: boolean } | null = null;
  if (lower.includes('artificer') && spellsKnown === null) {
    preparedFormula = { ability: 'int', halfLevel: true };
  } else if (lower.includes('cleric') || lower.includes('druid')) {
    preparedFormula = { ability: 'wis', halfLevel: false };
  } else if (lower.includes('wizard')) {
    preparedFormula = { ability: 'int', halfLevel: false };
  }

  const hasSpellcastingAtLevel = Object.keys(spellSlots).length > 0 || cantripsKnown > 0;
  // Clear spellcasting ability display for martial non-casters at Lv1 (unless subclass grants it at this level)
  const effectiveSpellAbility = hasSpellcastingAtLevel ? spellcastingAbility : undefined;

  // Fighting Style unlock levels
  let fightingStyleLevel: number | null = null;
  if (lower.includes('fighter') || lower.includes('paladin')) fightingStyleLevel = 1;
  else if (lower.includes('ranger') || lower.includes('warden')) fightingStyleLevel = 2;

  const grantsFightingStyle = fightingStyleLevel !== null && lvl >= fightingStyleLevel;

  // Expertise slots
  let expertiseSlots = 0;
  if (lower.includes('rogue')) expertiseSlots = lvl >= 6 ? 4 : 2;
  else if (lower.includes('bard')) expertiseSlots = lvl >= 10 ? 4 : lvl >= 3 ? 2 : 0;

  const jackOfAllTrades = lower.includes('bard') && lvl >= 2;
  const mysticBulwark = lower.includes('primal') && lvl >= 1;

  const profs = parseClassProficiencies(classEntry);
  const skillChoice = parseClassSkillPool(classEntry);

  const slotLevels = Object.keys(spellSlots).map(Number);
  const highestSlot = slotLevels.length > 0 ? Math.max(...slotLevels) : 0;
  const subclassBonusSpells = parseSubclassBonusSpells(subclassEntry, lvl, allSpells, highestSlot);

  return {
    proficiencyBonus: pb,
    casterType,
    hasSpellcastingAtLevel,
    spellSlots,
    pactSlots,
    pactSlotLevel,
    cantripsKnown,
    spellsKnown,
    preparedFormula,
    spellcastingAbility: effectiveSpellAbility,
    allowsSpellcastingChoice: allowsSpellcastingChoice && hasSpellcastingAtLevel,
    classOptionsKnown,
    classOptionsLabel,
    fightingStyleLevel,
    grantsFightingStyle,
    expertiseSlots,
    jackOfAllTrades,
    mysticBulwark,
    unarmoredMovement,
    martialArtsDie,
    sneakAttack,
    resources,
    armorProficiencies: profs.armor,
    weaponProficiencies: profs.weapons,
    toolProficiencies: profs.tools,
    skillChoice,
    subclassBonusSpells,
  };
}

// ---------- Feats (All 41) & Fighting Styles (All 30) Mechanical Evaluators ----------

export const FEAT_RULES_REGISTRY: Record<string, FeatRuleMetadata> = {
  'alternate fighting initiate': {
    asiChoice: { count: 1, amount: 1, allowed: ['str', 'dex', 'con'], distinct: true, label: '+1 STR, DEX, or CON' },
    grantsFightingStyle: true,
    notes: ['Grants 1 Fighting Style'],
  },
  'angelic durability': {
    fixedAsi: { con: 1 },
  },
  'angelic strength': {
    fixedAsi: { str: 1 },
  },
  'blessing of feather': {
    fixedAsi: { dex: 1 },
    flySpeed: 30,
  },
  'blessing of fin': {
    fixedAsi: { dex: 1 },
    swimSpeed: 30,
  },
  'celestial blood': {
    asiChoice: { count: 1, amount: 1, allowed: ABILITY_KEYS, distinct: true, label: '+1 to one ability score' },
  },
  'divine magic training': {
    innateSpells: ['2 Cleric Cantrips', '1 1st-level Cleric/Paladin Spell (1/long rest, WIS)'],
  },
  'epitome of good': {
    fixedAsi: { cha: 1 },
  },
  'former glory': {
    overrideFlySpeed: 60,
  },
  'hardy physique': {
    hardyPhysique: true,
    notes: ['May use CON instead of DEX for AC in armor'],
  },
  'intimidating leader': {
    asiChoice: { count: 1, amount: 1, allowed: ['str', 'con', 'cha'], distinct: true, label: '+1 STR, CON, or CHA' },
  },
  'magical birthmarks': {
    allSavesBonus: 1,
    notes: ['+1 bonus to all Saving Throws'],
  },
  'martial artist': {
    martialArtist: true,
    notes: ['Unarmored AC = 10 + STR + DEX (no armor/shield)', 'Unarmed strikes 1d4 (STR or DEX)'],
  },
  'martial training': {
    extraClassOptions: 2,
    notes: ['+2 1st-degree Martial Exploits Known & 2d4 Exploit Dice'],
  },
  'mystic warrior': {
    extraClassOptions: 2,
    notes: ['+2 Mystic Techniques Known & +2 Ki'],
  },
  'pain-bearer': {
    fixedAsi: { con: 1 },
  },
  'prudent': {
    fixedSkills: ['Perception', 'Insight'],
    expertiseIfProficient: true,
    notes: ['Perception & Insight proficiency (or Expertise if already proficient)'],
  },
  'redeemed and accepted': {
    fixedAsi: { cha: 1 },
  },
  'savage training': {
    extraClassOptions: 2,
    notes: ['+2 1st-degree Savage Exploits Known & 2d4 Exploit Dice'],
  },
  'starcaster': {
    fixedAsi: { int: 1 },
  },
  'third eye of the heavenly host': {
    fixedAsi: { wis: 1 },
  },
  'thrice life-given': {
    fixedAsi: { con: 1 },
  },
  'watched over by angels': {
    asiChoice: { count: 1, amount: 1, allowed: ABILITY_KEYS, distinct: true, label: '+1 to one ability score' },
  },
  'weapon adept': {
    asiChoice: { count: 1, amount: 1, allowed: ['str', 'dex', 'con'], distinct: true, label: '+1 STR, DEX, or CON' },
    grantsWeaponProficiency: 'All Simple & Martial Weapons',
  },
  'weapon master': {
    grantsWeaponProficiency: 'All Simple & Martial Weapons',
    notes: ['+1 attack and damage with PB chosen Simple/Martial weapons'],
  },
  'wings of light': {
    flySpeed: 30,
  },
};

export function getFeatMetadata(feat: ArchiveEntry): FeatRuleMetadata {
  const key = feat.title.toLowerCase().trim();
  if (FEAT_RULES_REGISTRY[key]) {
    return FEAT_RULES_REGISTRY[key];
  }
  // Fallback pattern check for future feats added to archive
  const body = feat.body || '';
  const fixedAsi: Partial<AbilityScores> = {};
  const fixedMatch = body.match(/Increase your (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) score by (\d+)/i);
  if (fixedMatch) {
    const ab = parseAbilityName(fixedMatch[1]);
    if (ab) fixedAsi[ab] = parseInt(fixedMatch[2], 10);
  }
  return Object.keys(fixedAsi).length > 0 ? { fixedAsi } : {};
}

export function checkFeatPrerequisite(
  feat: ArchiveEntry,
  scores: AbilityScores,
  raceTitle: string,
  classTitle: string,
  effectiveSkills: string[],
  hasSpellcasting: boolean
): { met: boolean; reason?: string } {
  let pre = cleanMarkdown(feat.prerequisite || '').trim();
  if (!pre && feat.body) {
    const bodyMatch = feat.body.match(/\*\*Prerequisites?:\*\*\s*([^\n]+)/i) || feat.body.match(/^Prerequisites?:\s*([^\n]+)/im);
    if (bodyMatch) {
      pre = cleanMarkdown(bodyMatch[1]).trim();
    }
  }
  if (!pre) return { met: true };
  const pl = pre.toLowerCase();

  // Ability score minimum check
  const abilityChecks: { pattern: RegExp; ab: AbilityKey; label: string }[] = [
    { pattern: /\b(?:str|strength)\s+(?:of\s+)?(\d+)/i, ab: 'str', label: 'STR' },
    { pattern: /\b(?:dex|dexterity)\s+(?:of\s+)?(\d+)/i, ab: 'dex', label: 'DEX' },
    { pattern: /\b(?:con|constitution)\s+(?:of\s+)?(\d+)/i, ab: 'con', label: 'CON' },
    { pattern: /\b(?:int|intelligence)\s+(?:of\s+)?(\d+)/i, ab: 'int', label: 'INT' },
    { pattern: /\b(?:wis|wisdom)\s+(?:of\s+)?(\d+)/i, ab: 'wis', label: 'WIS' },
    { pattern: /\b(?:cha|charisma)\s+(?:of\s+)?(\d+)/i, ab: 'cha', label: 'CHA' },
  ];
  for (const chk of abilityChecks) {
    const m = pre.match(chk.pattern);
    if (m) {
      const min = parseInt(m[1], 10);
      if ((scores[chk.ab] || 0) < min) {
        return { met: false, reason: `Requires ${chk.label} ${min}+` };
      }
    }
  }

  // Race prerequisites
  const racePrereqs = ['aengel', 'light-touched', 'peri', 'redeemed fiend', 'stranger'];
  for (const r of racePrereqs) {
    if (pl.includes(r) && raceTitle.toLowerCase() !== r) {
      return { met: false, reason: `Requires ${r.replace(/\b\w/g, (c) => c.toUpperCase())} ancestry` };
    }
  }

  // Skill prerequisites
  if (pl.includes('intimidation') && !effectiveSkills.includes('Intimidation')) {
    return { met: false, reason: 'Requires Intimidation proficiency' };
  }

  // Spellcasting prerequisites
  if ((pl.includes('spellcasting') || pl.includes('cast at least one spell')) && !hasSpellcasting) {
    return { met: false, reason: 'Requires Spellcasting feature' };
  }

  // Class prerequisites
  if (pl.includes('good-aligned paladin') && !classTitle.toLowerCase().includes('paladin')) {
    return { met: false, reason: 'Requires Paladin class' };
  }
  if (pl.includes('martial exploit')) {
    const cl = classTitle.toLowerCase();
    if (!cl.includes('fighter') && !cl.includes('barbarian')) {
      return { met: false, reason: 'Requires Martial Exploit Known' };
    }
  }
  if (pl.includes('cleric, paladin, or paragon')) {
    const cl = classTitle.toLowerCase();
    if (!cl.includes('cleric') && !cl.includes('paladin') && !cl.includes('paragon')) {
      return { met: false, reason: 'Requires Cleric, Paladin, or Paragon' };
    }
  }

  return { met: true };
}

export function evaluateFightingStyle(
  styleEntry: ArchiveEntry | null,
  customArmor: string,
  shieldEquipped: boolean,
  proficiencyBonus: number
): FightingStyleEffects {
  const empty: FightingStyleEffects = {
    acBonus: 0,
    walkSpeedBonus: 0,
    swimMatchesWalk: false,
    climbMatchesWalk: false,
    rangedAttackBonus: 0,
    meleeAttackBonus: 0,
    meleeDamageBonus: 0,
    notes: [],
  };
  if (!styleEntry) return empty;

  const title = styleEntry.title.toLowerCase().trim();
  const armorLower = (customArmor || '').toLowerCase();
  const isUnarmored = !armorLower || armorLower === 'unarmored';
  const isLightArmor = armorLower.includes('leather') || armorLower.includes('padded') || armorLower.includes('studded');
  const isHeavyArmor = armorLower.includes('ring mail') || armorLower.includes('chain mail') || armorLower.includes('splint') || armorLower.includes('plate');
  const isMediumOrHeavy = !isUnarmored && !isLightArmor;

  if (title === 'archery') {
    // Archive Homebrew Archery grants +1 ranged attack (ignored cover)
    empty.rangedAttackBonus = 1;
    empty.notes.push('+1 ranged attack rolls, ignore half cover');
  } else if (title === 'archery expert') {
    empty.rangedAttackBonus = 2;
    empty.notes.push('+2 ranged attack rolls (base + expert)');
  } else if (title === 'balanced fighting' || title === 'balanced expert') {
    empty.meleeDamageBonus = 2;
    empty.notes.push('+2 melee damage (one-handed melee weapon)');
  } else if (title === 'blind warrior') {
    empty.blindsightRange = 5 * proficiencyBonus;
    empty.notes.push(`Blindsight ${5 * proficiencyBonus} ft.`);
  } else if (title === 'brawling') {
    empty.unarmedDie = '1d6';
    empty.notes.push('Unarmed strikes deal 1d6 + STR');
  } else if (title === 'brawling expert') {
    empty.unarmedDie = '1d6';
    empty.meleeDamageBonus = 1;
    empty.notes.push('Unarmed strikes +1 damage');
  } else if (title === 'classical swordplay' || title === 'classical swordplay expert') {
    if (!shieldEquipped && !isHeavyArmor) {
      empty.acBonus = 1;
      empty.acCondition = 'Classical Swordplay (no shield/heavy)';
      empty.meleeAttackBonus = 2;
      empty.notes.push('+1 AC & +2 attack with single finesse weapon');
    } else {
      empty.notes.push('Classical Swordplay inactive while using shield or heavy armor');
    }
  } else if (title === 'defensive fighting' || title === 'defensive expert') {
    if (isMediumOrHeavy || shieldEquipped) {
      empty.acBonus = 1;
      empty.acCondition = 'Defensive Fighting';
      empty.notes.push('+1 AC (medium/heavy armor or shield)');
    } else {
      empty.notes.push('Defensive Fighting requires medium/heavy armor or a shield');
    }
  } else if (title === 'featherweight fighting' || title === 'featherweight expert') {
    if (isUnarmored || isLightArmor) {
      empty.walkSpeedBonus = 10;
      empty.meleeDamageBonus = 1;
      empty.notes.push('+10 ft. speed & +1 light/unarmed damage');
    } else {
      empty.notes.push('Featherweight Fighting requires unarmored or light armor');
    }
  } else if (title === 'heavyweight fighting' || title === 'heavyweight expert') {
    empty.meleeDamageBonus = 1;
    empty.notes.push('+1 damage with heavy melee weapons');
  } else if (title === 'mariner') {
    empty.swimMatchesWalk = true;
    if (!isHeavyArmor && !shieldEquipped) {
      empty.acBonus = 1;
      empty.acCondition = 'Mariner (no heavy armor/shield)';
      empty.notes.push('+1 AC & swim speed = walk speed');
    }
  } else if (title === 'mountaineer') {
    empty.climbMatchesWalk = true;
    if (!isHeavyArmor && !shieldEquipped) {
      empty.acBonus = 1;
      empty.acCondition = 'Mountaineer (no heavy armor/shield)';
      empty.notes.push('+1 AC & climb speed = walk speed');
    }
  } else if (title === 'polearm fighting' || title === 'polearm expert') {
    if (!shieldEquipped) {
      empty.meleeDamageBonus = 1;
      empty.notes.push('+1 polearm damage (no shield)');
    }
  } else if (title === 'shield warrior') {
    if (shieldEquipped) {
      empty.acBonus = 1;
      empty.acCondition = 'Shield Warrior';
      empty.notes.push('+1 AC with shield & no other weapons');
    }
  } else if (title === 'strongbow') {
    empty.useStrForBows = true;
    empty.notes.push('May use STR (+1 dmg) for shortbow/longbow');
  } else if (title === 'superior technique') {
    empty.extraClassOptions = 1;
    empty.notes.push('+1 Martial Exploit Known & +1 Exploit Die');
  } else if (title === 'versatile fighting') {
    if (!shieldEquipped) {
      empty.meleeAttackBonus = 1;
      empty.notes.push('+1 attack with versatile weapon (no shield)');
    }
  }

  return empty;
}

// ---------- Complete Automation Aggregator ----------

export interface RuleAutomationSummary {
  raceProfile: RaceRuleProfile;
  bgProfile: BackgroundRuleProfile | null;
  classProg: ClassProgressionProfile;
  styleEffects: FightingStyleEffects;
  abilityBonuses: {
    racial: AbilityScores;
    feats: AbilityScores;
    total: AbilityScores;
  };
  pendingAsiChoices: {
    sourceId: string;
    label: string;
    spec: AsiChoiceSpec;
    selected: AbilityKey[];
  }[];
  pendingFeatAsiChoices: {
    featId: string;
    featTitle: string;
    label: string;
    allowed: AbilityKey[];
    selected: AbilityKey | undefined;
  }[];
  autoSkills: { name: string; sources: string[]; expert: boolean }[];
  effectiveSkills: string[];
  effectiveExpertSkills: string[];
  pendingSkillChoices: {
    sourceId: string;
    bucket: 'race' | 'class' | 'background';
    spec: SkillChoiceSpec;
    selected: string[];
  }[];
  effectiveTools: string[];
  effectiveLanguages: string[];
  effectiveWeapons: string[];
  effectiveArmorProficiencies: string[];
  effectiveEquipment: string[];
  acNote: string;
  speedDisplay: string;
  speeds: SpeedProfile;
  allSavesBonus: number;
  hpBonusFromRules: number;
  grantsFightingStyleCount: number;
  extraClassOptions: number;
  featPrereqWarnings: Record<string, string>;
  innateSpells: { name: string; source: string; minLevel: number; ability?: string; note?: string }[];
  subclassSpellsUnlocked: { name: string; entry?: ArchiveEntry; unlockLevel: number }[];
}

export function computeRuleAutomation(
  state: CharacterState,
  selectedRace: ArchiveEntry | null,
  selectedClass: ArchiveEntry | null,
  selectedSubclass: ArchiveEntry | null,
  selectedBackground: ArchiveEntry | null,
  selectedFeats: ArchiveEntry[],
  selectedFightingStyle: ArchiveEntry | null,
  allSpells: ArchiveEntry[]
): RuleAutomationSummary {
  const level = Math.max(1, Math.min(20, state.level || 1));
  const raceProfile = getRaceRuleProfile(selectedRace, state.subrace, level);
  const bgProfile = getBackgroundRuleProfile(selectedBackground);
  const classProg = parseClassAndSubclassProgression(
    selectedClass,
    selectedSubclass,
    level,
    state.spellcastingAbilityOverride,
    allSpells
  );

  // 1. Compute Racial & Feat Ability Score Bonuses
  const racial: AbilityScores = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const pendingAsiChoices: RuleAutomationSummary['pendingAsiChoices'] = [];

  if (state.asiSystem === 'flexible') {
    if (state.racialBonuses.primary) racial[state.racialBonuses.primary] += 2;
    if (state.racialBonuses.secondary && state.racialBonuses.secondary !== state.racialBonuses.primary) {
      racial[state.racialBonuses.secondary] += 1;
    }
  } else if (selectedRace) {
    Object.entries(raceProfile.fixedAsi).forEach(([k, val]) => {
      const ab = k as AbilityKey;
      racial[ab] += val || 0;
    });
    if (raceProfile.asiChoice) {
      const spec = raceProfile.asiChoice;
      const picked = (state.racialChoiceAbilities || [])
        .filter((ab) => spec.allowed.includes(ab))
        .slice(0, spec.count);
      picked.forEach((ab) => {
        racial[ab] += spec.amount;
      });
      if (picked.length < spec.count) {
        pendingAsiChoices.push({
          sourceId: spec.id,
          label: spec.label,
          spec,
          selected: picked,
        });
      }
    }
  }

  // Feat ASIs & mechanical flags
  const featBonuses: AbilityScores = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const pendingFeatAsiChoices: RuleAutomationSummary['pendingFeatAsiChoices'] = [];
  const featSkills: string[] = [];
  let featExpertiseIfProficient = false;
  let hardyPhysique = false;
  let martialArtist = false;
  let allSavesBonus = 0;
  let featGrantsFightingStyle = false;
  let extraClassOptionsFromFeats = 0;
  const extraWeaponProfs: string[] = [];
  const featInnateSpells: { name: string; source: string; minLevel: number; ability?: string }[] = [];
  let flySpeed = raceProfile.speeds.fly || 0;
  let swimSpeed = raceProfile.speeds.swim || 0;

  selectedFeats.forEach((feat) => {
    const meta = getFeatMetadata(feat);
    if (meta.fixedAsi) {
      Object.entries(meta.fixedAsi).forEach(([k, val]) => {
        const ab = k as AbilityKey;
        featBonuses[ab] += val || 0;
      });
    }
    if (meta.asiChoice) {
      const chosen = state.featAbilityChoices?.[feat.id];
      const allowed = meta.asiChoice.allowed;
      if (chosen && allowed.includes(chosen)) {
        featBonuses[chosen] += meta.asiChoice.amount;
      } else {
        // Auto-default cleanly to first allowed choice OR highlight pending
        pendingFeatAsiChoices.push({
          featId: feat.id,
          featTitle: feat.title,
          label: meta.asiChoice.label,
          allowed,
          selected: chosen,
        });
      }
    }
    if (meta.fixedSkills) featSkills.push(...meta.fixedSkills);
    if (meta.expertiseIfProficient) featExpertiseIfProficient = true;
    if (meta.hardyPhysique) hardyPhysique = true;
    if (meta.martialArtist) martialArtist = true;
    if (meta.allSavesBonus) allSavesBonus += meta.allSavesBonus;
    if (meta.grantsFightingStyle) featGrantsFightingStyle = true;
    if (meta.extraClassOptions) extraClassOptionsFromFeats += meta.extraClassOptions;
    if (meta.grantsWeaponProficiency) extraWeaponProfs.push(meta.grantsWeaponProficiency);
    if (meta.flySpeed) flySpeed = Math.max(flySpeed, meta.flySpeed);
    if (meta.overrideFlySpeed) flySpeed = Math.max(flySpeed, meta.overrideFlySpeed);
    if (meta.swimSpeed) swimSpeed = Math.max(swimSpeed, meta.swimSpeed);
    if (meta.innateSpells) {
      meta.innateSpells.forEach((sp) => featInnateSpells.push({ name: sp, source: feat.title, minLevel: 1 }));
    }
  });

  const totalAbilities: AbilityScores = {
    str: Math.min(20, (state.baseAbilities.str || 10) + racial.str + featBonuses.str),
    dex: Math.min(20, (state.baseAbilities.dex || 10) + racial.dex + featBonuses.dex),
    con: Math.min(20, (state.baseAbilities.con || 10) + racial.con + featBonuses.con),
    int: Math.min(20, (state.baseAbilities.int || 10) + racial.int + featBonuses.int),
    wis: Math.min(20, (state.baseAbilities.wis || 10) + racial.wis + featBonuses.wis),
    cha: Math.min(20, (state.baseAbilities.cha || 10) + racial.cha + featBonuses.cha),
  };
  // Allow Custom/Manual base scores > 20 without clipping them down
  ABILITY_KEYS.forEach((k) => {
    if ((state.baseAbilities[k] || 0) > 20) {
      totalAbilities[k] = state.baseAbilities[k] + racial[k] + featBonuses[k];
    }
  });

  // 2. Skills Aggregation (Race + Class Picks + Background Fixed/Picks + Feats + Manual Sheet Overrides)
  const skillSources = new Map<string, string[]>();
  const addSkillSource = (skill: string, src: string) => {
    if (!ALL_SKILL_NAMES.includes(skill)) return;
    if (!skillSources.has(skill)) skillSources.set(skill, []);
    const list = skillSources.get(skill)!;
    if (!list.includes(src)) list.push(src);
  };

  raceProfile.fixedSkills.forEach((sk) => addSkillSource(sk, selectedRace?.title || 'Race'));
  if (raceProfile.skillChoice) {
    (state.racialSkillChoices || [])
      .filter((sk) => raceProfile.skillChoice!.from.includes(sk))
      .slice(0, raceProfile.skillChoice.count)
      .forEach((sk) => addSkillSource(sk, selectedRace?.title || 'Race'));
  }

  if (selectedClass) {
    (state.classSkillChoices || [])
      .filter((sk) => classProg.skillChoice.from.includes(sk))
      .slice(0, classProg.skillChoice.count)
      .forEach((sk) => addSkillSource(sk, selectedClass.title));
  }

  if (bgProfile) {
    bgProfile.fixedSkills.forEach((sk) => addSkillSource(sk, bgProfile.title));
    const allowedBgPool = new Set(bgProfile.skillChoices.flatMap((c) => c.from));
    const totalBgPicks = bgProfile.skillChoices.reduce((sum, c) => sum + c.count, 0);
    (state.backgroundSkillChoices || [])
      .filter((sk) => allowedBgPool.has(sk))
      .slice(0, totalBgPicks)
      .forEach((sk) => addSkillSource(sk, bgProfile.title));
  }

  // Prudent feat: proficiency in Perception & Insight, or Expertise if already proficient!
  const autoExpertSkills = new Set<string>();
  featSkills.forEach((sk) => {
    if (featExpertiseIfProficient && skillSources.has(sk)) {
      autoExpertSkills.add(sk);
    }
    addSkillSource(sk, 'Feat (Prudent)');
  });

  const autoSkills = Array.from(skillSources.entries()).map(([name, sources]) => ({
    name,
    sources,
    expert: autoExpertSkills.has(name),
  }));

  const effectiveSkillSet = new Set<string>([
    ...autoSkills.map((s) => s.name),
    ...(state.selectedSkills || []),
  ]);
  const effectiveSkills = Array.from(effectiveSkillSet);

  const effectiveExpertSkills = Array.from(
    new Set<string>([...autoExpertSkills, ...(state.expertSkills || [])])
  );

  // Track pending skill choices for clean UI prompts
  const pendingSkillChoices: RuleAutomationSummary['pendingSkillChoices'] = [];
  if (selectedRace && raceProfile.skillChoice) {
    const valid = (state.racialSkillChoices || []).filter((s) =>
      raceProfile.skillChoice!.from.includes(s)
    );
    if (valid.length < raceProfile.skillChoice.count) {
      pendingSkillChoices.push({
        sourceId: raceProfile.skillChoice.id,
        bucket: 'race',
        spec: raceProfile.skillChoice,
        selected: valid,
      });
    }
  }
  if (selectedClass && classProg.skillChoice.count > 0) {
    const valid = (state.classSkillChoices || []).filter((s) =>
      classProg.skillChoice.from.includes(s)
    );
    if (valid.length < classProg.skillChoice.count) {
      pendingSkillChoices.push({
        sourceId: classProg.skillChoice.id,
        bucket: 'class',
        spec: classProg.skillChoice,
        selected: valid,
      });
    }
  }
  if (bgProfile && bgProfile.skillChoices.length > 0) {
    const totalNeeded = bgProfile.skillChoices.reduce((acc, c) => acc + c.count, 0);
    const allFrom = Array.from(new Set(bgProfile.skillChoices.flatMap((c) => c.from)));
    const valid = (state.backgroundSkillChoices || []).filter((s) => allFrom.includes(s));
    if (valid.length < totalNeeded) {
      bgProfile.skillChoices.forEach((spec) => {
        const pickedInGroup = valid.filter((s) => spec.from.includes(s)).slice(0, spec.count);
        if (pickedInGroup.length < spec.count) {
          pendingSkillChoices.push({
            sourceId: spec.id,
            bucket: 'background',
            spec,
            selected: pickedInGroup,
          });
        }
      });
    }
  }

  // 3. Fighting Style, Speeds, Proficiencies, Equipment, Feat Prereqs
  const styleEffects = evaluateFightingStyle(
    selectedFightingStyle,
    state.customArmor,
    state.shieldEquipped,
    classProg.proficiencyBonus
  );

  const isUnarmored = !state.customArmor || state.customArmor.toLowerCase() === 'unarmored';
  const unarmoredMoveBonus = isUnarmored && !state.shieldEquipped ? classProg.unarmoredMovement : 0;
  const walkSpeed = raceProfile.speeds.walk + styleEffects.walkSpeedBonus + unarmoredMoveBonus;
  if (styleEffects.swimMatchesWalk) swimSpeed = Math.max(swimSpeed, walkSpeed);
  let climbSpeed = raceProfile.speeds.climb || 0;
  if (styleEffects.climbMatchesWalk) climbSpeed = Math.max(climbSpeed, walkSpeed);

  const speeds: SpeedProfile = {
    walk: walkSpeed,
    ...(flySpeed > 0 ? { fly: flySpeed } : {}),
    ...(swimSpeed > 0 ? { swim: swimSpeed } : {}),
    ...(climbSpeed > 0 ? { climb: climbSpeed } : {}),
    ...(raceProfile.speeds.burrow ? { burrow: raceProfile.speeds.burrow } : {}),
  };

  const speedParts = [`${speeds.walk} ft.`];
  if (speeds.fly) speedParts.push(`fly ${speeds.fly} ft.`);
  if (speeds.swim) speedParts.push(`swim ${speeds.swim} ft.`);
  if (speeds.climb) speedParts.push(`climb ${speeds.climb} ft.`);
  if (speeds.burrow) speedParts.push(`burrow ${speeds.burrow} ft.`);
  const speedDisplay = speedParts.join(', ');

  const effectiveTools = Array.from(
    new Set([
      ...classProg.toolProficiencies,
      ...raceProfile.tools,
      ...(bgProfile?.tools || []),
    ])
  );
  const effectiveLanguages = Array.from(
    new Set([...raceProfile.languages, ...(bgProfile?.languages || [])])
  );
  const effectiveWeapons = Array.from(
    new Set([...classProg.weaponProficiencies, ...raceProfile.weapons, ...extraWeaponProfs])
  );
  const effectiveArmorProficiencies = [...classProg.armorProficiencies];

  const effectiveEquipment =
    state.applyBackgroundGear && bgProfile
      ? Array.from(new Set([...bgProfile.equipment, ...(state.equipment || [])]))
      : [...(state.equipment || [])];

  // AC calculation context note (detailed calculation runs in builderUtils using this)
  const acNoteParts: string[] = [];
  if (hardyPhysique) acNoteParts.push('Hardy Physique (CON for armor AC)');
  if (classProg.mysticBulwark) acNoteParts.push('Mystic Bulwark (WIS for light/med armor)');
  if (martialArtist) acNoteParts.push('Martial Artist (10 + STR + DEX unarmored)');
  if (raceProfile.naturalArmorBase) acNoteParts.push(`Natural Armor ${raceProfile.naturalArmorBase} + DEX`);
  if (styleEffects.acCondition) acNoteParts.push(`+${styleEffects.acBonus} ${styleEffects.acCondition}`);

  const featPrereqWarnings: Record<string, string> = {};
  selectedFeats.forEach((f) => {
    const res = checkFeatPrerequisite(
      f,
      totalAbilities,
      raceProfile.raceTitle,
      selectedClass?.title || '',
      effectiveSkills,
      classProg.hasSpellcastingAtLevel
    );
    if (!res.met && res.reason) {
      featPrereqWarnings[f.id] = res.reason;
    }
  });

  const hpBonusFromRules = raceProfile.hpPerLevel * level;
  const grantsFightingStyleCount =
    (classProg.grantsFightingStyle ? 1 : 0) + (featGrantsFightingStyle ? 1 : 0);
  const extraClassOptions =
    extraClassOptionsFromFeats + (styleEffects.extraClassOptions || 0);

  const innateSpells = [
    ...raceProfile.innateSpells
      .filter((s) => level >= s.minLevel)
      .map((s) => ({ ...s, source: raceProfile.raceTitle })),
    ...featInnateSpells,
  ];

  return {
    raceProfile,
    bgProfile,
    classProg,
    styleEffects,
    abilityBonuses: {
      racial,
      feats: featBonuses,
      total: totalAbilities,
    },
    pendingAsiChoices,
    pendingFeatAsiChoices,
    autoSkills,
    effectiveSkills,
    effectiveExpertSkills,
    pendingSkillChoices,
    effectiveTools,
    effectiveLanguages,
    effectiveWeapons,
    effectiveArmorProficiencies,
    effectiveEquipment,
    acNote: acNoteParts.join(' · '),
    speedDisplay,
    speeds,
    allSavesBonus,
    hpBonusFromRules,
    grantsFightingStyleCount,
    extraClassOptions,
    featPrereqWarnings,
    innateSpells,
    subclassSpellsUnlocked: classProg.subclassBonusSpells,
  };
}
