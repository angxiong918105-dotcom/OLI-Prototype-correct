import { type ReactNode } from 'react';
import { Sparkles, ArrowRight, Check, Circle, BookOpen, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { JournalEntry } from '../types/journal';
import { modules } from '../data/modules';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ConceptStage = 'Not Started' | 'Emerging' | 'Developing' | 'Applying';

interface ConceptItem {
  name: string;
  stage: ConceptStage;
  progress: number; // 0-100
}

interface ExperimentStep {
  label: string;
  description: string;
  completed: boolean;
  evidence?: string;
}

/* ------------------------------------------------------------------ */
/*  Data derivation helpers                                            */
/* ------------------------------------------------------------------ */

function deriveConceptMastery(entries: JournalEntry[]): ConceptItem[] {
  const completedIds = new Set(entries.map((e) => e.moduleId));

  function assess(related: string[]): { stage: ConceptStage; progress: number } {
    const done = related.filter((id) => completedIds.has(id)).length;
    const total = related.length;

    if (done === 0) return { stage: 'Not Started', progress: 0 };
    if (done < total) return { stage: 'Emerging', progress: 30 };

    const hasDeep = entries.some(
      (e) =>
        related.includes(e.moduleId) &&
        e.reflectionText &&
        e.reflectionText.length > 30,
    );
    return hasDeep
      ? { stage: 'Applying', progress: 100 }
      : { stage: 'Developing', progress: 65 };
  }

  return [
    { name: 'Pattern Observation', ...assess(['intro', 'observe']) },
    { name: 'Flow vs Coherence', ...assess(['reframe', 'branching']) },
    { name: 'Experiment Design', ...assess(['ideate', 'prototype']) },
    { name: 'Meaning Reflection', ...assess(['test']) },
  ];
}

function deriveLearningActivity(entries: JournalEntry[]) {
  const uniqueModules = new Set(entries.map((e) => e.moduleId));
  return {
    modulesCompleted: uniqueModules.size,
    totalModules: modules.length,
    exercisesCompleted: entries.filter(
      (e) => e.selectedSignals && e.selectedSignals.length > 0,
    ).length,
    reflectionsWritten: entries.filter((e) => e.reflectionText).length,
  };
}

function deriveExperimentEvidence(entries: JournalEntry[]): ExperimentStep[] {
  const ids = new Set(entries.map((e) => e.moduleId));
  const signals = entries.filter(
    (e) => e.selectedSignals && e.selectedSignals.length > 0,
  );

  return [
    {
      label: 'Patterns Observed',
      description: 'Identify meaningful signals in daily life',
      completed: ids.has('observe') || signals.length > 0,
      evidence:
        signals.length > 0
          ? `${signals.reduce((s, e) => s + (e.selectedSignals?.length ?? 0), 0)} signals identified`
          : undefined,
    },
    {
      label: 'Direction Chosen',
      description: 'Choose between flow and coherence paths',
      completed: ids.has('branching'),
      evidence: ids.has('branching')
        ? 'Exploration direction selected'
        : undefined,
    },
    {
      label: 'Experiment Action',
      description: 'Design and run a meaning experiment',
      completed: ids.has('ideate') || ids.has('prototype'),
      evidence: ids.has('prototype')
        ? 'Prototype tested'
        : ids.has('ideate')
          ? 'Prototype designed'
          : undefined,
    },
    {
      label: 'Meaning Reflection',
      description: 'Reflect on what you learned about meaning',
      completed: ids.has('test'),
      evidence: ids.has('test') ? 'Reflection completed' : undefined,
    },
  ];
}

function deriveSuggestedNextStep(entries: JournalEntry[]) {
  const ids = new Set(entries.map((e) => e.moduleId));
  const reflections = entries.filter((e) => e.reflectionText).length;

  if (ids.size === 0)
    return {
      message:
        'Based on your profile, we recommend starting with Module 1 — an introduction to meaning as a designable experience. Most learners complete it in under 10 minutes.',
      linkTo: '/module/intro',
      linkLabel: 'Start Module 1',
    };
  if (!ids.has('observe'))
    return {
      message:
        'You\'ve completed the intro. Your next step is to practice pattern observation — identifying what gives you energy vs. what drains it in daily life.',
      linkTo: '/reflection/observe',
      linkLabel: 'Begin Observation Exercise',
    };
  if (!ids.has('branching'))
    return {
      message:
        `You have ${entries.filter(e => e.selectedSignals && e.selectedSignals.length > 0).reduce((s, e) => s + (e.selectedSignals?.length ?? 0), 0)} signals recorded. Based on your observations, the next step is choosing between the flow path and the coherence path.`,
      linkTo: '/module/branching',
      linkLabel: 'Choose Your Direction',
    };
  if (!ids.has('ideate'))
    return {
      message:
        'Direction selected. Now translate your choice into a concrete, small-scale experiment you can run this week. This is where learning becomes action.',
      linkTo: '/module/ideate',
      linkLabel: 'Design Your Experiment',
    };
  if (!ids.has('prototype'))
    return {
      message:
        'Your experiment design is ready. The next step is to test it — gather real evidence about what shifts your sense of meaning.',
      linkTo: '/module/prototype',
      linkLabel: 'Run Your Prototype',
    };
  if (!ids.has('test'))
    return {
      message:
        `You've run your experiment. With ${reflections} reflection${reflections !== 1 ? 's' : ''} so far, a synthesis reflection will help you consolidate what you've learned.`,
      linkTo: '/reflection/test',
      linkLabel: 'Write Synthesis Reflection',
    };

  return {
    message:
      "You've completed the full meaning design cycle. Consider revisiting your observations or starting a new experiment to deepen your practice.",
    linkTo: '/reflection/observe',
    linkLabel: 'Begin a New Cycle',
  };
}

function deriveOverallSummary(entries: JournalEntry[]): string {
  const ids = new Set(entries.map((e) => e.moduleId));
  const reflections = entries.filter((e) => e.reflectionText).length;

  if (ids.size === 0)
    return 'You haven\'t started yet — your learning journey begins with the first observation.';
  if (ids.size === 1)
    return 'You\'ve taken your first step. Early engagement detected — keep building momentum.';
  if (ids.size <= 3)
    return `You\'re actively exploring — ${ids.size} modules visited, ${reflections} reflection${reflections !== 1 ? 's' : ''} recorded so far.`;
  if (ids.size <= 5)
    return `Solid progress — you\'ve engaged with ${ids.size} modules and written ${reflections} reflection${reflections !== 1 ? 's' : ''}. Patterns are emerging.`;
  return `Deep engagement — ${ids.size} modules completed with ${reflections} reflections. You\'re developing a personal meaning-design practice.`;
}

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                  */
/* ------------------------------------------------------------------ */

function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-6 rounded-2xl border border-black/5 bg-white/80 ${className}`}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  1 · Concept Mastery                                                */
/* ------------------------------------------------------------------ */

const STAGE_BAR_BG: Record<ConceptStage, string> = {
  'Not Started': 'bg-black/[0.04]',
  Emerging: 'bg-gradient-to-r from-[#C5D5C6] to-[#B0C4B1]',
  Developing: 'bg-gradient-to-r from-[#9BB89D] to-[#7DA67F]',
  Applying: 'bg-gradient-to-r from-[#6B8F6E] to-[#5A7D5C]',
};

const STAGE_TEXT: Record<ConceptStage, string> = {
  'Not Started': 'text-muted/40',
  Emerging: 'text-[#7DA67F]',
  Developing: 'text-[#5A7D5C]',
  Applying: 'text-[#4A6B4C]',
};

const STAGE_ICON: Record<ConceptStage, string> = {
  'Not Started': '○',
  Emerging: '◔',
  Developing: '◑',
  Applying: '●',
};

function StageBar({ progress, stage }: { progress: number; stage: ConceptStage }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-[5px] rounded-full bg-black/[0.03] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${STAGE_BAR_BG[stage]}`}
          style={{ width: `${Math.max(progress, stage === 'Not Started' ? 0 : 4)}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-medium tracking-wide shrink-0 flex items-center gap-1 ${STAGE_TEXT[stage]}`}
      >
        <span className="text-[9px]">{STAGE_ICON[stage]}</span>
        {stage}
      </span>
    </div>
  );
}

