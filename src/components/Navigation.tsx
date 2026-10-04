import React, { useState } from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  Bot,
  CheckSquare,
  ShieldCheck,
  Wrench,
  Network,
  Milestone,
  Sparkles,
  ChevronDown,
  Terminal,
  Activity,
  Zap,
  Search,
  Bell,
  Menu,
  X,
  Cpu,
  Layers,
  ShieldAlert,
  Radio,
  Volume2,
  VolumeX,
  ArrowLeft,
  Plus,
  Command,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { OperatingMode, SpecialistAgentType } from '../types/agent';
import { AgentVoiceHub } from './AgentVoiceHub';
import { AgentAvatar } from './AgentAvatar';
import { voiceAgent } from '../services/voiceAgentService';

export type ActiveTab =
  | 'visualizer'
  | 'command-center'
  | 'orchestrator'
  | 'world-model'
  | 'task-engine'
  | 'self-improvement'
  | 'tool-registry'
  | 'knowledge-graph'
  | 'dev-strategy';

interface NavigationProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenCommandPalette?: () => void;
  onOpenQuickTask?: () => void;
}

export const OPERATING_MODES: { mode: OperatingMode; label: string; icon: string; desc: string }[] = [
  { mode: 'chat', label: 'Chat', icon: '💬', desc: 'Executive dialogue & triage' },
  { mode: 'research', label: 'Research', icon: '🔬', desc: 'Evidence & literature synthesis' },
  { mode: 'build', label: 'Build', icon: '🏗️', desc: 'Product & implementation specs' },
  { mode: 'code', label: 'Code', icon: '💻', desc: 'Workflows, tests & refactoring' },
  { mode: 'think', label: 'Think', icon: '🧠', desc: 'Structuring incomplete ideas' },
  { mode: 'planning', label: 'Planning', icon: '📅', desc: 'Milestones, dependencies, schedules' },
  { mode: 'execute', label: 'Execute', icon: '⚡', desc: 'Controlled tool operations' },
  { mode: 'learn', label: 'Learn', icon: '🎓', desc: 'Interactive concept deconstruction' },
  { mode: 'review', label: 'Review', icon: '🛡️', desc: 'Critical critique & pre-mortems' },
];

/**
 * Tactile Left Sidebar Rail with Abimbola branding
 */
