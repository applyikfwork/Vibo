'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Palette, Sun, Moon, Sparkles, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

export type MapThemeType = 'default' | 'dark-glow' | 'pastel' | 'vibrant-neon' | 'monsoon' | 'summer';

interface MapThemeConfig {
  id: MapThemeType;
  name: string;
  description: string;
  icon: React.ReactNode;
  styles: google.maps.MapTypeStyle[];
  preview: string;
  season?: string;
}

interface MapThemeSelectorProps {
  selectedTheme: MapThemeType;
  onThemeChange: (theme: MapThemeType) => void;
}

export const MAP_THEMES: Record<MapThemeType, google.maps.MapTypeStyle[]> = {
  default: [],
  'dark-glow': [
    {
      elementType: 'geometry',
      stylers: [{ color: '#1a1a2e' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8ec3b9' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1a1a2e' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#16213e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#2f3542' }],
    },
  ],
  pastel: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#fef6f0' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#a08fb2' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c4dfe6' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#f7d1cd' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#d4edda' }],
    },
  ],
  'vibrant-neon': [
    {
      elementType: 'geometry',
      stylers: [{ color: '#0f0f23' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#00ff88' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#0f0f23' }, { weight: 2 }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#1a1a3e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ff006e' }, { lightness: -20 }],
    },
  ],
  monsoon: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#2c3e50' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#95a5a6' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#34495e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#7f8c8d' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#27ae60' }],
    },
  ],
  summer: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#fff8dc' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ff6b35' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#4facfe' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#feca57' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#26de81' }],
    },
  ],
};

export function MapThemeSelector({ selectedTheme, onThemeChange }: MapThemeSelectorProps) {
  const themes: MapThemeConfig[] = [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard Google Maps theme',
      icon: <Palette className="h-5 w-5" />,
      styles: MAP_THEMES.default,
      preview: 'bg-gradient-to-br from-blue-100 to-green-100',
    },
    {
      id: 'dark-glow',
      name: 'Dark Glow',
      description: 'Dark mode with glowing emotion markers',
      icon: <Moon className="h-5 w-5" />,
      styles: MAP_THEMES['dark-glow'],
      preview: 'bg-gradient-to-br from-gray-900 to-blue-900',
    },
    {
      id: 'pastel',
      name: 'Pastel Dreams',
      description: 'Soft, calming pastel colors',
      icon: <Sparkles className="h-5 w-5" />,
      styles: MAP_THEMES.pastel,
      preview: 'bg-gradient-to-br from-pink-100 to-purple-100',
    },
    {
      id: 'vibrant-neon',
      name: 'Vibrant Neon',
      description: 'High-energy neon aesthetic',
      icon: <Sparkles className="h-5 w-5" />,
      styles: MAP_THEMES['vibrant-neon'],
      preview: 'bg-gradient-to-br from-purple-900 to-pink-900',
    },
    {
      id: 'monsoon',
      name: 'Monsoon Blues',
      description: 'Rainy season vibes',
      icon: <Droplets className="h-5 w-5" />,
      styles: MAP_THEMES.monsoon,
      preview: 'bg-gradient-to-br from-slate-700 to-blue-700',
      season: '🌧️ Seasonal',
    },
    {
      id: 'summer',
      name: 'Summer Yellows',
      description: 'Bright and sunny atmosphere',
      icon: <Sun className="h-5 w-5" />,
      styles: MAP_THEMES.summer,
      preview: 'bg-gradient-to-br from-yellow-200 to-orange-200',
      season: '☀️ Seasonal',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Map Themes
        </CardTitle>
        <CardDescription>
          Customize your emotional map experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={selectedTheme === theme.id ? 'default' : 'outline'}
                className="h-auto w-full p-4 flex flex-col items-start gap-3"
                onClick={() => onThemeChange(theme.id)}
              >
                <div className="flex items-center justify-between w-full">
                  {theme.icon}
                  {theme.season && (
                    <Badge variant="secondary" className="text-xs">
                      {theme.season}
                    </Badge>
                  )}
                </div>
                <div className={`w-full h-16 rounded-lg ${theme.preview}`} />
                <div className="text-left w-full">
                  <div className="font-semibold text-sm">{theme.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {theme.description}
                  </div>
                </div>
                {selectedTheme === theme.id && (
                  <Badge className="w-full justify-center">
                    ✓ Active
                  </Badge>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
