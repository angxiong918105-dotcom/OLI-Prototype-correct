import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from "firebase/auth";
import type { JournalEntry } from "./types/journal";
import { clientEnv } from "./lib/env";

const firebaseConfig: FirebaseOptions = {
  apiKey: clientEnv.VITE_FIREBASE_API_KEY,
  authDomain: clientEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.VITE_FIREBASE_APP_ID,
  measurementId: clientEnv.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

let authBootstrapPromise: Promise<User> | null = null;

async function waitForInitialAuthState(timeoutMs = 5000): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const timer = globalThis.setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve();
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(
      auth,
      () => {
        if (settled) return;
        settled = true;
        globalThis.clearTimeout(timer);
        unsubscribe();
        resolve();
      },
      (error) => {
        if (settled) return;
        settled = true;
        globalThis.clearTimeout(timer);
        unsubscribe();
        reject(error);
      },
    );
  });
}

export async function ensureAuth(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  if (authBootstrapPromise) {
    return authBootstrapPromise;
  }

  authBootstrapPromise = (async () => {
    await waitForInitialAuthState();

    if (auth.currentUser) {
      return auth.currentUser;
    }

    const credential = await signInAnonymously(auth);
    return credential.user;
  })();

  try {
    return await authBootstrapPromise;
  } finally {
    authBootstrapPromise = null;
  }
}

/* ------------------------------------------------------------------ */
/*  Types for Firestore docs                                           */
/* ------------------------------------------------------------------ */

export interface UserProgress {
  currentModule: string;
  currentStep: number;
  completedModules: string[];
  uid?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  legacyResponsesMigratedAt?: Timestamp;
  legacyResponsesMigratedCount?: number;
}

const DEFAULT_PROGRESS: UserProgress = {
  currentModule: "intro",
  currentStep: 0,
  completedModules: [],
};

const PROFILE_CACHE = new Set<string>();

function coerceIsoDate(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return new Date().toISOString();
}

function normalizeProgress(uid: string, raw?: Partial<UserProgress>): UserProgress {
  return {
    uid,
    currentModule:
      typeof raw?.currentModule === "string" && raw.currentModule.length > 0
        ? raw.currentModule
        : DEFAULT_PROGRESS.currentModule,
    currentStep:
      typeof raw?.currentStep === "number" && Number.isFinite(raw.currentStep)
        ? raw.currentStep
        : DEFAULT_PROGRESS.currentStep,
    completedModules: Array.isArray(raw?.completedModules)
      ? raw.completedModules.filter((v): v is string => typeof v === "string")
      : [...DEFAULT_PROGRESS.completedModules],
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
    legacyResponsesMigratedAt: raw?.legacyResponsesMigratedAt,
    legacyResponsesMigratedCount:
      typeof raw?.legacyResponsesMigratedCount === "number"
        ? raw.legacyResponsesMigratedCount
        : undefined,
  };
}

function assertUid(uid: string): void {
  if (uid.trim().length === 0) {
    throw new Error("[firestore] Missing authenticated uid.");
  }
}

async function ensureUserProfile(uid: string): Promise<void> {
  assertUid(uid);

  if (PROFILE_CACHE.has(uid)) {
    return;
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      ...DEFAULT_PROGRESS,
      legacyResponsesMigratedAt: serverTimestamp(),
      legacyResponsesMigratedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  PROFILE_CACHE.add(uid);
}

function toJournalEntry(id: string, data: Record<string, unknown>): JournalEntry {
  return {
    id,
    moduleId: typeof data.moduleId === "string" ? data.moduleId : "",
    moduleTitle: typeof data.moduleTitle === "string" ? data.moduleTitle : undefined,
    createdAt: coerceIsoDate(data.createdAt),
    meaningRating:
      typeof data.meaningRating === "number" && Number.isFinite(data.meaningRating)
        ? data.meaningRating
        : undefined,
    selectedSignals: Array.isArray(data.selectedSignals)
      ? data.selectedSignals.filter((v): v is string => typeof v === "string")
      : [],
    reflectionText:
      typeof data.reflectionText === "string" ? data.reflectionText : undefined,
    aiResponse: typeof data.aiResponse === "string" ? data.aiResponse : undefined,
    mcqResults:
      data.mcqResults !== null &&
      typeof data.mcqResults === "object" &&
      !Array.isArray(data.mcqResults)
        ? (data.mcqResults as Record<string, boolean>)
        : undefined,
  };
}

async function loadCollectionEntries(uid: string, collectionName: string): Promise<JournalEntry[]> {
  const entriesRef = collection(db, "users", uid, collectionName);
  const entriesSnap = await getDocs(query(entriesRef, orderBy("createdAt", "asc")));

  return entriesSnap.docs.map((snapshot) =>
    toJournalEntry(snapshot.id, snapshot.data() as Record<string, unknown>),
  );
}

function toJournalEntryWritePayload(entry: JournalEntry) {
  return {
    moduleId: entry.moduleId,
    moduleTitle: entry.moduleTitle ?? null,
    createdAt: toTimestampFromIso(entry.createdAt),
    meaningRating: entry.meaningRating ?? null,
    selectedSignals: entry.selectedSignals ?? [],
    reflectionText: entry.reflectionText ?? null,
    aiResponse: entry.aiResponse ?? null,
    mcqResults: entry.mcqResults ?? null,
    updatedAt: serverTimestamp(),
  };
}

function toTimestampFromIso(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return serverTimestamp();
  }

  return Timestamp.fromDate(date);
}

