# Structural Transformation Diagrams

## Current State: Fragmented Islands

```
┌─────────────────────────────────────────────────────────┐
│                     Knowledge Graph (Sparse)             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Spells (424)              Character Options (235)       │
│  ●──●──●──●                ●─●─●─●                      │
│  │  │  │  │                │ │ │ │                      │
│  ●──●──●──●                ●─●─●─●                      │
│                                                           │
│  Items (367)               Monsters (2)                  │
│  ●──●──●                   ●                             │
│  │  │  │                                                 │
│  ●──●──●                                                 │
│                                                           │
│  ┌─────────────────────────────────────┐                │
│  │ Campaign Sections (ISOLATED)        │                │
│  ├─────────────────────────────────────┤                │
│  │ Ra Gol'vek (3 files)   ●            │                │
│  │ Vyrun (1 file)         ●            │                │
│  │ Curse of Strahd (1)    ●            │                │
│  └─────────────────────────────────────┘                │
│                                                           │
│  NO CROSS-DOMAIN LINKS                                   │
│  (0.17 links/entry on average)                           │
│                                                           │
└─────────────────────────────────────────────────────────┘

Key Problem:
- Rules live separately from campaigns
- Campaigns don't reference spells/items/monsters
- No narrative threading between domains
```

---

## Proposed State: Interconnected Network

```
┌──────────────────────────────────────────────────────────────────┐
│                  Campaign Archive: Ra Gol'vek                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SESSION HUB                                                       │
│  ┌─────────────────────────────────┐                              │
│  │ Session 1: The Ambush           │                              │
│  │ (Links to 15+ related entities) │                              │
│  └────────────────┬────────────────┘                              │
│                   │                                               │
│      ┌────────────┼────────────┬────────────┐                    │
│      ▼            ▼            ▼            ▼                    │
│   NPCs        LOCATIONS    MONSTERS     LOOT                     │
│   ┌────┐     ┌─────────┐   ┌────────┐  ┌──────┐               │
│   │NPC1│     │Location │   │Monster │  │Item  │               │
│   └──┬─┘     │         │   │ x3     │  │      │               │
│      │       └────┬────┘   └────┬───┘  └──────┘               │
│      └───────────────┬──────────┘         │                    │
│                      ▼ LINKS TO           │                    │
│      ┌───────────────────────────────┐   │                    │
│      │ GLOBAL RULES DATABASE         │◄──┘                    │
│      ├───────────────────────────────┤                        │
│      │ Spells: [[Magic Missile]]     │ ◄──────────┐          │
│      │         [[Fireball]]          │            │          │
│      │ Monsters: [[Goblin Warlord]]  │            │          │
│      │ Items: [[Dagger+3]]           │            │          │
│      │ Classes: [[Warlock]]          │            │          │
│      └───────────────────────────────┘            │          │
│                                        BACKLINKS (automated)  │
│                                                               │
└──────────────────────────────────────────────────────────────────┘

Session → NPC → Spell → Class
       → Location → Item
       → Monster ↔ Spell
       → Encounter → Loot
       
Rich graph; 3-5 hops to any related content
```

---

## Folder Structure Transformation

### Before

```
content/
├── ra-golvek/
│   ├── index.md
│   ├── NPC 1.md         ← Flat, no structure
│   ├── NPC 2.md
│   ├── Location 1.md
│   ├── Location 2.md
│   └── Session.md
├── spells/
│   ├── Magic Missile.md ← Completely separate
│   ├── Fireball.md
│   └── ...
├── monsters/
│   └── Goblin Scout.md  ← No campaign context
└── items/
    ├── Dagger.md        ← Orphaned
    └── ...
```

### After

```
content/
├── ra-golvek/                    ← Campaign Root
│   ├── index.md                  ← Campaign Hub
│   ├── sessions/                 ← NEW: Session Hubs
│   │   ├── index.md
│   │   ├── Session 1 - The Ambush.md
│   │   ├── Session 2 - Return.md
│   │   └── ...
│   ├── npcs/                     ← NEW: Organized NPCs
│   │   ├── index.md
│   │   ├── Tavern Keeper.md      ← Links to sessions
│   │   ├── Goblin Warlord.md
│   │   └── ...
│   ├── locations/                ← NEW: Campaign Locations
│   │   ├── index.md
│   │   ├── The Drunken Griffin.md
│   │   ├── Goblin Camp.md
│   │   └── ...
│   ├── encounters/               ← NEW: Battle Records
│   │   ├── Battle of Ambush.md
│   │   └── ...
│   └── loot/                     ← NEW: Campaign-Specific Items
│       ├── Dagger of Sharpness.md
│       └── ...
├── spells/                       ← Global, but NOW CROSS-LINKED
│   ├── Magic Missile.md          (appears in Session 1)
│   ├── Fireball.md               (appears in Session 1)
│   └── ...
├── monsters/                     ← Global, but NOW WITH CONTEXT
│   ├── Goblin Scout.md           (Ra Gol'vek Sessions 1, 12)
│   └── ...
├── items/                        ← Global, NOW MAPPED TO OWNERS
│   ├── Dagger of Sharpness.md    (Loot in Session 1)
│   └── ...
└── character-options/
    └── ... (unchanged but linked from campaigns)
```

