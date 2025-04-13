
import React, { useState } from 'react';
import MoodForm from '@/components/MoodForm';
import SongList, { Song } from '@/components/SongList';
import PlaylistCreated from '@/components/PlaylistCreated';
import { getSongRecommendations, createPlaylist } from '@/services/musicService';
import { useToast } from '@/components/ui/use-toast';

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
      const recommendedSongs = await getSongRecommendations(moodInput, genreInput);
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

  const renderStepContent = () => {
    switch (step) {
      case Step.MoodInput:
        return <MoodForm onSubmit={handleMoodSubmit} />;
      case Step.SongRecommendations:
        return (
          <SongList 
            songs={songs} 
            mood={mood} 
            genre={genre} 
            onConfirm={handleConfirmPlaylist} 
            onReject={handleReset} 
          />
        );
      case Step.PlaylistCreated:
        return <PlaylistCreated playlistUrl={playlistUrl} onReset={handleReset} />;
      default:
        return <MoodForm onSubmit={handleMoodSubmit} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-moodyfy-dark to-black">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -z-10 top-20 -left-32 w-64 h-64 bg-moodyfy-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute -z-10 bottom-20 -right-32 w-64 h-64 bg-moodyfy-pink/20 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {renderStepContent()}
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
            <div className="flex flex-col items-center">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 bg-moodyfy-blue rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-moodyfy-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-moodyfy-pink rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-sm text-gray-300">Finding the perfect beats...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
