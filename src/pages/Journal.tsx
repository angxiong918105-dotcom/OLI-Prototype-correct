import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Pencil, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

type JournalStatus = 'locked' | 'available' | 'done';

interface ModuleSlot {
  number: number;
  title: string;
  journalPath?: string;
}

const MODULE_SLOTS: ModuleSlot[] = [
  { number: 1, title: 'Meaning as Design' },
  { number: 2, title: 'Reframe Meaning & Purpose' },
  { number: 3, title: 'Meaning Design: Flip the World Switch' },
  { number: 4, title: 'Wonder & Flow', journalPath: '/journal/m4' },
  { number: 5, title: 'Build a Personal Compass' },
];

function readStatus(number: number): JournalStatus {
  if (number === 4) {
    const val = localStorage.getItem('journal_m4_status');
    if (val === 'available' || val === 'done') return val;
    return 'locked';
  }
  if (number === 5) {
    return localStorage.getItem('module5_unlocked') === 'true' ? 'available' : 'locked';
  }
  return 'locked';
}

function readCompletedDate(number: number): string | null {
  if (number !== 4) return null;
  const raw = localStorage.getItem('journal_m4_entry');
  if (!raw) return null;
  try {
    const entry = JSON.parse(raw) as { completedAt?: string };
    if (entry.completedAt) {
      return new Date(entry.completedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  } catch {}
  return null;
}

export default function Journal() {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<Record<number, JournalStatus>>({});

  useEffect(() => {
    const s: Record<number, JournalStatus> = {};
    for (const slot of MODULE_SLOTS) {
      s[slot.number] = readStatus(slot.number);
    }
    setStatuses(s);
  }, []);

  const handleClick = (slot: ModuleSlot) => {
    const status = statuses[slot.number];
    if (status === 'locked' || !slot.journalPath) return;
    navigate(slot.journalPath);
  };

  return (
    <div className="max-w-xl mx-auto w-full py-20 px-8">

      {/* Notebook-style header */}
      <div className="mb-10">
        <p className="text-[10px] font-semibold text-muted/60 uppercase tracking-[0.18em] mb-3">
          Meaning by Design
        </p>
        <h1 className="font-serif text-4xl text-ink italic leading-tight">Journal</h1>
        {/* Double rule — classic ruled-notebook title divider */}
        <div className="mt-4">
          <div className="h-px bg-ink/15" />
          <div className="h-px bg-ink/6 mt-[3px]" />
        </div>
        <p className="text-sm text-muted mt-4 leading-relaxed">
          One reflection per module. Complete each module to unlock its entry.
        </p>
      </div>

      {/* Notebook page */}
      <div className="relative rounded-xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
        {/* Red margin line */}
        <div className="absolute left-[2.75rem] top-0 bottom-0 w-px bg-red-200/60" />

        {MODULE_SLOTS.map((slot, i) => {
          const status = statuses[slot.number] ?? 'locked';
          const completedDate = status === 'done' ? readCompletedDate(slot.number) : null;
          const isClickable = status !== 'locked' && !!slot.journalPath;

          return (
            <motion.div
              key={slot.number}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: 'easeOut' }}
              onClick={() => handleClick(slot)}
              className={`relative flex items-stretch border-b border-black/[0.05] last:border-0 select-none transition-colors ${
                isClickable ? 'cursor-pointer hover:bg-black/[0.015]' : ''
              }`}
            >
              {/* Margin: module number */}
              <div
                className={`w-[2.75rem] shrink-0 flex items-center justify-center py-5 ${
                  status === 'locked' ? 'opacity-25' : ''
                }`}
              >
                <span
                  className={`text-[11px] font-semibold tabular-nums ${
                    status === 'done' ? 'text-[#6B8F6E]' : 'text-muted/50'
                  }`}
                >
                  {slot.number}
                </span>
              </div>

              {/* Content */}
              <div
                className={`flex flex-1 min-w-0 items-center gap-4 py-5 pl-4 pr-5 ${
                  status === 'locked' ? 'opacity-35' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink leading-snug">{slot.title}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {status === 'locked' && 'Complete the module to unlock'}
                    {status === 'available' && 'Ready to write'}
                    {status === 'done' &&
                      (completedDate ? `Written ${completedDate}` : 'Written')}
                  </p>
                </div>

                <div className="shrink-0">
                  {status === 'locked' && <Lock className="w-3.5 h-3.5 text-muted/30" />}
                  {status === 'available' && <Pencil className="w-3.5 h-3.5 text-ink/45" />}
                  {status === 'done' && <CheckCircle2 className="w-4 h-4 text-[#6B8F6E]" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Page-end rule */}
      <div className="mt-5 opacity-20">
        <div className="h-px bg-ink" />
      </div>
    </div>
  );
}
