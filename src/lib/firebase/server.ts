import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert, type App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import "server-only";
import serviceAccount from "../../../serviceAccountKey.json";

let adminApp: App;

if (!getAdminApps().length) {
    adminApp = initializeAdminApp({
        credential: cert(serviceAccount),
        projectId: 'hhsilentbidding',
        storageBucket: 'hhsilentbidding.appspot.com',
    });
} else {
    adminApp = getAdminApp();
}

const adminDb = getAdminFirestore(adminApp);
const adminAuth = getAdminAuth(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage, FieldValue };
