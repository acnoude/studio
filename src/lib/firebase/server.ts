
import {
  getAuth as getAdminAuth,
  initializeApp as initializeAdminApp,
  getApps as getAdminApps,
  getApp as getAdminApp,
  ServiceAccount,
} from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import "server-only";

let adminApp;

if (getAdminApps().length === 0) {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use default service account credentials
    adminApp = initializeAdminApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Development: Use a service account key if available, otherwise ADC
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string) as ServiceAccount;
       adminApp = initializeAdminApp({
        credential: {
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
        },
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (e) {
        console.log('Initializing with Application Default Credentials');
        adminApp = initializeAdminApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    }
  }
} else {
  adminApp = getAdminApp();
}


const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);
const adminStorage = getAdminStorage(adminApp);

export { adminApp, adminAuth, adminDb, adminStorage };

