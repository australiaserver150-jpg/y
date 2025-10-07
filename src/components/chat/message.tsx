import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
}

export function Message({ message, isCurrentUser }: MessageProps) {
  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isCurrentUser ? "justify-end" : "justify-start",
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn(
                "max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl",
                isCurrentUser
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-card text-card-foreground rounded-bl-none border"
              )}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent side={isCurrentUser ? "left" : "right"}>
            <p>{format(message.timestamp, "PPpp")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
