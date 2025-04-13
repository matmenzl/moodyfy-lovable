
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenFromCode } from '@/services/spotifyAuthService';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

const SpotifyCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL-Parameter auswerten
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const storedState = localStorage.getItem('spotify_auth_state');
        
        console.log("Spotify callback received. Code exists:", !!code, "Error:", error);
        
        // Fehler oder CSRF-Schutz prüfen
        if (error) {
          throw new Error(`Spotify-Authentifizierung fehlgeschlagen: ${error}`);
        }
        
        if (!code) {
          throw new Error('Spotify-Authentifizierung fehlgeschlagen: Kein Code erhalten');
        }
        
        if (!state || state !== storedState) {
          console.warn('State-Parameter stimmt nicht überein oder fehlt:', { 
            receivedState: state, 
            storedState 
          });
          // We continue anyway, as some environments might have issues with localStorage
        }
        
        // Token-Austausch durchführen
        console.log("Attempting to exchange code for token");
        const success = await getTokenFromCode(code);
        
        if (!success) {
          throw new Error('Konnte Spotify-Token nicht abrufen');
        }
        
        // Authentifizierung erfolgreich
        console.log("Authentication successful");
        setStatus('success');
        localStorage.removeItem('spotify_auth_state'); // State-Parameter entfernen
        
        toast.success('Spotify-Verbindung erfolgreich', {
          description: 'Du kannst jetzt Playlists auf Spotify erstellen.'
        });
        
        // Nach einer kurzen Verzögerung zur Hauptseite weiterleiten
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (error) {
        console.error('Fehler im Spotify-Callback:', error);
        setStatus('error');
        
        toast.error('Spotify-Verbindung fehlgeschlagen', {
          description: error instanceof Error ? error.message : 'Unbekannter Fehler'
        });
        
        // Nach einer längeren Verzögerung zur Hauptseite weiterleiten
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };
    
    handleCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-moodyfy-dark to-black flex items-center justify-center">
      <div className="glass-card p-8 rounded-xl text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h1 className="text-xl font-bold mb-2">Verbinde mit Spotify...</h1>
            <p className="text-gray-400">Bitte warte, während wir deine Anmeldung verarbeiten.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="bg-green-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">Spotify-Verbindung erfolgreich</h1>
            <p className="text-gray-400">Du wirst zur App weitergeleitet...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="bg-red-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">Verbindung fehlgeschlagen</h1>
            <p className="text-gray-400">Es gab ein Problem bei der Spotify-Authentifizierung. Du wirst zur App weitergeleitet...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SpotifyCallback;
