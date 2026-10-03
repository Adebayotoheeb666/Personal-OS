/**
 * AetherOS - Personal Operating System Powered by an AI Agent
 * Comprehensive implementation honoring all 23 architectural requirements
 */

import React, { useState } from 'react';
import { AgentProvider } from './context/AgentContext';
import { Navigation, ActiveTab } from './components/Navigation';
import { CommandCenter } from './components/CommandCenter';
import { WorldModelView } from './components/WorldModelView';
import { OrchestratorView } from './components/OrchestratorView';
import { TaskEngineView } from './components/TaskEngineView';
import { SelfImprovementView } from './components/SelfImprovementView';
import { ToolRegistryView } from './components/ToolRegistryView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { DevStrategyView } from './components/DevStrategyView';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('command-center');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Universal Sticky Header Navigation */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'command-center' && <CommandCenter onNavigateToTab={setCurrentTab} />}
        {currentTab === 'orchestrator' && <OrchestratorView />}
        {currentTab === 'world-model' && <WorldModelView />}
        {currentTab === 'task-engine' && <TaskEngineView onNavigateToTab={setCurrentTab} />}
        {currentTab === 'self-improvement' && <SelfImprovementView />}
        {currentTab === 'tool-registry' && <ToolRegistryView />}
        {currentTab === 'knowledge-graph' && <KnowledgeGraphView />}
        {currentTab === 'dev-strategy' && <DevStrategyView />}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AetherOS • Personal Operating System &amp; AI Agent Architecture</span>
          <span className="text-[11px] text-slate-600">
            Human-in-the-loop governance • Isolated sandbox testing • Immutable audit logging
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AgentProvider>
      <AppContent />
    </AgentProvider>
  );
}
