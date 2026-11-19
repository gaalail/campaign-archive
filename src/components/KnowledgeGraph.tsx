import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { archiveDb, cleanFlavorText } from '../utils/archiveUtils';
import { InlineContent } from './MarkdownView';
import { GraphEdge, GraphNode } from '../types/archive';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  X,
  Maximize2,
  SlidersHorizontal,
  Layers,
  Crosshair,
  Network,
  GitBranch,
  RefreshCw
} from 'lucide-react';

interface KnowledgeGraphProps {
  onSelectEntry: (id: string) => void;
  initialFocusId?: string | null;
}

type EdgeType = NonNullable<GraphEdge['type']>;

interface NormalizedEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  bidirectional?: boolean;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  visibleDegree: number;
  mass: number;
  color: string;
}

interface LayerFilters {
  mentions: boolean;
  subclasses: boolean;
  options: boolean;
  lore: boolean;
  spells: boolean;
  showOrphans: boolean;
}

interface ForceSettings {
  repelStrength: number;
  linkDistance: number;
  centerPull: number;
  showArrows: boolean;
  labelDensity: number; // 0.5 (fewer labels) to 2.0 (more labels)
}

const CATEGORY_COLORS: Record<string, string> = {
  classes: '#f59e0b',
  subclasses: '#fbbf24',
  spells: '#a78bfa',
  items: '#06b6d4',
  campaigns: '#fb7185',
  rules: '#38bdf8',
  races: '#10b981',
  backgrounds: '#f472b6',
  feats: '#c084fc',
  'fighting-styles': '#fb923c',
  'class-options': '#eab308',
  monsters: '#ef4444',
  pantheons: '#fde047',
  templates: '#94a3b8',
  builder: '#2dd4bf',
  guide: '#60a5fa'
};

const CATEGORY_ORDER = [
  'classes',
  'subclasses',
  'class-options',
  'fighting-styles',
  'feats',
  'races',
  'backgrounds',
  'spells',
  'items',
  'monsters',
  'campaigns',
  'pantheons',
  'rules',
  'templates',
  'builder',
  'guide'
];

const EDGE_TYPE_META: Record<EdgeType, { label: string; color: string; restFactor: number }> = {
  subclass_of: { label: 'Subclass of', color: '#f59e0b', restFactor: 0.72 },
  option_of: { label: 'Class option of', color: '#eab308', restFactor: 0.85 },
  campaign_content: { label: 'Campaign realm', color: '#fb7185', restFactor: 0.95 },
  domain_synergy: { label: 'Domain synergy', color: '#34d399', restFactor: 1.05 },
  spell_list: { label: 'Spell list', color: '#a78bfa', restFactor: 1.18 },
  deity_of: { label: 'Divine patronage', color: '#fde047', restFactor: 1.28 },
  mention: { label: 'Wikilink mention', color: '#38bdf8', restFactor: 1.0 }
};

function edgeMatchesLayers(type: EdgeType, layers: LayerFilters): boolean {
  switch (type) {
    case 'mention':
      return layers.mentions;
    case 'subclass_of':
      return layers.subclasses;
    case 'option_of':
      return layers.options;
    case 'campaign_content':
    case 'domain_synergy':
    case 'deity_of':
      return layers.lore;
    case 'spell_list':
      return layers.spells;
    default:
      return true;
  }
}

function getEdgeStyleDistance(type: EdgeType, baseDistance: number): number {
  return baseDistance * (EDGE_TYPE_META[type]?.restFactor ?? 1.0);
}

// Precompute immutable archive lookup tables once outside component renders
const ALL_GRAPH_NODES: GraphNode[] = archiveDb.graph.nodes;
const NODE_BY_ID = new Map<string, GraphNode>(ALL_GRAPH_NODES.map(n => [n.id, n]));
const ENTRY_BY_ID = new Map(archiveDb.entries.map(e => [e.id, e]));

const ALL_NORMALIZED_EDGES: NormalizedEdge[] = archiveDb.graph.edges
  .map(e => ({
    source: typeof e.source === 'string' ? e.source : e.source?.id || '',
    target: typeof e.target === 'string' ? e.target : e.target?.id || '',
    type: (e.type || 'mention') as EdgeType,
    weight: e.weight || 1,
    bidirectional: e.bidirectional
  }))
  .filter(e => e.source && e.target && e.source !== e.target && NODE_BY_ID.has(e.source) && NODE_BY_ID.has(e.target));

