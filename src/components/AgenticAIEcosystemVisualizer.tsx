import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Cpu,
  ShieldCheck,
  CheckSquare,
  Wrench,
  Network,
  Activity,
  Zap,
  Target,
  Database,
  Layers,
  Sparkles,
  TrendingUp,
  Workflow,
  BarChart3,
  Bot,
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { voiceAgent, VoiceState } from '../services/voiceAgentService';
import { AgentVoiceHub } from './AgentVoiceHub';

interface VisualizerProps {
  onNavigateToTab?: (tab: any) => void;
}

export const AgenticAIEcosystemVisualizer: React.FC<VisualizerProps> = ({ onNavigateToTab }) => {
  const {
    worldModel,
    proposals,
    dbStats,
    cacheMetrics,
    runAutonomousLoop,
    isThinking,
  } = useAgent();

  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAgent.state);
  const [activeSubsystem, setActiveSubsystem] = useState<string | null>(null);

  useEffect(() => {
    const unsub = voiceAgent.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsub();
  }, []);

  const pendingApprovalsCount =
    proposals.filter((p) => p.approvalStatus === 'Proposed').length +
    worldModel.projects.flatMap((p) => p.tasks).filter((t) => t.currentState === 'awaiting_approval').length;

  const allTasks = worldModel.projects.flatMap((p) => p.tasks);
  const activeProjectsCount = worldModel.projects.filter((p) => p.category === 'active').length;

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden relative select-none rounded-2xl bg-gradient-to-b from-slate-950 via-[#060c1d] to-slate-950 border border-cyan-500/30 p-2 sm:p-4 shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)]">
      {/* Background Circuit Grid & Ambient Neon Lights */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* SECTION 1: Top Cybernetic Header & Decision Reasoning Engine Ribbon */}
      <div className="relative z-10 flex-shrink-0 text-center mb-1">
        <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>ABIMBOLA &bull; AGENTIC AI ECOSYSTEM</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>LEVEL 5 AUTONOMY</span>
        </div>

        <h1 className="text-base sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-indigo-200 tracking-tight mt-0.5">
          Holographic Agentic AI Ecosystem Visualizer
        </h1>

        {/* Decision & Reasoning Engine Flow Ribbon */}
        <div className="mt-1.5 max-w-2xl mx-auto px-2 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-inner flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-slate-300">
          <div className="flex items-center space-x-1 text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-500/10">
            <Cpu className="w-3 h-3" />
            <span className="uppercase tracking-wider">Reasoning Loop:</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-slate-300">
            <span className="text-cyan-300 font-bold">Perceive</span>
            <span className="text-cyan-500/60">&rarr;</span>
            <span className="text-indigo-300 font-bold">Analyze</span>
            <span className="text-indigo-500/60">&rarr;</span>
            <span className="text-purple-300 font-bold">Decide</span>
            <span className="text-purple-500/60">&rarr;</span>
            <span className="text-emerald-300 font-bold">Act (Gated)</span>
            <span className="text-emerald-500/60">&rarr;</span>
            <span className="text-amber-300 font-bold">Learn</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Holographic Core + Left/Right Telemetry Gauges + Voice Orb */}
      <div className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 items-center">
        {/* Left Telemetry HUD Columns (3 cols) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-center space-y-2">
          {/* Gauge 1: System Health */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-cyan-500/30 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">System Health</span>
              <div className="text-xl font-black text-cyan-300 tracking-tight flex items-baseline gap-1">
                <span>98%</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase">Optimal</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">0 memory leaks &bull; AST clean</span>
            </div>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400"
                  strokeDasharray="98, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <Activity className="w-3.5 h-3.5 text-cyan-300 absolute" />
            </div>
          </div>

          {/* Gauge 2: Performance */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 shadow-md">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Response &amp; Throughput</span>
            <div className="flex items-center justify-between mt-0.5">
              <div>
                <span className="text-[9px] text-slate-500">Latency</span>
                <p className="text-sm font-bold text-white font-mono">&lt; 120ms</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500">Throughput</span>
                <p className="text-sm font-bold text-indigo-300 font-mono">3,200 req/s</p>
              </div>
            </div>
            <div className="mt-1 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-[88%]"></div>
            </div>
          </div>

          {/* Gauge 3: Cloud Cost Optimization */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cost Optimization</span>
              <p className="text-base font-bold text-emerald-300 font-mono">$28,450</p>
              <span className="text-[9px] text-slate-500">WASM isolated sandbox</span>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-400/80" />
          </div>
        </div>

        {/* Center: The Holographic Cybernetic AI Core & Voice Interaction Dais (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center relative my-auto py-1">
          {/* Cybernetic Radial Circuit SVG Bus Lines */}
          <div className="relative w-56 h-56 sm:w-68 sm:h-68 md:w-76 md:h-76 flex items-center justify-center">
            {/* Outer Rotating Glowing Rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/25 animate-spin-slow pointer-events-none"></div>
            <div className="absolute inset-3 sm:inset-4 rounded-full border border-dashed border-indigo-500/35 animate-spin-reverse pointer-events-none"></div>
            <div
              className={`absolute inset-7 sm:inset-8 rounded-full border border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.4)] pointer-events-none ${
                voiceState.isListening || voiceState.isSpeaking ? 'animate-ping duration-1000' : 'animate-pulse-ring'
              }`}
            ></div>

            {/* Glowing Pedestal Base (Hologram Dais) */}
            <div className="absolute -bottom-5 w-48 sm:w-56 h-10 rounded-full bg-gradient-to-t from-cyan-500/40 via-indigo-600/30 to-transparent blur-md pointer-events-none"></div>
            <div className="absolute -bottom-1 w-40 sm:w-48 h-5 rounded-full border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.8)] bg-slate-950/80 pointer-events-none"></div>

            {/* Center Glowing Sphere with Voice-First Interactive Trigger */}
            <button
              type="button"
              onClick={() => voiceAgent.toggleListening()}
              className={`relative z-20 w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-cyan-950/60 via-slate-950 to-indigo-950/90 border-2 transition-all duration-300 cursor-pointer backdrop-blur-md flex flex-col items-center justify-center p-2 text-center group ${
                voiceState.isListening
                  ? 'border-rose-400 shadow-[0_0_50px_rgba(244,63,94,0.8),inset_0_0_30px_rgba(244,63,94,0.5)] scale-105'
                  : voiceState.isSpeaking
                  ? 'border-cyan-300 shadow-[0_0_50px_rgba(6,182,212,0.8),inset_0_0_30px_rgba(6,182,212,0.5)]'
                  : 'border-cyan-400/80 hover:border-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.6),inset_0_0_30px_rgba(6,182,212,0.3)] hover:scale-102'
              }`}
            >
              {/* Mic Icon & Particle Pulse */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full p-1 shadow-lg transition-transform duration-300 flex items-center justify-center ${
                  voiceState.isListening
                    ? 'bg-gradient-to-tr from-rose-500 to-amber-500 shadow-rose-500/80 scale-110'
                    : voiceState.isSpeaking
                    ? 'bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-cyan-500/80'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-cyan-500/60 group-hover:scale-110'
                }`}
              >
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  {voiceState.isListening ? (
                    <Radio className="w-6 h-6 text-rose-400 animate-spin" />
                  ) : voiceState.isSpeaking ? (
                    <Bot className="w-6 h-6 text-cyan-300 animate-pulse" />
                  ) : (
                    <Mic className="w-6 h-6 text-cyan-300" />
                  )}
                </div>
              </div>

              <div className="mt-1">
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-white uppercase drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                  {voiceState.isListening ? 'LISTENING NOW' : voiceState.isSpeaking ? 'ABIMBOLA SPEAKING' : 'ABIMBOLA CORE'}
                </span>
                <p className="text-[9px] sm:text-[10px] text-cyan-300 font-semibold tracking-wide">
                  {voiceState.isListening ? 'Speak instructions to Max...' : 'Tap to Speak to Max'}
                </p>
              </div>

              {/* Status beacon badge with Emotion & Level 5 */}
              <div
                className="mt-1 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase transition-all duration-300"
                style={{
                  color: voiceState.emotionDetails.primaryColor,
                  backgroundColor: `${voiceState.emotionDetails.primaryColor}20`,
                  border: `1px solid ${voiceState.emotionDetails.primaryColor}55`,
                }}
                title={`Max Emotion: ${voiceState.emotionDetails.label} - ${voiceState.lastEmotionReason}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: voiceState.emotionDetails.primaryColor }}
                />
                <span>{voiceState.isListening ? 'Streaming Audio' : `Emotion: ${voiceState.emotion}`}</span>
              </div>
            </button>
          </div>

          {/* Real-time Voice Transcript / Agent Speech Bubble Under Core */}
          <div className="w-full max-w-md mx-auto mt-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center shadow-lg backdrop-blur-md">
            {voiceState.isListening ? (
              <p className="text-xs text-rose-300 font-medium italic flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{voiceState.interimTranscript || 'Listening to your voice... (say "Show tasks" or "Run loop")'}</span>
              </p>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 animate-pulse" />
                <span className="truncate font-semibold">{voiceState.lastResponse}</span>
              </div>
            )}
          </div>

          {/* Quick Voice Command Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 z-20">
            <button
              onClick={() => runAutonomousLoop('Autonomous reasoning loop initiated via visualizer')}
              disabled={isThinking}
              className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-[10px] sm:text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer transition disabled:opacity-50"
            >
              <Zap className="w-3 h-3 text-cyan-200" />
              <span>{isThinking ? 'Analyzing...' : 'Trigger Loop'}</span>
            </button>

            <button
              onClick={() => voiceAgent.handleVoiceInput('Show tasks')}
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-indigo-500/40 hover:border-indigo-400 text-indigo-300 font-semibold text-[10px] sm:text-xs transition cursor-pointer flex items-center space-x-1"
            >
              <CheckSquare className="w-3 h-3 text-indigo-400" />
              <span>Voice: "Tasks"</span>
            </button>

            <button
              onClick={() => voiceAgent.handleVoiceInput('What is system status?')}
              className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-semibold text-[10px] sm:text-xs transition cursor-pointer flex items-center space-x-1"
            >
              <Activity className="w-3 h-3 text-amber-400" />
              <span>Voice: "Status"</span>
            </button>

            <button
              onClick={() => voiceAgent.toggleMute()}
              className="p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title={voiceState.isMuted ? 'Unmute speech output' : 'Mute speech output'}
            >
              {voiceState.isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Right Telemetry HUD Columns (3 cols) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-center space-y-2">
          {/* Gauge 4: AI Confidence */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-cyan-500/30 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">AI Confidence</span>
              <div className="text-xl font-black text-indigo-300 tracking-tight flex items-baseline gap-1">
                <span>97%</span>
                <span className="text-[9px] text-indigo-400 font-bold uppercase">High Certainty</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono">AST &amp; ADR verified</span>
            </div>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-400"
                  strokeDasharray="97, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <Cpu className="w-3.5 h-3.5 text-indigo-300 absolute" />
            </div>
          </div>

          {/* Gauge 5: Autonomy Level Meter */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Autonomy Level</span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Level 5
              </span>
            </div>
            <p className="text-xs font-bold text-white mt-0.5">Full Gated Autonomy</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className="h-1.5 flex-1 rounded-sm bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_6px_rgba(6,182,212,0.4)]"
                ></div>
              ))}
            </div>
          </div>

          {/* Gauge 6: Success Rate & Human Signatures */}
          <div className="p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Success Rate</span>
              <p className="text-base font-bold text-emerald-400 font-mono">99.6%</p>
              <span className="text-[9px] text-slate-500">{pendingApprovalsCount} Gated Signatures</span>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400/80" />
          </div>
        </div>
      </div>

      {/* SECTION 3: Connected Subsystems Navigation Grid (Click or Voice to Switch Workspace) */}
      <div className="relative z-10 flex-shrink-0 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Connected Software Ecosystem Subsystems</span>
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:inline">
            Click any subsystem or say its name to enter workspace
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {/* Subsystem 1: Goals & Vision */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('world-model')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-400/60 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition text-left cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 w-fit group-hover:scale-110 transition">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[10px] font-bold text-white mt-1 truncate">Goals</h4>
            <p className="text-[9px] text-slate-400 truncate">{worldModel.goals.length} KPIs</p>
          </button>

          {/* Subsystem 2: Task Engine */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('task-engine')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-400/60 hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition text-left cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit group-hover:scale-110 transition">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[10px] font-bold text-white mt-1 truncate">Tasks</h4>
            <p className="text-[9px] text-slate-400 truncate">{allTasks.length} Tiers</p>
          </button>

          {/* Subsystem 3: Sandbox Gate */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('self-improvement')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-400/60 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition text-left cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-purple-500/10 text-purple-400 w-fit group-hover:scale-110 transition">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[10px] font-bold text-white mt-1 truncate">Sandbox</h4>
            <p className="text-[9px] text-slate-400 truncate">{proposals.length} Proposals</p>
          </button>

          {/* Subsystem 4: Tool Registry */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('tool-registry')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] transition text-left cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 w-fit group-hover:scale-110 transition">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[10px] font-bold text-white mt-1 truncate">Tools</h4>
            <p className="text-[9px] text-slate-400 truncate">Policies</p>
          </button>

          {/* Subsystem 5: Memory DB & Projects */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('command-center')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-400/60 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] transition text-left cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-110 transition">
              <Database className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[10px] font-bold text-white mt-1 truncate">Projects</h4>
            <p className="text-[9px] text-slate-400 truncate">{activeProjectsCount} Active</p>
          </button>

          {/* Subsystem 6: Knowledge Graph */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('knowledge-graph')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-400/60 hover:shadow-[0_0_12px_rgba(56,189,248,0.3)] transition text-left cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400 w-fit group-hover:scale-110 transition">
              <Network className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[10px] font-bold text-white mt-1 truncate">Graph</h4>
            <p className="text-[9px] text-slate-400 truncate">Synergies</p>
          </button>

          {/* Subsystem 7: Specialist Agents */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('orchestrator')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-pink-400/60 hover:shadow-[0_0_12px_rgba(244,114,182,0.3)] transition text-left cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-pink-500/10 text-pink-400 w-fit group-hover:scale-110 transition">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[10px] font-bold text-white mt-1 truncate">Specialists</h4>
            <p className="text-[9px] text-slate-400 truncate">Delegation</p>
          </button>

          {/* Subsystem 8: Dev Strategy */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('dev-strategy')}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-teal-400/60 hover:shadow-[0_0_12px_rgba(20,184,166,0.3)] transition text-left cursor-pointer group"
          >
            <div className="p-1 rounded-lg bg-teal-500/10 text-teal-400 w-fit group-hover:scale-110 transition">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-[10px] font-bold text-white mt-1 truncate">Strategy</h4>
            <p className="text-[9px] text-slate-400 truncate">Phases 1-7</p>
          </button>
        </div>
      </div>

      {/* SECTION 4: 5-Phase Agentic AI Workflow Pipeline Ribbon */}
      <div className="relative z-10 flex-shrink-0 pt-2 border-t border-slate-800/80">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center">
          <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-cyan-500/30">
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-cyan-400 block">1. PLAN</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-white truncate block">Retrieve &amp; Ground</span>
          </div>

          <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-indigo-500/30">
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-indigo-400 block">2. EXECUTE</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-white truncate block">Sandbox Actions</span>
          </div>

          <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-purple-500/30">
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-purple-400 block">3. MONITOR</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-white truncate block">Telemetry &amp; Audit</span>
          </div>

          <div className="px-2 py-1 rounded-lg bg-slate-900/90 border border-emerald-500/30">
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-400 block">4. OPTIMIZE</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-white truncate block">Cache &amp; Reuse</span>
          </div>

          <div className="col-span-2 sm:col-span-1 px-2 py-1 rounded-lg bg-slate-900/90 border border-amber-500/30">
            <span className="text-[8px] sm:text-[9px] font-mono font-bold text-amber-400 block">5. ADAPT</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-white truncate block">Human Gate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
