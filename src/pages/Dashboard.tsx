import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';
import { modules } from '../data/modules';
import OLMDashboard from '../components/OLMDashboard';
import FeedbackBlock from '../components/FeedbackBlock';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function useCurrentFocus(entries: { moduleId: string }[]) {
  const completedIds = new Set(entries.map((e) => e.moduleId));
  const nextModule = modules.find((m) => !completedIds.has(m.id));
  const count = completedIds.size;
  return {
    module: nextModule ?? modules[modules.length - 1],
    completed: count,
    total: modules.length,
    pct: Math.round((count / modules.length) * 100),
    allDone: count >= modules.length,
  };
}

function aiInsight(n: number): string {
  if (n === 0)
    return "";
  if (n <= 2)
    return "You\u2019re beginning to notice patterns in your life. Each observation adds depth to your understanding of what creates meaning for you.";
  if (n <= 4)
    return "Your reflections are revealing themes. Look for connections between what energizes you and what matters deeply \u2014 that\u2019s where meaning lives.";
  return "A picture is emerging from your practice. Your meaning design is taking shape through observation, experimentation, and reflection.";
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { entries, latestEntry, hasEntries, loading, restart } = useJournal();
  const focus = useCurrentFocus(entries);
  const insight = aiInsight(entries.length);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto w-full py-20 px-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted animate-pulse">Loading your progress…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full py-20 px-8">
      {/* ── Title ─────────────────────────────────────────────── */}
      <h1 className="font-serif text-4xl mb-3 text-ink">Meaning by Design</h1>
      <p className="text-lg text-muted leading-relaxed mb-12">
        Apply a designer approach to create more meaning and purpose in life.
      </p>

      {/* ── Current Focus ─────────────────────────────────────── */}
      <div className="p-8 rounded-2xl border border-black/[0.08] bg-white shadow-sm mb-6">
        <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
          {focus.allDone ? 'Journey Complete' : 'Current Focus'}
        </span>
        <h2 className="font-serif text-2xl text-ink mt-1">
          {focus.module.title}
        </h2>
        <p className="text-sm text-muted mt-1">{focus.module.desc}</p>

        {/* progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-muted uppercase tracking-widest">
              Overall Progress
            </span>
            <span className="text-xs text-muted">
              {focus.completed} of {focus.total} modules
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-ink/70 transition-all duration-700"
              style={{ width: `${focus.pct}%` }}
            />
          </div>
        </div>

        {/* Primary CTA */}
        {!focus.allDone && (
          <div className="mt-6 pt-5 border-t border-black/[0.05] flex items-center justify-between">
            <p className="text-xs text-muted italic">
              {!hasEntries ? 'Start here' : 'Continue where you left off'}
            </p>
            <Link
              to={focus.module.path}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md shrink-0"
            >
              {!hasEntries ? 'Start Module 1' : `Continue · Module ${focus.module.number}`}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* ── AI Insight ────────────────────────────────────────── */}
      {insight && (
        <div className="flex items-start gap-3 px-6 py-5 rounded-2xl bg-sage/20 border border-sage/30 mb-10">
          <Sparkles className="w-4 h-4 text-[#6B8F6E] mt-0.5 shrink-0" />
          <p className="text-sm text-ink/70 leading-relaxed italic">{insight}</p>
        </div>
      )}

      {/* ── OLM Dashboard (4 modules) ────────────────────────── */}
      <OLMDashboard entries={entries} />

      {/* ── Restart ───────────────────────────────────────────── */}
      {hasEntries && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={restart}
            className="text-xs text-muted hover:text-ink transition-colors underline underline-offset-2"
          >
            Restart journey
          </button>
        </div>
      )}

      {/* ── Recent Insights / Journal ─────────────────────────── */}
      <div className="mt-10 p-8 rounded-2xl border border-black/[0.08] bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
            Recent Insights
          </span>
          {hasEntries && (
            <Link
              to="/journal"
              className="text-xs text-muted hover:text-ink transition-colors"
            >
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
              <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
                Latest Entry
              </span>
              <span className="text-xs text-muted">
                {formatDate(latestEntry.createdAt)}
                {latestEntry.moduleTitle && ` · ${latestEntry.moduleTitle}`}
              </span>
            </div>

            {latestEntry.selectedSignals &&
              latestEntry.selectedSignals.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
                    What you noticed
                  </p>
                  <ul className="space-y-1">
                    {latestEntry.selectedSignals.map((signal) => (
                      <li
                        key={signal}
                        className="text-sm text-ink leading-relaxed flex gap-2"
                      >
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
              <FeedbackBlock text={latestEntry.aiResponse} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