function stepForceSimulation(
  nodes: SimNode[],
  edges: NormalizedEdge[],
  nodeMap: Map<string, SimNode>,
  width: number,
  height: number,
  forces: ForceSettings,
  draggedNode: SimNode | null,
  alpha: number
) {
  const count = nodes.length;
  if (count === 0) return;

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRepelDist = 520;
  const maxRepelDistSq = maxRepelDist * maxRepelDist;

  // 1. Coulomb repulsion + minimum spacing collision forces
  for (let i = 0; i < count; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < count; j++) {
      const b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let distSq = dx * dx + dy * dy;

      if (distSq < 0.01) {
        // Deterministic micro-nudge to break exact coordinate coincidence
        const angle = ((i * 7 + j * 13) % 360) * (Math.PI / 180);
        dx = Math.cos(angle) * 1.5;
        dy = Math.sin(angle) * 1.5;
        distSq = dx * dx + dy * dy;
      }

      if (distSq > maxRepelDistSq) continue;

      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Inverse-square repulsion force scaled by combined node mass
      const repulseMag = ((forces.repelStrength * alpha) * (a.mass + b.mass) * 0.45) / (distSq + 180);
      if (a !== draggedNode) {
        a.vx -= nx * repulseMag;
        a.vy -= ny * repulseMag;
      }
      if (b !== draggedNode) {
        b.vx += nx * repulseMag;
        b.vy += ny * repulseMag;
      }

      // Hard non-overlapping collision envelope
      const minSpacing = a.radius + b.radius + 26 + (a.visibleDegree >= 10 || b.visibleDegree >= 10 ? 10 : 0);
      if (dist < minSpacing) {
        const overlap = minSpacing - dist;
        const push = overlap * 0.34;
        if (a !== draggedNode && b !== draggedNode) {
          const totalMass = a.mass + b.mass;
          const shareA = b.mass / totalMass;
          const shareB = a.mass / totalMass;
          a.x -= nx * push * shareA;
          a.y -= ny * push * shareA;
          b.x += nx * push * shareB;
          b.y += ny * push * shareB;
          a.vx -= nx * overlap * 0.08;
          a.vy -= ny * overlap * 0.08;
          b.vx += nx * overlap * 0.08;
          b.vy += ny * overlap * 0.08;
        } else if (a !== draggedNode) {
          a.x -= nx * overlap * 0.55;
          a.y -= ny * overlap * 0.55;
        } else if (b !== draggedNode) {
          b.x += nx * overlap * 0.55;
          b.y += ny * overlap * 0.55;
        }
      }
    }
  }

  // 2. Degree-damped link springs (prevents high-degree hubs from collapsing into hairballs)
  for (const edge of edges) {
    const s = nodeMap.get(edge.source);
    const t = nodeMap.get(edge.target);
    if (!s || !t) continue;

    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const restLen = getEdgeStyleDistance(edge.type, forces.linkDistance) + (s.radius + t.radius) * 0.6;
    const minDeg = Math.max(1, Math.min(s.visibleDegree, t.visibleDegree));
    const stiffness = (0.042 * alpha) / Math.sqrt(minDeg);
    const force = (dist - restLen) * stiffness;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (s !== draggedNode) {
      s.vx += fx;
      s.vy += fy;
    }
    if (t !== draggedNode) {
      t.vx -= fx;
      t.vy -= fy;
    }
  }

  // 3. Gentle centering gravity + viscous damping + velocity cap
  const gravity = forces.centerPull * 0.0014 * alpha;
  for (const n of nodes) {
    if (n === draggedNode) continue;
    n.vx += (centerX - n.x) * gravity;
    n.vy += (centerY - n.y) * gravity;
    n.vx *= 0.78;
    n.vy *= 0.78;

    const speed = Math.hypot(n.vx, n.vy);
    if (speed > 18) {
      n.vx = (n.vx / speed) * 18;
      n.vy = (n.vy / speed) * 18;
    }

    n.x += n.vx;
    n.y += n.vy;

    if (!Number.isFinite(n.x)) n.x = centerX;
    if (!Number.isFinite(n.y)) n.y = centerY;
  }
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  targetRadius: number,
  zoom: number,
  color: string
) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy);
  if (dist < targetRadius + 10 / zoom) return;

  const angle = Math.atan2(dy, dx);
  const tipDist = targetRadius + 2.5 / zoom;
  const tipX = toX - Math.cos(angle) * tipDist;
  const tipY = toY - Math.sin(angle) * tipDist;
  const headLen = Math.max(5, Math.min(9, 7.5 / Math.sqrt(zoom)));

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX - headLen * Math.cos(angle - Math.PI / 7),
    tipY - headLen * Math.sin(angle - Math.PI / 7)
  );
  ctx.lineTo(
    tipX - headLen * Math.cos(angle + Math.PI / 7),
    tipY - headLen * Math.sin(angle + Math.PI / 7)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onSelectEntry, initialFocusId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [graphMode, setGraphMode] = useState<'global' | 'local'>(initialFocusId ? 'local' : 'global');
  const [localDepth, setLocalDepth] = useState<1 | 2 | 3>(2);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialFocusId || null);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showForcesPanel, setShowForcesPanel] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);

  const [layers, setLayers] = useState<LayerFilters>({
    mentions: true,
    subclasses: true,
    options: true,
    lore: true,
    spells: Boolean(initialFocusId),
    showOrphans: false
  });

  const [forces, setForces] = useState<ForceSettings>({
    repelStrength: 340,
    linkDistance: 120,
    centerPull: 1.0,
    showArrows: true,
    labelDensity: 1.0
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Sync refs so the render loop reads live interaction/transform states without resetting simulation
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const hoveredRef = useRef(hoveredNodeId);
  const selectedRef = useRef(selectedNodeId);
  const forcesRef = useRef(forces);
  const searchMatchesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    hoveredRef.current = hoveredNodeId;
  }, [hoveredNodeId]);

  useEffect(() => {
    selectedRef.current = selectedNodeId;
  }, [selectedNodeId]);

  useEffect(() => {
    forcesRef.current = forces;
  }, [forces]);

  // Autofocus target node if navigated from an entry page
  useEffect(() => {
    if (initialFocusId && NODE_BY_ID.has(initialFocusId)) {
      setSelectedNodeId(initialFocusId);
      setGraphMode('local');
      setSelectedCategory('all');
      setSearch('');
      setLayers(prev => ({ ...prev, spells: true }));
    }
  }, [initialFocusId]);

  // Mouse / pointer interaction refs
  const isDraggingCanvas = useRef(false);
  const draggedNode = useRef<SimNode | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const pointerMoveDist = useRef(0);
  const simAlpha = useRef(1);
  const simNodesRef = useRef<SimNode[]>([]);
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Active edges matching selected relationship layers
  const layerEdges = useMemo(() => {
    return ALL_NORMALIZED_EDGES.filter(e => edgeMatchesLayers(e.type, layers));
  }, [layers]);

  // Adjacency across active layerEdges (used for search neighborhood + Local BFS + degree calculation)
  const layerAdjacency = useMemo(() => {
    const adj = new Map<string, Set<string>>();
    for (const e of layerEdges) {
      if (!adj.has(e.source)) adj.set(e.source, new Set());
      if (!adj.has(e.target)) adj.set(e.target, new Set());
      adj.get(e.source)!.add(e.target);
      adj.get(e.target)!.add(e.source);
    }
    return adj;
  }, [layerEdges]);

  const searchQuery = search.trim().toLowerCase();

  // Direct search matches across all graph nodes
  const searchMatchedNodes = useMemo(() => {
    if (!searchQuery) return [];
    return ALL_GRAPH_NODES.filter(n =>
      n.title.toLowerCase().includes(searchQuery) ||
      (n.parentClass && n.parentClass.toLowerCase().includes(searchQuery)) ||
      (n.category && n.category.replace('-', ' ').toLowerCase().includes(searchQuery)) ||
      (n.source && n.source.toLowerCase().includes(searchQuery))
    ).sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(searchQuery) ? 1 : 0;
      const bExact = b.title.toLowerCase().startsWith(searchQuery) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      return (layerAdjacency.get(b.id)?.size || 0) - (layerAdjacency.get(a.id)?.size || 0);
    });
  }, [searchQuery, layerAdjacency]);

  const searchMatchIds = useMemo(() => {
    const set = new Set(searchMatchedNodes.map(n => n.id));
    searchMatchesRef.current = set;
    return set;
  }, [searchMatchedNodes]);

  // Compute visible nodes and edges cleanly for Global or Local mode
  const { visibleNodes, visibleEdges, degreeInView } = useMemo(() => {
    const pickedIds = new Set<string>();

    if (graphMode === 'local' && selectedNodeId && NODE_BY_ID.has(selectedNodeId)) {
      // Breadth-first traversal out to localDepth hops
      const visited = new Map<string, number>();
      const queue: Array<{ id: string; depth: number }> = [{ id: selectedNodeId, depth: 0 }];
      visited.set(selectedNodeId, 0);

      const LOCAL_CAP = 200;
      let cursor = 0;
      while (cursor < queue.length && visited.size < LOCAL_CAP) {
        const current = queue[cursor++];
        if (current.depth >= localDepth) continue;

        const neighbors = Array.from(layerAdjacency.get(current.id) || []);
        // Sort neighbors deterministically so direct structural hubs/high-degree nodes appear first if capped
        neighbors.sort((a, b) => (layerAdjacency.get(b)?.size || 0) - (layerAdjacency.get(a)?.size || 0));

        for (const nbr of neighbors) {
          if (!visited.has(nbr)) {
            if (selectedCategory !== 'all') {
              const nbrNode = NODE_BY_ID.get(nbr);
              if (nbrNode && nbrNode.category !== selectedCategory && current.depth >= 1) continue;
            }
            visited.set(nbr, current.depth + 1);
            queue.push({ id: nbr, depth: current.depth + 1 });
            if (visited.size >= LOCAL_CAP) break;
          }
        }
      }

      for (const id of visited.keys()) pickedIds.add(id);

      // Include search matches if searching within local view
      for (const m of searchMatchedNodes.slice(0, 12)) {
        pickedIds.add(m.id);
      }
    } else {
      // Global mode
      let pool = ALL_GRAPH_NODES.slice();

      if (selectedCategory !== 'all') {
        const categoryMatches = pool.filter(n => n.category === selectedCategory);
        const catSet = new Set(categoryMatches.map(n => n.id));
        // Keep category nodes + direct 1-hop context targets (up to cap) unless orphans only
        const contextIds = new Set<string>();
        for (const n of categoryMatches.slice(0, 100)) {
          for (const nbr of layerAdjacency.get(n.id) || []) {
            if (!catSet.has(nbr)) contextIds.add(nbr);
          }
        }
        pool = pool.filter(n => catSet.has(n.id) || (contextIds.has(n.id) && (layerAdjacency.get(n.id)?.size || 0) >= 2));
      }

      if (searchQuery) {
        // Obsidian search: show matches + their 1-hop connected neighbors so edges remain intact!
        const searchCluster = new Set<string>();
        for (const m of searchMatchedNodes.slice(0, 40)) {
          searchCluster.add(m.id);
          for (const nbr of layerAdjacency.get(m.id) || []) {
            searchCluster.add(nbr);
          }
        }
        pool = pool.filter(n => searchCluster.has(n.id));
      } else if (!layers.showOrphans) {
        pool = pool.filter(n => (layerAdjacency.get(n.id)?.size || 0) > 0);
      }

      // Rank by active visible layer connections so hidden spell lists never skew ranking
      pool.sort((a, b) => {
        const aMatch = searchMatchIds.has(a.id) ? 10000 : 0;
        const bMatch = searchMatchIds.has(b.id) ? 10000 : 0;
        const aDeg = layerAdjacency.get(a.id)?.size || 0;
        const bDeg = layerAdjacency.get(b.id)?.size || 0;
        return (bMatch + bDeg) - (aMatch + aDeg);
      });

      const GLOBAL_CAP = 260;
      for (const n of pool.slice(0, GLOBAL_CAP)) {
        pickedIds.add(n.id);
      }

      // Ensure currently selected node and its direct neighbors stay visible
      if (selectedNodeId && NODE_BY_ID.has(selectedNodeId)) {
        pickedIds.add(selectedNodeId);
        for (const nbr of Array.from(layerAdjacency.get(selectedNodeId) || []).slice(0, 28)) {
          pickedIds.add(nbr);
        }
      }
    }

    const vEdges = layerEdges.filter(e => pickedIds.has(e.source) && pickedIds.has(e.target));
    const degMap = new Map<string, number>();
    for (const e of vEdges) {
      degMap.set(e.source, (degMap.get(e.source) || 0) + 1);
      degMap.set(e.target, (degMap.get(e.target) || 0) + 1);
    }

    const vNodes = Array.from(pickedIds)
      .map(id => NODE_BY_ID.get(id))
      .filter((n): n is GraphNode => Boolean(n));

    return {
      visibleNodes: vNodes,
      visibleEdges: vEdges,
      degreeInView: degMap
    };
  }, [
    graphMode,
    selectedNodeId,
    localDepth,
    layerEdges,
    layerAdjacency,
    selectedCategory,
    searchQuery,
    searchMatchedNodes,
    searchMatchIds,
    layers.showOrphans
  ]);

  // Auto-exit local mode gracefully if user clears selection in local mode
  useEffect(() => {
    if (graphMode === 'local' && !selectedNodeId) {
      setGraphMode('global');
    }
  }, [graphMode, selectedNodeId]);

  const neighborsInView = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of visibleEdges) {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    }
    return map;
  }, [visibleEdges]);

  // Fit viewport cleanly to bounding box of simulated nodes
  const fitGraphToViewport = useCallback((nodesArg?: SimNode[]) => {
    const container = containerRef.current;
    const nodes = nodesArg || simNodesRef.current;
    if (!container || nodes.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 640;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const pad = n.radius + 18;
      if (n.x - pad < minX) minX = n.x - pad;
      if (n.x + pad > maxX) maxX = n.x + pad;
      if (n.y - pad < minY) minY = n.y - pad;
      if (n.y + pad > maxY) maxY = n.y + pad;
    }

    const graphW = Math.max(120, maxX - minX);
    const graphH = Math.max(120, maxY - minY);
    const padding = 56;
    const scaleX = (width - padding * 2) / graphW;
    const scaleY = (height - padding * 2) / graphH;
    const nextZoom = Math.max(0.28, Math.min(1.65, Math.min(scaleX, scaleY)));
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    setZoom(nextZoom);
    setPan({
      x: width / 2 - midX * nextZoom,
      y: height / 2 - midY * nextZoom
    });
  }, []);

  const centerOnNode = useCallback((nodeId: string, targetZoom?: number) => {
    const container = containerRef.current;
    const node = simNodesRef.current.find(n => n.id === nodeId);
    if (!container || !node) return;
    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 640;
    const nextZoom = targetZoom ?? Math.max(1.05, zoomRef.current);
    setZoom(nextZoom);
    setPan({
      x: width / 2 - node.x * nextZoom,
      y: height / 2 - node.y * nextZoom
    });
  }, []);

  const prevInitSignatureRef = useRef<string>('');
  const prevNodeSetKeyRef = useRef<string>('');

  // Deterministic initialization + synchronous warmup ticks so Frame 1 is never a stacked pile
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 640;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodeSetKey = visibleNodes.map(n => n.id).sort().join('|');
    const localFocusKey = graphMode === 'local' ? (selectedNodeId || '') : '';
    const layoutSignature = `${graphMode}::${localFocusKey}::${localDepth}::${selectedCategory}::${searchQuery}::${layoutVersion}::${layers.mentions}:${layers.subclasses}:${layers.options}:${layers.lore}:${layers.spells}:${layers.showOrphans}`;

    // Clicking an already-rendered node in Global mode only updates highlight & Inspector
    if (nodeSetKey === prevNodeSetKeyRef.current && layoutSignature === prevInitSignatureRef.current) {
      return;
    }

    const modeOrFocusChanged =
      !prevInitSignatureRef.current ||
      !prevInitSignatureRef.current.startsWith(`${graphMode}::${localFocusKey}::`) ||
      prevInitSignatureRef.current.split('::')[5] !== String(layoutVersion);

    prevNodeSetKeyRef.current = nodeSetKey;
    prevInitSignatureRef.current = layoutSignature;

    const existingMap = new Map<string, SimNode>();
    if (!modeOrFocusChanged) {
      for (const n of simNodesRef.current) existingMap.set(n.id, n);
    }

    // Group nodes deterministically by category angular sector or BFS shells in local mode
    const hopMap = new Map<string, number>();
    if (graphMode === 'local' && selectedNodeId) {
      const q: Array<{ id: string; d: number }> = [{ id: selectedNodeId, d: 0 }];
      hopMap.set(selectedNodeId, 0);
      let idx = 0;
      while (idx < q.length) {
        const cur = q[idx++];
        for (const nbr of neighborsInView.get(cur.id) || []) {
          if (!hopMap.has(nbr)) {
            hopMap.set(nbr, cur.d + 1);
            q.push({ id: nbr, d: cur.d + 1 });
          }
        }
      }
    }

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const newSimNodes: SimNode[] = visibleNodes.map((n, idx) => {
      const visDeg = degreeInView.get(n.id) || 0;
      const radius = Math.max(4.5, Math.min(18, 4.5 + Math.log2(visDeg + 1) * 2.15));
      const mass = 1 + Math.sqrt(visDeg) * 0.45;
      const color = CATEGORY_COLORS[n.category] || '#94a3b8';

      const prev = existingMap.get(n.id);
      if (prev) {
        return {
          ...prev,
          ...n,
          visibleDegree: visDeg,
          radius,
          mass,
          color
        };
      }

      if (graphMode === 'local' && selectedNodeId) {
        if (n.id === selectedNodeId) {
          return { ...n, x: centerX, y: centerY, vx: 0, vy: 0, visibleDegree: visDeg, radius, mass, color };
        }
        const hop = hopMap.get(n.id) ?? 2;
        const angle = idx * goldenAngle;
        const ringRadius = hop === 1 ? 155 + (idx % 3) * 25 : 270 + (idx % 4) * 32;
        return {
          ...n,
          x: centerX + Math.cos(angle) * ringRadius,
          y: centerY + Math.sin(angle) * ringRadius,
          vx: 0,
          vy: 0,
          visibleDegree: visDeg,
          radius,
          mass,
          color
        };
      }

      const catIdx = Math.max(0, CATEGORY_ORDER.indexOf(n.category));
      const sectorAngle = (catIdx / CATEGORY_ORDER.length) * Math.PI * 2;
      const spreadAngle = sectorAngle + ((idx * goldenAngle) % (Math.PI * 0.7)) - Math.PI * 0.35;
      const radialDist = visDeg >= 12 ? 95 + (idx % 5) * 22 : 160 + Math.sqrt(idx + 1) * 26;

      return {
        ...n,
        x: centerX + Math.cos(spreadAngle) * radialDist,
        y: centerY + Math.sin(spreadAngle) * radialDist,
        vx: 0,
        vy: 0,
        visibleDegree: visDeg,
        radius,
        mass,
        color
      };
    });

    const nodeMap = new Map<string, SimNode>(newSimNodes.map(n => [n.id, n]));
    const warmupSteps = prefersReducedMotion ? 165 : (modeOrFocusChanged ? 105 : 45);
    let alpha = modeOrFocusChanged ? 1.0 : 0.45;
    for (let step = 0; step < warmupSteps; step++) {
      stepForceSimulation(newSimNodes, visibleEdges, nodeMap, width, height, forcesRef.current, null, alpha);
      alpha *= 0.982;
    }

    simNodesRef.current = newSimNodes;
    simAlpha.current = prefersReducedMotion ? 0 : (modeOrFocusChanged ? 0.25 : 0.16);

    if (modeOrFocusChanged) {
      fitGraphToViewport(newSimNodes);
    }
  }, [
    visibleNodes,
    visibleEdges,
    degreeInView,
    neighborsInView,
    graphMode,
    selectedNodeId,
    localDepth,
    selectedCategory,
    searchQuery,
    layers,
    layoutVersion,
    prefersReducedMotion,
    fitGraphToViewport
  ]);

  // Wake simulation gently if user adjusts force sliders
  useEffect(() => {
    if (!prefersReducedMotion) {
      simAlpha.current = Math.max(simAlpha.current, 0.45);
    }
  }, [forces.repelStrength, forces.linkDistance, forces.centerPull, prefersReducedMotion]);

  // Auto-resize canvas with DPR sharpness
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Wheel zoom centered at cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const prevZoom = zoomRef.current;
      const nextZoom = Math.max(0.22, Math.min(3.8, prevZoom * factor));
      const ratio = nextZoom / prevZoom;
      const prevPan = panRef.current;

      setZoom(nextZoom);
      setPan({
        x: mouseX - (mouseX - prevPan.x) * ratio,
        y: mouseY - (mouseY - prevPan.y) * ratio
      });
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // Simulation + Collision-free Label Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const renderFrame = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth || 1000;
      const height = container.clientHeight || 640;

      const nodes = simNodesRef.current;
      const nodeMap = new Map<string, SimNode>();
      for (const n of nodes) nodeMap.set(n.id, n);

      if ((simAlpha.current > 0.004 || draggedNode.current) && !prefersReducedMotion) {
        const activeAlpha = draggedNode.current ? Math.max(simAlpha.current, 0.25) : simAlpha.current;
        stepForceSimulation(nodes, visibleEdges, nodeMap, width, height, forcesRef.current, draggedNode.current, activeAlpha);
        if (!draggedNode.current) {
          simAlpha.current *= 0.976;
        }
      }

      const curZoom = zoomRef.current;
      const curPan = panRef.current;
      const curHover = hoveredRef.current;
      const curSelected = selectedRef.current;
      const curForces = forcesRef.current;
      const curSearchMatches = searchMatchesRef.current;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle architectural dot grid
      ctx.fillStyle = 'rgba(148, 163, 184, 0.06)';
      const gridStep = Math.max(18, 44 * curZoom);
      const startX = ((curPan.x % gridStep) + gridStep) % gridStep;
      const startY = ((curPan.y % gridStep) + gridStep) % gridStep;
      for (let gx = startX; gx < width; gx += gridStep) {
        for (let gy = startY; gy < height; gy += gridStep) {
          ctx.fillRect(gx - 0.5, gy - 0.5, 1.2, 1.2);
        }
      }

      // World transform
      ctx.save();
      ctx.translate(curPan.x, curPan.y);
      ctx.scale(curZoom, curZoom);

      const activeFocusId = curHover || curSelected;
      const activeNeighbors = activeFocusId ? neighborsInView.get(activeFocusId) : null;

      // 1. Draw Edges + Directional Arrowheads
      for (const edge of visibleEdges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;

        const isDirect = Boolean(activeFocusId && (s.id === activeFocusId || t.id === activeFocusId));
        const edgeMeta = EDGE_TYPE_META[edge.type] || EDGE_TYPE_META.mention;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);

        if (isDirect) {
          ctx.strokeStyle = edgeMeta.color;
          ctx.globalAlpha = 0.9;
          ctx.lineWidth = 2.0 / Math.sqrt(curZoom);
        } else if (activeFocusId) {
          ctx.strokeStyle = '#334155';
          ctx.globalAlpha = 0.14;
          ctx.lineWidth = 0.8 / curZoom;
        } else {
          ctx.strokeStyle =
            edge.type === 'subclass_of' || edge.type === 'campaign_content'
              ? edgeMeta.color
              : '#64748b';
          ctx.globalAlpha =
            edge.type === 'subclass_of' || edge.type === 'campaign_content' ? 0.32 : 0.22;
          ctx.lineWidth = 1.0 / curZoom;
        }
        ctx.stroke();

        // Directional arrowheads
        if (curForces.showArrows && (isDirect || (!activeFocusId && curZoom >= 0.55))) {
          ctx.globalAlpha = isDirect ? 0.95 : 0.42;
          const arrowColor = isDirect ? edgeMeta.color : '#94a3b8';
          drawArrowHead(ctx, s.x, s.y, t.x, t.y, t.radius, curZoom, arrowColor);
          if (edge.bidirectional) {
            drawArrowHead(ctx, t.x, t.y, s.x, s.y, s.radius, curZoom, arrowColor);
          }
        }
        ctx.globalAlpha = 1;
      }

      // 2. Draw Nodes
      for (const n of nodes) {
        const isHovered = curHover === n.id;
        const isSelected = curSelected === n.id;
        const isSearchMatch = curSearchMatches.has(n.id);
        const isNeighbor = Boolean(activeNeighbors?.has(n.id));
        const isDimmed = Boolean(activeFocusId && !isHovered && !isSelected && !isNeighbor && !isSearchMatch);

        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.22 : 1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Crisp separation stroke
        ctx.lineWidth = (isSelected || isHovered ? 2.4 : 1.1) / curZoom;
        ctx.strokeStyle = isSelected || isHovered ? '#ffffff' : '#07090e';
        ctx.stroke();

        if (isSelected || isHovered || isSearchMatch) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 3.5 / curZoom, 0, Math.PI * 2);
          ctx.lineWidth = 1.5 / curZoom;
          ctx.strokeStyle = isSelected ? '#f59e0b' : isSearchMatch ? '#38bdf8' : 'rgba(255,255,255,0.75)';
          ctx.stroke();
        } else if (isNeighbor) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 2 / curZoom, 0, Math.PI * 2);
          ctx.lineWidth = 1.2 / curZoom;
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();

      // 3. Draw Labels in Screen Space with Bounding-Box De-Overlapping + Crisp Halo
      const fontSize = Math.max(10.5, Math.min(13, 11 * Math.pow(curZoom, 0.15)));
      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const placedBoxes: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
      const minDegreeForAutoLabel = Math.max(1, Math.round(9 / (curZoom * curForces.labelDensity)));

      const prioritizedLabels = nodes
        .map(n => {
          const isSelected = curSelected === n.id;
          const isHovered = curHover === n.id;
          const isSearchMatch = curSearchMatches.has(n.id);
          const isNeighbor = Boolean(activeNeighbors?.has(n.id));

          let priority = 0;
          if (isHovered) priority = 10000;
          else if (isSelected) priority = 9000;
          else if (isSearchMatch) priority = 7000 + n.visibleDegree;
          else if (isNeighbor) priority = 5000 + n.visibleDegree;
          else if (!activeFocusId && (curZoom >= 1.35 || n.visibleDegree >= minDegreeForAutoLabel)) {
            priority = 100 + n.visibleDegree;
          }

          return { node: n, priority, isImportant: isSelected || isHovered || isSearchMatch || isNeighbor };
        })
        .filter(item => item.priority > 0)
        .sort((a, b) => b.priority - a.priority);

      for (const { node, isImportant } of prioritizedLabels) {
        const sx = node.x * curZoom + curPan.x;
        const sy = (node.y + node.radius) * curZoom + curPan.y + 5;

        if (sx < -80 || sx > width + 80 || sy < -30 || sy > height + 30) continue;

        const labelText = node.title.length > 28 && !isImportant ? `${node.title.slice(0, 26)}…` : node.title;
        const textWidth = ctx.measureText(labelText).width;
        const padX = 5;
        const padY = 2;
        const box = {
          x1: sx - textWidth / 2 - padX,
          x2: sx + textWidth / 2 + padX,
          y1: sy - padY,
          y2: sy + fontSize + padY
        };

        const overlaps = placedBoxes.some(
          b => !(box.x2 < b.x1 || box.x1 > b.x2 || box.y2 < b.y1 || box.y1 > b.y2)
        );
        if (overlaps && curSelected !== node.id && curHover !== node.id) continue;

        placedBoxes.push(box);

        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(7, 9, 14, 0.92)';
        ctx.strokeText(labelText, sx, sy);

        ctx.fillStyle =
          curSelected === node.id || curHover === node.id
            ? '#ffffff'
            : curSearchMatches.has(node.id)
              ? '#7dd3fc'
              : '#cbd5e1';
        ctx.fillText(labelText, sx, sy);
      }

      ctx.restore();
      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [visibleEdges, neighborsInView, prefersReducedMotion]);

  // Screen <-> World helper
  const getGraphCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: (sx - panRef.current.x) / zoomRef.current,
      y: (sy - panRef.current.y) / zoomRef.current
    };
  }, []);

  const findHitNode = useCallback((worldX: number, worldY: number): SimNode | undefined => {
    const pad = 6 / Math.max(0.5, zoomRef.current);
    // Reverse iterate so topmost rendered nodes hit first
    const nodes = simNodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = n.x - worldX;
      const dy = n.y - worldY;
      if (dx * dx + dy * dy <= (n.radius + pad) * (n.radius + pad)) {
        return n;
      }
    }
    return undefined;
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    pointerMoveDist.current = 0;

    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const hitNode = findHitNode(x, y);

    if (hitNode) {
      draggedNode.current = hitNode;
      if (!prefersReducedMotion) simAlpha.current = Math.max(simAlpha.current, 0.35);
    } else {
      isDraggingCanvas.current = true;
      dragStart.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const moved = Math.hypot(
      e.clientX - pointerDownPos.current.x,
      e.clientY - pointerDownPos.current.y
    );
    pointerMoveDist.current = Math.max(pointerMoveDist.current, moved);

    const { x, y } = getGraphCoords(e.clientX, e.clientY);

    if (draggedNode.current) {
      draggedNode.current.x = x;
      draggedNode.current.y = y;
      draggedNode.current.vx = 0;
      draggedNode.current.vy = 0;
      if (!prefersReducedMotion) simAlpha.current = Math.max(simAlpha.current, 0.28);
      return;
    }

    if (isDraggingCanvas.current) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
      return;
    }

    const hitNode = findHitNode(x, y);
    const nextHoverId = hitNode?.id || null;
    if (nextHoverId !== hoveredRef.current) {
      setHoveredNodeId(nextHoverId);
    }
  };

  const handleMouseUp = () => {
    if (draggedNode.current && !prefersReducedMotion) {
      simAlpha.current = Math.max(simAlpha.current, 0.16);
    }
    draggedNode.current = null;
    isDraggingCanvas.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Prevent drag-pan or node-drag from triggering node selection or deselection
    if (pointerMoveDist.current > 4) return;

    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const hitNode = findHitNode(x, y);

    if (hitNode) {
      setSelectedNodeId(hitNode.id);
    } else if (graphMode === 'global') {
      setSelectedNodeId(null);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getGraphCoords(e.clientX, e.clientY);
    const hitNode = findHitNode(x, y);
    if (hitNode) {
      onSelectEntry(hitNode.id);
    }
  };

  // Zoom relative to viewport center (instead of screen origin 0,0)
  const zoomAtCenter = useCallback((factor: number) => {
    const container = containerRef.current;
    const width = container?.clientWidth || 1000;
    const height = container?.clientHeight || 640;
    const cx = width / 2;
    const cy = height / 2;

    const prevZoom = zoomRef.current;
    const nextZoom = Math.max(0.22, Math.min(3.8, prevZoom * factor));
    const ratio = nextZoom / prevZoom;
    const prevPan = panRef.current;

    setZoom(nextZoom);
    setPan({
      x: cx - (cx - prevPan.x) * ratio,
      y: cy - (cy - prevPan.y) * ratio
    });
  }, []);

  const resetAll = () => {
    setSearch('');
    setSelectedCategory('all');
    setGraphMode('global');
    setSelectedNodeId(null);
    setLayoutVersion(v => v + 1);
  };

  // Selected entry + grouped full-archive relationships (so Inspector shows every true connection)
  const selectedEntry = useMemo(
    () => (selectedNodeId ? ENTRY_BY_ID.get(selectedNodeId) || null : null),
    [selectedNodeId]
  );

  const selectedConnections = useMemo(() => {
    if (!selectedNodeId) return { structural: [], outgoing: [], incoming: [], hiddenSpellCount: 0 };

    const structural: Array<{ node: GraphNode; label: string; edgeType: EdgeType }> = [];
    const outgoing: Array<{ node: GraphNode; label: string; mutual?: boolean }> = [];
    const incoming: Array<{ node: GraphNode; label: string }> = [];
    let hiddenSpellCount = 0;

    for (const edge of ALL_NORMALIZED_EDGES) {
      const isSrc = edge.source === selectedNodeId;
      const isTgt = edge.target === selectedNodeId;
      if (!isSrc && !isTgt) continue;

      if (edge.type === 'spell_list' && !layers.spells) {
        hiddenSpellCount++;
      }

      const otherId = isSrc ? edge.target : edge.source;
      const otherNode = NODE_BY_ID.get(otherId);
      if (!otherNode) continue;

      if (edge.type === 'mention') {
        if (edge.bidirectional) {
          outgoing.push({ node: otherNode, label: 'Mutual link', mutual: true });
        } else if (isSrc) {
          outgoing.push({ node: otherNode, label: 'Mentions' });
        } else {
          incoming.push({ node: otherNode, label: 'Referenced by' });
        }
      } else {
        let relationLabel = EDGE_TYPE_META[edge.type]?.label || edge.type;
        if (edge.type === 'subclass_of') {
          relationLabel = isSrc ? 'Subclass of' : 'Subclass';
        } else if (edge.type === 'option_of') {
          relationLabel = isSrc ? 'Option for' : 'Class option';
        } else if (edge.type === 'campaign_content') {
          relationLabel = isSrc ? 'Part of realm' : 'Realm content';
        } else if (edge.type === 'domain_synergy') {
          relationLabel = isSrc ? 'Favored subclass' : 'Favored by deity';
        } else if (edge.type === 'spell_list') {
          relationLabel = isSrc ? 'Available to' : 'Spell on list';
        } else if (edge.type === 'deity_of') {
          relationLabel = isSrc ? 'Worshipped by' : 'Patron deity';
        }
        structural.push({ node: otherNode, label: relationLabel, edgeType: edge.type });
      }
    }

    const byTitle = (a: { node: GraphNode }, b: { node: GraphNode }) => a.node.title.localeCompare(b.node.title);
    structural.sort((a, b) => {
      if (a.edgeType !== b.edgeType) return a.edgeType.localeCompare(b.edgeType);
      return byTitle(a, b);
    });
    outgoing.sort(byTitle);
    incoming.sort(byTitle);

    return { structural, outgoing, incoming, hiddenSpellCount };
  }, [selectedNodeId, layers.spells]);

  const hoveredNode = useMemo(
    () => (hoveredNodeId ? NODE_BY_ID.get(hoveredNodeId) || null : null),
    [hoveredNodeId]
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchMatchedNodes.length > 0) {
      const top = searchMatchedNodes[0];
      setSelectedNodeId(top.id);
      centerOnNode(top.id, Math.max(1.15, zoomRef.current));
    }
  };

  const canvasCursorClass = draggedNode.current || isDraggingCanvas.current
    ? 'cursor-grabbing'
    : hoveredNodeId
      ? 'cursor-pointer'
      : 'cursor-grab';

  return (
    <div className="max-w-7xl mx-auto space-y-3">
      {/* Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 md:p-4 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Identity & Telemetry */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-fantasy text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
              <Network className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Knowledge Graph</span>
            </h1>
            <span className="font-mono tabular-nums text-xs text-slate-400">
              {visibleNodes.length} nodes · {visibleEdges.length} edges
              {graphMode === 'local' ? ` · ${localDepth}-hop local` : ` · ${ALL_GRAPH_NODES.length} indexed`}
            </span>
          </div>

          {/* Primary Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Global vs Local Scope */}
            <div className="inline-flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setGraphMode('global')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  graphMode === 'global'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Global
              </button>
              <button
                onClick={() => {
                  if (selectedNodeId) {
                    setGraphMode('local');
                    setLayers(prev => ({ ...prev, spells: true }));
                  }
                }}
                disabled={!selectedNodeId}
                title={selectedNodeId ? 'Isolate local neighborhood around selected node' : 'Select a node first to open Local Graph'}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  graphMode === 'local'
                    ? 'bg-amber-500 text-slate-950'
                    : selectedNodeId
                      ? 'text-slate-300 hover:text-slate-100'
                      : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <GitBranch className="w-3 h-3" />
                <span>Local</span>
              </button>
            </div>

            {/* Depth control in Local mode */}
            {graphMode === 'local' && (
              <div className="inline-flex items-center bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-0.5 text-xs font-mono tabular-nums">
                <span className="text-slate-500 mr-1.5 text-[11px]">Depth</span>
                {([1, 2, 3] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setLocalDepth(d)}
                    className={`w-6 h-6 rounded text-center transition-colors ${
                      localDepth === d ? 'bg-slate-800 text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Focus or search node…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none w-44 md:w-52"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Quick match selector while searching */}
              {searchQuery && searchMatchedNodes.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-800/80">
                  {searchMatchedNodes.slice(0, 8).map(match => (
                    <button
                      key={match.id}
                      onClick={() => {
                        setSelectedNodeId(match.id);
                        centerOnNode(match.id, 1.15);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="truncate text-slate-200 font-medium">{match.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 capitalize">
                        {match.category.replace('-', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-amber-500 focus:outline-none"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="classes">Classes</option>
              <option value="subclasses">Subclasses</option>
              <option value="class-options">Class Options</option>
              <option value="fighting-styles">Fighting Styles</option>
              <option value="feats">Feats</option>
              <option value="races">Races</option>
              <option value="backgrounds">Backgrounds</option>
              <option value="spells">Spells</option>
              <option value="items">Items</option>
              <option value="monsters">Monsters</option>
              <option value="campaigns">Campaigns</option>
              <option value="pantheons">Pantheons & Deities</option>
              <option value="rules">Rules</option>
            </select>

            {/* Layer Filters & Forces Toggles */}
            <button
              onClick={() => {
                setShowFiltersPanel(v => !v);
                setShowForcesPanel(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showFiltersPanel
                  ? 'bg-slate-800 border-amber-500/60 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>

            <button
              onClick={() => {
                setShowForcesPanel(v => !v);
                setShowFiltersPanel(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showForcesPanel
                  ? 'bg-slate-800 border-amber-500/60 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Forces</span>
            </button>

            {/* Viewport Controls */}
            <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => zoomAtCenter(1.22)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => zoomAtCenter(0.82)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fitGraphToViewport()}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Fit Graph to Screen"
                aria-label="Fit Graph to Screen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              {selectedNodeId && (
                <button
                  onClick={() => centerOnNode(selectedNodeId)}
                  className="p-1.5 hover:bg-slate-800 rounded text-amber-400 hover:text-amber-300 transition-colors"
                  title="Center Selected Node"
                  aria-label="Center Selected Node"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={resetAll}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset Graph View"
                aria-label="Reset Graph View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Relationship Layers Drawer */}
        {showFiltersPanel && (
          <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500">
              Connection Types
            </span>
            {[
              { key: 'mentions', label: 'Wikilink Mentions', color: '#38bdf8' },
              { key: 'subclasses', label: 'Subclasses', color: '#f59e0b' },
              { key: 'options', label: 'Class Options', color: '#eab308' },
              { key: 'lore', label: 'Campaigns & Deities', color: '#fb7185' },
              { key: 'spells', label: 'Spell Lists (575)', color: '#a78bfa' },
              { key: 'showOrphans', label: 'Show Unlinked Nodes', color: '#94a3b8' }
            ].map(item => {
              const checked = layers[item.key as keyof LayerFilters];
              return (
                <label key={item.key} className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e =>
                      setLayers(prev => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    className="accent-amber-500 rounded border-slate-700 bg-slate-950"
                  />
                  <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: item.color }} />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Obsidian Physics Forces Drawer */}
        {showForcesPanel && (
          <div className="pt-2.5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs items-center">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Repel Force</span>
                <span className="font-mono tabular-nums text-slate-300">{forces.repelStrength}</span>
              </div>
              <input
                type="range"
                min={140}
                max={680}
                step={20}
                value={forces.repelStrength}
                onChange={e => setForces(f => ({ ...f, repelStrength: Number(e.target.value) }))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Link Distance</span>
                <span className="font-mono tabular-nums text-slate-300">{forces.linkDistance}px</span>
              </div>
              <input
                type="range"
                min={60}
                max={220}
                step={10}
                value={forces.linkDistance}
                onChange={e => setForces(f => ({ ...f, linkDistance: Number(e.target.value) }))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Center Gravity</span>
                <span className="font-mono tabular-nums text-slate-300">{forces.centerPull.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={2.4}
                step={0.1}
                value={forces.centerPull}
                onChange={e => setForces(f => ({ ...f, centerPull: Number(e.target.value) }))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Label Threshold</span>
                <span className="font-mono tabular-nums text-slate-300">{forces.labelDensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={forces.labelDensity}
                onChange={e => setForces(f => ({ ...f, labelDensity: Number(e.target.value) }))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={forces.showArrows}
                  onChange={e => setForces(f => ({ ...f, showArrows: e.target.checked }))}
                  className="accent-amber-500"
                />
                <span>Arrows</span>
              </label>

              <button
                onClick={() => setLayoutVersion(v => v + 1)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-layout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Graph Viewport + Inspector Drawer */}
      <div className="relative rounded-xl border border-slate-800 bg-[#07090e] overflow-hidden h-[680px]">
        <div ref={containerRef} className="w-full h-full">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={`w-full h-full block ${canvasCursorClass}`}
          />
        </div>

        {/* Empty state */}
        {visibleNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 text-center max-w-sm pointer-events-auto space-y-2">
              <div className="text-sm font-semibold text-slate-200">No matching nodes in current view</div>
              <p className="text-xs text-slate-400">
                Enable Spell Lists, turn on Show Unlinked Nodes, or clear your search filter.
              </p>
              <button
                onClick={() => setLayers(prev => ({ ...prev, spells: true, showOrphans: true }))}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors"
              >
                Show All Layers & Unlinked
              </button>
            </div>
          </div>
        )}

        {/* Clickable Category Legend (Desktop) */}
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[11px] hidden md:block max-w-[230px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Categories
            </span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-[10px] text-amber-400 hover:text-amber-300"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {CATEGORY_ORDER.slice(0, 12).map(cat => {
              const col = CATEGORY_COLORS[cat] || '#94a3b8';
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(prev => (prev === cat ? 'all' : cat))}
                  className={`flex items-center gap-1.5 text-left capitalize transition-colors truncate ${
                    active ? 'text-amber-300 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: col }} />
                  <span className="truncate">{cat.replace('-', ' ')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zoom / Interaction Telemetry Readout */}
        <div className="absolute bottom-3 right-3 pointer-events-none hidden sm:flex items-center gap-3 bg-slate-900/85 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono tabular-nums text-slate-400">
          <span>ZOOM {(zoom * 100).toFixed(0)}%</span>
          <span>·</span>
          <span>Click inspect · Drag move · Double-click open</span>
        </div>

        {/* Hover Tooltip (No selected drawer open) */}
        {hoveredNode && !selectedNodeId && (
          <div
            className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700 rounded-lg px-3 py-2.5 pointer-events-none max-w-xs border-l-2"
            style={{ borderLeftColor: CATEGORY_COLORS[hoveredNode.category] || '#94a3b8' }}
          >
            <div className="text-sm font-semibold text-slate-100 font-fantasy leading-snug">
              {hoveredNode.title}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 capitalize font-mono tabular-nums">
              {hoveredNode.category.replace('-', ' ')}
              {hoveredNode.parentClass ? ` · ${hoveredNode.parentClass}` : ''}
              {' · '}
              {hoveredNode.linkCount} total links
            </div>
          </div>
        )}

        {/* Obsidian Node Inspector Drawer */}
        {selectedEntry && (
          <div
            className="absolute top-3 right-3 bottom-3 w-80 sm:w-96 bg-slate-900/95 border border-slate-700 rounded-xl flex flex-col z-20 overflow-hidden"
            style={{ borderTop: `2px solid ${CATEGORY_COLORS[selectedEntry.category] || '#f59e0b'}` }}
          >
            {/* Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-start justify-between gap-2 bg-slate-950/70">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 truncate">
                  {selectedEntry.category.replace('-', ' ')}
                  {selectedEntry.parentClass ? ` · ${selectedEntry.parentClass}` : ''}
                </div>
                <h3 className="font-fantasy text-lg font-bold text-slate-100 leading-tight mt-0.5 truncate">
                  {selectedEntry.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setGraphMode('global');
                }}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                aria-label="Close inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope Action Strip */}
            <div className="px-3.5 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => {
                  if (graphMode === 'local') {
                    setGraphMode('global');
                  } else {
                    setGraphMode('local');
                    setLayers(prev => ({ ...prev, spells: true }));
                  }
                }}
                className="px-2.5 py-1 rounded-md border border-slate-700 hover:border-amber-500/60 bg-slate-900 text-slate-200 hover:text-amber-300 flex items-center gap-1.5 font-medium transition-colors"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>{graphMode === 'local' ? 'Back to Global Graph' : 'Focus Local Graph'}</span>
              </button>

              <button
                onClick={() => centerOnNode(selectedEntry.id, Math.max(1.15, zoomRef.current))}
                className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1 transition-colors"
                title="Center viewport on node"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Center</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-3.5 space-y-4 overflow-y-auto flex-1 text-xs">
              {selectedEntry.flavor ? (
                <div className="italic text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-2.5">
                  <InlineContent text={cleanFlavorText(selectedEntry.flavor)} onNavigate={onSelectEntry} />
                </div>
              ) : selectedEntry.summary ? (
                <div className="text-slate-300 leading-relaxed">
                  <InlineContent text={cleanFlavorText(selectedEntry.summary)} onNavigate={onSelectEntry} />
                </div>
              ) : null}

              {/* Crisp Typographic Metadata (Zero Pills) */}
              {(selectedEntry.source || selectedEntry.hit_die || (selectedEntry.level !== null && selectedEntry.level !== undefined)) && (
                <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-800/80 pt-2.5">
                  {selectedEntry.source && <span>Source: <strong className="text-slate-200 font-medium">{selectedEntry.source}</strong></span>}
                  {selectedEntry.hit_die && <span>Hit Die: <strong className="text-slate-200 font-medium">{selectedEntry.hit_die}</strong></span>}
                  {selectedEntry.level !== null && selectedEntry.level !== undefined && (
                    <span>Level: <strong className="text-slate-200 font-medium">{selectedEntry.level === 0 ? 'Cantrip' : selectedEntry.level}</strong></span>
                  )}
                </div>
              )}

              {/* Hidden Spell List Notice */}
              {selectedConnections.hiddenSpellCount > 0 && (
                <div className="flex items-center justify-between gap-2 border border-violet-500/30 bg-violet-950/20 rounded-lg px-2.5 py-2 text-[11px] text-violet-200">
                  <span className="font-mono tabular-nums">{selectedConnections.hiddenSpellCount} spell-list links hidden</span>
                  <button
                    onClick={() => setLayers(prev => ({ ...prev, spells: true }))}
                    className="text-violet-300 hover:text-white font-semibold underline underline-offset-2"
                  >
                    Show Spells
                  </button>
                </div>
              )}

              {/* Grouped Obsidian Connections */}
              <div className="space-y-3 pt-1 border-t border-slate-800">
                {selectedConnections.structural.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Structural Relationships ({selectedConnections.structural.length})
                    </div>
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                      {selectedConnections.structural.map((conn, idx) => (
                        <button
                          key={`${conn.node.id}-${idx}`}
                          onClick={() => setSelectedNodeId(conn.node.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800/90 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-slate-200 group-hover:text-amber-300 truncate">
                              {conn.node.title}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span style={{ color: EDGE_TYPE_META[conn.edgeType]?.color }}>{conn.label}</span>
                              <span>·</span>
                              <span className="capitalize">{conn.node.category.replace('-', ' ')}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedConnections.outgoing.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Outgoing Links ({selectedConnections.outgoing.length})
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {selectedConnections.outgoing.map(conn => (
                        <button
                          key={conn.node.id}
                          onClick={() => setSelectedNodeId(conn.node.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800/90 hover:border-sky-500/40 transition-colors flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-slate-200 group-hover:text-sky-300 truncate">
                              {conn.node.title}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {conn.mutual ? 'Mutual link · ' : ''}
                              {conn.node.category.replace('-', ' ')}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-300 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedConnections.incoming.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Linked Backlinks ({selectedConnections.incoming.length})
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {selectedConnections.incoming.map(conn => (
                        <button
                          key={conn.node.id}
                          onClick={() => setSelectedNodeId(conn.node.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800/90 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-slate-200 group-hover:text-amber-300 truncate">
                              {conn.node.title}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {conn.node.category.replace('-', ' ')}
                            </div>
                          </div>
                          <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedConnections.structural.length === 0 &&
                  selectedConnections.outgoing.length === 0 &&
                  selectedConnections.incoming.length === 0 && (
                    <div className="text-slate-500 italic text-[11px]">
                      No direct cross-references recorded for this entry.
                    </div>
                  )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80">
              <button
                onClick={() => onSelectEntry(selectedEntry.id)}
                className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open Compendium Entry</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
