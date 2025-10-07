"use client";

import { auth, db } from "../firebase/client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loading } from "@/components/Loading";
import { useToast } from "@/hooks/use-toast";

function LoginPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && user) {
      router.push("/chat");
    }
  }, [user, loading, router]);
  
  const handleGoogleSignIn = async () => {
    if (!auth || !db) {
      toast({
        variant: "destructive",
        title: "Firebase not initialized!",
        description: "The Firebase service is not yet available. Please wait a moment and try again.",
      });
      return;
    }
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
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
         toast({
          variant: "destructive",
          title: "Popup blocked!",
          description: "Please allow popups for this site in your browser and try again.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sign-in failed!",
          description: error.message,
        });
      }
    }
  };

  if (loading || user) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[450px]">
        <CardHeader className="text-center">
          <CardTitle>Welcome to ConnectNow</CardTitle>
          <CardDescription>
            Sign in to start chatting with your friends.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <button
            onClick={handleGoogleSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691c2.242-4.337 6.96-7.141 12.058-7.141c.21 0 .42.002.629.007l-5.657 5.657C13.045 13.918 12.5 14.996 12.5 16.2s.545 2.282 1.455 3.192l-5.65 5.65C6.75 22.936 6 20.56 6 18s.75-4.936 1.943-6.931z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083L43.595 20L42 20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-1.795 0-3.5-.388-5.064-1.098l6.522-5.025C30.563 33.431 34.611 30.13 36.654 26H24v-6h20c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Sign in with Google
          </button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <LoginPageContent /> : <Loading />;
}
