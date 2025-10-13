
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert, type App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import "server-only";

// The serviceAccountKey.json is read from an environment variable.
// This is a more secure and standard way to handle credentials in production.
const serviceAccount = JSON.parse(
  process.env.SERVICE_ACCOUNT_KEY || "{}"
);

const appName = 'firebase-admin-app';
let adminApp: App;

if (!getAdminApps().some(app => app.name === appName)) {
  adminApp = initializeAdminApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  }, appName);
} else {
  adminApp = getAdminApp(appName);
}

const adminDb = getAdminFirestore(adminApp);
const adminAuth = getAdminAuth(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
