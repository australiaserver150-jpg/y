
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import firebaseConfig from "./config";
import { initializeApp, FirebaseApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { Loading } from "@/components/Loading";

interface FirebaseContextProps {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  provider: GoogleAuthProvider | null;
}

const FirebaseContext = createContext<FirebaseContextProps>({
  app: null,
  auth: null,
  db: null,
  storage: null,
  provider: null,
});

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseState, setFirebaseState] = useState<FirebaseContextProps>({
    app: null,
    auth: null,
    db: null,
    storage: null,
    provider: null,
  });

  useEffect(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const provider = new GoogleAuthProvider();
    setFirebaseState({ app, auth, db, storage, provider });
  }, []);

  if (!firebaseState.app) {
    return <Loading />;
  }

  return <FirebaseContext.Provider value={firebaseState}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => useContext(FirebaseContext);
