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
  GoogleAuthProvider
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Loading } from "@/components/Loading";
import { useAuth } from "@/firebase/auth/auth-provider";

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { user, auth, db, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/chat");
    }
  }, [user, authLoading, router]);

  const handleSignIn = async () => {
    if (!auth || !db) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
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
  
  if (authLoading || user) {
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
