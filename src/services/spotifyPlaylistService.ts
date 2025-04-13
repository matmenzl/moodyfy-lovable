
import { Song } from '@/components/SongList';
import { spotifyApiRequest } from './spotify/apiService';

// Suche nach Songs in Spotify
export const searchSpotifyTracks = async (
  songTitle: string,
  artist: string
): Promise<string | null> => {
  try {
    const query = encodeURIComponent(`track:${songTitle} artist:${artist}`);
    const searchResults = await spotifyApiRequest(`/search?q=${query}&type=track&limit=1`);
    
    if (searchResults.tracks.items.length > 0) {
      return searchResults.tracks.items[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error(`Fehler bei der Suche nach "${songTitle}" von ${artist}:`, error);
    return null;
  }
};

// Erstelle eine neue Playlist auf Spotify
export const createSpotifyPlaylist = async (
  name: string,
  description: string,
  songs: Song[]
): Promise<{ playlistId: string, playlistUrl: string }> => {
  try {
    // Benutzerprofil abrufen
    const userProfile = await spotifyApiRequest('/me');
    
    // Playlist erstellen
    const playlistData = await spotifyApiRequest(`/users/${userProfile.id}/playlists`, 'POST', {
      name,
      description,
      public: true
    });
    
    // Songs suchen und zu URIs konvertieren
    const trackUris: string[] = [];
    for (const song of songs) {
      const uri = await searchSpotifyTracks(song.title, song.artist);
      if (uri) trackUris.push(uri);
    }
    
    // Songs zur Playlist hinzufügen (in Gruppen von 100, Spotify-Limit)
    if (trackUris.length > 0) {
      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        await spotifyApiRequest(`/playlists/${playlistData.id}/tracks`, 'POST', {
          uris: batch
        });
      }
    }
    
    return {
      playlistId: playlistData.id,
      playlistUrl: playlistData.external_urls.spotify
    };
  } catch (error) {
    console.error('Fehler beim Erstellen der Spotify-Playlist:', error);
    throw error;
  }
};

