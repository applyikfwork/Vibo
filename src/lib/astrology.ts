import type { ZodiacSign, EmotionCategory, HinduMonth } from './types';

export type ZodiacInfo = {
  sign: ZodiacSign;
  emoji: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  rulingPlanet: string;
  dateRange: string;
  hindiName: string;
  traits: string[];
  emotionalStrengths: EmotionCategory[];
  spiritualColor: string;
  luckyDay: string;
};

export type SpiritualHealing = {
  emotion: EmotionCategory;
  mantra: string;
  mantraTranslation: string;
  meditation: string;
  breathingTechnique: string;
  mudra: string;
  spiritualAdvice: string;
};

export const zodiacData: Record<ZodiacSign, ZodiacInfo> = {
  Aries: {
    sign: 'Aries',
    emoji: '♈',
    element: 'Fire',
    rulingPlanet: 'Mars',
    dateRange: 'Mar 21 - Apr 19',
    hindiName: 'मेष',
    traits: ['Energetic', 'Courageous', 'Impulsive', 'Passionate'],
    emotionalStrengths: ['Motivated', 'Happy', 'Festival Joy'],
    spiritualColor: 'Red',
    luckyDay: 'Tuesday',
  },
  Taurus: {
    sign: 'Taurus',
    emoji: '♉',
    element: 'Earth',
    rulingPlanet: 'Venus',
    dateRange: 'Apr 20 - May 20',
    hindiName: 'वृषभ',
    traits: ['Reliable', 'Patient', 'Practical', 'Devoted'],
    emotionalStrengths: ['Chill', 'Family Bonding', 'Religious Peace'],
    spiritualColor: 'Green',
    luckyDay: 'Friday',
  },
  Gemini: {
    sign: 'Gemini',
    emoji: '♊',
    element: 'Air',
    rulingPlanet: 'Mercury',
    dateRange: 'May 21 - Jun 20',
    hindiName: 'मिथुन',
    traits: ['Adaptable', 'Curious', 'Social', 'Witty'],
    emotionalStrengths: ['Funny', 'Happy', 'Festival Joy'],
    spiritualColor: 'Yellow',
    luckyDay: 'Wednesday',
  },
  Cancer: {
    sign: 'Cancer',
    emoji: '♋',
    element: 'Water',
    rulingPlanet: 'Moon',
    dateRange: 'Jun 21 - Jul 22',
    hindiName: 'कर्क',
    traits: ['Emotional', 'Nurturing', 'Intuitive', 'Protective'],
    emotionalStrengths: ['Family Bonding', 'Religious Peace', 'Missing Home'],
    spiritualColor: 'Silver',
    luckyDay: 'Monday',
  },
  Leo: {
    sign: 'Leo',
    emoji: '♌',
    element: 'Fire',
    rulingPlanet: 'Sun',
    dateRange: 'Jul 23 - Aug 22',
    hindiName: 'सिंह',
    traits: ['Confident', 'Generous', 'Warm-hearted', 'Creative'],
    emotionalStrengths: ['Motivated', 'Happy', 'Wedding Excitement'],
    spiritualColor: 'Gold',
    luckyDay: 'Sunday',
  },
  Virgo: {
    sign: 'Virgo',
    emoji: '♍',
    element: 'Earth',
    rulingPlanet: 'Mercury',
    dateRange: 'Aug 23 - Sep 22',
    hindiName: 'कन्या',
    traits: ['Analytical', 'Practical', 'Loyal', 'Hardworking'],
    emotionalStrengths: ['Exam Stress', 'Career Anxiety', 'Motivated'],
    spiritualColor: 'Navy Blue',
    luckyDay: 'Wednesday',
  },
  Libra: {
    sign: 'Libra',
    emoji: '♎',
    element: 'Air',
    rulingPlanet: 'Venus',
    dateRange: 'Sep 23 - Oct 22',
    hindiName: 'तुला',
    traits: ['Diplomatic', 'Fair', 'Social', 'Gracious'],
    emotionalStrengths: ['Chill', 'Family Bonding', 'Wedding Excitement'],
    spiritualColor: 'Pink',
    luckyDay: 'Friday',
  },
  Scorpio: {
    sign: 'Scorpio',
    emoji: '♏',
    element: 'Water',
    rulingPlanet: 'Mars/Pluto',
    dateRange: 'Oct 23 - Nov 21',
    hindiName: 'वृश्चिक',
    traits: ['Passionate', 'Resourceful', 'Brave', 'Intense'],
    emotionalStrengths: ['Religious Peace', 'Festive Nostalgia', 'Motivated'],
    spiritualColor: 'Maroon',
    luckyDay: 'Tuesday',
  },
  Sagittarius: {
    sign: 'Sagittarius',
    emoji: '♐',
    element: 'Fire',
    rulingPlanet: 'Jupiter',
    dateRange: 'Nov 22 - Dec 21',
    hindiName: 'धनु',
    traits: ['Optimistic', 'Freedom-loving', 'Honest', 'Philosophical'],
    emotionalStrengths: ['Happy', 'Festival Joy', 'Funny'],
    spiritualColor: 'Purple',
    luckyDay: 'Thursday',
  },
  Capricorn: {
    sign: 'Capricorn',
    emoji: '♑',
    element: 'Earth',
    rulingPlanet: 'Saturn',
    dateRange: 'Dec 22 - Jan 19',
    hindiName: 'मकर',
    traits: ['Responsible', 'Disciplined', 'Self-controlled', 'Ambitious'],
    emotionalStrengths: ['Motivated', 'Career Anxiety', 'Exam Stress'],
    spiritualColor: 'Brown',
    luckyDay: 'Saturday',
  },
  Aquarius: {
    sign: 'Aquarius',
    emoji: '♒',
    element: 'Air',
    rulingPlanet: 'Saturn/Uranus',
    dateRange: 'Jan 20 - Feb 18',
    hindiName: 'कुंभ',
    traits: ['Progressive', 'Independent', 'Humanitarian', 'Original'],
    emotionalStrengths: ['Motivated', 'Happy', 'Family Bonding'],
    spiritualColor: 'Turquoise',
    luckyDay: 'Saturday',
  },
  Pisces: {
    sign: 'Pisces',
    emoji: '♓',
    element: 'Water',
    rulingPlanet: 'Jupiter/Neptune',
    dateRange: 'Feb 19 - Mar 20',
    hindiName: 'मीन',
    traits: ['Compassionate', 'Artistic', 'Intuitive', 'Gentle'],
    emotionalStrengths: ['Religious Peace', 'Chill', 'Festive Nostalgia'],
    spiritualColor: 'Sea Green',
    luckyDay: 'Thursday',
  },
};

