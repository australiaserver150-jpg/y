'use client';

import { Video, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function CallButton({ otherUid }: { otherUid: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const startCall = async (type: 'video' | 'audio') => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to start a call.',
      });
      return;
    }

    try {
      const callsCol = collection(firestore, 'calls');
      const callData = {
        caller: user.uid,
        participants: [user.uid, otherUid],
        type,
        status: 'ringing',
        createdAt: serverTimestamp(),
      };
      const callDocRef = await addDoc(callsCol, callData).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: callsCol.path,
            operation: 'create',
            requestResourceData: callData,
        });
        errorEmitter.emit('permission-error', permissionError);
        return null;
      });

      if (callDocRef) {
        router.push(`/call/${callDocRef.id}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Could not start call',
          description: 'Check permissions and try again.',
        });
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Starting Call',
        description: error.message || 'An unexpected error occurred.',
      });
      console.error('Error starting call:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon" onClick={() => startCall('audio')}>
        <Phone />
        <span className="sr-only">Start Audio Call</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={() => startCall('video')}>
        <Video />
        <span className="sr-only">Start Video Call</span>
      </Button>
    </div>
  );
}
