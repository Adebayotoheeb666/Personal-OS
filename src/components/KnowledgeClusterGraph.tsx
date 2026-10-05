import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Network,
  Share2,
  Sparkles,
  Layers,
  Activity,
  Zap,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Info,
  TrendingUp,
  FolderGit2,
} from 'lucide-react';
import { voiceAgent } from '../services/voiceAgentService';

export interface DomainClusterNode {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number; // Density weight for Recharts ZAxis
  densityScore: number; // 0-100%
  color: string;
  glowColor: string;
  iconText: string;
  entityCount: number;
  description: string;
  keyAssets: string[];
}

export interface DomainRelationshipEdge {
  id: string;
  source: string;
  target: string;
  density: number; // 0-100%
  synergyType: string;
  sharedAssets: string[];
}

const DOMAIN_NODES_DATA: Omit<DomainClusterNode, 'x' | 'y' | 'vx' | 'vy'>[] = [
  {
    id: 'dom-educore',
    name: 'EduCore Platform',
    category: 'EdTech & Code Sandbox',
    z: 1800,
    densityScore: 94,
    color: '#06b6d4', // cyan-500
    glowColor: 'rgba(6, 182, 212, 0.4)',
    iconText: 'ED',
    entityCount: 18,
    description: 'Adaptive computer science learning system with WebWorker WASM code evaluation and AST misconception detection.',
    keyAssets: ['WASM Worker Sandbox', 'AST Misconception Classifier', 'Student Prerequisite Graph'],
  },
  {
    id: 'dom-sales',
    name: 'Sales Intelligence',
    category: 'Enterprise B2B',
    z: 1400,
    densityScore: 82,
    color: '#ec4899', // pink-500
    glowColor: 'rgba(236, 72, 153, 0.4)',
    iconText: 'SI',
    entityCount: 14,
    description: 'Autonomous enterprise prospect research, founder outbound teardowns, and ICP lead scoring.',
    keyAssets: ['Founder Outbound Formula', 'VP Eng ICP Filter', 'Technical Teardown Briefs'],
  },
  {
    id: 'dom-kernel',
    name: 'AetherOS Kernel',
    category: 'Autonomous Agent Runtime',
    z: 2100,
    densityScore: 98,
    color: '#6366f1', // indigo-500
    glowColor: 'rgba(99, 102, 241, 0.5)',
    iconText: 'AK',
    entityCount: 24,
    description: 'Approval-gated self-improving runtime with 19-field proposal sandbox and Level 5 autonomy boundaries.',
    keyAssets: ['Approval Gate Architecture', 'Proposal Sandbox Engine', 'Tool Capability Registry'],
  },
  {
    id: 'dom-devrel',
    name: 'Developer Strategy',
    category: 'Ecosystem & Open Source',
    z: 1250,
    densityScore: 78,
    color: '#10b981', // emerald-500
    glowColor: 'rgba(16, 185, 129, 0.4)',
    iconText: 'DS',
    entityCount: 11,
    description: 'Open-source tooling benchmarks, technical DevRel partnerships (VoxelDB), and engineering leader brief distribution.',
    keyAssets: ['VoxelDB Co-marketing Pact', 'AST Code Evaluation Repo', 'Open-source WASM Runner'],
  },
  {
    id: 'dom-knowledge',
    name: 'Knowledge & Privacy',
    category: 'Vector Memory & Governance',
    z: 1600,
    densityScore: 91,
    color: '#a855f7', // purple-500
    glowColor: 'rgba(168, 85, 247, 0.4)',
    iconText: 'KP',
    entityCount: 16,
    description: 'Local-first cosine distance vector model, zero-exfiltration security quarantine, and immutable decision logs.',
    keyAssets: ['Local-First Vector Model', 'Cryptographic Sign-off Log', 'Decision Rationale Ledger'],
  },
  {
    id: 'dom-community',
    name: 'Student Community',
    category: 'Beta Adoption & Feedback',
    z: 1100,
    densityScore: 73,
    color: '#f59e0b', // amber-500
    glowColor: 'rgba(245, 158, 11, 0.4)',
    iconText: 'SC',
    entityCount: 9,
    description: 'Cohort of 500 active beta students generating error traces, telemetry, and curriculum completion metrics.',
    keyAssets: ['500 Student Cohort Telemetry', 'Completion Funnel Analytics', 'Beta Student Error Traces'],
  },
];

