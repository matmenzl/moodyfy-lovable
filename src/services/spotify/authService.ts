
import { SPOTIFY_AUTH_URL, REDIRECT_URI, SPOTIFY_CLIENT_ID, SCOPES, generateRandomString } from './constants';
import { hasValidSpotifyToken } from './tokenService';

// Benutzer zur Spotify-Anmeldung umleiten
export const redirectToSpotifyLogin = () => {
  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);
  
  console.log("Redirecting to Spotify with redirect URI:", REDIRECT_URI);
  
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
    show_dialog: 'true' // Force showing the Spotify authorization dialog
  });
  
  window.location.href = `${SPOTIFY_AUTH_URL}?${queryParams.toString()}`;
};

// Checks if the user is connected to Spotify
export const isSpotifyConnected = (): boolean => {
  return hasValidSpotifyToken();
};
