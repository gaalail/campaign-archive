import assert from "node:assert/strict"
import test from "node:test"
import {
  createAreaDetailModel,
  createAreaGraphModel,
  createGraphModel,
  createNeighborhoodModel,
  getGraphArea,
  getGraphAreas,
  getNeighborhood,
  isCollectionPage,
  searchGraphModel,
  type ContentIndex,
} from "./graph-data"

const index: ContentIndex = {
  spells: {
    slug: "spells/index",
    title: "Spells",
    links: ["spells/fire-bolt", "lists/spells.base"],
  },
  "spells/fire-bolt": {
    slug: "spells/fire-bolt",
    title: "Fire Bolt",
    links: [
      "spells/index",
      "spells/scorching-ray",
      "character-options/classes/wizard",
      "missing/page",
    ],
  },
  "spells/scorching-ray": {
    slug: "spells/scorching-ray",
    title: "Scorching Ray",
    links: [],
  },
  "character-options/classes/wizard": {
    slug: "character-options/classes/wizard",
    title: "Wizard",
    links: ["items/potion"],
  },
  "character-options/classes/sorcerer": {
    slug: "character-options/classes/sorcerer",
    title: "Sorcerer",
    links: [],
  },
  "items/potion": {
    slug: "items/potion",
    title: "Potion",
    links: [],
  },
  "lists/spells.base": {
    slug: "lists/spells.base",
    title: "All Spells",
    links: ["spells/fire-bolt", "spells/scorching-ray"],
  },
  "campaigns/one": {
    slug: "campaigns/one",
    title: "Campaign One",
    links: [],
  },
}

test("areas correspond to parent folders, including index pages", () => {
  assert.equal(getGraphArea("spells/index"), "spells")
  assert.equal(getGraphArea("spells/fire-bolt"), "spells")
  assert.equal(getGraphArea("character-options/classes/wizard"), "character-options/classes")
  assert.deepEqual(
    getGraphAreas(index).map((area) => area.id),
    ["campaigns", "character-options/classes", "items", "spells"],
  )
})

test("archive overview aggregates cross-area page links without generated collections", () => {
  const model = createAreaGraphModel(index)
  assert.deepEqual(
    model.edges.map((edge) => [edge.source, edge.target, edge.count]),
    [
      ["character-options/classes", "spells", 1],
      ["character-options/classes", "items", 1],
    ],
  )
  assert.equal(model.nodes.find((node) => node.id === "spells")?.pageCount, 3)
  assert.equal(
    createAreaGraphModel(index).nodes.some((node) => node.id === "lists"),
    false,
  )
})

test("area detail preserves links across areas and excludes unrelated context-only edges", () => {
  const model = createAreaDetailModel(index, "spells")
  assert.deepEqual(
    model.nodes.map((node) => [node.slug, node.contextOnly, node.kind]),
    [
      ["spells/index", false, "page"],
      ["spells/fire-bolt", false, "page"],
      ["spells/scorching-ray", false, "page"],
      ["@area:character-options/classes", true, "area"],
    ],
  )
  assert.deepEqual(model.edges, [
    { source: "spells/fire-bolt", target: "spells/index" },
    { source: "spells/fire-bolt", target: "spells/scorching-ray" },
    {
      source: "spells/fire-bolt",
      target: "@area:character-options/classes",
      count: 1,
    },
  ])
  assert.equal(model.contextPageCount, 1)
  assert.equal(model.contextAreaCount, 1)
  assert.equal(model.crossAreaConnectionCount, 1)
  assert.equal(createAreaDetailModel(index, "spells", true).contextPageCount, 2)
})

test("collection membership is excluded by default, not removed from the source index", () => {
  assert.equal(isCollectionPage("lists/spells.base"), true)
  assert.equal(isCollectionPage("spells/fire-bolt"), false)

  const model = createGraphModel(index)
  assert.equal(
    model.nodes.some((node) => node.slug === "lists/spells.base"),
    false,
  )
  assert.ok(
    model.edges.some(
      (edge) =>
        edge.source === "character-options/classes/wizard" && edge.target === "spells/fire-bolt",
    ),
  )
  assert.equal(createGraphModel(index, true).nodes.length, 8)
})

test("local neighborhood follows links in either direction to the requested depth", () => {
  const model = createGraphModel(index)
  assert.deepEqual(
    getNeighborhood(model, "spells/scorching-ray", 1).nodes.map((node) => node.slug),
    ["spells/fire-bolt", "spells/scorching-ray"],
  )
  assert.equal(getNeighborhood(model, "missing/page").nodes.length, 0)
})

test("search retains matching pages and their immediate context", () => {
  const result = searchGraphModel(createGraphModel(index), "scorching")
  assert.deepEqual(
    result.nodes.map((node) => node.slug),
    ["spells/fire-bolt", "spells/scorching-ray"],
  )
  assert.equal(result.edges.length, 1)
  assert.equal(searchGraphModel(createGraphModel(index), "unknown").nodes.length, 0)
})

test("large page neighborhoods summarize linked pages by content area", () => {
  const highDegreeIndex: ContentIndex = {
    "classes/wizard": {
      slug: "classes/wizard",
      title: "Wizard",
      links: [
        "spells/1st-level/alarm",
        "spells/1st-level/bless",
        "spells/2nd-level/darkness",
        "items/potion",
        "items/ring",
        "items/scroll",
      ],
    },
    "spells/1st-level/alarm": {
      slug: "spells/1st-level/alarm",
      title: "Alarm",
    },
    "spells/1st-level/bless": {
      slug: "spells/1st-level/bless",
      title: "Bless",
    },
    "spells/2nd-level/darkness": {
      slug: "spells/2nd-level/darkness",
      title: "Darkness",
    },
    "items/potion": { slug: "items/potion", title: "Potion" },
    "items/ring": { slug: "items/ring", title: "Ring" },
    "items/scroll": { slug: "items/scroll", title: "Scroll" },
  }
  const model = createNeighborhoodModel(highDegreeIndex, "classes/wizard", false, 3)

  assert.equal(model.collapsed, true)
  assert.equal(model.nodes.length, 4)
  assert.equal(model.contextPageCount, 6)
  assert.equal(model.contextAreaCount, 3)
  assert.deepEqual(
    model.edges.map((edge) => edge.count).sort((a, b) => (a ?? 0) - (b ?? 0)),
    [1, 2, 3],
  )
})
