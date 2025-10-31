export type EmotionCategory = 'Happy' | 'Sad' | 'Chill' | 'Motivated' | 'Lonely' | 'Angry' | 'Neutral';

export type Vibe = {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  text: string;
  emoji: string;
  emotion: EmotionCategory;
  isAnonymous: boolean;
  createdAt: string;
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
