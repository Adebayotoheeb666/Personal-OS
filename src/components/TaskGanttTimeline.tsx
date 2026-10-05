import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowUpDown,
  Filter,
  Move,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Zap,
  Tag,
  Flame,
  Check,
  Play,
  RotateCcw,
  Link2,
  Unlink,
  ExternalLink,
  GitCommit,
  X,
  ArrowRight,
  HelpCircle,
  Search,
} from 'lucide-react';
import { ProjectTask } from '../types/agent';
import { useAgent } from '../context/AgentContext';
import { voiceAgent } from '../services/voiceAgentService';

interface TaskGanttTimelineProps {
  tasks: ProjectTask[];
  onSelectTask?: (task: ProjectTask) => void;
  onNavigateToTab?: (tab: any) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

type TimelineZoom = '7d' | '14d' | '30d' | '60d';

const PRIORITY_LANES: {
  id: ProjectTask['priority'];
  label: string;
  badgeClass: string;
  glowClass: string;
  dropBorderClass: string;
  accentColor: string;
  description: string;
}[] = [
  {
    id: 'critical',
    label: 'Critical Priority',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    dropBorderClass: 'border-red-500/80 bg-red-950/20',
    accentColor: '#ef4444',
    description: 'Immediate execution required; potential ecosystem blocker.',
  },
  {
    id: 'high',
    label: 'High Priority',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    dropBorderClass: 'border-orange-500/80 bg-orange-950/20',
    accentColor: '#f97316',
    description: 'Upcoming milestone deliverable; high strategic urgency.',
  },
  {
    id: 'medium',
    label: 'Medium Priority',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    glowClass: 'shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    dropBorderClass: 'border-indigo-500/80 bg-indigo-950/20',
    accentColor: '#6366f1',
    description: 'Standard sprint task within predictable operational bounds.',
  },
  {
    id: 'low',
    label: 'Low Priority',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    dropBorderClass: 'border-emerald-500/80 bg-emerald-950/20',
    accentColor: '#10b981',
    description: 'Non-blocking enhancement or low-urgency background backlog item.',
  },
];

export const TaskGanttTimeline: React.FC<TaskGanttTimelineProps> = ({
  tasks,
  onSelectTask,
  onNavigateToTab,
  searchQuery,
  onSearchChange,
}) => {
  const {
    worldModel,
    updateTaskPriority,
    updateTaskState,
    linkTaskDependency,
    unlinkTaskDependency,
    updateTaskDependencies,
  } = useAgent();
  const [internalSearch, setInternalSearch] = useState<string>('');
  const activeSearch = searchQuery !== undefined ? searchQuery : internalSearch;
  const handleSearchChange = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    else setInternalSearch(val);
  };

