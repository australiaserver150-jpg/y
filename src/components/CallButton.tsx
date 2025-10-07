'use client';
import React, { useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { Button } from "./ui/button";
import { Phone, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

export function CallButton({ calleeUid, kind = "video" }: { calleeUid: string; kind?: "audio" | "video" }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isCalling, setIsCalling] = useState(false);

    const startCall = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: "You must be logged in to start a call."});
            return;
        }
        setIsCalling(true);
        
        // Use a random ID for the call document
        const callDocRef = doc(collection(firestore, "calls"));
        const callId = callDocRef.id;

        const callData = {
            participants: [user.uid, calleeUid],
            type: kind,
            status: "ringing",
            createdAt: serverTimestamp(),
            caller: user.uid,
        };

        try {
            await setDoc(callDocRef, callData)
                .catch(error => {
                    if (error.code === 'permission-denied') {
                        const permissionError = new FirestorePermissionError({
                            path: callDocRef.path,
                            operation: 'create',
                            requestResourceData: callData,
                        });
                        errorEmitter.emit('permission-error', permissionError);
                         throw permissionError;
                    } else {
                        throw error;
                    }
                });

            router.push(`/call/${callId}`);

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Could not start call",
                description: error.message || "An unexpected error occurred.",
            });
            setIsCalling(false);
        }
    };

    return (
        <Button onClick={startCall} disabled={isCalling} variant="ghost" size="icon">
            {kind === 'video' ? <Video /> : <Phone />}
            <span className="sr-only">{kind === 'video' ? 'Start video call' : 'Start audio call'}</span>
        </Button>
    );
}
