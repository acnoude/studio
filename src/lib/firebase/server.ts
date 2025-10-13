
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert, type App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import * as serviceAccount from "../../../serviceAccountKey.json";
import "server-only";

const appName = 'firebase-admin-app-silentbid';
let adminApp: App;

// This prevents initializing the app multiple times in server environments
if (!getAdminApps().some(app => app.name === appName)) {
  adminApp = initializeAdminApp({
    // Type assertion to satisfy 'cert' function's expectation.
    credential: cert(serviceAccount as any),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  }, appName);
} else {
  adminApp = getAdminApp(appName);
}

const adminDb = getAdminFirestore(adminApp);
const adminAuth = getAdminAuth(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
