import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="max-w-3xl mx-auto w-full py-20 px-8">
      <h1 className="font-serif text-4xl mb-8 text-ink">Your Journey</h1>
      
      {/* L1 - The Anchor: Hero Card (Module + Focus + Progress + CTA) */}
      <div className="p-8 rounded-2xl border border-black/5 bg-white shadow-sm flex flex-col">
        {/* Meta & Title */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Module 3 · Observe</span>
            <div className="px-3 py-1 bg-sage/50 text-ink text-xs font-medium rounded-full">
              In Progress
            </div>
          </div>
          <h2 className="font-serif text-3xl mt-1 text-ink mb-3">Digital Consumption</h2>
          <p className="text-muted leading-relaxed max-w-xl">
            Exploring how your digital habits affect your daily energy levels. It's time to observe your patterns without judgment.
          </p>
        </div>

        {/* Progress & CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8 mt-8 border-t border-black/5">
          <div className="flex-1 w-full max-w-[240px]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-medium text-muted uppercase tracking-widest">Journey Progress</span>
              <span className="text-[10px] font-medium text-ink uppercase tracking-widest">3 / 8</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 flex-1 bg-ink rounded-full" />
              <div className="h-1.5 flex-1 bg-ink rounded-full" />
              <div className="h-1.5 flex-1 bg-ink/30 rounded-full" />
              <div className="h-1.5 flex-1 bg-black/5 rounded-full" />
              <div className="h-1.5 flex-1 bg-black/5 rounded-full" />
              <div className="h-1.5 flex-1 bg-black/5 rounded-full" />
              <div className="h-1.5 flex-1 bg-black/5 rounded-full" />
              <div className="h-1.5 flex-1 bg-black/5 rounded-full" />
            </div>
          </div>
          
          <Link 
            to="/reflection/observe" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5 hover:shadow-md shrink-0 w-full md:w-auto"
          >
            Continue to Module
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* L2 - The Bridge: Shortened AI Synthesis */}
      <div className="mt-12 mb-8 pl-6 border-l-2 border-emerald-700/20">
        <span className="text-xs font-medium text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700/50" />
          AI Insight
        </span>
        <p className="font-serif text-xl text-ink italic leading-relaxed">
          "You've clearly mapped your evening triggers. The next step is observing the emotional aftermath without judgment."
        </p>
      </div>

      {/* L3 & L4 - The Portrait: Explanatory OLM Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        {/* Primary Signal: Pattern Mapping (Connecting Nodes) */}
        <div className="md:col-span-3 p-8 rounded-2xl border border-black/5 bg-white/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Pattern Mapping</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-700/10 px-2 py-0.5 rounded">Connecting</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            {/* Explanatory Visualization: Nodes */}
            <div className="flex items-center justify-center w-full max-w-[280px] mb-6">
              {/* Node 1: Activity (Clear) */}
              <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                <div className="w-8 h-8 rounded-full bg-emerald-700/20 flex items-center justify-center border border-emerald-700/30">
                  <div className="w-2.5 h-2.5 bg-emerald-700 rounded-full" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-ink font-medium text-center">Activity</span>
              </div>
              
              {/* Connection 1 */}
              <div className="flex-1 h-px bg-emerald-700/30 -mx-4 z-0" />
              
              {/* Node 2: Energy (Clear) */}
              <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                <div className="w-8 h-8 rounded-full bg-emerald-700/20 flex items-center justify-center border border-emerald-700/30">
                  <div className="w-2.5 h-2.5 bg-emerald-700 rounded-full" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-ink font-medium text-center">Energy</span>
              </div>
              
              {/* Connection 2 (Dashed/Unknown) */}
              <div className="flex-1 h-px border-t border-dashed border-black/20 -mx-4 z-0" />
              
              {/* Node 3: Insight (Unknown) */}
              <div className="flex flex-col items-center gap-2 relative z-10 w-16">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-black/10">
                  <div className="w-1.5 h-1.5 bg-black/10 rounded-full" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted text-center">Insight</span>
              </div>
            </div>
            
            <p className="text-sm text-muted leading-relaxed text-center max-w-xs">
              <strong className="font-medium text-ink">What this means:</strong> You are successfully tracking your activities and energy levels, but the deeper insights are still forming. Keep observing to connect the final dot.
            </p>
          </div>
        </div>

        {/* Secondary Signals */}
        <div className="md:col-span-2 flex flex-col gap-4">
          
          {/* Secondary 1: Observation Habit (Depth Sparkline) */}
          <div className="flex-1 p-6 rounded-2xl border border-black/5 bg-white/50 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-medium text-muted uppercase tracking-widest">Observation Habit</span>
            </div>
            {/* Explanatory Visualization: Bar Chart */}
            <div className="flex items-end gap-1.5 h-10 mb-3">
              <div className="w-full bg-ink/10 rounded-t-sm h-[30%]" />
              <div className="w-full bg-ink/20 rounded-t-sm h-[50%]" />
              <div className="w-full bg-ink/40 rounded-t-sm h-[40%]" />
              <div className="w-full bg-ink/70 rounded-t-sm h-[80%]" />
              <div className="w-full bg-ink rounded-t-sm h-[100%]" />
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-serif text-lg text-ink">Consistent</span>
              <span className="text-[10px] text-muted uppercase tracking-widest">Last 5 logs</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              You're building a strong habit of logging your energy. Consistency is key to finding reliable patterns.
            </p>
          </div>

          {/* Secondary 2: Prototype Readiness (Threshold Bar) */}
          <div className="flex-1 p-6 rounded-2xl border border-black/5 bg-white/50 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-medium text-muted uppercase tracking-widest">Prototype Readiness</span>
            </div>
            {/* Explanatory Visualization: Stage Progress */}
            <div className="flex items-center justify-between mb-2 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-black/10 z-0" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-px bg-ink z-0" />
              
              <div className="relative z-10 bg-white px-1 text-[10px] font-medium text-ink uppercase tracking-widest">Observe</div>
              <div className="relative z-10 bg-white/50 px-1 text-[10px] font-medium text-muted uppercase tracking-widest">Ideate</div>
              <div className="relative z-10 bg-white/50 px-1 text-[10px] font-medium text-muted uppercase tracking-widest">Build</div>
            </div>
            <p className="text-xs text-muted leading-relaxed mt-2">
              We are still in the observation phase. Focus on gathering data before we brainstorm solutions.
            </p>
          </div>
          
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-sm font-medium text-muted uppercase tracking-widest mb-6">Recent Insights</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border border-black/5 bg-white/50">
            <p className="font-serif text-lg text-ink mb-2">"My phone is a pacifier, not a tool."</p>
            <span className="text-xs text-muted">From Module 2: Reframe</span>
          </div>
          <div className="p-6 rounded-2xl border border-black/5 bg-white/50">
            <p className="font-serif text-lg text-ink mb-2">"Silence feels uncomfortable at first."</p>
            <span className="text-xs text-muted">From Module 1: Intro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
