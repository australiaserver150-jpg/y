'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleLoginButton from '@/components/google-login-button';
import { SettingsPage } from '@/components/SettingsPage';
import { Loading } from '@/components/Loading';

export default function Settings() {
  const { user, loading } = useUser();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg animate-pulse mt-4">
              BestU ChaT
            </h1>
            <CardDescription>Sign in to view settings</CardDescription>
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

  return <SettingsPage />;
}