  const [zoom, setZoom] = useState<TimelineZoom>('30d');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverLane, setDragOverLane] = useState<ProjectTask['priority'] | null>(null);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Task Dependency Linking & Visualization State
  const [isLinkingMode, setIsLinkingMode] = useState<boolean>(false);
  const [linkingSourceTaskId, setLinkingSourceTaskId] = useState<string | null>(null);
  const [showDependencyLines, setShowDependencyLines] = useState<boolean>(true);
  const [hoveredDependencyKey, setHoveredDependencyKey] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [selectedDepToAdd, setSelectedDepToAdd] = useState<string>('');

  // DOM references for measuring exact task positions on the Gantt canvas
  const lanesContainerRef = useRef<HTMLDivElement>(null);
  const taskCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [taskCardPositions, setTaskCardPositions] = useState<
    Record<string, { x: number; y: number; width: number; height: number }>
  >({});

  // Compute all related task dependency pairs across visible/all tasks
  const dependencyPairs = useMemo(() => {
    const pairs: {
      key: string;
      predecessor: ProjectTask;
      successor: ProjectTask;
      isConflict: boolean;
    }[] = [];

    tasks.forEach((successor) => {
      (successor.dependencies || []).forEach((predId) => {
        const predecessor = tasks.find((t) => t.id === predId);
        if (predecessor) {
          const predDue = predecessor.deadline ? new Date(predecessor.deadline).getTime() : 0;
          const succDue = successor.deadline ? new Date(successor.deadline).getTime() : 0;
          const isConflict = predDue > 0 && succDue > 0 && predDue > succDue;

          pairs.push({
            key: `${predecessor.id}->${successor.id}`,
            predecessor,
            successor,
            isConflict,
          });
        }
      });
    });

    return pairs;
  }, [tasks]);

  // Keep selectedTask synchronized with latest state changes in tasks
  const activeSelectedTask = useMemo(() => {
    if (!selectedTask) return null;
    return tasks.find((t) => t.id === selectedTask.id) || selectedTask;
  }, [tasks, selectedTask]);

  // Measure card coordinates for connecting lines
  const updateCardPositions = useCallback(() => {
    if (!lanesContainerRef.current) return;
    const containerRect = lanesContainerRef.current.getBoundingClientRect();
    const nextPositions: Record<string, { x: number; y: number; width: number; height: number }> = {};

    Object.entries(taskCardRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        nextPositions[id] = {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        };
      }
    });

    setTaskCardPositions(nextPositions);
  }, []);

  useEffect(() => {
    updateCardPositions();
    const timer = setTimeout(updateCardPositions, 150);
    window.addEventListener('resize', updateCardPositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCardPositions);
    };
  }, [tasks, zoom, filterProject, filterState, updateCardPositions]);

  // Time reference: Current Time (simulated reference around active tasks)
  const currentTime = useMemo(() => new Date('2026-10-05T12:00:00Z'), []);

  // Duration in days based on zoom level
  const totalDays = useMemo(() => {
    switch (zoom) {
      case '7d':
        return 7;
      case '14d':
        return 14;
      case '30d':
        return 30;
      case '60d':
      default:
        return 60;
    }
  }, [zoom]);

  // Timeline Start Date (-2 days before current time so past/in-progress context is visible)
  const timelineStart = useMemo(() => {
    const d = new Date(currentTime);
    d.setDate(d.getDate() - 2);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentTime]);

  const timelineEnd = useMemo(() => {
    const d = new Date(timelineStart);
    d.setDate(d.getDate() + totalDays);
    return d;
  }, [timelineStart, totalDays]);

  const timelineTotalMs = timelineEnd.getTime() - timelineStart.getTime();

  // Percentage position of Current Time on the timeline axis
  const currentTimePercentage = useMemo(() => {
    const elapsed = currentTime.getTime() - timelineStart.getTime();
    return Math.max(0, Math.min(100, (elapsed / timelineTotalMs) * 100));
  }, [currentTime, timelineStart, timelineTotalMs]);

  // Daily or periodic column ticks for the Gantt header
  const timelineTicks = useMemo(() => {
    const ticks: { date: Date; label: string; subLabel: string; isToday: boolean; leftPercent: number }[] = [];
    const stepDays = zoom === '7d' ? 1 : zoom === '14d' ? 2 : zoom === '30d' ? 5 : 10;

    for (let dayOffset = 0; dayOffset <= totalDays; dayOffset += stepDays) {
      const tickDate = new Date(timelineStart);
      tickDate.setDate(tickDate.getDate() + dayOffset);

      const isToday =
        tickDate.getUTCDate() === currentTime.getUTCDate() &&
        tickDate.getUTCMonth() === currentTime.getUTCMonth();

      const leftPercent = ((tickDate.getTime() - timelineStart.getTime()) / timelineTotalMs) * 100;

      const diffDays = Math.round((tickDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));
      let subLabel = '';
      if (diffDays === 0) subLabel = 'Today';
      else if (diffDays > 0) subLabel = `+${diffDays}d`;
      else subLabel = `${diffDays}d`;

      ticks.push({
        date: tickDate,
        label: tickDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        subLabel,
        isToday,
        leftPercent: Math.max(0, Math.min(100, leftPercent)),
      });
    }
    return ticks;
  }, [timelineStart, totalDays, zoom, currentTime, timelineTotalMs]);

  // Filter tasks based on project, state, and global search query
  const filteredTasks = useMemo(() => {
    const q = activeSearch.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filterProject !== 'all' && t.projectId !== filterProject) return false;
      if (filterState !== 'all' && t.currentState !== filterState) return false;

      if (q) {
        const project = worldModel.projects.find((p) => p.id === t.projectId);
        const projectName = project ? project.name.toLowerCase() : '';
        const nameMatch = t.objective.toLowerCase().includes(q);
        const statusMatch =
          t.currentState.toLowerCase().includes(q) ||
          t.currentState.replace(/_/g, ' ').toLowerCase().includes(q);
        const priorityMatch = t.priority.toLowerCase().includes(q);
        const tagMatch =
          (t.requiredResources || []).some((r) => r.toLowerCase().includes(q)) ||
          (t.owner && t.owner.toLowerCase().includes(q)) ||
          (t.colorCode && t.colorCode.toLowerCase().includes(q)) ||
          projectName.includes(q);

        if (!nameMatch && !statusMatch && !priorityMatch && !tagMatch) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, filterProject, filterState, activeSearch, worldModel.projects]);

  // Group tasks by priority lane
  const tasksByPriority = useMemo(() => {
    const map: Record<ProjectTask['priority'], ProjectTask[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.priority]) {
        map[t.priority].push(t);
      } else {
        map.medium.push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  // Compute Gantt horizontal start & width percentages for a given task
  const getTaskGanttCoordinates = (task: ProjectTask) => {
    // Parse deadline or fallback
    let taskEnd = task.deadline ? new Date(task.deadline).getTime() : currentTime.getTime() + 7 * 86400000;
    if (isNaN(taskEnd)) {
      taskEnd = currentTime.getTime() + 7 * 86400000;
    }

    // Parse effort duration or infer 3 days
    let durationHours = 72; // 3 days default
    if (task.estimatedEffort) {
      const match = task.estimatedEffort.match(/(\d+)/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (task.estimatedEffort.includes('day')) durationHours = val * 24;
        else if (task.estimatedEffort.includes('hour')) durationHours = val;
      }
    }

    const taskDurationMs = durationHours * 3600 * 1000;
    const taskStart = taskEnd - taskDurationMs;

    const leftPercent = Math.max(0, Math.min(95, ((taskStart - timelineStart.getTime()) / timelineTotalMs) * 100));
    const rightPercent = Math.max(leftPercent + 3, Math.min(100, ((taskEnd - timelineStart.getTime()) / timelineTotalMs) * 100));
    const widthPercent = Math.max(5, Math.min(100 - leftPercent, rightPercent - leftPercent));

    // Days relative to today
    const daysUntilDue = Math.ceil((taskEnd - currentTime.getTime()) / (1000 * 60 * 60 * 24));

    return {
      leftPercent,
      widthPercent,
      daysUntilDue,
      deadlineFormatted: new Date(taskEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, task: ProjectTask) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(task.id);
  };

  const handleDragOver = (e: React.DragEvent, priority: ProjectTask['priority']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverLane !== priority) {
      setDragOverLane(priority);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetPriority: ProjectTask['priority']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverLane(null);
    setDraggedTaskId(null);

    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.priority === targetPriority) {
      return;
    }

    // Apply priority update
    updateTaskPriority(task.id, targetPriority);

    const feedback = `Re-prioritized "${task.objective.slice(0, 35)}..." to ${targetPriority.toUpperCase()}`;
    setNotification({ text: feedback, type: 'success' });
    setTimeout(() => setNotification(null), 4000);

    // Voice announcement
    voiceAgent.speak(`Task re-prioritized to ${targetPriority}.`, {
      emotion: targetPriority === 'critical' ? 'alert' : targetPriority === 'high' ? 'focused' : 'neutral',
    });
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Gantt-Style Autonomous Timeline</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold">
                    Current Time Synced
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visualizes upcoming project tasks relative to current time. Drag and drop any task across priority lanes to re-prioritize.
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Zoom Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto text-xs">
            {/* Search Filter Input in Gantt Toolbar */}
            <div className="relative flex items-center bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 min-w-[170px] max-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
              <input
                type="text"
                value={activeSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Filter tasks / tags..."
                className="bg-transparent text-slate-200 text-xs focus:outline-none w-full placeholder-slate-500"
              />
              {activeSearch && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="text-slate-400 hover:text-white ml-1 text-xs cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Project Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Projects ({worldModel.projects.length})</option>
                {worldModel.projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] font-bold uppercase">State:</span>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All States</option>
                <option value="in_progress" className="bg-slate-900">In Progress</option>
                <option value="awaiting_approval" className="bg-slate-900">Awaiting Approval</option>
                <option value="completed" className="bg-slate-900">Completed</option>
                <option value="blocked" className="bg-slate-900">Blocked</option>
              </select>
            </div>

            {/* Zoom Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-[11px]">
              {(['7d', '14d', '30d', '60d'] as const).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoom(z)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer font-bold ${
                    zoom === z
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Zoom timeline to ${z}`}
                >
                  {z}
                </button>
              ))}
            </div>

            {/* Dependency Connection Lines & Linker Toggle */}
            <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const next = !isLinkingMode;
                  setIsLinkingMode(next);
                  setLinkingSourceTaskId(null);
                  if (next) {
                    voiceAgent.speak('Dependency linking mode enabled. Click predecessor task first, then click successor task.');
                  }
                }}
                className={`px-2.5 py-1 rounded-xl border font-bold text-xs transition cursor-pointer flex items-center space-x-1.5 ${
                  isLinkingMode
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 ring-2 ring-cyan-400/40 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
                title="Toggle interactive task dependency linking mode in the Gantt chart"
              >
                <Link2 className={`w-3.5 h-3.5 ${isLinkingMode ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Link Dependencies</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  {dependencyPairs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowDependencyLines(!showDependencyLines)}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  showDependencyLines
                    ? 'bg-slate-900 text-cyan-400 border-slate-700'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
                title={showDependencyLines ? 'Hide connection lines' : 'Show connection lines'}
              >
                <GitCommit className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Dependency Linking Guidance Banner */}
        {isLinkingMode && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border border-cyan-500/60 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 animate-pulse">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white tracking-wide">Interactive Gantt Dependency Linker</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-cyan-500 text-slate-950 font-black">
                    {linkingSourceTaskId ? 'Step 2: Choose Successor' : 'Step 1: Choose Predecessor'}
                  </span>
                </div>
                <p className="text-[11px] text-cyan-200 mt-0.5">
                  {linkingSourceTaskId ? (
                    <span>
                      Predecessor: <strong className="text-white underline">{tasks.find((t) => t.id === linkingSourceTaskId)?.objective.slice(0, 40)}</strong>. Now click the task that depends on it to link them.
                    </span>
                  ) : (
                    <span>
                      Click any <strong>predecessor task</strong> first (must finish first), then click the <strong>successor task</strong> to draw a dependency line.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {linkingSourceTaskId && (
                <button
                  type="button"
                  onClick={() => setLinkingSourceTaskId(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsLinkingMode(false);
                  setLinkingSourceTaskId(null);
                }}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-200 hover:text-red-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Exit Link Mode
              </button>
            </div>
          </div>
        )}

        {/* Live Notification Banner */}
        {notification && (
          <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-between text-xs text-cyan-200 animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold">{notification.text}</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Memory Sync Updated</span>
          </div>
        )}

        {/* Drag Instruction Ribbon */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <div className="flex items-center space-x-2">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <strong className="text-slate-300">Drag &amp; Drop:</strong> Click &amp; drag any upcoming task card into a different priority lane to dynamically re-prioritize.
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-cyan-300 font-bold">Cyan Line = Current Time (Now)</span>
            </span>
            <span className="font-mono text-slate-500">
              Showing {filteredTasks.length} tasks
            </span>
          </div>
        </div>
      </div>

      {/* Main Gantt Canvas Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Timeline Header Time Scale (Relative to Current Time) */}
        <div className="relative border-b border-slate-800/80 bg-slate-900/60 select-none overflow-hidden">
          <div className="flex items-center">
            {/* Priority Lane Column Label Header */}
            <div className="w-48 sm:w-60 flex-shrink-0 p-3 border-r border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>Priority Lane</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500">Drop Zone</span>
            </div>

            {/* Time Axis Track */}
            <div className="flex-1 relative h-12 overflow-hidden">
              {/* Vertical Tick Marks */}
              {timelineTicks.map((tick, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 flex flex-col justify-center px-1 border-l border-slate-800/50 text-[10px]"
                  style={{ left: `${tick.leftPercent}%` }}
                >
                  <span className={`font-mono font-bold leading-tight ${tick.isToday ? 'text-cyan-300 font-black' : 'text-slate-300'}`}>
                    {tick.label}
                  </span>
                  <span className={`text-[9px] font-mono ${tick.isToday ? 'text-emerald-400 font-extrabold' : 'text-slate-500'}`}>
                    {tick.subLabel}
                  </span>
                </div>
              ))}

              {/* Glowing Current Time "NOW" Indicator Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-emerald-400 to-cyan-500 z-30 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{ left: `${currentTimePercentage}%` }}
              >
                <div className="absolute -top-0 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black font-mono text-[9px] tracking-wider uppercase shadow-md flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span>NOW</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Lanes Grid (Drop Targets) with SVG Connection Lines Overlay */}
        <div ref={lanesContainerRef} className="divide-y divide-slate-800/60 relative">
          {/* Vertical Current Time Line through all lanes */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-20"
            style={{
              left: `calc(12rem + (100% - 12rem) * ${currentTimePercentage / 100})`,
            }}
          >
            <div className="w-0.5 h-full bg-cyan-500/40 border-l border-cyan-400/80 border-dashed" />
          </div>

          {/* SVG Connection Lines Overlay between related tasks */}
          {showDependencyLines && (
            <svg
              className="absolute inset-0 pointer-events-none z-15 w-full h-full overflow-visible"
              style={{ minHeight: '100%', minWidth: '100%' }}
            >
              <defs>
                <marker
                  id="dep-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#06b6d4" />
                </marker>
                <marker
                  id="dep-arrow-completed"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
                </marker>
                <marker
                  id="dep-arrow-conflict"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f59e0b" />
                </marker>
                <marker
                  id="dep-arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38bdf8" />
                </marker>
              </defs>

              {dependencyPairs.map(({ key, predecessor, successor, isConflict }) => {
                const posA = taskCardPositions[predecessor.id];
                const posB = taskCardPositions[successor.id];
                if (!posA || !posB) return null;

                const isHovered =
                  hoveredDependencyKey === key ||
                  hoveredTaskId === predecessor.id ||
                  hoveredTaskId === successor.id ||
                  activeSelectedTask?.id === predecessor.id ||
                  activeSelectedTask?.id === successor.id;

                const startX = posA.x + posA.width;
                const startY = posA.y + posA.height / 2;
                const endX = posB.x;
                const endY = posB.y + posB.height / 2;

                let pathD = '';
                if (endX >= startX + 16) {
                  const dx = Math.max(30, (endX - startX) * 0.45);
                  pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;
                } else {
                  const midY = (startY + endY) / 2 + (startY <= endY ? 35 : -35);
                  pathD = `M ${startX} ${startY} C ${startX + 30} ${startY}, ${startX + 30} ${midY}, ${(startX + endX) / 2} ${midY} C ${endX - 30} ${midY}, ${endX - 30} ${endY}, ${endX} ${endY}`;
                }

                const isCompleted = predecessor.currentState === 'completed';
                const strokeColor = isConflict
                  ? '#f59e0b'
                  : isHovered
                  ? '#38bdf8'
                  : isCompleted
                  ? '#10b981'
                  : '#06b6d4';

                const markerId = isConflict
                  ? 'url(#dep-arrow-conflict)'
                  : isHovered
                  ? 'url(#dep-arrow-active)'
                  : isCompleted
                  ? 'url(#dep-arrow-completed)'
                  : 'url(#dep-arrow)';

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                return (
                  <g key={key} className="transition-all duration-200">
                    {/* Hit-area path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="20"
                      className="pointer-events-auto cursor-pointer"
                      onMouseEnter={() => setHoveredDependencyKey(key)}
                      onMouseLeave={() => setHoveredDependencyKey(null)}
                      onClick={() => {
                        voiceAgent.speak(`Dependency connection: ${successor.objective.slice(0, 25)} depends on ${predecessor.objective.slice(0, 25)}`);
                      }}
                    />

                    {/* Under-glow if active */}
                    {isHovered && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="5"
                        strokeOpacity="0.45"
                        className="animate-pulse"
                      />
                    )}

                    {/* Main stroke */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 2.5 : 1.75}
                      strokeOpacity={isHovered ? 1 : 0.8}
                      strokeDasharray={isCompleted ? 'none' : '4 3'}
                      markerEnd={markerId}
                    />

                    {/* Interactive Badge on hover */}
                    {isHovered && (
                      <foreignObject
                        x={midX - 55}
                        y={midY - 14}
                        width="110"
                        height="28"
                        className="pointer-events-auto overflow-visible"
                      >
                        <div className="flex items-center justify-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950/95 border border-cyan-500 shadow-lg text-[9px] font-mono text-cyan-300 font-bold backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                          <span>🔗 Dep</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              unlinkTaskDependency(successor.id, predecessor.id);
                              voiceAgent.speak(`Unlinked dependency between tasks.`);
                              setNotification({
                                text: `Unlinked: ${successor.objective.slice(0, 25)} no longer depends on ${predecessor.objective.slice(0, 20)}`,
                                type: 'info',
                              });
                            }}
                            className="px-1 py-0.2 rounded hover:bg-red-600 hover:text-white text-red-400 font-bold ml-1 cursor-pointer transition"
                            title="Remove this dependency link"
                          >
                            ✕ Unlink
                          </button>
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {PRIORITY_LANES.map((lane) => {
            const laneTasks = tasksByPriority[lane.id] || [];
            const isDropTarget = dragOverLane === lane.id;

            return (
              <div
                key={lane.id}
                onDragOver={(e) => handleDragOver(e, lane.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, lane.id)}
                className={`flex flex-col sm:flex-row transition-colors duration-200 ${
                  isDropTarget
                    ? `${lane.dropBorderClass} ring-2 ring-cyan-400/80`
                    : 'hover:bg-slate-900/30'
                }`}
              >
                {/* Lane Label / Drop Target Zone */}
                <div
                  className={`w-full sm:w-48 lg:w-60 flex-shrink-0 p-3 sm:border-r border-b sm:border-b-0 border-slate-800/80 flex flex-col justify-between ${
                    isDropTarget ? 'bg-cyan-950/40' : 'bg-slate-950/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: lane.accentColor }}
                        />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {lane.label}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${lane.badgeClass}`}>
                        {laneTasks.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">
                      {lane.description}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-900 text-[9px] font-mono text-slate-500 flex items-center justify-between">
                    <span>Drop here to set</span>
                    <span className="text-cyan-400 font-bold">&darr;</span>
                  </div>
                </div>

                {/* Timeline Gantt Track for this lane */}
                <div className="flex-1 relative p-3 min-h-[90px] flex flex-col justify-center gap-2 overflow-x-auto no-scrollbar">
                  {/* Background grid lines aligned with ticks */}
                  <div className="absolute inset-0 pointer-events-none flex">
                    {timelineTicks.map((tick, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-slate-800/25"
                        style={{ left: `${tick.leftPercent}%` }}
                      />
                    ))}
                  </div>

                  {laneTasks.length === 0 ? (
                    <div className="h-16 flex items-center justify-center text-slate-600 border border-dashed border-slate-800/80 rounded-xl text-xs font-mono">
                      <span>No tasks in {lane.label}. Drag a task here to assign.</span>
                    </div>
                  ) : (
                    laneTasks.map((task) => {
                      const coords = getTaskGanttCoordinates(task);
                      const isDragged = draggedTaskId === task.id;
                      const isSelected = activeSelectedTask?.id === task.id;
                      const isLinkingSource = linkingSourceTaskId === task.id;
                      const hasDependencies = (task.dependencies || []).length > 0;
                      const project = worldModel.projects.find((p) => p.id === task.projectId);

                      // Priority gradient style
                      let barGradient = 'from-indigo-600/80 to-blue-700/80 border-indigo-400/60 text-indigo-100';
                      if (lane.id === 'critical') barGradient = 'from-red-600/80 to-rose-700/80 border-red-400/80 text-red-100';
                      if (lane.id === 'high') barGradient = 'from-orange-600/80 to-amber-700/80 border-orange-400/80 text-orange-100';
                      if (lane.id === 'low') barGradient = 'from-emerald-600/80 to-teal-700/80 border-emerald-400/80 text-emerald-100';

                      return (
                        <div
                          key={task.id}
                          ref={(el) => {
                            if (el) taskCardRefs.current[task.id] = el;
                            else delete taskCardRefs.current[task.id];
                          }}
                          draggable={!isLinkingMode}
                          onDragStart={(e) => handleDragStart(e, task)}
                          onMouseEnter={() => setHoveredTaskId(task.id)}
                          onMouseLeave={() => setHoveredTaskId(null)}
                          onClick={() => {
                            if (isLinkingMode) {
                              if (!linkingSourceTaskId) {
                                setLinkingSourceTaskId(task.id);
                                voiceAgent.speak(`Predecessor task selected: ${task.objective.slice(0, 30)}. Now click the successor task.`);
                                setNotification({
                                  text: `Predecessor: "${task.objective.slice(0, 35)}". Click the task that should depend on it.`,
                                  type: 'info',
                                });
                              } else if (linkingSourceTaskId === task.id) {
                                setLinkingSourceTaskId(null);
                              } else {
                                linkTaskDependency(task.id, linkingSourceTaskId);
                                const pred = tasks.find((t) => t.id === linkingSourceTaskId);
                                voiceAgent.speak(`Linked task dependency. ${task.objective.slice(0, 25)} now depends on ${pred?.objective.slice(0, 20)}.`);
                                setNotification({
                                  text: `Linked! "${task.objective.slice(0, 30)}" now depends on "${pred?.objective.slice(0, 25)}"`,
                                  type: 'success',
                                });
                                setLinkingSourceTaskId(null);
                              }
                              return;
                            }
                            setSelectedTask(task);
                            onSelectTask?.(task);
                          }}
                          className={`group relative p-2.5 rounded-xl border backdrop-blur-md transition-all duration-150 select-none z-20 ${
                            isLinkingMode ? 'cursor-pointer hover:ring-2 hover:ring-cyan-400' : 'cursor-grab active:cursor-grabbing'
                          } ${
                            isDragged ? 'opacity-40 scale-95' : 'hover:scale-[1.01] hover:shadow-lg'
                          } ${
                            isLinkingSource
                              ? 'ring-2 ring-cyan-400 bg-cyan-950/90 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                              : isSelected
                              ? 'ring-2 ring-cyan-400 bg-slate-900 border-cyan-400'
                              : `bg-gradient-to-r ${barGradient} ${lane.glowClass}`
                          }`}
                          style={{
                            // Responsive position on timeline
                            marginLeft: `${coords.leftPercent}%`,
                            width: `calc(max(260px, ${coords.widthPercent}%))`,
                            maxWidth: `calc(100% - ${coords.leftPercent}%)`,
                          }}
                          title={
                            isLinkingMode
                              ? linkingSourceTaskId
                                ? `Click to link as successor (will depend on selected predecessor)`
                                : `Click to select as predecessor prerequisite`
                              : `Click to inspect or drag to re-prioritize • Due in ${coords.daysUntilDue} days (${coords.deadlineFormatted})`
                          }
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center space-x-2 truncate">
                              {!isLinkingMode && (
                                <Move className="w-3 h-3 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              )}
                              {task.currentState === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                              ) : task.currentState === 'awaiting_approval' ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-300 animate-pulse flex-shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                              )}
                              <span className="font-bold text-xs text-white truncate leading-tight">
                                {task.objective}
                              </span>
                            </div>

                            {/* Badges: Priority Tag, Linking state, dependencies count & due date */}
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              {/* Priority Tag Badge */}
                              <span
                                className={`text-[8px] font-mono font-black px-1.5 py-0.2 rounded uppercase border tracking-wider ${
                                  task.priority === 'critical'
                                    ? 'bg-red-500/30 text-red-100 border-red-400/80 ring-1 ring-red-400/50'
                                    : task.priority === 'high'
                                    ? 'bg-orange-500/30 text-orange-100 border-orange-400/80'
                                    : task.priority === 'medium'
                                    ? 'bg-indigo-500/30 text-indigo-100 border-indigo-400/80'
                                    : 'bg-emerald-500/30 text-emerald-100 border-emerald-400/80'
                                }`}
                                title={`Priority: ${task.priority.toUpperCase()}`}
                              >
                                {task.priority}
                              </span>

                              {isLinkingSource && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-black text-[9px] uppercase animate-pulse">
                                  Predecessor
                                </span>
                              )}

                              {hasDependencies && (
                                <span
                                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1"
                                  title={`${task.dependencies.length} predecessor dependencies required`}
                                >
                                  <Link2 className="w-2.5 h-2.5 text-cyan-400" />
                                  <span>{task.dependencies.length}</span>
                                </span>
                              )}

                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                  coords.daysUntilDue <= 2
                                    ? 'bg-red-950/80 text-red-200 border border-red-500/50'
                                    : coords.daysUntilDue <= 7
                                    ? 'bg-amber-950/80 text-amber-200 border border-amber-500/50'
                                    : 'bg-black/40 text-slate-200 border border-white/20'
                                }`}
                              >
                                {coords.daysUntilDue <= 0
                                  ? 'Due Today'
                                  : `${coords.daysUntilDue}d left`}
                              </span>
                            </div>
                          </div>

                          {/* Secondary info row */}
                          <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80">
                            <div className="flex items-center space-x-2 truncate">
                              <span className="bg-black/30 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase truncate">
                                {project?.name?.slice(0, 18) || 'Project'}
                              </span>
                              <span className="hidden sm:inline font-mono opacity-80">
                                {task.owner}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 font-mono text-[9px] flex-shrink-0">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-2.5 h-2.5 opacity-70" />
                                <span>{task.estimatedEffort}</span>
                                <span>&bull;</span>
                                <span className="font-bold">{coords.deadlineFormatted}</span>
                              </div>

                              {/* Quick link button on card edge */}
                              {!isLinkingMode && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLinkingMode(true);
                                    setLinkingSourceTaskId(task.id);
                                    voiceAgent.speak(`Selected ${task.objective.slice(0, 25)} as predecessor. Now click the successor task.`);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 px-1 rounded bg-black/60 hover:bg-cyan-600 text-slate-300 hover:text-white border border-white/20 transition cursor-pointer flex items-center space-x-0.5"
                                  title="Link another task to depend on this one"
                                >
                                  <Link2 className="w-2.5 h-2.5" />
                                  <span className="text-[8px] font-bold">Link</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Task Inspector Drawer / Quick Actions Modal */}
      {activeSelectedTask && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Task Inspector
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  ID: {activeSelectedTask.id}
                </span>
                {(activeSelectedTask.dependencies || []).length > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center space-x-1">
                    <Link2 className="w-3 h-3 text-indigo-400" />
                    <span>{activeSelectedTask.dependencies.length} Prerequisite Dependencies</span>
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white mt-1">{activeSelectedTask.objective}</h4>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Next Action:</span>
              <p className="text-slate-300 mt-0.5">{activeSelectedTask.nextAction || 'Continue sandbox implementation'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Specialist:</span>
              <p className="text-cyan-300 font-semibold mt-0.5">{activeSelectedTask.owner}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Deadline &amp; Effort:</span>
              <p className="text-slate-300 font-mono mt-0.5">
                {activeSelectedTask.deadline} ({activeSelectedTask.estimatedEffort})
              </p>
            </div>
          </div>

          {/* TASK DEPENDENCIES & PREDECESSORS MANAGER */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <h5 className="text-xs font-bold text-white tracking-wide">
                  Task Dependency &amp; Relationship Graph
                </h5>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLinkingMode(true);
                  setLinkingSourceTaskId(activeSelectedTask.id);
                  voiceAgent.speak(`Selected ${activeSelectedTask.objective.slice(0, 25)} as predecessor in Gantt chart. Click any successor task to link.`);
                  setNotification({
                    text: `Selected "${activeSelectedTask.objective.slice(0, 30)}" as predecessor. Click a task in the Gantt lanes to link.`,
                    type: 'info',
                  });
                }}
                className="px-2 py-1 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                title="Connect in Gantt chart by clicking another task"
              >
                <GitCommit className="w-3 h-3 text-cyan-400" />
                <span>Link in Gantt Chart</span>
              </button>
            </div>

            {/* List of Predecessors (Tasks this task depends on) */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>Prerequisites (Must complete before this task can start):</span>
                <span className="font-mono text-slate-500">{(activeSelectedTask.dependencies || []).length} linked</span>
              </span>

              {(activeSelectedTask.dependencies || []).length === 0 ? (
                <p className="text-[11px] text-slate-500 italic p-2 rounded-lg bg-slate-900/40 border border-dashed border-slate-800/80">
                  No prerequisite dependencies. This task can be executed immediately.
                </p>
              ) : (
                <div className="space-y-1">
                  {(activeSelectedTask.dependencies || []).map((depId) => {
                    const depTask = tasks.find((t) => t.id === depId);
                    if (!depTask) return null;

                    const predDue = depTask.deadline ? new Date(depTask.deadline).getTime() : 0;
                    const thisDue = activeSelectedTask.deadline ? new Date(activeSelectedTask.deadline).getTime() : 0;
                    const hasConflict = predDue > 0 && thisDue > 0 && predDue > thisDue;

                    return (
                      <div
                        key={depId}
                        className={`p-2 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs transition ${
                          hasConflict
                            ? 'bg-amber-950/20 border-amber-500/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate min-w-0 flex-1">
                          {depTask.currentState === 'completed' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          )}
                          <span className="font-medium text-slate-200 truncate">
                            {depTask.objective}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase bg-slate-800 text-slate-400 flex-shrink-0">
                            {depTask.priority}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 flex-shrink-0">
                            Due {depTask.deadline}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          {hasConflict && (
                            <span className="text-[9px] font-bold text-amber-400 flex items-center space-x-1 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/40">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Due after this task!</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              unlinkTaskDependency(activeSelectedTask.id, depId);
                              voiceAgent.speak(`Unlinked dependency.`);
                              setNotification({
                                text: `Unlinked: "${activeSelectedTask.objective.slice(0, 25)}" no longer requires "${depTask.objective.slice(0, 20)}"`,
                                type: 'info',
                              });
                            }}
                            className="p-1 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 text-[10px] font-bold transition flex items-center space-x-0.5 cursor-pointer"
                            title="Unlink this dependency"
                          >
                            <Unlink className="w-2.5 h-2.5" />
                            <span>Unlink</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* List of Downstream Successors (Tasks that depend on this task) */}
            {(() => {
              const successors = tasks.filter((t) => (t.dependencies || []).includes(activeSelectedTask.id));
              if (successors.length === 0) return null;
              return (
                <div className="space-y-1 pt-1.5 border-t border-slate-900">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Downstream Dependents (Tasks waiting on this task):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {successors.map((succ) => (
                      <button
                        key={succ.id}
                        type="button"
                        onClick={() => setSelectedTask(succ)}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-cyan-300 font-medium transition cursor-pointer flex items-center space-x-1"
                        title="Click to inspect this dependent task"
                      >
                        <ArrowRight className="w-2.5 h-2.5 text-cyan-500" />
                        <span className="truncate max-w-xs">{succ.objective.slice(0, 35)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Add Predecessor Dependency Selector */}
            <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Add Dependency:</span>
              <select
                value={selectedDepToAdd}
                onChange={(e) => setSelectedDepToAdd(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 flex-1 min-w-[200px] cursor-pointer"
              >
                <option value="">Select predecessor task...</option>
                {tasks
                  .filter(
                    (t) =>
                      t.id !== activeSelectedTask.id &&
                      !(activeSelectedTask.dependencies || []).includes(t.id)
                  )
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.priority.toUpperCase()}] {t.objective.slice(0, 50)} (Due: {t.deadline})
                    </option>
                  ))}
              </select>

              <button
                type="button"
                disabled={!selectedDepToAdd}
                onClick={() => {
                  if (!selectedDepToAdd) return;
                  linkTaskDependency(activeSelectedTask.id, selectedDepToAdd);
                  const pred = tasks.find((t) => t.id === selectedDepToAdd);
                  voiceAgent.speak(`Linked dependency. Task now requires ${pred?.objective.slice(0, 25)}.`);
                  setNotification({
                    text: `Linked! "${activeSelectedTask.objective.slice(0, 30)}" now depends on "${pred?.objective.slice(0, 25)}"`,
                    type: 'success',
                  });
                  setSelectedDepToAdd('');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                  selectedDepToAdd
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Link2 className="w-3 h-3" />
                <span>+ Add Dependency</span>
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-bold text-slate-400">Quick Set Priority:</span>
              {(['critical', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    updateTaskPriority(activeSelectedTask.id, p);
                    setSelectedTask({ ...activeSelectedTask, priority: p });
                    voiceAgent.speak(`Set task priority to ${p}.`);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    activeSelectedTask.priority === p
                      ? p === 'critical'
                        ? 'bg-red-500 text-white'
                        : p === 'high'
                        ? 'bg-orange-500 text-white'
                        : p === 'medium'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {activeSelectedTask.currentState !== 'completed' && (
                <button
                  type="button"
                  onClick={() => {
                    updateTaskState(activeSelectedTask.id, 'completed');
                    setSelectedTask({ ...activeSelectedTask, currentState: 'completed' });
                    voiceAgent.speak(`Task marked completed with Level 5 verification.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 transition cursor-pointer shadow-sm shadow-emerald-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              )}

              {onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('orchestrator')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1 transition cursor-pointer"
                >
                  <span>Inspect in Orchestrator &rarr;</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
