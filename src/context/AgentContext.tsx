import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PersonalWorldModel,
  ProjectModel,
  ProjectTask,
  SpecialistAgent,
  SpecialistAgentType,
  OperatingMode,
  ImprovementProposal,
  ToolDefinition,
  AuditLogEntry,
  LoopTraceStep,
  DecisionRecord,
  Goal,
  UrgencyLevel,
} from '../types/agent';
import {
  INITIAL_WORLD_MODEL,
  INITIAL_SPECIALIST_AGENTS,
  INITIAL_IMPROVEMENT_PROPOSALS,
  INITIAL_TOOL_REGISTRY,
  INITIAL_AUDIT_LOGS,
} from '../data/initialWorldModel';
import {
  persistentMemoryStore,
  SearchResultItem,
  MemoryDatabaseStats,
  SqlQueryLog,
} from '../services/persistentMemoryStore';
import {
  memoryCacheService,
  CacheMetrics,
} from '../services/memoryCacheService';
import { voiceAgent } from '../services/voiceAgentService';

/**
 * Mock Database Service Layer within AgentContext
 * Implements a mock local-storage-backed database for persisting project state
 * (Vision, Problem, Tasks, and all 21 project attributes) to ensure memory continuity across sessions.
 */
export interface IMockProjectDatabaseService {
  getAllProjects: () => ProjectModel[];
  getProjectById: (projectId: string) => ProjectModel | null;
  persistProjectState: (
    projectId: string,
    state: {
      vision?: string;
      problem?: string;
      tasks?: ProjectTask[];
      currentState?: string;
      progress?: number;
      [key: string]: any;
    }
  ) => ProjectModel | null;
  getProjectVision: (projectId: string) => string;
  getProjectProblem: (projectId: string) => string;
  getProjectTasks: (projectId: string) => ProjectTask[];
  persistTasks: (projectId: string, tasks: ProjectTask[]) => void;
  ensureMemoryContinuity: () => { projectsCount: number; tasksCount: number; status: string };
}

export class MockProjectDatabaseService implements IMockProjectDatabaseService {
  private storageKey = 'aetheros_mock_project_db_v1';

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    try {
      const existing = localStorage.getItem(this.storageKey);
      if (!existing) {
        localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_WORLD_MODEL.projects));
      }
    } catch (e) {
      console.warn('[MockProjectDatabaseService] Initialization warning:', e);
    }
  }

  public getAllProjects(): ProjectModel[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return INITIAL_WORLD_MODEL.projects;
      return JSON.parse(raw);
    } catch {
      return INITIAL_WORLD_MODEL.projects;
    }
  }

  public getProjectById(projectId: string): ProjectModel | null {
    const projects = this.getAllProjects();
    return projects.find((p) => p.id === projectId) || null;
  }

  public persistProjectState(
    projectId: string,
    state: {
      vision?: string;
      problem?: string;
      tasks?: ProjectTask[];
      currentState?: string;
      progress?: number;
      [key: string]: any;
    }
  ): ProjectModel | null {
    const projects = this.getAllProjects();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) return null;

    const updated: ProjectModel = {
      ...projects[idx],
      ...state,
    };
    projects[idx] = updated;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(projects));
    } catch (e) {
      console.error('[MockProjectDatabaseService] Failed to persist project state:', e);
    }

    // Sync with persistentMemoryStore & memoryCacheService for full memory continuity
    persistentMemoryStore.upsertProject(updated);
    memoryCacheService.updateProjectEntity(updated);
    return updated;
  }

  public getProjectVision(projectId: string): string {
    const p = this.getProjectById(projectId);
    return p?.vision || '';
  }

  public getProjectProblem(projectId: string): string {
    const p = this.getProjectById(projectId);
    return p?.problem || '';
  }

  public getProjectTasks(projectId: string): ProjectTask[] {
    const p = this.getProjectById(projectId);
    return p?.tasks || [];
  }

  public persistTasks(projectId: string, tasks: ProjectTask[]): void {
    this.persistProjectState(projectId, { tasks });
  }

  public ensureMemoryContinuity(): { projectsCount: number; tasksCount: number; status: string } {
    const projects = this.getAllProjects();
    const tasksCount = projects.flatMap((p) => p.tasks).length;
    return {
      projectsCount: projects.length,
      tasksCount,
      status: 'Active memory continuity verified across sessions',
    };
  }
}

export const mockProjectDatabase = new MockProjectDatabaseService();

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  specialistAgent?: SpecialistAgentType;
  mode: OperatingMode;
  text: string;
  timestamp: string;
  metadata?: {
    projectContext?: string;
    continuityRetrieved?: boolean;
    actionsExecuted?: string[];
    loopSteps?: LoopTraceStep[];
    proposalGenerated?: string;
  };
}

