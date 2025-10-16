
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert, type App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import "server-only";

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT!)

const appName = 'firebase-admin-app-silentbid';
let adminApp: App;

if (!getAdminApps().some(app => app.name === appName)) {
  adminApp = initializeAdminApp({
    credential: cert(serviceAccount as any),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  }, appName);
} else {
  adminApp = getAdminApp(appName);
}

const adminDb = getAdminFirestore(adminApp, "hhsilentbid");
const adminAuth = getAdminAuth(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };
