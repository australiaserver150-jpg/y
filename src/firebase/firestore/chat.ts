
'use client';

import { addDoc, collection, doc, serverTimestamp, updateDoc, Firestore } from "firebase/firestore";
import { errorEmitter } from "../error-emitter";
import { FirestorePermissionError } from "../errors";

export async function sendMessage(db: Firestore, chatId: string, senderId: string, text: string) {
  if (!text.trim()) return;

  const messagesColRef = collection(db, 'chats', chatId, 'messages');
  const chatDocRef = doc(db, 'chats', chatId);

  const messageData = {
    senderId,
    text: text.trim(),
    timestamp: serverTimestamp(),
  };

  addDoc(messagesColRef, messageData).catch(error => {
    errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: messagesColRef.path,
            operation: 'create',
            requestResourceData: messageData
        })
    );
  });

  updateDoc(chatDocRef, {
    lastMessage: text.trim(),
    timestamp: serverTimestamp(),
  }).catch(error => {
    errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: chatDocRef.path,
            operation: 'update',
            requestResourceData: {
                lastMessage: text.trim(),
                timestamp: "SERVER_TIMESTAMP"
            }
        })
    )
  });
}
