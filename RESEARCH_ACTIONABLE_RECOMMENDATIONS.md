# COMPREHENSIVE RESEARCH SYNTHESIS: Actionable Recommendations

Based on deep research of 5+ major D&D repos, SRD databases, Obsidian vaults, and VTT architectures, here are the gaps in your archive and how to fix them.

---

## THE VERDICT

Your archive **is not fundamentally broken**. It has solid infrastructure but is missing critical optimizations for the "fragmented entry" approach you've chosen.

**Grade: B+ (Infrastructure) → C- (Information Architecture)**

You need to pick a direction and optimize for it:
1. **Lean into fragmentation** (what you have) - requires folder structure + strong metadata
2. **Go monolithic** (like SRD markdown) - simpler, but loses deep linking
3. **Hybrid approach** - SRD reference separate from campaign content

Currently you're doing #1 halfheartedly.

---

## CRITICAL GAPS (THE REAL PROBLEMS)

### GAP 1: SPELLS ARE NOT ORGANIZED BY LEVEL IN FOLDER STRUCTURE

**Current:**
```
spells/
├── Fire Bolt.md
├── Fireball.md
├── Magic Missile.md
└── (424 files alphabetically in chaos)
```

**Problem:** When a player browses the folder, they see alphabetical chaos, not organized content.

**What SRD databases do:**
- Monolithic repos: All spells in one file (searchable sections)
- API repos: Spells indexed by level + class (filter query)
- Your repo: Attempt to organize but folder doesn't reflect it

**Solution:**
```
spells/
├── cantrips/
│   ├── index.md      (hub)
│   ├── Fire Bolt.md
│   ├── Light.md
│   └── (30 cantrips)
├── 1st-level/
│   ├── index.md
│   ├── Magic Missile.md
│   └── (50+ spells)
├── 2nd-level/
│   └── (Fireball.md goes here, level 3 but same idea)
└── index.md         (main spells hub)
```

**Why this matters:**
- Folder browsing actually shows organization
- Quartz graph view shows structure
- Players can "browse spells by level" intuitively
- Deep linking still works (each spell has URL)

---

### GAP 2: ITEMS ARE NOT ORGANIZED BY TYPE

**Current:**
```
items/
├── Adamantine Armor.md
├── Bag of Holding.md
├── Longsword.md
└── (367 files alphabetically)
```

**Your index page promises organization it doesn't deliver:**
```
| Type | Purpose | Examples |
|------|---------|----------|
| Weapons | Melee & ranged | Longsword, Shortbow |
| Armor | Protection | Plate, Chain Mail |
```

But the folder structure doesn't reflect this.

**Solution:**
```
items/
├── weapons/
│   ├── melee/
│   │   ├── Longsword.md
│   │   ├── Greatsword.md
│   │   └── index.md
│   ├── ranged/
│   │   ├── Shortbow.md
│   │   └── index.md
│   └── index.md
├── armor/
├── magic-items/
├── adventuring-gear/
└── index.md
```

**Or simpler (if nesting is overkill):**
```
items/
├── weapons/      (30 files)
├── armor/        (20 files)
├── magic-items/  (40 files)
├── gear/         (200+ files)
└── index.md
```

---

### GAP 3: INCOMPLETE ENTRIES ARE UNMARKED (CRITICAL ISSUE)

**Current:**
- 201 entries have `incomplete: true`
- No visual indicator on rendered pages
- Players can't tell if information is complete

**What happens:**
- Player finds incomplete entry
- Assumes it's complete (default assumption)
- Uses wrong/incomplete information
- Blames the archive

**Solution:**
```html
<!-- Add to incomplete entry pages -->
⚠️ **This entry is incomplete.**
```

And/or:

```css
/* Mark incomplete in UI */
.incomplete {
  border-left: 4px solid orange;
  background-color: #fff8f0;
  padding: 1rem;
}

.incomplete::before {
  content: "INCOMPLETE — ";
  font-weight: bold;
  color: orange;
}
```

---

### GAP 4: NO BIDIRECTIONAL LINKING

**Current:**
- Warlock page links to warlock-spells.base ✓
- Fire Bolt spell page has no link back

**Should be:**
```
[Fire Bolt spell page]

Used by: [[Wizard]], [[Sorcerer]], [[Warlock]]
School: [[Evocation]]
```

**Why:**
- Spell page is complete (stands alone)
- Player can navigate to related pages
- Supports graph view relationships

---

### GAP 5: CAMPAIGN SECTIONS ARE SHELLS, NOT CONTENT

**Current:**
```
Ra Gol'vek/
├── index.md          (has [Add summary] placeholders)
├── (2 other files)
```

**Problem:**
- Players land on campaign page expecting content
- See form template instead
- Conclusion: "This campaign isn't set up yet"

