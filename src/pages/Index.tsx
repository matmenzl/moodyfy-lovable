import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createPlaylist, isSpotifyConnected } from '@/services/musicService';
import { getAISongRecommendations } from '@/services/aiService';
import { savePlaylist, getPlaylistHistory, isAuthenticated } from '@/services/playlistHistoryService';
import ChatInterface from '@/components/ChatInterface';
import PlaylistHistory from '@/components/PlaylistHistory';
import SpotifyConnect from '@/components/SpotifyConnect';
import { Song } from '@/components/SongList';
import { PlaylistHistoryItem } from '@/components/chat/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, History, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';

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
  const [addedSongs, setAddedSongs] = useState<Song[]>([]);
  const [notFoundSongs, setNotFoundSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [playlistHistory, setPlaylistHistory] = useState<PlaylistHistoryItem[]>([]);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSpotifyConnected(isSpotifyConnected());
    
    // Set up authentication listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserAuthenticated(!!session);
      
      // Refresh playlist history when auth state changes
      if (session) {
        fetchPlaylistHistory();
      }
    });
    
    // Initial auth check
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setUserAuthenticated(authenticated);
    };
    checkAuth();
    
    const checkSpotifyStatus = () => {
      setSpotifyConnected(isSpotifyConnected());
    };
    
    window.addEventListener('focus', checkSpotifyStatus);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', checkSpotifyStatus);
    };
  }, []);

  useEffect(() => {
    if (userAuthenticated !== null) {
      fetchPlaylistHistory();
    }
  }, [userAuthenticated]);

  const fetchPlaylistHistory = async () => {
    try {
      const history = await getPlaylistHistory();
      setPlaylistHistory(history);
    } catch (error) {
      console.error('Fehler beim Laden der Playlist-Historie:', error);
    }
  };

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
      const { url, addedSongs: added, notFoundSongs: notFound } = await createPlaylist(songs, mood, genre);
      setPlaylistUrl(url);
      setAddedSongs(added);
      setNotFoundSongs(notFound);
      
      const playlistName = `${mood}${genre ? ` ${genre}` : ''} Playlist`;
      const savedPlaylist = await savePlaylist(playlistName, mood, genre, songs, url);
      
      setPlaylistHistory(prev => [savedPlaylist, ...prev]);
      
      setIsLoading(false);
      setStep(Step.PlaylistCreated);
      
      const notFoundCount = notFound.length;
      
      toast({
        title: spotifyConnected ? "Spotify-Playlist erstellt" : "Playlist erstellt",
        description: spotifyConnected 
          ? notFoundCount > 0 
            ? `Playlist erstellt mit ${added.length} von ${songs.length} Songs. ${notFoundCount} Song(s) konnten nicht gefunden werden.` 
            : "Alle Songs wurden erfolgreich zur Playlist hinzugefügt."
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
    setAddedSongs([]);
    setNotFoundSongs([]);
  };

  const handleOpenPlaylist = (playlist: PlaylistHistoryItem) => {
    setMood(playlist.mood);
    setGenre(playlist.genre || '');
    setSongs(playlist.songs);
    setPlaylistUrl(playlist.spotifyUrl || '');
    setAddedSongs(playlist.songs); // Assuming all songs were added in history item
    setNotFoundSongs([]);
    
    setStep(playlist.songs.length > 0 ? Step.PlaylistCreated : Step.MoodInput);
    setActiveTab("chat");
    
    toast({
      title: "Playlist geladen",
      description: `${playlist.name} wurde geladen.`,
    });
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich abgemeldet."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-moodyfy-dark to-black">
      <div className="fixed -z-10 top-20 left-10 w-64 h-64 bg-moodyfy-blue/20 rounded-full blur-3xl"></div>
      <div className="fixed -z-10 bottom-20 right-10 w-64 h-64 bg-moodyfy-pink/20 rounded-full blur-3xl"></div>
      
      <div className="container max-w-4xl px-4 mx-auto pt-8">
        {/* Auth Button */}
        <div className="flex justify-end mb-4">
          {userAuthenticated ? (
            <Button variant="outline" className="bg-transparent border-white/20" onClick={handleLogout}>
              Abmelden
            </Button>
          ) : (
            <Button 
              className="bg-moodyfy-blue hover:bg-moodyfy-blue/80" 
              onClick={handleLogin}
            >
              Anmelden
            </Button>
          )}
        </div>
        
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
            {userAuthenticated && <SpotifyConnect />}
            
            <ChatInterface
              onSubmitMood={handleMoodSubmit}
              onConfirmPlaylist={handleConfirmPlaylist}
              onRejectPlaylist={handleReset}
              songs={songs}
              addedSongs={addedSongs}
              notFoundSongs={notFoundSongs}
              mood={mood}
              genre={genre}
              playlistUrl={playlistUrl}
              step={step === Step.MoodInput ? 'MoodInput' : step === Step.SongRecommendations ? 'SongRecommendations' : 'PlaylistCreated'}
              isLoading={isLoading}
              onReset={handleReset}
            />
          </TabsContent>
          
          <TabsContent value="history">
            {userAuthenticated === false && (
              <div className="text-center p-8 mb-4">
                <LogIn className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">Anmelden für Playlist-Historie</h3>
                <p className="text-sm text-gray-400 mt-2 mb-4">
                  Bitte melde dich an, um deine gespeicherten Playlists zu sehen und mehr Features zu nutzen.
                </p>
                <Button className="bg-moodyfy-blue hover:bg-moodyfy-blue/80" onClick={handleLogin}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Anmelden
                </Button>
              </div>
            )}
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
