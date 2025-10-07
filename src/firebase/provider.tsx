"use client";
import React, { createContext, useContext } from 'react';
import { app, analytics, auth, db, storage, provider } from '.';
import { FirebaseApp } from 'firebase/app';
import { Auth, GoogleAuthProvider } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Analytics } from 'firebase/analytics';

interface FirebaseContextValue {
  app: FirebaseApp;
  analytics: Analytics | null;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  provider: GoogleAuthProvider;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <FirebaseContext.Provider value={{ app, analytics, auth, db, storage, provider }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
