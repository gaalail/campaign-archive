import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { archiveDb, getSourceBadgeInfo, cleanFlavorText } from '../utils/archiveUtils';
import { InlineContent } from './MarkdownView';
import { GraphNode } from '../types/archive';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  X,
  Compass,
  Maximize2
} from 'lucide-react';

interface KnowledgeGraphProps {
  onSelectEntry: (id: string) => void;
  initialFocusId?: string | null;
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
  spells: '#a78bfa', // Purple / Violet
  items: '#06b6d4', // Cyan
  campaigns: '#f43f5e', // Rose
  rules: '#38bdf8', // Light Blue
  races: '#10b981', // Emerald
  backgrounds: '#f472b6', // Pink
  feats: '#c084fc', // Lilac
  'class-options': '#eab308', // Gold
  monsters: '#ef4444' // Red
};

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onSelectEntry, initialFocusId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialFocusId || null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Autofocus target node if specified
  useEffect(() => {
    if (initialFocusId) {
      setSelectedNodeId(initialFocusId);
      const targetNode = archiveDb.entries.find(e => e.id === initialFocusId);
      if (targetNode && selectedCategory !== 'all' && targetNode.category !== selectedCategory) {
        setSelectedCategory('all');
      }
    }
  }, [initialFocusId, selectedCategory]);

  // Mouse interaction state
  const isDraggingCanvas = useRef(false);
  const draggedNode = useRef<SimNode | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMovedMouse = useRef(false);
  const simAlpha = useRef(1); // Simulation energy

  // Filter nodes according to search and category
  const filteredNodes = useMemo(() => {
    let nodes = archiveDb.graph.nodes;
    if (selectedCategory !== 'all') {
      nodes = nodes.filter(n => n.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      nodes = nodes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        (n.parentClass && n.parentClass.toLowerCase().includes(q))
      );
    }
    // Limit to top 240 connected nodes to guarantee 60fps smooth canvas rendering
    return nodes
      .slice()
      .sort((a, b) => (b.linkCount || 0) - (a.linkCount || 0))
      .slice(0, 240);
  }, [search, selectedCategory]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return archiveDb.graph.edges.filter(e => {
      const sId = typeof e.source === 'string' ? e.source : (e.source?.id || '');
      const tId = typeof e.target === 'string' ? e.target : (e.target?.id || '');
      return Boolean(sId && tId && activeNodeIds.has(sId) && activeNodeIds.has(tId));
    });
  }, [activeNodeIds]);

  // Neighbors map for fast highlighting
  const neighborsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of filteredEdges) {
      const sId = typeof e.source === 'string' ? e.source : (e.source?.id || '');
      const tId = typeof e.target === 'string' ? e.target : (e.target?.id || '');
      if (!sId || !tId) continue;
      if (!map.has(sId)) map.set(sId, new Set());
      if (!map.has(tId)) map.set(tId, new Set());
      map.get(sId)!.add(tId);
      map.get(tId)!.add(sId);
    }
    return map;
  }, [filteredEdges]);

  const simNodesRef = useRef<SimNode[]>([]);

  // Initialize simulation positions
  useEffect(() => {
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 620;

    const existingMap = new Map<string, SimNode>();
    for (const n of simNodesRef.current) {
      existingMap.set(n.id, n);
    }

    simNodesRef.current = filteredNodes.map((n, i) => {
      const existing = existingMap.get(n.id);
      if (existing) {
        return {
          ...existing,
          ...n,
          radius: Math.max(5, Math.min(16, 5 + Math.sqrt(n.linkCount || 1) * 2.5)),
          color: CATEGORY_COLORS[n.category] || '#94a3b8'
        };
      }
      const angle = (i / filteredNodes.length) * 2 * Math.PI;
      const radius = 100 + Math.random() * 260;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: Math.max(5, Math.min(16, 5 + Math.sqrt(n.linkCount || 1) * 2.5)),
        color: CATEGORY_COLORS[n.category] || '#94a3b8'
      };
    });

    simAlpha.current = 1.0; // Reset simulation energy
  }, [filteredNodes]);

  // Selected entry data for Inspector panel
  const selectedEntry = useMemo(() => {
    if (!selectedNodeId) return null;
    return archiveDb.entries.find(e => e.id === selectedNodeId) || null;
  }, [selectedNodeId]);

  // Connected neighbors for selected entry
  const selectedNeighbors = useMemo(() => {
    if (!selectedNodeId) return [];
    const neighborIds = neighborsMap.get(selectedNodeId) || new Set();
    return Array.from(neighborIds)
      .map(id => archiveDb.entries.find(e => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));
  }, [selectedNodeId, neighborsMap]);

  // Auto-resize canvas with DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Wheel zoom handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      setZoom(prevZoom => {
        const newZoom = Math.max(0.25, Math.min(3.5, prevZoom * zoomFactor));
        // Adjust pan to zoom relative to cursor position
        setPan(prevPan => ({
          x: mouseX - (mouseX - prevPan.x) * (newZoom / prevZoom),
          y: mouseY - (mouseY - prevPan.y) * (newZoom / prevZoom)
        }));
        return newZoom;
      });
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // Main Simulation & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const tick = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const nodes = simNodesRef.current;
      const nodeMap = new Map<string, SimNode>();
      for (const n of nodes) nodeMap.set(n.id, n);

      // Simulation step if energy remains
      if (simAlpha.current > 0.005 || draggedNode.current) {
        const alpha = Math.max(simAlpha.current, 0.08);

        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = nodes[i].radius + nodes[j].radius + 35;
            if (dist < 200) {
              const force = ((200 - dist) / dist) * 0.15 * alpha;
              if (nodes[i] !== draggedNode.current) {
                nodes[i].vx -= dx * force;
                nodes[i].vy -= dy * force;
              }
              if (nodes[j] !== draggedNode.current) {
                nodes[j].vx += dx * force;
                nodes[j].vy += dy * force;
              }
            }
          }
        }

        // Attraction along edges
        for (const edge of filteredEdges) {
          const sId = typeof edge.source === 'string' ? edge.source : (edge.source?.id || '');
          const tId = typeof edge.target === 'string' ? edge.target : (edge.target?.id || '');
          const s = nodeMap.get(sId);
          const t = nodeMap.get(tId);
          if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = 70;
            const force = (dist - targetDist) * 0.004 * alpha;
            if (s !== draggedNode.current) {
              s.vx += dx * force;
              s.vy += dy * force;
            }
            if (t !== draggedNode.current) {
              t.vx -= dx * force;
              t.vy -= dy * force;
            }
          }
        }

        // Gentle center pull and velocity damping
        const centerX = width / 2;
        const centerY = height / 2;
        for (const n of nodes) {
          if (n === draggedNode.current) continue;
          n.vx += (centerX - n.x) * 0.0006 * alpha;
          n.vy += (centerY - n.y) * 0.0006 * alpha;
          n.vx *= 0.84;
          n.vy *= 0.84;
          n.x += n.vx;
          n.y += n.vy;
          if (isNaN(n.x) || !isFinite(n.x)) n.x = centerX;
          if (isNaN(n.y) || !isFinite(n.y)) n.y = centerY;
        }

        if (!draggedNode.current) {
          simAlpha.current *= 0.985;
        }
      }

      // Drawing Phase
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Subtle celestial background dots
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      const step = 40;
      for (let x = (pan.x % (step * zoom)); x < width; x += step * zoom) {
        for (let y = (pan.y % (step * zoom)); y < height; y += step * zoom) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.restore();

      // World transform
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      const activeFocusId = hoveredNodeId || selectedNodeId;
      const activeNeighbors = activeFocusId ? neighborsMap.get(activeFocusId) : null;

      // Draw Edges
      for (const edge of filteredEdges) {
        const sId = typeof edge.source === 'string' ? edge.source : (edge.source?.id || '');
        const tId = typeof edge.target === 'string' ? edge.target : (edge.target?.id || '');
        const s = nodeMap.get(sId);
        const t = nodeMap.get(tId);
        if (!s || !t) continue;

        const isHighlighted = activeFocusId && (
          (sId === activeFocusId && activeNeighbors?.has(tId)) ||
          (tId === activeFocusId && activeNeighbors?.has(sId))
        );

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);

        if (isHighlighted) {
          ctx.strokeStyle = '#fbbf24'; // Golden amber highlight
          ctx.lineWidth = 2.2 / zoom;
        } else if (activeFocusId) {
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.12)'; // Dimmed
          ctx.lineWidth = 0.8 / zoom;
        } else {
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)'; // Default
          ctx.lineWidth = 1 / zoom;
        }
        ctx.stroke();
      }

      // Draw Nodes
      for (const n of nodes) {
        const isHovered = hoveredNodeId === n.id;
        const isSelected = selectedNodeId === n.id;
        const isNeighbor = activeNeighbors?.has(n.id);
        const isDimmed = activeFocusId && !isHovered && !isSelected && !isNeighbor;

        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, 2 * Math.PI);

        if (isDimmed) {
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = n.color;
          ctx.fill();
        } else {
          ctx.fillStyle = n.color;
          ctx.fill();

          if (isSelected || isHovered) {
            ctx.lineWidth = 3 / zoom;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
            // Outer glow
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 4 / zoom, 0, 2 * Math.PI);
            ctx.lineWidth = 1.5 / zoom;
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
            ctx.stroke();
          } else if (isNeighbor) {
            ctx.lineWidth = 2 / zoom;
            ctx.strokeStyle = '#fbbf24';
            ctx.stroke();
          }
        }
        ctx.restore();

        // Node Title rendering
        const shouldShowTitle =
          isSelected ||
          isHovered ||
          isNeighbor ||
          (zoom >= 1.2 && n.radius >= 7) ||
          (zoom < 1.2 && n.radius >= 11);

        if (shouldShowTitle && !isDimmed) {
          ctx.save();
          ctx.font = `${Math.max(10, Math.min(13, 11 / Math.sqrt(zoom)))}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = isSelected || isHovered ? '#ffffff' : '#cbd5e1';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 4;
          ctx.fillText(n.title, n.x, n.y + n.radius + (12 / zoom));
          ctx.restore();
        }
      }

      ctx.restore();
      ctx.restore();

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [filteredEdges, zoom, pan, hoveredNodeId, selectedNodeId, neighborsMap]);

  // Coordinate conversion helper from screen mouse event to graph world coordinates
  const getGraphCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    return {
      x: (clientX - pan.x) / zoom,
      y: (clientY - pan.y) / zoom,
      screenX: clientX,
      screenY: clientY
    };
  }, [pan, zoom]);

  // Mouse Handlers: Dragging canvas OR individual node
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    hasMovedMouse.current = false;
    const { x, y } = getGraphCoords(e);

    // Hit test nodes for dragging
    const hitNode = simNodesRef.current.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (hitNode) {
      draggedNode.current = hitNode;
      simAlpha.current = 0.6; // Wake up physics
    } else {
      isDraggingCanvas.current = true;
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    hasMovedMouse.current = true;
    const { x, y } = getGraphCoords(e);

    // If dragging a specific node
    if (draggedNode.current) {
      draggedNode.current.x = x;
      draggedNode.current.y = y;
      draggedNode.current.vx = 0;
      draggedNode.current.vy = 0;
      simAlpha.current = 0.5; // keep physics awake while dragging
      return;
    }

    // If dragging entire canvas
    if (isDraggingCanvas.current) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
      return;
    }

    // Hover detection
    const hitNode = simNodesRef.current.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    setHoveredNodeId(hitNode?.id || null);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNode.current) {
      draggedNode.current = null;
    }
    isDraggingCanvas.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If the user was just dragging canvas or node, ignore pure click
    const { x, y } = getGraphCoords(e);
    const hitNode = simNodesRef.current.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (hitNode) {
      setSelectedNodeId(hitNode.id);
    } else {
      setSelectedNodeId(null);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getGraphCoords(e);
    const hitNode = simNodesRef.current.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (hitNode) {
      onSelectEntry(hitNode.id);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    simAlpha.current = 0.8;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Header & Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-fantasy text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Obsidian Knowledge Graph</span>
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filteredNodes.length} nodes · {filteredEdges.length} connections
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Interactive force-directed graph. Drag nodes to reshape, scroll to zoom, click to inspect connections, double-click to view entry.
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
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none w-44"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:border-amber-500 focus:outline-none capitalize"
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
            <option value="class-options">Class Options</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setZoom(z => Math.min(3.5, z * 1.2))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.25, z / 1.2))}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Viewport + Inspector Drawer */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl h-[680px]">
        {/* Canvas */}
        <div ref={containerRef} className="w-full h-full">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
          />
        </div>

        {/* Category Legend (Desktop) */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-lg text-[11px] space-y-1.5 hidden md:block pointer-events-none">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(CATEGORY_COLORS).slice(0, 8).map(([cat, col]) => (
              <div key={cat} className="flex items-center gap-1.5 text-slate-300 capitalize">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col }} />
                <span>{cat.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Inspector Tooltip (when not clicked) */}
        {hoveredNodeId && !selectedNodeId && (
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl pointer-events-none max-w-sm">
            {(() => {
              const node = simNodesRef.current.find(n => n.id === hoveredNodeId);
              if (!node) return null;
              return (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color }} />
                    <span className="font-fantasy font-bold text-slate-100 text-sm">{node.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize">
                    {node.category.replace('-', ' ')} {node.parentClass ? `• ${node.parentClass}` : ''} • {node.linkCount} connections
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-medium">
                    Click to inspect • Double-click to open
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Rich Node Inspector Drawer (Slide-over on Node Selection) */}
        {selectedEntry && (
          <div className="absolute top-4 right-4 bottom-4 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-20 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-2 bg-slate-950/60">
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-400 block mb-1">
                  {selectedEntry.category.replace('-', ' ')}
                  {selectedEntry.parentClass ? ` • ${selectedEntry.parentClass}` : ''}
                </span>
                <h3 className="font-fantasy text-lg font-bold text-slate-100 leading-tight">
                  {selectedEntry.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Flavor Text / Summary */}
              {selectedEntry.flavor ? (
                <div className="italic text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <InlineContent text={cleanFlavorText(selectedEntry.flavor)} onNavigate={onSelectEntry} />
                </div>
              ) : selectedEntry.summary ? (
                <div className="text-slate-300 leading-relaxed">
                  <InlineContent text={cleanFlavorText(selectedEntry.summary)} onNavigate={onSelectEntry} />
                </div>
              ) : null}

              {/* Quick Tags / Metadata */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {selectedEntry.source && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Source: {selectedEntry.source}
                  </span>
                )}
                {selectedEntry.hit_die && (
                  <span className="px-2 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-800/50">
                    Hit Die: {selectedEntry.hit_die}
                  </span>
                )}
                {selectedEntry.level !== null && selectedEntry.level !== undefined && (
                  <span className="px-2 py-0.5 rounded bg-violet-950/70 text-violet-300 border border-violet-800/50">
                    {selectedEntry.level === 0 ? 'Cantrip' : `Level ${selectedEntry.level}`}
                  </span>
                )}
              </div>

              {/* Connected Neighbors */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Connected Entities ({selectedNeighbors.length})</span>
                </div>

                {selectedNeighbors.length === 0 ? (
                  <div className="text-slate-500 italic text-[11px]">No direct links found in current view.</div>
                ) : (
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {selectedNeighbors.map(neighbor => {
                      const badge = getSourceBadgeInfo(neighbor.source_type, neighbor.source);
                      return (
                        <div
                          key={neighbor.id}
                          onClick={() => setSelectedNodeId(neighbor.id)}
                          className="p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <div className="truncate pr-2">
                            <div className="font-medium text-slate-200 group-hover:text-amber-300 truncate">
                              {neighbor.title}
                            </div>
                            <div className="text-[10px] text-slate-400 capitalize">
                              {neighbor.category.replace('-', ' ')}
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Navigation Button */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80">
              <button
                onClick={() => onSelectEntry(selectedEntry.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow transition-colors"
              >
                <span>Open Full Compendium Entry</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
