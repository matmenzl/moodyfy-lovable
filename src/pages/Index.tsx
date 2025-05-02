
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createPlaylist, isSpotifyConnected } from '@/services/musicService';
import { getAISongRecommendations, getGenreSuggestions } from '@/services/aiService';
import { savePlaylist, getPlaylistHistory, isAuthenticated } from '@/services/playlistHistoryService';
import { getRecentlyPlayedTracks } from '@/services/spotifyPlaylistService';
import { Song } from '@/components/SongList';
import { PlaylistHistoryItem } from '@/components/chat/types';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, History } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import AuthButton from '@/components/AuthButton';
import MainContent from '@/components/MainContent';

type Step = 'MoodInput' | 'GenreSelection' | 'SongRecommendations' | 'PlaylistCreated';

const Index = () => {
  const [step, setStep] = useState<Step>('MoodInput');
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
  const [suggestedGenres, setSuggestedGenres] = useState<string[]>([]);
  const [historyTracksPreview, setHistoryTracksPreview] = useState<Song[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setSpotifyConnected(isSpotifyConnected());
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserAuthenticated(!!session);
      
      if (session) {
        fetchPlaylistHistory();
      }
    });
    
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

  const handleMoodSubmit = async (moodInput: string, genreInput: string, useHistory: boolean = false, excludePrevSongs: Song[] = []) => {
    setMood(moodInput);
    setIsLoading(true);
    
    try {
      // If user wants to use history and is connected to Spotify, 
      // get listening history and show genre selection step
      if (useHistory && isSpotifyConnected() && !genreInput) {
        try {
          const historySongs = await getRecentlyPlayedTracks(15);
          console.log(`Retrieved ${historySongs.length} tracks from listening history for genre suggestions`);
          
          if (historySongs.length > 0) {
            // Store a preview of history tracks for display
            setHistoryTracksPreview(historySongs.slice(0, 10));
            
            // Get genre suggestions from OpenAI based on listening history
            const genres = await getGenreSuggestions(historySongs, moodInput);
            setSuggestedGenres(genres);
            setIsLoading(false);
            setStep('GenreSelection');
            return;
          }
        } catch (error) {
          console.error('Fehler beim Laden des Hörverlaufs für Genre-Vorschläge:', error);
        }
      }
      
      // If we already have a genre or there was an issue getting history,
      // continue with song recommendations
      handleGenreSelect(moodInput, genreInput, useHistory, excludePrevSongs);
    } catch (error) {
      console.error('Error in mood submission:', error);
      toast({
        title: "Fehler",
        description: "Konnte keine Genre-Vorschläge abrufen. Bitte versuche es erneut.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleGenreSelect = async (moodInput: string, genreInput: string, useHistory: boolean = false, excludePrevSongs: Song[] = []) => {
    setGenre(genreInput);
    setIsLoading(true);
    
    try {
      let historySongs: Song[] = [];
      
      // Hole Hörverlauf für OpenAI, falls aktiviert
      if (useHistory && isSpotifyConnected()) {
        try {
          historySongs = await getRecentlyPlayedTracks(10);
          console.log(`Retrieved ${historySongs.length} tracks from listening history to inform recommendations`);
        } catch (error) {
          console.error('Fehler beim Laden des Hörverlaufs für OpenAI:', error);
        }
      }
      
      // Übergebe den Hörverlauf an OpenAI für bessere Empfehlungen
      const recommendedSongs = await getAISongRecommendations(
        moodInput, 
        genreInput, 
        excludePrevSongs, 
        useHistory, 
        historySongs
      );
      
      let finalSongs = [...recommendedSongs];
      
      // Füge Hörverlauf-Songs zur Playlist hinzu, wenn gewünscht
      if (useHistory && isSpotifyConnected()) {
        try {
          const historyTracksForPlaylist = await getRecentlyPlayedTracks(5);
          
          if (historyTracksForPlaylist.length > 0) {
            const existingTitles = new Set(recommendedSongs.map(song => `${song.title}|${song.artist}`));
            
            const uniqueHistorySongs = historyTracksForPlaylist.filter(
              song => !existingTitles.has(`${song.title}|${song.artist}`)
            );
            
            finalSongs = [...recommendedSongs, ...uniqueHistorySongs].slice(0, 15);
            
            toast({
              title: "Hörverlauf berücksichtigt",
              description: `${uniqueHistorySongs.length} Songs aus deinem Hörverlauf wurden hinzugefügt.`,
            });
          }
        } catch (error) {
          console.error('Fehler beim Laden des Hörverlaufs:', error);
        }
      }
      
      setSongs(finalSongs);
      setIsLoading(false);
      setStep('SongRecommendations');
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
      setStep('PlaylistCreated');
      
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

  const handleRejectPlaylist = () => {
    if (step === 'GenreSelection') {
      setStep('MoodInput');
      setMood('');
      setSuggestedGenres([]);
      setHistoryTracksPreview([]);
    } else {
      setStep('MoodInput');
      setSongs([]);
    }
    
    setPlaylistUrl('');
    setAddedSongs([]);
    setNotFoundSongs([]);
    setIsLoading(false);
  };

  const handleReset = () => {
    setStep('MoodInput');
    setMood('');
    setGenre('');
    setSongs([]);
    setPlaylistUrl('');
    setAddedSongs([]);
    setNotFoundSongs([]);
    setSuggestedGenres([]);
    setHistoryTracksPreview([]);
  };

  const handleOpenPlaylist = (playlist: PlaylistHistoryItem) => {
    setMood(playlist.mood);
    setGenre(playlist.genre || '');
    setSongs(playlist.songs);
    setPlaylistUrl(playlist.spotifyUrl || '');
    setAddedSongs(playlist.songs);
    setNotFoundSongs([]);
    
    setStep(playlist.songs.length > 0 ? 'PlaylistCreated' : 'MoodInput');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-moodyfy-dark to-black">
      <div className="fixed -z-10 top-20 left-10 w-64 h-64 bg-moodyfy-blue/20 rounded-full blur-3xl"></div>
      <div className="fixed -z-10 bottom-20 right-10 w-64 h-64 bg-moodyfy-pink/20 rounded-full blur-3xl"></div>
      
      <div className="container max-w-4xl px-4 mx-auto pt-8">
        <div className="flex justify-end mb-4">
          <AuthButton isAuthenticated={!!userAuthenticated} />
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
          
          <MainContent
            activeTab={activeTab}
            userAuthenticated={userAuthenticated}
            step={step}
            songs={songs}
            mood={mood}
            genre={genre}
            playlistUrl={playlistUrl}
            addedSongs={addedSongs}
            notFoundSongs={notFoundSongs}
            isLoading={isLoading}
            playlistHistory={playlistHistory}
            onSubmitMood={handleMoodSubmit}
            onGenreSelect={handleGenreSelect}
            onConfirmPlaylist={handleConfirmPlaylist}
            onRejectPlaylist={handleRejectPlaylist}
            onReset={handleReset}
            onOpenPlaylist={handleOpenPlaylist}
            onLogin={handleLogin}
            suggestedGenres={suggestedGenres}
            historyTracksPreview={historyTracksPreview}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
