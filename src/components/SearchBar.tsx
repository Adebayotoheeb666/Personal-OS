import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Layers,
  CheckSquare,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { ProjectModel, ProjectTask } from '../types/agent';

export interface SearchBarMatch {
  type: 'project' | 'task';
  id: string;
  title: string;
  subtitle: string;
  matchedField: string;
  projectId?: string;
  projectName?: string;
  priority?: string;
  progressOrState?: string;
}

interface SearchBarProps {
  projects: ProjectModel[];
  tasks: ProjectTask[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: 'all' | 'projects' | 'tasks' | 'urgent';
  onFilterChange: (filter: 'all' | 'projects' | 'tasks' | 'urgent') => void;
  onSelectProject: (projectId: string) => void;
  onSelectTask?: (task: ProjectTask) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  projects,
  tasks,
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  onSelectProject,
  onSelectTask,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Compute matches across projects and tasks
  const matches = useMemo<SearchBarMatch[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: SearchBarMatch[] = [];

    // Search Projects
    if (selectedFilter === 'all' || selectedFilter === 'projects') {
      projects.forEach((p) => {
        if (p.name.toLowerCase().includes(q)) {
          results.push({
            type: 'project',
            id: p.id,
            title: p.name,
            subtitle: p.vision,
            matchedField: 'Project Name',
            progressOrState: `${p.progress}%`,
          });
        } else if (p.vision.toLowerCase().includes(q)) {
          results.push({
            type: 'project',
            id: p.id,
            title: p.name,
            subtitle: p.vision,
            matchedField: 'Vision',
            progressOrState: `${p.progress}%`,
          });
        } else if (p.problem.toLowerCase().includes(q)) {
          results.push({
            type: 'project',
            id: p.id,
            title: p.name,
            subtitle: p.problem,
            matchedField: 'Problem Statement',
            progressOrState: `${p.progress}%`,
          });
        } else if (p.architecture.toLowerCase().includes(q)) {
          results.push({
            type: 'project',
            id: p.id,
            title: p.name,
            subtitle: p.architecture,
            matchedField: 'Architecture',
            progressOrState: `${p.progress}%`,
          });
        }
      });
    }

    // Search Tasks
    if (selectedFilter === 'all' || selectedFilter === 'tasks' || selectedFilter === 'urgent') {
      tasks.forEach((t) => {
        if (selectedFilter === 'urgent' && t.priority !== 'critical' && t.priority !== 'high') {
          return;
        }

        const proj = projects.find((p) => p.id === t.projectId);

        if (t.objective.toLowerCase().includes(q)) {
          results.push({
            type: 'task',
            id: t.id,
            title: t.objective,
            subtitle: `Next: ${t.nextAction} (Owner: ${t.owner})`,
            matchedField: 'Task Objective',
            projectId: t.projectId,
            projectName: proj?.name || 'Project',
            priority: t.priority,
            progressOrState: t.currentState,
          });
        } else if (t.nextAction.toLowerCase().includes(q)) {
          results.push({
            type: 'task',
            id: t.id,
            title: t.objective,
            subtitle: `Next Action: ${t.nextAction}`,
            matchedField: 'Next Action',
            projectId: t.projectId,
            projectName: proj?.name || 'Project',
            priority: t.priority,
            progressOrState: t.currentState,
          });
        } else if (t.owner.toLowerCase().includes(q)) {
          results.push({
            type: 'task',
            id: t.id,
            title: t.objective,
            subtitle: `Assigned to: ${t.owner}`,
            matchedField: 'Owner',
            projectId: t.projectId,
            projectName: proj?.name || 'Project',
            priority: t.priority,
            progressOrState: t.currentState,
          });
        }
      });
    }

    return results;
  }, [projects, tasks, searchQuery, selectedFilter]);

  return (
    <div className="relative space-y-3">
      {/* Input Row & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by Vision/Problem, or tasks by Objective/Owner..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('projects')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
              selectedFilter === 'projects'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Projects ({projects.filter((p) => p.category === 'active').length})</span>
          </button>
          <button
            onClick={() => onFilterChange('tasks')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1 ${
              selectedFilter === 'tasks'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>Tasks ({tasks.filter((t) => t.currentState !== 'completed').length})</span>
          </button>
          <button
            onClick={() => onFilterChange('urgent')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              selectedFilter === 'urgent'
                ? 'bg-red-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Urgent ({tasks.filter((t) => t.priority === 'critical' || t.priority === 'high').length})
          </button>
        </div>
      </div>

      {/* Live Match Results Panel */}
      {searchQuery.trim() && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Found <strong className="text-white font-bold">{matches.length}</strong> matching entities for "{searchQuery}"
            </span>
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {matches.length === 0 ? (
            <div className="p-5 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800/80">
              No entities matched "{searchQuery}". Try searching for terms like "WASM", "AST", "Outbound", or "Lead".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {matches.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    if (item.type === 'project') onSelectProject(item.id);
                    if (item.type === 'task' && item.projectId) onSelectProject(item.projectId);
                  }}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-900 transition cursor-pointer flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span
                        className={`font-bold uppercase px-2 py-0.5 rounded ${
                          item.type === 'project'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-slate-400 font-medium">Matched: {item.matchedField}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.subtitle}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">
                      {item.projectName || item.progressOrState}
                    </span>
                    <span className="text-indigo-400 font-semibold flex items-center gap-1 hover:underline">
                      Focus Project <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
