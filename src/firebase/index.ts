'use client';

import { firebaseConfig, MASTER_AUTH_CONFIG } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const apps = getApps();
  const defaultAppName = 'DEFAULT';
  const authAppName = 'MasterAuth';

  // Initialize Default App for Firestore, Storage, etc.
  let defaultApp = apps.find(app => app.name === defaultAppName);
  if (!defaultApp) {
    try {
      // Prefer automatic initialization for the default app if possible (e.g., App Hosting)
      defaultApp = initializeApp(undefined, defaultAppName);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object for default app.'
        );
      }
      defaultApp = initializeApp(firebaseConfig, defaultAppName);
    }
  }

  // Initialize Master Auth App for Authentication
  let authApp = apps.find(app => app.name === authAppName);
  if (!authApp) {
    authApp = initializeApp(MASTER_AUTH_CONFIG, authAppName);
  }

  const firestore = getFirestore(defaultApp);
  const auth = getAuth(authApp);

  return {
    firebaseApp: defaultApp,
    auth,
    firestore,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
