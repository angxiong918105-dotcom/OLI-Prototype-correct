import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import {
  onboardingPathPlans as pathPlans,
  useOnboarding,
  type OnboardingPath,
} from '../context/OnboardingContext';

export type { OnboardingPath };

const interestOptions: {
  id: OnboardingPath;
  label: string;
  sub: string;
}[] = [
  {
    id: 'flow',
    label: 'Discovering flow in everyday moments',
    sub: 'Bring presence and meaning to ordinary activities.',
  },
  {
    id: 'coherency',
    label: 'Creating a more coherent life',
    sub: 'Align your values, actions, and direction.',
  },
  {
    id: 'both',
    label: 'Both',
    sub: 'Explore the full course.',
  },
];

const loopSteps = [
  { n: 1, text: 'Complete a module' },
  { n: 2, text: 'Try your meaning design in real life' },
  { n: 3, text: 'Write a short journal' },
  { n: 4, text: 'Unlock the next module' },
];

const TOTAL_STEPS = 4;

/* ─── Props ─────────────────────────────────────────────────────── */

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onFinish: (path: OnboardingPath) => void;
}

/* ─── Main modal ────────────────────────────────────────────────── */

export default function OnboardingModal({
  open,
  onClose,
  onFinish,
}: OnboardingModalProps) {
  const { path, setPath } = useOnboarding();
  const [step, setStep] = useState(1);
  const [interest, setInterest] = useState<OnboardingPath | null>(null);

  // Restore previous choice when opening
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setInterest(path);
  }, [open, path]);

  // Persist interest choice as soon as it's picked
  useEffect(() => {
    if (!interest) return;
    setPath(interest);
  }, [interest, setPath]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const canAdvance = useMemo(() => {
    if (step === 1) return !!interest;
    return true;
  }, [step, interest]);

  const handleNext = () => {
    if (!canAdvance) return;
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
      return;
    }
    if (interest) onFinish(interest);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-black/[0.06] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Top bar: step dots + close */}
            <div className="flex items-center justify-between px-6 pt-5">
              <StepDots current={step} total={TOTAL_STEPS} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close onboarding"
                className="w-8 h-8 rounded-full text-muted hover:text-ink hover:bg-black/[0.04] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step content */}
            <div className="px-8 pt-4 pb-2 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {step === 1 && (
                    <StepOne value={interest} onChange={setInterest} />
                  )}
                  {step === 2 && interest && <StepTwo path={interest} />}
                  {step === 3 && <StepThree />}
                  {step === 4 && <StepFour />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer: back + CTA */}
            <div className="flex items-center justify-between px-8 py-5 border-t border-black/[0.05] bg-white">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-paper text-sm font-medium transition-all hover:bg-ink/85 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {step === 1 && 'Continue'}
                {step === 2 && 'Continue'}
                {step === 3 && 'Got it'}
                {step === 4 && 'Start learning'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Step dots ─────────────────────────────────────────────────── */

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        return (
          <span
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === current
                ? 'w-6 bg-ink'
                : idx < current
                  ? 'w-3 bg-ink/40'
                  : 'w-3 bg-black/10'
            }`}
          />
        );
      })}
    </div>
  );
}

/* ─── Step 1: Interest selection ────────────────────────────────── */

function StepOne({
  value,
  onChange,
}: {
  value: OnboardingPath | null;
  onChange: (v: OnboardingPath) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-ink leading-snug">
          What interests you the most?
        </h2>
        <p className="text-sm text-muted mt-1">Pick the one that fits right now.</p>
      </div>

      <div className="space-y-2.5">
        {interestOptions.map(opt => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all ${
                selected
                  ? 'border-ink bg-ink/[0.03]'
                  : 'border-black/10 bg-white hover:border-ink/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors ${
                    selected ? 'border-ink bg-ink' : 'border-black/25 bg-white'
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${selected ? 'text-ink font-medium' : 'text-ink/80'}`}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{opt.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 2: Personalized path ─────────────────────────────────── */

function StepTwo({ path }: { path: OnboardingPath }) {
  const plan = pathPlans[path];
  const label =
    path === 'flow'
      ? 'Flow path'
      : path === 'coherency'
        ? 'Coherency path'
        : 'Combined path';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-ink leading-snug">Your path</h2>
        <p className="text-sm text-muted mt-1">
          Here's how your journey is shaped.
        </p>
      </div>

      <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] px-5 py-5">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
          {label}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {plan.map((mod, i) => (
            <div key={mod} className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-3 py-1.5">
                <span className="w-5 h-5 rounded-full bg-ink text-paper text-[10px] font-semibold flex items-center justify-center">
                  {mod}
                </span>
                <span className="text-xs font-medium text-ink">Module {mod}</span>
              </div>
              {i < plan.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-muted" />
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted italic">
        You can change direction later. Nothing is locked in.
      </p>
    </div>
  );
}

/* ─── Step 3: How it works ──────────────────────────────────────── */

function StepThree() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-ink leading-snug">
          How this course works
        </h2>
        <p className="text-sm text-muted mt-1">A simple loop, one module at a time.</p>
      </div>

      <LoopDiagram />

      <div className="flex items-start gap-2 text-xs text-muted">
        <Check className="w-3.5 h-3.5 mt-0.5 text-[#6B8F6E] flex-shrink-0" />
        <p>The next module unlocks once your journal is written.</p>
      </div>
    </div>
  );
}

function LoopDiagram() {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-black/[0.02] px-4 pt-10 pb-4">
      <div className="relative">
        {/* Loop-back arrow above the row */}
        <svg
          viewBox="0 0 400 40"
          preserveAspectRatio="none"
          className="absolute -top-8 left-0 w-full h-8 text-ink/25"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="loop-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>
          <path
            d="M 350 36 C 350 0, 50 0, 50 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            markerEnd="url(#loop-arrow)"
          />
        </svg>

        <div className="grid grid-cols-4 gap-2 relative">
          {/* Forward arrows between steps */}
          <svg
            viewBox="0 0 400 12"
            preserveAspectRatio="none"
            className="absolute left-0 right-0 top-[14px] w-full h-3 text-ink/25 pointer-events-none"
            aria-hidden="true"
          >
            {[0, 1, 2].map(i => {
              const startX = 50 + i * 100 + 18;
              const endX = 50 + (i + 1) * 100 - 18;
              return (
                <line
                  key={i}
                  x1={startX}
                  y1={6}
                  x2={endX}
                  y2={6}
                  stroke="currentColor"
                  strokeWidth="1.25"
                  markerEnd="url(#loop-arrow)"
                />
              );
            })}
          </svg>

          {loopSteps.map(s => (
            <div key={s.n} className="flex flex-col items-center text-center">
              <div className="relative z-10 w-9 h-9 rounded-full bg-white border border-ink/20 text-ink text-sm font-semibold flex items-center justify-center">
                {s.n}
              </div>
              <p className="mt-3 text-[11px] font-medium text-ink/80 leading-snug">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 4: Tone setting ──────────────────────────────────────── */

function StepFour() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl text-ink leading-snug">
          Take your time
        </h2>
      </div>

      <div className="text-[15px] text-ink/85 leading-relaxed">
        <p>Take your own pace, and enjoy the course!</p>
      </div>
    </div>
  );
}
