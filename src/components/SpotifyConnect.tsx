
import React from 'react';
import { Button } from '@/components/ui/button';
import { connectToSpotify, isSpotifyConnected } from '@/services/musicService';
import { Music, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SpotifyConnect = () => {
  const handleConnectClick = async () => {
    // If not logged in, first initiate Google login
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      // User is logged in, connect Spotify
      connectToSpotify();
    }
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
        Verbinde dein Spotify-Konto, um Playlists direkt in deiner Bibliothek zu erstellen.
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
