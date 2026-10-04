import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Radio,
  Volume2,
  CheckCircle2,
  Zap,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { voiceAgent, VoiceState } from '../services/voiceAgentService';

export type AbimbolaOperationState = 'Analyzing' | 'Processing' | 'Synthesizing' | 'Idle';

export const AgentStatus: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isThinking, activeLoopTrace } = useAgent();
  const [voiceState, setVoiceState] = useState<VoiceState>(voiceAgent.state);
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    const unsub = voiceAgent.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsub();
  }, []);

  // Idle heartbeat ticker to showcase autonomous vigilance
  useEffect(() => {
    const timer = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Determine current context of Abimbola's internal operations
  let status: AbimbolaOperationState = 'Idle';
  let contextDetails = 'Level 5 Gated Autonomy &bull; Continuous Context Ready';
  let icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
  let colorClasses = {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400',
    pulse: 'shadow-[0_0_8px_rgba(52,211,153,0.8)]',
  };

  if (voiceState.isSpeaking) {
    status = 'Synthesizing';
    contextDetails = 'Generating Real-Time Neural Speech & Audio Stream';
    icon = <Volume2 className="w-3.5 h-3.5 text-cyan-300 animate-bounce" />;
    colorClasses = {
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      dot: 'bg-cyan-400',
      pulse: 'shadow-[0_0_8px_rgba(6,182,212,0.8)]',
    };
  } else if (voiceState.isListening) {
    status = 'Analyzing';
    contextDetails = 'Parsing Acoustic Spectrum & Natural Intent';
    icon = <Radio className="w-3.5 h-3.5 text-rose-300 animate-spin" />;
    colorClasses = {
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dot: 'bg-rose-400',
      pulse: 'shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    };
  } else if (isThinking) {
    // When executing autonomous loop, switch between Analyzing and Processing
    if (cycleIndex % 2 === 0) {
      status = 'Analyzing';
      contextDetails = 'AST Invariants & World Model Continuity Verification';
      icon = <Activity className="w-3.5 h-3.5 text-amber-300 animate-pulse" />;
      colorClasses = {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        dot: 'bg-amber-400',
        pulse: 'shadow-[0_0_8px_rgba(245,158,11,0.8)]',
      };
    } else {
      status = 'Processing';
      contextDetails = 'Executing Sandboxed State Transitions & Memory Sync';
      icon = <Cpu className="w-3.5 h-3.5 text-purple-300 animate-pulse" />;
      colorClasses = {
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        dot: 'bg-purple-400',
        pulse: 'shadow-[0_0_8px_rgba(168,85,247,0.8)]',
      };
    }
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-1.5 text-[10px]">
        <span className={`w-2 h-2 rounded-full ${colorClasses.dot} ${colorClasses.pulse} animate-pulse`} />
        <span className="font-mono font-bold uppercase tracking-wider text-slate-300">
          Abimbola:
        </span>
        <span
          className={`px-1.5 py-0.2 rounded-full font-bold uppercase font-mono border text-[9px] ${colorClasses.badge}`}
        >
          {status}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] select-none">
      <div className="flex items-center space-x-1.5">
        <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <span>Abimbola Internal Ops:</span>
        </span>

        {/* Real-time Operation Badge */}
        <div
          className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full font-mono font-bold uppercase text-[9px] sm:text-[10px] border shadow-sm ${colorClasses.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${colorClasses.dot} animate-pulse`} />
          <span>{status}</span>
        </div>

        {/* Emotion State Badge */}
        <div
          className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-full font-mono text-[9px] font-bold border uppercase tracking-wider"
          style={{
            color: voiceState.emotionDetails.primaryColor,
            borderColor: `${voiceState.emotionDetails.primaryColor}55`,
            backgroundColor: `${voiceState.emotionDetails.primaryColor}15`,
          }}
          title={`Abimbola Emotion: ${voiceState.emotionDetails.label} - ${voiceState.lastEmotionReason}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: voiceState.emotionDetails.primaryColor }}
          />
          <span>{voiceState.emotion}</span>
        </div>
      </div>

      <span className="text-slate-600 hidden md:inline">&bull;</span>

      {/* Dynamic Context Description */}
      <span className="text-slate-400 hidden md:inline truncate max-w-xs lg:max-w-md">
        {contextDetails}
      </span>
    </div>
  );
};
