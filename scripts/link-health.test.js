import assert from "node:assert/strict"
import test from "node:test"
import { createLinkIndex, extractWikilinks, resolveWikilink } from "./link-health.js"

test("extracts aliases, embeds, fragments, and source locations", () => {
  const links = extractWikilinks([
    "---",
    "title: [[Not a link]]",
    "---",
    "[[Rules|House rules]] and ![[views/rules.base]]",
    "[[Rules#Combat|Combat rules]]",
  ].join("\n"))

  assert.deepEqual(links, [
    { target: "Rules", alias: "House rules", fragment: undefined, embed: false, line: 4, column: 1 },
    { target: "views/rules.base", alias: undefined, fragment: undefined, embed: true, line: 4, column: 27 },
    { target: "Rules", alias: "Combat rules", fragment: "Combat", embed: false, line: 5, column: 1 },
  ])
})

test("ignores fenced, indented, and inline code", () => {
  const links = extractWikilinks([
    "Use `[[Inline Example]]` as syntax.",
    "```md",
    "[[Fence Example]]",
    "```",
    "~~~",
    "[[Tilde Example]]",
    "~~~",
    "    [[Indented Example]]",
    "[[Real Page]]",
  ].join("\n"))

  assert.deepEqual(links.map((link) => link.target), ["Real Page"])
  assert.equal(links[0].line, 9)
})

test("resolves exact paths, folder indexes, and page titles", () => {
  const index = createLinkIndex([
    { path: "rules/index.md", content: "---\ntitle: House Rules\n---\n" },
    { path: "character-builder.md", content: "---\ntitle: Build a Character\n---\n" },
    { path: "items/Ring of Protection.md", content: "---\ntitle: Ring of Protection\n---\n" },
  ])

  assert.equal(resolveWikilink({ target: "rules" }, "index", index).filePath, "rules/index.md")
  assert.equal(resolveWikilink({ target: "House Rules" }, "index", index).filePath, "rules/index.md")
  assert.equal(resolveWikilink({ target: "Build a Character" }, "index", index).filePath, "character-builder.md")
  assert.equal(resolveWikilink({ target: "Character Builder" }, "index", index).filePath, "character-builder.md")
  assert.equal(
    resolveWikilink({ target: "items/Ring of Protection.md" }, "index", index).filePath,
    "items/Ring of Protection.md",
  )
})

test("reports ambiguous shortest matches rather than selecting a substring", () => {
  const index = createLinkIndex([
    { path: "character-options/classes/Bard.md", content: "---\ntitle: Bard\n---\n" },
    { path: "campaigns/Bard.md", content: "---\ntitle: Bard\n---\n" },
    { path: "items/Ring of Protection.md", content: "" },
  ])

  assert.deepEqual(
    resolveWikilink({ target: "Bard" }, "index", index),
    {
      status: "ambiguous",
      candidates: ["character-options/classes/Bard.md", "campaigns/Bard.md"],
    },
  )
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
  assert.equal(resolveWikilink({ target: "missing.png", embed: true }, "index", index).status, "missing")
})

test("resolves self-links with heading fragments", () => {
  const index = createLinkIndex([{ path: "rules/House Rules.md", content: "" }])

  assert.equal(
    resolveWikilink({ target: "", fragment: "Combat", embed: false }, "rules/House Rules", index).filePath,
    "rules/House Rules.md",
  )
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
    resolveWikilink({ target: "../../../outside", embed: false }, "character-options/classes/Wizard", index)
      .status,
    "missing",
  )
})
