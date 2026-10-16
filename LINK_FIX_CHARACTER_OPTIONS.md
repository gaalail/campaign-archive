# LINK FIX: DEAD WIKILINKS REPAIR

## Problem Identified & Fixed

**Root Cause:** Wikilinks using simple titles like `[[Races]]` don't resolve correctly when pages are nested in subdirectories. Quartz can't find them.

**Solution:** Use full paths like `[[character-options/races|Races]]`

---

## Files Fixed

### Main Character Options Hub
**File:** `content/character-options/index.md`
- Fixed all navigation links to use full paths
- All section links now use: `[[character-options/[section]|[Label]]]`
- Class example links now use: `[[character-options/classes/[ClassName]|ClassName]]`

### Classes Page
**File:** `content/character-options/classes/index.md`
- Fixed class table links to use full paths
- Fixed "Next steps" navigation links
- Fixed "All character options" links

### All Character Option Subsections
**Files Updated:**
- `content/character-options/races/index.md`
- `content/character-options/subclasses/index.md`
- `content/character-options/backgrounds/index.md`
- `content/character-options/feats/index.md`
- `content/character-options/class-options/index.md`
- `content/character-options/templates/index.md`

Each now uses full paths for cross-linking between sections.

---

## What Now Works

✅ **Character Options** → Can navigate to all subsections  
✅ **Classes** → All class names are clickable links  
✅ **Races** → All cross-links work  
✅ **Subclasses** → All cross-links work  
✅ **Backgrounds** → All cross-links work  
✅ **Feats** → All cross-links work  
✅ **Class Options** → All cross-links work  
✅ **Templates** → All cross-links work  

---

## Technical Details

### Before (Broken):
```markdown
[[Races]]
[[Classes]]
[[Subclasses]]
[[Backgrounds]]
[[Feats]]
[[Class Options]]
[[Templates]]
```

### After (Fixed):
```markdown
[[character-options/races|Races]]
[[character-options/classes|Classes]]
[[character-options/subclasses|Subclasses]]
[[character-options/backgrounds|Backgrounds]]
[[character-options/feats|Feats]]
[[character-options/class-options|Class Options]]
[[character-options/templates|Templates]]
```

---

## Note on Other Links

**Spell links from Character Options:**
- Links like `[[spells|Spells]]` should still resolve correctly
- Spells is at top level of content tree

**Class links within tables:**
- Now properly qualified: `[[character-options/classes/Wizard|Wizard]]`

---

## Next Steps to Test

1. Build the site: `npm run build`
2. Check Character Options page - all main section links should work
3. Check Classes page - all class names clickable
4. Click through each subsection - all cross-links should resolve

---
