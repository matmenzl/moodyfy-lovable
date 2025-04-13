
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputAreaProps {
  onSubmit: (input: string) => void;
  disabled?: boolean;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ onSubmit, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    onSubmit(input);
    setInput('');
  };

  return (
    <div className="border-t border-white/10 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me how you're feeling..."
          disabled={disabled}
          className="bg-black/30 border-white/10 focus:border-moodyfy-accent/50 focus:ring-moodyfy-accent/20"
        />
        <Button 
          type="submit" 
          disabled={!input.trim() || disabled}
          className="bg-moodyfy-accent hover:bg-moodyfy-accent/80"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInputArea;