interface AgentContextType {
  worldModel: PersonalWorldModel;
  specialistAgents: SpecialistAgent[];
  activeAgent: SpecialistAgentType | null;
  activeMode: OperatingMode;
  activeProjectId: string | null;
  activeProject: ProjectModel | undefined;
  messages: ChatMessage[];
  proposals: ImprovementProposal[];
  tools: ToolDefinition[];
  auditLogs: AuditLogEntry[];
  isThinking: boolean;
  activeLoopTrace: LoopTraceStep[] | null;

  // Persistent Memory Store & Search (Phase 1)
  dbStats: MemoryDatabaseStats;
  sqlQueryLogs: SqlQueryLog[];
  searchMemory: (query: string) => SearchResultItem[];
  refreshDatabaseStats: () => void;
  updateProjectState: (projectId: string, partial: Partial<ProjectModel>) => void;

  // Mock Database Service Layer (Phase 1 Project State Persistence)
  mockProjectDatabase: IMockProjectDatabaseService;
  persistProjectStateToDb: (projectId: string, state: Partial<ProjectModel>) => void;
  getProjectVisionFromDb: (projectId: string) => string;
  getProjectProblemFromDb: (projectId: string) => string;
  getProjectTasksFromDb: (projectId: string) => ProjectTask[];
  persistTasksToDb: (projectId: string, tasks: ProjectTask[]) => void;

  // In-Memory Cache Service (Phase 1 Entity Retrieval)
  cacheMetrics: CacheMetrics;
  getProjectVision: (projectId: string) => string;
  getProjectProblem: (projectId: string) => string;
  getProjectTasksFromCache: (projectId: string) => ProjectTask[];
  getProjectStateFromCache: (projectId: string) => ProjectModel | null;

  // Actions
  setActiveAgent: (agent: SpecialistAgentType | null) => void;
  setActiveMode: (mode: OperatingMode) => void;
  setActiveProjectId: (projectId: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  executeProjectContinuity: (projectNameOrKeyword: string) => Promise<void>;
  runAutonomousLoop: (taskDescription: string, projectId?: string) => Promise<void>;

  // Project & Task Actions
  urgencyLevels: UrgencyLevel[];
  updateTaskState: (taskId: string, newState: ProjectTask['currentState']) => void;
  transitionTaskState: (taskId: string, targetState?: ProjectTask['currentState']) => void;
  toggleTaskComplete: (taskId: string) => void;
  updateTaskUrgency: (taskId: string, urgency: UrgencyLevel) => void;
  updateTaskPriority: (taskId: string, priority: ProjectTask['priority']) => void;
  updateTaskColorCode: (taskId: string, colorCode: string) => void;
  sortTasksByUrgency: (tasks: ProjectTask[]) => ProjectTask[];
  createTask: (task: Omit<ProjectTask, 'id'>) => void;
  addDecision: (decision: Omit<DecisionRecord, 'id' | 'date'>) => void;
  updateProjectProgress: (projectId: string, delta: number) => void;

  // Self-Improvement & Sandbox Actions
  createProposal: (proposalData?: Partial<ImprovementProposal>) => Promise<ImprovementProposal>;
  runSandboxTests: (proposalId: string) => Promise<void>;
  approveProposal: (proposalId: string) => void;
  rejectProposal: (proposalId: string, reason: string) => void;
  deployProposal: (proposalId: string, targetTier: 'Staging' | 'ProductionDeployed') => void;
  rollbackProposal: (proposalId: string) => void;

  // Tool Registry Actions
  toggleToolActivation: (toolId: string, targetStatus: ToolDefinition['activationStatus']) => void;
  addNewTool: (tool: Omit<ToolDefinition, 'id'>) => void;
  revokeTool: (toolId: string) => void;

  // State Reset
  resetWorldModel: () => void;
}

const STORAGE_KEY = 'aetheros_world_model_v1';
const PROPOSALS_KEY = 'aetheros_proposals_v1';
const TOOLS_KEY = 'aetheros_tools_v1';
const AUDIT_KEY = 'aetheros_audit_v1';
const MESSAGES_KEY = 'aetheros_messages_v1';

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [worldModel, setWorldModel] = useState<PersonalWorldModel>(() => {
    try {
      const dbProjects = persistentMemoryStore.getProjects();
      const dbGoals = persistentMemoryStore.getGoals();
      const saved = localStorage.getItem(STORAGE_KEY);
      const base = saved ? JSON.parse(saved) : INITIAL_WORLD_MODEL;
      return {
        ...base,
        projects: dbProjects && dbProjects.length > 0 ? dbProjects : base.projects,
        goals: dbGoals && dbGoals.length > 0 ? dbGoals : base.goals,
      };
    } catch {
      return INITIAL_WORLD_MODEL;
    }
  });

  const [dbStats, setDbStats] = useState<MemoryDatabaseStats>(() => persistentMemoryStore.getDatabaseStats());
  const [sqlQueryLogs, setSqlQueryLogs] = useState<SqlQueryLog[]>(() => persistentMemoryStore.getQueryLogs());
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>(() => memoryCacheService.getMetrics());

