/**
 * AetherOS - Personal Operating System Powered by an AI Agent
 * Responsive Holographic Agentic AI Ecosystem Visualizer
 * Zero-Scrollbar Architecture on all devices with Voice as the Primary Mode of Interaction
 * Quick Task Natural Language Scheduler & Control+K Command Palette Modal
 */

import React, { useState, useEffect } from 'react';
import { AgentProvider } from './context/AgentContext';
import { SidebarRail, TopNavigation, ActiveTab } from './components/Navigation';
import { AgenticAIEcosystemVisualizer } from './components/AgenticAIEcosystemVisualizer';
import { CommandCenter } from './components/CommandCenter';
import { WorldModelView } from './components/WorldModelView';
import { OrchestratorView } from './components/OrchestratorView';
import { TaskEngineView } from './components/TaskEngineView';
import { SelfImprovementView } from './components/SelfImprovementView';
import { ToolRegistryView } from './components/ToolRegistryView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { DevStrategyView } from './components/DevStrategyView';
import { AgentVoiceHub } from './components/AgentVoiceHub';
import { AgentStatus } from './components/AgentStatus';
import { QuickTaskModal } from './components/QuickTaskModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ArrowLeft, Mic, Sparkles, X, Plus, Search, Command } from 'lucide-react';

function AppContent() {
  // Default to Holographic Visualizer as requested
  const [currentTab, setCurrentTab] = useState<ActiveTab>('visualizer');
  const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Control+K / Meta+K Keyboard Listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden bg-[#070b14] text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-white">
      {/* Tactile Sidebar Rail (Inspired by Image 2 with Cyber Aesthetic) */}
      <SidebarRail
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenQuickTask={() => setIsQuickTaskOpen(true)}
      />

      {/* Main Viewport Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Top HUD Navigation */}
        <TopNavigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenQuickTask={() => setIsQuickTaskOpen(true)}
        />

        {/* Dashboard Content Container: No page scrollbar on all devices */}
        <div className="flex-1 min-h-0 w-full overflow-hidden relative flex flex-col">
          {currentTab === 'visualizer' ? (
            /* Primary Mode: Holographic Agentic AI Ecosystem Visualizer (Full viewport fit, zero scrollbars) */
            <main className="flex-1 w-full h-full p-1.5 sm:p-3 overflow-hidden">
              <AgenticAIEcosystemVisualizer onNavigateToTab={setCurrentTab} />
            </main>
          ) : (
            /* Workspace Mode: Appears in Dashboard when selected from Navigation Bar */
            <main className="flex-1 w-full h-full overflow-hidden flex flex-col">
              {/* Workspace Navigation Header Ribbon */}
              <div className="flex-shrink-0 bg-slate-900/80 border-b border-slate-800 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setCurrentTab('visualizer')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold transition cursor-pointer shadow-sm shadow-cyan-500/20"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Holographic Visualizer</span>
                </button>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Dashboard:</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 font-semibold uppercase text-[10px] tracking-wider border border-slate-700">
                    {currentTab.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Workspace Content with hidden internal scrollbar */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-3 sm:px-6 lg:px-8 py-4 max-w-7xl w-full mx-auto">
                {currentTab === 'command-center' && <CommandCenter onNavigateToTab={setCurrentTab} />}
                {currentTab === 'orchestrator' && <OrchestratorView />}
                {currentTab === 'world-model' && <WorldModelView />}
                {currentTab === 'task-engine' && <TaskEngineView onNavigateToTab={setCurrentTab} />}
                {currentTab === 'self-improvement' && <SelfImprovementView />}
                {currentTab === 'tool-registry' && <ToolRegistryView />}
                {currentTab === 'knowledge-graph' && <KnowledgeGraphView />}
                {currentTab === 'dev-strategy' && <DevStrategyView />}
              </div>
            </main>
          )}

          {/* Floating Action Buttons: Quick Task + Voice Commander */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 flex items-center space-x-2">
            {/* Quick Task Floating Button (User Requirement) */}
            <button
              type="button"
              onClick={() => setIsQuickTaskOpen(true)}
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer transition transform hover:scale-105"
              title="Quick Task: Pipe Natural Language String into Task Engine"
            >
              <Plus className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline">Quick Task</span>
              <span className="text-[9px] font-mono px-1 rounded bg-black/30 text-emerald-200">NL Pipe</span>
            </button>

            {/* Voice Commander Trigger & Drawer */}
            {showVoiceDrawer ? (
              <div className="w-[320px] sm:w-[420px] max-w-[calc(100vw-24px)] animate-in slide-in-from-bottom-4 duration-200">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVoiceDrawer(false)}
                    className="absolute -top-2.5 -right-2.5 p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-md cursor-pointer z-10"
                    title="Close Voice Commander"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <AgentVoiceHub
                    onNavigateToTab={setCurrentTab}
                    onOpenQuickTask={() => setIsQuickTaskOpen(true)}
                    onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowVoiceDrawer(true)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer transition transform hover:scale-105"
                title="Open Abimbola Voice Commander"
              >
                <Mic className="w-4 h-4 text-cyan-200 animate-pulse" />
                <span className="hidden sm:inline">Abimbola Voice</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time AgentStatus Footer HUD */}
        <footer className="flex-shrink-0 border-t border-slate-800/80 bg-slate-950/90 py-1.5 px-3 sm:px-6 text-[10px] sm:text-[11px] text-slate-500 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2 truncate">
            {/* Real-Time AgentStatus Health Monitor Component */}
            <AgentStatus />
          </div>
          <div className="flex items-center space-x-3 font-mono text-[10px] text-cyan-400 flex-shrink-0">
            <span className="hidden sm:inline text-slate-500">Level 5 Gated</span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>VOICE PRIMARY</span>
            </span>
          </div>
        </footer>
      </div>

      {/* Quick Task Modal (Natural Language Scheduler) */}
      <QuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        onNavigateToTab={setCurrentTab}
      />

      {/* Command Palette Modal (Control+K Triggered) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onOpenQuickTask={() => setIsQuickTaskOpen(true)}
      />
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
