import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import "server-only";

let adminApp;

if (!getAdminApps().length) {
    console.log('Initializing Firebase Admin SDK with Application Default Credentials...');
    adminApp = initializeAdminApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
} else {
    adminApp = getAdminApp();
}

const adminDb = getAdminFirestore(adminApp, 'hhsilentbid');
const adminAuth = getAdminAuth(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage, FieldValue };
