import type { Vibe, Emotion, MoodHistoryData, EmotionCategory } from './types';
import { PlaceHolderImages } from './placeholder-images';

// Super vibrant emotion gradients matching the reference design
export const emotions: Emotion[] = [
  { name: 'Happy', emoji: '😊', gradient: 'from-[#FFB84D] via-[#FFA726] to-[#FF9500]' },
  { name: 'Sad', emoji: '😢', gradient: 'from-[#64B5F6] via-[#42A5F5] to-[#2196F3]' },
  { name: 'Chill', emoji: '😌', gradient: 'from-[#4DD0E1] via-[#26C6DA] to-[#00BCD4]' },
  { name: 'Motivated', emoji: '😊', gradient: 'from-[#F48FB1] via-[#EC407A] to-[#E91E63]' },
  { name: 'Lonely', emoji: '😔', gradient: 'from-[#CE93D8] via-[#BA68C8] to-[#AB47BC]' },
  { name: 'Angry', emoji: '😠', gradient: 'from-[#FF7043] via-[#FF5722] to-[#F4511E]' },
  { name: 'Neutral', emoji: '😶', gradient: 'from-[#90A4AE] via-[#78909C] to-[#607D8B]' },
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
