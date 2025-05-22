
// Spotify API Endpoints and Configuration
export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// These values should be provided in production environments via environment variables
export const SPOTIFY_CLIENT_ID = '28fc9dbfac7742a8bbc1de49306da7a6';
// Client Secret is now stored securely in Supabase Edge Function secrets

// Determine the correct redirect URI based on the environment
export const REDIRECT_URI = `${window.location.origin}/spotify-callback`;

export const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email',
  'user-read-recently-played' // Added this scope for recently played tracks
].join(' ');

// State-Parameter für die OAuth-Sicherheit generieren
export const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
