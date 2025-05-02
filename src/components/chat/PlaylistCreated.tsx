
import React from 'react';
import { Button } from "@/components/ui/button";
import { Music, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Song } from '../SongList';

interface PlaylistCreatedProps {
  addedSongs: Song[];
  notFoundSongs: Song[];
  playlistUrl: string;
  songs: Song[];
  onReset: () => void;
}

const PlaylistCreated: React.FC<PlaylistCreatedProps> = ({
  addedSongs,
  notFoundSongs,
  playlistUrl,
  songs,
  onReset
}) => {
  return (
    <div className="space-y-4">
      <p>Great! I've created your playlist based on your mood.</p>
      
      {notFoundSongs && notFoundSongs.length > 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
            <p className="text-sm font-medium text-yellow-500">
              {notFoundSongs.length === songs.length 
                ? "None of the songs could be found on Spotify." 
                : `${notFoundSongs.length} of ${songs.length} songs couldn't be found on Spotify.`}
            </p>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            This can happen with AI-generated recommendations that might not match exactly with Spotify's catalog.
          </p>
          {notFoundSongs.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-yellow-500/80 hover:text-yellow-500 transition-colors">
                Show missing songs
              </summary>
              <ul className="mt-2 space-y-1">
                {notFoundSongs.map((song, index) => (
                  <li key={index} className="flex items-center">
                    <XCircle className="h-3 w-3 text-yellow-500/80 mr-1" />
                    <span>{song.title} - {song.artist}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
      
      <div className="glass-card p-4 rounded-xl flex flex-col items-center">
        <div className="mb-3 p-3 bg-moodyfy-green/20 rounded-full">
          <Music className="h-6 w-6 text-moodyfy-green" />
        </div>
        <h3 className="font-bold mb-2">Your Playlist is Ready!</h3>
        
        {addedSongs && addedSongs.length > 0 && (
          <div className="w-full mb-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <p className="text-sm font-medium">
                {addedSongs.length} songs added to your playlist
              </p>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-moodyfy-blue hover:text-moodyfy-blue/80 transition-colors">
                Show added songs
              </summary>
              <ul className="mt-2 space-y-1">
                {addedSongs.map((song, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span>{song.title} - {song.artist}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
        
        <Button 
          onClick={() => window.open(playlistUrl, '_blank')}
          className="w-full bg-gradient-to-r from-moodyfy-blue to-moodyfy-accent hover:opacity-90 transition-all mb-3"
          size="sm"
        >
          Open in Spotify
        </Button>
        
        <Button 
          onClick={onReset}
          variant="outline"
          className="w-full bg-transparent border-white/20 hover:bg-white/10 transition-colors"
          size="sm"
        >
          Create another playlist
        </Button>
      </div>
    </div>
  );
};

export default PlaylistCreated;
