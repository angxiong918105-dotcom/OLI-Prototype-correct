<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0f2202da-a030-44b2-a277-45c5f50188df

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set values for:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `OPENAI_API_KEY` (server only)
   - (optional) `VITE_FIREBASE_MEASUREMENT_ID`, `OPENAI_MODEL`
3. Keep OpenAI credentials server-side only:
   - The frontend calls `/api/feedback`
   - The server route reads `OPENAI_API_KEY`
   - Do not add `VITE_OPENAI_*` variables
4. Run the app (web + API server):
   `npm run dev`

## Firestore data model

- `users/{uid}` stores learner progress metadata.
- `users/{uid}/journalEntries/{entryId}` stores journal entries.
- Legacy data under `users/{uid}/responses` is migrated once per user at load time.

## Legacy migration behavior

- On first load, the app checks whether legacy responses were already migrated.
- If not migrated, missing docs are copied from `responses` to `journalEntries`.
- The app writes migration metadata to `users/{uid}`:
  - `legacyResponsesMigratedAt`
  - `legacyResponsesMigratedCount`
- Reads use `journalEntries` after migration metadata is set.

## Deploy Firestore rules and indexes

1. Install Firebase CLI if needed:
   `npm install -g firebase-tools`
2. Login and select project:
   `firebase login`
   `firebase use your-firebase-project-id`
3. Deploy Firestore rules and indexes:
   `firebase deploy --only firestore:rules,firestore:indexes`

Config files in this repo:
- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`
- `.firebaserc`

## Manual verification still required

- Verify deployed rules with Firebase Console simulator or emulator tests.
- Verify an authenticated user cannot read/write another user's `users/{uid}` data.
- Verify first login for a legacy user migrates responses exactly once.
