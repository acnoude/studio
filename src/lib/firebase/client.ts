
"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCuFhTgLHpnkPB8liRadG2IFbDyqaMFXKc",
  authDomain: "hhsilentbidding.firebaseapp.com",
  projectId: "hhsilentbidding",
  storageBucket: "hhsilentbidding.firebasestorage.app",
  messagingSenderId: "316633780557",
  appId: "1:316633780557:web:329a39ab59c3a772e26704",
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
