import { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { motion } from 'motion/react';
import FeedbackBlock from '../components/FeedbackBlock';

/* ── Constants ── */

const sections = [
  'Intro',
  'Are You Seeing?',
  'The Wonder Formula',
  'Wonder → Flow',
  'The Onion Story',
  'Design Experiment',
  'Summary',
];

const glassesMCQOptions = [
  {
    id: 'a',
    label: '"I see a table."',
    correct: false,
  },
  {
    id: 'b',
    label:
      '"I notice how the light catches the grain — there\'s a small scratch near the corner, slightly raised."',
    correct: true,
  },
  {
    id: 'c',
    label: '"That table is pretty old."',
    correct: false,
  },
  {
    id: 'd',
    label: '"I should probably wipe that table down later."',
    correct: false,
  },
];

const flowMCQOptions = [
  {
    id: 'a',
    label:
      'A musician reaches a transcendent state mid-performance — time stops, everything flows effortlessly.',
    correct: false,
  },
  {
    id: 'b',
    label:
      'You\'re sanding a shelf and realize 30 minutes have passed without a single thought about anything else.',
    correct: true,
  },
  {
    id: 'c',
    label: "You've been scrolling your phone for two hours.",
    correct: false,
  },
  {
    id: 'd',
    label: "You're listening to a podcast while cooking dinner.",
    correct: false,
  },
];

const choreOptions = [
  { id: 'dishes', label: 'Washing the dishes' },
  { id: 'commute', label: 'My morning commute' },
  { id: 'cooking', label: 'Cooking a meal' },
  { id: 'folding', label: 'Folding laundry' },
  { id: 'walking', label: 'Walking between places' },
  { id: 'other', label: 'Something else I do on autopilot' },
];

const pipelineSteps = [
  { label: 'Wonder Seed', sub: 'A question or intention' },
  { label: 'Noticing', sub: 'Fresh-eyes attention' },
  { label: 'Curiosity', sub: 'Following what interests you' },
  { label: 'Simple Flow', sub: 'Absorbed, present' },
  { label: 'Meaning Moment', sub: 'Intrinsic, alive' },
];

/* ── Component ── */

export default function Module4() {
  const [currentSection, setCurrentSection] = useState(0);

  // Section 1
  const [perceptionMode, setPerceptionMode] = useState<'labels' | 'fresh' | null>(null);

  // Section 2
  const [glassesMCQ, setGlassesMCQ] = useState<string | null>(null);
  const [glassesMCQSubmitted, setGlassesMCQSubmitted] = useState(false);

  // Section 3
  const [flowMCQ, setFlowMCQ] = useState<string | null>(null);
  const [flowMCQSubmitted, setFlowMCQSubmitted] = useState(false);

  // Section 4
  const [choreTask, setChoreTask] = useState<string | null>(null);

  // Section 5
  const [wonderQuestion, setWonderQuestion] = useState('');
  const [wonderFeedback, setWonderFeedback] = useState('');
  const [wonderFeedbackLoading, setWonderFeedbackLoading] = useState(false);
  const [wonderResonance, setWonderResonance] = useState<string | null>(null);

  // Section 6
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

  const fetchWonderFeedback = async () => {
    if (!wonderQuestion.trim() || wonderFeedbackLoading) return;
    setWonderFeedbackLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntry: wonderQuestion.trim() }),
      });
      const data = await res.json();
      const text = [data.summary, data.pattern, data.next_step].filter(Boolean).join('␞');
      setWonderFeedback(text);
    } catch {
      setWonderFeedback('Your wonder question has been noted.');
    } finally {
      setWonderFeedbackLoading(false);
    }
  };

  const saveAndFinish = async () => {
    setSaving(true);
    const parts: string[] = [];
    if (perceptionMode)
      parts.push(
        `Perception mode: ${perceptionMode === 'fresh' ? 'Tends toward fresh eyes' : 'Tends to see through labels'}`,
      );
    if (choreTask)
      parts.push(
        `Wonder practice chore: ${choreOptions.find(o => o.id === choreTask)?.label ?? choreTask}`,
      );
    if (wonderQuestion) parts.push(`Wonder experiment question: ${wonderQuestion}`);

    await addEntry({
      moduleId: 'branching',
      moduleTitle: 'Wonder & Flow',
      selectedSignals: choreTask
        ? [choreOptions.find(o => o.id === choreTask)?.label ?? '']
        : [],
      reflectionText: parts.join('\n') || undefined,
    });

    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-16 px-8">
      {/* Module Header */}
      <div className="mb-6">
        <span className="text-xs font-medium text-muted uppercase tracking-widest">Module 4</span>
        <h1 className="font-serif text-4xl mt-2 text-ink">Wonder & Flow</h1>
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
            Wonder is not childish. It's a design tool.
          </h2>
          <p className="text-sm text-muted mb-8 leading-relaxed max-w-2xl">
            In the last module, you learned to flip between two worlds — transactional and present.
            This module goes deeper: what happens <em>inside</em> that present world, and how wonder
            becomes the gateway to flow states.
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
                  You will
                </p>
                <p className="text-sm text-ink font-medium">Discover your wonder formula</p>
              </div>
              <div className="pl-6">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  Leave with
                </p>
                <p className="text-sm text-ink font-medium">One wonder experiment to try today</p>
              </div>
            </div>
          </div>

          <blockquote className="border-l-2 border-ink/20 pl-5 mb-10">
            <p className="text-base text-ink/80 italic leading-relaxed">
              "Wonder is not the opposite of knowledge — it's what happens when you stop filtering
              experience through what you already know."
            </p>
          </blockquote>

          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
          >
            Begin <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── SECTION 1 — Are You Seeing? ─── */}
      {currentSection === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">Are you really seeing it?</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Most of the time, we don't look at the world — we look <em>through</em> it. We see
              through a lens of labels, categories, and expectations. The chair is just "a chair."
              The walk home is just "getting home." The familiar becomes invisible.
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
              The Two Lenses
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                <p className="text-sm font-semibold text-ink mb-2">Through Labels</p>
                <ul className="text-xs text-muted space-y-1.5">
                  <li>→ Name and categorize immediately</li>
                  <li>→ Skip the detail once identified</li>
                  <li>→ Experience filtered through expectation</li>
                  <li>→ Efficient, but not alive</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/40 p-4">
                <p className="text-sm font-semibold text-ink mb-2">With Fresh Eyes</p>
                <ul className="text-xs text-muted space-y-1.5">
                  <li>→ Notice before naming</li>
                  <li>→ Stay with texture, quality, detail</li>
                  <li>→ Curiosity-led, not category-led</li>
                  <li>→ Slower — but more vivid</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-ink mb-4">
              Honestly — which lens do you tend to look through in your everyday life?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(['labels', 'fresh'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPerceptionMode(mode)}
                  className={`text-left p-5 rounded-2xl border text-sm transition-all ${
                    perceptionMode === mode
                      ? 'border-ink bg-ink/[0.04] text-ink font-medium'
                      : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  {mode === 'labels' ? (
                    <>
                      <span className="block font-semibold mb-1">Mostly labels</span>
                      <span className="text-xs text-muted">
                        I name things quickly and move on — attention is a limited resource
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold mb-1">Often fresh eyes</span>
                      <span className="text-xs text-muted">
                        I notice details and linger — small things catch my attention
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {perceptionMode && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 text-sm text-ink/80 leading-relaxed"
            >
              {perceptionMode === 'labels' ? (
                <>
                  <strong className="text-ink">That's the default setting for most adults.</strong>{' '}
                  The brain optimizes for efficiency — labeling is fast. But efficiency and meaning
                  aren't always the same thing. This module teaches you to toggle between them.
                </>
              ) : (
                <>
                  <strong className="text-ink">You already have the instinct.</strong> The goal of
                  this module isn't to make you more observant — it's to make the switch deliberate,
                  so you can activate it when it matters most.
                </>
              )}
            </motion.div>
          )}

          {perceptionMode && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 2 — The Wonder Formula ─── */}
      {currentSection === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">The Wonder Formula</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Wonder isn't a feeling that arrives by chance. It's the product of two things happening
              together.
            </p>
          </div>

          {/* Formula visual */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-8">
            <div className="flex items-center justify-center gap-6 text-center">
              <div>
                <div className="text-3xl font-serif text-ink mb-2">Noticing</div>
                <p className="text-xs text-muted max-w-[120px]">
                  Attending to detail before labeling
                </p>
              </div>
              <div className="text-2xl text-muted font-light">×</div>
              <div>
                <div className="text-3xl font-serif text-ink mb-2">Curiosity</div>
                <p className="text-xs text-muted max-w-[120px]">
                  Following interest without agenda
                </p>
              </div>
              <div className="text-2xl text-muted font-light">=</div>
              <div>
                <div className="text-3xl font-serif text-[#6B8F6E] mb-2">Wonder</div>
                <p className="text-xs text-muted max-w-[120px]">
                  Engaged, alive, present
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Notice that neither component requires anything extraordinary. You don't need a
            mountaintop. You need attention and an open question.
          </p>

          {/* MCQ */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
              Quick Check
            </p>
            <p className="text-sm text-ink font-medium mb-5">
              Which of these shows someone seeing with fresh eyes?
            </p>
            <div className="space-y-2.5">
              {glassesMCQOptions.map(opt => {
                const isSelected = glassesMCQ === opt.id;
                const showResult = glassesMCQSubmitted;
                return (
                  <button
                    key={opt.id}
                    disabled={glassesMCQSubmitted}
                    onClick={() => !glassesMCQSubmitted && setGlassesMCQ(opt.id)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      showResult && opt.correct
                        ? 'border-emerald-400/50 bg-emerald-50/60 text-emerald-900'
                        : showResult && isSelected && !opt.correct
                          ? 'border-red-300/50 bg-red-50/60 text-red-800'
                          : isSelected
                            ? 'border-ink bg-ink/[0.03] text-ink font-medium'
                            : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                        showResult && opt.correct
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : showResult && isSelected && !opt.correct
                            ? 'border-red-400 bg-red-400 text-white'
                            : isSelected
                              ? 'border-ink bg-ink text-paper'
                              : 'border-black/20'
                      }`}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {glassesMCQ && !glassesMCQSubmitted && (
              <button
                onClick={() => setGlassesMCQSubmitted(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium hover:bg-ink/85 transition-all"
              >
                Submit
              </button>
            )}

            {glassesMCQSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-black/[0.03] text-sm text-ink/80 leading-relaxed"
              >
                {glassesMCQOptions.find(o => o.id === glassesMCQ)?.correct ? (
                  <>
                    <strong className="text-emerald-700">Exactly.</strong> Noticing the grain,
                    light, and scratch is fresh-eyes perception — detail before judgment, sensation
                    before category. The other options start with evaluation or task.
                  </>
                ) : (
                  <>
                    <strong className="text-red-700">Not quite.</strong> Option B shows someone
                    staying with sensation — noticing texture and detail before labeling. The others
                    jump immediately to evaluation ("old"), task ("wipe it"), or category ("a
                    table").
                  </>
                )}
              </motion.div>
            )}
          </div>

          {glassesMCQSubmitted && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 3 — Wonder → Flow ─── */}
      {currentSection === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">From wonder to flow</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              When noticing and curiosity sustain long enough, something shifts: you stop managing
              the experience and start living inside it. That's flow — the state of complete
              absorption.
            </p>
          </div>

          {/* Two flow types */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-5">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
                Simple Flow
              </p>
              <p className="text-sm text-ink leading-relaxed mb-3">
                Absorbed in an activity. Time passes unnoticed. Mind stops narrating. You are just
                doing.
              </p>
              <p className="text-xs text-muted italic">
                "I looked up and an hour had gone by."
              </p>
            </div>
            <div className="rounded-2xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 p-5">
              <p className="text-xs font-semibold text-[#6B8F6E] uppercase tracking-widest mb-3">
                Peak Flow
              </p>
              <p className="text-sm text-ink leading-relaxed mb-3">
                Transcendent engagement — effortless mastery, heightened clarity, deep connection to
                the activity. Rare, but remembered.
              </p>
              <p className="text-xs text-muted italic">
                "Everything just... clicked. I forgot I was even there."
              </p>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Peak flow is powerful but unpredictable. Simple flow is accessible — and it's a
            meaningful experience in its own right. Wonder is the doorway to simple flow: when
            curiosity engages fully, absorption follows.
          </p>

          {/* MCQ */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
              Quick Check
            </p>
            <p className="text-sm text-ink font-medium mb-5">
              Which of these is the best example of <em>simple flow</em>?
            </p>
            <div className="space-y-2.5">
              {flowMCQOptions.map(opt => {
                const isSelected = flowMCQ === opt.id;
                const showResult = flowMCQSubmitted;
                return (
                  <button
                    key={opt.id}
                    disabled={flowMCQSubmitted}
                    onClick={() => !flowMCQSubmitted && setFlowMCQ(opt.id)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      showResult && opt.correct
                        ? 'border-emerald-400/50 bg-emerald-50/60 text-emerald-900'
                        : showResult && isSelected && !opt.correct
                          ? 'border-red-300/50 bg-red-50/60 text-red-800'
                          : isSelected
                            ? 'border-ink bg-ink/[0.03] text-ink font-medium'
                            : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                        showResult && opt.correct
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : showResult && isSelected && !opt.correct
                            ? 'border-red-400 bg-red-400 text-white'
                            : isSelected
                              ? 'border-ink bg-ink text-paper'
                              : 'border-black/20'
                      }`}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {flowMCQ && !flowMCQSubmitted && (
              <button
                onClick={() => setFlowMCQSubmitted(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium hover:bg-ink/85 transition-all"
              >
                Submit
              </button>
            )}

            {flowMCQSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-black/[0.03] text-sm text-ink/80 leading-relaxed"
              >
                {flowMCQOptions.find(o => o.id === flowMCQ)?.correct ? (
                  <>
                    <strong className="text-emerald-700">Yes.</strong> Sanding the shelf describes
                    simple flow: complete absorption in a physical task, with time passing
                    unnoticed. No transcendence required — just full, quiet presence. Option A
                    describes peak flow (effortless mastery). C and D are distraction and
                    divided attention.
                  </>
                ) : (
                  <>
                    <strong className="text-red-700">Close, but not quite.</strong> Option B is
                    simple flow — absorbed in a task without transcendence. Option A is peak flow
                    (the transcendent variety). C is passive distraction, and D is divided
                    attention, not absorption.
                  </>
                )}
              </motion.div>
            )}
          </div>

          {flowMCQSubmitted && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 4 — The Onion Story ─── */}
      {currentSection === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">The onion story</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Wonder doesn't require special circumstances. Sometimes it starts with an onion.
            </p>
          </div>

          {/* Story card */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7 space-y-4">
            <p className="text-sm text-ink leading-relaxed">
              Fritz is making dinner. He's done this hundreds of times. He reaches for an onion.
            </p>
            <p className="text-sm text-ink leading-relaxed">
              But tonight, something shifts. He notices the outermost layer — dry, papery, faintly
              translucent. He peels it back. Underneath: a different texture entirely, smooth,
              slightly moist, the color almost luminescent under the kitchen light.
            </p>
            <p className="text-sm text-ink leading-relaxed">
              He brings it closer. The smell — not just "onion smell," but something sharper, earthy,
              almost alive. He watches the layers come apart. Each one slightly different. The
              architecture of it. How did something so ordinary become so... <em>interesting</em>?
            </p>
            <div className="pt-3 border-t border-black/5">
              <p className="text-xs text-muted italic">
                The onion didn't change. Only Fritz's mode of attention did.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 p-5">
            <p className="text-xs font-semibold text-[#6B8F6E] uppercase tracking-widest mb-2">
              The Key Insight
            </p>
            <p className="text-sm text-ink leading-relaxed">
              Wonder is not about finding extraordinary things. It's about bringing a different
              quality of attention to ordinary ones. The practice is the same whether you're peeling
              an onion or walking to work.
            </p>
          </div>

          <div>
            <p className="text-sm text-ink font-medium mb-1">
              Pick one routine activity to bring wonder to this week.
            </p>
            <p className="text-xs text-muted mb-4">
              Something you do on autopilot — the more "boring," the better.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {choreOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setChoreTask(opt.id)}
                  className={`text-left px-5 py-3.5 rounded-xl border text-sm transition-all ${
                    choreTask === opt.id
                      ? 'border-ink bg-ink/[0.04] text-ink font-medium'
                      : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {choreTask && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-ink/20 bg-ink/[0.02] p-5"
            >
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                Your Commitment
              </p>
              <p className="text-sm text-ink italic leading-relaxed">
                "I will bring fresh eyes to{' '}
                <strong className="not-italic">
                  {choreOptions.find(o => o.id === choreTask)?.label.toLowerCase()}
                </strong>{' '}
                — noticing before naming, staying with the detail."
              </p>
            </motion.div>
          )}

          {choreTask && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 5 — Design Experiment ─── */}
      {currentSection === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">Design your wonder experiment</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              A wonder experiment starts with a question — not a task. Not "I will notice more," but
              something that sparks curiosity before you even begin.
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
              Examples of wonder questions
            </p>
            <ul className="space-y-2 mt-3">
              {[
                '"What am I not noticing about my walk to work?"',
                '"What does this task feel like before I start to judge it?"',
                '"What\'s one thing about this conversation I\'ve never paid attention to?"',
              ].map((q, i) => (
                <li key={i} className="text-sm text-ink/70 italic flex items-start gap-2">
                  <span className="text-muted mt-0.5">·</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Write your wonder question
            </label>
            <p className="text-xs text-muted mb-3">
              What would you most want to see with fresh eyes? Start with "What..."
            </p>
            <textarea
              value={wonderQuestion}
              onChange={e => setWonderQuestion(e.target.value)}
              placeholder="What am I missing about..."
              rows={3}
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-muted/60">{wonderQuestion.length} characters</p>
            </div>
          </div>

          {wonderQuestion.trim().length >= 10 && !wonderFeedback && (
            <button
              onClick={fetchWonderFeedback}
              disabled={wonderFeedbackLoading}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-50"
            >
              {wonderFeedbackLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                  Reflecting...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Get reflection
                </>
              )}
            </button>
          )}

          {wonderFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6"
            >
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Your question
                </p>
                <p className="text-sm text-ink/80 italic leading-relaxed">
                  "{wonderQuestion.trim()}"
                </p>
              </div>
              <FeedbackBlock text={wonderFeedback} />

              {!wonderResonance && (
                <div className="mt-5 pt-4 border-t border-black/5">
                  <p className="text-xs text-muted mb-3">Does this reflection resonate?</p>
                  <div className="flex gap-2">
                    {['Yes, it does', 'Somewhat', "Not quite"].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setWonderResonance(opt)}
                        className="px-4 py-2 rounded-xl border border-black/10 bg-white text-xs text-ink/70 hover:border-ink/30 hover:text-ink transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wonderResonance && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 pt-4 border-t border-black/5"
                >
                  <p className="text-xs text-muted">
                    {wonderResonance === 'Yes, it does'
                      ? 'Glad it landed. Carry that clarity into your experiment.'
                      : wonderResonance === 'Somewhat'
                        ? "That's useful signal too — the question is yours to refine."
                        : 'No worries. The most important thing is the question you wrote, not the reflection on it.'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {wonderResonance && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 6 — Summary ─── */}
      {currentSection === 6 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">The wonder-to-meaning pipeline</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Here's the full sequence you've just built. Each step feeds the next.
            </p>
          </div>

          {/* Pipeline visualization */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-7 left-[calc(10%+0.75rem)] right-[calc(10%+0.75rem)] h-0.5 bg-black/8 z-0" />
              <div className="flex items-start justify-between relative z-10">
                {pipelineSteps.map((step, i) => (
                  <div key={step.label} className="flex flex-col items-center text-center w-1/5">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mb-3 flex items-center justify-center text-xs font-semibold transition-colors ${
                        i === 0
                          ? 'border-[#6B8F6E] bg-[#6B8F6E] text-white'
                          : i === pipelineSteps.length - 1
                            ? 'border-ink bg-ink text-paper'
                            : 'border-black/20 bg-white text-muted'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <p className="text-xs font-semibold text-ink mb-1">{step.label}</p>
                    <p className="text-[10px] text-muted leading-tight">{step.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key takeaways */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest">
              What you built today
            </p>
            <div className="space-y-2.5">
              {[
                { icon: '◎', text: 'You can identify the difference between label-seeing and fresh-eyes perception' },
                { icon: '◎', text: 'Wonder = Noticing × Curiosity — both are practices, not gifts' },
                { icon: '◎', text: 'Simple flow is accessible through ordinary tasks with full attention' },
                { icon: '◎', text: 'You have one concrete chore to bring wonder to this week' },
                { icon: '◎', text: 'You wrote a wonder question to carry into your next experiment' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#6B8F6E] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-ink/80 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Your experiment recap */}
          {(choreTask || wonderQuestion) && (
            <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                Your wonder experiment
              </p>
              <div className="space-y-3">
                {choreTask && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
                      Practice ground
                    </p>
                    <p className="text-sm text-ink">
                      {choreOptions.find(o => o.id === choreTask)?.label}
                    </p>
                  </div>
                )}
                {wonderQuestion && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
                      Wonder question
                    </p>
                    <p className="text-sm text-ink italic">"{wonderQuestion.trim()}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!experimentReady ? (
            <button
              onClick={() => setExperimentReady(true)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl border border-ink/20 bg-white text-ink text-sm font-medium transition-all hover:border-ink/40"
            >
              I'm ready to try this <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 p-4">
                <p className="text-sm text-ink leading-relaxed">
                  <strong>Good.</strong> The experiment is simple: bring your wonder question with
                  you into {choreOptions.find(o => o.id === choreTask)?.label.toLowerCase() ?? 'your chosen activity'}.
                  Notice before naming. Follow what interests you. See what happens.
                </p>
              </div>
              <button
                onClick={saveAndFinish}
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    Complete Module 4 <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
