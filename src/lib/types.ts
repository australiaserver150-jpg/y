
import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
};

export type Conversation = {
  id: string;
  participants: [User, User];
  messages: Message[];
};

export type ChatParticipant = {
  userId: string;
  name: string;
  avatar: string;
};

export type Chat = {
  id: string;
  lastMessage: string;
  timestamp: Timestamp;
  participants: string[];
  participantInfo: ChatParticipant[];
  chatName?: string;
};

export type Status = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'text' | 'media';
  content: string; // URL for media, or the text content itself
  timestamp: Timestamp;
  duration: number; // in seconds
  viewers: string[]; // array of user IDs
};
