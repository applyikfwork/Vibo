import type { EmotionCategory } from './types';

export type IndianFestival = {
  id: string;
  name: string;
  englishName: string;
  date: string; // Format: "MM-DD" for recurring annual festivals
  month: number; // 1-12
  day: number;
  description: string;
  associatedEmotions: EmotionCategory[];
  healingContent: string[];
  significance: string;
  moodPrepTips: string[];
  regionalVariations?: string[];
};

export const indianFestivals: IndianFestival[] = [
  {
    id: 'diwali',
    name: 'दीपावली',
    englishName: 'Diwali',
    date: '10-24', // Approximate - varies by lunar calendar
    month: 10,
    day: 24,
    description: 'Festival of Lights celebrating the victory of light over darkness',
    associatedEmotions: ['Festival Joy', 'Missing Home', 'Family Bonding', 'Festive Nostalgia'],
    healingContent: [
      'If feeling lonely during Diwali, remember you\'re not alone - millions celebrate in spirit',
      'Missing home? Share your favorite Diwali memory with someone',
      'Overwhelmed by expectations? It\'s okay to celebrate in your own way',
    ],
    significance: 'Victory of light over darkness, good over evil',
    moodPrepTips: [
      'Plan a video call with family 3 days before',
      'Light a diya even if alone - it brings peace',
      'Watch your favorite Diwali movie to feel connected',
      'Prepare your favorite sweet to feel festive',
    ],
    regionalVariations: ['Deepavali (South)', 'Bandi Chhor Divas (Punjab)', 'Kali Puja (Bengal)'],
  },
  {
    id: 'holi',
    name: 'होली',
    englishName: 'Holi',
    date: '03-08', // Approximate
    month: 3,
    day: 8,
    description: 'Festival of Colors celebrating the arrival of spring',
    associatedEmotions: ['Festival Joy', 'Missing Home', 'Family Bonding'],
    healingContent: [
      'FOMO is real - but joy can be celebrated solo too',
      'Play Holi with yourself - apply color and dance to music',
      'Video call someone and share Holi wishes',
    ],
    significance: 'Triumph of good over evil, arrival of spring',
    moodPrepTips: [
      'Buy colors a week early to feel festive',
      'Make a playlist of Holi songs',
      'Plan a small celebration even if alone',
      'Share Holi wishes with 5 people',
    ],
  },
  {
    id: 'raksha-bandhan',
    name: 'रक्षा बंधन',
    englishName: 'Raksha Bandhan',
    date: '08-19', // Approximate
    month: 8,
    day: 19,
    description: 'Festival celebrating brother-sister bond',
    associatedEmotions: ['Family Bonding', 'Missing Home', 'Festive Nostalgia'],
    healingContent: [
      'Missing your sibling? Send a virtual rakhi with a heartfelt message',
      'No siblings? Celebrate chosen family - friends who feel like siblings',
      'Far from home? Video call makes it special',
    ],
    significance: 'Sacred bond between brothers and sisters',
    moodPrepTips: [
      'Order rakhi online 2 weeks early',
      'Plan a video call at a specific time',
      'Write down favorite sibling memories',
      'Send a thoughtful gift',
    ],
  },
  {
    id: 'navratri',
    name: 'नवरात्रि',
    englishName: 'Navratri',
    date: '10-03', // Approximate
    month: 10,
    day: 3,
    description: 'Nine nights of worship and celebration',
    associatedEmotions: ['Religious Peace', 'Festival Joy', 'Family Bonding'],
    healingContent: [
      'Can\'t fast? Spiritual connection is about intention, not perfection',
      'Missing Garba nights? Play music and dance at home',
      'Find peace in prayer, even 5 minutes counts',
    ],
    significance: 'Worship of Goddess Durga, victory of good over evil',
    moodPrepTips: [
      'Set up a small altar at home',
      'Download Garba music playlist',
      'Plan virtual dandiya with friends',
      'Learn one new aarti',
    ],
  },
  {
    id: 'ganesh-chaturthi',
    name: 'गणेश चतुर्थी',
    englishName: 'Ganesh Chaturthi',
    date: '09-07', // Approximate
    month: 9,
    day: 7,
    description: 'Birth celebration of Lord Ganesha',
    associatedEmotions: ['Religious Peace', 'Festival Joy', 'Family Bonding'],
    healingContent: [
      'No pandal nearby? Create a small shrine at home',
      'Can\'t make modak? Buy them or visualize offering them in prayer',
      'Spiritual devotion is felt in the heart, not just rituals',
    ],
    significance: 'Remover of obstacles, god of new beginnings',
    moodPrepTips: [
      'Get a small Ganesha idol 1 week early',
      'Learn Ganesh aarti',
      'Plan eco-friendly visarjan',
      'Make or buy modaks',
    ],
  },
  {
    id: 'durga-puja',
    name: 'दुर्गा पूजा',
    englishName: 'Durga Puja',
    date: '10-15', // Approximate
    month: 10,
    day: 15,
    description: 'Worship of Goddess Durga',
    associatedEmotions: ['Religious Peace', 'Festival Joy', 'Missing Home', 'Festive Nostalgia'],
    healingContent: [
      'Missing Kolkata? Watch livestream of famous pandals',
      'Can\'t visit pandals? Close your eyes and remember the aarti sounds',
      'Durga Ma is everywhere - in your heart too',
    ],
    significance: 'Victory of Goddess Durga over evil',
    moodPrepTips: [
      'Plan to watch pandal livestreams',
      'Wear new clothes each day',
      'Cook Bengali sweets',
      'Video call family during evening aarti',
    ],
    regionalVariations: ['Biggest in West Bengal', 'Celebrated across India'],
  },
  {
    id: 'eid-ul-fitr',
    name: 'ईद-उल-फ़ितर',
    englishName: 'Eid ul-Fitr',
    date: '04-10', // Approximate - follows Islamic calendar
    month: 4,
    day: 10,
    description: 'Festival marking the end of Ramadan',
    associatedEmotions: ['Festival Joy', 'Family Bonding', 'Religious Peace'],
    healingContent: [
      'After Ramadan\'s discipline, celebrate your spiritual growth',
      'Missing family? Eid Mubarak can be shared through a call',
      'No biryani? Order some or make simple kheer',
    ],
    significance: 'Celebration after the holy month of fasting',
    moodPrepTips: [
      'Buy new clothes for Eid',
      'Plan Eid namaz location',
      'Prepare or order special food',
      'Send Eid wishes early morning',
    ],
  },
  {
    id: 'pongal',
    name: 'पोंगल',
    englishName: 'Pongal',
    date: '01-14',
    month: 1,
    day: 14,
    description: 'Tamil harvest festival',
    associatedEmotions: ['Festival Joy', 'Family Bonding', 'Religious Peace'],
    healingContent: [
      'Away from Tamil Nadu? Cook sweet pongal to feel connected',
      'Harvest festivals remind us to be grateful for abundance',
      'Draw a small kolam - it brings joy',
    ],
    significance: 'Thanksgiving to Sun God, harvest celebration',
    moodPrepTips: [
      'Learn to make pongal dish',
      'Draw kolam patterns',
      'Decorate with sugarcane and turmeric',
      'Call Tamil friends to wish them',
    ],
    regionalVariations: ['Makar Sankranti (North)', 'Lohri (Punjab)', 'Bihu (Assam)'],
  },
  {
    id: 'janmashtami',
    name: 'जन्माष्टमी',
    englishName: 'Janmashtami',
    date: '08-26', // Approximate
    month: 8,
    day: 26,
    description: 'Birth of Lord Krishna',
    associatedEmotions: ['Religious Peace', 'Festival Joy', 'Family Bonding'],
    healingContent: [
      'Krishna\'s teachings: Find joy in the present moment',
      'Midnight birth celebration can be peaceful solo prayer',
      'Sing bhajans even if alone - Krishna listens',
    ],
    significance: 'Birth of Lord Krishna, divine love and wisdom',
    moodPrepTips: [
      'Fast until midnight if you wish',
      'Decorate Krishna\'s cradle',
      'Learn one Krishna bhajan',
      'Make butter or milk sweets',
    ],
  },
  {
    id: 'onam',
    name: 'ओणम',
    englishName: 'Onam',
    date: '08-29', // Approximate
    month: 8,
    day: 29,
    description: 'Kerala\'s harvest festival',
    associatedEmotions: ['Festival Joy', 'Family Bonding', 'Festive Nostalgia'],
    healingContent: [
      'Missing Kerala? Make a small pookalam with any flowers',
      'Sadhya can be simplified - it\'s about gratitude',
      'Wear white and gold - feel the Onam spirit',
    ],
    significance: 'Homecoming of King Mahabali, prosperity',
    moodPrepTips: [
      'Create a pookalam (flower rangoli)',
      'Plan or order Onam sadhya',
      'Wear traditional Kerala attire',
      'Play Onam songs',
    ],
  },
  {
    id: 'baisakhi',
    name: 'बैसाखी',
    englishName: 'Vaisakhi',
    date: '04-13',
    month: 4,
    day: 13,
    description: 'Punjabi New Year and harvest festival',
    associatedEmotions: ['Festival Joy', 'Religious Peace', 'Family Bonding'],
    healingContent: [
      'Missing Punjab? Play Bhangra music and dance',
      'Visit a Gurudwara or pray at home',
      'Harvest festivals celebrate abundance - count your blessings',
    ],
    significance: 'Sikh New Year, harvest celebration, Khalsa foundation',
    moodPrepTips: [
      'Visit Gurudwara for special prayers',
      'Organize Bhangra with friends',
      'Cook Punjabi food',
      'Wear colorful traditional clothes',
    ],
  },
];

export function getUpcomingFestivals(daysAhead: number = 30): IndianFestival[] {
  const today = new Date();
  const upcoming: IndianFestival[] = [];
  
  for (const festival of indianFestivals) {
    const festivalDate = new Date(today.getFullYear(), festival.month - 1, festival.day);
    
    // If festival has passed this year, check next year
    if (festivalDate < today) {
      festivalDate.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.floor((festivalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil >= 0 && daysUntil <= daysAhead) {
      upcoming.push({ ...festival, daysUntil } as any);
    }
  }
  
  return upcoming.sort((a: any, b: any) => a.daysUntil - b.daysUntil);
}

export function getFestivalByDate(month: number, day: number): IndianFestival | undefined {
  return indianFestivals.find(f => f.month === month && Math.abs(f.day - day) <= 2);
}

export function getCurrentFestivalSeason(): { festival: IndianFestival; phase: 'before' | 'during' | 'after' } | null {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  for (const festival of indianFestivals) {
    const daysDiff = Math.abs(day - festival.day);
    
    if (festival.month === month && daysDiff <= 3) {
      const phase = day < festival.day ? 'before' : day === festival.day ? 'during' : 'after';
      return { festival, phase };
    }
  }
  
  return null;
}
