'use client';
import React, { useState, useRef } from 'react';
import { useUser, useFirestore, useStorage } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Paperclip, Send } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function ChatInput({ chatId }: { chatId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const sendingRef = useRef(false);

  const sendText = async () => {
    if (!text.trim() || sendingRef.current) return;
    if (!user || !chatId || !firestore) {
      toast({ variant: 'destructive', title: 'Could not send message' });
      return;
    }
    sendingRef.current = true;

    try {
      const messagesCol = collection(firestore, 'chats', chatId, 'messages');
      const messageData = {
        senderId: user.uid,
        text: text.trim(),
        type: 'text' as 'text',
        timestamp: serverTimestamp(),
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
          throw error;
        }
      });
  
      const chatDocRef = doc(firestore, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: text.trim(),
        updatedAt: serverTimestamp(),
      });
      setText('');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Something went wrong.',
            description: error.message || 'Could not send message.',
        });
    } finally {
        sendingRef.current = false;
    }
  };

  const sendImage = async (file: File | null) => {
    if (!file) return;
    if (!user || !chatId || !storage || !firestore) {
        toast({ variant: 'destructive', title: 'Could not send image' });
        return;
    }
    sendingRef.current = true;
    
    try {
        const storageRef = ref(storage, `chatImages/${chatId}/${Date.now()}_${file.name}`);
        const snap = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snap.ref);
        
        const messagesCol = collection(firestore, 'chats', chatId, 'messages');
        const messageData = {
            senderId: user.uid,
            imageURL: url,
            type: 'image' as 'image',
            timestamp: serverTimestamp(),
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
                throw error;
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
    } finally {
        sendingRef.current = false;
        if(fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 border-t p-4 bg-background">
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileRef}
        onChange={(e) => sendImage(e.target.files ? e.target.files[0] : null)}
      />
      <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()}>
        <Paperclip />
         <span className="sr-only">Attach image</span>
      </Button>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
        className="flex-1"
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendText();
            }
        }}
      />
      <Button onClick={sendText} disabled={!text.trim() || sendingRef.current}>
        <Send />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}
