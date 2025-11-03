# 🌟 Vibee OS Advanced Features Documentation

This document covers the three advanced features that make Vibee OS uniquely powerful for emotional wellness.

---

## 🌈 Feature 1: Mood Flow

### Overview
Mood Flow enables instant feed re-ranking when a user's emotional state changes, creating a seamless, adaptive experience.

### How It Works

#### 1. Mood Tracking
```typescript
// Uses useMoodFlow hook
const { currentMood, previousMood, isTransitioning, changeMood } = useMoodFlow();
```

**Tracked Data:**
- Current emotional state
- Previous mood for context
- Mood transition history
- Transition timestamps
- Most common mood patterns

#### 2. Instant Re-Ranking
When mood changes:
1. **Transition Animation** (300ms) - Smooth visual feedback
2. **Feed API Call** - Fetches new personalized ranking
3. **Zone Reorganization** - Content redistributed across 3 zones
4. **Smooth Render** - Animated entrance of new content

#### 3. Visual Feedback
```
User clicks "Change Mood" → Sad → Happy
↓
"✨ Refreshing your feed for your new vibe..." appears
↓
Feed fades out → API call → Feed fades in with new ranking
↓
Emoji animates with spring physics
↓
Shows "Previously: Sad" under current mood
```

### Technical Implementation

**Hook: `src/hooks/useMoodFlow.ts`**
```typescript
export function useMoodFlow(initialMood: EmotionCategory | null = null) {
  const [currentMood, setCurrentMood] = useState<EmotionCategory | null>(initialMood);
  const [previousMood, setPreviousMood] = useState<EmotionCategory | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodTransition[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Tracks transitions and provides mood patterns
  const changeMood = useCallback((newMood: EmotionCategory | null) => {
    // Creates smooth 300ms transition
    // Logs mood change in history
    // Updates state
  });

  const getMoodPattern = useCallback(() => {
    // Analyzes last 5 mood transitions
    // Returns most common pattern (e.g., "Sad → Chill → Happy")
  });
}
```

**Component: `src/components/SmartVibeFeed.tsx`**
- Integrates mood flow hook
- Triggers feed refresh on mood change
- Shows transition animations
- Displays mood journey insights

### User Benefits

1. **Instant Adaptation** - Feed updates in real-time as emotions shift
2. **Visual Continuity** - Smooth animations prevent jarring changes
3. **Pattern Recognition** - Users see their emotional journey
4. **Contextual Content** - Always relevant to current state

### Example Use Cases

**Scenario 1: Morning → Afternoon Shift**
```
Morning: User wakes up "Tired/Chill"
→ Feed shows: Relaxing vibes, morning thoughts, calm content

Lunch: Energy spike → Changes to "Motivated"
→ Feed instantly shows: Goal-oriented posts, success stories, energetic vibes
```

**Scenario 2: Stress → Relief**
```
User feeling "Angry" after difficult meeting
→ Feed shows: Relatable stress posts, venting vibes

Takes walk, mood improves to "Chill"
→ Feed shifts to: Peaceful vibes, nature posts, calming music
```

---

## 🧩 Feature 2: Vibe Memory

### Overview
Vibe Memory is an intelligent system that tracks how users interact with emotional content, building a personalized understanding of what helps them.

### How It Works

#### 1. Interaction Tracking
```typescript
export type EmotionalInteraction = {
  vibeId: string;
  emotion: EmotionCategory;
  interactionType: 'view' | 'react' | 'comment' | 'skip';
  duration: number;  // Time spent viewing
  timestamp: Date;
  userMoodAtTime: EmotionCategory;  // User's mood during interaction
  helpfulness: 'helpful' | 'neutral' | 'unhelpful';
};
```

**Tracked Behaviors:**
- **View Duration** - How long user viewed each vibe
- **Reactions** - Which emotions they reacted to
- **Comments** - What they engaged with
- **Skips** - What they avoided
- **Mood Context** - User's emotional state during interaction

