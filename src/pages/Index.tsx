import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createPlaylist, isSpotifyConnected } from '@/services/musicService';
import { getAISongRecommendations } from '@/services/aiService';
import { savePlaylist, getPlaylistHistory } from '@/services/playlistHistoryService';
import ChatInterface from '@/components/ChatInterface';
import PlaylistHistory from '@/components/PlaylistHistory';
import SpotifyConnect from '@/components/SpotifyConnect';
import { Song } from '@/components/SongList';
import { PlaylistHistoryItem } from '@/components/chat/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, History } from "lucide-react";

enum Step {
  MoodInput,
  SongRecommendations,
  PlaylistCreated
}

const Index = () => {
  const [step, setStep] = useState<Step>(Step.MoodInput);
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [playlistHistory, setPlaylistHistory] = useState<PlaylistHistoryItem[]>([]);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSpotifyConnected(isSpotifyConnected());
    
    const checkSpotifyStatus = () => {
      setSpotifyConnected(isSpotifyConnected());
    };
    
    window.addEventListener('focus', checkSpotifyStatus);
    return () => window.removeEventListener('focus', checkSpotifyStatus);
  }, []);

  useEffect(() => {
    const fetchPlaylistHistory = async () => {
      try {
        const history = await getPlaylistHistory();
        setPlaylistHistory(history);
      } catch (error) {
        console.error('Fehler beim Laden der Playlist-Historie:', error);
      }
    };

    fetchPlaylistHistory();
  }, []);

  const handleMoodSubmit = async (moodInput: string, genreInput: string) => {
    setMood(moodInput);
    setGenre(genreInput);
    setIsLoading(true);
    
    try {
      const recommendedSongs = await getAISongRecommendations(moodInput, genreInput);
      setSongs(recommendedSongs);
      setIsLoading(false);
      setStep(Step.SongRecommendations);
    } catch (error) {
      console.error('Error getting song recommendations:', error);
      toast({
        title: "Fehler",
        description: "Konnte keine Songempfehlungen abrufen. Bitte versuche es erneut.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleConfirmPlaylist = async () => {
    setIsLoading(true);
    
    try {
      const url = await createPlaylist(songs, mood, genre);
      setPlaylistUrl(url);
      
      const playlistName = `${mood}${genre ? ` ${genre}` : ''} Playlist`;
      const savedPlaylist = await savePlaylist(playlistName, mood, genre, songs, url);
      
      setPlaylistHistory(prev => [savedPlaylist, ...prev]);
      
      setIsLoading(false);
      setStep(Step.PlaylistCreated);
      
      toast({
        title: spotifyConnected ? "Spotify-Playlist erstellt" : "Playlist erstellt",
        description: spotifyConnected 
          ? "Deine Playlist wurde erfolgreich in deiner Spotify-Bibliothek erstellt." 
          : "Deine Playlist wurde erfolgreich erstellt und gespeichert.",
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Fehler",
        description: "Konnte keine Playlist erstellen. Bitte versuche es erneut.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(Step.MoodInput);
    setMood('');
    setGenre('');
    setSongs([]);
    setPlaylistUrl('');
  };

  const handleOpenPlaylist = (playlist: PlaylistHistoryItem) => {
    setMood(playlist.mood);
    setGenre(playlist.genre || '');
    setSongs(playlist.songs);
    setPlaylistUrl(playlist.spotifyUrl || '');
    
    setStep(playlist.songs.length > 0 ? Step.PlaylistCreated : Step.MoodInput);
    setActiveTab("chat");
    
    toast({
      title: "Playlist geladen",
      description: `${playlist.name} wurde geladen.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-moodyfy-dark to-black">
      <div className="fixed -z-10 top-20 left-10 w-64 h-64 bg-moodyfy-blue/20 rounded-full blur-3xl"></div>
      <div className="fixed -z-10 bottom-20 right-10 w-64 h-64 bg-moodyfy-pink/20 rounded-full blur-3xl"></div>
      
      <div className="container max-w-4xl px-4 mx-auto pt-8">
        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <Music className="h-4 w-4" />
              <span>Neue Playlist</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Playlist-Historie</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <SpotifyConnect />
            
            <ChatInterface
              onSubmitMood={handleMoodSubmit}
              onConfirmPlaylist={handleConfirmPlaylist}
              onRejectPlaylist={handleReset}
              songs={songs}
              mood={mood}
              genre={genre}
              playlistUrl={playlistUrl}
              step={step === Step.MoodInput ? 'MoodInput' : step === Step.SongRecommendations ? 'SongRecommendations' : 'PlaylistCreated'}
              isLoading={isLoading}
              onReset={handleReset}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <PlaylistHistory 
              playlists={playlistHistory} 
              onOpenPlaylist={handleOpenPlaylist} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
