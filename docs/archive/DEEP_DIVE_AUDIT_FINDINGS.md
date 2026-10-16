# DEEP DIVE AUDIT: Issues & Optimization Opportunities

## Critical Issues Found

### 1. Missing Index Pages (STRUCTURE)
**Severity: HIGH** — Impacts discoverability and navigation

Missing hub/index.md files for character-options subdirectories:
- `content/character-options/backgrounds/index.md` ✗
- `content/character-options/classes/index.md` ✗
- `content/character-options/feats/index.md` ✗
- `content/character-options/races/index.md` ✗
- `content/character-options/subclasses/index.md` ✗
- `content/character-options/templates/index.md` ✗

**Impact:** Players can't browse these sections via hub pages; discoveryis fragmented

**Fix:** Create index.md for each subdirectory with category-specific guidance

---

### 2. Metadata Completeness (CRITICAL)

#### Pages missing frontmatter entirely:
- `character-builder.md` (has frontmatter block, but search shows MISSING — verify format)
- `discovery-features.md`
- `getting-started.md`
- `srd-attribution.md`
- All backgrounds files in `content/character-options/backgrounds/`

**Root cause:** These files were created with markdown "---" title markers but NOT with proper YAML frontmatter

**Example bad format:**
```markdown
---
title: Discovery Features
---
```

**Should be:**
```yaml
---
title: Discovery Features
---
```

Wait — actually, those ARE correct. The issue is likely that the regex is looking for `^title:` (start of line), but the files have different formatting.

**Action:** Audit exact frontmatter format across all files

---

### 3. Unbalanced Content Distribution (STRUCTURE)

| Section | Files | Status |
|---------|-------|--------|
| Spells | 424 | Heavy SRD content |
| Items | 367 | Heavy SRD content |
| Character Options | 239 | Mixed |
| Monsters | 2 | **SEVERELY SPARSE** |
| Rules | 1 | **EMPTY** |
| Ra Gol'vek | 3 | **EMPTY** |
| Vyrun | 1 | **EMPTY** |
| Curse of Strahd | 1 | **EMPTY** |

**Issue:** Campaign sections are still placeholders; no actual session data, NPC entries, or location guides

**Impact:** Players can't see campaign content progression; hub pages are orphaned without backing entries

---

### 4. Missing Category-Specific Hub Pages

**Currently have index.md in:**
- ✓ `character-options/index.md`
- ✓ `character-options/class-options/index.md`
- ✓ Spells (implied via views)
- ✓ Items (implied via views)

**Missing for character-option sub-categories:**
- ✗ `character-options/classes/index.md` — should explain class selection
- ✗ `character-options/races/index.md` — should explain race/subrace mechanics
- ✗ `character-options/feats/index.md` — should explain feat prereqs/level-up timing
- ✗ `character-options/backgrounds/index.md` — should explain background purpose
- ✗ `character-options/templates/index.md` — should explain template mechanics
- ✗ `character-options/subclasses/index.md` — should explain subclass levels/specialization

**Monsterss and Rules:**
- ✗ `monsters/index.md` — no overview, no organization
- ✗ `spells/index.md` — no overview
- ✗ `items/index.md` — no overview

---

### 5. Orphaned Navigation Gaps

**Problems identified:**

1. **Character-options/index.md** references these sections but they lack hub pages:
   - Classes → [[Classes]] (has page, but no sub-index)
   - Races → [[Races]] (has page, but no sub-index)
   - Feats → [[Feats]] (has page, but no sub-index)
   - Backgrounds → [[Backgrounds]] (has page, but no sub-index)
   - Templates → [[Templates]] (has page, but no sub-index)

2. **Cross-section discovery is weak:**
   - Spells don't reference which classes use them comprehensively
   - Monster pages exist but aren't discoverable (only 2 files)
   - Rules section is orphaned with no entry-to-rule linking

3. **Campaign sections are disconnected:**
   - Hub pages exist but have no session/NPC/location backing
   - Players can't browse campaign entries (hub tables are empty)
   - No indication that campaigns are "in progress" vs "empty"

---

### 6. .pages.yml Configuration Gaps

**Issues found:**

1. **Missing entry collection for Monsters:**
   - Monsters folder exists but isn't fully exposed in Pages CMS
   - Form structure exists but may not be optimal

2. **Spells/Items/Monsters missing README or intro pages:**
   - No entry point explaining "what makes a good spell entry"
   - No guidance on which fields are required vs optional
   - No examples

3. **Character-options subcategories not exposed as top-level CMS entries:**
   - Users have to navigate deep to add a race/feat/background
   - Could be flatter for better UX

---

### 7. Consistency Issues Across Entry Types

