
import { Song } from '@/components/SongList';
import { spotifyApiRequest } from './spotify/apiService';
import { useToast } from '@/components/ui/use-toast';

// Suche nach Songs in Spotify mit verbesserter Fehlerbehandlung und Logging
export const searchSpotifyTracks = async (
  songTitle: string,
  artist: string
): Promise<string | null> => {
  try {
    console.log(`Searching Spotify for: "${songTitle}" by ${artist}`);
    const query = encodeURIComponent(`track:${songTitle} artist:${artist}`);
    const searchResults = await spotifyApiRequest(`/search?q=${query}&type=track&limit=1`);
    
    if (searchResults.tracks.items.length > 0) {
      console.log(`✅ Found match for "${songTitle}" by ${artist}: ${searchResults.tracks.items[0].uri}`);
      return searchResults.tracks.items[0].uri;
    }
    
    // If no exact match found, try a more general search
    console.log(`❌ No exact match found for "${songTitle}" by ${artist}, trying broader search...`);
    const broadQuery = encodeURIComponent(`${songTitle} ${artist}`);
    const broadResults = await spotifyApiRequest(`/search?q=${broadQuery}&type=track&limit=1`);
    
    if (broadResults.tracks.items.length > 0) {
      console.log(`✅ Found similar match for "${songTitle}" by ${artist}: ${broadResults.tracks.items[0].name} by ${broadResults.tracks.items[0].artists[0].name}`);
      return broadResults.tracks.items[0].uri;
    }
    
    console.log(`❌ No match found at all for "${songTitle}" by ${artist}`);
    return null;
  } catch (error) {
    console.error(`Fehler bei der Suche nach "${songTitle}" von ${artist}:`, error);
    return null;
  }
};

// Erstelle eine neue Playlist auf Spotify mit verbessertem Tracking
export const createSpotifyPlaylist = async (
  name: string,
  description: string,
  songs: Song[]
): Promise<{ playlistId: string, playlistUrl: string, addedSongs: Song[], notFoundSongs: Song[] }> => {
  try {
    // Benutzerprofil abrufen
    const userProfile = await spotifyApiRequest('/me');
    
    // Playlist erstellen
    const playlistData = await spotifyApiRequest(`/users/${userProfile.id}/playlists`, 'POST', {
      name,
      description,
      public: true
    });
    
    console.log(`Created Spotify playlist: ${name}`);
    
    // Songs suchen und zu URIs konvertieren
    const trackUris: string[] = [];
    const addedSongs: Song[] = [];
    const notFoundSongs: Song[] = [];
    
    for (const song of songs) {
      const uri = await searchSpotifyTracks(song.title, song.artist);
      if (uri) {
        trackUris.push(uri);
        addedSongs.push(song);
      } else {
        notFoundSongs.push(song);
        console.warn(`Could not find song on Spotify: "${song.title}" by ${song.artist}`);
      }
    }
    
    // Songs zur Playlist hinzufügen (in Gruppen von 100, Spotify-Limit)
    if (trackUris.length > 0) {
      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        await spotifyApiRequest(`/playlists/${playlistData.id}/tracks`, 'POST', {
          uris: batch
        });
      }
      
      console.log(`Added ${trackUris.length}/${songs.length} songs to the playlist`);
    } else {
      console.error('No songs were found on Spotify to add to the playlist');
    }
    
    return {
      playlistId: playlistData.id,
      playlistUrl: playlistData.external_urls.spotify,
      addedSongs,
      notFoundSongs
    };
  } catch (error) {
    console.error('Fehler beim Erstellen der Spotify-Playlist:', error);
    throw error;
  }
};
