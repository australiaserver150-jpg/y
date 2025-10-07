"use client";

import * as React from "react";
import {
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { conversations as initialConversations, currentUser } from "@/lib/data";
import type { Conversation, Message, User } from "@/lib/types";
import { ContactList } from "@/components/chat/contact-list";
import { UserProfile } from "@/components/chat/user-profile";
import { ChatWindow } from "@/components/chat/chat-window";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";

export default function ConnectNowPage() {
  const [conversations, setConversations] =
    React.useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = React.useState<
    string | null
  >(initialConversations[0]?.id || null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  
  const handleSendMessage = (messageText: string) => {
    if (!activeConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      text: messageText,
      timestamp: new Date(),
    };

    const updatedConversations = conversations.map((convo) => {
      if (convo.id === activeConversationId) {
        return { ...convo, messages: [...convo.messages, newMessage] };
      }
      return convo;
    });

    setConversations(updatedConversations);
    
    // Simulate a reply from the other user
    const otherUser = activeConversation.participants.find(p => p.id !== currentUser.id);
    if(otherUser) {
        setTimeout(() => {
            const replyMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                sender: otherUser,
                text: `This is an automated reply to "${messageText}"`,
                timestamp: new Date(),
            };
            const repliedConversations = updatedConversations.map((convo) => {
                if (convo.id === activeConversationId) {
                    return { ...convo, messages: [...convo.messages, replyMessage] };
                }
                return convo;
            });
            setConversations(repliedConversations);
        }, 1500);
    }
  };

  const { isMobile } = useSidebar();

  return (
    <SidebarProvider defaultOpen>
      <div className="h-screen flex flex-col">
        <Sidebar className="border-r" side="left" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Logo className="size-8 text-primary" />
              <h1 className="font-headline text-2xl font-bold text-primary-foreground group-data-[collapsible=icon]:hidden">
                ConnectNow
              </h1>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-0">
            <div className="p-2 space-y-4">
              <UserProfile user={currentUser} />
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
              </div>
            </div>
            <ContactList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onContactSelect={setActiveConversationId}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          {activeConversation ? (
            <ChatWindow
              key={activeConversation.id}
              conversation={activeConversation}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                {!isMobile && <SidebarTrigger className="absolute top-4 left-4" />}
                <p className="text-muted-foreground">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
