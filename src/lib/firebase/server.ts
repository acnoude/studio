import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert, type App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import "server-only";

let adminApp: App;

if (!getAdminApps().length) {
    try {
        console.log('Initializing Firebase Admin SDK...');
        const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountString) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Falling back to default credentials.");
        }
        const serviceAccount = JSON.parse(serviceAccountString);
        adminApp = initializeAdminApp({
            credential: cert(serviceAccount),
            projectId: 'hhsilentbidding',
            storageBucket: 'hhsilentbidding.appspot.com',
        });
    } catch (e: any) {
        console.error("Failed to initialize with Service Account. Falling back to default credentials.", e.message);
        console.log('Initializing Firebase Admin SDK with Application Default Credentials...');
        adminApp = initializeAdminApp({
            projectId: 'hhsilentbidding',
        });
    }
} else {
    adminApp = getAdminApp();
}

const adminDb = getAdminFirestore(adminApp);
const adminAuth = getAdminAuth(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage, FieldValue };
