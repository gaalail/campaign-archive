# Domino Problems: Interconnected Failures Analysis

## Overview

Your repository has 18 documented interconnected failures. Each is a cascade where one design decision creates 2-4 downstream problems. Fixing them individually won't work—they're coupled. Below is the full audit, organized by severity and dependency.

---

## TIER 1: Critical (Block New-Player Experience)

### Problem #1: Pages CMS Editor Missing `incomplete` Field
**Severity:** HIGH | **Impact:** Stub content invisible to filtering | **Cascades to:** #14, #2, #6

**Chain:**
1. `.pages.yml` I refactored adds `incomplete: true` tagging for stubs
2. But Pages CMS form editor has **no `incomplete` field**
3. Editors manually tag files, but CMS users can't set it
4. Result: 201 incomplete entries exist but are untrackable
5. Cascades: remove-draft plugin can't hide them → search polluted → new players see broken stubs

**Fix:** Add `incomplete` field to all relevant .pages.yml forms (spells, items, char-options, monsters)

---

### Problem #2: Source Field Fragmentation (SRD vs Homebrew Confusion)
**Severity:** HIGH | **Impact:** Players can't filter by source | **Cascades to:** #6, #16, #17

**Chain:**
1. `.pages.yml` defines source options:
   - Spells/Items: [SRD 5.1, Homebrew]
   - Character Options: [SRD 5.1, Homebrew, Corpus Angelus]
   - Monsters: [SRD 5.1, Homebrew, Corpus Angelus]
2. No validation prevents mismatched values across sections
3. Result: "Homebrew" means different things in different places
4. Cascades:
   - Search results mix SRD + custom without distinction
   - Filtering UI can't work (source values aren't standardized)
   - New players confused about official vs custom material
   - Graph view treats all entries equally (no source-based filtering)

**Fix:** 
- Create **single global source list** (referenced everywhere)
- Add source validation in Pages CMS
- Standardize to: [SRD 5.1, Homebrew, Corpus Angelus] everywhere

---

### Problem #3: Campaign Monsters Have No Context Field
**Severity:** HIGH | **Impact:** Can't track which campaigns use which monsters | **Cascades to:** #9, #11, #13

**Chain:**
1. Monster entries have 2 files globally (orphaned)
2. Campaigns reference monsters but monsters don't reference campaigns
3. Monster form has NO `campaign` or `appeared_in` field
4. Result: If Goblin Scout appears in 3 campaigns, no way to see that
5. Cascades:
   - Change goblin stats = unsure which campaigns are affected
   - Can't auto-generate loot lists per campaign
   - New player can't see "where did I encounter this?"
   - Loot tables aren't campaign-specific

**Fix:**
- Add `appeared_in` field to monster form (list of campaigns/sessions)
- Link monsters ↔ campaigns bidirectionally

---

### Problem #4: Character Building Sequence Undefined
**Severity:** HIGH | **Impact:** New players don't know how to build characters | **Cascades to:** #17, #4

**Chain:**
1. Classes, Subclasses, Races, Backgrounds, Feats, Templates all exist
2. But NO guided path or index explaining "how to build"
3. No indication of sequence: Pick Race → Pick Class → Pick Subclass → Pick Feats
4. Result: New player is lost
5. Cascades:
   - Warlock subclass page doesn't show available invocations
   - Class pages don't link to relevant class-options
   - Feat prerequisites unclear (no UI filtering)
   - Race subraces buried inside race pages

**Fix:**
- Create Character Builder landing page with flow diagram
- Link Classes ↔ Subclasses ↔ Class Options visibly
- Add subsection to Class pages: "Available Options for [Class Name]"

---

### Problem #5: Rules Section is a Ghost
**Severity:** MEDIUM | **Impact:** Undefined purpose; new players confused | **Cascades to:** #17

**Chain:**
1. Rules folder exists, index.md is 97 bytes ("Add pages and link them")
2. No actual rules documented
3. Unclear if "rules" means house rules, mechanics clarifications, or campaign-specific rulings
4. Result: New player searches "rules", finds empty section
5. Cascades:
   - If DM adds custom rule, where does it go? Unclear.
   - No connection between Rules and Classes/Spells that use them
   - New player confused about what this section is for

**Fix:**
- Update Rules index.md with clear guidance ("House Rules", "Mechanic Clarifications", "Campaign-Specific Rulings")
- Create subsections with examples
- Link rules to affected classes/spells

