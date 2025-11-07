'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { VibeCard } from './VibeCard';
import { Skeleton } from './ui/skeleton';
import type { Vibe, Location } from '@/lib/types';
import { MapPin, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface NearbyVibesFeedProps {
  userLocation?: Location;
  radiusKm?: number;
}

export function NearbyVibesFeed({ userLocation, radiusKm = 10 }: NearbyVibesFeedProps) {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'distance' | 'recent' | 'popular'>('recent');

  useEffect(() => {
    if (!userLocation) {
      setIsLoading(false);
      return;
    }

    const fetchNearbyVibes = async () => {
      try {
        const response = await fetch('/api/geovibe/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: userLocation,
            radiusKm,
            sortBy,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setVibes(data.vibes || []);
        }
      } catch (error) {
        console.error('Error fetching nearby vibes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyVibes();
  }, [userLocation, radiusKm, sortBy]);

  if (!userLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Vibes
          </CardTitle>
          <CardDescription>
            Enable location sharing to discover vibes around you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              🗺️ Share your location to see emotions from people nearby
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Nearby Vibes
              </CardTitle>
              <CardDescription>
                Emotions within {radiusKm}km • {userLocation.city || 'your area'}
              </CardDescription>
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 w-full rounded-3xl" />
          ))}
        </div>
      )}

      {!isLoading && vibes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-medium mb-2">No nearby vibes yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to share your vibe in {userLocation.city || 'this area'}!
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && vibes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vibes.map((vibe) => (
            <div key={vibe.id} className="relative">
              <VibeCard vibe={vibe} />
              {vibe.distance !== undefined && (
                <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  📍 {vibe.distance < 1 ? '<1km' : `${vibe.distance.toFixed(1)}km`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
