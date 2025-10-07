'use client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUser } from '@/firebase';

export type Message = {
  id?: string;
  senderId: string;
  text?: string;
  imageURL?: string;
  type: 'text' | 'image';
  timestamp: any;
};

export type OtherUser = {
  displayName?: string;
  profilePicture?: string;
  onlineStatus?: boolean;
} | null;

export function MessageBubble({ message, isMine, otherUser }: { message: Message, isMine: boolean, otherUser: OtherUser }) {
  const user = useUser().user;
  return (
      <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
          {!isMine && (
              <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser?.profilePicture} alt={otherUser?.displayName || 'U'} />
                  <AvatarFallback>{otherUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
          )}
          <div className={`max-w-[75%] rounded-lg p-3 ${isMine ? 'bg-primary text-primary-foreground' : 'bg-card shadow-sm'}`}>
              {message.type === 'text' && <p className="whitespace-pre-wrap">{message.text}</p>}
              {message.type === 'image' && message.imageURL && (
                  <img src={message.imageURL} alt="Sent" className="max-w-full rounded-md" />
              )}
              <p className="text-xs mt-2 text-right opacity-70">
                  {message.timestamp?.toDate ? new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
              </p>
          </div>
           {isMine && user && (
              <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'U'} />
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
          )}
      </div>
  );
}
