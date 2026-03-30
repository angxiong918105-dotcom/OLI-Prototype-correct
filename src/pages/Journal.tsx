import { useJournal } from '../context/JournalContext';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATTERN_MIN_ENTRIES, PATTERN_MIN_MODULES } from '../lib/generatePatternInsight';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="p-8 rounded-2xl border border-black/5 bg-white/50 text-center">
      <BookOpen className="w-5 h-5 text-muted mx-auto mb-4" />
      <p className="text-sm text-ink leading-relaxed mb-1">Nothing here yet.</p>
      <p className="text-sm text-muted leading-relaxed">
        Your journal starts after your first reflection. Complete Module 1 to begin.
      </p>
      <Link
        to="/module/intro"
        className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
      >
        Start Module 1
      </Link>
    </div>
  );
}

// ─── Not enough history state ────────────────────────────────────────────────

function NotEnoughHistoryState({ entryCount }: { entryCount: number }) {
  const remaining = PATTERN_MIN_ENTRIES - entryCount;
  return (
    <div className="p-6 rounded-2xl border border-black/5 bg-white/40">
      <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
        Pattern insights
      </p>
      <p className="text-sm text-muted leading-relaxed">
        Patterns surface after {PATTERN_MIN_ENTRIES} entries across at least {PATTERN_MIN_MODULES} modules.{' '}
        {remaining === 1
          ? 'One more entry to go.'
          : `${remaining} more entries to go.`}
      </p>
    </div>
  );
}

// ─── Pattern insight block ───────────────────────────────────────────────────

function PatternInsightBlock({
  pattern,
  nextStep,
  generatedAt,
  onRefresh,
  loading,
}: {
  pattern: string;
  nextStep: string;
  generatedAt: string;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="p-7 rounded-2xl border border-black/8 bg-white shadow-sm">
      <div className="flex items-baseline justify-between mb-5">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">
          Pattern emerging
        </p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] text-muted hover:text-ink transition-colors disabled:opacity-40"
          title="Regenerate insight"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Thinking…' : 'Refresh'}
        </button>
      </div>

      <p className="text-sm text-ink leading-relaxed mb-5">{pattern}</p>

      <div className="pt-5 border-t border-black/5">
        <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
          Something to try
        </p>
        <p className="text-sm text-ink leading-relaxed">{nextStep}</p>
      </div>

      <p className="text-[10px] text-muted mt-5">
        Generated {formatDate(generatedAt)}
      </p>
    </div>
  );
}

// ─── Single entry card ───────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: ReturnType<typeof useJournal>['entries'][number] }) {
  return (
    <article className="p-7 rounded-2xl border border-black/5 bg-white shadow-sm">
      {/* Date + module */}
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-sm font-medium text-ink">{formatDate(entry.createdAt)}</span>
        {entry.moduleTitle && (
          <>
            <span className="text-muted">·</span>
            <span className="text-sm text-muted">{entry.moduleTitle}</span>
          </>
        )}
      </div>

      {/* Signals */}
      {entry.selectedSignals && entry.selectedSignals.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
            What you noticed
          </p>
          <ul className="space-y-1.5">
            {entry.selectedSignals.map((signal) => (
              <li key={signal} className="text-sm text-ink leading-relaxed flex gap-2">
                <span className="text-muted mt-0.5 shrink-0">·</span>
                {signal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Reflection */}
      {entry.reflectionText && (
        <div className="mb-5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
            Your reflection
          </p>
          <p className="text-sm text-ink leading-relaxed">"{entry.reflectionText}"</p>
        </div>
      )}

      {/* Single-entry AI response */}
      {entry.aiResponse && (
        <div className="pt-5 border-t border-black/5">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
            From this entry
          </p>
          <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
            {entry.aiResponse}
          </p>
        </div>
      )}

      {/* Meaning rating */}
      {entry.meaningRating !== undefined && (
        <div className="mt-5 pt-4 border-t border-black/5">
          <span className="text-xs text-muted">Meaning rating: {entry.meaningRating}/100</span>
        </div>
      )}
    </article>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Journal() {
  const {
    entries,
    hasEntries,
    patternInsight,
    patternInsightLoading,
    hasEnoughForPattern,
    refreshPatternInsight,
  } = useJournal();

  const sorted = [...entries].reverse();

  return (
    <div className="max-w-2xl mx-auto w-full py-20 px-8">
      <h1 className="font-serif text-4xl mb-3 text-ink">Journal</h1>
      <p className="text-sm text-muted leading-relaxed mb-12">
        What you noticed, reflected on, and where things seem to be going.
      </p>

      {/* Empty state */}
      {!hasEntries && <EmptyState />}

      {hasEntries && (
        <div className="space-y-6">
          {/* Pattern insight — shown above entries once there's enough history */}
          {hasEnoughForPattern ? (
            patternInsight ? (
              <PatternInsightBlock
                pattern={patternInsight.pattern}
                nextStep={patternInsight.next_step}
                generatedAt={patternInsight.generatedAt}
                onRefresh={refreshPatternInsight}
                loading={patternInsightLoading}
              />
            ) : patternInsightLoading ? (
              <div className="p-7 rounded-2xl border border-black/5 bg-white/50">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
                  Pattern emerging
                </p>
                <p className="text-sm text-muted">Looking across your entries…</p>
              </div>
            ) : (
              // Conditions met but never triggered — let user request it
              <div className="p-7 rounded-2xl border border-black/5 bg-white/50">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
                  Pattern emerging
                </p>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  You have enough history to surface a pattern across your entries.
                </p>
                <button
                  onClick={refreshPatternInsight}
                  className="text-sm text-ink underline underline-offset-2 hover:text-ink/70 transition-colors"
                >
                  Generate insight
                </button>
              </div>
            )
          ) : (
            <NotEnoughHistoryState entryCount={entries.length} />
          )}

          {/* Divider between pattern block and entries */}
          <div className="pt-2">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-6">
              Entries
            </p>
            <div className="space-y-6">
              {sorted.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
