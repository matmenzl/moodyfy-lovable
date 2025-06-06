import { Song } from '@/components/SongList';
import { supabase } from '@/integrations/supabase/client';

// This service handles the communication with the OpenAI API via our Supabase Edge Function
export const getAISongRecommendations = async (
  mood: string,
  genre: string,
  excludeSongs?: Song[],
  includeHistory: boolean = false,
  historyTracks?: Song[]
): Promise<Song[]> => {
  try {
    console.log('Requesting AI song recommendations for mood:', mood, 'and genre:', genre);
    if (excludeSongs && excludeSongs.length > 0) {
      console.log(`Excluding ${excludeSongs.length} songs from recommendations`);
    }
    if (includeHistory && historyTracks && historyTracks.length > 0) {
      console.log(`Including ${historyTracks.length} songs from listening history as context`);
    }
    
    // Call our Supabase Edge Function that uses OpenAI
    const { data, error } = await supabase.functions.invoke('generate-recommendations', {
      body: { 
        mood, 
        genre, 
        excludeSongs,
        includeHistory,
        historyTracks
      },
    });
    
    if (error) {
      console.error('Error calling generate-recommendations function:', error);
      throw new Error('Failed to get AI song recommendations');
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response format from generate-recommendations function:', data);
      throw new Error('Invalid response from AI service');
    }
    
    return data as Song[];
  } catch (error) {
    console.error('Error getting AI song recommendations:', error);
    
    // Fallback to the mock service in case of errors
    console.log('Falling back to mock recommendations');
    return import('@/services/musicService').then(({ getSongRecommendations }) => {
      return getSongRecommendations(mood, genre);
    });
  }
};

// Function to get genre suggestions based on listening history
export const getGenreSuggestions = async (
  historyTracks: Song[],
  mood?: string
): Promise<string[]> => {
  try {
    console.log(`Requesting genre suggestions based on ${historyTracks.length} tracks from listening history`);
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('suggest-genres', {
      body: { 
        historyTracks,
        mood 
      },
    });
    
    if (error) {
      console.error('Error calling suggest-genres function:', error);
      throw new Error('Failed to get genre suggestions');
    }

    if (!data || !Array.isArray(data)) {
      console.error('Invalid response format from suggest-genres function:', data);
      throw new Error('Invalid response from AI service');
    }
    
    console.log('Received genre suggestions:', data);
    return data as string[];
  } catch (error) {
    console.error('Error getting genre suggestions:', error);
    // Fallback to some generic genres
    return ['pop', 'rock', 'electronic', 'hip hop', 'jazz'];
  }
};
