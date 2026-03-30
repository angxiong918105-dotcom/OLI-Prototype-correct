import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { JournalEntry, ReflectionPayload } from "../types/journal";
import { generateReflectionFeedback } from "../lib/generateFeedback";
import {
  ensureAuth,
  loadUserState,
  saveJournalEntry,
  saveProgress,
  restartUserProgress,
  type UserProgress,
} from "../firebase";

type JournalContextType = {
  entries: JournalEntry[];
  latestEntry: JournalEntry | null;
  addEntry: (payload: ReflectionPayload) => Promise<JournalEntry>;
  updateEntry: (
    entryId: string,
    payload: ReflectionPayload,
    options?: { refreshFeedback?: boolean },
  ) => Promise<JournalEntry>;
  hasEntries: boolean;
  loading: boolean;
  error: string | null;
  restart: () => Promise<void>;
  progress: UserProgress;
};

const JournalContext = createContext<JournalContextType | null>(null);

const DEFAULT_PROGRESS: UserProgress = {
  currentModule: "intro",
  currentStep: 0,
  completedModules: [],
};

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On mount: authenticate & load Firestore state
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError(null);
      try {
        const user = await ensureAuth();
        if (cancelled) return;
        setUid(user.uid);

        const state = await loadUserState(user.uid);
        if (cancelled) return;

        setEntries(state.entries);
        setProgress(state.progress);
      } catch (err) {
        console.error("Failed to initialise user state:", err);
        setError(
          "Unable to initialize your secure session. Please refresh and try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const addEntry = useCallback(
    async (payload: ReflectionPayload): Promise<JournalEntry> => {
      if (!uid) {
        const message = "Session is not ready yet. Please try again in a moment.";
        setError(message);
        throw new Error(message);
      }

      setError(null);

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();

      // Generate AI feedback
      let aiResponse: string | undefined;
      try {
        aiResponse = await generateReflectionFeedback(payload);
        console.info('Stored feedback text:', aiResponse);
      } catch (err) {
        console.error("Failed to generate AI feedback:", err);
        aiResponse =
          "Your reflection has been saved. A thought will appear here once feedback is available.";
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

      // Update local state immediately
      const newCompleted = Array.from(
        new Set([...progress.completedModules, payload.moduleId]),
      );
      const newProgress: Partial<UserProgress> = {
        completedModules: newCompleted,
        currentModule: payload.moduleId,
      };

      try {
        await Promise.all([
          saveJournalEntry(uid, entry),
          saveProgress(uid, newProgress),
        ]);

        setEntries((prev) => [...prev, entry]);
        setProgress((prev) => ({ ...prev, ...newProgress }));

        return entry;
      } catch (err) {
        console.error("Failed to save entry:", err);
        const message =
          "We could not save your reflection right now. Please try again.";
        setError(message);
        throw new Error(message);
      }
    },
    [uid, progress.completedModules],
  );

  const updateEntry = useCallback(
    async (
      entryId: string,
      payload: ReflectionPayload,
      options?: { refreshFeedback?: boolean },
    ): Promise<JournalEntry> => {
      if (!uid) {
        const message = "Session is not ready yet. Please try again in a moment.";
        setError(message);
        throw new Error(message);
      }

      setError(null);
      const shouldRefreshFeedback = options?.refreshFeedback ?? false;

      let aiResponse: string | undefined;
      if (shouldRefreshFeedback) {
        try {
          aiResponse = await generateReflectionFeedback(payload);
          console.info("Updated feedback text:", aiResponse);
        } catch (err) {
          console.error("Failed to regenerate AI feedback:", err);
          aiResponse =
            "Your reflection has been saved. A thought will appear here once feedback is available.";
        }
      }

      const currentEntry = entries.find((entry) => entry.id === entryId);
      if (!currentEntry) {
        throw new Error("Entry not found");
      }

      const updatedEntry: JournalEntry = {
        ...currentEntry,
        moduleId: payload.moduleId,
        moduleTitle: payload.moduleTitle,
        meaningRating: payload.meaningRating,
        selectedSignals: payload.selectedSignals,
        reflectionText: payload.reflectionText,
        aiResponse: shouldRefreshFeedback ? aiResponse : currentEntry.aiResponse,
      };

      try {
        await saveJournalEntry(uid, updatedEntry);

        setEntries((prev) =>
          prev.map((entry) => (entry.id === entryId ? updatedEntry : entry)),
        );

        return updatedEntry;
      } catch (err) {
        console.error("Failed to update entry:", err);
        const message =
          "We could not update your reflection right now. Please try again.";
        setError(message);
        throw new Error(message);
      }
    },
    [uid, entries],
  );

  const restart = useCallback(async () => {
    if (!uid) {
      setError("Session is not ready yet. Please try again in a moment.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await restartUserProgress(uid);
      setEntries([]);
      setProgress({ ...DEFAULT_PROGRESS });
    } catch (err) {
      console.error("Failed to restart progress:", err);
      setError("We could not restart progress right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  return (
    <JournalContext.Provider
      value={{
        entries,
        latestEntry,
        addEntry,
        updateEntry,
        hasEntries: entries.length > 0,
        loading,
        error,
        restart,
        progress,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx)
    throw new Error("useJournal must be used within JournalProvider");
  return ctx;
}
