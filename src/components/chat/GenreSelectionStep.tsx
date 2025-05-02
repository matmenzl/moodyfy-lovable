
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Song } from '@/components/SongList';
import { Sparkles, Music } from "lucide-react";

interface GenreSelectionStepProps {
  suggestedGenres: string[];
  mood: string;
  onGenreSelect: (genre: string) => void;
  isLoading: boolean;
  historyTracksPreview: Song[];
}

const GenreSelectionStep: React.FC<GenreSelectionStepProps> = ({
  suggestedGenres,
  mood,
  onGenreSelect,
  isLoading,
  historyTracksPreview
}) => {
  const [customGenre, setCustomGenre] = useState('');

  console.log('Rendering GenreSelectionStep with genres:', suggestedGenres);

  return (
    <div className="space-y-4">
      <p>
        Based on your <span className="text-moodyfy-blue">{mood}</span> mood and your listening history,
        here are some genre recommendations:
      </p>
      
      <div className="glass-card p-4 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">AI Genre Suggestions</h3>
          <div className="flex items-center text-xs text-moodyfy-accent">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>AI Generated</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mb-3">
          These genres are based on analysis of your listening history and current mood.
        </p>
        
        {historyTracksPreview.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Based on tracks like:</p>
            <div className="flex flex-wrap gap-2">
              {historyTracksPreview.slice(0, 3).map((track, index) => (
                <div key={index} className="bg-white/5 rounded-full px-2 py-1 text-xs flex items-center">
                  <Music className="h-3 w-3 mr-1 text-moodyfy-accent" />
                  <span>{track.title} - {track.artist}</span>
                </div>
              ))}
              {historyTracksPreview.length > 3 && (
                <div className="bg-white/5 rounded-full px-2 py-1 text-xs">
                  +{historyTracksPreview.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {suggestedGenres.map((genre, index) => (
            <Button
              key={index}
              onClick={() => onGenreSelect(genre)}
              className="bg-moodyfy-accent/20 hover:bg-moodyfy-accent/40 text-white"
              disabled={isLoading}
              size="sm"
            >
              {genre}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="Or enter your own genre..."
            className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={() => customGenre && onGenreSelect(customGenre)}
            disabled={!customGenre || isLoading}
            size="sm"
            className="bg-moodyfy-blue hover:bg-moodyfy-blue/80"
          >
            Go
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenreSelectionStep;
