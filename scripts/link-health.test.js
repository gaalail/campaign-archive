import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { validateItemCounts, validateSpellCounts } from "./content-counts.js"
import { validateMetadata } from "./metadata-schema.js"
import {
  createLinkHealthAllowlist,
  createLinkIndex,
  extractWikilinks,
  findAliasConflicts,
  findGeneratedViewPages,
  resolveWikilink,
} from "./link-health.js"

const metadataSchema = JSON.parse(
  readFileSync(new URL("./content-metadata-schema.json", import.meta.url), "utf-8"),
)

test("content metadata schema requires core class, spell, and item fields", () => {
  const validRecords = [
    [
      "class",
      {
        title: "Wizard",
        hit_die: "d6",
        saving_throws: ["INT", "WIS"],
        source: "SRD 5.1",
        source_type: "SRD",
      },
    ],
    [
      "spell",
      {
        title: "Fire Bolt",
        level: 0,
        school: "Evocation",
        classes: ["Sorcerer", "Wizard"],
        source: "SRD 5.1",
        source_type: "SRD",
      },
    ],
    [
      "item",
      {
        title: "Potion",
        item_type: "Potion",
        rarity: "Common",
        source: "SRD 5.1",
        source_type: "SRD",
      },
    ],
  ]

  for (const [type, metadata] of validRecords) {
    assert.deepEqual(validateMetadata(metadata, metadataSchema.schemas[type], metadataSchema), [])
  }

  assert.ok(
    validateMetadata(
      { title: "Missing Details" },
      metadataSchema.schemas.class,
      metadataSchema,
    ).includes('missing required "saving_throws"'),
  )
  assert.ok(
    validateMetadata(
      { title: "Source Missing Type", source: "SRD 5.1" },
      metadataSchema.schemas.campaign,
      metadataSchema,
    ).includes('"source_type" is required when "source" is provided'),
  )
})

test("rule metadata validates categories and requires a campaign for campaign-local rules", () => {
  const schema = metadataSchema.schemas.rule
  const base = { title: "A rule", entity_type: "rule", canonical_id: "rule.test" }

  assert.deepEqual(
    validateMetadata({ ...base, category: "adventuring" }, schema, metadataSchema),
    [],
  )
  assert.deepEqual(
    validateMetadata(
      { ...base, category: "campaign_rule", campaign: "curse-of-strahd" },
      schema,
      metadataSchema,
    ),
    [],
  )
  assert.deepEqual(
    validateMetadata({ ...base, category: "campaign_rule" }, schema, metadataSchema),
    ['"campaign" is required when "category" is "campaign_rule"'],
  )
  assert.deepEqual(
    validateMetadata({ ...base, category: "combat", campaign: "unknown" }, schema, metadataSchema),
    ['"campaign" must be one of: curse-of-strahd, ra-golvek, vyrun'],
  )
  assert.deepEqual(
    validateMetadata({ ...base, category: "uncategorized" }, schema, metadataSchema),
    [
      '"category" must be one of: condition, combat, adventuring, spellcasting, campaign_rule, house_rule',
    ],
  )
})

test("metadata schema enforces core spell fields, enumerated source types, and incomplete reasons", () => {
  const schema = {
    required: ["title", "level", "classes", "source"],
    fields: {
      title: { type: "string", non_empty: true },
      level: { type: "integer", minimum: 0, maximum: 9 },
      classes: {
        type: "array",
        min_items: 1,
        items: { type: "string", non_empty: true },
      },
      source: { type: "string", non_empty: true },
      source_type: { type: "string", enum_from: "source_types" },
      content_status: { type: "string", enum_from: "content_status" },
      incomplete_reason: { type: "string", non_empty: true },
    },
  }
  const definitions = {
    source_types: ["SRD", "homebrew", "third-party", "campaign-original"],
    content_status: ["complete", "incomplete", "draft"],
  }
  const metadata = {
    title: "Test Spell",
    level: 10,
    classes: [],
    source: "Example",
    source_type: "unclassified",
    content_status: "incomplete",
  }

  assert.deepEqual(validateMetadata(metadata, schema, definitions), [
    '"level" must be at most 9',
    '"classes" must contain at least 1 entries',
    '"source_type" must be one of: SRD, homebrew, third-party, campaign-original',
    '"incomplete_reason" is required when content_status is "incomplete"',
  ])
})

test("spell count table covers every spell level and matches its metadata total", () => {
  const levels = [
    ["Cantrips", 2],
    ["1st-Level", 1],
    ...["2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"].map((level) => [
      `${level}-Level`,
      0,
    ]),
  ]
  const table = [
    "| Level | Count |",
    "| ----- | ----- |",
    ...levels.map(([label, count]) => `| ${label} | ${count} |`),
  ].join("\n")
  const result = validateSpellCounts(table, [{ level: 0 }, { level: 0 }, { level: 1 }])

  assert.deepEqual(result.errors, [])
  assert.equal(result.displayedTotal, 3)
  assert.equal(result.metadataTotal, 3)
})

