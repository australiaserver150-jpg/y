'use client';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { ReactNode, createContext, useContext } from 'react';
import { FirebaseProvider } from './provider';

// Add the Firebase config here
const firebaseConfig = null;

let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

// Initialize Firebase
if (firebaseConfig && !firebaseApp) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp!}
      auth={auth!}
      firestore={firestore!}
    >
      {children}
    </FirebaseProvider>
  );
}
