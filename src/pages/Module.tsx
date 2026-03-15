import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Module() {
  const { id } = useParams();

  return (
    <div className="max-w-2xl mx-auto w-full py-20 px-8">
      <div className="mb-12">
        <span className="text-xs font-medium text-muted uppercase tracking-widest">Module</span>
        <h1 className="font-serif text-4xl mt-2 capitalize text-ink">{id?.replace('-', ' ')}</h1>
      </div>
      
      <div className="prose prose-stone max-w-none">
        <p className="text-lg leading-relaxed text-muted mb-8">
          This is a placeholder for the module content. In the actual product, this area will contain the reading material, theoretical input, and reframing concepts designed to shift your perspective.
        </p>
        
        <h2 className="font-serif text-2xl text-ink mt-12 mb-4">The Core Concept</h2>
        <p className="text-muted leading-relaxed mb-6">
          We often try to change our lives by forcing new habits through sheer willpower. But willpower is a finite resource. Instead, we need to redesign the environment and the meaning we attach to our actions.
        </p>
        
        <div className="p-6 my-8 rounded-2xl bg-sage/20 border border-sage/30">
          <p className="font-serif text-xl text-ink italic">
            "What if your body is asking for a different rhythm, rather than resisting discipline?"
          </p>
        </div>
        
        <p className="text-muted leading-relaxed mb-12">
          Take a moment to let that sink in before moving to the practice section.
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-black/5 flex justify-end">
        <Link 
          to="/reflection/observe" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          Go to Practice
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
