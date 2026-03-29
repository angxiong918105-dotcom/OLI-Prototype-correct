import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowDown, Sparkles, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { motion, AnimatePresence } from 'motion/react';

const durationNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 21, 30];
const durationUnits = ['min', 'hrs', 'days', 'wks', 'mos', 'yrs'];
const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

function ScrollWheel<T extends string | number>({
  items,
  value,
  onChange,
}: {
  items: T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScroll = useRef(true);

  const scrollToIndex = useCallback((idx: number, smooth = true) => {
    if (!scrollRef.current) return;
    isUserScroll.current = false;
    scrollRef.current.scrollTo({
      top: idx * ITEM_HEIGHT,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setTimeout(() => { isUserScroll.current = true; }, 150);
  }, []);

  // Init scroll position
  useEffect(() => {
    if (value !== null) {
      const idx = items.indexOf(value);
      if (idx >= 0) scrollToIndex(idx, false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !isUserScroll.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const idx = Math.round(scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    onChange(items[clamped]);
  }, [onChange, items]);

  // Snap on scroll end
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleScroll();
        const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
        const clamped = Math.max(0, Math.min(idx, items.length - 1));
        el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
      }, 80);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); clearTimeout(timer); };
  }, [handleScroll]);

  const handleClick = (v: T) => {
    onChange(v);
    const idx = items.indexOf(v);
    if (idx >= 0) scrollToIndex(idx);
  };

  const selectedIdx = value !== null ? items.indexOf(value) : -1;

  return (
    <div className="relative" style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT }}>
      {/* Center highlight band */}
      <div
        className="absolute left-0 right-0 rounded-lg bg-ink/[0.04] border-y border-black/5 pointer-events-none z-10"
        style={{ top: Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT, height: ITEM_HEIGHT }}
      />
      {/* Fade edges */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto scrollbar-hide"
        style={{
          scrollSnapType: 'y mandatory',
          paddingTop: Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT,
          paddingBottom: Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT,
        }}
      >
        {items.map((item, idx) => (
          <button
            key={String(item)}
            onClick={() => handleClick(item)}
            className={`w-full flex items-center justify-center transition-all duration-150 ${
              idx === selectedIdx
                ? 'text-ink text-lg font-semibold'
                : 'text-muted/50 text-sm hover:text-muted'
            }`}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: 'start' }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

const chasingOptions = [
  { id: 'impact', label: 'I want to make a meaningful impact', branch: 1 },
  { id: 'fulfillment', label: 'I want a more fulfilling life', branch: 2 },
  { id: 'missing', label: 'I feel like something is still missing', branch: 3 },
  { id: 'more', label: 'I just need more time / success / clarity', branch: 3 },
];

const reframePairs = [
  { old: 'How do I find my purpose?', next: 'Notice hidden assumptions' },
  { old: 'How do I feel fulfilled?', next: 'Reframe the question' },
  { old: 'How do I make a real impact?', next: 'See meaning in moments' },
];

const sections = [
  'Intro',
  'What You Chase',
  'Reframe Impact',
  'Reframe Fulfillment',
  'Reframe "More"',
  'Summary',
  'What\'s Next',
];

export default function Module2() {
  const [currentSection, setCurrentSection] = useState(0);

  // Page 1 state
  const [selectedChasing, setSelectedChasing] = useState<string[]>([]);
  const [chasingCustom, setChasingCustom] = useState('');

  // Branch 1 – Impact
  const [impactWhere, setImpactWhere] = useState('');
  const [impactFeel, setImpactFeel] = useState('');
  const [impactDurationNum, setImpactDurationNum] = useState<number | null>(null);
  const [impactDurationUnit, setImpactDurationUnit] = useState<string | null>(null);
  const unitLabels: Record<string, string> = { min: 'minutes', hrs: 'hours', days: 'days', wks: 'weeks', mos: 'months', yrs: 'years' };
  const impactLast = impactDurationNum && impactDurationUnit
    ? `${impactDurationNum} ${unitLabels[impactDurationUnit] ?? impactDurationUnit}`
    : '';
  const [showImpactSummary, setShowImpactSummary] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(false);

  // Branch 2 – Fulfillment
  const [fulfillmentAnswer, setFulfillmentAnswer] = useState('');
  const [showFulfillmentInsight, setShowFulfillmentInsight] = useState(false);

  // Branch 3 – More
  const [moreAnswer, setMoreAnswer] = useState('');
  const [showMoreInsight, setShowMoreInsight] = useState(false);
  const [momentAnswer, setMomentAnswer] = useState('');
  const [alreadyHereAnswer, setAlreadyHereAnswer] = useState('');

  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { addEntry } = useJournal();

  const toggleChasing = (id: string) => {
    setSelectedChasing(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const goNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveAndContinue = async () => {
    setSaving(true);
    const reflectionParts: string[] = [];
    if (impactWhere) reflectionParts.push(`Impact: ${impactWhere}. Feels: ${impactFeel}. Lasts: ${impactLast}.`);
    if (fulfillmentAnswer) reflectionParts.push(`Fulfillment reflection: ${fulfillmentAnswer}`);
    if (moreAnswer) reflectionParts.push(`"More" reflection: ${moreAnswer}`);
    if (momentAnswer) reflectionParts.push(`Meaningful now: ${momentAnswer}`);
    if (alreadyHereAnswer) reflectionParts.push(`Already here: ${alreadyHereAnswer}`);

    await addEntry({
      moduleId: 'reframe',
      moduleTitle: 'Reframe Meaning & Purpose',
      selectedSignals: selectedChasing.map(id => chasingOptions.find(o => o.id === id)?.label ?? id),
      reflectionText: reflectionParts.join('\n') || undefined,
    });

    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-16 px-8">
      {/* Module Header */}
      <div className="mb-6">
        <span className="text-xs font-medium text-muted uppercase tracking-widest">Module 2</span>
        <h1 className="font-serif text-4xl mt-2 text-ink">Reframe Meaning &amp; Purpose</h1>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2 mb-16">
        {sections.map((label, idx) => (
          <button
            key={label}
            onClick={() => setCurrentSection(idx)}
            className="group flex items-center gap-2"
          >
            <div className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSection
                ? 'w-8 bg-ink'
                : idx < currentSection
                  ? 'w-4 bg-ink/40'
                  : 'w-4 bg-black/10'
            }`} />
          </button>
        ))}
        <span className="text-xs text-muted ml-2">
          {currentSection + 1} / {sections.length}
        </span>
      </div>

      {/* ─── SECTION 0 — Module Intro ─── */}
      {currentSection === 0 && (
        <div>
          {/* Title + hook */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-10"
          >
            <h2 className="font-serif text-3xl text-ink mb-3 leading-snug">
              What if the questions you're asking about meaning are part of the problem?
            </h2>
            <p className="text-sm text-muted">
              Not the right answer — a <strong className="font-medium text-ink">different way of seeing</strong>.
            </p>
          </motion.div>

          {/* Visual reframe: paired rows with clear mapping */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mb-10"
          >
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_32px_1fr] items-center gap-2 mb-2 px-1">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">The usual question</span>
              <span />
              <span className="text-[10px] font-semibold text-emerald-700/70 uppercase tracking-widest">The reframe</span>
            </div>

            <div className="space-y-2.5">
              {reframePairs.map((pair, idx) => (
                <motion.div
                  key={pair.old}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.35 + idx * 0.12, ease: 'easeOut' }}
                  className="group grid grid-cols-[1fr_32px_1fr] items-stretch gap-2"
                >
                  {/* Old question */}
                  <div className="px-5 py-3.5 rounded-xl bg-black/[0.025] border border-black/5 transition-colors group-hover:border-black/10 flex items-center">
                    <p className="text-sm text-muted italic leading-relaxed">{pair.old}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-black/15 transition-colors duration-200 group-hover:text-ink/40" />
                  </div>

                  {/* Reframe */}
                  <div className="px-5 py-3.5 rounded-xl bg-sage/25 border border-sage/35 transition-colors duration-200 group-hover:bg-sage/40 group-hover:border-sage/50 flex items-center">
                    <p className="text-sm text-ink font-medium leading-relaxed">{pair.next}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA block — expectation strip merged in */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.75 }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-5 mb-5 text-muted">
              {[
                { icon: '✍️', text: 'Short reflections' },
                { icon: '✦', text: 'No right or wrong' },
                { icon: '⏱', text: '~2 min per step' },
              ].map((item, i) => (
                <div key={item.text} className="flex items-center gap-1.5">
                  <span className="text-xs">{item.icon}</span>
                  <span className="text-[11px] tracking-wide">{item.text}</span>
                  {i < 2 && <span className="text-black/10 ml-3">·</span>}
                </div>
              ))}
            </div>
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-white rounded-xl text-sm font-medium transition-all duration-200 hover:bg-ink/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
            >
              Begin
              <ArrowDown className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      {/* ─── SECTION 1 — Notice What You've Been Chasing ─── */}
      {currentSection === 1 && (
        <div className="animate-in fade-in">
          <div className="mb-2">
            <h2 className="font-serif text-2xl text-ink mb-1">
              Notice what you've been chasing
            </h2>
            <p className="text-sm text-muted">
              Select all that feel true for you right now.
            </p>
          </div>

          {/* Selectable cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 mb-3">
            {chasingOptions.map(option => (
              <button
                key={option.id}
                onClick={() => toggleChasing(option.id)}
                className={`group relative text-left px-5 py-5 rounded-xl border text-sm transition-all duration-200 ${
                  selectedChasing.includes(option.id)
                    ? 'border-ink bg-ink/[0.06] text-ink font-medium shadow-sm ring-1 ring-ink/10 scale-[1.01]'
                    : 'border-black/8 bg-white text-muted hover:border-black/15 hover:text-ink hover:shadow-sm'
                }`}
              >
                <span className={`absolute top-3.5 right-3.5 w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                  selectedChasing.includes(option.id)
                    ? 'border-ink bg-ink scale-100'
                    : 'border-black/15 bg-transparent group-hover:border-black/25'
                }`}>
                  {selectedChasing.includes(option.id) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="pr-7 block">{option.label}</span>
              </button>
            ))}
          </div>

          {/* Something else — separated lighter area */}
          <div className="mb-6">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
              chasingCustom
                ? 'border-ink/15 bg-ink/[0.03]'
                : 'border-transparent bg-black/[0.02]'
            }`}>
              <span className="text-[11px] text-muted shrink-0">Something else?</span>
              <input
                type="text"
                value={chasingCustom}
                onChange={e => setChasingCustom(e.target.value)}
                placeholder="Type your own..."
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-black/15"
              />
            </div>
          </div>

          {/* Reframe card — appears after selection */}
          {selectedChasing.length > 0 && (
            <div className="animate-in fade-in">
              <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm mb-8">
                {/* 3-step visual flow */}
                <div className="grid grid-cols-[1fr_24px_1fr_24px_1fr] items-start gap-1 mb-6">
                  {/* Step 1: what you selected */}
                  <div>
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest block mb-2">You selected</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedChasing.map(id => {
                        const opt = chasingOptions.find(o => o.id === id);
                        return (
                          <span key={id} className="inline-flex items-center px-2.5 py-1 rounded-full bg-ink/[0.06] text-xs text-ink font-medium">
                            {opt?.label.replace(/^I (want to |feel like |just need )/, '').replace(/^make a /, '').replace(/^more /, '')}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-center pt-6">
                    <ArrowRight className="w-3.5 h-3.5 text-black/15" />
                  </div>

                  {/* Step 2: looks like a goal */}
                  <div>
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest block mb-2">Feels like</span>
                    <p className="text-sm text-muted leading-relaxed">
                      {selectedChasing.length === 1 ? 'A clear goal' : 'Clear goals'}
                    </p>
                  </div>

                  <div className="flex items-center justify-center pt-6">
                    <ArrowRight className="w-3.5 h-3.5 text-black/15" />
                  </div>

                  {/* Step 3: might be an assumption */}
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-700/70 uppercase tracking-widest block mb-2">Might be</span>
                    <p className="text-sm text-ink font-medium leading-relaxed">
                      {selectedChasing.length === 1 ? 'An assumption' : 'Assumptions'} worth testing
                    </p>
                  </div>
                </div>

                {/* Key reframe line */}
                <div className="pt-5 border-t border-black/5">
                  <p className="text-sm text-ink leading-relaxed">
                    Designers pause and ask: <strong className="font-medium">"What problem am I actually solving?"</strong>
                  </p>
                  <p className="text-sm text-ink font-medium mt-3">
                    Let's examine {selectedChasing.length === 1 ? 'this belief' : 'these beliefs'} — one by one.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  Explore the first belief
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 2 — Branch 1: Reframe Impact ─── */}
      {currentSection === 2 && (
        <div className="animate-in fade-in">
          {/* Belief header + transition */}
          <div className="mb-8">
            <span className="inline-block text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-sage/30 border border-sage/40">
              Belief #1
            </span>
            <h2 className="font-serif text-2xl text-ink mb-2">
              "Meaning comes from making an impact"
            </h2>
            <p className="text-sm text-muted">
              Let's test this against your own experience.
            </p>
          </div>

          {/* Step-by-step reflection — collapsible after reveal */}
          {showImpactSummary ? (
            <div className="mb-6 rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
              {/* Summary + toggle header */}
              <button
                onClick={() => setStepsExpanded(!stepsExpanded)}
                className="w-full text-left px-5 py-4 hover:bg-black/[0.01] transition-colors"
              >
                <p className="text-sm text-muted leading-relaxed">
                  You make an impact through <span className="text-ink font-medium">{impactWhere.toLowerCase().replace(/\.$/, '')}</span>.
                  It feels <span className="text-ink font-medium">{impactFeel.toLowerCase().replace(/\.$/, '')}</span> —
                  {' '}but it lasts <span className="text-ink font-medium">{impactLast.toLowerCase().replace(/\.$/, '')}</span>.
                </p>
                <span className="flex items-center gap-1.5 mt-2 text-xs text-muted/60">
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${stepsExpanded ? 'rotate-180' : ''}`} />
                  {stepsExpanded ? 'Collapse' : 'Edit answers'}
                </span>
              </button>
              {stepsExpanded && (
                <div className="border-t border-black/5 px-5 py-4 space-y-4 animate-in fade-in">
                  <div className="p-4 rounded-xl border border-black/5 bg-black/[0.01]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-semibold flex items-center justify-center shrink-0">1</span>
                      <span className="text-sm text-ink font-medium">Where do you make the most impact?</span>
                    </div>
                    <input type="text" value={impactWhere} onChange={e => setImpactWhere(e.target.value)} placeholder="Work, family, community..." className="w-full bg-white border-0 rounded-lg px-4 py-3 text-sm text-ink outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ink/10 transition-all" />
                  </div>
                  <div className="p-4 rounded-xl border border-black/5 bg-black/[0.01]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-semibold flex items-center justify-center shrink-0">2</span>
                      <span className="text-sm text-ink font-medium">How does that feel?</span>
                    </div>
                    <input type="text" value={impactFeel} onChange={e => setImpactFeel(e.target.value)} placeholder="Proud, energized, drained..." className="w-full bg-white border-0 rounded-lg px-4 py-3 text-sm text-ink outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ink/10 transition-all" />
                  </div>
                  <div className="p-4 rounded-xl border border-black/5 bg-black/[0.01]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-semibold flex items-center justify-center shrink-0">3</span>
                      <span className="text-sm text-ink font-medium">How long does that feeling last?</span>
                    </div>
                    <div className="flex gap-6 items-center justify-center">
                      <div className="w-20 shrink-0">
                        <span className="text-[10px] text-muted uppercase tracking-widest block mb-2 text-center">Amount</span>
                        <ScrollWheel items={durationNumbers} value={impactDurationNum} onChange={setImpactDurationNum} />
                      </div>
                      <div className="w-20 shrink-0">
                        <span className="text-[10px] text-muted uppercase tracking-widest block mb-2 text-center">Unit</span>
                        <ScrollWheel items={durationUnits} value={impactDurationUnit} onChange={setImpactDurationUnit} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
          <div className="space-y-4 mb-6">
            {/* Step 1 — always visible */}
            <div className="p-5 rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-ink text-white text-[10px] font-semibold flex items-center justify-center shrink-0">1</span>
                <span className="text-sm text-ink font-medium">Where do you make the most impact?</span>
              </div>
              <input
                type="text"
                value={impactWhere}
                onChange={e => setImpactWhere(e.target.value)}
                placeholder="Work, family, community..."
                className="w-full bg-black/[0.015] border-0 rounded-lg px-4 py-3 text-sm text-ink outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ink/10 transition-all"
              />
            </div>

            {/* Step 2 — activates after step 1 */}
            <div className={`p-5 rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
              impactWhere ? 'border-black/5 opacity-100' : 'border-black/[0.03] opacity-40 pointer-events-none'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0 transition-colors ${
                  impactWhere ? 'bg-ink text-white' : 'bg-black/10 text-muted'
                }`}>2</span>
                <span className="text-sm text-ink font-medium">How does that feel?</span>
              </div>
              <input
                type="text"
                value={impactFeel}
                onChange={e => setImpactFeel(e.target.value)}
                placeholder="Proud, energized, drained..."
                className="w-full bg-black/[0.015] border-0 rounded-lg px-4 py-3 text-sm text-ink outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ink/10 transition-all"
              />
            </div>

            {/* Step 3 — activates after step 2 */}
            <div className={`p-5 rounded-2xl border bg-white shadow-sm transition-all duration-300 ${
              impactFeel ? 'border-black/5 opacity-100' : 'border-black/[0.03] opacity-40 pointer-events-none'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-5 h-5 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0 transition-colors ${
                  impactFeel ? 'bg-ink text-white' : 'bg-black/10 text-muted'
                }`}>3</span>
                <span className="text-sm text-ink font-medium">How long does that feeling last?</span>
              </div>

              {/* Duration picker: twin scroll wheels */}
              <div className="flex gap-6 items-center justify-center">
                {/* Number wheel */}
                <div className="w-20 shrink-0">
                  <span className="text-[10px] text-muted uppercase tracking-widest block mb-2 text-center">Amount</span>
                  <ScrollWheel items={durationNumbers} value={impactDurationNum} onChange={setImpactDurationNum} />
                </div>

                {/* Unit wheel */}
                <div className="w-20 shrink-0">
                  <span className="text-[10px] text-muted uppercase tracking-widest block mb-2 text-center">Unit</span>
                  <ScrollWheel items={durationUnits} value={impactDurationUnit} onChange={setImpactDurationUnit} />
                </div>
              </div>

              {/* Selected summary */}
              {impactLast && (
                <div className="mt-3 pt-3 border-t border-black/5">
                  <p className="text-xs text-muted">
                    The feeling lasts about <span className="text-ink font-medium">{impactLast}</span>.
                  </p>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Sequence hint — appears after step 2, before completing step 3 */}
          {!showImpactSummary && impactFeel && !impactLast && (
            <div className="animate-in fade-in flex items-center justify-center gap-3 py-3 mb-4">
              <span className="text-xs text-muted">impact</span>
              <ArrowRight className="w-3 h-3 text-black/15" />
              <span className="text-xs text-muted">a feeling</span>
              <ArrowRight className="w-3 h-3 text-black/15" />
              <span className="text-xs text-ink font-medium">…then what?</span>
            </div>
          )}

          {/* Payoff + Reveal */}
          {impactWhere && impactFeel && impactLast && (
            <div>
              <AnimatePresence mode="wait">
                {!showImpactSummary ? (
                  <motion.div
                    key="see-pattern"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={() => setShowImpactSummary(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage/20 border border-sage/30 text-sm text-ink font-medium hover:bg-sage/30 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-muted" />
                      See the pattern
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="space-y-6"
                  >
                    {/* Layer 1: Observation */}
                    <motion.p
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-sm text-muted text-center leading-relaxed"
                    >
                      The impact is real. But the feeling doesn't stay —<br />you keep needing the next one.
                    </motion.p>

                    {/* Layer 2: The reframe — page centerpiece */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.45 }}
                      className="py-8 px-6"
                    >
                      <span className="text-[10px] font-semibold text-muted uppercase tracking-widest block text-center mb-4">The reframe</span>
                      <p className="font-serif text-xl md:text-2xl text-ink text-center leading-snug">
                        Impact is a <em className="not-italic font-semibold">result</em> of how you live —<br className="hidden sm:block" />
                        not a stable source of meaning.
                      </p>
                    </motion.div>

                    {/* Layer 3: Old → New lens */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.75 }}
                      className="rounded-2xl border border-black/5 bg-white overflow-hidden"
                    >
                      <div className="px-5 py-3 flex items-center gap-3">
                        <span className="text-[10px] font-semibold text-muted/40 uppercase tracking-widest shrink-0">Old lens</span>
                        <p className="text-sm text-muted/40 italic line-through decoration-black/10">
                          "Meaning comes from making an impact."
                        </p>
                      </div>
                      <div className="h-px bg-black/5 mx-5" />
                      <div className="px-5 py-4 flex items-start gap-3">
                        <span className="text-[10px] font-semibold text-ink uppercase tracking-widest shrink-0 mt-0.5">New lens</span>
                        <p className="font-serif text-base text-ink italic leading-relaxed">
                          "Impact is something I create — not something I chase for meaning."
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 1.0 }}
                      className="flex justify-end pt-2"
                    >
                      <button
                        onClick={goNext}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        Next belief
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 3 — Branch 2: Reframe Fulfillment ─── */}
      {currentSection === 3 && (
        <div className="animate-in fade-in">
          <div className="mb-8">
            <span className="inline-block text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-sage/30 border border-sage/40">
              Belief #2
            </span>
            <h2 className="font-serif text-2xl text-ink mb-2">
              "I need to find my true purpose to feel fulfilled"
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Let's look at what fulfillment actually asks of you.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm mb-6">
            <p className="text-sm text-ink mb-1.5">
              Is there any single role or path that can fully express everything you are?
            </p>
            <p className="text-xs text-muted mb-4">
              Think about your roles, interests, contradictions — can one path hold them all?
            </p>
            <input
              type="text"
              value={fulfillmentAnswer}
              onChange={e => setFulfillmentAnswer(e.target.value)}
              placeholder="e.g. creator, parent, adventurer, caretaker…"
              className="w-full bg-black/[0.015] border-0 rounded-lg px-4 py-3 text-sm text-ink outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ink/10 transition-all"
            />
          </div>

          {fulfillmentAnswer && !showFulfillmentInsight && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowFulfillmentInsight(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage/20 border border-sage/30 text-sm text-ink font-medium hover:bg-sage/30 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-muted" />
                See what this suggests
              </button>
            </div>
          )}

          {showFulfillmentInsight && (
            <AnimatePresence mode="wait">
              <motion.div
                key="fulfillment-reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Transition from input */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-xs text-muted text-center uppercase tracking-widest"
                >
                  From your reflection…
                </motion.p>

                {/* Roles visual + insight — merged block */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {['Creator', 'Parent', 'Friend', 'Learner', 'Dreamer'].map((role, i) => (
                      <span
                        key={role}
                        className="px-3 py-1.5 rounded-full border border-sage/40 bg-sage/10 text-[10px] text-ink font-medium"
                        style={{ opacity: 0.45 + i * 0.14 }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    You contain more identities than any single path can hold.
                  </p>
                </motion.div>

                {/* Hero reframe — page centerpiece */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="py-8 px-6"
                >
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-widest block text-center mb-4">The reframe</span>
                  <p className="font-serif text-xl md:text-2xl text-ink text-center leading-snug">
                    No single life can contain all parts of you.<br className="hidden sm:block" />
                    Completeness is not the goal.
                  </p>
                </motion.div>

                {/* Old → New lens */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="rounded-2xl border border-black/5 bg-white overflow-hidden"
                >
                  <div className="px-5 py-3 flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-muted/40 uppercase tracking-widest shrink-0">Old lens</span>
                    <p className="text-sm text-muted/40 italic line-through decoration-black/10">
                      "I need to find my one true purpose."
                    </p>
                  </div>
                  <div className="h-px bg-black/5 mx-5" />
                  <div className="px-5 py-4 flex items-start gap-3">
                    <span className="text-[10px] font-semibold text-ink uppercase tracking-widest shrink-0 mt-0.5">New lens</span>
                    <p className="font-serif text-base text-ink italic leading-relaxed">
                      "I can't become everything I am — but I can be fully alive right now."
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.0 }}
                  className="flex justify-end pt-2"
                >
                  <button
                    onClick={goNext}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Last belief
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* ─── SECTION 4 — Branch 3: Reframe "More" ─── */}
      {currentSection === 4 && (
        <div className="animate-in fade-in">
          <div className="mb-8">
            <span className="inline-block text-[10px] font-semibold text-muted uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-sage/30 border border-sage/40">
              Belief #3
            </span>
            <h2 className="font-serif text-2xl text-ink mb-2">
              "I just need more — and then it will feel right"
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              More success, time, clarity. The logic feels sound — but does it hold up?
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm mb-6">
            <p className="text-sm text-ink mb-1.5">
              If you had more of what you think you need — would it ever be <em>enough</em>?
            </p>
            <p className="text-xs text-muted mb-4">
              Be honest. What does your experience tell you?
            </p>
            <input
              type="text"
              value={moreAnswer}
              onChange={e => setMoreAnswer(e.target.value)}
              placeholder="e.g. probably not, the bar keeps moving…"
              className="w-full bg-black/[0.015] border-0 rounded-lg px-4 py-3 text-sm text-ink outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ink/10 transition-all"
            />
          </div>

          {moreAnswer && !showMoreInsight && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowMoreInsight(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage/20 border border-sage/30 text-sm text-ink font-medium hover:bg-sage/30 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-muted" />
                See the pattern
              </button>
            </div>
          )}

          {showMoreInsight && (
            <AnimatePresence mode="wait">
              <motion.div
                key="more-reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Transition */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-xs text-muted text-center uppercase tracking-widest"
                >
                  From your reflection…
                </motion.p>

                {/* Compressed observation */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="text-sm text-muted text-center leading-relaxed"
                >
                  "More" keeps moving. Every time you arrive, the goalpost shifts.
                </motion.p>

                {/* Hero reframe — page centerpiece */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="py-8 px-6"
                >
                  <span className="text-[10px] font-semibold text-muted uppercase tracking-widest block text-center mb-4">The reframe</span>
                  <p className="font-serif text-xl md:text-2xl text-ink text-center leading-snug">
                    Meaning shows up in moments —<br className="hidden sm:block" />
                    not in "more."
                  </p>
                </motion.div>

                {/* Old → New lens */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="rounded-2xl border border-black/5 bg-white overflow-hidden"
                >
                  <div className="px-5 py-3 flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-muted/40 uppercase tracking-widest shrink-0">Old lens</span>
                    <p className="text-sm text-muted/40 italic line-through decoration-black/10">
                      "I need more to feel fulfilled."
                    </p>
                  </div>
                  <div className="h-px bg-black/5 mx-5" />
                  <div className="px-5 py-4 flex items-start gap-3">
                    <span className="text-[10px] font-semibold text-ink uppercase tracking-widest shrink-0 mt-0.5">New lens</span>
                    <p className="font-serif text-base text-ink italic leading-relaxed">
                      "What's already here might be enough — if I learn to see it."
                    </p>
                  </div>
                </motion.div>

                {/* Optional reflection — collapsible, lightweight */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.0 }}
                >
                  <details className="group rounded-2xl border border-black/5 bg-white overflow-hidden">
                    <summary className="px-5 py-3.5 flex items-center justify-between cursor-pointer text-sm text-muted hover:bg-black/[0.01] transition-colors">
                      <span>Optional: two questions to sit with</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted/50 group-open:rotate-180 transition-transform duration-200" />
                    </summary>
                    <div className="px-5 pb-5 pt-2 space-y-4 border-t border-black/5">
                      <div>
                        <p className="text-sm text-ink mb-2">What feels meaningful in your life right now?</p>
                        <input
                          type="text"
                          value={momentAnswer}
                          onChange={e => setMomentAnswer(e.target.value)}
                          placeholder="It doesn't have to be big…"
                          className="w-full bg-black/[0.015] border-0 rounded-lg px-4 py-3 text-sm text-ink outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ink/10 transition-all"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-ink mb-2">What's already here that you might not be seeing?</p>
                        <input
                          type="text"
                          value={alreadyHereAnswer}
                          onChange={e => setAlreadyHereAnswer(e.target.value)}
                          placeholder="Something quiet, something taken for granted…"
                          className="w-full bg-black/[0.015] border-0 rounded-lg px-4 py-3 text-sm text-ink outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ink/10 transition-all"
                        />
                      </div>
                    </div>
                  </details>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  className="flex justify-end pt-2"
                >
                  <button
                    onClick={goNext}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    See the full picture
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* ─── SECTION 5 — Summary (Before / After) ─── */}
      {currentSection === 5 && (
        <div className="animate-in fade-in">
          <div className="mb-8">
            <h2 className="font-serif text-2xl text-ink mb-2">
              Three beliefs, reframed
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Here's what shifted across this module.
            </p>
          </div>

          {/* Before / After cards */}
          <div className="space-y-4 mb-8">
            {[
              {
                before: 'Meaning comes from impact',
                after: 'Impact is a result, not meaning itself',
              },
              {
                before: 'I need to find my one true purpose',
                after: 'You can\'t become everything you are — but you can be fully alive now',
              },
              {
                before: 'I need more to feel fulfilled',
                after: 'Meaning shows up in moments, not in "more"',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-widest block mb-2">Before</span>
                    <p className="font-serif text-base text-muted/70 italic line-through decoration-black/10">
                      {item.before}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest block mb-2">After</span>
                    <p className="font-serif text-base text-ink italic">
                      {item.after}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Closing line */}
          <div className="p-8 rounded-2xl bg-ink/[0.03] border border-black/5 mb-8">
            <p className="font-serif text-xl text-ink text-center leading-relaxed">
              You don't need a different life.<br />
              You need a different way of seeing your current life.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Continue
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── SECTION 6 — Forward Bridge ─── */}
      {currentSection === 6 && (
        <div className="animate-in fade-in">
          <div className="p-8 rounded-2xl bg-ink text-white mb-8">
            <p className="font-serif text-2xl leading-relaxed mb-6">
              If meaning is already here, the question becomes:
            </p>
            <p className="font-serif text-xl text-white/90 italic mb-8">
              "How do I notice it more often?"
            </p>
            <div className="space-y-3 text-sm text-white/70 leading-relaxed mb-8">
              <p>
                In the next module, you'll start observing patterns in your everyday life — the moments where meaning appears and the moments where it doesn't.
              </p>
              <p>
                You'll begin designing for meaningful moments, instead of chasing them.
              </p>
            </div>

            <button
              onClick={saveAndContinue}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink rounded-xl text-sm font-medium hover:bg-white/90 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
            >
              {saving ? 'Saving your reflections...' : 'Save Reflections & Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
