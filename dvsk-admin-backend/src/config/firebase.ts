import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

if (!admin.apps.length) {
  try {
    let serviceAccount: any;

    // ✅ In production (Vercel), load from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      // ✅ Locally, load from the JSON file
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
      serviceAccount = JSON.parse(readFileSync(resolve(serviceAccountPath), 'utf8'));
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin Initialized');
  } catch (error) {
    console.error('❌ Firebase Admin Error:', error);
  }
}

export default admin;