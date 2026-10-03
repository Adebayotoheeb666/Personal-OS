import React, { useState } from 'react';
import {
  Brain,
  Layers,
  Target,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  Users,
  FolderArchive,
  BookOpen,
  Scale,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { ProjectModel } from '../types/agent';

type WorldModelTab =
  | 'projects'
  | 'identity'
  | 'goals'
  | 'businesses'
  | 'learning'
  | 'responsibilities'
  | 'people'
  | 'resources'
  | 'knowledge'
  | 'decisions';

export const WorldModelView: React.FC = () => {
  const {
    worldModel,
    activeProjectId,
    setActiveProjectId,
    executeProjectContinuity,
  } = useAgent();

  const [activeTab, setActiveTab] = useState<WorldModelTab>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || worldModel.projects[0]?.id || ''
  );

  const selectedProject = worldModel.projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Structured Personal World Model</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Personal Knowledge, Projects &amp; Entity Ontology
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            A continuous, connected model of what you are becoming, what you are building, and what you are learning.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <SubTab active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<Layers className="w-3.5 h-3.5" />} label="Projects (21 Dims)" />
          <SubTab active={activeTab === 'identity'} onClick={() => setActiveTab('identity')} icon={<Brain className="w-3.5 h-3.5" />} label="Identity" />
          <SubTab active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon={<Target className="w-3.5 h-3.5" />} label="Goals" />
          <SubTab active={activeTab === 'businesses'} onClick={() => setActiveTab('businesses')} icon={<Briefcase className="w-3.5 h-3.5" />} label="Ventures" />
          <SubTab active={activeTab === 'learning'} onClick={() => setActiveTab('learning')} icon={<GraduationCap className="w-3.5 h-3.5" />} label="Learning" />
          <SubTab active={activeTab === 'responsibilities'} onClick={() => setActiveTab('responsibilities')} icon={<CalendarCheck className="w-3.5 h-3.5" />} label="Responsibilities" />
          <SubTab active={activeTab === 'people'} onClick={() => setActiveTab('people')} icon={<Users className="w-3.5 h-3.5" />} label="People" />
          <SubTab active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={<FolderArchive className="w-3.5 h-3.5" />} label="Resources" />
          <SubTab active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} icon={<BookOpen className="w-3.5 h-3.5" />} label="Knowledge" />
          <SubTab active={activeTab === 'decisions'} onClick={() => setActiveTab('decisions')} icon={<Scale className="w-3.5 h-3.5" />} label="Decisions" />
        </div>
      </div>

      {/* Tab 1: Comprehensive 21-Attribute Project Model */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Project List Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active &amp; Tracked Projects
            </h2>

            <div className="space-y-2">
              {worldModel.projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setActiveProjectId(proj.id);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    selectedProjectId === proj.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {proj.category}
                    </span>
                    <span className="text-xs font-bold text-indigo-400">{proj.progress}%</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm mt-2">{proj.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.vision}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Project Deep Inspector (All 21 attributes + Continuity state) */}
          <div className="lg:col-span-3">
            {selectedProject ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {selectedProject.health}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {selectedProject.id}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                      {selectedProject.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Current State: <span className="text-slate-200 font-medium">{selectedProject.currentState}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => executeProjectContinuity(selectedProject.name)}
                    className="self-start sm:self-center px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Hydrate Context &amp; Continue</span>
                  </button>
                </div>

                {/* Continuity Memory Differentiation (Section 7) */}
                <div className="bg-slate-950 border border-indigo-900/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Project Memory &amp; Epistemic Continuity State
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-emerald-400">Verified Facts</span>
                      <ul className="mt-1 space-y-1 text-slate-300 text-[11px]">
                        {selectedProject.continuityState.facts.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-amber-400">Active Assumptions</span>
                      <ul className="mt-1 space-y-1 text-slate-300 text-[11px]">
                        {selectedProject.continuityState.assumptions.map((a, i) => (
                          <li key={i}>• {a}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-sky-400">Core Hypotheses</span>
                      <ul className="mt-1 space-y-1 text-slate-300 text-[11px]">
                        {selectedProject.continuityState.hypotheses.map((h, i) => (
                          <li key={i}>• {h}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-red-400">Blocked Work</span>
                      <ul className="mt-1 space-y-1 text-slate-300 text-[11px]">
                        {selectedProject.continuityState.blockedWork.map((b, i) => (
                          <li key={i}>• {b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 21 Systematic Model Attributes (Grid Breakdown) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <AttrCard title="1. Vision" content={selectedProject.vision} />
                  <AttrCard title="2. Problem" content={selectedProject.problem} />
                  <AttrCard title="3. Target Users" list={selectedProject.users} />
                  <AttrCard title="4. Core Goals" list={selectedProject.goals} />
                  <AttrCard title="5. Requirements" list={selectedProject.requirements} />
                  <AttrCard title="6. Features" list={selectedProject.features} />
                  <AttrCard title="7. Architecture" content={selectedProject.architecture} />
                  <AttrCard title="8. Components" list={selectedProject.components} />
                  <AttrCard
                    title="9. Assigned Specialist Agents"
                    list={selectedProject.agents.map((a) => `${a} agent`)}
                  />
                  <AttrCard title="10. Data Model & Storage" content={selectedProject.data} />
                  <AttrCard title="11. Integrations" list={selectedProject.integrations} />
                  <AttrCard title="12. Documentation & ADRs" content={selectedProject.documentation} />
                  <AttrCard
                    title="13. Code & Repository"
                    content={`Branch: ${selectedProject.code.branch || 'main'} | Files: ${selectedProject.code.keyFiles.join(', ')}`}
                  />
                  <AttrCard
                    title="14. Tasks Count"
                    content={`${selectedProject.tasks.length} total tasks (${selectedProject.tasks.filter((t) => t.currentState === 'completed').length} completed)`}
                  />
                  <AttrCard
                    title="15. Decisions Made"
                    content={`${selectedProject.decisions.length} recorded ADRs`}
                  />
                  <AttrCard title="16. Key Risks" list={selectedProject.risks} />
                  <AttrCard title="17. Active Experiments" list={selectedProject.experiments} />
                  <AttrCard title="18. Validation & Traction" content={selectedProject.validation} />
                  <AttrCard title="19. Business & Revenue Model" content={selectedProject.businessModel} />
                  <AttrCard title="20. Current State" content={selectedProject.currentState} />
                  <AttrCard title="21. Next Immediate Actions" list={selectedProject.nextActions} highlight />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                Select a project from the left sidebar to inspect its 21 attributes.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Identity */}
      {activeTab === 'identity' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center font-bold text-lg text-indigo-400">
              AV
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{worldModel.identity.name}</h2>
              <p className="text-xs text-indigo-400 font-semibold">{worldModel.identity.careerDirection}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800 text-xs">
            <div>
              <h3 className="font-bold text-slate-300 uppercase tracking-wider mb-2">Education &amp; Background</h3>
              <ul className="space-y-1 text-slate-400">
                {worldModel.identity.education.map((edu, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-950 border border-slate-800/80">• {edu}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-300 uppercase tracking-wider mb-2">Core Skills &amp; Proficiencies</h3>
              <ul className="space-y-1 text-slate-400">
                {worldModel.identity.skills.map((skill, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-950 border border-slate-800/80">• {skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-300 uppercase tracking-wider mb-2">Research &amp; Venture Interests</h3>
              <ul className="space-y-1 text-slate-400">
                {worldModel.identity.interests.map((int, idx) => (
                  <li key={idx} className="p-2 rounded bg-slate-950 border border-slate-800/80">• {int}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Goals */}
      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {worldModel.goals.map((goal) => (
            <div key={goal.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {goal.category}
                  </span>
                  <span className="text-slate-400 font-mono">Target: {goal.targetDate}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{goal.title}</h3>
                <p className="text-xs text-slate-400 mt-2">
                  <strong>Metrics:</strong> {goal.metrics}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-white">{goal.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${goal.progressPercentage}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Businesses & Ventures */}
      {activeTab === 'businesses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {worldModel.businesses.map((biz) => (
            <div key={biz.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  {biz.type.replace('_', ' ')}
                </span>
                <span className="text-xs font-semibold text-emerald-400">{biz.mrrOrPotential}</span>
              </div>
              <h3 className="font-bold text-white text-base">{biz.name}</h3>
              <p className="text-xs text-slate-400">{biz.description}</p>
              <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
                <p><strong>Target Customers:</strong> {biz.targetCustomers.join(', ')}</p>
                <p><strong>Monetization:</strong> {biz.monetization}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Learning & Skills Gaps */}
      {activeTab === 'learning' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {worldModel.learning.map((item) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    {item.type}
                  </span>
                  <span className="text-slate-300 capitalize">{item.proficiency}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{item.topic}</h3>
                <p className="text-xs text-slate-400 mt-2">{item.notes}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Identified Learning Gaps:</h4>
                <ul className="text-xs text-slate-300 mt-1 space-y-1">
                  {item.learningGaps.map((gap, i) => (
                    <li key={i}>• {gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Responsibilities */}
      {activeTab === 'responsibilities' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {worldModel.responsibilities.map((resp) => (
            <div key={resp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                {resp.domain}
              </span>
              <h3 className="font-bold text-white text-sm">{resp.title}</h3>
              <p className="text-xs text-slate-400"><strong>Cadence:</strong> {resp.cadence}</p>
              <p className="text-xs text-slate-400"><strong>Commitment:</strong> {resp.commitmentLevel}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 7: People & Collaborators */}
      {activeTab === 'people' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {worldModel.people.map((person) => (
            <div key={person.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-purple-400">{person.relationship}</span>
                <span className="text-slate-500">{person.organization}</span>
              </div>
              <h3 className="font-bold text-white text-sm">{person.name}</h3>
              <p className="text-xs text-slate-300">{person.role}</p>
              <p className="text-xs text-slate-400 italic">"{person.notes}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 8: Resources */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {worldModel.resources.map((res) => (
            <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-sky-300">
                {res.type}
              </span>
              <h3 className="font-bold text-white text-sm">{res.name}</h3>
              <p className="text-xs font-mono text-indigo-400">{res.linkOrRef}</p>
              <p className="text-xs text-slate-400">{res.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 9: Knowledge */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {worldModel.knowledge.map((k) => (
            <div key={k.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                  {k.domain}
                </span>
                <h3 className="font-bold text-white text-sm mt-1">{k.title}</h3>
                <p className="text-xs text-slate-300 mt-2">{k.summary}</p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>Reusable in:</strong> {k.reusableInProjects.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 10: Decisions & Reversals */}
      {activeTab === 'decisions' && (
        <div className="space-y-3">
          {worldModel.decisions.map((dec) => (
            <div key={dec.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-400">{dec.date}</span>
                <span className="font-semibold text-emerald-400 uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">
                  {dec.status}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">{dec.title}</h3>
              <p className="text-xs text-slate-300"><strong>Rationale:</strong> {dec.rationale}</p>
              <p className="text-xs text-slate-400">
                <strong>Alternatives Considered:</strong> {dec.alternativesConsidered.join('; ')}
              </p>
              <p className="text-xs text-amber-400/90 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <strong>Reversal Conditions:</strong> {dec.reversalConditions}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SubTab: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
      active ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const AttrCard: React.FC<{
  title: string;
  content?: string;
  list?: string[];
  highlight?: boolean;
}> = ({ title, content, list, highlight }) => (
  <div
    className={`p-3 rounded-lg border ${
      highlight ? 'bg-indigo-950/30 border-indigo-500/50' : 'bg-slate-950/70 border-slate-800/80'
    }`}
  >
    <h4 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-1">{title}</h4>
    {content && <p className="text-slate-200 text-xs">{content}</p>}
    {list && (
      <ul className="space-y-0.5 text-slate-300 text-xs">
        {list.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    )}
  </div>
);
