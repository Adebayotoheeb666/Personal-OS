import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Pin,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Flame,
  Zap,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { voiceAgent } from '../services/voiceAgentService';

export interface MemoryContextItem {
  id: string;
  title: string;
  category: 'project' | 'architecture' | 'decision' | 'contact' | 'security' | 'task';
  domain: string;
  summary: string;
  importance: 'critical' | 'high' | 'medium';
  lastAccessedMs: number; // timestamp
  decayPercentage: number; // 0 to 100 (0 = 100% fresh, 100 = completely decayed)
  isPinned: boolean;
  decayRatePerHour: number; // rate of decay
  tags: string[];
}

const INITIAL_MEMORY_ITEMS: MemoryContextItem[] = [
  {
    id: 'mem-1',
    title: 'EduCore AST Parser Misconception Engine',
    category: 'project',
    domain: 'EduCore',
    summary: 'Static syntax parsing rules detecting recursion traps and off-by-one errors for WASM exercises.',
    importance: 'critical',
    lastAccessedMs: Date.now() - 14 * 60 * 1000, // 14 mins ago
    decayPercentage: 15,
    isPinned: true,
    decayRatePerHour: 5,
    tags: ['AST', 'WASM', 'Parser', 'P0'],
  },
  {
    id: 'mem-2',
    title: 'Enterprise Outbound ICP Qualification Criteria',
    category: 'task',
    domain: 'Sales Intelligence',
    summary: 'Target profiles: Series B-D VP Eng / CTOs managing >30 engineers with microservice complexity.',
    importance: 'high',
    lastAccessedMs: Date.now() - 110 * 60 * 1000, // 1.8 hrs ago
    decayPercentage: 48,
    isPinned: false,
    decayRatePerHour: 18,
    tags: ['ICP', 'B2B', 'Outbound', 'CTO'],
  },
  {
    id: 'mem-3',
    title: 'Approval-Gated Safety Architecture & Sandbox Quarantine',
    category: 'security',
    domain: 'AetherOS Core',
    summary: 'Every file mutation or outbound request requires explicit cryptographic or user digital sign-off.',
    importance: 'critical',
    lastAccessedMs: Date.now() - 35 * 60 * 1000, // 35 mins ago
    decayPercentage: 8,
    isPinned: true,
    decayRatePerHour: 4,
    tags: ['Security', 'Approval-Gate', 'Sandbox'],
  },
  {
    id: 'mem-4',
    title: 'Elena Rostova (VoxelDB) DevRel Curriculum Synergy',
    category: 'contact',
    domain: 'Partnerships',
    summary: 'Elena scheduled follow-up on co-marketing EduCore database exercises with VoxelDB Cloud tier.',
    importance: 'medium',
    lastAccessedMs: Date.now() - 380 * 60 * 1000, // 6.3 hrs ago
    decayPercentage: 74,
    isPinned: false,
    decayRatePerHour: 14,
    tags: ['DevRel', 'Elena', 'VoxelDB', 'Collab'],
  },
  {
    id: 'mem-5',
    title: 'Sub-20ms Local Vector Embedding Cache Strategy',
    category: 'architecture',
    domain: 'Knowledge Graph',
    summary: 'In-memory index using cosine distance quantization to prevent external LLM roundtrips.',
    importance: 'high',
    lastAccessedMs: Date.now() - 260 * 60 * 1000, // 4.3 hrs ago
    decayPercentage: 62,
    isPinned: false,
    decayRatePerHour: 12,
    tags: ['Vector', 'Local-First', 'Performance'],
  },
  {
    id: 'mem-6',
    title: 'WASM Worker Watchdog Timers & Zero Memory Leakage Rule',
    category: 'architecture',
    domain: 'EduCore',
    summary: 'Strict 500ms execution timeout with web worker termination to prevent infinite loops in user code.',
    importance: 'high',
    lastAccessedMs: Date.now() - 8 * 60 * 1000, // 8 mins ago
    decayPercentage: 10,
    isPinned: false,
    decayRatePerHour: 10,
    tags: ['WASM', 'Sandbox', 'Timeout'],
  },
  {
    id: 'mem-7',
    title: 'Founder Outbound Teardown Brief Structure',
    category: 'task',
    domain: 'Sales Intelligence',
    summary: '3-bullet technical observation, 1 architectural benchmark comparison, and 1 non-salesy question.',
    importance: 'medium',
    lastAccessedMs: Date.now() - 520 * 60 * 1000, // 8.6 hrs ago
    decayPercentage: 86,
    isPinned: false,
    decayRatePerHour: 16,
    tags: ['Teardowns', 'Email', 'Structure'],
  },
];

