import type { Vibe, Emotion, MoodHistoryData, EmotionCategory } from './types';
import { PlaceHolderImages } from './placeholder-images';

// Vibrant emotion gradients inspired by the design
export const emotions: Emotion[] = [
  { name: 'Happy', emoji: '😊', gradient: 'from-[#FFA726] via-[#FF9F1C] to-[#FF8C00]' },
  { name: 'Sad', emoji: '😢', gradient: 'from-[#2196F3] via-[#1976D2] to-[#0D47A1]' },
  { name: 'Chill', emoji: '😌', gradient: 'from-[#4DD0E1] via-[#26C6DA] to-[#00ACC1]' },
  { name: 'Motivated', emoji: '😊', gradient: 'from-[#E040FB] via-[#BA68C8] to-[#9C27B0]' },
  { name: 'Lonely', emoji: '😔', gradient: 'from-[#A18CD1] via-[#B39DDB] to-[#9575CD]' },
  { name: 'Angry', emoji: '😠', gradient: 'from-[#EF5350] via-[#E53935] to-[#C62828]' },
  { name: 'Neutral', emoji: '😶', gradient: 'from-[#78909C] via-[#607D8B] to-[#455A64]' },
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
