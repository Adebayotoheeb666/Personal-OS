import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Search,
  Code2,
  Cpu,
  Layout,
  Briefcase,
  Target,
  GraduationCap,
  FileText,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { SpecialistAgentType, OperatingMode } from '../types/agent';

const AGENT_ICONS: Record<SpecialistAgentType, React.ReactNode> = {
  research: <Search className="w-4 h-4 text-sky-400" />,
  coding: <Code2 className="w-4 h-4 text-emerald-400" />,
  architecture: <Cpu className="w-4 h-4 text-purple-400" />,
  product_ux: <Layout className="w-4 h-4 text-pink-400" />,
  business: <Briefcase className="w-4 h-4 text-amber-400" />,
  sales: <Target className="w-4 h-4 text-rose-400" />,
  learning: <GraduationCap className="w-4 h-4 text-blue-400" />,
  documentation: <FileText className="w-4 h-4 text-teal-400" />,
  review: <ShieldAlert className="w-4 h-4 text-red-400" />,
};

const OPERATING_MODES: { mode: OperatingMode; label: string; icon: string }[] = [
  { mode: 'chat', label: 'Chat', icon: '💬' },
  { mode: 'research', label: 'Research', icon: '🔬' },
  { mode: 'build', label: 'Build', icon: '🏗️' },
  { mode: 'code', label: 'Code', icon: '💻' },
  { mode: 'think', label: 'Think', icon: '🧠' },
  { mode: 'planning', label: 'Planning', icon: '📅' },
  { mode: 'execute', label: 'Execute', icon: '⚡' },
  { mode: 'learn', label: 'Learn', icon: '🎓' },
  { mode: 'review', label: 'Review', icon: '🛡️' },
];

export const OrchestratorView: React.FC = () => {
  const {
    specialistAgents,
    activeAgent,
    activeMode,
    activeProject,
    messages,
    isThinking,
    activeLoopTrace,
    setActiveAgent,
    setActiveMode,
    sendMessage,
    runAutonomousLoop,
    executeProjectContinuity,
  } = useAgent();

  const [inputPrompt, setInputPrompt] = useState('');
  const [autonomousTaskInput, setAutonomousTaskInput] = useState(
    'Verify AST parser edge-cases and update EduCore prerequisite challenge map'
  );
  const [showLoopModal, setShowLoopModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isThinking) return;
    sendMessage(inputPrompt);
    setInputPrompt('');
  };

  const handleLaunchAutonomousLoop = () => {
    if (!autonomousTaskInput.trim() || isThinking) return;
    runAutonomousLoop(autonomousTaskInput);
    setShowLoopModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 9 Specialist Agents Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>Specialist Agent Architecture (9 Specialists)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an agent to direct instructions, or allow the Orchestrator to delegate automatically.
            </p>
          </div>
          <button
            onClick={() => setShowLoopModal(true)}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Autonomous Loop</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {specialistAgents.map((agent) => {
            const isSelected = activeAgent === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setActiveAgent(isSelected ? null : agent.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      {AGENT_ICONS[agent.id]}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xs">{agent.name}</h3>
                      <p className="text-[11px] text-indigo-300">{agent.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      agent.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : agent.status === 'evaluating'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <p className="text-slate-400 text-xs mt-2 line-clamp-2">{agent.description}</p>

                {agent.activeTask && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 truncate flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Task: {agent.activeTask}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Autonomous Loop Step-by-Step Live Telemetry Trace */}
      {activeLoopTrace && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <h3 className="text-sm font-bold text-white">
                Research → Think → Act Autonomous Loop Active
              </h3>
            </div>
            <span className="text-xs text-indigo-300 font-mono">Telemetry: Synchronizing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {activeLoopTrace.map((step) => (
              <div
                key={step.stepNumber}
                className={`p-3 rounded-lg border transition ${
                  step.status === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : step.status === 'running'
                    ? 'bg-indigo-950/40 border-indigo-500/60 text-white animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                  <span>Step {step.stepNumber}</span>
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : step.status === 'running' ? (
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <h4 className="font-semibold text-xs">{step.phase}</h4>
                <p className="text-[11px] opacity-80 mt-0.5 line-clamp-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Workspace: Operating Modes & Chat Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[650px] shadow-sm overflow-hidden">
        {/* Workspace Toolbar: 9 Operating Modes */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 whitespace-nowrap">
              Operating Mode:
            </span>
            {OPERATING_MODES.map((m) => (
              <button
                key={m.mode}
                onClick={() => setActiveMode(m.mode)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                  activeMode === m.mode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium whitespace-nowrap hidden md:block">
            Target: <span className="text-white">{activeProject?.name || 'World Model'}</span>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSys = msg.sender === 'system';

            if (isSys) {
              return (
                <div key={msg.id} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-center text-xs text-slate-400 font-mono">
                  {msg.text}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* Meta Header */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1 px-1">
                  {isUser ? (
                    <span>You ({msg.mode.toUpperCase()})</span>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-indigo-400 capitalize">
                        {msg.specialistAgent || 'Orchestrator'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 uppercase font-semibold text-[10px] bg-slate-800 px-1.5 py-0.2 rounded">
                        {msg.mode} mode
                      </span>
                    </div>
                  )}
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Message Box */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950 border border-slate-800/90 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold p-3 bg-slate-950/80 rounded-xl border border-indigo-500/20 w-fit animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Orchestrator synthesizing context across Personal World Model...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Instruct ${activeAgent ? `${activeAgent} agent` : 'Orchestrator'} in ${activeMode.toUpperCase()} mode... (e.g. "Continue the sales agent")`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={isThinking || !inputPrompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Autonomous Loop Modal */}
      {showLoopModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Launch Research → Think → Act Loop</span>
              </h3>
              <button
                onClick={() => setShowLoopModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              The orchestrator will step through the 8-phase execution loop: intent deconstruction, context retrieval, world model update, planning, sandbox execution, review audit, and task sync.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Autonomous Directive:
              </label>
              <textarea
                rows={3}
                value={autonomousTaskInput}
                onChange={(e) => setAutonomousTaskInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowLoopModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchAutonomousLoop}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md cursor-pointer"
              >
                Execute Loop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
