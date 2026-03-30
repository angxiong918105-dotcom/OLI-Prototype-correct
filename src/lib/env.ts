type RequiredClientEnvKey =
  | "VITE_FIREBASE_API_KEY"
  | "VITE_FIREBASE_AUTH_DOMAIN"
  | "VITE_FIREBASE_PROJECT_ID"
  | "VITE_FIREBASE_STORAGE_BUCKET"
  | "VITE_FIREBASE_MESSAGING_SENDER_ID"
  | "VITE_FIREBASE_APP_ID";

export type ClientEnv = {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;
};

const REQUIRED_KEYS: RequiredClientEnvKey[] = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

function getRequiredEnvValue(key: RequiredClientEnvKey): string {
  const value = import.meta.env[key];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  throw new Error(
    `[firebase] Missing required environment variable: ${key}. ` +
      `Add it to your .env.local file before starting the app.`,
  );
}

export function getClientEnv(): ClientEnv {
  const env: Partial<ClientEnv> = {};

  for (const key of REQUIRED_KEYS) {
    env[key] = getRequiredEnvValue(key);
  }

  const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
  if (typeof measurementId === "string" && measurementId.trim().length > 0) {
    env.VITE_FIREBASE_MEASUREMENT_ID = measurementId.trim();
  }

  return env as ClientEnv;
}

export const clientEnv = getClientEnv();
