import { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { motion } from 'motion/react';
import FeedbackBlock from '../components/FeedbackBlock';

/* ── Constants ── */

const sections = [
  'Intro',
  'Where Meaning Lives',
  'Two Worlds',
  "Fritz's Morning",
  'The FLIP Tool',
  'Your Experiment',
  'Summary',
];

const page2MCQOptions = [
  { id: 'a', label: 'Checking your emails before a meeting starts', correct: false },
  { id: 'b', label: 'Noticing the steam curling from your coffee cup', correct: true },
  { id: 'c', label: 'Planning your retirement savings', correct: false },
  { id: 'd', label: 'Counting down how long until your lunch break', correct: false },
];

const page3MCQOptions = [
  { id: 'a', label: "Transactional — he's still mentally rehearsing his presentation", correct: false },
  { id: 'b', label: "Flow world — he's fully attending to what's happening right now", correct: true },
  { id: 'c', label: "Neither — he's just getting distracted from his work", correct: false },
];

const fritzOptions = [
  { id: 'transactional', label: 'Mostly transactional Fritz — focused on getting through the to-do list' },
  { id: 'between', label: 'Somewhere in between — I have occasional flow world moments' },
  { id: 'flow', label: 'Mostly flow-world Fritz — I regularly pause and notice' },
];

const fritzFeedback: Record<string, string> = {
  transactional:
    "That's the default for most of us. The good news: you can get more out of your morning without having to cram more into it — and without giving anything up.",
  between:
    "You're already doing it. The question is how to do it more intentionally — by design, not by accident.",
  flow: "Great — you already have an intuition for this. What comes next will give you a deliberate tool to sharpen it.",
};

const triggerOptions = [
  {
    id: 'physical',
    label: 'A specific physical action (e.g., opening a door, sitting down, picking up my phone)',
  },
  { id: 'time', label: 'A time cue (e.g., halfway through lunch, 5 minutes into my commute)' },
  { id: 'feeling', label: "A feeling cue (e.g., when I notice I'm on autopilot or rushing)" },
];

const comparisonRows = [
  { dimension: 'Focus', transactional: "What's next", flow: 'What is' },
  { dimension: 'Time', transactional: 'Past and future', flow: 'Present moment' },
  {
    dimension: 'Value',
    transactional: 'Instrumental — matters for what it leads to',
    flow: 'Intrinsic — matters for what it is',
  },
  { dimension: 'Key question', transactional: '"What\'s next?"', flow: '"What\'s happening right now?"' },
  {
    dimension: 'Brain mode',
    transactional: 'Achieving — organize, accomplish, control',
    flow: 'Awakened — present, connected, receptive',
  },
  {
    dimension: 'Experience',
    transactional: 'Efficient but rarely satisfying',
    flow: 'Alive, meaningful, sometimes transcendent',
  },
];

/* ── Component ── */

export default function Module3() {
  const [currentSection, setCurrentSection] = useState(0);

  // Section 1
  const [momentText, setMomentText] = useState('');
  const [momentType, setMomentType] = useState<'transactional' | 'present' | null>(null);
  const [momentFeedback, setMomentFeedback] = useState('');
  const [momentFeedbackLoading, setMomentFeedbackLoading] = useState(false);
  const [feedbackResonance, setFeedbackResonance] = useState<string | null>(null);

  // Section 2
  const [page2MCQ, setPage2MCQ] = useState<string | null>(null);
  const [page2MCQSubmitted, setPage2MCQSubmitted] = useState(false);

  // Section 3
  const [fritzType, setFritzType] = useState<string | null>(null);
  const [page3MCQ, setPage3MCQ] = useState<string | null>(null);
  const [page3MCQSubmitted, setPage3MCQSubmitted] = useState(false);

  // Section 5
  const [situation, setSituation] = useState('');
  const [flipTrigger, setFlipTrigger] = useState<string | null>(null);
  const [flowFocus, setFlowFocus] = useState('');
  const [experimentReady, setExperimentReady] = useState(false);

  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { addEntry } = useJournal();

  const goNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fetchMomentFeedback = async () => {
    if (!momentText.trim() || momentFeedbackLoading) return;
    setMomentFeedbackLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntry: momentText.trim() }),
      });
      const data = await res.json();
      const text = [data.summary, data.pattern, data.next_step].filter(Boolean).join('␞');
      setMomentFeedback(text);
    } catch {
      setMomentFeedback('Your reflection has been noted.');
    } finally {
      setMomentFeedbackLoading(false);
    }
  };

  const saveAndFinish = async () => {
    setSaving(true);
    const parts: string[] = [];
    if (momentText) parts.push(`Meaningful moment: ${momentText}`);
    if (momentType)
      parts.push(
        `Moment orientation: ${momentType === 'present' ? 'Fully present' : "Focused on what's next"}`,
      );
    if (fritzType)
      parts.push(`Morning style: ${fritzOptions.find(o => o.id === fritzType)?.label ?? fritzType}`);
    if (situation) parts.push(`Experiment situation: ${situation}`);
    if (flipTrigger)
      parts.push(
        `FLIP trigger: ${triggerOptions.find(t => t.id === flipTrigger)?.label ?? flipTrigger}`,
      );
    if (flowFocus) parts.push(`Flow world focus: ${flowFocus}`);

    await addEntry({
      moduleId: 'observe',
      moduleTitle: 'Meaning Design: Flip the World Switch',
      selectedSignals: fritzType
        ? [fritzOptions.find(o => o.id === fritzType)?.label ?? '']
        : [],
      reflectionText: parts.join('\n') || undefined,
    });

    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-16 px-8">
      {/* Module Header */}
      <div className="mb-6">
        <span className="text-xs font-medium text-muted uppercase tracking-widest">Module 3</span>
        <h1 className="font-serif text-4xl mt-2 text-ink">Meaning Design</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-16">
        {sections.map((label, idx) => (
          <button
            key={label}
            onClick={() => idx < currentSection && setCurrentSection(idx)}
            className="group flex items-center gap-2"
          >
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSection
                  ? 'w-8 bg-ink'
                  : idx < currentSection
                    ? 'w-4 bg-ink/40'
                    : 'w-4 bg-black/10'
              }`}
            />
          </button>
        ))}
        <span className="text-xs text-muted ml-2">
          {sections[currentSection]} · {currentSection + 1} / {sections.length}
        </span>
      </div>

      {/* ─── SECTION 0 — Intro ─── */}
      {currentSection === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="font-serif text-3xl text-ink mb-4 leading-snug">
            Meaning isn't found. It's designed — one moment at a time.
          </h2>
          <p className="text-sm text-muted mb-8 leading-relaxed max-w-2xl">
            In Module 2, we discovered that meaning shows up in moments — not in impact, not in
            "more," not in becoming everything you are. But not every moment feels meaningful. So
            what makes the difference?
          </p>

          {/* Module info card */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7 mb-10">
            <div className="grid grid-cols-3 divide-x divide-black/5">
              <div className="pr-6">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  Duration
                </p>
                <p className="text-sm text-ink font-medium">~6 minutes</p>
              </div>
              <div className="px-6">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  Prerequisite
                </p>
                <p className="text-sm text-ink font-medium">Module 2</p>
              </div>
              <div className="pl-6">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  You'll design
                </p>
                <p className="text-sm text-ink font-medium">Your first meaning experiment</p>
              </div>
            </div>
          </div>

          {/* What's inside */}
          <div className="space-y-3 mb-12">
            {[
              'Discover where meaning actually lives',
              'Understand two modes of experiencing daily life',
              'Meet Fritz — and see yourself in his morning',
              'Learn the Flip the World Switch tool',
              'Design your first meaning experiment',
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 text-[10px] font-semibold text-muted/50 w-4 shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-ink/80">{item}</p>
              </motion.div>
            ))}
          </div>

          <button
            onClick={goNext}
            className="flex items-center gap-2 px-8 py-3.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
          >
            Begin <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── SECTION 1 — Where Meaning Actually Lives ─── */}
      {currentSection === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-10"
        >
          <div>
            <h2 className="font-serif text-3xl text-ink mb-3 leading-snug">
              Where meaning actually lives
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Not every moment feels meaningful. So what makes the difference?
            </p>
          </div>

          {/* Step 1: Reflection input */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
              ✍ Write your response
            </p>
            <p className="text-sm text-ink mb-4 leading-relaxed">
              Think of a recent moment that felt meaningful. It could be a conversation, a walk, a
              meal — anything.
            </p>
            <div className="space-y-1 mb-5 pl-4 border-l-2 border-black/5">
              <p className="text-xs text-muted italic mb-2">To go deeper, consider:</p>
              {[
                'Where were you, and what were you doing?',
                'What made this moment feel different from other moments?',
                'What were you paying attention to?',
              ].map(hint => (
                <p key={hint} className="text-xs text-muted/70">
                  · {hint}
                </p>
              ))}
            </div>
            <label className="block text-xs font-medium text-ink mb-2">Describe that moment</label>
            <textarea
              value={momentText}
              onChange={e => setMomentText(e.target.value)}
              rows={4}
              placeholder="e.g. A conversation with my sister last weekend…"
              className="w-full resize-none rounded-xl border border-ink/20 bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:border-ink/50 focus:ring-2 focus:ring-ink/5 transition-all"
            />
            <p className="text-right text-[10px] text-muted/50 mt-1">
              {momentText.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* Step 2: Diagnostic single-select */}
          {momentText.trim().length >= 10 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7"
            >
              <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
                Select one
              </p>
              <p className="text-sm text-ink mb-5">In that moment, were you mostly...</p>
              <div className="space-y-3">
                {(
                  [
                    {
                      id: 'transactional' as const,
                      label:
                        "Focused on what's next — getting something done, solving a problem, reaching an outcome",
                    },
                    {
                      id: 'present' as const,
                      label: 'Fully present to what was happening — noticing, feeling, experiencing',
                    },
                  ] as const
                ).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setMomentType(opt.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${
                      momentType === opt.id
                        ? 'border-ink bg-ink/[0.03] text-ink font-medium'
                        : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Reveal + AI feedback */}
          {momentType && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              <div className="rounded-2xl border border-black/[0.08] bg-sage/30 p-7">
                <p className="text-sm text-ink leading-relaxed mb-2">
                  Most people find the same thing. Their meaningful moments weren't about checking a
                  box or reaching a goal. They were moments of being fully present.
                </p>
                <p className="text-sm text-ink/70 leading-relaxed">
                  That's not a coincidence. It's a clue about where meaning actually lives — and
                  where it doesn't.
                </p>
              </div>

              {/* AI Feedback */}
              {!momentFeedback && (
                <button
                  onClick={fetchMomentFeedback}
                  disabled={momentFeedbackLoading}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-black/10 text-sm text-ink hover:bg-ink/[0.02] transition-all disabled:opacity-60"
                >
                  {momentFeedbackLoading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-ink/30 border-t-ink/70 rounded-full inline-block" />
                      Generating your personalized reflection...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#6B8F6E]" />
                      Get a reflection on your moment
                    </>
                  )}
                </button>
              )}

              {momentFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7"
                >
                  {/* Quote user's own text to show feedback is personalized */}
                  <div className="mb-5 pl-4 border-l-2 border-ink/10">
                    <p className="text-xs text-muted italic">Based on what you shared:</p>
                    <p className="text-sm text-ink/70 mt-1 italic">
                      "{momentText.slice(0, 120)}
                      {momentText.length > 120 ? '…' : ''}"
                    </p>
                  </div>
                  <FeedbackBlock text={momentFeedback} />

                  {/* Micro-prompt to actively engage with feedback */}
                  <div className="mt-6 pt-5 border-t border-black/5">
                    <p className="text-xs font-medium text-ink mb-3">Does this resonate?</p>
                    <div className="flex gap-2">
                      {[
                        { id: 'yes', label: 'Yes, this feels true' },
                        { id: 'somewhat', label: 'Somewhat' },
                        { id: 'not-quite', label: 'Not quite' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setFeedbackResonance(opt.id)}
                          className={`px-4 py-2 rounded-lg border text-xs transition-all ${
                            feedbackResonance === opt.id
                              ? 'border-ink bg-ink/[0.04] text-ink font-medium'
                              : 'border-black/10 text-muted hover:border-ink/30 hover:text-ink'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Continue — visible once resonance is chosen, or skippable if skipping feedback */}
          {(feedbackResonance || (momentType && !momentFeedback)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-7 py-3.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
              {momentType && !momentFeedback && (
                <button
                  onClick={fetchMomentFeedback}
                  disabled={momentFeedbackLoading}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-black/10 text-xs text-muted hover:text-ink hover:border-ink/30 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#6B8F6E]" />
                  {momentFeedbackLoading ? 'Generating…' : 'Get reflection first'}
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 2 — Two Worlds, One Life ─── */}
      {currentSection === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-10"
        >
          <div>
            <h2 className="font-serif text-3xl text-ink mb-3 leading-snug">Two worlds, one life</h2>
            <p className="text-sm text-muted leading-relaxed">
              Burnett and Evans describe two worlds we all move through every day — not two places,
              but two ways of seeing the same thing.
            </p>
          </div>

          {/* Transactional World */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              The Transactional World
            </p>
            <p className="text-sm text-ink leading-relaxed mb-3">
              We all need to navigate the transactional world. Your job in this world is to handle
              all your transactions quickly and with as few mistakes as possible — take the kids to
              school, go to work, buy groceries, make the boss happy, plan for retirement.
            </p>
            <p className="text-sm text-ink/70 leading-relaxed">
              Transactions are fundamental to surviving. But they can be anathema to thriving — our
              focus is on what comes <em>next</em>, and the kind of aliveness we're after is only
              found in the present moment.
            </p>
          </div>

          {/* Flow World */}
          <div className="rounded-2xl border border-sage bg-sage/20 shadow-sm p-7">
            <p className="text-xs font-semibold text-[#4A7C59]/70 uppercase tracking-widest mb-3">
              The Flow World
            </p>
            <p className="text-sm text-ink leading-relaxed mb-3">
              There's always another world right in front of us — the flow world. It flows all around
              us all the time, full of meaning, joy, and wonder.
            </p>
            <p className="text-sm text-ink/70 leading-relaxed">
              It's the whole river of reality coursing underneath, around, and within us: the
              conversation you're in, the breeze blowing through the window, the cookies baking in
              the oven. Joy, meaning, and aliveness only exist in the immediacy of the present
              moment.
            </p>
          </div>

          {/* Comparison table */}
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
              Side by side
            </p>
            <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
              <div className="grid grid-cols-[140px_1fr_1fr] border-b border-black/5">
                <div className="px-5 py-3" />
                <div className="px-5 py-3 border-l border-black/5">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">
                    Transactional
                  </p>
                </div>
                <div className="px-5 py-3 border-l border-black/5 bg-sage/20">
                  <p className="text-[10px] font-semibold text-[#4A7C59]/70 uppercase tracking-widest">
                    Flow
                  </p>
                </div>
              </div>
              {comparisonRows.map((row, idx) => (
                <div
                  key={row.dimension}
                  className={`grid grid-cols-[140px_1fr_1fr] border-b border-black/5 last:border-0 ${idx % 2 === 0 ? '' : 'bg-black/[0.01]'}`}
                >
                  <div className="px-5 py-3.5">
                    <p className="text-xs font-medium text-muted">{row.dimension}</p>
                  </div>
                  <div className="px-5 py-3.5 border-l border-black/5">
                    <p className="text-xs text-ink/70">{row.transactional}</p>
                  </div>
                  <div className="px-5 py-3.5 border-l border-black/5 bg-sage/10">
                    <p className="text-xs text-ink">{row.flow}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical insight */}
          <div className="rounded-2xl border border-black/[0.08] bg-ink/[0.02] p-7">
            <p className="text-sm text-ink leading-relaxed mb-2">
              Both worlds are present all the time. They are very near to one another, and with time
              and practice, you'll be able to move between them easily and quickly.
            </p>
            <p className="text-sm text-ink/70 leading-relaxed">
              In the flow world, there's always enough — because each moment is its own reward.
            </p>
          </div>

          {/* MCQ — concept check */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
              Quick check
            </p>
            <p className="text-sm font-medium text-ink mb-5">
              Which of these is a Flow World experience?
            </p>
            <div className="space-y-2.5">
              {page2MCQOptions.map(opt => {
                const isSelected = page2MCQ === opt.id;
                const showResult = page2MCQSubmitted;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (!page2MCQSubmitted) setPage2MCQ(opt.id);
                    }}
                    disabled={page2MCQSubmitted}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      showResult && opt.correct
                        ? 'border-emerald-400/50 bg-emerald-50/60 text-emerald-900'
                        : showResult && isSelected && !opt.correct
                          ? 'border-red-300/50 bg-red-50/60 text-red-800'
                          : isSelected
                            ? 'border-ink bg-ink/[0.03] text-ink font-medium'
                            : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink disabled:hover:border-black/10 disabled:hover:text-ink/70'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[10px] font-bold ${
                        showResult && opt.correct
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : showResult && isSelected && !opt.correct
                            ? 'border-red-400 bg-red-400 text-white'
                            : isSelected
                              ? 'border-ink bg-ink text-white'
                              : 'border-black/20'
                      }`}
                    >
                      {showResult && opt.correct ? '✓' : showResult && isSelected && !opt.correct ? '✗' : ''}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {page2MCQ && !page2MCQSubmitted && (
              <button
                onClick={() => setPage2MCQSubmitted(true)}
                className="mt-4 px-5 py-2 bg-ink text-white rounded-lg text-xs font-medium hover:bg-ink/90 transition-all"
              >
                Check answer
              </button>
            )}
            {page2MCQSubmitted && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 text-xs leading-relaxed ${page2MCQOptions.find(o => o.id === page2MCQ)?.correct ? 'text-emerald-700' : 'text-ink/60'}`}
              >
                {page2MCQOptions.find(o => o.id === page2MCQ)?.correct
                  ? "Exactly right. Noticing something sensory in the present — that's the flow world in action."
                  : "Not quite. The flow world is about attending to what's happening right now — not what's next. The steam from your coffee cup is a present-moment detail."}
              </motion.p>
            )}
          </div>

          <button
            onClick={goNext}
            className="flex items-center gap-2 px-7 py-3.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── SECTION 3 — Fritz's Morning ─── */}
      {currentSection === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-10"
        >
          <div>
            <h2 className="font-serif text-3xl text-ink mb-3 leading-snug">
              You don't need a different life
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              You can have it both ways. The transactional world will always use all of your time and
              energy if you let it. Here's what the difference looks like in real life.
            </p>
          </div>

          {/* Fritz story */}
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
              Meet Fritz — a financial analyst with a big presentation today
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
                  Transactional Fritz
                </p>
                <div className="space-y-3 text-xs text-ink/70 leading-relaxed">
                  <p>
                    His alarm barks: <em>"Dude — today's the day, get your game on!"</em>
                  </p>
                  <p>
                    He grabs his phone, checks messages, rushes to shave while rehearsing his
                    presentation.
                  </p>
                  <p>
                    Eats an energy bar to avoid messing up his suit. Speed-dials the admin three
                    times to make sure the handouts are ready.
                  </p>
                  <p>
                    Parks, marches to his office. The admin says,{' '}
                    <em>"Got your messages — all of them."</em> Fritz mutters thanks and keeps
                    moving.
                  </p>
                  <p className="text-muted italic">
                    He doesn't see the admin shake his head in disgust behind him.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-sage bg-sage/20 shadow-sm p-6">
                <p className="text-[10px] font-semibold text-[#4A7C59]/70 uppercase tracking-widest mb-4">
                  Flow-World Fritz too
                </p>
                <div className="space-y-3 text-xs text-ink/70 leading-relaxed">
                  <p>His alarm plays his favorite song. He pauses to listen.</p>
                  <p>
                    Walks outside for a gulp of air.{' '}
                    <em>"Wow, the air tastes great at this hour."</em>
                  </p>
                  <p>
                    Makes scrambled eggs before dressing. While shaving, notices how the feel of the
                    razor changes as the water temperature rises.
                  </p>
                  <p>
                    The goofy look of shaving foam makes him smirk —{' '}
                    <em>"That's my boy!"</em> He'll call her tonight.
                  </p>
                  <p>
                    Walks through the park; a tree turning colors sparks an idea for his talk. He
                    passes the admin: <em>"We all good?" — "Absolutely." — "Well done again, man,
                    thanks!" — "Hey, I'm getting coffee — bring you one?"</em>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 px-6 py-4 rounded-xl bg-ink/[0.02] border border-black/5">
              <p className="text-xs text-ink/70 leading-relaxed">
                The only difference between these two mornings is{' '}
                <strong className="text-ink">which world Fritz chooses to be in</strong>. These two
                very different morning routines take the same amount of Fritz's time — but deliver
                very different experiences.
              </p>
            </div>
          </div>

          {/* Self-assessment */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
              Select one
            </p>
            <p className="text-sm font-medium text-ink mb-5">
              Which version of Fritz is closer to your typical morning?
            </p>
            <div className="space-y-3">
              {fritzOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFritzType(opt.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${
                    fritzType === opt.id
                      ? 'border-ink bg-ink/[0.03] text-ink font-medium'
                      : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {fritzType && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-xl bg-sage/30 border border-sage"
              >
                <p className="text-sm text-ink/80 leading-relaxed">{fritzFeedback[fritzType]}</p>
              </motion.div>
            )}
          </div>

          {/* MCQ — concept application */}
          {fritzType && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7"
            >
              <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-4">
                Concept check
              </p>
              <p className="text-sm font-medium text-ink mb-5">
                When flow-world Fritz notices the tree turning colors and gets an idea for his talk —
                which world is he in?
              </p>
              <div className="space-y-2.5">
                {page3MCQOptions.map(opt => {
                  const isSelected = page3MCQ === opt.id;
                  const showResult = page3MCQSubmitted;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (!page3MCQSubmitted) setPage3MCQ(opt.id);
                      }}
                      disabled={page3MCQSubmitted}
                      className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                        showResult && opt.correct
                          ? 'border-emerald-400/50 bg-emerald-50/60 text-emerald-900'
                          : showResult && isSelected && !opt.correct
                            ? 'border-red-300/50 bg-red-50/60 text-red-800'
                            : isSelected
                              ? 'border-ink bg-ink/[0.03] text-ink font-medium'
                              : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink disabled:hover:border-black/10 disabled:hover:text-ink/70'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[10px] font-bold ${
                          showResult && opt.correct
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : showResult && isSelected && !opt.correct
                              ? 'border-red-400 bg-red-400 text-white'
                              : isSelected
                                ? 'border-ink bg-ink text-white'
                                : 'border-black/20'
                        }`}
                      >
                        {showResult && opt.correct
                          ? '✓'
                          : showResult && isSelected && !opt.correct
                            ? '✗'
                            : ''}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {page3MCQ && !page3MCQSubmitted && (
                <button
                  onClick={() => setPage3MCQSubmitted(true)}
                  className="mt-4 px-5 py-2 bg-ink text-white rounded-lg text-xs font-medium hover:bg-ink/90 transition-all"
                >
                  Check answer
                </button>
              )}
              {page3MCQSubmitted && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 text-xs leading-relaxed ${page3MCQOptions.find(o => o.id === page3MCQ)?.correct ? 'text-emerald-700' : 'text-ink/60'}`}
                >
                  {page3MCQOptions.find(o => o.id === page3MCQ)?.correct
                    ? "Right. He's attending to what's actually happening right now — that's a flow world experience. The presentation idea is a bonus, not the point."
                    : "Not quite. Even though his presentation is on his mind, in that specific moment he's fully attending to the tree — that's the flow world."}
                </motion.p>
              )}
            </motion.div>
          )}

          {fritzType && (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-7 py-3.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 4 — The FLIP Tool ─── */}
      {currentSection === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-10"
        >
          <div>
            <h2 className="font-serif text-3xl text-ink mb-3 leading-snug">
              The designer's tool: Flip the World Switch
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Remember: the core task of meaning design is moment-making. And a designer doesn't just
              understand ideas — they prototype.
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-sm text-ink leading-relaxed mb-6">
              The idea is simply to attune our attention to the two worlds and improve our facility
              in moving between them. Since our goal is just to practice two-world awareness, it's
              best to pick a situation that's{' '}
              <strong className="font-medium">simple and uncomplicated</strong>.
            </p>
            <div className="space-y-3">
              {[
                "Select the situation in which you're going to flip the world switch.",
                'Enter that situation in your usual transactional orientation, but consciously ready to flip.',
                'Notice carefully what the transaction is and how it\'s going.',
                'Partway into the experience, say FLIP! loudly in your mind (silently in the room).',
                'Immediately look for something in the flow world in the present moment that can hold your attention.',
                'Attend to that and that alone for ten seconds while still doing what you\'re doing.',
                'Then again say FLIP! and refocus on what\'s next in the transactional world.',
                'Continue on your way.',
                'Congratulate yourself for being a world flipper.',
                'Optional: Later, reflect on "What was that like?"',
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold mt-0.5 ${
                      i === 3 || i === 6
                        ? 'bg-ink text-white'
                        : 'bg-black/[0.05] text-muted'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p
                    className={`text-sm leading-relaxed ${i === 3 || i === 6 ? 'text-ink font-medium' : 'text-ink/70'}`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Example */}
          <div className="rounded-2xl border border-sage bg-sage/20 p-7">
            <p className="text-[10px] font-semibold text-[#4A7C59]/70 uppercase tracking-widest mb-4">
              Example in practice
            </p>
            <div className="space-y-3 text-sm text-ink/80 leading-relaxed">
              <p>
                You're making a salad. You get the lettuce, tomatoes, and Parmesan out of the fridge.
                You're distracted by the dressing issue and drop the head of lettuce on the floor.
              </p>
              <p>
                While stooping to pick up the lettuce, you say{' '}
                <strong className="text-ink">FLIP!</strong> and look for the flow world.
              </p>
              <p>
                You see the lettuce in your hands and are amazed at how the leaves fold into one
                another and how subtly the green color changes from tip to stem.{' '}
                <em>"Whoa — who knew lettuce was beautiful!?"</em>
              </p>
              <p>Your partner asks, "How's it going over there, honey?"</p>
              <p>
                You say <strong className="text-ink">FLIP!</strong> to yourself and say, "Great! I
                was just noticing how pretty lettuce really is."
              </p>
              <p className="font-medium text-ink">
                Same task. Same time. But you got more out of the moment.
              </p>
            </div>
          </div>

          <div className="px-6 py-5 rounded-xl bg-ink/[0.02] border border-black/5">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Design principle
            </p>
            <p className="text-sm text-ink/70 leading-relaxed">
              <strong className="text-ink">Set the bar low and clear it.</strong> We're not designing
              tools for Olympic transactionalists or Oscar-winning flow masters. We're designing for
              regular people with regular lives. A good prototype is quick, easy, and helps us learn
              something as we try it.
            </p>
          </div>

          <button
            onClick={goNext}
            className="flex items-center gap-2 px-7 py-3.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
          >
            Design my experiment <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── SECTION 5 — Design Your Experiment ─── */}
      {currentSection === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-10"
        >
          <div>
            <h2 className="font-serif text-3xl text-ink mb-3 leading-snug">
              Design your first meaning experiment
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              A designer doesn't just learn how to use a tool — they make a prototype with it. This
              is quick, low-risk, and you really don't know what will happen.{' '}
              <em>That's why it's a prototype and not an assignment.</em>
            </p>
          </div>

          {/* Decision 1 */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
              Decision 1 of 3
            </p>
            <label className="block text-sm font-medium text-ink mb-1">Pick your situation</label>
            <p className="text-xs text-muted mb-4">
              What's one routine moment in the next 24 hours where you could try flipping the switch?
            </p>
            <textarea
              value={situation}
              onChange={e => setSituation(e.target.value)}
              rows={2}
              placeholder="e.g. morning commute, making dinner, walking to a meeting, lunch break…"
              className="w-full resize-none rounded-xl border border-ink/20 bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:border-ink/50 focus:ring-2 focus:ring-ink/5 transition-all"
            />
          </div>

          {/* Decision 2 */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
              Decision 2 of 3
            </p>
            <p className="text-sm font-medium text-ink mb-1">Set your FLIP trigger</p>
            <p className="text-xs text-muted mb-4">What will remind you to flip?</p>
            <div className="space-y-2.5">
              {triggerOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFlipTrigger(opt.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${
                    flipTrigger === opt.id
                      ? 'border-ink bg-ink/[0.03] text-ink font-medium'
                      : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Decision 3 */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
              Decision 3 of 3
            </p>
            <label className="block text-sm font-medium text-ink mb-1">
              What will you look for in the flow world?
            </label>
            <p className="text-xs text-muted mb-2">
              When you FLIP, what might you attend to for ten seconds? Be specific — what will you
              actually see, hear, or feel?
            </p>
            <p className="text-xs text-muted/60 italic mb-4">
              Tip: avoid abstract answers like "be mindful." Try "I'll notice the texture of…" or
              "I'll listen for…"
            </p>
            <textarea
              value={flowFocus}
              onChange={e => setFlowFocus(e.target.value)}
              rows={2}
              placeholder="e.g. something I can see that I usually ignore, how my body feels right now, what someone's face is actually expressing…"
              className="w-full resize-none rounded-xl border border-ink/20 bg-paper px-4 py-3 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:border-ink/50 focus:ring-2 focus:ring-ink/5 transition-all"
            />
          </div>

          {/* Assembled prototype card */}
          {situation.trim() && flipTrigger && flowFocus.trim() && !experimentReady && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={() => setExperimentReady(true)}
                className="flex items-center gap-2 px-7 py-3.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
              >
                Generate my experiment <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {experimentReady && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-ink/20 bg-white shadow-sm overflow-hidden"
            >
              <div className="px-7 py-4 border-b border-black/5 bg-ink/[0.02]">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">
                  Your prototype
                </p>
              </div>
              <div className="p-7 space-y-5">
                <div className="flex gap-4 items-start">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-widest w-20 shrink-0 mt-0.5">
                    Situation
                  </span>
                  <p className="text-sm text-ink">{situation}</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-widest w-20 shrink-0 mt-0.5">
                    Trigger
                  </span>
                  <p className="text-sm text-ink">
                    {triggerOptions.find(t => t.id === flipTrigger)?.label}
                  </p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-widest w-20 shrink-0 mt-0.5">
                    Focus
                  </span>
                  <p className="text-sm text-ink">{flowFocus}</p>
                </div>
                <div className="pt-4 border-t border-black/5">
                  <p className="text-sm text-ink/70 leading-relaxed">
                    That's it.{' '}
                    <strong className="text-ink">Ten seconds. One flip. One moment</strong> noticed
                    for what it <em>is</em>, not what it's for.
                  </p>
                  <p className="text-xs text-muted mt-2 leading-relaxed">
                    After you try it, notice: what worked? What would you change? That's iteration —
                    and that's how designers improve.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {experimentReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-7 py-3.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
              >
                Continue to summary <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 6 — Summary ─── */}
      {currentSection === 6 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-10"
        >
          <div>
            <h2 className="font-serif text-3xl text-ink mb-3 leading-snug">What shifted</h2>
            <p className="text-sm text-muted leading-relaxed">Here's what you've unlocked.</p>
          </div>

          {/* Before/After table */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 border-b border-black/5">
              <div className="px-6 py-3 border-r border-black/5">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">
                  Before
                </p>
              </div>
              <div className="px-6 py-3 bg-sage/20">
                <p className="text-[10px] font-semibold text-[#4A7C59]/70 uppercase tracking-widest">
                  After
                </p>
              </div>
            </div>
            {[
              [
                "I'm stuck in the daily grind",
                'I live in two worlds — and I can move between them',
              ],
              ['Meaning requires a big change', 'Meaning requires ten seconds of attention'],
              ['I need to find meaning', 'I can design meaningful moments'],
              ['Meaning is something I lack', 'Meaning is something I practice'],
            ].map(([before, after], i) => (
              <div key={i} className="grid grid-cols-2 border-b border-black/5 last:border-0">
                <div className="px-6 py-3.5 border-r border-black/5">
                  <p className="text-xs text-muted/70 italic">{before}</p>
                </div>
                <div className="px-6 py-3.5 bg-sage/10">
                  <p className="text-xs text-ink">{after}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Core reframe quote */}
          <div className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-8">
            <p className="font-serif text-xl text-ink leading-snug mb-3">
              "You can get more out of your morning without having to cram more into it — and without
              giving anything up in the bargain."
            </p>
            <p className="text-xs text-muted">— Burnett &amp; Evans</p>
          </div>

          {/* Forward bridge */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
              What's next
            </p>
            <p className="text-sm text-ink leading-relaxed mb-2">
              You now have your first design tool — the World Switch — and your first prototype for
              using it. But this is v1.0.
            </p>
            <p className="text-sm text-ink/70 leading-relaxed mb-4">
              Where exactly should you point your attention when you flip? How do you go deeper once
              you're there? In the coming modules, we'll explore the four sources of meaning —{' '}
              <strong className="text-ink">Wonder, Coherence, and Flow</strong> — and you'll start
              designing moments in each one.
            </p>
            <p className="text-xs text-muted/70 italic">
              Being a moment designer is a lifelong design project. The moments just keep coming. You
              are never done. And that's fabulous — because it means we will never run out of
              meaning-making moments.
            </p>
          </div>

          {/* Finish button */}
          <button
            onClick={saveAndFinish}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Complete Module 3
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
