
import { Song } from '@/components/SongList';
import { supabase } from '@/integrations/supabase/client';

// This service handles the communication with the OpenAI API via our Supabase Edge Function
export const getAISongRecommendations = async (
  mood: string,
  genre: string
): Promise<Song[]> => {
  try {
    console.log('Requesting AI song recommendations for mood:', mood, 'and genre:', genre);
    
    // Call our Supabase Edge Function that uses OpenAI
    const { data, error } = await supabase.functions.invoke('generate-recommendations', {
      body: { mood, genre },
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

// The original commented code can be removed as we've now implemented the real OpenAI integration
