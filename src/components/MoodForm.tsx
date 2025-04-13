
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, Play } from "lucide-react";

interface MoodFormProps {
  onSubmit: (mood: string, genre: string) => void;
}

const MoodForm = ({ onSubmit }: MoodFormProps) => {
  const [mood, setMood] = useState('');
  const [genre, setGenre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      onSubmit(mood, genre);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="animate-fade-in w-full max-w-md mx-auto">
      <div className="mb-6 flex flex-col items-center">
        <div className="p-3 bg-moodyfy-accent/20 rounded-full mb-4">
          <Music className="h-8 w-8 text-moodyfy-accent" />
        </div>
        <h1 className="text-2xl font-bold mb-1 text-gradient">Moodyfy</h1>
        <p className="text-sm text-gray-400">Create a playlist that matches your mood</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mood" className="text-sm font-medium">
            How are you feeling right now? <span className="text-moodyfy-accent">*</span>
          </Label>
          <Input 
            id="mood"
            placeholder="Energetic, relaxed, melancholic..."
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="bg-black/30 border-white/10 focus:border-moodyfy-accent/50 focus:ring-moodyfy-accent/20"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre" className="text-sm font-medium flex justify-between">
            <span>Music genre or style (optional)</span>
          </Label>
          <Input 
            id="genre"
            placeholder="Rock, Jazz, Lo-fi, K-pop..."
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="bg-black/30 border-white/10 focus:border-moodyfy-accent/50 focus:ring-moodyfy-accent/20"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-moodyfy-blue to-moodyfy-accent hover:opacity-90 transition-all"
          disabled={!mood.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">Processing <span className="ml-2 flex space-x-1">
              <span className="h-2 w-2 bg-white rounded-full animate-pulse-slow"></span>
              <span className="h-2 w-2 bg-white rounded-full animate-pulse-slow" style={{ animationDelay: "0.2s" }}></span>
              <span className="h-2 w-2 bg-white rounded-full animate-pulse-slow" style={{ animationDelay: "0.4s" }}></span>
            </span></span>
          ) : (
            <span className="flex items-center">Find My Playlist <Play className="ml-2 h-4 w-4" /></span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default MoodForm;
