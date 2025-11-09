'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, CloudDrizzle, Wind, Sunrise, Sunset, TrendingUp, TrendingDown } from 'lucide-react';
import { EmotionCategory, Vibe } from '@/lib/types';

type EmotionalForecast = {
  time: string;
  hour: number;
  dominantEmotion: EmotionCategory;
  intensity: number;
  trend: 'rising' | 'falling' | 'stable';
  description: string;
};

export function EmotionalWeatherReport({ vibes, city }: { vibes: Vibe[]; city: string }) {
  const [currentWeather, setCurrentWeather] = useState<EmotionalForecast | null>(null);
  const [forecast, setForecast] = useState<EmotionalForecast[]>([]);

  useEffect(() => {
    generateEmotionalWeather();
  }, [vibes, city]);

  const generateEmotionalWeather = () => {
    const currentHour = new Date().getHours();
    
    // Current weather
    const current = generateForecastForHour(currentHour, 'Current');
    setCurrentWeather(current);

    // Forecast for next few periods
    const forecasts: EmotionalForecast[] = [];
    
    // Lunch time
    if (currentHour < 13) {
      forecasts.push(generateForecastForHour(13, '1 PM'));
    }
    
    // Evening
    if (currentHour < 18) {
      forecasts.push(generateForecastForHour(18, '6 PM'));
    }
    
    // Night
    if (currentHour < 21) {
      forecasts.push(generateForecastForHour(21, '9 PM'));
    }
    
    // Tomorrow morning (if it's late)
    if (currentHour >= 18) {
      forecasts.push(generateForecastForHour(9, 'Tomorrow 9 AM'));
    }

    setForecast(forecasts);
  };

  const generateForecastForHour = (hour: number, label: string): EmotionalForecast => {
    let dominantEmotion: EmotionCategory;
    let intensity: number;
    let description: string;
    let trend: 'rising' | 'falling' | 'stable';

    // Morning (6-10 AM)
    if (hour >= 6 && hour < 10) {
      dominantEmotion = 'Motivated';
      intensity = 0.8;
      description = 'Morning Motivation Wave';
      trend = 'rising';
    }
    // Lunch time (12-2 PM)
    else if (hour >= 12 && hour < 14) {
      dominantEmotion = 'Happy';
      intensity = 0.9;
      description = 'Lunch Hour Joy';
      trend = 'stable';
    }
    // Evening (6-9 PM)
    else if (hour >= 18 && hour < 21) {
      dominantEmotion = 'Chill';
      intensity = 0.85;
      description = 'Evening Calm Wave';
      trend = 'rising';
    }
    // Late night (9 PM+)
    else if (hour >= 21) {
      dominantEmotion = 'Chill';
      intensity = 0.6;
      description = 'Late Night Reflection';
      trend = 'falling';
    }
    // Late night/Early morning (12-6 AM)
    else if (hour < 6) {
      dominantEmotion = 'Neutral';
      intensity = 0.3;
      description = 'Quiet Hours';
      trend = 'stable';
    }
    // Default (work hours)
    else {
      dominantEmotion = 'Motivated';
      intensity = 0.7;
      description = 'Productive Energy';
      trend = 'stable';
    }

    return {
      time: label,
      hour,
      dominantEmotion,
      intensity,
      trend,
      description,
    };
  };

  const getWeatherIcon = (emotion: EmotionCategory, intensity: number) => {
    const iconClass = "h-12 w-12";
    
    if (emotion === 'Happy' || emotion === 'Festival Joy' || emotion === 'Motivated') {
      return <Sun className={`${iconClass} text-yellow-500`} />;
    } else if (emotion === 'Chill' || emotion === 'Religious Peace') {
      return <Cloud className={`${iconClass} text-blue-400`} />;
    } else if (emotion === 'Sad' || emotion === 'Lonely') {
      return <CloudRain className={`${iconClass} text-blue-600`} />;
    } else if (emotion === 'Exam Stress' || emotion === 'Career Anxiety') {
      return <Wind className={`${iconClass} text-gray-500`} />;
    } else {
      return <CloudDrizzle className={`${iconClass} text-gray-400`} />;
    }
  };

  const getEmotionColor = (emotion: EmotionCategory) => {
    const colors: Record<EmotionCategory, string> = {
      'Happy': 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400',
      'Motivated': 'bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-orange-400',
      'Chill': 'bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20 border-green-400',
      'Sad': 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-400',
      'Lonely': 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-400',
      'Angry': 'bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 border-red-400',
      'Neutral': 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-400',
      'Funny': 'bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-400',
      'Festival Joy': 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-400',
      'Missing Home': 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-400',
      'Exam Stress': 'bg-gradient-to-r from-red-100 to-gray-100 dark:from-red-900/20 dark:to-gray-900/20 border-red-400',
      'Wedding Excitement': 'bg-gradient-to-r from-pink-100 to-red-100 dark:from-pink-900/20 dark:to-red-900/20 border-pink-400',
      'Religious Peace': 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-400',
      'Family Bonding': 'bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-400',
      'Career Anxiety': 'bg-gradient-to-r from-red-100 to-gray-100 dark:from-red-900/20 dark:to-gray-900/20 border-red-400',
      'Festive Nostalgia': 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400',
    };
    return colors[emotion] || colors['Neutral'];
  };

  if (!currentWeather) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Emotional Weather
        </CardTitle>
        <CardDescription>
          Predicted emotional patterns for {city}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Weather */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-xl border-2 ${getEmotionColor(currentWeather.dominantEmotion)}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {currentWeather.time}
              </Badge>
              <h3 className="text-3xl font-bold">{currentWeather.dominantEmotion}</h3>
              <p className="text-muted-foreground">{currentWeather.description}</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              {getWeatherIcon(currentWeather.dominantEmotion, currentWeather.intensity)}
            </motion.div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              {currentWeather.trend === 'rising' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : currentWeather.trend === 'falling' ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : null}
              <span className="text-sm font-medium capitalize">{currentWeather.trend}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-20 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                  style={{ width: `${currentWeather.intensity * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{Math.round(currentWeather.intensity * 100)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Forecast */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Sunrise className="h-4 w-4" />
            Upcoming Forecast
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {forecast.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="text-xs text-muted-foreground mb-1">{item.time}</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="scale-75">
                    {getWeatherIcon(item.dominantEmotion, item.intensity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{item.dominantEmotion}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{Math.round(item.intensity * 100)}%</span>
                  {item.trend === 'rising' && <TrendingUp className="h-3 w-3 text-green-600" />}
                  {item.trend === 'falling' && <TrendingDown className="h-3 w-3 text-red-600" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Pro Tip:</strong> Share vibes during peak hours ({currentWeather.dominantEmotion} time) for bonus XP!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
