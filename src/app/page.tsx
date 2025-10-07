
'use client';

import { useUser } from '@/firebase';
import GoogleLoginButton from '@/components/google-login-button';
import { EmailAuthForm } from '@/components/EmailAuthForm';
import { UserDashboard } from '@/components/user-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MainPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <UserDashboard />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg animate-pulse mt-4">
            BestU ChaT
          </h1>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4">
            <GoogleLoginButton />
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <EmailAuthForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
