import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getModuleById } from '../data/modules';
import { useJournal } from '../context/JournalContext';

const PROMPTS: Record<string, { heading: string; task: string; placeholder: string; hint: string }> = {
  observe: {
    heading: 'What patterns do you notice in your current life?',
    task: 'Write what comes up — moments of energy, flat stretches, small highs. No structure needed.',
    placeholder: 'Start writing… a few sentences is enough.',
    hint: 'Focus on what you actually experience, not what you think you should feel.',
  },
  test: {
    heading: 'What did you learn from your experiment?',
    task: 'Describe what you tried, what shifted, and what surprised you — even if it was small.',
    placeholder: "Write what comes to mind…",
    hint: 'There are no wrong answers here. What matters is honest observation.',
  },
};

export default function Reflection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const moduleInfo = getModuleById(id);
  const { addEntry } = useJournal();

  const prompt = PROMPTS[id ?? ''] ?? {
    heading: 'What patterns do you observe?',
    task: 'Write whatever comes to mind. A few sentences is enough.',
    placeholder: 'Write a few words…',
    hint: "Don't judge — just observe.",
  };

  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await addEntry({
      moduleId: id ?? 'unknown',
      moduleTitle: moduleInfo?.title ?? id ?? '',
      reflectionText: text.trim(),
    });
    navigate('/');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0">
      {/* Left side: Prompt */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-black/5 p-8 md:p-12 flex flex-col bg-white/50 overflow-y-auto">
        <span className="text-xs font-medium text-muted uppercase tracking-widest mb-3">
          {moduleInfo ? `Module ${moduleInfo.number}: ${moduleInfo.title}` : `Reflection: ${id}`}
        </span>
        <p className="text-xs text-muted uppercase tracking-widest mb-6">→ Read the prompt, then write your reflection on the right</p>
        <h2 className="font-serif text-3xl mb-3 text-ink leading-tight">{prompt.heading}</h2>
        <p className="text-sm text-muted leading-relaxed mb-8">{prompt.task}</p>

        <div className="mt-auto p-6 rounded-2xl bg-sage/20 border border-sage/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-medium text-emerald-800 uppercase tracking-widest">A thought to guide you</span>
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed">
            {prompt.hint}
          </p>
        </div>
      </div>

      {/* Right side: Workspace */}
      <div className="flex-1 p-8 md:p-12 flex flex-col bg-paper">
        <p className="text-xs text-muted uppercase tracking-widest mb-4">Write your reflection</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={prompt.placeholder}
          rows={10}
          className="flex-1 w-full rounded-2xl border border-black/8 border-l-[3px] border-l-black/15 bg-white p-6 text-sm text-ink outline-none resize-none placeholder:text-black/20 placeholder:italic focus:border-black/15 focus:border-l-ink transition-colors leading-relaxed"
        />
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-muted italic">
            {text.trim().length === 0 ? 'Start writing above — a few words is enough.' : `${text.trim().split(/\s+/).length} words`}
          </p>
          <button
            onClick={handleSubmit}
            disabled={saving || !text.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            {saving ? 'Saving...' : 'Save & continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
