
// Importing constants
import { SPOTIFY_TOKEN_URL, SPOTIFY_CLIENT_ID, REDIRECT_URI } from './constants';
import { supabase } from '@/integrations/supabase/client';

// Types for token data
interface SpotifyTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

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

// Token vom Callback-Code abrufen über den Edge Function
export const getTokenFromCode = async (code: string): Promise<boolean> => {
  try {
    console.log("Getting token from code with redirect URI:", REDIRECT_URI);
    
    // Use Supabase Edge Function instead of direct API call
    const { data, error } = await supabase.functions.invoke('spotify-token', {
      body: { code }
    });
    
    if (error) {
      console.error('Error calling Spotify token edge function:', error);
      throw new Error(`Token request failed: ${error.message}`);
    }
    
    if (!data || !data.access_token) {
      console.error('Invalid response from Spotify token edge function:', data);
      throw new Error('Invalid response from Spotify token service');
    }
    
    saveSpotifyToken(data.access_token, data.refresh_token, data.expires_in);
    return true;
  } catch (error) {
    console.error('Fehler beim Token-Abruf:', error);
    return false;
  }
};

// Token erneuern, wenn es abgelaufen ist
export const refreshSpotifyToken = async (): Promise<boolean> => {
  try {
    const { refreshToken } = getSpotifyToken();
    
    if (!refreshToken) {
      throw new Error('Kein Refresh-Token vorhanden');
    }
    
    // Use the authorization header method again
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:`)}`  // Client secret is omitted as it's handled server-side
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: SPOTIFY_CLIENT_ID
      }).toString()
    });
    
    if (!response.ok) {
      throw new Error('Token-Aktualisierung fehlgeschlagen');
    }
    
    const data = await response.json();
    
    // Wenn ein neues Refresh-Token zurückgegeben wird, speichere dieses
    const newRefreshToken = data.refresh_token || refreshToken;
    saveSpotifyToken(data.access_token, newRefreshToken, data.expires_in);
    
    return true;
  } catch (error) {
    console.error('Fehler bei der Token-Aktualisierung:', error);
    return false;
  }
};

// Token widerrufen (Logout)
export const logoutFromSpotify = () => {
  localStorage.removeItem('spotify_token_data');
};