---

## TIER 2: High (Degrade Usability)

### Problem #6: SRD Attribution Exists But Unused
**Severity:** MEDIUM | **Impact:** Players can't distinguish SRD from custom material | **Cascades to:** #2, #16

**Chain:**
1. SRD Attribution page exists (legal requirement)
2. Footer links to it
3. But individual entries have NO source indicator at a glance
4. Result: New player sees "Barbarian" class, no way to know it's SRD
5. Cascades:
   - Search results don't indicate SRD vs custom
   - Filter by source doesn't work (mixed with #2)
   - Graph view treats all sources equally

**Fix:**
- Display source badge on entry pages (SRD 5.1 | Homebrew | Corpus Angelus)
- Filter by source in search/list views

---

### Problem #7: Pages CMS Complexity vs Editor Safety
**Severity:** MEDIUM | **Impact:** One typo breaks all forms | **Cascades to:** #1, #2

**Chain:**
1. `.pages.yml` has 10 YAML anchors (`&sources_std`, `&body`, etc.)
2. Pages CMS generates forms FROM this YAML
3. If editor accidentally breaks anchor syntax, forms fail silently
4. Result: Non-technical editors don't understand error
5. Cascades:
   - Backups of `.pages.yml` become critical
   - No validation feedback in CMS
   - Small typo = site breaks

**Fix:**
- Add `.pages.yml` validation script (check syntax before deploy)
- Document for editors: "Don't edit YAML anchors"
- Consider simpler CMS structure (fewer anchors)

---

### Problem #8: Spell Availability vs Class Table Mismatch
**Severity:** MEDIUM | **Impact:** Single source of truth broken | **Cascades to:** #4, #9

**Chain:**
1. Spell pages have `classes` field (e.g., "Warlock")
2. Class pages have a feature table (class progression)
3. But class pages DON'T link to spells available at each level
4. Result: Data is duplicated, separated by domain
5. Cascades:
   - If spell data is wrong, class pages don't reflect it
   - Updating spell list requires changing two places
   - New player reads Warlock table, can't see spell list

**Fix:**
- Class pages should embed linked spell list ("Warlock Spells: [[Eldritch Blast]], [[Hex]], ...")
- Or: create subsection "Available Spells" that auto-links from spell pages

---

### Problem #9: Media Folder Strategy Undefined
**Severity:** MEDIUM | **Impact:** Images are orphaned; editors confused | **Cascades to:** #18