**Either:**
```
Option A: Fill them
"Ra Gol'vek is a coastal kingdom caught between ancient curse..."

Option B: Hide them
Remove from navigation until ready
```

**But NOT:**
Keep placeholder templates visible to players.

---

### GAP 6: RULES SECTION NEARLY EMPTY (1 FILE)

**Current:**
Homepage says: "Unsure about rules? [[Rules]]"
Getting Started says: "Reference house rules"
But `content/rules/` has only index.md (+ maybe 1 file)

**Problem:**
- Broken promise
- Player goes looking, finds nothing
- Trust broken

**Solution:**
```
Either:
A) Add actual house rules (5-10 key ones)
   - How you handle crits
   - Any feat restrictions
   - Alignment rules
   - etc.

B) Remove Rules from primary navigation
   Keep it but don't advertise it
```

---

### GAP 7: MONSTERS SECTION IS A GHOST (2 FILES)

**Current:**
```
monsters/
├── Owlbear.md
└── (1 other file)
```

**Monster pages exist but:**
- Appear nowhere in navigation
- No discovery path
- Effectively hidden

**Solution:**
```
Option A: Hide it entirely (if you don't have content)
  Remove from nav, hide from search

Option B: Scaffold it
  ├── by-type/
  │   ├── humanoids/
  │   ├── beasts/
  │   ├── dragons/
  │   └── index.md
  └── by-cr/
      ├── cr-0-to-1/
      ├── cr-5-to-9/
      └── index.md

Option C: Link from campaigns
  "Monsters in Ra Gol'vek: [[Owlbear]], [[Bandit]]"
```

---

## THE REAL ARCHITECTURAL ISSUE

**You chose: Fragmented (one-file-per-entry) approach**

This requires:
1. ✓ Folder structure - YOU HAVE IT (mostly)
2. ✓ Metadata - YOU HAVE IT
3. ✓ Hub pages - YOU HAVE IT
4. ✗ **Intelligent folder organization** - YOU DON'T
5. ✗ **Bidirectional linking** - YOU DON'T
6. ✗ **Strong filtering UI** - YOU DON'T
7. ✗ **Visual distinction for incomplete content** - YOU DON'T

You're 4/7. Need to add the missing pieces or switch approaches.

---

## WHAT TO DO NOW

### Priority 1: Stop the Bleeding (This Week)

1. **Hide or fill placeholder sections**
   - Campaign summaries: fill them or hide campaigns from nav
   - Rules: add rules or remove from nav
   - Monsters: scaffold or hide
   - Pick one: committed or empty

2. **Mark incomplete entries**
   - Add visual indicator to all 201 stub entries
   - Add note: "This entry is incomplete and may be inaccurate"

3. **Hide true stubs from main navigation**
   - These should only be accessible if directly linked
   - Or not in search results

### Priority 2: Reorganize (2 Weeks)

1. **Move spells into level-based subfolders**
   ```
   spells/cantrips/, spells/1st-level/, etc.
   Create index.md files for each level
   ```

2. **Move items into type-based subfolders**
   ```
   items/weapons/, items/armor/, items/magic-items/, etc.
   Create index.md files for each type
   ```

3. **Add bidirectional linking**
   - Spell page: links to classes + schools
   - Class page: links to spells (via view file, already done)
   - Item page: links to relevant classes/monsters

### Priority 3: Polish (1 Month)

1. **Strong campaign structure**
   - Decide: campaign-first or session-first?
   - Scaffold deeply and communicate structure
   - Add sample entries showing what goes where

2. **Implement search filters**
   - Faceted search (level, school, class, type)
   - Quick filters in UI

3. **Content validation**
   - CI/CD checks for required fields
   - Broken link detection

---

## SPECIFIC FILE STRUCTURE RECOMMENDATIONS

### Recommendation: Hybrid Approach (Best for Your Case)

