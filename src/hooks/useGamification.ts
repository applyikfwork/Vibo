'use client';

import { useState, useCallback, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { useToast } from './use-toast';

interface RewardResponse {
  success: boolean;
  duplicate?: boolean;
  rewards: {
    xp: number;
    coins: number;
    totalXP: number;
    totalCoins: number;
    level: number;
    leveledUp: boolean;
    newBadges: Array<{
      id: string;
      name: string;
      icon: string;
      rarity: string;
    }>;
  };
}

interface ErrorResponse {
  error: string;
  message?: string;
}

function generateIdempotencyKey(action: string, metadata?: Record<string, any>): string {
  const roundedTimestamp = Math.floor(Date.now() / 30000) * 30000;
  
  const metadataStr = metadata ? JSON.stringify(
    Object.keys(metadata)
      .sort()
      .reduce((obj: any, key) => {
        if (key !== 'idempotencyKey' && key !== 'timestamp') {
          obj[key] = metadata[key];
        }
        return obj;
      }, {})
  ) : '';
  
  const baseStr = `${action}_${metadataStr}_${roundedTimestamp}`;
  let hash = 0;
  for (let i = 0; i < baseStr.length; i++) {
    const char = baseStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `${action}_${Math.abs(hash).toString(36)}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useGamification() {
  const { toast } = useToast();
  const [isAwarding, setIsAwarding] = useState(false);
  const pendingRequests = useRef(new Set<string>());

  const awardReward = useCallback(
    async (
      action: string, 
      metadata?: Record<string, any>,
      options?: { skipToast?: boolean; retries?: number }
    ): Promise<RewardResponse | null> => {
      const maxRetries = options?.retries ?? 3;
      const skipToast = options?.skipToast ?? false;
      
      const idempotencyKey = generateIdempotencyKey(action, metadata);
      
      if (pendingRequests.current.has(idempotencyKey)) {
        console.log('Duplicate request detected, skipping...');
        return null;
      }

      pendingRequests.current.add(idempotencyKey);
      setIsAwarding(true);

      try {
        const token = await getAuth().currentUser?.getIdToken();
        if (!token) {
          throw new Error('User not authenticated');
        }

        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const response = await fetch('/api/gamification/rewards', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ 
                action, 
                metadata: {
                  ...metadata,
                  idempotencyKey
                }
              })
            });

            if (response.status === 429) {
              const errorData: ErrorResponse = await response.json();
              if (!skipToast) {
                toast({
                  variant: 'destructive',
                  title: 'Slow Down',
                  description: errorData.message || 'You are performing this action too frequently.',
                  duration: 5000
                });
              }
              return null;
            }

            if (response.status === 401) {
              throw new Error('Authentication failed');
            }

            if (!response.ok) {
              const errorData: ErrorResponse = await response.json();
              throw new Error(errorData.error || 'Failed to award reward');
            }

            const data: RewardResponse = await response.json();

            if (data.duplicate) {
              console.log('Duplicate reward detected by server');
              return data;
            }

            if (!skipToast && (data.rewards.xp > 0 || data.rewards.coins > 0)) {
              const rewardMessage = [];
              if (data.rewards.xp > 0) rewardMessage.push(`+${data.rewards.xp} XP`);
              if (data.rewards.coins > 0) rewardMessage.push(`+${data.rewards.coins} Coins`);

              toast({
                title: '🎉 Reward Earned!',
                description: rewardMessage.join(', '),
                duration: 3000
              });
            }

            if (!skipToast && data.rewards.leveledUp) {
              toast({
                title: '🎊 Level Up!',
                description: `You reached Level ${data.rewards.level}! 🚀`,
                duration: 5000
              });
            }

            if (!skipToast && data.rewards.newBadges.length > 0) {
              for (const badge of data.rewards.newBadges) {
                toast({
                  title: `${badge.icon} Badge Unlocked!`,
                  description: `You earned: ${badge.name}`,
                  duration: 5000
                });
              }
            }

            return data;

          } catch (error: any) {
            lastError = error;
            
            if (error.message === 'Authentication failed') {
              throw error;
            }

            if (attempt < maxRetries) {
              const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
              console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${backoffMs}ms`);
              await sleep(backoffMs);
            }
          }
        }

        throw lastError || new Error('Failed to award reward after retries');

      } catch (error: any) {
        console.error('Error awarding reward:', error);
        
        if (!skipToast && error.message !== 'User not authenticated') {
          toast({
            variant: 'destructive',
            title: 'Reward Error',
            description: 'Could not award reward at this time. Your progress is safe.',
            duration: 4000
          });
        }
        
        return null;
      } finally {
        pendingRequests.current.delete(idempotencyKey);
        setIsAwarding(false);
      }
    },
    [toast]
  );

  const updateMissionProgress = useCallback(
    async (missionId: string, missionType: 'daily' | 'weekly' | 'special', incrementBy = 1) => {
      try {
        const token = await getAuth().currentUser?.getIdToken();
        if (!token) return;

        const response = await fetch('/api/gamification/missions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ missionId, missionType, incrementBy })
        });

        if (!response.ok) {
          console.error('Failed to update mission progress');
          return;
        }

        const data = await response.json();

        if (data.completed) {
          toast({
            title: '✅ Mission Completed!',
            description: `You completed: ${data.mission.title}`,
            duration: 5000
          });
        }
      } catch (error) {
        console.error('Error updating mission:', error);
      }
    },
    [toast]
  );

  const awardPostReward = useCallback(
    async (isVoiceNote = false, vibeId?: string) => {
      const action = isVoiceNote ? 'VOICE_NOTE' : 'POST_VIBE';
      const result = await awardReward(action, vibeId ? { vibeId } : undefined);
      
      await updateMissionProgress('daily-post', 'daily');
      
      return result;
    },
    [awardReward, updateMissionProgress]
  );

  const awardReactionReward = useCallback(async (vibeId?: string) => {
    await awardReward('REACT_TO_VIBE', vibeId ? { vibeId } : undefined);
    await updateMissionProgress('daily-react', 'daily');
  }, [awardReward, updateMissionProgress]);

  const awardCommentReward = useCallback(async (vibeId?: string, commentId?: string) => {
    await awardReward('HELPFUL_COMMENT', vibeId && commentId ? { vibeId, commentId } : undefined);
    await updateMissionProgress('daily-comment', 'daily');
  }, [awardReward, updateMissionProgress]);

  return {
    awardReward,
    awardPostReward,
    awardReactionReward,
    awardCommentReward,
    updateMissionProgress,
    isAwarding
  };
}