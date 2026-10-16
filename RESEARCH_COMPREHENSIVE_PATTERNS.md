# RESEARCH DEEP DIVE: D&D Archive Patterns from the Wild

This documents real-world D&D repository structures, information architecture patterns, and best practices observed across multiple implementations.

---

## PATTERNS OBSERVED

### Pattern 1: MONOLITHIC FILES vs FRAGMENTED FILES

**The "Markdown SRD" Approach (downfallx/dnd-5e-srd-markdown)**

Structure: **Single large files by section**

```
repo/
├── character-creation.md        (51KB)
├── classes.md                   (292KB)
├── spells.md                    (319KB)
├── magic-items.md               (239KB)
├── monsters.md                  (19KB)
├── monsters-A-Z.md              (506KB)
└── rules-glossary.md            (72KB)
```

**Characteristics:**
- Each conceptual section = one file
- Spells: **all 500+ spells in one .md file** (319KB)
- Classes: **all 12 classes with subclasses in one file** (292KB)
- Monsters: Organized alphabetically into one massive file (506KB)
- Total: ~1.9MB in 13 files

**Advantages:**
- Simple to understand conceptually
- Excellent for bulk search (`grep`)
- Version control is clean (git can track "spells section updated")
- Perfect for apps/APIs consuming the whole section
- No "what folder is X in?" confusion

**Disadvantages:**
- Single file updates affect entire section
- Not great for browsing individual entries on website
- Can't deeply link to specific spells without anchor fragments
- Large file commits

---

**Your Archive Structure (Fragmented Approach)**

```
content/
├── spells/
│   ├── Acid Arrow.md
│   ├── Acid Splash.md
│   ├── ...424 individual files
├── items/
│   ├── Adamantine Armor.md
│   └── ...367 individual files
├── monsters/
│   ├── Owlbear.md
│   └── ...2 files
```

**Characteristics:**
- One file per entry
- 1,036+ individual entry files
- Requires folder organization for discovery
- Direct deep-linking to each entry

**Advantages:**
- Deep-linkable (each spell has own URL)
- Scales well (adding 1 spell = 1 file, not updating a 319KB file)
- Git history is cleaner (individual entry updates)
- CMS-friendly (each entry is an independent entity)
- Better for collaborative editing

**Disadvantages:**
- Requires folder hierarchy to prevent chaos
- "Show me all spells" = must organize by level/class/type
- Navigation burden on UI layer
- More files = more git noise
- Harder for bulk search across category

---

### Pattern 2: SRD PRIMARY vs CONTENT PRIMARY

**Option A: SRD Primary (Most Repositories)**

All major repos follow this pattern:
- 5e-srd-api (REST API)
- open5e-api (Django)
- dnd-5e-srd-markdown
- Your archive

Pattern:
```
Heavy SRD Content (424 spells, 367 items, 400+ monsters)
+
Campaign/Session Content (light, usually 0-5 entries per campaign)
```

