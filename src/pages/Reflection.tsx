import { useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { getModuleById } from '../data/modules';

export default function Reflection() {
  const { id } = useParams();
  const moduleInfo = getModuleById(id);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0">
      {/* Left side: Prompt */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-black/5 p-8 md:p-12 flex flex-col bg-white/50 overflow-y-auto">
        <span className="text-xs font-medium text-muted uppercase tracking-widest mb-8">
          {moduleInfo ? `Module ${moduleInfo.number}: ${moduleInfo.title}` : `Reflection: ${id}`}
        </span>
        <h2 className="font-serif text-3xl mb-6 text-ink leading-tight">What patterns do you observe in your current routine?</h2>
        <p className="text-sm text-muted leading-relaxed">
          Don't judge, just observe. Write down what happens before, during, and after the behavior you want to change.
        </p>
        
        <div className="mt-12 p-6 rounded-2xl bg-sage/20 border border-sage/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-medium text-emerald-800 uppercase tracking-widest">Coach's Hint</span>
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed">
            Try to focus on the triggers. What emotion are you feeling right before you pick up your phone?
          </p>
        </div>
      </div>
      
      {/* Right side: Workspace */}
      <div className="flex-1 p-8 md:p-12 flex flex-col bg-paper">
        <textarea 
          className="flex-1 w-full bg-transparent resize-none outline-none text-lg leading-relaxed text-ink placeholder:text-black/20"
          placeholder="Start typing your observations here..."
        />
        
        {/* AI Action Area */}
        <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Coach is listening...</span>
          </div>
          <button className="px-5 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors shadow-sm">
            Distill Insights
          </button>
        </div>
      </div>
    </div>
  );
}
