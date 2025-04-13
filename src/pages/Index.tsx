
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createPlaylist } from '@/services/musicService';
import { getAISongRecommendations } from '@/services/aiService';
import ChatInterface from '@/components/ChatInterface';
import { Song } from '@/components/SongList';

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
  const { toast } = useToast();

  const handleMoodSubmit = async (moodInput: string, genreInput: string) => {
    setMood(moodInput);
    setGenre(genreInput);
    setIsLoading(true);
    
    try {
      // Using the AI service instead of the direct music service
      const recommendedSongs = await getAISongRecommendations(moodInput, genreInput);
      setSongs(recommendedSongs);
      setIsLoading(false);
      setStep(Step.SongRecommendations);
    } catch (error) {
      console.error('Error getting song recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get song recommendations. Please try again.",
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
      setIsLoading(false);
      setStep(Step.PlaylistCreated);
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: "Failed to create playlist. Please try again.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-moodyfy-dark to-black">
      {/* Decorative elements */}
      <div className="fixed -z-10 top-20 left-10 w-64 h-64 bg-moodyfy-blue/20 rounded-full blur-3xl"></div>
      <div className="fixed -z-10 bottom-20 right-10 w-64 h-64 bg-moodyfy-pink/20 rounded-full blur-3xl"></div>
      
      {/* Chat Interface */}
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
    </div>
  );
};

export default Index;
