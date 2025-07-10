import { initializeApp, getApps, getApp, type FirebaseApp, cert } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth as getAdminAuth, type Auth as AdminAuth } from 'firebase-admin/auth';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';

// Client-side Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const areCredsAvailable = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize client-side Firebase app
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (areCredsAvailable) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else if (typeof window !== 'undefined') {
  console.warn("Firebase client credentials are not set. Some features may be disabled.");
}

export { app, db, auth, storage };


// Server-side Firebase Admin SDK configuration
let adminAuth: AdminAuth | null = null;

const haveAdminCreds = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (haveAdminCreds) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
        if (getAdminApps().length === 0) {
            initializeAdminApp({
                credential: cert(serviceAccount)
            });
        }
        adminAuth = getAdminAuth();
    } catch(e) {
        console.error("Failed to initialize Firebase Admin SDK:", e);
    }
} else if (process.env.NODE_ENV !== 'production') {
    console.warn("Firebase Admin credentials are not set (FIREBASE_SERVICE_ACCOUNT_KEY). Server-side auth features will be disabled.");
}

export function getFirebaseAdmin() {
    if (!adminAuth) {
        throw new Error("Firebase Admin SDK has not been initialized. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set.");
    }
    return { auth: adminAuth };
}
