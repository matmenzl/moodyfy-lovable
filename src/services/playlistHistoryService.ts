
import { supabase } from '@/integrations/supabase/client';
import { PlaylistHistoryItem } from '@/components/chat/types';
import { Song } from '@/components/SongList';

// Local storage key for playlists
const PLAYLISTS_STORAGE_KEY = 'moodyfy_playlists';

// Helper function to get playlists from local storage
const getLocalPlaylists = (): PlaylistHistoryItem[] => {
  const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper function to save playlists to local storage
const saveLocalPlaylists = (playlists: PlaylistHistoryItem[]): void => {
  localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
};

export const savePlaylist = async (
  name: string, 
  mood: string, 
  genre: string | undefined, 
  songs: Song[], 
  spotifyUrl?: string
): Promise<PlaylistHistoryItem> => {
  try {
    // Create a new playlist item
    const newPlaylist: PlaylistHistoryItem = {
      id: Date.now().toString(), // Simple ID generation using timestamp
      name,
      mood,
      genre,
      songs,
      createdAt: new Date().toISOString(),
      spotifyUrl
    };
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // User is authenticated, store in Supabase
      console.log('User is authenticated, storing playlist in Supabase');
      
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name,
          mood,
          description: `Playlist based on ${mood}${genre ? ` with ${genre} music` : ''}`,
          genres: genre ? [genre] : [],
          spotify_url: spotifyUrl,
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error storing playlist in Supabase:', error);
        // Fall back to local storage
        const currentPlaylists = getLocalPlaylists();
        currentPlaylists.unshift(newPlaylist); // Add to beginning of array
        saveLocalPlaylists(currentPlaylists);
      } else {
        console.log('Playlist stored in Supabase:', data);
        // Update the ID to match the Supabase ID
        newPlaylist.id = data.id;
      }
    } else {
      // In development/demo mode or when not authenticated, save to local storage
      console.log('User is not authenticated, storing playlist in local storage');
      const currentPlaylists = getLocalPlaylists();
      currentPlaylists.unshift(newPlaylist); // Add to beginning of array
      saveLocalPlaylists(currentPlaylists);
    }
    
    console.log('Playlist saved:', newPlaylist);
    return newPlaylist;
  } catch (error) {
    console.error('Fehler beim Speichern der Playlist:', error);
    throw error;
  }
};

export const getPlaylistHistory = async (): Promise<PlaylistHistoryItem[]> => {
  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // User is authenticated, fetch from Supabase
      console.log('User is authenticated, fetching playlists from Supabase');
      
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching playlists from Supabase:', error);
        // Fall back to local storage
        return getLocalPlaylists();
      }
      
      // Convert Supabase playlists to PlaylistHistoryItem format
      const playlists: PlaylistHistoryItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        mood: item.mood || '',
        genre: item.genres?.length ? item.genres[0] : undefined,
        songs: [], // We don't store songs in Supabase yet, this would require a separate table
        createdAt: item.created_at,
        spotifyUrl: item.spotify_url
      }));
      
      return playlists;
    } else {
      // In development/demo mode or when not authenticated, retrieve from local storage
      console.log('User is not authenticated, fetching playlists from local storage');
      return getLocalPlaylists();
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Playlist-Historie:', error);
    return [];
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
};
