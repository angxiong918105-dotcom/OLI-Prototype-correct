import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';

type GlassKey = 'normal' | 'curiosity' | 'wonder';

type GlassCard = {
  id: GlassKey;
  icon: string;
  label: string;
  question: string;
  description: string;
  image: string;
  callout?: string;
};

type ThoughtCard = {
  id: string;
  text: string;
  target: GlassKey;
};

type ConceptOption = {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  correct: boolean;
};

type ThreeGlassesModulePageProps = {
  onContinue?: () => void;
};

const glassCards: GlassCard[] = [
  {
    id: 'normal',
    icon: '🥽',
    label: 'Normal Glasses',
    question: '"What do I need to do here?"',
    description:
      "You see tasks, to-dos, problems to solve. You're in the transactional world, oriented toward the future.",
    image: '/normal glass.png',
  },
  {
    id: 'curiosity',
    icon: '🔍',
    label: 'Curiosity Glasses',
    question: '"Hmmm — what more is there to see?"',
    description:
      "You start noticing things as they actually are. Details. Patterns. Small surprises. You're shifting toward the flow world.",
    image: '/curiosity glass.png',
  },
  {
    id: 'wonder',
    icon: '✨',
    label: 'Wonder Glasses',
    question: '"There\'s something wonderful here — what is it?"',
    description:
      "If you push curiosity far enough, something will shift. You encounter mystery. Mystery is a sense that you're touching something much larger than you can fully grasp. That's wonder.",
    image: '/wonder glass.png',
  },
];

const thoughts: ThoughtCard[] = [
  { id: 't1', text: 'I need to finish this before noon.', target: 'normal' },
  {
    id: 't2',
    text: 'How does this fabric hold its shape like that?',
    target: 'curiosity',
  },
  {
    id: 't3',
    text: 'I had no idea something this small could be this intricate.',
    target: 'wonder',
  },
  { id: 't4', text: 'I should reply to those emails after this.', target: 'normal' },
  {
    id: 't5',
    text: 'The color changes depending on how the light hits it.',
    target: 'curiosity',
  },
  {
    id: 't6',
    text: 'How did something so ordinary end up feeling so alive?',
    target: 'wonder',
  },
];

const conceptOptions: ConceptOption[] = [
  { id: 'A', text: 'Having a naturally curious personality', correct: false },
  {
    id: 'B',
    text: 'Following curiosity deeply enough to encounter mystery',
    correct: true,
  },
  { id: 'C', text: 'Finding something beautiful or unusual', correct: false },
  {
    id: 'D',
    text: 'Being in a calm and distraction-free environment',
    correct: false,
  },
];

const glassLabels: Record<GlassKey, string> = {
  normal: 'Normal Glasses',
  curiosity: 'Curiosity Glasses',
  wonder: 'Wonder Glasses',
};

