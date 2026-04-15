import { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { motion } from 'motion/react';
import FeedbackBlock from '../components/FeedbackBlock';

/* ── Constants ── */

const sections = [
  'Intro',
  'From Moments to Direction',
  'Your Compass',
  'Write Your Story',
  'Compass Values',
  'Coherency Sighting',
  'Summary',
];

const compassMCQOptions = [
  { id: 'a', label: 'They all chose high-status, socially impactful careers.', correct: false },
  {
    id: 'b',
    label: 'Their actions align with who they are and what they believe.',
    correct: true,
  },
  { id: 'c', label: 'They each found their calling at a young age.', correct: false },
  { id: 'd', label: 'They all made sacrifices they later came to regret.', correct: false },
];

const confidenceOptions = [
  { id: 'very', label: 'Very confident — my life feels authentically mine' },
  {
    id: 'somewhat',
    label: "Somewhat confident — mostly mine, but there are areas where I'm on someone else's path",
  },
  { id: 'notsure', label: "Not sure — I haven't really thought about this before" },
  { id: 'notconfident', label: "Not confident — I think I'm running on someone else's compass" },
];

const confidenceFeedback: Record<string, string> = {
  very: "Great. What comes next will help you articulate that more clearly — so you can protect it.",
  somewhat:
    "That's honest, and very common. The exercise coming up will help you get clearer.",
  notsure:
    "That's honest, and very common. The exercise coming up will help you get clearer.",
  notconfident:
    "That takes courage to name. The good news: you can start building your own compass right now.",
};

const storyScaffolds = [
  'What are you working on or navigating right now?',
  'What relationships or transitions are shaping this chapter of your life?',
  'What do you care most about at this moment?',
];

const beforeAfterRows = [
  {
    before: "I design moments but don't know if they're adding up",
    after: 'I have a compass — I can check my direction',
  },
  {
    before: "I have vague values but haven't articulated them",
    after: 'I have 3–5 Compass Values I can name',
  },
  { before: "I notice what I'm grateful for", after: "I notice when I'm being who I want to be" },
  {
    before: 'Meaning is something I experience',
    after: 'Meaning is something I live into over time',
  },
];

/* ── Component ── */

export default function Module5() {
  const [currentSection, setCurrentSection] = useState(0);

  // Section 1
  const [compassMCQ, setCompassMCQ] = useState<string | null>(null);
  const [compassMCQSubmitted, setCompassMCQSubmitted] = useState(false);

  // Section 2
  const [confidenceLevel, setConfidenceLevel] = useState<string | null>(null);

  // Section 3
  const [currentStory, setCurrentStory] = useState('');
  const [storyFeedback, setStoryFeedback] = useState('');
  const [storyFeedbackLoading, setStoryFeedbackLoading] = useState(false);
  const [storyResonance, setStoryResonance] = useState<string | null>(null);
  const [showScaffold, setShowScaffold] = useState(false);

  // Section 4
  const [values, setValues] = useState<string[]>(['', '', '', '', '']);

  // Section 5
  const [sightingValue, setSightingValue] = useState<string | null>(null);
  const [sightingAction, setSightingAction] = useState('');
  const [sightingMeaning, setSightingMeaning] = useState('');

  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { addEntry } = useJournal();

  const goNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeValues = values.filter(v => v.trim().length > 0);
  const requiredValuesFilled =
    values[0].trim().length > 0 && values[1].trim().length > 0 && values[2].trim().length > 0;

  const fetchStoryFeedback = async () => {
    if (!currentStory.trim() || storyFeedbackLoading) return;
    setStoryFeedbackLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntry: currentStory.trim() }),
      });
      const data = await res.json();
      const text = [data.summary, data.pattern, data.next_step].filter(Boolean).join('␞');
      setStoryFeedback(text);
    } catch {
      setStoryFeedback('Your story has been noted.');
    } finally {
      setStoryFeedbackLoading(false);
    }
  };

  const saveAndFinish = async () => {
    setSaving(true);
    const parts: string[] = [];
    if (currentStory) parts.push(`Current Story: ${currentStory}`);
    if (activeValues.length > 0)
      parts.push(`Compass Values: ${activeValues.join(', ')}`);
    if (sightingValue && sightingAction)
      parts.push(
        `Coherency Sighting: Value "${sightingValue}" — ${sightingAction}. Meaning: ${sightingMeaning}`,
      );

    await addEntry({
      moduleId: 'ideate',
      moduleTitle: 'Build a Personal Compass',
      selectedSignals: activeValues,
      reflectionText: parts.join('\n') || undefined,
    });

    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-16 px-8">
      {/* Module Header */}
      <div className="mb-6">
        <span className="text-xs font-medium text-muted uppercase tracking-widest">Module 5</span>
        <h1 className="font-serif text-4xl mt-2 text-ink">Build a Personal Compass</h1>
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
            Are your moments adding up to something?
          </h2>
          <p className="text-sm text-muted mb-8 leading-relaxed max-w-2xl">
            In Modules 3 and 4, you've been prototyping at the level of moments — flipping between
            worlds, opening wonder, sustaining simple flow. These are powerful tools. But here's a
            question worth sitting with: are those moments adding up to a life that reflects who you
            actually are? That's the question of <strong className="text-ink">coherence</strong>.
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
                <p className="text-sm text-ink font-medium">Build your first compass prototype</p>
              </div>
              <div className="pl-6">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  Leave with
                </p>
                <p className="text-sm text-ink font-medium">3–5 values + 1 coherency sighting</p>
              </div>
            </div>
          </div>

          <blockquote className="border-l-2 border-ink/20 pl-5 mb-10">
            <p className="text-base text-ink/80 italic leading-relaxed">
              "A coherent life is what happens when your actions are an honest expression of who you
              are right now and what truly matters to you."
            </p>
            <p className="text-xs text-muted mt-2">— Burnett & Evans, Designing Your Life</p>
          </blockquote>

          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
          >
            Begin <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── SECTION 1 — From Moments to Direction ─── */}
      {currentSection === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">Three very different lives</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Burnett and Evans describe three people with very different lives who share one
              essential thing. See if you can spot it.
            </p>
          </div>

          {/* Three stories */}
          <div className="space-y-3">
            {[
              {
                name: 'Reg',
                story:
                  'Reg liked to introduce himself as a poet, but spent sixty-plus hours a week at his law firm. He didn\'t mind the lawyering. Law was a noble profession that, like poetry, respected the power of words. He was at peace with the deal he\'d made.',
              },
              {
                name: 'Derek',
                story:
                  "Derek was a solid, quiet guy — a competent engineer, a capable handyman, a terrific skier, a reliable dad, and a devoted husband. He never went for the promotion. He'd figured out who he was and what he cared about early in life and built a life around those priorities. At his memorial service, everyone described the same man.",
              },
              {
                name: 'Steefna',
                story:
                  "Steefna was a chemistry major, premed, but her real love was the piano. She'd just been admitted to Juilliard. She realized she couldn't love the piano and her boyfriend at the same time — not because she didn't care about him, but because her devotion to the instrument was unshakable. She chose the piano.",
              },
            ].map(person => (
              <div
                key={person.name}
                className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-5"
              >
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  {person.name}
                </p>
                <p className="text-sm text-ink/80 leading-relaxed">{person.story}</p>
              </div>
            ))}
          </div>

          {/* MCQ */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">
              Quick Check
            </p>
            <p className="text-sm text-ink font-medium mb-5">
              Despite their very different lives, what do Reg, Derek, and Steefna have in common?
            </p>
            <div className="space-y-2.5">
              {compassMCQOptions.map(opt => {
                const isSelected = compassMCQ === opt.id;
                const showResult = compassMCQSubmitted;
                return (
                  <button
                    key={opt.id}
                    disabled={compassMCQSubmitted}
                    onClick={() => !compassMCQSubmitted && setCompassMCQ(opt.id)}
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

            {compassMCQ && !compassMCQSubmitted && (
              <button
                onClick={() => setCompassMCQSubmitted(true)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium hover:bg-ink/85 transition-all"
              >
                Submit
              </button>
            )}

            {compassMCQSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-black/[0.03] text-sm text-ink/80 leading-relaxed"
              >
                {compassMCQOptions.find(o => o.id === compassMCQ)?.correct ? (
                  <>
                    <strong className="text-emerald-700">Exactly.</strong> Despite very different
                    paths — a lawyer-poet, a quiet family man, a pianist — all three are living in
                    alignment with who they are and what they believe. Their situations differ; their
                    coherence is the same. That alignment is what we call a coherent life.
                  </>
                ) : (
                  <>
                    <strong className="text-red-700">Not quite.</strong> Look again: Reg is a
                    lawyer who identifies as a poet; Derek never sought promotion; Steefna gave up
                    her relationship for her art. Their shared trait isn't status or sacrifice — it's
                    that their actions align with who they are and what they believe.
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Compass triangle */}
          {compassMCQSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-7"
            >
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-5 text-center">
                Your Compass
              </p>
              <div className="flex flex-col items-center">
                {/* Top node */}
                <div className="rounded-xl border border-[#6B8F6E]/40 bg-[#E3E8E4]/50 px-6 py-3 text-sm font-semibold text-ink text-center mb-0">
                  Who you are
                </div>
                {/* Lines down */}
                <div className="flex w-full max-w-xs justify-between px-8">
                  <div className="w-px h-8 bg-black/10 ml-[calc(50%-1px-5rem)]" />
                  <div className="w-px h-8 bg-black/10 mr-[calc(50%-1px-5rem)]" />
                </div>
                {/* Bottom two nodes */}
                <div className="flex items-center gap-4 w-full max-w-xs">
                  <div className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-ink text-center">
                    What you do
                  </div>
                  <div className="text-muted text-xs">—</div>
                  <div className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-ink text-center">
                    What you believe
                  </div>
                </div>
                <p className="text-xs text-muted mt-5 text-center max-w-xs leading-relaxed">
                  When these three elements harmonize, life flows naturally and meaningfully — you
                  don't just exist, you thrive.
                </p>
              </div>
            </motion.div>
          )}

          {compassMCQSubmitted && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 2 — Your Compass Is Not Someone Else's ─── */}
      {currentSection === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              Your compass is not someone else's
            </h2>
          </div>

          {/* Parker Palmer story */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              Parker Palmer
            </p>
            <p className="text-sm text-ink/80 leading-relaxed mb-4">
              Parker Palmer, a renowned educational reformer, had to confess to himself that he was
              doing a noble job of living someone else's life. Inspired by Dr. King, Gandhi, and
              Dorothy Day, he set his path by their compass — not his own. He earned a PhD, was on
              track for a university presidency. He hated it.
            </p>
            <p className="text-sm text-ink/80 leading-relaxed">
              He came to realize he could be inspired by others without walking their path. He
              redesigned his life as a thought leader and writer — still working for the same goals,
              but in a way that was more authentic.
            </p>
          </div>

          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            There are powerful voices everywhere — family, culture, career norms — all telling us
            who to be. The best way to avoid accidentally living someone else's life is to clearly
            articulate your own.
          </p>

          {/* Confidence self-check */}
          <div>
            <p className="text-sm text-ink font-medium mb-4">
              Right now, how confident are you that the way you're living reflects YOUR values — not
              expectations from family, culture, or career norms?
            </p>
            <div className="space-y-2.5">
              {confidenceOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setConfidenceLevel(opt.id)}
                  className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-all ${
                    confidenceLevel === opt.id
                      ? 'border-ink bg-ink/[0.04] text-ink font-medium'
                      : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {confidenceLevel && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-5 text-sm text-ink/80 leading-relaxed"
            >
              {confidenceFeedback[confidenceLevel]}
            </motion.div>
          )}

          {confidenceLevel && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 3 — Write Your Current Story ─── */}
      {currentSection === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">Write your current story</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Building your compass starts with one thing: telling your current story. Not your whole
              autobiography. Not your resume. Just a snapshot of who you are and what's going on
              right now. Think of it as the{' '}
              <strong className="text-ink">first prototype of your compass</strong> — a v1.0 you'll
              iterate over time.
            </p>
          </div>

          {/* Lena example */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              Example — Lena's current story
            </p>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              Lena is a creative in her fifties who went through a divorce, the sale of her home,
              her son leaving for college, and a Lyme disease diagnosis — all in one year.
            </p>
            <blockquote className="border-l-2 border-black/10 pl-4">
              <p className="text-sm text-ink/80 italic leading-relaxed">
                "I'm in a season of unraveling — and reinvention. After years of relentless
                achievement, I've hit pause — not because I wanted to, but because my body asked me
                to. I've had to close myself off to so many things, but at the same time I feel like
                I've never been more open — to my own healing, to different kinds of creativity,
                even to the possibility of falling in love again. My current story is about
                alignment. Letting go of roles that no longer fit. And asking not 'What can I build
                next?' but 'What wants to be born through me now?'"
              </p>
            </blockquote>
          </div>

          {/* Writing area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-ink">Your current story</label>
              <button
                onClick={() => setShowScaffold(s => !s)}
                className="text-xs text-muted underline underline-offset-2 hover:text-ink transition-colors"
              >
                {showScaffold ? 'Hide prompts' : 'Need a prompt?'}
              </button>
            </div>

            {showScaffold && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-3 rounded-xl border border-black/[0.06] bg-black/[0.02] p-4 space-y-2"
              >
                {storyScaffolds.map((prompt, i) => (
                  <p key={i} className="text-xs text-muted flex items-start gap-2">
                    <span className="mt-0.5 text-muted/50">·</span>
                    {prompt}
                  </p>
                ))}
              </motion.div>
            )}

            <textarea
              value={currentStory}
              onChange={e => setCurrentStory(e.target.value)}
              placeholder="Right now, I'm..."
              rows={6}
              className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 resize-none focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
            />
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-xs text-muted/60">{currentStory.split(/\s+/).filter(Boolean).length} words</p>
              <p className="text-xs text-muted/50">~50 words suggested</p>
            </div>
          </div>

          {currentStory.trim().length >= 30 && !storyFeedback && (
            <button
              onClick={fetchStoryFeedback}
              disabled={storyFeedbackLoading}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-50"
            >
              {storyFeedbackLoading ? (
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

          {storyFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6"
            >
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                  Your story
                </p>
                <p className="text-sm text-ink/80 italic leading-relaxed">
                  "{currentStory.trim().slice(0, 120)}{currentStory.trim().length > 120 ? '...' : ''}"
                </p>
              </div>
              <FeedbackBlock text={storyFeedback} />

              {!storyResonance && (
                <div className="mt-5 pt-4 border-t border-black/5">
                  <p className="text-xs text-muted mb-3">Does this reflection resonate?</p>
                  <div className="flex gap-2">
                    {['Yes, it does', 'Somewhat', 'Not quite'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setStoryResonance(opt)}
                        className="px-4 py-2 rounded-xl border border-black/10 bg-white text-xs text-ink/70 hover:border-ink/30 hover:text-ink transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {storyResonance && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 pt-4 border-t border-black/5"
                >
                  <p className="text-xs text-muted">
                    {storyResonance === 'Yes, it does'
                      ? 'Good. Carry that clarity into the next step — it will help you name your values more precisely.'
                      : storyResonance === 'Somewhat'
                        ? "That's useful signal. The values step may help you refine what you're really pointing at."
                        : "No worries. The story itself is what matters — not the reflection on it. Your values will tell a cleaner story."}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {storyResonance && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 4 — Extract Your Compass Values ─── */}
      {currentSection === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">Extract your Compass Values</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Your core values define what direction points "north" on your life compass. At any
              moment, some values are more important than others. What you're looking for are the{' '}
              <strong className="text-ink">top 3–5 that most matter to you right now</strong>.
              Expect this list to change over time — that's a sign you're evolving, not failing.
            </p>
          </div>

          {/* Lena's extraction */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              Example — How Lena extracted her values
            </p>
            <p className="text-sm text-ink/80 leading-relaxed mb-4">
              Lena's story focused on slowing down, going inward, paying attention to health. The
              word <strong>healing</strong> was evident in everything. Both her story and her work
              mentioned <strong>sacredness</strong>. <strong>Truth</strong> figured prominently.{' '}
              <strong>Connection</strong> helped her consider where to spend her limited time. And{' '}
              <strong>grace</strong> — for herself, in admitting her new limits — ran through
              everything.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Healing', 'Grace', 'Truth', 'Connection', 'Sacredness'].map(v => (
                <span
                  key={v}
                  className="px-3 py-1 rounded-full bg-[#E3E8E4] text-xs font-medium text-ink"
                >
                  {v}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted mt-3 italic">
              That list fits on a Post-it with room to spare.
            </p>
          </div>

          {/* Value inputs */}
          <div>
            <p className="text-sm text-ink font-medium mb-1">
              Now look back at your current story. What values are showing up?
            </p>
            <p className="text-xs text-muted mb-4">
              List 3–5 values that most matter to you right now. Single words or short phrases.
            </p>

            {/* Example chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[
                'honesty', 'creativity', 'family', 'growth', 'freedom',
                'health', 'courage', 'service', 'connection', 'independence',
              ].map(ex => (
                <span key={ex} className="px-2.5 py-1 rounded-full border border-black/10 text-xs text-muted/70">
                  {ex}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="relative">
                  <input
                    type="text"
                    value={values[i]}
                    onChange={e => {
                      const next = [...values];
                      next[i] = e.target.value;
                      setValues(next);
                    }}
                    placeholder={
                      i < 3
                        ? `Value ${i + 1}`
                        : `Value ${i + 1} (optional)`
                    }
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Confirm display */}
          {requiredValuesFilled && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6"
            >
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
                Your Compass Values — prototype v1.0
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {activeValues.map((v, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 rounded-full bg-ink text-paper text-sm font-medium"
                  >
                    {v.trim()}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted leading-relaxed">
                This is your compass — prototype v1.0. It won't be perfect, and it's not meant to
                be. You'll iterate on it as you add your Workview and Lifeview. But it's usable
                right now — and we're about to test it.
              </p>
            </motion.div>
          )}

          {requiredValuesFilled && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 5 — Your First Coherency Sighting ─── */}
      {currentSection === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">Your first coherency sighting</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              You've built a compass. Now let's use it — right now, before this module ends.
            </p>
          </div>

          {/* Coherency vs gratitude */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
              Coherency sightings vs gratitude
            </p>
            <p className="text-sm text-ink/80 leading-relaxed mb-4">
              Gratitude lists are valuable — but they often stay in the transactional world. "I got a
              free hamburger. I made the green light." Events, outcomes.
            </p>
            <p className="text-sm text-ink/80 leading-relaxed mb-4">
              Coherency sightings are different. They're moments when you were{' '}
              <em>living out who you want to be</em>.
            </p>
            <div className="space-y-3">
              {[
                {
                  before: '"I was grateful someone bought me a burger."',
                  after: '"I had a chance to exercise generosity when I picked up the tab for the person behind me in line."',
                },
                {
                  before: '"I was glad my partner kissed me when I got home."',
                  after: '"I was glad to show affection today by bringing my partner some unexpected flowers."',
                },
              ].map((ex, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2.5 text-muted italic">
                    {ex.before}
                  </div>
                  <div className="rounded-lg border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 px-3 py-2.5 text-ink italic">
                    {ex.after}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sighting activity */}
          <div className="space-y-5">
            <p className="text-sm text-ink leading-relaxed">
              Think back over the past few days. Can you spot a moment — even a small one — where you
              were acting in alignment with one of your Compass Values?
            </p>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
                Which Compass Value was present?
              </label>
              <div className="flex flex-wrap gap-2">
                {activeValues.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSightingValue(v.trim())}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      sightingValue === v.trim()
                        ? 'border-ink bg-ink text-paper'
                        : 'border-black/10 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    {v.trim()}
                  </button>
                ))}
              </div>
            </div>

            {sightingValue && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    What were you doing?
                  </label>
                  <input
                    type="text"
                    value={sightingAction}
                    onChange={e => setSightingAction(e.target.value)}
                    placeholder="e.g., I stayed late to help a colleague, I chose to go for a walk instead of scrolling..."
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">
                    What did it mean to you?
                  </label>
                  <input
                    type="text"
                    value={sightingMeaning}
                    onChange={e => setSightingMeaning(e.target.value)}
                    placeholder="e.g., it reminded me that generosity is who I want to be..."
                    className="w-full rounded-xl border border-black/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {sightingValue && sightingAction.trim().length > 5 && sightingMeaning.trim().length > 5 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 p-5"
            >
              <p className="text-xs font-semibold text-[#6B8F6E] uppercase tracking-widest mb-2">
                Your coherency sighting
              </p>
              <p className="text-sm text-ink italic leading-relaxed">
                "When I {sightingAction.trim().toLowerCase()}, I was living my value of{' '}
                <strong className="not-italic">{sightingValue}</strong>. {sightingMeaning.trim()}"
              </p>
            </motion.div>
          )}

          {sightingValue && sightingAction.trim().length > 5 && sightingMeaning.trim().length > 5 && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 6 — Summary + Forward Bridge ─── */}
      {currentSection === 6 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">What shifted</h2>
          </div>

          {/* Before / After table */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-2 border-b border-black/5">
              <div className="px-5 py-3 bg-black/[0.02]">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest">Before</p>
              </div>
              <div className="px-5 py-3 bg-[#E3E8E4]/50">
                <p className="text-xs font-semibold text-[#6B8F6E] uppercase tracking-widest">After</p>
              </div>
            </div>
            {beforeAfterRows.map((row, i) => (
              <div key={i} className={`grid grid-cols-2 ${i < beforeAfterRows.length - 1 ? 'border-b border-black/5' : ''}`}>
                <div className="px-5 py-3.5">
                  <p className="text-xs text-muted leading-relaxed">{row.before}</p>
                </div>
                <div className="px-5 py-3.5 border-l border-black/5">
                  <p className="text-xs text-ink leading-relaxed">{row.after}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Assembled compass */}
          <div className="rounded-2xl border border-ink/15 bg-white shadow-sm p-6 space-y-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest">
              Your compass — version 1.0
            </p>

            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Current Story</p>
              <p className="text-sm text-ink/80 italic leading-relaxed">
                "{currentStory.trim().slice(0, 150)}{currentStory.trim().length > 150 ? '...' : ''}"
              </p>
            </div>

            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Compass Values</p>
              <div className="flex flex-wrap gap-2">
                {activeValues.map((v, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-ink text-paper text-xs font-medium"
                  >
                    {v.trim()}
                  </span>
                ))}
              </div>
            </div>

            {sightingValue && sightingAction && (
              <div>
                <p className="text-[10px] text-muted uppercase tracking-widest mb-2">
                  First Coherency Sighting
                </p>
                <p className="text-sm text-ink/80 italic leading-relaxed">
                  "When I {sightingAction.trim().toLowerCase()}, I was living my value of{' '}
                  {sightingValue}."
                </p>
              </div>
            )}

            <p className="text-xs text-muted pt-2 border-t border-black/5">
              This is your compass. It works. And it will get better.
            </p>
          </div>

          {/* Homework */}
          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
              To iterate to v2.0
            </p>
            <div className="space-y-3">
              {[
                {
                  title: 'Workview Reflection',
                  desc: 'What is work for? Why do you do it? What makes good work good? (~250 words)',
                },
                {
                  title: 'Lifeview Reflection',
                  desc: "What gives life meaning? What makes your life worthwhile? How does your life relate to others? (~250 words)",
                },
                {
                  title: 'Integration Check',
                  desc: 'Where do your Workview and Lifeview complement each other? Where do they clash?',
                },
                {
                  title: 'Coherency Sightings Log',
                  desc: 'Once a week: write the date, what you were doing, which value was present, what it meant.',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border border-black/15 flex-shrink-0 mt-0.5 flex items-center justify-center text-xs text-muted">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <p className="text-xs text-muted leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Closing */}
          <div className="rounded-2xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 p-5">
            <p className="text-sm text-ink leading-relaxed">
              Living coherently doesn't mean your problems disappear. It simply means you are living
              in alignment with your values and have not sacrificed your integrity along the way.{' '}
              <strong>By taking small, intentional steps, you can cultivate more coherence, more
              purpose, and more fulfillment — starting right now.</strong>
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
                Complete Module 5 <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
