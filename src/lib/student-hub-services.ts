import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export interface StudentProfile {
  userId: string;
  examStressModeEnabled: boolean;
  studyBreakRemindersEnabled: boolean;
  linkedParentEmail?: string;
  lastStressVibeTimestamp?: Timestamp;
  stressVibeCount: number;
  totalStudyTime: number;
  lastBreakTimestamp?: Timestamp;
  currentMoodTrend: 'improving' | 'stable' | 'struggling';
  weeklyMoodSummary: {
    happy: number;
    stressed: number;
    sad: number;
    motivated: number;
  };
}

export interface StudyBreakReminder {
  userId: string;
  timestamp: Timestamp;
  durationMinutes: number;
  taken: boolean;
}

export interface PeerSupportCircle {
  circleId: string;
  students: string[];
  topic: 'exam-stress' | 'career-anxiety' | 'general-support';
  createdAt: Timestamp;
  isActive: boolean;
}

export class StudentHubService {
  constructor(private firestore: Firestore) {}

  // Exam Stress Mode Functions
  async enableExamStressMode(userId: string): Promise<void> {
    const profileRef = doc(this.firestore, 'student-profiles', userId);
    await updateDoc(profileRef, {
      examStressModeEnabled: true,
      lastUpdated: serverTimestamp(),
    });
  }

  async disableExamStressMode(userId: string): Promise<void> {
    const profileRef = doc(this.firestore, 'student-profiles', userId);
    await updateDoc(profileRef, {
      examStressModeEnabled: false,
      lastUpdated: serverTimestamp(),
    });
  }

  async trackStressVibe(userId: string): Promise<void> {
    const profileRef = doc(this.firestore, 'student-profiles', userId);
    const now = Timestamp.now();
    
    await updateDoc(profileRef, {
      lastStressVibeTimestamp: now,
      stressVibeCount: (await this.getStressVibeCount(userId)) + 1,
    });
  }

  async getStressVibeCount(userId: string): Promise<number> {
    const vibesRef = collection(this.firestore, 'all-vibes');
    const q = query(
      vibesRef,
      where('userId', '==', userId),
      where('emotion', '==', 'Exam Stress'),
      where('timestamp', '>=', Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)))
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Study Break Reminder Functions
  async enableStudyBreakReminders(userId: string): Promise<void> {
    const profileRef = doc(this.firestore, 'student-profiles', userId);
    await updateDoc(profileRef, {
      studyBreakRemindersEnabled: true,
      lastUpdated: serverTimestamp(),
    });
  }

  async disableStudyBreakReminders(userId: string): Promise<void> {
    const profileRef = doc(this.firestore, 'student-profiles', userId);
    await updateDoc(profileRef, {
      studyBreakRemindersEnabled: false,
      lastUpdated: serverTimestamp(),
    });
  }