export const MemoryDecayMonitor: React.FC = () => {
  const [memories, setMemories] = useState<MemoryContextItem[]>(() => {
    try {
      const saved = localStorage.getItem('aetheros_memory_decay_items_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load memory decay items:', e);
    }
    return INITIAL_MEMORY_ITEMS;
  });

  const [filterMode, setFilterMode] = useState<'all' | 'stale' | 'pinned' | 'fresh'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New memory form state
  const [newTitle, setNewTitle] = useState('');
  const [newDomain, setNewDomain] = useState('EduCore');
  const [newCategory, setNewCategory] = useState<MemoryContextItem['category']>('project');
  const [newSummary, setNewSummary] = useState('');
  const [newImportance, setNewImportance] = useState<MemoryContextItem['importance']>('high');
  const [newPinned, setNewPinned] = useState(false);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('aetheros_memory_decay_items_v1', JSON.stringify(memories));
    } catch (e) {
      console.warn('Failed to persist memory items:', e);
    }
  }, [memories]);

  // Periodic natural decay simulation (decay increases slightly over time unless pinned)
  useEffect(() => {
    const timer = setInterval(() => {
      setMemories((prev) =>
        prev.map((item) => {
          if (item.isPinned) return item; // Pinned memories do not decay
          const increment = Math.min(100, Math.round(item.decayPercentage + 1));
          return {
            ...item,
            decayPercentage: increment,
          };
        })
      );
    }, 45000); // update every 45s

    return () => clearInterval(timer);
  }, []);

  // Calculate Max Focus Index
  const focusIndex = useMemo(() => {
    if (memories.length === 0) return 100;
    const totalRetention = memories.reduce((acc, item) => {
      if (item.isPinned) return acc + 100;
      return acc + (100 - item.decayPercentage);
    }, 0);
    return Math.round(totalRetention / memories.length);
  }, [memories]);

  // Counts
  const staleCount = useMemo(
    () => memories.filter((m) => !m.isPinned && m.decayPercentage >= 60).length,
    [memories]
  );
  const pinnedCount = useMemo(() => memories.filter((m) => m.isPinned).length, [memories]);
  const freshCount = useMemo(
    () => memories.filter((m) => m.isPinned || m.decayPercentage < 30).length,
    [memories]
  );

  // Trigger feedback banner
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Actions: Refresh memory item
  const handleRefreshMemory = (id: string, title: string) => {
    setMemories((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              decayPercentage: 0,
              lastAccessedMs: Date.now(),
            }
          : m
      )
    );
    notify(`Refreshed context for "${title}". Max re-anchored working memory at 100% fidelity.`);
    voiceAgent.setEmotion('triumphant', `Refreshed working memory for "${title}". Retention restored.`);
    voiceAgent.speak(`Context refreshed: ${title}. Retention restored.`);
  };

  // Actions: Toggle pin status
  const handleTogglePin = (id: string, title: string) => {
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextPinned = !m.isPinned;
          return {
            ...m,
            isPinned: nextPinned,
            decayPercentage: nextPinned ? 0 : m.decayPercentage,
            lastAccessedMs: Date.now(),
          };
        }
        return m;
      })
    );
    const item = memories.find((m) => m.id === id);
    const willBePinned = !item?.isPinned;
    if (willBePinned) {
      voiceAgent.setEmotion('focused', `Pinned critical focus anchor: "${title}".`);
    } else {
      voiceAgent.setEmotion('neutral', `Unpinned "${title}".`);
    }
    notify(
      willBePinned
        ? `Pinned "${title}" to Max's critical attention window. Memory decay frozen.`
        : `Unpinned "${title}". Normal natural context decay resumed.`
    );
  };

  // Actions: Refresh all stale memories
  const handleRefreshAllStale = () => {
    setMemories((prev) =>
      prev.map((m) => ({
        ...m,
        decayPercentage: m.isPinned ? 0 : Math.min(m.decayPercentage, 15),
        lastAccessedMs: Date.now(),
      }))
    );
    notify('Refreshed all stale memory contexts. Max focus index restored to peak.');
    voiceAgent.setEmotion('triumphant', 'All stale contexts refreshed. Working memory at 100% fidelity.');
    voiceAgent.speak("All active context items refreshed. Max's working memory is re-synchronized.");
  };

  // Actions: Add new memory
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: MemoryContextItem = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      domain: newDomain,
      category: newCategory,
      summary: newSummary.trim() || 'User-injected critical working context item.',
      importance: newImportance,
      lastAccessedMs: Date.now(),
      decayPercentage: 0,
      isPinned: newPinned,
      decayRatePerHour: 10,
      tags: [newDomain, newCategory, 'Custom'],
    };

    setMemories((prev) => [newItem, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewSummary('');
    notify(`Injected "${newItem.title}" directly into Max's active context.`);
    voiceAgent.speak(`Memory context added: ${newItem.title}`);
  };

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter((item) => {
      // Filter tab
      if (filterMode === 'stale' && (item.isPinned || item.decayPercentage < 60)) return false;
      if (filterMode === 'pinned' && !item.isPinned) return false;
      if (filterMode === 'fresh' && !item.isPinned && item.decayPercentage >= 30) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDomain = item.domain.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDomain && !matchesSummary && !matchesTags) return false;
      }

      return true;
    });
  }, [memories, filterMode, searchQuery]);

  const formatTimeAgo = (timestampMs: number) => {
    const diff = Math.max(0, Date.now() - timestampMs);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Notification Toast */}
      {notification && (
        <div className="mb-3 p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-md shadow-cyan-500/20">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-cyan-400 hover:text-white text-xs px-1 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 shadow-inner">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Working Context Memory Decay Monitor</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 font-semibold">
                  Max Retention HUD
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizes decay for stale context items. Manually <span className="text-cyan-300 font-semibold">refresh</span> or <span className="text-amber-300 font-semibold">pin</span> critical memories to keep Max focused.
            </p>
          </div>
        </div>

        {/* Focus Index Meter & Global Action */}
        <div className="flex items-center space-x-2 self-start sm:self-center">
          {/* Focus Index Pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs shadow-inner">
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Focus Index</span>
              <span
                className={`font-black font-mono text-sm leading-tight ${
                  focusIndex >= 80 ? 'text-emerald-400' : focusIndex >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {focusIndex}%
              </span>
            </div>
            <div className="w-10 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  focusIndex >= 80
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : focusIndex >= 60
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-500 to-red-400'
                }`}
                style={{ width: `${focusIndex}%` }}
              />
            </div>
          </div>

          {/* Refresh All Button */}
          {staleCount > 0 && (
            <button
              type="button"
              onClick={handleRefreshAllStale}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Refresh all decaying context items to 100% retention"
            >
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Refresh {staleCount} Stale</span>
            </button>
          )}

          {/* Add Custom Memory */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anchor Memory</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Collapse Memory Monitor' : 'Expand Memory Monitor'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Controls bar: Filters + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Filter Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  filterMode === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>All Context ({memories.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('stale')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  filterMode === 'stale'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800'
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Decaying / Stale ({staleCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('pinned')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  filterMode === 'pinned'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-950 text-amber-400 hover:text-amber-300 border border-slate-800'
                }`}
              >
                <Pin className="w-3 h-3 text-amber-400" />
                <span>Pinned Focus ({pinnedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('fresh')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 whitespace-nowrap ${
                  filterMode === 'fresh'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Fresh Retention ({freshCount})</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search working memories..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Memory Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMemories.map((item) => {
              const retention = item.isPinned ? 100 : Math.max(0, 100 - item.decayPercentage);
              const isStale = !item.isPinned && item.decayPercentage >= 60;
              const isFading = !item.isPinned && item.decayPercentage >= 30 && item.decayPercentage < 60;
              const isFresh = item.isPinned || item.decayPercentage < 30;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden group ${
                    item.isPinned
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : isStale
                      ? 'bg-rose-950/25 border-rose-500/40 shadow-sm shadow-rose-500/10 hover:border-rose-400'
                      : isFading
                      ? 'bg-slate-950/90 border-slate-800 hover:border-amber-500/40'
                      : 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  {/* Top line with domain badge and Pin status */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.domain}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            item.importance === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : item.importance === 'high'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.importance}
                        </span>
                      </div>

                      {/* Pin button */}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(item.id, item.title)}
                        className={`p-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                          item.isPinned
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/50'
                            : 'bg-slate-900 text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-slate-800'
                        }`}
                        title={item.isPinned ? 'Pinned Focus (Immune to decay) - Click to unpin' : 'Pin memory to lock at 100% focus'}
                      >
                        <Pin className={`w-3 h-3 ${item.isPinned ? 'fill-current' : ''}`} />
                        <span className="text-[10px]">{item.isPinned ? 'Pinned' : 'Pin'}</span>
                      </button>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-xs text-white mt-2 leading-snug line-clamp-1 group-hover:text-indigo-300 transition">
                      {item.title}
                    </h4>

                    {/* Summary */}
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Decay Health Gauge & Refresh Trigger */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                    {/* Visual Decay Meter Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400 flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>{formatTimeAgo(item.lastAccessedMs)}</span>
                        </span>
                        <div className="flex items-center space-x-1">
                          {item.isPinned ? (
                            <span className="text-amber-400 font-bold flex items-center space-x-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              <span>LOCKED 100%</span>
                            </span>
                          ) : isStale ? (
                            <span className="text-rose-400 font-bold flex items-center space-x-0.5 animate-pulse">
                              <Flame className="w-2.5 h-2.5" />
                              <span>DECAYED {item.decayPercentage}%</span>
                            </span>
                          ) : isFading ? (
                            <span className="text-amber-400 font-semibold">
                              Decay {item.decayPercentage}%
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold">
                              Fresh {retention}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Gauge Bar */}
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.isPinned
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                              : isStale
                              ? 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                              : isFading
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${retention}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom action row: Tags + Manual Refresh */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <div className="flex items-center space-x-1 overflow-hidden">
                        {item.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] text-slate-500 font-mono bg-slate-900 px-1 py-0.2 rounded truncate"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRefreshMemory(item.id, item.title)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center space-x-1 shadow-sm ${
                          isStale
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 border border-rose-500/40 animate-pulse'
                            : 'bg-slate-900 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 border border-slate-800'
                        }`}
                        title="Manually re-anchor this memory into Max's immediate active context"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Refresh Context</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredMemories.length === 0 && (
              <div className="col-span-full p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80">
                <Brain className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                <p className="text-xs text-slate-400 font-semibold">No working memory items matching this filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterMode('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs text-indigo-400 hover:underline cursor-pointer font-bold"
                >
                  Clear filters to view all context items
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Anchor Critical Memory into Max</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Context Item Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. VoxelDB Partition Key Strategy for WASM Logs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Domain</label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="EduCore">EduCore</option>
                    <option value="Sales Intelligence">Sales Intelligence</option>
                    <option value="AetherOS Core">AetherOS Core</option>
                    <option value="Partnerships">Partnerships</option>
                    <option value="Knowledge Graph">Knowledge Graph</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Importance</label>
                  <select
                    value={newImportance}
                    onChange={(e) => setNewImportance(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Context Summary &amp; Directives
                </label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Provide precise architectural constraints or user preferences Max should prioritize..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pinImmediately"
                  checked={newPinned}
                  onChange={(e) => setNewPinned(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="pinImmediately" className="text-xs text-slate-300 cursor-pointer select-none">
                  Pin immediately to prevent memory decay
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Anchor Context
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
