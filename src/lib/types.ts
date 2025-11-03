import { Timestamp } from "firebase/firestore";
import { z } from 'zod';
import { DiagnoseVibeInputSchema, DiagnoseVibeOutputSchema } from './schemas';

export type EmotionCategory = 'Happy' | 'Sad' | 'Chill' | 'Motivated' | 'Lonely' | 'Angry' | 'Neutral';

export type Author = {
  name: string;
  avatarUrl: string;
};

export type Vibe = {
  id: string;
  userId: string;
  text: string;
  emoji: string;
  emotion: EmotionCategory;
  backgroundColor: string; // This should be the tailwind gradient class string
  timestamp: Timestamp;
  tagIds?: string[];
  // Denormalized author data for easier feed display
  author: Author;
  isAnonymous: boolean;
};

export type Comment = {
  id: string;
  vibeId: string;
  userId: string;
  text: string;
  timestamp: Timestamp;
  author: Author;
  isAnonymous: boolean;
};

export type Reaction = {
  id: string;
  vibeId: string;
  userId: string;
  emoji: string;
  timestamp: Timestamp;
  author: Author;
};

export type Emotion = {
  name: EmotionCategory;
  emoji: string;
  gradient: string; // tailwind gradient class
};

export type MoodHistoryData = {
  day: string;
  Happy: number;
  Sad: number;
  Chill: number;
  Motivated: number;
  Lonely: number;
};

export type DiagnoseVibeInput = z.infer<typeof DiagnoseVibeInputSchema>;
export type DiagnoseVibeOutput = z.infer<typeof DiagnoseVibeOutputSchema>;
