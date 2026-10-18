export interface ContentIndexPage {
  slug: string
  title: string
  links?: string[]
  [key: string]: unknown
}

export type ContentIndex = Record<string, ContentIndexPage>

export interface GraphNode {
  slug: string
  title: string
  section: string
}

export interface GraphEdge {
  source: string
  target: string
}

export interface GraphModel {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface GraphOptions {
  scope?: string
  includeCollections?: boolean
}

export function isCollectionPage(slug: string): boolean {
  return slug.endsWith(".base")
}

export function getGraphSections(index: ContentIndex): string[] {
  return [
    ...new Set(
      Object.values(index)
        .map((page) => page.slug.split("/")[0])
        .filter((section) => section && section !== "index"),
    ),
  ].sort((a, b) => a.localeCompare(b))
}

export function createGraphModel(index: ContentIndex, options: GraphOptions = {}): GraphModel {
  const includedPages = Object.values(index).filter(
    (page) =>
      (options.includeCollections || !isCollectionPage(page.slug)) &&
      (!options.scope || page.slug.split("/")[0] === options.scope),
  )
  const nodes = includedPages.map((page) => ({
    slug: page.slug,
    title: page.title || page.slug,
    section: page.slug.split("/")[0] || "root",
  }))
  const includedSlugs = new Set(nodes.map((node) => node.slug))
  const edgeKeys = new Set<string>()
  const edges: GraphEdge[] = []

  for (const page of includedPages) {
    for (const target of page.links ?? []) {
      if (!includedSlugs.has(target) || target === page.slug) continue
      const [source, destination] = page.slug < target ? [page.slug, target] : [target, page.slug]
      const key = `${source}\u0000${destination}`
      if (edgeKeys.has(key)) continue
      edgeKeys.add(key)
      edges.push({ source, target: destination })
    }
  }

  return { nodes, edges }
}

export function getNeighborhood(model: GraphModel, centerSlug: string, depth = 1): GraphModel {
  const adjacency = new Map<string, Set<string>>()
  for (const node of model.nodes) adjacency.set(node.slug, new Set())
  for (const edge of model.edges) {
    adjacency.get(edge.source)?.add(edge.target)
    adjacency.get(edge.target)?.add(edge.source)
  }
  if (!adjacency.has(centerSlug)) return { nodes: [], edges: [] }

  const included = new Set([centerSlug])
  let frontier = new Set([centerSlug])
  for (let currentDepth = 0; currentDepth < depth; currentDepth++) {
    const next = new Set<string>()
    for (const slug of frontier) {
      for (const neighbor of adjacency.get(slug) ?? []) {
        if (!included.has(neighbor)) {
          included.add(neighbor)
          next.add(neighbor)
        }
      }
    }
    frontier = next
  }

  return {
    nodes: model.nodes.filter((node) => included.has(node.slug)),
    edges: model.edges.filter((edge) => included.has(edge.source) && included.has(edge.target)),
  }
}

export function limitGraphModel(
  model: GraphModel,
  centerSlug: string,
  maxNodes: number,
): GraphModel {
  if (model.nodes.length <= maxNodes) return model

  const neighbors = new Map<string, number>()
  for (const edge of model.edges) {
    if (edge.source === centerSlug) {
      neighbors.set(edge.target, (neighbors.get(edge.target) ?? 0) + 1)
    } else if (edge.target === centerSlug) {
      neighbors.set(edge.source, (neighbors.get(edge.source) ?? 0) + 1)
    }
  }
  const included = new Set([
    centerSlug,
    ...[...neighbors]
      .sort(([slugA, degreeA], [slugB, degreeB]) => degreeB - degreeA || slugA.localeCompare(slugB))
      .slice(0, Math.max(0, maxNodes - 1))
      .map(([slug]) => slug),
  ])

  return {
    nodes: model.nodes.filter((node) => included.has(node.slug)),
    edges: model.edges.filter((edge) => included.has(edge.source) && included.has(edge.target)),
  }
}

export function searchGraphModel(model: GraphModel, query: string): GraphModel {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return model

  const matches = new Set(
    model.nodes
      .filter(
        (node) =>
          node.title.toLocaleLowerCase().includes(normalizedQuery) ||
          node.slug.toLocaleLowerCase().includes(normalizedQuery),
      )
      .map((node) => node.slug),
  )
  const included = new Set(matches)
  for (const edge of model.edges) {
    if (matches.has(edge.source)) included.add(edge.target)
    if (matches.has(edge.target)) included.add(edge.source)
  }

  return {
    nodes: model.nodes.filter((node) => included.has(node.slug)),
    edges: model.edges.filter((edge) => included.has(edge.source) && included.has(edge.target)),
  }
}
