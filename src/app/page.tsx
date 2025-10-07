"use client";

import { useFirebase } from "@/firebase/provider";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import { Loading } from "@/components/Loading";
import { Button } from "@/components/ui/button";

function LoginPageContent() {
  const { auth } = useFirebase();
  const [user, loading] = useAuthState(auth!);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      // You might want to show a toast or a more user-friendly error message
    }
  };

  if (loading || user) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div>
        <h1 className="text-4xl font-bold text-center mb-2">Welcome to ConnectNow</h1>
        <p className="text-center text-muted-foreground mb-4">Sign in to start chatting.</p>
        <div className="flex justify-center">
            <Button
                onClick={handleGoogleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
            >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691c2.242-4.337 6.96-7.141 12.058-7.141c.21 0 .42.002.629.007l-5.657 5.657C13.045 13.918 12.5 14.996 12.5 16.2s.545 2.282 1.455 3.192l-5.65 5.65C6.75 22.936 6 20.56 6 18s.75-4.936 1.943-6.931z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083L43.595 20L42 20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-1.795 0-3.5-.388-5.064-1.098l6.522-5.025C30.563 33.431 34.611 30.13 36.654 26H24v-6h20c0-1.341-.138-2.65-.389-3.917z"/></svg>
                Sign in with Google
            </Button>
        </div>
      </div>
    </div>
  );
}


export default function LoginPage() {
  const { auth } = useFirebase();

  // Render content only when auth is initialized
  return auth ? <LoginPageContent /> : <Loading />;
}

    