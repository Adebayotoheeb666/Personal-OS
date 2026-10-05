import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Line,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart3,
  Award,
} from 'lucide-react';
import { ProjectTask } from '../types/agent';

interface TaskProductivityStatsProps {
  tasks: ProjectTask[];
}

// 30-Day simulated time-series data leading up to October 5, 2026
const THIRTY_DAY_TREND_DATA = [
  { date: 'Sep 6', day: 1, completed: 2, scheduled: 3, velocityScore: 78, approvalRate: 100 },
  { date: 'Sep 7', day: 2, completed: 3, scheduled: 2, velocityScore: 82, approvalRate: 98 },
  { date: 'Sep 8', day: 3, completed: 1, scheduled: 2, velocityScore: 80, approvalRate: 100 },
  { date: 'Sep 9', day: 4, completed: 4, scheduled: 4, velocityScore: 85, approvalRate: 97 },
  { date: 'Sep 10', day: 5, completed: 2, scheduled: 3, velocityScore: 83, approvalRate: 100 },
  { date: 'Sep 11', day: 6, completed: 3, scheduled: 3, velocityScore: 86, approvalRate: 96 },
  { date: 'Sep 12', day: 7, completed: 2, scheduled: 1, velocityScore: 84, approvalRate: 100 },
  { date: 'Sep 13', day: 8, completed: 4, scheduled: 3, velocityScore: 88, approvalRate: 99 },
  { date: 'Sep 14', day: 9, completed: 3, scheduled: 2, velocityScore: 87, approvalRate: 100 },
  { date: 'Sep 15', day: 10, completed: 5, scheduled: 4, velocityScore: 91, approvalRate: 98 },
  { date: 'Sep 16', day: 11, completed: 2, scheduled: 2, velocityScore: 89, approvalRate: 100 },
  { date: 'Sep 17', day: 12, completed: 4, scheduled: 3, velocityScore: 90, approvalRate: 97 },
  { date: 'Sep 18', day: 13, completed: 3, scheduled: 4, velocityScore: 88, approvalRate: 100 },
  { date: 'Sep 19', day: 14, completed: 4, scheduled: 2, velocityScore: 92, approvalRate: 99 },
  { date: 'Sep 20', day: 15, completed: 2, scheduled: 1, velocityScore: 90, approvalRate: 100 },
  { date: 'Sep 21', day: 16, completed: 5, scheduled: 4, velocityScore: 93, approvalRate: 96 },
  { date: 'Sep 22', day: 17, completed: 3, scheduled: 3, velocityScore: 91, approvalRate: 100 },
  { date: 'Sep 23', day: 18, completed: 4, scheduled: 2, velocityScore: 93, approvalRate: 98 },
  { date: 'Sep 24', day: 19, completed: 6, scheduled: 5, velocityScore: 96, approvalRate: 100 },
  { date: 'Sep 25', day: 20, completed: 4, scheduled: 3, velocityScore: 94, approvalRate: 97 },
  { date: 'Sep 26', day: 21, completed: 3, scheduled: 2, velocityScore: 92, approvalRate: 100 },
  { date: 'Sep 27', day: 22, completed: 5, scheduled: 4, velocityScore: 95, approvalRate: 99 },
  { date: 'Sep 28', day: 23, completed: 4, scheduled: 3, velocityScore: 94, approvalRate: 100 },
  { date: 'Sep 29', day: 24, completed: 5, scheduled: 4, velocityScore: 96, approvalRate: 98 },
  { date: 'Sep 30', day: 25, completed: 3, scheduled: 2, velocityScore: 93, approvalRate: 100 },
  { date: 'Oct 1', day: 26, completed: 6, scheduled: 4, velocityScore: 97, approvalRate: 99 },
  { date: 'Oct 2', day: 27, completed: 4, scheduled: 3, velocityScore: 95, approvalRate: 100 },
  { date: 'Oct 3', day: 28, completed: 5, scheduled: 3, velocityScore: 97, approvalRate: 98 },
  { date: 'Oct 4', day: 29, completed: 4, scheduled: 2, velocityScore: 96, approvalRate: 100 },
  { date: 'Oct 5', day: 30, completed: 5, scheduled: 4, velocityScore: 98, approvalRate: 100 },
];

const PRIORITY_COMPLETION_DATA = [
  { priority: 'Critical', rate: 95.8, completed: 23, total: 24, color: '#ef4444' },
  { priority: 'High', rate: 91.3, completed: 42, total: 46, color: '#f97316' },
  { priority: 'Medium', rate: 85.0, completed: 51, total: 60, color: '#6366f1' },
  { priority: 'Low', rate: 78.6, completed: 22, total: 28, color: '#10b981' },
];

