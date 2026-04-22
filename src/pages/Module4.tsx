import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  'Worked Example',
  'Your Experiment',
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

const pipelineSteps = [
  { label: 'Normal Glasses', sub: 'Transactional default' },
  { label: 'Acceptance', sub: 'I am doing this. Period.' },
  { label: 'Curiosity', sub: 'Following what interests you' },
  { label: 'Simple Flow', sub: 'Absorbed, present' },
  { label: 'Meaning Moment', sub: 'Intrinsic, alive' },
];

const billStages = [
  {
    label: 'Stage 1 — Acceptance',
    image: '/Panel 1.png',
    text:
      '"To transform this mundane chore into a simple flow experience, we must first choose to accept that what we\'re doing now is chopping onions. Period. We are a single-minded, 100 percent focused, dedicated, calm, and methodical onion chopper. No more, no less."',
  },
  {
    label: 'Stage 2 — Curiosity Glasses',
    image: '/Panel 2.png',
    text:
      '"Get out the onions, clean off a good-size cutting board, pull out your best kitchen knife. Lay them all out and just look at everything. Pick each item up and feel it. These onions, this board, and this knife are your whole world for the next ten to fifteen minutes."',
  },
  {
    label: 'Stage 3 — Wonder Glasses',
    image: '/panel 3.png',
    text:
      '"Spend a moment appreciating what brought each object to this moment. Those onions were grown by farmers, harvested, transported, picked out and brought by you to this cutting board. The knife — begun as ore deep in the earth, mined, smelted, cast, forged, and ground — has travelled far to feel so good in your hand right now."',
  },
  {
    label: 'Stage 4 — Simple Flow',
    image: '/Panel 4.png',
    text:
      '"You begin cutting. After the fifteenth slice, you start to feel a rhythm. You lean in, tilting your ear to the board to hear the sound as the blade crunches through the onion. Seventeen minutes have gone by — but it seemed like an hour. Or was it just thirty seconds? Nothing much has happened. And yet… you feel rather wonderful."',
  },
];

