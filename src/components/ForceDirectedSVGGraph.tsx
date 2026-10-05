import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Network,
  Share2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  CheckCircle2,
  Wrench,
  Brain,
  CheckSquare,
  Search,
  Filter,
  Layers,
  Activity,
  Shield,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { voiceAgent } from '../services/voiceAgentService';

export type ForceNodeType = 'task' | 'tool' | 'memory';

export interface ForceNode {
  id: string;
  label: string;
  type: ForceNodeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  category: string;
  status: string;
  description: string;
  details: {
    priority?: 'critical' | 'high' | 'medium' | 'low';
    urgency?: string;
    owner?: string;
    deadline?: string;
    state?: string;
    toolLatency?: string;
    reliability?: string;
    callCount?: number;
    retentionRate?: number;
    decaySpeed?: string;
    itemCount?: number;
    isPinned?: boolean;
  };
}

export interface ForceLink {
  source: string;
  target: string;
  label: string;
  strength: number;
  distance: number;
  isActiveFlow?: boolean;
}

const INITIAL_NODES: ForceNode[] = [
  // 1. Active Project Tasks (Cyan/Blue Theme)
  {
    id: 'task-ast',
    label: 'AST Parser Rules',
    type: 'task',
    x: 220,
    y: 160,
    vx: 0,
    vy: 0,
    radius: 26,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    category: 'EduCore Platform',
    status: 'In Progress',
    description: 'Babel/WASM parser mounting in WebWorker to evaluate student code syntax.',
    details: {
      priority: 'high',
      urgency: 'High',
      owner: 'Coding Agent',
      deadline: '2026-10-08',
      state: 'in_progress',
    },
  },
  {
    id: 'task-analytics',
    label: 'Analytics Staging Deploy',
    type: 'task',
    x: 170,
    y: 320,
    vx: 0,
    vy: 0,
    radius: 24,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.7)',
    category: 'EduCore Platform',
    status: 'Awaiting Approval',
    description: 'Staging deployment of interactive student progression dashboard.',
    details: {
      priority: 'medium',
      urgency: 'Medium',
      owner: 'Product/UX Agent',
      deadline: '2026-10-15',
      state: 'awaiting_approval',
    },
  },
  {
    id: 'task-wasm-bench',
    label: 'WASM SQLite Benchmark',
    type: 'task',
    x: 100,
    y: 220,
    vx: 0,
    vy: 0,
    radius: 22,
    color: '#0284c7',
    glowColor: 'rgba(2, 132, 199, 0.6)',
    category: 'EduCore Platform',
    status: 'Active',
    description: 'Local-first persistent storage performance comparison against IndexedDB.',
    details: {
      priority: 'low',
      urgency: 'Low',
      owner: 'Architecture Agent',
      deadline: '2026-10-22',
      state: 'in_progress',
    },
  },
  {
    id: 'task-sales-icp',
    label: 'Enterprise ICP Scorer',
    type: 'task',
    x: 520,
    y: 140,
    vx: 0,
    vy: 0,
    radius: 28,
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.8)',
    category: 'Sales Intelligence',
    status: 'In Progress',
    description: 'Automated ICP qualification pipeline matching engineering leadership profiles.',
    details: {
      priority: 'critical',
      urgency: 'High',
      owner: 'Sales Agent',
      deadline: '2026-10-07',
      state: 'in_progress',
    },
  },
  {
    id: 'task-outbound',
    label: 'Founder Teardown Outbound',
    type: 'task',
    x: 640,
    y: 230,
    vx: 0,
    vy: 0,
    radius: 24,
    color: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.7)',
    category: 'Sales Intelligence',
    status: 'In Progress',
    description: 'Technical architecture teardown outbound drafts for Series A CTOs.',
    details: {
      priority: 'high',
      urgency: 'High',
      owner: 'Sales Agent',
      deadline: '2026-10-12',
      state: 'in_progress',
    },
  },
  {
    id: 'task-approval-gate',
    label: 'Proposal Sandbox Gate',
    type: 'task',
    x: 380,
    y: 380,
    vx: 0,
    vy: 0,
    radius: 28,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.85)',
    category: 'AetherOS Kernel',
    status: 'Critical Safeguard',
    description: '19-field structured safety proposal queue with digital signature verification.',
    details: {
      priority: 'critical',
      urgency: 'High',
      owner: 'Architecture Agent',
      deadline: '2026-10-06',
      state: 'awaiting_approval',
    },
  },

  // 2. Connected Tools (Emerald/Teal Theme)
  {
    id: 'tool-wasm-runner',
    label: 'WASM Code Sandbox',
    type: 'tool',
    x: 180,
    y: 220,
    vx: 0,
    vy: 0,
    radius: 25,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.75)',
    category: 'Execution Runtime',
    status: 'Online',
    description: 'In-browser isolated WebAssembly sandbox with execution watchdog timers.',
    details: {
      toolLatency: '12ms',
      reliability: '99.9%',
      callCount: 342,
    },
  },
  {
    id: 'tool-ast-parser',
    label: 'AST Static Linter',
    type: 'tool',
    x: 290,
    y: 90,
    vx: 0,
    vy: 0,
    radius: 24,
    color: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.75)',
    category: 'Code Analysis',
    status: 'Online',
    description: 'Syntax trees generator that identifies structural programming patterns & errors.',
    details: {
      toolLatency: '24ms',
      reliability: '100%',
      callCount: 890,
    },
  },
  {
    id: 'tool-vector-search',
    label: 'Semantic Vector Engine',
    type: 'tool',
    x: 340,
    y: 240,
    vx: 0,
    vy: 0,
    radius: 27,
    color: '#14b8a6',
    glowColor: 'rgba(20, 184, 166, 0.8)',
    category: 'Memory & Retrieval',
    status: 'Online',
    description: 'Cosine similarity vector index running client-side with sub-20ms latency.',
    details: {
      toolLatency: '18ms',
      reliability: '99.8%',
      callCount: 1420,
    },
  },
  {
    id: 'tool-scraper',
    label: 'Enterprise Lead Scraper',
    type: 'tool',
    x: 600,
    y: 110,
    vx: 0,
    vy: 0,
    radius: 24,
    color: '#0d9488',
    glowColor: 'rgba(13, 148, 136, 0.7)',
    category: 'Research & Prospecting',
    status: 'Online',
    description: 'Extracts engineering team size, hiring signals, and tech stack telemetry.',
    details: {
      toolLatency: '340ms',
      reliability: '98.5%',
      callCount: 184,
    },
  },
  {
    id: 'tool-approval-broker',
    label: 'Approval Broker',
    type: 'tool',
    x: 460,
    y: 420,
    vx: 0,
    vy: 0,
    radius: 26,
    color: '#047857',
    glowColor: 'rgba(4, 120, 87, 0.8)',
    category: 'Security & Safety',
    status: 'Gated Level 5',
    description: 'Prevents non-sandboxed file writes or external network mutations without sign-off.',
    details: {
      toolLatency: '8ms',
      reliability: '100%',
      callCount: 78,
    },
  },
  {
    id: 'tool-voice-synth',
    label: 'Neural TTS Synthesizer',
    type: 'tool',
    x: 540,
    y: 330,
    vx: 0,
    vy: 0,
    radius: 24,
    color: '#065f46',
    glowColor: 'rgba(6, 95, 70, 0.7)',
    category: 'Audio Interaction',
    status: 'Online',
    description: 'AI-generated voice profile engine with emotion prosody modulation.',
    details: {
      toolLatency: '45ms',
      reliability: '99.4%',
      callCount: 520,
    },
  },

  // 3. Agent Memory Clusters (Purple/Magenta Theme)
  {
    id: 'mem-invariants',
    label: 'AST Schemas & Invariants',
    type: 'memory',
    x: 360,
    y: 130,
    vx: 0,
    vy: 0,
    radius: 28,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.85)',
    category: 'System Invariants',
    status: 'Pinned',
    description: 'Strict type contracts, AST visitor nodes, and curriculum prerequisites.',
    details: {
      retentionRate: 98,
      decaySpeed: 'Frozen (Pinned)',
      itemCount: 42,
      isPinned: true,
    },
  },
  {
    id: 'mem-persona',
    label: 'User Persona & Boundaries',
    type: 'memory',
    x: 480,
    y: 220,
    vx: 0,
    vy: 0,
    radius: 29,
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.85)',
    category: 'Alignment & Context',
    status: 'Pinned',
    description: 'Human operator preferences, coding conventions, and Level 5 gating expectations.',
    details: {
      retentionRate: 100,
      decaySpeed: 'Frozen (Pinned)',
      itemCount: 16,
      isPinned: true,
    },
  },
  {
    id: 'mem-sales-graph',
    label: 'Enterprise ICP Matrix',
    type: 'memory',
    x: 610,
    y: 320,
    vx: 0,
    vy: 0,
    radius: 26,
    color: '#9333ea',
    glowColor: 'rgba(147, 51, 234, 0.8)',
    category: 'Sales Domain',
    status: 'Active Buffer',
    description: 'Prospect tech stacks, pain points, and personalized draft blueprints.',
    details: {
      retentionRate: 82,
      decaySpeed: '0.4%/hour',
      itemCount: 29,
      isPinned: false,
    },
  },
  {
    id: 'mem-self-improvement',
    label: 'Self-Improvement Benchmarks',
    type: 'memory',
    x: 300,
    y: 360,
    vx: 0,
    vy: 0,
    radius: 26,
    color: '#7e22ce',
    glowColor: 'rgba(126, 34, 206, 0.8)',
    category: 'Autonomous Evolution',
    status: 'Active Buffer',
    description: 'Regression tests, proposal outcomes, and latency telemetry traces.',
    details: {
      retentionRate: 89,
      decaySpeed: '0.2%/hour',
      itemCount: 19,
      isPinned: false,
    },
  },
  {
    id: 'mem-working-attention',
    label: 'Immediate Attention Buffer',
    type: 'memory',
    x: 430,
    y: 290,
    vx: 0,
    vy: 0,
    radius: 28,
    color: '#e879f9',
    glowColor: 'rgba(232, 121, 249, 0.85)',
    category: 'Short-Term Memory',
    status: 'Active Buffer',
    description: 'Recently discussed tokens, user voice commands, and active tab states.',
    details: {
      retentionRate: 94,
      decaySpeed: '0.8%/hour',
      itemCount: 38,
      isPinned: false,
    },
  },
];

