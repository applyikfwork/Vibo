'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import { EmotionCategory, Location } from '@/lib/types';
import { Clock, Rewind, FastForward, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmotionTimelineProps {
  location?: Location;
  locationName?: string;
}

interface TimelineEntry {
  hour: number;
  emotion: EmotionCategory;
  count: number;
  intensity: number;
}

export function EmotionTimeline({ location, locationName = 'this area' }: EmotionTimelineProps) {
  const [selectedDate, setSelectedDate] = useState<'today' | 'yesterday' | 'week'>('today');
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [prediction, setPrediction] = useState<{ hour: number; emotion: EmotionCategory; confidence: number } | null>(null);
  const currentHour = new Date().getHours();

  useEffect(() => {
    fetchTimelineData();
    generatePrediction();
  }, [location, selectedDate]);

  const fetchTimelineData = async () => {
    const mockData: TimelineEntry[] = generateMockTimelineData();
    setTimelineData(mockData);
  };

  const generateMockTimelineData = (): TimelineEntry[] => {
    const data: TimelineEntry[] = [];
    const hours = selectedDate === 'today' ? 24 : selectedDate === 'yesterday' ? 24 : 7 * 24;
    
    for (let i = 0; i < Math.min(hours, 24); i++) {
      const hour = selectedDate === 'today' ? i : i;
      const emotions: EmotionCategory[] = ['Happy', 'Chill', 'Motivated', 'Sad', 'Exam Stress'];
      
      let dominantEmotion: EmotionCategory;
      if (hour >= 6 && hour < 12) {
        dominantEmotion = Math.random() > 0.5 ? 'Motivated' : 'Happy';
      } else if (hour >= 12 && hour < 18) {
        dominantEmotion = Math.random() > 0.5 ? 'Chill' : 'Happy';
      } else if (hour >= 18 && hour < 22) {
        dominantEmotion = 'Chill';
      } else {
        dominantEmotion = Math.random() > 0.6 ? 'Happy' : 'Lonely';
      }

      data.push({
        hour,
        emotion: dominantEmotion,
        count: Math.floor(Math.random() * 20) + 5,
        intensity: Math.random() * 100,
      });
    }
    
    return data;
  };

  const generatePrediction = () => {
    const nextHour = (currentHour + 1) % 24;
    let predictedEmotion: EmotionCategory;
    let confidence = 0.7 + Math.random() * 0.2;

    if (nextHour >= 6 && nextHour < 10) {
      predictedEmotion = 'Motivated';
      confidence = 0.85;
    } else if (nextHour >= 12 && nextHour < 15) {
      predictedEmotion = 'Happy';
      confidence = 0.8;
    } else if (nextHour >= 17 && nextHour < 22) {
      predictedEmotion = 'Chill';
      confidence = 0.9;
    } else {
      predictedEmotion = 'Chill';
      confidence = 0.7;
    }

    setPrediction({
      hour: nextHour,
      emotion: predictedEmotion,
      confidence: Math.round(confidence * 100),
    });
  };

  const rewindDay = () => {
    if (selectedDate === 'today') {
      setSelectedDate('yesterday');
    } else if (selectedDate === 'yesterday') {
      setSelectedDate('week');
    }
  };

  const forwardDay = () => {
    if (selectedDate === 'week') {
      setSelectedDate('yesterday');
    } else if (selectedDate === 'yesterday') {
      setSelectedDate('today');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Emotion Timeline
            </CardTitle>
            <CardDescription>
              How emotions changed throughout the day in {locationName}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={rewindDay}
              disabled={selectedDate === 'week'}
            >
              <Rewind className="h-4 w-4" />
            </Button>
            <Select value={selectedDate} onValueChange={(value: any) => setSelectedDate(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={forwardDay}
              disabled={selectedDate === 'today'}
            >
              <FastForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-12 gap-2">
          {timelineData.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group cursor-pointer"
            >
              <div
                className="h-20 rounded-lg flex flex-col items-center justify-center transition-all hover:scale-110"
                style={{
                  backgroundColor: getMoodColor(entry.emotion),
                  opacity: selectedDate === 'today' && entry.hour > currentHour ? 0.3 : entry.intensity / 100,
                }}
              >
                <div className="text-xl">
                  {EMOTION_ICONS[entry.emotion]}
                </div>
                <div className="text-xs font-semibold mt-1 text-white">
                  {entry.hour}:00
                </div>
              </div>
              
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {entry.emotion} • {entry.count} vibes
              </div>
            </motion.div>
          ))}
        </div>

        {prediction && selectedDate === 'today' && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                Emotion Forecast
              </h3>
            </div>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              {locationName} usually gets <span className="font-bold">{prediction.emotion.toLowerCase()} vibes</span> around{' '}
              <span className="font-bold">{prediction.hour}:00</span>{' '}
              <span className="text-xs text-purple-600">
                ({prediction.confidence}% confidence)
              </span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from(new Set(timelineData.map(e => e.emotion))).map(emotion => {
            const count = timelineData.filter(e => e.emotion === emotion).length;
            return (
              <div
                key={emotion}
                className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                style={{ borderColor: getMoodColor(emotion) }}
              >
                <div className="text-2xl">
                  {EMOTION_ICONS[emotion]}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {emotion}
                  </div>
                  <div className="text-sm font-semibold">
                    {count}h active
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
