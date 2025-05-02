
import React from 'react';
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Song } from '@/components/SongList';
import ChatInterface from './chat/ChatInterface';

interface ChatInterfaceWrapperProps {
  onSubmitMood: (mood: string, genre: string, useHistory?: boolean, excludeSongs?: Song[]) => void;
  onGenreSelect: (mood: string, genre: string, useHistory: boolean) => void;
  onConfirmPlaylist: () => void;
  onRejectPlaylist: () => void;
  songs: Song[];
  addedSongs?: Song[];
  notFoundSongs?: Song[];
  suggestedGenres?: string[];
  historyTracksPreview?: Song[];
  mood: string;
  genre: string;
  playlistUrl: string;
  step: 'MoodInput' | 'GenreSelection' | 'SongRecommendations' | 'PlaylistCreated';
  isLoading: boolean;
  onReset: () => void;
}

// This is just a wrapper that re-exports the refactored component
// to maintain backward compatibility with existing code
const ChatInterfaceWrapper = (props: ChatInterfaceWrapperProps) => {
  return <ChatInterface {...props} />;
};

export default ChatInterfaceWrapper;
