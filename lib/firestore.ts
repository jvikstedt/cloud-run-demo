import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
// In Cloud Run, it automatically uses Application Default Credentials
if (!getApps().length) {
  initializeApp({
    projectId: process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT,
  });
}

export const db = getFirestore();

db.settings({
  ignoreUndefinedProperties: true,
});
