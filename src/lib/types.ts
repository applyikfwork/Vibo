import { Timestamp } from "firebase/firestore";
import { z } from 'zod';
import { DiagnoseVibeInputSchema, DiagnoseVibeOutputSchema } from './schemas';

export type EmotionCategory = 'Happy' | 'Sad' | 'Chill' | 'Motivated' | 'Lonely' | 'Angry' | 'Neutral';

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
  author: {
    name: string;
    avatarUrl: string;
  };
  isAnonymous: boolean;
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
