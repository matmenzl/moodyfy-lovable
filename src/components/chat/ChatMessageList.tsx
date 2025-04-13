
import React, { useRef, useEffect } from "react";
import ChatMessage from "../ChatMessage";
import { Message } from "./types";

interface ChatMessageListProps {
  messages: Message[];
  isLoadingMessage: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, isLoadingMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          content={message.content}
          type={message.type}
          isLoading={message.id === 'loading' && isLoadingMessage}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
