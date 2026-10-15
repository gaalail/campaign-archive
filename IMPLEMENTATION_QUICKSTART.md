# Tactical Implementation: Quick Start Guide

## Phase 1: Restructure Ra Gol'vek (1-2 hours)

### Step 1: Create Folder Structure

```powershell
# In content/ra-golvek/
mkdir sessions, npcs, locations, encounters, loot
```

### Step 2: Move Existing Files

```powershell
# Move any existing NPCs to npcs/, locations to locations/, etc.
# Create placeholder index files

# sessions/index.md
---
title: Sessions
---
## Ra Gol'vek Campaign Sessions

All sessions and adventures for the Ra Gol'vek campaign.

- [[Session 1 - The Ambush]]
- (add as you fill in)

# npcs/index.md
---
title: NPCs
---
## Characters of Ra Gol'vek

| Name | Role | Appearances |
|------|------|-------------|
| (auto-populate) | | |

# locations/index.md
---
title: Locations
---
## Places of Ra Gol'vek

- [[The Drunken Griffin]]
- (add locations)
```

### Step 3: Create First Session Hub

Create: `content/ra-golvek/sessions/Session 1 - The Ambush.md`

```markdown
---
title: "Session 1: The Ambush"
campaign: Ra Gol'vek
date: 2024-01-15
session_number: 1
summary: Party ambushed by goblins after tavern job.
---

## Overview

The party meets at [[The Drunken Griffin]] tavern and receives a quest from [[Tavern Keeper]].
After hearing of goblin raids, they travel to investigate.
Near the [[Goblin Camp]], they're ambushed by three [[Goblin Scout|goblin scouts]].

## NPCs

- [[Tavern Keeper]] (quest giver, has info about goblins)

## Locations

- [[The Drunken Griffin]] (starting point)
- [[Goblin Camp]] (encounter location)

## Encounters

### The Ambush

**Monsters:**
- 3x [[Goblin Scout]]

**Tactics:**
Goblins use [[Cunning Action]] to reposition.
Party defeats them with [[Magic Missile]] and [[Fireball]].

## Loot Acquired

- [[Dagger of Sharpness]] (from chief scout)
- 15 GP total

## Story Notes

- Tavern Keeper mentioned a mysterious warlord commanding the goblins
- Dagger has glowing runes; origin unknown
- Party decides to investigate further in Session 2

## Related Entries

- Campaign Hub: [[Ra Gol'vek]]
- Next Session: [[Session 2 - The Investigation]]

```

### Step 4: Enhance Existing Global Entries

Edit: `content/monsters/Goblin Scout.md`

Add to frontmatter:
```yaml
appeared_in:
  - "Ra Gol'vek: Session 1 - The Ambush"
related_spells:
  - Magic Missile
  - Fireball
  - Cunning Action
typical_loot:
  - Short Sword
  - Leather Armor
```

Add to body:
```markdown
## Campaign Appearances

- **Ra Gol'vek**: [[Session 1 - The Ambush]] (3 scouts ambush party)

## Tactics vs Spells

Vulnerable to [[Fireball]] (AoE), [[Magic Missile]] (guaranteed hit).
Uses [[Cunning Action]] for mobility.
```

Edit: `content/spells/Magic Missile.md`

Add:
```markdown
## Used In Campaigns

- **Ra Gol'vek**: [[Session 1 - The Ambush]] (vs goblins)

## Related Monsters

Effective against: [[Goblin Scout]]
```

Edit: `content/character-options/classes/Warlock.md`

Add:
```markdown
## Campaign Appearances

- **Ra Gol'vek**: [[Tavern Keeper]] (former warlock)
```

---

## Phase 2: Cross-Link NPCs and Locations (1-2 hours)

### Create NPC Hub

`content/ra-golvek/npcs/Tavern Keeper.md`

```markdown
---
title: Tavern Keeper
campaign: Ra Gol'vek
role: Quest Giver / Information Source
basedAt: The Drunken Griffin
classes:
  - Warlock (retired)
---

## Description

Gruff, trustworthy tavern owner. Knows everyone in town. Offers quests.

## Background

Former warlock; retired from adventuring. Runs the tavern.

## Campaign Appearances

- [[Session 1 - The Ambush]]: Gives quest about goblin raids
- [[Session 5 - Return to Town]]: Provides additional intel

## Related Locations

- [[The Drunken Griffin]] (runs this)

## Related NPCs

- [[Goblin Warlord]] (nemesis; the keeper warned party about him)

## Related Spells

If threatened, uses [[Eldritch Blast]].

## Notes

- Offered 25 GP reward for defeating goblins
- Hints at larger conspiracy
```

### Create Location Hub

`content/ra-golvek/locations/The Drunken Griffin.md`

```markdown
---
title: The Drunken Griffin
campaign: Ra Gol'vek
type: Tavern
proprietor: Tavern Keeper
---

## Description

Cozy tavern and inn in town. Hub of local activity.

## NPCs

- [[Tavern Keeper]] (proprietor)
- Other patrons (generic)

## Campaign Appearances

- [[Session 1 - The Ambush]]: Party meets here, receives quest

## Quests Available

- Eliminate the goblin threat (from [[Tavern Keeper]])

## Related Locations

- [[Goblin Camp]] (goblin hideout, ~1 day travel)
```

---

