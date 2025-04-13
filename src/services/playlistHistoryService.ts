
import { supabase } from '@/integrations/supabase/client';
import { PlaylistHistoryItem } from '@/components/chat/types';
import { Song } from '@/components/SongList';

export const savePlaylist = async (
  name: string, 
  mood: string, 
  genre: string | undefined, 
  songs: Song[], 
  spotifyUrl?: string
): Promise<PlaylistHistoryItem> => {
  try {
    const playlistData = {
      name,
      mood,
      genres: genre ? [genre] : [],
      spotify_url: spotifyUrl,
      description: `Eine Playlist für die Stimmung "${mood}"${genre ? ` mit ${genre} Musik` : ''}.`
    };
    
    // In Supabase speichern
    const { data, error } = await supabase
      .from('playlists')
      .insert(playlistData)
      .select()
      .single();
      
    if (error) throw error;
    
    // Playlist-Objekt zurückgeben
    return {
      id: data.id,
      name: data.name,
      mood: data.mood || mood,
      genre: genre,
      songs: songs,
      createdAt: data.created_at,
      spotifyUrl: data.spotify_url
    };
  } catch (error) {
    console.error('Fehler beim Speichern der Playlist:', error);
    throw error;
  }
};

export const getPlaylistHistory = async (): Promise<PlaylistHistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Playlist-Historie mit den notwendigen Informationen zurückgeben
    return data.map(item => ({
      id: item.id,
      name: item.name,
      mood: item.mood || '',
      genre: item.genres && item.genres.length > 0 ? item.genres[0] : undefined,
      songs: [], // Wir laden die Songs nicht im initialen Abruf
      createdAt: item.created_at,
      spotifyUrl: item.spotify_url
    }));
  } catch (error) {
    console.error('Fehler beim Abrufen der Playlist-Historie:', error);
    return [];
  }
};
