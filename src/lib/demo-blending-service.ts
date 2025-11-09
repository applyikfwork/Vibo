import { demoDataService, EmotionWave } from './demo-data-service';
import { demoPersonaService, DemoPersona } from './demo-personas';
import { EmotionCategory, Vibe, Author, Location } from './types';
import { Timestamp } from 'firebase/firestore';

export type BlendingConfig = {
  realUserCount: number;
  totalVibesCount: number;
  city: string;
};

export type BlendingRatio = {
  demoPercentage: number;
  realPercentage: number;
  shouldShowDemo: boolean;
  demoVibeCount: number;
};

export type TimeBasedModifier = {
  volumeMultiplier: number; // 1.0 = normal, 0.2 = night reduction
  emotionBias: Record<EmotionCategory, number>; // 0-1 boost for certain emotions
};

export type ActivityMetrics = {
  vibesInLastHour: number;
  activeUsersEstimate: number;
  vibesPerMinute: number;
  totalVibesToday: number;
  peakHour: number;
  currentMood: EmotionCategory;
  trendingEmotions: { emotion: EmotionCategory; count: number; percentage: number }[];
};

export class DemoBlendingService {
  private static instance: DemoBlendingService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  private constructor() {}

  static getInstance(): DemoBlendingService {
    if (!this.instance) {
      this.instance = new DemoBlendingService();
    }
    return this.instance;
  }

  calculateBlendingRatio(config: BlendingConfig): BlendingRatio {
    const { realUserCount, totalVibesCount } = config;

    let demoPercentage: number;

    if (realUserCount < 10) {
      demoPercentage = 70;
    } else if (realUserCount < 50) {
      demoPercentage = 30;
    } else if (realUserCount < 200) {
      // Gradual fade from 30% to 0%
      demoPercentage = 30 * (1 - (realUserCount - 50) / 150);
    } else {
      demoPercentage = 0;
    }

    // Also check total vibes count
    if (totalVibesCount < 100) {
      demoPercentage = Math.max(demoPercentage, 50);
    } else if (totalVibesCount < 500) {
      demoPercentage = Math.max(demoPercentage, 20);
    }

    const shouldShowDemo = demoPercentage > 0;
    
    // Calculate demo vibes needed to achieve target percentage
    let demoVibeCount: number;
    
    if (demoPercentage === 0) {
      // No demo vibes needed
      demoVibeCount = 0;
    } else if (realUserCount === 0) {
      // Special case: No real users yet, show base demo count scaled by percentage
      // This ensures the page isn't empty when starting out
      demoVibeCount = Math.floor(100 * (demoPercentage / 100));
    } else if (demoPercentage >= 100) {
      // 100% demo means show demo regardless of real count
      demoVibeCount = 100;
    } else {
      // Proportional formula: D / (R + D) = X/100 → D = R * X / (100 - X)
      // Example: 5 real vibes, 70% target: D = 5 * 70 / 30 = 12 demo → 12/(5+12) = 70.6% ✓
      demoVibeCount = Math.round(realUserCount * demoPercentage / (100 - demoPercentage));
    }

    return {
      demoPercentage,
      realPercentage: 100 - demoPercentage,
      shouldShowDemo,
      demoVibeCount,
    };
  }

  getTimeBasedModifier(): TimeBasedModifier {
    const hour = new Date().getHours();
    const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6;

    let volumeMultiplier = 1.0;
    const emotionBias: Partial<Record<EmotionCategory, number>> = {};

    // Peak hours: 8-10 AM, 1-2 PM, 6-9 PM
    if ((hour >= 8 && hour <= 10) || (hour >= 13 && hour <= 14) || (hour >= 18 && hour <= 21)) {
      volumeMultiplier = 1.5;
    }
    // Night reduction: 11 PM - 6 AM (80% fewer)
    else if (hour >= 23 || hour <= 6) {
      volumeMultiplier = 0.2;
    }
    // Regular hours
    else {
      volumeMultiplier = 1.0;
    }

    // Morning (6-10 AM): More Motivated, Chill
    if (hour >= 6 && hour < 10) {
      emotionBias['Motivated'] = 1.5;
      emotionBias['Chill'] = 1.3;
      emotionBias['Happy'] = 1.2;
    }
    // Lunch time (12-2 PM): More Happy
    else if (hour >= 12 && hour < 14) {
      emotionBias['Happy'] = 1.6;
      emotionBias['Chill'] = 1.3;
    }
    // Evening (6-9 PM): Mixed emotions
    else if (hour >= 18 && hour < 21) {
      emotionBias['Chill'] = 1.5;
      emotionBias['Happy'] = 1.3;
      emotionBias['Funny'] = 1.2;
    }
    // Late night (9 PM - 12 AM): Reflective
    else if (hour >= 21) {
      emotionBias['Chill'] = 1.4;
      emotionBias['Lonely'] = 1.2;
      emotionBias['Sad'] = 1.1;
    }

    // Weekend patterns: More relaxed/happy vibes
    if (isWeekend) {
      emotionBias['Happy'] = (emotionBias['Happy'] || 1) * 1.3;
      emotionBias['Chill'] = (emotionBias['Chill'] || 1) * 1.2;
      emotionBias['Family Bonding'] = 1.5;
      emotionBias['Festival Joy'] = 1.3;
      // Reduce work-related stress
      emotionBias['Career Anxiety'] = 0.5;
      emotionBias['Exam Stress'] = 0.7;
    }

    return {
      volumeMultiplier,
      emotionBias: emotionBias as Record<EmotionCategory, number>,
    };
  }