test("spell count table detects category drift and newly added levels", () => {
  const levels = [
    ["Cantrips", 2],
    ["1st-Level", 2],
    ["2nd-Level", 0],
    ...["3rd", "4th", "5th", "6th", "7th", "8th", "9th"].map((level) => [`${level}-Level`, 0]),
  ]
  const table = [
    "| Level | Count |",
    "| ----- | ----- |",
    ...levels.map(([label, count]) => `| ${label} | ${count} |`),
  ].join("\n")
  const result = validateSpellCounts(table, [{ level: 0 }, { level: 1 }, { level: 2 }])

  assert.deepEqual(result.errors, [
    '"Cantrips" displays 2, but metadata contains 1',
    '"1st-Level" displays 2, but metadata contains 1',
    '"2nd-Level" displays 0, but metadata contains 1',
  ])
})

test("spell count validation requires all ten spell-level categories", () => {
  const levels = [
    ["Cantrips", 0],
    ...Array.from({ length: 9 }, (_, index) => [
      `${["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"][index]}-Level`,
      index + 1,
    ]),
  ]
  const table = [
    "| Level | Count |",
    "| ----- | ----- |",
    ...levels.map(([label]) => `| ${label} | 1 |`),
  ].join("\n")
  const result = validateSpellCounts(
    table,
    levels.map(([, level]) => ({ level })),
  )

  assert.deepEqual(result.errors, [])
  assert.equal(result.displayedTotal, 10)
  assert.equal(result.metadataTotal, 10)
})

test("item count table normalizes plural display labels and detects missing categories", () => {
  const table = [
    "| Type | Count | Description |",
    "| ---- | ----- | ----------- |",
    "| Weapons | 2 | Weapons |",
    "| Ammunition | 0 | Ammo |",
    "| Armor | 0 | Armor |",
    "| Potion | 0 | Potions |",
    "| Ring | 0 | Rings |",
    "| Rod | 0 | Rods |",
    "| Scroll | 0 | Scrolls |",
    "| Staves | 1 | Staves |",
    "| Wand | 0 | Wands |",
  ].join("\n")
  const result = validateItemCounts(table, [
    { item_type: "Weapon" },
    { item_type: "Weapon" },
    { item_type: "Staff" },
    { item_type: "Wondrous Item" },
  ])

  assert.deepEqual(result.errors, [
    'Metadata category "wondrous item" is missing from the count table',
    'Item type "wondrous item" is missing from the count table',
  ])
})

test("item count validation requires all ten item categories", () => {
  const categories = [
    "Ammunition",
    "Armor",
    "Potion",
    "Ring",
    "Rod",
    "Scroll",
    "Staff",
    "Wand",
    "Weapon",
    "Wondrous Items",
  ]
  const table = [
    "| Type | Count |",
    "| ---- | ----- |",
    ...categories.map((category) => `| ${category} | 1 |`),
  ].join("\n")
  const result = validateItemCounts(
    table,
    categories.map((item_type) => ({ item_type })),
  )

  assert.deepEqual(result.errors, [])
  assert.equal(result.displayedTotal, 10)
  assert.equal(result.metadataTotal, 10)
})

test("link-health allowlist requires precise, reasoned exceptions", () => {
  const allowlist = createLinkHealthAllowlist([
    {
      source: "rules/index.md",
      target: "External Reference",
      kind: "wikilink",
      status: "missing",
      reason: "Referenced in the source manuscript but not hosted here",
    },
    {
      source: "rules/index.md",
      target: "Legacy Name",
      fragment: "Overview",
      kind: "embed",
      status: "ambiguous",
      candidates: ["rules/legacy.md", "campaigns/legacy.md"],
      reason: "The source intentionally documents both archived pages",
    },
  ])

  assert.equal(
    allowlist.consume({
      source: "other/index.md",
      target: "External Reference",
      kind: "wikilink",
      status: "missing",
    }),
    undefined,
  )
  assert.equal(
    allowlist.consume({
      source: "rules/index.md",
      target: "Legacy Name",
      fragment: "Overview",
      kind: "embed",
      status: "ambiguous",
      candidates: ["rules/legacy.md", "campaigns/renamed.md"],
    }),
    undefined,
  )
  assert.equal(allowlist.unused().length, 2)
  assert.equal(
    allowlist.consume({
      source: "rules/index.md",
      target: "External Reference",
      kind: "wikilink",
      status: "missing",
    }).reason,
    "Referenced in the source manuscript but not hosted here",
  )
  assert.equal(
    allowlist.consume({
      source: "rules/index.md",
      target: "Legacy Name",
      fragment: "Overview",
      kind: "embed",
      status: "ambiguous",
      candidates: ["campaigns/legacy.md", "rules/legacy.md"],
    }).reason,
    "The source intentionally documents both archived pages",
  )
  assert.deepEqual(allowlist.unused(), [])
})

