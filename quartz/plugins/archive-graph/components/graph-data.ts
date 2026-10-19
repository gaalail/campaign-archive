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
  area: string
  contextOnly?: boolean
  kind?: "page" | "area"
  pageCount?: number
}

export interface GraphEdge {
  source: string
  target: string
  count?: number
}

export interface GraphModel {
  nodes: GraphNode[]
  edges: GraphEdge[]
  contextPageCount?: number
  contextAreaCount?: number
  crossAreaConnectionCount?: number
  collapsed?: boolean
}

export interface GraphAreaNode {
  id: string
  title: string
  section: string
  pageCount: number
}

export interface GraphAreaEdge {
  source: string
  target: string
  count: number
}

export interface GraphAreaModel {
  nodes: GraphAreaNode[]
  edges: GraphAreaEdge[]
}

export function isCollectionPage(slug: string): boolean {
  return slug.endsWith(".base")
}

export function getGraphArea(slug: string): string {
  const parts = slug.split("/")
  parts.pop()
  return parts.join("/") || slug
}

function includedPages(index: ContentIndex, includeCollections: boolean): ContentIndexPage[] {
  return Object.values(index).filter((page) => includeCollections || !isCollectionPage(page.slug))
}

function createNodes(pages: ContentIndexPage[], contextSlugs = new Set<string>()): GraphNode[] {
  return pages.map((page) => ({
    slug: page.slug,
    title: page.title || page.slug,
    section: page.slug.split("/")[0] || "root",
    area: getGraphArea(page.slug),
    contextOnly: contextSlugs.has(page.slug),
    kind: "page",
  }))
}

function createEdges(pages: ContentIndexPage[], includedSlugs: Set<string>): GraphEdge[] {
  const edgeKeys = new Set<string>()
  const edges: GraphEdge[] = []

  for (const page of pages) {
    for (const target of page.links ?? []) {
      if (!includedSlugs.has(target) || target === page.slug) continue
      const [source, destination] = page.slug < target ? [page.slug, target] : [target, page.slug]
      const key = `${source}\u0000${destination}`
      if (edgeKeys.has(key)) continue
      edgeKeys.add(key)
      edges.push({ source, target: destination })
    }
  }

  return edges
}

