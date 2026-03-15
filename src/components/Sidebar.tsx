import { NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const phases = [
  {
    title: 'Phase 1: Discover',
    modules: [
      { id: 'intro', title: 'Introduction', desc: 'Set your intention', path: '/module/intro' },
      { id: 'reframe', title: 'Reframe', desc: 'Shift your perspective', path: '/module/reframe' },
      { id: 'observe', title: 'Observe', desc: 'Track energy & engagement', path: '/reflection/observe' },
    ]
  },
  {
    title: 'Phase 2: Invent',
    modules: [
      { id: 'branching', title: 'Branching', desc: 'Map out multiple lives', path: '/module/branching' },
      { id: 'ideate', title: 'Ideate', desc: 'Brainstorm alternative paths', path: '/module/ideate' },
    ]
  },
  {
    title: 'Phase 3: Build',
    modules: [
      { id: 'prototype', title: 'Prototype', desc: 'Test low-fidelity solutions', path: '/module/prototype' },
      { id: 'test', title: 'Test & Reflect', desc: 'Gather feedback and iterate', path: '/reflection/test' },
      { id: 'plan', title: 'Final Plan', desc: 'Commit to your next step', path: '/module/plan' },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  
  // Flatten modules to find active index
  const allModules = phases.flatMap(p => p.modules);
  let activeIndex = allModules.findIndex(m => location.pathname.startsWith(m.path));
  
  // Default to 'Observe' (index 2) if on dashboard or unknown route
  if (activeIndex === -1) {
    activeIndex = 2; 
  }

  const progressPercentage = Math.round((activeIndex / (allModules.length - 1)) * 100);

  return (
    <aside className="w-72 h-screen border-r border-black/5 bg-paper flex flex-col pt-8 pb-6 sticky top-0 shrink-0">
      {/* Header */}
      <div className="mb-8 px-6">
        <Link to="/" className="block">
          <h1 className="font-serif text-xl font-medium tracking-tight text-ink">Project Shift</h1>
          <p className="text-xs text-muted mt-1">Life Design Experiment</p>
        </Link>
      </div>

      {/* Dashboard Link */}
      <div className="px-4 mb-8">
        <NavLink 
          to="/" 
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive && location.pathname === '/' ? 'bg-white shadow-sm border border-black/5 text-ink font-medium' : 'text-muted hover:bg-black/5 hover:text-ink'}`} 
          end
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
      </div>

      {/* Journey Roadmap */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-medium text-muted uppercase tracking-widest">Journey Progress</span>
            <span className="text-xs font-serif text-ink">{progressPercentage}%</span>
          </div>
          <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
            <div className="h-full bg-ink rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Phases */}
        <div className="space-y-8">
          {phases.map((phase, pIdx) => (
            <div key={pIdx}>
              <h3 className="text-[10px] font-semibold text-ink/40 uppercase tracking-widest mb-5">{phase.title}</h3>
              <div className="relative pl-2">
                {/* Vertical Line for the phase */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-black/5" />
                
                <div className="space-y-6">
                  {phase.modules.map((mod, mIdx) => {
                    const globalIndex = phases.slice(0, pIdx).reduce((acc, p) => acc + p.modules.length, 0) + mIdx;
                    const isCompleted = globalIndex < activeIndex;
                    const isCurrent = globalIndex === activeIndex;
                    const isUpcoming = globalIndex > activeIndex;

                    return (
                      <NavLink key={mod.id} to={mod.path} className="relative flex items-start gap-4 group">
                        {/* Node */}
                        <div className="relative z-10 mt-1 flex items-center justify-center w-6 h-6 bg-paper">
                          {isCompleted && <div className="w-2 h-2 rounded-full bg-ink" />}
                          {isCurrent && (
                            <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-ink flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-ink" />
                            </div>
                          )}
                          {isUpcoming && <div className="w-2 h-2 rounded-full border border-black/20 bg-paper" />}
                        </div>
                        
                        {/* Content */}
                        <div className="flex flex-col pt-0.5">
                          <span className={`text-sm transition-colors ${isCurrent ? 'text-ink font-medium' : isCompleted ? 'text-ink/70 group-hover:text-ink' : 'text-muted group-hover:text-ink/70'}`}>
                            {mod.title}
                          </span>
                          {(isCurrent || isCompleted) && (
                            <span className={`text-xs mt-1 leading-snug ${isCurrent ? 'text-muted' : 'text-black/30'}`}>
                              {mod.desc}
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="text-xs mt-1 leading-snug text-black/20 group-hover:text-black/40 transition-colors">
                              {mod.desc}
                            </span>
                          )}
                        </div>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-auto pt-4 px-4 border-t border-black/5">
        <div className="px-3 py-2 flex items-center gap-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center text-xs font-medium text-ink shrink-0">
            ME
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-ink truncate">My Workspace</span>
            <span className="text-xs text-muted truncate">View all insights</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
