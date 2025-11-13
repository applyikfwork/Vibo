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
  'Delhi': { x: 54, y: 20, lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'Mumbai': { x: 38, y: 50, lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'Bangalore': { x: 48, y: 71, lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'Pune': { x: 40, y: 52, lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'Hyderabad': { x: 50, y: 60, lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'Chennai': { x: 52, y: 72, lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'Kolkata': { x: 70, y: 40, lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  'Jaipur': { x: 47, y: 25, lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'Ahmedabad': { x: 38, y: 38, lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'Lucknow': { x: 58, y: 28, lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  'Chandigarh': { x: 50, y: 17, lat: 30.7333, lng: 76.7794, state: 'Chandigarh' },
  'Bhopal': { x: 50, y: 42, lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  'Kochi': { x: 48, y: 80, lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  'Guwahati': { x: 80, y: 28, lat: 26.1445, lng: 91.7362, state: 'Assam' },
  'Indore': { x: 46, y: 40, lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
};

export function IndiaMapEnhanced({ 
  vibes, 
  onCityClick, 
  selectedCity,
  viewMode = 'standard' 
}: IndiaMapEnhancedProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [showEmotionLayers, setShowEmotionLayers] = useState(true);

  // Generate stable particle data once on client mount to avoid hydration issues
  const [backgroundParticles] = useState(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      width: 2 + (i * 0.2) % 4, // Deterministic based on index
      height: 2 + (i * 0.2) % 4,
      hue: (i * 18) % 360, // Evenly distributed hues
      left: (i * 5.26) % 100, // Deterministic distribution
      top: ((i * 7.89) % 100),
      xOffset: (i % 2 === 0 ? 1 : -1) * (30 + (i * 3) % 40),
      yOffset: (i % 3 === 0 ? 1 : -1) * (30 + (i * 2) % 40),
      duration: 10 + (i % 10),
      delay: (i * 0.25) % 5,
    }));
  });


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
    <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 border-b-2 border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl">
              <span className="text-4xl">🗺️</span>
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Enhanced India Emotion Map
              </span>
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Real-time emotional landscape • {vibes.length} vibes across {Object.keys(cityData).filter(c => cityData[c].vibes.length > 0).length} cities
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs px-3 py-1 animate-pulse">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            {viewMode.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative w-full bg-gradient-to-br from-violet-100 via-fuchsia-100 via-pink-100 via-rose-100 to-orange-100 dark:from-violet-950/30 dark:via-fuchsia-950/30 dark:via-pink-950/30 dark:via-rose-950/30 dark:to-orange-950/30 rounded-3xl p-8 border-4 border-gradient-to-r from-purple-500 via-pink-500 to-orange-500 shadow-2xl overflow-hidden">
          {/* Animated background particles - using stable data */}
          {backgroundParticles.map((particle) => (
            <motion.div
              key={`particle-${particle.id}`}
              className="absolute rounded-full"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                background: `hsl(${particle.hue}, 70%, 60%)`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                x: [0, particle.xOffset],
                y: [0, particle.yOffset],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: particle.delay,
              }}
            />
          ))}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto drop-shadow-2xl"
            style={{ maxHeight: '700px' }}
          >
            <defs>
              {/* Enhanced Gradient Definitions */}
              <linearGradient id="indiaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="25%" stopColor="#8b5cf6" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#d946ef" stopOpacity="0.6" />
                <stop offset="75%" stopColor="#ec4899" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
              </linearGradient>

              <radialGradient id="rainbowGlow" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="33%" stopColor="#ec4899" stopOpacity="0.6" />
                <stop offset="66%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </radialGradient>

              {/* Dynamic Emotion Gradients */}
              {Object.entries(cityData).map(([city, data]) => {
                const emotion = getDominantEmotion(city);
                const color = getMoodColor(emotion);
                return (
                  <radialGradient key={`grad-${city}`} id={`cityGrad-${city}`}>
                    <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                    <stop offset="50%" stopColor={color} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </radialGradient>
                );
              })}

              {/* Enhanced Filters */}
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

              <filter id="vibrantGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feColorMatrix in="coloredBlur" type="saturate" values="2"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* India Map Base - Enhanced with detailed shape and animated gradient */}
            <g filter="url(#vibrantGlow)">
              {/* Main India body */}
              <motion.path
                d="M 48,10 L 52,8 L 56,8.5 L 60,10 L 64,12 L 68,15 L 72,18 L 76,22 L 80,26 L 83,30 L 84,35 L 82,38 L 78,42 L 73,45 L 70,48 L 68,52 L 67,56 L 66,60 L 65,64 L 62,68 L 60,72 L 58,76 L 55,80 L 52,83 L 50,85 L 48,86 L 46,85 L 44,82 L 42,78 L 41,74 L 40,70 L 38,66 L 36,62 L 34,58 L 32,54 L 30,50 L 28,46 L 27,42 L 26,38 L 25,34 L 24,30 L 26,26 L 28,22 L 30,18 L 32,15 L 35,12 L 38,10 L 42,9 L 45,9 Z"
                fill="url(#indiaGlow)"
                stroke="#ec4899"
                strokeWidth="1"
                strokeDasharray="2,1"
                className="transition-all duration-500"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  strokeDashoffset: [0, -30, 0]
                }}
                transition={{
                  opacity: { duration: 1 },
                  scale: { duration: 1 },
                  strokeDashoffset: { duration: 25, repeat: Infinity, ease: "linear" }
                }}
              />
              
              {/* Animated overlay for glow effect */}
              <motion.path
                d="M 48,10 L 52,8 L 56,8.5 L 60,10 L 64,12 L 68,15 L 72,18 L 76,22 L 80,26 L 83,30 L 84,35 L 82,38 L 78,42 L 73,45 L 70,48 L 68,52 L 67,56 L 66,60 L 65,64 L 62,68 L 60,72 L 58,76 L 55,80 L 52,83 L 50,85 L 48,86 L 46,85 L 44,82 L 42,78 L 41,74 L 40,70 L 38,66 L 36,62 L 34,58 L 32,54 L 30,50 L 28,46 L 27,42 L 26,38 L 25,34 L 24,30 L 26,26 L 28,22 L 30,18 L 32,15 L 35,12 L 38,10 L 42,9 L 45,9 Z"
                fill="none"
                stroke="url(#rainbowGlow)"
                strokeWidth="0.8"
                strokeDasharray="4,2"
                opacity="0.6"
                animate={{
                  strokeDashoffset: [0, 20, 0],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </g>

            {/* Ambient emotion waves across India */}
            <motion.circle
              cx="50"
              cy="45"
              r="35"
              fill="url(#rainbowGlow)"
              opacity="0.15"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Emotion Heat Layers - Enhanced */}
            {viewMode === 'heatmap' && showEmotionLayers && (
              <g opacity="0.7">
                {Object.entries(CITY_COORDINATES).map(([city, coords]) => {
                  const intensity = getVibeIntensity(city);
                  if (intensity === 0) return null;
                  
                  return (
                    <g key={`heat-group-${city}`}>
                      {/* Outer glow layer */}
                      <motion.circle
                        cx={coords.x}
                        cy={coords.y}
                        r={20 * intensity}
                        fill={`url(#cityGrad-${city})`}
                        opacity="0.3"
                        animate={{ 
                          opacity: [0.2, 0.5, 0.2],
                          scale: [0.9, 1.3, 0.9]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: ((coords.x + coords.y) % 20) / 10
                        }}
                      />
                      {/* Middle layer */}
                      <motion.circle
                        cx={coords.x}
                        cy={coords.y}
                        r={15 * intensity}
                        fill={`url(#cityGrad-${city})`}
                        opacity="0.5"
                        animate={{ 
                          opacity: [0.4, 0.8, 0.4],
                          scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      {/* Core layer */}
                      <motion.circle
                        cx={coords.x}
                        cy={coords.y}
                        r={10 * intensity}
                        fill={getMoodColor(getDominantEmotion(city))}
                        opacity="0.6"
                        filter="url(#strongGlow)"
                        animate={{ 
                          opacity: [0.5, 0.9, 0.5],
                          scale: [0.9, 1.1, 0.9]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </g>
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
                  const bubbleSize = Math.max(3, 3 + Math.min(count / 3, 8));
                  
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
                          duration: 2 + ((coords.x * coords.y) % 10) / 10,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      {/* Bubble highlight */}
                      <circle
                        cx={coords.x - bubbleSize * 0.3}
                        cy={coords.y - bubbleSize * 0.3}
                        r={Math.max(0.5, bubbleSize * 0.3)}
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
                  
                  return [...Array(Math.min(count, 12))].map((_, i) => {
                    // Deterministic particle motion based on city coords and particle index
                    const xOffset = ((i % 2 === 0 ? 1 : -1) * ((coords.x + i * 3) % 20)) / 2;
                    const yOffset = ((i % 3 === 0 ? 1 : -1) * ((coords.y + i * 2) % 20)) / 2;
                    const duration = 2 + ((i + coords.x) % 20) / 10;
                    
                    return (
                      <motion.circle
                        key={`particle-${city}-${i}`}
                        cx={coords.x}
                        cy={coords.y}
                        r={0.5}
                        fill={color}
                        animate={{
                          x: [0, xOffset],
                          y: [0, yOffset],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    );
                  });
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
              const markerSize = Math.max(2.5, vibeCount === 0 ? 2.5 : (isSelected || isHovered ? 5 : 4));

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

        {/* Enhanced Controls & Legend */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmotionLayers(!showEmotionLayers)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0"
            >
              {showEmotionLayers ? '🔥 Hide Emotion Layers' : '✨ Show Emotion Layers'}
            </Button>

            <div className="flex gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>Positive Vibes</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>Neutral Energy</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span>Intense Emotions</span>
              </div>
            </div>
          </div>
          
          {/* Live stats bar */}
          <div className="flex gap-4 justify-center items-center p-4 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-orange-900/30 rounded-2xl shadow-inner">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {Object.keys(cityData).filter(c => cityData[c].vibes.length > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Active Cities</div>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-purple-300 to-pink-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                {vibes.length}
              </div>
              <div className="text-xs text-muted-foreground">Total Vibes</div>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-pink-300 to-orange-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {Object.values(cityData).reduce((acc, data) => 
                  acc + Object.keys(data.emotions).length, 0
                )}
              </div>
              <div className="text-xs text-muted-foreground">Unique Emotions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
