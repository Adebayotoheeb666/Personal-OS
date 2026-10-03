/**
 * MemoryCacheService - High-performance in-memory cache service for project entities
 * Enables sub-millisecond retrieval of mock entities like Vision, Problem, Task lists,
 * and architecture specs initialized with structured sample data.
 */

import { ProjectModel, ProjectTask, Goal, DecisionRecord } from '../types/agent';
import { INITIAL_WORLD_MODEL } from '../data/initialWorldModel';

export interface CacheMetrics {
  hits: number;
  misses: number;
  cachedKeysCount: number;
  lastWarmedAt: string;
}

class MemoryCacheService {
  private cache: Map<string, any> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private lastWarmedAt: string = new Date().toISOString();

  constructor() {
    this.warmCacheWithSampleData(INITIAL_WORLD_MODEL.projects);
  }

  /**
   * Initializes the memory cache with structured project entities and sample states
   */
  public warmCacheWithSampleData(projects: ProjectModel[] = INITIAL_WORLD_MODEL.projects) {
    projects.forEach((proj) => {
      this.cache.set(`project:${proj.id}:state`, proj);
      this.cache.set(`project:${proj.id}:vision`, proj.vision);
      this.cache.set(`project:${proj.id}:problem`, proj.problem);
      this.cache.set(`project:${proj.id}:tasks`, proj.tasks);
      this.cache.set(`project:${proj.id}:features`, proj.features);
      this.cache.set(`project:${proj.id}:architecture`, proj.architecture);
      this.cache.set(`project:${proj.id}:decisions`, proj.decisions);
      this.cache.set(`project:${proj.id}:nextActions`, proj.nextActions);
    });

    this.cache.set('all:projects', projects);
    this.cache.set('all:tasks', projects.flatMap((p) => p.tasks));
    this.cache.set('all:goals', INITIAL_WORLD_MODEL.goals);
    this.lastWarmedAt = new Date().toISOString();
  }

  // --- Entity Retrieval Methods ---

  public getProjectState(projectId: string): ProjectModel | null {
    const key = `project:${projectId}:state`;
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    return null;
  }

  public getProjectVision(projectId: string): string {
    const key = `project:${projectId}:vision`;
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    const state = this.getProjectState(projectId);
    return state ? state.vision : 'Vision not recorded in memory cache.';
  }

  public getProjectProblem(projectId: string): string {
    const key = `project:${projectId}:problem`;
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    const state = this.getProjectState(projectId);
    return state ? state.problem : 'Problem statement not recorded in memory cache.';
  }

  public getProjectTasks(projectId: string): ProjectTask[] {
    const key = `project:${projectId}:tasks`;
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    const state = this.getProjectState(projectId);
    return state ? state.tasks : [];
  }

  public getProjectFeatures(projectId: string): string[] {
    const key = `project:${projectId}:features`;
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    const state = this.getProjectState(projectId);
    return state ? state.features : [];
  }

  public getProjectArchitecture(projectId: string): string {
    const key = `project:${projectId}:architecture`;
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key);
    }
    this.misses++;
    const state = this.getProjectState(projectId);
    return state ? state.architecture : '';
  }

  // --- Generic Cache Methods ---

  public get<T>(key: string): T | null {
    if (this.cache.has(key)) {
      this.hits++;
      return this.cache.get(key) as T;
    }
    this.misses++;
    return null;
  }

  public set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public updateProjectEntity(project: ProjectModel): void {
    this.cache.set(`project:${project.id}:state`, project);
    this.cache.set(`project:${project.id}:vision`, project.vision);
    this.cache.set(`project:${project.id}:problem`, project.problem);
    this.cache.set(`project:${project.id}:tasks`, project.tasks);
    this.cache.set(`project:${project.id}:features`, project.features);
    this.cache.set(`project:${project.id}:architecture`, project.architecture);
    this.cache.set(`project:${project.id}:decisions`, project.decisions);
    this.cache.set(`project:${project.id}:nextActions`, project.nextActions);

    const allProjects: ProjectModel[] = this.cache.get('all:projects') || [];
    const idx = allProjects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      allProjects[idx] = project;
    } else {
      allProjects.push(project);
    }
    this.cache.set('all:projects', allProjects);
    this.cache.set('all:tasks', allProjects.flatMap((p) => p.tasks));
  }

  public getMetrics(): CacheMetrics {
    return {
      hits: this.hits,
      misses: this.misses,
      cachedKeysCount: this.cache.size,
      lastWarmedAt: this.lastWarmedAt,
    };
  }
}

export const memoryCacheService = new MemoryCacheService();
