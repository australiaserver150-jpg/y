'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useUser, useFirestore, useStorage } from '@/firebase';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Paperclip, Send } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { Loading } from './Loading';
import { CallButton } from './CallButton';

type Message = {
  id?: string;
  senderId: string;
  text?: string;
  imageURL?: string;
  type: 'text' | 'image';
  createdAt: any;
};

type OtherUser = {
  name?: string;
  profilePicture?: string;
} | null;

function MessageBubble({ message, isMine, otherUser }: { message: Message, isMine: boolean, otherUser: OtherUser }) {
  const user = useUser().user;
  return (
      <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
          {!isMine && (
              <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser?.profilePicture} />
                  <AvatarFallback>{otherUser?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
          )}
          <div className={`max-w-[75%] rounded-lg p-3 ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {message.type === 'text' && <p className="whitespace-pre-wrap">{message.text}</p>}
              {message.type === 'image' && message.imageURL && (
                  <img src={message.imageURL} alt="Sent" className="max-w-full rounded-md" />
              )}
              <p className="text-xs mt-2 text-right opacity-70">
                  {message.createdAt?.toDate ? new Date(message.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
              </p>
          </div>
           {isMine && (
              <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
          )}
      </div>
  );
}


export function ChatInterface({ otherUid }: { otherUid: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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
            createdAt: serverTimestamp(),
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
            setOtherUser(otherUserDoc.data());
        }

        // listen to messages
        const messagesCol = collection(firestore, 'chats', id, 'messages');
        const q = query(messagesCol, orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snap) => {
          const arr: Message[] = [];
          snap.forEach((d) => arr.push({ id: d.id, ...(d.data() as Message) }));
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
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        setTimeout(() => {
            const scrollableView = scrollAreaRef.current?.querySelector('div[style*="overflow: auto"]');
            if (scrollableView) {
                scrollableView.scrollTop = scrollableView.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  const sendText = async () => {
    if (!user || !chatId || !text.trim() || !firestore) return;
    const messagesCol = collection(firestore, 'chats', chatId, 'messages');
    const messageData = {
      senderId: user.uid,
      text: text.trim(),
      type: 'text' as 'text',
      createdAt: serverTimestamp(),
    };
    await addDoc(messagesCol, messageData).catch(error => {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: messagesCol.path,
                operation: 'create',
                requestResourceData: messageData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
                variant: 'destructive',
                title: 'Something went wrong.',
                description: error.message || 'Could not send message.',
            });
        }
    });

    const chatDocRef = doc(firestore, 'chats', chatId);
    await updateDoc(chatDocRef, {
      lastMessage: text.trim(),
      updatedAt: serverTimestamp(),
    });
    setText('');
  };

  const sendImage = async (file: File) => {
    if (!user || !chatId || !file || !firestore || !storage) return;
    const storageRef = ref(storage, `chatImages/${chatId}/${Date.now()}_${file.name}`);
    
    try {
        const snap = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snap.ref);
        
        const messagesCol = collection(firestore, 'chats', chatId, 'messages');
        const messageData = {
            senderId: user.uid,
            imageURL: url,
            type: 'image' as 'image',
            createdAt: serverTimestamp(),
        };
        await addDoc(messagesCol, messageData).catch(error => {
             if (error.code === 'permission-denied') {
                const permissionError = new FirestorePermissionError({
                    path: messagesCol.path,
                    operation: 'create',
                    requestResourceData: messageData,
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Something went wrong.',
                    description: error.message || 'Could not send image.',
                });
            }
        });
        
        const chatDocRef = doc(firestore, 'chats', chatId);
        await updateDoc(chatDocRef, {
            lastMessage: '[Image]',
            updatedAt: serverTimestamp(),
        });
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Image upload failed',
            description: error.message || 'Could not upload image.',
        });
    }
  };
  
  if (loading) return <Loading />;
  if (!user) return <p>Please log in to chat.</p>;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white dark:bg-black">
      <header className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Button>
        <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.profilePicture} />
            <AvatarFallback>{otherUser?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold flex-1">{otherUser?.name || 'Chat'}</h2>
        <CallButton calleeUid={otherUid} kind="audio" />
        <CallButton calleeUid={otherUid} kind="video" />
      </header>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} isMine={m.senderId === user.uid} otherUser={otherUser} />
          ))}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 border-t p-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && sendText()}
        />
        <input type="file" style={{ display: 'none' }} ref={fileRef} onChange={(e) => e.target.files && sendImage(e.target.files[0])} accept="image/*" />
        <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()}>
          <Paperclip />
        </Button>
        <Button onClick={sendText} disabled={!text.trim()}>
          <Send />
        </Button>
      </div>
    </div>
  );
}
