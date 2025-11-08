import { Timestamp } from 'firebase/firestore';
import { detectAnomalousEarning, FRAUD_THRESHOLDS } from './reward-engine';
import type { FraudCheck } from '../types';

export async function checkForFraud(
  userId: string,
  recentTransactions: any[],
  userMetrics: {
    dailyCoins: number;
    dailyXP: number;
    deviceFingerprint?: string;
    ipAddress?: string;
  },
  cohortMedians: {
    medianDailyCoins: number;
    medianDailyXP: number;
  }
): Promise<FraudCheck | null> {
  const anomalyCheck = detectAnomalousEarning(
    userMetrics.dailyCoins,
    userMetrics.dailyXP,
    cohortMedians.medianDailyCoins,
    cohortMedians.medianDailyXP
  );

  if (anomalyCheck.isFraudulent) {
    return {
      id: `fraud_${userId}_${Date.now()}`,
      userId,
      checkType: 'anomaly',
      timestamp: Timestamp.now() as any,
      flagReason: anomalyCheck.reason || 'Anomalous earning detected',
      severity: anomalyCheck.severity,
      autoResolved: false,
      manualReview: anomalyCheck.severity === 'critical' || anomalyCheck.severity === 'high',
    };
  }

  const velocityCheck = checkVelocityPatterns(recentTransactions);
  if (velocityCheck.isSuspicious) {
    return {
      id: `fraud_${userId}_${Date.now()}`,
      userId,
      checkType: 'velocity',
      timestamp: Timestamp.now() as any,
      flagReason: velocityCheck.reason,
      severity: velocityCheck.severity,
      autoResolved: false,
      manualReview: velocityCheck.severity === 'high' || velocityCheck.severity === 'critical',
    };
  }

  return null;
}

function checkVelocityPatterns(transactions: any[]): {
  isSuspicious: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
} {
  const now = Date.now();
  const fiveMinAgo = now - 5 * 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;

  const recentFiveMin = transactions.filter(t => {
    const ts = (t.timestamp as any).toMillis ? (t.timestamp as any).toMillis() : t.timestamp;
    return ts > fiveMinAgo;
  });

  const recentHour = transactions.filter(t => {
    const ts = (t.timestamp as any).toMillis ? (t.timestamp as any).toMillis() : t.timestamp;
    return ts > oneHourAgo;
  });

  const posts5Min = recentFiveMin.filter(t => t.action === 'post_vibe').length;
  const reactions5Min = recentFiveMin.filter(t => t.action === 'react_vibe').length;

  const coinsEarnedHour = recentHour
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + (t.coinsChange || 0), 0);

  if (posts5Min > FRAUD_THRESHOLDS.velocity.posts_per_5_min) {
    return {
      isSuspicious: true,
      severity: 'high',
      reason: `Excessive posts in 5 minutes: ${posts5Min}`,
    };
  }

  if (reactions5Min > FRAUD_THRESHOLDS.velocity.reactions_per_5_min) {
    return {
      isSuspicious: true,
      severity: 'medium',
      reason: `Excessive reactions in 5 minutes: ${reactions5Min}`,
    };
  }

  if (coinsEarnedHour > FRAUD_THRESHOLDS.velocity.coins_earned_per_hour) {
    return {
      isSuspicious: true,
      severity: 'high',
      reason: `Excessive coins earned in 1 hour: ${coinsEarnedHour}`,
    };
  }

  return {
    isSuspicious: false,
    severity: 'low',
    reason: '',
  };
}

export function detectCollaborationRing(
  userInteractions: { targetUserId: string; type: string }[]
): {
  isSuspicious: boolean;
  suspiciousUsers: string[];
  reason: string;
} {
  const interactionCounts: Record<string, number> = {};
  const totalInteractions = userInteractions.length;

  userInteractions.forEach(interaction => {
    const targetId = interaction.targetUserId;
    interactionCounts[targetId] = (interactionCounts[targetId] || 0) + 1;
  });

  const suspiciousUsers: string[] = [];

  for (const [targetId, count] of Object.entries(interactionCounts)) {
    if (count >= FRAUD_THRESHOLDS.collaboration.min_interactions_to_flag) {
      const ratio = count / totalInteractions;
      if (ratio >= FRAUD_THRESHOLDS.collaboration.reciprocal_reaction_threshold) {
        suspiciousUsers.push(targetId);
      }
    }
  }

  if (suspiciousUsers.length > 0) {
    return {
      isSuspicious: true,
      suspiciousUsers,
      reason: `Reciprocal reaction loop detected with ${suspiciousUsers.length} users`,
    };
  }

  return {
    isSuspicious: false,
    suspiciousUsers: [],
    reason: '',
  };
}

export function shouldTriggerManualReview(fraudFlags: number, severity: 'low' | 'medium' | 'high' | 'critical'): boolean {
  if (severity === 'critical') return true;
  if (severity === 'high' && fraudFlags >= 2) return true;
  if (fraudFlags >= 5) return true;
  return false;
}

export function calculateSanction(
  fraudFlags: number,
  severity: 'low' | 'medium' | 'high' | 'critical',
  isRepeatOffender: boolean
): {
  action: 'warning' | 'rollback' | 'suspension' | 'ban';
  duration?: number;
  message: string;
} {
  if (isRepeatOffender && severity === 'critical') {
    return {
      action: 'ban',
      message: 'Account permanently banned for repeated severe fraud violations',
    };
  }

  if (severity === 'critical' || (severity === 'high' && fraudFlags >= 3)) {
    return {
      action: 'suspension',
      duration: 7 * 24 * 60 * 60 * 1000,
      message: 'Account suspended for 7 days due to fraudulent activity',
    };
  }

  if (severity === 'high' || fraudFlags >= 3) {
    return {
      action: 'rollback',
      message: 'Fraudulent rewards rolled back. Further violations will result in suspension',
    };
  }

  return {
    action: 'warning',
    message: 'Unusual activity detected. Please ensure you are following our community guidelines',
  };
}
