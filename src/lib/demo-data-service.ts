import { EmotionCategory, Location, Vibe, Author } from './types';
import { Timestamp } from 'firebase/firestore';

export type DemoVibeConfig = {
  city: string;
  state: string;
  locations: DemoLocation[];
};

export type DemoLocation = {
  name: string;
  type: 'college' | 'cafe' | 'park' | 'mall' | 'office' | 'temple' | 'gym' | 'library' | 'metro' | 'beach';
  lat: number;
  lng: number;
  timePatterns: {
    hour: number;
    emotions: { emotion: EmotionCategory; weight: number }[];
  }[];
};

export type EmotionWave = {
  id: string;
  title: string;
  description: string;
  emotion: EmotionCategory;
  city: string;
  startTime: Date;
  intensity: number;
  affectedAreas: string[];
};

const INDIAN_CITIES_DEMO_CONFIG: DemoVibeConfig[] = [
  {
    city: 'Delhi',
    state: 'Delhi',
    locations: [
      {
        name: 'Delhi University North Campus',
        type: 'college',
        lat: 28.6873,
        lng: 77.2096,
        timePatterns: [
          {
            hour: 9,
            emotions: [
              { emotion: 'Motivated', weight: 0.5 },
              { emotion: 'Exam Stress', weight: 0.3 },
              { emotion: 'Happy', weight: 0.2 }
            ]
          },
          {
            hour: 14,
            emotions: [
              { emotion: 'Chill', weight: 0.4 },
              { emotion: 'Funny', weight: 0.3 },
              { emotion: 'Motivated', weight: 0.3 }
            ]
          },
          {
            hour: 20,
            emotions: [
              { emotion: 'Happy', weight: 0.4 },
              { emotion: 'Chill', weight: 0.4 },
              { emotion: 'Lonely', weight: 0.2 }
            ]
          }
        ]
      },
      {
        name: 'Connaught Place',
        type: 'mall',
        lat: 28.6315,
        lng: 77.2167,
        timePatterns: [
          {
            hour: 12,
            emotions: [
              { emotion: 'Happy', weight: 0.6 },
              { emotion: 'Chill', weight: 0.4 }
            ]
          },
          {
            hour: 19,
            emotions: [
              { emotion: 'Happy', weight: 0.7 },
              { emotion: 'Motivated', weight: 0.3 }
            ]
          }
        ]
      },
      {
        name: 'Lodhi Gardens',
        type: 'park',
        lat: 28.5933,
        lng: 77.2197,
        timePatterns: [
          {
            hour: 7,
            emotions: [
              { emotion: 'Chill', weight: 0.7 },
              { emotion: 'Motivated', weight: 0.3 }
            ]
          },
          {
            hour: 18,
            emotions: [
              { emotion: 'Chill', weight: 0.8 },
              { emotion: 'Religious Peace', weight: 0.2 }
            ]
          }
        ]
      },
      {
        name: 'Cyber Hub Gurugram',
        type: 'office',
        lat: 28.4950,
        lng: 77.0890,
        timePatterns: [
          {
            hour: 10,
            emotions: [
              { emotion: 'Motivated', weight: 0.5 },
              { emotion: 'Career Anxiety', weight: 0.3 },
              { emotion: 'Happy', weight: 0.2 }
            ]
          },
          {
            hour: 15,
            emotions: [
              { emotion: 'Career Anxiety', weight: 0.4 },
              { emotion: 'Motivated', weight: 0.3 },
              { emotion: 'Chill', weight: 0.3 }
            ]
          }
        ]
      }
    ]
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    locations: [
      {
        name: 'Marine Drive',
        type: 'beach',
        lat: 18.9432,
        lng: 72.8236,
        timePatterns: [
          {
            hour: 6,
            emotions: [
              { emotion: 'Chill', weight: 0.6 },
              { emotion: 'Motivated', weight: 0.4 }
            ]
          },
          {
            hour: 18,
            emotions: [
              { emotion: 'Chill', weight: 0.5 },
              { emotion: 'Happy', weight: 0.3 },
              { emotion: 'Religious Peace', weight: 0.2 }
            ]
          }
        ]
      },
      {
        name: 'BKC Business District',
        type: 'office',
        lat: 19.0653,
        lng: 72.8687,
        timePatterns: [
          {
            hour: 11,
            emotions: [
              { emotion: 'Motivated', weight: 0.6 },
              { emotion: 'Career Anxiety', weight: 0.4 }
            ]
          },
          {
            hour: 16,
            emotions: [
              { emotion: 'Career Anxiety', weight: 0.5 },
              { emotion: 'Motivated', weight: 0.5 }
            ]
          }
        ]
      },
      {
        name: 'Powai Lake',
        type: 'park',
        lat: 19.1197,
        lng: 72.9058,
        timePatterns: [
          {
            hour: 7,
            emotions: [
              { emotion: 'Chill', weight: 0.7 },
              { emotion: 'Motivated', weight: 0.3 }
            ]
          },
          {
            hour: 17,
            emotions: [
              { emotion: 'Chill', weight: 0.6 },
              { emotion: 'Happy', weight: 0.4 }
            ]
          }
        ]
      }
    ]
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    locations: [
      {
        name: 'Koramangala Cafes',
        type: 'cafe',
        lat: 12.9352,
        lng: 77.6245,
        timePatterns: [
          {
            hour: 10,
            emotions: [
              { emotion: 'Motivated', weight: 0.5 },
              { emotion: 'Happy', weight: 0.3 },
              { emotion: 'Chill', weight: 0.2 }
            ]
          },
          {
            hour: 16,
            emotions: [
              { emotion: 'Chill', weight: 0.5 },
              { emotion: 'Happy', weight: 0.5 }
            ]
          }
        ]
      },
      {
        name: 'Whitefield Tech Parks',
        type: 'office',
        lat: 12.9698,
        lng: 77.7499,
        timePatterns: [
          {
            hour: 11,
            emotions: [
              { emotion: 'Motivated', weight: 0.6 },
              { emotion: 'Career Anxiety', weight: 0.4 }
            ]
          },
          {
            hour: 14,
            emotions: [
              { emotion: 'Chill', weight: 0.5 },
              { emotion: 'Motivated', weight: 0.5 }
            ]
          }
        ]
      },
      {
        name: 'Cubbon Park',
        type: 'park',
        lat: 12.9763,
        lng: 77.5928,
        timePatterns: [
          {
            hour: 7,
            emotions: [
              { emotion: 'Chill', weight: 0.8 },
              { emotion: 'Motivated', weight: 0.2 }
            ]
          },
          {
            hour: 17,
            emotions: [
              { emotion: 'Chill', weight: 0.7 },
              { emotion: 'Happy', weight: 0.3 }
            ]
          }
        ]
      }
    ]
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    locations: [
      {
        name: 'FC Road',
        type: 'college',
        lat: 18.5314,
        lng: 73.8446,
        timePatterns: [
          {
            hour: 10,
            emotions: [
              { emotion: 'Happy', weight: 0.5 },
              { emotion: 'Motivated', weight: 0.3 },
              { emotion: 'Exam Stress', weight: 0.2 }
            ]
          },
          {
            hour: 20,
            emotions: [
              { emotion: 'Happy', weight: 0.6 },
              { emotion: 'Chill', weight: 0.4 }
            ]
          }
        ]
      },
      {
        name: 'Hinjewadi IT Park',
        type: 'office',
        lat: 18.5912,
        lng: 73.7396,
        timePatterns: [
          {
            hour: 12,
            emotions: [
              { emotion: 'Motivated', weight: 0.5 },
              { emotion: 'Career Anxiety', weight: 0.3 },
              { emotion: 'Chill', weight: 0.2 }
            ]
          }
        ]
      }
    ]
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    locations: [
      {
        name: 'HITEC City',
        type: 'office',
        lat: 17.4435,
        lng: 78.3772,
        timePatterns: [
          {
            hour: 11,
            emotions: [
              { emotion: 'Motivated', weight: 0.6 },
              { emotion: 'Career Anxiety', weight: 0.4 }
            ]
          },
          {
            hour: 15,
            emotions: [
              { emotion: 'Chill', weight: 0.5 },
              { emotion: 'Motivated', weight: 0.5 }
            ]
          }
        ]
      },
      {
        name: 'Hussain Sagar',
        type: 'park',
        lat: 17.4239,
        lng: 78.4738,
        timePatterns: [
          {
            hour: 18,
            emotions: [
              { emotion: 'Chill', weight: 0.7 },
              { emotion: 'Happy', weight: 0.3 }
            ]
          }
        ]
      }
    ]
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    locations: [
      {
        name: 'Marina Beach',
        type: 'beach',
        lat: 13.0499,
        lng: 80.2824,
        timePatterns: [
          {
            hour: 6,
            emotions: [
              { emotion: 'Chill', weight: 0.7 },
              { emotion: 'Religious Peace', weight: 0.3 }
            ]
          },
          {
            hour: 17,
            emotions: [
              { emotion: 'Happy', weight: 0.5 },
              { emotion: 'Chill', weight: 0.5 }
            ]
          }
        ]
      },
      {
        name: 'OMR IT Corridor',
        type: 'office',
        lat: 12.9121,
        lng: 80.2273,
        timePatterns: [
          {
            hour: 11,
            emotions: [
              { emotion: 'Motivated', weight: 0.6 },
              { emotion: 'Career Anxiety', weight: 0.4 }
            ]
          }
        ]
      }
    ]
  }
];

