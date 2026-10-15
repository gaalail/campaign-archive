---
title: Discovery Features
---

# Discovery & Cross-Linking (Phase 3)

This document explains the discovery features added in Phase 3.

---

## Source Badges

Every entry now displays a **source badge** indicating where the content comes from:

### Badge Types

**SRD 5.1**
- Official D&D 5e material from the System Reference Document
- Licensed under Creative Commons
- Reliable, well-tested rules

**Homebrew**
- Custom content created for your table
- DM-approved house rules or campaign-specific options
- May differ from official rules

**Corpus Angelus**
- Third-party material from external sources
- Community-created or published supplements

### What Badges Look Like

At the top of each entry page, you'll see the source clearly marked with a colored badge:
- SRD 5.1: Blue badge
- Homebrew: Yellow badge
- Corpus Angelus: Brown badge

### Why This Matters

- **Players know what's official** (SRD vs custom)
- **DMs can filter by source** (if needed)
- **Citation is clear** (legal requirements met)
- **No confusion** about which rules apply

---

## Bidirectional Spell/Class Linking

Spells and Classes now link to each other automatically:

### How It Works

**Class Pages Show:**
- All spells available to that class
- Organized by level (Cantrips, 1st-level, etc.)
- Links to full spell pages

**Spell Pages Show:**
- Which classes can learn this spell
- Which subclasses specialize in it (if any)
- Related spells and abilities

### Example: Warlock

Visit the [[Warlock]] page and you'll see:
```
Warlock Spells Available:
- Cantrips: Eldritch Blast, Mage Hand, Minor Illusion, ...
- 1st-level: Armor of Agathys, Hex, Witch Bolt, ...
- 2nd-level: Darkness, Invisibility, Misty Step, ...
```

Click any spell to see its full page, which now shows:
```
Available to: Warlock (primary), Bard (via 6th-level list)
Related Options: Agonizing Blast (invocation), Hex (1st-level)
```

### Why This Matters

- **Players understand their spell options** without searching
- **Easy cross-reference** between classes and spells
- **Discovery of related options** (spells + invocations + features)
- **No separate hunting** for "what spells can my class use?"

---

## Graph View Filtering

The **graph view** (network visualization) now has filtering options.

### Filter Modes

**View All (Default)**
- Shows entire knowledge graph
- 1000+ entries and links
- Can be overwhelming

**Campaign Only**
- Shows only this campaign's entries
- Related classes, spells, items filtered in
- Great for campaign-specific discovery

**Custom Content Only**
- Shows only Homebrew + Corpus Angelus
- Filters out SRD material
- Useful for "what did we customize?"

### How to Use

1. Open graph view (icon on right sidebar)
2. Look for filter toggle (top-right of graph)
3. Select: "View All" | "Campaign Only" | "Custom Only"
4. Graph updates instantly

### Why This Matters

- **Graph view is now useful** (not just a hairball)
- **Campaign-specific discovery** (see what's in your campaign)
- **Content audit** (quickly see your homebrew)
- **Less overwhelm** for new players

---

## Media Organization Strategy

Media files (images) are now organized by type and usage.

### Folder Structure

```
content/media/
├─ characters/        (NPC portraits, character art)
├─ locations/         (Place maps, scene images)
├─ items/             (Item illustrations)
├─ monsters/          (Creature art)
├─ campaigns/         (Campaign-specific images)
│   ├─ ra-golvek/
│   ├─ vyrun/
│   └─ curse-of-strahd/
└─ other/             (Miscellaneous)
```

### Naming Convention

Use descriptive names:
```
Good:    npc_tavern_keeper.jpg, map_city_center.png
Bad:     image_1.jpg, temp.png
```

### Usage

Upload images via Pages CMS:
1. Go to character/spell/item entry
2. Click "Picture (optional)" field
3. Upload from Media area
4. Image displays on entry page

### Benefits

- **Visual entries** (players can see what things look like)
- **Organized** (easy to find and reuse images)
- **Campaign cohesion** (consistent visual style)
- **Future-proof** (media grows, stays organized)

---

## All Discovery Features Together

**Spell Discovery Example:**

1. Open [[Spells]]
2. Click a spell name
3. See: Source badge (SRD | Homebrew), Available classes, Related options
4. Click a class to see what spells it uses
5. Open graph view and filter to "Campaign Only"
6. See how spells connect in your campaign

**Result:** Integrated, interconnected knowledge base

---

## Testing the Features

### Source Badges
- [ ] Visit any entry (spell, item, class)
- [ ] Verify source badge visible at top
- [ ] Check color matches type (blue=SRD, yellow=Homebrew, brown=Corpus)

### Spell/Class Linking
- [ ] Visit [[Warlock]] class page
- [ ] Scroll to spells section
- [ ] Verify spells listed and clickable
- [ ] Click a spell
- [ ] Verify spell page shows Warlock as available class

### Graph View Filtering
- [ ] Open graph view (icon on right sidebar)
- [ ] Look for filter toggle
- [ ] Switch between "View All" / "Campaign Only"
- [ ] Graph updates

### Media Organization
- [ ] Check Pages CMS → (any entry with image field)
- [ ] Verify Media folder is organized
- [ ] Upload a test image
- [ ] Verify it displays on entry page

---

## Integration with Previous Phases

**Phase 1 (Foundation):**
- Metadata infrastructure ready
- Source field standardized

**Phase 2 (Onboarding):**
- New players know where to start
- Campaign hubs guide exploration

**Phase 3 (Discovery):**
- Badges help identify content type
- Linking enables cross-discovery
- Graph view supports exploration
- Media brings entries to life

**Result:** Complete, cohesive user experience

---

## Next: Full Build & Test

Build your site and test all features. If everything works, you're done!

```bash
npm run docs
```

Then:
1. Test each feature above
2. Get feedback from a new player
3. Deploy when confident

---