const DOMAIN_RELATIONSHIPS_DATA: DomainRelationshipEdge[] = [
  {
    id: 'rel-1',
    source: 'dom-educore',
    target: 'dom-kernel',
    density: 92,
    synergyType: 'Shared WASM Runtime & Watchdog Guardrails',
    sharedAssets: ['WASM Worker Sandbox', 'Zero Memory Leakage Watchdog'],
  },
  {
    id: 'rel-2',
    source: 'dom-educore',
    target: 'dom-devrel',
    density: 88,
    synergyType: 'AST Parsing Engine & Curriculum Benchmarks',
    sharedAssets: ['AST Misconception Classifier', 'Open Source Evaluation Repo'],
  },
  {
    id: 'rel-3',
    source: 'dom-educore',
    target: 'dom-community',
    density: 94,
    synergyType: 'Real-time Student Telemetry & Challenge Progression',
    sharedAssets: ['500 Student Cohort Telemetry', 'Prerequisite Challenge Graph'],
  },
  {
    id: 'rel-4',
    source: 'dom-sales',
    target: 'dom-devrel',
    density: 84,
    synergyType: 'Technical Architecture Teardowns for VP of Engineering',
    sharedAssets: ['Founder Outbound Formula', 'Engineering Pilot Briefs'],
  },
  {
    id: 'rel-5',
    source: 'dom-sales',
    target: 'dom-kernel',
    density: 68,
    synergyType: 'Approval-Gated Outbound Email & Prospect Actions',
    sharedAssets: ['Approval Gate Architecture', 'Quota Safety Quarantine'],
  },
  {
    id: 'rel-6',
    source: 'dom-kernel',
    target: 'dom-knowledge',
    density: 96,
    synergyType: 'Private Memory Retrieval & Immutable Audit Trail',
    sharedAssets: ['Local-First Vector Model', 'Cryptographic Sign-off Log', 'Decision Ledger'],
  },
  {
    id: 'rel-7',
    source: 'dom-educore',
    target: 'dom-knowledge',
    density: 76,
    synergyType: 'Sub-20ms Cached Code Misconception Embeddings',
    sharedAssets: ['Local-First Vector Model', 'Code Pattern Embeddings'],
  },
  {
    id: 'rel-8',
    source: 'dom-sales',
    target: 'dom-knowledge',
    density: 71,
    synergyType: 'Client NDA Governance & Contact Association Mapping',
    sharedAssets: ['Decision Ledger', 'Privacy Quarantine'],
  },
];

// Initial layout anchors in 0..100 space
const INITIAL_COORDS: Record<string, { x: number; y: number }> = {
  'dom-kernel': { x: 50, y: 50 },
  'dom-educore': { x: 26, y: 35 },
  'dom-sales': { x: 74, y: 38 },
  'dom-devrel': { x: 50, y: 18 },
  'dom-knowledge': { x: 38, y: 76 },
  'dom-community': { x: 18, y: 64 },
};

