/**
 * AetherOS - Core Types & World Model Specification
 * Comprehensive models reflecting all 23 architectural requirements
 */

export type OperatingMode =
  | 'chat'
  | 'research'
  | 'build'
  | 'code'
  | 'think'
  | 'planning'
  | 'execute'
  | 'learn'
  | 'review';

export type SpecialistAgentType =
  | 'research'
  | 'coding'
  | 'architecture'
  | 'product_ux'
  | 'business'
  | 'sales'
  | 'learning'
  | 'documentation'
  | 'review';

export type AgentEmotion =
  | 'neutral'
  | 'curious'
  | 'focused'
  | 'triumphant'
  | 'alert'
  | 'empathetic';

export interface EmotionDetails {
  emotion: AgentEmotion;
  label: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'analytical';
  description: string;
  glowColor: string;
  primaryColor: string;
  facialVisor: 'calm' | 'inquisitive' | 'tensor' | 'radiant' | 'warning' | 'tender';
  pulseSpeed: number; // in seconds
}

export interface SpecialistAgent {
  id: SpecialistAgentType;
  name: string;
  role: string;
  description: string;
  avatarIcon: string;
  responsibilities: string[];
  capabilities: string[];
  status: 'idle' | 'active' | 'evaluating' | 'delegated';
  activeTask?: string;
}

export interface UserIdentity {
  name: string;
  education: string[];
  skills: string[];
  careerDirection: string;
  interests: string[];
}

export interface Goal {
  id: string;
  title: string;
  category: 'long-term' | 'medium-term' | 'short-term';
  status: 'active' | 'in_progress' | 'completed' | 'paused';
  targetDate: string;
  progressPercentage: number;
  linkedProjectIds: string[];
  metrics: string;
}

export interface DecisionRecord {
  id: string;
  title: string;
  projectId?: string;
  date: string;
  rationale: string;
  alternativesConsidered: string[];
  status: 'active' | 'implemented' | 'under_review' | 'reversed';
  reversalConditions: string;
}

export type UrgencyLevel = 'High' | 'Medium' | 'Low';

export interface ProjectTask {
  id: string;
  objective: string;
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgency?: UrgencyLevel;
  colorCode?: string; // Optional visual color-coding (e.g. 'red', 'orange', 'indigo', 'emerald', 'purple', 'pink', 'cyan')
  deadline: string;
  dependencies: string[];
  estimatedEffort: string;
  currentState: 'backlog' | 'in_progress' | 'awaiting_approval' | 'completed' | 'blocked';
  nextAction: string;
  requiredResources: string[];
  owner: string; // Specialist Agent or User
  approvalRequirement: boolean;
  completionEvidence?: string;
}

export interface ProjectModel {
  id: string;
  name: string;
  category: 'active' | 'paused' | 'completed' | 'archived';
  progress: number;
  health: 'healthy' | 'at_risk' | 'blocked';
  deadline: string; // ISO date string (e.g. '2026-10-04T23:59:59Z')
  // 21 attributes required by specification
  vision: string;
  problem: string;
  users: string[];
  goals: string[];
  requirements: string[];
  features: string[];
  architecture: string;
  components: string[];
  agents: SpecialistAgentType[];
  data: string;
  integrations: string[];
  documentation: string;
  code: {
    repoUrl?: string;
    branch?: string;
    keyFiles: string[];
  };
  tasks: ProjectTask[];
  decisions: DecisionRecord[];
  risks: string[];
  experiments: string[];
  validation: string;
  businessModel: string;
  currentState: string;
  nextActions: string[];
  // Continuity facts
  continuityState: {
    facts: string[];
    assumptions: string[];
    hypotheses: string[];
    blockedWork: string[];
    obsoleteInfo: string[];
  };
}

export interface BusinessVentures {
  id: string;
  name: string;
  type: 'operating_venture' | 'business_idea' | 'opportunity';
  description: string;
  targetCustomers: string[];
  monetization: string;
  mrrOrPotential: string;
  status: 'exploring' | 'validating' | 'scaling';
}

export interface LearningItem {
  id: string;
  topic: string;
  type: 'technology' | 'concept' | 'skill' | 'experiment';
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  learningGaps: string[];
  linkedProjects: string[];
  notes: string;
}

export interface ResponsibilityItem {
  id: string;
  title: string;
  domain: 'academic' | 'professional' | 'organizational' | 'personal';
  cadence: string;
  commitmentLevel: 'high' | 'medium' | 'low';
}

export interface PersonContact {
  id: string;
  name: string;
  role: string;
  organization: string;
  relationship: 'client' | 'teammate' | 'collaborator' | 'mentor' | 'advisor';
  associatedProjectIds: string[];
  notes: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: 'repo' | 'document' | 'spreadsheet' | 'cloud' | 'tool' | 'api';
  linkOrRef: string;
  description: string;
}

export interface KnowledgeItem {
  id: string;
  domain: 'technical' | 'business' | 'product' | 'education' | 'research';
  title: string;
  summary: string;
  reusableInProjects: string[];
}

export interface PersonalWorldModel {
  identity: UserIdentity;
  goals: Goal[];
  projects: ProjectModel[];
  businesses: BusinessVentures[];
  learning: LearningItem[];
  responsibilities: ResponsibilityItem[];
  people: PersonContact[];
  resources: ResourceItem[];
  knowledge: KnowledgeItem[];
  decisions: DecisionRecord[];
}

// Approval-Gated Self-Improvement Schema (19 fields as specified)
export interface ImprovementProposal {
  id: string;
  dateTime: string;
  trigger: string;
  problemDetected: string;
  currentBehavior: string;
  proposedBehavior: string;
  reasonForChange: string;
  expectedBenefit: string;
  affectedFiles: string[];
  newToolsPermissions: string[];
  dependencies: string[];
  securityPrivacyImplications: string;
  potentialFailureModes: string;
  testPlan: string;
  rollbackPlan: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  approvalStatus: 'Draft' | 'Proposed' | 'UserApproved' | 'Rejected';
  implementationStatus: 'Pending' | 'InSandbox' | 'TestsPassing' | 'Failed';
  deploymentStatus: 'NotDeployed' | 'Staging' | 'ProductionDeployed' | 'RolledBack';
  postDeploymentEvaluation: string;
  rejectionReason?: string;
  sandboxTestResults?: {
    name: string;
    passed: boolean;
    output: string;
  }[];
}

// Tool Registry & Capability Boundaries
export interface ToolDefinition {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  capabilities: string[];
  permissionsRequired: string[];
  dataAccess: string;
  cost: string;
  securityRisks: string;
  failureBehavior: string;
  alternatives: string[];
  environmentTier: 'sandbox' | 'staging' | 'production';
  activationStatus: 'uninstalled' | 'evaluation' | 'sandbox_active' | 'active_production' | 'revoked';
  requiresHumanConfirmationForExecution: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  environment: 'sandbox' | 'staging' | 'production';
  outcome: 'success' | 'blocked' | 'requires_approval' | 'reverted';
  details: string;
}

// Execution Loop Step
export interface LoopTraceStep {
  stepNumber: number;
  phase: 'Receive & Analyze' | 'Context Retrieval' | 'World Model Update' | 'Plan & Research' | 'Execute Permitted Action' | 'Review & Verify' | 'Memory & Task Sync' | 'Executive Report';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'flagged_approval';
  dataPayload?: any;
}
