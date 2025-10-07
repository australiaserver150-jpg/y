'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, collection, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export function CallInterface({ callId }: { callId: string }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const [callData, setCallData] = useState<any>(null);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [callStatus, setCallStatus] = useState('connecting...');
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Initialize Peer Connection
    const initializePeerConnection = () => {
        if (!firestore || !user) return;
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const candidatesCol = collection(firestore, 'calls', callId, 'candidates');
                const candidateData = { ...event.candidate.toJSON(), sender: user.uid };
                addDoc(candidatesCol, candidateData).catch(error => {
                    const permissionError = new FirestorePermissionError({
                        path: candidatesCol.path,
                        operation: 'create',
                        requestResourceData: candidateData
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });
            }
        };

        pc.ontrack = (event) => {
            remoteStreamRef.current = event.streams[0];
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pcRef.current = pc;
    };
    
    const hangUp = async () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (pcRef.current) {
            pcRef.current.close();
        }
        if (firestore) {
            const callDocRef = doc(firestore, 'calls', callId);
            await updateDoc(callDocRef, { status: 'ended' });
        }
        router.push('/');
    };

    const toggleMute = () => {
        if(localStreamRef.current){
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if(localStreamRef.current){
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };


    useEffect(() => {
        if (!user || !firestore) return;

        initializePeerConnection();
        const pc = pcRef.current!;

        const callDocRef = doc(firestore, 'calls', callId);
        const candidatesCol = collection(firestore, 'calls', callId, 'candidates');

        const unsubscribeCall = onSnapshot(callDocRef, async (snap) => {
            const data = snap.data();
            if (!data) return;

            setCallData(data);
            setCallStatus(data.status || 'connecting...');

            if (data.status === 'ended') {
                toast({ title: "Call Ended" });
                hangUp();
                return;
            }

            const isCaller = data.caller === user.uid;
            const otherUid = data.participants.find((p: string) => p !== user.uid);
            if (otherUid && !otherUser) {
                const userSnap = await getDoc(doc(firestore, 'users', otherUid));
                setOtherUser(userSnap.data());
            }

            const setupMedia = async () => {
                const stream = await navigator.mediaDevices.getUserMedia({ video: data.type === 'video', audio: true });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            };

            if (isCaller && data.status === 'ringing' && !pc.localDescription) {
                 try {
                    await setupMedia();
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    await updateDoc(callDocRef, { offer: { type: offer.type, sdp: offer.sdp } });
                } catch (err: any) {
                    toast({ variant: 'destructive', title: "Media Error", description: err.message });
                    hangUp();
                }
            }

            if (!isCaller && data.offer && !pc.localDescription) {
                 try {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                    await setupMedia();
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    await updateDoc(callDocRef, { answer: { type: answer.type, sdp: answer.sdp }, status: 'connected' });
                } catch (err: any) {
                    toast({ variant: 'destructive', title: "Media Error", description: err.message });
                    hangUp();
                }
            }
            
            if (isCaller && data.answer && !pc.remoteDescription) {
                 await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                 await updateDoc(callDocRef, { status: 'connected' });
            }

        }, (error) => {
             const permissionError = new FirestorePermissionError({ path: callDocRef.path, operation: 'get' });
             errorEmitter.emit('permission-error', permissionError);
        });

        const unsubscribeCandidates = onSnapshot(candidatesCol, (snap) => {
            snap.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const candidateData = change.doc.data();
                    if (candidateData.sender !== user.uid) {
                        try {
                             await pc.addIceCandidate(new RTCIceCandidate(candidateData));
                        } catch (e) {
                            console.error("Error adding received ICE candidate", e);
                        }
                    }
                }
            });
        }, (error) => {
             const permissionError = new FirestorePermissionError({ path: candidatesCol.path, operation: 'list' });
             errorEmitter.emit('permission-error', permissionError);
        });

        return () => {
            unsubscribeCall();
            unsubscribeCandidates();
            hangUp();
        };

    }, [user, firestore, callId]);

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            <div className="relative flex-1 flex items-center justify-center">
                <video ref={remoteVideoRef} id="remoteVideo" autoPlay playsInline className="h-full w-full object-cover" />
                
                <Card className="absolute top-4 right-4 w-48 h-64 border-2 border-white overflow-hidden">
                    <video ref={localVideoRef} id="localVideo" autoPlay playsInline muted className="h-full w-full object-cover" />
                </Card>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    {otherUser && callStatus !== 'connected' && (
                        <>
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={otherUser?.profilePicture}/>
                            <AvatarFallback>{otherUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">{otherUser?.name}</h2>
                        <p className="capitalize">{callStatus}...</p>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-center items-center gap-4 p-4 bg-black/50">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 text-white border-none" onClick={toggleMute}>
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                {callData?.type === 'video' && (
                     <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30 text-white border-none" onClick={toggleVideo}>
                        {isVideoOff ? <VideoOff /> : <Video />}
                    </Button>
                )}
                <Button variant="destructive" size="icon" className="rounded-full h-16 w-16" onClick={hangUp}>
                    <PhoneOff />
                </Button>
            </div>
        </div>
    );
}