  async checkIfBreakNeeded(userId: string): Promise<boolean> {
    const vibesRef = collection(this.firestore, 'all-vibes');
    const twoHoursAgo = Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000));
    
    const q = query(
      vibesRef,
      where('userId', '==', userId),
      where('emotion', '==', 'Exam Stress'),
      where('timestamp', '>=', twoHoursAgo),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size >= 3; // 3+ stress vibes in 2 hours = break needed
  }

  async recordBreakTaken(userId: string, durationMinutes: number): Promise<void> {
    const breaksRef = collection(this.firestore, 'study-breaks');
    await addDoc(breaksRef, {
      userId,
      timestamp: serverTimestamp(),
      durationMinutes,
      taken: true,
    });

    const profileRef = doc(this.firestore, 'student-profiles', userId);
    await updateDoc(profileRef, {
      lastBreakTimestamp: serverTimestamp(),
    });
  }

  // Peer Support Functions
  async joinStudentCircle(userId: string, topic: 'exam-stress' | 'career-anxiety' | 'general-support'): Promise<string> {
    // Find an active circle or create a new one
    const circlesRef = collection(this.firestore, 'peer-support-circles');
    const q = query(
      circlesRef,
      where('topic', '==', topic),
      where('isActive', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const circleDoc = snapshot.docs[0];
      const circleData = circleDoc.data();
      const students = circleData.students || [];
      
      if (students.length < 10) { // Max 10 students per circle
        await updateDoc(doc(this.firestore, 'peer-support-circles', circleDoc.id), {
          students: [...students, userId],
        });
        return circleDoc.id;
      }
    }
    
    // Create new circle
    const newCircle = await addDoc(circlesRef, {
      students: [userId],
      topic,
      createdAt: serverTimestamp(),
      isActive: true,
    });
    
    return newCircle.id;
  }

  async getStudentCircleMembers(circleId: string): Promise<string[]> {
    const circleRef = doc(this.firestore, 'peer-support-circles', circleId);
    const circleDoc = await getDocs(query(collection(this.firestore, 'peer-support-circles'), where('__name__', '==', circleId)));
    
    if (!circleDoc.empty) {
      return circleDoc.docs[0].data().students || [];
    }
    
    return [];
  }

  // Parent-Student Bridge Functions
  async linkParentAccount(userId: string, parentEmail: string): Promise<void> {
    const profileRef = doc(this.firestore, 'student-profiles', userId);
    await updateDoc(profileRef, {
      linkedParentEmail: parentEmail,
      parentLinkTimestamp: serverTimestamp(),
    });

    // Create parent access record
    const parentAccessRef = collection(this.firestore, 'parent-access');
    await addDoc(parentAccessRef, {
      studentUserId: userId,
      parentEmail,
      accessGranted: serverTimestamp(),
    });
  }

  async updateMoodTrend(userId: string): Promise<void> {
    // Calculate mood trend based on last 7 days
    const vibesRef = collection(this.firestore, 'all-vibes');
    const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const q = query(
      vibesRef,
      where('userId', '==', userId),
      where('timestamp', '>=', sevenDaysAgo)
    );
    
    const snapshot = await getDocs(q);
    const moodCounts = {
      happy: 0,
      stressed: 0,
      sad: 0,
      motivated: 0,
    };
    
    snapshot.forEach((doc) => {
      const emotion = doc.data().emotion;
      if (emotion === 'Happy') moodCounts.happy++;
      if (emotion === 'Exam Stress' || emotion === 'Career Anxiety') moodCounts.stressed++;
      if (emotion === 'Sad' || emotion === 'Lonely') moodCounts.sad++;
      if (emotion === 'Motivated') moodCounts.motivated++;
    });
    
    // Determine trend
    const positiveCount = moodCounts.happy + moodCounts.motivated;
    const negativeCount = moodCounts.stressed + moodCounts.sad;
    
    let trend: 'improving' | 'stable' | 'struggling' = 'stable';
    if (positiveCount > negativeCount * 1.5) {
      trend = 'improving';
    } else if (negativeCount > positiveCount * 1.5) {
      trend = 'struggling';
    }
    
    const profileRef = doc(this.firestore, 'student-profiles', userId);
    await updateDoc(profileRef, {
      currentMoodTrend: trend,
      weeklyMoodSummary: moodCounts,
      lastTrendUpdate: serverTimestamp(),
    });
  }

  async getParentDashboardData(parentEmail: string): Promise<{
    studentId: string;
    overallMood: string;
    trend: string;
    weeklyMoodSummary: any;
  }[]> {
    const parentAccessRef = collection(this.firestore, 'parent-access');
    const q = query(parentAccessRef, where('parentEmail', '==', parentEmail));
    const snapshot = await getDocs(q);
    
    const dashboardData = [];
    
    for (const doc of snapshot.docs) {
      const studentId = doc.data().studentUserId;
      const profileRef = collection(this.firestore, 'student-profiles');
      const profileQuery = query(profileRef, where('userId', '==', studentId));
      const profileSnapshot = await getDocs(profileQuery);
      
      if (!profileSnapshot.empty) {
        const profile = profileSnapshot.docs[0].data();
        dashboardData.push({
          studentId,
          overallMood: this.calculateOverallMood(profile.weeklyMoodSummary || {}),
          trend: profile.currentMoodTrend || 'stable',
          weeklyMoodSummary: profile.weeklyMoodSummary || {},
        });
      }
    }
    
    return dashboardData;
  }

  private calculateOverallMood(weeklyMoodSummary: any): string {
    const { happy = 0, stressed = 0, sad = 0, motivated = 0 } = weeklyMoodSummary;
    const total = happy + stressed + sad + motivated;
    
    if (total === 0) return 'Neutral';
    
    const happyPercent = (happy / total) * 100;
    const stressedPercent = (stressed / total) * 100;
    const sadPercent = (sad / total) * 100;
    const motivatedPercent = (motivated / total) * 100;
    
    if (stressedPercent > 50) return 'Stressed';
    if (sadPercent > 50) return 'Sad';
    if (happyPercent > 40 || motivatedPercent > 40) return 'Happy';
    
    return 'Neutral';
  }
}
