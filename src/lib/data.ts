import type { Vibe, Emotion, MoodHistoryData, EmotionCategory } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const emotions: Emotion[] = [
  { name: 'Happy', emoji: '😊', gradient: 'from-yellow-400 to-amber-500' },
  { name: 'Sad', emoji: '😢', gradient: 'from-blue-500 to-indigo-600' },
  { name: 'Chill', emoji: '😌', gradient: 'from-green-400 to-teal-500' },
  { name: 'Motivated', emoji: '💪', gradient: 'from-orange-500 to-red-500' },
  { name: 'Lonely', emoji: '😔', gradient: 'from-purple-500 to-violet-600' },
  { name: 'Angry', emoji: '😠', gradient: 'from-red-600 to-rose-700' },
  { name: 'Neutral', emoji: '😶', gradient: 'from-gray-400 to-slate-500' },
];

const users = [
    { name: 'Alex', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl || '' },
    { name: 'Sam', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-2')?.imageUrl || '' },
    { name: 'Jess', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-3')?.imageUrl || '' },
    { name: 'Ryan', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-4')?.imageUrl || '' },
    { name: 'Chloe', avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar-5')?.imageUrl || '' },
];

const sampleVibes: { text: string; emotion: EmotionCategory; emoji: string }[] = [
  { text: "Just closed a big deal at work! Feeling on top of the world.", emotion: 'Happy', emoji: '🎉' },
  { text: "Finally finished my marathon training. So ready for this weekend!", emotion: 'Motivated', emoji: '🏃‍♀️' },
  { text: "Watching the rain fall with a cup of tea. Perfectly chill.", emotion: 'Chill', emoji: '🍵' },
  { text: "Missing my family a lot today.", emotion: 'Sad', emoji: '💔' },
  { text: "Sometimes it feels like I'm on a different planet than everyone else.", emotion: 'Lonely', emoji: '👽' },
  { text: "Another day, another bug that I can't seem to fix. So frustrating.", emotion: 'Angry', emoji: '😡' },
  { text: "Just got my project approved, let's gooo!", emotion: 'Happy', emoji: '🚀' },
  { text: "Got a new personal best at the gym today. Hard work pays off.", emotion: 'Motivated', emoji: '🏋️' },
  { text: "Lazy Sunday, just me and my cat. Life is good.", emotion: 'Chill', emoji: '🐈' },
  { text: "Feeling a bit down, hope tomorrow is better.", emotion: 'Sad', emoji: '🌧️' },
  { text: "Wishing I had someone to talk to right now.", emotion: 'Lonely', emoji: '💬' },
  { text: "Stuck in traffic. Again. This is my villain origin story.", emotion: 'Angry', emoji: '😤' },
];

export const vibes: Vibe[] = sampleVibes.map((vibe, index) => ({
  id: `vibe-${index}`,
  author: users[index % users.length],
  text: vibe.text,
  emoji: vibe.emoji,
  emotion: vibe.emotion,
  isAnonymous: index % 4 === 0, // Make some anonymous
  createdAt: new Date(Date.now() - index * 1000 * 60 * 15).toISOString(), // 15 min intervals
}));

export const moodHistory: MoodHistoryData[] = [
  { day: 'Mon', Happy: 4, Sad: 2, Chill: 3, Motivated: 5, Lonely: 1 },
  { day: 'Tue', Happy: 6, Sad: 1, Chill: 5, Motivated: 3, Lonely: 0 },
  { day: 'Wed', Happy: 3, Sad: 3, Chill: 4, Motivated: 4, Lonely: 2 },
  { day: 'Thu', Happy: 5, Sad: 0, Chill: 6, Motivated: 6, Lonely: 0 },
  { day: 'Fri', Happy: 8, Sad: 1, Chill: 3, Motivated: 2, Lonely: 1 },
  { day: 'Sat', Happy: 7, Sad: 0, Chill: 7, Motivated: 1, Lonely: 0 },
  { day: 'Sun', Happy: 5, Sad: 2, Chill: 8, Motivated: 0, Lonely: 3 },
];

export const getEmotionByName = (name: EmotionCategory): Emotion => {
    return emotions.find(e => e.name === name) || emotions.find(e => e.name === 'Neutral')!;
}
