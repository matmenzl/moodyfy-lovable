
import React from 'react';
import { Button } from '@/components/ui/button';
import { connectToSpotify, isSpotifyConnected } from '@/services/musicService';
import { Music, LogIn } from 'lucide-react';

const SpotifyConnect = () => {
  const isConnected = isSpotifyConnected();
  
  const handleConnectClick = () => {
    connectToSpotify();
  };
  
  return (
    <div className="glass-card p-6 rounded-xl mb-6 text-center">
      <div className="p-4 bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Music className="h-8 w-8 text-green-500" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {isConnected ? 'Mit Spotify verbunden' : 'Verbinde dich mit Spotify'}
      </h3>
      
      <p className="text-sm text-gray-400 mb-4">
        {isConnected 
          ? 'Erstelle direkt Playlists in deiner Spotify-Bibliothek.'
          : 'Verbinde dein Spotify-Konto, um Playlists direkt in deiner Bibliothek zu erstellen.'}
      </p>
      
      {!isConnected && (
        <Button 
          onClick={handleConnectClick}
          className="bg-green-500 hover:bg-green-600 transition-colors w-full"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Mit Spotify verbinden
        </Button>
      )}
    </div>
  );
};

export default SpotifyConnect;
