'use client';
import { FirebaseApp, initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { ReactNode } from 'react';
import { FirebaseProvider } from './provider';

const firebaseConfig = {
  apiKey: "AIzaSyAnPMQH1uhlekwvNQCO2vtPjS0QhFIMbEw",
  authDomain: "bestu-chat-3f4c2.firebaseapp.com",
  projectId: "bestu-chat-3f4c2",
  storageBucket: "bestu-chat-3f4c2.appspot.com",
  messagingSenderId: "482542679767",
  appId: "1:482542679767:web:c3b34d69fa292",
  measurementId: "G-G83MELP6PH"
};

// Initialize Firebase
const firebaseApp: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();


export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
