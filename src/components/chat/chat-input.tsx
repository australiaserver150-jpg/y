"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, SendHorizontal, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SmartReply } from "./smart-reply";
import type { Message } from "@/lib/types";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  lastMessage: Message | undefined;
}

export function ChatInput({ onSendMessage, lastMessage }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSelectReply = (reply: string) => {
    setMessage(reply);
    textareaRef.current?.focus();
  };
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t bg-background px-4 py-3">
      <SmartReply lastMessage={lastMessage} onSelectReply={handleSelectReply} />
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="pr-28 py-2 resize-none max-h-40"
          rows={1}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Smile className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Paperclip className="size-5" />
          </Button>
          <Button onClick={handleSend} size="icon" disabled={!message.trim()}>
            <SendHorizontal className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
