
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import ChatHeader from './ChatHeader';
import ChatInputArea from './ChatInputArea';
import ChatMessageList from './ChatMessageList';
import { Message } from './types';
import { Song } from '../SongList';

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

const ChatInterface: React.FC<ChatInterfaceProps> = ({
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
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: <ChatHeader />,
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

  const handleSubmit = (input: string) => {
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
      <ChatMessageList messages={messages} isLoadingMessage={isLoading} />

      {/* Input area */}
      <ChatInputArea onSubmit={handleSubmit} disabled={step !== 'MoodInput' || isLoading} />
    </div>
  );
};

export default ChatInterface;
