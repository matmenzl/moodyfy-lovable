
import React from 'react';
import { Button } from "@/components/ui/button";
import { Disc3, CheckCircle2, XCircle, Music2 } from "lucide-react";

export interface Song {
  title: string;
  artist: string;
}

interface SongListProps {
  songs: Song[];
  mood: string;
  genre: string;
  onConfirm: () => void;
  onReject: () => void;
}

const SongList = ({ songs, mood, genre, onConfirm, onReject }: SongListProps) => {
  return (
    <div className="animate-fade-in w-full max-w-md mx-auto">
      <div className="mb-6 flex flex-col items-center">
        <div className="p-3 bg-moodyfy-accent/20 rounded-full mb-4">
          <Music2 className="h-8 w-8 text-moodyfy-accent" />
        </div>
        <h1 className="text-2xl font-bold mb-1 text-gradient">Your Mood Playlist</h1>
        <p className="text-sm text-gray-400 text-center">
          Based on your <span className="text-moodyfy-blue">{mood}</span> mood
          {genre && <> and <span className="text-moodyfy-pink">{genre}</span> preference</>}
        </p>
      </div>

      <div className="glass-card p-6 rounded-xl mb-6">
        <ul className="space-y-3">
          {songs.map((song, index) => (
            <li key={index} className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="p-2 bg-moodyfy-accent/20 rounded-full mr-3">
                <Disc3 className="h-4 w-4 text-moodyfy-accent" />
              </div>
              <div>
                <p className="font-medium text-white">{song.title}</p>
                <p className="text-sm text-gray-400">{song.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-400">Would you like to create a Spotify playlist with these songs?</p>
        <div className="flex space-x-4 justify-center">
          <Button 
            onClick={onConfirm}
            className="flex-1 bg-moodyfy-green hover:bg-moodyfy-green/80 transition-colors"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Yes, create playlist
          </Button>
          <Button 
            onClick={onReject}
            variant="outline"
            className="flex-1 bg-transparent border-white/20 hover:bg-white/10 transition-colors"
          >
            <XCircle className="mr-2 h-4 w-4" /> Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SongList;
