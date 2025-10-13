import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert, type App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import "server-only";

let adminApp: App;

if (!getAdminApps().length) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountString) {
        try {
            const serviceAccount = JSON.parse(serviceAccountString);
            adminApp = initializeAdminApp({
                credential: cert(serviceAccount),
                projectId: 'hhsilentbidding',
                storageBucket: 'hhsilentbidding.appspot.com',
            });
        } catch (e: any) {
            console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY. Initializing with default credentials.", e.message);
            adminApp = initializeAdminApp({ projectId: 'hhsilentbidding' });
        }
    } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Initializing with default credentials. This is not recommended for production.");
        adminApp = initializeAdminApp({ projectId: 'hhsilentbidding' });
    }
} else {
    adminApp = getAdminApp();
}

const adminDb = getAdminFirestore(adminApp);
const adminAuth = getAdminAuth(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage, FieldValue };
