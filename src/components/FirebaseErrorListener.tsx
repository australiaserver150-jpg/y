'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In a Next.js development environment, uncaught errors are displayed in an overlay.
      // We throw the error here to trigger that overlay with our detailed, contextual message.
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        // In production, you might want to log this to a service like Sentry
        // without disrupting the user with a thrown error.
        console.error("Firestore Permission Error:", error.message);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null; // This component does not render anything
}
