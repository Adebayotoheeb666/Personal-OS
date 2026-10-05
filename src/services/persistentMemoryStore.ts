/**
 * PersistentMemoryStore - Mock PostgreSQL relational service layer for Phase 1
 * Simulates a PostgreSQL durable relational store with table schemas, primary keys,
 * foreign key constraints, relational indexing, and full-text search.
 * 
 * Schemas:
 * - pg_projects: (id VARCHAR PRIMARY KEY, name VARCHAR, category VARCHAR, progress INT, health VARCHAR, deadline TIMESTAMP WITH TIME ZONE, vision TEXT, problem TEXT, ...)
 * - pg_tasks: (id VARCHAR PRIMARY KEY, objective TEXT, project_id VARCHAR REFERENCES pg_projects(id), priority VARCHAR, urgency VARCHAR, deadline VARCHAR, current_state VARCHAR, ...)
 * - pg_goals: (id VARCHAR PRIMARY KEY, title VARCHAR, category VARCHAR, status VARCHAR, target_date DATE, progress_percentage INT, ...)
 * - pg_decisions: (id VARCHAR PRIMARY KEY, project_id VARCHAR, title VARCHAR, rationale TEXT, status VARCHAR, ...)
 */

import { ProjectModel, ProjectTask, Goal, DecisionRecord, UrgencyLevel } from '../types/agent';
import { INITIAL_WORLD_MODEL, DUE_SOON_PROJECT_DEADLINE, MID_TERM_PROJECT_DEADLINE } from '../data/initialWorldModel';

export interface SqlQueryLog {
  query: string;
  params?: any[];
  executionTimeMs: number;
  rowCount: number;
  timestamp: string;
}

export interface MemoryDatabaseStats {
  projectsCount: number;
  tasksCount: number;
  goalsCount: number;
  decisionsCount: number;
  lastSync: string;
  storageSizeBytes: number;
}

export interface SearchResultItem {
  type: 'project' | 'task' | 'goal' | 'decision';
  id: string;
  title: string;
  snippet: string;
  matchedField: string;
  projectId?: string;
  projectName?: string;
  priority?: string;
  status?: string;
}

const STORAGE_PREFIX = 'aetheros_pg_';
const TABLES = {
  PROJECTS: `${STORAGE_PREFIX}projects`,
  TASKS: `${STORAGE_PREFIX}tasks`,
  GOALS: `${STORAGE_PREFIX}goals`,
  DECISIONS: `${STORAGE_PREFIX}decisions`,
  QUERY_LOGS: `${STORAGE_PREFIX}query_logs`,
};

class PersistentMemoryStore {
  private queryLogs: SqlQueryLog[] = [];

  constructor() {
    this.ensureInitialized();
  }

  private logQuery(query: string, params: any[] | undefined, rowCount: number, durationMs: number) {
    const log: SqlQueryLog = {
      query,
      params,
      executionTimeMs: Math.max(1, Math.round(durationMs)),
      rowCount,
      timestamp: new Date().toISOString(),
    };
    this.queryLogs.unshift(log);
    if (this.queryLogs.length > 50) this.queryLogs.pop();
  }

  private ensureInitialized() {
    const projectsRaw = localStorage.getItem(TABLES.PROJECTS);
    if (!projectsRaw) {
      this.seedDatabase();
    }
  }

  public seedDatabase() {
    const start = performance.now();
    const projects = INITIAL_WORLD_MODEL.projects;
    const tasks = projects.flatMap((p) => p.tasks);
    const goals = INITIAL_WORLD_MODEL.goals;
    const decisions = projects.flatMap((p) => p.decisions);

    localStorage.setItem(TABLES.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(TABLES.TASKS, JSON.stringify(tasks));
    localStorage.setItem(TABLES.GOALS, JSON.stringify(goals));
    localStorage.setItem(TABLES.DECISIONS, JSON.stringify(decisions));

    this.logQuery(
      'INSERT INTO pg_projects, pg_tasks, pg_goals, pg_decisions VALUES (...) [SEED]',
      undefined,
      projects.length + tasks.length + goals.length,
      performance.now() - start
    );
  }

  // --- Project State Operations (Vision, Problem, Tasks, etc.) ---

  public getProjects(): ProjectModel[] {
    const start = performance.now();
    try {
      const data = localStorage.getItem(TABLES.PROJECTS);
      const projects: ProjectModel[] = data ? JSON.parse(data) : [];
      // Re-hydrate tasks from tasks table to guarantee relational integrity
      const tasks = this.getTasks();
      const hydrated = projects.map((p) => {
        // Guarantee valid ISO deadline for schema compliance
        const fallbackDeadline =
          p.id === 'proj-sales-agent'
            ? DUE_SOON_PROJECT_DEADLINE
            : p.deadline || MID_TERM_PROJECT_DEADLINE;

        return {
          ...p,
          deadline: p.deadline || fallbackDeadline,
          tasks: tasks.filter((t) => t.projectId === p.id),
        };
      });
      this.logQuery('SELECT * FROM pg_projects ORDER BY progress DESC;', [], hydrated.length, performance.now() - start);
      return hydrated;
    } catch (e) {
      console.error('[PersistentMemoryStore] Error reading projects:', e);
      return INITIAL_WORLD_MODEL.projects;
    }
  }

  public getProjectById(id: string): ProjectModel | null {
    const start = performance.now();
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === id) || null;
    this.logQuery('SELECT * FROM pg_projects WHERE id = $1 LIMIT 1;', [id], project ? 1 : 0, performance.now() - start);
    return project;
  }

