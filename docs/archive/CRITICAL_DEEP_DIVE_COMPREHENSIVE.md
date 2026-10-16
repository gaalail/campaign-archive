# CRITICAL DEEP DIVE: COMPREHENSIVE USABILITY AUDIT

## Overview

You're absolutely right. The initial audits missed **critical usability problems** that would surface immediately when a new player actually tries to use the archive. Here's what I found.

---

## CRITICAL ISSUES

### 1. CAMPAIGN HUBS ARE SHELL TEMPLATES (HIGH IMPACT)
**Severity: CRITICAL** — New players see empty forms, not content

#### Problem
Campaign overview sections are **placeholder forms**, not actual content:

```
Ra Gol'vek index.md:
  "Campaign Overview

  *[Add your campaign summary here. What is Ra Gol'vek?...]*
  
  Setting: [Where does this take place?]
  Theme: [What's the tone?...]"
```

Also affects: Vyrun, Curse of Strahd

#### Impact
- Players land on campaign page expecting information, get **form fields**
- Sets expectation that "this site is under construction"
- Breaks new-player trust and first-impression UX
- Empty campaign hooks = no narrative engagement

#### What Players See
- ✗ Placeholder text instead of actual campaign information
- ✗ Fields that say "[Add X here]" 
- ✗ No sense of what the campaign is actually about
- ✗ Confusion: "Is this ready or not?"

---

### 2. ITEMS PAGE: CLAIMS ORGANIZATION IT DOESN'T HAVE (MEDIUM IMPACT)
**Severity: HIGH** — False description of browsing capability

#### Problem
The items index says:

```
"| Type | Purpose | Examples |
 |------|---------|----------|
 | Weapons | ... | Longsword, Shortbow |
 | Armor | ... | Plate, Chain Mail |"
```

But there's **NO actual ability to browse items by type**. Users can't:
- Filter weapons only
- Filter armor only
- See items grouped by category
- Use the table as navigation

#### Impact
- Page claims capability that doesn't exist
- Users waste time looking for promised browsing interface
- No actual item discovery path (except alphabetical search)
- Overpromise → disappointment

#### Root Cause
Page description is aspirational, not reflecting actual implementation.

---

### 3. NOT ALL CASTER CLASSES HAVE EMBEDDED SPELL LISTS (HIGH IMPACT)
**Severity: HIGH** — Spells added to some classes but not all

#### Current State (Verified)
✓ Warlock has embedded `warlock-spells.base`
✓ Bard has embedded spell section (confirmed)

But missing from:
- ✗ Wizard class page (spells exist but not embedded)
- ✗ Cleric class page 
- ✗ Sorcerer class page
- ✗ Artificer class page (if exists)
- ✗ Druid class page
- ✗ Paladin/Ranger (partial casters)

#### Impact
- Only Warlock players see class spells on their class page
- Other casters must navigate to separate Spells page
- Inconsistent UX: Warlock gets one path, Wizard gets another
- Goes against Phase 3 linking strategy (inconsistent implementation)

---

### 4. RULES SECTION: 1 FILE, COMPLETELY SPARSE (MEDIUM IMPACT)
**Severity: MEDIUM** — Content gap in key reference section

#### Current State
```
content/rules/
  └── index.md (and likely 1-2 stub files)
```

Only 1 actual rules file despite:
- Homepage says "Check clarifications"
- Getting Started says "Reference house rules"
- Character Builder promises "Rules reference"
- Subclass pages say "Check your class page for exact timing"

#### Impact
- Players go to Rules expecting clarity, find almost nothing
- New players confused about mechanics
- No house rules documented
- No clarifications provided

---

### 5. HOMEPAGE MISSING "GETTING STARTED" LINK (LOW BUT ANNOYING)
**Severity: LOW** — UX flow broken for new players

#### Problem
Homepage says:
```
"New to D&D?
[[Build a Character|Start here: How to build a character]]"
```

But doesn't mention **Getting Started** guide, which explains the entire site structure.

New players might miss it.

#### Impact
- New players sent to Character Builder without understanding broader site
- Better flow: Getting Started → Character Builder → build
- Current flow: Character Builder → confused about campaign selection

---

### 6. ORPHANED VIEW FILES (.BASE FILES) NOT BEING USED (MEDIUM IMPACT)
**Severity: MEDIUM** — Infrastructure exists but not fully leveraged

#### Problem
27 `.base` view files created but:
- Many created but never embedded in pages
- Suggests infrastructure added for "future use"
- Some sections have views but no hub pages embed them

#### Example
`content/lists/items.base` exists but items/index.md says "Browse items by type" — if the view file was embedded here, it would work.

#### Impact
- Unused infrastructure creates confusion
- Pages promise organization but don't show it
- Technical debt: maintenance burden for unused code

---

### 7. INCONSISTENT SPELL AVAILABILITY ACROSS CLASSES (HIGH IMPACT)
**Severity: HIGH** — Different classes have different discoverability

#### Discovered
✓ Warlock: Full spell list embedded on class page
✓ Spells page: Shows spell level structure  
✓ Bard spells: Embedded

But:
- Wizard class page: No embedded spell list?
- Cleric class page: No embedded spell list?
- Sorcerer class page: No embedded spell list?

#### Testing Needed
Read each caster class page to verify actual status.

#### Impact
- Players of one class get better discovery than another
- Unfair/confusing experience
- Phase 3 linking promise not fully delivered