## Phase 3: Validate Link Density (30 min)

### Check Graph View

1. Open live site
2. Visit [[Session 1 - The Ambush]]
3. Click graph icon (right sidebar)
4. Should see:
   - Incoming links: tavern keeper, goblin scout, location, etc.
   - Outgoing links: NPCs, monsters, spells, locations
   - Backlinks panel should show multiple references

### Run Link Audit

```powershell
# Count links in session file
$content = Get-Content "content/ra-golvek/sessions/Session 1 - The Ambush.md" -Raw
$links = [regex]::Matches($content, '\[\[([^\]]+)\]\]').Count
Write-Host "Session 1 contains $links internal links"

# Should be 8-15 for a rich hub
```

---

## Phase 4: Replicate for Vyrun and Curse of Strahd (2-3 hours)

Repeat Phase 1-3 for each campaign.

Or, if campaigns are empty:

1. Create subsection structure (ready for future content)
2. Add empty index pages with clear formatting guide
3. Link from campaign hub to subsections

---

## Frontmatter Template for Easy Copying

### Session Template

```markdown
---
title: "Session X: [Title]"
campaign: [Campaign Name]
date: YYYY-MM-DD
session_number: X
---

## Overview

[Brief summary]

## NPCs

- [NPC name]

## Locations

- [Location]

## Encounters

[Monster encounters with linked names]

## Loot

- [Item]

## Story Notes

[Key events]

## Related

- Next: [[Session X+1]]
- Previous: [[Session X-1]]
```

### NPC Template

```markdown
---
title: [NPC Name]
campaign: [Campaign]
role: [Role, e.g., Quest Giver]
basedAt: [[Location]]
---

## Description

[Brief appearance/personality]

## Appearances

- [[Session X]] (context)

## Related

- Location: [[Location]]
- Related NPC: [[Other NPC]]
- Spells: [[Spell Name]]
```

### Location Template

```markdown
---
title: [Location Name]
campaign: [Campaign]
type: [Type, e.g., Tavern]
---

## Description

[Setting description]

## NPCs

- [[NPC]] (role)

## Connected Locations

- [[Other Location]]

## Appearances

- [[Session X]] (context)
```

### Monster Template (Enhanced)

```markdown
---
title: [Monster Name]
size: [Size]
creature_type: [Type]
ac: [AC]
hp: [HP]
cr: [CR]
appeared_in:
  - "Campaign: Session X"
related_spells:
  - Spell Name
typical_loot:
  - Item Name
weak_to:
  - Spell/Effect Name
---

[Standard stat block info]

## Campaign Appearances

- [[Campaign Name: Session X]]

## Loot

- [[Item 1]]
- [[Item 2]]

## Weaknesses

- [[Spell Name]]

## Related

- NPC: [[NPC Name]] (summons these)
```

---

## Linking Best Practices

### DO

✅ Link to campaign content from sessions
✅ Link to NPCs in their first appearance
✅ Link monsters/spells to campaigns using them
✅ Create index pages for subsections (all NPCs, all locations)
✅ Use descriptive link text: `[[Goblin Scout|goblins]]` not just `[[Goblin Scout]]`
✅ Bidirectional links (A → B and B → A when relevant)

### DON'T

❌ Over-link (every mention doesn't need a link)
❌ Link to incomplete stubs
❌ Create circular references without value
❌ Link to items/spells you haven't filled in yet
❌ Orphan campaign content (every entry should link to ≥1 session)

### OPTIMAL

- Session hubs: 10-15 links each
- NPCs: 5-8 links (to sessions, locations, related NPCs)
- Locations: 5-10 links (to NPCs, sessions, connected locations)
- Monsters: 5-10 links (to sessions, spells, loot, related monsters)
- Global entries (spells/items/classes): back-reference to campaigns using them

---

## Validation Checklist

After Phase 1 complete:

- [ ] Ra Gol'vek subsections exist (sessions, npcs, locations, encounters, loot)
- [ ] At least 1 session hub created with 8+ links
- [ ] Global entries (monsters, spells) enhanced with campaign context
- [ ] Quartz site builds without errors
- [ ] Graph view shows interconnected nodes (not just points)
- [ ] Backlinks appear on referenced pages
- [ ] Link density: average ≥2 per entry in campaign sections

---

## Testing: Manual Graph Walk

Start at: `[[Session 1 - The Ambush]]`

1. Click NPC → See sessions that NPC appears in
2. Click monster → See spells effective against it
3. Click spell → See classes that use it
4. Click class → See related spells
5. Click back to session

Should be able to traverse 3-5 clicks and find relevant content. If you hit dead ends, add links.

---

## Quick Wins (Do These First)

1. **Restructure Ra Gol'vek** (30 min) - Create folder structure
2. **Write 1 Session Hub** (30 min) - Session 1 with 10+ links
3. **Enhance 3 Global Entries** (30 min) - Add `appeared_in` to monsters/spells
4. **Test Build** (10 min) - Verify no errors, check backlinks

**Total: 2 hours for a functional, interconnected campaign**

---

## Expected Results After Phase 1

- Ra Gol'vek is 80% structured
- At least 50+ internal links created
- Graph view is visually richer
- Players/DMs can discover content via backlinks
- Quartz search works better with link context

Next: Replicate for Vyrun and Curse of Strahd (low effort, high impact).

