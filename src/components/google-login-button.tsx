
"use client";
import { googleProvider } from "@/firebase/client-provider";
import { signInWithPopup } from "firebase/auth";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function GoogleLoginButton() {
  const auth = useAuth();
  const firestore = useFirestore();

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(firestore, 'user_profiles', user.uid);
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }, { merge: true });

      alert(`Welcome ${user.displayName || user.email}!`);
    } catch (error) {
      console.error(error);
      alert("Google login failed!");
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      style={{ padding: "12px 20px", marginBottom: "16px", backgroundColor: "#4285F4", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
    >
      Sign up / Login with Google
    </button>
  );
}
