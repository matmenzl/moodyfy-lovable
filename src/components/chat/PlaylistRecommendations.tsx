
import React from 'react';
import { Button } from "@/components/ui/button";
import { Music, Sparkles } from "lucide-react";
import { Song } from '../SongList';

interface PlaylistRecommendationsProps {
  songs: Song[];
  mood: string;
  genre: string;
  useHistory: boolean;
  onConfirmPlaylist: () => void;
  onRejectPlaylist: () => void;
}

const PlaylistRecommendations: React.FC<PlaylistRecommendationsProps> = ({
  songs,
  mood,
  genre,
  useHistory,
  onConfirmPlaylist,
  onRejectPlaylist
}) => {
  return (
    <div className="space-y-4">
      <p>
        Based on your <span className="text-moodyfy-blue">{mood}</span> mood
        {genre && <> and <span className="text-moodyfy-pink">{genre}</span> preference</>}, 
        here are some AI-recommended songs I think you'll enjoy:
      </p>
      
      <div className="glass-card p-4 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Song Recommendations</h3>
          <div className="flex items-center text-xs text-moodyfy-accent">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>AI Generated</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Diese Empfehlungen basieren auf musikalischen Elementen wie Instrumentierung, Tempo und Stimmung, 
          die zu deiner Anfrage passen{useHistory ? " und deinem Hörverlauf" : ""}.
        </p>
        <ul className="space-y-2">
          {songs.map((song, index) => (
            <li key={index} className="flex items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="p-1 bg-moodyfy-accent/20 rounded-full mr-2">
                <Music className="h-3 w-3 text-moodyfy-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white text-sm">{song.title}</p>
                <p className="text-xs text-gray-400">{song.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p>Would you like me to create a Spotify playlist with these songs?</p>
      
      <div className="flex space-x-3">
        <Button 
          onClick={onConfirmPlaylist}
          className="bg-moodyfy-green hover:bg-moodyfy-green/80 transition-colors"
          size="sm"
        >
          Yes, create playlist
        </Button>
        <Button 
          onClick={onRejectPlaylist}
          variant="outline"
          className="bg-transparent border-white/20 hover:bg-white/10 transition-colors"
          size="sm"
        >
          No, try again
        </Button>
      </div>
    </div>
  );
};

export default PlaylistRecommendations;
