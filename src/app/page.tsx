
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, provider as googleProvider, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Loading } from "@/components/Loading";
import Image from 'next/image';

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/chat");
      } else {
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user document in Firestore if it doesn't exist
        await setDoc(userDocRef, {
          name: user.displayName || user.email?.split('@')[0] || 'New User',
          email: user.email,
          avatar: user.photoURL || '',
        });
      }
      
      router.push("/chat");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>Welcome to ConnectNow</CardTitle>
          <CardDescription>
            Sign in to start chatting with your friends.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5"/>
            {loading ? "Signing in..." : "Sign in with Gmail"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
