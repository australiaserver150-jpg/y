
import type { User, Conversation } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const currentUser: User = {
  id: 'user-1',
  name: 'You',
  avatar: PlaceHolderImages[0]?.imageUrl || '',
  status: 'online',
};

const users: User[] = [
  {
    id: 'user-2',
    name: 'Alice',
    avatar: PlaceHolderImages[1]?.imageUrl || '',
    status: 'online',
  },
  {
    id: 'user-3',
    name: 'Bob',
    avatar: PlaceHolderImages[2]?.imageUrl || '',
    status: 'offline',
  },
  {
    id: 'user-4',
    name: 'Charlie',
    avatar: PlaceHolderImages[3]?.imageUrl || '',
    status: 'away',
  },
   {
    id: 'user-5',
    name: 'Diana',
    avatar: PlaceHolderImages[4]?.imageUrl || '',
    status: 'online',
  },
];

export const conversations: Conversation[] = [
  {
    id: 'convo-1',
    participants: [currentUser, users[0]],
    messages: [
      {
        id: 'msg-1',
        sender: users[0],
        text: 'Hey! How are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: 'msg-2',
        sender: currentUser,
        text: "I'm doing great, thanks for asking! How about you?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
      },
      {
        id: 'msg-3',
        sender: users[0],
        text: "I'm good too. Just finished a big project. Are you free this weekend?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
  },
  {
    id: 'convo-2',
    participants: [currentUser, users[1]],
    messages: [
      {
        id: 'msg-4',
        sender: users[1],
        text: 'Did you get the files I sent yesterday?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
       {
        id: 'msg-5',
        sender: currentUser,
        text: "Yes, I got them. I'll take a look and get back to you.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
      },
    ],
  },
  {
    id: 'convo-3',
    participants: [currentUser, users[2]],
    messages: [
      {
        id: 'msg-6',
        sender: currentUser,
        text: 'Meeting at 3 PM today?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
  },
   {
    id: 'convo-4',
    participants: [currentUser, users[3]],
    messages: [
      {
        id: 'msg-7',
        sender: users[3],
        text: 'Happy Birthday! 🎉',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
    ],
  },
];
