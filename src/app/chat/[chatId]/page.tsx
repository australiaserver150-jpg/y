
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { Chat, Message, User as UserType } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Paperclip, Phone, SendHorizontal, Smile, Video } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { sendMessage } from '@/firebase/firestore/chat';

function ChatHeader({ chat, currentUserId }: { chat: Chat; currentUserId: string }) {
  const router = useRouter();
  const otherParticipant = chat.participantInfo.find(p => p.userId !== currentUserId);

  if (!otherParticipant) {
    return (
      <header className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="flex-1 text-center">
          <h2 className="font-semibold">Chat</h2>
        </div>
        <div className="w-8"></div>
      </header>
    );
  }

  return (
    <header className="flex items-center gap-4 p-3 border-b bg-card">
      <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
        <ArrowLeft />
      </Button>
      <Avatar>
        <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
        <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h2 className="font-semibold">{otherParticipant.name}</h2>
        <p className="text-xs text-muted-foreground">online</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
        <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
      </div>
    </header>
  );
}

function MessageBubble({ message, isCurrentUser, otherUserAvatar }: { message: Message, isCurrentUser: boolean, otherUserAvatar?: string }) {
  const timestamp = message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

  return (
    <div className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
       {!isCurrentUser && (
         <Avatar className="h-6 w-6">
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback></AvatarFallback>
        </Avatar>
       )}
      <div className={cn(
        "relative max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg",
        isCurrentUser
          ? "bg-green-100 dark:bg-green-800/70 rounded-br-none"
          : "bg-card border rounded-bl-none"
      )}>
        <p className="text-sm">{message.text}</p>
         <p className="text-[10px] text-right text-muted-foreground mt-1">{timestamp}</p>
         {isCurrentUser && (
            <div className="absolute bottom-1 right-2">
                 <Badge variant="read" />
            </div>
         )}
      </div>
    </div>
  );
}


function ChatMessages({ messages, currentUserId, participantInfo }: { messages: Message[] | null, currentUserId: string, participantInfo: Chat['participantInfo'] }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const otherParticipant = participantInfo.find(p => p.userId !== currentUserId);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://i.redd.it/qwd83gr4b2561.jpg')] bg-center bg-cover">
      {messages?.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isCurrentUser={msg.senderId === currentUserId}
          otherUserAvatar={otherParticipant?.avatar}
        />
      ))}
    </div>
  );
}

function ChatInput({ onSendMessage }: { onSendMessage: (text: string) => void }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 border-t bg-background flex items-center gap-2">
      <Button variant="ghost" size="icon"><Smile /></Button>
      <Textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type a message"
        className="flex-1 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        rows={1}
        onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }}
      />
      <Button variant="ghost" size="icon"><Paperclip /></Button>
      <Button type="submit" size="icon" className="bg-green-500 hover:bg-green-600 rounded-full w-12 h-12">
        <SendHorizontal />
      </Button>
    </form>
  );
}

export default function ChatDetailsPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const chatDocRef = useMemoFirebase(() => {
    if (!firestore || !chatId) return null;
    return doc(firestore, 'chats', chatId);
  }, [firestore, chatId]);

  const { data: chat, isLoading: isChatLoading } = useDoc<Chat>(chatDocRef);

  const messagesColRef = useMemoFirebase(() => {
    if (!firestore || !chatId) return null;
    return query(collection(firestore, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
  }, [firestore, chatId]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesColRef);

  const handleSendMessage = async (text: string) => {
    if (!firestore || !chatId || !user) return;
    await sendMessage(firestore, chatId, user.uid, text);
  };

  if (isUserLoading || isChatLoading || areMessagesLoading) {
    return <Loading />;
  }

  if (!chat || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chat not found or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-card border-x">
      <ChatHeader chat={chat} currentUserId={user.uid} />
      <ChatMessages messages={messages} currentUserId={user.uid} participantInfo={chat.participantInfo} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
