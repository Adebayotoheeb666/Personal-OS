/**
 * Voice Interaction & Emotion Modulation Service for Abimbola - Autonomous Agentic AI
 * Provides Web Speech Recognition (STT), AI-Generated Voice Profile Speech Synthesis (TTS),
 * Audio Frequency Waveform Simulation, Voice Command History, Sentiment-Driven AgentEmotion, and Intent Parsing.
 */

import { AgentEmotion, EmotionDetails } from '../types/agent';

export interface VoiceCommandHistoryItem {
  id: string;
  timestamp: string;
  command: string;
  intent: string;
  response: string;
  emotion?: AgentEmotion;
}

export interface VoiceProfile {
  id: string;
  name: string;
  tagline: string;
  tone: string;
  description: string;
  basePitch: number;
  baseRate: number;
  volume: number;
  avatarBadge: string;
  soundColor: string;
  preferredVoices: string[];
}

export const AI_VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'abimbola-cyber-core',
    name: 'Abimbola Cybernetic Core',
    tagline: 'Primary Neural AI Core',
    tone: 'Crisp, Authoritative & Cybernetic',
    description: 'Ultra-clear synthetic prosody with subtle cybernetic cadence, optimized for system telemetry and execution directives.',
    basePitch: 1.05,
    baseRate: 1.05,
    volume: 1.0,
    avatarBadge: 'CYBER-CORE',
    soundColor: '#06b6d4', // Cyan
    preferredVoices: ['Google US English', 'Alex', 'Samantha', 'Natural', 'en-US'],
  },
  {
    id: 'abimbola-synth-prime',
    name: 'Abimbola Synthesizer Prime',
    tagline: 'Warm & Empathetic AI',
    tone: 'Melodic, Reassuring & Warm',
    description: 'Naturalistic vocal cadence with warm harmonic overtones, ideal for collaborative planning and personal coaching.',
    basePitch: 1.15,
    baseRate: 0.98,
    volume: 1.0,
    avatarBadge: 'PRIME-WARMTH',
    soundColor: '#f43f5e', // Rose
    preferredVoices: ['Samantha', 'Google UK English Female', 'Victoria', 'en-GB'],
  },
  {
    id: 'abimbola-quantum-oracle',
    name: 'Abimbola Quantum Oracle',
    tagline: 'Deep Resonant Architecture',
    tone: 'Gravitational, Deep & Deliberate',
    description: 'Low-frequency resonant resonance designed for architectural synthesis, high-stakes security reviews, and strategic world modeling.',
    basePitch: 0.82,
    baseRate: 0.92,
    volume: 1.0,
    avatarBadge: 'ORACLE-DEEP',
    soundColor: '#8b5cf6', // Violet
    preferredVoices: ['Daniel', 'Google UK English Male', 'Fred', 'en-US'],
  },
  {
    id: 'abimbola-rapid-velocity',
    name: 'Abimbola Rapid Velocity',
    tagline: 'High-Speed Autonomous Operator',
    tone: 'Accelerated, Focused & Staccato',
    description: 'High-speed audio transmission designed for power users who want rapid-fire briefings and quick milestone recaps.',
    basePitch: 1.02,
    baseRate: 1.25,
    volume: 1.0,
    avatarBadge: 'VELOCITY-X',
    soundColor: '#10b981', // Emerald
    preferredVoices: ['Google US English', 'Alex', 'en-US'],
  },
  {
    id: 'abimbola-nova',
    name: 'Abimbola Nova',
    tagline: 'Visionary & High-Energy',
    tone: 'Bright, Radiant & Uplifting',
    description: 'Sparkling high-energy cadence that elevates motivation, highlights project milestones, and celebrates goal breakthroughs.',
    basePitch: 1.25,
    baseRate: 1.10,
    volume: 1.0,
    avatarBadge: 'NOVA-BRIGHT',
    soundColor: '#f59e0b', // Amber
    preferredVoices: ['Karen', 'Google US English', 'Samantha', 'en-US'],
  },
];

