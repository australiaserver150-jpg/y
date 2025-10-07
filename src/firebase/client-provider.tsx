'use client';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { ReactNode, createContext, useContext } from 'react';
import { FirebaseProvider } from './provider';

// Add the Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyAnPMQH1uhlekwvNQCO2vtPjS0QhFIMbEw",
  authDomain: "bestu-chat-3f4c2.firebaseapp.com",
  databaseURL: "https://bestu-chat-3f4c2-default-rtdb.firebaseio.com",
  projectId: "bestu-chat-3f4c2",
  storageBucket: "bestu-chat-3f4c2.appspot.com",
  messagingSenderId: "482542679767",
  appId: "1:482542679767:web:c3b34d6b9f6ef7d69fa292",
  measurementId: "G-G83MELP6PH"
};

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
