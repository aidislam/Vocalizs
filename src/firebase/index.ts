'use client';

import { firebaseConfig, MASTER_AUTH_CONFIG } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const apps = getApps();
  const defaultAppName = 'DEFAULT';
  const authAppName = 'MasterAuth';

  // Initialize Default App
  let defaultApp = apps.find(app => app.name === defaultAppName);
  if (!defaultApp) {
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      defaultApp = initializeApp(undefined, defaultAppName);
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object.',
          e
        );
      }
      defaultApp = initializeApp(firebaseConfig, defaultAppName);
    }
  }

  // Initialize Master Auth App
  let authApp = apps.find(app => app.name === authAppName);
  if (!authApp) {
    authApp = initializeApp(MASTER_AUTH_CONFIG, authAppName);
  }

  return getSdks(defaultApp, authApp);
}

export function getSdks(defaultApp: FirebaseApp, authApp: FirebaseApp) {
  const firestore = getFirestore(defaultApp);
  const auth = getAuth(authApp);

  // Listen for auth state changes to save user profile
  auth.onAuthStateChanged(user => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const profileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };

      // Use non-blocking setDoc with merge to create/update profile
      setDoc(userRef, profileData, { merge: true }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'write',
          requestResourceData: profileData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  });

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
