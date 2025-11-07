'use client';

import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import type { Vibe, Location } from '@/lib/types';
import { getMoodColor, EMOTION_ICONS } from '@/lib/geo-utils';
import { Map } from 'lucide-react';

interface GeoVibesMapProps {
  center?: Location;
  vibes: Vibe[];
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.75rem',
};

export function GeoVibesMap({ center, vibes }: GeoVibesMapProps) {
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const defaultCenter = center
    ? { lat: center.lat, lng: center.lng }
    : { lat: 28.6139, lng: 77.2090 };

  const onLoad = useCallback((map: google.maps.Map) => {
    if (vibes.length > 0 && vibes.some(v => v.location)) {
      const bounds = new window.google.maps.LatLngBounds();
      vibes.forEach(vibe => {
        if (vibe.location) {
          bounds.extend({ lat: vibe.location.lat, lng: vibe.location.lng });
        }
      });
      map.fitBounds(bounds);
    }
  }, [vibes]);

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            GeoVibes Map
          </CardTitle>
          <CardDescription>
            Configure Google Maps API key to view the emotion map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              🗺️ Google Maps API key not configured
            </p>
            <p className="text-xs text-muted-foreground">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
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
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          GeoVibes Map
        </CardTitle>
        <CardDescription>
          Live emotional landscape • {vibes.filter(v => v.location).length} active vibes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={onLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {vibes.filter(vibe => vibe.location).map((vibe) => (
            <Marker
              key={vibe.id}
              position={{ lat: vibe.location!.lat, lng: vibe.location!.lng }}
              onClick={() => setSelectedVibe(vibe)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: getMoodColor(vibe.emotion),
                fillOpacity: 0.8,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              label={{
                text: EMOTION_ICONS[vibe.emotion] || '😊',
                fontSize: '16px',
              }}
            />
          ))}

          {selectedVibe && selectedVibe.location && (
            <InfoWindow
              position={{ lat: selectedVibe.location.lat, lng: selectedVibe.location.lng }}
              onCloseClick={() => setSelectedVibe(null)}
            >
              <div className="p-2 max-w-xs">
                <p className="font-semibold text-sm mb-1">
                  {EMOTION_ICONS[selectedVibe.emotion]} {selectedVibe.emotion}
                </p>
                <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                  {selectedVibe.text}
                </p>
                <p className="text-xs text-gray-500">
                  by {selectedVibe.isAnonymous ? 'Anonymous' : selectedVibe.author.name}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </CardContent>
    </Card>
  );
}
