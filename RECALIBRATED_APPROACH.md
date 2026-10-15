# Recalibrated: SRD-Primary Architecture + Light Hybridization

## Revised Approach

Your repo is **correctly SRD-primary** — reference material as foundation, campaigns as supplements. The problem isn't the hierarchy; it's **linkage and discoverability**.

### Key Insight

You DON'T need:
- Deep folder nesting (sessions/, npcs/, locations/)
- Forced subsection browsing
- Hard redirects on every click

You DO need:
- **Lightweight cross-linking** (spells mention campaigns using them; campaigns reference spells)
- **Smart filtering** (search/graph by source, by type, by campaign)
- **Onboarding guidance** (new players know where to start)
- **Structured metadata** (so queries work)

---

## Architecture: Flat + Link-Rich

### Current State (Problem)

```
HOME PAGE
├─ Campaigns (5 stubs)
├─ Spells (424, orphaned)
├─ Items (367, orphaned)
├─ Classes (235, orphaned)
├─ Monsters (2, orphaned)
└─ Rules (empty)

**Problem:** Domains don't talk to each other
```

### Proposed State (Solution)

```
HOME PAGE
├─ Campaigns (with rich backlinks to rules/items/spells used)
├─ Reference (SRD-primary)
│   ├─ Classes (link to subclasses, spells, feats)
│   ├─ Spells (mention which campaigns use them)
│   ├─ Items (mention which monsters drop them)
│   ├─ Monsters (mention which campaigns feature them)
│   └─ Rules (linked to affected classes/spells)
└─ Tools
    ├─ Character Builder (guided path)
    ├─ Search (with faceting)
    └─ Graph (with filtering)

**Solution:** Same folders; rich cross-linking; smart UI
```

### What Changes (Minimal, UX-Focused)

| Component | Change | Impact |
|-----------|--------|--------|
| Folder structure | **None** (keep flat) | Easy navigation, no deep clicking |
| .pages.yml | **Add fields** (incomplete, appeared_in, etc.) | Editors can tag properly |
| Homepage | **Keep as is** | Familiar, minimal cognitive load |
| Campaign hubs | **Add "No entries yet" guidance** | DM knows where to add content |
| Entry pages | **Add metadata badges** (source, type) | New players understand context at a glance |
| Search | **Add faceting** (by Source, by Type) | Filtering works |
| Graph | **Add filtering** (campaign-only, custom-only) | Graph view becomes useful |

---

## Light Hybridization: What to Add

### Tier 1: Critical (2-4 hours)

**#1: Incomplete Field in CMS**
- Add to all forms: spells, items, monsters, char-options
- Reason: So stubs can be filtered/hidden from search

**#2: Global Source List**
- Define once: [SRD 5.1, Homebrew, Corpus Angelus]
- Reference everywhere in .pages.yml
- Reason: So search/filtering can work across domains

**#3: Monster Context Fields**
- Add: `appeared_in` (list of campaigns), `typical_loot` (list of items)
- Reason: So campaigns can track which monsters appear where

**#4: Entry Metadata Badges**
- Display on pages: Source badge (SRD | Homebrew), Type label
- Reason: New players understand context immediately

### Tier 2: High (4-6 hours)

**#5: Character Builder Landing Page**
- Flow diagram: Pick Race → Class → Subclass → Feats
- Links to each section
- Reason: Answers "how do I build a character?"

**#6: Campaign Hub Guidance**
- Show placeholder: "No sessions yet. Add one via [Pages CMS]"
- Add guidance for each entry type
- Reason: DM knows where to add content

**#7: Search Faceting**
- Add filters: Type (Spell | Item | NPC | etc.), Source (SRD | Homebrew)
- Reason: Players can find what they need

**#8: Graph Filtering**
- Add toggle: "Campaign Content Only", "Custom Content Only"
- Reason: Graph becomes useful instead of a hairball

### Tier 3: Medium (4-6 hours)

**#9: Spell/Class Bidirectional Linking**
- Class pages embed spell lists: "Warlock Spells: [[Eldritch Blast]], [[Hex]], ..."
- Spell pages mention classes
- Reason: "What spells does my class have?" has one answer

**#10: Campaign Entry Type Clarity**
- Define types in hub pages: Character, Place, Faction, Lore, Session, Item, Rules
- Add examples
- Reason: Editors know which type to use

**#11: Spell Data Standardization**
- Duration: enum (Instantaneous | 1 round | 1 minute | Concentration | etc.)
- Components: enum (V | S | M)
- Concentration: boolean
- Reason: Data becomes queryable; filtering works

---

## Why This Approach Works

### Preserves UX
- No forced clicking through folders
- Home page stays simple (Campaigns | Reference)
- Navigation is still flat and fast

### Fixes Linkage
- Spells reference campaigns using them
- Monsters show which campaigns feature them
- Classes link to relevant spells/feats

### Solves New-Player Problem
- Onboarding pages explain "where to start"
- Metadata badges (SRD | Homebrew) provide context
- Character builder guide answers "how do I build?"

### Maintains SRD-Primary Design
- Reference material still central
- Campaigns still supplements
- No restructuring; just better connections

---

## Implementation: Incremental, Low-Risk

### Week 1: Foundation (4 hours)
1. Add `incomplete` field to .pages.yml
2. Standardize source field globally
3. Add `appeared_in` to monster form
4. Add metadata badges to entry pages

**Result:** Stubs can be filtered; campaigns are trackable; sources are clear

### Week 2: Onboarding (4 hours)
1. Create Character Builder landing page
2. Update campaign hubs with guidance
3. Clarify Rules section
4. Add search faceting

**Result:** New players know where to start; search works

### Week 3: Polish (4 hours)
1. Graph view filtering
2. Spell/Class bidirectional linking
3. Spell data standardization
4. Media strategy finalized

**Result:** Discovery works; data quality improved; UX polished

---

## Files Affected: Minimal Footprint

```
quartz.config.yaml         (no changes; filters added via plugin config)
.pages.yml                 (add fields; ~20 lines)
content/index.md           (no changes)
content/*/index.md         (add guidance; ~5 lines each)
content/spells/index.md    (new; ~10 lines)
content/character-builder.md (new; ~30 lines)
content/onboarding.md      (new; ~20 lines)

Total new/modified: ~200 lines across 8 files
```

---

## Risk: Minimal

- No folder restructuring (safe)
- No breaking changes to existing pages
- New fields are optional (backward compatible)
- Metadata badges are visual only (no impact on data)

---

## Success Metrics

After Phase 1-3 complete:
- [ ] New player can answer "how do I build a character?" in <5 clicks
- [ ] Search returns 5-10 results, all relevant
- [ ] Graph view is optional (toggle on/off)
- [ ] Stubs are hidden from search
- [ ] Source badges visible on every entry
- [ ] Campaign pages show "where to add content"
- [ ] Spell/Class linking is bidirectional

---

## Next Steps

1. Review DOMINO_PROBLEMS.md (interconnected failures)
2. Approve this recalibrated approach
3. Start with Week 1 (4-hour foundation)
4. Iterate based on feedback

---

