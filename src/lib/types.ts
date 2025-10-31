import { Timestamp } from "firebase/firestore";

export type EmotionCategory = 'Happy' | 'Sad' | 'Chill' | 'Motivated' | 'Lonely' | 'Angry' | 'Neutral';

export type Vibe = {
  id: string;
  userId: string;
  text: string;
  emoji: string;
  emotion: EmotionCategory;
  backgroundColor: string;
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
