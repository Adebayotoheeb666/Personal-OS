import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Filter,
  User,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { ProjectTask } from '../types/agent';

export const TaskEngineView: React.FC = () => {
  const { worldModel, updateTaskState, createTask } = useAgent();

  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

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

  const allTasks = worldModel.projects.flatMap((p) => p.tasks);

  const filteredTasks = allTasks.filter((task) => {
    if (filterProject !== 'all' && task.projectId !== filterProject) return false;
    if (filterState !== 'all' && task.currentState !== filterState) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim() || !projectId) return;

    createTask({
      objective,
      projectId,
      priority,
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span>Task &amp; Execution Engine (12-Attribute Schema)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Systematic Task Reasoning &amp; Gated Execution
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tasks with explicit dependencies, required resources, completion evidence, and approval gates.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Structured Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-400">Filter By:</span>
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
          Showing <span className="text-white font-bold">{filteredTasks.length}</span> reasoning tasks
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => {
          const project = worldModel.projects.find((p) => p.id === task.projectId);
          return (
            <div
              key={task.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition ${
                task.currentState === 'awaiting_approval'
                  ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30'
                  : task.currentState === 'completed'
                  ? 'bg-slate-900/60 border-slate-800/60 opacity-80'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row: Project tag, priority, status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {project?.name || 'General'}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        task.priority === 'critical'
                          ? 'bg-red-500/20 text-red-400'
                          : task.priority === 'high'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

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

                {/* Objective */}
                <h3 className="font-bold text-white text-sm sm:text-base">{task.objective}</h3>

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
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
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
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="appr" className="text-xs text-slate-300">
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
