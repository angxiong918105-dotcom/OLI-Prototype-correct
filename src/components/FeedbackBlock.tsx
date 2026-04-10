import { Sparkles } from 'lucide-react';

const LABELS = ['From your response', 'What this may suggest', 'Try next'] as const;

/**
 * Renders AI feedback in a structured 3-part layout.
 * Accepts the raw `aiResponse` string (parts separated by ␞ or \n).
 * Falls back to a single block for legacy plain-text responses.
 */
export default function FeedbackBlock({ text }: { text: string }) {
  // Try structured separator first, fall back to newline
  let parts = text.split('␞').map(s => s.trim()).filter(Boolean);
  if (parts.length < 2) {
    parts = text.split('\n').map(s => s.trim()).filter(Boolean);
  }

  // If still just one blob, render legacy style
  if (parts.length === 1) {
    return (
      <div className="pt-5 border-t border-black/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#6B8F6E]" />
          <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
            Reflection
          </span>
        </div>
        <p className="text-sm text-ink leading-relaxed">{parts[0]}</p>
      </div>
    );
  }

  return (
    <div className="pt-5 border-t border-black/5 space-y-4">
      {parts.slice(0, 3).map((part, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 mb-1.5">
            {i === 0 && <Sparkles className="w-3.5 h-3.5 text-[#6B8F6E]" />}
            <span className={`text-[10px] font-semibold uppercase tracking-widest ${
              i === 0 ? 'text-[#6B8F6E]' : 'text-muted'
            }`}>
              {LABELS[i] ?? `Part ${i + 1}`}
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${
            i === 2 ? 'text-ink font-medium' : 'text-ink/80'
          }`}>
            {part}
          </p>
        </div>
      ))}
    </div>
  );
}