  public upsertProject(project: ProjectModel): void {
    const start = performance.now();
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    if (index >= 0) {
      projects[index] = project;
      this.logQuery(
        'UPDATE pg_projects SET vision = $1, problem = $2, current_state = $3, deadline = $4 WHERE id = $5;',
        [project.vision, project.problem, project.currentState, project.deadline, project.id],
        1,
        performance.now() - start
      );
    } else {
      projects.unshift(project);
      this.logQuery(
        'INSERT INTO pg_projects (id, name, vision, problem, deadline, ...) VALUES ($1, $2, $3, $4, $5, ...);',
        [project.id, project.name, project.vision, project.problem, project.deadline],
        1,
        performance.now() - start
      );
    }

    localStorage.setItem(TABLES.PROJECTS, JSON.stringify(projects));
  }

  // --- Task Operations ---

  public getTasks(projectId?: string): ProjectTask[] {
    const start = performance.now();
    try {
      const data = localStorage.getItem(TABLES.TASKS);
      const allTasks: ProjectTask[] = data ? JSON.parse(data) : [];
      // Guarantee urgency and state integrity
      const enrichedTasks = allTasks.map((t) => ({
        ...t,
        urgency:
          t.urgency ||
          (t.priority === 'critical' || t.priority === 'high'
            ? 'High'
            : t.priority === 'medium'
            ? 'Medium'
            : 'Low'),
      }));
      const filtered = projectId ? enrichedTasks.filter((t) => t.projectId === projectId) : enrichedTasks;
      this.logQuery(
        projectId ? 'SELECT * FROM pg_tasks WHERE project_id = $1;' : 'SELECT * FROM pg_tasks;',
        projectId ? [projectId] : [],
        filtered.length,
        performance.now() - start
      );
      return filtered;
    } catch {
      return [];
    }
  }

  public upsertTask(task: ProjectTask): void {
    const start = performance.now();
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === task.id);

    const validatedTask: ProjectTask = {
      ...task,
      urgency:
        task.urgency ||
        (task.priority === 'critical' || task.priority === 'high' ? 'High' : 'Medium'),
    };

    if (index >= 0) {
      tasks[index] = validatedTask;
      this.logQuery(
        'UPDATE pg_tasks SET current_state = $1, next_action = $2, priority = $3, urgency = $4 WHERE id = $5;',
        [validatedTask.currentState, validatedTask.nextAction, validatedTask.priority, validatedTask.urgency, validatedTask.id],
        1,
        performance.now() - start
      );
    } else {
      tasks.unshift(validatedTask);
      this.logQuery(
        'INSERT INTO pg_tasks (id, objective, project_id, priority, urgency, ...) VALUES ($1, $2, $3, $4, $5, ...);',
        [validatedTask.id, validatedTask.objective, validatedTask.projectId, validatedTask.priority, validatedTask.urgency],
        1,
        performance.now() - start
      );
    }

