"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/Loading";
import { useFirebase } from "@/firebase/provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SettingsItem } from "@/components/settings/settings-item";
import { ArrowLeft, Search, Bell, KeyRound, Lock, User as UserIcon, MessageSquare, Palette, Users, Download, Accessibility, Languages, HelpCircle, QrCode, Plus } from "lucide-react";

function SettingsPageContent() {
  const { auth, user } = useFirebase();
  const router = useRouter();

  if (!user) return <Loading />;

  return (
    <div className="bg-background text-foreground">
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

      <main className="p-4 space-y-4">
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg">{user.displayName}</h2>
            <p className="text-muted-foreground text-sm">Hey there! I am using ConnectNow.</p>
          </div>
          <div className="flex-grow" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><QrCode/></Button>
            <Button variant="ghost" size="icon" className="bg-primary text-primary-foreground rounded-full"><Plus/></Button>
          </div>
        </div>

        <div className="bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-lg p-4 flex items-start gap-4">
          <div className="bg-green-500/20 p-2 rounded-full">
            <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold">Protect your account</h3>
            <p className="text-sm">Log in with your face, fingerprint or screen lock. <span className="font-semibold cursor-pointer">Create passkey</span></p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto -mt-2 -mr-2">X</Button>
        </div>

        <div className="space-y-1">
            <SettingsItem icon={KeyRound} title="Account" subtitle="Security notifications, change number" />
            <SettingsItem icon={Lock} title="Privacy" subtitle="Block contacts, disappearing messages" />
            <SettingsItem icon={UserIcon} title="Avatar" subtitle="Create, edit, profile photo" />
            <SettingsItem icon={Users} title="Lists" subtitle="Manage people and groups" />
            <SettingsItem icon={MessageSquare} title="Chats" subtitle="Theme, wallpapers, chat history" />
            <SettingsItem icon={Bell} title="Notifications" subtitle="Message, group & call tones" />
            <SettingsItem icon={Download} title="Storage and data" subtitle="Network usage, auto-download" />
            <SettingsItem icon={Accessibility} title="Accessibility" subtitle="Increase contrast, animation" />
            <SettingsItem icon={Languages} title="App language" subtitle="English (device's language)" />
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