const INITIAL_LINKS: ForceLink[] = [
  // Task <-> Tool connections
  { source: 'task-ast', target: 'tool-ast-parser', label: 'parses_with', strength: 0.8, distance: 90, isActiveFlow: true },
  { source: 'task-ast', target: 'tool-wasm-runner', label: 'evaluates_in', strength: 0.7, distance: 100 },
  { source: 'task-analytics', target: 'tool-wasm-runner', label: 'sandboxed_render', strength: 0.6, distance: 110 },
  { source: 'task-sales-icp', target: 'tool-scraper', label: 'enriches_via', strength: 0.8, distance: 95, isActiveFlow: true },
  { source: 'task-outbound', target: 'tool-scraper', label: 'pulls_telemetry', strength: 0.6, distance: 120 },
  { source: 'task-approval-gate', target: 'tool-approval-broker', label: 'cryptographic_guard', strength: 0.9, distance: 85, isActiveFlow: true },
  { source: 'task-wasm-bench', target: 'tool-wasm-runner', label: 'measures_latency', strength: 0.75, distance: 80 },

  // Task <-> Memory connections
  { source: 'task-ast', target: 'mem-invariants', label: 'validates_against', strength: 0.75, distance: 110, isActiveFlow: true },
  { source: 'task-sales-icp', target: 'mem-sales-graph', label: 'queries_icp', strength: 0.7, distance: 120 },
  { source: 'task-approval-gate', target: 'mem-self-improvement', label: 'records_outcome', strength: 0.8, distance: 105, isActiveFlow: true },
  { source: 'task-outbound', target: 'mem-persona', label: 'aligns_tone', strength: 0.65, distance: 130 },

  // Tool <-> Memory connections
  { source: 'tool-vector-search', target: 'mem-invariants', label: 'indexes_schemas', strength: 0.6, distance: 100 },
  { source: 'tool-vector-search', target: 'mem-working-attention', label: 'retrieves_context', strength: 0.85, distance: 80, isActiveFlow: true },
  { source: 'tool-voice-synth', target: 'mem-working-attention', label: 'vocalizes_response', strength: 0.7, distance: 90, isActiveFlow: true },
  { source: 'tool-approval-broker', target: 'mem-persona', label: 'verifies_authority', strength: 0.8, distance: 95 },
  { source: 'tool-scraper', target: 'mem-sales-graph', label: 'caches_records', strength: 0.75, distance: 115 },
  { source: 'mem-working-attention', target: 'mem-persona', label: 'syncs_preferences', strength: 0.7, distance: 90 },
];

