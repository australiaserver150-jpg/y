'use client';

import { useAuth, useFirestore, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface UserProfile {
  name: string;
  username: string;
  email: string;
  profilePicture: string;
}

export function UserDashboard() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && firestore) {
        const userRef = doc(firestore, 'user_profiles', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      }
    };
    fetchUserProfile();
  }, [user, firestore]);


  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    }
  };

  if (!user || !userProfile) {
    return (
       <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fallback = userProfile.name ? userProfile.name.charAt(0) : userProfile.email!.charAt(0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={userProfile.profilePicture || ''} alt={userProfile.name || ''} />
            <AvatarFallback className="text-4xl">{fallback.toUpperCase()}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold">Welcome, {userProfile.name || 'User'}!</CardTitle>
          <CardDescription>@{userProfile.username} &middot; {userProfile.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
