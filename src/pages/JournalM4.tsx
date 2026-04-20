import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// ─── Config ───────────────────────────────────────────────────────────────────

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? '';

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SUMMARY_SYSTEM = `You are a concise writing assistant. Write 2-3 sentences that recap what the learner set out to do — the task, the sense they chose to focus on, and the question they carried in. Do not interpret, evaluate, or add meaning. Do not use the word "experiment." Write in second person. Stick closely to what was stated.`;

const GIBBS_SYSTEM = `You are a reflective learning coach. Your job is to read a learner's journal responses and identify which stages of the Gibbs Reflective Cycle are present or absent, then ask ONE question to push them toward the next uncovered stage.

Gibbs stages:
- Description: recounts what happened, facts, sequence of events
- Feelings: mentions emotions, reactions, how it felt
- Evaluation: notes what worked or didn't work
- Analysis: explains why something happened, looks for patterns or causes
- Conclusion: articulates a learning, insight, or takeaway
- Action Plan: identifies a next step, something to try or do differently

Be generous in identifying covered stages. If a stage is even lightly touched — a passing mention of a feeling, a brief evaluation — count it as covered. Only mark a stage as missing if there is no trace of it at all.

Rules:
1. Identify which stages are clearly present in the writing
2. Find the earliest stage that is absent or thin
3. Ask exactly ONE question (1-2 sentences) that naturally pushes toward that stage
4. Do not mention Gibbs or any stage names
5. Do not summarize or paraphrase what the learner wrote
6. Do not use "it sounds like" or "it seems like"
7. Do not give advice
8. Tone: curious, warm, human — never clinical

Return JSON only:
{
  "covered_stages": ["Description", "Feelings"],
  "missing_stages": ["Evaluation", "Analysis", "Conclusion", "Action Plan"],
  "follow_up_question": "your question here"
}`;

const ITERATE_SYSTEM = `You are a warm, practical learning coach. Based on a learner's full reflection on their meaning design activity, suggest ONE specific way they could iterate or deepen the activity next time. Be concrete and brief (2-3 sentences). Do not give generic advice. Reference something specific from what they wrote. Do not use the word "experiment."

Return JSON only:
{
  "suggestion": "your suggestion here"
}`;

const ALL_GIBBS_STAGES = [
  'Description',
  'Feelings',
  'Evaluation',
  'Analysis',
  'Conclusion',
  'Action Plan',
];

