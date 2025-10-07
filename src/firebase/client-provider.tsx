"use client";
import { getFirebaseApp } from "@/firebase/config";
import { AuthProvider } from "./auth/auth-provider";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Loading } from "@/components/Loading";

type Props = {
  children?: React.ReactNode;
};

export const FirebaseClientProvider = ({ children }: Props) => {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  if (!app) {
    return <Loading />;
  }

  return <AuthProvider app={app} auth={auth} db={db} storage={storage}>{children}</AuthProvider>;
};
