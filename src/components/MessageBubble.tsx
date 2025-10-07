'use client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUser } from '@/firebase';

export type Message = {
  id?: string;
  senderId: string;
  text?: string;
  imageURL?: string;
  type: 'text' | 'image';
  createdAt: any;
};

export type OtherUser = {
  name?: string;
  profilePicture?: string;
} | null;

export function MessageBubble({ message, isMine, otherUser }: { message: Message, isMine: boolean, otherUser: OtherUser }) {
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
           {isMine && user && (
              <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
          )}
      </div>
  );
}