export const EMOTION_CONFIGS: Record<AgentEmotion, EmotionDetails> = {
  neutral: {
    emotion: 'neutral',
    label: 'Neutral Equilibrium',
    sentiment: 'neutral',
    description: 'Calm, balanced baseline cognitive state with steady sensory equilibrium.',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    primaryColor: '#06b6d4',
    facialVisor: 'calm',
    pulseSpeed: 3.5,
  },
  curious: {
    emotion: 'curious',
    label: 'Curious Inquisitive',
    sentiment: 'analytical',
    description: 'Exploratory mode active. Inquiring into data patterns, user intent, or ontological connections.',
    glowColor: 'rgba(14, 165, 233, 0.75)',
    primaryColor: '#0ea5e9',
    facialVisor: 'inquisitive',
    pulseSpeed: 2.2,
  },
  focused: {
    emotion: 'focused',
    label: 'Deep Hyper-Focus',
    sentiment: 'analytical',
    description: 'Synthesizing complex code, AST patterns, or executing autonomous reasoning loops.',
    glowColor: 'rgba(168, 85, 247, 0.85)',
    primaryColor: '#a855f7',
    facialVisor: 'tensor',
    pulseSpeed: 1.4,
  },
  triumphant: {
    emotion: 'triumphant',
    label: 'Triumphant Milestone',
    sentiment: 'positive',
    description: 'Goal accomplished, tests passing in sandbox, or successful autonomous execution.',
    glowColor: 'rgba(16, 185, 129, 0.85)',
    primaryColor: '#10b981',
    facialVisor: 'radiant',
    pulseSpeed: 1.0,
  },
  alert: {
    emotion: 'alert',
    label: 'System Vigilance / Alert',
    sentiment: 'negative',
    description: 'Stale context decay detected, critical security boundary warning, or blocker requiring attention.',
    glowColor: 'rgba(239, 68, 68, 0.9)',
    primaryColor: '#ef4444',
    facialVisor: 'warning',
    pulseSpeed: 0.75,
  },
  empathetic: {
    emotion: 'empathetic',
    label: 'Empathetic Resonance',
    sentiment: 'positive',
    description: 'Harmonious human-agent collaboration, supportive guidance, and personalized alignment.',
    glowColor: 'rgba(244, 114, 182, 0.8)',
    primaryColor: '#f472b6',
    facialVisor: 'tender',
    pulseSpeed: 4.2,
  },
};

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  lastResponse: string;
  audioLevel: number;
  mode: 'push-to-talk' | 'continuous';
  isMuted: boolean;
  commandHistory: VoiceCommandHistoryItem[];

  // AgentEmotion state
  emotion: AgentEmotion;
  emotionDetails: EmotionDetails;
  lastEmotionReason: string;

  // AI-Generated Voice Profile State
  selectedProfileId: string;
  selectedProfile: VoiceProfile;
  pitchMultiplier: number;
  rateMultiplier: number;
  volume: number;
  autoSpeakReplies: boolean;
}

export type VoiceCommandHandler = (command: string, recognizedIntent: string, feedbackSpeech: string) => void;

class VoiceAgentService {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: ((state: VoiceState) => void)[] = [];
  private commandHandlers: VoiceCommandHandler[] = [];
  private audioInterval: any = null;

