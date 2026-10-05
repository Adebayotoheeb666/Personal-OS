import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Radio,
  Cpu,
  Activity,
  AlertTriangle,
  Flame,
  Heart,
  Search,
  Zap,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { VoiceState, voiceAgent, EMOTION_CONFIGS } from '../services/voiceAgentService';
import { AgentEmotion } from '../types/agent';

interface AgentAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isThinking?: boolean;
  voiceState?: VoiceState;
  emotionOverride?: AgentEmotion;
  showStatusBadge?: boolean;
  showEmotionPill?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  size = 'md',
  isThinking = false,
  voiceState,
  emotionOverride,
  showStatusBadge = true,
  showEmotionPill = false,
  interactive = true,
  onClick,
}) => {
  // Subscribe to live voiceAgent state if not provided
  const [internalVoiceState, setInternalVoiceState] = useState<VoiceState>(voiceAgent.state);

  useEffect(() => {
    if (voiceState) return;
    const unsub = voiceAgent.subscribe((st) => setInternalVoiceState(st));
    return unsub;
  }, [voiceState]);

  const currentState = voiceState || internalVoiceState;
  const isListening = currentState.isListening;
  const isSpeaking = currentState.isSpeaking;

  // Active emotion: explicit prop override, or state emotion
  const emotion: AgentEmotion = emotionOverride || currentState.emotion || 'neutral';
  const emotionConfig = EMOTION_CONFIGS[emotion] || EMOTION_CONFIGS.neutral;

  // Size configurations
  const dimensions = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', ring: 'w-10 h-10', badge: 'text-[8px] px-1 py-0.2' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', ring: 'w-12 h-12', badge: 'text-[9px] px-1.5 py-0.5' },
    lg: { box: 'w-16 h-16', icon: 'w-8 h-8', ring: 'w-20 h-20', badge: 'text-[10px] px-2 py-0.5' },
    xl: { box: 'w-24 h-24', icon: 'w-12 h-12', ring: 'w-32 h-32', badge: 'text-xs px-2.5 py-1' },
  }[size];

  // Dynamic glow color based on emotion + operational state
  const glowColor = isListening
    ? 'rgba(244, 63, 94, 0.85)' // Rose (Listening takes visual urgency)
    : isSpeaking
    ? 'rgba(6, 182, 212, 0.85)' // Cyan (Speaking)
    : emotionConfig.glowColor;

  // Animation parameters tailored per emotion
  const getFloatAnimate = () => {
    switch (emotion) {
      case 'triumphant':
        return { y: [-7, 5, -7], rotate: [-3, 3, -3], scale: [1, 1.05, 1], x: 0 };
      case 'alert':
        return { x: [-2, 2, -1, 1, 0], y: [-2, 2, -2], scale: [1, 1.05, 1], rotate: 0 };
      case 'focused':
        return { y: [-1.5, 1.5, -1.5], rotate: [-0.8, 0.8, -0.8], scale: 1, x: 0 };
      case 'curious':
        return { y: [-4, 3, -4], rotate: [-4, 6, -4], scale: 1, x: 0 };
      case 'empathetic':
        return { y: [-4, 4, -4], scale: [1, 1.03, 1], rotate: 0, x: 0 };
      default:
        return { y: [-3, 3, -3], rotate: [-1.5, 1.5, -1.5], scale: 1, x: 0 };
    }
  };

  const getFloatTransition = () => {
    switch (emotion) {
      case 'triumphant':
        return { repeat: Infinity, duration: 2.2, ease: 'easeInOut' as const };
      case 'alert':
        return { repeat: Infinity, duration: 0.8, ease: 'easeInOut' as const };
      case 'focused':
        return { repeat: Infinity, duration: 2.0, ease: 'easeInOut' as const };
      case 'curious':
        return { repeat: Infinity, duration: 2.8, ease: 'easeInOut' as const };
      case 'empathetic':
        return { repeat: Infinity, duration: 4.5, ease: 'easeInOut' as const };
      default:
        return { repeat: Infinity, duration: 3.5, ease: 'easeInOut' as const };
    }
  };

  const getOrbitalDuration = () => {
    if (isThinking || emotion === 'focused') return 4;
    if (emotion === 'alert') return 3;
    if (emotion === 'triumphant') return 6;
    if (emotion === 'empathetic') return 20;
    return 14;
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      }`}
      title={`Max (Autonomous Agentic AI) • State: ${emotionConfig.label} (${currentState.lastEmotionReason})`}
    >
      {/* Outer Holographic Ambient Aura */}
      <motion.div
        animate={{
          scale: isSpeaking || isListening ? [1, 1.3, 1] : [1, 1.12, 1],
          opacity: isSpeaking || isListening ? [0.65, 0.95, 0.65] : [0.4, 0.7, 0.4],
        }}
        transition={{
          repeat: Infinity,
          duration: isSpeaking || isListening ? 1.4 : emotionConfig.pulseSpeed,
          ease: 'easeInOut',
        }}
        className={`absolute rounded-full pointer-events-none blur-md ${dimensions.ring}`}
        style={{ background: glowColor }}
      />

      {/* Rotating Cybernetic Orbital Outer Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: getOrbitalDuration(), ease: 'linear' }}
        className={`absolute rounded-full border border-dashed pointer-events-none ${dimensions.ring}`}
        style={{
          borderColor: isListening ? '#f43f5e' : emotionConfig.primaryColor,
          opacity: 0.55,
        }}
      />

      {/* Floating 3D-Style Head / Cybernetic Core Container */}
      <motion.div
        animate={getFloatAnimate()}
        transition={getFloatTransition()}
        whileHover={interactive ? { scale: 1.1 } : undefined}
        whileTap={interactive ? { scale: 0.94 } : undefined}
        className={`relative ${dimensions.box} rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/90 border shadow-md flex items-center justify-center p-0.5 overflow-hidden transition-colors duration-300`}
        style={{
          borderColor: isListening ? '#f43f5e' : emotionConfig.primaryColor,
          boxShadow: `0 0 20px ${glowColor}, inset 0 1px 1px rgba(255,255,255,0.25)`,
        }}
      >
        {/* Holographic Scanline Shimmer Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent bg-[length:100%_4px] opacity-40 pointer-events-none animate-pulse"
        />

        {/* 3D Cyber Head Symbol / Hologram Face */}
        <div className="relative w-full h-full rounded-[14px] bg-gradient-to-b from-slate-900/60 to-slate-950 flex flex-col items-center justify-center">
          {/* Neural Crown / Halo Filaments (Modulated by Emotion) */}
          <div className="flex items-center space-x-1 mb-0.5">
            <span
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                isThinking ? 'bg-purple-400 animate-ping' : 'bg-cyan-400'
              }`}
              style={{ backgroundColor: emotionConfig.primaryColor }}
            />
            <span
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                isSpeaking ? 'bg-cyan-300 animate-bounce' : 'bg-indigo-400'
              }`}
            />
            <span
              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                isListening ? 'bg-rose-400 animate-ping' : 'bg-cyan-400'
              }`}
              style={{ backgroundColor: emotionConfig.primaryColor }}
            />
          </div>

          {/* Ocular Visor / Cyber Face Symbol (Modulated by Emotion & State) */}
          <div className="relative flex items-center justify-center">
            {isListening ? (
              <Radio className={`${dimensions.icon} text-rose-300 animate-spin`} />
            ) : isSpeaking ? (
              <Activity className={`${dimensions.icon} text-cyan-300 animate-pulse`} />
            ) : isThinking ? (
              <Cpu className={`${dimensions.icon} text-purple-300 animate-pulse`} />
            ) : emotion === 'triumphant' ? (
              <Sparkles
                className={`${dimensions.icon} text-emerald-300 animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]`}
              />
            ) : emotion === 'alert' ? (
              <AlertTriangle
                className={`${dimensions.icon} text-rose-400 animate-bounce drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]`}
              />
            ) : emotion === 'focused' ? (
              <Zap
                className={`${dimensions.icon} text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]`}
              />
            ) : emotion === 'curious' ? (
              <Search
                className={`${dimensions.icon} text-sky-300 drop-shadow-[0_0_8px_rgba(14,165,233,0.9)]`}
              />
            ) : emotion === 'empathetic' ? (
              <Heart
                className={`${dimensions.icon} text-pink-300 fill-pink-500/30 drop-shadow-[0_0_8px_rgba(244,114,182,0.9)]`}
              />
            ) : (
              <Bot
                className={`${dimensions.icon} text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]`}
              />
            )}
          </div>
        </div>

        {/* Dynamic Light Specular Glint */}
        <motion.div
          animate={{ x: [-35, 45] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1 }}
          className="absolute inset-0 w-3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
        />
      </motion.div>

      {/* Online / Emotion Status Beacon */}
      {showStatusBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 shadow-sm transition-all duration-300`}
          style={{
            backgroundColor: isListening ? '#f43f5e' : emotionConfig.primaryColor,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
        />
      )}

      {/* Optional Emotion Pill (for extended displays) */}
      {showEmotionPill && (
        <div
          className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap uppercase tracking-widest font-mono font-extrabold rounded-full border ${dimensions.badge} bg-slate-950/90 shadow-md flex items-center space-x-1 pointer-events-none`}
          style={{
            color: emotionConfig.primaryColor,
            borderColor: `${emotionConfig.primaryColor}55`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: emotionConfig.primaryColor }}
          />
          <span>{emotion}</span>
        </div>
      )}
    </div>
  );
};
