
'use client';
import { useAuth, useFirestore } from '@/firebase';
import { googleProvider } from '@/firebase/client-provider';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="24px"
            height="24px"
            {...props}
        >
            <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.158,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
        </svg>
    );
}

export default function GoogleLoginButton() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const username = user.email!.split('@')[0];
        const profileData = {
            displayName: user.displayName,
            username: username,
            email: user.email,
            profilePicture: user.photoURL,
            onlineStatus: true,
            createdAt: serverTimestamp(),
            friends: [],
            friendRequests: [],
            sentRequests: [],
        };

        await setDoc(userRef, profileData)
            .then(() => {
                toast({
                    title: 'Account created!',
                    description: `Welcome ${user.displayName || user.email}!`,
                });
            })
            .catch((error) => {
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
                        title: 'Google login failed!',
                        description: error.message || 'An unexpected error occurred.',
                    });
                }
            });
      } else {
         toast({
            title: 'Signed in successfully!',
            description: `Welcome back, ${user.displayName || user.email}!`,
        });
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google login failed!',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="outline"
      className="w-full"
    >
      <GoogleIcon className="mr-2 h-5 w-5" />
      Sign in with Google
    </Button>
  );
}
