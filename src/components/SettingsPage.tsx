'use client';
import { useAuth, useFirestore, useUser, useStorage } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState, useEffect } from 'react';
import { Switch } from './ui/switch';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<{displayName?: string; username?: string; profilePicture?: string, onlineStatus?: boolean;}>({});
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setNewDisplayName(data.displayName || '');
          setNewUsername(data.username || '');
        }
      });
    }
  }, [user, firestore]);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };

  const handleProfileChange = async () => {
    if (!user || !firestore) return;

    const displayNameChanged = newDisplayName.trim() !== '' && newDisplayName.trim() !== profile.displayName;
    const usernameChanged = newUsername.trim() !== '' && newUsername.trim() !== profile.username;

    if (!displayNameChanged && !usernameChanged) {
        toast({ title: 'No changes to save.' });
        return;
    }
    
    const userDocRef = doc(firestore, 'users', user.uid);
    const updatedData: { displayName?: string, username?: string } = {};

    if(displayNameChanged) updatedData.displayName = newDisplayName.trim();
    if(usernameChanged) updatedData.username = newUsername.trim();

    try {
      await updateDoc(userDocRef, updatedData).catch(error => {
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: updatedData
          });
          errorEmitter.emit('permission-error', permissionError);
        } else {
          throw error;
        }
      });
      setProfile(p => ({...p, ...updatedData}));
      toast({ title: 'Success', description: 'Your profile has been updated.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage || !firestore) return;
    
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    try {
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { profilePicture: photoURL }).catch(error => {
            if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'update',
                  requestResourceData: { profilePicture: photoURL }
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                throw error;
            }
        });
        
        setProfile(p => ({...p, profilePicture: photoURL}));
        toast({ title: 'Success', description: 'Profile picture updated.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: `Could not upload photo: ${error.message}` });
    }
  };

  const handleOnlineStatusChange = async (checked: boolean) => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      try {
        await updateDoc(userDocRef, { onlineStatus: checked }).catch(error => {
           if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                  path: userDocRef.path,
                  operation: 'update',
                  requestResourceData: { onlineStatus: checked }
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                throw error;
            }
        });
        setProfile(p => ({...p, onlineStatus: checked}));
        toast({ title: 'Success', description: `You are now ${checked ? 'Online' : 'Offline'}.` });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    }
  }
  
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center gap-4 p-4 border-b sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Button>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 bg-muted/20">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This is how others will see you on the site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profilePicture || ''} alt={profile.displayName || 'user'} />
                <AvatarFallback>{profile.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*"/>
              <Button onClick={() => fileInputRef.current?.click()}>Change Photo</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            </div>
             <Button variant="outline" onClick={handleProfileChange}>Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Label htmlFor="theme" className="flex items-center gap-2">
                        {theme === 'dark' ? <Moon /> : <Sun />}
                        Dark Mode
                    </Label>
                    <Switch
                        id="theme"
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                    />
                </div>
            </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user.email || ''} readOnly disabled />
                </div>
                 <Button variant="outline" disabled>Change Password</Button>
            </CardContent>
        </Card>
        
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Manage your privacy settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="online-status">Online Status</Label>
                  <Switch id="online-status" checked={!!profile.onlineStatus} onCheckedChange={handleOnlineStatusChange} />
                </div>
            </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Sign Out</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
