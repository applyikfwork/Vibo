# 🚀 Vibee OS Setup Instructions

Complete setup guide for running Vibee OS with all advanced features enabled.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project created
- Google Cloud project with Gemini API access
- Git installed

---

## 🔑 Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### 1. Firebase Client Configuration (Public)
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**How to get these:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click the web app config icon
6. Copy all the config values

---

### 2. Firebase Admin SDK (Private - Server Only)
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**How to get these:**
1. Go to Firebase Console
2. Project Settings > Service Accounts
3. Click "Generate New Private Key"
4. Download the JSON file
5. Extract `private_key` and `client_email` from the JSON
6. **Important**: Replace all `\n` in the private key with actual newlines in your .env file OR keep them as `\n` (the code handles this)

**Why needed:** Required for Smart Feed Algorithm API to:
- Read user profiles and mood history
- Track vibe interactions
- Generate personalized feed rankings
- Store Vibe Memory data

---

### 3. Google Generative AI (Gemini)
```env
GOOGLE_GENAI_API_KEY=your-gemini-api-key
```

**How to get this:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

**Why needed:** Powers AI features:
- Emotion strength analysis (sentiment intensity)
- Weekly emotional reflections
- Vibe diagnosis and categorization

---

## 📦 Installation Steps

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd vibee-os
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
# Then edit .env.local with your actual keys
```

### 3. Set Up Firebase

#### Create Firestore Collections:
Your app needs these collections (they'll be created automatically on first use):
- `users` - User profiles with mood tracking
- `vibes` - User posts/vibes
- `all-vibes` - Global feed of all vibes
- `vibeMemory` - Emotional interaction patterns
- `reactions` - Vibe reactions
- `comments` - Vibe comments

#### Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /vibes/{vibeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    match /all-vibes/{vibeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /vibeMemory/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /reactions/{reactionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Run Development Server
```bash
npm run dev
```

The app will start on http://localhost:5000

---

## 🧪 Testing the Features

### Test 1: Basic Feed
1. Sign in with Firebase Authentication
2. Post a vibe with any emotion
3. See it appear in the Classic Feed

### Test 2: Smart Feed Algorithm
1. Click "Smart Feed" button
2. Select your current mood
3. See feed reorganized into 3 zones:
   - My Vibe Zone (matching emotions)
   - Healing Zone (complementary emotions)
   - Explore Vibes (trending content)

### Test 3: Mood Flow
1. In Smart Feed, select a mood (e.g., "Sad")
2. View the feed
3. Click "Change Mood" and select different emotion (e.g., "Happy")
4. Watch the feed instantly re-rank with smooth animations
5. Notice "Previously: Sad" shown under current mood

### Test 4: Vibe Memory
- Interact with vibes (view, react, comment)
- Memory system tracks your emotional patterns
- Used to personalize future recommendations
- Check browser console for tracking confirmations

### Test 5: Weekly Reflection
1. Use the app for a week, sharing different emotions
2. On Sunday, or click "Generate Reflection" button
3. See AI-generated insights about your emotional journey
4. View:
   - Emotional summary
   - Growth moments
   - What helped you heal
   - Encouragement for the week ahead
   - Connection score visualization

---

## 🚨 Troubleshooting

### Smart Feed Not Working

**Error: "Failed to initialize Firebase Admin"**
```
Solution: Check FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in .env.local
Make sure the private key includes the full BEGIN/END markers
```

**Error: "Failed to fetch feed"**
```
Solution: 
1. Check that Firebase Admin SDK is properly initialized
2. Verify Firestore security rules allow read access
3. Check browser console for detailed error messages
```

### AI Features Not Working

**Error: "Failed to analyze emotion strength"**
```
Solution: Verify GOOGLE_GENAI_API_KEY is set correctly
Check your Google Cloud quota limits
```

**Weekly Reflection not generating**
```
Solution:
1. Make sure you've shared at least one vibe in the past week
2. Check GOOGLE_GENAI_API_KEY is valid
3. View API logs in browser console for specific errors
```

### Feed Algorithm Issues

**Vibes not ranked correctly**
```
Check:
1. User has posted vibes with different emotions
2. Current mood is selected
3. Firebase has mood history in user profile
4. Check /api/feed response in Network tab
```

**Boost triggers not activating**
```
Verify:
1. Posts have sufficient reactions/comments
2. User mood history exists (for emotional_balance boost)
3. Anonymous posts are properly tagged
```

---

## 🎯 Feature Checklist

Use this to verify all features are working:

### Core Features
- [ ] User authentication (Firebase Auth)
- [ ] Post vibes with emotions
- [ ] View Classic Feed (chronological)
- [ ] View Smart Feed (algorithm-powered)
- [ ] React to vibes
- [ ] Comment on vibes
- [ ] Anonymous posting

### Algorithm Features
- [ ] Emotion matching (ERS calculation)
- [ ] Smart Vibe Zones (3-layer feed)
- [ ] Post boost system (all 5 triggers)
- [ ] Time decay system
- [ ] Adaptive learning (affinity scores)

### Advanced Features
- [ ] 🌈 Mood Flow - Instant re-ranking on mood change
- [ ] 🧩 Vibe Memory - Pattern tracking and storage
- [ ] 🔮 Weekly Reflection - AI-generated insights

### UI/UX
- [ ] Smooth animations (Framer Motion)
- [ ] Emotion-specific colors and gradients
- [ ] Mood transition animations
- [ ] Loading states and skeletons
- [ ] Error handling with user-friendly messages

---

## 📊 Monitoring & Analytics

### Check Algorithm Performance

**API Response Time:**
Open browser DevTools > Network tab
Filter: `/api/feed`
Check response time (should be < 2 seconds)

**Feed Quality:**
- Posts should be relevant to selected mood
- Healing Zone should show uplifting content
- Explore Zone should have variety

**User Engagement:**
Monitor in Firestore:
- Reaction counts increasing
- Comment engagement
- View duration data

---

## 🔐 Security Best Practices

1. **Never commit .env.local** - Already in .gitignore
2. **Use Firebase Security Rules** - Restrict data access
3. **Validate API inputs** - Server-side validation in place
4. **Rate limiting** - Consider adding to production
5. **Private keys** - Keep FIREBASE_PRIVATE_KEY secure

---

## 🚀 Production Deployment

### Replit Deployment

1. **Add Secrets** (not environment variables!)
   - Go to Replit Secrets panel
   - Add all environment variables listed above
   - Secrets are encrypted and not visible in code

2. **Configure Deployment**
   ```bash
   # Deployment is already configured in the project
   # Just click "Deploy" button in Replit
   ```

3. **Post-Deployment Checklist**
   - [ ] Test user authentication
   - [ ] Verify Smart Feed works
   - [ ] Test Weekly Reflection generation
   - [ ] Check Firebase Admin access
   - [ ] Monitor error logs

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard
# Settings > Environment Variables
```

