
import React from 'react';
import { ListMusic, Calendar, ExternalLink } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlaylistHistoryItem } from './chat/types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface PlaylistHistoryProps {
  playlists: PlaylistHistoryItem[];
  onOpenPlaylist: (playlist: PlaylistHistoryItem) => void;
}

const PlaylistHistory: React.FC<PlaylistHistoryProps> = ({ playlists, onOpenPlaylist }) => {
  if (!playlists || playlists.length === 0) {
    return (
      <div className="text-center p-8">
        <ListMusic className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Keine Playlists gefunden</h3>
        <p className="text-sm text-gray-400 mt-2">
          Erstelle deine erste Stimmungs-Playlist, um sie hier zu sehen.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Deine Playlist-Historie</h2>
      
      <div className="glass-card p-4 rounded-xl mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Stimmung</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.map((playlist) => (
              <TableRow key={playlist.id} className="hover:bg-white/5">
                <TableCell className="font-medium">{playlist.name}</TableCell>
                <TableCell>{playlist.mood}</TableCell>
                <TableCell>{playlist.genre || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(playlist.createdAt), { 
                        addSuffix: true,
                        locale: de
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onOpenPlaylist(playlist)}
                    className="h-8 w-8 p-0"
                  >
                    <ListMusic className="h-4 w-4" />
                    <span className="sr-only">Anzeigen</span>
                  </Button>
                  {playlist.spotifyUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.open(playlist.spotifyUrl, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">In Spotify öffnen</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PlaylistHistory;