export function getGraphAreas(index: ContentIndex): GraphAreaNode[] {
  const pagesByArea = new Map<string, ContentIndexPage[]>()
  for (const page of includedPages(index, false)) {
    const area = getGraphArea(page.slug)
    pagesByArea.set(area, [...(pagesByArea.get(area) ?? []), page])
  }

  return [...pagesByArea]
    .map(([id, pages]) => {
      const indexPage = index[`${id}/index`] ?? index[id]
      return {
        id,
        title:
          indexPage?.title ||
          id
            .split("/")
            .map((part) => part.replace(/-/g, " "))
            .join(" / "),
        section: id.split("/")[0] || "root",
        pageCount: pages.length,
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

export function createAreaGraphModel(index: ContentIndex): GraphAreaModel {
  const pages = includedPages(index, false)
  const areas = getGraphAreas(index)
  const areaIds = new Set(areas.map((area) => area.id))
  const pageBySlug = new Map(pages.map((page) => [page.slug, page]))
  const edgeCounts = new Map<string, number>()
  const seenPageEdges = new Set<string>()

  for (const page of pages) {
    for (const target of page.links ?? []) {
      const targetPage = pageBySlug.get(target)
      if (!targetPage || target === page.slug) continue
      const [firstSlug, secondSlug] = page.slug < target ? [page.slug, target] : [target, page.slug]
      const pageEdgeKey = `${firstSlug}\u0000${secondSlug}`
      if (seenPageEdges.has(pageEdgeKey)) continue
      seenPageEdges.add(pageEdgeKey)

      const sourceArea = getGraphArea(page.slug)
      const targetArea = getGraphArea(target)
      if (sourceArea === targetArea || !areaIds.has(sourceArea) || !areaIds.has(targetArea))
        continue
      const [source, destination] =
        sourceArea < targetArea ? [sourceArea, targetArea] : [targetArea, sourceArea]
      const areaEdgeKey = `${source}\u0000${destination}`
      edgeCounts.set(areaEdgeKey, (edgeCounts.get(areaEdgeKey) ?? 0) + 1)
    }
  }

  return {
    nodes: areas,
    edges: [...edgeCounts].map(([key, count]) => {
      const [source, target] = key.split("\u0000")
      return { source, target, count }
    }),
  }
}

export function createAreaDetailModel(
  index: ContentIndex,
  area: string,
  includeCollections = false,
): GraphModel {
  const pages = includedPages(index, includeCollections)
  const areaPages = pages.filter((page) => getGraphArea(page.slug) === area)
  const areaSlugs = new Set(areaPages.map((page) => page.slug))
  const pageBySlug = new Map(pages.map((page) => [page.slug, page]))
  const externalPagesByArea = new Map<string, Set<string>>()
  const externalLinksByPageAndArea = new Map<string, Set<string>>()
  const seenCrossAreaLinks = new Set<string>()

  for (const page of pages) {
    for (const target of page.links ?? []) {
      if (!pageBySlug.has(target) || target === page.slug) continue
      const pageIsInArea = areaSlugs.has(page.slug)
      const targetIsInArea = areaSlugs.has(target)
      if (pageIsInArea === targetIsInArea) continue

      const [firstSlug, secondSlug] = page.slug < target ? [page.slug, target] : [target, page.slug]
      const pagePairKey = `${firstSlug}\u0000${secondSlug}`
      if (seenCrossAreaLinks.has(pagePairKey)) continue
      seenCrossAreaLinks.add(pagePairKey)

      const areaSlug = pageIsInArea ? page.slug : target
      const externalSlug = pageIsInArea ? target : page.slug
      const externalArea = getGraphArea(externalSlug)
      externalPagesByArea.set(
        externalArea,
        (externalPagesByArea.get(externalArea) ?? new Set()).add(externalSlug),
      )
      const groupedLinkKey = `${areaSlug}\u0000${externalArea}`
      externalLinksByPageAndArea.set(
        groupedLinkKey,
        (externalLinksByPageAndArea.get(groupedLinkKey) ?? new Set()).add(externalSlug),
      )
    }
  }

  const indexPages = new Map(pages.map((page) => [page.slug, page]))
  const contextNodes = [...externalPagesByArea].map(([externalArea, linkedPages]) => {
    const areaPage = indexPages.get(`${externalArea}/index`) ?? indexPages.get(externalArea)
    return {
      slug: `@area:${externalArea}`,
      title:
        areaPage?.title ||
        externalArea
          .split("/")
          .map((part) => part.replace(/-/g, " "))
          .join(" / "),
      section: externalArea.split("/")[0] || "root",
      area: externalArea,
      contextOnly: true,
      kind: "area" as const,
      pageCount: linkedPages.size,
    }
  })
  const contextEdges: GraphEdge[] = [...externalLinksByPageAndArea].map(([key, linkedPages]) => {
    const [pageSlug, externalArea] = key.split("\u0000")
    return {
      source: pageSlug,
      target: `@area:${externalArea}`,
      count: linkedPages.size,
    }
  })
  const internalEdges = createEdges(areaPages, areaSlugs)

  return {
    nodes: [...createNodes(areaPages), ...contextNodes],
    edges: [...internalEdges, ...contextEdges],
    contextPageCount: [...externalPagesByArea.values()].reduce(
      (count, pages) => count + pages.size,
      0,
    ),
    contextAreaCount: externalPagesByArea.size,
    crossAreaConnectionCount: seenCrossAreaLinks.size,
  }
}

export function createGraphModel(index: ContentIndex, includeCollections = false): GraphModel {
  const pages = includedPages(index, includeCollections)
  const nodes = createNodes(pages)
  const includedSlugs = new Set(nodes.map((node) => node.slug))
  return { nodes, edges: createEdges(pages, includedSlugs) }
}

export function createNeighborhoodModel(
  index: ContentIndex,
  centerSlug: string,
  includeCollections = false,
  maxIndividualNeighbors = 45,
): GraphModel {
  const model = getNeighborhood(createGraphModel(index, includeCollections), centerSlug)
  if (!model.nodes.length || model.nodes.length - 1 <= maxIndividualNeighbors) return model

  const center = model.nodes.find((node) => node.slug === centerSlug)
  if (!center) return model
  const neighbors = model.nodes.filter((node) => node.slug !== centerSlug)
  const neighborsByArea = new Map<string, GraphNode[]>()
  for (const node of neighbors) {
    neighborsByArea.set(node.area, [...(neighborsByArea.get(node.area) ?? []), node])
  }

  const contextNodes: GraphNode[] = [...neighborsByArea].map(([area, areaNeighbors]) => {
    const page = index[`${area}/index`] ?? index[area]
    return {
      slug: `@area:${area}`,
      title:
        page?.title ||
        area
          .split("/")
          .map((part) => part.replace(/-/g, " "))
          .join(" / "),
      section: area.split("/")[0] || "root",
      area,
      contextOnly: true,
      kind: "area",
      pageCount: areaNeighbors.length,
    }
  })
  const edges: GraphEdge[] = [...neighborsByArea].map(([area, areaNeighbors]) => ({
    source: centerSlug,
    target: `@area:${area}`,
    count: areaNeighbors.length,
  }))

  return {
    nodes: [center, ...contextNodes],
    edges,
    contextPageCount: neighbors.length,
    contextAreaCount: neighborsByArea.size,
    collapsed: true,
  }
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
