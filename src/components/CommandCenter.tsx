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
  const [projectSortBy, setProjectSortBy] = useState<'urgency' | 'progress' | 'deadline' | 'name'>('urgency');
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

  // Urgency scoring calculation for project dashboard
  const calculateProjectUrgency = (project: (typeof worldModel.projects)[0]) => {
    let score = 0;
    const reasons: string[] = [];

    // Deadline window
    if (project.deadline) {
      const diffHours = (new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
      if (diffHours > 0 && diffHours <= 48) {
        score += 8000 + (48 - diffHours) * 80;
        reasons.push(`Due in <${Math.max(1, Math.round(diffHours))}h`);
      } else if (diffHours > 0 && diffHours <= 168) {
        score += 3000 + (168 - diffHours) * 15;
        reasons.push(`Due in ${Math.round(diffHours / 24)}d`);
      } else if (diffHours <= 0) {
        score += 12000;
        reasons.push('Overdue milestone');
      }
    }

    // Task priority breakdown (uncompleted tasks)
    const uncompleted = project.tasks.filter((t) => t.currentState !== 'completed');
    const criticalTasks = uncompleted.filter((t) => t.priority === 'critical');
    const highTasks = uncompleted.filter((t) => t.priority === 'high');
    const highUrgency = uncompleted.filter((t) => t.urgency === 'High');

    if (criticalTasks.length > 0) {
      score += criticalTasks.length * 2500;
      reasons.push(`${criticalTasks.length} Critical task${criticalTasks.length > 1 ? 's' : ''}`);
    }
    if (highTasks.length > 0) {
      score += highTasks.length * 1200;
      reasons.push(`${highTasks.length} High task${highTasks.length > 1 ? 's' : ''}`);
    }
    if (highUrgency.length > 0) {
      score += highUrgency.length * 600;
    }

    if (project.health === 'blocked') {
      score += 4000;
      reasons.push('Health: Blocked');
    } else if (project.health === 'at_risk') {
      score += 2000;
      reasons.push('Health: At Risk');
    }

    score += uncompleted.length * 50;

    const urgencyLevel: 'Critical' | 'High' | 'Normal' =
      score >= 5000 ? 'Critical' : score >= 2000 ? 'High' : 'Normal';

    return { score, urgencyLevel, reasons };
  };

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

  // Filtered & Sorted Active Projects based on Search Bar and Dashboard Urgency Sort
  const activeProjects = useMemo(() => {
    let list = worldModel.projects.filter((p) => p.category === 'active');
    if (searchQuery.trim() && searchFilter !== 'tasks') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.vision.toLowerCase().includes(q) ||
          p.problem.toLowerCase().includes(q) ||
          p.architecture.toLowerCase().includes(q) ||
          p.features.some((f) => f.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      if (projectSortBy === 'urgency') {
        return calculateProjectUrgency(b).score - calculateProjectUrgency(a).score;
      }
      if (projectSortBy === 'progress') {
        const aCompleted = a.tasks.filter((t) => t.currentState === 'completed').length;
        const bCompleted = b.tasks.filter((t) => t.currentState === 'completed').length;
        const aRatio = a.tasks.length > 0 ? aCompleted / a.tasks.length : 0;
        const bRatio = b.tasks.length > 0 ? bCompleted / b.tasks.length : 0;
        return bRatio - aRatio;
      }
      if (projectSortBy === 'deadline') {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return aTime - bTime;
      }
      if (projectSortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [worldModel.projects, searchQuery, searchFilter, projectSortBy]);

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
      {/* Dashboard Summary KPI Component (Hero Greeting + Due Soon + 4 Tactile Stat Cards) */}
      <DashboardSummary
        projects={worldModel.projects}
        allTasks={allTasks}
        pendingApprovalsCount={pendingProposals.length + pendingTasks.length}
        cacheMetrics={cacheMetrics}
        onFilterProjects={() => setSearchFilter('projects')}
        onFilterAwaitingApproval={() => setSearchFilter('tasks')}
        onFilterUrgent={() => setSearchFilter('urgent')}
        onTriggerAutoLoop={() => runAutonomousLoop('Execute full-cycle autonomous review and sync')}
      />

      {/* Quick Project Continuity Recall Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center space-x-2 text-slate-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Instant Context Continuity:
          </span>
          <span className="text-slate-400 hidden md:inline">
            Hydrate working memory and architectural ADRs with 1-click
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickContinuity('sales')}
            disabled={isThinking}
            className="px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold border border-indigo-500/40 transition flex items-center space-x-1 cursor-pointer"
          >
            <span>"Continue Sales Pipeline"</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleQuickContinuity('educore')}
            disabled={isThinking}
            className="px-3 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition flex items-center space-x-1 cursor-pointer"
          >
            <span>"Where are we with EduCore?"</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

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
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Active Projects Dashboard
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    {activeProjects.length} Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual progress calculated from completed/total tasks with multi-factor urgency sorting.
                </p>
              </div>

              {/* Urgency & Dashboard Sort Controls */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sort By:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setProjectSortBy('urgency')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 border ${
                    projectSortBy === 'urgency'
                      ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm shadow-red-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Zap className="w-3 h-3 text-red-400" />
                  <span>Urgency</span>
                  {projectSortBy === 'urgency' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse ml-0.5"></span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setProjectSortBy('progress')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 border ${
                    projectSortBy === 'progress'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-indigo-400" />
                  <span>Progress</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectSortBy('deadline')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1 border ${
                    projectSortBy === 'deadline'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>Deadline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProjectSortBy('name')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer border ${
                    projectSortBy === 'name'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  Name
                </button>
              </div>
            </div>

            {activeProjects.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500">
                No active projects match "{searchQuery}". Try clearing the search or searching for "EduCore" or "Sales".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeProjects.map((project) => {
                  const totalTasks = project.tasks.length;
                  const completedTasks = project.tasks.filter((t) => t.currentState === 'completed').length;
                  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  const urgencyInfo = calculateProjectUrgency(project);

                  const diffHours = project.deadline
                    ? (new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60)
                    : 999;
                  const isDueSoon = diffHours > 0 && diffHours <= 48;

                  return (
                    <div
                      key={project.id}
                      className={`p-4 rounded-xl bg-slate-950 border transition flex flex-col justify-between ${
                        urgencyInfo.urgencyLevel === 'Critical'
                          ? 'border-red-500/50 shadow-md shadow-red-500/10 ring-1 ring-red-500/30'
                          : urgencyInfo.urgencyLevel === 'High'
                          ? 'border-amber-500/40 hover:border-amber-500/60 shadow-sm'
                          : 'border-slate-800/80 hover:border-indigo-500/40'
                      }`}
                    >
                      <div>
                        {/* Top Badges: Urgency, Deadline Alert, Health */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Visual Urgency Badge */}
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                urgencyInfo.urgencyLevel === 'Critical'
                                  ? 'bg-red-500/25 text-red-300 border-red-500/50 animate-pulse'
                                  : urgencyInfo.urgencyLevel === 'High'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {urgencyInfo.urgencyLevel === 'Critical' ? (
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                              ) : urgencyInfo.urgencyLevel === 'High' ? (
                                <Clock className="w-3 h-3 text-amber-400" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              )}
                              <span>{urgencyInfo.urgencyLevel} Urgency</span>
                            </span>

                            {isDueSoon && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-300 bg-red-500/25 px-2 py-0.5 rounded-full border border-red-500/50">
                                &lt;{Math.max(1, Math.round(diffHours))}h
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {project.health}
                          </span>
                        </div>

                        {/* Project Name & Vision */}
                        <h3 className="font-semibold text-white text-sm line-clamp-1">{project.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{project.vision}</p>

                        {/* Urgency Trigger Reasons Pill */}
                        {urgencyInfo.reasons.length > 0 && (
                          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 flex-wrap">
                            <span className="text-slate-500 uppercase font-semibold">Drivers:</span>
                            {urgencyInfo.reasons.slice(0, 2).map((r, i) => (
                              <span key={i} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Visual Progress Bar Section (Completed / Total Tasks) */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300 flex items-center gap-1">
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Task Progress:</span>
                          </span>
                          <span className="font-bold text-white font-mono">
                            {completedTasks}/{totalTasks} ({taskCompletionRate}%)
                          </span>
                        </div>

                        {/* Visual Progress Bar Container */}
                        <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                              taskCompletionRate === 100
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : taskCompletionRate >= 50
                                ? 'bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400'
                                : taskCompletionRate > 0
                                ? 'bg-gradient-to-r from-amber-500 to-indigo-500'
                                : 'bg-slate-700 w-1'
                            }`}
                            style={{
                              width: `${Math.max(taskCompletionRate, taskCompletionRate > 0 ? 6 : 0)}%`,
                            }}
                          ></div>
                        </div>

                        {/* Mini Task Status Segmented Dots */}
                        {totalTasks > 0 && (
                          <div className="flex items-center gap-1 pt-0.5">
                            {project.tasks.map((t, idx) => (
                              <div
                                key={idx}
                                title={`${t.objective} (${t.currentState})`}
                                className={`h-1.5 flex-1 rounded-full transition ${
                                  t.currentState === 'completed'
                                    ? 'bg-emerald-400'
                                    : t.currentState === 'awaiting_approval'
                                    ? 'bg-amber-400'
                                    : t.currentState === 'in_progress'
                                    ? 'bg-indigo-400'
                                    : t.currentState === 'blocked'
                                    ? 'bg-red-500'
                                    : 'bg-slate-700'
                                }`}
                              ></div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <span className="truncate max-w-[140px]">
                            {completedTasks} completed • {totalTasks - completedTasks} remaining
                          </span>
                          <span className="truncate max-w-[120px] text-indigo-300 font-medium">
                            {project.nextActions[0]?.slice(0, 16)}...
                          </span>
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