async function migrateLegacyResponsesToJournalEntries(uid: string): Promise<number> {
  await ensureUserProfile(uid);

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as Partial<UserProgress> | undefined;
  if (userData?.legacyResponsesMigratedAt) {
    return userData.legacyResponsesMigratedCount ?? 0;
  }

  const legacySnap = await getDocs(collection(db, "users", uid, "responses"));
  if (legacySnap.empty) {
    await setDoc(
      userRef,
      {
        legacyResponsesMigratedAt: serverTimestamp(),
        legacyResponsesMigratedCount: 0,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return 0;
  }

  const targetSnap = await getDocs(collection(db, "users", uid, "journalEntries"));
  const existingTargetIds = new Set(targetSnap.docs.map((snapshot) => snapshot.id));

  const batch = writeBatch(db);
  let migratedCount = 0;

  for (const legacyDoc of legacySnap.docs) {
    if (existingTargetIds.has(legacyDoc.id)) {
      continue;
    }

    const normalized = toJournalEntry(
      legacyDoc.id,
      legacyDoc.data() as Record<string, unknown>,
    );

    const targetRef = doc(db, "users", uid, "journalEntries", legacyDoc.id);
    batch.set(targetRef, toJournalEntryWritePayload(normalized), { merge: true });
    migratedCount += 1;
  }

  batch.set(
    userRef,
    {
      legacyResponsesMigratedAt: serverTimestamp(),
      legacyResponsesMigratedCount: migratedCount,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
  return migratedCount;
}

export async function listJournalEntries(uid: string): Promise<JournalEntry[]> {
  assertUid(uid);
  await ensureUserProfile(uid);
  return loadCollectionEntries(uid, "journalEntries");
}

export async function getJournalEntry(
  uid: string,
  entryId: string,
): Promise<JournalEntry | null> {
  assertUid(uid);
  await ensureUserProfile(uid);

  const entrySnap = await getDoc(doc(db, "users", uid, "journalEntries", entryId));
  if (!entrySnap.exists()) {
    return null;
  }

  return toJournalEntry(
    entrySnap.id,
    entrySnap.data() as Record<string, unknown>,
  );
}

/* ------------------------------------------------------------------ */
/*  Load full user state                                               */
/* ------------------------------------------------------------------ */

export async function loadUserState(uid: string): Promise<{
  progress: UserProgress;
  entries: JournalEntry[];
}> {
  assertUid(uid);
  await ensureUserProfile(uid);
  await migrateLegacyResponsesToJournalEntries(uid);

  const userSnap = await getDoc(doc(db, "users", uid));
  const progress = normalizeProgress(uid, userSnap.data() as Partial<UserProgress> | undefined);

  return {
    progress,
    entries: await listJournalEntries(uid),
  };
}

/* ------------------------------------------------------------------ */
/*  Save a single response (journal entry)                             */
/* ------------------------------------------------------------------ */

export async function saveJournalEntry(
  uid: string,
  entry: JournalEntry,
): Promise<void> {
  assertUid(uid);
  await ensureUserProfile(uid);

  const entryRef = doc(db, "users", uid, "journalEntries", entry.id);
  await setDoc(entryRef, toJournalEntryWritePayload(entry), { merge: true });
}

export const saveResponse = saveJournalEntry;

/* ------------------------------------------------------------------ */
/*  Save progress (current module / step / completions)                */
/* ------------------------------------------------------------------ */

export async function saveProgress(
  uid: string,
  progress: Partial<UserProgress>,
): Promise<void> {
  assertUid(uid);
  await ensureUserProfile(uid);

  await setDoc(
    doc(db, "users", uid),
    {
      uid,
      ...progress,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/* ------------------------------------------------------------------ */
/*  Restart – clear responses & reset progress, keep same uid          */
/* ------------------------------------------------------------------ */

export async function restartUserProgress(uid: string): Promise<void> {
  assertUid(uid);
  await ensureUserProfile(uid);

  const journalSnap = await getDocs(collection(db, "users", uid, "journalEntries"));
  const responsesSnap = await getDocs(collection(db, "users", uid, "responses"));

  const batch = writeBatch(db);
  journalSnap.docs.forEach((d) => batch.delete(d.ref));
  responsesSnap.docs.forEach((d) => batch.delete(d.ref));

  batch.set(doc(db, "users", uid), {
    uid,
    ...DEFAULT_PROGRESS,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await batch.commit();
}
