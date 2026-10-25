# Rules & Graph Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the repository's rule system from a single catch-all "House Rules" note into a modular, graph-centric 5e SRD mechanics compendium with localized campaign rules and semantic in-text linking.

**Architecture:** Create atomic cards for conditions, combat, adventuring, and spellcasting rules under `content/rules/`; localize campaign-specific rules directly under each campaign directory; update metadata schemas and archive validation to enforce rule typing; embed dynamic query views via `rules.base`; and update prose across options/spells/items to link directly to atomic mechanics.

**Tech Stack:** Node.js (v24), Quartz 5.0, Markdown / YAML frontmatter, tsx (Node test runner), Prettier.

**Spec:** [rules-graph-architecture.md](file:///C:/Users/andre/.gemini/antigravity/brain/ecf91309-fc5b-4725-87e0-337985e01a90/design-docs/rules-graph-architecture.md)

## Global Constraints

- Preserve all existing content metadata and canonical ID conventions (`rule.<category>.<slug>`).
- All character options remain universally accessible (no artificial campaign gates).
- Universal system rules reside strictly in `content/rules/`.
- Campaign-unique rules reside strictly under `content/campaigns/<campaign>/rules/`.
- `npm test` and `npm run check` must pass cleanly with 0 errors and 0 warnings after all changes.
- Prettier formatting must be respected across all new and modified Markdown files.

## Review Focus

1. **Unresolved / Ambiguous Wikilinks**: Every new rule file and link must resolve unambiguously in `scripts/link-health.js`.
2. **Schema Validation**: Every rule note must have `entity_type: rule` and valid `category`.
3. **No Redundant Aliases**: Canonical paths must not collide or shadow existing routes.
4. **Encoding Integrity**: No non-UTF8 or corrupted characters (`?` for arrows).
5. **No Broken Views**: All `.base` query filters must match valid fields and directory paths.

---

### Task 1: Update Metadata Schema and Validation Suite

**Files:**
- Modify: `scripts/content-metadata-schema.json`
- Modify: `scripts/validate-archive.js`
- Test: `tests/` or running `npm run validate:archive:report`

- [ ] Add `rule` schema definition with allowed `category` values (`condition`, `combat`, `adventuring`, `spellcasting`, `campaign_rule`) to `scripts/content-metadata-schema.json`.
- [ ] Update `scripts/validate-archive.js` to index and count rule notes properly.
- [ ] Run `node scripts/validate-archive.js --report-only` and confirm no regressions.

---

### Task 2: Create Atomic 5e Condition Cards

**Files:**
- Create: `content/rules/conditions/`
  - `blinded.md`
  - `charmed.md`
  - `deafened.md`
  - `exhaustion.md`
  - `frightened.md`
  - `grappled.md`
  - `incapacitated.md`
  - `invisible.md`
  - `paralyzed.md`
  - `petrified.md`
  - `poisoned.md`
  - `prone.md`
  - `restrained.md`
  - `stunned.md`
  - `unconscious.md`

- [ ] Author standard SRD 5.1 definitions for all 15 core conditions with complete frontmatter metadata (`entity_type: rule`, `category: condition`, `source: SRD 5.1`).
- [ ] Verify each file has proper title, summary, and bulleted mechanical rules.
- [ ] Run `node scripts/validate-archive.js --report-only` and verify all condition files pass schema validation.

---

### Task 3: Create Core System Mechanics & Migrate Global House Rules

**Files:**
- Create: `content/rules/combat/`
  - `actions-in-combat.md`
  - `attack-rolls.md`
  - `critical-hits.md`
  - `damage-and-healing.md`
  - `death-saves.md`
  - `flanking.md`
  - `cover.md`
- Create: `content/rules/adventuring/`
  - `resting.md`
  - `attunement.md`
  - `vision-and-light.md`
- Create: `content/rules/spellcasting/`
  - `concentration.md`
  - `components.md`
  - `spell-slots.md`
- Modify/Remove: `content/rules/Attunement - Epic Point Pool.md` -> merged/redirected to `adventuring/attunement.md`
- Modify/Remove: `content/rules/House Rules.md` -> mechanics distributed into `combat/critical-hits.md`, `combat/death-saves.md`, `combat/flanking.md`, `adventuring/resting.md`

- [ ] Create combat cards integrating standard rules with any established table rulings via clear callouts.
- [ ] Create adventuring cards integrating resting and the epic attunement point pool.
- [ ] Create spellcasting cards for concentration, components, and slots.
- [ ] Add legacy aliases to prevent dead links from older references to `[[House Rules]]` and `[[Attunement - Epic Point Pool]]`.
- [ ] Run `node scripts/validate-archive.js --report-only` to ensure link integrity.

---

### Task 4: Localize Campaign-Specific Rules

**Files:**
- Create: `content/campaigns/curse-of-strahd/rules/index.md`
- Create: `content/campaigns/curse-of-strahd/rules/alterations-to-magic.md`
- Create: `content/campaigns/ra-golvek/rules/index.md`
- Create: `content/campaigns/vyrun/rules/index.md`

- [ ] Create Curse of Strahd local rules hub and Barovian magic alteration notes (planar separation, modified cosmetic manifestations).
- [ ] Create Ra Gol'vek and Vyrun local rule hubs for setting-specific rulings (maritime, frontier survival).
- [ ] Update campaign index pages (`curse-of-strahd/index.md`, etc.) to point to local `[[rules|Campaign Rules]]` instead of root global rules.
- [ ] Run `node scripts/validate-archive.js --report-only` to verify local campaign rule links.

---

### Task 5: Build Dynamic Rules Query Views & Rules Hub

**Files:**
- Create: `content/lists/rules.base`
- Modify: `content/rules/index.md`

- [ ] Create `content/lists/rules.base` defining filtered views for All Rules, Conditions, Combat, Adventuring, and Spellcasting.
- [ ] Rewrite `content/rules/index.md` as an executive rules dashboard embedding `![[rules.base]]` and providing quick-jump links.
- [ ] Run `npx prettier --write content/rules/ content/lists/rules.base` to ensure formatting.

---

### Task 6: Semantic Cross-Linking in Prose

**Files:**
- Modify: `content/character-options/subclasses/Fighter/Champion.md` and other relevant subclasses
- Modify: `content/character-options/races/Tiefling.md` and other races referencing spells/conditions
- Modify: `content/character-options/classes/Fighter.md`

- [ ] In `Champion.md`, link martial exploits (`[[character-options/class-options/martial-exploits/Feat of Strength|feat of strength]]`, etc.) and conditions.
- [ ] In `Tiefling.md`, link racial spells (`[[spells/cantrips/Thaumaturgy|thaumaturgy]]`, `[[spells/2nd-level/Darkness|darkness]]`).
- [ ] Link `[[rules/conditions/prone|prone]]`, `[[rules/combat/critical-hits|critical hit]]`, and `[[rules/adventuring/attunement|attunement]]` across key files.

---

### Task 7: Verification & Quality Audit

- [ ] Run `npm run check` (TypeScript compilation, Prettier, Markdown lint, Archive validation).
- [ ] Run `npm test` (All 193 unit tests pass).
- [ ] Run `npx quartz build` to ensure clean site generation without errors.
- [ ] Run `graphify update .` to update the knowledge graph with the new rule and condition nodes.
