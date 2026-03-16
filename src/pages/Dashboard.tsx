import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';

const journeySteps = [
  { label: 'Reframe', active: true },
  { label: 'Observe', active: false },
  { label: 'Ideate', active: false },
  { label: 'Prototype', active: false },
  { label: 'Test', active: false },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const { latestEntry, hasEntries } = useJournal();

  return (
    <div className="max-w-2xl mx-auto w-full py-20 px-8">
      {/* Title & Framing */}
      <h1 className="font-serif text-4xl mb-3 text-ink">Meaning by Design</h1>
      <p className="text-lg text-muted leading-relaxed mb-16">
        Apply a designer approach to create more meaning and purpose in life.
      </p>

      {/* Start Your Journey Card */}
      <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm mb-8">
        <h2 className="font-serif text-2xl text-ink mb-3">Start My Meaning Design</h2>
        <p className="text-sm text-muted/70 mb-8">
          7 micro-learning modules · &lt; 10 minutes each
        </p>

        <Link
          to="/module/intro"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          Module 1
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Your Learning Path */}
      <div className="p-8 rounded-2xl border border-black/5 bg-white/50 mb-8">
        <span className="text-xs font-medium text-muted uppercase tracking-widest">My Learning Progress</span>

        <div className="mt-6 flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-3 h-px bg-black/10 z-0" />

          {journeySteps.map((step, idx) => (
            <div key={step.label} className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                idx === 0
                  ? 'bg-ink'
                  : 'bg-paper border border-black/10'
              }`}>
                {idx === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                {idx > 0 && <div className="w-1.5 h-1.5 rounded-full bg-black/10" />}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-medium ${
                idx === 0 ? 'text-ink' : 'text-muted'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted leading-relaxed mt-6">
          From reframing to experiment — each module builds toward a small and testable meaning design prototype you can try in your own life.
        </p>
      </div>

      {/* Your Meaning Journal */}
      <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-medium text-muted uppercase tracking-widest">Your Meaning Journal</span>
          {hasEntries && (
            <Link to="/journal" className="text-xs text-muted hover:text-ink transition-colors">
              View all entries
            </Link>
          )}
        </div>

        {!hasEntries && (
          <div className="text-center py-6">
            <BookOpen className="w-5 h-5 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted leading-relaxed">
              Your journal will begin after your first reflection.
            </p>
          </div>
        )}

        {hasEntries && latestEntry && (
          <div>
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">Latest Entry</span>
              <span className="text-xs text-muted">
                {formatDate(latestEntry.createdAt)}
                {latestEntry.moduleTitle && ` · ${latestEntry.moduleTitle}`}
              </span>
            </div>

            {latestEntry.selectedSignals && latestEntry.selectedSignals.length > 0 && (
              <div className="mb-5">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
                  What you noticed
                </p>
                <ul className="space-y-1">
                  {latestEntry.selectedSignals.map(signal => (
                    <li key={signal} className="text-sm text-ink leading-relaxed flex gap-2">
                      <span className="text-muted mt-0.5 shrink-0">·</span>
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {latestEntry.reflectionText && (
              <div className="mb-5">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
                  Your reflection
                </p>
                <p className="text-sm text-ink leading-relaxed">
                  "{latestEntry.reflectionText}"
                </p>
              </div>
            )}

            {latestEntry.aiResponse && (
              <div className="pt-5 border-t border-black/5">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
                  A thought to carry with you
                </p>
                <p className="text-sm text-ink leading-relaxed">
                  {latestEntry.aiResponse}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
