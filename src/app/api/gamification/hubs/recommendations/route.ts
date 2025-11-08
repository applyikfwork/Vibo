import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/firebase/admin';
import { EmotionCategory, CommunityHub, HubRecommendation } from '@/lib/types';

const COMMUNITY_HUBS: Omit<CommunityHub, 'memberCount' | 'topContributors' | 'recentActivityCount' | 'trendingScore'>[] = [
  {
    id: 'motivation-hub',
    name: 'Motivation Station',
    description: 'Share your drive and inspire others to achieve their goals',
    theme: 'Motivated' as EmotionCategory,
    icon: '💪'
  },
  {
    id: 'alone-zone',
    name: 'Alone Zone',
    description: 'A safe space for when you need solitude and understanding',
    theme: 'Lonely' as EmotionCategory,
    icon: '🌙'
  },
  {
    id: 'happy-vibes',
    name: 'Happy Vibes Only',
    description: 'Spread joy and celebrate the good moments',
    theme: 'Happy' as EmotionCategory,
    icon: '😊'
  },
  {
    id: 'study-support',
    name: 'Study Support',
    description: 'Students helping students through exam stress',
    theme: 'Exam Stress' as EmotionCategory,
    icon: '📚'
  },
  {
    id: 'chill-corner',
    name: 'Chill Corner',
    description: 'Relax, unwind, and share peaceful moments',
    theme: 'Chill' as EmotionCategory,
    icon: '🧘'
  }
];

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const joinedHubs = userData.joinedHubs || [];
    const currentMood = userData.currentMood as EmotionCategory | undefined;
    const vibeAffinityScores = userData.vibeAffinityScores || {};

    const recentVibesSnapshot = await db
      .collection('all-vibes')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(30)
      .get();

    const emotionFrequency: Record<string, number> = {};
    recentVibesSnapshot.docs.forEach(doc => {
      const emotion = doc.data().emotion;
      emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
    });

    const vibeMemoryDoc = await db.collection('vibeMemory').doc(userId).get();
    const vibeMemoryData = vibeMemoryDoc.exists ? vibeMemoryDoc.data() : null;
    const emotionPatterns = vibeMemoryData?.emotionPatterns || {};

    const recommendations: HubRecommendation[] = [];

    for (const hub of COMMUNITY_HUBS) {
      if (joinedHubs.includes(hub.id)) {
        continue;
      }

      let matchScore = 0;
      let emotionMatch = 0;
      const reasons: string[] = [];

      const hubEmotion = hub.theme;
      
      if (currentMood === hubEmotion) {
        matchScore += 40;
        emotionMatch += 40;
        reasons.push(`Matches your current ${currentMood} mood`);
      }

      const recentEmotionScore = emotionFrequency[hubEmotion] || 0;
      const totalRecentVibes = recentVibesSnapshot.docs.length;
      
      if (totalRecentVibes > 0) {
        const emotionMatchFromRecent = Math.min((recentEmotionScore / totalRecentVibes) * 100, 30);
        matchScore += emotionMatchFromRecent;
        emotionMatch += emotionMatchFromRecent;
        
        if (recentEmotionScore > 0) {
          reasons.push(`You've felt ${hubEmotion} ${recentEmotionScore} times recently`);
        }
      }

      const affinityScore = vibeAffinityScores[hubEmotion] || 0;
      const affinityMatchScore = Math.min(affinityScore * 20, 20);
      matchScore += affinityMatchScore;
      emotionMatch += affinityMatchScore;

      const patternEngagement = emotionPatterns[hubEmotion];
      if (patternEngagement) {
        const avgDuration = patternEngagement.averageDuration || 0;
        const helpfulRatio = patternEngagement.helpfulRatio || 0;
        
        if (avgDuration > 30) {
          matchScore += 10;
          reasons.push('You engage deeply with this emotion');
        }
        
        if (helpfulRatio > 0.5) {
          matchScore += 10;
          reasons.push('You find this emotion helpful');
        }
      }

      const membersSnapshot = await db
        .collection('users')
        .where('joinedHubs', 'array-contains', hub.id)
        .count()
        .get();
      
      const memberCount = membersSnapshot.data().count;

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentActivitySnapshot = await db
        .collection('all-vibes')
        .where('emotion', '==', hubEmotion)
        .where('timestamp', '>', twentyFourHoursAgo)
        .count()
        .get();
      
      const recentActivityCount = recentActivitySnapshot.data().count;
      const activityLevel: 'high' | 'medium' | 'low' = 
        recentActivityCount > 20 ? 'high' : 
        recentActivityCount > 10 ? 'medium' : 'low';

      if (activityLevel === 'high') {
        matchScore += 5;
        reasons.push('Very active community');
      }

      if (memberCount > 50 && memberCount < 200) {
        matchScore += 5;
        reasons.push('Growing community');
      }

      if (matchScore < 10) {
        const boostNeeded = 10 - matchScore;
        matchScore += boostNeeded;
        if (reasons.length === 0) {
          reasons.push('Discover a new community');
        }
      }

      if (matchScore >= 10) {
        recommendations.push({
          hub: {
            ...hub,
            memberCount,
            topContributors: [],
            recentActivityCount
          },
          matchScore,
          reasons: reasons.length > 0 ? reasons : ['Explore this growing community'],
          emotionMatch,
          activityLevel
        });
      }
    }

    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendations = recommendations.slice(0, 3);

    return NextResponse.json({
      recommendations: topRecommendations,
      totalAnalyzed: COMMUNITY_HUBS.length - joinedHubs.length
    });

  } catch (error: any) {
    console.error('Error generating hub recommendations:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
