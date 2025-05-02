
import React from 'react';
import { Button } from '@/components/ui/button';
import { redirectToSpotifyLogin, isSpotifyConnected } from '@/services/spotifyAuthService';
import { Music, Link2 } from 'lucide-react';

const SpotifyConnect = () => {
  const handleConnectClick = () => {
    // Directly use the Spotify authentication flow
    redirectToSpotifyLogin();
  };
  
  const isConnected = isSpotifyConnected();
  
  // Only show SpotifyConnect if not connected
  if (isConnected) return null;
  
  return (
    <div className="glass-card p-6 rounded-xl mb-6 text-center">
      <div className="p-4 bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Music className="h-8 w-8 text-green-500" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        Spotify verbinden
      </h3>
      
      <p className="text-sm text-gray-400 mb-4">
        Verbinde dein Spotify-Konto, um Playlists direkt in deiner Bibliothek zu erstellen und deinen Hörverlauf für bessere Empfehlungen zu nutzen.
      </p>
      
      <Button 
        onClick={handleConnectClick}
        className="bg-green-500 hover:bg-green-600 transition-colors w-full"
      >
        <Link2 className="w-4 h-4 mr-2" />
        Verbinden
      </Button>
    </div>
  );
};

export default SpotifyConnect;
