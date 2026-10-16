# Campaign Archive: Deep Structural Analysis

## Executive Summary

Your repo has **critical linking and taxonomy gaps** that severely underutilize Quartz's knowledge graph capabilities. Current state: **0.17 links per entry** (should be 2-5+). Only **3.1% of files** contain any internal wiki-style links. The architecture is SRD-centric and **campaign-data-orthogonal** — campaigns are compartmentalized islands rather than interconnected networks.

---

## Current State Analysis

### Linking Deficit

| Metric | Current | Healthy Range |
|--------|---------|---------------|
| Total files | 1,036 | - |
| Files with links | 32 | 300+ (29%) |
| Links per entry | 0.17 | 2-5 |
| Link depth (max hops) | 1 | 3-4 |
| Cross-campaign refs | 2 | 50+ |
| Orphan entries | ~201 incomplete | Minimal |

### Architecture Failures

1. **Siloed Knowledge Domains**
   - Spells: 424 files, but almost NO backlinks from campaign content
   - Items: 367 files, isolated from monsters/NPCs/characters
   - Characters: 235 char-option files, no links to story/campaign NPCs
   - Campaign sections: 3-1 files each, disconnected from rules/items/spells

2. **Missing Semantic Connections**
   - Monsters don't reference their loot/treasure
   - NPCs don't link to spells they cast
   - Campaign locations don't reference encounters
   - Items don't reference who wields them
   - Classes don't reference relevant spells

3. **Flat Taxonomy**
   - Campaign entries all in root folder (ra-golvek/, vyrun/, curse-of-strahd/)
   - No subsection hierarchy: Sessions > NPCs > Locations > Items
   - Character options use 7 subdirs but no parent linking
   - No "Session 1" → "NPCs in Session 1" → "Named Monster Used" → "Spell Cast" chain

---

## D&D Wiki Best Practices (From D&D Beyond / Obsidian D&D Wikis)

### Structural Pattern: Hierarchical + Relational

**D&D Beyond Uses:**
- **Browse hierarchy**: Classes → Subclasses → Class Features → Related Spells/Items
- **Cross-linking by metadata**: All spell pages auto-link to classes that can learn them
- **Encounter-centric linking**: Monsters → Loot → NPCs using those items
- **Multi-entry views**: "Spells by Class" = implicit link graph

**Your Repo Should Adopt:**

1. **Campaign Sessions as Hubs**
   ```
   content/ra-golvek/sessions/
     Session 1.md (links to NPCs, locations, encounters, loot)
       → [[NPC: Tavern Keeper]]
       → [[Location: The Drunken Griffin]]
       → [[Monster: Goblin Scout]]
       → [[Loot: Dagger of Sharpness]]
   ```

2. **NPC = Hub File**
   ```
   content/ra-golvek/npcs/Tavern Keeper.md
     - Role: quest-giver
     - Related sessions: [[Session 1]], [[Session 5]]
     - Spells: [[Eldritch Blast]] (if magical)
     - Items: [[Tavern License]]
     - Location: [[The Drunken Griffin]]
   ```

3. **Monsters ↔ Encounters ↔ Loot**
   ```
   content/monsters/Goblin Scout.md
     - Typical loot: [[Leather Armor]], [[Short Sword]]
     - Appeared in: [[Session 1 - The Ambush]]
     - Related NPCs: [[Goblin Warlord]]
   ```

4. **Spells ↔ Classes (Bidirectional)**
   ```
   content/spells/Eldritch Blast.md
     - Available to: [[Warlock]], [[Paragon]]
     - Related feat: [[Agonizing Blast]]
   
   content/character-options/classes/Warlock.md
     - Cantrips: [[Eldritch Blast]], [[Mage Hand]], ...
   ```

---

## Quartz Knowledge Graph Capabilities (Underutilized)

### What's Enabled in Your Config

1. **Backlinks Plugin** ✓ Enabled
   - Shows incoming links, but almost none exist
   - Would be powerful if linking was 50x denser

2. **Graph View Plugin** ✓ Enabled
   - Shows local + global graph
   - Current graph is a fragmented scatter plot
   - Could be a rich spider web with proper linking

3. **Crawl Links Plugin** ✓ Enabled
   - Uses `markdownLinkResolution: shortest`
   - But only works on `[[wiki]]` links; yours rarely exist

4. **Content Index + Search** ✓ Enabled
   - Builds searchable index
   - Could power smart cross-references if metadata was richer

### What's Missing: Semantic Linking Strategy

You have the **engine** (Quartz) but not the **fuel** (dense link structure).

---

