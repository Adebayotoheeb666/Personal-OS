import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Filter,
  User,
  Zap,
  Palette,
  ArrowUpDown,
  Tag,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { ProjectTask } from '../types/agent';

// Palette options for custom task color-coding
const COLOR_OPTIONS: { id: string; name: string; bgClass: string; borderClass: string; dotClass: string }[] = [
  { id: 'red', name: 'Ruby Critical', bgClass: 'bg-red-500/20', borderClass: 'border-red-500/50', dotClass: 'bg-red-400' },
  { id: 'orange', name: 'Vivid High', bgClass: 'bg-orange-500/20', borderClass: 'border-orange-500/50', dotClass: 'bg-orange-400' },
  { id: 'amber', name: 'Amber Gated', bgClass: 'bg-amber-500/20', borderClass: 'border-amber-500/50', dotClass: 'bg-amber-400' },
  { id: 'emerald', name: 'Emerald Safe', bgClass: 'bg-emerald-500/20', borderClass: 'border-emerald-500/50', dotClass: 'bg-emerald-400' },
  { id: 'cyan', name: 'Cyan Core', bgClass: 'bg-cyan-500/20', borderClass: 'border-cyan-500/50', dotClass: 'bg-cyan-400' },
  { id: 'indigo', name: 'Royal Indigo', bgClass: 'bg-indigo-500/20', borderClass: 'border-indigo-500/50', dotClass: 'bg-indigo-400' },
  { id: 'purple', name: 'Purple AI', bgClass: 'bg-purple-500/20', borderClass: 'border-purple-500/50', dotClass: 'bg-purple-400' },
  { id: 'pink', name: 'Rose Polish', bgClass: 'bg-pink-500/20', borderClass: 'border-pink-500/50', dotClass: 'bg-pink-400' },
];

