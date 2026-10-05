import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Zap,
  Sparkles,
  Command,
  Send,
  CheckCircle2,
  Activity,
  Bot,
  History,
  RotateCcw,
  ArrowRight,
  Clock,
  Sliders,
  Play,
  Pause,
  Settings,
  Smile,
  AlertTriangle,
  Heart,
  Search,
  Sparkle,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Filter,
} from 'lucide-react';
import {
  voiceAgent,
  VoiceState,
  VoiceCommandHistoryItem,
  EmotionShiftItem,
  AI_VOICE_PROFILES,
  VoiceProfile,
  EMOTION_CONFIGS,
} from '../services/voiceAgentService';
import { useAgent } from '../context/AgentContext';
import { AgentAvatar } from './AgentAvatar';
import { AgentEmotion } from '../types/agent';

interface AgentVoiceHubProps {
  onNavigateToTab?: (tab: any) => void;
  compact?: boolean;
  onOpenQuickTask?: () => void;
  onOpenCommandPalette?: () => void;
}

export const AgentVoiceHub: React.FC<AgentVoiceHubProps> = ({
  onNavigateToTab,
  compact = false,
  onOpenQuickTask,
  onOpenCommandPalette,
}) => {
  const { runAutonomousLoop, setActiveMode } = useAgent();
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAgent.state);
  const [typedCommand, setTypedCommand] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'commander' | 'preferences' | 'emotions'>('commander');
  const [customTtsText, setCustomTtsText] = useState('Max neural voice engine calibrated. Ready to execute autonomous operations with Level 5 safeguards.');
  const [isTestingSpeech, setIsTestingSpeech] = useState(false);
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [emotionSearchQuery, setEmotionSearchQuery] = useState<string>('');

  const filteredEmotionHistory = (voiceState.emotionHistory || []).filter((item) => {
    if (emotionFilter !== 'all' && item.toEmotion !== emotionFilter && item.fromEmotion !== emotionFilter) {
      return false;
    }
    if (emotionSearchQuery.trim()) {
      const q = emotionSearchQuery.toLowerCase();
      return (
        item.reason.toLowerCase().includes(q) ||
        item.toEmotion.toLowerCase().includes(q) ||
        item.fromEmotion.toLowerCase().includes(q) ||
        item.sentiment.toLowerCase().includes(q) ||
        (item.triggerSource && item.triggerSource.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportEmotionHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(voiceState.emotionHistory || [], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `max-agent-emotion-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  useEffect(() => {
    const unsubState = voiceAgent.subscribe((state) => {
      setVoiceState(state);
    });

    const unsubCommand = voiceAgent.onCommand((cmd, intent, reply) => {
      if (onNavigateToTab) {
        if (intent === 'NAV_VISUALIZER') onNavigateToTab('visualizer');
        if (intent === 'NAV_COMMAND_CENTER') onNavigateToTab('command-center');
        if (intent === 'NAV_TASK_ENGINE') onNavigateToTab('task-engine');
        if (intent === 'NAV_ORCHESTRATOR') onNavigateToTab('orchestrator');
        if (intent === 'NAV_WORLD_MODEL') onNavigateToTab('world-model');
        if (intent === 'NAV_SELF_IMPROVEMENT') onNavigateToTab('self-improvement');
        if (intent === 'NAV_TOOL_REGISTRY') onNavigateToTab('tool-registry');
        if (intent === 'NAV_KNOWLEDGE_GRAPH') onNavigateToTab('knowledge-graph');
        if (intent === 'NAV_DEV_STRATEGY') onNavigateToTab('dev-strategy');
      }

      if (intent === 'ACTION_RUN_LOOP') {
        runAutonomousLoop('Max voice-triggered autonomous ecosystem verification & project memory sync');
      } else if (intent === 'ACTION_URGENT_TASKS' && onNavigateToTab) {
        onNavigateToTab('task-engine');
      } else if (intent === 'ACTION_QUICK_TASK') {
        onOpenQuickTask?.();
      } else if (intent === 'ACTION_COMMAND_PALETTE') {
        onOpenCommandPalette?.();
      }
    });

    return () => {
      unsubState();
      unsubCommand();
    };
  }, [onNavigateToTab, runAutonomousLoop, onOpenQuickTask, onOpenCommandPalette]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    voiceAgent.handleVoiceInput(typedCommand);
    setTypedCommand('');
  };

  const executeQuickVoice = (text: string) => {
    voiceAgent.handleVoiceInput(text);
  };

  const handleRerunHistory = (cmd: string) => {
    voiceAgent.reRunCommand(cmd);
  };

  const handleSelectProfile = (profileId: string) => {
    voiceAgent.setVoiceProfile(profileId);
    const profile = AI_VOICE_PROFILES.find((p) => p.id === profileId);
    if (profile) {
      voiceAgent.speak(`Switched voice profile to ${profile.name}. ${profile.tone}.`);
    }
  };

  const handleTestTts = () => {
    if (!customTtsText.trim()) return;
    setIsTestingSpeech(true);
    voiceAgent.speak(customTtsText).finally(() => setIsTestingSpeech(false));
  };

  // Compact Header Pill Mode for Top Navigation Bar
  if (compact) {
    const reactiveScale = 1 + (voiceState.audioLevel / 100) * 0.15;
    return (
      <div className="flex items-center space-x-2">
        <div className="relative flex items-center justify-center">
          {/* Audio reactive mini ring */}
          {(voiceState.isListening || voiceState.isSpeaking) && (
            <div
              className="absolute -inset-1 rounded-full pointer-events-none transition-all duration-75"
              style={{
                border: `${Math.min(3, Math.max(1, (voiceState.audioLevel / 100) * 2.5))}px solid ${
                  voiceState.isListening ? 'rgba(244, 63, 94, 0.8)' : 'rgba(6, 182, 212, 0.8)'
                }`,
                transform: `scale(${reactiveScale})`,
                boxShadow: `0 0 12px ${voiceState.isListening ? 'rgba(244, 63, 94, 0.6)' : 'rgba(6, 182, 212, 0.6)'}`,
              }}
            />
          )}

          <button
            type="button"
            onClick={() => voiceAgent.toggleListening()}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer shadow-md relative z-10 ${
              voiceState.isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/50'
                : voiceState.isSpeaking
                ? 'bg-cyan-600 text-white shadow-cyan-500/50'
                : 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/40'
            }`}
            title={voiceState.isListening ? 'Listening (Click to stop)' : 'Talk to Max'}
          >
            {voiceState.isListening ? (
              <>
                <Radio className="w-3.5 h-3.5 text-white animate-spin" />
                <span>Listening...</span>
              </>
            ) : voiceState.isSpeaking ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                <span>Max Speaking</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Max Voice</span>
              </>
            )}

            {/* Equalizer Bars */}
            {(voiceState.isListening || voiceState.isSpeaking) && (
              <div className="flex items-center gap-0.5 ml-1">
                {[...Array(4)].map((_, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-white rounded-full soundwave-bar animate-soundwave"
                    style={{ height: `${6 + (i % 3) * 5}px` }}
                  />
                ))}
              </div>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => voiceAgent.toggleMute()}
          className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title={voiceState.isMuted ? 'Unmute Max Voice' : 'Mute Max Voice'}
        >
          {voiceState.isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  // Visual audio-reactive dynamic parameters for full commander
  const ringScale = 1 + (voiceState.audioLevel / 100) * 0.18;
  const ringBorderWidth = Math.min(4, Math.max(1.5, (voiceState.audioLevel / 100) * 3.5));
  const ringGlow = Math.min(35, 10 + voiceState.audioLevel * 0.35);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-[#070f26] to-slate-950 border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] p-3 sm:p-4 select-none space-y-3">
      {/* Top Header Bar: Title, Emotion Beacon & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2.5">
          {/* Holographic Avatar with live Emotion modulation */}
          <AgentAvatar
            size="sm"
            voiceState={voiceState}
            showStatusBadge={true}
            interactive={true}
          />

          <div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Max &bull; Voice &amp; TTS Hub
              </span>
              {/* Emotion Indicator Badge */}
              <span
                className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider border flex items-center space-x-1"
                style={{
                  color: voiceState.emotionDetails.primaryColor,
                  borderColor: `${voiceState.emotionDetails.primaryColor}55`,
                  backgroundColor: `${voiceState.emotionDetails.primaryColor}15`,
                }}
                title={voiceState.lastEmotionReason}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: voiceState.emotionDetails.primaryColor }}
                />
                <span>{voiceState.emotion}</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Active Voice Profile: <span className="text-cyan-300 font-semibold">{voiceState.selectedProfile.name}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher: Voice Commander | TTS Profiles | Emotion Matrix */}
        <div className="flex items-center space-x-1 self-start sm:self-center">
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setActiveSubTab('commander')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                activeSubTab === 'commander'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>Commander</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('preferences')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                activeSubTab === 'preferences'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3 text-purple-300" />
              <span>Voice Preferences</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('emotions')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                activeSubTab === 'emotions'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smile className="w-3 h-3 text-amber-300" />
              <span>Emotion</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => voiceAgent.toggleMute()}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title={voiceState.isMuted ? 'Unmute Max' : 'Mute Max'}
          >
            {voiceState.isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300" />}
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Primary Voice Commander & History */}
      {activeSubTab === 'commander' && (
        <div className="space-y-3">
          {/* Main Mic Button & Live Speech Feedback */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Interactive Primary Mic Orb with Visual Audio-Reactive Ring */}
            <div className="relative flex-shrink-0 flex items-center justify-center p-2">
              {/* AUDIO-REACTIVE REACTIVE PULSATING RING (User Requirement) */}
              <div
                className="absolute rounded-3xl pointer-events-none transition-all duration-100 ease-out"
                style={{
                  inset: voiceState.audioLevel > 0 ? `-${Math.min(16, Math.max(3, (voiceState.audioLevel / 100) * 14))}px` : '-2px',
                  border: `${ringBorderWidth}px solid ${
                    voiceState.isListening
                      ? 'rgba(244, 63, 94, 0.9)'
                      : voiceState.isSpeaking
                      ? 'rgba(6, 182, 212, 0.9)'
                      : 'rgba(99, 102, 241, 0.45)'
                  }`,
                  boxShadow:
                    voiceState.audioLevel > 0
                      ? `0 0 ${ringGlow}px ${
                          voiceState.isListening ? 'rgba(244, 63, 94, 0.7)' : 'rgba(6, 182, 212, 0.7)'
                        }`
                      : 'none',
                  transform: `scale(${ringScale})`,
                }}
              />

              {/* Secondary Ripple Wave when listening or speaking */}
              {(voiceState.isListening || voiceState.isSpeaking) && (
                <div
                  className="absolute -inset-3 rounded-3xl border border-dashed pointer-events-none animate-ping duration-1000 opacity-50"
                  style={{
                    borderColor: voiceState.isListening ? 'rgba(244, 63, 94, 0.6)' : 'rgba(6, 182, 212, 0.6)',
                  }}
                />
              )}

              {/* Voice Commander Core Button */}
              <button
                type="button"
                onClick={() => voiceAgent.toggleListening()}
                className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-lg ${
                  voiceState.isListening
                    ? 'bg-gradient-to-tr from-rose-600 to-amber-600 shadow-[0_0_25px_rgba(244,63,94,0.7)]'
                    : voiceState.isSpeaking
                    ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-[0_0_25px_rgba(6,182,212,0.7)]'
                    : 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                }`}
              >
                {voiceState.isListening ? (
                  <>
                    <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
                    <span className="text-[9px] font-black uppercase text-white mt-0.5 tracking-wider">Listening</span>
                  </>
                ) : voiceState.isSpeaking ? (
                  <>
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200 animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-cyan-100 mt-0.5 tracking-wider">Max</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300 group-hover:scale-110 transition duration-200" />
                    <span className="text-[9px] font-bold uppercase text-cyan-200 mt-0.5 tracking-wider">Tap to Speak</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Feedback Speech Bubble */}
            <div className="flex-1 w-full bg-slate-950/80 rounded-xl border border-slate-800/90 p-2.5 min-h-[58px] flex flex-col justify-center">
              {voiceState.isListening ? (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Live Audio Stream &bull; Speak instructions to Max</span>
                  </span>
                  <p className="text-xs text-white font-medium italic">
                    {voiceState.interimTranscript ? `"${voiceState.interimTranscript}"` : 'Listening for your voice command...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                      <span>Max Spoken Response ({voiceState.selectedProfile.name})</span>
                    </span>
                    {/* Speak again button */}
                    <button
                      type="button"
                      onClick={() => voiceAgent.speak(voiceState.lastResponse)}
                      className="text-[9px] text-cyan-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                      title="Re-speak response"
                    >
                      <Volume2 className="w-2.5 h-2.5" />
                      <span>Re-vocalize</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 font-semibold line-clamp-2">
                    {voiceState.lastResponse}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SCROLLABLE HISTORY LIST (Last 5 Transcribed Voice Commands) */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <History className="w-3 h-3 text-cyan-400" />
                <span>Transcribed Command History (Last 5)</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono">
                Click any command to re-run
              </span>
            </div>

            {/* Scrollable Container with Last 5 Commands */}
            <div className="max-h-28 overflow-y-auto no-scrollbar space-y-1.5 pr-0.5">
              {voiceState.commandHistory && voiceState.commandHistory.length > 0 ? (
                voiceState.commandHistory.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => handleRerunHistory(item.command)}
                    className="group flex items-center justify-between p-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer"
                    title={`Click to re-run: "${item.command}"`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="p-1 rounded-lg bg-slate-800 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 transition flex-shrink-0">
                        <RotateCcw className="w-3 h-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                          "{item.command}"
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5 text-[9px] text-slate-500 font-mono">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{item.timestamp}</span>
                          </span>
                          <span>&bull;</span>
                          <span className="text-cyan-400 uppercase font-semibold">
                            {item.intent.replace('NAV_', 'Go: ').replace('ACTION_', 'Do: ')}
                          </span>
                          {item.emotion && (
                            <>
                              <span>&bull;</span>
                              <span className="capitalize text-slate-400">{item.emotion}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2 py-1 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/25 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center space-x-1 flex-shrink-0 ml-2"
                    >
                      <span>Re-run</span>
                      <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-xs text-slate-500">
                  No voice commands transcribed yet. Speak to Max!
                </div>
              )}
            </div>
          </div>

          {/* Quick Voice Command Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1 mr-1">
              <Command className="w-3 h-3 text-slate-400" />
              <span>Quick Voice:</span>
            </span>

            <button
              type="button"
              onClick={() => executeQuickVoice('Show visualizer')}
              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-[10px] font-semibold text-cyan-300 transition cursor-pointer"
            >
              "Show visualizer"
            </button>

            <button
              type="button"
              onClick={() => executeQuickVoice('Run autonomous loop')}
              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 transition cursor-pointer"
            >
              "Run autonomous loop"
            </button>

            <button
              type="button"
              onClick={() => executeQuickVoice('Show urgent tasks')}
              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300 transition cursor-pointer"
            >
              "Show urgent tasks"
            </button>

            <button
              type="button"
              onClick={() => executeQuickVoice('What is system status?')}
              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-[10px] font-semibold text-amber-300 transition cursor-pointer"
            >
              "Check system status"
            </button>

            <button
              type="button"
              onClick={() => executeQuickVoice('Show knowledge clusters')}
              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-[10px] font-semibold text-purple-300 transition cursor-pointer"
            >
              "Knowledge clusters"
            </button>
          </div>

          {/* Keyboard Prompt Fallback */}
          <form onSubmit={handleSendText} className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={typedCommand}
                onChange={(e) => setTypedCommand(e.target.value)}
                placeholder="Type command to Max (e.g. 'Show tasks', 'Run loop')..."
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-sans"
              />
            </div>
            <button
              type="submit"
              disabled={!typedCommand.trim()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* SUB-VIEW 2: Voice Preferences Panel (Pitch, Rate, Volume & Profile Selector) */}
      {activeSubTab === 'preferences' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Voice Preferences &amp; Acoustic Calibration</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Adjust Max's speaking rate, pitch modulation, volume, and select from AI-generated neural profiles.
              </p>
            </div>
            {/* Auto-speak toggle */}
            <div className="flex items-center space-x-1.5">
              <input
                type="checkbox"
                id="autoSpeakToggle"
                checked={voiceState.autoSpeakReplies}
                onChange={(e) => voiceAgent.setSpeechSettings({ autoSpeakReplies: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500 cursor-pointer"
              />
              <label htmlFor="autoSpeakToggle" className="text-[10px] text-slate-300 font-semibold cursor-pointer select-none">
                Auto-vocalize replies
              </label>
            </div>
          </div>

          {/* Sliders Control Deck: Pitch, Speaking Rate, Volume */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Prosody &amp; Frequency Controls</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  voiceAgent.setSpeechSettings({
                    pitchMultiplier: 1.0,
                    rateMultiplier: 1.0,
                    volume: 1.0,
                  });
                  voiceAgent.speak('Voice parameters reset to baseline default.', { profileId: voiceState.selectedProfileId });
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 transition cursor-pointer"
                title="Reset sliders to default 1.0x"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Speaking Rate Slider */}
              <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Speaking Rate:</span>
                  <span className="font-mono text-cyan-300 font-bold">{voiceState.rateMultiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={voiceState.rateMultiplier}
                  onChange={(e) => voiceAgent.setSpeechSettings({ rateMultiplier: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-0.5">
                  <span>0.5x Slow</span>
                  <span>1.0x Normal</span>
                  <span>2.0x Rapid</span>
                </div>
              </div>

              {/* Pitch Adjustment Slider */}
              <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Vocal Pitch:</span>
                  <span className="font-mono text-purple-300 font-bold">{voiceState.pitchMultiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={voiceState.pitchMultiplier}
                  onChange={(e) => voiceAgent.setSpeechSettings({ pitchMultiplier: Number(e.target.value) })}
                  className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-0.5">
                  <span>0.5x Deep Bass</span>
                  <span>1.0x Natural</span>
                  <span>1.8x Treble</span>
                </div>
              </div>

              {/* Volume Gain Slider */}
              <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Volume Gain:</span>
                  <span className="font-mono text-emerald-300 font-bold">{Math.round((voiceState.volume || 1.0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={voiceState.volume ?? 1.0}
                  onChange={(e) => voiceAgent.setSpeechSettings({ volume: Number(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-0.5">
                  <span>10% Low</span>
                  <span>50%</span>
                  <span>100% Full</span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Profile Selection Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Bot className="w-3 h-3 text-purple-400" />
                <span>Select AI-Generated Voice Profile ({AI_VOICE_PROFILES.length})</span>
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Click card to activate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AI_VOICE_PROFILES.map((profile) => {
                const isSelected = voiceState.selectedProfileId === profile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => handleSelectProfile(profile.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-500/20 ring-1 ring-purple-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: profile.soundColor }}
                          />
                          <h4 className="font-bold text-xs text-white leading-tight">{profile.name}</h4>
                        </div>
                        <span
                          className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase"
                          style={{
                            color: profile.soundColor,
                            backgroundColor: `${profile.soundColor}20`,
                            border: `1px solid ${profile.soundColor}40`,
                          }}
                        >
                          {profile.avatarBadge}
                        </span>
                      </div>

                      <p className="text-[10px] text-purple-300 font-semibold mt-1">{profile.tone}</p>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {profile.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">
                        Base: {profile.basePitch}x pitch &bull; {profile.baseRate}x rate
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          voiceAgent.speak(
                            `This is ${profile.name}. Neural vocal synthesis calibrated and ready.`,
                            { profileId: profile.id }
                          );
                        }}
                        className="px-2 py-0.5 rounded-md bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5" />
                        <span>Sample</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Speech Synthesis Studio Box */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Test Spoken Response with Calibrated Voice</span>
              </span>
              <div className="flex items-center space-x-1">
                {(['Telemetry check', 'Task scheduled', 'Level 5 active'] as const).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      if (chip === 'Telemetry check') setCustomTtsText('Max telemetry optimal. All systems functioning with Level 5 safeguards.');
                      if (chip === 'Task scheduled') setCustomTtsText('Task scheduled with high priority under EduCore Platform.');
                      if (chip === 'Level 5 active') setCustomTtsText('Level 5 Gated Autonomy active. All operations require cryptographic human approval.');
                    }}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={customTtsText}
              onChange={(e) => setCustomTtsText(e.target.value)}
              placeholder="Type any sentence to hear Max vocalize it with the selected profile, rate, and pitch..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-mono">
                Effective: {((voiceState.selectedProfile.baseRate || 1.0) * voiceState.rateMultiplier).toFixed(2)}x rate &bull; {((voiceState.selectedProfile.basePitch || 1.0) * voiceState.pitchMultiplier).toFixed(2)}x pitch
              </span>

              <button
                type="button"
                onClick={handleTestTts}
                disabled={isTestingSpeech || !customTtsText.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audition Voice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: AgentEmotion State & Sentiment Feedback Matrix */}
      {activeSubTab === 'emotions' && (
        <div className="space-y-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span>AgentEmotion State &amp; Sentiment Feedback</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Max modulates appearance, visor symbology, animations, and speech prosody based on sentiment.
              </p>
            </div>

            {/* Current Emotion Pill */}
            <div
              className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold border flex items-center space-x-1.5"
              style={{
                color: voiceState.emotionDetails.primaryColor,
                borderColor: `${voiceState.emotionDetails.primaryColor}66`,
                backgroundColor: `${voiceState.emotionDetails.primaryColor}15`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: voiceState.emotionDetails.primaryColor }}
              />
              <span className="uppercase">{voiceState.emotion}</span>
            </div>
          </div>

          {/* Current Emotion Detail Banner */}
          <div
            className="p-3 rounded-xl border space-y-1.5"
            style={{
              backgroundColor: `${voiceState.emotionDetails.primaryColor}0d`,
              borderColor: `${voiceState.emotionDetails.primaryColor}40`,
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <span>Active State: {voiceState.emotionDetails.label}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Sentiment: {voiceState.emotionDetails.sentiment}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {voiceState.emotionDetails.description}
            </p>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center space-x-1">
              <span className="font-semibold text-slate-300">Trigger:</span>
              <span className="italic">{voiceState.lastEmotionReason}</span>
            </div>
          </div>

          {/* EMOTION SHIFT HISTORY TIMELINE LOG */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Max Emotion Shift History Timeline
                </h4>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  {filteredEmotionHistory.length} recorded
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleExportEmotionHistory}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Export emotion shifts log to JSON"
                >
                  <Download className="w-2.5 h-2.5" />
                  <span>Export JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => voiceAgent.clearEmotionHistory()}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Clear history log"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900">
              {/* Search input */}
              <div className="relative flex-1 min-w-[140px] max-w-xs">
                <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                <input
                  type="text"
                  value={emotionSearchQuery}
                  onChange={(e) => setEmotionSearchQuery(e.target.value)}
                  placeholder="Search triggers & sentiments..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Emotion filter chips */}
              <div className="flex flex-wrap items-center gap-1">
                {(['all', 'neutral', 'curious', 'focused', 'triumphant', 'alert', 'empathetic'] as const).map((em) => {
                  const isSel = emotionFilter === em;
                  const color = em === 'all' ? '#94a3b8' : EMOTION_CONFIGS[em]?.primaryColor;
                  return (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmotionFilter(em)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition cursor-pointer flex items-center space-x-1 ${
                        isSel
                          ? 'bg-slate-800 text-white border border-slate-600'
                          : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {em !== 'all' && (
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      )}
                      <span>{em}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeline Scroll List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar pt-1">
              {filteredEmotionHistory.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
                  No emotional state shifts match the selected filters.
                </div>
              ) : (
                filteredEmotionHistory.map((item, index) => {
                  const toConf = EMOTION_CONFIGS[item.toEmotion] || EMOTION_CONFIGS.neutral;
                  const fromConf = EMOTION_CONFIGS[item.fromEmotion] || EMOTION_CONFIGS.neutral;
                  const isLatest = index === 0;

                  return (
                    <div
                      key={item.id}
                      className={`relative pl-5 pb-2.5 transition-all ${
                        index !== filteredEmotionHistory.length - 1 ? 'border-l border-slate-800/80 ml-2.5' : 'ml-2.5'
                      }`}
                    >
                      {/* Timeline Dot Node */}
                      <span
                        className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                          isLatest ? 'animate-pulse ring-2 ring-cyan-400/50' : ''
                        }`}
                        style={{ backgroundColor: toConf.primaryColor }}
                      />

                      {/* Timeline Card */}
                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                          {/* Shift visual: From -> To */}
                          <div className="flex items-center space-x-1.5">
                            <span
                              className="px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px]"
                              style={{
                                color: fromConf.primaryColor,
                                backgroundColor: `${fromConf.primaryColor}15`,
                                border: `1px solid ${fromConf.primaryColor}40`,
                              }}
                            >
                              {item.fromEmotion}
                            </span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                            <span
                              className="px-1.5 py-0.5 rounded font-mono font-bold uppercase text-[9px] flex items-center space-x-1"
                              style={{
                                color: toConf.primaryColor,
                                backgroundColor: `${toConf.primaryColor}20`,
                                border: `1px solid ${toConf.primaryColor}60`,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: toConf.primaryColor }} />
                              <span>{item.toEmotion}</span>
                            </span>

                            {isLatest && (
                              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
                                Current
                              </span>
                            )}
                          </div>

                          {/* Time & Duration badge */}
                          <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-mono">
                            <span className="flex items-center space-x-1">
                              <Clock className="w-2.5 h-2.5 text-slate-500" />
                              <span>{item.timestamp}</span>
                            </span>
                            {item.durationSeconds && (
                              <span className="text-slate-500">
                                ({item.durationSeconds > 60 ? `${Math.floor(item.durationSeconds / 60)}m ${item.durationSeconds % 60}s` : `${item.durationSeconds}s`})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Trigger Reason */}
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {item.reason}
                        </p>

                        {/* Card Footer: Sentiment, Source & Re-adopt Button */}
                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-800/60 text-[9px]">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-400">
                              Sentiment: <strong className="text-slate-300">{item.sentiment}</strong>
                            </span>
                            {item.triggerSource && (
                              <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono text-[8px]">
                                {item.triggerSource.replace('_', ' ')}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              voiceAgent.setEmotion(item.toEmotion, `Re-adopted from timeline shift event (${item.timestamp})`, 'manual_studio');
                              voiceAgent.speak(`Max re-adopted emotional state: ${toConf.label}.`);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-200 border border-slate-700/60 hover:border-cyan-500/50 font-bold transition flex items-center space-x-1 cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Re-adopt State</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Manual Emotion Modulation Sandbox */}
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 mb-1.5 block">
              Simulate Sentiment &amp; Test Emotion States:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(EMOTION_CONFIGS) as AgentEmotion[]).map((em) => {
                const conf = EMOTION_CONFIGS[em];
                const isCurrent = voiceState.emotion === em;
                return (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      voiceAgent.setEmotion(em, `User manually selected ${conf.label} state in Emotion Studio.`, 'manual_studio');
                      voiceAgent.speak(`Max emotion transitioned to ${conf.label}.`);
                    }}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center space-x-2 ${
                      isCurrent
                        ? 'border-white bg-slate-900 shadow-md ring-1 ring-white/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <AgentAvatar size="sm" emotionOverride={em} showStatusBadge={false} interactive={false} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white capitalize truncate">{em}</p>
                      <p className="text-[9px] text-slate-400 truncate">{conf.sentiment}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
