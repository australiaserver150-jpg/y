"use client";

import { generateSmartReplies } from "@/ai/flows/smart-reply-suggestions";
import { useEffect, useState, useTransition } from "react";
import type { Message } from "@/lib/types";
import { Button } from "../ui/button";
import { WandSparkles } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface SmartReplyProps {
  lastMessage: Message | undefined;
  onSelectReply: (reply: string) => void;
}

export function SmartReply({ lastMessage, onSelectReply }: SmartReplyProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (lastMessage) {
      startTransition(async () => {
        try {
          const response = await generateSmartReplies({ message: lastMessage.text });
          setSuggestions(response.suggestions || []);
        } catch (error) {
          console.error("Failed to generate smart replies:", error);
          setSuggestions([]);
        }
      });
    } else {
      setSuggestions([]);
    }
  }, [lastMessage]);

  if (isPending) {
    return (
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2">
        <WandSparkles className="h-5 w-5 text-muted-foreground shrink-0" />
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelectReply(suggestion)}
          className="shrink-0 animate-in fade-in-0 zoom-in-95 duration-300"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
}
