import React, { useState } from 'react';
import {
  Network,
  Share2,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
  Layers,
  Search,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';

interface GraphNode {
  id: string;
  label: string;
  type: 'project' | 'goal' | 'skill' | 'knowledge' | 'decision' | 'person';
  x: number;
  y: number;
  description: string;
  reusableIn?: string[];
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  isReuseSynergy?: boolean;
}

const GRAPH_NODES: GraphNode[] = [
  // Projects (Center hubs)
  {
    id: 'proj-educore',
    label: 'EduCore Platform',
    type: 'project',
    x: 240,
    y: 190,
    description: 'Adaptive computer science learning system with WebWorker WASM code evaluation.',
  },
  {
    id: 'proj-sales',
    label: 'Sales Intelligence',
    type: 'project',
    x: 580,
    y: 180,
    description: 'Enterprise prospect research, ICP scoring, and human-in-the-loop outbound drafts.',
  },
  {
    id: 'proj-kernel',
    label: 'AetherOS Kernel',
    type: 'project',
    x: 410,
    y: 390,
    description: 'Approval-gated self-improving agent runtime with 19-field proposal sandbox.',
  },

  // Skills & Tech
  {
    id: 'skill-ast',
    label: 'AST Analysis Engine',
    type: 'skill',
    x: 410,
    y: 90,
    description: 'Static syntax parsing and misconception classifier. Identifies structural patterns in code.',
    reusableIn: ['EduCore Platform', 'Coding Agent', 'Sales Intelligence'],
  },
  {
    id: 'skill-wasm',
    label: 'WASM Worker Sandbox',
    type: 'skill',
    x: 150,
    y: 330,
    description: 'Safe in-browser execution with watchdog timers and zero memory leakage.',
    reusableIn: ['EduCore Platform', 'AetherOS Kernel'],
  },
  {
    id: 'skill-outbound',
    label: 'Founder Outbound Formula',
    type: 'skill',
    x: 740,
    y: 290,
    description: 'Technical architecture teardown outreach for enterprise engineering leaders.',
    reusableIn: ['Sales Intelligence', 'EduCore B2B Licensing'],
  },

  // Knowledge & Architecture Decisions
  {
    id: 'know-approval',
    label: 'Approval-Gated Safety Pattern',
    type: 'knowledge',
    x: 410,
    y: 510,
    description: 'Consequential operations stage to isolated queue before human digital sign-off.',
    reusableIn: ['AetherOS Kernel', 'Sales Intelligence', 'EduCore'],
  },
  {
    id: 'dec-localfirst',
    label: 'Local-First Vector Model',
    type: 'decision',
    x: 160,
    y: 470,
    description: 'Keeps user intellectual property and memory private with sub-20ms queries.',
  },

  // People & Collaborators
  {
    id: 'person-elena',
    label: 'Elena Rostova (VoxelDB)',
    type: 'person',
    x: 340,
    y: 20,
    description: 'DevRel leader interested in partnering on curriculum and enterprise sales.',
  },
  {
    id: 'person-marcus',
    label: 'Marcus Chen (CloudStream)',
    type: 'person',
    x: 720,
    y: 110,
    description: 'VP of Engineering evaluating pilot for Sales Agent code review briefs.',
  },

  // Goals
  {
    id: 'goal-beta',
    label: '500 Active Students',
    type: 'goal',
    x: 80,
    y: 130,
    description: 'Launch EduCore Beta and reach 60% completion rate.',
  },
  {
    id: 'goal-pipeline',
    label: '35 Enterprise Demos / Mo',
    type: 'goal',
    x: 720,
    y: 410,
    description: 'Fully automate high-touch prospect discovery and personalized pitches.',
  },
];

const GRAPH_EDGES: GraphEdge[] = [
  // EduCore connections
  { from: 'proj-educore', to: 'skill-ast', label: 'validates with' },
  { from: 'proj-educore', to: 'skill-wasm', label: 'executes in' },
  { from: 'proj-educore', to: 'goal-beta', label: 'targets' },
  { from: 'proj-educore', to: 'person-elena', label: 'partners with' },

  // Sales Agent connections
  { from: 'proj-sales', to: 'skill-outbound', label: 'executes' },
  { from: 'proj-sales', to: 'person-marcus', label: 'pitches' },
  { from: 'proj-sales', to: 'goal-pipeline', label: 'targets' },

  // Kernel connections
  { from: 'proj-kernel', to: 'know-approval', label: 'enforces' },
  { from: 'proj-kernel', to: 'dec-localfirst', label: 'stores state in' },
  { from: 'proj-kernel', to: 'skill-wasm', label: 'evaluates in' },

  // SYNERGY & REUSE EDGES (Section 17 specification!)
  {
    from: 'skill-ast',
    to: 'proj-sales',
    label: 'REUSE: Scrape prospect tech stack',
    isReuseSynergy: true,
  },
  {
    from: 'skill-wasm',
    to: 'proj-kernel',
    label: 'REUSE: Proposal sandbox testing',
    isReuseSynergy: true,
  },
  {
    from: 'know-approval',
    to: 'proj-sales',
    label: 'REUSE: Email draft sign-off queue',
    isReuseSynergy: true,
  },
];

const NODE_COLORS: Record<GraphNode['type'], { bg: string; border: string; text: string }> = {
  project: { bg: '#4338ca', border: '#6366f1', text: '#ffffff' },
  goal: { bg: '#065f46', border: '#10b981', text: '#a7f3d0' },
  skill: { bg: '#0369a1', border: '#38bdf8', text: '#bae6fd' },
  knowledge: { bg: '#581c87', border: '#a855f7', text: '#f3e8ff' },
  decision: { bg: '#854d0e', border: '#facc15', text: '#fef08a' },
  person: { bg: '#9d174d', border: '#f43f5e', text: '#ffe4e6' },
};

export const KnowledgeGraphView: React.FC = () => {
  const { sendMessage } = useAgent();
  const [selectedNode, setSelectedNode] = useState<GraphNode>(GRAPH_NODES[0]);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNodes = GRAPH_NODES.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Interactive Knowledge Graph &amp; Reuse Detection</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Ontological Entity Graph &amp; Cross-Project Synergies
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing relationships between your goals, projects, skills, knowledge, decisions, and people.
            Highlighting identified reuse opportunities across ventures.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded cursor-pointer ${
              filterType === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Entities
          </button>
          <button
            onClick={() => setFilterType('project')}
            className={`px-2.5 py-1 rounded cursor-pointer ${
              filterType === 'project' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setFilterType('skill')}
            className={`px-2.5 py-1 rounded cursor-pointer ${
              filterType === 'skill' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Skills / Tech
          </button>
          <button
            onClick={() => setFilterType('knowledge')}
            className={`px-2.5 py-1 rounded cursor-pointer ${
              filterType === 'knowledge' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Knowledge &amp; Decisions
          </button>
        </div>
      </div>

      {/* Main Graph Canvas and Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive SVG Graph Area (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
              Purple dashed lines denote automated cross-project reuse detection
            </span>
            <span className="text-[11px] text-slate-500">Click any node to inspect context</span>
          </div>

          <div className="w-full h-[520px] overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 850 560" className="w-full h-full select-none">
              <defs>
                <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Render Edges */}
              {GRAPH_EDGES.map((edge, idx) => {
                const source = GRAPH_NODES.find((n) => n.id === edge.from);
                const target = GRAPH_NODES.find((n) => n.id === edge.to);
                if (!source || !target) return null;

                const isSynergy = edge.isReuseSynergy;

                return (
                  <g key={idx}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isSynergy ? '#c084fc' : '#334155'}
                      strokeWidth={isSynergy ? 2.5 : 1.5}
                      strokeDasharray={isSynergy ? '5 4' : undefined}
                      className={isSynergy ? 'animate-pulse' : ''}
                    />
                    {/* Edge Midpoint Label */}
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 4}
                      fill={isSynergy ? '#e9d5ff' : '#64748b'}
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight={isSynergy ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const colors = NODE_COLORS[node.type];

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx={node.x}
                      y={node.y}
                      r={node.type === 'project' ? 32 : 24}
                      fill={colors.bg}
                      stroke={isSelected ? '#ffffff' : colors.border}
                      strokeWidth={isSelected ? 3.5 : 2}
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill="#ffffff"
                      fontSize={node.type === 'project' ? '10' : '9'}
                      fontWeight="bold"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {node.label.slice(0, 14)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Graph Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Projects
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Goals
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Skills &amp; Tech
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-700"></span> Knowledge
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-600"></span> Decisions
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-700"></span> People
            </span>
          </div>
        </div>

        {/* Right Column: Node Context Drawer */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                {selectedNode.type}
              </span>
              <span className="text-slate-500 font-mono text-[10px]">ID: {selectedNode.id}</span>
            </div>

            <h3 className="text-lg font-bold text-white mt-2">{selectedNode.label}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedNode.description}</p>

            {/* Reusability Tags */}
            {selectedNode.reusableIn && selectedNode.reusableIn.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                  <Share2 className="w-3 h-3" />
                  Identified Cross-Project Reuse:
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pt-1">
                  {selectedNode.reusableIn.map((item, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() =>
                sendMessage(`Tell me how ${selectedNode.label} connects to my active goals and projects.`)
              }
              className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Query Connections in Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
