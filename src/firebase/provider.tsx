'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import {
  ReactNode,
  createContext,
  useContext,
} from 'react';

// Define the context type
interface FirebaseContextType {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Create the context
const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

// Create the provider component
export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}) {
  if (!firebaseApp) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="rounded-md bg-destructive p-4 text-destructive-foreground">
          Firebase config not found. Please add it to{' '}
          <code>src/firebase/client-provider.tsx</code>
        </div>
      </div>
    );
  }

  const value = { firebaseApp, auth, firestore };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Create a hook to use the context
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

export function useFirebaseApp() {
  return useFirebase().firebaseApp;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useFirestore() {
  return useFirebase().firestore;
}
