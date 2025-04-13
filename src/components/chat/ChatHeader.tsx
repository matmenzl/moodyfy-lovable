
import React from "react";

const ChatHeader: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gradient">Welcome to Moodyfy! 🎵</h3>
      <p>Tell me how you're feeling right now, and I'll create a personalized playlist just for you.</p>
      <p>You can also specify a music genre if you'd like.</p>
      <p className="text-sm text-muted-foreground">For example: "I'm feeling energetic and I'd like some rock music"</p>
    </div>
  );
};

export default ChatHeader;