test("link-health allowlist rejects invalid and duplicate entries", () => {
  assert.throws(() => createLinkHealthAllowlist({}), /must be an array/)
  assert.throws(
    () =>
      createLinkHealthAllowlist([
        {
          source: "rules/index.md",
          target: "Legacy Name",
          kind: "wikilink",
          status: "ambiguous",
          reason: "Intentional",
        },
      ]),
    /must specify candidates/,
  )
  assert.throws(
    () =>
      createLinkHealthAllowlist([
        {
          source: "rules/index.md",
          target: "External",
          kind: "wikilink",
          status: "missing",
          reason: "Intentional",
        },
        {
          source: "rules/index.md",
          target: "External",
          kind: "wikilink",
          status: "missing",
          reason: "Duplicate",
        },
      ]),
    /duplicates an earlier entry/,
  )
})

test("extracts aliases, embeds, fragments, and source locations", () => {
  const links = extractWikilinks(
    [
      "---",
      "title: [[Not a link]]",
      "---",
      "[[Rules|House rules]] and ![[views/rules.base]]",
      "[[Rules#Combat|Combat rules]]",
    ].join("\n"),
  )

  assert.deepEqual(links, [
    {
      target: "Rules",
      alias: "House rules",
      fragment: undefined,
      embed: false,
      line: 4,
      column: 1,
    },
    {
      target: "views/rules.base",
      alias: undefined,
      fragment: undefined,
      embed: true,
      line: 4,
      column: 27,
    },
    {
      target: "Rules",
      alias: "Combat rules",
      fragment: "Combat",
      embed: false,
      line: 5,
      column: 1,
    },
  ])
})

test("ignores fenced, indented, and inline code", () => {
  const links = extractWikilinks(
    [
      "Use `[[Inline Example]]` as syntax.",
      "```md",
      "[[Fence Example]]",
      "```",
      "~~~",
      "[[Tilde Example]]",
      "~~~",
      "    [[Indented Example]]",
      "[[Real Page]]",
    ].join("\n"),
  )

  assert.deepEqual(
    links.map((link) => link.target),
    ["Real Page"],
  )
  assert.equal(links[0].line, 9)
})

test("resolves exact paths, folder indexes, and page titles", () => {
  const index = createLinkIndex([
    { path: "rules/index.md", content: "---\ntitle: House Rules\n---\n" },
    { path: "character-builder.md", content: "---\ntitle: Build a Character\n---\n" },
    { path: "items/Ring of Protection.md", content: "---\ntitle: Ring of Protection\n---\n" },
  ])

  assert.equal(resolveWikilink({ target: "rules" }, "index", index).filePath, "rules/index.md")
  assert.equal(
    resolveWikilink({ target: "House Rules" }, "index", index).filePath,
    "rules/index.md",
  )
  assert.equal(
    resolveWikilink({ target: "Build a Character" }, "index", index).filePath,
    "character-builder.md",
  )
  assert.equal(
    resolveWikilink({ target: "Character Builder" }, "index", index).filePath,
    "character-builder.md",
  )
  assert.equal(
    resolveWikilink({ target: "items/Ring of Protection.md" }, "index", index).filePath,
    "items/Ring of Protection.md",
  )
})

test("resolves stable aliases by title and explicit path", () => {
  const index = createLinkIndex([
    {
      path: "campaigns/vyrun/index.md",
      content: "---\ntitle: Vyrun\naliases: [vyrun/index, Old Vyrun]\n---\n",
    },
  ])

  assert.equal(
    resolveWikilink({ target: "Old Vyrun" }, "index", index).filePath,
    "campaigns/vyrun/index.md",
  )
  assert.equal(
    resolveWikilink({ target: "vyrun/index" }, "index", index).filePath,
    "campaigns/vyrun/index.md",
  )

  const ambiguousIndex = createLinkIndex([
    { path: "campaigns/old-vyrun.md", content: "---\naliases: [Old Vyrun]\n---\n" },
    { path: "campaigns/vyrun-legacy.md", content: "---\naliases: [Old Vyrun]\n---\n" },
  ])
  assert.deepEqual(resolveWikilink({ target: "Old Vyrun" }, "index", ambiguousIndex), {
    status: "ambiguous",
    candidates: ["campaigns/old-vyrun.md", "campaigns/vyrun-legacy.md"],
  })
})

