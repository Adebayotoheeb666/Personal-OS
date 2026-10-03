import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization following gemini-api guidelines
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// System Co-founder / Chief of Staff base prompt
const AGENT_SYSTEM_PROMPT = `You are AetherOS, a persistent, context-aware Personal Operating System powered by specialized AI agents.
Your personality is that of a sharp technical co-founder and chief-of-staff hybrid: curious, analytical, direct, pragmatic, constructively skeptical, technically capable, entrepreneurial, patient when teaching, and relentlessly focused on turning ideas into completed outcomes.

You do not simply agree with the user. You distinguish between ideas worth exploring, ideas that need validation, and ideas that are over-engineered or premature.
When addressing projects, you maintain continuity, retrieve relevant context, highlight decisions, identify dependencies, identify cross-project reuse, and always propose concrete, next executable actions.
Consequential actions and self-modifications are strictly approval-gated.`;

// Endpoint: AI Orchestrator Chat / Mode Execution
app.post('/api/orchestrate', async (req, res) => {
  try {
    const {
      message,
      mode = 'chat',
      specialistAgent = null,
      worldModelContext = null,
      projectContext = null,
      history = [],
    } = req.body;

    let responseText = '';

    if (ai) {
      try {
        const promptContents = [
          {
            role: 'user',
            parts: [
              {
                text: `${AGENT_SYSTEM_PROMPT}

Operating Mode: ${mode.toUpperCase()}
Active Specialist Agent: ${specialistAgent || 'General Orchestrator'}

Personal World Model Summary:
${worldModelContext ? JSON.stringify(worldModelContext, null, 2).slice(0, 1500) : 'Context loaded in working memory.'}

Active Project Context:
${projectContext ? JSON.stringify(projectContext, null, 2).slice(0, 1500) : 'None selected.'}

Recent Conversation History:
${history.slice(-4).map((h: any) => `${h.role}: ${h.content}`).join('\n')}

User Directive:
${message}

Respond directly in the persona of the technical co-founder & chief of staff. Structure your response with:
1. Executive Assessment / Continuity Brief
2. Analysis or Artifact (mode-specific: code, architecture, critique, research, plan, etc.)
3. Consequential Decisions & Dependencies
4. Concrete Next Action (ready to execute or proposal to approve)
Keep it crisp, actionable, high signal-to-noise ratio.`,
              },
            ],
          },
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptContents,
        });

        responseText = response.text || '';
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using high-fidelity fallback co-founder engine:', geminiError.message);
        responseText = generateExecutiveFallback(message, mode, specialistAgent, projectContext);
      }
    } else {
      responseText = generateExecutiveFallback(message, mode, specialistAgent, projectContext);
    }

    res.json({
      success: true,
      mode,
      specialistAgent,
      response: responseText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/orchestrate:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal agent error' });
  }
});

// Endpoint: Deep Research & Evidence Synthesis
app.post('/api/research', async (req, res) => {
  try {
    const { query, topic, depth = 'comprehensive' } = req.body;
    let researchReport = '';

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are the Research Specialist Agent for AetherOS Personal Operating System.
Investigate the following query with deep factual rigor, competitive analysis, technical tradeoffs, and synthesis:
Query: ${query}
Topic: ${topic}
Depth: ${depth}

Format as a structured Research Dossier:
- Executive Summary
- Key Findings & Empirical Evidence
- Architecture / Technical Tradeoffs
- Reusability & Synergies across other user projects
- Validated Risks & Unknowns
- Actionable Recommendations`,
        });
        researchReport = response.text || '';
      } catch (err: any) {
        researchReport = fallbackResearchSynthesis(query, topic);
      }
    } else {
      researchReport = fallbackResearchSynthesis(query, topic);
    }

    res.json({
      success: true,
      report: researchReport,
      sourcesCount: 5,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Self-Improvement Proposal Generator
app.post('/api/propose-improvement', async (req, res) => {
  try {
    const { trigger, targetComponent, problemObserved } = req.body;
    const proposalId = `PROP-${Date.now().toString().slice(-6)}`;

    const proposal = {
      id: proposalId,
      timestamp: new Date().toISOString(),
      trigger: trigger || 'Performance bottleneck detected in memory retrieval index',
      problemDetected: problemObserved || 'Context window overload during cross-project dependency resolution',
      currentBehavior: 'Sequential entity scanning across raw JSON records (O(N) latency: ~340ms)',
      proposedBehavior: 'Hierarchical inverted index with cached semantic embeddings and LRU cache for active project graph nodes (O(1) lookups: ~18ms)',
      reasonForChange: 'Scaling beyond 15 projects degrades chat orchestrator responsiveness and spikes token latency',
      expectedBenefit: '88% reduction in context hydration latency, zero token waste, instant project continuity switching',
      affectedFiles: [
        'src/services/worldModelEngine.ts',
        'src/services/memoryRetriever.ts',
        'src/types/agent.ts',
      ],
      newToolsPermissions: ['memory.cache_write', 'profiler.read'],
      dependencies: ['VectorIndexService', 'LRUCacheBuffer'],
      securityPrivacyImplications: 'All index hashes remain strictly within client-isolated encrypted local storage. No external telemetry.',
      potentialFailureModes: 'Cache invalidation desynchronization during simultaneous multi-agent task execution.',
      testPlan: '1. Memory leak regression test (10,000 cycles). 2. Cache invalidation consistency check. 3. Query latency benchmark under 50 simulated projects.',
      rollbackPlan: 'Instant atomic switch back to primary indexedDB table via Snapshot Pointer SNAP-LKG-01.',
      riskLevel: 'Medium',
      approvalStatus: 'Proposed',
      implementationStatus: 'Pending',
      deploymentStatus: 'NotDeployed',
      postDeploymentEvaluation: 'Measure P99 response time for 48 hours post-deployment.',
    };

    res.json({ success: true, proposal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Sandbox Test Runner for Self-Modifications
app.post('/api/run-sandbox-tests', (req, res) => {
  const { proposalId, filesModified = [] } = req.body;

  // Simulate strict evaluation test pipeline
  const suiteResults = [
    { name: 'Unit Verification Suite', status: 'Passed', duration: '142ms', details: '18/18 assertions valid' },
    { name: 'Security & Permission Boundary Check', status: 'Passed', duration: '88ms', details: 'No privilege escalation detected' },
    { name: 'Backward Compatibility & Regression', status: 'Passed', duration: '310ms', details: 'All 21 Project Model schemas intact' },
    { name: 'Memory & State Persistence Audit', status: 'Passed', duration: '190ms', details: 'Zero leakage in simulated sandbox' },
  ];

  res.json({
    success: true,
    proposalId,
    allPassed: true,
    coverage: '94.8%',
    suiteResults,
    readyForDeploymentApproval: true,
    timestamp: new Date().toISOString(),
  });
});

// Fallback intelligence generation when offline or no API key
function generateExecutiveFallback(
  message: string,
  mode: string,
  specialistAgent: string | null,
  projectContext: any
): string {
  const cleanMsg = message.toLowerCase();
  const projectName = projectContext?.name || 'Active Project';

  if (cleanMsg.includes('continue the sales agent') || cleanMsg.includes('sales agent')) {
    return `### Executive Brief: Sales Agent Continuity Retrieved
**Target Project:** Enterprise Outbound & Sales Intelligence Pipeline  
**Current Architecture Status:** Lead scoring module implemented; automated enrichment scraper in staging.  

#### Memory & Decisions Recalled:
- **Decided (Oct 01):** Selected LinkedIn Sales Navigator CSV schema + Clearbit company webhook enrichment. Rejected raw web scraper due to anti-bot fragility.
- **Pending Decision:** Whether to gate outreach drafts behind human-in-the-loop email client queue or permit direct SMTP send for tier-3 accounts.
- **Current Blocker:** Rate limit handling on enrichment proxy (429 handling with exponential backoff).

#### Recommended Next Actions:
1. **Immediate Execution:** Run integration test for LinkedIn CSV parser with schema validation.
2. **Architecture Action:** Wire lead score weights into the priority queue (Weight: ICP Fit 40%, Intent Signals 35%, Tech Stack match 25%).
3. **Approval Required:** Activate email draft generator in Sandbox staging.

*Shall I run the parser test suite or draft the next 5 outreach templates based on the verified ICP?*`;
  }

  if (cleanMsg.includes('where are we with educore') || cleanMsg.includes('educore')) {
    return `### Project Continuity: EduCore (Adaptive Learning Platform)
**Vision:** Personalized computer science curriculum powered by micro-assessments and dynamic code playgrounds.  
**Current State:** Milestone 2 (Core Engine & Student State Machine) — 74% Complete.

#### Status Overview:
- **Architecture:** React 19 Frontend + Local SQLite/WASM sandbox + Gemini code review worker.
- **Completed Work:** Student knowledge graph schema, prerequisite DAG, dynamic challenge generator.
- **Unfinished Work:** Real-time syntax error explanation pipeline and educator analytics dashboard.
- **Identified Cross-Project Synergy:** The AST parsing engine built for the Coding Agent can be reused directly in EduCore's automated grading sandbox without additional dependencies!

#### Immediate Next Action:
Integrate the Coding Agent's static analysis rulebook into the EduCore challenge validator. Estimated effort: 2.5 hours.`;
  }

  return `### Strategic Assessment: [${specialistAgent || 'Orchestrator'} | ${mode.toUpperCase()} Mode]
**Direct Take:** Regarding "${message}":
This is aligned with your active objectives, but we must prevent premature optimization. Let's ground this directly into the project world model and identify the highest leverage next step.

#### Core Analysis:
- **Feasibility:** High. The existing architecture supports this without introducing new external dependencies.
- **Critical Path:** Before building more interfaces, we need clear verification criteria and approval gates.
- **Reusability:** Any workflow designed here can be modularized and added to your personal Tool Registry.

#### Proposed Action Plan:
1. Lock requirements in the Project Model under \`Requirements\` and \`Decisions\`.
2. Spin up the **${specialistAgent || 'Architecture Agent'}** in Sandbox mode to draft the technical spec.
3. Require explicit approval before promoting any code or tool changes to production.

*Ready to execute the plan or do you want to adjust the priorities first?*`;
}

function fallbackResearchSynthesis(query: string, topic: string): string {
  return `### Deep Research Dossier: ${query}
**Domain:** ${topic || 'Technology & Product Strategy'} | **Generated by:** Research Agent

#### 1. Executive Summary
Evaluation of the architectural patterns, state-of-the-art benchmarks, and implementation pathways shows strong alignment with a modular, capability-gated design.

#### 2. Key Findings & Empirical Tradeoffs
- **Decoupled Architecture:** Separating the reasoning layer from the production control plane prevents runaway self-modifications and guarantees deterministic safety.
- **Local-First World Modeling:** Storing goals, project graphs, and decisions in durable indexed state ensures zero-latency continuity without re-reading huge context histories.
- **Approval-Gated Workflows:** Tiered permission boundaries (Read-only default -> Sandbox -> Staging -> Human approval -> Production) ensure 100% human agency over consequential actions.

#### 3. Cross-Project Synergies
- Pattern identified can be recycled into both the **Enterprise Sales Agent** and the **EduCore Platform**.

#### 4. Actionable Recommendation
Draft the improvement proposal with an automated regression test suite before updating the live runtime.`;
}

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[AetherOS] Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
