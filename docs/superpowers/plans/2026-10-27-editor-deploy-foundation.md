# Archive Foundation Implementation Plan

**Goal:** Strengthen content metadata and build safeguards while preserving the current archive paths and copyright-sensitive prose.

**Architecture:** Extend the existing metadata schema and `.base` workflow for rules, make slug collisions fatal, and retain current editor and deployment structure with safer defaults.

**Tech Stack:** Pages CMS YAML, GitHub Actions YAML, Quartz TypeScript, Node.js metadata validation, and Obsidian `.base` views.

**Spec:** [Rule Structure Design](../specs/2026-10-27-rule-structure-design.md).

## Global Constraints

- Do not modify copyright/licensing content.
- Do not restyle visible site UI; the rules browse views follow the owner's supplied direction.
- Preserve existing Pages CMS collections and content paths.
- Do not move or reproduce copyrighted rule text.

## Review Focus

- CMS save with an unconfigured frontmatter field must preserve that field.
- CMS must prevent edits to the stable entity identity fields labeled “keep unchanged.”
- The build job must not receive Pages write or OIDC token permissions.
- The deploy job must retain the permissions required to publish GitHub Pages.
- Existing CMS field definitions and workflow triggers must remain intact.

### Task 1: Protect editor data and identity

**Files:** Modify `.pages.yml`.

- [x] Enable content merging in Pages CMS settings.
- [x] Mark `entity_type` and `canonical_id` read-only, matching their “keep unchanged” labels.
- [x] Preserve collection paths and add only the requested rule metadata fields.

### Task 2: Reduce deploy permissions

**Files:** Modify `.github/workflows/deploy.yml`.

- [x] Keep `contents: read` at workflow scope.
- [x] Move `pages: write` and `id-token: write` to the deploy job.
- [x] Review the diff to ensure build and deploy dependencies remain intact.

### Task 3: Classify and browse existing rules

**Files:** `.pages.yml`, `content/rules/*.md`, `content/rules/index.md`, `content/lists/rules.base`, `scripts/content-metadata-schema.json`, `scripts/metadata-schema.js`, `scripts/validate-archive.js`, `scripts/link-health.test.js`.

- [x] Add validated categories and campaign references, requiring a campaign for `campaign_rule` entries.
- [x] Categorize the two existing rule records without changing their prose or URLs.
- [x] Add the CMS fields and embed useful views for categories that have records.
- [x] Add regression coverage for rule category and campaign validation.

### Task 4: Block hidden pages from slug collisions

**Files:** `quartz/build.ts`, `quartz/util/slugCollisions.ts`, `quartz/util/slugCollisions.test.ts`.

- [x] Fail full and incremental builds when multiple sources map to one URL.
- [x] Verify unique slugs continue to build and collisions report both source paths.