export const spiritualHealingGuide: Record<EmotionCategory, SpiritualHealing> = {
  'Happy': {
    emotion: 'Happy',
    mantra: 'ॐ गं गणपतये नमः',
    mantraTranslation: 'Om Gam Ganapataye Namaha (Salutations to Lord Ganesha)',
    meditation: 'Gratitude meditation: Sit quietly and list 5 things you\'re grateful for',
    breathingTechnique: 'Smile Breath: Breathe in for 4 counts with a smile, hold for 4, exhale for 4',
    mudra: 'Anjali Mudra (Prayer hands) - brings balance and joy',
    spiritualAdvice: 'Share your happiness with others. Joy multiplies when shared.',
  },
  'Sad': {
    emotion: 'Sad',
    mantra: 'ॐ नमः शिवाय',
    mantraTranslation: 'Om Namah Shivaya (I bow to Lord Shiva)',
    meditation: 'Inner Light meditation: Visualize a warm, healing light filling your chest',
    breathingTechnique: 'Cooling Breath (Sheetali): Curl tongue, inhale through mouth, exhale through nose',
    mudra: 'Gyan Mudra (Touch thumb and index finger) - brings wisdom and calm',
    spiritualAdvice: 'This too shall pass. Like seasons, emotions change. Shiva transforms pain into strength.',
  },
  'Lonely': {
    emotion: 'Lonely',
    mantra: 'ॐ ह्रीं श्रीं लक्ष्मी भयो नमः',
    mantraTranslation: 'Om Hreem Shreem Lakshmi Bhayo Namaha (Divine abundance)',
    meditation: 'Heart Connection: Imagine golden threads connecting you to everyone you love',
    breathingTechnique: 'Heart-Centered Breathing: Place hand on heart, breathe deeply feeling connection',
    mudra: 'Hridaya Mudra (Touch ring and index fingers to thumb) - emotional balance',
    spiritualAdvice: 'You are never alone. The Divine resides within you. Connect inward first.',
  },
  'Motivated': {
    emotion: 'Motivated',
    mantra: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे',
    mantraTranslation: 'Om Aim Hreem Kleem Chamundaye Viche (Power of Goddess Durga)',
    meditation: 'Power Visualization: See yourself achieving your goals with divine support',
    breathingTechnique: 'Kapalabhati (Skull Shining): Forceful exhales, passive inhales - energizes',
    mudra: 'Prana Mudra (Touch pinky, ring fingers to thumb) - vitality and energy',
    spiritualAdvice: 'Channel your energy with focus. Like Arjuna\'s arrow, aim with devotion.',
  },
  'Angry': {
    emotion: 'Angry',
    mantra: 'ॐ शांति शांति शांतिः',
    mantraTranslation: 'Om Shanti Shanti Shantih (Peace, peace, peace)',
    meditation: 'Fire Transformation: Visualize anger as fire, then see it transform to pure light',
    breathingTechnique: 'Nadi Shodhana (Alternate nostril): Balances energy, calms anger',
    mudra: 'Shuni Mudra (Touch middle finger to thumb) - patience and discipline',
    spiritualAdvice: 'Anger is energy. Channel it like a warrior - not to destroy, but to protect.',
  },
  'Chill': {
    emotion: 'Chill',
    mantra: 'ॐ भूर्भुवः स्वः',
    mantraTranslation: 'Om Bhur Bhuvah Swaha (From the Gayatri Mantra - cosmic awareness)',
    meditation: 'Ocean Breath: Imagine you\'re floating peacefully in calm ocean waters',
    breathingTechnique: 'Ujjayi (Ocean Breath): Gentle constriction in throat, sounds like ocean',
    mudra: 'Dhyana Mudra (Both hands in lap, right on left) - deep meditation',
    spiritualAdvice: 'Peace is your natural state. Like still water reflects the moon perfectly.',
  },
  'Neutral': {
    emotion: 'Neutral',
    mantra: 'सो हम',
    mantraTranslation: 'So Ham (I am That - universal consciousness)',
    meditation: 'Witness meditation: Simply observe thoughts without judgment',
    breathingTechnique: 'Natural Breath Awareness: Just notice your breath without changing it',
    mudra: 'Chin Mudra (Index finger touches thumb, palm up) - receptivity',
    spiritualAdvice: 'In neutrality lies freedom. The mind is clear, ready for divine guidance.',
  },
  'Funny': {
    emotion: 'Funny',
    mantra: 'ॐ नमो हनुमते',
    mantraTranslation: 'Om Namo Hanumate (Salutations to Hanuman - joy and strength)',
    meditation: 'Laughter meditation: Remember something funny and let yourself laugh freely',
    breathingTechnique: 'Laughter Breath: Breathe in joy, exhale with laughter sounds',
    mudra: 'Kalesvara Mudra (Middle fingers touch, other fingers fold in) - calms thoughts',
    spiritualAdvice: 'Laughter is divine medicine. Krishna taught through play. Joy is worship.',
  },
  'Festival Joy': {
    emotion: 'Festival Joy',
    mantra: 'ॐ श्री महालक्ष्म्यै नमः',
    mantraTranslation: 'Om Shri Mahalakshmyai Namaha (Salutations to Goddess Lakshmi)',
    meditation: 'Celebration meditation: Visualize divine light in every diya, every color',
    breathingTechnique: 'Joyful Breathing: Deep inhale of celebration, exhale blessings',
    mudra: 'Lotus Mudra (Hands form lotus flower) - abundance and beauty',
    spiritualAdvice: 'Festivals remind us of divine presence in daily life. Celebrate with devotion.',
  },
  'Missing Home': {
    emotion: 'Missing Home',
    mantra: 'ॐ मातृ देवो भव',
    mantraTranslation: 'Om Matru Devo Bhava (Mother is divine)',
    meditation: 'Home Connection: Close eyes, see your home, feel the love surrounding it',
    breathingTechnique: 'Grounding Breath: Breathe in remembering home, exhale sending love there',
    mudra: 'Prithvi Mudra (Ring finger touches thumb) - grounding and stability',
    spiritualAdvice: 'Home is in your heart. Your loved ones feel your love across any distance.',
  },
  'Exam Stress': {
    emotion: 'Exam Stress',
    mantra: 'ॐ ऐं सरस्वत्यै नमः',
    mantraTranslation: 'Om Aim Saraswatyai Namaha (Salutations to Goddess Saraswati - wisdom)',
    meditation: 'Clarity meditation: Visualize white light clearing mental fog',
    breathingTechnique: '4-7-8 Breath: Inhale 4, hold 7, exhale 8 - reduces anxiety',
    mudra: 'Hakini Mudra (All fingertips touch) - enhances concentration and memory',
    spiritualAdvice: 'Saraswati blesses those who prepare with devotion. Trust your preparation.',
  },
  'Wedding Excitement': {
    emotion: 'Wedding Excitement',
    mantra: 'ॐ श्री गौरी शंकराभ्यां नमः',
    mantraTranslation: 'Om Shri Gauri Shankarabhyam Namaha (Divine union)',
    meditation: 'Sacred Union meditation: Visualize divine blessings on the couple',
    breathingTechnique: 'Heart Synchrony: Breathe thinking of love and partnership',
    mudra: 'Pushpanjali Mudra (Cupped hands like offering flowers) - devotion',
    spiritualAdvice: 'Marriage is a sacred bond. May Lord Shiva and Parvati bless with love and harmony.',
  },
  'Religious Peace': {
    emotion: 'Religious Peace',
    mantra: 'ॐ असतो मा सद्गमय',
    mantraTranslation: 'Om Asato Ma Sadgamaya (Lead me from unreal to real)',
    meditation: 'Divine Light meditation: Sit before deity/candle, absorb sacred energy',
    breathingTechnique: 'Devotional Breath: Breathe in divine grace, exhale surrender',
    mudra: 'Atmanjali Mudra (Hands in prayer at heart) - devotion and surrender',
    spiritualAdvice: 'In devotion, we find peace. The Divine is not distant but within your heart.',
  },
  'Family Bonding': {
    emotion: 'Family Bonding',
    mantra: 'ॐ सर्वे भवन्तु सुखिनः',
    mantraTranslation: 'Om Sarve Bhavantu Sukhinah (May all be happy)',
    meditation: 'Family Circle meditation: Visualize your family in a circle of golden light',
    breathingTechnique: 'Collective Breath: Breathe in family love, exhale gratitude',
    mudra: 'Varada Mudra (Palm facing out, fingers down) - giving and blessing',
    spiritualAdvice: 'Family is your first temple. Honor, cherish, and protect these sacred bonds.',
  },
  'Career Anxiety': {
    emotion: 'Career Anxiety',
    mantra: 'ॐ गं गणपतये नमः',
    mantraTranslation: 'Om Gam Ganapataye Namaha (Remover of obstacles)',
    meditation: 'Success Path meditation: See yourself walking confidently toward your goals',
    breathingTechnique: 'Confidence Breath: Inhale courage, exhale doubt',
    mudra: 'Kubera Mudra (Thumb, index, middle fingers touch) - manifesting goals',
    spiritualAdvice: 'Lord Ganesha removes obstacles for those who persevere. Trust the journey.',
  },
  'Festive Nostalgia': {
    emotion: 'Festive Nostalgia',
    mantra: 'ॐ भद्रं कर्णेभिः श्रुणुयाम देवाः',
    mantraTranslation: 'Om Bhadram Karnebhih Shrunuyama Devah (May we hear auspicious things)',
    meditation: 'Memory Palace: Revisit beautiful festival memories with gratitude',
    breathingTechnique: 'Sweet Memory Breath: Inhale past joy, exhale present gratitude',
    mudra: 'Ksepana Mudra (Index fingers point, other fingers interlaced) - releasing past',
    spiritualAdvice: 'Nostalgia is love for what was. Honor memories while embracing present moments.',
  },
};

export function getZodiacByBirthdate(month: number, day: number): ZodiacSign {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
}

export const hinduCalendarInfo = {
  auspiciousDays: [
    { day: 'Monday', deity: 'Lord Shiva', activity: 'Fasting, spiritual practices' },
    { day: 'Tuesday', deity: 'Hanuman/Ganesha', activity: 'Overcoming obstacles' },
    { day: 'Wednesday', deity: 'Lord Vishnu', activity: 'Learning, business' },
    { day: 'Thursday', deity: 'Guru (Jupiter)', activity: 'Education, wisdom seeking' },
    { day: 'Friday', deity: 'Goddess Lakshmi', activity: 'Wealth, relationships' },
    { day: 'Saturday', deity: 'Lord Shani', activity: 'Discipline, hard work' },
    { day: 'Sunday', deity: 'Surya (Sun God)', activity: 'Health, vitality' },
  ],
  
  tithis: {
    Poornima: { name: 'Poornima (Full Moon)', significance: 'Most auspicious for spiritual practices' },
    Amavasya: { name: 'Amavasya (New Moon)', significance: 'Ancestral worship, introspection' },
    Ekadashi: { name: 'Ekadashi', significance: 'Fasting, spiritual awakening' },
  },
};
