import assert from "node:assert/strict"
import test from "node:test"
import {
  createGraphModel,
  getGraphSections,
  getNeighborhood,
  isCollectionPage,
  limitGraphModel,
  searchGraphModel,
  type ContentIndex,
} from "./graph-data"

const index: ContentIndex = {
  "spells/index": {
    slug: "spells/index",
    title: "Spells",
    links: ["spells/fire-bolt", "lists/spells.base"],
  },
  "spells/fire-bolt": {
    slug: "spells/fire-bolt",
    title: "Fire Bolt",
    links: ["spells/index", "spells/scorching-ray", "missing/page"],
  },
  "spells/scorching-ray": {
    slug: "spells/scorching-ray",
    title: "Scorching Ray",
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

test("collection membership is excluded by default, not removed from the source index", () => {
  assert.equal(isCollectionPage("lists/spells.base"), true)
  assert.equal(isCollectionPage("spells/fire-bolt"), false)

  const model = createGraphModel(index)
  assert.equal(
    model.nodes.some((node) => node.slug === "lists/spells.base"),
    false,
  )
  assert.deepEqual(model.edges, [
    { source: "spells/fire-bolt", target: "spells/index" },
    { source: "spells/fire-bolt", target: "spells/scorching-ray" },
  ])
  assert.equal(createGraphModel(index, { includeCollections: true }).nodes.length, 5)
})

test("graph sections are inferred from page paths", () => {
  assert.deepEqual(getGraphSections(index), ["campaigns", "lists", "spells"])
})

test("scope filters both nodes and cross-scope edges", () => {
  const model = createGraphModel(index, { scope: "spells" })
  assert.equal(model.nodes.length, 3)
  assert.ok(model.nodes.every((node) => node.section === "spells"))
  assert.equal(model.edges.length, 2)
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

test("local graph limit keeps the center and reports a real subset", () => {
  const model = createGraphModel(index)
  const neighborhood = getNeighborhood(model, "spells/fire-bolt", 1)
  const limited = limitGraphModel(neighborhood, "spells/fire-bolt", 2)
  assert.equal(limited.nodes.length, 2)
  assert.ok(limited.nodes.some((node) => node.slug === "spells/fire-bolt"))
})
