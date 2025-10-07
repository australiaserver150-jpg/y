'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import placeholderImages from '@/lib/placeholder-images.json';
import Image from 'next/image';

const chats = [
  {
    name: 'Alex Chen',
    avatar: placeholderImages.alex_chen.url,
    avatarHint: placeholderImages.alex_chen.hint,
    lastMessage: 'Audio',
    timestamp: '2:45 PM',
    unreadCount: 0,
    status: 'sent',
  },
  {
    name: 'Anya Sharma',
    avatar: placeholderImages.anya_sharma.url,
    avatarHint: placeholderImages.anya_sharma.hint,
    lastMessage: 'Hey, how ann you?',
    timestamp: '12:45 PM',
    unreadCount: 0,
    status: 'read',
  },
  {
    name: 'A',
    avatar: '',
    lastMessage: 'Voice note',
    timestamp: '10/21/25',
    unreadCount: 2,
    status: 'delivered',
    isInitial: true,
    initialBg: 'bg-blue-500',
  },
  {
    name: 'Mountains & Lakes',
    avatar: placeholderImages.mountains_lakes.url,
    avatarHint: placeholderImages.mountains_lakes.hint,
    lastMessage: 'Shared a photo',
    timestamp: '10/26/25',
    unreadCount: 2,
    status: 'sent',
    isGroup: true,
  },
  {
    name: 'Marco Diaz',
    avatar: '',
    lastMessage: 'Photo',
    timestamp: '10/26/25',
    unreadCount: 2,
    status: 'sent',
    isInitial: true,
    initialBg: 'bg-purple-500',
    initialChar: 'M',
  },
  {
    name: 'Subin',
    avatar: '',
    lastMessage: 'Voice call',
    timestamp: '',
    unreadCount: 0,
    status: 'sent',
    isInitial: true,
    initialBg: 'bg-purple-500',
    initialChar: 'S',
  },
];

export function ChatList() {
  return (
    <div className="flex flex-col">
      {chats.map((chat, index) => (
        <div key={index} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
          <div className="relative">
             {chat.isInitial ? (
              <Avatar className={`h-12 w-12 ${chat.initialBg}`}>
                <AvatarFallback className="text-white text-lg">
                  {chat.initialChar || chat.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Image 
                src={chat.avatar} 
                alt={chat.name} 
                width={48} 
                height={48} 
                className={`rounded-full ${chat.isGroup ? 'rounded-md' : ''}`}
                data-ai-hint={chat.avatarHint}
              />
            )}
          </div>
          <div className="flex-1 ml-3">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{chat.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-400 dark:text-gray-500">{chat.timestamp}</p>
            <div className="flex items-center mt-1">
              {chat.unreadCount > 0 && <Badge className="bg-green-500 text-white w-5 h-5 flex items-center justify-center p-0">{chat.unreadCount}</Badge>}
              {chat.status === 'read' && <Badge variant="read" />}
              {chat.status === 'delivered' && <Badge variant="delivered" />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