export const ForceDirectedSVGGraph: React.FC = () => {
  const [nodes, setNodes] = useState<ForceNode[]>(INITIAL_NODES);
  const [links] = useState<ForceLink[]>(INITIAL_LINKS);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('task-ast');
  const [filterType, setFilterType] = useState<'all' | ForceNodeType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Physics animation ref
  const animFrameRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDraggingRef = useRef(false);
  const draggedNodeIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (searchQuery.trim() && !n.label.toLowerCase().includes(searchQuery.toLowerCase()) && !n.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [nodes, filterType, searchQuery]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Connected links for the selected node
  const connectedLinks = useMemo(() => {
    if (!selectedNode) return [];
    return links.filter((l) => l.source === selectedNode.id || l.target === selectedNode.id);
  }, [selectedNode, links]);

  // Physics engine step: Force-directed simulation loop
  const updatePhysics = useCallback(() => {
    if (!isSimulating && !draggedNodeIdRef.current) return;

    setNodes((prevNodes) => {
      const nextNodes = prevNodes.map((n) => ({ ...n }));
      const nodeMap = new Map<string, ForceNode>();
      nextNodes.forEach((n) => nodeMap.set(n.id, n));

      const width = 800;
      const height = 500;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Charge repulsion force (Coulomb-like)
      for (let i = 0; i < nextNodes.length; i++) {
        for (let j = i + 1; j < nextNodes.length; j++) {
          const a = nextNodes[i];
          const b = nextNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy + 1;
          const dist = Math.sqrt(distSq);

          // Repulsion strength
          const repulseForce = 3800 / distSq;
          const fx = (dx / dist) * repulseForce;
          const fy = (dy / dist) * repulseForce;

          if (a.id !== draggedNodeIdRef.current) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (b.id !== draggedNodeIdRef.current) {
            b.vx += fx;
            b.vy += fy;
          }

          // Collision resolution
          const minDist = a.radius + b.radius + 12;
          if (dist < minDist) {
            const overlap = (minDist - dist) * 0.5;
            const ox = (dx / dist) * overlap;
            const oy = (dy / dist) * overlap;
            if (a.id !== draggedNodeIdRef.current) {
              a.x -= ox;
              a.y -= oy;
            }
            if (b.id !== draggedNodeIdRef.current) {
              b.x += ox;
              b.y += oy;
            }
          }
        }
      }

      // 2. Link spring forces (Hooke-like)
      links.forEach((link) => {
        const source = nodeMap.get(link.source);
        const target = nodeMap.get(link.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const diff = dist - link.distance;
        const springForce = diff * (link.strength * 0.04);

        const fx = (dx / dist) * springForce;
        const fy = (dy / dist) * springForce;

        if (source.id !== draggedNodeIdRef.current) {
          source.vx += fx;
          source.vy += fy;
        }
        if (target.id !== draggedNodeIdRef.current) {
          target.vx -= fx;
          target.vy -= fy;
        }
      });

      // 3. Center gravity pull & velocity damping
      const damping = 0.85;
      const gravity = 0.005;

      nextNodes.forEach((node) => {
        if (node.id === draggedNodeIdRef.current) return;

        // Pull toward center
        const gx = (centerX - node.x) * gravity;
        const gy = (centerY - node.y) * gravity;
        node.vx = (node.vx + gx) * damping;
        node.vy = (node.vy + gy) * damping;

        // Apply velocities with boundaries
        node.x += Math.max(-10, Math.min(10, node.vx));
        node.y += Math.max(-10, Math.min(10, node.vy));

        // Soft containment box
        node.x = Math.max(node.radius + 20, Math.min(width - node.radius - 20, node.x));
        node.y = Math.max(node.radius + 20, Math.min(height - node.radius - 20, node.y));
      });

      return nextNodes;
    });
  }, [isSimulating, links]);

  // Simulation animation loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (active && isSimulating) {
        updatePhysics();
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSimulating, updatePhysics]);

  // Dragging event handlers on SVG
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    draggedNodeIdRef.current = nodeId;
    setSelectedNodeId(nodeId);
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !draggedNodeIdRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const svgY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === draggedNodeIdRef.current) {
          return {
            ...n,
            x: Math.max(30, Math.min(770, svgX)),
            y: Math.max(30, Math.min(470, svgY)),
            vx: 0,
            vy: 0,
          };
        }
        return n;
      })
    );
  };

  const handleSvgMouseUp = () => {
    isDraggingRef.current = false;
    draggedNodeIdRef.current = null;
  };

  const reheatSimulation = () => {
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
      }))
    );
    setIsSimulating(true);
  };

  // Node counts by type
  const counts = useMemo(() => {
    return {
      all: nodes.length,
      task: nodes.filter((n) => n.type === 'task').length,
      tool: nodes.filter((n) => n.type === 'tool').length,
      memory: nodes.filter((n) => n.type === 'memory').length,
    };
  }, [nodes]);

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Interactive Force-Directed System Map</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-semibold">
                    SVG Physics Engine
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visualizes active project tasks, connected tools, and agent memory clusters with live physics, charge repulsion, and spring forces.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Pills & Physics Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nodes..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold text-[11px]">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('task')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                  filterType === 'task'
                    ? 'bg-cyan-600 text-white'
                    : 'text-cyan-400/80 hover:text-cyan-300'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>Tasks ({counts.task})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('tool')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                  filterType === 'tool'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-400/80 hover:text-emerald-300'
                }`}
              >
                <Wrench className="w-3 h-3" />
                <span>Tools ({counts.tool})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('memory')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                  filterType === 'memory'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-400/80 hover:text-purple-300'
                }`}
              >
                <Brain className="w-3 h-3" />
                <span>Memory ({counts.memory})</span>
              </button>
            </div>

            {/* Simulation Controls */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={isSimulating ? 'Pause physics simulation' : 'Resume physics simulation'}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={reheatSimulation}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Re-heat / Scatter node physics"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Reset zoom & pan"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Force-Directed Graph Layout: Canvas + Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Canvas Area (3 cols) */}
        <div className="lg:col-span-3 bg-[#080d19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative select-none flex flex-col h-[520px]">
          {/* Legend Banner */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 text-[10px] font-mono bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
              <span className="text-cyan-200">Active Tasks</span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span className="text-emerald-200">Connected Tools</span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
              <span className="text-purple-200">Memory Clusters</span>
            </span>
          </div>

          <div className="absolute bottom-3 left-3 z-10 text-[9px] font-mono text-slate-500 bg-slate-950/70 px-2 py-1 rounded-lg">
            <span>Drag nodes to re-position &bull; Click to inspect &bull; {isSimulating ? 'Physics Active' : 'Physics Paused'}</span>
          </div>

          {/* SVG Force Canvas */}
          <svg
            ref={svgRef}
            viewBox="0 0 800 500"
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
          >
            <defs>
              {/* Radial glow gradients */}
              <radialGradient id="task-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="tool-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="memory-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>

              {/* Arrow marker for active flow */}
              <marker
                id="flow-arrow"
                viewBox="0 0 10 10"
                refX="18"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" opacity="0.8" />
              </marker>
            </defs>

            {/* Background Grid Pattern */}
            <pattern id="grid-dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="15" r="0.8" fill="#1e293b" />
            </pattern>
            <rect width="800" height="500" fill="url(#grid-dots)" />

            <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
              {/* Force Links */}
              {links.map((link, idx) => {
                const source = nodes.find((n) => n.id === link.source);
                const target = nodes.find((n) => n.id === link.target);
                if (!source || !target) return null;

                const isConnectedToSelected =
                  source.id === selectedNodeId || target.id === selectedNodeId;

                return (
                  <g key={`link-${idx}`}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={
                        isConnectedToSelected
                          ? '#38bdf8'
                          : link.isActiveFlow
                          ? '#0284c7'
                          : '#1e293b'
                      }
                      strokeWidth={isConnectedToSelected ? 2.2 : link.isActiveFlow ? 1.5 : 1}
                      strokeDasharray={link.isActiveFlow ? '4 3' : undefined}
                      className={link.isActiveFlow ? 'animate-dash-flow' : undefined}
                      opacity={isConnectedToSelected ? 0.9 : 0.55}
                    />

                    {/* Edge Label on active or selected */}
                    {isConnectedToSelected && (
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2 - 4}
                        fill="#94a3b8"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="pointer-events-none select-none"
                      >
                        {link.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Force Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isConnected =
                  selectedNode &&
                  links.some(
                    (l) =>
                      (l.source === selectedNode.id && l.target === node.id) ||
                      (l.target === selectedNode.id && l.source === node.id)
                  );

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    className="cursor-pointer"
                  >
                    {/* Pulsing orbital ring for selected or connected */}
                    {(isSelected || isConnected) && (
                      <circle
                        r={node.radius + 8}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                        className="animate-spin-slow opacity-80"
                      />
                    )}

                    {/* Radial Glow Halo */}
                    <circle
                      r={node.radius + 12}
                      fill={
                        node.type === 'task'
                          ? 'url(#task-glow)'
                          : node.type === 'tool'
                          ? 'url(#tool-glow)'
                          : 'url(#memory-glow)'
                      }
                      opacity={isSelected ? 0.9 : 0.4}
                      className="pointer-events-none"
                    />

                    {/* Node Core Body */}
                    <circle
                      r={node.radius}
                      fill="#070d19"
                      stroke={node.color}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-transform duration-100 hover:scale-105"
                      style={{
                        filter: isSelected ? `drop-shadow(0 0 10px ${node.glowColor})` : undefined,
                      }}
                    />

                    {/* Node Icon / Initial Badge */}
                    <text
                      y="-1"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={node.color}
                      fontSize={node.radius > 26 ? '11' : '10'}
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      className="pointer-events-none select-none uppercase tracking-tighter"
                    >
                      {node.type === 'task'
                        ? 'TASK'
                        : node.type === 'tool'
                        ? 'TOOL'
                        : 'MEM'}
                    </text>

                    {/* Primary Label */}
                    <text
                      y={node.radius + 14}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize="9.5"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                      className="pointer-events-none select-none drop-shadow"
                    >
                      {node.label}
                    </text>

                    {/* Sub-label Category */}
                    <text
                      y={node.radius + 24}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="7.5"
                      fontFamily="monospace"
                      className="pointer-events-none select-none"
                    >
                      {node.category}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Selected Node Inspector Sidebar (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span
                  className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    color: selectedNode.color,
                    backgroundColor: `${selectedNode.color}15`,
                    border: `1px solid ${selectedNode.color}40`,
                  }}
                >
                  {selectedNode.type} &bull; {selectedNode.category}
                </span>
                <h4 className="text-base font-bold text-white mt-1.5 leading-tight">
                  {selectedNode.label}
                </h4>
              </div>

              <div
                className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse mt-1"
                style={{ backgroundColor: selectedNode.color }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Type-Specific Metric Cards */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Telemetry &amp; Invariants:
              </span>

              {selectedNode.type === 'task' && (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Priority:</span>
                    <span className="font-bold uppercase text-cyan-300">
                      {selectedNode.details.priority}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Specialist:</span>
                    <span className="text-slate-200">{selectedNode.details.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deadline:</span>
                    <span className="text-amber-300">{selectedNode.details.deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">State:</span>
                    <span className="text-emerald-400">{selectedNode.details.state}</span>
                  </div>
                </div>
              )}

              {selectedNode.type === 'tool' && (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Execution Latency:</span>
                    <span className="text-emerald-300 font-bold">
                      {selectedNode.details.toolLatency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reliability Rate:</span>
                    <span className="text-cyan-300">{selectedNode.details.reliability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lifetime Invocations:</span>
                    <span className="text-white font-bold">{selectedNode.details.callCount} calls</span>
                  </div>
                </div>
              )}

              {selectedNode.type === 'memory' && (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Retention Health:</span>
                    <span className="text-purple-300 font-bold">
                      {selectedNode.details.retentionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Decay Velocity:</span>
                    <span className="text-slate-300">{selectedNode.details.decaySpeed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Working Vectors:</span>
                    <span className="text-white font-bold">{selectedNode.details.itemCount} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Retention Guard:</span>
                    <span className={selectedNode.details.isPinned ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                      {selectedNode.details.isPinned ? 'Pinned in Attention' : 'Dynamic Decay'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Connected Topology Edges */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Direct Topology Links ({connectedLinks.length}):
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                {connectedLinks.map((link, i) => {
                  const targetId = link.source === selectedNode.id ? link.target : link.source;
                  const targetNode = nodes.find((n) => n.id === targetId);

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedNodeId(targetId)}
                      className="w-full text-left p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-[10px] font-mono flex items-center justify-between border border-slate-800 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: targetNode?.color || '#94a3b8' }}
                        />
                        <span className="text-slate-300 truncate">{targetNode?.label}</span>
                      </div>
                      <span className="text-slate-500 text-[9px]">{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Voice / Focus Trigger */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                voiceAgent.speak(
                  `Focusing Max on ${selectedNode.label}. Type is ${selectedNode.type} under ${selectedNode.category}.`,
                  {
                    emotion: selectedNode.type === 'task' ? 'focused' : selectedNode.type === 'tool' ? 'curious' : 'empathetic',
                  }
                );
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Briefing on Node</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
