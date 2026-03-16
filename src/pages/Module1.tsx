import { useState } from 'react';
import { ArrowRight, ArrowDown, HelpCircle, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';

const signals = [
  'My days feel repetitive',
  'I often feel busy but not fulfilled',
  'I compare my life with others',
  'I sometimes feel something is missing',
];

const wickedExamples = [
  { label: 'Designing cities', icon: '🏙' },
  { label: 'Climate change', icon: '🌍' },
  { label: 'Building a meaningful life', icon: '✦' },
];

const sections = ['Check-In', 'Stories & Reflection', 'Wicked Problems', 'Design Mindset'];

type FlipCardProps = {
  initial: string;
  name: string;
  identityLine: string;
  secondaryLine: string;
  frontQuote: string;
  backSections: { header: string; bullets: string[] }[];
  backQuote: string;
};

function FlipCard({ initial, name, identityLine, secondaryLine, frontQuote, backSections, backQuote }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flip-card cursor-pointer ${flipped ? 'flipped' : ''}`}
      onClick={() => setFlipped(!flipped)}
      style={{ minHeight: 420 }}
    >
      <div className="flip-card-inner">
        {/* Front */}
        <div className="flip-card-front p-8 rounded-2xl border border-black/5 bg-white shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center text-base font-medium text-ink shrink-0">
              {initial}
            </div>
            <div>
              <span className="text-sm font-medium text-ink">{name}</span>
              <p className="text-xs text-muted">{identityLine}</p>
            </div>
          </div>
          <p className="text-xs text-muted mb-5">{secondaryLine}</p>
          <p className="font-serif text-xl text-ink italic leading-relaxed flex-1">
            "{frontQuote}"
          </p>
          <span className="text-[10px] text-muted uppercase tracking-widest mt-4">
            Tap to see more
          </span>
        </div>

        {/* Back */}
        <div className="flip-card-back p-8 rounded-2xl border border-black/5 bg-white shadow-sm flex flex-col overflow-y-auto">
          {backSections.map(section => (
            <div key={section.header} className="mb-4">
              <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">{section.header}</p>
              <ul className="space-y-1.5">
                {section.bullets.map(b => (
                  <li key={b} className="text-xs text-ink leading-relaxed flex gap-2">
                    <span className="text-muted mt-0.5 shrink-0">·</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="font-serif text-sm text-ink italic leading-relaxed mt-auto pt-3 border-t border-black/5">
            "{backQuote}"
          </p>
          <span className="text-[10px] text-muted uppercase tracking-widest mt-3">
            Tap to flip back
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Module1() {
  const [sliderValue, setSliderValue] = useState(50);
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [customSignal, setCustomSignal] = useState('');
  const [wickedAnswer, setWickedAnswer] = useState<'A' | 'B' | null>(null);
  const [storyChoice, setStoryChoice] = useState<'allison' | 'sonya' | 'both' | null>(null);
  const [storyNote, setStoryNote] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { addEntry } = useJournal();

  const saveReflectionAndContinue = async () => {
    setSaving(true);
    const allSignals = [...selectedSignals];
    if (customSignal.trim()) allSignals.push(customSignal.trim());

    await addEntry({
      moduleId: 'intro',
      moduleTitle: 'Meaning as Design',
      meaningRating: sliderValue,
      selectedSignals: allSignals,
      reflectionText: storyNote || undefined,
    });

    navigate('/');
  };

  const toggleSignal = (signal: string) => {
    setSelectedSignals(prev =>
      prev.includes(signal) ? prev.filter(s => s !== signal) : [...prev, signal]
    );
  };

  const goNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-16 px-8">
      {/* Module Header */}
      <div className="mb-6">
        <span className="text-xs font-medium text-muted uppercase tracking-widest">Module 1</span>
        <h1 className="font-serif text-4xl mt-2 text-ink">Meaning as a Design Problem</h1>
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

      {/* SECTION 1 — Check-In */}
      {currentSection === 0 && (
        <div className="animate-in fade-in">
          <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm">
            <h2 className="font-serif text-2xl text-ink mb-10">
              How would you rate your current sense of meaning and purpose?
            </h2>

            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={100}
                value={sliderValue}
                onChange={e => setSliderValue(Number(e.target.value))}
                className="w-full h-1.5 bg-black/5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-ink
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-sm
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110"
              />
            </div>

            <div className="flex justify-between text-xs text-muted">
              <span>Just getting through the days</span>
              <span>A strong sense of meaning and purpose</span>
            </div>

            <div className="mt-10 pt-8 border-t border-black/5">
              <h3 className="font-serif text-xl text-ink mb-2">Do any of these feel familiar?</h3>
              <p className="text-sm text-muted mb-6">
                These are common signals people notice when they start questioning meaning or purpose in their lives.
              </p>

              <div className="space-y-3">
                {signals.map(signal => (
                  <button
                    key={signal}
                    onClick={() => toggleSignal(signal)}
                    className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${
                      selectedSignals.includes(signal)
                        ? 'border-ink bg-ink/5 text-ink font-medium'
                        : 'border-black/5 bg-white/50 text-muted hover:border-black/10 hover:text-ink'
                    }`}
                  >
                    {signal}
                  </button>
                ))}

                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border transition-all ${
                  customSignal
                    ? 'border-ink bg-ink/5'
                    : 'border-black/5 bg-white/50'
                }`}>
                  <span className="text-sm text-muted shrink-0">Other:</span>
                  <input
                    type="text"
                    value={customSignal}
                    onChange={e => setCustomSignal(e.target.value)}
                    placeholder="Type your own..."
                    className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-black/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
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

      {/* SECTION 2 — Stories (Flip Cards) */}
      {currentSection === 1 && (
        <div className="animate-in fade-in">
          <div className="mb-8">
            <h2 className="font-serif text-2xl text-ink mb-2">
              You're not alone in this
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Many people who seem to have everything figured out still feel that something is off.
              <br />
              Here are two real cases from Burnett and Evans's book.
            </p>
          </div>

          {/* Flip Cards — Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <FlipCard
              initial="A"
              name="Allison"
              identityLine="Accountant · Married · Two kids"
              secondaryLine="Stable job · Comfortable life"
              frontQuote="My life was perfectly fine. But fine didn't feel like enough."
              backSections={[
                {
                  header: 'What her life looked like',
                  bullets: [
                    'Accountant managing many small-business clients',
                    'Stable income and comfortable family life',
                    'Busy routine centered on work and home',
                  ],
                },
                {
                  header: 'What she started to feel',
                  bullets: [
                    'Life felt repetitive and emotionally flat',
                    'She kept wondering why "fine" didn\'t feel like enough',
                    'She felt guilty for being dissatisfied',
                  ],
                },
              ]}
              backQuote="I should feel grateful... but I keep wondering: What's missing?"
            />

            <FlipCard
              initial="S"
              name="Sonya"
              identityLine="Software engineer · Big Tech"
              secondaryLine="High salary · Product used by millions"
              frontQuote="I know I should be happy... but it's just not working for me."
              backSections={[
                {
                  header: 'What her life looked like',
                  bullets: [
                    'Computer science graduate at a major tech company',
                    'Writing code used by millions of people',
                    'Strong salary, security, and career status',
                  ],
                },
                {
                  header: 'What she started to feel',
                  bullets: [
                    'Her work felt strangely empty',
                    'She wanted more meaning, not more money or status',
                    'She felt uncomfortable admitting something was off',
                  ],
                },
              ]}
              backQuote="It feels like there should be more to work and life than this. I just don't know where to find it."
            />
          </div>

          {/* Transition into wicked problems */}
          <div className="px-1 mb-6">
            <p className="text-sm text-muted leading-relaxed">
              What Allison and Sonya experienced is not unusual. Many people reach a point where the standard answers — work harder, be grateful, find your passion — don't quite fit. That's not a personal failure. It's a sign that meaning is a different kind of problem.
            </p>
          </div>

          {/* Self-explanation reflection */}
          <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm mb-8">
            <h3 className="font-serif text-xl text-ink mb-1">
              Which story feels closer to your current experience — and why?
            </h3>
            <p className="text-sm text-muted mb-6">
              Take a moment to notice what resonates with you in these stories.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { id: 'allison', label: 'Mostly like Allison' },
                { id: 'sonya', label: 'Mostly like Sonya' },
                { id: 'both', label: 'A bit of both' },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setStoryChoice(option.id as 'allison' | 'sonya' | 'both')}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${
                    storyChoice === option.id
                      ? 'border-ink bg-ink/5 text-ink font-medium'
                      : 'border-black/5 bg-white/50 text-muted hover:border-black/10 hover:text-ink'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {storyChoice && (
              <div className="pt-6 border-t border-black/5">
                <p className="text-sm text-muted mb-3">
                  What about this story feels familiar to you?
                </p>
                <textarea
                  value={storyNote}
                  onChange={e => setStoryNote(e.target.value)}
                  placeholder="No need for a full answer — a few words is enough."
                  rows={3}
                  className="w-full bg-black/[0.02] border border-black/5 rounded-xl px-4 py-3 text-sm text-ink outline-none resize-none placeholder:text-black/20 focus:border-black/10 transition-colors"
                />
              </div>
            )}
          </div>

          {storyChoice && (
            <div className="flex justify-end">
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Continue
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3 — Wicked Problems */}
      {currentSection === 2 && (
        <div className="animate-in fade-in">
          <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm">
            <h2 className="font-serif text-2xl text-ink mb-2">
              Meaning could be a wicked problem
            </h2>
            <p className="text-sm text-muted mb-8">
              Designers use the term <strong className="font-medium text-ink">wicked problem</strong> for challenges that can't be solved by analysis alone. Wicked problems refer to:
            </p>

            {/* Wicked problem traits */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-ink/[0.02] border border-black/5">
                <HelpCircle className="w-4 h-4 text-muted shrink-0" />
                <span className="text-sm text-ink">There's no single correct answer</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-ink/[0.02] border border-black/5">
                <HelpCircle className="w-4 h-4 text-muted shrink-0" />
                <span className="text-sm text-ink">No clear path to follow</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-ink/[0.02] border border-black/5">
                <HelpCircle className="w-4 h-4 text-muted shrink-0" />
                <span className="text-sm text-ink">No formula that works for everyone</span>
              </div>
            </div>

            {/* Examples */}
            <div className="flex items-center gap-3 mb-8">
              {wickedExamples.map(ex => (
                <div key={ex.label} className="flex-1 text-center py-4 px-3 rounded-xl bg-sage/20 border border-sage/30">
                  <span className="block text-lg mb-1">{ex.icon}</span>
                  <span className="text-xs text-ink font-medium">{ex.label}</span>
                </div>
              ))}
            </div>

            {/* Interactive question */}
            <div className="pt-8 border-t border-black/5">
              <h3 className="font-serif text-xl text-ink mb-2">
                How do designers approach wicked problems?
              </h3>
              <p className="text-sm text-muted mb-6">Pick the approach that designers tend to use.</p>

              <div className="space-y-3">
                <button
                  onClick={() => setWickedAnswer('A')}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${
                    wickedAnswer === 'A'
                      ? 'border-ink bg-ink/5 text-ink font-medium'
                      : 'border-black/5 bg-white/50 text-muted hover:border-black/10 hover:text-ink'
                  }`}
                >
                  <span className="font-medium text-ink mr-2">A.</span>
                  Keep thinking until the right answer becomes clear
                </button>
                <button
                  onClick={() => setWickedAnswer('B')}
                  className={`w-full text-left px-5 py-4 rounded-xl border text-sm transition-all ${
                    wickedAnswer === 'B'
                      ? 'border-ink bg-ink/5 text-ink font-medium'
                      : 'border-black/5 bg-white/50 text-muted hover:border-black/10 hover:text-ink'
                  }`}
                >
                  <span className="font-medium text-ink mr-2">B.</span>
                  Run small experiments and learn from what happens
                </button>
              </div>

              {/* Feedback */}
              {wickedAnswer === 'B' && (
                <div className="mt-6 p-5 rounded-xl bg-sage/20 border border-sage/30 flex items-start gap-3">
                  <FlaskConical className="w-4 h-4 text-ink/50 mt-0.5 shrink-0" />
                  <p className="text-sm text-ink leading-relaxed">
                    <strong className="font-medium">That's it.</strong> When a problem has no single answer, designers don't try to solve it by thinking harder. They explore it through experiments.
                  </p>
                </div>
              )}

              {wickedAnswer === 'A' && (
                <div className="mt-6 p-5 rounded-xl bg-ink/[0.02] border border-black/5 flex items-start gap-3">
                  <FlaskConical className="w-4 h-4 text-muted mt-0.5 shrink-0" />
                  <p className="text-sm text-muted leading-relaxed">
                    That feels natural — but when a problem has no single answer, designers don't try to solve it by thinking harder. They explore it through <strong className="font-medium text-ink">experiments</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {wickedAnswer && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Continue
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4 — Design Mindset */}
      {currentSection === 3 && (
        <div className="animate-in fade-in">
          {/* Title & Intro */}
          <div className="mb-10">
            <h2 className="font-serif text-2xl text-ink mb-5">Designing Meaning</h2>
            <div className="space-y-4 text-sm text-muted leading-relaxed">
              <p>If meaning is a wicked problem, trying to solve it by thinking alone often leaves people feeling stuck.</p>
              <p>Designers approach these kinds of problems differently. Instead of waiting until the right answer becomes clear, they move forward through action. They try small experiments, observe what happens, and adjust based on what they learn.</p>
            </div>
          </div>

          {/* Book framing */}
          <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm mb-8">
            <p className="font-serif text-2xl text-ink mb-4">Book Framing</p>
            <p className="text-sm text-ink leading-relaxed mb-4">
              This course draws from the book <em>How to Live a Meaningful Life: Using Design Thinking to Unlock Purpose, Joy, and Flow Every Day</em> by Bill Burnett and Dave Evans.
            </p>
            <p className="text-sm text-muted italic mb-4">"This is a design book.<br />For designers.<br />To make things.<br />And you are a designer."</p>
            <p className="text-sm text-ink leading-relaxed mb-4">
              This module is not based on a philosophy book, a psychology book, a spirituality book, a mindfulness manual, or an inspirational guide.
            </p>
            <p className="text-sm text-ink leading-relaxed">
              Instead, these modules introduce ideas and design tools you can try in real life. The goal is simple: to help you become more effective at creating meaning in your everyday life.
            </p>
          </div>

          {/* Transition + Design Cycle */}
          <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm mb-8">
            <p className="font-serif text-2xl text-ink mb-6">The Design Cycle</p>
            <div className="text-sm text-ink leading-relaxed space-y-4 mb-8">
              <p>Designers work through an iterative process of observation, experimentation, and learning. Rather than trying to discover meaning through analysis alone, they build their way forward.</p>
              <p>This process is shown in the Meaning Design Cycle below.</p>
            </div>
            <div className="flex items-center justify-between gap-1">
              {[
                { step: 'Aware', icon: '👁', desc: 'Notice signals in your life' },
                { step: 'Reframe', icon: '🔄', desc: 'Ask a different question' },
                { step: 'Ideate', icon: '💡', desc: 'Generate possibilities' },
                { step: 'Prototype', icon: '🔧', desc: 'Try a small experiment' },
                { step: 'Test', icon: '🧪', desc: 'See what you learn' },
                { step: 'Iterate', icon: '🔁', desc: 'Adjust and try again' },
              ].map((item, idx, arr) => (
                <div key={item.step} className="flex items-center gap-1">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-sage/30 border border-sage/40 flex items-center justify-center text-lg mb-2">
                      {item.icon}
                    </div>
                    <span className="text-xs font-medium text-ink">{item.step}</span>
                    <span className="text-[10px] text-muted mt-0.5 leading-tight max-w-[56px]">{item.desc}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-black/20 shrink-0 -mt-6" />
                  )}
                </div>
              ))}
            </div>
            {/* Cycle arrow back */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted">
              <div className="h-px flex-1 bg-black/10" />
              <span className="px-3">↺ repeat until meaningful</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>
          </div>

          {/* The shift */}
          <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm mb-8">
            <p className="font-serif text-2xl text-ink mb-4">The Shift</p>
            <p className="text-sm text-ink leading-relaxed mb-6">Design thinking introduces a simple but important shift.</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-black/[0.02] border border-black/5">
                <span className="text-xs font-medium text-muted uppercase tracking-widest mt-0.5 shrink-0">Before</span>
                <p className="font-serif text-lg text-muted/70 italic">"What is my purpose?"</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowDown className="w-4 h-4 text-black/20" />
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-sage/20 border border-sage/30">
                <span className="text-xs font-medium text-emerald-700 uppercase tracking-widest mt-0.5 shrink-0">After</span>
                <p className="font-serif text-lg text-ink italic">"What possibilities could I test next?"</p>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Instead of waiting for the perfect answer, designers explore meaning through small experiments in real life.
              </p>
            </div>
          </div>

          {/* Transition message + CTA */}
          <div className="p-8 rounded-2xl bg-ink text-white">
            <p className="font-serif text-xl leading-relaxed mb-4">
              In the next modules, you will start using these design tools to explore meaning in your own life.
            </p>
            <div className="space-y-3 text-sm text-white/80 leading-relaxed mb-8">
              <p>The first step in the design process is awareness.</p>
              <p>So we will begin by noticing patterns and signals in your everyday experiences.</p>
            </div>
            <button
              onClick={saveReflectionAndContinue}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink rounded-xl text-sm font-medium hover:bg-white/90 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
            >
              {saving ? 'Saving your reflection...' : 'Save Reflection & Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
