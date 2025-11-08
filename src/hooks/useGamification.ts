'use client';

import { useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { useToast } from './use-toast';

interface RewardResponse {
  success: boolean;
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

export function useGamification() {
  const { toast } = useToast();
  const [isAwarding, setIsAwarding] = useState(false);

  const awardReward = useCallback(
    async (action: string, metadata?: Record<string, any>): Promise<RewardResponse | null> => {
      setIsAwarding(true);
      try {
        const token = await getAuth().currentUser?.getIdToken();
        if (!token) return null;

        const response = await fetch('/api/gamification/rewards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ action, metadata })
        });

        if (!response.ok) {
          console.error('Failed to award reward');
          return null;
        }

        const data: RewardResponse = await response.json();

        if (data.rewards.xp > 0 || data.rewards.coins > 0) {
          const rewardMessage = [];
          if (data.rewards.xp > 0) rewardMessage.push(`+${data.rewards.xp} XP`);
          if (data.rewards.coins > 0) rewardMessage.push(`+${data.rewards.coins} Coins`);

          toast({
            title: '🎉 Reward Earned!',
            description: rewardMessage.join(', '),
            duration: 3000
          });
        }

        if (data.rewards.leveledUp) {
          toast({
            title: '🎊 Level Up!',
            description: `You reached Level ${data.rewards.level}! 🚀`,
            duration: 5000
          });
        }

        if (data.rewards.newBadges.length > 0) {
          for (const badge of data.rewards.newBadges) {
            toast({
              title: `${badge.icon} Badge Unlocked!`,
              description: `You earned: ${badge.name}`,
              duration: 5000
            });
          }
        }

        return data;
      } catch (error) {
        console.error('Error awarding reward:', error);
        return null;
      } finally {
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
    async (isVoiceNote = false) => {
      const action = isVoiceNote ? 'VOICE_NOTE' : 'POST_VIBE';
      const result = await awardReward(action);
      
      await updateMissionProgress('daily-post', 'daily');
      
      return result;
    },
    [awardReward, updateMissionProgress]
  );

  const awardReactionReward = useCallback(async () => {
    await awardReward('REACT_TO_VIBE');
    await updateMissionProgress('daily-react', 'daily');
  }, [awardReward, updateMissionProgress]);

  const awardCommentReward = useCallback(async () => {
    await awardReward('HELPFUL_COMMENT');
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