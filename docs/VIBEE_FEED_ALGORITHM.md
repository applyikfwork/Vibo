# 🧠 Vibee Feed Algorithm Documentation

## Overview

The Vibee Feed Algorithm is an emotion-based recommendation system that pushes **emotions that match or heal** the user's current vibe, instead of simply showing the most viral content. It shows "most emotionally relevant" posts that connect hearts.

## Architecture

### Core Components

1. **Data Models** (`src/lib/types.ts`)
   - Enhanced UserProfile with mood tracking
   - Enhanced Vibe with algorithm signals
   - Algorithm-specific types (FeedZone, RankedVibe, etc.)

2. **Feed Algorithm Engine** (`src/lib/feed-algorithm.ts`)
   - Emotion Relevance Score (ERS) calculation
   - Dynamic VibeScore formula
   - Smart Vibe Zones classification
   - Post Boost System
   - Decay system
   - Adaptive learning

3. **AI Components** (`src/ai/flows/`)
   - `diagnose-vibe.ts` - Emotion detection from text
   - `analyze-emotion-strength.ts` - Sentiment intensity analysis

4. **API Layer** (`src/app/api/feed/route.ts`)
   - Feed generation endpoint
   - Firebase integration
   - Real-time ranking

5. **UI Components** (`src/components/`)
   - `SmartVibeFeed.tsx` - Main feed display
   - Zone-based layout (My Vibe, Healing, Explore)

## Algorithm Stages

### Stage 1: Data Signals Captured

#### User Profile Signals
- `currentMood` - Selected vibe
- `moodHistory` - Last N posted vibes
- `interactionStyle` - Reaction patterns
- `averageSessionTime` - Engagement level
- `activeTimePreference` - Time of day preference
- `vibeAffinityScores` - Emotional preferences

#### Post Signals
- `emotionStrength` (0.9 weight) - AI sentiment intensity
- `reactionCount` (0.8 weight) - Total reactions
- `viewDuration` (0.5 weight) - Engagement time
- `commentCount` (0.6 weight) - Conversation level
- `freshness` (0.7 weight) - Post age
- `emotionMatchScore` (1.0 weight) - Viewer alignment

### Stage 2: Vibe Match Engine

**Emotion Relevance Score (ERS) Formula:**
```
ERS = (Emotion Match * 0.6) + (Emotion Complement * 0.4)
```

**Emotion Matching Rules:**
- **Perfect Match**: Same emotion = 1.0 ERS (relatable)
- **Complementary**: Healing emotions = 0.75 ERS (uplifting)
- **Opposite**: Contrasting emotions = 0.3 ERS (low relevance)

**Example Matches:**
| User Mood | Post Mood | ERS | Reason |
|-----------|-----------|-----|--------|
| Sad | Sad | 1.0 | Relatable |
| Sad | Motivated | 0.75 | Healing |
| Sad | Happy | 0.75 | Inspiring |
| Motivated | Angry | 0.3 | Negative contrast |

### Stage 3: Dynamic Feed Formula

**VibeScore Calculation:**
```
VibeScore = (ERS * 0.5) + 
            (Reactions * 0.2) + 
            (Freshness * 0.15) + 
            (EngagementTime * 0.1) + 
            (DiversityBoost * 0.05) +
            BoostScore
```

All posts are re-ranked dynamically every few minutes.

### Stage 4: Smart Vibe Zones

The feed is organized into three emotional layers:

1. **My Vibe Zone** (Top 3 posts)
   - Exact emotion match
   - Comfort and validation

2. **Healing Zone** (Next 3 posts)
   - Complementary emotions
   - Uplifting and inspiring

3. **Explore Vibes** (4 posts)
   - Trending global content
   - Emotional diversity

### Stage 5: Emotion Evolution Learning

**Vibe Pattern Graph:**
- Tracks mood transitions (e.g., Sad → Chill → Motivated)
- AI learns helpful content patterns
- Predicts next emotional stage
- Personalizes future recommendations

