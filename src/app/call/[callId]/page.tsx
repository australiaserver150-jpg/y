'use client';

import { CallInterface } from '@/components/CallInterface';
import { useUser } from '@/firebase';
import { Loading } from '@/components/Loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GoogleLoginButton from '@/components/google-login-button';
import EmailAuthForm from '@/components/EmailAuthForm';


export default function CallPage({ params }: { params: { callId: string } }) {
    const { user, loading } = useUser();
    const { callId } = params;

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
                    <CardDescription>Sign in to join the call</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <EmailAuthForm />
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                                </span>
                            </div>
                        </div>
                        <GoogleLoginButton />
                    </div>
                </CardContent>
                </Card>
            </div>
        );
    }
    
    return <CallInterface callId={callId} />;
}