    localStorage.setItem(TABLES.TASKS, JSON.stringify(tasks));
  }

  /**
   * Handles task state transitions (e.g., Pending (backlog/awaiting_approval) -> In Progress -> Completed)
   * and recalculates project progress metrics atomically.
   */
  public transitionTaskState(taskId: string, targetState?: ProjectTask['currentState']): ProjectTask | null {
    const start = performance.now();
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    let nextState: ProjectTask['currentState'];
    if (targetState) {
      nextState = targetState;
    } else {
      // Natural cycle: Pending (backlog/awaiting_approval) -> In Progress -> Completed -> Pending
      switch (task.currentState) {
        case 'backlog':
        case 'awaiting_approval':
          nextState = 'in_progress';
          break;
        case 'in_progress':
          nextState = 'completed';
          break;
        case 'completed':
          nextState = 'in_progress';
          break;
        case 'blocked':
          nextState = 'in_progress';
          break;
        default:
          nextState = 'completed';
      }
    }

    task.currentState = nextState;
    this.upsertTask(task);

    // Update parent project progress in database
    const project = this.getProjectById(task.projectId);
    if (project) {
      const projTasks = this.getTasks(task.projectId);
      const completedCount = projTasks.filter((t) => t.currentState === 'completed').length;
      project.progress = Math.round((completedCount / (projTasks.length || 1)) * 100);
      this.upsertProject(project);
    }

    this.logQuery(
      'UPDATE pg_tasks SET current_state = $1 WHERE id = $2; -- TRANSITION',
      [nextState, taskId],
      1,
      performance.now() - start
    );

    return task;
  }

  /**
   * Toggles task completion state directly (Pending/In Progress <-> Completed)
   */
  public toggleTaskCompletion(taskId: string): ProjectTask | null {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const targetState: ProjectTask['currentState'] =
      task.currentState === 'completed' ? 'in_progress' : 'completed';
    return this.transitionTaskState(taskId, targetState);
  }

  /**
   * Updates urgency level for a task (High, Medium, Low)
   */
  public updateTaskUrgency(taskId: string, urgency: UrgencyLevel): ProjectTask | null {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.urgency = urgency;
    this.upsertTask(task);
    return task;
  }

  /**
   * Updates priority for a task (low, medium, high, critical)
   */
  public updateTaskPriority(taskId: string, priority: ProjectTask['priority']): ProjectTask | null {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.priority = priority;
    if (priority === 'critical' || priority === 'high') {
      task.urgency = 'High';
    } else if (priority === 'medium') {
      task.urgency = task.urgency || 'Medium';
    }
    this.upsertTask(task);
    return task;
  }

  /**
   * Updates visual color code for a task
   */
  public updateTaskColorCode(taskId: string, colorCode: string): ProjectTask | null {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.colorCode = colorCode;
    this.upsertTask(task);
    return task;
  }

  /**
   * Updates dependencies for a task (array of predecessor task IDs)
   */
  public updateTaskDependencies(taskId: string, dependencies: string[]): ProjectTask | null {
    const start = performance.now();
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    // Filter out self-dependencies
    task.dependencies = Array.from(new Set(dependencies.filter((d) => d && d !== taskId)));
    this.upsertTask(task);
    this.logQuery('UPDATE pg_tasks SET dependencies = $1 WHERE id = $2;', [task.dependencies, taskId], 1, performance.now() - start);
    return task;
  }

  /**
   * Links a predecessor task dependency to a target task
   */
  public linkTaskDependency(taskId: string, dependsOnTaskId: string): ProjectTask | null {
    if (taskId === dependsOnTaskId) return null;
    const task = this.getTasks().find((t) => t.id === taskId);
    if (!task) return null;

    const currentDeps = task.dependencies || [];
    if (!currentDeps.includes(dependsOnTaskId)) {
      return this.updateTaskDependencies(taskId, [...currentDeps, dependsOnTaskId]);
    }
    return task;
  }

  /**
   * Unlinks a predecessor task dependency from a target task
   */
  public unlinkTaskDependency(taskId: string, dependsOnTaskId: string): ProjectTask | null {
    const task = this.getTasks().find((t) => t.id === taskId);
    if (!task) return null;

    const currentDeps = task.dependencies || [];
    return this.updateTaskDependencies(
      taskId,
      currentDeps.filter((d) => d !== dependsOnTaskId)
    );
  }

  public deleteTask(taskId: string): void {
    const start = performance.now();
    const tasks = this.getTasks().filter((t) => t.id !== taskId);
    localStorage.setItem(TABLES.TASKS, JSON.stringify(tasks));
    this.logQuery('DELETE FROM pg_tasks WHERE id = $1;', [taskId], 1, performance.now() - start);
  }

  // --- Goal Operations ---

  public getGoals(): Goal[] {
    const start = performance.now();
    try {
      const data = localStorage.getItem(TABLES.GOALS);
      const goals: Goal[] = data ? JSON.parse(data) : [];
      this.logQuery('SELECT * FROM pg_goals ORDER BY target_date ASC;', [], goals.length, performance.now() - start);
      return goals;
    } catch {
      return INITIAL_WORLD_MODEL.goals;
    }
  }

  public upsertGoal(goal: Goal): void {
    const start = performance.now();
    const goals = this.getGoals();
    const index = goals.findIndex((g) => g.id === goal.id);

    if (index >= 0) {
      goals[index] = goal;
      this.logQuery('UPDATE pg_goals SET progress = $1 WHERE id = $2;', [goal.progressPercentage, goal.id], 1, performance.now() - start);
    } else {
      goals.unshift(goal);
      this.logQuery('INSERT INTO pg_goals (id, title, target_date) VALUES ($1, $2, $3);', [goal.id, goal.title, goal.targetDate], 1, performance.now() - start);
    }

    localStorage.setItem(TABLES.GOALS, JSON.stringify(goals));
  }

  // --- Full-Text Search across Projects, Vision, Problem, Tasks, & Goals ---

  public searchEntities(query: string): SearchResultItem[] {
    const start = performance.now();
    const clean = query.trim().toLowerCase();
    if (!clean) return [];

    const results: SearchResultItem[] = [];
    const projects = this.getProjects();
    const tasks = this.getTasks();
    const goals = this.getGoals();

    // 1. Search in Projects (Name, Vision, Problem, Architecture, Next Actions)
    for (const p of projects) {
      if (p.name.toLowerCase().includes(clean)) {
        results.push({
          type: 'project',
          id: p.id,
          title: p.name,
          snippet: p.vision,
          matchedField: 'Project Name',
          status: `${p.progress}% Complete`,
        });
      } else if (p.vision.toLowerCase().includes(clean)) {
        results.push({
          type: 'project',
          id: p.id,
          title: p.name,
          snippet: `Vision: ${p.vision}`,
          matchedField: 'Vision',
          status: `${p.progress}% Complete`,
        });
      } else if (p.problem.toLowerCase().includes(clean)) {
        results.push({
          type: 'project',
          id: p.id,
          title: p.name,
          snippet: `Problem: ${p.problem}`,
          matchedField: 'Problem Statement',
          status: `${p.progress}% Complete`,
        });
      } else if (p.architecture.toLowerCase().includes(clean)) {
        results.push({
          type: 'project',
          id: p.id,
          title: p.name,
          snippet: `Architecture: ${p.architecture}`,
          matchedField: 'Architecture',
          status: `${p.progress}% Complete`,
        });
      }
    }

    // 2. Search in Tasks (Objective, Next Action, Completion Evidence, Owner)
    for (const t of tasks) {
      const proj = projects.find((p) => p.id === t.projectId);
      if (t.objective.toLowerCase().includes(clean)) {
        results.push({
          type: 'task',
          id: t.id,
          title: t.objective,
          snippet: `Next: ${t.nextAction} (Owner: ${t.owner})`,
          matchedField: 'Task Objective',
          projectId: t.projectId,
          projectName: proj?.name || 'Project',
          priority: t.priority,
          status: t.currentState,
        });
      } else if (t.nextAction.toLowerCase().includes(clean)) {
        results.push({
          type: 'task',
          id: t.id,
          title: t.objective,
          snippet: `Next Action: ${t.nextAction}`,
          matchedField: 'Next Action',
          projectId: t.projectId,
          projectName: proj?.name || 'Project',
          priority: t.priority,
          status: t.currentState,
        });
      } else if (t.owner.toLowerCase().includes(clean)) {
        results.push({
          type: 'task',
          id: t.id,
          title: t.objective,
          snippet: `Assigned to: ${t.owner}`,
          matchedField: 'Owner',
          projectId: t.projectId,
          projectName: proj?.name || 'Project',
          priority: t.priority,
          status: t.currentState,
        });
      }
    }

    // 3. Search in Goals
    for (const g of goals) {
      if (g.title.toLowerCase().includes(clean) || g.metrics.toLowerCase().includes(clean)) {
        results.push({
          type: 'goal',
          id: g.id,
          title: g.title,
          snippet: `Metrics: ${g.metrics} (${g.targetDate})`,
          matchedField: 'Goal Metric',
          status: `${g.progressPercentage}%`,
        });
      }
    }

    this.logQuery(
      `SELECT * FROM pg_search_entities WHERE text ILIKE '%${clean}%';`,
      [clean],
      results.length,
      performance.now() - start
    );

    return results;
  }

  // --- Database Telemetry & Stats ---

  public getDatabaseStats(): MemoryDatabaseStats {
    const projects = this.getProjects();
    const tasks = this.getTasks();
    const goals = this.getGoals();
    const decisions = INITIAL_WORLD_MODEL.decisions;

    let storageSizeBytes = 0;
    try {
      storageSizeBytes =
        (localStorage.getItem(TABLES.PROJECTS)?.length || 0) +
        (localStorage.getItem(TABLES.TASKS)?.length || 0) +
        (localStorage.getItem(TABLES.GOALS)?.length || 0);
    } catch {
      storageSizeBytes = 12400;
    }

    return {
      projectsCount: projects.length,
      tasksCount: tasks.length,
      goalsCount: goals.length,
      decisionsCount: decisions.length,
      lastSync: new Date().toISOString(),
      storageSizeBytes,
    };
  }

  public getQueryLogs(): SqlQueryLog[] {
    return [...this.queryLogs];
  }

  public resetToDefault() {
    localStorage.removeItem(TABLES.PROJECTS);
    localStorage.removeItem(TABLES.TASKS);
    localStorage.removeItem(TABLES.GOALS);
    localStorage.removeItem(TABLES.DECISIONS);
    this.seedDatabase();
  }
}

export const persistentMemoryStore = new PersistentMemoryStore();
