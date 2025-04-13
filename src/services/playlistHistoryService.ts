
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
    
    // In development/demo mode, save to local storage
    const currentPlaylists = getLocalPlaylists();
    currentPlaylists.unshift(newPlaylist); // Add to beginning of array
    saveLocalPlaylists(currentPlaylists);
    
    console.log('Playlist saved to local storage:', newPlaylist);
    return newPlaylist;
  } catch (error) {
    console.error('Fehler beim Speichern der Playlist:', error);
    throw error;
  }
};

export const getPlaylistHistory = async (): Promise<PlaylistHistoryItem[]> => {
  try {
    // In development/demo mode, retrieve from local storage
    const playlists = getLocalPlaylists();
    return playlists;
  } catch (error) {
    console.error('Fehler beim Abrufen der Playlist-Historie:', error);
    return [];
  }
};
