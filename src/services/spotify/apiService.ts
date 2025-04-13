
import { SPOTIFY_API_URL } from './constants';
import { hasValidSpotifyToken, getSpotifyToken } from './tokenService';
import { redirectToSpotifyLogin } from './authService';

// API-Anfragen mit Token-Aktualisierung
export const spotifyApiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<any> => {
  if (!hasValidSpotifyToken()) {
    throw new Error('Kein gültiges Spotify-Token vorhanden');
  }
  
  const { accessToken } = getSpotifyToken();
  
  const response = await fetch(`${SPOTIFY_API_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (response.status === 401) {
    // Token ist abgelaufen, Benutzer muss sich erneut anmelden
    redirectToSpotifyLogin();
    throw new Error('Spotify-Token ist abgelaufen. Bitte melde dich erneut an.');
  }
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Spotify API-Fehler: ${JSON.stringify(errorData)}`);
  }
  
  return response.json();
};

// Benutzerprofil abrufen
export const getSpotifyUserProfile = async () => {
  return spotifyApiRequest('/me');
};
