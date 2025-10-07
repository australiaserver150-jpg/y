'use client';
import { useEffect } from "react";
import { useUser, useFirestore } from "@/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function CallManager() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast, dismiss } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!user || !firestore) return;

        const callsQuery = query(
            collection(firestore, 'calls'),
            where('participants', 'array-contains', user.uid),
            where('status', '==', 'ringing')
        );

        const unsubscribe = onSnapshot(callsQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const call = change.doc.data();
                    const callId = change.doc.id;
                    const isCallee = call.caller !== user.uid;

                    if (isCallee) {
                        const { id } = toast({
                            title: `Incoming ${call.type} call`,
                            description: `Call from a user.`,
                            duration: Infinity,
                            action: (
                                <div className="flex gap-2">
                                    <Button onClick={() => {
                                        router.push(`/call/${callId}`);
                                        dismiss(id);
                                    }}>
                                        Accept
                                    </Button>
                                     <Button variant="destructive" onClick={() => dismiss(id)}>
                                        Decline
                                    </Button>
                                </div>
                            ),
                        });
                    }
                } else if (change.type === 'modified' || change.type === 'removed') {
                    dismiss();
                }
            });
        });

        return () => unsubscribe();
    }, [user, firestore, toast, router, dismiss]);

    return null;
}
