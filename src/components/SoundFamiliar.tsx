import { useMemo, useState } from 'react';
import { motion } from 'motion/react';

type SoundFamiliarOption = {
  id: string;
  label: string;
};

type SoundFamiliarFeedback = {
  [key: string]: string | undefined;
  default?: string;
};

type SoundFamiliarProps = {
  scenario: string;
  question: string;
  options: SoundFamiliarOption[];
  feedback: SoundFamiliarFeedback;
  onSelectOption?: (optionId: string) => void;
};

export default function SoundFamiliar({
  scenario,
  question,
  options,
  feedback,
  onSelectOption,
}: SoundFamiliarProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const feedbackTexts = useMemo(() => {
    if (!selected) return [] as string[];

    const selectedFeedback = feedback[selected];
    const defaultFeedback = feedback.default;

    // Show option-specific feedback first, then shared feedback if present.
    if (selectedFeedback && defaultFeedback && selectedFeedback !== defaultFeedback) {
      return [selectedFeedback, defaultFeedback];
    }

    if (selectedFeedback) return [selectedFeedback];
    if (defaultFeedback) return [defaultFeedback];

    return [] as string[];
  }, [feedback, selected]);

  return (
    <div className="rounded-2xl border border-black/15 bg-white shadow-sm p-6">
      <p className="text-sm text-ink/85 leading-relaxed mb-2">{scenario}</p>
      <p className="text-sm font-medium text-ink mb-4">{question}</p>

      <div className="space-y-2.5">
        {options.map(option => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => {
                setSelected(option.id);
                onSelectOption?.(option.id);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                isSelected
                  ? 'border-black bg-black text-white font-medium'
                  : 'border-black/10 bg-white text-ink/75'
              } hover:border-ink/30 hover:text-ink`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {selected && feedbackTexts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mt-4"
        >
          <div className="space-y-2">
            {feedbackTexts.map((text, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs leading-6 text-ink/70">●</span>
                <p className="text-sm text-ink/85 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}