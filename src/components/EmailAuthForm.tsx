'use client';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function EmailAuthForm() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      const userRef = doc(firestore, 'user_profiles', userCredential.user.uid);
      await setDoc(userRef, {
        name: displayName,
        username: username,
        email: userCredential.user.email,
        profilePicture: userCredential.user.photoURL,
      }, { merge: true });
      toast({ title: 'Success!', description: 'Your account has been created.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-up failed.',
        description: error.message,
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Success!', description: 'You have signed in.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-in failed.',
        description: error.message,
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Please check your inbox to reset your password.',
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password reset failed.',
        description: error.message,
      });
    }
  };

  if (isForgotPassword) {
    return (
        <form onSubmit={handlePasswordReset} className="space-y-4 w-full">
            <h3 className="font-semibold text-center">Reset Password</h3>
            <div className="space-y-2">
                <Label htmlFor="email-reset">Email</Label>
                <Input
                id="email-reset"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <Button type="submit" className="w-full">Send Reset Email</Button>
            <Button variant="link" className="w-full" onClick={() => setIsForgotPassword(false)}>
                Back to Login
            </Button>
        </form>
    );
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <form onSubmit={handleSignIn} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email-login">Email</Label>
            <Input
              id="email-login"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-login">Password</Label>
            <Input
              id="password-login"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Login</Button>
          <Button variant="link" className="w-full text-xs" onClick={() => setIsForgotPassword(true)}>
            Forgot Password?
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name-signup">Display Name</Label>
            <Input
              id="name-signup"
              type="text"
              placeholder="Your Name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="username-signup">Username</Label>
            <Input
              id="username-signup"
              type="text"
              placeholder="yourusername"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>
            <Input
              id="email-signup"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <Input
              id="password-signup"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Sign Up</Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
