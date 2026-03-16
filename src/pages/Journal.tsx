import { useJournal } from '../context/JournalContext';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Journal() {
  const { entries, hasEntries } = useJournal();

  // Reverse chronological
  const sorted = [...entries].reverse();

  return (
    <div className="max-w-2xl mx-auto w-full py-20 px-8">
      <h1 className="font-serif text-4xl mb-3 text-ink">Your Meaning Journal</h1>
      <p className="text-sm text-muted leading-relaxed mb-12">
        A record of what you noticed, reflected on, and carried forward.
      </p>

      {!hasEntries && (
        <div className="p-8 rounded-2xl border border-black/5 bg-white/50 text-center">
          <BookOpen className="w-6 h-6 text-muted mx-auto mb-4" />
          <p className="text-sm text-muted leading-relaxed">
            Your journal will begin after your first reflection.
          </p>
          <Link
            to="/module/intro"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all"
          >
            Start Module 1
          </Link>
        </div>
      )}

      {hasEntries && (
        <div className="space-y-8">
          {sorted.map(entry => (
            <article
              key={entry.id}
              className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm"
            >
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-sm font-medium text-ink">
                  {formatDate(entry.createdAt)}
                </span>
                {entry.moduleTitle && (
                  <>
                    <span className="text-muted">·</span>
                    <span className="text-sm text-muted">{entry.moduleTitle}</span>
                  </>
                )}
              </div>

              {entry.selectedSignals && entry.selectedSignals.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
                    What you noticed
                  </p>
                  <ul className="space-y-1.5">
                    {entry.selectedSignals.map(signal => (
                      <li key={signal} className="text-sm text-ink leading-relaxed flex gap-2">
                        <span className="text-muted mt-0.5 shrink-0">·</span>
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.reflectionText && (
                <div className="mb-6">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
                    Your reflection
                  </p>
                  <p className="text-sm text-ink leading-relaxed">
                    "{entry.reflectionText}"
                  </p>
                </div>
              )}

              {entry.aiResponse && (
                <div className="pt-6 border-t border-black/5">
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
                    A thought to carry with you
                  </p>
                  <p className="text-sm text-ink leading-relaxed">
                    {entry.aiResponse}
                  </p>
                </div>
              )}

              {entry.meaningRating !== undefined && (
                <div className="mt-6 pt-4 border-t border-black/5">
                  <span className="text-xs text-muted">
                    Meaning rating: {entry.meaningRating}/100
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