test("detects duplicate aliases and aliases that shadow canonical routes", () => {
  const index = createLinkIndex([
    { path: "archive/old-name.md", content: "---\naliases: [legacy-name, rules]\n---\n" },
    { path: "archive/another-old-name.md", content: "---\naliases: [legacy-name]\n---\n" },
    { path: "rules/index.md", content: "---\ntitle: Rules\n---\n" },
  ])

  assert.deepEqual(findAliasConflicts(index), [
    {
      alias: "legacy-name",
      reason: "assigned to multiple pages: archive/old-name.md, archive/another-old-name.md",
    },
    {
      alias: "rules",
      reason: "conflicts with canonical page path: rules/index.md",
    },
  ])
})

test("reports ambiguous shortest matches rather than selecting a substring", () => {
  const index = createLinkIndex([
    { path: "character-options/classes/Bard.md", content: "---\ntitle: Bard\n---\n" },
    { path: "campaigns/Bard.md", content: "---\ntitle: Bard\n---\n" },
    { path: "items/Ring of Protection.md", content: "" },
  ])

  assert.deepEqual(resolveWikilink({ target: "Bard" }, "index", index), {
    status: "ambiguous",
    candidates: ["character-options/classes/Bard.md", "campaigns/Bard.md"],
  })
  assert.equal(resolveWikilink({ target: "Ring" }, "index", index).status, "missing")
})

test("resolves embeds to local Markdown, base views, and media assets", () => {
  const index = createLinkIndex([
    { path: "rules/House Rules.md", content: "" },
    { path: "lists/rules.base" },
    { path: "media/example.png" },
  ])

  assert.equal(
    resolveWikilink({ target: "House Rules", embed: true }, "index", index).filePath,
    "rules/House Rules.md",
  )
  assert.equal(
    resolveWikilink({ target: "rules.base", embed: true }, "index", index).filePath,
    "lists/rules.base",
  )
  assert.equal(
    resolveWikilink({ target: "example.png", embed: true }, "index", index).filePath,
    "media/example.png",
  )
  assert.equal(
    resolveWikilink({ target: "missing.png", embed: true }, "index", index).status,
    "missing",
  )
})

test("validates a named view in a base embed", () => {
  const index = createLinkIndex([
    {
      path: "lists/items.base",
      content: [
        "views:",
        "  - type: table",
        "    name: Wondrous Items",
        "    filters:",
        "      and:",
        '        - item_type == "Wondrous Items"',
      ].join("\n"),
    },
  ])

  assert.equal(
    resolveWikilink(
      { target: "items.base", fragment: "Wondrous-Items", embed: true },
      "items/Wondrous Items/index",
      index,
    ).status,
    "resolved",
  )
  assert.deepEqual(
    resolveWikilink(
      { target: "items.base", fragment: "Missing", embed: true },
      "items/Wondrous Items/index",
      index,
    ),
    { status: "missing", reason: "base view", filePath: "lists/items.base" },
  )
})

test("resolves self-links with heading fragments", () => {
  const index = createLinkIndex([{ path: "rules/House Rules.md", content: "" }])

  assert.equal(
    resolveWikilink({ target: "", fragment: "Combat", embed: false }, "rules/House Rules", index)
      .filePath,
    "rules/House Rules.md",
  )
})

test("counts pages discoverable through generated base views", () => {
  const index = createLinkIndex([
    {
      path: "lists/spells.base",
      content: [
        "filters:",
        "  and:",
        '    - file.inFolder("spells")',
        '    - file.name != "index"',
        "views:",
        "  - type: table",
        "    name: Bard",
        "    filters:",
        "      and:",
        '        - classes.contains("Bard")',
      ].join("\n"),
    },
    {
      path: "spells/1st-level/Alarm.md",
      content: "---\ntitle: Alarm\nclasses:\n  - Bard\nlevel: 1\n---\n",
    },
    {
      path: "spells/1st-level/index.md",
      content: "---\ntitle: 1st-Level\n---\n",
    },
    {
      path: "items/Armor/Shield.md",
      content: "---\ntitle: Shield\nitem_type: Armor\n---\n",
    },
  ])

  assert.deepEqual([...findGeneratedViewPages(index)], ["spells/1st-level/Alarm.md"])
})

test("resolves explicit relative links from the source page", () => {
  const index = createLinkIndex([
    { path: "character-options/classes/Wizard.md", content: "" },
    { path: "character-options/races/Elf.md", content: "" },
  ])

  assert.equal(
    resolveWikilink(
      { target: "../races/Elf", embed: false },
      "character-options/classes/Wizard",
      index,
    ).filePath,
    "character-options/races/Elf.md",
  )
  assert.equal(
    resolveWikilink(
      { target: "../../../outside", embed: false },
      "character-options/classes/Wizard",
      index,
    ).status,
    "missing",
  )
})
