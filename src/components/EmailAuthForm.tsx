'use client';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, where, collection, query } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function EmailAuthForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!auth || !firestore) return;
    try {
      if (type === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let baseUsername = name.toLowerCase().replace(/\s+/g, "") || email.split('@')[0] || "user";
        let username = baseUsername;
        let exists = true;
        let counter = 0;

        while (exists) {
            const q = query(collection(firestore, "users"), where("username", "==", username));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
            exists = false;
            } else {
            counter++;
            username = `${baseUsername}${counter}`;
            }
        }
        
        const userRef = doc(firestore, 'users', user.uid);
        const profileData = { name, username, email, profilePicture: null };
        
        setDoc(userRef, profileData, { merge: true })
            .then(() => {
                toast({
                    title: 'Account created!',
                    description: `Welcome ${name}!`,
                });
            }).catch(error => {
                if (error.code === 'permission-denied') {
                    const permissionError = new FirestorePermissionError({
                        path: userRef.path,
                        operation: 'create',
                        requestResourceData: profileData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Something went wrong.',
                        description: error.message || 'Could not save user profile.',
                    });
                }
            })

      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Signed in successfully!',
          description: `Welcome back!`,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `${type === 'login' ? 'Login' : 'Sign up'} failed!`,
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-login">Email</Label>
            <Input id="email-login" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-login">Password</Label>
            <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button onClick={() => handleAuth('login')} className="w-full">Login</Button>
        </div>
      </TabsContent>
      <TabsContent value="signup">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name-signup">Name</Label>
            <Input id="name-signup" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>
            <Input id="email-signup" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button onClick={() => handleAuth('signup')} className="w-full">Sign Up</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
