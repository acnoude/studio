
import {
  getAuth as getAdminAuth,
  initializeApp as initializeAdminApp,
  getApps as getAdminApps,
  getApp as getAdminApp,
} from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import "server-only";

// Server-side Firebase (Admin)
const adminApp =
  getAdminApps().length > 0
    ? getAdminApp()
    : initializeAdminApp({
        credential: undefined, // In production, use a service account
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });

const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
