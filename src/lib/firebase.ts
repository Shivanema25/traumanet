// Firebase Client Initialization with safe Next.js hot-reload handling
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyTraumaNetMockApiKey1234567890",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "traumanet-emergency.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "traumanet-emergency",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "traumanet-emergency.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "108108108108",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:108108108108:web:abcdef1234567890",
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let db: Firestore;
try {
  db = getFirestore(app);
} catch (e) {
  console.warn("Firestore initialization deferred or in offline mock mode:", e);
  db = null as unknown as Firestore;
}

export { app, db };
