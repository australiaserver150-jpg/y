'use client';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { Input } from './ui/input';

export function SettingsPage() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  };
  
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background dark:bg-black border-x">
      <header className="flex items-center gap-4 p-4 border-b sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Button>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This is how others will see you on the site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'user'} />
                <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <Button>Change Photo</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" defaultValue={user.displayName || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email || ''} readOnly disabled />
            </div>
             <Button variant="outline">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
