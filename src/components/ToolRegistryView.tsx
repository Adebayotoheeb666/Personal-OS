import React, { useState } from 'react';
import {
  Wrench,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Terminal,
  Activity,
  Trash2,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { ToolDefinition } from '../types/agent';

export const ToolRegistryView: React.FC = () => {
  const {
    tools,
    auditLogs,
    toggleToolActivation,
    revokeTool,
    addNewTool,
  } = useAgent();

  const [readOnlyDefault, setReadOnlyDefault] = useState<boolean>(true);
  const [showAddToolModal, setShowAddToolModal] = useState<boolean>(false);

  // Form State
  const [toolName, setToolName] = useState('');
  const [provider, setProvider] = useState('');
  const [purpose, setPurpose] = useState('');
  const [capabilities, setCapabilities] = useState('read_only_query');
  const [permissionsRequired, setPermissionsRequired] = useState('data.read');
  const [dataAccess, setDataAccess] = useState('Public data only');
  const [securityRisks, setSecurityRisks] = useState('Low risk sandbox execution');
  const [failureBehavior, setFailureBehavior] = useState('Fails gracefully with cached state');
  const [requiresConfirmation, setRequiresConfirmation] = useState(true);

  const handleRegisterTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !purpose.trim()) return;

    addNewTool({
      name: toolName,
      provider: provider || 'Local Sandbox',
      purpose,
      capabilities: capabilities.split(',').map((s) => s.trim()),
      permissionsRequired: permissionsRequired.split(',').map((s) => s.trim()),
      dataAccess,
      cost: '$0 (Sandbox runtime)',
      securityRisks,
      failureBehavior,
      alternatives: ['Manual alternative', 'Offline fallback'],
      environmentTier: 'sandbox',
      activationStatus: 'evaluation',
      requiresHumanConfirmationForExecution: requiresConfirmation,
    });

    setToolName('');
    setPurpose('');
    setShowAddToolModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Policy Boundary Sentinel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4 text-indigo-400" />
            <span>Capability Boundaries &amp; Tool Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Permission Architecture &amp; Execution Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Least-privilege security model with separated environments (Sandbox, Staging, Production)
            and explicit approval gates for destructive operations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Read-only toggle */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <Shield className={`w-3.5 h-3.5 ${readOnlyDefault ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-300 font-semibold">Read-Only Default:</span>
            <button
              onClick={() => setReadOnlyDefault(!readOnlyDefault)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                readOnlyDefault
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {readOnlyDefault ? 'Enforced' : 'Permissive'}
            </button>
          </div>

          <button
            onClick={() => setShowAddToolModal(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Propose New Tool</span>
          </button>
        </div>
      </div>

      {/* Environment Security Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sky-400 uppercase tracking-wider">Tier 1: Sandbox</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">0 Network</span>
          </div>
          <p className="text-slate-400">
            Isolated in-memory buffer. Tool discovery, benchmarking, and unit evaluation execute here with zero access to live data or credentials.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-purple-400 uppercase tracking-wider">Tier 2: Staging</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Draft Staging</span>
          </div>
          <p className="text-slate-400">
            Synthetic or mock integrations. External API requests stage payloads to queues; zero automated dispatch without explicit human trigger.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-emerald-400 uppercase tracking-wider">Tier 3: Production</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Gated Bounds</span>
          </div>
          <p className="text-slate-400">
            Live tools activated by user sign-off. High-impact operations (git push, email send, DB mutations) enforce mandatory human signature.
          </p>
        </div>
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white tracking-wide">
          Registered Capabilities &amp; Tools ({tools.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`p-5 rounded-xl border flex flex-col justify-between transition ${
                tool.activationStatus === 'revoked'
                  ? 'bg-red-950/15 border-red-500/30 opacity-75'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{tool.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({tool.provider})</span>
                  </div>

                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      tool.activationStatus === 'active_production'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : tool.activationStatus === 'sandbox_active'
                        ? 'bg-purple-500/20 text-purple-300'
                        : tool.activationStatus === 'revoked'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {tool.activationStatus.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1">{tool.purpose}</p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <p>
                    <strong className="text-slate-300">Capabilities:</strong> {tool.capabilities.join(', ')}
                  </p>
                  <p>
                    <strong className="text-slate-300">Data Access:</strong> {tool.dataAccess}
                  </p>
                  <p>
                    <strong className="text-slate-300">Failure Behavior:</strong> {tool.failureBehavior}
                  </p>
                  <p className="text-amber-400/90">
                    <strong>Security Boundary:</strong> {tool.securityRisks}
                  </p>
                </div>
              </div>

              {/* Status and Revoke Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Tier: {tool.environmentTier}</span>

                <div className="flex items-center space-x-2">
                  {tool.activationStatus !== 'active_production' && tool.activationStatus !== 'revoked' && (
                    <button
                      onClick={() => toggleToolActivation(tool.id, 'active_production')}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition cursor-pointer"
                    >
                      Promote to Prod
                    </button>
                  )}

                  {tool.activationStatus !== 'revoked' ? (
                    <button
                      onClick={() => revokeTool(tool.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition cursor-pointer flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Revoke</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleToolActivation(tool.id, 'evaluation')}
                      className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      Restore to Sandbox
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Log Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Immutable Governance &amp; Action Audit Trail
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs pr-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
            >
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-indigo-400 font-bold">[{log.actor}]</span>
                <span className="text-slate-200">{log.action}:</span>
                <span className="text-slate-400">{log.target}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-500 text-[10px]">({log.details})</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                    log.outcome === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : log.outcome === 'reverted'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {log.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Propose Tool Modal */}
      {showAddToolModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRegisterTool}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-indigo-400" />
                <span>Propose New Tool Capability</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddToolModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tool Name</label>
              <input
                type="text"
                required
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="e.g. SQLite Vector Indexer"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Provider / Runtime</label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Local WebWorker / WASM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Capabilities</label>
                <input
                  type="text"
                  value={capabilities}
                  onChange={(e) => setCapabilities(e.target.value)}
                  placeholder="vector_search, cache_read"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tool Purpose</label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Fast local retrieval of knowledge embeddings"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Security / Risk Mitigation</label>
              <input
                type="text"
                value={securityRisks}
                onChange={(e) => setSecurityRisks(e.target.value)}
                placeholder="Constrained memory budget with 500ms watchdog"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddToolModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Register in Sandbox
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
