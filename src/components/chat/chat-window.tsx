"use client";
import type { Conversation, User, Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatWindowProps {
  conversation: Conversation;
  currentUser: User;
  onSendMessage: (message: string) => void;
}

export function ChatWindow({
  conversation,
  currentUser,
  onSendMessage,
}: ChatWindowProps) {
  const otherUser = conversation.participants.find(
    (p) => p.id !== currentUser.id
  );
  
  if (!otherUser) return null;

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden"/>
          <Avatar>
            <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold font-headline">{otherUser.name}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${otherUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <p className="text-xs text-muted-foreground capitalize">{otherUser.status}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Phone className="size-5"/></Button>
            <Button variant="ghost" size="icon"><Video className="size-5"/></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="size-5"/></Button>
        </div>
      </header>

      <MessageList
        messages={conversation.messages}
        currentUser={currentUser}
      />
      
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