const DEMO_TEXTS: Record<EmotionCategory, string[]> = {
  'Happy': [
    'Such a beautiful day! Feeling grateful 💛',
    'Just got some amazing news! Life is good ✨',
    'Coffee tastes better when you\'re surrounded by good vibes ☕',
    'Loving the energy here today!',
    'Finally finished that project! Time to celebrate 🎉',
    'Today is absolutely amazing! Can\'t stop smiling 😊',
    'Just had the best conversation with a stranger ❤️',
    'This city never fails to surprise me with kindness',
    'Found my favorite spot to just be happy',
    'Sunshine and good vibes all around! ☀️',
    'Sometimes life just hits different in the best way',
    'Grateful for this moment right now 🙏',
    'The little things are making me so happy today',
    'Energy here is unmatched! Feeling blessed',
    'This place always lifts my spirits up'
  ],
  'Chill': [
    'Just taking it easy, watching the world go by 🌿',
    'Perfect weather for a peaceful moment',
    'Found my zen spot for the day 🧘',
    'No rush, just vibes',
    'Needed this calm after a busy week',
    'Peaceful evening with nature sounds 🍃',
    'Just me, my thoughts, and this beautiful view',
    'Taking a break from the chaos, feeling good',
    'Slow days are the best days honestly',
    'Found inner peace at this spot today',
    'Sometimes you just need to pause and breathe',
    'Loving this relaxed atmosphere here',
    'No stress, just existing in the moment',
    'This is my meditation space now',
    'Calm before the storm, but enjoying it'
  ],
  'Motivated': [
    'Ready to crush today\'s goals! 💪',
    'Feeling unstoppable right now',
    'New week, new opportunities!',
    'This is going to be my best week yet',
    'Let\'s get it done! 🚀',
    'Momentum is building, can feel it!',
    'Today is the day I make things happen',
    'Energy levels through the roof right now',
    'Nothing can stop me when I\'m in this zone',
    'Laser focused on my dreams today',
    'This is MY time to shine ✨',
    'Turning my vision into reality, one step at a time',
    'Hustling hard but loving every minute',
    'Inspiration just hit me like a wave',
    'Watch me work magic today! 🔥'
  ],
  'Exam Stress': [
    'Finals week is killing me but we got this 📚',
    'Just need to survive these exams',
    'Coffee and textbooks - my new best friends',
    'One more exam to go!',
    'Study grind never stops'
  ],
  'Sad': [
    'Having one of those days...',
    'Sometimes you just need a moment',
    'Hope tomorrow is better',
    'Feeling a bit down but it\'s okay to not be okay',
    'Taking time to heal'
  ],
  'Lonely': [
    'Could use some company right now',
    'Missing my friends today',
    'Anyone else feeling this?',
    'Just me and my thoughts',
    'Sometimes being alone is hard'
  ],
  'Angry': [
    'Really frustrated right now',
    'Need to vent somewhere safe',
    'Taking deep breaths...',
    'Why is today so difficult?',
    'Working through some anger'
  ],
  'Neutral': [
    'Just another day',
    'Going with the flow',
    'Feeling pretty balanced today',
    'Nothing special, just existing',
    'Normal vibes'
  ],
  'Funny': [
    'Just witnessed the funniest thing! 😂',
    'Can\'t stop laughing at this',
    'Life is too short not to laugh',
    'Comedy gold happened here!',
    'Needed this laugh today'
  ],
  'Festival Joy': [
    'Festival vibes are unmatched! 🎊',
    'Loving these celebrations!',
    'Family, food, and festivities ✨',
    'This is what festivals are all about',
    'Best time of the year!'
  ],
  'Missing Home': [
    'Missing home food right now',
    'Can\'t wait to visit family',
    'Homesickness hitting hard today',
    'Nothing beats home',
    'Counting days until I go home'
  ],
  'Wedding Excitement': [
    'Wedding season is here! 💍',
    'So many celebrations this month',
    'Dancing all night! 💃',
    'Best wedding ever!',
    'Love is in the air'
  ],
  'Religious Peace': [
    'Found peace in prayers today 🙏',
    'Spiritual vibes here',
    'Feeling blessed',
    'Temple visit = soul reset',
    'Divine energy all around'
  ],
  'Family Bonding': [
    'Quality time with family ❤️',
    'These moments are precious',
    'Family is everything',
    'Making memories with loved ones',
    'Best feeling is being with family'
  ],
  'Career Anxiety': [
    'Imposter syndrome hitting hard',
    'Job stress is real',
    'Trying to figure out my career path',
    'Work pressure is intense today',
    'Anyone else feeling the work anxiety?'
  ],
  'Festive Nostalgia': [
    'Remembering festivals from childhood',
    'Missing the old celebration days',
    'Nostalgia is beautiful and painful',
    'Wish I could go back to those times',
    'Sweet memories of past festivals'
  ]
};

