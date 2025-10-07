
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/Loading";
import { useFirebase } from "@/firebase/provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SettingsItem } from "@/components/settings/settings-item";
import { ArrowLeft, Search, Bell, KeyRound, Lock, MessageSquare, Palette, Users, Download, Accessibility, Languages, HelpCircle, QrCode, Plus, CheckCircle2 } from "lucide-react";

function SettingsPageContent() {
  const { auth, user } = useFirebase();
  const router = useRouter();

  if (!user) return <Loading />;

  return (
    <div className="bg-background text-foreground max-w-2xl mx-auto">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Search />
        </Button>
      </header>

      <main className="p-4 space-y-6">
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg">{user.displayName || "Your Name"}</h2>
            <p className="text-muted-foreground text-sm">Hey there! I am using ConverseHub.</p>
          </div>
          <div className="flex-grow" />
          <Button variant="ghost" size="icon" className="text-green-500">
            <QrCode />
          </Button>
        </div>

        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100 rounded-lg p-4 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
          <div>
            <h3 className="font-semibold">Protect your account</h3>
            <p className="text-sm">Log in with your face, fingerprint or screen lock. <span className="font-semibold cursor-pointer text-green-700 dark:text-green-300">Create passkey</span></p>
          </div>
        </div>

        <div className="space-y-1">
            <SettingsItem icon={KeyRound} title="Account" subtitle="Security notifications, change number" />
            <SettingsItem icon={Lock} title="Privacy" subtitle="Block contacts, disappearing messages" />
            <SettingsItem icon={Users} title="Channels" subtitle="Manage your channel settings and moderation" />
            <SettingsItem icon={Users} title="Communities" subtitle="Create, manage, and discover groups" />
            <SettingsItem icon={MessageSquare} title="Chats" subtitle="Theme, wallpapers, chat history" />
            <SettingsItem icon={Bell} title="Notifications" subtitle="Message, group & call tones" />
            <SettingsItem icon={Download} title="Storage and data" subtitle="Network usage, auto-download" />
            <SettingsItem icon={Accessibility} title="Accessibility" subtitle="Increase contrast, animation" />
        </div>

        <div className="space-y-1">
            <SettingsItem icon={Languages} title="App language" subtitle="English (device's language)" />
            <SettingsItem icon={HelpCircle} title="Help" subtitle="FAQ, contact us, privacy policy" />
        </div>
      </main>
    </div>
  );
}

function ProtectedSettingsPage() {
  const { auth } = useFirebase();
  const [user, loading] = useAuthState(auth!);
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
    const { auth } = useFirebase();

    return auth ? <ProtectedSettingsPage /> : <Loading />;
}
