'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { Loading } from './Loading';
import { Button } from './ui/button';
import { MessageBubble, type Message, type OtherUser } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useRouter } from 'next/navigation';
import { CallButton } from './CallButton';


export function ChatInterface({ otherUid }: { otherUid: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser>(null);

  useEffect(() => {
    if (!user || !firestore) return;

    const findOrCreateChat = async () => {
      setLoading(true);
      // deterministic chatId for 1-to-1: combine uids sorted
      const id = [user.uid, otherUid].sort().join('_');
      const chatDocRef = doc(firestore, 'chats', id);
      
      try {
        const chatSnap = await getDoc(chatDocRef);
        if (!chatSnap.exists()) {
          const chatData = {
            participants: [user.uid, otherUid],
            updatedAt: serverTimestamp(),
            lastMessage: '',
          };
          await setDoc(chatDocRef, chatData).catch(error => {
             if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: chatDocRef.path,
                    operation: 'create',
                    requestResourceData: chatData,
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Something went wrong.',
                    description: error.message || 'Could not create chat.',
                });
            }
          });
        }
        setChatId(id);

        const otherUserDoc = await getDoc(doc(firestore, 'users', otherUid));
        if(otherUserDoc.exists()) {
            setOtherUser(otherUserDoc.data() as OtherUser);
        }

        // listen to messages
        const messagesCol = collection(firestore, 'chats', id, 'messages');
        const q = query(messagesCol, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snap) => {
          const arr: Message[] = [];
          snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Omit<Message, 'id'>) }));
          setMessages(arr);
          setLoading(false);
        }, (error) => {
            const permissionError = new FirestorePermissionError({
                path: messagesCol.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });
        return unsubscribe;

      } catch (error: any) {
        console.error("Error in findOrCreateChat:", error)
        const permissionError = new FirestorePermissionError({
            path: chatDocRef.path,
            operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
        return () => {};
      }
    };

    const unsubPromise = findOrCreateChat();

    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, [user, otherUid, firestore, toast]);

   useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  if (loading) return <Loading />;
  if (!user) return <p>Please log in to chat.</p>;
  if (!chatId) return <Loading />;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      <header className="flex items-center gap-4 p-4 border-b sticky top-0 bg-background z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Button>
        <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.profilePicture} alt={otherUser?.displayName || 'U'}/>
            <AvatarFallback>{otherUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{otherUser?.displayName || 'Chat'}</h2>
          {otherUser && <p className={`text-sm ${otherUser.onlineStatus ? 'text-green-500' : 'text-muted-foreground'}`}>{otherUser.onlineStatus ? 'Online' : 'Offline'}</p>}
        </div>
        <CallButton otherUid={otherUid} />
      </header>
      <ScrollArea className="flex-1 p-4 bg-muted/20">
        <div className="flex flex-col gap-4">
          {messages.length === 0 && <p className="text-center text-muted-foreground mt-4">No messages yet. Say hi 👋</p>}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} isMine={m.senderId === user.uid} otherUser={otherUser} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <ChatInput chatId={chatId} />
    </div>
  );
}