#### 2. Pattern Analysis
The system builds emotional profiles:

```typescript
export type VibeMemory = {
  userId: string;
  interactions: EmotionalInteraction[];
  emotionPatterns: Record<EmotionCategory, {
    mostEngagedContent: string[];      // Vibe IDs they engaged with most
    averageDuration: number;           // Average time spent viewing
    preferredHealing: EmotionCategory[]; // What emotions helped when in this mood
    skipPatterns: string[];            // Content types they avoid
  }>;
  lastUpdated: Date;
};
```

#### 3. Personalization Engine
Uses memory to:
- Boost vibes similar to previously engaged content
- Surface healing emotions that worked before
- Avoid content patterns user skips
- Optimize future feed rankings

### Technical Implementation

**Hook: `src/hooks/useVibeMemory.ts`**
```typescript
export function useVibeMemory(userId: string | null) {
  const [memory, setMemory] = useState<VibeMemory | null>(null);

  // Track interactions
  const trackInteraction = useCallback(async (
    vibeId: string,
    emotion: EmotionCategory,
    interactionType: 'view' | 'react' | 'comment' | 'skip',
    duration: number,
    userMoodAtTime: EmotionCategory,
    helpfulness: 'helpful' | 'neutral' | 'unhelpful'
  ) => {
    // Saves to Firestore 'vibeMemory' collection
    // Analyzes patterns in real-time
    // Updates personalization data
  });

  // Get actionable insights
  const getInsights = useCallback(() => {
    return {
      totalInteractions,
      averageSessionDuration,
      mostEngagedEmotion,
      emotionDistribution,
      patterns: memory.emotionPatterns,
    };
  });
}
```

**Storage: Firestore Collection `vibeMemory`**
```javascript
{
  userId: "user123",
  interactions: [...],
  emotionPatterns: {
    "Sad": {
      mostEngagedContent: ["vibe456", "vibe789"],
      averageDuration: 45000,  // 45 seconds
      preferredHealing: ["Happy", "Motivated"],
      skipPatterns: ["Angry"]
    },
    "Happy": {
      mostEngagedContent: ["vibe123"],
      averageDuration: 30000,
      preferredHealing: [],
      skipPatterns: ["Sad"]
    }
  },
  lastUpdated: "2025-11-03T10:30:00Z"
}
```

### Example Patterns

**Pattern 1: Healing Discovery**
```
User feels "Sad" → Engages with "Motivated" vibes (60s avg duration)
System learns: When sad, show more motivational content
Next time sad: Motivational vibes boosted in Healing Zone
```

**Pattern 2: Skip Patterns**
```
User feels "Chill" → Consistently skips "Angry" vibes (<3s duration)
System learns: Avoid angry content when user is chill
Future feeds: Angry vibes filtered when chill
```

**Pattern 3: Time of Day Preferences**
```
Morning sessions: Engages with "Motivated" (avg 50s)
Evening sessions: Engages with "Chill" (avg 70s)
System learns: Optimize timing-based recommendations
```

### User Benefits

1. **Adaptive Learning** - App gets smarter over time
2. **Personalized Healing** - Discovers what actually helps each user
3. **Reduced Noise** - Automatically filters unhelpful content
4. **Emotional Insights** - Users understand their patterns

---

## 🔮 Feature 3: Weekly AI Reflection

### Overview
Every week, Vibee OS uses AI to analyze your emotional journey and generate compassionate, personalized insights.

### How It Works

#### 1. Data Collection (7 Days)
System tracks:
- All vibes shared (emotions + content)
- Mood transitions (how emotions changed)
- Engagement patterns (what resonated)
- Helpful content (what aided healing)

#### 2. AI Analysis (Google Gemini 2.0)
```typescript
const prompt = `
You are a compassionate AI emotional wellness companion.

