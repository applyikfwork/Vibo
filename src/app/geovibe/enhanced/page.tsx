'use client';

import { useState, useEffect } from 'react';
import { LocationCapture } from '@/components/LocationCapture';
import { CityMoodPulse } from '@/components/CityMoodPulse';
import { NearbyVibesFeed } from '@/components/NearbyVibesFeed';
import { IndiaMapEnhanced } from '@/components/IndiaMapEnhanced';
import { EmotionTimeline } from '@/components/EmotionTimeline';
import { NearbyVibeStories } from '@/components/NearbyVibeStories';
import { VibeChallengesPanel } from '@/components/VibeChallengesPanel';
import { EmotionWavesDisplay } from '@/components/EmotionWavesDisplay';
import { CityMoodShareCard } from '@/components/CityMoodShareCard';
import { CityLeaderboard } from '@/components/CityLeaderboard';
import { CityChallenges } from '@/components/CityChallenges';
import { LiveActivityIndicator } from '@/components/LiveActivityIndicator';
import { TrendingEmotions } from '@/components/TrendingEmotions';
import { IndiaWideStats } from '@/components/IndiaWideStats';
import { LiveActivityStream } from '@/components/LiveActivityStream';
import { CityBattleCard } from '@/components/CityBattleCard';
import { EmotionalWeatherReport } from '@/components/EmotionalWeatherReport';
import { SocialProofIndicators } from '@/components/SocialProofIndicators';
import { TypingActivityIndicator } from '@/components/TypingActivityIndicator';
import { MilestoneCelebration } from '@/components/MilestoneCelebration';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Location, Vibe } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Map, TrendingUp, Sparkles, Target, Share2, Palette, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGeoVibeNotifications } from '@/hooks/useGeoVibeNotifications';

