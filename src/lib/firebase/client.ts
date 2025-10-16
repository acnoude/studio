
"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Client-side Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

// Prevent Firebase initialization during server-side rendering
if (typeof window !== "undefined") {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, "hhsilentbid");
  storage = getStorage(app);
  functions = getFunctions(app);
}

// @ts-ignore
export { app, auth, db, storage, functions };
