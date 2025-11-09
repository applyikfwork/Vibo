'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import type { Vibe, Location } from '@/lib/types';

interface IndiaMapProps {
  vibes: Vibe[];
  onCityClick?: (city: string) => void;
  selectedCity?: string;
}

const CITY_COORDINATES = {
  'Delhi': { x: 42, y: 28, lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'Mumbai': { x: 32, y: 55, lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'Bangalore': { x: 38, y: 75, lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Pune': { x: 34, y: 58, lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'Hyderabad': { x: 42, y: 65, lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'Chennai': { x: 45, y: 75, lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
};

export function IndiaMap({ vibes, onCityClick, selectedCity }: IndiaMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const getCityVibes = (city: string) => {
    return vibes.filter(v => v.location?.city === city);
  };

  const getCityDominantEmotion = (city: string) => {
    const cityVibes = getCityVibes(city);
    if (cityVibes.length === 0) return 'Happy';
    
    const emotionCounts: Record<string, number> = {};
    cityVibes.forEach(v => {
      emotionCounts[v.emotion] = (emotionCounts[v.emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0][0];
  };

  const getCityVibeCount = (city: string) => {
    return getCityVibes(city).length;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗺️ India Emotion Map
        </CardTitle>
        <CardDescription>
          Live emotional landscape across major Indian cities • {vibes.length} total vibes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto"
            style={{ maxHeight: '600px' }}
          >
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Simplified India Map Shape */}
            <path
              d="M 35,15 L 45,10 L 55,12 L 60,20 L 58,30 L 55,35 L 50,38 L 48,45 L 50,52 L 48,58 L 45,65 L 48,70 L 45,75 L 42,80 L 38,82 L 35,78 L 32,72 L 28,68 L 25,75 L 22,72 L 20,65 L 18,58 L 20,50 L 22,45 L 18,38 L 20,32 L 25,28 L 28,22 L 32,18 Z"
              fill="url(#mapGradient)"
              stroke="#10b981"
              strokeWidth="0.5"
              className="transition-all duration-300"
              opacity="0.6"
            />

            {/* Emotion Waves - Animated Background */}
            <motion.circle
              cx="40"
              cy="50"
              r="20"
              fill="#fbbf24"
              opacity="0.1"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* City Markers */}
            {Object.entries(CITY_COORDINATES).map(([city, coords]) => {
              const vibeCount = getCityVibeCount(city);
              const dominantEmotion = getCityDominantEmotion(city);
              const emotionColor = getMoodColor(dominantEmotion);
              const isSelected = selectedCity === city;
              const isHovered = hoveredCity === city;
              const markerSize = isSelected || isHovered ? 4 : 3;

              return (
                <g key={city}>
                  {/* Pulsing Glow Effect */}
                  {vibeCount > 0 && (
                    <motion.circle
                      cx={coords.x}
                      cy={coords.y}
                      r={markerSize + 2}
                      fill={emotionColor}
                      opacity="0.3"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Main City Marker */}
                  <motion.circle
                    cx={coords.x}
                    cy={coords.y}
                    r={markerSize}
                    fill={vibeCount > 0 ? emotionColor : '#9ca3af'}
                    stroke="white"
                    strokeWidth="0.8"
                    filter="url(#glow)"
                    className="cursor-pointer"
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHoveredCity(city)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => onCityClick?.(city)}
                    animate={{
                      scale: isSelected ? 1.2 : 1,
                    }}
                  />

                  {/* City Label */}
                  <text
                    x={coords.x}
                    y={coords.y - 6}
                    textAnchor="middle"
                    fontSize="3"
                    fontWeight="bold"
                    fill={isSelected || isHovered ? emotionColor : '#374151'}
                    className="pointer-events-none select-none dark:fill-gray-200"
                  >
                    {city}
                  </text>

                  {/* Vibe Count Badge */}
                  {vibeCount > 0 && (
                    <text
                      x={coords.x}
                      y={coords.y + 8}
                      textAnchor="middle"
                      fontSize="2.5"
                      fontWeight="600"
                      fill={emotionColor}
                      className="pointer-events-none select-none"
                    >
                      {vibeCount}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* City Info Panel */}
          <AnimatePresence>
            {hoveredCity && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border-2"
                style={{
                  borderColor: getMoodColor(getCityDominantEmotion(hoveredCity))
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      {hoveredCity}
                      <Badge variant="secondary">
                        {CITY_COORDINATES[hoveredCity as keyof typeof CITY_COORDINATES].state}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getCityVibeCount(hoveredCity)} active vibes
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl">
                      {EMOTION_ICONS[getCityDominantEmotion(hoveredCity)]}
                    </div>
                    <p className="text-xs font-semibold" style={{
                      color: getMoodColor(getCityDominantEmotion(hoveredCity))
                    }}>
                      {getCityDominantEmotion(hoveredCity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500" />
              <span className="text-muted-foreground">Positive Vibes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />
              <span className="text-muted-foreground">Neutral Vibes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-pink-500" />
              <span className="text-muted-foreground">Intense Emotions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
