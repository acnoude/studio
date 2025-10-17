
import { initializeApp as initializeAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import "server-only";

// This is a singleton pattern to ensure we only initialize the app once.
let adminApp: App | null = null;

function initializeFirebaseAdmin() {
    if (adminApp) {
        return adminApp;
    }

    const appName = 'firebase-admin-app-silentbid';
    const existingApp = getAdminApps().find(app => app.name === appName);
    if (existingApp) {
        adminApp = existingApp;
        return adminApp;
    }

    const serviceAccountEncoded = process.env.SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountEncoded) {
        throw new Error('The SERVICE_ACCOUNT_BASE64 environment variable is not set.');
    }

    try {
        const serviceAccountJson = Buffer.from(serviceAccountEncoded, 'base64').toString('utf8');
        if (!serviceAccountJson) {
            throw new Error("Base64 decoded service account JSON is empty.");
        }
        const serviceAccount = JSON.parse(serviceAccountJson);

        adminApp = initializeAdminApp({
            credential: cert(serviceAccount as any),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        }, appName);

        return adminApp;

    } catch (e: any) {
        throw new Error(`Failed to initialize Firebase Admin SDK. Error: ${e.message}`);
    }
}

// Instead of exporting the instances directly, we export getter functions.
// This defers the initialization until the function is called within a server-side context.

export function getAdminDb(): Firestore {
    const app = initializeFirebaseAdmin();
    // The "hhsilentbid" is the database ID for the named database.
    return getFirestore(app, "hhsilentbid");
}

export function getAdminAuth(): Auth {
    const app = initializeFirebaseAdmin();
    return getAuth(app);
}

export function getAdminStorage(): Storage {
    const app = initializeFirebaseAdmin();
    return getStorage(app);
}
