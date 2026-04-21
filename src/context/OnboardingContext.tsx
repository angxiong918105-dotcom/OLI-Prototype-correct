import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type OnboardingPath = 'flow' | 'coherency' | 'both';

export const onboardingPathPlans: Record<OnboardingPath, number[]> = {
  flow: [1, 2, 3, 4],
  coherency: [1, 2, 3, 5],
  both: [1, 2, 3, 4, 5],
};

const STORAGE_KEY = 'onboarding_interest';

type OnboardingContextType = {
  path: OnboardingPath | null;
  setPath: (path: OnboardingPath | null) => void;
  activeModules: Set<number>;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [path, setPathState] = useState<OnboardingPath | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as OnboardingPath | null;
      return saved && saved in onboardingPathPlans ? saved : null;
    } catch {
      return null;
    }
  });

  const setPath = (next: OnboardingPath | null) => {
    setPathState(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // Listen to changes from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = e.newValue as OnboardingPath | null;
      setPathState(next && next in onboardingPathPlans ? next : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const activeModules = new Set<number>(path ? onboardingPathPlans[path] : []);

  return (
    <OnboardingContext.Provider value={{ path, setPath, activeModules }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