const DEMO_AUTHOR_NAMES = [
  'Anonymous Viber',
  'GeoVibe Explorer',
  'City Wanderer',
  'Emotion Sharer',
  'Vibe Contributor',
  'Community Member',
  'Fellow Viber'
];

export class DemoDataService {
  private static instance: DemoDataService;
  
  static getInstance(): DemoDataService {
    if (!this.instance) {
      this.instance = new DemoDataService();
    }
    return this.instance;
  }

  getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  selectEmotionByWeight(emotions: { emotion: EmotionCategory; weight: number }[]): EmotionCategory {
    const total = emotions.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * total;
    
    for (const { emotion, weight } of emotions) {
      random -= weight;
      if (random <= 0) {
        return emotion;
      }
    }
    
    return emotions[0].emotion;
  }

  generateDemoVibesForCity(city: string, count: number = 80): Partial<Vibe>[] {
    const cityConfig = INDIAN_CITIES_DEMO_CONFIG.find(c => c.city === city);
    if (!cityConfig) return [];

    const currentHour = new Date().getHours();
    const vibes: Partial<Vibe>[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const location = this.getRandomElement(cityConfig.locations);
      
      const relevantPattern = location.timePatterns.find(p => 
        Math.abs(p.hour - currentHour) <= 3
      ) || this.getRandomElement(location.timePatterns);

      const emotion = this.selectEmotionByWeight(relevantPattern.emotions);
      const text = this.getRandomElement(DEMO_TEXTS[emotion]);

      const randomOffset = () => (Math.random() - 0.5) * 0.015;

      const ageHours = this.getRealisticAge(i, count, currentHour);
      const createdAt = new Date(now - ageHours * 3600000);

      vibes.push({
        text,
        emotion,
        isAnonymous: true,
        author: {
          name: this.getRandomElement(DEMO_AUTHOR_NAMES),
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
        },
        location: {
          lat: location.lat + randomOffset(),
          lng: location.lng + randomOffset(),
          city: cityConfig.city,
          state: cityConfig.state,
          country: 'India'
        },
        isDemo: true,
        createdAt: Timestamp.fromDate(createdAt)
      });
    }

    return vibes.sort((a, b) => {
      const aTime = a.createdAt as Timestamp;
      const bTime = b.createdAt as Timestamp;
      return bTime.toMillis() - aTime.toMillis();
    });
  }

