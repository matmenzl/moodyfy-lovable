
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Music4 } from "lucide-react";

interface PlaylistCreatedProps {
  playlistUrl: string;
  onReset: () => void;
}

const PlaylistCreated = ({ playlistUrl, onReset }: PlaylistCreatedProps) => {
  return (
    <div className="animate-fade-in w-full max-w-md mx-auto">
      <div className="mb-6 flex flex-col items-center">
        <div className="p-3 bg-moodyfy-green/20 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-moodyfy-green" />
        </div>
        <h1 className="text-2xl font-bold mb-1 text-gradient">Playlist Created!</h1>
        <p className="text-sm text-gray-400">Your mood playlist is ready to play</p>
      </div>

      <div className="glass-card p-6 rounded-xl mb-6 flex flex-col items-center justify-center">
        <div className="mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-moodyfy-blue to-moodyfy-accent opacity-20 blur-xl rounded-full"></div>
          <div className="p-6 bg-black/40 rounded-full relative z-10">
            <Music4 className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h2 className="text-lg font-bold mb-4">Your playlist is ready!</h2>
        
        <Button 
          onClick={() => window.open(playlistUrl, '_blank')}
          className="w-full bg-gradient-to-r from-moodyfy-blue to-moodyfy-accent hover:opacity-90 transition-all mb-4"
        >
          <ExternalLink className="mr-2 h-4 w-4" /> Open in Spotify
        </Button>
        
        <Button 
          onClick={onReset}
          variant="outline"
          className="w-full bg-transparent border-white/20 hover:bg-white/10 transition-colors"
        >
          Create another playlist
        </Button>
      </div>
    </div>
  );
};

export default PlaylistCreated;