const scenarioOptions = [
  { id: 'coffee', label: 'Making coffee' },
  { id: 'dishes', label: 'Washing dishes' },
  { id: 'commute', label: 'Commuting' },
  { id: 'grocery', label: 'Grocery shopping' },
  { id: 'other', label: 'Something else' },
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
  const [versionDifference, setVersionDifference] = useState('');
  const [versionDifferenceSubmitted, setVersionDifferenceSubmitted] = useState(false);
  const [showTransactionalFraming, setShowTransactionalFraming] = useState(false);
  const [showTransactionalLine, setShowTransactionalLine] = useState(false);

  useEffect(() => {
    if (!versionDifferenceSubmitted) {
      setShowTransactionalFraming(false);
      return;
    }
    const timer = setTimeout(() => setShowTransactionalFraming(true), 1000);
    return () => clearTimeout(timer);
  }, [versionDifferenceSubmitted]);

  useEffect(() => {
    if (!soundFamiliarSelection) {
      setShowTransactionalLine(false);
      return;
    }
    const timer = setTimeout(() => setShowTransactionalLine(true), 1000);
    return () => clearTimeout(timer);
  }, [soundFamiliarSelection]);

  // Section 2
  const [perceptionMode, setPerceptionMode] = useState<'labels' | 'fresh' | null>(null);

  // Section 3
  const [glassesMCQ, setGlassesMCQ] = useState<string | null>(null);
  const [glassesMCQSubmitted, setGlassesMCQSubmitted] = useState(false);

  // Section 4
  const [flowMCQ, setFlowMCQ] = useState<string | null>(null);
  const [flowMCQSubmitted, setFlowMCQSubmitted] = useState(false);
  const [showFlowNote, setShowFlowNote] = useState(false);
  const [showFlowBridge, setShowFlowBridge] = useState(false);
  const [acceptanceFlipped, setAcceptanceFlipped] = useState(false);
  const [availabilityFlipped, setAvailabilityFlipped] = useState(false);

  useEffect(() => {
    if (!availabilityFlipped) {
      setShowFlowBridge(false);
      return;
    }
    const timer = setTimeout(() => setShowFlowBridge(true), 1000);
    return () => clearTimeout(timer);
  }, [availabilityFlipped]);

  // Section 4 — Bill's worked example (stages revealed one at a time)
  const [billStage, setBillStage] = useState(1);

  // Section 5 — Your experiment (scenario picker + 4 steps)
  const [newScenarioId, setNewScenarioId] = useState<string | null>(null);
  const [newScenarioCustom, setNewScenarioCustom] = useState('');
  const [newCuriosity, setNewCuriosity] = useState('');
  const [newWonder, setNewWonder] = useState('');
  const [newFlow, setNewFlow] = useState('');

  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { addEntry } = useJournal();

  const hasCompletedScenarioCards = hasViewedChecklistGarden && hasViewedCuriosityGarden;
  const hasCompletedScenarioSection = hasCompletedScenarioCards && !!soundFamiliarSelection;

  const goNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ─── Section 7 derived values ────────────────────────────────────────────
  const newScenarioText =
    newScenarioId === 'other'
      ? newScenarioCustom.trim()
      : scenarioOptions.find(o => o.id === newScenarioId)?.label ?? '';
  const acceptanceText = newScenarioText
    ? `I am doing ${newScenarioText.toLowerCase()}. Period. No multitasking, no podcast, no phone.`
    : '';
  const firstEmptyExperimentStep = !newCuriosity.trim()
    ? 2
    : !newWonder.trim()
      ? 3
      : !newFlow.trim()
        ? 4
        : null;
  const canSubmitExperiment =
    !!acceptanceText && !!newCuriosity.trim() && !!newWonder.trim() && !!newFlow.trim();

  const saveNewExperiment = () => {
    if (!canSubmitExperiment) return;
    localStorage.setItem('m4_task', newScenarioText);
    localStorage.setItem('m4_acceptance', acceptanceText);
    localStorage.setItem('m4_sense', newCuriosity.trim());
    localStorage.setItem('m4_wonder', newWonder.trim());
    localStorage.setItem('m4_flow', newFlow.trim());
    goNext();
  };

  const saveAndFinish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const parts: string[] = [];
      if (perceptionMode)
        parts.push(
          `Perception mode: ${perceptionMode === 'fresh' ? 'Tends toward fresh eyes' : 'Tends to see through labels'}`,
        );
      if (newScenarioText) parts.push(`Experiment task: ${newScenarioText}`);
      if (acceptanceText) parts.push(`Acceptance: ${acceptanceText}`);
      if (newCuriosity.trim()) parts.push(`Curiosity glasses: ${newCuriosity.trim()}`);
      if (newWonder.trim()) parts.push(`Wonder glasses: ${newWonder.trim()}`);
      if (newFlow.trim()) parts.push(`Simple flow: ${newFlow.trim()}`);

      localStorage.setItem('journal_m4_status', 'available');

      await addEntry({
        moduleId: 'branching',
        moduleTitle: 'From Wonder to Flow',
        selectedSignals: newScenarioText ? [newScenarioText] : [],
        reflectionText: parts.join('\n') || undefined,
        mcqResults: {
          ...(glassesMCQSubmitted && glassesMCQ ? { glasses: glassesMCQ === 'b' } : {}),
          ...(flowMCQSubmitted && flowMCQ ? { flow: flowMCQ === 'b' } : {}),
        },
      });

      navigate('/');
    } catch (err) {
      console.error('Module 4 saveAndFinish failed:', err);
      const detail = err instanceof Error && err.message ? err.message : String(err);
      alert(
        `We couldn't save your reflection right now.\n\n${detail}\n\nPlease check your connection and try again. Details also logged to the browser console.`,
      );
    } finally {
      setSaving(false);
    }
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
                      src="/M4-2 checklist gardern.png"
                      alt="Checklist garden"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setShowChecklistGarden(false)}
                      className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg border border-black/15 bg-white/90 text-[11px] font-medium text-ink hover:bg-white"
                    >
                      Flip Back
                    </button>
                  </>
                )}
              </div>
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
                      src="/M4-2 curiousity gardern.png"
                      alt="Curiosity garden"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setShowCuriosityGarden(false)}
                      className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg border border-black/15 bg-white/90 text-[11px] font-medium text-ink hover:bg-white"
                    >
                      Flip Back
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {hasCompletedScenarioCards && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-2"
            >
              <label
                htmlFor="version-difference"
                className="block text-sm font-medium text-ink"
              >
                What feels different between version 2 and version 1?
              </label>
              <p className="text-xs text-muted">
                A sentence or two is enough — just notice what shifts for you.
              </p>
              <textarea
                id="version-difference"
                value={versionDifference}
                onChange={(e) => setVersionDifference(e.target.value)}
                disabled={versionDifferenceSubmitted}
                rows={3}
                placeholder="In version 2, I notice…"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 resize-none disabled:bg-black/[0.02] disabled:text-ink/70"
              />
              {!versionDifferenceSubmitted ? (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setVersionDifferenceSubmitted(true)}
                    disabled={versionDifference.trim().length === 0}
                    className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink/90 disabled:bg-ink/30 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mt-2 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-1.5">
                    Example Answer
                  </p>
                  <p className="text-sm text-ink/85 leading-relaxed">
                    When you look at the garden in version A, what you see is a series of
                    actions. Notice that all the tasks are projections of yourself into a future
                    that hasn't happened yet. In the second garden, you are spending more time in
                    the present moment.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {hasCompletedScenarioCards && showTransactionalFraming && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-3"
            >
              <div className="space-y-3">
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
                        a: "That's the default, and you're not alone. Most of us live here more than we realize. That's what this module is here to change.",
                        b: "That's rarer than you might think. Most of us don't, even when we think we do. The transactional mindset is the brain's default setting. That's what this module is here to change.",
                        c: "That's honest. Most of us swing toward A without noticing. The transactional mindset is the brain's default setting. That's what this module is here to change.",
                      }}
                      onSelectOption={setSoundFamiliarSelection}
                    />
                  </motion.div>
                )}
              </div>

              {showTransactionalLine && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="font-serif text-[20px] text-ink leading-snug pt-2"
                >
                  Psychologists call version 1 the transactional mindset. Many of us see a
                  series of unfinished tasks all the time. It's our brain's default setting.
                </motion.p>
              )}
            </motion.div>
          )}

          {hasCompletedScenarioSection && showTransactionalLine && (
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
              <button
                type="button"
                onClick={() => setAcceptanceFlipped(v => !v)}
                className="group relative rounded-xl border border-black/10 bg-black/[0.02] p-4 text-left min-h-[140px] flex transition-all hover:border-black/20 hover:bg-black/[0.04]"
              >
                {!acceptanceFlipped ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-base font-semibold text-ink">Radical Acceptance</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted mt-2">Click to flip</p>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center">
                    <ul className="text-xs text-muted space-y-1.5">
                      <li>→ Fully agree that what you're doing right now is what you're doing.</li>
                      <li>→ Not a stepping stone. Not something to get through. </li>
                      <li>→ Say it to yourself: "I am doing this. Period."</li>
                    </ul>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFlipped(v => !v)}
                className="group relative rounded-xl border border-[#6B8F6E]/30 bg-[#E3E8E4]/40 p-4 text-left min-h-[140px] flex transition-all hover:border-[#6B8F6E]/50 hover:bg-[#E3E8E4]/60"
              >
                {!availabilityFlipped ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-base font-semibold text-ink">Availability</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted mt-2">Click to flip</p>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center">
                    <ul className="text-xs text-muted space-y-1.5">
                      <li>→ Open your senses — what do you hear, feel, notice?</li>
                      <li>→ What changes as you keep going?</li>
                      <li>→ Stay in contact with what's actually happening.</li>
                    </ul>
                  </div>
                )}
              </button>
            </div>
          </div>

          {showFlowBridge && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="font-serif text-ink leading-relaxed text-left py-2"
              style={{ fontSize: '18px' }}
            >
              Together, acceptance and availability do something remarkable: they make simple flow available to you, anytime, in almost any task.
            </motion.p>
          )}

          <div className="space-y-4">
            {showFlowBridge && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-wrap items-center gap-3"
              >
                <button
                  onClick={() => setShowFlowNote(v => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-ink transition-all hover:bg-black/[0.03]"
                >
                  What is simple flow?
                </button>
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {showFlowNote && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <p className="text-sm text-muted leading-relaxed max-w-2xl pt-6">
                  You may have heard of flow states, the feeling of being completely absorbed in a
                  challenging activity where time disappears. That's Peak Flow, and it's real. But
                  it requires high skill and the right conditions. It's rare.
                  <br />
                  <br />
                  Simple Flow is different.
                </p>

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
                    Concept Check
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

                {flowMCQSubmitted && (
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    onClick={goNext}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>

        </motion.div>
      )}

      {/* ─── SECTION 4 — Bill's Meaning Experiment (Worked Example) ─── */}
      {currentSection === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">How Bill designs a meaning experiment</h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl">
              Let's look at a real scenario from the author of this book. See how Bill turns
              something ordinary, chopping onions, into a meaningful experience, and how he
              discovers a state of simple flow in the process.
            </p>
          </div>

          <div className="relative rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
              {billStages[billStage - 1].label}
            </p>

            <div className="relative mx-auto max-w-md">
              {billStages.map((stage, idx) => (
                <img
                  key={stage.label}
                  src={stage.image}
                  alt={stage.label}
                  className={`block w-full h-auto transition-opacity duration-300 ${
                    idx === billStage - 1 ? 'relative opacity-100' : 'absolute inset-0 opacity-0 pointer-events-none'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setBillStage(s => Math.max(1, s - 1))}
              disabled={billStage === 1}
              aria-label="Previous panel"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-black/15 bg-white text-ink flex items-center justify-center shadow-sm transition-all hover:bg-black/[0.03] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setBillStage(s => Math.min(billStages.length, s + 1))}
              disabled={billStage === billStages.length}
              aria-label="Next panel"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-black/15 bg-white text-ink flex items-center justify-center shadow-sm transition-all hover:bg-black/[0.03] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="mt-4 text-center text-[11px] font-medium text-muted">
              {billStage} / {billStages.length}
            </div>
          </div>

          {billStage === billStages.length && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85"
              >
                Start my own experiment <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ─── SECTION 5 — Your Experiment (Scenario + 4 Steps) ─── */}
      {currentSection === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-8"
        >
          {/* Scenario picker */}
          <div>
            <h2 className="font-serif text-2xl text-ink mb-3">
              First, pick a task for your experiment.
            </h2>
            <p className="text-sm text-muted leading-relaxed max-w-2xl mb-5">
              Something routine, 5–15 minutes, that usually feels like just a chore.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {scenarioOptions.map(opt => {
                const isSelected = newScenarioId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setNewScenarioId(opt.id)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${
                      isSelected
                        ? 'border-ink bg-ink/[0.04] text-ink font-medium'
                        : 'border-black/15 bg-white text-ink/70 hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {newScenarioId === 'other' && (
              <input
                value={newScenarioCustom}
                onChange={e => setNewScenarioCustom(e.target.value)}
                placeholder=""
                className="mt-3 w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
              />
            )}
          </div>

          {acceptanceText && (
            <>
              {/* Step 1 — pre-filled Acceptance (example, warm tint) */}
              <div className="rounded-2xl border border-[#D9C9A8]/50 bg-[#FAF2E3] shadow-sm p-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                    Step 1 — Acceptance
                  </p>
                  <span className="text-[10px] uppercase tracking-widest text-[#8B6A2F] bg-white/60 border border-[#D9C9A8]/60 rounded-full px-2 py-0.5">
                    Example
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  Fully commit to being here, doing just this.
                </p>
                <blockquote className="text-base text-ink font-serif leading-relaxed">
                  "{acceptanceText}"
                </blockquote>
              </div>

              {/* Step 2 — Curiosity Glasses */}
              <div
                className={`rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 border-l-4 transition-all ${
                  firstEmptyExperimentStep === 2 ? 'border-l-ink' : 'border-l-transparent'
                } ${newCuriosity.trim() ? 'opacity-70' : 'opacity-100'}`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
                  Step 2 — Curiosity Glasses
                </p>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  Pick one sense to lead with. What will you notice?
                </p>
                <input
                  value={newCuriosity}
                  onChange={e => setNewCuriosity(e.target.value)}
                  placeholder=""
                  className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
                />
              </div>

              {/* Step 3 — Wonder Glasses */}
              <div
                className={`rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 border-l-4 transition-all ${
                  firstEmptyExperimentStep === 3 ? 'border-l-ink' : 'border-l-transparent'
                } ${newWonder.trim() ? 'opacity-70' : 'opacity-100'}`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
                  Step 3 — Wonder Glasses
                </p>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  Ask one question that goes beyond getting it done.
                </p>
                <input
                  value={newWonder}
                  onChange={e => setNewWonder(e.target.value)}
                  placeholder=""
                  className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
                />
              </div>

              {/* Step 4 — Simple Flow */}
              <div
                className={`rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6 border-l-4 transition-all ${
                  firstEmptyExperimentStep === 4 ? 'border-l-ink' : 'border-l-transparent'
                } ${newFlow.trim() ? 'opacity-70' : 'opacity-100'}`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
                  Step 4 — Simple Flow
                </p>
                <p className="text-xs text-muted leading-relaxed mb-3">
                  What will staying in sensory contact look like for you?
                </p>
                <input
                  value={newFlow}
                  onChange={e => setNewFlow(e.target.value)}
                  placeholder=""
                  className="w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink/40 transition-all"
                />
              </div>

              <button
                onClick={saveNewExperiment}
                disabled={!canSubmitExperiment}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm my experiment <ArrowRight className="w-4 h-4" />
              </button>
            </>
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
              What else you've learned
            </p>
            <div className="space-y-2.5">
              {[
                { icon: '◎', text: 'Designing wonder and entering flow is how you design meaning in ordinary time.' },
                { icon: '◎', text: "Your brain's default mode is transactional — it keeps you in the future, managing tasks." },
                { icon: '◎', text: 'Wonder is designed: Curiosity + Mystery = Wonder.' },
                { icon: '◎', text: 'Wonder opens the door to the flow world. But to stay, you need Acceptance + Availability.' },
                { icon: '◎', text: "Simple Flow doesn't require peak conditions. It's available in any ordinary task." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#6B8F6E] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-ink/80 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Your experiment recap */}
          {(newScenarioText || newWonder.trim()) && (
            <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                Your wonder experiment
              </p>
              <div className="space-y-3">
                {newScenarioText && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
                      Practice ground
                    </p>
                    <p className="text-sm text-ink">{newScenarioText}</p>
                  </div>
                )}
                {acceptanceText && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
                      Acceptance
                    </p>
                    <p className="text-sm text-ink italic">"{acceptanceText}"</p>
                  </div>
                )}
                {newCuriosity.trim() && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
                      Curiosity glasses
                    </p>
                    <p className="text-sm text-ink">{newCuriosity.trim()}</p>
                  </div>
                )}
                {newWonder.trim() && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
                      Wonder glasses
                    </p>
                    <p className="text-sm text-ink italic">"{newWonder.trim()}"</p>
                  </div>
                )}
                {newFlow.trim() && (
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">
                      Simple flow
                    </p>
                    <p className="text-sm text-ink">{newFlow.trim()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
    </div>
  );
}
