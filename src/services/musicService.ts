import { Song } from '@/components/SongList';
import { createSpotifyPlaylist } from './spotifyPlaylistService';
import { hasValidSpotifyToken } from './spotify/tokenService';
import { redirectToSpotifyLogin } from './spotify/authService';

// This would be replaced with an actual API call in a production app
export const getSongRecommendations = (mood: string, genre: string): Promise<Song[]> => {
  return new Promise((resolve) => {
    // Simulating API response delay
    setTimeout(() => {
      // Mock data based on common moods
      const moodLower = mood.toLowerCase();
      
      let songList: Song[] = [];
      
      if (moodLower.includes('happy') || moodLower.includes('energetic') || moodLower.includes('joy')) {
        songList = [
          { title: "Good as Hell", artist: "Lizzo" },
          { title: "Walking on Sunshine", artist: "Katrina & The Waves" },
          { title: "Can't Stop the Feeling!", artist: "Justin Timberlake" },
          { title: "Happy", artist: "Pharrell Williams" },
          { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
          { title: "Don't Stop Me Now", artist: "Queen" },
          { title: "Juice", artist: "Lizzo" },
          { title: "Levitating", artist: "Dua Lipa" },
          { title: "Good Feeling", artist: "Flo Rida" },
          { title: "I Gotta Feeling", artist: "Black Eyed Peas" }
        ];
      } else if (moodLower.includes('sad') || moodLower.includes('melancholic') || moodLower.includes('blue')) {
        songList = [
          { title: "Someone Like You", artist: "Adele" },
          { title: "Fix You", artist: "Coldplay" },
          { title: "Skinny Love", artist: "Bon Iver" },
          { title: "Hurt", artist: "Johnny Cash" },
          { title: "All Too Well", artist: "Taylor Swift" },
          { title: "Say Something", artist: "A Great Big World & Christina Aguilera" },
          { title: "Tears In Heaven", artist: "Eric Clapton" },
          { title: "Nothing Compares 2 U", artist: "Sinéad O'Connor" },
          { title: "Everybody Hurts", artist: "R.E.M." },
          { title: "Hallelujah", artist: "Jeff Buckley" }
        ];
      } else if (moodLower.includes('calm') || moodLower.includes('relax') || moodLower.includes('chill')) {
        songList = [
          { title: "Weightless", artist: "Marconi Union" },
          { title: "Claire de Lune", artist: "Claude Debussy" },
          { title: "Gymnopédie No.1", artist: "Erik Satie" },
          { title: "Watermark", artist: "Enya" },
          { title: "Intro", artist: "The xx" },
          { title: "Ocean Eyes", artist: "Billie Eilish" },
          { title: "Flightless Bird, American Mouth", artist: "Iron & Wine" },
          { title: "Holocene", artist: "Bon Iver" },
          { title: "Saturn", artist: "Sleeping At Last" },
          { title: "Breathe", artist: "Télépopmusik" }
        ];
      } else if (moodLower.includes('focus') || moodLower.includes('productive') || moodLower.includes('work')) {
        songList = [
          { title: "Experience", artist: "Ludovico Einaudi" },
          { title: "Time", artist: "Hans Zimmer" },
          { title: "Divenire", artist: "Ludovico Einaudi" },
          { title: "Arrival of the Birds", artist: "The Cinematic Orchestra" },
          { title: "On The Nature Of Daylight", artist: "Max Richter" },
          { title: "Nuvole Bianche", artist: "Ludovico Einaudi" },
          { title: "Comptine d'un autre été", artist: "Yann Tiersen" },
          { title: "Your Hand in Mine", artist: "Explosions in the Sky" },
          { title: "Strobe", artist: "deadmau5" },
          { title: "I Giorni", artist: "Ludovico Einaudi" }
        ];
      } else {
        // Default song list
        songList = [
          { title: "Blinding Lights", artist: "The Weeknd" },
          { title: "Dreams", artist: "Fleetwood Mac" },
          { title: "Heat Waves", artist: "Glass Animals" },
          { title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee" },
          { title: "Dance Monkey", artist: "Tones and I" },
          { title: "Bohemian Rhapsody", artist: "Queen" },
          { title: "Shape of You", artist: "Ed Sheeran" },
          { title: "Take on Me", artist: "a-ha" },
          { title: "Bad Guy", artist: "Billie Eilish" },
          { title: "Africa", artist: "Toto" }
        ];
      }

      // If genre is specified, we would filter or adjust the list
      // In a real app, this would be handled by the API

      resolve(songList);
    }, 1500); // Simulating response time
  });
};

// Playlist erstellen (mit Spotify-Integration wenn verfügbar)
export const createPlaylist = async (songs: Song[], mood: string, genre: string): Promise<string> => {
  try {
    // Prüfen, ob Spotify-Authentifizierung vorhanden ist
    if (hasValidSpotifyToken()) {
      // Spotify-Playlist erstellen
      const playlistName = `${mood}${genre ? ` ${genre}` : ''} Playlist`;
      const description = `Eine Playlist für die Stimmung "${mood}"${genre ? ` mit ${genre} Musik` : ''}.`;
      
      const { playlistUrl } = await createSpotifyPlaylist(playlistName, description, songs);
      return playlistUrl;
    } else {
      // Wenn kein Spotify-Token vorhanden ist, geben wir eine Mockup-URL zurück
      console.log('Kein Spotify-Token vorhanden. Verwende Mockup-URL.');
      return new Promise((resolve) => {
        // Simulating API response delay
        setTimeout(() => {
          resolve("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M");
        }, 2000); // Simulating response time
      });
    }
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

// Prüfen, ob Spotify verbunden ist
export const isSpotifyConnected = (): boolean => {
  return hasValidSpotifyToken();
};

// Spotify-Verbindung initiieren
export const connectToSpotify = (): void => {
  redirectToSpotifyLogin();
};
