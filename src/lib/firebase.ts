import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Hardcoding credentials for debugging. This bypasses .env files to ensure the correct values are used.
const firebaseConfig = {
  apiKey: "AIzaSyAJuaRmfd4Sl7sojXaWWbSltj-8WyyHEbo",
  authDomain: "serviopro-vjgij.firebaseapp.com",
  projectId: "serviopro-vjgij",
  storageBucket: "serviopro-vjgij.appspot.com",
  messagingSenderId: "109077450046",
  appId: "1:109077450046:web:7672c9e4f6cb32dd6b706f"
};


// Log the config in development to help debug issues.
// This will only show in the browser's developer console.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log("Firebase Config being used:", {
        ...firebaseConfig,
        apiKey: firebaseConfig.apiKey ? `...${firebaseConfig.apiKey.slice(-4)}` : undefined,
    });
}

// Check if all required environment variables are present
const areCredsAvailable = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (areCredsAvailable) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
} else if (typeof window !== 'undefined') {
  // Log a warning only on the client-side to avoid server-side clutter
  console.warn("Firebase credentials are not set. Firebase features will be disabled.");
}

export { app, db, auth, areCredsAvailable };
