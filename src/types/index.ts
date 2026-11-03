export type SourceType = 'SRD' | 'homebrew' | 'third-party' | 'official-supplement' | 'campaign-original';

export type EntryType = 
  | 'Character' 
  | 'Place' 
  | 'Faction' 
  | 'Lore' 
  | 'Session' 
  | 'CalendarEvent' 
  | 'Encounter' 
  | 'Item' 
  | 'Rules' 
  | 'Class'
  | 'Subclass'
  | 'Race'
  | 'Background'
  | 'Feat'
  | 'Other';

export interface WikiEntry {
  id: string;
  title: string;
  category: 'campaigns' | 'classes' | 'subclasses' | 'races' | 'backgrounds' | 'feats' | 'class-options' | 'fighting-styles' | 'items' | 'rules' | 'builder';
  summary?: string;
  source: string;
  sourceType: SourceType;
  content: string;
  tags?: string[];
  campaignId?: 'ra-golvek' | 'vyrun' | 'curse-of-strahd' | 'all';
  relatedLinks?: string[];
}

export interface CampaignInfo {
  id: 'ra-golvek' | 'vyrun' | 'curse-of-strahd';
  name: string;
  tagline: string;
  description: string;
  theme: string;
  setting: string;
  calendarName: string;
  currentDate: string;
  sessions: {
    number: number;
    title: string;
    date: string;
    summary: string;
    characters: string[];
    locations: string[];
    loot?: string[];
  }[];
  characters: {
    name: string;
    role: string;
    faction?: string;
    status: 'Alive' | 'Deceased' | 'Unknown';
    summary: string;
    details: string;
  }[];
  locations: {
    name: string;
    type: string;
    summary: string;
    significance: string;
  }[];
  houseRules: {
    title: string;
    category: string;
    summary: string;
    text: string;
  }[];
}

export interface ClassDefinition {
  name: string;
  hitDie: string;
  primaryAbility: string;
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  subclasses: string[];
  summary: string;
  source: string;
  sourceType: SourceType;
  tableHeaders: string[];
  tableRows: {
    level: string;
    profBonus: string;
    features: string;
    spellSlots?: string;
    customCol?: string;
  }[];
  overview: string;
  subclassFeatureLevel: string;
  spellsEligible?: boolean;
}

export interface SubclassDefinition {
  name: string;
  parentClass: string;
  summary: string;
  source: string;
  sourceType: SourceType;
  features: {
    level: string;
    title: string;
    description: string;
  }[];
}

export interface RaceDefinition {
  name: string;
  summary: string;
  source: string;
  sourceType: SourceType;
  traits: string[];
  subraces?: string[];
  description: string;
  abilityBonus: string;
  speed: string;
}

export interface ItemDefinition {
  name: string;
  itemType: 'Ammunition' | 'Armor' | 'Potion' | 'Ring' | 'Rod' | 'Scroll' | 'Staff' | 'Wand' | 'Weapon' | 'Wondrous Items';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact';
  attunement: boolean;
  summary: string;
  source: string;
  sourceType: SourceType;
  description: string;
}

export interface FeatDefinition {
  name: string;
  prerequisite?: string;
  summary: string;
  source: string;
  sourceType: SourceType;
  description: string;
}

export interface ClassOptionDefinition {
  name: string;
  group: 'Martial Exploits' | 'Eldritch Invocations' | 'Metamagic' | 'Monk Techniques' | 'Avatar Features' | 'Elder Arcana' | 'Familiars' | 'Pact Foci' | 'Smite Paths';
  parentClass: string;
  minLevel?: number;
  prerequisite?: string;
  summary: string;
  source: string;
  sourceType: SourceType;
  description: string;
}

export interface CharacterBuilderState {
  characterName: string;
  campaignId: string;
  race: string;
  subrace: string;
  className: string;
  subclass: string;
  background: string;
  alignment: string;
  level: number;
  abilityScores: {
    STR: number;
    DEX: number;
    CON: number;
    INT: number;
    WIS: number;
    CHA: number;
  };
  selectedFeats: string[];
  selectedOptions: string[];
  equipment: string[];
  backstory: string;
}
