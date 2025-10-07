
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

type Chat = {
  id: string;
  name: string;
  avatar: {
    type: 'image' | 'initial';
    src?: string;
    fallback: string;
    bgColor?: string;
    hint?: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  unreadColor?: 'blue' | 'green';
  status?: 'delivered' | 'read';
  isGroup?: boolean;
};

const chats: Chat[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar: {
      type: 'image',
      src: placeholderImages.alex_chen.url,
      fallback: 'AC',
      hint: placeholderImages.alex_chen.hint
    },
    lastMessage: 'Audio',
    timestamp: '2:45 PM',
  },
  {
    id: '2',
    name: 'Anya Sharma',
    avatar: {
      type: 'image',
      src: placeholderImages.anya_sharma.url,
      fallback: 'AS',
      hint: placeholderImages.anya_sharma.hint
    },
    lastMessage: 'Hey, how ann you?',
    timestamp: '12:45 PM',
    status: 'read',
  },
  {
    id: '3',
    name: 'A',
    avatar: {
      type: 'initial',
      fallback: 'A',
      bgColor: 'bg-blue-500'
    },
    lastMessage: 'Voice note',
    timestamp: '10/21/25',
    unreadCount: 2,
    unreadColor: 'blue',
  },
  {
    id: '4',
    name: 'Mountains & Lakes',
    avatar: {
      type: 'image',
      src: placeholderImages.mountains_lakes.url,
      fallback: 'ML',
      hint: placeholderImages.mountains_lakes.hint,
    },
    lastMessage: 'Shared a photo',
    timestamp: '10/26/25',
    unreadCount: 2,
    unreadColor: 'green',
    isGroup: true,
  },
  {
    id: '5',
    name: 'Marco Diaz',
    avatar: {
      type: 'initial',
      fallback: 'M',
      bgColor: 'bg-purple-500'
    },
    lastMessage: 'Photo',
    timestamp: '10/26/25',
    unreadCount: 2,
    unreadColor: 'blue',
  },
  {
    id: '6',
    name: 'Subin',
    avatar: {
      type: 'initial',
      fallback: 'S',
      bgColor: 'bg-purple-500'
    },
    lastMessage: 'Voice call',
    timestamp: '10/26/25',
  },
];

export function ChatList() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {chats.map((chat) => (
        <div key={chat.id} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
          <Avatar className={`h-12 w-12 ${chat.isGroup ? 'rounded-md' : 'rounded-full'}`}>
            {chat.avatar.type === 'image' && chat.avatar.src && (
                <Image 
                    src={chat.avatar.src} 
                    alt={chat.name} 
                    width={48} 
                    height={48} 
                    className={`${chat.isGroup ? 'rounded-md' : 'rounded-full'}`}
                    data-ai-hint={chat.avatar.hint}
                />
            )}
            <AvatarFallback className={`${chat.avatar.bgColor} text-white ${chat.isGroup ? 'rounded-md' : 'rounded-full'}`}>
              {chat.avatar.fallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 ml-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{chat.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{chat.timestamp}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{chat.lastMessage}</p>
              <div className="flex items-center gap-1">
                {chat.status && <Badge variant={chat.status} />}
                {chat.unreadCount && (
                  <span
                    className={`h-5 w-5 rounded-full text-xs text-white flex items-center justify-center ${
                      chat.unreadColor === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                    }`}
                  >
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
