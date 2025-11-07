'use client';

import { useState, useEffect } from 'react';
import { MapPin, Lock, Unlock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCurrentLocation, generateGeohash, getCityFromCoordinates } from '@/lib/geo-utils';
import type { Location } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function LocationCapture() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [location, setLocation] = useState<Location | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableLocation = async () => {
    setIsLoading(true);
    try {
      const position = await getCurrentLocation();
      if (!position) {
        toast({
          title: 'Location Access Denied',
          description: 'Please enable location permissions to use GeoVibe features.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { latitude, longitude } = position.coords;
      const geohash = generateGeohash(latitude, longitude);
      
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const cityData = await getCityFromCoordinates(latitude, longitude, apiKey);

      const newLocation: Location = {
        lat: latitude,
        lng: longitude,
        city: cityData.city,
        state: cityData.state,
        country: cityData.country,
        geohash,
      };

      setLocation(newLocation);
      setIsEnabled(true);

      if (user && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        await updateDoc(userRef, {
          location: newLocation,
          enableLocationSharing: true,
        });
      }

      toast({
        title: 'Location Enabled!',
        description: `You're now sharing from ${newLocation.city || 'your area'} 🌍`,
      });
    } catch (error) {
      console.error('Error enabling location:', error);
      toast({
        title: 'Error',
        description: 'Failed to get your location. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableLocation = async () => {
    setIsEnabled(false);
    setLocation(null);

    if (user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        enableLocationSharing: false,
      });
    }

    toast({
      title: 'Location Disabled',
      description: 'Your location is no longer being shared.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          GeoVibe Location
        </CardTitle>
        <CardDescription>
          Share your location to see nearby vibes and contribute to your city's mood pulse
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="location-toggle" className="flex items-center gap-2">
            {isEnabled ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {isEnabled ? 'Location Sharing Enabled' : 'Enable Location Sharing'}
          </Label>
          <Switch
            id="location-toggle"
            checked={isEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                handleEnableLocation();
              } else {
                handleDisableLocation();
              }
            }}
            disabled={isLoading}
          />
        </div>

        {location && isEnabled && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Your Current Location:</p>
            <p className="text-sm text-muted-foreground">
              📍 {location.city || 'Unknown City'}
              {location.state && `, ${location.state}`}
              {location.country && `, ${location.country}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
            </p>
          </div>
        )}

        {!isEnabled && (
          <div className="rounded-lg bg-muted/50 border-2 border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              🔒 Your location is private. Enable to unlock GeoVibe features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