  private getRealisticAge(index: number, total: number, currentHour: number): number {
    const recencyBias = Math.random();
    
    if (recencyBias < 0.4) {
      return Math.random() * 2;
    } else if (recencyBias < 0.7) {
      return 2 + Math.random() * 4;
    } else if (recencyBias < 0.9) {
      return 6 + Math.random() * 12;
    } else {
      return 18 + Math.random() * 30;
    }
  }

  generateEmotionWaves(city: string): EmotionWave[] {
    const waves: EmotionWave[] = [];
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 10) {
      waves.push({
        id: 'morning-motivation',
        title: 'Morning Motivation Wave',
        description: `Fresh energy spreading across ${city}!`,
        emotion: 'Motivated',
        city,
        startTime: new Date(),
        intensity: 0.7,
        affectedAreas: ['colleges', 'cafes', 'parks']
      });
    }

    if (hour >= 12 && hour < 15) {
      waves.push({
        id: 'lunch-happiness',
        title: 'Lunch Hour Joy',
        description: `Happy vibes dominating ${city} food spots!`,
        emotion: 'Happy',
        city,
        startTime: new Date(),
        intensity: 0.8,
        affectedAreas: ['cafes', 'malls', 'office areas']
      });
    }

    if (hour >= 17 && hour < 22) {
      waves.push({
        id: 'evening-calm',
        title: 'Evening Chill Wave',
        description: `Calm energy flowing through ${city} parks and beaches!`,
        emotion: 'Chill',
        city,
        startTime: new Date(),
        intensity: 0.9,
        affectedAreas: ['parks', 'beaches', 'lakes']
      });
    }