User's emotional week:
📊 Emotions: Sad (3x), Happy (2x), Motivated (5x)
🔄 Transitions: Sad → Chill → Motivated → Happy
💫 Engaged with: Motivational quotes, success stories
❤️ What helped: Happy and Motivated content when feeling Sad

Generate a warm, personal reflection that:
1. Summarizes emotional journey with empathy
2. Identifies patterns without judgment
3. Celebrates growth moments
4. Notes what helped heal
5. Offers encouragement
6. Rates emotional connection (0-10)
`;
```

#### 3. Output Generation
```typescript
export type WeeklyReflectionOutput = {
  summary: string;  // "This week you showed incredible resilience..."
  emotionalPattern: string;  // "You tend to move from sadness to motivation..."
  growthMoments: string[];  // ["You reached out when lonely", ...]
  healingInsights: string[];  // ["Motivational content helped when sad", ...]
  encouragement: string;  // "Keep embracing your emotional journey..."
  dominantEmotions: string[];  // ["Motivated", "Happy", "Sad"]
  connectionScore: number;  // 8/10
};
```

### Technical Implementation

**AI Flow: `src/ai/flows/generate-weekly-reflection.ts`**
```typescript
const generateWeeklyReflectionFlow = ai.defineFlow({
  name: 'generateWeeklyReflection',
  inputSchema: WeeklyReflectionInputSchema,
  outputSchema: WeeklyReflectionOutputSchema,
}, async (input) => {
  // Analyzes weekly data
  // Generates compassionate insights
  // Returns structured reflection
});
```

**API: `src/app/api/reflection/weekly/route.ts`**
1. Fetches last 7 days of vibes for user
2. Aggregates emotional data
3. Pulls Vibe Memory patterns
4. Calls AI to generate reflection
5. Returns personalized insights

**Component: `src/components/WeeklyReflection.tsx`**
- Auto-generates on Sundays
- Beautiful gradient card design
- Visualizes connection score
- Shows growth moments
- Displays healing insights

### Example Reflection

```
🧠 Your Weekly Reflection
November 3, 2025

Summary:
This week was a journey of transformation. You started feeling lonely and 
uncertain, but you didn't give up. By mid-week, you shifted into motivation 
and ended with genuine happiness. That shows incredible emotional resilience.

📊 Emotional Pattern:
You tend to process difficult emotions (Sad, Lonely) early in the week, 
then actively work toward uplifting states (Motivated, Happy). This shows 
healthy emotional self-regulation.

Dominant Emotions: Motivated, Happy, Sad

✨ Growth Moments:
• You reached out when feeling lonely instead of isolating
• You shared your wins when motivated, inspiring others
• You acknowledged sadness without judgment

❤️ What Helped You:
• Motivational quotes helped shift from sadness to action
• Success stories from others gave you hope
• Anonymous sharing allowed vulnerability

💫 Looking Ahead:
Your emotional awareness is a superpower. Keep honoring all your feelings 
while trusting your ability to move toward light. The community sees your 
strength, even when you don't.

Emotional Connection Score: ██████████ 8/10
```

### Reflection Triggers

1. **Automatic** - Every Sunday at midnight
2. **Manual** - "Generate Reflection" button
3. **Cached** - One reflection per day max (stored in localStorage)

### User Benefits

1. **Self-Awareness** - See emotional patterns clearly
2. **Validation** - AI acknowledges all feelings
3. **Growth Tracking** - Celebrate progress
4. **Healing Discovery** - Learn what works
5. **Encouragement** - Weekly motivation boost

---

## 🔄 How Features Work Together

### Example User Journey

**Monday Morning:**
- User posts "Feeling lonely" → Sad emotion
- **Vibe Memory** tracks: Sad + Monday AM pattern

**Monday Afternoon:**
- **Mood Flow**: Changes mood to "Motivated"
- Feed instantly re-ranks
- **Smart Algorithm**: Shows healing content based on Vibe Memory
- User engages with motivational vibe (70s duration)
- **Vibe Memory** learns: Motivated content helps when sad