---

## Link Density Comparison

### Before

```
Magic Missile → []           (no backlinks)
Session 1 → []              (orphaned)
Goblin Scout → []           (context-free)

Average: 0.17 links/entry
```

### After

```
Magic Missile → [[Session 1: The Ambush]] (casted here)
              → [[Warlock]] (available spell)
              → [[Goblin Scout]] (effective against)
              ← [[Session 1: The Ambush]]
              ← [[Fireball]] (same encounter)

Session 1 → [[Tavern Keeper]] (NPC)
         → [[Goblin Scout]] (monster)
         → [[Magic Missile]] (spell used)
         → [[The Drunken Griffin]] (location)
         → [[Dagger of Sharpness]] (loot)
         ← [[Tavern Keeper]]
         ← [[Goblin Scout]]

Goblin Scout → [[Session 1]] (appeared)
            → [[Session 12]] (appeared)
            → [[Magic Missile]] (weak to)
            → [[Fireball]] (weak to)
            → [[Short Sword]] (drops)
            ← [[Session 1]]
            ← [[Magic Missile]]

Average: 3-5 links/entry
```

---

## Navigation Example: Player Journey

### Before (Dead Ends)

```
Player: "What spells does my warlock have?"
→ Spell List (table, hard to scan)
→ Individual spell page (bare description)
→ STUCK

Player: "Are there encounters with warlocks in my campaign?"
→ No connection between Classes and Sessions
→ Have to search manually
→ STUCK
```

### After (Connected Graph)

```
Player: "What spells does my warlock have?"
→ [[Warlock]] page
→ Linked spells: [[Magic Missile]], [[Eldritch Blast]], etc.
→ Click [[Magic Missile]]
→ See [[Goblin Scout]] (weak to it)
→ Click [[Goblin Scout]]
→ See [[Session 1 - The Ambush]] (where this appears)
→ See NPCs, loot, location all in one place
→ RICH CONTEXT

Player: "Are there encounters with warlocks in my campaign?"
→ Campaign hub [[Ra Gol'vek]]
→ See all sessions
→ Click [[Session 1]]
→ See [[Tavern Keeper]] (has warlock abilities)
→ Click [[Tavern Keeper]]
→ See all sessions featuring this NPC
→ CONNECTED STORY
```

---

## Backlink Example

### Spell: Magic Missile

**Before:**
```
Backlinks: (none)
```

**After:**
```
Backlinks (powered by [[]] links):
- Session 1: The Ambush (party uses)
- Session 12: Goblin Hideout (party uses again)
- Warlock (available spell)
- Goblin Scout (weak to)
- Wizard (available spell)
```

Click any backlink to see full context.

---

## Graph Visualization Comparison

### Before (Sparse)

```
       ●──●──●              ●──●──●
       │  │  │              │  │  │
       ●──●──●              ●──●──●

    (Spells)           (Character Options)

           ●            ●


        (Items)     (Campaigns)

No edges between clusters!
```

### After (Dense)

```
                 ┌──────────────────┐
                 │   Session Hub    │
                 └────────┬─────────┘
           ┌─────┬────────┼────────┬─────┐
           ▼     ▼        ▼        ▼     ▼
         NPC   SPELL   MONSTER   LOOT  LOCATION
           │     │ ╲    ╱ │       │      │
           └─────┼──────────┼──────┴──────┘
                 │   CLASS  │
                 └──────────┘

Every node connects to 3-7 others.
Traversal depth: 4-5 hops to any related content.
```

---

## Implementation Roadmap

### Week 1: Structural Refactor

- [ ] Create subsection folders (sessions/, npcs/, locations/)
- [ ] Migrate Ra Gol'vek entries into new structure
- [ ] Create Session 1 hub with manual cross-links
- [ ] Verify Quartz builds and backlinks appear

### Week 2: Enhanced Linking

- [ ] Add 5+ `[[]]` links per session hub
- [ ] Update monster files with loot + related spells
- [ ] Cross-link NPCs to sessions featuring them
- [ ] Test graph view: should show rich clusters

### Week 3: Completion

- [ ] Apply pattern to Vyrun and Curse of Strahd
- [ ] Create campaign-level index pages (all NPCs, all locations)
- [ ] Backfill remaining campaigns with metadata (appeared_in, related_spells, etc.)
- [ ] Audit graph density; aim for 2+ links per entry minimum

---