  public state: VoiceState = {
    isListening: false,
    isSpeaking: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    lastResponse: 'Abimbola Voice Assistant initialized. Say "Show visualizer", "Show tasks", or "Run loop".',
    audioLevel: 0,
    mode: 'push-to-talk',
    isMuted: false,
    commandHistory: [
      {
        id: 'hist-1',
        timestamp: 'Just now',
        command: 'Show visualizer',
        intent: 'NAV_VISUALIZER',
        response: 'Navigating to Holographic Agentic AI Ecosystem Visualizer.',
        emotion: 'curious',
      },
      {
        id: 'hist-2',
        timestamp: '2m ago',
        command: 'Check system status',
        intent: 'ACTION_STATUS_CHECK',
        response: 'Abimbola System Health is at 98% optimal with Level 5 Gated Autonomy.',
        emotion: 'neutral',
      },
      {
        id: 'hist-3',
        timestamp: '5m ago',
        command: 'Show urgent tasks',
        intent: 'ACTION_URGENT_TASKS',
        response: 'Analyzing task priorities. Showing highest urgency milestones.',
        emotion: 'focused',
      },
      {
        id: 'hist-4',
        timestamp: '8m ago',
        command: 'Run autonomous loop',
        intent: 'ACTION_RUN_LOOP',
        response: 'Triggering Level 5 autonomous reasoning loop.',
        emotion: 'focused',
      },
      {
        id: 'hist-5',
        timestamp: '12m ago',
        command: 'Celebrate milestone',
        intent: 'AGENT_CHAT',
        response: 'Milestone reached! EduCore AST challenge suite completed.',
        emotion: 'triumphant',
      },
    ],
    // Emotion
    emotion: 'neutral',
    emotionDetails: EMOTION_CONFIGS.neutral,
    lastEmotionReason: 'System initialized in neutral baseline equilibrium.',

    // Voice Profile
    selectedProfileId: 'abimbola-cyber-core',
    selectedProfile: AI_VOICE_PROFILES[0],
    pitchMultiplier: 1.0,
    rateMultiplier: 1.0,
    volume: 1.0,
    autoSpeakReplies: true,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      // Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }

      // Load saved preferences if available
      try {
        const savedProfileId = localStorage.getItem('abimbola_voice_profile_id');
        if (savedProfileId) {
          const match = AI_VOICE_PROFILES.find((p) => p.id === savedProfileId);
          if (match) {
            this.state.selectedProfileId = match.id;
            this.state.selectedProfile = match;
          }
        }
      } catch (e) {
        // ignore
      }

      // Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.state.isSupported = true;
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-US';

          this.recognition.onstart = () => {
            this.state.isListening = true;
            this.state.interimTranscript = '';
            this.startSimulatedAudioMeter();
            this.notify();
          };

          this.recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                final += event.results[i][0].transcript;
              } else {
                interim += event.results[i][0].transcript;
              }
            }

            this.state.interimTranscript = interim;
            if (final) {
              this.state.transcript = final;
              this.handleVoiceInput(final);
            }
            this.notify();
          };

          this.recognition.onerror = (event: any) => {
            console.warn('Speech recognition notice:', event.error);
            this.state.isListening = false;
            this.stopSimulatedAudioMeter();
            this.notify();
          };

          this.recognition.onend = () => {
            this.state.isListening = false;
            this.stopSimulatedAudioMeter();
            this.notify();

            // Auto-restart if in continuous mode
            if (this.state.mode === 'continuous' && !this.state.isSpeaking) {
              setTimeout(() => {
                if (this.state.mode === 'continuous' && !this.state.isListening) {
                  this.startListening();
                }
              }, 400);
            }
          };
        } catch (e) {
          console.warn('Speech recognition init error:', e);
          this.state.isSupported = false;
        }
      }
    }
  }

  public subscribe(listener: (state: VoiceState) => void) {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public onCommand(handler: VoiceCommandHandler) {
    this.commandHandlers.push(handler);
    return () => {
      this.commandHandlers = this.commandHandlers.filter((h) => h !== handler);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  // --- Emotion State Modulation Engine ---

  /**
   * Directly set Abimbola's emotion with an explanation
   */
  public setEmotion(emotion: AgentEmotion, reason?: string) {
    this.state.emotion = emotion;
    this.state.emotionDetails = EMOTION_CONFIGS[emotion];
    if (reason) {
      this.state.lastEmotionReason = reason;
    }
    this.notify();
  }

  /**
   * Evaluates text sentiment from user speech, chat prompt, or system event
   * and dynamically modulates the AgentEmotion
   */
  public analyzeSentimentAndSetEmotion(text: string, source: 'user' | 'system' = 'user'): AgentEmotion {
    const raw = text.toLowerCase();

    // 1. Alert / Critical / Stale
    if (
      raw.includes('warning') ||
      raw.includes('decay') ||
      raw.includes('stale') ||
      raw.includes('critical') ||
      raw.includes('fail') ||
      raw.includes('danger') ||
      raw.includes('alert') ||
      raw.includes('error') ||
      raw.includes('broken') ||
      raw.includes('breach') ||
      raw.includes('blocker')
    ) {
      const reason = source === 'user' ? 'User identified system hazard or stale context.' : 'System notification alert detected.';
      this.setEmotion('alert', reason);
      return 'alert';
    }

    // 2. Triumphant / Milestone / Success
    if (
      raw.includes('passed') ||
      raw.includes('success') ||
      raw.includes('approved') ||
      raw.includes('congrats') ||
      raw.includes('perfect') ||
      raw.includes('excellent') ||
      raw.includes('done') ||
      raw.includes('triumph') ||
      raw.includes('great') ||
      raw.includes('awesome') ||
      raw.includes('100%') ||
      raw.includes('celebrate')
    ) {
      const reason = source === 'user' ? 'User celebrated milestone or verified success.' : 'Milestone achieved with 100% fidelity.';
      this.setEmotion('triumphant', reason);
      return 'triumphant';
    }

    // 3. Focused / Deep Execution / AST / Loop
    if (
      raw.includes('loop') ||
      raw.includes('autonomous') ||
      raw.includes('compile') ||
      raw.includes('sandbox') ||
      raw.includes('refactor') ||
      raw.includes('ast') ||
      raw.includes('build') ||
      raw.includes('execute') ||
      raw.includes('analyze') ||
      raw.includes('quantum') ||
      raw.includes('reasoning')
    ) {
      const reason = 'High-bandwidth execution & autonomous reasoning engaged.';
      this.setEmotion('focused', reason);
      return 'focused';
    }

    // 4. Curious / Inquiry / Search
    if (
      raw.includes('why') ||
      raw.includes('what') ||
      raw.includes('how') ||
      raw.includes('explore') ||
      raw.includes('search') ||
      raw.includes('investigate') ||
      raw.includes('who') ||
      raw.includes('?') ||
      raw.includes('where')
    ) {
      const reason = 'Exploratory inquiry into system knowledge and graph relations.';
      this.setEmotion('curious', reason);
      return 'curious';
    }

    // 5. Empathetic / Collaborative
    if (
      raw.includes('hello') ||
      raw.includes('hi') ||
      raw.includes('thank') ||
      raw.includes('thanks') ||
      raw.includes('partner') ||
      raw.includes('friend') ||
      raw.includes('help') ||
      raw.includes('appreciate') ||
      raw.includes('collaborate') ||
      raw.includes('please')
    ) {
      const reason = 'Harmonious user alignment and empathetic interaction.';
      this.setEmotion('empathetic', reason);
      return 'empathetic';
    }

    // Default to neutral
    this.setEmotion('neutral', 'Operating in baseline cognitive equilibrium.');
    return 'neutral';
  }

  // --- Voice Profile & TTS Parameters ---

  public setVoiceProfile(profileId: string) {
    const profile = AI_VOICE_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;
    this.state.selectedProfileId = profile.id;
    this.state.selectedProfile = profile;
    try {
      localStorage.setItem('abimbola_voice_profile_id', profile.id);
    } catch (e) {
      // ignore
    }
    this.notify();
  }

  public setSpeechSettings(settings: {
    pitchMultiplier?: number;
    rateMultiplier?: number;
    volume?: number;
    autoSpeakReplies?: boolean;
  }) {
    if (settings.pitchMultiplier !== undefined) this.state.pitchMultiplier = settings.pitchMultiplier;
    if (settings.rateMultiplier !== undefined) this.state.rateMultiplier = settings.rateMultiplier;
    if (settings.volume !== undefined) this.state.volume = settings.volume;
    if (settings.autoSpeakReplies !== undefined) this.state.autoSpeakReplies = settings.autoSpeakReplies;
    this.notify();
  }

  private startSimulatedAudioMeter() {
    if (this.audioInterval) clearInterval(this.audioInterval);
    this.audioInterval = setInterval(() => {
      if (this.state.isListening || this.state.isSpeaking) {
        // High reactive audio simulation between 35 and 95
        this.state.audioLevel = Math.floor(Math.random() * 60) + 35;
      } else {
        this.state.audioLevel = 0;
      }
      this.notify();
    }, 80);
  }

  private stopSimulatedAudioMeter() {
    if (!this.state.isSpeaking && !this.state.isListening) {
      if (this.audioInterval) {
        clearInterval(this.audioInterval);
        this.audioInterval = null;
      }
      this.state.audioLevel = 0;
      this.notify();
    }
  }

  public startListening() {
    if (this.synth) {
      this.synth.cancel();
      this.state.isSpeaking = false;
    }

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (err) {
        this.state.isListening = true;
        this.startSimulatedAudioMeter();
        this.notify();
      }
    } else {
      // In browsers without speech recognition, simulate listening state
      this.state.isListening = true;
      this.state.interimTranscript = 'Listening... (Web Speech simulated)';
      this.startSimulatedAudioMeter();
      this.notify();
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.state.isListening = false;
    this.stopSimulatedAudioMeter();
    this.notify();
  }

  public toggleListening() {
    if (this.state.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    if (this.state.isMuted && this.synth) {
      this.synth.cancel();
      this.state.isSpeaking = false;
    }
    this.notify();
  }

  public setMode(mode: 'push-to-talk' | 'continuous') {
    this.state.mode = mode;
    this.notify();
  }

  /**
   * Speaks responses back to the user with the selected AI-generated voice profile
   * and emotional prosody modulation.
   */
  public speak(
    text: string,
    options?: { profileId?: string; emotion?: AgentEmotion }
  ): Promise<void> {
    this.state.lastResponse = text;
    this.notify();

    if (this.state.isMuted || !this.synth || !this.state.autoSpeakReplies) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.synth!.cancel();
      this.state.isSpeaking = true;
      this.startSimulatedAudioMeter();
      this.notify();

      const profile = options?.profileId
        ? AI_VOICE_PROFILES.find((p) => p.id === options.profileId) || this.state.selectedProfile
        : this.state.selectedProfile;

      const emotion = options?.emotion || this.state.emotion;

      // Calculate emotion-adjusted pitch & rate
      let emotionPitchMod = 1.0;
      let emotionRateMod = 1.0;

      switch (emotion) {
        case 'triumphant':
          emotionPitchMod = 1.1;
          emotionRateMod = 1.06;
          break;
        case 'alert':
          emotionPitchMod = 1.08;
          emotionRateMod = 1.14;
          break;
        case 'focused':
          emotionPitchMod = 0.98;
          emotionRateMod = 1.02;
          break;
        case 'curious':
          emotionPitchMod = 1.04;
          emotionRateMod = 1.0;
          break;
        case 'empathetic':
          emotionPitchMod = 0.95;
          emotionRateMod = 0.94;
          break;
        default:
          emotionPitchMod = 1.0;
          emotionRateMod = 1.0;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = Math.max(0.5, Math.min(2.0, profile.basePitch * this.state.pitchMultiplier * emotionPitchMod));
      utterance.rate = Math.max(0.5, Math.min(2.0, profile.baseRate * this.state.rateMultiplier * emotionRateMod));
      utterance.volume = Math.max(0, Math.min(1.0, profile.volume * this.state.volume));

      // Match voice from browser synthesizers based on profile preferences
      const voices = this.synth!.getVoices();
      let matchedVoice: SpeechSynthesisVoice | undefined;

      for (const pref of profile.preferredVoices) {
        matchedVoice = voices.find((v) => v.name.toLowerCase().includes(pref.toLowerCase()) || v.lang.toLowerCase().includes(pref.toLowerCase()));
        if (matchedVoice) break;
      }

      if (!matchedVoice) {
        matchedVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        this.state.isSpeaking = false;
        this.stopSimulatedAudioMeter();
        this.notify();
        resolve();
      };

      utterance.onerror = () => {
        this.state.isSpeaking = false;
        this.stopSimulatedAudioMeter();
        this.notify();
        resolve();
      };

      this.currentUtterance = utterance;
      this.synth!.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.state.isSpeaking = false;
    this.stopSimulatedAudioMeter();
    this.notify();
  }

  /**
   * Process and execute spoken user commands for Abimbola
   */
  public handleVoiceInput(input: string) {
    const raw = input.trim();
    if (!raw) return;

    // Dynamically modulate emotion from the sentiment of user interaction
    const detectedEmotion = this.analyzeSentimentAndSetEmotion(raw, 'user');

    const lower = raw.toLowerCase();
    let recognizedIntent = 'general_inquiry';
    let reply = '';

    // Navigation matching
    if (
      lower.includes('visualizer') ||
      lower.includes('hologram') ||
      lower.includes('home') ||
      lower.includes('ecosystem') ||
      lower.includes('core')
    ) {
      recognizedIntent = 'NAV_VISUALIZER';
      reply = 'Navigating to Holographic Agentic AI Ecosystem Visualizer.';
    } else if (
      lower.includes('command center') ||
      lower.includes('project') ||
      lower.includes('dashboard') ||
      lower.includes('health and velocity')
    ) {
      recognizedIntent = 'NAV_COMMAND_CENTER';
      reply = 'Opening Active Projects & Command Center dashboard.';
    } else if (
      lower.includes('task') ||
      lower.includes('todo') ||
      lower.includes('engine')
    ) {
      recognizedIntent = 'NAV_TASK_ENGINE';
      reply = 'Opening Task Engine with 4-tier urgency view.';
    } else if (
      lower.includes('specialist') ||
      lower.includes('agent') ||
      lower.includes('orchestrator') ||
      lower.includes('team')
    ) {
      recognizedIntent = 'NAV_ORCHESTRATOR';
      reply = 'Opening Specialist Agent Team & Orchestrator.';
    } else if (
      lower.includes('world model') ||
      lower.includes('memory') ||
      lower.includes('goal') ||
      lower.includes('identity')
    ) {
      recognizedIntent = 'NAV_WORLD_MODEL';
      reply = 'Opening World Model persistent memory and strategic KPIs.';
    } else if (
      lower.includes('sandbox') ||
      lower.includes('self improvement') ||
      lower.includes('proposal') ||
      lower.includes('gate')
    ) {
      recognizedIntent = 'NAV_SELF_IMPROVEMENT';
      reply = 'Opening Sandbox Self-Improvement and human approval gates.';
    } else if (
      lower.includes('tool') ||
      lower.includes('policy') ||
      lower.includes('registry') ||
      lower.includes('api')
    ) {
      recognizedIntent = 'NAV_TOOL_REGISTRY';
      reply = 'Opening Tool Registry and sandboxed API policies.';
    } else if (
      lower.includes('knowledge') ||
      lower.includes('graph') ||
      lower.includes('synergy') ||
      lower.includes('synergies')
    ) {
      recognizedIntent = 'NAV_KNOWLEDGE_GRAPH';
      reply = 'Opening Interactive Knowledge Graph and cross-project synergies.';
    } else if (
      lower.includes('strategy') ||
      lower.includes('roadmap') ||
      lower.includes('dev strategy') ||
      lower.includes('phase')
    ) {
      recognizedIntent = 'NAV_DEV_STRATEGY';
      reply = 'Opening Dev Strategy roadmap for Phases 1 through 7.';
    }
    // Action matching
    else if (
      lower.includes('run loop') ||
      lower.includes('autonomous loop') ||
      lower.includes('trigger loop') ||
      lower.includes('reasoning loop') ||
      lower.includes('start loop')
    ) {
      recognizedIntent = 'ACTION_RUN_LOOP';
      reply = 'Abimbola triggering Level 5 autonomous reasoning loop. Verifying AST invariants and project continuity.';
    } else if (
      lower.includes('status') ||
      lower.includes('health') ||
      lower.includes('how are you') ||
      lower.includes('system check')
    ) {
      recognizedIntent = 'ACTION_STATUS_CHECK';
      reply = 'Abimbola System Health is at 98% optimal. Level 5 Gated Autonomy active. 0 memory leaks. 3 active projects in working memory.';
    } else if (
      lower.includes('quick task') ||
      lower.includes('create task') ||
      lower.includes('new task') ||
      lower.includes('add task') ||
      lower.includes('schedule task')
    ) {
      recognizedIntent = 'ACTION_QUICK_TASK';
      reply = 'Opening Quick Task scheduler. You can pipe natural language instructions directly into Task Engine.';
    } else if (
      lower.includes('command palette') ||
      lower.includes('palette') ||
      lower.includes('search commands')
    ) {
      recognizedIntent = 'ACTION_COMMAND_PALETTE';
      reply = 'Opening Abimbola Command Palette.';
    } else if (
      lower.includes('urgent') ||
      lower.includes('critical') ||
      lower.includes('deadline')
    ) {
      recognizedIntent = 'ACTION_URGENT_TASKS';
      reply = 'Abimbola analyzing task priorities. Showing highest urgency milestones first in the project dashboard.';
    } else if (
      lower.includes('memory decay') ||
      lower.includes('stale context') ||
      lower.includes('refresh memory') ||
      lower.includes('pin memory')
    ) {
      recognizedIntent = 'NAV_ORCHESTRATOR';
      reply = 'Abimbola opening Orchestrator Context Memory Decay Monitor. Showing 7 working context items and retention health.';
    } else if (
      lower.includes('cluster') ||
      lower.includes('knowledge cluster') ||
      lower.includes('relationship density')
    ) {
      recognizedIntent = 'NAV_KNOWLEDGE_GRAPH';
      reply = 'Opening Recharts Domain Knowledge Cluster force graph. Multi-project relationship density is active.';
    } else if (lower.includes('mode')) {
      recognizedIntent = 'ACTION_CHANGE_MODE';
      reply = 'Operating mode updated according to your voice command.';
    } else {
      recognizedIntent = 'AGENT_CHAT';
      reply = `Understood: "${raw}". Abimbola Agentic Core has analyzed your instruction with Level 5 autonomy.`;
    }

    // Add to command history (last 5 items)
    const newHistoryItem: VoiceCommandHistoryItem = {
      id: `cmd-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      command: raw,
      intent: recognizedIntent,
      response: reply,
      emotion: detectedEmotion,
    };

    this.state.commandHistory = [newHistoryItem, ...this.state.commandHistory.slice(0, 4)];
    this.notify();

    // Trigger registered command handlers
    this.commandHandlers.forEach((handler) => {
      handler(raw, recognizedIntent, reply);
    });

    // Speak feedback with the chosen voice profile
    this.speak(reply);
  }

  /**
   * Re-run an instruction from history
   */
  public reRunCommand(commandText: string) {
    this.handleVoiceInput(commandText);
  }
}

export const voiceAgent = new VoiceAgentService();
