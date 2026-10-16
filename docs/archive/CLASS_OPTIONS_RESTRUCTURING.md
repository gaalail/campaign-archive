# Class Options Restructuring: Phase 2.5 (Interlude)

## The Problem

**114 class-option files** in a single flat folder, organized by nothing:
- **Eldritch Invocations** (32 Warlock options) mixed with
- **Metamagic** (7 Sorcerer options) mixed with
- **Avatar Features** (75 Paragon + Order options)

**Result:** Chaos. Players can't find their options. DMs can't scan by class. It's just... a wall of file names.

---

## What Class Options Are

These are **choice mechanics** — things players pick at certain levels:
- **Warlock Invocations** (pick at levels 2, 5, 7, 9, etc.)
- **Sorcerer Metamagic** (pick at levels 3, 10, 17)
- **Paragon Avatar Features** (pick at certain levels)
- **Order-specific options** (for Paragon orders)

Currently they're **all in one dump**, searchable only by filename.

---

## Solution: Organize by Group

Instead of flat:
```
class-options/
├─ Agonizing Blast.md
├─ Careful Spell.md
├─ Avatar of the Divine.md
├─ ...114 more files...
```

Reorganize into subsections:
```
class-options/
├─ index.md (overview + links to each group)
├─ eldritch-invocations/
│   ├─ index.md (Warlock invocations hub)
│   ├─ Agonizing Blast.md
│   ├─ Armor of Shadows.md
│   └─ ...30 more...
├─ metamagic/
│   ├─ index.md (Sorcerer metamagic hub)
│   ├─ Careful Spell.md
│   └─ ...6 more...
└─ avatar-features/
    ├─ index.md (Avatar features hub)
    ├─ Avatar of the Divine.md
    └─ ...73 more...
```

---

## Benefits

1. **Visual hierarchy** — Players scan by group, not by filename
2. **Landing pages** — Each group has an index explaining what they are
3. **Filtered browsing** — "Show me all Warlock invocations" works
4. **Discoverable** — New players understand there ARE options
5. **Maintainable** — DMs can add/edit by group

---

## Implementation Strategy

### Option A: Folders + Index Pages (RECOMMENDED)
- Create 3 subfolders (eldritch-invocations, metamagic, avatar-features)
- Move files into appropriate folders
- Create index.md for each group explaining the options
- Create .base view files for each group (for Pages CMS display)

**Pros:** Visual hierarchy, natural browsing, DMs know where to add
**Cons:** Slight folder depth (but not deep—just 1 level)

### Option B: Single Folder + Mega-Index
- Keep files flat
- Create index.md that groups and filters them
- Add visual hierarchy only in UI

**Pros:** No file movement
**Cons:** Still chaotic on filesystem; only helps via search

### Option C: Pages CMS Grouping Only
- Keep files flat
- Update .pages.yml to show filtered views by group
- Let CMS handle the organization

**Pros:** No file movement
**Cons:** Doesn't help browser/filesystem discovery

---

## Recommendation

**Use Option A (Folders + Index Pages)**

Why:
1. Most discoverable
2. Natural navigation
3. DMs understand structure immediately
4. Enables future filtering
5. Works with flat-file philosophy (keeps hierarchy light)

**Minimal disruption:**
- Just one level of subfolders
- All existing links still work (Quartz resolves `[[Agonizing Blast]]` regardless of folder depth)
- No YAML changes needed
- No config changes needed

---

## Files to Create/Modify

### New Folders
```
content/character-options/
├─ eldritch-invocations/          (NEW)
├─ metamagic/                     (NEW)
└─ avatar-features/               (NEW)
```

### New Index Pages
```
content/character-options/class-options/index.md (REWRITE)
content/character-options/eldritch-invocations/index.md (NEW)
content/character-options/metamagic/index.md (NEW)
content/character-options/avatar-features/index.md (NEW)
```

### Moved Files
```
114 files in class-options/ → move into appropriate subfolder
```

---

## Expected Result

**Before:**
```
Player: "I'm a Warlock, what options do I have?"
→ Searches "class options"
→ Sees wall of 114 filenames
→ Doesn't know which are for Warlocks
→ Gives up
```

**After:**
```
Player: "I'm a Warlock, what options do I have?"
→ Clicks "Class Options"
→ Sees clear groups: Eldritch Invocations, Metamagic, Avatar Features
→ Clicks "Eldritch Invocations"
→ Sees 32 Warlock-specific options
→ Finds what they need in seconds
```

---

## Timeline

**Option A (Recommended):** 2-3 hours
- Create folders and index pages
- Move 114 files
- Test links
- Update navigation

**Fits into:** Early Phase 3, BEFORE graph view filtering

---

## Interlude Structure

**Currently:** Phase 1 ✓ + Phase 2 ✓ + This Interlude (TBD)
**Then:** Phase 3 (Discovery)

Or integrate into Phase 3 as "Reorganization + Discovery".

---

## Should We Do This?

**YES.** This is a **quick win** (2-3 hours) that dramatically improves **discoverability** and **prevents future chaos**. As your archive grows, class options will be a pain point unless organized now.

**Timing:** Before Phase 3 discovery features, so graph view can benefit from organized structure.

---

## Next Steps

1. Approve Option A (or suggest alternative)
2. I'll create folders and index pages
3. Move 114 files
4. Test navigation
5. Resume Phase 3

---
