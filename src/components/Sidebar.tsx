import { NavLink, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen } from 'lucide-react';
import { modules } from '../data/modules';
import { useJournal } from '../context/JournalContext';

export default function Sidebar() {
  const location = useLocation();
  const { hasEntries, entries } = useJournal();

  const completedIds = new Set(entries.map(e => e.moduleId));
  const activeIndex = modules.findIndex(m => location.pathname.startsWith(m.path));

  return (
    <aside className="w-72 h-screen border-r border-black/[0.08] bg-paper flex flex-col pt-8 pb-6 sticky top-0 shrink-0">
      {/* Header */}
      <div className="mb-8 px-6">
        <Link to="/" className="block">
          <h1 className="font-serif text-xl font-medium tracking-tight text-ink">Meaning by Design</h1>
        </Link>
      </div>

      {/* Dashboard Link */}
      <div className="px-4 mb-2">
        <NavLink
          to="/"
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive && location.pathname === '/' ? 'bg-white shadow-sm border border-black/[0.08] text-ink font-medium' : 'text-muted hover:bg-black/[0.04] hover:text-ink'}`}
          end
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
      </div>

      {/* Journal Link */}
      <div className="px-4 mb-6">
        <NavLink
          to="/journal"
          className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? 'bg-white shadow-sm border border-black/[0.08] text-ink font-medium' : 'text-muted hover:bg-black/[0.04] hover:text-ink'}`}
        >
          <BookOpen className="w-4 h-4" />
          Meaning Journal
          {hasEntries && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ink" />
          )}
        </NavLink>
      </div>

      {/* Learning Progress */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-hide">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-[10px] font-semibold text-ink/40 uppercase tracking-widest">Learning Progress</h3>
          <span className="text-[10px] text-muted/50 tabular-nums">{completedIds.size} of {modules.length} modules</span>
        </div>

        <div className="relative pl-2">
          {/* Vertical Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-black/[0.08]" />

          <div className="space-y-5">
            {modules.map((mod, idx) => {
              const isCompleted = completedIds.has(mod.id);
              const isCurrent = idx === activeIndex && !isCompleted;

              return (
                <NavLink key={mod.id} to={mod.path} className={`relative flex items-start gap-4 group rounded-lg px-2 py-1.5 -mx-2 transition-colors ${isCurrent ? 'bg-ink/[0.04]' : ''}`}>
                  {/* Node */}
                  <div className="relative z-10 mt-1 flex items-center justify-center w-6 h-6 bg-paper">
                    {isCompleted && <div className="w-2 h-2 rounded-full bg-ink" />}
                    {isCurrent && (
                      <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-ink flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-ink" />
                      </div>
                    )}
                    {!isCompleted && !isCurrent && <div className="w-2 h-2 rounded-full border border-black/20 bg-paper" />}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col pt-0.5">
                    <span className={`text-sm transition-colors ${isCurrent ? 'text-ink font-semibold' : isCompleted ? 'text-ink/80 group-hover:text-ink' : 'text-muted group-hover:text-ink/70'}`}>
                      Module {mod.number}: {mod.title}
                    </span>
                    <span className={`text-xs mt-1 leading-snug ${isCurrent ? 'text-muted' : isCompleted ? 'text-muted/60' : 'text-muted/40 group-hover:text-muted/60 transition-colors'}`}>
                      {mod.desc}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
