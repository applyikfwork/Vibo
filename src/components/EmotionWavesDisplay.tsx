'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import { EmotionWave } from '@/lib/demo-data-service';
import { Waves, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionWavesDisplayProps {
  city?: string;
}

export function EmotionWavesDisplay({ city = 'your city' }: EmotionWavesDisplayProps) {
  const [waves, setWaves] = useState<EmotionWave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city || city === 'your city') return;
    
    fetchEmotionWaves();
    const interval = setInterval(fetchEmotionWaves, 300000);
    
    return () => clearInterval(interval);
  }, [city]);

  const fetchEmotionWaves = async () => {
    try {
      const response = await fetch(`/api/geovibe/emotion-waves?city=${city}`);
      if (response.ok) {
        const data = await response.json();
        setWaves(data.waves || []);
      }
    } catch (error) {
      console.error('Error fetching emotion waves:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 animate-pulse" />
            Loading Emotion Waves...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (waves.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 opacity-50" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          Trending Emotional Waves
        </CardTitle>
        <CardDescription>
          Live emotional weather patterns in {city}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        <AnimatePresence>
          {waves.map((wave, index) => (
            <motion.div
              key={wave.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className="rounded-xl p-4 border-2"
                style={{
                  borderColor: getMoodColor(wave.emotion),
                  backgroundColor: getMoodColor(wave.emotion) + '10',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="text-4xl"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {EMOTION_ICONS[wave.emotion]}
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg">{wave.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {wave.description}
                      </p>
                    </div>
                  </div>
                  
                  <Badge
                    variant="secondary"
                    className="ml-2"
                    style={{
                      backgroundColor: getMoodColor(wave.emotion),
                      color: 'white',
                    }}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {Math.round(wave.intensity * 100)}%
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {wave.affectedAreas.map((area, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      📍 {area}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Wave Intensity</span>
                  </div>
                  <motion.div
                    className="h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getMoodColor(wave.emotion) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${wave.intensity * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
