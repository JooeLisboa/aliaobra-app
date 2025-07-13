
'use server';

import { execSync } from 'child_process';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// This script is meant to be run from the root of the project.
// It fetches Firebase configuration and populates the .env file.
// Usage: npm run setup:firebase

function setupFirebase() {
  console.log('Attempting to configure Firebase environment variables...');

  try {
    // Check for Firebase CLI login status
    console.log('Checking Firebase CLI login status...');
    execSync('firebase login:list', { stdio: 'pipe', encoding: 'utf-8' });
    console.log('Firebase CLI is logged in.');
  } catch (error) {
    console.error('Error: You are not logged into the Firebase CLI.');
    console.error('Please run "firebase login" in your terminal and try again.');
    process.exit(1);
  }

  let projectId: string;
  try {
    // Get the current Firebase project ID
    console.log('Getting current Firebase project ID...');
    const useOutput = execSync('firebase use', { encoding: 'utf-8' }).trim();
     if (!useOutput || useOutput.includes('No active project')) {
        throw new Error("No active Firebase project is selected.");
    }
    const match = useOutput.match(/Active Project: ([\w-]+)/);
    if (match && match[1]) {
      projectId = match[1];
    } else {
      // Fallback for cases where the output is just the project ID
      projectId = useOutput.split('\n').pop()!.trim();
    }
    
    if (!projectId) {
      throw new Error("Could not determine the active Firebase project ID from the command output.");
    }
    
    console.log(`Detected Firebase project: ${projectId}`);
  } catch (error) {
    console.error('Error: Could not determine the active Firebase project.');
    console.error('Please run "firebase use <your-project-id>" in your terminal and try again.');
    process.exit(1);
  }

  try {
    // List all apps using the --json flag for reliable parsing
    console.log(`Listing Firebase apps for project ${projectId}...`);
    const appsListOutput = execSync(`firebase apps:list --json --project ${projectId}`, { encoding: 'utf-8' });
    const appsResult = JSON.parse(appsListOutput);
    
    if (!appsResult || !appsResult.result || !Array.isArray(appsResult.result)) {
        throw new Error('Could not parse the list of Firebase apps. The format might have changed.');
    }

    const webApp = appsResult.result.find((app: any) => app.platform === 'WEB');

    if (!webApp || !webApp.appId) {
        throw new Error('No WEB app found in the Firebase project. Please create one in the Firebase console.');
    }
    
    const webAppId = webApp.appId.trim();
    console.log(`Found Web App with ID: ${webAppId}`);

    // Get the web app config from Firebase using the specific App ID
    console.log(`Fetching Firebase web app configuration for App ID ${webAppId}...`);
    const configResultJson = execSync(`firebase apps:sdkconfig WEB ${webAppId} --json --project ${projectId}`, { encoding: 'utf-8' });
    
    const parsedConfig = JSON.parse(configResultJson);
    const firebaseConfig = parsedConfig.result?.sdkConfig;

    if (!firebaseConfig || !firebaseConfig.apiKey) {
      throw new Error("Could not parse the Firebase config JSON from the CLI output. The 'sdkConfig' property was not found.");
    }

    // Path to the .env file in the project root
    const envPath = resolve(process.cwd(), '.env');
    console.log(`Checking for existing .env file at ${envPath}`);

    let envContent = '';
    if (existsSync(envPath)) {
        console.log('.env file already exists. Reading existing content.');
        envContent = readFileSync(envPath, 'utf-8');
    }

    const envMap = new Map<string, string>();
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && !key.startsWith('#')) {
            envMap.set(key.trim(), valueParts.join('=').trim());
        }
    });

    // Update or add Firebase keys
    envMap.set('NEXT_PUBLIC_FIREBASE_API_KEY', firebaseConfig.apiKey);
    envMap.set('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain);
    envMap.set('NEXT_PUBLIC_FIREBASE_PROJECT_ID', firebaseConfig.projectId);
    envMap.set('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket);
    envMap.set('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId);
    envMap.set('NEXT_PUBLIC_FIREBASE_APP_ID', firebaseConfig.appId);

    // Ensure Stripe and Google keys are present if they don't exist
    if (!envMap.has('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')) {
        envMap.set('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', '');
    }
    if (!envMap.has('GOOGLE_API_KEY')) {
        envMap.set('GOOGLE_API_KEY', '');
    }

    // Reconstruct the .env file content
    const newEnvContent = [
        `# Firebase SDK configuration - Auto-updated by setup-firebase.ts`,
        `NEXT_PUBLIC_FIREBASE_API_KEY=${envMap.get('NEXT_PUBLIC_FIREBASE_API_KEY')}`,
        `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${envMap.get('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')}`,
        `NEXT_PUBLIC_FIREBASE_PROJECT_ID=${envMap.get('NEXT_PUBLIC_FIREBASE_PROJECT_ID')}`,
        `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${envMap.get('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET')}`,
        `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${envMap.get('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID')}`,
        `NEXT_PUBLIC_FIREBASE_APP_ID=${envMap.get('NEXT_PUBLIC_FIREBASE_APP_ID')}`,
        ``,
        `# Stripe configuration - Add your keys below`,
        `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${envMap.get('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')}`,
        ``,
        `# Google GenAI configuration - Add your keys below`,
        `GOOGLE_API_KEY=${envMap.get('GOOGLE_API_KEY')}`,
    ].join('\n');

    writeFileSync(envPath, newEnvContent);

    console.log('\n✅ Success! Firebase environment variables have been updated in .env');
    console.log('Next steps:');
    console.log('1. Ensure your Stripe Publishable Key and Google API Key are correctly set in the .env file.');
    console.log('2. Restart your development server for the changes to take effect.');
    
  } catch (error) {
    console.error('\n❌ An error occurred during Firebase setup:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

setupFirebase();
