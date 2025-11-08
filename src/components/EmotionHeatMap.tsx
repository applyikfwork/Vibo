'use client';

import { useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import type { Vibe, Location } from '@/lib/types';
import { getMoodColor } from '@/lib/geo-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface EmotionHeatMapProps {
  center?: Location;
  vibes: Vibe[];
  onVibeClick?: (vibe: Vibe) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem',
};

const libraries: ("visualization")[] = ["visualization"];

export function EmotionHeatMap({ center, vibes, onVibeClick }: EmotionHeatMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const heatmapsRef = useRef<google.maps.visualization.HeatmapLayer[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-heatmap',
    googleMapsApiKey: apiKey,
    libraries,
  });

  const defaultCenter = center
    ? { lat: center.lat, lng: center.lng }
    : { lat: 28.6139, lng: 77.2090 };

  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google) return;

    heatmapsRef.current.forEach(heatmap => heatmap.setMap(null));
    heatmapsRef.current = [];

    const emotionGroups: Record<string, google.maps.LatLng[]> = {};

    vibes.forEach(vibe => {
      if (!vibe.location) return;
      
      const emotion = vibe.emotion;
      if (!emotionGroups[emotion]) {
        emotionGroups[emotion] = [];
      }
      
      emotionGroups[emotion].push(
        new google.maps.LatLng(vibe.location.lat, vibe.location.lng)
      );
    });

    Object.entries(emotionGroups).forEach(([emotion, points]) => {
      const gradient = generateGradient(getMoodColor(emotion));
      
      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: points,
        map: mapRef.current,
        gradient,
        radius: 50,
        opacity: 0.7,
      });

      heatmapsRef.current.push(heatmap);
    });

    return () => {
      heatmapsRef.current.forEach(heatmap => heatmap.setMap(null));
      heatmapsRef.current = [];
    };
  }, [vibes, isLoaded]);

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🗺️ Emotion Heat Map</CardTitle>
          <CardDescription>Configure Google Maps API key to view heat map</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Google Maps API key not configured
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
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
          🔥 Emotion Heat Map
        </CardTitle>
        <CardDescription>
          Gradient overlay showing emotion density across your city
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ saturation: -20 }],
              },
            ],
          }}
        />
      </CardContent>
    </Card>
  );
}

function generateGradient(color: string): string[] {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 };
  };

  const rgb = hexToRgb(color);

  return [
    'rgba(0, 0, 0, 0)',
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`,
    color,
  ];
}
