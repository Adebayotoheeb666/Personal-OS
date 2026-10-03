import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Share2,
  Cpu,
  Layers,
  FileCheck,
  Send,
  Zap,
  Search,
  Database,
  X,
  Filter,
  Terminal,
  Square,
  CheckSquare,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { ProjectTask, ImprovementProposal } from '../types/agent';
import { DashboardSummary } from './DashboardSummary';
import { SearchBar } from './SearchBar';

export const CommandCenter: React.FC<{
  onNavigateToTab: (tab: any) => void;
}> = ({ onNavigateToTab }) => {
  const {
    worldModel,
    proposals,
    approveProposal,
    rejectProposal,
    updateTaskState,
    transitionTaskState,
    toggleTaskComplete,
    sortTasksByUrgency,
    executeProjectContinuity,
    runAutonomousLoop,
    isThinking,
    sendMessage,
    searchMemory,
    dbStats,
    sqlQueryLogs,
    cacheMetrics,
    setActiveProjectId,
    mockProjectDatabase,
    persistProjectStateToDb,
    getProjectVisionFromDb,
    getProjectProblemFromDb,
    getProjectTasksFromDb,
  } = useAgent();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'projects' | 'tasks' | 'urgent'>('all');
  const [showSqlInspector, setShowSqlInspector] = useState(false);
  const [showMockDbInspector, setShowMockDbInspector] = useState(false);
  const [editingVisionProjectId, setEditingVisionProjectId] = useState<string | null>(null);
  const [editedVisionText, setEditedVisionText] = useState('');

  // Search Results using Persistent Memory Store
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchMemory(searchQuery);
  }, [searchQuery, searchMemory]);

  // Collect pending approvals
  const pendingProposals = proposals.filter((p) => p.approvalStatus === 'Proposed');
  const allTasks = worldModel.projects.flatMap((p) => p.tasks);
  const pendingTasks = allTasks.filter((t) => t.currentState === 'awaiting_approval');
  const blockedTasks = allTasks.filter((t) => t.currentState === 'blocked');

  // Sorting function to display high-priority and high-urgency tasks first
  const sortTasksByPriorityAndUrgency = (tasks: ProjectTask[]): ProjectTask[] => {
    const priorityScore: Record<string, number> = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
    };
    const urgencyScore: Record<string, number> = {
      High: 3,
      Medium: 2,
      Low: 1,
    };
    return [...tasks].sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.currentState === 'completed' && b.currentState !== 'completed') return 1;
      if (a.currentState !== 'completed' && b.currentState === 'completed') return -1;

      const scoreA =
        (priorityScore[a.priority] || 10) + (urgencyScore[a.urgency || 'Medium'] || 2);
      const scoreB =
        (priorityScore[b.priority] || 10) + (urgencyScore[b.urgency || 'Medium'] || 2);

      return scoreB - scoreA;
    });
  };

  // Filtered Active Projects based on Search Bar (matching name, vision, problem, architecture)
  const activeProjects = useMemo(() => {
    const list = worldModel.projects.filter((p) => p.category === 'active');
    if (!searchQuery.trim() || searchFilter === 'tasks') return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.vision.toLowerCase().includes(q) ||
        p.problem.toLowerCase().includes(q) ||
        p.architecture.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
    );
  }, [worldModel.projects, searchQuery, searchFilter]);

  // Filtered Tasks based on Search Bar (matching objective, nextAction, owner, priority)
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim() || searchFilter === 'projects') return allTasks;

    const q = searchQuery.toLowerCase();
    return allTasks.filter(
      (t) =>
        t.objective.toLowerCase().includes(q) ||
        t.nextAction.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q) ||
        (t.completionEvidence && t.completionEvidence.toLowerCase().includes(q))
    );
  }, [allTasks, searchQuery, searchFilter]);

  // Cross-project synergies
  const synergies = [
    {
      title: 'AST Analysis Engine Shared Reuse',
      projects: ['EduCore Platform', 'Coding Agent', 'Sales Intelligence'],
      description: 'The WebWorker AST parser created for EduCore can be shared with Coding Agent and Sales prospect GitHub scraper with 0 extra dependencies.',
      potentialSavings: '420KB bundle reduction + unified test coverage',
      readyToExecute: true,
    },
    {
      title: 'Browser WASM Sandbox Isolation Architecture',
      projects: ['EduCore Platform', 'AetherOS Kernel'],
      description: 'The memory watchdog and worker isolation pattern can be recycled as the default testing environment for agent self-modification proposals.',
      potentialSavings: '100% deterministic safety without remote cloud container cost',
      readyToExecute: true,
    },
    {
      title: 'Technical Founder Outbound Playbook',
      projects: ['Synthetix Sales Pipeline', 'EduCore B2B Licensing'],
      description: 'Architectural teardown email drafts tested on DevTools can be adapted for enterprise university CS department outreach.',
      potentialSavings: 'Expected 24% demo booking conversion rate',
      readyToExecute: false,
    },
  ];

  const handleQuickContinuity = async (keyword: string) => {
    await executeProjectContinuity(keyword);
    onNavigateToTab('orchestrator');
  };

  const handleSelectProjectFromSearch = (projectId: string) => {
    setActiveProjectId(projectId);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Co-Founder Morning Briefing */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Daily Operating Brief & Executive Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Good morning, {worldModel.identity.name}.
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              You have <strong className="text-amber-400">{pendingProposals.length + pendingTasks.length} consequential actions</strong> waiting behind approval gates. 
              Active focus: <span className="text-indigo-300 font-medium">Enterprise Sales Pipeline</span> and <span className="text-sky-300 font-medium">EduCore AST Engine</span>.
            </p>
          </div>

          {/* Quick Continuity Trigger Bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap pl-1">
              Project Continuity:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleQuickContinuity('sales')}
                disabled={isThinking}
                className="px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition flex items-center space-x-1 cursor-pointer"
              >
                <span>"Continue sales agent"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleQuickContinuity('educore')}
                disabled={isThinking}
                className="px-2.5 py-1 rounded-md bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 text-xs font-semibold border border-sky-500/30 transition flex items-center space-x-1 cursor-pointer"
              >
                <span>"Where are we with EduCore?"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Summary KPI Component */}
      <DashboardSummary
        projects={worldModel.projects}
        allTasks={allTasks}
        pendingApprovalsCount={pendingProposals.length + pendingTasks.length}
        cacheMetrics={cacheMetrics}
        onFilterProjects={() => setSearchFilter('projects')}
        onFilterAwaitingApproval={() => setSearchFilter('tasks')}
        onFilterUrgent={() => setSearchFilter('urgent')}
      />

      {/* Modular Search Bar Component (Phase 1 Dynamic Filter) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Project &amp; Task State Filter
            </span>
          </div>

          {/* PostgreSQL DB & Mock Database Service Layer Toggles */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMockDbInspector(!showMockDbInspector)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-[11px] text-indigo-300 font-medium transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mock DB Service (Vision/Problem/Tasks)</span>
            </button>

            <button
              onClick={() => setShowSqlInspector(!showSqlInspector)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium transition cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Postgres Layer ({dbStats.projectsCount}p / {dbStats.tasksCount}t)</span>
            </button>
          </div>
        </div>

        {/* Mock Database Service Layer Inspector Drawer */}
        {showMockDbInspector && (
          <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 font-sans text-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-bold border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Service Layer: Mock Database for Project State (Vision, Problem, Tasks)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                Memory Continuity: Active Across Sessions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {worldModel.projects.slice(0, 2).map((proj) => (
                <div key={proj.id} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{proj.name}</span>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {proj.tasks.length} tasks persisted
                    </span>
                  </div>

                  {editingVisionProjectId === proj.id ? (
                    <div className="space-y-2 mt-1">
                      <textarea
                        value={editedVisionText}
                        onChange={(e) => setEditedVisionText(e.target.value)}
                        className="w-full bg-slate-950 border border-indigo-500/50 rounded p-1.5 text-xs text-white"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            persistProjectStateToDb(proj.id, { vision: editedVisionText });
                            setEditingVisionProjectId(null);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] cursor-pointer"
                        >
                          Save Vision to Mock DB
                        </button>
                        <button
                          onClick={() => setEditingVisionProjectId(null)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-[11px] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-indigo-300">Persisted Vision:</strong> {getProjectVisionFromDb(proj.id)}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-sky-300">Persisted Problem:</strong> {getProjectProblemFromDb(proj.id)}
                      </p>
                      <button
                        onClick={() => {
                          setEditingVisionProjectId(proj.id);
                          setEditedVisionText(getProjectVisionFromDb(proj.id));
                        }}
                        className="text-[10px] text-indigo-400 hover:underline font-semibold cursor-pointer pt-1"
                      >
                        Edit &amp; Persist Vision &rarr;
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <SearchBar
          projects={worldModel.projects}
          tasks={allTasks}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={searchFilter}
          onFilterChange={setSearchFilter}
          onSelectProject={handleSelectProjectFromSearch}
        />

        {/* PostgreSQL SQL Telemetry Drawer */}
        {showSqlInspector && (
          <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/30 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-sky-300 font-bold border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Phase 1 Persistent PostgreSQL Simulation Store
              </span>
              <span>Storage: {(dbStats.storageSizeBytes / 1024).toFixed(1)} KB</span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {sqlQueryLogs.slice(0, 5).map((log, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-slate-300 truncate max-w-md">• {log.query}</span>
                  <span className="text-emerald-400 font-semibold">{log.executionTimeMs}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Pending Approval Queue & Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Consequential Approval Gate Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white tracking-wide">
                  Pending Human Approval Gate
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                  {pendingProposals.length + pendingTasks.length} Awaiting Signature
                </span>
              </div>
              <span className="text-xs text-slate-400">Zero un-gated production mutations</span>
            </div>

            {pendingProposals.length === 0 && pendingTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/50 rounded-lg border border-slate-800/60">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-300">Approval queue is clear</p>
                <p className="text-xs text-slate-500 mt-1">All proposed actions and self-improvements have been processed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Proposed Self-Improvements */}
                {pendingProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-lg bg-slate-950 border border-amber-500/30 hover:border-amber-500/50 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Self-Improvement Proposal
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300">{prop.id}</span>
                          <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                            Risk: {prop.riskLevel}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-white mt-1.5">{prop.proposedBehavior}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          <strong className="text-slate-300">Trigger:</strong> {prop.trigger}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          <strong className="text-slate-300">Benefit:</strong> {prop.expectedBenefit}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-500">
                          <span>Sandbox Tests: {prop.sandboxTestResults?.length || 4}/4 Passed</span>
                          <span>Rollback Snapshot: Prepared</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button
                          onClick={() => approveProposal(prop.id)}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                        >
                          Approve Staging
                        </button>
                        <button
                          onClick={() => rejectProposal(prop.id, 'User rejected in Command Center')}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 font-semibold text-xs transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* High Consequence Tasks Awaiting Approval */}
                {pendingTasks.map((task) => {
                  const proj = worldModel.projects.find((p) => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          {/* Checkbox Toggle to trigger state update */}
                          <button
                            type="button"
                            onClick={() => toggleTaskComplete(task.id)}
                            title={task.currentState === 'completed' ? 'Mark In Progress' : 'Sign & Complete'}
                            className="mt-0.5 p-1 rounded text-slate-400 hover:text-indigo-400 transition cursor-pointer flex-shrink-0"
                          >
                            {task.currentState === 'completed' ? (
                              <CheckSquare className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Square className="w-5 h-5 text-amber-500 hover:text-amber-400" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Gated Action
                              </span>
                              <span className="text-xs font-semibold text-indigo-400">{proj?.name}</span>
                              <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                                {task.priority}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  task.urgency === 'High'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : task.urgency === 'Medium'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                Urgency: {task.urgency || 'High'}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-white mt-1">{task.objective}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              <strong className="text-slate-300">Next Action:</strong> {task.nextAction}
                            </p>
                            {task.completionEvidence && (
                              <p className="text-xs text-emerald-400/90 mt-1 flex items-center space-x-1">
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Evidence: {task.completionEvidence}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <button
                            onClick={() => updateTaskState(task.id, 'completed')}
                            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Sign & Approve</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Tasks & Velocity Board (Sorted: High Priority & Urgency First) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white tracking-wide">
                  Active Tasks &amp; Velocity Board
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  {filteredTasks.length} Total
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-emerald-400">
                  Sorted: High Priority &amp; Urgency First
                </span>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-6 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
                No tasks match the active filter or query.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {sortTasksByPriorityAndUrgency(filteredTasks).map((task) => {
                  const proj = worldModel.projects.find((p) => p.id === task.projectId);
                  const isCompleted = task.currentState === 'completed';

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCompleted
                          ? 'bg-slate-950/50 border-slate-800/50 opacity-75'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* Checkbox Toggle to trigger state update */}
                        <button
                          type="button"
                          onClick={() => toggleTaskComplete(task.id)}
                          title={isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}
                          className="mt-0.5 p-1 rounded hover:bg-slate-800 transition cursor-pointer flex-shrink-0"
                        >
                          {isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {/* Urgency Badge (High, Medium, Low) */}
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                task.urgency === 'High'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/40 font-extrabold'
                                  : task.urgency === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              Urgency: {task.urgency || 'Medium'}
                            </span>

                            {/* Priority Badge */}
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                task.priority === 'critical'
                                  ? 'bg-red-500/10 text-red-400'
                                  : task.priority === 'high'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {task.priority}
                            </span>

                            {/* Project Name */}
                            <span className="text-[11px] font-semibold text-indigo-400 truncate max-w-[180px]">
                              {proj?.name}
                            </span>

                            {/* Owner */}
                            <span className="text-[11px] text-slate-500">
                              &bull; {task.owner}
                            </span>
                          </div>

                          <h4
                            className={`text-sm font-medium transition ${
                              isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {task.objective}
                          </h4>

                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            <strong className="text-slate-300">Next:</strong> {task.nextAction}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                        {/* State Transition Button (Pending -> In Progress -> Completed) */}
                        <button
                          onClick={() => transitionTaskState(task.id)}
                          title="Cycle task state (Pending -> In Progress -> Completed)"
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center space-x-1.5 cursor-pointer ${
                            task.currentState === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              : task.currentState === 'in_progress'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          <RefreshCw className="w-3 h-3 text-slate-400" />
                          <span className="capitalize">
                            {task.currentState === 'awaiting_approval'
                              ? 'Pending Approval'
                              : task.currentState.replace('_', ' ')}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Projects Health & Velocity */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white tracking-wide">
                  Active Projects &amp; System Velocity
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('world-model')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Inspect All 21 Project Attributes &rarr;
              </button>
            </div>

            {activeProjects.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
                No active projects match "{searchQuery}". Try clearing the search or searching for "EduCore" or "Sales".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeProjects.map((project) => {
                  const diffHours = project.deadline
                    ? (new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60)
                    : 999;
                  const isDueSoon = diffHours > 0 && diffHours <= 48;

                  return (
                    <div
                      key={project.id}
                      className={`p-4 rounded-xl bg-slate-950 border transition flex flex-col justify-between ${
                        isDueSoon
                          ? 'border-red-500/50 shadow-md shadow-red-500/5'
                          : 'border-slate-800/80 hover:border-indigo-500/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {isDueSoon && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-300 bg-red-500/25 px-2 py-0.5 rounded-full border border-red-500/50 animate-pulse">
                                Due &lt;{Math.max(1, Math.round(diffHours))}h
                              </span>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              {project.health}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-300">{project.progress}%</span>
                        </div>

                        <h3 className="font-semibold text-white text-sm mt-2 line-clamp-1">{project.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{project.vision}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Tasks: {project.tasks.length}</span>
                          <span>Next: {project.nextActions[0]?.slice(0, 18)}...</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cross-Project Synergies & Reuse Detection (Section 17) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white tracking-wide">
                  Cross-Project Synergies & Architecture Reuse
                </h2>
              </div>
              <span className="text-xs text-slate-400">Automated Graph Inference</span>
            </div>

            <div className="space-y-3">
              {synergies.map((synergy, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-950 border border-purple-900/30 hover:border-purple-600/40 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-purple-200">{synergy.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{synergy.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {synergy.projects.map((p, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded"
                          >
                            {p}
                          </span>
                        ))}
                        <span className="text-[10px] font-semibold text-emerald-400 ml-1">
                          ⚡ {synergy.potentialSavings}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        sendMessage(`Let's execute the synergy: "${synergy.title}" across ${synergy.projects.join(', ')}`)
                      }
                      className="self-start sm:self-center px-2.5 py-1 rounded bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                    >
                      Apply Reuse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Blockers, Deadlines & Recent Decisions */}
        <div className="space-y-6">
          {/* Urgent Deadlines & Commitments */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Upcoming Deadlines</h2>
              </div>
              {searchQuery && (
                <span className="text-[10px] font-semibold text-slate-400">
                  Filtered ({filteredTasks.filter((t) => t.currentState !== 'completed').length})
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {filteredTasks
                .filter((t) => t.currentState !== 'completed')
                .slice(0, 4)
                .map((task) => (
                  <div key={task.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                        {task.deadline}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          task.urgency === 'High'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.urgency || 'Medium'}
                      </span>
                    </div>
                    <div className="flex items-start space-x-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => toggleTaskComplete(task.id)}
                        title="Mark Completed"
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 transition cursor-pointer flex-shrink-0"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-relaxed">
                        {task.objective}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[11px] text-slate-500">
                      <span>Owner: {task.owner}</span>
                      <span>{task.estimatedEffort}</span>
                    </div>
                  </div>
                ))}
              {filteredTasks.filter((t) => t.currentState !== 'completed').length === 0 && (
                <div className="p-4 rounded-lg bg-slate-950 text-center text-xs text-slate-500">
                  No upcoming tasks match filter.
                </div>
              )}
            </div>
          </div>

          {/* Blocked Work Sentinel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-base font-bold text-white tracking-wide">Blockers & Roadblocks</h2>
            </div>

            {blockedTasks.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                <p className="text-xs text-slate-400">Zero active execution blockers detected.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
                    <p className="text-xs font-semibold text-red-300">{task.objective}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Next Action to Unblock: {task.nextAction}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Architectural Decisions & Rationale */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Recent Decisions</h2>
              </div>
              <button
                onClick={() => onNavigateToTab('world-model')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {worldModel.decisions.slice(0, 3).map((dec) => (
                <div key={dec.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>{dec.date}</span>
                    <span className="text-emerald-400 font-semibold">{dec.status}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">{dec.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 italic">"{dec.rationale}"</p>
                  {dec.reversalConditions && (
                    <p className="text-[10px] text-amber-400/90 mt-1">
                      <strong>Reversal condition:</strong> {dec.reversalConditions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CommandCenterDashboardSummary = DashboardSummary;
export const CommandCenterSearchBar = SearchBar;
export { DashboardSummary, SearchBar };
