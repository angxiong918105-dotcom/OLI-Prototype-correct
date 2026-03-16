import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { JournalEntry, ReflectionPayload } from '../types/journal';
import { generateReflectionFeedback } from '../lib/generateFeedback';

type JournalContextType = {
  entries: JournalEntry[];
  latestEntry: JournalEntry | null;
  addEntry: (payload: ReflectionPayload) => Promise<JournalEntry>;
  hasEntries: boolean;
};

const JournalContext = createContext<JournalContextType | null>(null);

const STORAGE_KEY = 'meaning-journal-entries';

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>(loadEntries);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const addEntry = async (payload: ReflectionPayload): Promise<JournalEntry> => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // Generate AI feedback
    let aiResponse: string | undefined;
    try {
      aiResponse = await generateReflectionFeedback(payload);
    } catch (err) {
      console.error('Failed to generate AI feedback:', err);
      aiResponse = 'Your reflection has been saved. A thought will appear here once feedback is available.';
    }

    const entry: JournalEntry = {
      id,
      moduleId: payload.moduleId,
      moduleTitle: payload.moduleTitle,
      createdAt,
      meaningRating: payload.meaningRating,
      selectedSignals: payload.selectedSignals,
      reflectionText: payload.reflectionText,
      aiResponse,
    };

    setEntries(prev => [...prev, entry]);
    return entry;
  };

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  return (
    <JournalContext.Provider value={{ entries, latestEntry, addEntry, hasEntries: entries.length > 0 }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used within JournalProvider');
  return ctx;
}
