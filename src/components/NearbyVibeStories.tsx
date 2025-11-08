'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import { EmotionCategory, Location } from '@/lib/types';
import { MapPin, TrendingUp, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface VibeStory {
  location: string;
  emotions: {
    emotion: EmotionCategory;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  dominantEmotion: EmotionCategory;
  story: string;
  distance: number;
}

interface EmotionJourney {
  id: string;
  name: string;
  description: string;
  emotion: EmotionCategory;
  route: {
    name: string;
    lat: number;
    lng: number;
  }[];
  distance: string;
  duration: string;
}

interface NearbyVibeStoriesProps {
  userLocation?: Location;
}

export function NearbyVibeStories({ userLocation }: NearbyVibeStoriesProps) {
  const [stories, setStories] = useState<VibeStory[]>([]);
  const [journeys, setJourneys] = useState<EmotionJourney[]>([]);

  useEffect(() => {
    generateVibeStories();
    generateEmotionJourneys();
  }, [userLocation]);

  const generateVibeStories = () => {
    const mockStories: VibeStory[] = [
      {
        location: 'Coffee Hub, 0.5km away',
        emotions: [
          { emotion: 'Happy', count: 8, trend: 'up' },
          { emotion: 'Motivated', count: 5, trend: 'stable' },
          { emotion: 'Chill', count: 3, trend: 'down' }
        ],
        dominantEmotion: 'Happy',
        story: '8 people felt happy vibes here today, mostly enjoying their coffee and conversations. Energy is high!',
        distance: 0.5
      },
      {
        location: 'City Park, 1.2km away',
        emotions: [
          { emotion: 'Chill', count: 12, trend: 'up' },
          { emotion: 'Religious Peace', count: 4, trend: 'stable' },
          { emotion: 'Happy', count: 6, trend: 'up' }
        ],
        dominantEmotion: 'Chill',
        story: '12 people found peace and calm in the park today. Perfect spot to relax after a busy day.',
        distance: 1.2
      },
      {
        location: 'Library Plaza, 0.8km away',
        emotions: [
          { emotion: 'Exam Stress', count: 7, trend: 'up' },
          { emotion: 'Motivated', count: 5, trend: 'stable' },
          { emotion: 'Sad', count: 2, trend: 'down' }
        ],
        dominantEmotion: 'Exam Stress',
        story: '7 students feeling exam pressure but 5 staying motivated. Supportive community building here.',
        distance: 0.8
      },
      {
        location: 'Shopping District, 2.1km away',
        emotions: [
          { emotion: 'Happy', count: 15, trend: 'up' },
          { emotion: 'Festival Joy', count: 8, trend: 'up' },
        ],
        dominantEmotion: 'Happy',
        story: 'Vibrant shopping vibes! 15 happy shoppers and 8 feeling festive energy. Great place for good vibes.',
        distance: 2.1
      }
    ];

    setStories(mockStories);
  };

  const generateEmotionJourneys = () => {
    const mockJourneys: EmotionJourney[] = [
      {
        id: '1',
        name: 'Calm Trail',
        description: 'Follow this peaceful path to find inner calm',
        emotion: 'Chill',
        route: [
          { name: 'Lotus Cafe', lat: 28.6, lng: 77.2 },
          { name: 'River Walk', lat: 28.61, lng: 77.21 },
          { name: 'Meditation Garden', lat: 28.62, lng: 77.22 },
        ],
        distance: '2.5 km',
        duration: '30 min walk'
      },
      {
        id: '2',
        name: 'Happiness Route',
        description: 'Discover joy at these popular spots',
        emotion: 'Happy',
        route: [
          { name: 'Street Food Corner', lat: 28.63, lng: 77.23 },
          { name: 'Art Gallery', lat: 28.64, lng: 77.24 },
          { name: 'Music Plaza', lat: 28.65, lng: 77.25 },
        ],
        distance: '3.2 km',
        duration: '45 min walk'
      },
      {
        id: '3',
        name: 'Motivation Path',
        description: 'Get inspired along this energizing journey',
        emotion: 'Motivated',
        route: [
          { name: 'Startup Hub', lat: 28.66, lng: 77.26 },
          { name: 'Innovation Center', lat: 28.67, lng: 77.27 },
          { name: 'Fitness Park', lat: 28.68, lng: 77.28 },
        ],
        distance: '4.1 km',
        duration: '1 hour walk'
      }
    ];

    setJourneys(mockJourneys);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Nearby Vibe Stories
        </CardTitle>
        <CardDescription>
          Discover emotional landscapes and journeys around you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stories">Location Stories</TabsTrigger>
            <TabsTrigger value="journeys">Emotion Journeys</TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-4 mt-4">
            {stories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {story.location}
                        </CardTitle>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: getMoodColor(story.dominantEmotion),
                          color: 'white',
                        }}
                      >
                        {EMOTION_ICONS[story.dominantEmotion]} {story.dominantEmotion}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {story.story}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {story.emotions.map((emotion, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: getMoodColor(emotion.emotion) + '20',
                            border: `1px solid ${getMoodColor(emotion.emotion)}`,
                          }}
                        >
                          <span>{EMOTION_ICONS[emotion.emotion]}</span>
                          <span className="font-semibold">{emotion.count}</span>
                          <span>{getTrendIcon(emotion.trend)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="journeys" className="space-y-4 mt-4">
            {journeys.map((journey, index) => (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  style={{
                    borderLeft: `4px solid ${getMoodColor(journey.emotion)}`,
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          {journey.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {journey.description}
                        </CardDescription>
                      </div>
                      <div className="text-3xl">
                        {EMOTION_ICONS[journey.emotion]}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>📍 {journey.distance}</span>
                      <span>⏱️ {journey.duration}</span>
                    </div>

                    <div className="space-y-2">
                      {journey.route.map((stop, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                            {i + 1}
                          </div>
                          <span>{stop.name}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      style={{
                        borderColor: getMoodColor(journey.emotion),
                        color: getMoodColor(journey.emotion),
                      }}
                    >
                      Start Journey
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
