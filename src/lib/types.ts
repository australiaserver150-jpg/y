
import { Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
};

export type Message = {
  id: string;
  sender: User;
  text: string;
  timestamp: Date;
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

    