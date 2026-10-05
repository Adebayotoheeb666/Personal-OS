import React, { useState, useMemo } from 'react';
import {
  Plus,
  Zap,
  CheckSquare,
  X,
  Calendar,
  User,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { ProjectTask, UrgencyLevel } from '../types/agent';
import { voiceAgent } from '../services/voiceAgentService';

interface QuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const QuickTaskModal: React.FC<QuickTaskModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const { worldModel, createTask, runAutonomousLoop } = useAgent();
  const [naturalInput, setNaturalInput] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTaskObj, setScheduledTaskObj] = useState<ProjectTask | null>(null);

  // Natural Language Task Parser
  const parsedTask = useMemo(() => {
    const text = naturalInput.trim();
    if (!text) {
      return {
        objective: '',
        projectId: worldModel.projects[0]?.id || '',
        projectName: worldModel.projects[0]?.name || 'Primary Project',
        priority: 'medium' as ProjectTask['priority'],
        urgency: 'Medium' as UrgencyLevel,
        owner: 'Coding Agent',
        deadline: new Date(Date.now() + 5 * 86400 * 1000).toISOString().split('T')[0],
        estimatedEffort: '3 hours',
      };
    }

    const lower = text.toLowerCase();

    // 1. Detect Priority & Urgency
    let priority: ProjectTask['priority'] = 'medium';
    let urgency: UrgencyLevel = 'Medium';

    if (lower.includes('critical') || lower.includes('blocker') || lower.includes('p0')) {
      priority = 'critical';
      urgency = 'High';
    } else if (lower.includes('high') || lower.includes('urgent') || lower.includes('asap') || lower.includes('p1')) {
      priority = 'high';
      urgency = 'High';
    } else if (lower.includes('low') || lower.includes('minor') || lower.includes('nice to have') || lower.includes('p3')) {
      priority = 'low';
      urgency = 'Low';
    }

    // 2. Detect Project
    let matchedProject = worldModel.projects[0];
    for (const proj of worldModel.projects) {
      const pNameLower = proj.name.toLowerCase();
      const pWords = pNameLower.split(' ');
      if (lower.includes(pNameLower) || pWords.some((w) => w.length > 3 && lower.includes(w))) {
        matchedProject = proj;
        break;
      }
    }

    // 3. Detect Owner Specialist Agent
    let owner = 'Coding Agent';
    if (lower.includes('sales') || lower.includes('lead') || lower.includes('outbound') || lower.includes('prospect')) {
      owner = 'Sales Agent';
    } else if (lower.includes('design') || lower.includes('ux') || lower.includes('ui') || lower.includes('screen')) {
      owner = 'Product & UX Agent';
    } else if (lower.includes('architecture') || lower.includes('schema') || lower.includes('api spec') || lower.includes('database')) {
      owner = 'Architecture Agent';
    } else if (lower.includes('security') || lower.includes('audit') || lower.includes('review') || lower.includes('vulnerability')) {
      owner = 'Review Agent';
    } else if (lower.includes('research') || lower.includes('paper') || lower.includes('benchmark')) {
      owner = 'Research Agent';
    } else if (lower.includes('doc') || lower.includes('adr') || lower.includes('specs')) {
      owner = 'Documentation Agent';
    }

    // 4. Detect Deadline
    let deadlineOffsetDays = 5;
    if (lower.includes('today') || lower.includes('asap')) {
      deadlineOffsetDays = 0;
    } else if (lower.includes('tomorrow')) {
      deadlineOffsetDays = 1;
    } else if (lower.includes('friday') || lower.includes('by end of week')) {
      deadlineOffsetDays = 4;
    } else if (lower.includes('next week')) {
      deadlineOffsetDays = 7;
    }

    const calculatedDeadline = new Date(Date.now() + deadlineOffsetDays * 86400 * 1000)
      .toISOString()
      .split('T')[0];

    // 5. Clean Objective
    let cleanedObjective = text;
    // Capitalize first letter
    cleanedObjective = cleanedObjective.charAt(0).toUpperCase() + cleanedObjective.slice(1);

    return {
      objective: cleanedObjective,
      projectId: matchedProject?.id || 'proj-general',
      projectName: matchedProject?.name || 'General Project',
      priority,
      urgency,
      owner,
      deadline: calculatedDeadline,
      estimatedEffort: priority === 'critical' ? '1.5 hours' : priority === 'high' ? '3 hours' : '4 hours',
    };
  }, [naturalInput, worldModel.projects]);

  const handleScheduleTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;

    const taskToSchedule: Omit<ProjectTask, 'id'> = {
      objective: parsedTask.objective,
      projectId: parsedTask.projectId,
      priority: parsedTask.priority,
      urgency: parsedTask.urgency,
      deadline: parsedTask.deadline,
      estimatedEffort: parsedTask.estimatedEffort,
      dependencies: [],
      currentState: parsedTask.priority === 'critical' ? 'in_progress' : 'backlog',
      nextAction: `Initialize ${parsedTask.owner} verification environment`,
      requiredResources: ['TypeScript AST runtime', 'Isolated WASM sandbox'],
      owner: parsedTask.owner,
      approvalRequirement: parsedTask.priority === 'critical',
      colorCode:
        parsedTask.priority === 'critical'
          ? 'red'
          : parsedTask.priority === 'high'
          ? 'orange'
          : parsedTask.priority === 'low'
          ? 'emerald'
          : 'indigo',
    };

    createTask(taskToSchedule);
    setScheduledTaskObj({ ...taskToSchedule, id: `task-${Date.now()}` });
    setIsScheduled(true);

    // Audio & voice confirmation with emotion modulation by Max
    voiceAgent.analyzeSentimentAndSetEmotion(naturalInput, 'user');
    voiceAgent.setEmotion(
      parsedTask.priority === 'critical' ? 'alert' : 'triumphant',
      `Scheduled ${parsedTask.priority} urgency task: "${parsedTask.objective}".`
    );
    const confirmationSpeech = `Max has scheduled task: "${parsedTask.objective}" under ${parsedTask.projectName} with ${parsedTask.priority} priority assigned to ${parsedTask.owner}.`;
    voiceAgent.speak(confirmationSpeech);
  };

  const handleResetAndClose = () => {
    setNaturalInput('');
    setIsScheduled(false);
    setScheduledTaskObj(null);
    onClose();
  };

  const handleViewInTaskEngine = () => {
    handleResetAndClose();
    if (onNavigateToTab) {
      onNavigateToTab('task-engine');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-[#070e24] border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] p-4 sm:p-6 select-none animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/30">
              <Zap className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Quick Task &bull; Natural Language Scheduler
                </h3>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Task Engine Pipe
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Type natural language instructions. Max will parse, attribute, and schedule them into Task Engine.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scheduled Success State */}
        {isScheduled ? (
          <div className="space-y-4 py-2 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start space-x-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  Task Successfully Scheduled in Task Engine!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Max has synchronized your task to persistent memory with Level 5 safeguards.
                </p>
                <div className="mt-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                  <p className="text-white font-semibold">"{scheduledTaskObj?.objective}"</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                    <span className="text-cyan-300">Project: {parsedTask.projectName}</span>
                    <span>&bull;</span>
                    <span className="text-indigo-300">Owner: {scheduledTaskObj?.owner}</span>
                    <span>&bull;</span>
                    <span className="uppercase font-bold text-amber-300">Priority: {scheduledTaskObj?.priority}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsScheduled(false);
                  setNaturalInput('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition"
              >
                Schedule Another Task
              </button>

              <button
                type="button"
                onClick={handleViewInTaskEngine}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                <span>View in Task Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Natural Language Form */
          <form onSubmit={handleScheduleTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Natural Language Task Prompt:</span>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold lowercase">
                  auto-parsing intent, deadline &amp; priority
                </span>
              </label>

              <textarea
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                placeholder="e.g., 'Refactor state hydration cache by tomorrow with high priority for AetherOS' or 'Audit Stripe webhook retry failure by Friday with critical urgency'..."
                rows={3}
                autoFocus
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition resize-none font-sans"
              />
            </div>

            {/* Quick Inspiration Templates */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 self-center mr-1">
                Examples:
              </span>
              <button
                type="button"
                onClick={() =>
                  setNaturalInput('Refactor memory hydration cache by tomorrow with critical priority')
                }
                className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-cyan-300 cursor-pointer transition"
              >
                "Refactor cache by tomorrow (Critical)"
              </button>
              <button
                type="button"
                onClick={() =>
                  setNaturalInput('Enrich 30 high-priority sales leads for Series-A EdTech outbound')
                }
                className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-indigo-300 cursor-pointer transition"
              >
                "Sales leads enrichment (High)"
              </button>
              <button
                type="button"
                onClick={() =>
                  setNaturalInput('Audit AST invariance and sandbox security boundaries for EduCore')
                }
                className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-emerald-300 cursor-pointer transition"
              >
                "Audit security boundaries"
              </button>
            </div>

            {/* Live Parsing Preview Card */}
            {naturalInput.trim() && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-800/80 pb-1.5">
                  <span className="text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Max Live Interpretation Preview</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase font-mono text-[9px]">
                    Ready to Pipe
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {/* Assigned Project */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Project:</span>
                    <span className="font-semibold text-white truncate block">
                      {parsedTask.projectName}
                    </span>
                  </div>

                  {/* Priority & Urgency */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Priority / Urgency:</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                          parsedTask.priority === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : parsedTask.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}
                      >
                        {parsedTask.priority}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">({parsedTask.urgency})</span>
                    </div>
                  </div>

                  {/* Owner Specialist */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Assigned Owner:</span>
                    <span className="font-semibold text-indigo-300 truncate block">
                      {parsedTask.owner}
                    </span>
                  </div>

                  {/* Deadline & Effort */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Target Deadline:</span>
                    <span className="font-semibold text-emerald-300 font-mono text-[10px] block">
                      {parsedTask.deadline} &bull; {parsedTask.estimatedEffort}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!naturalInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-cyan-600/30 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-200" />
                <span>Schedule Into Task Engine</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
