
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, orderBy, query, serverTimestamp, addDoc } from 'firebase/firestore';
import { Channel, Message } from '@/lib/types';
import { Loading } from '@/components/Loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hash, MoreVertical, Paperclip, SendHorizontal, Smile } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function ChannelHeader({ channel }: { channel: Channel }) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-4 p-3 border-b bg-card">
      <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
        <ArrowLeft />
      </Button>
      <Avatar className="bg-muted">
        <AvatarFallback><Hash className="w-5 h-5 text-muted-foreground"/></AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h2 className="font-semibold">{channel.name}</h2>
        <p className="text-xs text-muted-foreground">{channel.memberIds.length} members</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
      </div>
    </header>
  );
}

function MessageBubble({ message }: { message: Message }) {
    const {data: sender, isLoading} = useDoc(doc(useFirestore()!, 'users', message.senderId));
    const timestamp = message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '';

    if (isLoading) {
        return <div className="h-12"></div>;
    }

    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
                <AvatarImage src={(sender as any)?.avatar} />
                <AvatarFallback>{(sender as any)?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
                <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-sm">{(sender as any)?.name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">{timestamp}</p>
                </div>
                <div className="bg-muted/50 px-3 py-2 rounded-lg rounded-tl-none mt-1">
                    <p className="text-sm">{message.text}</p>
                </div>
            </div>
        </div>
    );
}

function MessageList({ messages }: { messages: Message[] | null }) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages?.map(msg => <MessageBubble key={msg.id} message={msg} />)}
    </div>
  );
}

function ChannelInput({ onSendMessage }: { onSendMessage: (text: string) => void }) {
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
        placeholder="Message in channel"
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
      <Button type="submit" size="icon" className="bg-primary rounded-full w-10 h-10">
        <SendHorizontal className="w-5 h-5"/>
      </Button>
    </form>
  );
}

export default function ChannelDetailsPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const channelDocRef = useMemoFirebase(() => {
    if (!firestore || !channelId) return null;
    return doc(firestore, 'channels', channelId);
  }, [firestore, channelId]);

  const { data: channel, isLoading: isChannelLoading } = useDoc<Channel>(channelDocRef);

  const messagesColRef = useMemoFirebase(() => {
    if (!firestore || !channelId) return null;
    return query(collection(firestore, 'channels', channelId, 'messages'), orderBy('timestamp', 'asc'));
  }, [firestore, channelId]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesColRef);

  const handleSendMessage = async (text: string) => {
    if (!firestore || !channelId || !user) return;

    try {
      await addDoc(collection(firestore, 'channels', channelId, 'messages'), {
        senderId: user.uid,
        text,
        timestamp: serverTimestamp(),
      });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Failed to send message",
            description: error.message
        })
    }
  };

  if (isUserLoading || isChannelLoading) {
    return <Loading />;
  }

  if (!channel || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Channel not found or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-card border-x">
      <ChannelHeader channel={channel} />
      <MessageList messages={messages} />
      <ChannelInput onSendMessage={handleSendMessage} />
    </div>
  );
}
