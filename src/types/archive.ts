export type SourceType = 'SRD' | 'homebrew' | 'third-party' | 'campaign-original' | 'official-supplement';

export type Category = 
  | 'classes'
  | 'subclasses'
  | 'races'
  | 'backgrounds'
  | 'feats'
  | 'fighting-styles'
  | 'class-options'
  | 'templates'
  | 'spells'
  | 'monsters'
  | 'items'
  | 'campaigns'
  | 'rules'
  | 'home'
  | 'builder'
  | 'guide'
  | 'other';

export interface ArchiveEntry {
  id: string;
  title: string;
  path: string;
  category: Category;
  subcategory: string | null;
  parentClass: string | null;
  summary: string;
  source: string;
  source_type: SourceType;
  entity_type: string;
  tags: string[];
  aliases: string[];
  rarity?: string | null;
  item_type?: string | null;
  attunement?: boolean;
  hit_die?: string | null;
  saving_throws?: string[];
  campaign_id?: string | null;
  content_status: 'complete' | 'incomplete' | 'draft';
  frontmatter: Record<string, any>;
  body: string;
  level?: number | null;
  school?: string | null;
  classes?: string[];
  subclass_spell_lists?: string[];
  casting_time?: string | null;
  range?: string | null;
  duration?: string | null;
  components?: string | null;
  ritual?: boolean;
  concentration?: boolean;
  incomingLinks?: string[];
}

export interface GraphNode {
  id: string;
  title: string;
  category: Category;
  subcategory: string | null;
  parentClass: string | null;
  source: string;
  source_type: SourceType;
  campaign: string | null;
  linkCount: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
}

export interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type?: 'mention' | 'subclass_of' | 'option_of' | 'campaign_content';
}

export interface ArchiveDatabase {
  generatedAt: string;
  stats: {
    totalEntries: number;
    classes: number;
    subclasses: number;
    races: number;
    backgrounds: number;
    feats: number;
    fightingStyles: number;
    classOptions: number;
    spells: number;
    monsters: number;
    items: number;
    campaigns: number;
    rules: number;
  };
  entries: ArchiveEntry[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface CharacterBuild {
  id: string;
  name: string;
  race: string;
  subrace?: string;
  className: string;
  subclass?: string;
  background?: string;
  alignment: string;
  level: number;
  abilities: AbilityScores;
  selectedFeats: string[];
  selectedFightingStyles: string[];
  selectedClassOptions: string[];
  equipmentChoices: string[];
  notes: string;
  createdAt: string;
}
