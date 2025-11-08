'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import type { Vibe, Location } from '@/lib/types';
import { getMoodColor, EMOTION_ICONS } from '@/lib/geo-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface Emotion3DBubblesProps {
  center?: Location;
  vibes: Vibe[];
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem',
};

export function Emotion3DBubbles({ center, vibes }: Emotion3DBubblesProps) {
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [activeBubbles, setActiveBubbles] = useState<Vibe[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-3d-bubbles',
    googleMapsApiKey: apiKey,
  });

  const defaultCenter = center
    ? { lat: center.lat, lng: center.lng }
    : { lat: 28.6139, lng: 77.2090 };

  useEffect(() => {
    setActiveBubbles(vibes);

    const interval = setInterval(() => {
      const shouldPop = Math.random() > 0.95;
      if (shouldPop && vibes.length > 0) {
        const randomIndex = Math.floor(Math.random() * vibes.length);
        setActiveBubbles(prev => prev.filter((_, i) => i !== randomIndex));
        
        setTimeout(() => {
          setActiveBubbles(prev => [...prev, vibes[randomIndex]]);
        }, 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [vibes]);

  const getBubbleSize = (vibe: Vibe): number => {
    const baseSize = 40;
    const intensityMultiplier = (vibe.emotionStrength || 50) / 50;
    return baseSize * intensityMultiplier;
  };

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🫧 3D Emotion Bubbles</CardTitle>
          <CardDescription>Configure Google Maps API key</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🫧 3D Emotion Bubbles
        </CardTitle>
        <CardDescription>
          Floating emotion bubbles with intensity-based sizes • Click to explore
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          <AnimatePresence>
            {activeBubbles.filter(vibe => vibe.location).map((vibe) => (
              <OverlayView
                key={vibe.id}
                position={{ lat: vibe.location!.lat, lng: vibe.location!.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    y: [0, -10, 0],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    scale: { duration: 0.5 },
                    opacity: { duration: 0.5 },
                  }}
                  onClick={() => setSelectedVibe(vibe)}
                  className="cursor-pointer relative"
                  style={{
                    width: `${getBubbleSize(vibe)}px`,
                    height: `${getBubbleSize(vibe)}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center text-2xl shadow-lg hover:shadow-2xl transition-shadow"
                    style={{
                      backgroundColor: getMoodColor(vibe.emotion),
                      opacity: 0.8,
                      border: '3px solid white',
                    }}
                  >
                    {EMOTION_ICONS[vibe.emotion]}
                  </div>
                  
                  {selectedVibe?.id === vibe.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 min-w-[200px] z-50"
                    >
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-white transform rotate-45" />
                      </div>
                      <p className="font-semibold text-sm mb-1">
                        {EMOTION_ICONS[vibe.emotion]} {vibe.emotion}
                      </p>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                        {vibe.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {vibe.isAnonymous ? 'Anonymous' : vibe.author.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVibe(null);
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </OverlayView>
            ))}
          </AnimatePresence>
        </GoogleMap>
      </CardContent>
    </Card>
  );
}