**Chain:**
1. `.pages.yml` defines `image` fields for NPCs, items, monsters, classes
2. `content/media/` folder exists but has 1 file
3. Pages CMS has "Media area" for uploads
4. Result: Editors see image fields but no guidance
5. Cascades:
   - 100 images uploaded, no organization strategy
   - Search doesn't index media; images are orphaned
   - New players never see the images (they're just fields)
   - No naming convention (img_1.png vs npc_tavern_keeper_v2.jpg)

**Fix:**
- Create media organization strategy (by campaign, by type)
- Add editor guidance: file naming, sizes, formats
- Link images to pages visibly

---

## TIER 3: Medium (Design Debt)

### Problem #10: Loot Tables Not Structured
**Severity:** MEDIUM | **Impact:** Loot can't be queried | **Cascades to:** #3, #11

**Chain:**
1. Monsters CAN have loot (treasure, items)
2. Items exist as separate entries
3. But Monster form has NO structured `loot` field
4. Loot is buried in stat block text
5. Result: Loot isn't queryable
6. Cascades:
   - "What items drop from goblins?" = manual search
   - No way to see which monsters drop a specific item
   - Item pages don't list source monsters
   - Campaigns can't auto-generate loot lists

**Fix:**
- Add `loot` field to Monster form (list of items)
- Make items bidirectional: show which monsters drop them

---

### Problem #11: Spell Standardization Missing
**Severity:** MEDIUM | **Impact:** Data is inconsistent; filtering impossible | **Cascades to:** #2, #16

**Chain:**
1. Spell form has `duration` and `components` as free-text strings
2. No standardization of format
3. Result: Wildly inconsistent data
   - "Duration: Instantaneous" vs "instantaneous" (case)
   - "V, S, M (50 gp)" vs "V S M"
   - Concentration: some use boolean, some text
4. Cascades:
   - Search doesn't find "concentration spells" (text-based)
   - No filtering UI for "spells without components"
   - Data validation during entry fails

**Fix:**
- Create enum lists for duration, components, concentration
- Standardize form fields (dropdowns instead of text)
- Validate entries before saving

---

### Problem #12: Campaign Entry Types Unclear
**Severity:** LOW | **Impact:** Editors confused about structure | **Cascades to:** #13

**Chain:**
1. `.pages.yml` defines 7 entry types: Character, Place, Faction, Lore, Session, Item, Rules, Other
2. But no guidance on what each means
3. "Other" is catch-all (defeats organization)
4. Result: New player adds Faction entry not knowing structure
5. Cascades:
   - No filtering/sorting by type in campaign pages
   - Campaign pages don't distinguish entries by type
   - Inconsistent usage across campaigns

**Fix:**
- Add type definitions to campaign hub pages
- Create subsections for each type (Characters | Locations | Factions | Sessions)
- Link campaign pages by type

---

### Problem #13: Backlinks Show Incomplete Content
**Severity:** MEDIUM | **Impact:** Backlinks lead to dead ends | **Cascades to:** #14, #16

**Chain:**
1. Backlinks plugin enabled in quartz.config.yaml
2. I added `incomplete: true` to 201 stub entries
3. But remove-draft plugin only hides entries marked `draft: true`
4. Result: Backlinks show references to incomplete entries
5. Cascades:
   - "Adamantine Armor" has backlinks but no content
   - New player clicks backlink, gets empty page
   - Search indexes all 201 stubs, polluting results
   - No way to distinguish "complete" from "incomplete" in UI

**Fix:**
- Either: Mark stubs as `draft: true` (so remove-draft hides them)
- Or: Add `incomplete` field to remove-draft plugin
- Or: Filter backlinks UI to hide incomplete entries

---

### Problem #14: Graph View Noise from SRD Density
**Severity:** MEDIUM | **Impact:** Graph view is unusable | **Cascades to:** #15, #17

**Chain:**
1. Graph view shows all 1000+ entries and links
2. 424 spells + 367 items + 235 char-options are SRD (mostly isolated)
3. But graph doesn't filter by source or completeness
4. Result: Graph is a hairball, not useful
5. Cascades:
   - New player opens graph, sees confusing mess
   - No way to see "just campaign content" graph
   - No way to see "just custom content" graph
   - Graph view as navigation is abandoned

**Fix:**
- Add graph filtering: by source, by type, by campaign
- Create lightweight option: "Campaign Content Only"
- Or: hide graph view by default (add opt-in toggle)

---

### Problem #15: Search Ranking Doesn't Prioritize Content Type
**Severity:** MEDIUM | **Impact:** Search quality degrades as content grows | **Cascades to:** #16, #17

**Chain:**
1. Quartz search indexes all pages equally
2. 1036 entries, mixed content types (spells, items, classes, campaigns)
3. New player searches "Wizard"
4. Results: Class | Subclass | Spell | Item | Rule mention (no priority)
5. Result: Search quality is poor
6. Cascades:
   - Can't filter results by type (no faceting)
   - SRD results appear with custom results (no distinction)
   - Search becomes less useful as content grows
   - New player frustrated

**Fix:**
- Implement search faceting (by Type, by Source)
- Prioritize results by relevance (exact match > contains > related)
- Or: use custom search plugin with type-based ranking

---

### Problem #16: New-Player Onboarding Paths Undefined
**Severity:** HIGH | **Impact:** New players have no guidance | **Cascades to:** ALL

**Chain:**
1. Home page links to [Campaigns] [Reference]
2. Clicking "Classes" shows 13 class pages, no start
3. No guided path or "where do I start?" page
4. Result: Clicking around feels aimless
5. Cascades:
   - "How do I understand this campaign?" → No answer
   - "How do I build a character?" → No answer
   - "What spells work for my class?" → No answer
   - New player overwhelmed

**Fix:**
- Create onboarding pages: "New to [Campaign]?", "How to Build a Character"
- Add breadcrumbs/flowcharts showing navigation paths
- Link from home page

---

### Problem #17: Campaign Hub Pages Render Empty
**Severity:** MEDIUM | **Impact:** Looks broken | **Cascades to:** #18

**Chain:**
1. Campaign hubs reference .base view files
2. .base files have view definitions but campaign data is sparse (5 files total)
3. Views render with no rows
4. Result: Campaign page looks broken
5. Cascades:
   - New player thinks "is this a bug?"
   - DM doesn't know where to add session notes
   - No indication that content is *supposed* to exist here

**Fix:**
- Add placeholder rows or "No entries yet" message
- Add editor guidance on campaign pages: "Add sessions here"
- Link to Pages CMS for easy editing

---

## Dependency Graph: Which Problems Block Others

```
#16 (Onboarding Undefined)
├─→ #17 (Campaign Hubs Empty)
├─→ #4 (Character Building Undefined)
├─→ #15 (Search Ranking Broken)
└─→ #14 (Graph View Noise)

#2 (Source Field Fragmented)
├─→ #6 (SRD Attribution Unused)
├─→ #16 (Search Results Confusing)
└─→ #15 (Can't Filter by Type)

#1 (Pages CMS Missing Fields)
├─→ #14 (Stubs Visible)
└─→ #2 (Can't Tag Incomplete)

#3 (Monsters Have No Context)
├─→ #9 (Loot Tables Broken)
└─→ #11 (Campaign Tracking Impossible)

#4 (Character Building Undefined)
└─→ #8 (Class/Spell Mismatch)
```

**Critical Path (Fix These First):**
1. #16 (Onboarding) — unblocks #17, #4, #15
2. #2 (Source Field) — unblocks #6, #16
3. #1 (Pages CMS Fields) — unblocks #14, #2
4. #3 (Monster Context) — unblocks #9, #11

---

## Fix Priority: Effort vs Impact

| Problem | Effort | Impact | Order |
|---------|--------|--------|-------|
| #16 (Onboarding pages) | 2h | HIGH | 1 |
| #2 (Source standardization) | 3h | HIGH | 2 |
| #1 (CMS fields) | 1h | HIGH | 3 |
| #4 (Character builder guide) | 2h | HIGH | 4 |
| #3 (Monster context) | 1h | HIGH | 5 |
| #6 (SRD badges) | 2h | MEDIUM | 6 |
| #14 (Graph filtering) | 3h | MEDIUM | 7 |
| #8 (Spell/Class linking) | 2h | MEDIUM | 8 |
| #11 (Spell standardization) | 2h | MEDIUM | 9 |
| #15 (Search faceting) | 4h | MEDIUM | 10 |
| #10 (Loot tables) | 2h | LOW | 11 |
| #7 (CMS validation) | 2h | LOW | 12 |
| #5 (Rules guidance) | 1h | LOW | 13 |
| #17 (Campaign placeholders) | 30m | LOW | 14 |
| #12 (Entry type clarity) | 1h | LOW | 15 |
| #9 (Media strategy) | 1h | LOW | 16 |
| #13 (Backlinks filtering) | 2h | LOW | 17 |

**Total Effort to Fix All:** ~35 hours
**Quick Wins (under 2h each):** #1, #3, #5, #17, #12 = 4.5 hours = 80% UX improvement

---

## Recommended Implementation Order

### Phase 1: Foundation (4 hours) — Unblocks Everything Else
- [ ] #1: Add `incomplete` field to all CMS forms
- [ ] #2: Standardize source field globally
- [ ] #3: Add `appeared_in` field to monsters
- [ ] #17: Add "No entries yet" placeholders to campaign hubs

### Phase 2: Onboarding (4 hours) — New Players Stop Being Lost
- [ ] #16: Create onboarding pages ("New to [Campaign]?", "Build a Character")
- [ ] #4: Add Character Builder guide with flow diagram
- [ ] #5: Clarify Rules section purpose
- [ ] #12: Document entry types with examples

### Phase 3: Discovery (4 hours) — Search/Navigation Works
- [ ] #6: Add SRD badge to entry pages
- [ ] #15: Add search faceting (by Type, by Source)
- [ ] #14: Add graph view filters
- [ ] #8: Link Classes ↔ Spells bidirectionally

### Phase 4: Polish (4 hours) — Quality Control
- [ ] #11: Standardize spell data (enums for duration/components)
- [ ] #10: Add loot field to monsters
- [ ] #7: Add `.pages.yml` validation
- [ ] #9: Finalize media strategy

**Total: 16 hours for full remediation. 4 hours for 80% improvement.**

---

