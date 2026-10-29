import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { ArchiveGraphIndex } from "./graph-index.js"

test("graph index resolves folder routes and aliases to canonical page slugs", async () => {
  const output = await fs.mkdtemp(path.join(os.tmpdir(), "archive-graph-index-"))
  try {
    const emitter = ArchiveGraphIndex()
    await emitter.emit({ argv: { output } }, [
      [
        "paladin.md",
        {
          data: {
            slug: "character-options/classes/paladin",
            frontmatter: { title: "Paladin" },
            links: ["character-options/class-options/smite-paths/", "rules", "vyrun"],
          },
        },
      ],
      [
        "smite-paths/index.md",
        {
          data: {
            slug: "character-options/class-options/smite-paths/index",
            frontmatter: { title: "Paladin Smite Paths" },
            links: [],
          },
        },
      ],
      [
        "rules/index.md",
        { data: { slug: "rules/index", frontmatter: { title: "Rules" }, links: [] } },
      ],
      [
        "vyrun/index.md",
        {
          data: {
            slug: "campaigns/vyrun/index",
            frontmatter: { title: "Vyrun", aliases: ["vyrun/index"] },
            links: [],
          },
        },
      ],
    ])

    const index = JSON.parse(
      await fs.readFile(path.join(output, "static", "archiveGraphIndex.json"), "utf-8"),
    )
    assert.deepEqual(
      index.find((page) => page.slug === "character-options/classes/paladin").links,
      ["character-options/class-options/smite-paths/index", "rules/index", "campaigns/vyrun/index"],
    )
  } finally {
    await fs.rm(output, { recursive: true, force: true })
  }
})
