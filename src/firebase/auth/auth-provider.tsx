"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User, type Auth } from "firebase/auth";
import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

interface AuthContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  app: null,
  auth: null,
  db: null,
  storage: null,
  user: null,
  loading: true,
});

export const AuthProvider: React.FC<{ 
    children: React.ReactNode,
    app: FirebaseApp,
    auth: Auth,
    db: Firestore,
    storage: FirebaseStorage
}> = ({
  children,
  app,
  auth,
  db,
  storage
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ app, auth, db, storage, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
