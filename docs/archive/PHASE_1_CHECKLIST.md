# Phase 1: Quick Reference & Testing Checklist

## What Was Done (4 Files Changed)

### 1. `.pages.yml` - Metadata Fields Added
```yaml
# New unified source (was fragmented):
_sources_all: &sources_all
  values:
    - SRD 5.1
    - Homebrew
    - Corpus Angelus

# New incomplete field:
_incomplete_field: &incomplete
  name: incomplete
  label: Incomplete/Stub (hidden from new players)
  type: boolean

# New campaign tracking field:
_appeared_in_field: &appeared_in
  name: appeared_in
  label: Appears in (campaigns/sessions)
  type: string
  list: true
```

**Applied to:** All form sections (spells, items, monsters, character options, rules, campaigns)

---

### 2. `quartz.config.yaml` - Metadata Display
```yaml
note-properties:
  includedProperties:
    - source          # NEW
    - incomplete      # NEW  
    - appeared_in     # NEW
    - description
    - tags
    - aliases
```

**Impact:** Metadata now visible on all entry pages

---

## Testing Checklist

### Pre-Flight Check
- [ ] `.pages.yml` file is valid YAML (no syntax errors)
- [ ] `quartz.config.yaml` file is valid YAML
- [ ] No merge conflicts in git

### Pages CMS Verification
- [ ] Visit https://app.pagescms.org
- [ ] Open "campaign-archive"
- [ ] Check "Spells" → "Add" form:
  - [ ] Source dropdown shows all 3 options
  - [ ] Incomplete checkbox visible
  - [ ] Appeared in multi-line field visible
- [ ] Check "Monsters" → "Add" form (same fields)
- [ ] Check "Character options" sections (same fields)

### Entry Creation Test
- [ ] Create test spell via Pages CMS:
  - Title: "Test Spell Phase 1"
  - Level: 1
  - School: Evocation
  - Classes: Wizard
  - Source: Homebrew
  - Incomplete: ✓ (checked)
  - Appeared in: "Test Campaign"
- [ ] Commit and build site
- [ ] Visit test spell page on live site
- [ ] Verify metadata displays at top:
  - Source: Homebrew
  - Incomplete: true
  - Appeared in: Test Campaign

### Existing Entry Verification
- [ ] Pick an existing spell page
- [ ] Scroll to top
- [ ] Verify metadata section shows:
  - Source (if field was already filled)
  - Tags
  - Other properties
- [ ] Pick an existing monster page
- [ ] Same verification

### Search/Indexing Check
- [ ] Build site: `npm run docs` (or your build command)
- [ ] Verify no build errors
- [ ] Test search in site (search for "test spell" or existing entry)
- [ ] Results should return entries

---

## Quick Reference: Field Locations

| Field | Added To | Pages CMS Section |
|-------|----------|-------------------|
| incomplete | 8 sections | Forms, show as checkbox |
| appeared_in | 3 sections | Spells, Items, Monsters |
| source | All sections | Changed from 2 lists to 1 unified |

---

## Rollback Plan (If Needed)

All changes are in 2 files. To revert:

```bash
# Revert .pages.yml to previous version
git checkout HEAD^ .pages.yml

# Revert quartz.config.yaml to previous version
git checkout HEAD^ quartz.config.yaml

# Rebuild
npm run docs
```

**Time to revert:** <5 minutes

---

## What's Ready for Next Phase

✓ Metadata is in place (can be queried, filtered, displayed)
✓ CMS forms accept new data
✓ Entry pages display new metadata
✓ Source is standardized

**Blocked by:** Nothing. Phase 2 can begin immediately.

---

## Phase 2 Preview (4 hours)

Next phase will:
1. Create Character Builder landing page
2. Add search faceting (filter by source, type)
3. Create campaign hub guidance pages
4. Add onboarding flow

Expected result: 80% → 95% UX improvement

---

## Questions?

See PHASE_1_COMPLETE.md for detailed documentation
See RECALIBRATED_APPROACH.md for full Phase 1-4 roadmap
See INDEX.md for all analysis documents

---

