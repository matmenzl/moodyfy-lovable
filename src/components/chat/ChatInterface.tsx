
import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { History } from "lucide-react";
import ChatHeader from './ChatHeader';
import ChatInputArea from './ChatInputArea';
import ChatMessageList from './ChatMessageList';
import GenreSelectionStep from './GenreSelectionStep';
import PlaylistRecommendations from './PlaylistRecommendations';
import PlaylistCreated from './PlaylistCreated';
import { Message } from './types';
import { Song } from '../SongList';
import { isSpotifyConnected } from '@/services/spotifyAuthService';
import { MessageType } from '../ChatMessage';
import { parseMoodAndGenre } from './utils/messageParser';

interface ChatInterfaceProps {
  onSubmitMood: (mood: string, genre: string, useHistory?: boolean, excludeSongs?: Song[]) => void;
  onGenreSelect: (mood: string, genre: string, useHistory: boolean) => void;
  onConfirmPlaylist: () => void;
  onRejectPlaylist: () => void;
  songs: Song[];
  addedSongs?: Song[];
  notFoundSongs?: Song[];
  suggestedGenres: string[];
  historyTracksPreview: Song[];
  mood: string;
  genre: string;
  playlistUrl: string;
  step: 'MoodInput' | 'GenreSelection' | 'SongRecommendations' | 'PlaylistCreated';
  isLoading: boolean;
  onReset: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSubmitMood,
  onGenreSelect,
  onConfirmPlaylist,
  onRejectPlaylist,
  songs,
  addedSongs = [],
  notFoundSongs = [],
  suggestedGenres,
  historyTracksPreview,
  mood,
  genre,
  playlistUrl,
  step,
  isLoading,
  onReset
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [useHistory, setUseHistory] = useState(false);
  const spotifyConnected = isSpotifyConnected();

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: <ChatHeader />,
          type: 'assistant' as MessageType
        }
      ]);
    }
  }, [messages.length]);

  // Add genre selection message
  useEffect(() => {
    if (mood && step === 'GenreSelection' && suggestedGenres.length > 0 && 
        !messages.some(msg => msg.id === 'genre-suggestions')) {
      
      addMessagePair({
        userMsg: {
          id: 'user-mood',
          content: <p>I'm feeling {mood}</p>,
          type: 'user' as MessageType
        },
        aiMsg: {
          id: 'genre-suggestions',
          content: (
            <GenreSelectionStep 
              suggestedGenres={suggestedGenres}
              mood={mood}
              onGenreSelect={(selectedGenre) => onGenreSelect(mood, selectedGenre, useHistory)}
              isLoading={isLoading}
              historyTracksPreview={historyTracksPreview}
            />
          ),
          type: 'assistant' as MessageType
        }
      });
    }
  }, [mood, step, suggestedGenres, onGenreSelect, useHistory, isLoading, historyTracksPreview]);

  // Add songs message 
  useEffect(() => {
    if (songs.length > 0 && step === 'SongRecommendations' && !messages.some(msg => msg.id === 'songs')) {
      const newMessages: Message[] = [];
      
      // Only add the mood message if not already present
      if (!messages.some(msg => msg.id === 'user-mood')) {
        newMessages.push({
          id: 'user-mood',
          content: <p>I'm feeling {mood}</p>,
          type: 'user' as MessageType
        });
      }
      
      // Add genre selection confirmation if from genre selection step
      if (suggestedGenres.length > 0) {
        newMessages.push({
          id: 'genre-selection',
          content: <p>I'd like some {genre} music</p>,
          type: 'user' as MessageType
        });
      }
      
      // Add songs recommendation message
      newMessages.push({
        id: 'songs',
        content: (
          <PlaylistRecommendations
            songs={songs}
            mood={mood}
            genre={genre}
            useHistory={useHistory}
            onConfirmPlaylist={onConfirmPlaylist}
            onRejectPlaylist={handleRejectPlaylist}
          />
        ),
        type: 'assistant' as MessageType
      });
      
      setMessages(prev => [...prev, ...newMessages]);
    }
  }, [songs, step, mood, genre, onConfirmPlaylist, useHistory, suggestedGenres]);

  // Add playlist created message
  useEffect(() => {
    if (playlistUrl && step === 'PlaylistCreated' && !messages.some(msg => msg.id === 'playlist-created')) {
      addMessagePair({
        userMsg: {
          id: 'playlist-confirmation',
          content: <p>Yes, please create a playlist with these songs!</p>,
          type: 'user' as MessageType
        },
        aiMsg: {
          id: 'playlist-created',
          content: (
            <PlaylistCreated
              addedSongs={addedSongs}
              notFoundSongs={notFoundSongs}
              playlistUrl={playlistUrl}
              songs={songs}
              onReset={onReset}
            />
          ),
          type: 'assistant' as MessageType
        }
      });
    }
  }, [playlistUrl, step, onReset, addedSongs, notFoundSongs, songs]);

  // Helper function to add message pairs
  const addMessagePair = ({ userMsg, aiMsg }: { userMsg: Message, aiMsg: Message }) => {
    setMessages(prev => [...prev, userMsg, aiMsg]);
  };

  // Handle rejection and regeneration of playlist
  const handleRejectPlaylist = () => {
    // Add a loader message
    setMessages(prev => {
      // Filter out old song and genre messages
      const filteredMessages = prev.filter(msg => msg.id !== 'songs' && msg.id !== 'genre-selection');
      
      // Add the regeneration message
      return [...filteredMessages, {
        id: 'regenerating',
        content: <p>Let me find some different songs for you...</p>,
        type: 'assistant' as MessageType
      }];
    });

    // Call the parent rejection handler
    onRejectPlaylist();
    
    // Small delay to show the loading text
    setTimeout(() => {
      if (mood) {
        // Pass previous songs as exclusion list
        onSubmitMood(mood, genre, useHistory, songs);
      }
    }, 100);
  };

  // Handle user input submission
  const handleSubmit = (input: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      content: <p>{input}</p>,
      type: 'user' as MessageType
    }]);
    
    // Parse mood and genre from input
    const { mood: userMood, genre: userGenre } = parseMoodAndGenre(input);
    
    // Add loading message
    setMessages(prev => [...prev, {
      id: 'loading',
      content: <p>Finding the perfect songs for your mood using AI...</p>,
      type: 'assistant' as MessageType,
    }]);
    
    // Submit mood and genre
    onSubmitMood(userMood, userGenre, useHistory);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-3xl mx-auto">
      {/* Messages area */}
      <ChatMessageList messages={messages} isLoadingMessage={isLoading} />

      {/* Input area with history checkbox for Spotify users */}
      <div className="mt-auto">
        {step === 'MoodInput' && spotifyConnected && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <Checkbox
              id="use-history"
              checked={useHistory}
              onCheckedChange={(checked) => setUseHistory(checked === true)}
            />
            <label 
              htmlFor="use-history" 
              className="text-sm flex items-center cursor-pointer"
            >
              <History className="h-4 w-4 mr-1 text-moodyfy-accent" />
              Berücksichtige meine zuletzt gehörten Songs
            </label>
          </div>
        )}
        <ChatInputArea onSubmit={handleSubmit} disabled={step !== 'MoodInput' || isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;
