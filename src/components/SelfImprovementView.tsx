import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  GitBranch,
  Terminal,
  FileCode,
  Lock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { ImprovementProposal } from '../types/agent';

export const SelfImprovementView: React.FC = () => {
  const {
    proposals,
    createProposal,
    runSandboxTests,
    approveProposal,
    rejectProposal,
    deployProposal,
    rollbackProposal,
  } = useAgent();

  const [selectedProposalId, setSelectedProposalId] = useState<string>(
    proposals[0]?.id || ''
  );
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedProposal = proposals.find((p) => p.id === selectedProposalId);

  const handleGenerateNewProposal = async () => {
    setIsGenerating(true);
    try {
      const p = await createProposal({
        trigger: 'Detected recurring token serialization overhead in multi-agent routing bus',
        problemDetected: 'JSON stringification of World Model state adds 95ms per turn during complex orchestration.',
        currentBehavior: 'Full state serialization on every specialist agent handoff.',
        proposedBehavior: 'Immutable state pointer bus with delta-only streaming over WebWorkers.',
        reasonForChange: 'Reduce inter-agent message transit latency by 85%.',
        expectedBenefit: 'Sub-15ms specialist delegation and zero main thread jank.',
        affectedFiles: ['src/services/agentBus.ts', 'src/types/agent.ts'],
        newToolsPermissions: ['worker.shared_buffer'],
        dependencies: ['SharedArrayBufferSupport'],
        securityPrivacyImplications: 'Shared buffer memory is isolated inside sandbox with zero external network connectivity.',
        potentialFailureModes: 'Race condition if two specialist agents attempt concurrent write without mutex.',
        testPlan: 'Run concurrent worker stress test with 1,000 state mutations; verify zero corrupted pointers.',
        rollbackPlan: 'Revert to JSON message passing router via pointer snapshot SNAP-BUS-02.',
        riskLevel: 'Medium',
      });
      setSelectedProposalId(p.id);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRejectConfirm = () => {
    if (!selectedProposalId) return;
    rejectProposal(selectedProposalId, rejectReasonInput || 'Rejected by user in safety review');
    setShowRejectModal(false);
    setRejectReasonInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Approval-Gated Self-Improvement Architecture (19-Field Schema)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Self-Modification Sandbox, Evaluation &amp; Rollback Gates
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            The agent proposes architectural &amp; tool improvements, but changes must pass isolated sandbox tests,
            risk assessment, and explicit human sign-off before staging or production deployment.
          </p>
        </div>

        <button
          onClick={handleGenerateNewProposal}
          disabled={isGenerating}
          className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-purple-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGenerating ? 'Synthesizing...' : 'Generate New Proposal'}</span>
        </button>
      </div>

      {/* Main Sandbox Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Proposals List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Improvement Proposals ({proposals.length})
          </h2>

          <div className="space-y-2">
            {proposals.map((prop) => {
              const isSelected = prop.id === selectedProposalId;
              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProposalId(prop.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/70 ring-1 ring-purple-500/40 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-purple-300">{prop.id}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        prop.approvalStatus === 'UserApproved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : prop.approvalStatus === 'Rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-300 animate-pulse'
                      }`}
                    >
                      {prop.approvalStatus}
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-xs mt-2 line-clamp-2">{prop.proposedBehavior}</h3>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span>Risk: {prop.riskLevel}</span>
                    <span className="capitalize text-slate-300">
                      Tier: {prop.deploymentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Columns (2 cols): 19-Field Proposal Inspector & Sandbox Runner */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProposal ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Proposal Header & Workflow Stage Tracker */}
              <div className="space-y-3 pb-4 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-400">{selectedProposal.id}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">{new Date(selectedProposal.dateTime).toLocaleString()}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Risk: {selectedProposal.riskLevel}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{selectedProposal.proposedBehavior}</h2>
                  </div>

                  {/* Actions & Gates */}
                  <div className="flex items-center space-x-2">
                    {selectedProposal.approvalStatus === 'Proposed' && (
                      <>
                        <button
                          onClick={() => approveProposal(selectedProposal.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
                        >
                          Approve Proposal
                        </button>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 font-semibold text-xs transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {selectedProposal.approvalStatus === 'UserApproved' &&
                      selectedProposal.deploymentStatus !== 'ProductionDeployed' && (
                        <button
                          onClick={() => deployProposal(selectedProposal.id, 'ProductionDeployed')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer flex items-center space-x-1"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Deploy to Production</span>
                        </button>
                      )}

                    {selectedProposal.deploymentStatus === 'ProductionDeployed' && (
                      <button
                        onClick={() => rollbackProposal(selectedProposal.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-semibold text-xs transition cursor-pointer flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Atomic Rollback</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Proposal Lifecycle Steps Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 pt-2 text-[10px] uppercase font-bold text-center">
                  <div className="p-1.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                    1. Proposed
                  </div>
                  <div
                    className={`p-1.5 rounded border ${
                      selectedProposal.approvalStatus === 'UserApproved'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                        : selectedProposal.approvalStatus === 'Rejected'
                        ? 'bg-red-950/40 text-red-400 border-red-500/30'
                        : 'bg-amber-950/30 text-amber-300 border-amber-500/30 animate-pulse'
                    }`}
                  >
                    2. User Approval
                  </div>
                  <div
                    className={`p-1.5 rounded border ${
                      selectedProposal.implementationStatus === 'TestsPassing'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    3. Sandbox Tests
                  </div>
                  <div
                    className={`p-1.5 rounded border ${
                      selectedProposal.deploymentStatus === 'Staging' ||
                      selectedProposal.deploymentStatus === 'ProductionDeployed'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    4. Staging
                  </div>
                  <div
                    className={`p-1.5 rounded border ${
                      selectedProposal.deploymentStatus === 'ProductionDeployed'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                        : selectedProposal.deploymentStatus === 'RolledBack'
                        ? 'bg-red-950/40 text-red-400 border-red-500/30'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    5. Production Gate
                  </div>
                </div>
              </div>

              {/* Sandbox Test Runner Terminal & Execution */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-300">Sandbox Test Verification Suite</span>
                  </div>
                  <button
                    onClick={() => runSandboxTests(selectedProposal.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-semibold transition cursor-pointer flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>Run Sandbox Evaluation</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {selectedProposal.sandboxTestResults && selectedProposal.sandboxTestResults.length > 0 ? (
                    selectedProposal.sandboxTestResults.map((test, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                        <div className="flex items-center space-x-2">
                          {test.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className="text-slate-200">{test.name}</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">{test.output}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 py-2 text-center font-sans">
                      Tests pending execution. Click "Run Sandbox Evaluation" to simulate test assertions.
                    </div>
                  )}
                </div>
              </div>

              {/* 19-Field Schema Inspector (Grid Breakdown) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <FieldCard label="Trigger" value={selectedProposal.trigger} />
                <FieldCard label="Problem Detected" value={selectedProposal.problemDetected} />
                <FieldCard label="Current Behavior" value={selectedProposal.currentBehavior} />
                <FieldCard label="Proposed Behavior" value={selectedProposal.proposedBehavior} highlight />
                <FieldCard label="Reason for Change" value={selectedProposal.reasonForChange} />
                <FieldCard label="Expected Benefit" value={selectedProposal.expectedBenefit} />
                <FieldCard label="Affected Files / Components" list={selectedProposal.affectedFiles} />
                <FieldCard label="New Tools & Permissions Required" list={selectedProposal.newToolsPermissions} />
                <FieldCard label="Dependencies" list={selectedProposal.dependencies} />
                <FieldCard label="Security & Privacy Implications" value={selectedProposal.securityPrivacyImplications} />
                <FieldCard label="Potential Failure Modes" value={selectedProposal.potentialFailureModes} />
                <FieldCard label="Test Plan" value={selectedProposal.testPlan} />
                <FieldCard label="Rollback Plan" value={selectedProposal.rollbackPlan} />
                <FieldCard label="Post-Deployment Evaluation" value={selectedProposal.postDeploymentEvaluation} />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
              Select a proposal from the left list to review its 19-field specification.
            </div>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Record Rejection Reason</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide the rationale for rejecting this proposal. This will be recorded into the system's memory
              so the agent learns what constitutes an unacceptable architectural modification.
            </p>
            <textarea
              rows={3}
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="e.g. Introduces unnecessary multi-threading complexity before verifying single-core limits."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FieldCard: React.FC<{
  label: string;
  value?: string;
  list?: string[];
  highlight?: boolean;
}> = ({ label, value, list, highlight }) => (
  <div
    className={`p-3 rounded-lg border ${
      highlight ? 'bg-purple-950/30 border-purple-500/50' : 'bg-slate-950 border-slate-800/80'
    }`}
  >
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
      {label}
    </span>
    {value && <p className="text-slate-200 text-xs leading-relaxed">{value}</p>}
    {list && (
      <ul className="text-slate-300 text-xs space-y-0.5">
        {list.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    )}
  </div>
);
