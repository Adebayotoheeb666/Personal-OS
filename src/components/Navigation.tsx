import React from 'react';
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
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { OperatingMode, SpecialistAgentType } from '../types/agent';

export type ActiveTab =
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
}

const OPERATING_MODES: { mode: OperatingMode; label: string; icon: string; desc: string }[] = [
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

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const {
    worldModel,
    specialistAgents,
    activeAgent,
    activeMode,
    activeProjectId,
    setActiveAgent,
    setActiveMode,
    setActiveProjectId,
    proposals,
    auditLogs,
  } = useAgent();

  const pendingApprovalsCount =
    proposals.filter((p) => p.approvalStatus === 'Proposed').length +
    worldModel.projects
      .flatMap((p) => p.tasks)
      .filter((t) => t.currentState === 'awaiting_approval').length;

  const currentSpecialist = specialistAgents.find((a) => a.id === activeAgent);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none shadow-md">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">AetherOS</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Personal OS
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gated Autonomy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operating System for <span className="text-slate-200 font-medium">{worldModel.identity.name}</span>
              </p>
            </div>
          </div>

          {/* Quick Context Switchers: Active Project & Active Specialist */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Active Project Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-medium">Project:</span>
              <select
                value={activeProjectId || ''}
                onChange={(e) => setActiveProjectId(e.target.value || null)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-400">All Projects Overview</option>
                {worldModel.projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.progress}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Active Specialist Agent Selector */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-500 font-medium">Agent:</span>
              <select
                value={activeAgent || ''}
                onChange={(e) => setActiveAgent((e.target.value as SpecialistAgentType) || null)}
                className="bg-transparent text-purple-300 font-semibold focus:outline-none cursor-pointer"
              >
                {specialistAgents.map((agent) => (
                  <option key={agent.id} value={agent.id} className="bg-slate-900 text-purple-200">
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Operating Mode Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-500 font-medium">Mode:</span>
              <select
                value={activeMode}
                onChange={(e) => setActiveMode(e.target.value as OperatingMode)}
                className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer capitalize"
              >
                {OPERATING_MODES.map((m) => (
                  <option key={m.mode} value={m.mode} className="bg-slate-900 text-amber-200">
                    {m.icon} {m.label} Mode
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pending Approval Badge & Audit Counter */}
          <div className="flex items-center space-x-3">
            {pendingApprovalsCount > 0 && (
              <button
                onClick={() => onSelectTab('command-center')}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-all cursor-pointer animate-pulse"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingApprovalsCount} Approvals Gated</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('tool-registry')}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
              title="Audit Logs"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>{auditLogs.length} Audits</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          <TabButton
            active={currentTab === 'command-center'}
            onClick={() => onSelectTab('command-center')}
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Command Center"
            badge={pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined}
          />
          <TabButton
            active={currentTab === 'orchestrator'}
            onClick={() => onSelectTab('orchestrator')}
            icon={<Bot className="w-4 h-4" />}
            label="Specialist Agents & Chat"
          />
          <TabButton
            active={currentTab === 'world-model'}
            onClick={() => onSelectTab('world-model')}
            icon={<BrainCircuit className="w-4 h-4" />}
            label="Personal World Model"
            badge={worldModel.projects.length}
          />
          <TabButton
            active={currentTab === 'task-engine'}
            onClick={() => onSelectTab('task-engine')}
            icon={<CheckSquare className="w-4 h-4" />}
            label="Task Engine"
          />
          <TabButton
            active={currentTab === 'self-improvement'}
            onClick={() => onSelectTab('self-improvement')}
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Self-Improvement Sandbox"
            badge={proposals.length}
          />
          <TabButton
            active={currentTab === 'tool-registry'}
            onClick={() => onSelectTab('tool-registry')}
            icon={<Wrench className="w-4 h-4" />}
            label="Tool Registry & Policies"
          />
          <TabButton
            active={currentTab === 'knowledge-graph'}
            onClick={() => onSelectTab('knowledge-graph')}
            icon={<Network className="w-4 h-4" />}
            label="Knowledge Graph"
          />
          <TabButton
            active={currentTab === 'dev-strategy'}
            onClick={() => onSelectTab('dev-strategy')}
            icon={<Milestone className="w-4 h-4 text-emerald-400" />}
            label="Dev Strategy (Phases 1-7)"
          />
        </div>
      </div>
    </header>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
      active
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge !== undefined && (
      <span
        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
          active ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-300'
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);
