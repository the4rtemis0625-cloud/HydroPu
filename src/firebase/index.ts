'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

/**
 * Initializes Firebase with robust error handling for different environments.
 * Prioritizes the config object for Vercel/Local and falls back to 
 * automatic discovery for Firebase App Hosting.
 */
export function initializeFirebase() {
  const apps = getApps();
  if (apps.length > 0) {
    return getSdks(apps[0]);
  }

  let firebaseApp: FirebaseApp;

  // Check if we have a valid API key in our config object.
  // This is the most reliable method for Vercel and local development.
  const isConfigValid = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10;

  if (isConfigValid) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    try {
      // Attempt automatic initialization (Firebase App Hosting)
      firebaseApp = initializeApp();
    } catch (e) {
      // Final fallback to config even if we weren't sure about it
      if (firebaseConfig && firebaseConfig.apiKey) {
        firebaseApp = initializeApp(firebaseConfig);
      } else {
        throw e;
      }
    }
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    database: getDatabase(firebaseApp)
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
