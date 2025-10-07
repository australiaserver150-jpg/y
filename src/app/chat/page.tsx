
"use client";

import * as React from "react";
import {
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { conversations as initialConversations } from "@/lib/data";
import type { Conversation, Message, User } from "@/lib/types";
import { ContactList } from "@/components/chat/contact-list";
import { UserProfile } from "@/components/chat/user-profile";
import { ChatWindow } from "@/components/chat/chat-window";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Loading } from "@/components/Loading";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useFirebase } from "@/firebase/provider";

function ChatLayout() {
  const { auth, db } = useFirebase();
  const [conversations, setConversations] =
    React.useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = React.useState<
    string | null
  >(initialConversations[0]?.id || null);

  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [localUser, setLocalUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (user && db) {
      const fetchUserData = async () => {
        if (!db) {
          console.error("Firestore is not initialized");
          return;
        }
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setLocalUser({ id: user.uid, ...userDoc.data() } as User);
        } else {
          setLocalUser({
            id: user.uid,
            name: user.displayName || user.email || "User",
            avatar: user.photoURL || PlaceHolderImages[0]?.imageUrl || '',
            status: 'online',
          });
        }
      };
      fetchUserData();
    }
  }, [user, loading, router, db]);


  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  
  const handleSendMessage = (messageText: string) => {
    if (!activeConversation || !localUser) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: localUser,
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
    
    const otherUser = activeConversation.participants.find(p => p.id !== localUser.id);
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

  const handleSignOut = async () => {
    if(auth) {
        await auth.signOut();
    }
    router.push('/');
  }

  const { isMobile } = useSidebar();
  
  if (loading || !user || !localUser) {
    return <Loading />;
  }

  return (
    <div className="h-screen flex flex-col">
      <Sidebar className="border-r" side="left" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="size-8 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
              ConnectNow
            </h1>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-0">
          <div className="p-2 space-y-4">
            <UserProfile user={localUser} />
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          </div>
          <ContactList
            conversations={conversations.map(c => ({...c, participants: [localUser, c.participants.find(p=> p.id !== localUser.id)!]}))}
            activeConversationId={activeConversationId}
            onContactSelect={setActiveConversationId}
            currentUser={localUser}
          />
        </SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.push('/profile')} tooltip="Profile Settings">
              <Settings />
              Profile Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.push('/settings')} tooltip="Settings">
              <Settings />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton onClick={handleSignOut} tooltip="Logout">
                <LogOut />
                Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </Sidebar>

      <main className="flex-1">
        {activeConversation ? (
          <ChatWindow
            key={activeConversation.id}
            conversation={{...activeConversation, participants: [localUser, activeConversation.participants.find(p=> p.id !== localUser.id)!]}}
            currentUser={localUser}
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
      </main>
    </div>
  );
}


export default function ConnectNowChatPage() {
  return (
      <SidebarProvider defaultOpen>
        <ChatLayout />
      </SidebarProvider>
  );
}
