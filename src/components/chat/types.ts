
import { MessageType } from "../ChatMessage";
import { Song } from "../SongList";

export interface Message {
  id: string;
  content: React.ReactNode;
  type: MessageType;
}

export interface ChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, "id">) => void;
  addUserMessage: (content: string) => void;
  isLoading: boolean;
  currentStep: 'MoodInput' | 'SongRecommendations' | 'PlaylistCreated';
  aiModel?: string;
  playlistHistory?: PlaylistHistoryItem[];
}

export interface PlaylistHistoryItem {
  id: string;
  name: string;
  mood: string;
  genre?: string;
  songs: Song[];
  createdAt: string;
  spotifyUrl?: string;
}
