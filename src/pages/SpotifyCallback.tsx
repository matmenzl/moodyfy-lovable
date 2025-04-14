
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenFromCode } from '@/services/spotify/tokenService';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { SPOTIFY_CLIENT_SECRET } from '@/services/spotify/constants';

const SpotifyCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'redirect_error' | 'missing_secret'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
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
        
        // Check for specific Spotify errors
        if (error === 'invalid_client') {
          setStatus('redirect_error');
          setErrorMessage('Die Spotify Client-ID ist nicht mit dieser Redirect-URI registriert. Bitte aktualisiere die Redirect-URI im Spotify Developer Dashboard.');
          return;
        }
        
        // Überprüfen, ob ein Client Secret konfiguriert ist
        if (!SPOTIFY_CLIENT_SECRET) {
          setStatus('missing_secret');
          setErrorMessage('Das Spotify Client Secret ist nicht konfiguriert. Bitte füge es in der Datei "src/services/spotify/constants.ts" hinzu.');
          return;
        }
        
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
        
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Unbekannter Fehler bei der Spotify-Authentifizierung');
        }
        
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
            <p className="text-gray-400">{errorMessage || 'Es gab ein Problem bei der Spotify-Authentifizierung. Du wirst zur App weitergeleitet...'}</p>
          </>
        )}
        
        {status === 'redirect_error' && (
          <>
            <div className="bg-amber-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">Konfigurationsproblem</h1>
            <p className="text-gray-400 mb-4">{errorMessage}</p>
            <div className="text-sm text-left bg-gray-800/50 p-4 rounded-lg mb-4">
              <p className="font-medium mb-2">So behebst du das Problem:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>Öffne das <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Spotify Developer Dashboard</a></li>
                <li>Wähle deine App aus</li>
                <li>Klicke auf "Edit Settings"</li>
                <li>Füge diese URI als "Redirect URI" hinzu: <code className="bg-gray-700 px-2 py-1 rounded text-green-300">{window.location.origin}/spotify-callback</code></li>
                <li>Speichere die Änderungen</li>
                <li>Versuche die Verbindung erneut</li>
              </ol>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors w-full"
            >
              Zurück zur App
            </button>
          </>
        )}
        
        {status === 'missing_secret' && (
          <>
            <div className="bg-amber-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">Client Secret fehlt</h1>
            <p className="text-gray-400 mb-4">{errorMessage}</p>
            <div className="text-sm text-left bg-gray-800/50 p-4 rounded-lg mb-4">
              <p className="font-medium mb-2">So behebst du das Problem:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>Öffne das <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Spotify Developer Dashboard</a></li>
                <li>Wähle deine App aus</li>
                <li>Suche nach dem Client Secret oder klicke auf "Show Client Secret"</li>
                <li>Kopiere das Client Secret</li>
                <li>Öffne die Datei <code className="bg-gray-700 px-2 py-1 rounded text-green-300">src/services/spotify/constants.ts</code></li>
                <li>Füge das Client Secret bei der Variable <code className="bg-gray-700 px-2 py-1 rounded text-green-300">SPOTIFY_CLIENT_SECRET</code> ein</li>
                <li>Speichere die Datei und starte die App neu</li>
              </ol>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors w-full"
            >
              Zurück zur App
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SpotifyCallback;