// ─── OpenAI helper ────────────────────────────────────────────────────────────

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function callOpenAI(
  systemPrompt: string,
  userContent: string,
  json = false,
): Promise<string> {
  return callOpenAIMessages(
    [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
    json,
  );
}

async function callOpenAIMessages(messages: ChatMessage[], json = false): Promise<string> {
  const body: Record<string, unknown> = {
    model: 'gpt-4o',
    messages,
    temperature: 0.7,
    max_tokens: json ? 500 : 300,
  };
  if (json) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

function buildInitialContext(summary: string, q1: string, q2: string, q3: string): string {
  return [
    `Experiment summary: ${summary}`,
    '',
    'Initial reflections:',
    'Q: What did you actually do?',
    `A: ${q1}`,
    '',
    'Q: What did you notice?',
    `A: ${q2}`,
    '',
    'Q: What surprised you?',
    `A: ${q3}`,
  ].join('\n');
}

function buildGibbsMessages(
  summary: string,
  q1: string,
  q2: string,
  q3: string,
  followups: FollowUp[],
  rawResponses: string[],
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: 'system', content: GIBBS_SYSTEM },
    { role: 'user', content: buildInitialContext(summary, q1, q2, q3) },
  ];
  for (let i = 0; i < followups.length; i++) {
    if (rawResponses[i]) messages.push({ role: 'assistant', content: rawResponses[i] });
    messages.push({ role: 'user', content: followups[i].answer });
  }
  return messages;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FollowUp {
  question: string;
  answer: string;
}

interface SavedEntry {
  summary: string;
  reflections: { q1: string; q2: string; q3: string };
  followups: FollowUp[];
  suggestion: string;
  completedAt: string;
}

type FlowStep = 'loading' | 'questions' | 'gibbs' | 'suggestion';


// ─── Read-only entry view ─────────────────────────────────────────────────────

function ReadOnlyEntry({ entry }: { entry: SavedEntry }) {
  const completedDate = new Date(entry.completedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
          Your experiment
        </p>
        <blockquote className="text-sm text-ink/85 leading-relaxed italic border-l-2 border-ink/15 pl-4">
          {entry.summary}
        </blockquote>
      </div>

      {/* Reflections */}
      <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 space-y-5">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">
          Reflections
        </p>
        {[
          { q: 'What did you actually do?', a: entry.reflections.q1 },
          { q: 'What did you notice?', a: entry.reflections.q2 },
          { q: 'What surprised you?', a: entry.reflections.q3 },
        ].map(({ q, a }) => (
          <div key={q}>
            <p className="text-xs font-medium text-ink mb-1.5">{q}</p>
            <p className="text-sm text-ink/80 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      {/* Follow-ups */}
      {entry.followups.length > 0 && (
        <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 space-y-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">
            Deeper reflection
          </p>
          {entry.followups.map((fu, i) => (
            <div key={i} className="space-y-3">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-black/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] text-muted font-medium">AI</span>
                </div>
                <p className="text-sm text-ink/80 leading-relaxed pt-1">{fu.question}</p>
              </div>
              <div className="pl-10">
                <p className="text-sm text-ink leading-relaxed">{fu.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestion */}
      {entry.suggestion && (
        <div className="rounded-2xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 p-6">
          <p className="text-[10px] font-semibold text-[#6B8F6E] uppercase tracking-widest mb-3">
            Try this next time
          </p>
          <p className="text-sm text-ink leading-relaxed">{entry.suggestion}</p>
        </div>
      )}

      <p className="text-xs text-muted">Completed {completedDate}</p>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return <Loader2 className="w-4 h-4 animate-spin text-muted" />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JournalM4() {
  const navigate = useNavigate();

  const [isReadOnly, setIsReadOnly] = useState(false);
  const [savedEntry, setSavedEntry] = useState<SavedEntry | null>(null);

  const [m4Task, setM4Task] = useState('');
  const [m4Sense, setM4Sense] = useState('');
  const [m4Wonder, setM4Wonder] = useState('');
  const [summary, setSummary] = useState('');

  const [step, setStep] = useState<FlowStep>('loading');
  const [loadError, setLoadError] = useState('');

  // Step 1
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Step 2 — Gibbs loop
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [coveredStages, setCoveredStages] = useState<string[]>([]);
  const [targetStage, setTargetStage] = useState('');
  const [gibbsRawResponses, setGibbsRawResponses] = useState<string[]>([]);
  const [gibbsLoading, setGibbsLoading] = useState(false);
  const [gibbsError, setGibbsError] = useState('');

  // Step 3
  const [suggestion, setSuggestion] = useState('');
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new content appears
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentQuestion, followups.length, step]);

  // ── On mount ──
  useEffect(() => {
    const status = localStorage.getItem('journal_m4_status') ?? 'locked';

    if (status === 'done') {
      const raw = localStorage.getItem('journal_m4_entry');
      if (raw) {
        try {
          setSavedEntry(JSON.parse(raw) as SavedEntry);
        } catch {}
      }
      setIsReadOnly(true);
      return;
    }

    if (status !== 'available') {
      navigate('/journal');
      return;
    }

    const task = localStorage.getItem('m4_task') ?? '';
    const sense = localStorage.getItem('m4_sense') ?? '';
    const wonder = localStorage.getItem('m4_wonder') ?? '';
    setM4Task(task);
    setM4Sense(sense);
    setM4Wonder(wonder);

    generateSummary(task, sense, wonder);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 0: Generate summary ──

  async function generateSummary(task: string, sense: string, wonder: string) {
    setStep('loading');
    setLoadError('');
    try {
      const userPrompt = `Task: ${task}. Sense entry point: ${sense}. Wonder question: ${wonder}.`;
      const result = await callOpenAI(SUMMARY_SYSTEM, userPrompt);
      setSummary(result);
      setStep('questions');
    } catch {
      setLoadError('Something went wrong — try again');
    }
  }

  // ── Step 1: Submit reflections → first Gibbs call ──

  async function handleSubmitReflections() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const messages = buildGibbsMessages(summary, q1, q2, q3, [], []);
      const raw = await callOpenAIMessages(messages, true);
      const parsed = JSON.parse(raw) as {
        covered_stages?: string[];
        missing_stages?: string[];
        follow_up_question?: string;
      };
      const covered = parsed.covered_stages ?? [];
      const missing = parsed.missing_stages ?? ALL_GIBBS_STAGES.filter(s => !covered.includes(s));
      const question = parsed.follow_up_question ?? '';

      setCoveredStages(covered);
      setTargetStage(missing[0] ?? '');
      setGibbsRawResponses([raw]);

      if (ALL_GIBBS_STAGES.every(s => covered.includes(s))) {
        setStep('suggestion');
        generateSuggestion([], covered);
      } else {
        setCurrentQuestion(question);
        setStep('gibbs');
      }
    } catch {
      setSubmitError('Something went wrong — try again');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 2: Submit follow-up answer ──

  async function handleSubmitFollowUp() {
    if (!currentAnswer.trim() || gibbsLoading) return;

    const nextFollowups: FollowUp[] = [
      ...followups,
      { question: currentQuestion, answer: currentAnswer },
    ];
    setFollowups(nextFollowups);
    setCurrentAnswer('');
    setGibbsLoading(true);
    setGibbsError('');

    try {
      const messages = buildGibbsMessages(summary, q1, q2, q3, nextFollowups, gibbsRawResponses);
      const raw = await callOpenAIMessages(messages, true);
      const parsed = JSON.parse(raw) as {
        covered_stages?: string[];
        missing_stages?: string[];
        follow_up_question?: string;
      };
      const covered = parsed.covered_stages ?? [];
      const missing = parsed.missing_stages ?? ALL_GIBBS_STAGES.filter(s => !covered.includes(s));
      const question = parsed.follow_up_question ?? '';

      setCoveredStages(covered);
      setTargetStage(missing[0] ?? '');
      setGibbsRawResponses(prev => [...prev, raw]);

      if (ALL_GIBBS_STAGES.every(s => covered.includes(s))) {
        setStep('suggestion');
        generateSuggestion(nextFollowups, covered);
      } else {
        setCurrentQuestion(question);
      }
    } catch {
      setGibbsError('Something went wrong — try again');
    } finally {
      setGibbsLoading(false);
    }
  }

  // ── Step 3: Generate iterate suggestion ──

  async function generateSuggestion(fups: FollowUp[], covered: string[]) {
    setSuggestionLoading(true);
    setSuggestionError('');
    setCoveredStages(covered);

    try {
      // Build prompt from available state
      const parts = [
        `Experiment summary: ${summary}`,
        '',
        `Q: What did you actually do?\nA: ${q1}`,
        `Q: What did you notice?\nA: ${q2}`,
        `Q: What surprised you?\nA: ${q3}`,
      ];

      // Token budget check (~4 chars per token, stay under 3000 tokens for this payload)
      const BASE_TOKENS = Math.ceil(parts.join('\n').length / 4);
      let tokenBudget = 3000 - BASE_TOKENS;
      const included: string[] = [];
      const skipped: number[] = [];

      for (let i = 0; i < fups.length; i++) {
        const chunk = `Q: ${fups[i].question}\nA: ${fups[i].answer}`;
        const cost = Math.ceil(chunk.length / 4);
        if (cost <= tokenBudget) {
          included.push(chunk);
          tokenBudget -= cost;
        } else {
          skipped.push(i);
        }
      }

      if (skipped.length > 0) {
        console.warn(
          `[generateSuggestion] Omitted ${skipped.length} follow-up exchange(s) (indices ${skipped.join(', ')}) to stay within token budget.`,
        );
        parts.push('', '[Some earlier follow-up exchanges omitted for length]');
      }

      if (included.length > 0) parts.push('', ...included);

      const prompt = parts.join('\n');
      console.log('[generateSuggestion] Sending prompt (~%d tokens):\n%s', Math.ceil(prompt.length / 4), prompt);

      const raw = await callOpenAI(ITERATE_SYSTEM, prompt, true);

      console.log('[generateSuggestion] Raw response:', raw);

      let parsed: { suggestion?: string };
      try {
        parsed = JSON.parse(raw) as { suggestion?: string };
      } catch (parseErr) {
        console.error('[generateSuggestion] JSON parse failed. Raw was:', raw, parseErr);
        throw new Error('Invalid JSON from model');
      }

      if (!parsed.suggestion) {
        console.error('[generateSuggestion] Parsed object missing "suggestion" key:', parsed);
      }

      setSuggestion(parsed.suggestion ?? '');
    } catch (err) {
      console.error('[generateSuggestion] Failed:', err);
      setSuggestionError('Something went wrong — try again');
    } finally {
      setSuggestionLoading(false);
    }
  }

  // ── Step 4: Complete ──

  function handleComplete() {
    const entry: SavedEntry = {
      summary,
      reflections: { q1, q2, q3 },
      followups,
      suggestion,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem('journal_m4_entry', JSON.stringify(entry));
    localStorage.setItem('journal_m4_status', 'done');
    localStorage.setItem('module5_unlocked', 'true');
    navigate('/journal');
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto w-full py-16 px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/journal')}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Journal
        </button>
        <span className="text-xs font-medium text-muted uppercase tracking-widest">Module 4</span>
        <h1 className="font-serif text-3xl mt-1 text-ink">Wonder & Flow</h1>
      </div>

      {/* ── Read-only view ── */}
      {isReadOnly && savedEntry && <ReadOnlyEntry entry={savedEntry} />}

      {isReadOnly && !savedEntry && (
        <p className="text-sm text-muted">Entry not found.</p>
      )}

      {/* ── Live flow ── */}
      {!isReadOnly && (
        <div className="space-y-6">

          {/* Step 0: Loading summary */}
          {step === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 py-8 text-sm text-muted"
            >
              <Spinner /> Generating your experiment summary…
            </motion.div>
          )}

          {loadError && (
            <div className="flex items-center gap-3 text-sm text-red-600">
              <span>{loadError}</span>
              <button
                onClick={() => generateSummary(m4Task, m4Sense, m4Wonder)}
                className="underline underline-offset-2 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          )}

          {/* Step 1+: Questions (summary block always visible once loaded) */}
          {(step === 'questions' || step === 'gibbs' || step === 'suggestion') && summary && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6"
            >
              <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
                Your experiment
              </p>
              <blockquote className="text-sm text-ink/85 leading-relaxed italic border-l-2 border-ink/15 pl-4">
                {summary}
              </blockquote>
            </motion.div>
          )}

          {step === 'questions' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 space-y-6"
            >
              <p className="text-xs font-semibold text-muted uppercase tracking-widest">
                Reflect
              </p>

              {[
                {
                  id: 'q1',
                  label: 'What did you actually do?',
                  sub: 'Describe the activity — the task you chose, what you tried, and what happened.',
                  value: q1,
                  set: setQ1,
                },
                {
                  id: 'q2',
                  label: 'What did you notice?',
                  sub: 'Was there a moment where something shifted — even slightly? Or did it feel the same as usual?',
                  value: q2,
                  set: setQ2,
                },
                {
                  id: 'q3',
                  label: 'What surprised you?',
                  sub: "Something you expected, something you didn't, or something you're still not sure about.",
                  value: q3,
                  set: setQ3,
                },
              ].map(({ id, label, sub, value, set }) => (
                <div key={id}>
                  <label className="block text-sm font-medium text-ink mb-1">{label}</label>
                  <p className="text-xs text-muted mb-2 leading-relaxed">{sub}</p>
                  <textarea
                    value={value}
                    onChange={e => set(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink/30 transition-all resize-none leading-relaxed"
                  />
                </div>
              ))}

              {submitError && (
                <p className="text-xs text-red-600">{submitError}</p>
              )}

              <button
                onClick={handleSubmitReflections}
                disabled={!q1.trim() || !q2.trim() || !q3.trim() || submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Spinner /> Thinking…</>
                ) : (
                  <>Submit <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </motion.div>
          )}

          {/* Step 2: Gibbs follow-up loop */}
          {(step === 'gibbs' || step === 'suggestion') && (
            <div className="space-y-4">
              {/* Completed follow-ups */}
              {followups.map((fu, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-black/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-muted font-medium">AI</span>
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm border border-black/[0.08] bg-white shadow-sm px-4 py-3">
                      <p className="text-sm text-ink leading-relaxed">{fu.question}</p>
                    </div>
                  </div>
                  <div className="pl-10">
                    <div className="rounded-2xl rounded-tr-sm border border-black/[0.06] bg-black/[0.02] px-4 py-3">
                      <p className="text-sm text-ink/85 leading-relaxed">{fu.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Current follow-up question */}
              {step === 'gibbs' && currentQuestion && (
                <motion.div
                  key={followups.length}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-black/[0.05] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-muted font-medium">AI</span>
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm border border-black/[0.08] bg-white shadow-sm px-4 py-3">
                      <p className="text-sm text-ink leading-relaxed">{currentQuestion}</p>
                    </div>
                  </div>

                  {/* Stage hint */}
                  {targetStage && (
                    <div className="pl-10">
                      <p className="text-[10px] text-muted">
                        Gibbs stage: <span className="text-ink/60 font-medium">{targetStage}</span>
                      </p>
                    </div>
                  )}

                  {/* Progress indicator */}
                  <div className="pl-10">
                    <p className="text-[10px] text-muted mb-2">
                      Reflection depth: {coveredStages.length} / {ALL_GIBBS_STAGES.length}
                    </p>
                    <div className="flex gap-1 mb-3">
                      {ALL_GIBBS_STAGES.map(s => (
                        <div
                          key={s}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            coveredStages.includes(s) ? 'bg-ink' : 'bg-black/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Answer textarea */}
                  {!gibbsLoading && (
                    <div className="pl-10 space-y-3">
                      <textarea
                        value={currentAnswer}
                        onChange={e => setCurrentAnswer(e.target.value)}
                        rows={3}
                        placeholder="Your response…"
                        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-ink/15 focus:border-ink/30 transition-all resize-none leading-relaxed"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && currentAnswer.trim()) {
                            handleSubmitFollowUp();
                          }
                        }}
                      />
                      {gibbsError && (
                        <p className="text-xs text-red-600">{gibbsError}</p>
                      )}
                      <button
                        onClick={handleSubmitFollowUp}
                        disabled={!currentAnswer.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Submit <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {gibbsLoading && (
                    <div className="pl-10 flex items-center gap-2 text-sm text-muted py-2">
                      <Spinner /> Thinking…
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* Step 3: Iterate suggestion */}
          {step === 'suggestion' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Final depth indicator */}
              <div className="flex gap-1">
                {ALL_GIBBS_STAGES.map(s => (
                  <div
                    key={s}
                    className="h-1 flex-1 rounded-full bg-ink"
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted">Reflection depth: 6 / 6</p>

              {/* Suggestion card */}
              {suggestionLoading && (
                <div className="flex items-center gap-2 text-sm text-muted py-4">
                  <Spinner /> Generating suggestion…
                </div>
              )}

              {suggestionError && (
                <div className="flex items-center gap-3 text-sm text-red-600">
                  <span>{suggestionError}</span>
                  <button
                    onClick={() => generateSuggestion(followups, coveredStages)}
                    className="underline underline-offset-2 hover:text-red-800"
                  >
                    Try again
                  </button>
                </div>
              )}

              {suggestion && !suggestionLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 p-6"
                >
                  <p className="text-[10px] font-semibold text-[#6B8F6E] uppercase tracking-widest mb-3">
                    Try this next time
                  </p>
                  <p className="text-sm text-ink leading-relaxed">{suggestion}</p>
                </motion.div>
              )}

              {suggestion && !suggestionLoading && (
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
                >
                  Mark as complete <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
