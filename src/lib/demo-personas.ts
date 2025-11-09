import { EmotionCategory } from './types';

export type PersonalityTraits = {
  positivityLevel: number; // 0-1, how often they share happy vibes
  activityLevel: number; // 0-1, how frequently they post
  consistency: number; // 0-1, how regular their posting pattern is
  emotionalRange: EmotionCategory[]; // emotions they typically share
  supportiveness: number; // 0-1, how often they react to others
  preferredTimes: number[]; // hours of day they typically post (0-23)
};

export type DemoPersona = {
  id: string;
  name: string;
  username: string;
  avatarSeed: string;
  city: string;
  traits: PersonalityTraits;
  bio: string;
  age: number;
  occupation: 'student' | 'professional' | 'freelancer' | 'homemaker' | 'retired';
  joinedDaysAgo: number;
  totalVibesShared: number;
  favoriteLocations: string[]; // location names they frequent
  lastActiveHoursAgo: number;
};

// Realistic Indian names database
const INDIAN_FIRST_NAMES = {
  male: [
    'Arjun', 'Raj', 'Rohan', 'Amit', 'Rahul', 'Karan', 'Aditya', 'Vikram',
    'Sanjay', 'Ravi', 'Nikhil', 'Prateek', 'Siddharth', 'Akash', 'Varun',
    'Kabir', 'Dhruv', 'Arnav', 'Ayush', 'Vihaan', 'Aarav', 'Ishaan',
    'Krishna', 'Shiva', 'Aryan', 'Dev', 'Harsh', 'Pranav', 'Advait', 'Yash',
    'Tanish', 'Vivaan', 'Reyansh', 'Shivansh', 'Atharv', 'Aarush', 'Krish',
    'Daksh', 'Ojas', 'Veer', 'Rudra', 'Samar', 'Laksh', 'Parth', 'Aayan'
  ],
  female: [
    'Priya', 'Sneha', 'Anjali', 'Pooja', 'Kavya', 'Riya', 'Neha', 'Divya',
    'Swati', 'Shreya', 'Ananya', 'Ishita', 'Simran', 'Nidhi', 'Aditi',
    'Aisha', 'Diya', 'Aarohi', 'Anvi', 'Saanvi', 'Kiara', 'Pari',
    'Navya', 'Ira', 'Myra', 'Sara', 'Zara', 'Anika', 'Tara', 'Mira',
    'Roshni', 'Tanvi', 'Vidya', 'Meera', 'Sanya', 'Avni', 'Pihu',
    'Aadhya', 'Vanya', 'Shanaya', 'Larissa', 'Mahika', 'Nitya', 'Trisha', 'Khushi'
  ]
};

const INDIAN_LAST_NAMES = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Gupta', 'Joshi', 'Mehta',
  'Verma', 'Kapoor', 'Nair', 'Shah', 'Chopra', 'Malhotra', 'Rao', 'Iyer',
  'Bose', 'Desai', 'Pillai', 'Agarwal', 'Bansal', 'Saxena', 'Kulkarni', 'Menon',
  'Pandey', 'Ghosh', 'Jain', 'Chauhan', 'Srinivasan', 'Mishra', 'Das', 'Acharya',
  'Bhatt', 'Choudhury', 'Dutta', 'Ganguly', 'Khanna', 'Mukherjee', 'Nambiar', 'Shetty',
  'Sethi', 'Trivedi', 'Varma', 'Yadav', 'Zaveri', 'Krishnan', 'Venkatesh', 'Thakur'
];

const OCCUPATION_PATTERNS = {
  student: {
    preferredTimes: [8, 9, 14, 15, 20, 21, 22],
    emotionalRange: ['Happy', 'Motivated', 'Exam Stress', 'Chill', 'Funny', 'Lonely'] as EmotionCategory[],
    activityLevel: 0.7,
    locations: ['college', 'cafe', 'library', 'park']
  },
  professional: {
    preferredTimes: [7, 8, 13, 14, 18, 19, 20],
    emotionalRange: ['Motivated', 'Career Anxiety', 'Happy', 'Chill', 'Neutral'] as EmotionCategory[],
    activityLevel: 0.5,
    locations: ['office', 'cafe', 'mall', 'gym']
  },
  freelancer: {
    preferredTimes: [10, 11, 15, 16, 17, 21, 22],
    emotionalRange: ['Motivated', 'Happy', 'Chill', 'Career Anxiety', 'Neutral'] as EmotionCategory[],
    activityLevel: 0.6,
    locations: ['cafe', 'park', 'mall']
  },
  homemaker: {
    preferredTimes: [9, 10, 11, 15, 16, 19],
    emotionalRange: ['Happy', 'Family Bonding', 'Chill', 'Religious Peace', 'Festival Joy'] as EmotionCategory[],
    activityLevel: 0.4,
    locations: ['temple', 'mall', 'park']
  },
  retired: {
    preferredTimes: [6, 7, 8, 17, 18, 19],
    emotionalRange: ['Chill', 'Religious Peace', 'Happy', 'Family Bonding', 'Festive Nostalgia'] as EmotionCategory[],
    activityLevel: 0.3,
    locations: ['park', 'temple']
  }
};

