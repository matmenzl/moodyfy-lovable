
import React from 'react';
import { Button } from "@/components/ui/button";
import { redirectToSpotifyLogin, logoutFromSpotify, isSpotifyConnected } from '@/services/spotifyAuthService';
import { useToast } from '@/components/ui/use-toast';
import { Music } from 'lucide-react';

interface AuthButtonProps {
  isAuthenticated: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ isAuthenticated }) => {
  const { toast } = useToast();
  const isConnected = isSpotifyConnected();

  const handleLogin = () => {
    redirectToSpotifyLogin();
  };

  const handleLogout = () => {
    logoutFromSpotify();
    toast({
      title: "Abgemeldet",
      description: "Du wurdest erfolgreich von Spotify abgemeldet."
    });
    // Force page reload to update state
    window.location.reload();
  };

  return isConnected ? (
    <Button variant="outline" className="bg-transparent border-white/20" onClick={handleLogout}>
      Von Spotify abmelden
    </Button>
  ) : (
    <Button 
      className="bg-green-500 hover:bg-green-600/80" 
      onClick={handleLogin}
    >
      <Music className="h-4 w-4 mr-2" />
      Mit Spotify verbinden
    </Button>
  );
};

export default AuthButton;
