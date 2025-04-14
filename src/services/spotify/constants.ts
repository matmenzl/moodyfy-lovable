
// Spotify API Endpoints and Configuration
export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// These values should be in Productionsumgebungen über Umgebungsvariablen bereitgestellt werden
export const SPOTIFY_CLIENT_ID = '28fc9dbfac7742a8bbc1de49306da7a6';
export const SPOTIFY_CLIENT_SECRET = ''; // Dieses Feld muss mit dem Client Secret aus dem Spotify Dashboard gefüllt werden

// Determine the correct redirect URI based on the environment
// This dynamically sets the redirect URI based on the current URL
// It works for both local development and deployed environments
export const REDIRECT_URI = `${window.location.origin}/spotify-callback`;

export const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email'
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