export default function ThreeGlassesModulePage({ onContinue }: ThreeGlassesModulePageProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [activeGlassIndex, setActiveGlassIndex] = useState(0);
  const [showGlassesProgressionText, setShowGlassesProgressionText] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [dropFeedback, setDropFeedback] = useState<Record<string, string>>({});
  const [pool, setPool] = useState<string[]>(() => thoughts.map(t => t.id));
  const [placed, setPlaced] = useState<Record<GlassKey, string[]>>({
    normal: [],
    curiosity: [],
    wonder: [],
  });

  const [selectedConceptOption, setSelectedConceptOption] = useState<ConceptOption['id'] | null>(
    null,
  );

  const thoughtById = useMemo(() => {
    return Object.fromEntries(thoughts.map(t => [t.id, t])) as Record<string, ThoughtCard>;
  }, []);

  const allPlacedCorrectly = pool.length === 0;

  useEffect(() => {
    if (activeGlassIndex !== glassCards.length - 1) {
      setShowGlassesProgressionText(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowGlassesProgressionText(true);
    }, 1300);

    return () => window.clearTimeout(timer);
  }, [activeGlassIndex]);

  const goToSection = (next: number) => {
    setActiveSection(Math.max(0, Math.min(2, next)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToGlass = (next: number) => {
    setActiveGlassIndex(Math.max(0, Math.min(glassCards.length - 1, next)));
  };

  const handleGlassTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.changedTouches[0]?.clientX ?? null);
  };

  const handleGlassTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX;
    if (typeof endX !== 'number') return;
    const delta = endX - touchStartX;
    if (delta <= -40) goToGlass(activeGlassIndex + 1);
    if (delta >= 40) goToGlass(activeGlassIndex - 1);
    setTouchStartX(null);
  };

  const handleDrop = (targetGlass: GlassKey) => {
    if (!draggingId) return;

    const draggedThought = thoughtById[draggingId];
    if (!draggedThought) return;

    if (draggedThought.target !== targetGlass) {
      setShakeId(draggingId);
      window.setTimeout(() => setShakeId(current => (current === draggingId ? null : current)), 360);

      const feedbackByGlass: Record<GlassKey, string> = {
        normal: 'Normal Glasses are about tasks and to-dos - things that need doing.',
        curiosity:
          "Curiosity Glasses are about noticing what's actually there - details, patterns, textures.",
        wonder:
          'Wonder Glasses are about mystery - the sense that something is larger than you can fully grasp.',
      };

      setDropFeedback(prev => ({
        ...prev,
        [draggingId]: feedbackByGlass[targetGlass],
      }));
      window.setTimeout(() => {
        setDropFeedback(prev => {
          const next = { ...prev };
          delete next[draggingId];
          return next;
        });
      }, 2000);
      return;
    }

    setPool(prev => prev.filter(id => id !== draggingId));
    setPlaced(prev => {
      if (prev[targetGlass].includes(draggingId)) return prev;
      return {
        ...prev,
        [targetGlass]: [...prev[targetGlass], draggingId],
      };
    });
  };

  return (
    <div>
      <div className="w-full pb-6 text-sm leading-relaxed text-ink/85">
        <div className="relative min-h-[1080px] overflow-hidden">
          {[0, 1, 2].map(sectionIndex => (
            <section
              key={sectionIndex}
              className="absolute inset-0 overflow-y-auto pb-8"
              style={{
                transform: `translateY(${(sectionIndex - activeSection) * 100}%)`,
                transition: 'transform 0.4s ease',
              }}
            >
              <div>
                {sectionIndex > 0 && (
                  <div className="sticky top-0 z-10 mb-6 py-1">
                    <button
                      onClick={() => goToSection(activeSection - 1)}
                      className="inline-flex items-center rounded-lg border border-black/20 bg-white px-3 py-1.5 transition-all hover:border-black/40 hover:bg-black/[0.03]"
                    >
                      ← Back
                    </button>
                  </div>
                )}

                {sectionIndex === 0 && (
                  <div className="space-y-6">
                    <motion.h2
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="font-serif text-2xl leading-[1.333] text-ink"
                    >
                      So if the transactional mindset is the default, how do you override it?
                    </motion.h2>

                    <div className="space-y-3 pl-2">
                      <p className="text-xs uppercase tracking-widest text-ink/60">Section 1</p>
                      <p className="text-sm leading-relaxed text-ink/85">
                        It starts with learning to see differently. Burnett and Evans give us a
                        practical framework for exactly that.
                      </p>
                      <p className="text-sm leading-relaxed text-ink/85">
                        The framework is called "three glasses"
                      </p>
                    </div>

                    <div
                      className="relative"
                      onTouchStart={handleGlassTouchStart}
                      onTouchEnd={handleGlassTouchEnd}
                    >
                      <button
                        onClick={() => goToGlass(activeGlassIndex - 1)}
                        disabled={activeGlassIndex === 0}
                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/15 bg-white p-2 text-ink/85 transition-all disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Previous card"
                      >
                        ←
                      </button>

                      <button
                        onClick={() => goToGlass(activeGlassIndex + 1)}
                        disabled={activeGlassIndex === glassCards.length - 1}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-black/15 bg-white p-2 text-ink/85 transition-all disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Next card"
                      >
                        →
                      </button>

                      <div className="overflow-hidden rounded-2xl">
                        <div
                          className="flex"
                          style={{
                            transform: `translateX(-${activeGlassIndex * 100}%)`,
                            transition: 'transform 0.35s ease',
                          }}
                        >
                          {glassCards.map((card, index) => (
                            <article
                              key={card.id}
                              className="w-full flex-shrink-0 rounded-2xl border border-black/10 bg-[#FFFFFF]"
                            >
                              <div className="pr-5 pl-7 pt-7 pb-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="font-serif text-2xl leading-[1.333] text-ink">
                                    {index + 1}.
                                  </span>
                                  <h3 className="font-serif text-2xl leading-[1.333] text-ink">
                                    {card.label}
                                  </h3>
                                </div>
                              </div>
                              <div className="px-5">
                                <div
                                  className="mx-auto w-full max-w-[312px] overflow-hidden rounded-xl border border-black/10"
                                  style={{ aspectRatio: '1 / 1' }}
                                >
                                  <img
                                    src={card.image}
                                    alt={card.label}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>
                              </div>
                              <div className="pr-5 pb-5 pl-7 pt-3">
                                <p className="text-base leading-relaxed text-ink/85 font-medium">
                                  {card.question}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-ink/85">
                                  {card.description}
                                </p>
                                {card.callout && (
                                  <div className="mt-4 rounded-xl border border-black/10 bg-[#FFFFFF] p-4">
                                    <p className="text-sm leading-relaxed text-ink/85">{card.callout}</p>
                                  </div>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      {glassCards.map((card, index) => {
                        const isActive = index === activeGlassIndex;
                        return (
                          <button
                            key={card.id}
                            onClick={() => goToGlass(index)}
                            className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 ${
                              isActive
                                ? 'border-ink bg-ink scale-110'
                                : 'border-ink/50 bg-transparent hover:border-ink/80'
                            }`}
                            aria-label={`Go to ${card.label}`}
                          />
                        );
                      })}
                    </div>

                    {activeGlassIndex === glassCards.length - 1 && (
                      <div className="mt-6 space-y-6">
                        {showGlassesProgressionText && (
                          <>
                            <motion.p
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, ease: 'easeOut' }}
                              className="font-serif text-[18px] leading-[1.6] text-ink"
                            >
                              These three glasses represent a progression. And that movement — from Normal
                              to Curiosity to Wonder — is how you get from the transactional world
                              into the flow world.
                            </motion.p>
                            <button
                              onClick={() => goToSection(1)}
                              className="inline-flex items-center rounded-xl border border-black/15 bg-white px-5 py-2.5 transition-all hover:bg-black/[0.03]"
                            >
                              Continue →
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {sectionIndex === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-ink/60">Section 2</p>
                      <h2 className="text-base leading-relaxed text-ink/85 font-medium">Concept Check</h2>
                      <p className="text-sm leading-relaxed text-ink/85">
                        Sort these thoughts into the right glasses.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-4">
                      <p className="mb-3 text-base leading-relaxed text-ink/85 font-medium">Statement Pool</p>
                      <div className="grid gap-2">
                        {pool.map(id => {
                          const thought = thoughtById[id];
                          return (
                            <motion.div
                              key={id}
                              draggable
                              onDragStart={() => setDraggingId(id)}
                              onDragEnd={() => setDraggingId(null)}
                              animate={shakeId === id ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                              transition={{ duration: 0.28 }}
                              className="cursor-grab rounded-xl border border-black/10 bg-white px-4 py-3 text-sm leading-relaxed text-ink/85 active:cursor-grabbing"
                            >
                              <p>{thought.text}</p>
                              {dropFeedback[id] && (
                                <p className="mt-1.5 text-xs leading-relaxed text-red-700">{dropFeedback[id]}</p>
                              )}
                            </motion.div>
                          );
                        })}
                        {pool.length === 0 && (
                          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-ink/85">
                            Nice sorting. Everything has been placed.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {(Object.keys(glassLabels) as GlassKey[]).map(glass => (
                        <div
                          key={glass}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => handleDrop(glass)}
                          className="min-h-[180px] rounded-2xl border border-black/10 bg-[#FFFFFF] p-4"
                        >
                          <p className="mb-3 text-base leading-relaxed text-ink/85 font-medium">{glassLabels[glass]}</p>
                          <div className="space-y-2">
                            {placed[glass].map(id => (
                              <div
                                key={id}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 text-ink/85 px-3 py-2"
                              >
                                {thoughtById[id].text}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {allPlacedCorrectly && (
                      <button
                        onClick={() => goToSection(2)}
                        className="inline-flex items-center rounded-xl bg-black px-6 py-2.5 text-white hover:bg-black/85"
                      >
                        Continue →
                      </button>
                    )}
                  </div>
                )}

                {sectionIndex === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest text-ink/60">Section 3</p>
                      <p className="text-sm leading-relaxed text-ink/85">
                        Burnett and Evans suggest that wonder is a fundamental designer's mindset.
                        And you can create the conditions for wonder to happen.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-[#FFFFFF] p-5">
                      <p className="mb-4 text-base leading-relaxed text-ink/85 font-medium">
                        What do you think makes wonder possible?
                      </p>
                      <div className="space-y-2.5">
                        {conceptOptions.map(opt => {
                          const isSelected = selectedConceptOption === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => setSelectedConceptOption(opt.id)}
                              className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                                isSelected
                                  ? 'border-black bg-black text-white'
                                    : 'border-black/10 bg-white text-ink/85'
                              } hover:border-black/30`}
                            >
                              <span className="mr-2 font-semibold">{opt.id}.</span>
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {selectedConceptOption && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <p className="text-base leading-relaxed text-ink/85 font-medium">
                          {selectedConceptOption === 'B' ? 'Exactly.' : 'Not quite — the answer is B.'}
                        </p>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="rounded-2xl border border-black/12 bg-[#FFFFFF] p-6"
                        >
                          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
                            The Wonder Formula
                          </p>

                          <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm p-8">
                            <div className="flex items-center justify-center gap-6 text-center">
                              <div>
                                <div className="text-3xl font-serif text-ink mb-2">Curiosity</div>
                                <p className="text-xs text-muted max-w-[120px]">
                                  Following interest without agenda
                                </p>
                              </div>
                              <div className="text-2xl text-muted font-light">+</div>
                              <div>
                                <div className="text-3xl font-serif text-ink mb-2">Mystery</div>
                                <p className="text-xs text-muted max-w-[120px]">
                                  Touching what can't be fully grasped
                                </p>
                              </div>
                              <div className="text-2xl text-muted font-light">=</div>
                              <div>
                                <div className="text-3xl font-serif text-[#6B8F6E] mb-2">Wonder</div>
                                <p className="text-xs text-muted max-w-[120px]">Engaged, alive, present</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/85">
                            <p>
                              Curiosity is intrinsic. Humans are naturally curious animals. Put on
                              Curiosity Glasses, stay with what's in front of you, follow the
                              thread.
                            </p>
                            <p>
                              Go far enough, and reality will stop you in your tracks. You will
                              bump into something you can't fully explain nor hold. That's mystery.
                            </p>
                            <p>
                              And when mystery breaks through, it fills you with a unique sensation
                              of aliveness — the intuitive knowing that you're part of something far
                              larger than you can grasp.
                            </p>
                          </div>
                        </motion.div>

                        <button
                          onClick={onContinue}
                          className="inline-flex items-center rounded-xl bg-black px-6 py-2.5 text-white hover:bg-black/85"
                        >
                          Continue
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
