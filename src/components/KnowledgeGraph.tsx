import React, { useRef, useEffect, useState, useMemo } from 'react';
import { archiveDb, getSourceBadgeInfo } from '../utils/archiveUtils';
import { GraphNode, GraphEdge } from '../types/archive';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Search, Sparkles } from 'lucide-react';

interface KnowledgeGraphProps {
  onSelectEntry: (entryId: string) => void;
  initialFilterMode?: 'all' | 'campaign' | 'custom';
  selectedCampaign?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  classes: '#f43f5e',         // rose-500
  subclasses: '#fb923c',      // orange-400
  races: '#10b981',           // emerald-500
  backgrounds: '#14b8a6',     // teal-500
  feats: '#3b82f6',           // blue-500
  'fighting-styles': '#06b6d4', // cyan-500
  'class-options': '#8b5cf6', // violet-500
  templates: '#ec4899',       // pink-500
  items: '#a855f7',           // purple-500
  campaigns: '#eab308',       // amber-500
  rules: '#6366f1',           // indigo-500
  guide: '#64748b',           // slate-500
  other: '#94a3b8'
};

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  onSelectEntry,
  initialFilterMode = 'all',
  selectedCampaign: propCampaign
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'campaign' | 'custom'>(initialFilterMode);
  const [activeCampaign, setActiveCampaign] = useState<string>(propCampaign || 'ra-golvek');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Pan and Zoom state
  const transformRef = useRef({ x: 0, y: 0, k: 0.85 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Filtered dataset
  const { filteredNodes, filteredEdges } = useMemo(() => {
    let nodes = archiveDb.graph.nodes;

    if (filterMode === 'campaign') {
      nodes = nodes.filter(n => 
        n.campaign === activeCampaign || 
        n.id.includes(activeCampaign) || 
        n.category === 'campaigns'
      );
    } else if (filterMode === 'custom') {
      // Homebrew and third-party only (non-SRD)
      nodes = nodes.filter(n => {
        const src = (n.source_type || '').toLowerCase();
        return src.includes('homebrew') || src.includes('third-party') || src.includes('campaign');
      });
    }

    if (categoryFilter !== 'all') {
      nodes = nodes.filter(n => n.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(n => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
    }

    // Limit to reasonable density for smooth interactive 60fps rendering if large
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) {
      nodeMap.set(n.id, { ...n });
    }

    const edges: GraphEdge[] = [];
    for (const e of archiveDb.graph.edges) {
      const sId = typeof e.source === 'string' ? e.source : (e.source as any).id;
      const tId = typeof e.target === 'string' ? e.target : (e.target as any).id;
      if (nodeMap.has(sId) && nodeMap.has(tId)) {
        edges.push({
          source: nodeMap.get(sId)!,
          target: nodeMap.get(tId)!,
          type: e.type
        });
      }
    }

    return { filteredNodes: Array.from(nodeMap.values()), filteredEdges: edges };
  }, [filterMode, activeCampaign, categoryFilter, searchQuery]);

  // Position simulation (force layout)
  useEffect(() => {
    const nodes = filteredNodes;
    const edges = filteredEdges;
    if (nodes.length === 0) return;

    const width = 1000;
    const height = 800;

    // Initialize positions in a circle/galaxy distribution if not already set
    nodes.forEach((n, i) => {
      if (n.x === undefined) {
        const angle = (i / nodes.length) * 2 * Math.PI;
        const radius = 180 + Math.random() * 260;
        n.x = width / 2 + Math.cos(angle) * radius;
        n.y = height / 2 + Math.sin(angle) * radius;
        n.vx = 0;
        n.vy = 0;
      }
      n.radius = Math.max(5, Math.min(18, 5 + (n.linkCount || 1) * 1.5));
    });

    let animationFrameId: number;
    let iteration = 0;
    const maxIterations = 180;

    function step() {
      // Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = (n2.x || 0) - (n1.x || 0);
          const dy = (n2.y || 0) - (n1.y || 0);
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          if (dist < 300) {
            const force = 120 / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            n1.vx = (n1.vx || 0) - fx;
            n1.vy = (n1.vy || 0) - fy;
            n2.vx = (n2.vx || 0) + fx;
            n2.vy = (n2.vy || 0) + fy;
          }
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const source = edge.source as GraphNode;
        const target = edge.target as GraphNode;
        if (!source || !target || source.x === undefined || target.x === undefined) continue;

        const dx = target.x - source.x;
        const dy = (target.y || 0) - (source.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 70;
        const force = (dist - targetDist) * 0.035;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        source.vx = (source.vx || 0) + fx;
        source.vy = (source.vy || 0) + fy;
        target.vx = (target.vx || 0) - fx;
        target.vy = (target.vy || 0) - fy;
      }

      // Center gravity & damping
      const cx = width / 2;
      const cy = height / 2;
      for (const n of nodes) {
        const dx = cx - (n.x || cx);
        const dy = cy - (n.y || cy);
        n.vx = (n.vx || 0) * 0.75 + dx * 0.003;
        n.vy = (n.vy || 0) * 0.75 + dy * 0.003;

        n.x = (n.x || cx) + (n.vx || 0);
        n.y = (n.y || cy) + (n.vy || 0);
      }

      iteration++;
      if (iteration < maxIterations) {
        animationFrameId = requestAnimationFrame(step);
      }
    }

    step();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [filteredNodes, filteredEdges]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      const { x, y, k } = transformRef.current;
      ctx.translate(x, y);
      ctx.scale(k, k);

      // Draw Edges
      ctx.lineWidth = 1;
      for (const e of filteredEdges) {
        const s = e.source as GraphNode;
        const t = e.target as GraphNode;
        if (s.x === undefined || s.y === undefined || t.x === undefined || t.y === undefined) continue;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);

        if (hoveredNode && (s.id === hoveredNode.id || t.id === hoveredNode.id)) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.2;
        } else {
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();
      }

      // Draw Nodes
      for (const n of filteredNodes) {
        if (n.x === undefined || n.y === undefined) continue;
        const radius = n.radius || 6;
        const color = CATEGORY_COLORS[n.category] || '#94a3b8';
        const isHovered = hoveredNode?.id === n.id;
        const isSelected = selectedNodeId === n.id;

        // Glow ring if hovered/selected
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, radius + 5, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.3)';
          ctx.fill();
        }

        // Main Node Body
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(15, 23, 42, 0.9)';
        ctx.stroke();

        // Node Label (for larger nodes or when zoomed in or hovered)
        if (k > 0.75 || radius > 10 || isHovered) {
          ctx.font = `${isHovered ? 'bold 12px' : '10px'} Inter, sans-serif`;
          ctx.fillStyle = isHovered ? '#fef08a' : 'rgba(226, 232, 240, 0.85)';
          ctx.textAlign = 'center';
          ctx.fillText(n.title, n.x, n.y + radius + 13);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [filteredNodes, filteredEdges, hoveredNode, selectedNodeId]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      transformRef.current.x = e.clientX - dragStartRef.current.x;
      transformRef.current.y = e.clientY - dragStartRef.current.y;
      return;
    }

    // Hover test
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { x, y, k } = transformRef.current;
    const graphX = (mouseX - x) / k;
    const graphY = (mouseY - y) / k;

    let found: GraphNode | null = null;
    for (const n of filteredNodes) {
      if (n.x === undefined || n.y === undefined) continue;
      const dx = graphX - n.x;
      const dy = graphY - n.y;
      const r = (n.radius || 6) + 4;
      if (dx * dx + dy * dy <= r * r) {
        found = n;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    if (hoveredNode) {
      setSelectedNodeId(hoveredNode.id);
      onSelectEntry(hoveredNode.id);
    }
  };

  const zoom = (factor: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const newK = Math.max(0.2, Math.min(3, transformRef.current.k * factor));

    transformRef.current.x = center.x - (center.x - transformRef.current.x) * (newK / transformRef.current.k);
    transformRef.current.y = center.y - (center.y - transformRef.current.y) * (newK / transformRef.current.k);
    transformRef.current.k = newK;
  };

  const resetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    transformRef.current = {
      x: canvas.width / 2 - 500 * 0.8,
      y: canvas.height / 2 - 400 * 0.8,
      k: 0.8
    };
  };

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Filter Controls */}
      <div className="p-4 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode:</span>
          </div>

          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              View All ({archiveDb.graph.nodes.length})
            </button>
            <button
              onClick={() => setFilterMode('campaign')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterMode === 'campaign'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Campaign Only
            </button>
            <button
              onClick={() => setFilterMode('custom')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterMode === 'custom'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Custom Content Only
            </button>
          </div>

          {filterMode === 'campaign' && (
            <select
              value={activeCampaign}
              onChange={(e) => setActiveCampaign(e.target.value)}
              className="bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-medium focus:outline-none"
            >
              <option value="ra-golvek">Ra Gol'vek</option>
              <option value="vyrun">Vyrun</option>
              <option value="curse-of-strahd">Curse of Strahd</option>
            </select>
          )}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="classes">Classes</option>
            <option value="subclasses">Subclasses</option>
            <option value="races">Races</option>
            <option value="feats">Feats</option>
            <option value="items">Items</option>
            <option value="class-options">Class Options</option>
            <option value="rules">Rules</option>
            <option value="campaigns">Campaigns</option>
          </select>
        </div>

        {/* Search inside Graph */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full min-h-[500px]">
        <canvas
          ref={canvasRef}
          width={1000}
          height={700}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClick}
        />

        {/* Zoom & View Controls Overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 shadow-xl backdrop-blur">
          <button
            onClick={() => zoom(1.2)}
            title="Zoom In"
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoom(0.8)}
            title="Zoom Out"
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            title="Reset View"
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur shadow-lg text-xs space-y-1.5 max-w-[220px]">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Entities ({filteredNodes.length} nodes)</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300">
            {Object.entries(CATEGORY_COLORS).slice(0, 8).map(([cat, col]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
                <span className="capitalize truncate">{cat.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hovered Node Tooltip / Preview Card */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 p-3.5 rounded-xl bg-slate-900/95 border border-amber-500/40 backdrop-blur shadow-2xl max-w-sm pointer-events-none transition-all animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <span className="font-fantasy text-sm font-bold text-amber-300">
                {hoveredNode.title}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                style={{
                  backgroundColor: `${CATEGORY_COLORS[hoveredNode.category]}25`,
                  color: CATEGORY_COLORS[hoveredNode.category]
                }}
              >
                {hoveredNode.category}
              </span>
            </div>
            {hoveredNode.source && (
              <div className="text-[11px] text-slate-400 mt-1">
                Source: <span className="text-slate-300">{hoveredNode.source}</span> ({hoveredNode.source_type})
              </div>
            )}
            <div className="text-[11px] text-slate-400 mt-1">
              Connections: <span className="text-amber-400 font-medium">{hoveredNode.linkCount || 0}</span>
            </div>
            <div className="text-[10px] text-amber-400/80 mt-2 italic">
              Click node to open full entry →
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
