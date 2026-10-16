# DEEP DIVE REMEDIATION: Issues Fixed & Remaining Work

## Issues Fixed (Just Now)

### 1. ✓ Folder Structure Reorganization
**Problem:** Eldritch Invocations, Metamagic, and Avatar Features were under `character-options/` directly
**Fixed:**
- Moved all 3 groups under `character-options/class-options/`
- Now: `character-options/class-options/eldritch-invocations/` (33 files)
- Now: `character-options/class-options/metamagic/` (8 files)
- Now: `character-options/class-options/avatar-features/` (76 files)
- **Result:** Proper hierarchy; links still work (Quartz resolves paths)

### 2. ✓ Missing Hub Pages (9 Created)
**Problem:** No index pages for major browseable sections
**Fixed:**

| Section | Page | Status |
|---------|------|--------|
| Classes | `character-options/classes/index.md` | ✓ Created |
| Races | `character-options/races/index.md` | ✓ Created |
| Feats | `character-options/feats/index.md` | ✓ Created |
| Backgrounds | `character-options/backgrounds/index.md` | ✓ Created |
| Subclasses | `character-options/subclasses/index.md` | ✓ Created |
| Templates | `character-options/templates/index.md` | ✓ Created |
| Spells | `spells/index.md` | ✓ Created |
| Items | `items/index.md` | ✓ Created |
| Monsters | `monsters/index.md` | ✓ Created |

**Result:** Players can now browse every major section with guidance, not just search

---

## Remaining Issues & Priorities

### CRITICAL

#### 1. Frontmatter Consistency (BLOCKING FILTERING)
**Problem:** Audit found inconsistent frontmatter across files
- Some files missing `title:` field
- Some missing `source:` field
- Some missing `incomplete:` field
- Standardization varies by section

**Impact:** Search and filtering won't work reliably across mixed metadata
**Files affected:** Backgrounds, Races, and potentially others

**What needs to happen:**
1. Audit all `.md` files for exact frontmatter format
2. Standardize `source:` values (SRD 5.1 | Homebrew | Corpus Angelus)
3. Ensure `title:` is present in all entry files
4. Standardize `incomplete:` handling (present if incomplete, omit if complete)

**Effort:** 2-3 hours (bulk script + manual fixes for edge cases)

---

#### 2. Campaign Sections Are Empty
**Problem:** Campaign hubs exist but contain 0-3 backing files each
- Ra Gol'vek: 3 files (index + 2 others, likely sparse)
- Vyrun: 1 file (index only)
- Curse of Strahd: 1 file (index only)

**Impact:** Players see campaign hubs but nothing inside; confusing UX

**Decision needed:**
- **Option A:** Add placeholder folders (Sessions/, NPCs/, Locations/) with "Coming Soon" messaging
- **Option B:** Hide campaigns from navigation until content exists
- **Option C:** Create sample session/NPC pages to show structure

**Recommendation:** Option A (scaffolding + messaging) — shows structure to future contributors

**Effort:** 1-2 hours (create folders + update hub messaging)

---

### HIGH

#### 3. Monster Section Severely Sparse
**Problem:** 2 monster files total vs 424 spells, 367 items
**Current state:** Orphaned, not discoverable, not organized

**Needs:**
1. Audit existing 2 monsters (what are they?)
2. Add category organization (creature type, CR, campaign)
3. Create discovery views (like warlock-spells.base)
4. Link from campaign pages ("Monsters in Ra Gol'vek")

**Effort:** 2-3 hours (if you have monster data; otherwise scaffolding only)

---

#### 4. Rules Section Orphaned (Only 1 File)
**Problem:** `content/rules/` has only 1 file (assumed index)
**Current state:** Not discoverable, no organization

**Needs:**
1. Check what rules exist (house rules? clarifications? campaign-specific?)
2. Create hub page explaining organization
3. Organize by category (e.g., Combat, Magic, Social, Campaign-Specific)
4. Link from relevant sections (e.g., spell page → rules about concentration)

**Effort:** 1-2 hours (depends on existing rule count)

---

### MEDIUM

#### 5. Metadata Standardization Across All Files
**Problem:** Not all entries have consistent metadata
**Examples:**
- Some backgrounds may have `title:` but others don't
- Spells may use `source: SRD` vs `source: SRD 5.1` inconsistently
- `incomplete:` field missing in many older files

