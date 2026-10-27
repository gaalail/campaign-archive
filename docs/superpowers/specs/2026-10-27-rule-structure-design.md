# Rule Structure Design

## Intent

Make the rule archive easier to extend and browse while protecting the content already present. The owner has asked to advance the rule taxonomy and generated views while deferring copyright work.

## Goals

- Validate rule categories and campaign references in frontmatter.
- Let Pages CMS edit those fields without dropping unmodeled metadata.
- Add useful `.base` views backed by current rule records.
- Prevent a slug collision from producing a successful build that hides a page.

## Non-goals

- Copy, rewrite, or migrate licensed rule text.
- Move existing rule files or mass-edit semantic links.
- Add empty category views or restyle the site.

## Approaches

- **Full content migration:** create the proposed folder tree and populate many atomic pages. Rejected for this first pass because it risks copyright changes and high-churn URL moves before the records are reviewed.
- **Metadata-first, using current paths:** add categories and campaign references, use the existing `.base` mechanism for available records, and block collisions. Chosen by Codex under the user's direction to proceed with the site's best interests while deferring copyright work.
- **Leave the archive unchanged:** lowest risk but does not improve structural validation or discovery.

## Design

Keep the existing content paths and prose. Add the proposed condition, combat, adventuring, spellcasting, and campaign-rule categories, plus a house-rule category for the current composite page. A campaign reference is required for `campaign_rule` and must name one of the three configured campaigns. The current rules hub shows only views populated by existing records; new category views can be added when those records exist.

Use one slug-collision assertion in both full and incremental builds. Preserve existing CMS collections and workflow structure, while merging unmodeled frontmatter, protecting stable identity fields, and limiting deployment credentials to the deploy job.

## Constraints

- Copyright and license content is out of scope.
- Existing URLs remain stable.
- No visible layout restyling in this pass.
