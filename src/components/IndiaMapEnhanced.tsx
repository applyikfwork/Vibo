'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EMOTION_ICONS, getMoodColor } from '@/lib/geo-utils';
import type { Vibe } from '@/lib/types';

interface IndiaMapEnhancedProps {
  vibes: Vibe[];
  onCityClick?: (city: string) => void;
  selectedCity?: string;
  viewMode?: 'standard' | 'heatmap' | 'bubbles' | 'particles';
}

const CITY_COORDINATES = {
  'Delhi': { x: 42, y: 28, lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'Mumbai': { x: 32, y: 55, lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'Bangalore': { x: 38, y: 75, lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Pune': { x: 34, y: 58, lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'Hyderabad': { x: 42, y: 65, lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'Chennai': { x: 45, y: 75, lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
};

export function IndiaMapEnhanced({ 
  vibes, 
  onCityClick, 
  selectedCity,
  viewMode = 'standard' 
}: IndiaMapEnhancedProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [showEmotionLayers, setShowEmotionLayers] = useState(true);

  const cityData = useMemo(() => {
    const data: Record<string, { vibes: Vibe[]; emotions: Record<string, number> }> = {};
    
    Object.keys(CITY_COORDINATES).forEach(city => {
      const cityVibes = vibes.filter(v => v.location?.city === city);
      const emotions: Record<string, number> = {};
      
      cityVibes.forEach(v => {
        emotions[v.emotion] = (emotions[v.emotion] || 0) + 1;
      });
      
      data[city] = { vibes: cityVibes, emotions };
    });
    
    return data;
  }, [vibes]);

  const getDominantEmotion = (city: string) => {
    const emotions = cityData[city]?.emotions || {};
    if (Object.keys(emotions).length === 0) return 'Happy';
    return Object.entries(emotions).sort(([, a], [, b]) => b - a)[0][0];
  };

  const getVibeIntensity = (city: string) => {
    const count = cityData[city]?.vibes.length || 0;
    return Math.min(count / 10, 1);
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              🗺️ Enhanced India Emotion Map
            </CardTitle>
            <CardDescription>
              Real-time emotional landscape • {vibes.length} vibes across {Object.keys(cityData).filter(c => cityData[c].vibes.length > 0).length} cities
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {viewMode.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/10 dark:via-purple-950/10 dark:to-pink-950/10 rounded-2xl p-8 border-2 border-primary/10">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto drop-shadow-2xl"
            style={{ maxHeight: '700px' }}
          >
            <defs>
              {/* Gradient Definitions */}
              <radialGradient id="indiaGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
              </radialGradient>

              {/* Dynamic Emotion Gradients */}
              {Object.entries(cityData).map(([city, data]) => {
                const emotion = getDominantEmotion(city);
                const color = getMoodColor(emotion);
                return (
                  <radialGradient key={`grad-${city}`} id={`cityGrad-${city}`}>
                    <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </radialGradient>
                );
              })}

              {/* Filters */}
              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <filter id="softGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* India Map Base - Enhanced */}
            <g filter="url(#softGlow)">
              <path
                d="M 35,15 L 45,10 L 55,12 L 60,20 L 58,30 L 55,35 L 50,38 L 48,45 L 50,52 L 48,58 L 45,65 L 48,70 L 45,75 L 42,80 L 38,82 L 35,78 L 32,72 L 28,68 L 25,75 L 22,72 L 20,65 L 18,58 L 20,50 L 22,45 L 18,38 L 20,32 L 25,28 L 28,22 L 32,18 Z"
                fill="url(#indiaGlow)"
                stroke="#8b5cf6"
                strokeWidth="0.8"
                strokeDasharray="2,1"
                className="transition-all duration-500"
              />
            </g>

            {/* Emotion Heat Layers */}
            {viewMode === 'heatmap' && showEmotionLayers && (
              <g opacity="0.6">
                {Object.entries(CITY_COORDINATES).map(([city, coords]) => {
                  const intensity = getVibeIntensity(city);
                  if (intensity === 0) return null;
                  
                  return (
                    <motion.circle
                      key={`heat-${city}`}
                      cx={coords.x}
                      cy={coords.y}
                      r={15 * intensity}
                      fill={`url(#cityGrad-${city})`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0.4, 0.7, 0.4],
                        scale: [0.8, 1.2, 0.8]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
              </g>
            )}

            {/* 3D Bubbles Mode */}
            {viewMode === 'bubbles' && (
              <g>
                {Object.entries(CITY_COORDINATES).map(([city, coords]) => {
                  const count = cityData[city]?.vibes.length || 0;
                  if (count === 0) return null;
                  
                  const emotion = getDominantEmotion(city);
                  const color = getMoodColor(emotion);
                  const bubbleSize = 3 + Math.min(count / 3, 8);
                  
                  return (
                    <g key={`bubble-${city}`}>
                      <motion.circle
                        cx={coords.x}
                        cy={coords.y}
                        r={bubbleSize}
                        fill={color}
                        opacity="0.7"
                        stroke="white"
                        strokeWidth="1"
                        filter="url(#strongGlow)"
                        animate={{
                          y: [0, -2, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2 + Math.random(),
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      {/* Bubble highlight */}
                      <circle
                        cx={coords.x - bubbleSize * 0.3}
                        cy={coords.y - bubbleSize * 0.3}
                        r={bubbleSize * 0.3}
                        fill="white"
                        opacity="0.6"
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Particles Mode */}
            {viewMode === 'particles' && (
              <g>
                {Object.entries(CITY_COORDINATES).map(([city, coords]) => {
                  const count = cityData[city]?.vibes.length || 0;
                  if (count === 0) return null;
                  
                  const color = getMoodColor(getDominantEmotion(city));
                  
                  return [...Array(Math.min(count, 12))].map((_, i) => (
                    <motion.circle
                      key={`particle-${city}-${i}`}
                      cx={coords.x}
                      cy={coords.y}
                      r="0.5"
                      fill={color}
                      animate={{
                        x: [0, (Math.random() - 0.5) * 20],
                        y: [0, (Math.random() - 0.5) * 20],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ));
                })}
              </g>
            )}

            {/* City Markers */}
            {Object.entries(CITY_COORDINATES).map(([city, coords]) => {
              const vibeCount = cityData[city]?.vibes.length || 0;
              const dominantEmotion = getDominantEmotion(city);
              const emotionColor = getMoodColor(dominantEmotion);
              const isSelected = selectedCity === city;
              const isHovered = hoveredCity === city;
              const markerSize = vibeCount === 0 ? 2.5 : (isSelected || isHovered ? 5 : 4);

              return (
                <g key={`marker-${city}`}>
                  {/* Ripple Effect */}
                  {vibeCount > 0 && (
                    <>
                      <motion.circle
                        cx={coords.x}
                        cy={coords.y}
                        r={markerSize}
                        fill="none"
                        stroke={emotionColor}
                        strokeWidth="0.5"
                        animate={{
                          r: [markerSize, markerSize + 8],
                          opacity: [0.8, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                      <motion.circle
                        cx={coords.x}
                        cy={coords.y}
                        r={markerSize}
                        fill="none"
                        stroke={emotionColor}
                        strokeWidth="0.5"
                        animate={{
                          r: [markerSize, markerSize + 8],
                          opacity: [0.8, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 1,
                          ease: "easeOut"
                        }}
                      />
                    </>
                  )}

                  {/* Main City Marker */}
                  <motion.circle
                    cx={coords.x}
                    cy={coords.y}
                    r={markerSize}
                    fill={vibeCount > 0 ? emotionColor : '#9ca3af'}
                    stroke="white"
                    strokeWidth="1"
                    filter="url(#strongGlow)"
                    className="cursor-pointer"
                    whileHover={{ scale: 1.4 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoveredCity(city)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => onCityClick?.(city)}
                    animate={{
                      scale: isSelected ? 1.3 : 1,
                    }}
                  />

                  {/* Emoji Overlay */}
                  {vibeCount > 0 && (isHovered || isSelected) && (
                    <text
                      x={coords.x}
                      y={coords.y + 1.5}
                      textAnchor="middle"
                      fontSize="4"
                      className="pointer-events-none select-none"
                    >
                      {EMOTION_ICONS[dominantEmotion]}
                    </text>
                  )}

                  {/* City Label */}
                  <text
                    x={coords.x}
                    y={coords.y - 7}
                    textAnchor="middle"
                    fontSize="3.5"
                    fontWeight="bold"
                    fill={isSelected || isHovered ? emotionColor : '#1f2937'}
                    className="pointer-events-none select-none dark:fill-gray-100"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    {city}
                  </text>

                  {/* Vibe Count */}
                  {vibeCount > 0 && (
                    <text
                      x={coords.x}
                      y={coords.y + 10}
                      textAnchor="middle"
                      fontSize="3"
                      fontWeight="bold"
                      fill="white"
                      className="pointer-events-none select-none"
                      style={{
                        textShadow: `0 0 4px ${emotionColor}`
                      }}
                    >
                      {vibeCount} 🔥
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Info Card */}
          {hoveredCity && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-5 border-2"
              style={{
                borderColor: getMoodColor(getDominantEmotion(hoveredCity))
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-xl flex items-center gap-2">
                    {hoveredCity}
                    <Badge variant="secondary" className="text-xs">
                      {CITY_COORDINATES[hoveredCity as keyof typeof CITY_COORDINATES].state}
                    </Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {cityData[hoveredCity]?.vibes.length || 0} active vibes
                  </p>
                  
                  {/* Top 3 Emotions */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {Object.entries(cityData[hoveredCity]?.emotions || {})
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 3)
                      .map(([emotion, count]) => (
                        <Badge
                          key={emotion}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: getMoodColor(emotion),
                            color: getMoodColor(emotion)
                          }}
                        >
                          {EMOTION_ICONS[emotion]} {emotion} ({count})
                        </Badge>
                      ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-2">
                    {EMOTION_ICONS[getDominantEmotion(hoveredCity)]}
                  </div>
                  <p className="text-xs font-bold" style={{
                    color: getMoodColor(getDominantEmotion(hoveredCity))
                  }}>
                    {getDominantEmotion(hoveredCity)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmotionLayers(!showEmotionLayers)}
          >
            {showEmotionLayers ? '🔥 Hide Layers' : '✨ Show Layers'}
          </Button>

          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>🟢 Positive</span>
            <span>🟡 Neutral</span>
            <span>🔴 Intense</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
