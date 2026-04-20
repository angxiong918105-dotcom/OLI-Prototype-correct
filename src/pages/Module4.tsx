import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { motion } from 'motion/react';
import SoundFamiliar from '../components/SoundFamiliar';
import ThreeGlassesModulePage from '../components/ThreeGlassesModulePage';

/* ── Constants ── */

const sections = [
  'Intro',
  'Scenario',
  'Three Glasses',
  'Are You Seeing?',
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

const curiositySenseOptions = [
  {
    id: 'sight',
    emoji: '👁',
    title: 'Sight',
    text: 'What does it actually look like, up close?',
  },
  {
    id: 'touch',
    emoji: '🤲',
    title: 'Touch',
    text: 'How does it feel in my hands?',
  },
  {
    id: 'sound',
    emoji: '👂',
    title: 'Sound',
    text: 'What do I hear when I pay attention?',
  },
  {
    id: 'smell',
    emoji: '👃',
    title: 'Smell',
    text: 'What scents am I usually ignoring?',
  },
] as const;

const wonderQuestionPlaceholders = [
  'Where did this object come from before it reached me?',
  'What makes this texture feel the way it does?',
  'How does the rhythm change as I keep going?',
];

/* ── Component ── */

export default function Module4() {
  const [currentSection, setCurrentSection] = useState(0);

  // Section 1
  const [showChecklistGarden, setShowChecklistGarden] = useState(false);
  const [showCuriosityGarden, setShowCuriosityGarden] = useState(false);
  const [hasViewedChecklistGarden, setHasViewedChecklistGarden] = useState(false);
  const [hasViewedCuriosityGarden, setHasViewedCuriosityGarden] = useState(false);
  const [isSoundFamiliarOpen, setIsSoundFamiliarOpen] = useState(false);
  const [soundFamiliarSelection, setSoundFamiliarSelection] = useState<string | null>(null);

  // Section 2
  const [perceptionMode, setPerceptionMode] = useState<'labels' | 'fresh' | null>(null);

  // Section 3
  const [glassesMCQ, setGlassesMCQ] = useState<string | null>(null);
  const [glassesMCQSubmitted, setGlassesMCQSubmitted] = useState(false);

  // Section 4
  const [flowMCQ, setFlowMCQ] = useState<string | null>(null);
  const [flowMCQSubmitted, setFlowMCQSubmitted] = useState(false);
  const [showFlowNote, setShowFlowNote] = useState(false);

  // Section 5
  const [choreTask, setChoreTask] = useState<string | null>(null);

  // Section 6
  const [experimentTask, setExperimentTask] = useState('');
  const [isTaskConfirmed, setIsTaskConfirmed] = useState(false);
  const [isCommitConfirmed, setIsCommitConfirmed] = useState(false);
  const [selectedCuriositySenses, setSelectedCuriositySenses] = useState<
    Array<(typeof curiositySenseOptions)[number]['id']>
  >([]);
  const [isSenseConfirmed, setIsSenseConfirmed] = useState(false);
  const [isWonderQuestionConfirmed, setIsWonderQuestionConfirmed] = useState(false);
  const [wonderPlaceholderIndex, setWonderPlaceholderIndex] = useState(0);

  const [wonderQuestion, setWonderQuestion] = useState('');

  // Section 7
  const [experimentReady, setExperimentReady] = useState(false);

  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { addEntry } = useJournal();

  const hasCompletedScenarioCards = hasViewedChecklistGarden && hasViewedCuriosityGarden;
  const hasCompletedScenarioSection = hasCompletedScenarioCards && !!soundFamiliarSelection;

  const selectedSenseMeta = curiositySenseOptions.filter(s => selectedCuriositySenses.includes(s.id));

  useEffect(() => {
    if (!choreTask || experimentTask.trim()) return;
    const option = choreOptions.find(o => o.id === choreTask);
    if (option) setExperimentTask(option.label);
  }, [choreTask, experimentTask]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWonderPlaceholderIndex(prev => (prev + 1) % wonderQuestionPlaceholders.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const goNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Save experiment inputs and unlock journal entry
    localStorage.setItem('m4_task', experimentTask);
    localStorage.setItem('m4_sense', selectedCuriositySenses.join(', '));
    localStorage.setItem('m4_wonder', wonderQuestion);
    localStorage.setItem('journal_m4_status', 'available');

    await addEntry({
      moduleId: 'branching',
      moduleTitle: 'From Wonder to Flow',
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
        <h1 className="font-serif text-4xl mt-2 text-ink">From Wonder to Flow</h1>
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
            Wonder could be your design tool for everyday meaning.
          </h2>
          <p className="text-sm text-muted mb-8 leading-relaxed max-w-2xl">
            In Module 3, you learned to flip between the transactional world and the flow world. You prototyped a meaning experiment: ten seconds of noticing something for what it IS.
            <br />
            <br />
            But you may have discovered that the moment was fleeting. You flipped in, and then your brain pulled you right back out.
            That's the problem this module is here to solve.
          </p>

          {/* Module info card */}
          <div className="max-w-3xl rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 mb-10">
            <div className="grid grid-cols-3 divide-x divide-black/5">
              <div className="pr-5">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  Duration
                </p>
                <p className="text-sm text-ink font-medium">~8 minutes</p>
              </div>
              <div className="px-5">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  Prerequisite
                </p>
                <p className="text-sm text-ink font-medium">Module 3</p>
              </div>
              <div className="pl-5">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">
                  You'll Design
                </p>
                <p className="text-sm text-ink font-medium">
                  Your first wonder-to-flow experiment
                </p>
              </div>
            </div>
          </div>

          <ol className="text-sm text-ink/85 leading-relaxed space-y-2 mb-10 list-decimal pl-5">
            <li>Discover why the flip feels fleeting</li>
            <li>Learn three ways of seeing that move you from tasks to wonder</li>
            <li>See how curiosity + mystery = wonder</li>
            <li>Meet the two mindsets that let you stay in the flow world</li>
            <li>Watch the full pipeline in action</li>
            <li>Design your own wonder-to-flow experiment to try today</li>
          </ol>

          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
          >
            Begin <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── SECTION 1 — Scenario ─── */}
      {currentSection === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              Let's start with a scenario. Imagine you step into a small garden.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
              <div className="relative aspect-[4/3]">
                {!showChecklistGarden ? (
                  <div className="absolute inset-0 bg-white p-5 flex flex-col justify-between">
                    <p className="text-xs uppercase tracking-widest text-ink/60">Version 1</p>
                    <p className="text-lg font-serif text-ink">Checklist Garden</p>
                    <button
                      onClick={() => {
                        setShowChecklistGarden(true);
                        setHasViewedChecklistGarden(true);
                      }}
                      className="self-start px-3 py-1.5 rounded-lg border border-black/15 bg-white text-[11px] font-medium text-ink hover:bg-black/5"
                    >
                      Flip Card
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src="/Module 4_version1.jpeg"
                      alt="Checklist garden"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <button
                      onClick={() => setShowChecklistGarden(false)}
                      className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg border border-black/15 bg-white/90 text-[11px] font-medium text-ink hover:bg-white"
                    >
                      Flip Back
                    </button>
                  </>
                )}
              </div>
              {showChecklistGarden && (
                <div className="p-4 border-t border-black/5">
                  <p className="text-sm text-ink/80 leading-relaxed">
                    When you look at the garden this way, what you see is a series of actions. And
                    notice that all the tasks are projections of yourself into a future that hasn't
                    happened yet.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
              <div className="relative aspect-[4/3]">
                {!showCuriosityGarden ? (
                  <div className="absolute inset-0 bg-white p-5 flex flex-col justify-between">
                    <p className="text-xs uppercase tracking-widest text-ink/60">Version 2</p>
                    <p className="text-lg font-serif text-ink">Curiosity Garden</p>
                    <button
                      onClick={() => {
                        setShowCuriosityGarden(true);
                        setHasViewedCuriosityGarden(true);
                      }}
                      className="self-start px-3 py-1.5 rounded-lg border border-black/15 bg-white text-[11px] font-medium text-ink hover:bg-black/5"
                    >
                      Flip Card
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src="/Module 4_version2.png"
                      alt="Curiosity garden"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <button
                      onClick={() => setShowCuriosityGarden(false)}
                      className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg border border-black/15 bg-white/90 text-[11px] font-medium text-ink hover:bg-white"
                    >
                      Flip Back
                    </button>
                  </>
                )}
              </div>
              {showCuriosityGarden && (
                <div className="p-4 border-t border-black/5">
                  <p className="text-sm text-ink/80 leading-relaxed">
                    Same garden. Completely different experience. You are spending time in the
                    present moment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {hasCompletedScenarioCards && (
            <div className="space-y-3">
              <p className="font-serif text-[20px] text-ink leading-snug">
                Psychologists call version 1 the transactional mindset, and it's your brain's
                default setting.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  onClick={() => setIsSoundFamiliarOpen(v => !v)}
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-black/15 bg-white text-[11px] font-semibold uppercase tracking-widest text-ink/80 hover:bg-black/[0.03]"
                >
                  <span>Sound Familiar?</span>
                  <ArrowRight
                    className={`w-5 h-5 transition-transform ${isSoundFamiliarOpen ? 'rotate-90' : ''}`}
                  />
                </button>

                {isSoundFamiliarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <SoundFamiliar
                      scenario="Imagine you sit down with your morning coffee before the day begins."
                      question="What's typically in your mind in that moment?"
                      options={[
                        {
                          id: 'a',
                          label: "I'm already running through what I need to get done.",
                        },
                        {
                          id: 'b',
                          label: 'I notice things - the warmth of the mug, the smell, the quiet.',
                        },
                        {
                          id: 'c',
                          label: 'Honestly, it depends.',
                        },
                      ]}
                      feedback={{
                        a: "That's the default - and you're not alone. Most of us live here more than we realize. The transactional mindset is the brain's default setting. That's what this module is here to change.",
                        b: "That's rarer than you might think. Most of us don't, even when we think we do. The transactional mindset is the brain's default setting. That's what this module is here to change.",
                        c: "That's honest. Most of us swing toward A without noticing. The transactional mindset is the brain's default setting. That's what this module is here to change.",
                      }}
                      onSelectOption={setSoundFamiliarSelection}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {hasCompletedScenarioSection && (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 2 — Three Glasses ─── */}
      {currentSection === 2 && (
        <ThreeGlassesModulePage onContinue={goNext} />
      )}

      {/* ─── SECTION 3 — From Wonder to Flow ─── */}
      {currentSection === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">From Wonder to Flow</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Wonder gets you to the threshold. But here's what usually happens next: You notice
              something beautiful. You feel a flash of aliveness. And then your achieving brain
              jumps back in.
              <br />
              "Okay, that was nice. Now what do I need to do?"
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
              The answer is two more designer's mindsets
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                <p className="text-sm font-semibold text-ink mb-2">Radical Acceptance</p>
                <ul className="text-xs text-muted space-y-1.5">
                  <li>→ Fully agree that what you're doing right now is what you're doing.</li>
                  <li>→ Not a stepping stone. Not something to get through. </li>
                  <li>→ Say it to yourself: "I am doing this. Period."</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/40 p-4">
                <p className="text-sm font-semibold text-ink mb-2">Availability</p>
                <ul className="text-xs text-muted space-y-1.5">
                  <li>→ Open your senses — what do you hear, feel, notice?</li>
                  <li>→ What changes as you keep going?</li>
                  <li>→ Stay in contact with what's actually happening.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowFlowNote(v => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-ink transition-all hover:bg-black/[0.03]"
            >
              A note on Simple Flow vs. Peak Flow
            </button>

            {showFlowNote && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-5">
                    <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
                      Simple Flow
                    </p>
                    <p className="text-sm text-ink leading-relaxed mb-3">
                      Absorbed in an activity. Time passes unnoticed. Mind stops narrating. You
                      are just doing.
                    </p>
                    <p className="text-xs text-muted italic">"I looked up and an hour had gone by."</p>
                  </div>
                  <div className="rounded-2xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/30 p-5">
                    <p className="text-xs font-semibold text-[#6B8F6E] uppercase tracking-widest mb-3">
                      Peak Flow
                    </p>
                    <p className="text-sm text-ink leading-relaxed mb-3">
                      Transcendent engagement — effortless mastery, heightened clarity, deep
                      connection to the activity. Rare, but remembered.
                    </p>
                    <p className="text-xs text-muted italic">
                      "Everything just... clicked. I forgot I was even there."
                    </p>
                  </div>
                </div>

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
                          <strong className="text-emerald-700">Yes.</strong> Sanding the shelf
                          describes simple flow: complete absorption in a physical task, with time
                          passing unnoticed. No transcendence required — just full, quiet presence.
                          Option A describes peak flow (effortless mastery). C and D are
                          distraction and divided attention.
                        </>
                      ) : (
                        <>
                          <strong className="text-red-700">Close, but not quite.</strong> Option
                          B is simple flow — absorbed in a task without transcendence. Option A is
                          peak flow (the transcendent variety). C is passive distraction, and D is
                          divided attention, not absorption.
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
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
            <h2 className="font-serif text-2xl text-ink mb-3">Design your experiment</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Build one tiny experiment you can actually do today. Keep it simple and specific.
            </p>
          </div>

          {!isTaskConfirmed ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Step 1</p>
              <h3 className="text-xl font-serif text-ink mb-2">Pick a simple, routine task.</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                Something you do regularly that usually feels like "just a chore." 5-15 minutes.
              </p>
              <input
                value={experimentTask}
                onChange={e => setExperimentTask(e.target.value)}
                placeholder="e.g. doing the dishes, folding laundry, making coffee"
                className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
              />
              <button
                onClick={() => {
                  setIsTaskConfirmed(true);
                  setChoreTask('other');
                }}
                disabled={!experimentTask.trim()}
                className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                This is my task →
              </button>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 opacity-75">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Step 1</p>
                  <h3 className="text-xl font-serif text-ink">Pick a simple, routine task.</h3>
                  <p className="mt-2 text-sm text-ink/80">{experimentTask}</p>
                </div>
                <button
                  onClick={() => {
                    setIsTaskConfirmed(false);
                    setIsCommitConfirmed(false);
                    setIsSenseConfirmed(false);
                    setIsWonderQuestionConfirmed(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-ink/80 hover:bg-black/[0.03]"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          )}

          {isTaskConfirmed && (
            isCommitConfirmed ? (
              <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 opacity-75">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Step 2</p>
                    <h3 className="text-xl font-serif text-ink mb-3">Make your commitment.</h3>
                    <blockquote className="rounded-2xl border border-[#D9C9A8]/40 bg-[#FAF2E3] px-6 py-5 text-center text-lg leading-relaxed text-ink font-serif">
                      "I am doing {experimentTask}. Period. No multitasking, no podcast, no phone."
                    </blockquote>
                  </div>
                  <button
                    onClick={() => {
                      setIsCommitConfirmed(false);
                      setIsSenseConfirmed(false);
                      setIsWonderQuestionConfirmed(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-ink/80 hover:bg-black/[0.03]"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Step 2</p>
                <h3 className="text-xl font-serif text-ink mb-3">Make your commitment.</h3>
                <blockquote className="rounded-2xl border border-[#D9C9A8]/40 bg-[#FAF2E3] px-6 py-5 text-center text-lg leading-relaxed text-ink font-serif">
                  "I am doing {experimentTask}. Period. No multitasking, no podcast, no phone."
                </blockquote>
                <button
                  onClick={() => setIsCommitConfirmed(true)}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
                >
                  I commit →
                </button>
              </motion.div>
            )
          )}

          {isTaskConfirmed && isCommitConfirmed && (
            isSenseConfirmed ? (
              <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 opacity-75">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Step 3</p>
                    <h3 className="text-xl font-serif text-ink mb-2">Pick your curiosity entry point.</h3>
                    <p className="text-sm text-muted mb-3">What sense will you lead with?</p>
                    <p className="text-sm text-ink/80">
                      {selectedSenseMeta.map(s => `${s.emoji} ${s.title}`).join(' · ')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsSenseConfirmed(false);
                      setIsWonderQuestionConfirmed(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-ink/80 hover:bg-black/[0.03]"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Step 3</p>
                <h3 className="text-xl font-serif text-ink mb-2">Pick your curiosity entry point.</h3>
                <p className="text-sm text-muted mb-4">What sense will you lead with?</p>
                <div className="grid grid-cols-2 gap-3">
                  {curiositySenseOptions.map(option => {
                    const isSelected = selectedCuriositySenses.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedCuriositySenses(prev =>
                            prev.includes(option.id)
                              ? prev.filter(id => id !== option.id)
                              : [...prev, option.id],
                          );
                        }}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-ink bg-ink/[0.04] text-ink'
                            : selectedCuriositySenses.length > 0
                              ? 'border-black/10 bg-white text-ink/45'
                              : 'border-black/10 bg-white text-ink/80 hover:border-ink/30'
                        }`}
                      >
                        <p className="text-lg mb-1">
                          {option.emoji} <span className="font-semibold text-base">{option.title}</span>
                        </p>
                        <p className="text-sm leading-relaxed">{option.text}</p>
                      </button>
                    );
                  })}
                </div>
                {selectedCuriositySenses.length > 0 && (
                  <button
                    onClick={() => setIsSenseConfirmed(true)}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
                  >
                    Got it →
                  </button>
                )}
              </motion.div>
            )
          )}

          {isTaskConfirmed && isCommitConfirmed && isSenseConfirmed && (
            isWonderQuestionConfirmed ? (
              <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 opacity-75">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Step 4</p>
                    <h3 className="text-xl font-serif text-ink mb-2">What might you wonder about?</h3>
                    <p className="text-sm text-muted mb-3">
                      One question that goes beyond "how do I get this done?"
                    </p>
                    <p className="text-sm text-ink/80">{wonderQuestion}</p>
                  </div>
                  <button
                    onClick={() => setIsWonderQuestionConfirmed(false)}
                    className="inline-flex items-center gap-1 rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs text-ink/80 hover:bg-black/[0.03]"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">Step 4</p>
                <h3 className="text-xl font-serif text-ink mb-2">What might you wonder about?</h3>
                <p className="text-sm text-muted mb-4">
                  One question that goes beyond "how do I get this done?"
                </p>
                <input
                  value={wonderQuestion}
                  onChange={e => setWonderQuestion(e.target.value)}
                  placeholder={wonderQuestionPlaceholders[wonderPlaceholderIndex]}
                  className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
                />
                <button
                  onClick={() => setIsWonderQuestionConfirmed(true)}
                  disabled={!wonderQuestion.trim()}
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  This is my question →
                </button>
              </motion.div>
            )
          )}

          {isWonderQuestionConfirmed && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Your experiment</p>
                <div className="space-y-2.5 text-sm text-ink/90 leading-relaxed">
                  <p>🗂 Task: {experimentTask}</p>
                  <p>💬 Commitment: "I am doing {experimentTask}. Period."</p>
                  <p>
                    Curiosity entry:{' '}
                    {selectedSenseMeta.map(s => `${s.emoji} ${s.title}`).join(' · ')}
                  </p>
                  <p>❓ Wonder question: {wonderQuestion}</p>
                </div>
              </div>
              <p className="text-xs text-muted">Go try it. Come back when you're done.</p>
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
              >
                Done →
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