### Stage 6: Post Boost System

**Boost Triggers:**

| Type | Trigger Condition | Boost Score |
|------|------------------|-------------|
| ❤️ Support Boost | 5+ positive comments | +0.2 |
| 🔥 Energy Boost | 3+ reactions in first 10 mins | +0.3 |
| 💬 Conversation Boost | 3+ replies | +0.1 |
| 💫 Emotional Balance | Calming post after negative mood | +0.4 |
| 👥 Anonymous Compassion | 3+ comforting replies to anonymous | +0.25 |

### Stage 7: Cooldown & Decay System

**Decay Rules:**
- Posts decay after 24 hours
- Emotion-specific decay rates:
  - Sad/Lonely: 0.92-0.93 (slower decay)
  - Happy/Neutral: 0.90 (standard)
  - Motivated: 0.85 (faster decay)
  - Angry: 0.88 (moderate)

**Purpose:** Keep feed fresh while allowing empathy to spread

### Stage 8: Adaptive Learning

**VibeAffinityScore Updates:**
- View interaction: +0.02
- React interaction: +0.05
- Comment interaction: +0.10

These scores personalize future feed rankings.

### Stage 9: Bonus Features

#### 🌈 Mood Flow
- Instant feed re-ranking when mood changes
- Real-time emotional adaptation

#### 🧩 Vibe Memory
- Saves emotional response patterns
- Used for personalized reflections

#### 🔮 AI Reflection
- Weekly emotional insights
- Pattern recognition

## API Usage

### Generate Personalized Feed

**Endpoint:** `POST /api/feed`

**Request Body:**
```json
{
  "userId": "user123",
  "userMood": "Sad",
  "limit": 30
}
```

**Response:**
```json
{
  "success": true,
  "feed": [...],
  "zones": {
    "myVibeZone": [...],
    "healingZone": [...],
    "exploreZone": [...]
  },
  "metadata": {
    "totalVibes": 60,
    "rankedVibes": 30,
    "userMood": "Sad",
    "algorithm": "Vibee Feed Algorithm v1.0"
  }
}
```

## Environment Setup

### Required Environment Variables

For Firebase Admin (API functionality):
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Google AI (Genkit)

For emotion analysis:
```env
GOOGLE_GENAI_API_KEY=your-gemini-api-key
```

## UI Integration

### Using Smart Feed in Components

```tsx
import { SmartVibeFeed } from '@/components/SmartVibeFeed';

function MyPage() {
  return <SmartVibeFeed />;
}
```

### Toggling Between Smart and Classic Feed

The home page includes a toggle button to switch between:
- **Smart Feed** - Algorithm-powered emotional ranking
- **Classic Feed** - Traditional timestamp-based sorting

## Performance Considerations

1. **Caching**: Feed results can be cached for 2-5 minutes per user
2. **Batch Processing**: Reaction/comment counts fetched in parallel
3. **Progressive Loading**: Zones loaded incrementally
4. **Decay Updates**: Run periodically via background job

## Future Enhancements

Tasks 13-15 (Optional):
- [ ] Mood Flow instant re-ranking
- [ ] Vibe Memory system
- [ ] AI Reflection weekly insights

## Technical Flow Summary

1. User opens feed → selects current mood
2. System fetches user profile + mood history
3. Fetch all recent vibes from Firestore
4. Run AI sentiment analysis on posts
5. Calculate ERS for each post
6. Calculate VibeScore with all signals
7. Apply boosts and decay
8. Classify into 3 zones
9. Sort and display dynamically
10. Track engagement for learning

## Result

Vibee's feed feels **alive**:
- ✅ Personalized like Spotify emotions
- ✅ Reactive like TikTok's virality
- ✅ Compassionate like a friend

Users scroll not for entertainment — but for **emotional resonance, healing, and belonging**.
