'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Target, Users, Gift } from 'lucide-react';
import type { CityChallenge } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

interface CityChallengesProps {
  city?: string;
}

export function CityChallenges({ city }: CityChallengesProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<CityChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!city) {
      setIsLoading(false);
      return;
    }

    const fetchChallenges = async () => {
      try {
        const response = await fetch(`/api/geovibe/challenges?city=${encodeURIComponent(city)}`);
        if (response.ok) {
          const data = await response.json();
          setChallenges(data.challenges || []);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [city]);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join challenges',
        variant: 'destructive',
      });
      return;
    }

    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/geovibe/challenges/join', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ challengeId }),
      });

      if (response.ok) {
        toast({
          title: 'Challenge Joined!',
          description: 'Start spreading vibes to contribute to the goal 🎯 (+10 XP)',
        });
        
        setChallenges(prev => prev.map(c => 
          c.id === challengeId
            ? { ...c, participants: [...c.participants, user.uid] }
            : c
        ));
      } else if (response.status === 401) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in again to join challenges',
          variant: 'destructive',
        });
      } else {
        throw new Error('Failed to join challenge');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to join challenge. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!city) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            City Challenges
          </CardTitle>
          <CardDescription>
            Enable location sharing to join city-wide challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              🎯 Share your location to unite with your city
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const activeChallenges = challenges.filter(c => c.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {city} City Challenges
        </CardTitle>
        <CardDescription>
          Work together with your community to complete goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeChallenges.length === 0 && (
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No active challenges right now. Check back soon! 🌟
            </p>
          </div>
        )}

        {activeChallenges.map((challenge) => {
          const progress = (challenge.current / challenge.goal) * 100;
          const isParticipating = user && challenge.participants.includes(user.uid);
          const isCompleted = challenge.current >= challenge.goal;

          return (
            <Card key={challenge.id} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {challenge.participants.length} participants
                    </span>
                    <span className="font-medium">
                      {challenge.current} / {challenge.goal}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  {isCompleted && (
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      ✅ Challenge Completed!
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <span>+{challenge.reward.xp} XP</span>
                    {challenge.reward.badge && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                        🏅 {challenge.reward.badge}
                      </span>
                    )}
                  </div>

                  {!isParticipating && !isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => handleJoinChallenge(challenge.id)}
                    >
                      Join Challenge
                    </Button>
                  )}
                  {isParticipating && !isCompleted && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✓ Participating
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