export const TaskEngineView: React.FC<{
  onNavigateToTab?: (tab: any) => void;
}> = ({ onNavigateToTab }) => {
  const {
    worldModel,
    updateTaskState,
    updateTaskPriority,
    updateTaskColorCode,
    updateTaskUrgency,
    createTask,
  } = useAgent();

  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'urgency' | 'deadline' | 'effort' | 'state'>('priority');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [activeColorPickerTaskId, setActiveColorPickerTaskId] = useState<string | null>(null);

  // Form State
  const [objective, setObjective] = useState('');
  const [projectId, setProjectId] = useState(worldModel.projects[0]?.id || '');
  const [priority, setPriority] = useState<ProjectTask['priority']>('medium');
  const [deadline, setDeadline] = useState('2026-10-15');
  const [estimatedEffort, setEstimatedEffort] = useState('3 hours');
  const [nextAction, setNextAction] = useState('');
  const [requiredResources, setRequiredResources] = useState('TypeScript runtime, test fixtures');
  const [owner, setOwner] = useState('Coding Agent');
  const [approvalRequirement, setApprovalRequirement] = useState(false);
  const [completionEvidence, setCompletionEvidence] = useState('');

  const allTasks = useMemo(() => {
    return worldModel.projects.flatMap((p) => p.tasks);
  }, [worldModel.projects]);

  // Priority Breakdown Counts
  const priorityCounts = useMemo(() => {
    return {
      all: allTasks.length,
      critical: allTasks.filter((t) => t.priority === 'critical').length,
      high: allTasks.filter((t) => t.priority === 'high').length,
      medium: allTasks.filter((t) => t.priority === 'medium').length,
      low: allTasks.filter((t) => t.priority === 'low').length,
    };
  }, [allTasks]);

  // Priority scoring for sorting
  const priorityWeight: Record<ProjectTask['priority'], number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const urgencyWeight: Record<string, number> = {
    High: 3,
    Medium: 2,
    Low: 1,
  };

  // Filtered and Sorted Tasks
  const displayedTasks = useMemo(() => {
    const filtered = allTasks.filter((task) => {
      if (filterProject !== 'all' && task.projectId !== filterProject) return false;
      if (filterState !== 'all' && task.currentState !== filterState) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        // Completed at bottom
        if (a.currentState === 'completed' && b.currentState !== 'completed') return 1;
        if (a.currentState !== 'completed' && b.currentState === 'completed') return -1;
        return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      }
      if (sortBy === 'urgency') {
        if (a.currentState === 'completed' && b.currentState !== 'completed') return 1;
        if (a.currentState !== 'completed' && b.currentState === 'completed') return -1;
        const uA = urgencyWeight[a.urgency || 'Medium'] || 2;
        const uB = urgencyWeight[b.urgency || 'Medium'] || 2;
        return uB - uA;
      }
      if (sortBy === 'deadline') {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      }
      if (sortBy === 'state') {
        const stateOrder: Record<string, number> = {
          awaiting_approval: 1,
          in_progress: 2,
          blocked: 3,
          backlog: 4,
          completed: 5,
        };
        return (stateOrder[a.currentState] || 9) - (stateOrder[b.currentState] || 9);
      }
      return 0;
    });
  }, [allTasks, filterProject, filterState, filterPriority, sortBy]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim() || !projectId) return;

    createTask({
      objective,
      projectId,
      priority,
      urgency: priority === 'critical' || priority === 'high' ? 'High' : 'Medium',
      deadline,
      dependencies: [],
      estimatedEffort,
      currentState: 'in_progress',
      nextAction: nextAction || 'Initiate implementation in sandbox',
      requiredResources: requiredResources.split(',').map((s) => s.trim()),
      owner,
      approvalRequirement,
      completionEvidence: completionEvidence || 'Passing unit test assertions',
    });

    setObjective('');
    setNextAction('');
    setShowCreateModal(false);
  };

  // Helper for dynamic card styling based on task priority and custom colorCode
  const getTaskCardStyle = (task: ProjectTask) => {
    const isCompleted = task.currentState === 'completed';
    const isAwaitingApproval = task.currentState === 'awaiting_approval';

    if (isCompleted) {
      return 'bg-slate-900/60 border-slate-800/60 opacity-80';
    }

    if (isAwaitingApproval) {
      return 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/40 shadow-md shadow-amber-950/30';
    }

    // Custom color code overrides
    if (task.colorCode) {
      switch (task.colorCode) {
        case 'red':
          return 'bg-red-950/20 border-red-500/50 ring-1 ring-red-500/30 shadow-md shadow-red-950/30';
        case 'orange':
          return 'bg-orange-950/20 border-orange-500/50 ring-1 ring-orange-500/30 shadow-md shadow-orange-950/30';
        case 'amber':
          return 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30 shadow-md shadow-amber-950/30';
        case 'emerald':
          return 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/30';
        case 'cyan':
          return 'bg-cyan-950/20 border-cyan-500/50 ring-1 ring-cyan-500/30 shadow-md shadow-cyan-950/30';
        case 'purple':
          return 'bg-purple-950/20 border-purple-500/50 ring-1 ring-purple-500/30 shadow-md shadow-purple-950/30';
        case 'pink':
          return 'bg-pink-950/20 border-pink-500/50 ring-1 ring-pink-500/30 shadow-md shadow-pink-950/30';
        case 'indigo':
        default:
          return 'bg-indigo-950/20 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-md shadow-indigo-950/30';
      }
    }

    // Default priority based coloring
    switch (task.priority) {
      case 'critical':
        return 'bg-red-950/25 border-red-500/60 ring-1 ring-red-500/40 shadow-lg shadow-red-950/40';
      case 'high':
        return 'bg-orange-950/20 border-amber-500/50 ring-1 ring-amber-500/30 shadow-md shadow-amber-950/30';
      case 'medium':
        return 'bg-slate-900 border-indigo-500/30 hover:border-indigo-500/60';
      case 'low':
      default:
        return 'bg-slate-900 border-slate-800 hover:border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls with Direct Urgency Sort Link */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span>Task Engine &bull; 4-Tier Priority &amp; Color-Coding System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Systematic Task Reasoning &amp; Urgency Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Color-code reasoning tasks (Critical, High, Medium, Low), gate approval actions, and dynamically sort the project dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direct Link to Project Dashboard Sorted by Urgency */}
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('command-center')}
              title="Navigate to Command Center with Active Projects sorted by Urgency"
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-red-600 via-amber-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-red-600/20"
            >
              <Zap className="w-3.5 h-3.5 text-amber-200" />
              <span>Sort Project Dashboard by Urgency &rarr;</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Structured Task</span>
          </button>
        </div>
      </div>

      {/* Priority System Interactive Legend & Quick Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <Tag className="w-4 h-4 text-indigo-400" />
            <span>Task Priority Color-Code System:</span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-400">Sort Tasks By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="priority">Priority (Critical &rarr; Low)</option>
              <option value="urgency">Urgency (High &rarr; Low)</option>
              <option value="deadline">Upcoming Deadline</option>
              <option value="state">Execution State</option>
            </select>
          </div>
        </div>

        {/* Priority Tabs with Color Coding and Task Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
          {/* All */}
          <button
            type="button"
            onClick={() => setFilterPriority('all')}
            className={`p-2.5 rounded-lg border flex items-center justify-between transition cursor-pointer ${
              filterPriority === 'all'
                ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/40'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span className="font-medium">All Tasks</span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
              {priorityCounts.all}
            </span>
          </button>

          {/* Critical (Red) */}
          <button
            type="button"
            onClick={() => setFilterPriority('critical')}
            className={`p-2.5 rounded-lg border flex items-center justify-between transition cursor-pointer ${
              filterPriority === 'critical'
                ? 'bg-red-500/25 border-red-500 text-red-200 font-bold ring-1 ring-red-500/50 shadow-sm shadow-red-500/30'
                : 'bg-slate-950 border-red-900/40 text-red-400 hover:border-red-500/50'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Critical</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-red-500/20 text-red-300 font-bold">
              {priorityCounts.critical}
            </span>
          </button>

          {/* High (Orange) */}
          <button
            type="button"
            onClick={() => setFilterPriority('high')}
            className={`p-2.5 rounded-lg border flex items-center justify-between transition cursor-pointer ${
              filterPriority === 'high'
                ? 'bg-orange-500/25 border-orange-500 text-orange-200 font-bold ring-1 ring-orange-500/50 shadow-sm shadow-orange-500/30'
                : 'bg-slate-950 border-orange-900/40 text-orange-400 hover:border-orange-500/50'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
              <span className="font-semibold uppercase tracking-wider text-[11px]">High</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-orange-500/20 text-orange-300 font-bold">
              {priorityCounts.high}
            </span>
          </button>

          {/* Medium (Indigo) */}
          <button
            type="button"
            onClick={() => setFilterPriority('medium')}
            className={`p-2.5 rounded-lg border flex items-center justify-between transition cursor-pointer ${
              filterPriority === 'medium'
                ? 'bg-indigo-500/25 border-indigo-500 text-indigo-200 font-bold ring-1 ring-indigo-500/50 shadow-sm shadow-indigo-500/30'
                : 'bg-slate-950 border-indigo-900/40 text-indigo-400 hover:border-indigo-500/50'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Medium</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-indigo-500/20 text-indigo-300 font-bold">
              {priorityCounts.medium}
            </span>
          </button>

          {/* Low (Emerald) */}
          <button
            type="button"
            onClick={() => setFilterPriority('low')}
            className={`p-2.5 rounded-lg border flex items-center justify-between transition cursor-pointer ${
              filterPriority === 'low'
                ? 'bg-emerald-500/25 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500/50 shadow-sm shadow-emerald-500/30'
                : 'bg-slate-950 border-emerald-900/40 text-emerald-400 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Low</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
              {priorityCounts.low}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Projects & Execution State) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-400">Scope:</span>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Projects</option>
            {worldModel.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="in_progress">In Progress</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
            <option value="backlog">Backlog</option>
          </select>
        </div>

        <div className="text-slate-400 font-medium">
          Showing <span className="text-white font-bold">{displayedTasks.length}</span> reasoning tasks
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedTasks.map((task) => {
          const project = worldModel.projects.find((p) => p.id === task.projectId);
          const isCompleted = task.currentState === 'completed';

          return (
            <div
              key={task.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition ${getTaskCardStyle(
                task
              )}`}
            >
              <div>
                {/* Header row: Project tag, Priority Selector, Color Picker, and State */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {project?.name || 'General'}
                    </span>

                    {/* Interactive Priority Selector (Low, Medium, High, Critical) */}
                    <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold uppercase">
                      {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => updateTaskPriority(task.id, p)}
                          title={`Switch priority to ${p}`}
                          className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                            task.priority === p
                              ? p === 'critical'
                                ? 'bg-red-500 text-white shadow-xs'
                                : p === 'high'
                                ? 'bg-orange-500 text-white shadow-xs'
                                : p === 'medium'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {p.slice(0, 4)}
                        </button>
                      ))}
                    </div>

                    {/* Color Code Palette Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveColorPickerTaskId(
                            activeColorPickerTaskId === task.id ? null : task.id
                          )
                        }
                        title="Color-code this task"
                        className="p-1 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px]"
                      >
                        <Palette className="w-3 h-3 text-indigo-400" />
                        {task.colorCode && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              COLOR_OPTIONS.find((c) => c.id === task.colorCode)?.dotClass ||
                              'bg-indigo-400'
                            }`}
                          ></span>
                        )}
                      </button>

                      {/* Dropdown Color Palette */}
                      {activeColorPickerTaskId === task.id && (
                        <div className="absolute left-0 mt-1 z-30 p-2 rounded-xl bg-slate-950 border border-slate-700 shadow-xl flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-150">
                          {COLOR_OPTIONS.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                updateTaskColorCode(task.id, c.id);
                                setActiveColorPickerTaskId(null);
                              }}
                              title={c.name}
                              className={`w-5 h-5 rounded-full ${c.dotClass} hover:scale-110 transition cursor-pointer flex items-center justify-center`}
                            >
                              {task.colorCode === c.id && <Check className="w-3 h-3 text-white" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task State & Urgency Badge */}
                  <div className="flex items-center space-x-1.5 self-start sm:self-center">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                        task.urgency === 'High'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : task.urgency === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Urgency: {task.urgency || 'Medium'}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        task.currentState === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : task.currentState === 'awaiting_approval'
                          ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                          : task.currentState === 'blocked'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {task.currentState.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Objective */}
                <h3
                  className={`font-bold text-sm sm:text-base transition ${
                    isCompleted ? 'line-through text-slate-500' : 'text-white'
                  }`}
                >
                  {task.objective}
                </h3>

                {/* Reasoned Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Owner</span>
                    <p className="text-slate-300 font-medium">{task.owner}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Deadline / Effort</span>
                    <p className="text-slate-300 font-medium">
                      {task.deadline} ({task.estimatedEffort})
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-xs">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Next Action</span>
                  <p className="text-indigo-300 font-medium">{task.nextAction}</p>
                </div>

                {task.requiredResources.length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Required Resources</span>
                    <p className="text-slate-400">{task.requiredResources.join(' • ')}</p>
                  </div>
                )}

                {task.completionEvidence && (
                  <div className="mt-2 p-2 rounded bg-slate-950 border border-slate-800/80 text-xs flex items-center space-x-1.5 text-emerald-300">
                    <FileCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">Evidence: {task.completionEvidence}</span>
                  </div>
                )}
              </div>

              {/* State Transition Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {task.approvalRequirement && (
                    <span className="text-[10px] font-bold text-amber-400 flex items-center space-x-1 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Approval Gated</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {task.currentState !== 'completed' && (
                    <button
                      onClick={() => updateTaskState(task.id, 'completed')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}
                  {task.currentState === 'completed' && (
                    <button
                      onClick={() => updateTaskState(task.id, 'in_progress')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Reopen
                    </button>
                  )}
                  {task.currentState !== 'blocked' && task.currentState !== 'completed' && (
                    <button
                      onClick={() => updateTaskState(task.id, 'blocked')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs transition cursor-pointer"
                    >
                      Block
                    </button>
                  )}
                  {task.currentState === 'blocked' && (
                    <button
                      onClick={() => updateTaskState(task.id, 'in_progress')}
                      className="px-2 py-1 rounded bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      Unblock
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span>Create Systematic Task (12-Attribute Model)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Objective</label>
              <input
                type="text"
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Implement rate limit exponential backoff in Sales proxy"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  {worldModel.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option value="low">Low (Green)</option>
                  <option value="medium">Medium (Indigo)</option>
                  <option value="high">High (Orange)</option>
                  <option value="critical">Critical (Red)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Effort</label>
                <input
                  type="text"
                  value={estimatedEffort}
                  onChange={(e) => setEstimatedEffort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Owner</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Coding Agent, Sales Agent, User"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Approval Required?</label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="appr"
                    checked={approvalRequirement}
                    onChange={(e) => setApprovalRequirement(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="appr" className="text-xs text-slate-300 cursor-pointer">
                    Gate behind human sign-off
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Immediate Next Action</label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="What is the exact next step?"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Completion Evidence</label>
              <input
                type="text"
                value={completionEvidence}
                onChange={(e) => setCompletionEvidence(e.target.value)}
                placeholder="e.g. Test report output, staging URL, PR review"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
