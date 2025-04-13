
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type MessageType = 'user' | 'assistant' | 'system';

export interface ChatMessageProps {
  content: React.ReactNode;
  type: MessageType;
  isLoading?: boolean;
}

const ChatMessage = ({ content, type, isLoading = false }: ChatMessageProps) => {
  const isUser = type === 'user';
  
  return (
    <div className={cn(
      "py-6 flex gap-4",
      isUser ? "bg-transparent" : "bg-secondary/20"
    )}>
      <div className="container max-w-3xl mx-auto flex gap-4 items-start">
        <div className="flex-shrink-0">
          <Avatar className={cn("h-8 w-8", isUser ? "bg-moodyfy-blue" : "bg-moodyfy-accent")}>
            {isUser ? (
              <AvatarFallback className="bg-moodyfy-blue text-white">U</AvatarFallback>
            ) : (
              <>
                <AvatarImage src="/moodyfy-logo.png" alt="Moodyfy" />
                <AvatarFallback className="bg-moodyfy-accent text-white">M</AvatarFallback>
              </>
            )}
          </Avatar>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium">
            {isUser ? 'You' : 'Moodyfy'}
          </div>
          
          <div className="prose prose-invert max-w-none">
            {isLoading ? (
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-moodyfy-blue rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-moodyfy-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-moodyfy-pink rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              content
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
