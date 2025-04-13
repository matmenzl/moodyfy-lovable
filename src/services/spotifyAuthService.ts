
// This file re-exports all Spotify authentication related functions
// to maintain backward compatibility with existing imports

// Re-export everything from the modularized files
export { 
  SPOTIFY_AUTH_URL,
  SPOTIFY_API_URL,
  SPOTIFY_TOKEN_URL,
  SPOTIFY_CLIENT_ID,
  REDIRECT_URI,
  SCOPES,
  generateRandomString
} from './spotify/constants';

export { 
  getSpotifyToken,
  saveSpotifyToken,
  hasValidSpotifyToken,
  getTokenFromCode,
  refreshSpotifyToken,
  logoutFromSpotify
} from './spotify/tokenService';

export {
  redirectToSpotifyLogin,
  isSpotifyConnected
} from './spotify/authService';

export {
  spotifyApiRequest,
  getSpotifyUserProfile
} from './spotify/apiService';
