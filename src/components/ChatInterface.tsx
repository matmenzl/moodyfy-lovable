
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Music } from "lucide-react";
import ChatMessage, { MessageType } from '@/components/ChatMessage';
import { Song } from '@/components/SongList';

interface Message {
  id: string;
  content: React.ReactNode;
  type: MessageType;
}

interface ChatInterfaceProps {
  onSubmitMood: (mood: string, genre: string) => void;
  onConfirmPlaylist: () => void;
  onRejectPlaylist: () => void;
  songs: Song[];
  mood: string;
  genre: string;
  playlistUrl: string;
  step: 'MoodInput' | 'SongRecommendations' | 'PlaylistCreated';
  isLoading: boolean;
  onReset: () => void;
}

const ChatInterface = ({
  onSubmitMood,
  onConfirmPlaylist,
  onRejectPlaylist,
  songs,
  mood,
  genre,
  playlistUrl,
  step,
  isLoading,
  onReset
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gradient">Welcome to Moodyfy! 🎵</h3>
              <p>Tell me how you're feeling right now, and I'll create a personalized playlist just for you.</p>
              <p>You can also specify a music genre if you'd like.</p>
              <p className="text-sm text-muted-foreground">For example: "I'm feeling energetic and I'd like some rock music"</p>
            </div>
          ),
          type: 'assistant'
        }
      ]);
    }
  }, [messages.length]);

  // Add songs message when songs are received
  useEffect(() => {
    if (songs.length > 0 && step === 'SongRecommendations' && !messages.some(msg => msg.id === 'songs')) {
      setMessages(prev => [...prev, 
        {
          id: 'user-mood',
          content: <p>I'm feeling {mood}{genre ? ` and I'd like some ${genre} music` : ''}</p>,
          type: 'user'
        },
        {
          id: 'songs',
          content: (
            <div className="space-y-4">
              <p>Based on your <span className="text-moodyfy-blue">{mood}</span> mood{genre && <> and <span className="text-moodyfy-pink">{genre}</span> preference</>}, here are some songs I think you'll enjoy:</p>
              
              <div className="glass-card p-4 rounded-xl">
                <ul className="space-y-2">
                  {songs.map((song, index) => (
                    <li key={index} className="flex items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="p-1 bg-moodyfy-accent/20 rounded-full mr-2">
                        <Music className="h-3 w-3 text-moodyfy-accent" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-white text-sm">{song.title}</p>
                        <p className="text-xs text-gray-400">{song.artist}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <p>Would you like me to create a Spotify playlist with these songs?</p>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={onConfirmPlaylist}
                  className="bg-moodyfy-green hover:bg-moodyfy-green/80 transition-colors"
                  size="sm"
                >
                  Yes, create playlist
                </Button>
                <Button 
                  onClick={onRejectPlaylist}
                  variant="outline"
                  className="bg-transparent border-white/20 hover:bg-white/10 transition-colors"
                  size="sm"
                >
                  No, try again
                </Button>
              </div>
            </div>
          ),
          type: 'assistant'
        }
      ]);
    }
  }, [songs, step, mood, genre, onConfirmPlaylist, onRejectPlaylist]);

  // Add playlist created message
  useEffect(() => {
    if (playlistUrl && step === 'PlaylistCreated' && !messages.some(msg => msg.id === 'playlist-created')) {
      setMessages(prev => [...prev,
        {
          id: 'playlist-confirmation',
          content: <p>Yes, please create a playlist with these songs!</p>,
          type: 'user'
        },
        {
          id: 'playlist-created',
          content: (
            <div className="space-y-4">
              <p>Great! I've created your playlist based on your mood. It's now ready to listen to on Spotify.</p>
              
              <div className="glass-card p-4 rounded-xl flex flex-col items-center">
                <div className="mb-3 p-3 bg-moodyfy-green/20 rounded-full">
                  <Music className="h-6 w-6 text-moodyfy-green" />
                </div>
                <h3 className="font-bold mb-2">Your Playlist is Ready!</h3>
                
                <Button 
                  onClick={() => window.open(playlistUrl, '_blank')}
                  className="w-full bg-gradient-to-r from-moodyfy-blue to-moodyfy-accent hover:opacity-90 transition-all mb-3"
                  size="sm"
                >
                  Open in Spotify
                </Button>
                
                <Button 
                  onClick={onReset}
                  variant="outline"
                  className="w-full bg-transparent border-white/20 hover:bg-white/10 transition-colors"
                  size="sm"
                >
                  Create another playlist
                </Button>
              </div>
            </div>
          ),
          type: 'assistant'
        }
      ]);
    }
  }, [playlistUrl, step, onReset]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      content: <p>{input}</p>,
      type: 'user'
    }]);
    
    // Parse mood and genre from input
    let userMood = input;
    let userGenre = '';
    
    // Simple parsing logic - if input contains "and", assume format is "mood and genre"
    if (input.toLowerCase().includes(' and ')) {
      const parts = input.split(/ and /i);
      userMood = parts[0].trim();
      
      // Extract genre, assuming format like "I want some rock music" or just "rock"
      const genrePart = parts[1].trim();
      const genreWords = genrePart.split(' ');
      userGenre = genreWords[genreWords.length - 1].replace(/[^a-zA-Z0-9-]/g, '');
      
      // If genre is "music", try the word before it
      if (userGenre.toLowerCase() === 'music' && genreWords.length > 1) {
        userGenre = genreWords[genreWords.length - 2].replace(/[^a-zA-Z0-9-]/g, '');
      }
    }
    
    // Reset input
    setInput('');
    
    // Add loading message
    setMessages(prev => [...prev, {
      id: 'loading',
      content: <p>Finding the perfect songs for your mood...</p>,
      type: 'assistant',
    }]);
    
    // Submit mood and genre
    onSubmitMood(userMood, userGenre);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-3xl mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            type={message.type}
            isLoading={message.id === 'loading' && isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me how you're feeling..."
            disabled={step !== 'MoodInput' || isLoading}
            className="bg-black/30 border-white/10 focus:border-moodyfy-accent/50 focus:ring-moodyfy-accent/20"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || step !== 'MoodInput' || isLoading}
            className="bg-moodyfy-accent hover:bg-moodyfy-accent/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
