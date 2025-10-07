
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import firebaseConfig from './config';
import { Loading } from '@/components/Loading';

interface FirebaseContextValue {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
    storage: FirebaseStorage;
    provider: GoogleAuthProvider;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
    const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

    useEffect(() => {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);
        const provider = new GoogleAuthProvider();
        setFirebase({ app, auth, db, storage, provider });
    }, []);

    if (!firebase) {
        return <Loading />;
    }

    return (
        <FirebaseContext.Provider value={firebase}>
            {children}
        </FirebaseContext.Provider>
    );
};

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === null) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};