```
content/
│
├── index.md                    ← Homepage
├── character-builder.md        ← Guides
├── getting-started.md
├── discovery-features.md
│
├── reference/
│   ├── index.md
│   │
│   ├── classes/
│   │   ├── index.md
│   │   ├── Barbarian.md
│   │   ├── Wizard.md
│   │   └── ...
│   │
│   ├── spells/
│   │   ├── index.md           (shows all by class)
│   │   ├── cantrips/          ← KEY: organized by level
│   │   │   ├── index.md
│   │   │   ├── Fire Bolt.md
│   │   │   └── Light.md
│   │   ├── 1st-level/
│   │   │   ├── index.md
│   │   │   ├── Magic Missile.md
│   │   │   └── ...
│   │   ├── 2nd-level/
│   │   │   └── ...
│   │   └── by-school/         ← OPTIONAL: symlink or view
│   │       ├── evocation/
│   │       └── abjuration/
│   │
│   ├── items/
│   │   ├── index.md           (shows all by type)
│   │   ├── weapons/           ← KEY: organized by type
│   │   │   ├── index.md
│   │   │   ├── melee/
│   │   │   │   ├── Longsword.md
│   │   │   │   └── ...
│   │   │   ├── ranged/
│   │   │   │   ├── Shortbow.md
│   │   │   │   └── ...
│   │   │   └── index.md
│   │   ├── armor/
│   │   ├── magic-items/
│   │   └── gear/
│   │
│   ├── monsters/
│   │   ├── index.md
│   │   ├── by-type/
│   │   │   ├── humanoids/
│   │   │   ├── beasts/
│   │   │   └── ...
│   │   ├── by-cr/
│   │   │   ├── cr-0-to-2/
│   │   │   └── ...
│   │   └── (individual monster pages)
│   │
│   └── rules/
│       ├── index.md
│       ├── House Rules.md
│       ├── Clarifications.md
│       └── Campaign-Specific.md
│
├── campaigns/
│   ├── ra-golvek/
│   │   ├── index.md           (MUST have actual summary, not [Add summary])
│   │   ├── sessions/
│   │   │   ├── index.md
│   │   │   ├── 01-session-one.md
│   │   │   └── 02-session-two.md
│   │   ├── npcs/
│   │   │   ├── index.md
│   │   │   └── (NPC pages)
│   │   ├── locations/
│   │   │   ├── index.md
│   │   │   └── (location pages)
│   │   └── encounters/
│   │       ├── index.md
│   │       └── (encounter pages)
│   │
│   ├── vyrun/
│   └── curse-of-strahd/
│
└── lists/                     ← Already have this
    ├── warlock-spells.base
    ├── wizard-spells.base
    └── ...
```

**Why this structure:**

1. **Reference section** is clear (spells, items, monsters, rules)
2. **Campaigns section** is clearly separate (player focuses there)
3. **Guides** are at top level (character builder, getting started)
4. **Spells organized by level** (matches how players think)
5. **Items organized by type** (matches how players search)
6. **Campaign structure is explicit** (players know where to look)

---

## IMMEDIATE ACTIONS (This Week)

1. **Create folders:**
   ```
   spells/cantrips/
   spells/1st-level/
   spells/2nd-level/
   items/weapons/
   items/armor/
   items/magic-items/
   items/gear/
   ```

2. **Move spell files** to level-appropriate folders
   - Cantrips → cantrips/
   - 1st-level spells → 1st-level/
   - etc.

3. **Move item files** to type-appropriate folders
   - Longsword → weapons/melee/
   - Plate → armor/
   - Bag of Holding → magic-items/
   - Rope → gear/

4. **Update spells/index.md** to link to level folders
   - "Browse Cantrips" → points to spells/cantrips/index.md
   - etc.

5. **Update items/index.md** to link to type folders
   - "Browse Weapons" → points to items/weapons/index.md
   - etc.

6. **Create hub pages** for each subfolder (already know how from recent work)

7. **Mark incomplete entries** with visual indicator

8. **Fill or hide campaign/rules/monsters** sections

---

## TESTING AFTER REORGANIZATION

```bash
npm run docs

# Test these:
1. npm run build succeeds
2. No broken wikilinks [[...]]
3. Spells accessible at new paths
4. Items accessible at new paths
5. Views still work (warlock-spells.base, etc.)
6. Hub pages render correctly
7. Search still finds everything
```

---

## IF YOU DO NOTHING ELSE

Minimum viable fixes:

1. **Hide or fill campaign summaries** (30 min)
2. **Add visual marker to incomplete entries** (1 hour)
3. **Add Rules content or hide section** (1 hour)
4. **Hide or scaffold Monsters section** (30 min)

**Total: 3 hours of work**

After this, archive is "ready-ish" for players, even if not optimized.

---

## FINAL VERDICT

Your archive is **professionally structured** but **not player-ready without these fixes**:

| Issue | Severity | Current | Needed |
|-------|----------|---------|--------|
| Campaign summaries placeholder | CRITICAL | 3 empty | 3 filled or hidden |
| Rules empty | CRITICAL | 1 file | 5-10 rules or hidden |
| Incomplete entries unmarked | HIGH | 201 invisible | 201 marked |
| Spells not organized by level | HIGH | Flat folder | Level-based structure |
| Items not organized by type | HIGH | Flat folder | Type-based structure |
| No bidirectional linking | MEDIUM | One-way | Both ways |
| Monster section empty | MEDIUM | Hidden | Scaffolded or hidden |

**With these fixes: A-ready. Without: C-ready.**

---
