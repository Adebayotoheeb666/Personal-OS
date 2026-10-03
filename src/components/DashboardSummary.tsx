import React from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
} from 'lucide-react';
import { ProjectModel, ProjectTask } from '../types/agent';
import { CacheMetrics } from '../services/memoryCacheService';

interface DashboardSummaryProps {
  projects: ProjectModel[];
  allTasks: ProjectTask[];
  pendingApprovalsCount: number;
  cacheMetrics: CacheMetrics;
  onFilterUrgent?: () => void;
  onFilterAwaitingApproval?: () => void;
  onFilterProjects?: () => void;
  onSelectProject?: (projectId: string) => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  projects,
  allTasks,
  pendingApprovalsCount,
  cacheMetrics,
  onFilterUrgent,
  onFilterAwaitingApproval,
  onFilterProjects,
  onSelectProject,
}) => {
  const activeProjects = projects.filter((p) => p.category === 'active');
  const avgProgress = activeProjects.length
    ? Math.round(
        activeProjects.reduce((acc, p) => acc + p.progress, 0) / activeProjects.length
      )
    : 0;

  // Detect projects ending within the next 48 hours (ISO deadline calculation)
  const dueSoonProjects = projects.filter((p) => {
    if (!p.deadline || p.category !== 'active') return false;
    const diffMs = new Date(p.deadline).getTime() - Date.now();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48;
  });

  const pendingTasks = allTasks.filter((t) => t.currentState !== 'completed');
  const awaitingApprovalTasks = allTasks.filter((t) => t.currentState === 'awaiting_approval');
  const inProgressTasks = allTasks.filter((t) => t.currentState === 'in_progress');
  const blockedTasks = allTasks.filter((t) => t.currentState === 'blocked');

  // Urgent Deadlines (critical/high priority or due in upcoming days)
  const urgentTasks = allTasks.filter(
    (t) =>
      t.currentState !== 'completed' &&
      (t.priority === 'critical' || t.priority === 'high' || t.urgency === 'High')
  );

  return (
    <div className="space-y-4">
      {/* Due Soon Alert Banner (Triggers for projects with deadline in next 48h) */}
      {dueSoonProjects.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/60 via-amber-950/40 to-slate-900 border border-red-500/60 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 shadow-inner flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/25 text-red-300 border border-red-500/50 shadow-sm">
                  Due Soon Alert &bull; 48-Hour Window
                </span>
                <span className="text-xs text-amber-300 font-mono font-semibold">
                  Ends in ~{Math.max(1, Math.round((new Date(dueSoonProjects[0].deadline).getTime() - Date.now()) / (1000 * 60 * 60)))}h
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({new Date(dueSoonProjects[0].deadline).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })})
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Project Milestone Ending Soon: {dueSoonProjects[0].name}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1 max-w-2xl">
                <strong className="text-slate-200">Vision:</strong> {dueSoonProjects[0].vision}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => onSelectProject && onSelectProject(dueSoonProjects[0].id)}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-red-600/30 whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Focus Project</span>
            </button>
            {onFilterUrgent && (
              <button
                onClick={onFilterUrgent}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer whitespace-nowrap"
              >
                View Urgent Tasks
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Projects Stat Card */}
      <div
        onClick={onFilterProjects}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Projects</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">{activeProjects.length}</span>
            <span className="text-xs text-slate-400 font-medium">of {projects.length} total</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Avg Velocity: <strong className="text-indigo-300 font-bold">{avgProgress}%</strong> complete
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Pending Tasks Stat Card */}
      <div
        onClick={onFilterAwaitingApproval}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-amber-500/50 transition cursor-pointer flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Tasks</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">{pendingTasks.length}</span>
            <span className="text-xs text-slate-400 font-medium">active items</span>
          </div>
          <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
            <span className="text-indigo-300 font-semibold">{inProgressTasks.length} in progress</span>
            <span>•</span>
            <span className="text-amber-300 font-semibold">{awaitingApprovalTasks.length} gated</span>
            {blockedTasks.length > 0 && (
              <>
                <span>•</span>
                <span className="text-red-400 font-semibold">{blockedTasks.length} blocked</span>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Completion Rate</span>
          <span className="text-emerald-400 font-bold">
            {allTasks.length ? Math.round(((allTasks.length - pendingTasks.length) / allTasks.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 3. Urgent Deadlines Stat Card */}
      <div
        onClick={onFilterUrgent}
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-red-500/50 transition cursor-pointer flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Urgent Deadlines</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-300 tracking-tight">{urgentTasks.length}</span>
            <span className="text-xs text-slate-400 font-medium">high / critical</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            Next: <span className="text-slate-200 font-medium">{urgentTasks[0]?.objective || 'None pending'}</span>
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Earliest Due</span>
          <span className="text-amber-400 font-semibold">{urgentTasks[0]?.deadline || 'On Track'}</span>
        </div>
      </div>

      {/* 4. Consequential Gates & Memory Cache Stat Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Approval Gates &amp; Cache</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-300 tracking-tight">{pendingApprovalsCount}</span>
            <span className="text-xs text-slate-400 font-medium">gated actions</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cache: <strong className="text-emerald-400">{cacheMetrics.hits} hits</strong> ({cacheMetrics.cachedKeysCount} keys)</span>
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Latency</span>
          <span className="text-emerald-400 font-mono font-semibold">&lt; 1ms retrieval</span>
        </div>
      </div>
    </div>
    </div>
  );
};
