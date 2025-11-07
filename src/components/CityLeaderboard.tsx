'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Trophy, Medal, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  xp: number;
  rank: number;
  cityBadges?: string[];
}

interface CityLeaderboardProps {
  city?: string;
}

export function CityLeaderboard({ city }: CityLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scope, setScope] = useState<'city' | 'national'>('city');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const params = new URLSearchParams({
          scope,
          ...(city && scope === 'city' ? { city } : {}),
        });

        const response = await fetch(`/api/geovibe/leaderboard?${params}`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [city, scope]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
  };

  if (!city && scope === 'city') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Enable location sharing to see your city's top vibers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              🏆 Share your location to compete in your city
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {scope === 'city' ? `${city} Leaderboard` : 'National Vibeboard'}
        </CardTitle>
        <CardDescription>
          Top vibers ranked by XP and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={scope} onValueChange={(value) => setScope(value as 'city' | 'national')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="city" disabled={!city}>
              City
            </TabsTrigger>
            <TabsTrigger value="national">National</TabsTrigger>
          </TabsList>

          <TabsContent value={scope} className="space-y-3">
            {isLoading && (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </>
            )}

            {!isLoading && leaderboard.length === 0 && (
              <div className="rounded-lg bg-muted/50 border-2 border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No leaderboard data available yet
                </p>
              </div>
            )}

            {!isLoading && leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-10">
                  {getRankIcon(entry.rank)}
                </div>

                <Avatar className="h-10 w-10">
                  {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                  <AvatarFallback>
                    {entry.displayName?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.displayName || 'Anonymous Viber'}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{entry.xp} XP</p>
                    {entry.cityBadges && entry.cityBadges.length > 0 && (
                      <span className="text-xs">🏅 {entry.cityBadges.length}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