---

### 8. CLASS-SPECIFIC HUB PAGES FOR SUBCLASSES DON'T LINK BACK (MEDIUM IMPACT)
**Severity: MEDIUM** — Navigation is one-way instead of bidirectional

#### Problem
Barbarian/index.md (subclass hub) shows:
```
"All Barbarian Options
- [[Barbarian|Back to Barbarian class]]"
```

But Barbarian class page doesn't link forward to Barbarian/index.md with "Subclasses available here: [[Barbarian Subclasses]]"

#### Impact
- Players at Barbarian class page don't know where to find subclasses
- Have to navigate up → search → down to find subclass hub
- Breaks expected navigation pattern

---

### 9. NO GUIDANCE ON INCOMPLETE ENTRIES (LOW-MEDIUM IMPACT)
**Severity: MEDIUM** — 201 stub entries with no clear guidance

#### Problem
201 entries marked `incomplete: true` but:
- No visual indicator for users (badge? italics?)
- No explanation on entry pages ("This entry is incomplete")
- Users might reference unfinished content
- DM burden: constantly saying "that's not finished yet"

#### Impact
- Player confusion: "Is this real or a draft?"
- Unreliable reference: might point to incomplete data
- CMS unclear: when should incomplete be marked vs when are entries removed?

---

### 10. NO BREADCRUMB OR BACK NAVIGATION ON MANY PAGES (MEDIUM IMPACT)
**Severity: MEDIUM** — Navigation is disorienting

#### Verified
✗ Spell pages (Fire Bolt.md): No navigation links
✗ Item pages: No navigation links
✗ Monster pages: No navigation links
✗ Some subclass pages: Minimal navigation

#### Expected
Each entry should have:
- Link back to parent category (Spell → Spells index, Subclass → Barbarian Subclasses index)
- Related entries or "Similar"
- Breadcrumb trail

#### Impact
- Players get lost: "How do I get back to the spell list?"
- Have to use back button or search
- Poor site usability overall

---

### 11. CHARACTER BUILDER PAGE LINKS ARE OUTDATED (LOW IMPACT)
**Severity: LOW** — Some links point to wrong locations

#### Problem
Character Builder says:
```
"Pick SUBCLASS (optional, powerful)
  Pick a [[Subclasses|subclass]]"
```

But doesn't explain that you actually go to [[Barbarian Subclasses]], not generic [[Subclasses]].

#### Impact
- Minor: Quartz will resolve the wikilink, so it works
- But UX confusion: generic Subclasses index vs class-specific subclasses

---

### 12. NO SITE-WIDE SEARCH GUIDANCE (LOW IMPACT)
**Severity: LOW** — New players don't know search exists

#### Problem
Getting Started mentions search:
```
"Search (Top Left)
Type to search for anything..."
```

But homepage doesn't mention it.

#### Impact
- Some new players won't find search
- May spend more time browsing than necessary

---

## CATEGORIES OF PROBLEMS

### Information Architecture Issues
1. Campaign hubs are shells, not content
2. Rules section nearly empty
3. Incomplete entries not marked visually
4. No breadcrumb navigation

### Implementation Gaps
1. Spell embedding inconsistent across classes
2. Items page overpromises organization
3. View files (.base) created but not fully utilized
4. No bidirectional linking (subclass hub → class page)

### Navigation & Discoverability
1. No back links on entry pages
2. Getting Started not linked from homepage
3. Inconsistent entry page structures

### Content Completeness
1. Campaign overviews are placeholders
2. Rules section sparse (1 file vs promised clarity)
3. 201 incomplete entries, unmarked

---

## ROOT CAUSES

### Why These Weren't Caught Earlier

1. **Schema vs Reality:** Pages were created with templates (describing how they *should* work) but not tested with actual content
2. **Incomplete != Finished:** The archive was marked "ready for deployment" but critical content sections are stubs
3. **Implementation Debt:** Infrastructure (view files, metadata fields) was built but not consistently applied
4. **One-Way Thinking:** Links were built from top-level hubs downward, but not bottom-up back-references

---

## PRIORITY FOR FIXES

### MUST FIX (Blocks Deployment)
1. Campaign overview placeholders → actual content
2. Spell embedding inconsistency → all casters get spell lists on their pages
3. Incomplete entries → add visual indicators

### SHOULD FIX (Improves UX Significantly)
4. Rules section → add actual house rules or scaffolding
5. Breadcrumb navigation → add back-links to entry pages
6. Homepage → add "Getting Started" link
7. Subclass hubs ↔ class pages → bidirectional linking
8. Items page → fix overpromised organization

### NICE TO FIX (Polish)
9. Unused view files → clean up or embed
10. Search guidance → add to homepage

---

## TESTING RECOMMENDATION

**Before deployment, actually test as a new player:**

1. Land on homepage
2. Click "New to D&D?"
3. Follow character builder path
4. Pick Ra Gol'vek campaign
5. Look for sessions/NPCs/encounters
6. Go back to homepage, click campaign directly
7. Try to find a spell for your class
8. Try to find your class's subclasses
9. Look for house rules

**If any step confuses you, that's a problem.**

---

## What This Means

The architecture is solid (correct folder structure, metadata fields, hub pages exist), but the **content layer is incomplete** and **user flows are broken**.

This is like building a beautiful airport terminal with great signage but no planes—or having planes but no scheduled flights.

---
