
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import ChatInterface from '@/components/ChatInterface';
import PlaylistHistory from '@/components/PlaylistHistory';
import SpotifyConnect from '@/components/SpotifyConnect';
import { PlaylistHistoryItem } from '@/components/chat/types';
import { Song } from '@/components/SongList';
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirectToSpotifyLogin } from '@/services/spotifyAuthService';

interface MainContentProps {
  activeTab: string;
  userAuthenticated: boolean | null;
  step: 'MoodInput' | 'SongRecommendations' | 'PlaylistCreated';
  songs: Song[];
  mood: string;
  genre: string;
  playlistUrl: string;
  addedSongs: Song[];
  notFoundSongs: Song[];
  isLoading: boolean;
  playlistHistory: PlaylistHistoryItem[];
  onSubmitMood: (mood: string, genre: string, useHistory?: boolean) => void;
  onConfirmPlaylist: () => void;
  onRejectPlaylist: () => void;
  onReset: () => void;
  onOpenPlaylist: (playlist: PlaylistHistoryItem) => void;
  onLogin: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  userAuthenticated,
  step,
  songs,
  mood,
  genre,
  playlistUrl,
  addedSongs,
  notFoundSongs,
  isLoading,
  playlistHistory,
  onSubmitMood,
  onConfirmPlaylist,
  onRejectPlaylist,
  onReset,
  onOpenPlaylist,
  onLogin
}) => {
  return (
    <>
      <TabsContent value="chat">
        {userAuthenticated && <SpotifyConnect />}
        
        <ChatInterface
          onSubmitMood={onSubmitMood}
          onConfirmPlaylist={onConfirmPlaylist}
          onRejectPlaylist={onRejectPlaylist}
          songs={songs}
          addedSongs={addedSongs}
          notFoundSongs={notFoundSongs}
          mood={mood}
          genre={genre}
          playlistUrl={playlistUrl}
          step={step}
          isLoading={isLoading}
          onReset={onReset}
        />
      </TabsContent>
      
      <TabsContent value="history">
        {userAuthenticated === false && (
          <div className="text-center p-8 mb-4">
            <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">Anmelden für Playlist-Historie</h3>
            <p className="text-sm text-gray-400 mt-2 mb-4">
              Bitte verbinde dein Spotify-Konto, um deine gespeicherten Playlists zu sehen und mehr Features zu nutzen.
            </p>
            <Button className="bg-green-500 hover:bg-green-600/80" onClick={() => redirectToSpotifyLogin()}>
              <Music className="h-4 w-4 mr-2" />
              Mit Spotify verbinden
            </Button>
          </div>
        )}
        <PlaylistHistory 
          playlists={playlistHistory} 
          onOpenPlaylist={onOpenPlaylist} 
        />
      </TabsContent>
    </>
  );
};

export default MainContent;
