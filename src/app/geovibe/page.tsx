'use client';

import { useState, useEffect } from 'react';
import { LocationCapture } from '@/components/LocationCapture';
import { CityMoodPulse } from '@/components/CityMoodPulse';
import { NearbyVibesFeed } from '@/components/NearbyVibesFeed';
import { IndiaMap } from '@/components/IndiaMap';
import { CityLeaderboard } from '@/components/CityLeaderboard';
import { CityChallenges } from '@/components/CityChallenges';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Location, Vibe } from '@/lib/types';
import { Map, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CITY_LOCATIONS: Record<string, Location> = {
  'Delhi': { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi', country: 'India' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  'Bangalore': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka', country: 'India' },
  'Pune': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra', country: 'India' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana', country: 'India' },
  'Chennai': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
};

export default function GeoVibePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedCity, setSelectedCity] = useState<string>('Delhi');
  const [userLocation, setUserLocation] = useState<Location>(CITY_LOCATIONS['Delhi']);
  const [nearbyVibes, setNearbyVibes] = useState<Vibe[]>([]);
  const [demoVibes, setDemoVibes] = useState<Vibe[]>([]);

  useEffect(() => {
    if (user && firestore) {
      const loadUserLocation = async () => {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.enableLocationSharing && data.location) {
              setUserLocation(data.location as Location);
              if (data.location.city) {
                setSelectedCity(data.location.city);
              }
              return;
            }
          }
        } catch (error) {
          console.error('Error loading user location:', error);
        }
      };

      loadUserLocation();
    }
  }, [user, firestore]);

  useEffect(() => {
    fetchAllDemoVibes();
  }, []);

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

  const fetchAllDemoVibes = async () => {
    try {
      const allVibes: Vibe[] = [];
      
      for (const city of Object.keys(CITY_LOCATIONS)) {
        try {
          const response = await fetch('/api/geovibe/demo-vibes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, count: 20 }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.vibes && Array.isArray(data.vibes)) {
              allVibes.push(...data.vibes);
            }
          }
        } catch (err) {
          console.error(`Error fetching vibes for ${city}:`, err);
        }
      }
      
      setDemoVibes(allVibes);
    } catch (error) {
      console.error('Error fetching demo vibes:', error);
    }
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
    setUserLocation(CITY_LOCATIONS[city]);
  };

  const allVibes = [...nearbyVibes, ...demoVibes];

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          🌍 GeoVibe Engine
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Feel India's emotions — explore city heartbeats, connect with nearby vibes, and unite through challenges.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Select Your City</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(CITY_LOCATIONS).map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? 'default' : 'outline'}
                onClick={() => handleCityClick(city)}
                className="w-full"
              >
                {city}
              </Button>
            ))}
          </div>
          <LocationCapture />
        </div>
        <CityMoodPulse city={userLocation?.city} />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Map className="h-6 w-6" />
          <h2 className="text-2xl font-bold">India Live Emotion Map</h2>
        </div>
        <IndiaMap 
          vibes={allVibes} 
          selectedCity={selectedCity}
          onCityClick={handleCityClick}
        />
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
