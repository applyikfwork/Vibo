'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import type { CityMoodPulse as CityMoodPulseType, EmotionCategory } from '@/lib/types';
import { EMOTION_ICONS } from '@/lib/geo-utils';
import { Sparkles } from 'lucide-react';

interface CityMoodPulseProps {
  city?: string;
}

export function CityMoodPulse({ city }: CityMoodPulseProps) {
  const [pulse, setPulse] = useState<CityMoodPulseType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!city) {
      setIsLoading(false);
      return;
    }

    const fetchCityMoodPulse = async () => {
      try {
        const response = await fetch(`/api/geovibe/city-pulse?city=${encodeURIComponent(city)}`);
        if (response.ok) {
          const data = await response.json();
          setPulse(data.pulse);
        }
      } catch (error) {
        console.error('Error fetching city mood pulse:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCityMoodPulse();
  }, [city]);

  if (!city) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            City Mood Pulse
          </CardTitle>
          <CardDescription>
            Enable location sharing to see your city's emotional heartbeat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              📍 Share your location to unlock city mood insights
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
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!pulse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {city} Mood Pulse
          </CardTitle>
          <CardDescription>
            Be the first to share a vibe from {city}!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              🌟 No vibes yet from {city}. Share your mood to start the pulse!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topEmotions = Object.entries(pulse.moodBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const getMoodMessage = () => {
    if (pulse.happinessPercentage >= 70) {
      return `${city} is glowing with positive energy today! ✨`;
    } else if (pulse.happinessPercentage >= 50) {
      return `${city} has a balanced emotional vibe 🌈`;
    } else {
      return `${city} could use some support today 💛`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {city} Mood Pulse
        </CardTitle>
        <CardDescription>
          Live emotional heartbeat of your city • {pulse.totalVibes} vibes • {pulse.activeUsers} users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {EMOTION_ICONS[pulse.dominantMood]} {pulse.dominantMood}
            </span>
            <span className="text-2xl font-bold text-primary">
              {Math.round(pulse.happinessPercentage)}%
            </span>
          </div>
          <Progress value={pulse.happinessPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground">{getMoodMessage()}</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Mood Breakdown</h4>
          {topEmotions.map(([emotion, count]) => {
            const percentage = (count / pulse.totalVibes) * 100;
            return (
              <div key={emotion} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {EMOTION_ICONS[emotion as EmotionCategory]} {emotion}
                  </span>
                  <span className="text-muted-foreground">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
