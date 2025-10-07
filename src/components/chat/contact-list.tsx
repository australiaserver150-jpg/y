"use client";

import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useSidebar } from "@/components/ui/sidebar";

interface ContactListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onContactSelect: (id: string) => void;
}

export function ContactList({
  conversations,
  activeConversationId,
  onContactSelect,
}: ContactListProps) {

  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === 'collapsed';

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {conversations.map((convo) => {
          const otherUser = convo.participants[1];
          const lastMessage = convo.messages[convo.messages.length - 1];

          return (
            <button
              key={convo.id}
              onClick={() => onContactSelect(convo.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                "hover:bg-accent",
                activeConversationId === convo.id ? "bg-accent" : ""
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="flex-1 truncate">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">{otherUser.name}</h3>
                    {lastMessage && (
                       <p className="text-xs text-muted-foreground">
                         {formatDistanceToNow(lastMessage.timestamp, { addSuffix: true })}
                       </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage?.text}
                    </p>
                    {/* Placeholder for unread count */}
                    {/* <Badge variant="default" className="h-5">3</Badge> */}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
