import React, { useState, useEffect, useRef } from 'react';
import {
  History,
  X,
  Mic,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Search,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Play,
  Pause,
  Clock,
  Radio,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { voiceAgent, VoiceState, VoiceCommandHistoryItem } from '../services/voiceAgentService';
import { AgentEmotion } from '../types/agent';

interface VoiceTranscriptSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const VoiceTranscriptSidebar: React.FC<VoiceTranscriptSidebarProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAgent.state);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = voiceAgent.subscribe((state) => {
      setVoiceState(state);
    });
    return unsub;
  }, []);

  // Auto-scroll to bottom on new commands
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [voiceState.commandHistory, autoScroll]);

  if (!isOpen) return null;

  const filteredHistory = voiceState.commandHistory.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.command.toLowerCase().includes(q) ||
      item.response.toLowerCase().includes(q) ||
      item.intent.toLowerCase().includes(q)
    );
  });

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const fullLog = voiceState.commandHistory
      .map(
        (item) =>
          `[${item.timestamp}] User: "${item.command}" (Intent: ${item.intent})\n[${item.timestamp}] Max: "${item.response}" (Emotion: ${item.emotion || 'neutral'})`
      )
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(fullLog);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(voiceState.commandHistory, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `max-voice-transcript-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReRun = (cmd: string) => {
    voiceAgent.reRunCommand(cmd);
  };

  const handleReplayResponse = (response: string, emotion?: AgentEmotion) => {
    voiceAgent.speak(response, { emotion });
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear recent voice transcript history?')) {
      voiceAgent.state.commandHistory = [];
      voiceAgent.setEmotion('neutral', 'Voice command history cleared by human operator.');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] max-w-full bg-[#0a0f1d]/95 border-l border-slate-800 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-800 bg-slate-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Voice Transcript Log
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  {voiceState.commandHistory.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Live chronological record of user audio input &amp; Max spoken feedback
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close Transcript Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar: Search, Copy, Export, Clear */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript history..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleCopyAll}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Copy All Transcripts"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              disabled={voiceState.commandHistory.length === 0}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-300 transition cursor-pointer disabled:opacity-40"
              title="Clear Transcript History"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Audio State Indicator Strip */}
        <div className="flex items-center justify-between text-[10px] font-mono px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                voiceState.isSpeaking
                  ? 'bg-purple-400 animate-pulse'
                  : voiceState.isListening
                  ? 'bg-cyan-400 animate-ping'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="text-slate-300">
              {voiceState.isSpeaking
                ? 'Max Vocalizing...'
                : voiceState.isListening
                ? 'Microphone Listening...'
                : 'Neural Voice Ready'}
            </span>
          </div>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 cursor-pointer"
            />
            <span>Auto-scroll</span>
          </label>
        </div>
      </div>

      {/* Scrollable Live History Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3.5"
      >
        {filteredHistory.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <Mic className="w-8 h-8 text-slate-700 stroke-[1.5]" />
            <p className="text-xs">
              {searchQuery ? 'No matching transcripts found.' : 'No voice interactions recorded yet.'}
            </p>
            <p className="text-[10px] text-slate-600">
              Speak to Max using the voice commander to populate real-time transcripts.
            </p>
          </div>
        ) : (
          filteredHistory.map((item, index) => {
            const isLatest = index === filteredHistory.length - 1;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all space-y-2.5 ${
                  isLatest
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* 1. User Voice Command Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                          Operator Spoke:
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.timestamp}</span>
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white mt-0.5">
                        &ldquo;{item.command}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Intent Badge */}
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/40 text-slate-400 border border-slate-800 flex-shrink-0">
                    {item.intent}
                  </span>
                </div>

                {/* 2. Max Spoken Response */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Max Vocalized:
                      </span>
                    </div>

                    {item.emotion && (
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase bg-purple-950/60 text-purple-300 border border-purple-800/50">
                        {item.emotion}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {item.response}
                  </p>

                  {/* Action buttons on response */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleReplayResponse(item.response, item.emotion)}
                        className="px-2 py-0.5 rounded-md bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 border border-purple-500/30 flex items-center space-x-1 transition cursor-pointer font-bold"
                        title="Replay Max's spoken voice"
                      >
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>Replay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReRun(item.command)}
                        className="px-2 py-0.5 rounded-md bg-cyan-600/20 hover:bg-cyan-600/35 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1 transition cursor-pointer font-bold"
                        title="Re-execute this command"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Re-run</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyText(`User: "${item.command}"\nMax: "${item.response}"`, item.id)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 transition cursor-pointer"
                      title="Copy item text"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Quick Speech Trigger Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-500 font-mono">
          Profile: <strong className="text-cyan-400">{voiceState.selectedProfile.name}</strong>
        </span>
        <button
          type="button"
          onClick={() => {
            voiceAgent.speak('Transcripts synchronized with persistent working memory.');
          }}
          className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer transition font-bold"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Sync Status</span>
        </button>
      </div>
    </div>
  );
};
