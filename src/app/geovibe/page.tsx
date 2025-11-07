'use client';

import { useState, useEffect } from 'react';
import { LocationCapture } from '@/components/LocationCapture';
import { CityMoodPulse } from '@/components/CityMoodPulse';
import { NearbyVibesFeed } from '@/components/NearbyVibesFeed';
import { GeoVibesMap } from '@/components/GeoVibesMap';
import { CityLeaderboard } from '@/components/CityLeaderboard';
import { CityChallenges } from '@/components/CityChallenges';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Location, Vibe } from '@/lib/types';
import { Map, TrendingUp } from 'lucide-react';

export default function GeoVibePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [userLocation, setUserLocation] = useState<Location | undefined>();
  const [nearbyVibes, setNearbyVibes] = useState<Vibe[]>([]);

  useEffect(() => {
    if (!user || !firestore) return;

    const loadUserLocation = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.enableLocationSharing && data.location) {
            setUserLocation(data.location as Location);
          }
        }
      } catch (error) {
        console.error('Error loading user location:', error);
      }
    };

    loadUserLocation();
  }, [user, firestore]);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyVibes = async () => {
      try {
        const response = await fetch('/api/geovibe/nearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: userLocation,
            radiusKm: 50,
            sortBy: 'recent',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setNearbyVibes(data.vibes || []);
        }
      } catch (error) {
        console.error('Error fetching nearby vibes:', error);
      }
    };

    fetchNearbyVibes();
  }, [userLocation]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          🌍 GeoVibe Engine
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Feel the world's emotions — starting from where you stand. Explore your city's heartbeat, 
          connect with nearby vibes, and unite through challenges.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LocationCapture />
        <CityMoodPulse city={userLocation?.city} />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Map className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Live Emotion Map</h2>
        </div>
        <GeoVibesMap center={userLocation} vibes={nearbyVibes} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Nearby Vibes Feed</h2>
          </div>
          <NearbyVibesFeed userLocation={userLocation} radiusKm={10} />
        </div>

        <div className="space-y-6">
          <CityLeaderboard city={userLocation?.city} />
          <CityChallenges city={userLocation?.city} />
        </div>
      </section>

      <section className="mt-12 p-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-3xl">
        <h3 className="text-2xl font-bold mb-4">✨ GeoVibe Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🗺️ Interactive Map
            </h4>
            <p className="text-sm text-muted-foreground">
              See live emotions by area with color-coded mood markers
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              💓 City Mood Pulse
            </h4>
            <p className="text-sm text-muted-foreground">
              Real-time emotional analytics updated hourly for your city
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              📍 Nearby Feed
            </h4>
            <p className="text-sm text-muted-foreground">
              Discover vibes from people within 10km of you
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🏆 Leaderboards
            </h4>
            <p className="text-sm text-muted-foreground">
              Compete with your city and climb the national ranks
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🎯 City Challenges
            </h4>
            <p className="text-sm text-muted-foreground">
              Unite with your community to complete shared goals
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🎉 Festival Events
            </h4>
            <p className="text-sm text-muted-foreground">
              Auto-triggered celebrations during Indian festivals
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