export default function EnhancedGeoVibePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [userLocation, setUserLocation] = useState<Location>(
    { lat: 28.6139, lng: 77.2090, city: 'Delhi', state: 'Delhi', country: 'India' }
  );
  const [selectedDemoCity, setSelectedDemoCity] = useState<string>('Delhi');
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [demoVibes, setDemoVibes] = useState<Vibe[]>([]);
  const [viewMode, setViewMode] = useState<'standard' | 'heatmap' | 'bubbles' | 'particles'>('standard');
  const [useFirebaseLocation, setUseFirebaseLocation] = useState(false);
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
  } = useGeoVibeNotifications(userLocation);

  useEffect(() => {
    if (user && firestore && useFirebaseLocation) {
      const loadUserLocation = async () => {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.enableLocationSharing && data.location) {
              setUserLocation(data.location as Location);
              return;
            }
          }
        } catch (error) {
          console.error('Error loading user location from Firebase:', error);
        }
        
        setDemoLocationFromCity(selectedDemoCity);
      };

      loadUserLocation();
    } else {
      setDemoLocationFromCity(selectedDemoCity);
    }
  }, [user, firestore, useFirebaseLocation, selectedDemoCity]);

  const setDemoLocationFromCity = (city: string) => {
    const cityCoordinates: Record<string, { lat: number; lng: number; state: string }> = {
      'Delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
      'Mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
      'Bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
      'Pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
      'Hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
      'Chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
    };

    const coords = cityCoordinates[city] || cityCoordinates['Delhi'];
    setUserLocation({
      lat: coords.lat,
      lng: coords.lng,
      city: city,
      state: coords.state,
      country: 'India',
    });
  };

  useEffect(() => {
    if (!userLocation) return;

    // Fetch real vibes first, then demo vibes (which needs real vibes for blending)
    const fetchData = async () => {
      await fetchRealVibes();
      // fetchDemoVibes will be called after vibes state updates
    };
    
    fetchData();
  }, [userLocation]);

  // Fetch demo vibes whenever real vibes change
  useEffect(() => {
    if (userLocation?.city) {
      fetchDemoVibes();
    }
  }, [vibes, userLocation?.city]);

  const fetchRealVibes = async () => {
    if (!userLocation) return;

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
        setVibes(data.vibes || []);
      }
    } catch (error) {
      console.error('Error fetching vibes:', error);
    }
  };

  const fetchDemoVibes = async () => {
    if (!userLocation?.city) return;

    try {
      // First fetch real vibes to pass to blending system
      const response = await fetch('/api/geovibe/demo-vibes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: userLocation.city,
          count: 100,
          realVibes: vibes, // Pass real vibes for proper blending
          realUserCount: vibes.length > 0 ? vibes.filter((v, i, arr) => arr.findIndex(x => x.userId === v.userId) === i).length : 0,
          totalVibesCount: vibes.length,
          useEnhanced: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Blending: ${data.realCount} real + ${data.demoCount} demo = ${data.totalCount} total vibes`);
        if (data.demoVibes && Array.isArray(data.demoVibes)) {
          setDemoVibes(data.demoVibes);
        }
      }
    } catch (error) {
      console.error('Error fetching demo vibes:', error);
      setDemoVibes([]);
    }
  };

  const allVibes = [...vibes, ...demoVibes];

  const handleCitySelect = (city: string) => {
    setSelectedDemoCity(city);
    setDemoLocationFromCity(city);
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            🌍 GeoVibe Enhanced
          </h1>
          <Badge variant="secondary" className="text-xs">
            ✨ NEW
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience emotions like never before with advanced visualizations, intelligent demo data,
          gamification, and viral sharing features
        </p>

        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 px-4 py-2 rounded-full"
          >
            <Bell className="h-4 w-4" />
            <span className="text-sm font-semibold">{unreadCount} new notifications</span>
            <Button size="sm" variant="ghost" onClick={markAllAsRead}>
              Clear
            </Button>
          </motion.div>
        )}

        {/* Social Proof & Typing Indicators */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <SocialProofIndicators vibes={allVibes} city={userLocation?.city} />
          <TypingActivityIndicator city={userLocation?.city} />
        </div>
      </motion.header>

      {/* Milestone Celebration */}
      <MilestoneCelebration vibes={allVibes} city={userLocation?.city || selectedDemoCity} />

      <LiveActivityIndicator 
        totalVibes={allVibes.length} 
        recentVibes={allVibes.filter(v => {
          const createdAt = v.createdAt as any;
          const hourAgo = Date.now() - 3600000;
          return createdAt?.toMillis?.() > hourAgo || createdAt > hourAgo;
        }).length}
      />

      <IndiaWideStats vibes={allVibes} />

      {/* City Battle */}
      <CityBattleCard city={userLocation?.city || selectedDemoCity} />

      {/* Live Activity Stream & Emotional Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveActivityStream vibes={allVibes} city={userLocation?.city || selectedDemoCity} />
        <EmotionalWeatherReport vibes={allVibes} city={userLocation?.city || selectedDemoCity} />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>City Selector</CardTitle>
            <CardDescription>
              Select a city to explore its emotional landscape
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai'].map((city) => (
                <Button
                  key={city}
                  variant={selectedDemoCity === city ? 'default' : 'outline'}
                  onClick={() => setSelectedDemoCity(city)}
                  className="w-full"
                >
                  {city}
                </Button>
              ))}
            </div>
            {user && firestore && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  type="checkbox"
                  id="useFirebase"
                  checked={useFirebaseLocation}
                  onChange={(e) => setUseFirebaseLocation(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="useFirebase" className="text-sm">
                  Use my saved location from Firebase
                </label>
              </div>
            )}
          </CardContent>
        </Card>
        <CityMoodPulse city={userLocation?.city} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionWavesDisplay city={userLocation?.city} />
        <TrendingEmotions vibes={allVibes} cityName={userLocation?.city} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Enhanced India Emotion Map</h2>
          </div>
          
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <TabsList>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
              <TabsTrigger value="bubbles">3D Bubbles</TabsTrigger>
              <TabsTrigger value="particles">Particles</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <IndiaMapEnhanced
          vibes={allVibes}
          selectedCity={selectedDemoCity}
          onCityClick={handleCitySelect}
          viewMode={viewMode}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionTimeline
          location={userLocation}
          locationName={userLocation?.city || 'your area'}
        />
        <NearbyVibeStories userLocation={userLocation} />
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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VibeChallengesPanel />
        <CityMoodShareCard
          city={userLocation?.city}
          topEmotions={[
            { emotion: 'Happy', count: 45, percentage: 35 },
            { emotion: 'Chill', count: 38, percentage: 30 },
            { emotion: 'Motivated', count: 25, percentage: 20 },
          ]}
          totalVibes={allVibes.length}
          userContribution={vibes.filter(v => v.userId === user?.uid).length}
        />
      </section>

      <section className="mt-12 p-8 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 rounded-3xl">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Enhanced GeoVibe Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🔥 Emotion Heat Maps
            </h4>
            <p className="text-sm text-muted-foreground">
              See gradient overlays showing emotion density with pulsing animations
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🫧 3D Emotion Bubbles
            </h4>
            <p className="text-sm text-muted-foreground">
              Floating bubbles with intensity-based sizes and smooth animations
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              ✨ Particle System
            </h4>
            <p className="text-sm text-muted-foreground">
              Animated particles flowing from high-emotion areas
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              📊 Emotion Timeline
            </h4>
            <p className="text-sm text-muted-foreground">
              See how emotions changed throughout the day with predictions
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🗺️ Vibe Stories
            </h4>
            <p className="text-sm text-muted-foreground">
              Discover aggregated emotional narratives and journey maps
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🎯 Vibe Challenges
            </h4>
            <p className="text-sm text-muted-foreground">
              Complete daily, weekly, and city challenges for rewards
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              🎨 Custom Themes
            </h4>
            <p className="text-sm text-muted-foreground">
              Dark glow, pastel dreams, vibrant neon, and seasonal themes
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              📱 Smart Notifications
            </h4>
            <p className="text-sm text-muted-foreground">
              Get notified about neighborhood vibes and emotional storms
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              📸 Viral Sharing
            </h4>
            <p className="text-sm text-muted-foreground">
              Share beautiful city mood screenshots and emotional weather reports
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
