# WIKILINK-IN-TABLE PROBLEM: DETAILED ANALYSIS & SOLUTION

## THE PROBLEM

### What's Happening

When markdown wikilinks with pipes `[[path|label]]` appear inside markdown table cells, Quartz's markdown parser gets confused about which pipes are table delimiters and which are link syntax pipes.

### Example - Broken Pattern

```markdown
| Item | Type | Link |
|------|------|------|
| [[items/Sword|Sword]] | Weapon | Details |
| [[items/Shield|Shield]] | Armor | Details |
```

**What happens:**
- Parser sees: `| [[items/Sword|Sword]] |`
- Parser interprets the `|` inside the wikilink as a pipe delimiter
- Table structure breaks: cell becomes `[[items/Sword` and the rest misaligns
- Result: Table renders with corrupted cells or malformed links

---

## VERIFIED SCOPE: 4 INDEX TABLES

The actual table-cell collision is limited to 34 aliased wikilinks in four index files:

- `content/character-options/index.md` — 7 rows
- `content/character-options/class-options/index.md` — 7 rows
- `content/items/index.md` — 10 rows
- `content/spells/index.md` — 10 rows

Wikilinks in individual item and spell files are in prose or related-content sections, not table cells. A broad search for lines containing both pipes and wikilinks counts those unrelated lines too, so it does not support the earlier estimate of 370 affected files.

The item and spell index tables used escaped pipes inside their wikilinks, while the character-option tables used unescaped pipes. All four now use plain text in table cells and retain their navigation links immediately below each table.

---

## ROOT CAUSE ANALYSIS

### Why This Happens

Markdown table parsing works like this:

1. **Find row delimiters:** Look for `|` characters
2. **Split cells:** Everything between `|` symbols is a cell
3. **Parse cell content:** Apply inline markdown (bold, italic, **links**)

### The Collision

When a cell contains `[[path|label]]`:
- Parser sees first `|` as table delimiter
- Splits the cell prematurely
- Link syntax breaks
- Table structure corrupts

### Why Quartz "Handles It Well"

Quartz has error recovery:
- If table parsing fails, it often falls back to rendering as plain text
- Wikilinks still resolve even in broken tables (because Quartz has a separate link resolver)
- Players see broken **table formatting** but **links still work**
- This is why you said "99.9% work" — the links work, the table layout is just ugly

---

## SOLUTIONS: RANKED BY APPROACH

### Solution 1: ESCAPE THE PIPES (Cleanest for Small Tables)

**How it works:** Replace the pipe inside wikilinks with an HTML entity

**Example:**
```markdown
Before:  [[items/Sword|Sword]]
After:   [[items/Sword&#124;Sword]]
```

**Pros:**
- Links still appear in tables
- Maintains table structure
- Preserves one-line readability

**Cons:**
- Ugly and hard to maintain
- Requires HTML knowledge
- Not all markdown parsers respect it

**When to use:** Only if table layout is critical to UX

---

### Solution 2: REMOVE LINKS FROM TABLE CELLS (Recommended)

**How it works:** Move all wikilinks outside the table, keep table with plain text

**Pattern - Before:**
```markdown
| Item | Type | Description |
|------|------|-------------|
| [[items/Sword|Sword]] | Weapon | A sharp blade |
| [[items/Shield|Shield]] | Armor | Protective gear |
```

**Pattern - After:**
```markdown
| Item | Type | Description |
|------|------|-------------|
| Sword | Weapon | A sharp blade |
| Shield | Armor | Protective gear |

**Click an item:** [[items/Sword|Sword]] • [[items/Shield|Shield]]
```

**Pros:**
- Clean, readable tables
- No parsing conflicts
- Easy to maintain
- Works reliably across all markdown parsers
- Links appear right after table where players expect them

**Cons:**
- Slightly more vertical space
- Two-step discovery (table, then links)

**When to use:** Almost always. This is the safest pattern.

---

### Solution 3: CONVERT TABLES TO LISTS (Alternative)

**How it works:** Replace markdown tables with bullet lists using inline links

**Before:**
```markdown
| Class | Hit Die | Ability |
|-------|---------|---------|
| [[Wizard]] | d6 | INT |
```

**After:**
```markdown
- **[[Wizard]]** — Hit die d6, Ability INT
- **[[Sorcerer]]** — Hit die d6, Ability CHA
```

**Pros:**
- No table parsing issues
- More natural for navigation
- Links embedded naturally
- Easier to read on mobile

**Cons:**
- Less scannable than tables
- Different visual presentation
- Requires content restructuring

**When to use:** When tables have only 2-3 columns or when readability > structure

---

## SPECIFIC FILE PATTERNS

### Pattern A: Character Options Index

**File:** `content/character-options/index.md`

**Safe pattern:**
```markdown
| Option | Purpose | Choose At |
|--------|---------|-----------|
| Races | Ancestry | Creation |

**Browse character options:** [[character-options/races|Races]]
```

---

### Pattern B: Item Index

**File:** `content/items/index.md`

Individual item files do not need changes for this issue. The item-category index table uses plain text cells and has its category links below the table.

---

### Pattern C: Spell Pages

**File:** `content/spells/index.md`

Individual spell pages and level hubs do not need changes for this issue. The spell-level index table uses plain text cells and has its level links below the table.

---

## IMPLEMENTATION STRATEGY

### Implementation

Replace aliased wikilinks in each affected table with their display labels. Put the original navigation links on a line directly after the table. This preserves both the table layout and access to every destination without relying on parser-specific pipe escaping.

### Verification

Search Markdown table rows for wikilinks with aliases. The updated content should have none; wikilinks elsewhere in prose and related-content sections are unaffected.

---

## WHY THIS MATTERS FOR YOUR NEXT EXPANSION

When adding content, keep aliased wikilinks outside Markdown table rows. If a table needs navigable entries, use plain labels in its cells and put the links immediately after the table.

---

## RECOMMENDED ACTION

**Use Solution 2 (Remove Links from Table Cells) for the four affected index tables.** Their table cells now contain plain text, and each table's navigation links are preserved immediately below it. Individual item and spell pages do not need bulk edits.

---
