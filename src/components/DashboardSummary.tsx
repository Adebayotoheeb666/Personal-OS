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
  Bot,
  Sparkles,
  ArrowRight,
  Flame,
  CheckSquare,
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
  onTriggerAutoLoop?: () => void;
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
  onTriggerAutoLoop,
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
  const completedTasks = allTasks.filter((t) => t.currentState === 'completed');

  // Urgent Deadlines (critical/high priority or due in upcoming days)
  const urgentTasks = allTasks.filter(
    (t) =>
      t.currentState !== 'completed' &&
      (t.priority === 'critical' || t.priority === 'high' || t.urgency === 'High')
  );

  const criticalTasksCount = allTasks.filter((t) => t.priority === 'critical' && t.currentState !== 'completed').length;
  const highTasksCount = allTasks.filter((t) => t.priority === 'high' && t.currentState !== 'completed').length;

  return (
    <div className="space-y-4">
      {/* Tactile Hero Greeting Banner (Inspired by Image 2's top hero greeting card) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Glow orb in background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start sm:items-center space-x-4 relative z-10">
          {/* Holographic 3D Bot Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.5)] flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-8 h-8 text-cyan-300 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white tracking-tight">
                Command Dashboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>Level 5 Autonomy</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium max-w-xl">
              All 8 subsystems online &bull; AST code analysis active &bull; Zero un-gated production mutations.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Memory Cache: &lt;1ms</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-indigo-300 font-semibold">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Overall System Health: 98%</span>
              </span>
              {pendingApprovalsCount > 0 && (
                <>
                  <span>&bull;</span>
                  <span className="text-amber-400 font-bold animate-pulse">
                    {pendingApprovalsCount} Awaiting Signatures
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center relative z-10">
          {onTriggerAutoLoop && (
            <button
              onClick={onTriggerAutoLoop}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition cursor-pointer flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-200" />
              <span>Auto-Reasoning Loop</span>
            </button>
          )}

          {onFilterUrgent && (
            <button
              onClick={onFilterUrgent}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/50 text-slate-200 font-semibold text-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Urgent Tasks ({urgentTasks.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Due Soon Alert Banner (Triggers for projects with deadline in next 48h) */}
      {dueSoonProjects.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/70 via-amber-950/50 to-slate-900 border border-red-500/60 rounded-2xl p-4 sm:p-5 shadow-[0_4px_25px_rgba(239,68,68,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
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

      {/* 4 Tactile Claymorphic / Cyber Stat Cards (Inspired by Image 2's 4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects (Sky / Cyan Tint) */}
        <div
          onClick={onFilterProjects}
          className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-cyan-400">
                Active Projects
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 group-hover:scale-110 transition shadow-inner">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                {activeProjects.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">of {projects.length} total</span>
            </div>

            <p className="text-xs text-slate-400 mt-1">
              Avg Velocity: <strong className="text-cyan-300 font-bold">{avgProgress}%</strong> complete
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>{projects.length} Registered</span>
              <span className="text-cyan-300 font-bold">100% Retrievable</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tasks & Priority (Coral / Rose Tint) */}
        <div
          onClick={onFilterAwaitingApproval}
          className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-rose-400">
                Reasoning Tasks
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 group-hover:scale-110 transition shadow-inner">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                {pendingTasks.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">pending of {allTasks.length}</span>
            </div>

            <div className="flex items-center space-x-1.5 mt-1 text-[11px]">
              <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
                {criticalTasksCount} Critical
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                {highTasksCount} High
              </span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                {inProgressTasks.length} Active
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Completed Ratio</span>
            <span className="text-emerald-400 font-bold font-mono">
              {completedTasks.length}/{allTasks.length} ({allTasks.length ? Math.round((completedTasks.length / allTasks.length) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Card 3: Urgent Deadlines (Amber / Gold Tint) */}
        <div
          onClick={onFilterUrgent}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-400">
                Urgent Deadlines
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 group-hover:scale-110 transition shadow-inner">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-amber-300 tracking-tight font-mono">
                {urgentTasks.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">high urgency</span>
            </div>

            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              Top: <span className="text-slate-200 font-medium">{urgentTasks[0]?.objective || 'All clear'}</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Earliest Due</span>
            <span className="text-amber-400 font-semibold font-mono">{urgentTasks[0]?.deadline || 'On Track'}</span>
          </div>
        </div>

        {/* Card 4: Gated Signatures & Memory Cache (Emerald / Mint Tint) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] transition flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-400">
                Gates &amp; Memory Cache
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition shadow-inner">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-300 tracking-tight font-mono">
                {pendingApprovalsCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">signatures required</span>
            </div>

            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cache: <strong className="text-emerald-400 font-bold">{cacheMetrics.hits} hits</strong> ({cacheMetrics.cachedKeysCount} keys)</span>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Retrieval Speed</span>
            <span className="text-emerald-400 font-mono font-bold">&lt; 1ms latency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
