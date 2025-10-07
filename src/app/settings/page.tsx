
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/Loading";
import { useFirebase } from "@/firebase/provider";

function SettingsPageContent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="p-6 bg-card text-card-foreground rounded shadow w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Settings Page</h1>
        <p>Here you can update your profile, username, and preferences.</p>
      </div>
    </main>
  );
}

function ProtectedSettingsPage() {
  const { auth } = useFirebase();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loading />;
  }

  return <SettingsPageContent />;
}

export default function SettingsPage() {
  return (
      <ProtectedSettingsPage />
  );
}
