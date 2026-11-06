import React, { useRef, useEffect, useState, useMemo } from 'react';
import { archiveDb } from '../utils/archiveUtils';
import { GraphNode } from '../types/archive';
import { Search, ZoomIn, ZoomOut, RotateCcw, Filter, Sparkles, ExternalLink } from 'lucide-react';

interface KnowledgeGraphProps {
  onSelectEntry: (id: string) => void;
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  classes: '#f59e0b', // Amber
  subclasses: '#fbbf24', // Yellow Amber
  spells: '#8b5cf6', // Violet
  items: '#06b6d4', // Cyan
  campaigns: '#f43f5e', // Rose
  rules: '#3b82f6', // Blue
  races: '#10b981', // Emerald
  backgrounds: '#ec4899', // Pink
  feats: '#a855f7', // Purple
  'class-options': '#eab308', // Yellow
  monsters: '#ef4444' // Red
};

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onSelectEntry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Filter nodes
  const filteredNodes = useMemo(() => {
    let nodes = archiveDb.graph.nodes;
    if (selectedCategory !== 'all') {
      nodes = nodes.filter(n => n.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      nodes = nodes.filter(n => n.title.toLowerCase().includes(q));
    }
    // Limit to top 250 connected nodes for buttery smooth 60fps canvas performance
    return nodes
      .sort((a, b) => (b.linkCount || 0) - (a.linkCount || 0))
      .slice(0, 220);
  }, [search, selectedCategory]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return archiveDb.graph.edges.filter(
      e => typeof e.source === 'string' && typeof e.target === 'string' && activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
    );
  }, [activeNodeIds]);

  const simNodesRef = useRef<SimNode[]>([]);

  // Initialize simulation positions
  useEffect(() => {
    const width = 1000;
    const height = 700;

    simNodesRef.current = filteredNodes.map((n, i) => {
      const angle = (i / filteredNodes.length) * 2 * Math.PI;
      const radius = 180 + Math.random() * 220;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: Math.max(5, Math.min(16, 5 + Math.sqrt(n.linkCount || 1) * 2.5)),
        color: CATEGORY_COLORS[n.category] || '#94a3b8'
      };
    });
  }, [filteredNodes]);

  // Simulation and animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let iteration = 0;

    const tick = () => {
      const nodes = simNodesRef.current;
      const nodeMap = new Map<string, SimNode>();
      for (const n of nodes) nodeMap.set(n.id, n);

      // Force layout calculation for first 150 frames
      if (iteration < 160) {
        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 180) {
              const force = (180 - dist) / dist * 0.2;
              nodes[i].vx -= dx * force;
              nodes[i].vy -= dy * force;
              nodes[j].vx += dx * force;
              nodes[j].vy += dy * force;
            }
          }
        }

        // Attraction along edges
        for (const edge of filteredEdges) {
          const sId = typeof edge.source === 'string' ? edge.source : edge.source.id;
          const tId = typeof edge.target === 'string' ? edge.target : edge.target.id;
          const s = nodeMap.get(sId);
          const t = nodeMap.get(tId);
          if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 70) * 0.003;
            s.vx += dx * force;
            s.vy += dy * force;
            t.vx -= dx * force;
            t.vy -= dy * force;
          }
        }

        // Damping and center gravity
        for (const n of nodes) {
          n.vx += (500 - n.x) * 0.0008;
          n.vy += (350 - n.y) * 0.0008;
          n.vx *= 0.85;
          n.vy *= 0.85;
          n.x += n.vx;
          n.y += n.vy;
        }

        iteration++;
      }

      // Draw frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw edges
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
      ctx.beginPath();
      for (const edge of filteredEdges) {
        const sId = typeof edge.source === 'string' ? edge.source : edge.source.id;
        const tId = typeof edge.target === 'string' ? edge.target : edge.target.id;
        const s = nodeMap.get(sId);
        const t = nodeMap.get(tId);
        if (s && t) {
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
        }
      }
      ctx.stroke();

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);
        ctx.fillStyle = n.color;
        ctx.fill();

        if (hoveredNode?.id === n.id) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        }

        // Draw title if significant or hovered
        if (n.radius >= 8 || hoveredNode?.id === n.id) {
          ctx.font = '10px Inter, sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.textAlign = 'center';
          ctx.fillText(n.title, n.x, n.y + n.radius + 12);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => cancelAnimationFrame(animId);
  }, [filteredEdges, zoom, pan, hoveredNode]);

  // Handle canvas mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
      return;
    }

    // Check hit test for hover
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - pan.y) / zoom;

    const found = simNodesRef.current.find(n => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    setHoveredNode(found || null);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      onSelectEntry(hoveredNode.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Top Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-fantasy text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Interactive Knowledge Graph</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Explore {filteredNodes.length} nodes and {filteredEdges.length} connections across 5e classes, spells, items, rules, and campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search graph..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none w-40"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="classes">Classes</option>
            <option value="subclasses">Subclasses</option>
            <option value="spells">Spells</option>
            <option value="items">Items</option>
            <option value="campaigns">Campaigns</option>
            <option value="rules">Rules</option>
            <option value="races">Races</option>
            <option value="backgrounds">Backgrounds</option>
            <option value="feats">Feats</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl h-[620px]">
        <canvas
          ref={canvasRef}
          width={1000}
          height={620}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Hover Inspector Pill */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-3 shadow-2xl pointer-events-none max-w-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: hoveredNode.color }}
              />
              <span className="font-fantasy font-bold text-slate-100 text-sm">
                {hoveredNode.title}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 capitalize mt-0.5">
              {hoveredNode.category} • {hoveredNode.linkCount} connections
            </div>
            <div className="text-[10px] text-amber-400 font-semibold mt-1">
              Click node to navigate to entry →
            </div>
          </div>
        )}

        {/* Category Legend */}
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-2.5 shadow-lg text-[10px] space-y-1.5 hidden sm:block">
          {Object.entries(CATEGORY_COLORS).slice(0, 6).map(([cat, col]) => (
            <div key={cat} className="flex items-center gap-2 text-slate-300 capitalize">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
              <span>{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