    if (hour >= 22 || hour < 2) {
      waves.push({
        id: 'night-mixed',
        title: 'Late Night Mixed Vibes',
        description: `${city} nightlife creating diverse emotional energy!`,
        emotion: 'Happy',
        city,
        startTime: new Date(),
        intensity: 0.6,
        affectedAreas: ['urban centers', 'cafes', 'malls']
      });
    }

    return waves;
  }

  shouldShowDemoData(realUserCount: number, totalVibesCount: number): boolean {
    if (realUserCount < 50) return true;
    if (totalVibesCount < 100) return true;
    
    const demoPercentage = Math.max(0, Math.min(100, 100 - (realUserCount * 2)));
    return Math.random() * 100 < demoPercentage;
  }

  getDemoDataMixRatio(realUserCount: number): number {
    if (realUserCount === 0) return 1.0;
    if (realUserCount >= 100) return 0;
    
    return Math.max(0, 1 - (realUserCount / 100));
  }

  getAllCities(): DemoVibeConfig[] {
    return INDIAN_CITIES_DEMO_CONFIG;
  }

  getCityConfig(city: string): DemoVibeConfig | undefined {
    return INDIAN_CITIES_DEMO_CONFIG.find(c => c.city === city);
  }

  getEmotionForecast(location: DemoLocation, targetHour: number): EmotionCategory {
    const pattern = location.timePatterns.find(p => p.hour === targetHour);
    if (!pattern) {
      return this.getRandomElement(['Happy', 'Chill', 'Neutral'] as EmotionCategory[]);
    }
    return this.selectEmotionByWeight(pattern.emotions);
  }
}

export const demoDataService = DemoDataService.getInstance();