export const TaskProductivityStats: React.FC<TaskProductivityStatsProps> = ({ tasks }) => {
  const [timeWindow, setTimeWindow] = useState<'7d' | '14d' | '30d'>('30d');
  const [chartView, setChartView] = useState<'trends' | 'completion' | 'both'>('both');

  // Filter time-series by selected time window
  const activeTrendData = useMemo(() => {
    const days = timeWindow === '7d' ? 7 : timeWindow === '14d' ? 14 : 30;
    return THIRTY_DAY_TREND_DATA.slice(-days);
  }, [timeWindow]);

  // Totals for the active window
  const totalCompletedInWindow = useMemo(() => {
    return activeTrendData.reduce((acc, curr) => acc + curr.completed, 0);
  }, [activeTrendData]);

  const totalScheduledInWindow = useMemo(() => {
    return activeTrendData.reduce((acc, curr) => acc + curr.scheduled, 0);
  }, [activeTrendData]);

  const averageVelocityScore = useMemo(() => {
    const sum = activeTrendData.reduce((acc, curr) => acc + curr.velocityScore, 0);
    return Math.round(sum / activeTrendData.length);
  }, [activeTrendData]);

  const completionRateInWindow = useMemo(() => {
    if (totalScheduledInWindow === 0) return 100;
    return Math.min(100, Math.round((totalCompletedInWindow / totalScheduledInWindow) * 100));
  }, [totalCompletedInWindow, totalScheduledInWindow]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 backdrop-blur-md">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-300">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Task Productivity &amp; Completion Analytics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold">
                Recharts Powered
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              30-day velocity trends, daily throughput, and priority tier completion metrics.
            </p>
          </div>
        </div>

        {/* Window Selector & View Toggles */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
          {/* Time window */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-[11px]">
            {(['7d', '14d', '30d'] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setTimeWindow(w)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                  timeWindow === w
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {w === '7d' ? '7 Days' : w === '14d' ? '14 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          {/* Chart View */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setChartView('both')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                chartView === 'both' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Combined
            </button>
            <button
              type="button"
              onClick={() => setChartView('trends')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                chartView === 'trends' ? 'bg-cyan-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trends
            </button>
            <button
              type="button"
              onClick={() => setChartView('completion')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                chartView === 'completion' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Completion %
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Completion Rate</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-black text-emerald-400 font-mono">
                {completionRateInWindow}%
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold flex items-center">
                <ArrowUpRight className="w-2.5 h-2.5" />
                +5.4%
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Vs. previous cycle</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Tasks Completed</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-black text-cyan-300 font-mono">
                {totalCompletedInWindow}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">/ {totalScheduledInWindow} scheduled</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Across all specialists</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Productivity Score</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-black text-amber-300 font-mono">
                {averageVelocityScore}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
            </div>
            <span className="text-[9px] text-amber-400 font-semibold">Continuous Peak</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Level 5 Pass Rate</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-black text-purple-300 font-mono">
                98.8%
              </span>
              <span className="text-[10px] text-purple-300 font-semibold">0 Breaches</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Sandbox Invariant Verified</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: 30-Day Productivity Trends (Area & Velocity Line) */}
        {(chartView === 'trends' || chartView === 'both') && (
          <div className={`${chartView === 'both' ? 'lg:col-span-2' : 'lg:col-span-3'} p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Productivity &amp; Daily Throughput Trends ({timeWindow})</span>
              </span>
              <div className="flex items-center space-x-3 text-[10px] font-mono">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Tasks Completed</span>
                </span>
                <span className="flex items-center space-x-1 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Tasks Scheduled</span>
                </span>
                <span className="flex items-center space-x-1 text-amber-400">
                  <span className="w-2 h-0.5 bg-amber-400"></span>
                  <span>Velocity Index</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="scheduledGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#070d19',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#f8fafc',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
                    }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#completedGrad)"
                  />
                  <Bar
                    dataKey="scheduled"
                    name="Scheduled"
                    fill="#06b6d4"
                    opacity={0.4}
                    radius={[3, 3, 0, 0]}
                    barSize={8}
                  />
                  <Line
                    type="monotone"
                    dataKey="velocityScore"
                    name="Velocity Index"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    dot={false}
                    yAxisId={0}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart 2: Priority Completion Rates (Bar Breakdown) */}
        {(chartView === 'completion' || chartView === 'both') && (
          <div className={`${chartView === 'both' ? 'lg:col-span-1' : 'lg:col-span-3'} p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completion Rate by Priority</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">30-Day Cohort</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PRIORITY_COMPLETION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="priority" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#070d19',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% (${item.payload.completed}/${item.payload.total} delivered)`,
                      'Completion Rate',
                    ]}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={28}>
                    {PRIORITY_COMPLETION_DATA.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