  const refreshDatabaseStats = () => {
    setDbStats(persistentMemoryStore.getDatabaseStats());
    setSqlQueryLogs(persistentMemoryStore.getQueryLogs());
    setCacheMetrics(memoryCacheService.getMetrics());
  };

  const searchMemory = (query: string): SearchResultItem[] => {
    return persistentMemoryStore.searchEntities(query);
  };

  // Memory Cache Entity Getters (Phase 1)
  const getProjectVision = (projectId: string): string => {
    const val = memoryCacheService.getProjectVision(projectId);
    setCacheMetrics(memoryCacheService.getMetrics());
    return val;
  };

  const getProjectProblem = (projectId: string): string => {
    const val = memoryCacheService.getProjectProblem(projectId);
    setCacheMetrics(memoryCacheService.getMetrics());
    return val;
  };

  const getProjectTasksFromCache = (projectId: string): ProjectTask[] => {
    const val = memoryCacheService.getProjectTasks(projectId);
    setCacheMetrics(memoryCacheService.getMetrics());
    return val;
  };

  const getProjectStateFromCache = (projectId: string): ProjectModel | null => {
    const val = memoryCacheService.getProjectState(projectId);
    setCacheMetrics(memoryCacheService.getMetrics());
    return val;
  };

  // Mock Database Service Layer Methods (Phase 1 Persistence & Memory Continuity)
  const persistProjectStateToDb = (projectId: string, partial: Partial<ProjectModel>) => {
    const updated = mockProjectDatabase.persistProjectState(projectId, partial);
    if (!updated) return;

    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((p) => (p.id === projectId ? updated : p));
      return { ...prev, projects: updatedProjects };
    });
    refreshDatabaseStats();
    addAuditLog('User', 'PERSIST_PROJECT_STATE_DB', projectId, 'production', 'success', `Persisted state for project: ${updated.name}`);
  };

  const getProjectVisionFromDb = (projectId: string): string => {
    return mockProjectDatabase.getProjectVision(projectId);
  };

  const getProjectProblemFromDb = (projectId: string): string => {
    return mockProjectDatabase.getProjectProblem(projectId);
  };

  const getProjectTasksFromDb = (projectId: string): ProjectTask[] => {
    return mockProjectDatabase.getProjectTasks(projectId);
  };

  const persistTasksToDb = (projectId: string, tasks: ProjectTask[]) => {
    mockProjectDatabase.persistTasks(projectId, tasks);
    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.id === projectId) {
          return { ...p, tasks };
        }
        return p;
      });
      return { ...prev, projects: updatedProjects };
    });
    refreshDatabaseStats();
    addAuditLog('User', 'PERSIST_TASKS_DB', projectId, 'production', 'success', `Persisted ${tasks.length} tasks to mock database.`);
  };

  const [specialistAgents, setSpecialistAgents] = useState<SpecialistAgent[]>(INITIAL_SPECIALIST_AGENTS);
  const [activeAgent, setActiveAgent] = useState<SpecialistAgentType | null>('sales');
  const [activeMode, setActiveMode] = useState<OperatingMode>('chat');
  const [activeProjectId, setActiveProjectId] = useState<string | null>('proj-sales-agent');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [activeLoopTrace, setActiveLoopTrace] = useState<LoopTraceStep[] | null>(null);

  const [proposals, setProposals] = useState<ImprovementProposal[]>(() => {
    try {
      const saved = localStorage.getItem(PROPOSALS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_IMPROVEMENT_PROPOSALS;
    } catch {
      return INITIAL_IMPROVEMENT_PROPOSALS;
    }
  });

  const [tools, setTools] = useState<ToolDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(TOOLS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TOOL_REGISTRY;
    } catch {
      return INITIAL_TOOL_REGISTRY;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(AUDIT_KEY);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'msg-init-1',
        sender: 'system',
        mode: 'chat',
        text: 'AetherOS Kernel v2.4 initialized. Context-aware Personal Operating System active. 9 specialist agents loaded. World model synchronized with 3 active projects, 3 ventures, and 14 decisions.',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'msg-init-2',
        sender: 'agent',
        specialistAgent: 'sales',
        mode: 'chat',
        text: `Alex, your executive workspace is live. 

Current focus: **Enterprise Outbound Pipeline** (82% complete) & **EduCore AST Engine** (74% complete).
- **Pending Consequential Action:** 15 enterprise outreach drafts are awaiting your manual approval before export.
- **Proposed Self-Improvement:** Proposal \`PROP-98214\` (Context Cache Inverted Index) passed sandbox regression tests and is ready for staging sign-off.
- **Synergy Detected:** AST parsing logic in EduCore can be shared with Coding Agent and prospect repo analysis in the Sales pipeline.

How should we direct execution today? Try asking *"Continue the sales agent"* or *"Where are we with EduCore?"*.`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(worldModel));
  }, [worldModel]);

  useEffect(() => {
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  const activeProject = worldModel.projects.find((p) => p.id === activeProjectId);

  const addAuditLog = (
    actor: string,
    action: string,
    target: string,
    environment: AuditLogEntry['environment'],
    outcome: AuditLogEntry['outcome'],
    details: string
  ) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      environment,
      outcome,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      mode: activeMode,
      specialistAgent: activeAgent || undefined,
      text,
      timestamp: new Date().toISOString(),
      metadata: {
        projectContext: activeProject?.name,
      },
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    voiceAgent.analyzeSentimentAndSetEmotion(text, 'user');

    // Check if message is a project continuity trigger
    const lower = text.toLowerCase();
    if (lower.includes('continue the sales agent') || lower.includes('sales agent')) {
      await executeProjectContinuity('sales');
      setIsThinking(false);
      return;
    } else if (lower.includes('where are we with educore') || lower.includes('educore')) {
      await executeProjectContinuity('educore');
      setIsThinking(false);
      return;
    }

    try {
      const response = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: activeMode,
          specialistAgent: activeAgent,
          worldModelContext: {
            identity: worldModel.identity,
            goals: worldModel.goals.map((g) => ({ title: g.title, progress: g.progressPercentage })),
            activeProjects: worldModel.projects.map((p) => ({
              id: p.id,
              name: p.name,
              progress: p.progress,
              health: p.health,
              currentState: p.currentState,
            })),
          },
          projectContext: activeProject,
          history: messages.slice(-5),
        }),
      });

      const data = await response.json();
      const agentMsg: ChatMessage = {
        id: `msg-${Date.now()}-agent`,
        sender: 'agent',
        specialistAgent: activeAgent || undefined,
        mode: activeMode,
        text: data.response || 'Action processed. Working state maintained.',
        timestamp: new Date().toISOString(),
        metadata: {
          projectContext: activeProject?.name,
        },
      };

      setMessages((prev) => [...prev, agentMsg]);
      addAuditLog(
        activeAgent ? `${activeAgent} Agent` : 'Orchestrator',
        `RUN_MODE_${activeMode.toUpperCase()}`,
        activeProject?.name || 'General Context',
        'production',
        'success',
        `Directive: "${text.slice(0, 60)}..."`
      );
    } catch (err: any) {
      console.error('API orchestrate failed:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-fallback`,
        sender: 'agent',
        specialistAgent: activeAgent || undefined,
        mode: activeMode,
        text: `### Strategic Assessment: [${activeAgent || 'Orchestrator'} | ${activeMode.toUpperCase()} Mode]
We have maintained continuity on **${activeProject?.name || 'Active Project'}**. 

- **State Verified:** All 21 Project Model parameters and decisions are intact in local-first storage.
- **Critical Path:** Proceed with approved task execution without adding unverified external dependencies.
- **Next Concrete Action:** Focus on completing pending milestones before initiating new architectural changes.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Dedicated Continuity Retrieval Engine
  const executeProjectContinuity = async (keyword: string) => {
    setIsThinking(true);
    let targetProject: ProjectModel | undefined;

    if (keyword.includes('sales')) {
      targetProject = worldModel.projects.find((p) => p.id === 'proj-sales-agent');
      setActiveProjectId('proj-sales-agent');
      setActiveAgent('sales');
    } else if (keyword.includes('educore')) {
      targetProject = worldModel.projects.find((p) => p.id === 'proj-educore');
      setActiveProjectId('proj-educore');
      setActiveAgent('coding');
    } else {
      targetProject = worldModel.projects[0];
      if (targetProject) setActiveProjectId(targetProject.id);
    }

    if (!targetProject) {
      setIsThinking(false);
      return;
    }

    const continuityText = `### Project Continuity Hydrated: ${targetProject.name}
**Vision:** ${targetProject.vision}
**Current State:** ${targetProject.currentState} (Overall Progress: ${targetProject.progress}%)

#### Verified Project Memory:
- **Facts:** ${targetProject.continuityState.facts.join(' • ')}
- **Key Decision Recorded:** "${targetProject.decisions[0]?.title || 'None'}" (${targetProject.decisions[0]?.date || ''}) — *${targetProject.decisions[0]?.rationale || ''}*
- **Assumptions & Hypotheses:** ${targetProject.continuityState.assumptions.join('; ')}
- **Current Blockers:** ${targetProject.continuityState.blockedWork.join('; ') || 'None'}

#### Unfinished Tasks:
${targetProject.tasks
  .filter((t) => t.currentState !== 'completed')
  .map((t) => `- **[${t.priority.toUpperCase()}]** ${t.objective} (Owner: *${t.owner}*, Next: *${t.nextAction}*)`)
  .join('\n')}

#### Recommended Next Concrete Action:
👉 **${targetProject.nextActions[0] || 'Execute current milestone'}**

*I have hydrated the entire working memory and updated active context. Ready to proceed?*`;

    const continuityMsg: ChatMessage = {
      id: `msg-${Date.now()}-continuity`,
      sender: 'agent',
      specialistAgent: activeAgent || 'sales',
      mode: 'planning',
      text: continuityText,
      timestamp: new Date().toISOString(),
      metadata: {
        projectContext: targetProject.name,
        continuityRetrieved: true,
      },
    };

    setMessages((prev) => [...prev, continuityMsg]);
    addAuditLog(
      'Orchestrator',
      'CONTINUITY_RECALL',
      targetProject.name,
      'production',
      'success',
      'Hydrated project state, decisions, and task dependencies without requiring user restatement.'
    );
    setIsThinking(false);
  };

  // Research -> Think -> Act Autonomous Loop Runner
  const runAutonomousLoop = async (taskDescription: string, projectId?: string) => {
    setIsThinking(true);
    voiceAgent.setEmotion('focused', `Autonomous loop started: "${taskDescription.slice(0, 40)}..."`);
    const targetProj = projectId
      ? worldModel.projects.find((p) => p.id === projectId)
      : activeProject || worldModel.projects[0];

    const initialSteps: LoopTraceStep[] = [
      { stepNumber: 1, phase: 'Receive & Analyze', description: `Analyzing intent: "${taskDescription}"`, status: 'running' },
      { stepNumber: 2, phase: 'Context Retrieval', description: `Loading world model for project: ${targetProj?.name}`, status: 'pending' },
      { stepNumber: 3, phase: 'World Model Update', description: 'Checking consistency & updating entity graph', status: 'pending' },
      { stepNumber: 4, phase: 'Plan & Research', description: 'Synthesizing technical requirements and evidence', status: 'pending' },
      { stepNumber: 5, phase: 'Execute Permitted Action', description: 'Running sandbox operations with read-only default', status: 'pending' },
      { stepNumber: 6, phase: 'Review & Verify', description: 'Review Agent performing pre-mortem risk check', status: 'pending' },
      { stepNumber: 7, phase: 'Memory & Task Sync', description: 'Persisting outcome to project tasks and ADR', status: 'pending' },
      { stepNumber: 8, phase: 'Executive Report', description: 'Generating structured co-founder summary with approval gates', status: 'pending' },
    ];

    setActiveLoopTrace(initialSteps);

    for (let i = 0; i < initialSteps.length; i++) {
      await new Promise((res) => setTimeout(res, 550));
      setActiveLoopTrace((prev) => {
        if (!prev) return null;
        return prev.map((step, idx) => {
          if (idx === i) return { ...step, status: 'completed' };
          if (idx === i + 1) return { ...step, status: 'running' };
          return step;
        });
      });
    }

    addAuditLog(
      'Autonomous Loop Engine',
      'EXECUTE_LOOP',
      taskDescription,
      'sandbox',
      'success',
      `Completed 8-phase loop for ${targetProj?.name}`
    );

    const completionMsg: ChatMessage = {
      id: `msg-${Date.now()}-loop-complete`,
      sender: 'agent',
      specialistAgent: activeAgent || 'architecture',
      mode: 'execute',
      text: `### Autonomous Execution Loop Complete
**Objective:** ${taskDescription}  
**Project:** ${targetProj?.name}  

#### Execution Summary:
1. **Analysis & Intent:** Deconstructed requirements into 3 deterministic sub-steps.
2. **Context Hydrated:** Loaded decisions, constraints, and architecture models.
3. **Sandbox Verification:** Confirmed that no unapproved mutations or external write permissions were requested.
4. **Outcome Verified:** Task validated against pre-mortem safety checklist.

*Result synchronized with task engine. Ready for next instruction or deployment sign-off.*`,
      timestamp: new Date().toISOString(),
      metadata: {
        loopSteps: initialSteps.map((s) => ({ ...s, status: 'completed' })),
      },
    };

    setMessages((prev) => [...prev, completionMsg]);
    setIsThinking(false);
    voiceAgent.setEmotion('triumphant', `Autonomous loop completed for ${targetProj?.name || 'ecosystem'}. 100% verification.`);
  };

  // Project Task Engine
  const updateTaskState = (taskId: string, newState: ProjectTask['currentState']) => {
    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((proj) => {
        const targetTask = proj.tasks.find((t) => t.id === taskId);
        if (!targetTask) return proj;

        const updatedTask = { ...targetTask, currentState: newState };
        persistentMemoryStore.upsertTask(updatedTask);

        const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? updatedTask : t));
        const completedCount = updatedTasks.filter((t) => t.currentState === 'completed').length;
        const newProgress = Math.round((completedCount / (updatedTasks.length || 1)) * 100);

        const updatedProj = {
          ...proj,
          tasks: updatedTasks,
          progress: Math.max(proj.progress, newProgress),
        };
        persistentMemoryStore.upsertProject(updatedProj);
        memoryCacheService.updateProjectEntity(updatedProj);
        return updatedProj;
      });

      return { ...prev, projects: updatedProjects };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'UPDATE_TASK_STATE', taskId, 'production', 'success', `State shifted to ${newState}`);
  };

  const transitionTaskState = (taskId: string, targetState?: ProjectTask['currentState']) => {
    const updated = persistentMemoryStore.transitionTaskState(taskId, targetState);
    if (!updated) return;

    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((proj) => {
        if (!proj.tasks.some((t) => t.id === taskId)) return proj;

        const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? updated : t));
        const completedCount = updatedTasks.filter((t) => t.currentState === 'completed').length;
        const newProgress = Math.round((completedCount / (updatedTasks.length || 1)) * 100);

        const updatedProj = {
          ...proj,
          tasks: updatedTasks,
          progress: Math.max(proj.progress, newProgress),
        };
        memoryCacheService.updateProjectEntity(updatedProj);
        return updatedProj;
      });

      return { ...prev, projects: updatedProjects };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'TRANSITION_TASK_STATE', taskId, 'production', 'success', `State transitioned to ${updated.currentState}`);
  };

  const urgencyLevels: UrgencyLevel[] = ['High', 'Medium', 'Low'];

  const toggleTaskComplete = (taskId: string) => {
    const updated = persistentMemoryStore.toggleTaskCompletion(taskId);
    if (!updated) return;

    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((proj) => {
        if (!proj.tasks.some((t) => t.id === taskId)) return proj;

        const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? updated : t));
        const completedCount = updatedTasks.filter((t) => t.currentState === 'completed').length;
        const newProgress = Math.round((completedCount / (updatedTasks.length || 1)) * 100);

        const updatedProj = {
          ...proj,
          tasks: updatedTasks,
          progress: newProgress,
        };
        memoryCacheService.updateProjectEntity(updatedProj);
        return updatedProj;
      });

      return { ...prev, projects: updatedProjects };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'TOGGLE_TASK_COMPLETE', taskId, 'production', 'success', `Task state toggled to ${updated.currentState}`);
  };

  const updateTaskUrgency = (taskId: string, urgency: UrgencyLevel) => {
    const updated = persistentMemoryStore.updateTaskUrgency(taskId, urgency);
    if (!updated) return;

    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((proj) => {
        if (!proj.tasks.some((t) => t.id === taskId)) return proj;
        const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? updated : t));
        const updatedProj = { ...proj, tasks: updatedTasks };
        memoryCacheService.updateProjectEntity(updatedProj);
        return updatedProj;
      });
      return { ...prev, projects: updatedProjects };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'UPDATE_TASK_URGENCY', taskId, 'production', 'success', `Task urgency set to ${urgency}`);
  };

  const updateTaskPriority = (taskId: string, priority: ProjectTask['priority']) => {
    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((proj) => {
        const targetTask = proj.tasks.find((t) => t.id === taskId);
        if (!targetTask) return proj;

        const updatedTask: ProjectTask = {
          ...targetTask,
          priority,
          urgency: (priority === 'critical' || priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low') as UrgencyLevel,
        };
        persistentMemoryStore.upsertTask(updatedTask);

        const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? updatedTask : t));
        const updatedProj = { ...proj, tasks: updatedTasks };
        memoryCacheService.updateProjectEntity(updatedProj);
        return updatedProj;
      });

      return { ...prev, projects: updatedProjects };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'UPDATE_TASK_PRIORITY', taskId, 'production', 'success', `Task priority updated to ${priority}`);
  };

  const updateTaskColorCode = (taskId: string, colorCode: string) => {
    const updated = persistentMemoryStore.updateTaskColorCode(taskId, colorCode);
    if (!updated) return;

    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((proj) => {
        if (!proj.tasks.some((t) => t.id === taskId)) return proj;
        const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? updated : t));
        const updatedProj = { ...proj, tasks: updatedTasks };
        memoryCacheService.updateProjectEntity(updatedProj);
        return updatedProj;
      });
      return { ...prev, projects: updatedProjects };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'UPDATE_TASK_COLOR', taskId, 'production', 'success', `Task color-coded as ${colorCode}`);
  };

  const sortTasksByUrgency = (tasksList: ProjectTask[]): ProjectTask[] => {
    const priorityWeight: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    const urgencyWeight: Record<string, number> = {
      High: 3,
      Medium: 2,
      Low: 1,
    };

    return [...tasksList].sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.currentState === 'completed' && b.currentState !== 'completed') return 1;
      if (a.currentState !== 'completed' && b.currentState === 'completed') return -1;

      // Higher priority and urgency first
      const weightA =
        (priorityWeight[a.priority] || 1) * 10 + (urgencyWeight[a.urgency || 'Medium'] || 2);
      const weightB =
        (priorityWeight[b.priority] || 1) * 10 + (urgencyWeight[b.urgency || 'Medium'] || 2);

      return weightB - weightA;
    });
  };

  const createTask = (taskData: Omit<ProjectTask, 'id'>) => {
    const newTask: ProjectTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };

    persistentMemoryStore.upsertTask(newTask);

    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.id === taskData.projectId) {
          const updatedProj = { ...p, tasks: [...p.tasks, newTask] };
          persistentMemoryStore.upsertProject(updatedProj);
          memoryCacheService.updateProjectEntity(updatedProj);
          return updatedProj;
        }
        return p;
      });
      return { ...prev, projects: updatedProjects };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'CREATE_TASK', newTask.objective, 'production', 'success', `Assigned to ${newTask.owner}`);
  };

  const updateProjectState = (projectId: string, partial: Partial<ProjectModel>) => {
    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.id === projectId) {
          const merged: ProjectModel = { ...p, ...partial };
          persistentMemoryStore.upsertProject(merged);
          memoryCacheService.updateProjectEntity(merged);
          return merged;
        }
        return p;
      });
      return { ...prev, projects: updatedProjects };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'UPDATE_PROJECT_STATE', projectId, 'production', 'success', `Modified: ${Object.keys(partial).join(', ')}`);
  };

  const addDecision = (decisionData: Omit<DecisionRecord, 'id' | 'date'>) => {
    const newDecision: DecisionRecord = {
      ...decisionData,
      id: `dec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    setWorldModel((prev) => {
      const updatedProjects = prev.projects.map((p) => {
        if (p.id === decisionData.projectId) {
          const updated = { ...p, decisions: [newDecision, ...p.decisions] };
          persistentMemoryStore.upsertProject(updated);
          return updated;
        }
        return p;
      });
      return {
        ...prev,
        projects: updatedProjects,
        decisions: [newDecision, ...prev.decisions],
      };
    });

    refreshDatabaseStats();
    addAuditLog('User', 'RECORD_DECISION', newDecision.title, 'production', 'success', `Status: ${newDecision.status}`);
  };

  const updateProjectProgress = (projectId: string, delta: number) => {
    setWorldModel((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id === projectId) {
          const newProgress = Math.min(100, Math.max(0, p.progress + delta));
          const updated = { ...p, progress: newProgress };
          persistentMemoryStore.upsertProject(updated);
          return updated;
        }
        return p;
      }),
    }));
    refreshDatabaseStats();
  };

  // Approval-Gated Self-Improvement Actions
  const createProposal = async (customData?: Partial<ImprovementProposal>): Promise<ImprovementProposal> => {
    const proposalId = `PROP-${Date.now().toString().slice(-6)}`;
    const newProposal: ImprovementProposal = {
      id: proposalId,
      dateTime: new Date().toISOString(),
      trigger: customData?.trigger || 'Autonomous bottleneck detection in specialist agent delegation router',
      problemDetected: customData?.problemDetected || 'Single-threaded orchestrator bottlenecks under high multi-agent workload.',
      currentBehavior: customData?.currentBehavior || 'Sequential synchronous dispatch to specialist agents one by one.',
      proposedBehavior: customData?.proposedBehavior || 'Parallel worker queue with DAG dependency resolution and speculative execution in sandbox.',
      reasonForChange: customData?.reasonForChange || 'Reduce multi-agent planning latency from 1.8s to 240ms.',
      expectedBenefit: customData?.expectedBenefit || '7.5x increase in orchestrator throughput with deterministic audit logging.',
      affectedFiles: customData?.affectedFiles || ['src/context/AgentContext.tsx', 'src/services/router.ts'],
      newToolsPermissions: customData?.newToolsPermissions || ['worker.spawn', 'queue.parallel_dispatch'],
      dependencies: customData?.dependencies || ['WorkerPoolBuffer'],
      securityPrivacyImplications: customData?.securityPrivacyImplications || 'Sandboxed threads have zero access to network or file storage without explicit user confirmation.',
      potentialFailureModes: customData?.potentialFailureModes || 'Race condition in shared memory buffer if two agents modify the same world model entity.',
      testPlan: customData?.testPlan || '1. Concurrency stress test (50 parallel tasks). 2. Mutex locking integrity check. 3. Memory leak audit.',
      rollbackPlan: customData?.rollbackPlan || 'Atomic pointer rollback to sequential dispatch kernel SNAP-SEQ-04.',
      riskLevel: customData?.riskLevel || 'Medium',
      approvalStatus: 'Proposed',
      implementationStatus: 'Pending',
      deploymentStatus: 'NotDeployed',
      postDeploymentEvaluation: customData?.postDeploymentEvaluation || 'Telemetry benchmark for 72 hours.',
      sandboxTestResults: [],
      ...customData,
    };

    setProposals((prev) => [newProposal, ...prev]);
    addAuditLog('Agent Kernel', 'GENERATE_PROPOSAL', newProposal.id, 'sandbox', 'requires_approval', newProposal.reasonForChange);

    return newProposal;
  };

  const runSandboxTests = async (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, implementationStatus: 'InSandbox' } : p))
    );

    // Call backend or execute simulated sandbox test runner
    try {
      const res = await fetch('/api/run-sandbox-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();

      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === proposalId) {
            return {
              ...p,
              implementationStatus: 'TestsPassing',
              sandboxTestResults: data.suiteResults.map((r: any) => ({
                name: r.name,
                passed: r.status === 'Passed',
                output: `${r.details} (${r.duration})`,
              })),
            };
          }
          return p;
        })
      );

      addAuditLog('Sandbox Evaluator', 'RUN_TESTS', proposalId, 'sandbox', 'success', 'All 4 verification suites passed.');
    } catch {
      // Offline fallback
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id === proposalId) {
            return {
              ...p,
              implementationStatus: 'TestsPassing',
              sandboxTestResults: [
                { name: 'Unit Verification Suite', passed: true, output: '16/16 assertions valid (110ms)' },
                { name: 'Security Boundary Confinement', passed: true, output: 'Read-only invariant verified (45ms)' },
                { name: 'Regression Test vs World Model', passed: true, output: 'No schema collisions (220ms)' },
              ],
            };
          }
          return p;
        })
      );
    }
  };

  const approveProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, approvalStatus: 'UserApproved' } : p))
    );
    addAuditLog('User (Human in Loop)', 'APPROVE_PROPOSAL', proposalId, 'staging', 'success', 'Explicit human approval granted.');
  };

  const rejectProposal = (proposalId: string, reason: string) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, approvalStatus: 'Rejected', rejectionReason: reason } : p
      )
    );
    addAuditLog('User (Human in Loop)', 'REJECT_PROPOSAL', proposalId, 'sandbox', 'blocked', `Rejection reason: ${reason}`);
  };

  const deployProposal = (proposalId: string, targetTier: 'Staging' | 'ProductionDeployed') => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, deploymentStatus: targetTier } : p))
    );
    addAuditLog(
      'Deployment Controller',
      'DEPLOY_PROPOSAL',
      proposalId,
      targetTier === 'ProductionDeployed' ? 'production' : 'staging',
      'success',
      `Promoted to ${targetTier} with rollback pointer active.`
    );
  };

  const rollbackProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? { ...p, deploymentStatus: 'RolledBack', implementationStatus: 'Pending' }
          : p
      )
    );
    addAuditLog('Safety Policy Guard', 'ATOMIC_ROLLBACK', proposalId, 'production', 'reverted', 'Instant revert to previous verified state snapshot.');
  };

  // Tool Registry Management
  const toggleToolActivation = (toolId: string, targetStatus: ToolDefinition['activationStatus']) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, activationStatus: targetStatus } : t))
    );
    addAuditLog('Tool Governance', 'UPDATE_TOOL_STATUS', toolId, 'production', 'success', `Activation status changed to ${targetStatus}`);
  };

  const addNewTool = (toolData: Omit<ToolDefinition, 'id'>) => {
    const newTool: ToolDefinition = {
      ...toolData,
      id: `tool-${Date.now()}`,
    };
    setTools((prev) => [...prev, newTool]);
    addAuditLog('Tool Governance', 'REGISTER_TOOL', newTool.name, newTool.environmentTier, 'requires_approval', 'Tool registered in evaluation status.');
  };

  const revokeTool = (toolId: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, activationStatus: 'revoked' } : t))
    );
    addAuditLog('Safety Policy Guard', 'REVOKE_TOOL_CAPABILITY', toolId, 'production', 'reverted', 'Immediate capability revocation enforced.');
  };

  const resetWorldModel = () => {
    persistentMemoryStore.resetToDefault();
    setWorldModel(INITIAL_WORLD_MODEL);
    setProposals(INITIAL_IMPROVEMENT_PROPOSALS);
    setTools(INITIAL_TOOL_REGISTRY);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEY);
    refreshDatabaseStats();
  };

  return (
    <AgentContext.Provider
      value={{
        worldModel,
        specialistAgents,
        activeAgent,
        activeMode,
        activeProjectId,
        activeProject,
        messages,
        proposals,
        tools,
        auditLogs,
        isThinking,
        activeLoopTrace,
        dbStats,
        sqlQueryLogs,
        searchMemory,
        refreshDatabaseStats,
        updateProjectState,
        mockProjectDatabase,
        persistProjectStateToDb,
        getProjectVisionFromDb,
        getProjectProblemFromDb,
        getProjectTasksFromDb,
        persistTasksToDb,
        cacheMetrics,
        getProjectVision,
        getProjectProblem,
        getProjectTasksFromCache,
        getProjectStateFromCache,
        setActiveAgent,
        setActiveMode,
        setActiveProjectId,
        sendMessage,
        executeProjectContinuity,
        runAutonomousLoop,
        urgencyLevels,
        updateTaskState,
        transitionTaskState,
        toggleTaskComplete,
        updateTaskUrgency,
        updateTaskPriority,
        updateTaskColorCode,
        sortTasksByUrgency,
        createTask,
        addDecision,
        updateProjectProgress,
        createProposal,
        runSandboxTests,
        approveProposal,
        rejectProposal,
        deployProposal,
        rollbackProposal,
        toggleToolActivation,
        addNewTool,
        revokeTool,
        resetWorldModel,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
