import { cert } from 'firebase-admin/app';
import { getAuth, type Auth as AdminAuth } from 'firebase-admin/auth';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';

// Server-side Firebase Admin SDK configuration
let adminAuth: AdminAuth | null = null;

const haveAdminCreds = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (haveAdminCreds) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
        if (getAdminApps().length === 0) {
            initializeAdminApp({
                credential: cert(serviceAccount)
            });
        }
        adminAuth = getAuth();
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