export const SidebarRail: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenCommandPalette,
  onOpenQuickTask,
}) => {
  const {
    worldModel,
    specialistAgents,
    activeAgent,
    activeMode,
    setActiveMode,
    proposals,
    auditLogs,
    runAutonomousLoop,
    isThinking,
  } = useAgent();

  const pendingApprovalsCount =
    proposals.filter((p) => p.approvalStatus === 'Proposed').length +
    worldModel.projects.flatMap((p) => p.tasks).filter((t) => t.currentState === 'awaiting_approval').length;

  const allTasksCount = worldModel.projects.flatMap((p) => p.tasks).length;

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col justify-between p-3.5 bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl select-none h-screen overflow-hidden shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
      <div className="space-y-3.5 overflow-y-auto no-scrollbar pr-0.5">
        {/* User Identity & Abimbola Agent Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-950/90 border border-slate-700/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.4)] flex items-center space-x-3">
          <AgentAvatar size="sm" isThinking={isThinking} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1">
              <h3 className="text-xs font-bold text-white truncate tracking-tight">
                Abimbola
              </h3>
              <span className="text-xs">⚡</span>
            </div>
            <p className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider truncate">
              Autonomous AI &bull; Lvl 5
            </p>
          </div>
        </div>

        {/* Quick Action Buttons: Quick Task & Command Palette */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          {onOpenQuickTask && (
            <button
              type="button"
              onClick={onOpenQuickTask}
              className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold transition cursor-pointer shadow-sm"
              title="Schedule Task via Natural Language"
            >
              <Plus className="w-3 h-3 text-emerald-400" />
              <span>Quick Task</span>
            </button>
          )}

          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 text-[10px] font-semibold transition cursor-pointer"
              title="Command Palette (Ctrl+K)"
            >
              <Command className="w-3 h-3 text-cyan-400" />
              <span>Ctrl+K</span>
            </button>
          )}
        </div>

        {/* Primary Holographic Visualizer Tab Button */}
        <div className="pt-0.5">
          <TactileNavItem
            active={currentTab === 'visualizer'}
            onClick={() => onSelectTab('visualizer')}
            icon={<Cpu className="w-4 h-4 text-cyan-300 animate-pulse" />}
            label="Holographic Visualizer"
            badge="Core"
            badgeColor="bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.6)]"
          />
        </div>

        {/* Ecosystem Workspaces Moved to Navigation Bar */}
        <div className="space-y-1">
          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest px-3 block mb-1">
            Ecosystem Workspaces
          </span>

          <TactileNavItem
            active={currentTab === 'command-center'}
            onClick={() => onSelectTab('command-center')}
            icon={<LayoutDashboard className="w-4 h-4 text-indigo-400" />}
            label="Projects &amp; Metrics"
            badge={worldModel.projects.length}
            badgeColor="bg-slate-800 text-slate-300"
          />

          <TactileNavItem
            active={currentTab === 'task-engine'}
            onClick={() => onSelectTab('task-engine')}
            icon={<CheckSquare className="w-4 h-4 text-emerald-400" />}
            label="Task Engine (4 Tiers)"
            badge={allTasksCount}
            badgeColor="bg-slate-800 text-slate-300"
          />

          <TactileNavItem
            active={currentTab === 'orchestrator'}
            onClick={() => onSelectTab('orchestrator')}
            icon={<Bot className="w-4 h-4 text-purple-400" />}
            label="Specialist Agents"
          />

          <TactileNavItem
            active={currentTab === 'world-model'}
            onClick={() => onSelectTab('world-model')}
            icon={<BrainCircuit className="w-4 h-4 text-cyan-400" />}
            label="World Model &amp; Memory"
          />

          <TactileNavItem
            active={currentTab === 'self-improvement'}
            onClick={() => onSelectTab('self-improvement')}
            icon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
            label="Sandbox Gate"
            badge={pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined}
            badgeColor="bg-amber-500/20 text-amber-300 border border-amber-500/40"
          />

          <TactileNavItem
            active={currentTab === 'tool-registry'}
            onClick={() => onSelectTab('tool-registry')}
            icon={<Wrench className="w-4 h-4 text-sky-400" />}
            label="Tool Policies &amp; APIs"
          />

          <TactileNavItem
            active={currentTab === 'knowledge-graph'}
            onClick={() => onSelectTab('knowledge-graph')}
            icon={<Network className="w-4 h-4 text-pink-400" />}
            label="Knowledge Graph"
          />

          <TactileNavItem
            active={currentTab === 'dev-strategy'}
            onClick={() => onSelectTab('dev-strategy')}
            icon={<Milestone className="w-4 h-4 text-teal-400" />}
            label="Dev Strategy (Phases 1-7)"
          />
        </div>

        {/* Operating Mode Selector */}
        <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Operating Mode</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-300 capitalize">
              {activeMode}
            </span>
          </div>

          <select
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value as OperatingMode)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {OPERATING_MODES.map((m) => (
              <option key={m.mode} value={m.mode} className="bg-slate-900 text-slate-200">
                {m.icon} {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bottom Autonomy Level 5 Card */}
      <div className="flex-shrink-0 mt-2 p-2.5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between text-cyan-300 font-black text-xs uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Abimbola &bull; Level 5</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
            Active
          </span>
        </div>

        <button
          type="button"
          onClick={() => voiceAgent.toggleListening()}
          className="mt-2 w-full py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer transition flex items-center justify-center space-x-1.5"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
          <span>Speak to Abimbola</span>
        </button>
      </div>
    </aside>
  );
};

const TactileNavItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  badgeColor?: string;
}> = ({ active, onClick, icon, label, badge, badgeColor }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
      active
        ? 'bg-gradient-to-r from-indigo-600/30 via-cyan-600/25 to-indigo-600/30 text-white border border-cyan-500/60 shadow-[0_3px_15px_rgba(6,182,212,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
    }`}
  >
    <div className="flex items-center space-x-2.5 truncate">
      <div className={`p-1 rounded-lg ${active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/80 text-slate-400'}`}>
        {icon}
      </div>
      <span className="truncate">{label}</span>
    </div>

    {badge !== undefined && (
      <span
        className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ml-1 font-mono ${
          badgeColor || (active ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300')
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);

/**
 * Top Telemetry HUD Navigation Bar with Command Palette & Quick Task Shortcuts
 */
export const TopNavigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenCommandPalette,
  onOpenQuickTask,
}) => {
  const {
    worldModel,
    specialistAgents,
    activeAgent,
    activeProjectId,
    setActiveAgent,
    setActiveProjectId,
    proposals,
    runAutonomousLoop,
    isThinking,
  } = useAgent();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingApprovalsCount =
    proposals.filter((p) => p.approvalStatus === 'Proposed').length +
    worldModel.projects.flatMap((p) => p.tasks).filter((t) => t.currentState === 'awaiting_approval').length;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl shadow-md select-none flex-shrink-0">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-3">
          {/* Left: Mobile Menu Toggle & Brand with Animated AgentAvatar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* INTEGRATED AGENT AVATAR */}
            <div
              onClick={() => onSelectTab('visualizer')}
              className="flex items-center space-x-2.5 cursor-pointer group"
              title="Abimbola - Return to Holographic Visualizer"
            >
              <AgentAvatar size="sm" isThinking={isThinking} />

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm sm:text-base text-white tracking-tight group-hover:text-cyan-200 transition">
                    Abimbola
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Agentic AI
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 hidden sm:inline">
                  Level 5 Ecosystem
                </span>
              </div>
            </div>

            {/* Command Palette Trigger Button (Ctrl+K / ⌘K) */}
            {onOpenCommandPalette && (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-white transition cursor-pointer text-xs"
                title="Open Command Palette (Control+K / ⌘K)"
              >
                <Search className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px]">Search</span>
                <kbd className="px-1.5 py-0.2 rounded bg-slate-850 text-[9px] text-slate-300 font-mono border border-slate-700">
                  Ctrl+K
                </kbd>
              </button>
            )}

            {/* Quick Task Header Button */}
            {onOpenQuickTask && (
              <button
                type="button"
                onClick={onOpenQuickTask}
                className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                title="Schedule Quick Task with Natural Language"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick Task</span>
              </button>
            )}

            {/* Back to Visualizer Quick Button when in any other workspace */}
            {currentTab !== 'visualizer' && (
              <button
                type="button"
                onClick={() => onSelectTab('visualizer')}
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/25 transition cursor-pointer shadow-sm shadow-cyan-500/20 animate-in fade-in"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Hologram</span>
              </button>
            )}
          </div>

          {/* Center: PRIMARY VOICE AGENT INTERACTION CONTROLLER */}
          <div className="flex items-center">
            <AgentVoiceHub compact onNavigateToTab={onSelectTab} />
          </div>

          {/* Right Controls: Workspace Dropdown / Telemetry & Pending Approvals */}
          <div className="flex items-center space-x-2">
            {/* Quick Workspace Switcher */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
              <span className="text-slate-500 text-[9px] font-bold uppercase">View:</span>
              <select
                value={currentTab}
                onChange={(e) => onSelectTab(e.target.value as ActiveTab)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[130px] truncate text-xs"
              >
                <option value="visualizer" className="bg-slate-900 text-cyan-300">🌟 Hologram Visualizer</option>
                <option value="command-center" className="bg-slate-900 text-white">📊 Projects &amp; Metrics</option>
                <option value="task-engine" className="bg-slate-900 text-white">⚡ Task Engine</option>
                <option value="orchestrator" className="bg-slate-900 text-white">🤖 Specialist Agents</option>
                <option value="world-model" className="bg-slate-900 text-white">🧠 World Model</option>
                <option value="self-improvement" className="bg-slate-900 text-white">🛡️ Sandbox Gate</option>
                <option value="tool-registry" className="bg-slate-900 text-white">🔧 Tool Registry</option>
                <option value="knowledge-graph" className="bg-slate-900 text-white">🕸️ Knowledge Graph</option>
                <option value="dev-strategy" className="bg-slate-900 text-white">🗺️ Dev Strategy</option>
              </select>
            </div>

            {/* Pending Approvals Gated Alert */}
            {pendingApprovalsCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectTab('self-improvement')}
                title="View Pending Signatures & Approvals"
                className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{pendingApprovalsCount} Gated</span>
              </button>
            )}

            {/* Trigger Autonomous Loop button */}
            <button
              type="button"
              onClick={() => runAutonomousLoop('Execute full-cycle autonomous review and sync')}
              disabled={isThinking}
              title="Run Abimbola autonomous reasoning loop"
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-200" />
              <span className="hidden md:inline">{isThinking ? 'Looping...' : 'Auto-Loop'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800 space-y-2 animate-in fade-in duration-150 max-h-[80vh] overflow-y-auto no-scrollbar">
            {/* Quick Actions in Mobile Menu */}
            <div className="grid grid-cols-2 gap-1.5 text-xs pb-1">
              {onOpenQuickTask && (
                <button
                  onClick={() => {
                    onOpenQuickTask();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-xl bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Quick Task</span>
                </button>
              )}
              {onOpenCommandPalette && (
                <button
                  onClick={() => {
                    onOpenCommandPalette();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center space-x-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Command Palette</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => {
                  onSelectTab('visualizer');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-bold ${
                  currentTab === 'visualizer'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
                }`}
              >
                🌟 Holographic Visualizer
              </button>
              <button
                onClick={() => {
                  onSelectTab('command-center');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-semibold ${
                  currentTab === 'command-center' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-950'
                }`}
              >
                📊 Projects &amp; Metrics
              </button>
              <button
                onClick={() => {
                  onSelectTab('task-engine');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-semibold ${
                  currentTab === 'task-engine' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-950'
                }`}
              >
                ⚡ Task Engine
              </button>
              <button
                onClick={() => {
                  onSelectTab('orchestrator');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-semibold ${
                  currentTab === 'orchestrator' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-950'
                }`}
              >
                🤖 Specialist Agents
              </button>
              <button
                onClick={() => {
                  onSelectTab('world-model');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-semibold ${
                  currentTab === 'world-model' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-950'
                }`}
              >
                🧠 World Model
              </button>
              <button
                onClick={() => {
                  onSelectTab('self-improvement');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-semibold ${
                  currentTab === 'self-improvement' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-950'
                }`}
              >
                🛡️ Sandbox Gate
              </button>
              <button
                onClick={() => {
                  onSelectTab('tool-registry');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-semibold ${
                  currentTab === 'tool-registry' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-950'
                }`}
              >
                🔧 Tools &amp; Policies
              </button>
              <button
                onClick={() => {
                  onSelectTab('knowledge-graph');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-semibold ${
                  currentTab === 'knowledge-graph' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-950'
                }`}
              >
                🕸️ Knowledge Graph
              </button>
              <button
                onClick={() => {
                  onSelectTab('dev-strategy');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left font-semibold ${
                  currentTab === 'dev-strategy' ? 'bg-indigo-600 text-white' : 'text-slate-300 bg-slate-950'
                }`}
              >
                🗺️ Dev Strategy
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Backward-compatible default export
export const Navigation: React.FC<NavigationProps> = (props) => {
  return <TopNavigation {...props} />;
};
