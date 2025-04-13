
import { supabase } from '@/integrations/supabase/client';

// Spotify API Endpoints
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Diese Werte sollten in Produktionsumgebungen über Umgebungsvariablen bereitgestellt werden
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // Benutzer muss dies später ändern
const REDIRECT_URI = `${window.location.origin}/spotify-callback`;
const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email'
].join(' ');

// State-Parameter für die OAuth-Sicherheit generieren
const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Token aus localStorage lesen
export const getSpotifyToken = (): { accessToken: string | null; refreshToken: string | null; expiresAt: number | null } => {
  try {
    const tokenData = localStorage.getItem('spotify_token_data');
    if (!tokenData) return { accessToken: null, refreshToken: null, expiresAt: null };
    
    const parsedData = JSON.parse(tokenData);
    return {
      accessToken: parsedData.accessToken || null,
      refreshToken: parsedData.refreshToken || null,
      expiresAt: parsedData.expiresAt || null
    };
  } catch (e) {
    console.error('Fehler beim Lesen des Spotify-Tokens:', e);
    return { accessToken: null, refreshToken: null, expiresAt: null };
  }
};

// Token im localStorage speichern
export const saveSpotifyToken = (accessToken: string, refreshToken: string, expiresIn: number) => {
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem('spotify_token_data', JSON.stringify({
    accessToken,
    refreshToken,
    expiresAt
  }));
};

// Überprüfen, ob ein gültiges Token vorhanden ist
export const hasValidSpotifyToken = (): boolean => {
  const { accessToken, expiresAt } = getSpotifyToken();
  return !!accessToken && !!expiresAt && Date.now() < expiresAt;
};

// Benutzer zur Spotify-Anmeldung umleiten
export const redirectToSpotifyLogin = () => {
  const state = generateRandomString(16);
  localStorage.setItem('spotify_auth_state', state);
  
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state
  });
  
  window.location.href = `${SPOTIFY_AUTH_URL}?${queryParams.toString()}`;
};

// Token vom Callback-Code abrufen
export const getTokenFromCode = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/spotify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri: REDIRECT_URI })
    });
    
    if (!response.ok) throw new Error('Token request failed');
    
    const data = await response.json();
    saveSpotifyToken(data.access_token, data.refresh_token, data.expires_in);
    return true;
  } catch (error) {
    console.error('Fehler beim Token-Abruf:', error);
    return false;
  }
};

// Token widerrufen (Logout)
export const logoutFromSpotify = () => {
  localStorage.removeItem('spotify_token_data');
};

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