**Friday Evening:**
- User feels sad again
- **Smart Algorithm** + **Vibe Memory**: Boosts motivational content
- Shows similar vibes to Monday (because they helped)
- User recovers faster due to personalized healing

**Sunday:**
- **Weekly Reflection** generated
- Shows pattern: "You use motivation to heal sadness"
- Celebrates: "You've discovered what works for you"
- Encourages: "Keep using this powerful pattern"

### Synergy

1. **Mood Flow** provides instant adaptation
2. **Vibe Memory** learns from each interaction
3. **Algorithm** uses memory to personalize
4. **Weekly Reflection** surfaces insights
5. **User** gains self-awareness
6. **Cycle repeats** with improved outcomes

---

## 📊 Performance Metrics

### Mood Flow
- Transition time: **300ms**
- Feed refresh: **<2 seconds**
- Animation duration: **0.5 seconds**
- Total UX time: **<3 seconds**

### Vibe Memory
- Interaction logging: **<100ms**
- Pattern analysis: **Instant** (client-side)
- Firestore sync: **Background** (non-blocking)
- Memory size: **~5KB per user**

### Weekly Reflection
- Generation time: **3-8 seconds**
- API calls: **1 per week per user**
- Cache duration: **24 hours**
- Token usage: **~1000 tokens**

---

## 🎯 Future Enhancements

### Potential Additions

1. **Mood Flow+**
   - Predict next mood based on patterns
   - Suggest proactive content before mood changes
   - Multi-day mood tracking visualization

2. **Vibe Memory+**
   - Share anonymous patterns with research
   - Group-level emotional insights
   - Personalized vibe recommendations

3. **Weekly Reflection+**
   - Monthly summaries
   - Yearly emotional retrospectives
   - Exportable PDF reflections
   - Voice narration of insights

4. **Cross-Feature**
   - Mood Flow triggered by Vibe Memory insights
   - Weekly Reflection influences algorithm weights
   - Memory-based mood prediction

---

## 🛠️ Developer Notes

### Adding New Interaction Types

Edit `src/hooks/useVibeMemory.ts`:
```typescript
export type EmotionalInteraction = {
  // ... existing fields
  interactionType: 'view' | 'react' | 'comment' | 'skip' | 'share' | 'save';  // Add new types
  // Add new tracking fields as needed
};
```

### Customizing Reflection Prompts

Edit `src/ai/flows/generate-weekly-reflection.ts`:
```typescript
const prompt = `
// Modify AI instructions here
// Adjust tone, focus areas, output format
`;
```

### Tuning Mood Flow Animations

Edit `src/components/SmartVibeFeed.tsx`:
```typescript
const handleMoodChange = (newMood) => {
  changeMood(newMood);
  
  // Adjust transition timing
  setTimeout(() => {
    setCurrentMood(newMood);
  }, 500);  // Change from 300ms to 500ms for slower transition
};
```

---

## ✅ Testing Checklist

### Mood Flow
- [ ] Mood changes trigger feed refresh
- [ ] Transition animation plays smoothly
- [ ] Previous mood shown correctly
- [ ] Emoji animates on change
- [ ] Mood pattern displayed when returning to selector

### Vibe Memory
- [ ] Interactions logged to Firestore
- [ ] Patterns analyzed correctly
- [ ] Insights available via getInsights()
- [ ] Memory persists across sessions
- [ ] No duplicate interaction logging

### Weekly Reflection
- [ ] Generates on Sunday or manual trigger
- [ ] Shows all 7 output fields
- [ ] Connection score visualized correctly
- [ ] Cached for 24 hours
- [ ] Error handling works
- [ ] Beautiful UI rendering

---

These three features work in harmony to create a uniquely powerful emotional wellness platform. 💜