  generateEnhancedDemoVibes(
    city: string,
    config: BlendingConfig,
    realVibes: Vibe[] = []
  ): Vibe[] {
    const cacheKey = `enhanced-vibes-${city}-${config.realUserCount}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const blendingRatio = this.calculateBlendingRatio(config);
    if (!blendingRatio.shouldShowDemo) {
      return [];
    }

    const timeModifier = this.getTimeBasedModifier();
    const adjustedCount = Math.floor(blendingRatio.demoVibeCount * timeModifier.volumeMultiplier);

    // Get personas for this city
    const personas = demoPersonaService.getPersonasByCity(city);
    if (personas.length === 0) {
      // Fallback to basic demo data
      return demoDataService.generateDemoVibesForCity(city, adjustedCount) as Vibe[];
    }

    const vibes: Vibe[] = [];
    const now = Date.now();
    const currentHour = new Date().getHours();

    // Distribute vibes across personas based on their activity patterns
    const activePersonas = personas.filter(p =>
      demoPersonaService.shouldPersonaPostNow(p, currentHour)
    );

    // If no one should post now, use random selection with lower count
    const selectedPersonas = activePersonas.length > 0
      ? activePersonas
      : personas.slice(0, Math.ceil(personas.length * 0.3));

    for (let i = 0; i < adjustedCount; i++) {
      const persona = this.getWeightedRandomPersona(selectedPersonas, timeModifier);
      if (!persona) continue;

      // Select emotion based on persona's range and time bias
      const emotion = this.selectEmotionWithBias(
        persona.traits.emotionalRange,
        timeModifier.emotionBias
      );

      const vibe = this.generateVibeFromPersona(persona, emotion, city, i, adjustedCount, currentHour);
      vibes.push(vibe);
    }

    // Sort by recency
    const sortedVibes = vibes.sort((a, b) => {
      const aTime = a.createdAt as Timestamp;
      const bTime = b.createdAt as Timestamp;
      return bTime.toMillis() - aTime.toMillis();
    });

    this.setCached(cacheKey, sortedVibes, this.CACHE_TTL);
    return sortedVibes;
  }

  private getWeightedRandomPersona(personas: DemoPersona[], timeModifier: TimeBasedModifier): DemoPersona | null {
    if (personas.length === 0) return null;

    // Weight by activity level and last active time
    const weights = personas.map(p => {
      const recentActivityBoost = p.lastActiveHoursAgo < 6 ? 2 : 1;
      return p.traits.activityLevel * recentActivityBoost;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < personas.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return personas[i];
      }
    }

    return personas[0];
  }

  private selectEmotionWithBias(
    emotionalRange: EmotionCategory[],
    bias: Record<EmotionCategory, number>
  ): EmotionCategory {
    const weights = emotionalRange.map(emotion => {
      const baseBias = bias[emotion] || 1.0;
      return baseBias;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < emotionalRange.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return emotionalRange[i];
      }
    }

    return emotionalRange[0];
  }

  private generateVibeFromPersona(
    persona: DemoPersona,
    emotion: EmotionCategory,
    city: string,
    index: number,
    total: number,
    currentHour: number
  ): Vibe {
    const cityConfig = demoDataService.getCityConfig(city);
    if (!cityConfig) {
      throw new Error(`City ${city} not found in demo configuration`);
    }

    // Find location that matches persona's favorite locations
    const matchingLocations = cityConfig.locations.filter(loc =>
      persona.favoriteLocations.includes(loc.type)
    );

    const location = matchingLocations.length > 0
      ? matchingLocations[Math.floor(Math.random() * matchingLocations.length)]
      : cityConfig.locations[Math.floor(Math.random() * cityConfig.locations.length)];

    // Get realistic vibe text for this emotion
    const text = demoDataService.getRandomElement(
      this.getVibeTextsForEmotion(emotion)
    );

    // Generate realistic timestamp
    const ageHours = this.getRealisticAge(index, total, currentHour);
    const createdAt = new Date(Date.now() - ageHours * 3600000);

    // Small random offset for location
    const randomOffset = () => (Math.random() - 0.5) * 0.015;

    return {
      id: `demo-vibe-${persona.id}-${Date.now()}-${index}`,
      userId: persona.id,
      text,
      emoji: this.getEmojiForEmotion(emotion),
      emotion,
      backgroundColor: this.getColorForEmotion(emotion),
      timestamp: Timestamp.fromDate(createdAt),
      createdAt: Timestamp.fromDate(createdAt),
      author: {
        name: persona.name,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.avatarSeed}`,
      },
      isAnonymous: false,
      viewCount: Math.floor(Math.random() * 50),
      location: {
        lat: location.lat + randomOffset(),
        lng: location.lng + randomOffset(),
        city: cityConfig.city,
        state: cityConfig.state,
        country: 'India',
      },
      isDemo: true,
      reactionCount: Math.floor(Math.random() * 15),
      commentCount: Math.floor(Math.random() * 5),
    } as Vibe;
  }

  private getRealisticAge(index: number, total: number, currentHour: number): number {
    const recencyBias = Math.random();

    // 40% within 2 hours
    if (recencyBias < 0.4) {
      return Math.random() * 2;
    }
    // 30% within 2-6 hours
    else if (recencyBias < 0.7) {
      return 2 + Math.random() * 4;
    }
    // 20% within 6-18 hours
    else if (recencyBias < 0.9) {
      return 6 + Math.random() * 12;
    }
    // 10% within 18-48 hours
    else {
      return 18 + Math.random() * 30;
    }
  }

  private getVibeTextsForEmotion(emotion: EmotionCategory): string[] {
    // Import from existing demo-data-service or define here
    const DEMO_TEXTS: Record<EmotionCategory, string[]> = {
      'Happy': [
        'Such a beautiful day! Feeling grateful 💛',
        'Just got some amazing news! Life is good ✨',
        'Coffee tastes better when you\'re surrounded by good vibes ☕',
        'Loving the energy here today!',
        'Finally finished that project! Time to celebrate 🎉',
      ],
      'Chill': [
        'Just taking it easy, watching the world go by 🌿',
        'Perfect weather for a peaceful moment',
        'Found my zen spot for the day 🧘',
        'No rush, just vibes',
        'Needed this calm after a busy week',
      ],
      'Motivated': [
        'Ready to crush today\'s goals! 💪',
        'Feeling unstoppable right now',
        'New week, new opportunities!',
        'This is going to be my best week yet',
        'Let\'s get it done! 🚀',
      ],
      'Exam Stress': [
        'Finals week is killing me but we got this 📚',
        'Just need to survive these exams',
        'Coffee and textbooks - my new best friends',
        'One more exam to go!',
        'Study grind never stops',
      ],
      'Sad': [
        'Having one of those days...',
        'Sometimes you just need a moment',
        'Hope tomorrow is better',
        'Feeling a bit down but it\'s okay to not be okay',
        'Taking time to heal',
      ],
      'Lonely': [
        'Could use some company right now',
        'Missing my friends today',
        'Anyone else feeling this?',
        'Just me and my thoughts',
        'Sometimes being alone is hard',
      ],
      'Angry': [
        'Really frustrated right now',
        'Need to vent somewhere safe',
        'Taking deep breaths...',
        'Why is today so difficult?',
        'Working through some anger',
      ],
      'Neutral': [
        'Just another day',
        'Going with the flow',
        'Feeling pretty balanced today',
        'Nothing special, just existing',
        'Normal vibes',
      ],
      'Funny': [
        'Just witnessed the funniest thing! 😂',
        'Can\'t stop laughing at this',
        'Life is too short not to laugh',
        'Comedy gold happened here!',
        'Needed this laugh today',
      ],
      'Festival Joy': [
        'Festival vibes are unmatched! 🎊',
        'Loving these celebrations!',
        'Family, food, and festivities ✨',
        'This is what festivals are all about',
        'Best time of the year!',
      ],
      'Missing Home': [
        'Missing home food right now',
        'Can\'t wait to visit family',
        'Homesickness hitting hard today',
        'Nothing beats home',
        'Counting days until I go home',
      ],
      'Wedding Excitement': [
        'Wedding season is here! 💍',
        'So many celebrations this month',
        'Dancing all night! 💃',
        'Best wedding ever!',
        'Love is in the air',
      ],
      'Religious Peace': [
        'Found peace in prayers today 🙏',
        'Spiritual vibes here',
        'Feeling blessed',
        'Temple visit = soul reset',
        'Divine energy all around',
      ],
      'Family Bonding': [
        'Quality time with family ❤️',
        'These moments are precious',
        'Family is everything',
        'Making memories with loved ones',
        'Best feeling is being with family',
      ],
      'Career Anxiety': [
        'Imposter syndrome hitting hard',
        'Job stress is real',
        'Trying to figure out my career path',
        'Work pressure is intense today',
        'Anyone else feeling the work anxiety?',
      ],
      'Festive Nostalgia': [
        'Remembering festivals from childhood',
        'Missing the old celebration days',
        'Nostalgia is beautiful and painful',
        'Wish I could go back to those times',
        'Sweet memories of past festivals',
      ],
    };

    return DEMO_TEXTS[emotion] || ['Feeling ' + emotion.toLowerCase()];
  }

  private getEmojiForEmotion(emotion: EmotionCategory): string {
    const emojiMap: Record<EmotionCategory, string> = {
      'Happy': '😊',
      'Sad': '😢',
      'Chill': '😌',
      'Motivated': '💪',
      'Lonely': '😔',
      'Angry': '😠',
      'Neutral': '😐',
      'Funny': '😂',
      'Festival Joy': '🎉',
      'Missing Home': '🏠',
      'Exam Stress': '📚',
      'Wedding Excitement': '💍',
      'Religious Peace': '🙏',
      'Family Bonding': '❤️',
      'Career Anxiety': '💼',
      'Festive Nostalgia': '🎊',
    };
    return emojiMap[emotion] || '😊';
  }

  private getColorForEmotion(emotion: EmotionCategory): string {
    const colorMap: Record<EmotionCategory, string> = {
      'Happy': '#FEF3C7',
      'Sad': '#DBEAFE',
      'Chill': '#D1FAE5',
      'Motivated': '#FED7AA',
      'Lonely': '#E0E7FF',
      'Angry': '#FEE2E2',
      'Neutral': '#F3F4F6',
      'Funny': '#FCE7F3',
      'Festival Joy': '#FEF3C7',
      'Missing Home': '#E0E7FF',
      'Exam Stress': '#DBEAFE',
      'Wedding Excitement': '#FCE7F3',
      'Religious Peace': '#F3E8FF',
      'Family Bonding': '#FED7AA',
      'Career Anxiety': '#FEE2E2',
      'Festive Nostalgia': '#FEF3C7',
    };
    return colorMap[emotion] || '#F3F4F6';
  }

  calculateActivityMetrics(vibes: Vibe[], city: string): ActivityMetrics {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const vibesInLastHour = vibes.filter(v => {
      const timestamp = v.createdAt || v.timestamp;
      const time = timestamp.toMillis();
      return time >= oneHourAgo;
    }).length;

    const vibesToday = vibes.filter(v => {
      const timestamp = v.createdAt || v.timestamp;
      const time = timestamp.toMillis();
      return time >= oneDayAgo;
    }).length;

    // Estimate active users (30% of personas + variance)
    const personas = demoPersonaService.getPersonasByCity(city);
    const activeUsersEstimate = Math.floor(personas.length * 0.3 * (0.8 + Math.random() * 0.4));

    const vibesPerMinute = vibesInLastHour > 0 ? (vibesInLastHour / 60).toFixed(1) : '0.0';

    // Find peak hour from vibes
    const hourCounts: Record<number, number> = {};
    vibes.forEach(v => {
      const timestamp = v.createdAt || v.timestamp;
      const hour = new Date(timestamp.toMillis()).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 12;

    // Calculate trending emotions
    const emotionCounts: Record<string, number> = {};
    vibes.forEach(v => {
      emotionCounts[v.emotion] = (emotionCounts[v.emotion] || 0) + 1;
    });

    const trendingEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion: emotion as EmotionCategory,
        count,
        percentage: (count / vibes.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const currentMood = trendingEmotions[0]?.emotion || 'Happy';

    return {
      vibesInLastHour,
      activeUsersEstimate,
      vibesPerMinute: parseFloat(vibesPerMinute),
      totalVibesToday: vibesToday,
      peakHour: parseInt(peakHour as string),
      currentMood,
      trendingEmotions,
    };
  }

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCached(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}

export const demoBlendingService = DemoBlendingService.getInstance();
