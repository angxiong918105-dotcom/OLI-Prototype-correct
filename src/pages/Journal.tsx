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
    <div className="max-w-2xl mx-auto w-full py-20 px-8">
      <h1 className="font-serif text-4xl mb-3 text-ink">Journal</h1>
      <p className="text-sm text-muted leading-relaxed mb-12">
        One reflection per module. Complete each module to unlock its entry.
      </p>

      <div className="space-y-3">
        {MODULE_SLOTS.map((slot, i) => {
          const status = statuses[slot.number] ?? 'locked';
          const completedDate = status === 'done' ? readCompletedDate(slot.number) : null;
          const isClickable = status !== 'locked' && !!slot.journalPath;

          return (
            <motion.div
              key={slot.number}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: 'easeOut' }}
              onClick={() => handleClick(slot)}
              className={`flex items-center gap-5 p-5 rounded-2xl border bg-white shadow-sm transition-all select-none ${
                isClickable
                  ? 'cursor-pointer hover:border-ink/25 hover:shadow'
                  : 'opacity-55'
              } ${status === 'done' ? 'border-black/[0.08]' : 'border-black/[0.07]'}`}
            >
              {/* Module badge */}
              <div className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
                  M{slot.number}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink leading-snug">{slot.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {status === 'locked' && 'Complete the module to unlock'}
                  {status === 'available' && 'Ready to write'}
                  {status === 'done' && (completedDate ? `Completed ${completedDate}` : 'Completed')}
                </p>
              </div>

              {/* Icon */}
              <div className="shrink-0">
                {status === 'locked' && <Lock className="w-4 h-4 text-muted/40" />}
                {status === 'available' && <Pencil className="w-4 h-4 text-ink/50" />}
                {status === 'done' && <CheckCircle2 className="w-4 h-4 text-[#6B8F6E]" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
