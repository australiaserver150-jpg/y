
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import firebaseConfig from "./config";
import { initializeApp, getApps, FirebaseApp, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

interface FirebaseContextProps {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextProps>({
  app: null,
  auth: null,
  db: null,
  storage: null,
});

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<FirebaseContextProps>({
    app: null,
    auth: null,
    db: null,
    storage: null,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);
      const storage = getStorage(app);
      setState({ app, auth, db, storage });
    }
  }, []);

  return <FirebaseContext.Provider value={state}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => useContext(FirebaseContext);