**Why:**
- SRD is the reference layer (doesn't change often)
- Campaign content is dynamic (changes per session)
- Separation of concerns
- Can publish SRD independently

---

**Option B: Campaign Primary (Obsidian Vaults, DM Tools)**

Tashas-Notes-of-Everything structure:
```
Compendium/
├── Atlas/           (campaign locations)
├── Lore/            (campaign worldbuilding)
├── NPC's/           (campaign characters)
├── Party/           (player characters)

Session Notes/      (session-by-session)
```

Pattern:
- **Focus:** Campaign narrative
- **SRD:** External reference (links OUT to D&D Beyond, hand-referenced)
- **Structure:** Organized around story, not rules

**When this works:**
- Personal DM notes
- Single campaign tracking
- Heavy worldbuilding/lore
- NOT for player-facing documentation

---

### Pattern 3: METADATA & TAGGING

**Observed Patterns:**

1. **5e-srd-api approach:**
   - JSON structure with standardized fields
   - Links between entities (class → spells → saving throws)
   - Programmatic access
   - No "incomplete" concept (API validates before serving)

2. **Your approach (YAML frontmatter):**
   - `incomplete: true/false` tagging
   - `source: SRD 5.1 | Homebrew | Corpus Angelus`
   - `appeared_in: campaign_name`
   - Optional `summary` field

3. **Obsidian vault approach:**
   - YAML frontmatter (simpler than yours)
   - Tags: `#wizard #spell #combat`
   - No completion status (either exists or doesn't)
   - Obsidian-specific metadata (dataview queries)

---

### Pattern 4: NAVIGATION & DISCOVERY

**Monolithic SRD repos (dnd-5e-srd-markdown):**
- Table of contents at top
- Search with grep
- GitHub's built-in search
- No UI layer (markdown is the UI)

**API repos (5e-srd-api, open5e):**
- Browse via API endpoints
- Filter parameters (class=wizard, level=3)
- Search endpoint
- Swagger/API documentation
- No traditional hierarchy needed

**Your archive + Quartz:**
- Folder hierarchy (matters for UI)
- View files (.base) for filtering
- Full-text search
- Cross-links via [[wikilinks]]
- **Gap:** Your hierarchy isn't optimized for discovery

---

## THE CRITICAL ISSUE IN YOUR ARCHIVE

**You're using a fragmented (one-file-per-entry) approach but treating it like a monolithic approach.**

Fragmented approach requires:
1. **Clear folder hierarchy** (spells organized by level? class? school?)
2. **Strong metadata** (so filters can work)
3. **Hub pages at each level** (so users can browse)
4. **Dynamic views** (views.base files that group entries)

Your current state:
- ✓ Folder hierarchy (mostly correct)
- ✓ Metadata added (incomplete, source, appeared_in)
- ✓ Hub pages created (spells, items, monsters)
- ✗ **But spells aren't organized by level in folder structure**
- ✗ Items aren't organized by type in folder structure
- ✗ No real filtering UI (only wikilink navigation)

---

## WHAT THE SRD DATABASES DO RIGHT

### 5e-srd-api (642 stars)

**Structure:** API-first, programmatic

```json
{
  "results": [
    {
      "index": "acid-arrow",
      "name": "Acid Arrow",
      "level": 2,
      "casting_time": "1 action",
      "range": "90 feet",
      "components": ["V", "S", "M"],
      "classes": [
        {"index": "wizard", "name": "Wizard"}
      ],
      "subclasses": []
    }
  ]
}
```

**Key insights:**
- Everything is indexed and linked
- No folder structure (API structure is metadata-driven)
- Parents can have children (class → spells)
- Filtering happens in query (not in folder navigation)

---

### dnd-5e-srd-markdown (94 stars)

**Structure:** Human-readable markdown

```markdown
# Acid Arrow

**2nd-level evocation**

**Casting Time:** 1 action
**Range:** 90 feet
**Components:** V, S, M
**Duration:** Instantaneous

*Markdown content...*
```

**Key insights:**
- Humans can read/edit it directly
- No folder hierarchy (not needed)
- Still highly searchable
- Git diffs are readable

---

### Your Archive: Hybrid Approach

You're trying to be:
- Structured like dnd-5e-srd-markdown (individual entries, searchable)
- But browseable like an API (organized by type/class)
- With CMS editing (Netlify Pages CMS)
- And deep linking (Quartz individual pages)

This is **sophisticated but requires strong architecture**.

---

## MISSING PATTERNS IN YOUR ARCHIVE

### 1. NO COMPREHENSIVE INDEXING
The big SRD databases have:
- All relationships mapped (wizard → spells)
- All reverse relationships (spell → classes that can cast it)
- No orphaned content

Your archive:
- Spells linked FROM classes (via `.base` views)
- But NOT linked back from spells TO classes
- Incomplete bidirectional graph

### 2. NO INTELLIGENT GROUPING AT ENTRY LEVEL
Databases do:
```
Spells organized by:
- Level
- School
- Class
- Component (V/S/M)
- Casting time
```

Your archive:
- Spells in flat `/spells/` folder
- Organized by name only (alphabetical when browsing)
- Hub page groups by level, but folder doesn't

### 3. NO SEARCH FILTERS
All major implementations have:
- Filter by class
- Filter by level
- Filter by type
- Full-text search

Your archive:
- Has search (Quartz full-text)
- But no faceted search
- No "show me only 3rd-level wizard spells"

### 4. NO PROGRAMMATIC ACCESS
All databases designed for:
- API consumption
- App integration
- VTT imports

Your archive:
- Built for human browser navigation only
- No JSON export
- Can't be consumed by D&D tools

---

## WHAT OTHER PROJECTS DO DIFFERENTLY

### **Obsidian Vaults (Tashas-Notes)**

Structure:
```
Sessions/          ← Time-based
Compendium/        ← Reference
  NPC's/
  Lore/
  Atlas/
```

Philosophy:
- **Campaign-centric**, not rules-centric
- Session dates are the spine (temporal organization)
- Compendium is secondary reference
- Heavy use of Obsidian linking (back-references automatic)

**Why this works for Obsidian:**
- Obsidian auto-generates backlinks
- Tag search is native
- Graph view shows relationships
- Personal knowledge management tool (DM's perspective)

**Why this doesn't work for your use case:**
- Player-facing documentation
- Needs hierarchical browsing
- Time-based organization confuses players ("what campaign am I in?")

---

### **Roll20 / D&D Beyond Model**

Implied structure:
```
Characters/           ← Primary entity
├── Sheet fields
├── Linked spells
├── Linked items
├── Linked abilities

Campaigns/            ← Container
├── Sessions/
├── Encounters/
├── NPCs/
├── Rules (campaign-specific)

SRD Reference/        ← Read-only
├── Spells/
├── Items/
├── Monsters/
```

Philosophy:
- **Entity-centric** (character is the hub)
- Character → everything else radiates from it
- Campaign is a container for sessions
- SRD is separate, read-only reference

**Why this works:**
- Players create character first
- Everything flows from character
- Natural navigation path

---

## STRUCTURAL RECOMMENDATIONS

### OPTION 1: Embrace Fragmented + Metadata

(Similar to your current approach but optimized)

```
content/
├── spells/
│   ├── by-level/
│   │   ├── cantrips/        ← Symlink or view
│   │   ├── 1st-level/
│   │   └── 2nd-level/
│   ├── by-school/           ← View
│   │   ├── evocation/
│   │   └── abjuration/
│   ├── Fire Bolt.md
│   └── (424 spell files)
```

**Requires:**
- Metadata: level, school, classes, components
- View files for each grouping
- Strong UI for filtering
- Programmatic linking

**Result:** Your current approach, but with intelligent foldering + view system

---

### OPTION 2: Adopt Monolithic Approach

```
content/
├── 01-classes.md        (all 12 classes + subclasses)
├── 02-spells.md         (all 500+ spells)
├── 03-items.md          (all 367 items)
├── 04-monsters.md       (all monsters)
├── campaigns/
│   ├── ra-golvek/       (session notes, NPCs, locations)
│   ├── vyrun/
│   └── curse-of-strahd/
```

**Advantages:**
- Search is simple (grep spells.md)
- No "lost files" problem
- Version control is clean
- Easier for new contributors

**Disadvantages:**
- 300KB+ files
- Can't link deep (no per-spell URLs)
- CMS editing is harder (edit entire section vs one entry)
- Quartz may struggle with rendering

---

### OPTION 3: Hybrid (Recommended for Your Use Case)

```
content/
├── reference/           ← SRD (monolithic or fragmented)
│   ├── spells.md        (OR spells/ folder with view system)
│   ├── items.md
│   ├── monsters.md
│   ├── classes.md
│   └── rules.md
│
├── campaigns/           ← Dynamic, player-facing
│   ├── ra-golvek/
│   │   ├── index.md
│   │   ├── sessions/
│   │   │   ├── 01-session-one.md
│   │   │   └── 02-session-two.md
│   │   ├── npcs/
│   │   ├── locations/
│   │   └── encounters/
│   ├── vyrun/
│   └── curse-of-strahd/
│
└── guides/              ← Navigation
    ├── character-builder.md
    ├── getting-started.md
    └── how-to-use-this-site.md
```

**Why this works:**
- SRD is stable (can be monolithic or fragmented, doesn't matter)
- Campaign content is clearly separate (player focuses there)
- Navigation guides are at top level
- Clear distinction: reference vs narrative

---

## COMMON MISTAKES IN D&D ARCHIVES

### Mistake 1: Conflating Content Types

Your archive mixes:
- Immutable SRD content (424 spells - rarely change)
- Dynamic campaign content (0-5 sessions/campaigns)
- Navigational content (character builder, getting started)

Real SRD databases **separate these completely**.

### Mistake 2: Weak Campaign Support

Most failed D&D wiki attempts:
- Perfect spell/item reference
- Bare-bones campaign structure
- Players can't find sessions/NPCs

Should be reversed for **player-facing** archives:
- Campaign content is primary
- SRD is reference layer

### Mistake 3: No Content Verification

Big databases have:
- Validation (every spell has required fields)
- Tests (breaking changes caught)
- Schema enforcement

Your archive:
- Some fields optional
- No validation before publish
- No broken-link detection

### Mistake 4: Abandoned Stub Content

Your archive:
- 201 incomplete entries
- No visual distinction on pages
- Players stumble onto them confused

Should be:
- Hidden from main navigation
- Marked prominently when found
- Optional to include entirely

---

## DATA PATTERNS WORTH BORROWING

### From API Repos:

**Standardized relationships:**
```yaml
Spell:
  - index: unique-id
  - name: official-name
  - level: [0-9]
  - school: evocation | abjuration | ...
  - classes: [array of class objects]
  - components: [V, S, M]
  - ranges: [feet | self | touch | sight | unlimited]
  - casting_time: [bonus action | action | reaction | ...]
  - duration: [instantaneous | concentration/minutes | ...]
  - ritual: boolean
```

**What this gives you:**
- Programmatic linking (each class knows its spells)
- Filtering (show me level 3, evocation, concentration spells)
- Validation (required fields enforced)
- API consumption (tools can read your data)

---

### From Markdown Repos:

**Searchability:**
- Consistent heading hierarchy
- Anchor links to subsections
- No vendor lock-in
- Human-readable format

---

### From Obsidian Vaults:

**Linking strategy:**
- Backlinks show "where is this referenced?"
- Tags enable discovery
- Graph view shows relationships
- Quick context (hover preview)

---

## RECOMMENDATIONS FOR YOUR ARCHIVE

### Immediate (Stop Making These Mistakes)

1. **Hide incomplete entries** from player view
   - Add CSS class for hidden entries
   - OR move to separate `/drafts/` folder
   - OR mark prominently on pages

2. **Fill or remove empty sections**
   - Campaign summaries are placeholders → fill them or hide the section
   - Rules section has 1 file → add rules or remove from nav
   - Pick one: committed or empty

3. **Implement bidirectional linking**
   - Warlock page links to warlock-spells.base ✓
   - Fire Bolt spell page should link back: "Used by: [[Warlock]], [[Wizard]], [[Sorcerer]]"
   - Every item should link to relevant classes/creatures

4. **Add search filters**
   - Implement Quartz search facets
   - "Show me only 3rd-level spells"
   - "Show me only fighter features"

### Short Term (Reorganization)

1. **Organize spells by level in folder structure**
   - Current: `spells/ → Fire Bolt.md`
   - Better: `spells/cantrips/ → Fire Bolt.md`
   - OR use view files to simulate this

2. **Organize items by type**
   - `items/weapons/ → Longsword.md`
   - `items/armor/ → Plate Armor.md`
   - `items/magic-items/ → Bag of Holding.md`

3. **Strong campaign structure**
   - Decision: are campaigns campaign-centric or session-centric?
   - Either structure deeply and fill it, or cut it

### Medium Term (Architecture)

1. **Decide: Monolithic or Fragmented?**
   - Fragmented = what you have (OK, but needs optimization)
   - Monolithic = simpler to maintain, harder to link deep
   - Either is fine, but optimize for choice

2. **Implement filtering system**
   - Views work, but UI needs improving
   - Add faceted search
   - Consider Meilisearch or Algolia if native search isn't enough

3. **Export to JSON**
   - Make your archive consumable by D&D tools
   - Adds value, attracts developers
   - Opens API possibilities

### Long Term (Evolution)

1. **Add programmatic validation**
   - CI/CD checks for required fields
   - Broken link detection
   - Spelling/grammar checks

2. **Multi-source integration**
   - Import from D&D Beyond
   - Import from D&D 2024 SRD
   - Keep campaign-specific content separate

3. **Collaborative features**
   - Suggest changes (git PRs)
   - Player contributions
   - Version history

---

## FINAL SYNTHESIS

Your archive **has the right structure conceptually** but is **missing key optimization for fragmented approach**:

**You have:**
- ✓ Folder hierarchy
- ✓ Metadata
- ✓ Hub pages
- ✓ CMS editing

**You need:**
- ✗ Intelligent grouping at folder level (spells by level, items by type)
- ✗ Bidirectional linking (entry pages should link back to categories)
- ✗ Visual distinction for incomplete content
- ✗ Strong filtering UI
- ✗ Content verification (no placeholders in production)

**This is NOT an architectural failure.** It's an optimization and polish problem. Your foundation is solid; the implementation is 70% complete.

---