const BIOS_BY_OCCUPATION = {
  student: [
    'Engineering student | Coffee addict ☕',
    'Medical student | Future doctor 🏥',
    'MBA aspirant | Hustling hard 💼',
    'Final year CS | Coding & vibing 💻',
    'College explorer | Living my best life ✨',
    'Student | Dreamer | Achiever 🎯',
    'Law student | Justice seeker ⚖️',
    'Design student | Creative soul 🎨',
    'Just trying to graduate 📚',
    'Student life = Best life 🎓'
  ],
  professional: [
    'Software Engineer | Tech enthusiast 💻',
    'Marketing Manager | Brand builder 📱',
    'Data Analyst | Numbers person 📊',
    'Product Manager | Problem solver 🚀',
    'HR Professional | People first 👥',
    'Financial Advisor | Money matters 💰',
    'Content Writer | Wordsmith ✍️',
    'UX Designer | User advocate 🎨',
    'Sales Executive | Deal closer 💼',
    'Consultant | Strategy expert 📈'
  ],
  freelancer: [
    'Freelance Designer | Creative nomad 🎨',
    'Independent Consultant | Own boss 💼',
    'Content Creator | Digital storyteller 📸',
    'Freelance Writer | Word wanderer ✍️',
    'Photography enthusiast | Capturing moments 📷',
    'Digital Marketer | Growth hacker 📱',
    'Graphic Designer | Visual thinker 🖼️',
    'Video Editor | Frame by frame 🎬',
    'Web Developer | Code artist 💻',
    'Social Media Manager | Community builder 📲'
  ],
  homemaker: [
    'Homemaker | Family first ❤️',
    'Mom of 2 | Life juggler 👨‍👩‍👧‍👦',
    'Home chef | Cooking with love 🍳',
    'Family caretaker | Heart of home 🏠',
    'Homemaker | Finding joy in little things ✨',
    'Mother | Teacher | Friend 💕',
    'Managing home | Managing heart ❤️',
    'Kitchen queen | Recipe creator 👑',
    'Homemaker | Spreading happiness 😊',
    'Family manager | Love distributor 💝'
  ],
  retired: [
    'Retired teacher | Forever learning 📚',
    'Senior citizen | Young at heart ❤️',
    'Retired professional | Enjoying life 🌿',
    'Grandparent | Story teller 👴',
    'Retired | Traveling & exploring 🌍',
    'Senior | Wisdom sharer 🙏',
    'Retired banker | Numbers lover 📊',
    'Life lived | Memories made ✨',
    'Golden years | Golden vibes 🌟',
    'Retired engineer | Tinkering still 🔧'
  ]
};

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'];

export class DemoPersonaService {
  private static instance: DemoPersonaService;
  private personas: DemoPersona[] = [];

  private constructor() {
    this.generatePersonas();
  }