---

## 📖 Additional Resources

- **Algorithm Documentation**: `/docs/VIBEE_FEED_ALGORITHM.md`
- **Project Documentation**: `/replit.md`
- **Firebase Docs**: https://firebase.google.com/docs
- **Genkit AI**: https://firebase.google.com/docs/genkit
- **Next.js**: https://nextjs.org/docs

---

## 💡 Tips for Best Experience

1. **Create Test Data**: Share vibes with different emotions to see algorithm in action
2. **Use Different Moods**: Switch moods frequently to test Mood Flow
3. **Engage with Content**: React and comment to build Vibe Memory
4. **Weekly Reflections**: Use app daily for a week to get meaningful insights
5. **Monitor Console**: Keep DevTools open during testing to see tracking

---

## 🎨 Customization

### Modify Algorithm Weights
Edit `/src/lib/feed-algorithm.ts`:
```typescript
// Change VibeScore formula weights
const vibeScore = 
  (ers * 0.5) +          // Emotion relevance
  (reactions * 0.2) +    // Social proof
  (freshness * 0.15) +   // Recency
  (engagement * 0.1) +   // Engagement time
  (diversity * 0.05) +   // Content variety
  boostScore;            // Boost triggers
```

### Adjust Boost Triggers
Edit `/src/lib/feed-algorithm.ts` - `calculateBoostScore()`:
```typescript
// Modify boost conditions and scores
if (commentCount >= 5) boostScore += 0.2;  // Support boost
if (ageMinutes < 10 && reactionCount >= 3) boostScore += 0.3;  // Energy boost
```

### Change Zone Sizes
Edit `/src/lib/feed-algorithm.ts` - `classifyIntoZones()`:
```typescript
myVibeZone: rankedVibes.slice(0, 5),      // Show 5 instead of 3
healingZone: rankedVibes.slice(5, 10),    // Show 5 instead of 3
exploreZone: rankedVibes.slice(10, 15),   // Show 5 instead of 4
```

---

## 🎉 You're All Set!

Your Vibee OS is now fully configured with:
- ✅ Smart Feed Algorithm
- ✅ AI-Powered Emotion Analysis
- ✅ Mood Flow System
- ✅ Vibe Memory Tracking
- ✅ Weekly Reflections

Enjoy building emotional connections! 💜