## Proposed Restructuring: 3-Phase Approach

### Phase 1: Taxonomy Flattening → Hierarchical

**Current:**
```
content/ra-golvek/
  ├─ index.md
  ├─ NPC.md
  ├─ NPC.md
  └─ Location.md
```

**Target:**
```
content/ra-golvek/
  ├─ index.md (campaign hub)
  ├─ sessions/
  │   ├─ Session 1.md (hub linking to all session content)
  │   ├─ Session 2.md
  │   └─ ...
  ├─ npcs/
  │   ├─ index.md (all NPCs by role)
  │   ├─ Tavern Keeper.md
  │   ├─ Warlord.md
  │   └─ ...
  ├─ locations/
  │   ├─ index.md
  │   ├─ The Drunken Griffin.md
  │   └─ ...
  ├─ encounters/
  │   ├─ The Ambush.md
  │   └─ ...
  └─ loot/
      ├─ index.md (rare items found here)
      └─ ...
```

**Benefit:** Natural subsection discovery; enables breadth-first exploration.

### Phase 2: Forward Linking (Campaign → Rules)

**Current:** Spells exist, but no spell mentions which campaigns use them.

**Target:** Every campaign entry links outward:
```markdown
## Combat
The party faces [[Goblin Scout|goblins]] and casts [[Magic Missile]] to disable them.

## Loot
They recover [[Dagger of Sharpness]].
```

**Implementation:**
- Campaign entries must link to monsters, spells, items (via `[[Name]]`)
- Cross-campaign links: if multiple campaigns use same monster, link to it once
- Global index: "Monster appearances" = backlinks to campaign sessions

### Phase 3: Metadata-Driven Backlinking

**Current:** Only manual `[[links]]` work.

**Target:** Add structured fields that auto-generate link suggestions:

```yaml
---
title: Goblin Scout
creature_type: Humanoid
related_spells:
  - Magic Missile
  - Fireball
typical_loot:
  - Short Sword
  - Leather Armor
appeared_in:
  - Session 1 - The Ambush
---
```

Then enable a **custom Quartz plugin** or **frontmatter processing** to:
- Auto-link spells mentioned in `related_spells`
- Auto-link loot items
- Generate "Appeared in" section with session backlinks

---

## Linking Patterns: Examples

### Pattern 1: Session Hub
```markdown
---
title: "Session 1: The Ambush"
campaign: Ra Gol'vek
date: 2024-01-15
---

## NPCs Present
- [[Tavern Keeper]] (quest giver)
- [[Goblin Warlord]] (antagonist)

## Locations Visited
- [[The Drunken Griffin]]
- [[Goblin Camp]]

## Encounters
- [[Battle of the Ambush]] (vs. [[Goblin Scout]] x3)

## Loot Acquired
- [[Dagger of Sharpness]] (from goblin leader)

## Summary
Players visited the tavern where [[Tavern Keeper]] warned them of goblin raids. 
They traveled to [[Goblin Camp]] and encountered [[Goblin Scout|scouts]]. 
After defeating them with [[Magic Missile]] and [[Fireball]], they found [[Dagger of Sharpness]].
```

### Pattern 2: NPC File
```markdown
---
title: Tavern Keeper
role: Quest Giver
campaign: Ra Gol'vek
---

## Background
Runs [[The Drunken Griffin]].

## Appearances
- [[Session 1: The Ambush]] (quest giver)
- [[Session 5: Return to Town]]

## Quests Given
- "Eliminate the Goblin Menace" → Leads to [[Session 1: The Ambush]]

## Personality
Gruff but fair. Uses [[Eldritch Blast]] if threatened (former warlock).

## Items of Note
- [[Tavern License]] (framed on wall)
```

### Pattern 3: Monster File (Enhanced)
```markdown
---
title: Goblin Scout
size: Small
creature_type: Humanoid
ac: 15
hp: 7
cr: 1/8
typical_loot:
  - Short Sword
  - Leather Armor
related_spells:
  - Magic Missile
  - Fireball
---

## Tactics
Goblins often use [[Cunning Action]] and scatter after first hit.
Vulnerable to [[Fireball]].

## Loot
- [[Short Sword]]
- [[Leather Armor]] (worn)

## Appearances
- [[Session 1: The Ambush]] (3 scouts encountered)
- [[Session 12: Goblin Hideout Raid]] (5 scouts + leader)

## Related
- Ally: [[Goblin Warlord]]
- Related spell: [[Magic Missile]]
```

---

## Technical Implementation Steps

### Step 1: Restructure Campaign Folders

