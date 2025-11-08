'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import { EmotionCategory } from '@/lib/types';
import { Share2, Download, Camera, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface CityMoodShareCardProps {
  city?: string;
  topEmotions?: { emotion: EmotionCategory; count: number; percentage: number }[];
  totalVibes?: number;
  userContribution?: number;
}

export function CityMoodShareCard({
  city = 'Your City',
  topEmotions = [],
  totalVibes = 0,
  userContribution = 0,
}: CityMoodShareCardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareToSocial = async () => {
    setIsSharing(true);

    const shareData = {
      title: `${city}'s Emotional Weather`,
      text: `Check out the current mood in ${city}! ${topEmotions[0]?.emotion} vibes are leading at ${topEmotions[0]?.percentage}%! Join GeoVibe to share your emotions.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const downloadScreenshot = async () => {
    alert('Screenshot feature coming soon! This will capture your city\'s emotional landscape.');
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="overflow-hidden">
      <div
        ref={cardRef}
        className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white"
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
                {city}'s Mood Today
              </CardTitle>
              <CardDescription className="text-white/80 text-sm">
                {currentDate}
              </CardDescription>
            </div>
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-5xl"
            >
              {topEmotions[0] && EMOTION_ICONS[topEmotions[0].emotion]}
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{totalVibes.toLocaleString()}</div>
              <div className="text-xs text-white/80">Total Vibes</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{topEmotions.length}</div>
              <div className="text-xs text-white/80">Active Emotions</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{userContribution}</div>
              <div className="text-xs text-white/80">Your Vibes</div>
            </div>
          </div>

          {topEmotions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Top Emotions Right Now</h3>
              {topEmotions.slice(0, 3).map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{EMOTION_ICONS[item.emotion]}</span>
                      <span className="font-medium">{item.emotion}</span>
                    </span>
                    <span className="font-bold">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-sm font-medium mb-1">Emotional Forecast</p>
            <p className="text-xs text-white/80">
              Based on patterns, {city} usually experiences{' '}
              <span className="font-bold">calm vibes</span> around 6 PM
            </p>
          </div>
        </CardContent>
      </div>

      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={shareToSocial}
            disabled={isSharing}
            className="w-full"
            variant="default"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={downloadScreenshot}
            className="w-full"
            variant="outline"
          >
            <Camera className="h-4 w-4 mr-2" />
            Screenshot
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Share your city's emotional weather with friends!
        </p>
      </CardContent>
    </Card>
  );
}