export const KnowledgeClusterGraph: React.FC = () => {
  const [nodes, setNodes] = useState<DomainClusterNode[]>(() =>
    DOMAIN_NODES_DATA.map((d) => ({
      ...d,
      x: INITIAL_COORDS[d.id]?.x ?? 50,
      y: INITIAL_COORDS[d.id]?.y ?? 50,
      vx: 0,
      vy: 0,
    }))
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string>('dom-kernel');
  const [minDensityThreshold, setMinDensityThreshold] = useState<number>(60);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'graph' | 'matrix'>('graph');
  const [repulsionStrength, setRepulsionStrength] = useState<number>(35);
  const simulationRef = useRef<number | null>(null);

  // Selected node object
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId]
  );

  // Filter edges based on density threshold
  const activeEdges = useMemo(
    () => DOMAIN_RELATIONSHIPS_DATA.filter((e) => e.density >= minDensityThreshold),
    [minDensityThreshold]
  );

  // Connected edges for selected node
  const selectedNodeEdges = useMemo(() => {
    return DOMAIN_RELATIONSHIPS_DATA.filter(
      (e) => e.source === selectedNodeId || e.target === selectedNodeId
    );
  }, [selectedNodeId]);

  // Overall average relationship density
  const overallDensity = useMemo(() => {
    const total = DOMAIN_RELATIONSHIPS_DATA.reduce((acc, curr) => acc + curr.density, 0);
    return Math.round(total / DOMAIN_RELATIONSHIPS_DATA.length);
  }, []);

  // Force-directed physics calculation step
  const stepSimulation = useCallback(() => {
    setNodes((prevNodes) => {
      const updated = prevNodes.map((n) => ({ ...n }));
      const centerX = 50;
      const centerY = 48;
      const kRepulsion = repulsionStrength * 1.8;
      const damping = 0.82;
      const gravity = 0.04;

      // 1. Coulomb Repulsion between all node pairs
      for (let i = 0; i < updated.length; i++) {
        for (let j = i + 1; j < updated.length; j++) {
          const a = updated[i];
          const b = updated[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (kRepulsion / (dist * dist)) * 0.12;

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }

      // 2. Hooke's Spring Attraction along edges weighted by density
      for (const edge of activeEdges) {
        const source = updated.find((n) => n.id === edge.source);
        const target = updated.find((n) => n.id === edge.target);
        if (!source || !target) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Higher density pulls nodes closer (rest length smaller)
        const restLength = 28 - (edge.density / 100) * 12; // 16 to 28
        const springForce = (dist - restLength) * 0.015 * (edge.density / 80);

        const fx = (dx / dist) * springForce;
        const fy = (dy / dist) * springForce;

        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      }

      // 3. Center Gravity & Integrate Position
      for (const node of updated) {
        // Center gravity
        node.vx += (centerX - node.x) * gravity;
        node.vy += (centerY - node.y) * gravity;

        // Apply damping
        node.vx *= damping;
        node.vy *= damping;

        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Clamp inside [14, 86] to avoid clipping borders
        node.x = Math.max(14, Math.min(86, node.x));
        node.y = Math.max(14, Math.min(84, node.y));
      }

      return updated;
    });
  }, [activeEdges, repulsionStrength]);

  // Run simulation loop
  useEffect(() => {
    if (!isSimulating) return;

    let count = 0;
    const interval = setInterval(() => {
      stepSimulation();
      count++;
      // Auto-stabilize after 60 ticks
      if (count > 60) {
        setIsSimulating(false);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isSimulating, stepSimulation]);

  // Re-cluster action
  const handleRecluster = () => {
    // Inject small random perturbation to restart force relaxation
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
      }))
    );
    setIsSimulating(true);
    voiceAgent.speak("Re-clustering project domains based on relationship density.");
  };

  // Node Click
  const handleNodeClick = (node: DomainClusterNode) => {
    setSelectedNodeId(node.id);
    voiceAgent.speak(`Selected cluster: ${node.name}. Relationship density ${node.densityScore} percent.`);
  };

  // Custom Recharts Scatter Node Dot
  const renderCustomNodeDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    const node = payload as DomainClusterNode;
    const isSelected = selectedNodeId === node.id;
    const radius = isSelected ? 24 : 18;

    return (
      <g
        className="cursor-pointer transition-all duration-200 select-none group"
        onClick={() => handleNodeClick(node)}
      >
        {/* Outer Pulsing Aura */}
        <circle
          cx={cx}
          cy={cy}
          r={radius + 8}
          fill="none"
          stroke={node.color}
          strokeWidth={isSelected ? 2 : 1}
          strokeOpacity={isSelected ? 0.8 : 0.3}
          strokeDasharray={isSelected ? '4 3' : undefined}
          className={isSelected ? 'animate-spin' : ''}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Ambient Glow */}
        <circle
          cx={cx}
          cy={cy}
          r={radius + 4}
          fill={node.glowColor}
          filter="blur(4px)"
        />

        {/* Core Bubble */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="#090d16"
          stroke={isSelected ? '#ffffff' : node.color}
          strokeWidth={isSelected ? 3 : 2}
        />

        {/* Domain Icon / Text */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fill={isSelected ? '#ffffff' : node.color}
          fontSize={isSelected ? '11' : '10'}
          fontWeight="bold"
          fontFamily="monospace"
        >
          {node.iconText}
        </text>

        {/* Label Beneath */}
        <text
          x={cx}
          y={cy + radius + 14}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="10"
          fontWeight="bold"
          fontFamily="sans-serif"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {node.name.length > 16 ? `${node.name.slice(0, 14)}...` : node.name}
        </text>

        {/* Density Tag */}
        <text
          x={cx}
          y={cy + radius + 25}
          textAnchor="middle"
          fill={node.color}
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {node.densityScore}% Density
        </text>
      </g>
    );
  };

  // Custom Recharts Tooltip
  const CustomClusterTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const node = payload[0].payload as DomainClusterNode;
    if (!node) return null;

    return (
      <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
          <div className="flex items-center space-x-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            <span className="font-bold text-white text-xs">{node.name}</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {node.densityScore}% Density
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">{node.description}</p>
        <div className="pt-1 text-[10px] text-slate-400">
          <span className="font-semibold text-slate-300">Key Cross-Domain Assets:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {node.keyAssets.map((asset, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                {asset}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300 shadow-inner">
            <Share2 className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Domain Knowledge Cluster Visualization</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30 font-semibold">
                  Recharts Force-Directed Graph
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Maps multi-project relationship density between core system domains using physics-based force layout &amp; Recharts.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          {/* Average Density Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Mean Density:</span>
            <span className="font-mono font-bold text-cyan-300">{overallDensity}%</span>
          </div>

          {/* Toggle View Tab */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('graph')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'graph' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Force Graph
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'matrix' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Density Matrix
            </button>
          </div>

          {/* Re-cluster Simulation Button */}
          <button
            type="button"
            onClick={handleRecluster}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold transition cursor-pointer"
            title="Re-run force relaxation physics simulation"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Relaxing...' : 'Re-cluster'}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Graph or Matrix */}
      {activeTab === 'graph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Recharts Canvas Section (3 Cols) */}
          <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-3 relative flex flex-col justify-between overflow-hidden shadow-inner min-h-[480px]">
            {/* Top Toolbar over Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 border-b border-slate-800/80 text-xs text-slate-400 z-10">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  Min Density Filter:
                </span>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={minDensityThreshold}
                  onChange={(e) => setMinDensityThreshold(Number(e.target.value))}
                  className="w-24 sm:w-32 accent-cyan-500 cursor-pointer"
                />
                <span className="font-mono text-cyan-300 font-bold text-[11px]">{minDensityThreshold}%</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-500">Repulsion:</span>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={repulsionStrength}
                  onChange={(e) => {
                    setRepulsionStrength(Number(e.target.value));
                    setIsSimulating(true);
                  }}
                  className="w-20 accent-indigo-500 cursor-pointer"
                />
                <span className="font-mono text-indigo-300 text-[10px]">{repulsionStrength}</span>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Synergies: {activeEdges.length} Links</span>
              </div>
            </div>

            {/* SVG Background Layer for Connected Edges */}
            <div className="relative w-full h-[430px] flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
              >
                <defs>
                  <linearGradient id="cyanPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Render Relationship Density Edges */}
                {activeEdges.map((edge) => {
                  const source = nodes.find((n) => n.id === edge.source);
                  const target = nodes.find((n) => n.id === edge.target);
                  if (!source || !target) return null;

                  const isEdgeConnectedToSelected =
                    source.id === selectedNodeId || target.id === selectedNodeId;

                  const strokeColor = isEdgeConnectedToSelected
                    ? '#38bdf8'
                    : edge.density >= 90
                    ? '#c084fc'
                    : '#334155';

                  const strokeWidth = (edge.density / 100) * (isEdgeConnectedToSelected ? 0.9 : 0.55);
                  const opacity = isEdgeConnectedToSelected ? 0.9 : 0.45;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeOpacity={opacity}
                        strokeDasharray={edge.density >= 90 ? '1.5 1' : undefined}
                      />
                      {/* Midpoint Density Pill */}
                      {isEdgeConnectedToSelected && (
                        <g>
                          <circle
                            cx={(source.x + target.x) / 2}
                            cy={(source.y + target.y) / 2}
                            r={1.8}
                            fill="#090d16"
                            stroke={strokeColor}
                            strokeWidth={0.3}
                          />
                          <text
                            x={(source.x + target.x) / 2}
                            y={(source.y + target.y) / 2 + 0.5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="1.1"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {edge.density}%
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Recharts ScatterChart Force Graph Layer */}
              <div className="relative w-full h-full z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 25, right: 35, bottom: 35, left: 35 }}>
                    <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                    <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                    <ZAxis type="number" dataKey="z" range={[700, 2400]} />
                    <Tooltip content={<CustomClusterTooltip />} />
                    <Scatter
                      name="Knowledge Domains"
                      data={nodes}
                      shape={renderCustomNodeDot}
                      animationDuration={400}
                    >
                      {nodes.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-2 border-t border-slate-800/80 text-[11px] text-slate-400 z-10">
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> High Density Core
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span> Cross-Domain Synergies
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Gated Runtime
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Click any domain bubble to focus Max &amp; inspect relationship telemetry
              </span>
            </div>
          </div>

          {/* Right Column: Selected Domain Telemetry Drawer */}
          <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              {/* Domain Header Card */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    {selectedNode.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{selectedNode.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-cyan-300">
                    {selectedNode.densityScore}%
                  </span>
                  <p className="text-[9px] text-slate-500 uppercase">Density</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>

              {/* Connected Domains and Density Breakdown */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Network className="w-3 h-3 text-cyan-400" />
                  Connected Domain Bridges ({selectedNodeEdges.length})
                </span>

                <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar pt-1">
                  {selectedNodeEdges.map((edge) => {
                    const otherId = edge.source === selectedNodeId ? edge.target : edge.source;
                    const otherNode = nodes.find((n) => n.id === otherId);
                    if (!otherNode) return null;

                    return (
                      <div
                        key={edge.id}
                        onClick={() => handleNodeClick(otherNode)}
                        className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition flex items-center justify-between text-xs group"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: otherNode.color }}
                          />
                          <span className="font-semibold text-slate-200 group-hover:text-cyan-300 truncate text-[11px]">
                            {otherNode.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 font-mono font-bold text-[10px] text-cyan-400 flex-shrink-0">
                          <span>{edge.density}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shared Assets */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Reusable Cross-Domain Assets
                </span>
                <div className="space-y-1 pt-0.5">
                  {selectedNode.keyAssets.map((asset, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{asset}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  voiceAgent.speak(`Focusing Max on ${selectedNode.name} knowledge cluster.`);
                }}
                className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/20"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Focus Max on Cluster</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Density Matrix View */
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto no-scrollbar">
          <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
            <span className="font-semibold text-slate-200">
              Cross-Domain Relationship Density Matrix (%)
            </span>
            <span className="text-[11px] text-slate-500">
              Computed based on shared skill trees, architectural constraints, and task dependencies
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">Project Domain</th>
                {nodes.map((n) => (
                  <th key={n.id} className="py-2 px-3 text-center text-slate-300 font-bold text-[11px]">
                    {n.iconText}
                  </th>
                ))}
                <th className="py-2 px-3 text-right text-cyan-400 font-bold text-[10px] uppercase">Mean</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((rowNode) => {
                let rowSum = 0;
                let count = 0;

                return (
                  <tr key={rowNode.id} className="border-b border-slate-900 hover:bg-slate-900/50 transition">
                    <td className="py-2 px-3 font-semibold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rowNode.color }} />
                      <span>{rowNode.name}</span>
                    </td>

                    {nodes.map((colNode) => {
                      if (rowNode.id === colNode.id) {
                        return (
                          <td key={colNode.id} className="py-2 px-3 text-center font-mono text-slate-600">
                            —
                          </td>
                        );
                      }

                      const edge = DOMAIN_RELATIONSHIPS_DATA.find(
                        (e) =>
                          (e.source === rowNode.id && e.target === colNode.id) ||
                          (e.source === colNode.id && e.target === rowNode.id)
                      );

                      const density = edge ? edge.density : 0;
                      if (density > 0) {
                        rowSum += density;
                        count++;
                      }

                      return (
                        <td key={colNode.id} className="py-2 px-3 text-center">
                          {density > 0 ? (
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                                density >= 90
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                  : density >= 75
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {density}%
                            </span>
                          ) : (
                            <span className="text-slate-700 font-mono">0%</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2 px-3 text-right font-mono font-bold text-cyan-300">
                      {count > 0 ? `${Math.round(rowSum / count)}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
