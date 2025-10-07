
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/firebase/auth/auth-provider";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/Loading";
import { Camera } from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.name || user.displayName || "");
          setUsername(data.username || "");
          setPhotoURL(data.avatar || user.photoURL || "");
          setDarkMode(data.darkMode || false);
          if (data.darkMode) {
            document.documentElement.classList.add("dark");
          }
        } else {
            setDisplayName(user.displayName || user.email?.split('@')[0] || '');
            setPhotoURL(user.photoURL || "");
        }
        setInitialLoading(false);
      });
    } else if (!authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const storageRef = ref(storage, `profile-pictures/${user.uid}`);
    
    setUploading(true);

    try {
      await uploadBytes(storageRef, file);
      const newPhotoURL = await getDownloadURL(storageRef);
      
      if(auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
      }
      
      await setDoc(doc(db, "users", user.uid), { avatar: newPhotoURL }, { merge: true });

      setPhotoURL(newPhotoURL);
      toast({ title: "Profile picture updated!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if(auth.currentUser && displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        { name: displayName, username, darkMode },
        { merge: true }
      );
      toast({ title: "Settings successfully updated" });
      router.push('/chat');
    } catch (err: any) 'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/firebase/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/Loading';
import { Camera } from 'lucide-react';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.name || user.displayName || '');
          setUsername(data.username || '');
          setPhotoURL(data.avatar || user.photoURL || '');
          setDarkMode(data.darkMode || false);
          if (data.darkMode) {
            document.documentElement.classList.add('dark');
          }
        } else {
          setDisplayName(user.displayName || user.email?.split('@')[0] || '');
          setPhotoURL(user.photoURL || '');
        }
        setInitialLoading(false);
      });
    } else if (!authLoading) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handlePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const storageRef = ref(storage, `profile-pictures/${user.uid}`);

    setUploading(true);

    try {
      await uploadBytes(storageRef, file);
      const newPhotoURL = await getDownloadURL(storageRef);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: newPhotoURL });
      }

      await setDoc(doc(db, 'users', user.uid), { avatar: newPhotoURL }, { merge: true });

      setPhotoURL(newPhotoURL);
      toast({ title: 'Profile picture updated!' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (auth.currentUser && displayName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(
        userDocRef,
        { name: displayName, username, darkMode },
        { merge: true }
      );
      toast({ title: 'Settings successfully updated' });
      router.push('/chat');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving settings',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (authLoading || initialLoading) {
    return <Loading />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account and application settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Avatar className="w-32 h-32 text-lg">
                <AvatarImage src={photoURL} alt={displayName} />
                <AvatarFallback>
                  {displayName?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute bottom-1 right-1 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? '...' : <Camera className="w-5 h-5" />}
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handlePictureUpload}
                className="hidden"
                accept="image/png, image/jpeg"
              />
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="dark-mode"
                  className="flex flex-col space-y-1"
                >
                  <span>Dark Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enable or disable dark mode.
                  </span>
                </Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-8">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