function ConceptMastery({ entries }: { entries: JournalEntry[] }) {
  const concepts = deriveConceptMastery(entries);
  const mastered = concepts.filter((c) => c.stage === 'Applying').length;
  const inProgress = concepts.filter((c) => c.stage !== 'Not Started' && c.stage !== 'Applying').length;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <Label>Concept Mastery</Label>
          <p className="text-[11px] text-muted/50 mt-1">
            Understanding depth across core concepts
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted/40 leading-tight">
            {mastered > 0 && <span className="text-[#5A7D5C]">{mastered} applying</span>}
            {mastered > 0 && inProgress > 0 && <span> · </span>}
            {inProgress > 0 && <span>{inProgress} in progress</span>}
            {mastered === 0 && inProgress === 0 && <span>Not yet started</span>}
          </p>
        </div>
      </div>

      <div className="space-y-3.5 mt-4">
        {concepts.map((c) => (
          <div key={c.name}>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-[13px] text-ink">{c.name}</p>
              <p className={`text-[10px] tabular-nums ${c.progress > 0 ? 'text-muted/50' : 'text-muted/30'}`}>
                {c.progress}%
              </p>
            </div>
            <StageBar progress={c.progress} stage={c.stage} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  2 · Learning Activity                                              */
/* ------------------------------------------------------------------ */

function LearningActivity({ entries }: { entries: JournalEntry[] }) {
  const a = deriveLearningActivity(entries);
  const items = [
    {
      value: a.modulesCompleted,
      total: a.totalModules,
      label: 'Modules completed',
      icon: BookOpen,
      color: a.modulesCompleted > 0 ? 'text-[#6B8F6E]' : 'text-muted/30',
    },
    {
      value: a.exercisesCompleted,
      total: undefined,
      label: 'Exercises submitted',
      icon: Circle,
      color: a.exercisesCompleted > 0 ? 'text-[#6B8F6E]' : 'text-muted/30',
    },
    {
      value: a.reflectionsWritten,
      total: undefined,
      label: 'Reflections written',
      icon: Brain,
      color: a.reflectionsWritten > 0 ? 'text-[#6B8F6E]' : 'text-muted/30',
    },
  ];

  return (
    <Card>
      <Label>Learning Activity</Label>
      <p className="text-[11px] text-muted/50 mt-1">
        Evidence of engagement across the course
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-black/[0.02] flex items-center justify-center ${item.color}`}>
              <item.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-ink leading-tight">
                <span className="font-semibold tabular-nums">{item.value}</span>
                {item.total !== undefined && (
                  <span className="text-muted/40 font-normal"> / {item.total}</span>
                )}
              </p>
              <p className="text-[10px] text-muted/45 mt-0.5">{item.label}</p>
            </div>
            {item.value > 0 && (
              <div className="w-1.5 h-1.5 rounded-full bg-[#6B8F6E]/60" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  3 · Meaning Experiment Evidence                                    */
/* ------------------------------------------------------------------ */

function MeaningExperimentEvidence({ entries }: { entries: JournalEntry[] }) {
  const stages = deriveExperimentEvidence(entries);
  const completedCount = stages.filter((s) => s.completed).length;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <Label>Meaning Experiment Evidence</Label>
          <p className="text-[11px] text-muted/50 mt-1">
            Your learning journey: observe → choose → experiment → reflect
          </p>
        </div>
        <span className="text-[10px] text-muted/40 tabular-nums shrink-0">
          {completedCount}/{stages.length} steps
        </span>
      </div>

      <div className="relative mt-4">
        {/* Vertical connecting line */}
        <div className="absolute left-[11px] top-4 bottom-4 w-px bg-black/[0.06]" />

        <div className="space-y-0.5">
          {stages.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-start gap-3 relative py-2.5 px-2 -mx-2 rounded-lg transition-colors ${
                !s.completed && i === completedCount ? 'bg-[#6B8F6E]/[0.04]' : ''
              }`}
            >
              {/* Circle */}
              <div
                className={`w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 relative z-10 transition-all ${
                  s.completed
                    ? 'bg-[#6B8F6E] shadow-sm shadow-[#6B8F6E]/20'
                    : i === completedCount
                      ? 'bg-paper border-2 border-[#6B8F6E]/40 ring-2 ring-[#6B8F6E]/10'
                      : 'bg-paper border-2 border-black/[0.08]'
                }`}
              >
                {s.completed ? (
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                ) : (
                  <span className={`text-[8px] font-bold ${
                    i === completedCount ? 'text-[#6B8F6E]/60' : 'text-muted/25'
                  }`}>{i + 1}</span>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] leading-snug font-medium ${
                    s.completed ? 'text-ink' : i === completedCount ? 'text-ink/70' : 'text-muted/40'
                  }`}
                >
                  {s.label}
                </p>
                <p
                  className={`text-[11px] mt-0.5 ${
                    s.evidence
                      ? 'text-[#6B8F6E] font-medium'
                      : i === completedCount
                        ? 'text-muted/50'
                        : 'text-muted/30'
                  }`}
                >
                  {s.evidence ?? (s.completed ? s.description : `Not yet — ${s.description.toLowerCase()}`)}
                </p>
              </div>

              {/* Status indicator */}
              {!s.completed && i === completedCount && (
                <span className="text-[9px] font-medium text-[#6B8F6E]/70 bg-[#6B8F6E]/[0.08] px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">
                  Next
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  4 · Suggested Next Step                                            */
/* ------------------------------------------------------------------ */

function SuggestedNextStep({ entries }: { entries: JournalEntry[] }) {
  const s = deriveSuggestedNextStep(entries);

  return (
    <Card className="bg-gradient-to-br from-[#6B8F6E]/[0.06] to-[#6B8F6E]/[0.02] border-[#6B8F6E]/10">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-[#6B8F6E]/10 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-[#6B8F6E]" />
        </div>
        <Label>AI-Recommended Next Step</Label>
      </div>

      <p className="text-[13px] text-ink/80 leading-relaxed mt-3">
        {s.message}
      </p>

      <div className="mt-4 pt-3 border-t border-black/[0.04]">
        <Link
          to={s.linkTo}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#5A7D5C] hover:text-[#4A6B4C] transition-colors group"
        >
          {s.linkLabel}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function OLMDashboard({ entries }: { entries: JournalEntry[] }) {
  const summary = deriveOverallSummary(entries);

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-[10px] font-semibold text-muted uppercase tracking-widest">
          My Learning Dashboard
        </h2>
        <p className="text-[13px] text-ink/60 mt-1.5 leading-relaxed">
          {summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConceptMastery entries={entries} />
        <LearningActivity entries={entries} />
        <MeaningExperimentEvidence entries={entries} />
        <SuggestedNextStep entries={entries} />
      </div>
    </section>
  );
}
