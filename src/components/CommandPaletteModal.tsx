import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  LayoutDashboard,
  BrainCircuit,
  Bot,
  CheckSquare,
  ShieldCheck,
  Wrench,
  Network,
  Milestone,
  Zap,
  Mic,
  Activity,
  Plus,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Database,
  Cpu,
  Brain,
  Share2,
  Pin,
  RotateCcw,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { voiceAgent, AI_VOICE_PROFILES } from '../services/voiceAgentService';
import { ActiveTab, OPERATING_MODES } from './Navigation';
import { OperatingMode, AgentEmotion } from '../types/agent';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenQuickTask: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Workspaces' | 'Abimbola Operations' | 'Operating Modes' | 'Quick Tools';
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenQuickTask,
}) => {
  const { runAutonomousLoop, setActiveMode, proposals, worldModel } = useAgent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input whenever palette is opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Registry of commands
  const allCommands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // 1. Workspaces
      {
        id: 'nav-visualizer',
        title: 'Holographic Visualizer',
        description: 'Ecosystem Core & 3D Autonomous Agent Architecture',
        category: 'Workspaces',
        icon: <Cpu className="w-4 h-4 text-cyan-400" />,
        keywords: ['visualizer', 'hologram', 'home', 'core', 'ecosystem'],
        action: () => {
          onSelectTab('visualizer');
          onClose();
        },
      },
      {
        id: 'nav-projects',
        title: 'Projects & Metrics Dashboard',
        description: 'Active Projects Health, Velocity & Mock Database Layer',
        category: 'Workspaces',
        icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" />,
        keywords: ['projects', 'command center', 'dashboard', 'metrics', 'velocity', 'postgres'],
        action: () => {
          onSelectTab('command-center');
          onClose();
        },
      },
      {
        id: 'nav-task-engine',
        title: 'Task Engine (4 Tiers)',
        description: 'Manage Critical, High, Medium & Low Urgency Tasks',
        category: 'Workspaces',
        icon: <CheckSquare className="w-4 h-4 text-emerald-400" />,
        keywords: ['task', 'tasks', 'todo', 'urgency', 'priority', 'schedule'],
        action: () => {
          onSelectTab('task-engine');
          onClose();
        },
      },
      {
        id: 'nav-specialists',
        title: 'Specialist Agents & Orchestrator',
        description: 'Research, Coding, Architecture, Sales & Review Agent Team',
        category: 'Workspaces',
        icon: <Bot className="w-4 h-4 text-purple-400" />,
        keywords: ['agents', 'specialist', 'orchestrator', 'team', 'coding agent'],
        action: () => {
          onSelectTab('orchestrator');
          onClose();
        },
      },
      {
        id: 'nav-world-model',
        title: 'World Model & Memory Store',
        description: 'User Identity, Strategic Goals, Businesses & Contacts',
        category: 'Workspaces',
        icon: <BrainCircuit className="w-4 h-4 text-cyan-400" />,
        keywords: ['world model', 'memory', 'goals', 'identity', 'kpi'],
        action: () => {
          onSelectTab('world-model');
          onClose();
        },
      },
      {
        id: 'nav-sandbox',
        title: 'Sandbox Gate & Self-Improvement',
        description: 'Human-Gated Mutation Proposals & WASM Sandbox Validation',
        category: 'Workspaces',
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
        keywords: ['sandbox', 'self improvement', 'proposals', 'gate', 'signatures'],
        action: () => {
          onSelectTab('self-improvement');
          onClose();
        },
      },
      {
        id: 'nav-tool-registry',
        title: 'Tool Policies & API Registry',
        description: 'Sandboxed Tool Boundaries & Read-Only Default Policies',
        category: 'Workspaces',
        icon: <Wrench className="w-4 h-4 text-sky-400" />,
        keywords: ['tools', 'tool registry', 'policies', 'api', 'permissions'],
        action: () => {
          onSelectTab('tool-registry');
          onClose();
        },
      },
      {
        id: 'nav-knowledge-graph',
        title: 'Knowledge Graph & Synergies',
        description: 'Interactive Graph & Cross-Project Pattern Reuse',
        category: 'Workspaces',
        icon: <Network className="w-4 h-4 text-pink-400" />,
        keywords: ['knowledge graph', 'graph', 'synergies', 'reuse', 'patterns'],
        action: () => {
          onSelectTab('knowledge-graph');
          onClose();
        },
      },
      {
        id: 'nav-dev-strategy',
        title: 'Dev Strategy (Phases 1-7)',
        description: 'Architectural Implementation Roadmap & Milestones',
        category: 'Workspaces',
        icon: <Milestone className="w-4 h-4 text-teal-400" />,
        keywords: ['dev strategy', 'roadmap', 'phases', 'milestones'],
        action: () => {
          onSelectTab('dev-strategy');
          onClose();
        },
      },

      // 2. Abimbola Operations
      {
        id: 'act-quick-task',
        title: 'Create Quick Task with Natural Language',
        description: 'Pipe natural language directly into Task Engine for scheduling',
        category: 'Abimbola Operations',
        icon: <Plus className="w-4 h-4 text-cyan-300" />,
        keywords: ['quick task', 'new task', 'add task', 'pipe', 'create task', 'schedule'],
        action: () => {
          onClose();
          onOpenQuickTask();
        },
      },
      {
        id: 'act-trigger-loop',
        title: 'Trigger Level 5 Autonomous Reasoning Loop',
        description: 'Execute full-cycle AST verification & project continuity sync',
        category: 'Abimbola Operations',
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        keywords: ['loop', 'autonomous loop', 'reasoning', 'ast', 'verify', 'continuity'],
        action: () => {
          onClose();
          runAutonomousLoop('Level 5 autonomous loop executed via Command Palette');
        },
      },
      {
        id: 'act-voice-toggle',
        title: 'Talk to Abimbola (Voice Commander)',
        description: 'Activate real-time Web Speech recognition and audio stream',
        category: 'Abimbola Operations',
        icon: <Mic className="w-4 h-4 text-rose-400" />,
        keywords: ['voice', 'speak', 'mic', 'microphone', 'listen', 'talk'],
        action: () => {
          onClose();
          voiceAgent.startListening();
        },
      },
      {
        id: 'act-system-status',
        title: 'System Health & Invariant Telemetry Check',
        description: 'Read out 98% system health, AST memory leaks, and Level 5 status',
        category: 'Abimbola Operations',
        icon: <Activity className="w-4 h-4 text-emerald-400" />,
        keywords: ['status', 'health', 'telemetry', 'check', 'invariants'],
        action: () => {
          onClose();
          voiceAgent.handleVoiceInput('Check system status');
        },
      },
      {
        id: 'act-pending-gates',
        title: 'Inspect Pending Human Approval Gates',
        description: `View ${proposals.filter((p) => p.approvalStatus === 'Proposed').length} proposals requiring signature`,
        category: 'Abimbola Operations',
        icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
        keywords: ['approvals', 'gates', 'signatures', 'pending'],
        action: () => {
          onSelectTab('self-improvement');
          onClose();
        },
      },
      {
        id: 'act-memory-decay',
        title: 'Context Memory Decay Monitor',
        description: 'View decaying working context, refresh retention, and pin critical memory anchors',
        category: 'Abimbola Operations',
        icon: <Brain className="w-4 h-4 text-indigo-400" />,
        keywords: ['memory', 'decay', 'pin', 'refresh', 'context', 'stale', 'retention', 'abimbola focus'],
        action: () => {
          onSelectTab('orchestrator');
          onClose();
          voiceAgent.speak('Navigating to Orchestrator Context Memory Decay Monitor.');
        },
      },
      {
        id: 'act-knowledge-clusters',
        title: 'Domain Knowledge Clusters (Recharts)',
        description: 'Force-directed node graph mapping multi-project relationship density',
        category: 'Abimbola Operations',
        icon: <Share2 className="w-4 h-4 text-cyan-400" />,
        keywords: ['cluster', 'knowledge cluster', 'density', 'recharts', 'force graph', 'relationship', 'graph'],
        action: () => {
          onSelectTab('knowledge-graph');
          onClose();
          voiceAgent.speak('Navigating to Domain Knowledge Cluster force graph.');
        },
      },

      // AI-Generated Voice Profiles
      ...AI_VOICE_PROFILES.map((vp) => ({
        id: `voice-profile-${vp.id}`,
        title: `Select Voice Profile: ${vp.name}`,
        description: `${vp.tone} • ${vp.description.slice(0, 60)}...`,
        category: 'Abimbola Operations' as const,
        icon: <Volume2 className="w-4 h-4 text-cyan-400" />,
        keywords: ['voice', 'profile', 'tts', 'speech', vp.name, vp.id, 'speech synthesis'],
        action: () => {
          voiceAgent.setVoiceProfile(vp.id);
          voiceAgent.speak(`Voice profile updated to ${vp.name}. ${vp.tone}.`);
          onClose();
        },
      })),

      // AgentEmotion Modulation Commands
      ...([
        { emotion: 'triumphant' as AgentEmotion, label: 'Triumphant', desc: 'Golden emerald aurora & celebratory bounce' },
        { emotion: 'focused' as AgentEmotion, label: 'Focused', desc: 'Deep ultraviolet & high-speed neural tensor' },
        { emotion: 'curious' as AgentEmotion, label: 'Curious', desc: 'Electric turquoise & inquisitive aperture tilt' },
        { emotion: 'alert' as AgentEmotion, label: 'Alert / Vigilant', desc: 'Crimson hazard strobe & system vigilance' },
        { emotion: 'empathetic' as AgentEmotion, label: 'Empathetic', desc: 'Soft rose warmth & soothing breath float' },
        { emotion: 'neutral' as AgentEmotion, label: 'Neutral', desc: 'Cyan equilibrium & steady baseline hover' },
      ].map((em) => ({
        id: `emotion-${em.emotion}`,
        title: `Set AgentEmotion: ${em.label}`,
        description: em.desc,
        category: 'Abimbola Operations' as const,
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        keywords: ['emotion', 'sentiment', em.emotion, em.label, 'avatar', 'appearance'],
        action: () => {
          voiceAgent.setEmotion(em.emotion, `User manually commanded ${em.label} emotion via Command Palette.`);
          voiceAgent.speak(`Abimbola emotion transitioned to ${em.label}.`);
          onClose();
        },
      }))),

      // 3. Operating Modes
      ...OPERATING_MODES.map((m) => ({
        id: `mode-${m.mode}`,
        title: `Switch Mode: ${m.label}`,
        description: m.desc,
        category: 'Operating Modes' as const,
        icon: <span className="text-sm">{m.icon}</span>,
        keywords: ['mode', m.mode, m.label, m.desc],
        action: () => {
          setActiveMode(m.mode);
          voiceAgent.speak(`Abimbola operating mode switched to ${m.label}.`);
          onClose();
        },
      })),

      // 4. Quick Tools
      {
        id: 'tool-toggle-mute',
        title: 'Mute / Unmute Abimbola Voice',
        description: 'Toggle speech synthesis sound output',
        category: 'Quick Tools',
        icon: <Volume2 className="w-4 h-4 text-cyan-400" />,
        keywords: ['mute', 'unmute', 'sound', 'voice volume'],
        action: () => {
          voiceAgent.toggleMute();
          onClose();
        },
      },
    ];

    return list;
  }, [onSelectTab, onClose, onOpenQuickTask, runAutonomousLoop, setActiveMode, proposals]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allCommands;

    return allCommands.filter((item) => {
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.description.toLowerCase().includes(q)) return true;
      if (item.category.toLowerCase().includes(q)) return true;
      return item.keywords.some((k) => k.toLowerCase().includes(q));
    });
  }, [allCommands, searchQuery]);

  // Group filtered commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) {
        current.action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#070e24] border border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden select-none animate-in zoom-in-95 duration-150"
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 flex-shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search features (e.g. 'Task', 'Visualizer', 'Quick Task', 'Loop')..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-sans"
          />

          <div className="flex items-center space-x-1.5 ml-2 flex-shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto no-scrollbar p-2 sm:p-3 space-y-3"
        >
          {filteredCommands.length > 0 ? (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-2 block">
                  {category}
                </span>

                {items.map((item) => {
                  const globalIdx = filteredCommands.findIndex((c) => c.id === item.id);
                  const isSelected = globalIdx === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-600/25 via-indigo-600/20 to-cyan-600/25 border border-cyan-500/50 shadow-[0_2px_12px_rgba(6,182,212,0.2)]'
                          : 'hover:bg-slate-850/80 border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className={`p-1.5 rounded-lg flex-shrink-0 ${
                            isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-850 text-slate-400'
                          }`}
                        >
                          {item.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected ? 'text-white' : 'text-slate-200'
                            }`}
                          >
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 ml-2 flex-shrink-0">
                        {isSelected && (
                          <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1 animate-in fade-in">
                            <span>Execute</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <Command className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No commands matching "{searchQuery}"
              </p>
              <p className="text-xs text-slate-500">
                Try searching for 'visualizer', 'quick task', 'loop', 'voice', or 'projects'
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar for Keyboard Shortcuts */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 select-none">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
                &uarr; &darr;
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 font-mono border border-slate-700">
                &crarr;
              </kbd>
              <span>Select</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-[10px]">Abimbola Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
};