```powershell
# Migrate from flat to hierarchical
Move-Item content/ra-golvek/NPC.md content/ra-golvek/npcs/NPC.md
Move-Item content/ra-golvek/Location.md content/ra-golvek/locations/Location.md
# ... etc
```

### Step 2: Enable Wiki Link Resolution in Quartz Config

Already enabled (`crawl-links`), but ensure:
```yaml
- source: "@quartz-community/crawl-links"
  enabled: true
  options:
    markdownLinkResolution: shortest
```

### Step 3: Add Cross-Reference Hub Pages

Create index files per subsection:
```markdown
# Ra Gol'vek NPCs

| Name | Role | Sessions |
|------|------|----------|
| [[Tavern Keeper]] | Quest Giver | 1, 5 |
| [[Goblin Warlord]] | Antagonist | 1, 12 |
```

### Step 4: Backfill Campaign Content with Links

For each campaign entry, add `[[link]]` references to related content.

### Step 5: Consider Custom Frontmatter Processing

Write a lightweight Quartz plugin or use Obsidian dataview to auto-generate links from structured fields.

---

## Linking Checklist

### Before Publication, Each Entry Should Have:

- [ ] **Spells**: Link to classes that use them
- [ ] **Items**: Link to NPCs/monsters that wield them
- [ ] **Monsters**: Link to sessions/encounters where they appear
- [ ] **NPCs**: Link to sessions and related items/spells
- [ ] **Locations**: Link to sessions and NPCs based there
- [ ] **Sessions**: Link to all NPCs, monsters, locations, loot encountered
- [ ] **Classes**: Link to related spells, subclasses, features

### Graph Health Metrics

**Target:**
- 30-50% of entries have 2+ internal links
- Average link density: 2-5 per entry
- Max graph depth: 4-5 hops (e.g., Session → NPC → Class → Spell → Item)
- Cross-campaign links: 20+ (shared monsters, spells, etc.)

---

## Why This Matters

1. **Player Discovery**: "I want to know what spells my Warlock can use" → lands on Warlock page → sees linked spells → spells show monsters that use them → player sees where they appear in campaigns
2. **DM Prep**: "Session 5 has goblins?" → backlinks show all goblin appearances across campaigns → consistent encounter design
3. **Knowledge Graph Value**: Every click reveals 3-5 new relevant entries instead of dead ends
4. **Search Power**: Graph context enriches semantic search ("spells for eldritch warlocks" = implicit relationship traversal)

---

## Implementation Priority

| Priority | Action | Impact |
|----------|--------|--------|
| **High** | Restructure campaign folders into sessions/npcs/locations/encounters | +50% discoverability |
| **High** | Add 10-20 session hub pages with full cross-linking | +40% link density |
| **Medium** | Enhance monster/NPC files with typical loot + spell references | +25% relevance |
| **Medium** | Create campaign-level index pages (all NPCs, all locations) | +20% navigation |
| **Low** | Build custom Quartz plugin for auto-linking from frontmatter | Quality of life |

---

## Sample Refactored Campaign Entry

**Before:**
```markdown
---
title: Goblin Scout
source: SRD 5.1
---

Small humanoid, unaligned. AC 15, HP 7, CR 1/8.
Uses Scimitar and Light Crossbow.
```

**After:**
```markdown
---
title: Goblin Scout
size: Small
creature_type: Humanoid
ac: 15
hp: 7
cr: 1/8
typical_loot:
  - Short Sword
  - Leather Armor
weak_to:
  - Fireball
  - Magic Missile
appeared_in:
  - Session 1 - The Ambush
  - Session 12 - Goblin Hideout Raid
source: SRD 5.1
---

## Overview

A small goblin fighter, often found in groups raiding frontier settlements.

## Combat Tactics

Goblins use [[Cunning Action]] to disengage and reposition. Vulnerable to [[Fireball]], especially in groups.

## Loot

- [[Short Sword]]
- [[Leather Armor]] (worn)

## Appearances in Campaigns

- **Ra Gol'vek**: [[Session 1 - The Ambush]] (3 scouts), [[Session 12 - Goblin Hideout Raid]] (5+ scouts)
- Related leader: [[Goblin Warlord]]

## Spell Interactions

Commonly defeated by: [[Magic Missile]], [[Fireball]]
```

---

## Next Steps for You

1. **Approve** this structural direction or propose alternatives
2. **Define** which campaigns have which content (sessions, NPCs, locations)
3. **Decide** if auto-linking (via plugin) is worth the effort
4. **Incrementally** refactor: start with one campaign's sessions
5. **Test** link graph density after Phase 1 refactor