**Frontmatter field variations:**
- Some entries have `incomplete: true`
- Some have `incomplete: false`
- Some are missing `incomplete` entirely
- Some have `source: SRD 5.1`, others `source: Homebrew`, some missing `source`

**Impact:** Search/filtering won't work reliably across mixed metadata

---

## Optimization Opportunities

### 1. Create Missing Hub Pages (High Priority)
**Files to create:**
```
content/character-options/classes/index.md
content/character-options/races/index.md
content/character-options/feats/index.md
content/character-options/backgrounds/index.md
content/character-options/subclasses/index.md
content/character-options/templates/index.md
content/spells/index.md
content/items/index.md
content/monsters/index.md
```

Each should include:
- Purpose/description
- How many entries
- Quick start tips
- Links to related sections
- Browse tables or links to views

### 2. Audit & Standardize Frontmatter
**Action items:**
- Verify all `.md` files have proper YAML frontmatter
- Standardize `source:` field values (SRD 5.1 | Homebrew | Corpus Angelus)
- Ensure `incomplete:` field consistency (boolean or omitted for complete)
- Add missing `title:` fields

### 3. Campaign Section Reality Check
**Current state:**
- Ra Gol'vek: 3 files (2 stubs, 1 index)
- Vyrun: 1 file (index only)
- Curse of Strahd: 1 file (index only)

**Options:**
- A) Create placeholder structure (folders: sessions/, npcs/, locations/, encounters/)
- B) Update hub pages to indicate "Campaign content coming soon"
- C) Add sample session pages to show players how to browse once content exists

### 4. Expose Monsters as First-Class Citizens
**Current:** 2 lonely monster files
**Should be:**
- Hub page with organization
- CMS form fully optimized
- Link integration (monsters → spells they cast, items they drop, campaigns they appear in)

### 5. Cross-Section Linking Infrastructure
**Add view files (like `warlock-spells.base`):**
- `class-spells/` folder with one view per class
- `monster-by-type/` folder organizing by creature type
- `item-by-rarity/` folder organizing items
- Embed these in class/section hub pages

### 6. Pages CMS Form Hierarchy
**Flatten navigation for common tasks:**
- Make "Add Race" direct from top-level, not buried in Character options
- Same for "Add Feat", "Add Background"
- Keep structure hierarchy on website, but simplify CMS top-level

---

## Issues by Impact

### CRITICAL (Blocks Use)
1. Missing index pages for character-options subdirectories
2. Campaign sections empty (players see nothing)
3. Frontmatter inconsistency (breaks filtering/search)

### HIGH (Degrades UX)
4. Monsters not discoverable (only 2 files, no hub)
5. No spells/items/monsters overview pages
6. Rules section orphaned

### MEDIUM (Polish)
7. Cross-section linking incomplete (spell/class only)
8. CMS form hierarchy deep for common entries
9. Campaign "empty" state not handled gracefully

### LOW (Nice to Have)
10. Media organization not visible yet
11. No examples in form guidance
12. No "draft" vs "complete" visual indicator

---

## Recommended Action Plan

### PHASE 4A: Missing Hub Pages (2-3 hours)
1. Create index.md for: classes, races, feats, backgrounds, subclasses, templates
2. Create index.md for: spells, items, monsters
3. Update each with appropriate structure and linking

### PHASE 4B: Frontmatter Standardization (1 hour)
1. Audit all .md files for frontmatter format
2. Fix any missing title:/source: fields
3. Standardize incomplete flag

### PHASE 4C: Campaign Content Scaffolding (1 hour)
1. Decide: placeholder structure vs "content coming" messaging
2. Update campaign hub pages accordingly
3. Test player discovery

### PHASE 4D: Cross-Linking Expansion (2 hours)
1. Add view files for other classes (Wizard, Cleric, Sorcerer, etc.)
2. Create monster organization views
3. Create item rarity views

---

## Priority Matrix

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| Create hub pages | HIGH | 2-3h | 1 |
| Fix frontmatter | HIGH | 1h | 2 |
| Campaign scaffolding | HIGH | 1h | 3 |
| Extend spell linking | MEDIUM | 2h | 4 |
| Monster views | MEDIUM | 1h | 5 |
| CMS hierarchy | LOW | 2h | 6 |

---

## Summary

The architecture is solid, but there are **structural gaps** and **consistency issues** that need addressing:
- **Missing hub pages** for 9 key sections
- **Frontmatter inconsistency** preventing reliable filtering
- **Campaign sections are shells** without backing content
- **Monsters and Rules** are orphaned from discovery

These aren't blockers for deployment, but they're clear quality issues that should be addressed before scaling further.

---
