'use client';

import { useUser } from '@/firebase';
import GoogleLoginButton from '@/components/google-login-button';
import { UserDashboard } from '@/components/user-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/Loading';

export default function MainPage() {
  const { user, loading } = useUser();

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <UserDashboard />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-4xl font-headline font-extrabold text-center bg-gradient-to-r from-primary via-accent to-purple-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse mt-4">
            ConnectNow
          </h1>
          <CardDescription>Sign in with Google to continue</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4">
                <GoogleLoginButton />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
