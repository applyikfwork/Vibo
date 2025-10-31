import type { Vibe, Emotion, MoodHistoryData, EmotionCategory } from './types';
import { PlaceHolderImages } from './placeholder-images';

// Updated with new, more vibrant gradient colors as per the design plan.
export const emotions: Emotion[] = [
  { name: 'Happy', emoji: '😊', gradient: 'from-[#FFD93D] to-[#FF9A3D]' },
  { name: 'Sad', emoji: '😢', gradient: 'from-[#89CFF0] to-[#3A5BA0]' },
  { name: 'Chill', emoji: '😌', gradient: 'from-[#C1FFD7] to-[#6DD5FA]' },
  { name: 'Motivated', emoji: '💪', gradient: 'from-[#FF6B6B] to-[#FFD93D]' },
  { name: 'Lonely', emoji: '😔', gradient: 'from-[#A18CD1] to-[#FBC2EB]' },
  { name: 'Angry', emoji: '😠', gradient: 'from-red-700 to-rose-800' },
  { name: 'Neutral', emoji: '😶', gradient: 'from-gray-500 to-slate-600' },
];

// This file now contains only static definitions.
// The 'vibes' and 'moodHistory' are now fetched from Firestore.

export const moodHistory: MoodHistoryData[] = [
  { day: 'Mon', Happy: 4, Sad: 2, Chill: 3, Motivated: 5, Lonely: 1 },
  { day: 'Tue', Happy: 6, Sad: 1, Chill: 5, Motivated: 3, Lonely: 0 },
  { day: 'Wed', Happy: 3, Sad: 3, Chill: 4, Motivated: 4, Lonely: 2 },
  { day: 'Thu', Happy: 5, Sad: 0, Chill: 6, Motivated: 6, Lonely: 0 },
  { day: 'Fri', Happy: 8, Sad: 1, Chill: 3, Motivated: 2, Lonely: 1 },
  { day: 'Sat', Happy: 7, Sad: 0, Chill: 7, Motivated: 1, Lonely: 0 },
  { day: 'Sun', Happy: 5, Sad: 2, Chill: 8, Motivated: 0, Lonely: 3 },
];

export const getEmotionByName = (name: string): Emotion | undefined => {
    return emotions.find(e => e.name === name);
}