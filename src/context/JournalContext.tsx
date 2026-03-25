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
  saveResponse,
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

  // On mount: authenticate & load Firestore state
  useEffect(() => {
    let cancelled = false;

    (async () => {
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
      if (!uid) throw new Error("User not authenticated");

      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const hasReflectionText = Boolean(payload.reflectionText?.trim());

      // Generate AI feedback
      let aiResponse: string | undefined;
      if (hasReflectionText) {
        try {
          aiResponse = await generateReflectionFeedback(payload);
          console.info('Stored feedback text:', aiResponse);
        } catch (err) {
          console.error("Failed to generate AI feedback:", err);
          aiResponse =
            "Your reflection has been saved. A thought will appear here once feedback is available.";
        }
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
      setEntries((prev) => [...prev, entry]);

      // Update completed modules
      const newCompleted = Array.from(
        new Set([...progress.completedModules, payload.moduleId]),
      );
      const newProgress: Partial<UserProgress> = {
        completedModules: newCompleted,
        currentModule: payload.moduleId,
      };
      setProgress((prev) => ({ ...prev, ...newProgress }));

      // Persist to Firestore (fire and forget with error logging)
      saveResponse(uid, entry).catch(console.error);
      saveProgress(uid, newProgress).catch(console.error);

      return entry;
    },
    [uid, progress.completedModules],
  );

  const updateEntry = useCallback(
    async (
      entryId: string,
      payload: ReflectionPayload,
      options?: { refreshFeedback?: boolean },
    ): Promise<JournalEntry> => {
      if (!uid) throw new Error("User not authenticated");
      const hasReflectionText = Boolean(payload.reflectionText?.trim());
      const shouldRefreshFeedback = options?.refreshFeedback ?? false;

      let aiResponse: string | undefined;
      if (hasReflectionText && shouldRefreshFeedback) {
        try {
          aiResponse = await generateReflectionFeedback(payload);
          console.info("Updated feedback text:", aiResponse);
        } catch (err) {
          console.error("Failed to regenerate AI feedback:", err);
          aiResponse =
            "Your reflection has been saved. A thought will appear here once feedback is available.";
        }
      }

      let updatedEntry: JournalEntry | null = null;
      setEntries((prev) => {
        const next = prev.map((entry) => {
          if (entry.id !== entryId) return entry;
          updatedEntry = {
            ...entry,
            moduleId: payload.moduleId,
            moduleTitle: payload.moduleTitle,
            meaningRating: payload.meaningRating,
            selectedSignals: payload.selectedSignals,
            reflectionText: payload.reflectionText,
            aiResponse: hasReflectionText
              ? (shouldRefreshFeedback ? aiResponse : entry.aiResponse)
              : undefined,
          };
          return updatedEntry;
        });
        return next;
      });

      if (!updatedEntry) {
        throw new Error("Entry not found");
      }

      saveResponse(uid, updatedEntry).catch(console.error);
      return updatedEntry;
    },
    [uid],
  );

  const restart = useCallback(async () => {
    if (!uid) return;

    setLoading(true);
    try {
      await restartUserProgress(uid);
      setEntries([]);
      setProgress({ ...DEFAULT_PROGRESS });
    } catch (err) {
      console.error("Failed to restart progress:", err);
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