  static getInstance(): DemoPersonaService {
    if (!this.instance) {
      this.instance = new DemoPersonaService();
    }
    return this.instance;
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private generateName(): { firstName: string; lastName: string; gender: 'male' | 'female' } {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = this.getRandomElement(INDIAN_FIRST_NAMES[gender]);
    const lastName = this.getRandomElement(INDIAN_LAST_NAMES);
    return { firstName, lastName, gender };
  }

  private generatePersona(index: number): DemoPersona {
    const { firstName, lastName } = this.generateName();
    const occupation = this.getRandomElement(Object.keys(OCCUPATION_PATTERNS) as Array<keyof typeof OCCUPATION_PATTERNS>);
    const pattern = OCCUPATION_PATTERNS[occupation];
    const city = this.getRandomElement(CITIES);

    // Generate personality traits
    const positivityLevel = Math.random();
    const activityLevel = pattern.activityLevel + (Math.random() - 0.5) * 0.3;
    const consistency = Math.random();
    const supportiveness = Math.random();

    // Generate age based on occupation
    let age: number;
    switch (occupation) {
      case 'student':
        age = 18 + Math.floor(Math.random() * 7); // 18-24
        break;
      case 'professional':
        age = 25 + Math.floor(Math.random() * 20); // 25-44
        break;
      case 'freelancer':
        age = 22 + Math.floor(Math.random() * 23); // 22-44
        break;
      case 'homemaker':
        age = 25 + Math.floor(Math.random() * 30); // 25-54
        break;
      case 'retired':
        age = 60 + Math.floor(Math.random() * 15); // 60-74
        break;
    }

    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 99)}`;
    const joinedDaysAgo = Math.floor(Math.random() * 180); // 0-6 months
    const totalVibesShared = Math.floor(joinedDaysAgo * activityLevel * (0.5 + Math.random()));

    return {
      id: `demo-persona-${index}`,
      name: `${firstName} ${lastName}`,
      username,
      avatarSeed: `${username}-${index}`,
      city,
      traits: {
        positivityLevel,
        activityLevel: Math.max(0.1, Math.min(1, activityLevel)),
        consistency,
        emotionalRange: pattern.emotionalRange,
        supportiveness,
        preferredTimes: pattern.preferredTimes,
      },
      bio: this.getRandomElement(BIOS_BY_OCCUPATION[occupation]),
      age,
      occupation,
      joinedDaysAgo,
      totalVibesShared,
      favoriteLocations: pattern.locations,
      lastActiveHoursAgo: this.calculateLastActive(activityLevel),
    };
  }

  private calculateLastActive(activityLevel: number): number {
    // More active users were online more recently
    const maxHours = activityLevel > 0.7 ? 6 : activityLevel > 0.4 ? 24 : 72;
    return Math.random() * maxHours;
  }

  private generatePersonas(): void {
    const totalPersonas = 80 + Math.floor(Math.random() * 21); // 80-100 personas
    for (let i = 0; i < totalPersonas; i++) {
      this.personas.push(this.generatePersona(i));
    }
  }

  getAllPersonas(): DemoPersona[] {
    return this.personas;
  }

  getPersonasByCity(city: string): DemoPersona[] {
    return this.personas.filter(p => p.city === city);
  }

  getActivePersonas(city: string, maxHoursAgo: number = 24): DemoPersona[] {
    return this.personas.filter(
      p => p.city === city && p.lastActiveHoursAgo <= maxHoursAgo
    );
  }

  getPersonaById(id: string): DemoPersona | undefined {
    return this.personas.find(p => p.id === id);
  }

  getRandomPersona(city?: string): DemoPersona {
    const pool = city ? this.getPersonasByCity(city) : this.personas;
    return this.getRandomElement(pool);
  }

  getPersonasForEmotion(emotion: EmotionCategory, city?: string): DemoPersona[] {
    const pool = city ? this.getPersonasByCity(city) : this.personas;
    return pool.filter(p => p.traits.emotionalRange.includes(emotion));
  }

  shouldPersonaPostNow(persona: DemoPersona, currentHour: number): boolean {
    // Check if current hour matches their preferred times
    const isPreferredTime = persona.traits.preferredTimes.includes(currentHour);
    
    // Add randomness based on consistency and activity level
    const randomChance = Math.random();
    const threshold = persona.traits.consistency * persona.traits.activityLevel;
    
    return isPreferredTime && randomChance < threshold;
  }

  getPersonasLikelyToReact(city: string): DemoPersona[] {
    return this.getActivePersonas(city, 6)
      .filter(p => p.traits.supportiveness > 0.5)
      .sort((a, b) => b.traits.supportiveness - a.traits.supportiveness);
  }

  getTopContributors(city: string, limit: number = 10): DemoPersona[] {
    return this.getPersonasByCity(city)
      .sort((a, b) => b.totalVibesShared - a.totalVibesShared)
      .slice(0, limit);
  }

  getPersonaStats(city: string): {
    total: number;
    activeToday: number;
    students: number;
    professionals: number;
    avgVibesPerUser: number;
  } {
    const cityPersonas = this.getPersonasByCity(city);
    const activeToday = this.getActivePersonas(city, 24);
    const students = cityPersonas.filter(p => p.occupation === 'student').length;
    const professionals = cityPersonas.filter(p => p.occupation === 'professional').length;
    const totalVibes = cityPersonas.reduce((sum, p) => sum + p.totalVibesShared, 0);
    
    return {
      total: cityPersonas.length,
      activeToday: activeToday.length,
      students,
      professionals,
      avgVibesPerUser: cityPersonas.length > 0 ? totalVibes / cityPersonas.length : 0,
    };
  }

  refreshPersonaActivity(): void {
    // Update last active times for personas based on their activity patterns
    this.personas.forEach(persona => {
      const currentHour = new Date().getHours();
      if (this.shouldPersonaPostNow(persona, currentHour)) {
        persona.lastActiveHoursAgo = Math.random() * 2; // Active in last 2 hours
      } else {
        // Decay activity
        persona.lastActiveHoursAgo = Math.min(
          72,
          persona.lastActiveHoursAgo + Math.random() * 4
        );
      }
    });
  }

  simulatePersonaGrowth(daysElapsed: number): void {
    // Simulate personas posting more vibes over time
    this.personas.forEach(persona => {
      const newVibes = Math.floor(
        daysElapsed * persona.traits.activityLevel * (0.3 + Math.random() * 0.7)
      );
      persona.totalVibesShared += newVibes;
      persona.joinedDaysAgo += daysElapsed;
    });
  }
}

export const demoPersonaService = DemoPersonaService.getInstance();