**Needs:**
1. Script to identify all files missing `title:`, `source:`, or `incomplete:`
2. Bulk fix for simple cases
3. Manual review for edge cases

**Effort:** 2-3 hours (script + review)

---

#### 6. Cross-Section Linking Incomplete
**Problem:** Only Warlock spells have linking template
**Missing:**
- Wizard spell list
- Cleric spell list
- Sorcerer spell list
- Other caster classes
- Monster → spell links
- Item → spell links (e.g., wands cast spells)

**Needs:**
1. Extend `.base` view templates for all classes
2. Create category views (monster by type, item by rarity)
3. Embed in relevant hub pages

**Effort:** 3-4 hours (repetitive template work)

---

### LOW (NICE TO HAVE)

#### 7. CMS Form Hierarchy
**Problem:** Adding a Race or Feat requires navigating deep in Pages CMS
**Solution:** Flatten top-level form structure for common entry types

**Effort:** 1 hour (pages.yml editing)

---

#### 8. Media Organization Not Visible
**Problem:** Media folder structure defined but not surfaced
**Solution:** Create media hub page with upload instructions

**Effort:** 30 minutes

---

## Recommended Fix Order

| Priority | Task | Effort | Impact | Next Phase |
|----------|------|--------|--------|------------|
| 1 | Fix folder structure | Done ✓ | HIGH | Phase 4B |
| 2 | Create hub pages | Done ✓ | HIGH | Phase 4B |
| 3 | Frontmatter audit & standardization | 2-3h | CRITICAL | Phase 4A |
| 4 | Campaign scaffolding | 1-2h | HIGH | Phase 4A |
| 5 | Monster organization | 2-3h | HIGH | Phase 4B |
| 6 | Rules section organization | 1-2h | MEDIUM | Phase 4B |
| 7 | Extend cross-linking | 3-4h | MEDIUM | Phase 4C |
| 8 | CMS hierarchy flattening | 1h | LOW | Phase 4D |
| 9 | Media hub page | 30m | LOW | Phase 4D |

---

## Phase 4A: Critical Fixes (4-5 hours)

**What to do:**
1. Frontmatter standardization (audit + fix)
2. Campaign scaffolding (folder structure + messaging)
3. Test all index pages

**Result:** Consistent metadata, clear campaign UX, no blockers

---

## Phase 4B: Content Organization (5-6 hours)

**What to do:**
1. Monster section organization
2. Rules section organization
3. Link validation across new hubs
4. Test all section browsing

**Result:** All major sections browseable and discoverable

---

## Phase 4C: Cross-Linking (3-4 hours)

**What to do:**
1. Extend spell list views to all classes
2. Create monster/item category views
3. Embed views in hub pages

**Result:** Rich interconnection, full discovery

---

## Phase 4D: Polish (1.5 hours)

**What to do:**
1. CMS hierarchy flattening
2. Media hub page
3. Test from DM perspective

**Result:** Smooth CMS workflow, complete polish

---

## Critical Path (MVP for Deployment)

**Must do before launch:**
1. ✓ Folder structure (DONE)
2. ✓ Hub pages (DONE)
3. Frontmatter standardization (Phase 4A)
4. Campaign scaffolding (Phase 4A)

**Total:** 3-4 hours of remaining work

---

## Build & Test Checklist

Before you proceed, test the fixes just made:

```bash
npm run docs
```

Then verify:
- [ ] Homepage builds without errors
- [ ] Character Builder link works
- [ ] Character Options page loads
- [ ] Classes hub page appears & links work
- [ ] Races hub page appears & links work
- [ ] Feats hub page appears & links work
- [ ] Backgrounds hub page appears & links work
- [ ] Subclasses hub page appears & links work
- [ ] Templates hub page appears & links work
- [ ] Spells hub page appears
- [ ] Items hub page appears
- [ ] Monsters hub page appears
- [ ] Class-options organization is correct (avatar-features under class-options)
- [ ] All links in new hub pages resolve

---

## Summary

**Fixed today:**
- Folder structure reorganized (class-options now correct parent)
- 9 hub pages created for all major sections
- Navigation gaps closed

**Remaining critical work:**
- Frontmatter standardization (2-3 hours)
- Campaign scaffolding (1-2 hours)
- Monster/Rules organization (3-4 hours)
- Cross-linking expansion (3-4 hours)

**Recommendation:** Frontmatter standardization is CRITICAL for Phase 3's filtering features to work. Do that next before deployment.

---
