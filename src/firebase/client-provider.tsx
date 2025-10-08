'use client';
import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();


export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const configExists = Object.values(firebaseConfig).every(val => val || val === undefined); // databaseURL can be undefined

  if (!configExists) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-md bg-destructive p-4 text-destructive-foreground text-center">
          <p className='font-bold text-lg'>Firebase Config Not Found</p>
          <p>Please add your Firebase configuration to a <code>.env.local</code> file in the root of your project.</p>
        </div>
      </div>
    )
  }

  return (
    <FirebaseProvider
      firebaseApp={app}
      auth={auth}
      firestore={db}
      storage={storage}
    >
      {children}
    </FirebaseProvider>
  );
}
