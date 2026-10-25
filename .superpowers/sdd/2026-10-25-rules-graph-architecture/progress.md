# SDD ledger — plan: docs/superpowers/plans/2026-10-25-rules-graph-architecture.md

**BASE commit:** afba24aaf254af0b6cbc2188f6ea3198ade974ae

## Tasks

- [ ] Task 1: Update Metadata Schema and Validation Suite
- [ ] Task 2: Create Atomic 5e Condition Cards
- [ ] Task 3: Create Core System Mechanics & Migrate Global House Rules
- [ ] Task 4: Localize Campaign-Specific Rules
- [ ] Task 5: Build Dynamic Rules Query Views & Rules Hub
- [ ] Task 6: Semantic Cross-Linking in Prose
- [ ] Task 7: Verification & Quality Audit

## Pre-flight Conflicts Scan

Scanned on session start.

- No alias collisions found in existing rules/ files.
- `entity_type: rule` is already in the enum for all existing schemas — Task 1 only needs to add the `rule` key to the `schemas` object.
- `content/rules/House Rules.md` has `canonical_id: rule.rules.house-rules` — alias `house-rules` must be added so existing wikilinks survive.
- `content/rules/Attunement - Epic Point Pool.md` has `canonical_id: rule.rules.attunement-epic-point-pool` — alias must survive.
- `scripts/link-health.js` checks wikilinks; 0 broken currently. All new links must resolve.
- Prettier is enforced by `npm run check`; all new Markdown must pass.
- Campaign folders: `curse-of-strahd`, `ra-golvek`, `vyrun`.
- Working tree has 20 modified files (spell metadata from Phase 1/2 — not our concern) + untracked Tamer spells.

## Rulings

- Ruling: House Rules.md will be replaced with a redirect shell (aliases preserved, body replaced with a forwarding note) rather than deleted, to avoid breaking any incoming links from external sources. Cost if wrong: minor — easy to delete later.
- Ruling: content/lists/ directory exists per audit; rules.base will follow the same format as existing .base files.

## Progress Log

