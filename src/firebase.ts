import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import type { JournalEntry } from "./types/journal";

const firebaseConfig = {
  apiKey: "AIzaSyAsyIYKaxtBjk8wf0k4uEheL7oz72DDO64",
  authDomain: "meaningbydesign-7098a.firebaseapp.com",
  projectId: "meaningbydesign-7098a",
  storageBucket: "meaningbydesign-7098a.firebasestorage.app",
  messagingSenderId: "513603369296",
  appId: "1:513603369296:web:1ba976604fada6c37a5455",
  measurementId: "G-H4EF6NCESG",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

export async function ensureAuth(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;

  await signInAnonymously(auth);

  return await new Promise<User>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        }
      },
      reject,
    );
  });
}

/* ------------------------------------------------------------------ */
/*  Types for Firestore docs                                           */
/* ------------------------------------------------------------------ */

export interface UserProgress {
  currentModule: string;
  currentStep: number;
  completedModules: string[];
  updatedAt?: Timestamp;
}

const DEFAULT_PROGRESS: UserProgress = {
  currentModule: "intro",
  currentStep: 0,
  completedModules: [],
};

/* ------------------------------------------------------------------ */
/*  Load full user state                                               */
/* ------------------------------------------------------------------ */

export async function loadUserState(uid: string): Promise<{
  progress: UserProgress;
  entries: JournalEntry[];
}> {
  // Load progress doc
  const progressSnap = await getDoc(doc(db, "users", uid));
  const progress: UserProgress = progressSnap.exists()
    ? (progressSnap.data() as UserProgress)
    : { ...DEFAULT_PROGRESS };

  // Load all response docs → JournalEntry[]
  const responsesSnap = await getDocs(
    collection(db, "users", uid, "responses"),
  );

  const entries: JournalEntry[] = responsesSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      moduleId: data.moduleId ?? "",
      moduleTitle: data.moduleTitle,
      createdAt: data.createdAt ?? "",
      meaningRating: data.meaningRating,
      selectedSignals: data.selectedSignals,
      reflectionText: data.reflectionText,
      aiResponse: data.aiResponse,
    } as JournalEntry;
  });

  // Sort by createdAt ascending
  entries.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return { progress, entries };
}

/* ------------------------------------------------------------------ */
/*  Save a single response (journal entry)                             */
/* ------------------------------------------------------------------ */

export async function saveResponse(
  uid: string,
  entry: JournalEntry,
): Promise<void> {
  await setDoc(doc(db, "users", uid, "responses", entry.id), {
    moduleId: entry.moduleId,
    moduleTitle: entry.moduleTitle ?? null,
    createdAt: entry.createdAt,
    meaningRating: entry.meaningRating ?? null,
    selectedSignals: entry.selectedSignals ?? [],
    reflectionText: entry.reflectionText ?? null,
    aiResponse: entry.aiResponse ?? null,
    updatedAt: serverTimestamp(),
  });
}

/* ------------------------------------------------------------------ */
/*  Save progress (current module / step / completions)                */
/* ------------------------------------------------------------------ */

export async function saveProgress(
  uid: string,
  progress: Partial<UserProgress>,
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    { ...progress, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/* ------------------------------------------------------------------ */
/*  Restart – clear responses & reset progress, keep same uid          */
/* ------------------------------------------------------------------ */

export async function restartUserProgress(uid: string): Promise<void> {
  // Delete all response docs
  const responsesSnap = await getDocs(
    collection(db, "users", uid, "responses"),
  );

  const batch = writeBatch(db);
  responsesSnap.docs.forEach((d) => batch.delete(d.ref));

  // Reset user progress doc
  batch.set(doc(db, "users", uid), {
    ...DEFAULT_PROGRESS,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}
