
'use server';

import * as admin from 'firebase-admin';
import { getExtensions } from 'firebase-admin/extensions';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("Firebase Admin SDK initialization error:", error.message);
    // Don't throw here, let the function handle the uninitialized state.
  }
}

// Name of the installed Stripe extension instance
const EXTENSION_INSTANCE_ID = 'firestore-stripe-payments';

export async function getWebhookInfo() {
  if (!admin.apps.length) {
    console.warn('Firebase Admin SDK not initialized. Cannot fetch webhook info.');
    return null;
  }
  
  console.log(`Attempting to get runtime data for extension instance: ${EXTENSION_INSTANCE_ID}`);

  try {
    const runtime = getExtensions().runtime();
    const sub = await runtime.getSubstitutions(EXTENSION_INSTANCE_ID);
    
    // The keys for URL and secret are based on the extension.yaml of the official Stripe extension.
    // URL key is 'WEBHOOK_URL' and secret key is 'STRIPE_WEBHOOK_SECRET_NAME'.
    const webhookUrl = sub.WEBHOOK_URL;
    const webhookSecretName = sub.STRIPE_WEBHOOK_SECRET_NAME;

    if (!webhookUrl) {
      console.warn('WEBHOOK_URL not found in extension runtime data.');
      return null;
    }

    return {
      url: webhookUrl,
      // We only include the secret name for context, not the actual secret value.
      // The user should get the secret from the Stripe dashboard.
      secret: webhookSecretName ? `The secret is stored in Firebase Secret Manager under this name: ${webhookSecretName}` : undefined,
    };
  } catch (error) {
    console.error(`Error getting substitutions for extension '${EXTENSION_INSTANCE_ID}':`, error);
    // This often happens if the instance ID is incorrect or the extension isn't fully installed.
    return null;
  }
}

    