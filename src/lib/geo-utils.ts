import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';
import type { Location } from './types';

export function generateGeohash(lat: number, lng: number): string {
  return geohashForLocation([lat, lng]);
}

export function calculateDistance(
  loc1: Location,
  loc2: Location
): number {
  return distanceBetween([loc1.lat, loc1.lng], [loc2.lat, loc2.lng]);
}

export function getGeohashBounds(center: Location, radiusInKm: number) {
  return geohashQueryBounds([center.lat, center.lng], radiusInKm * 1000);
}

export async function getCurrentLocation(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        console.warn('Error getting location:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

export async function getCityFromCoordinates(
  lat: number,
  lng: number,
  apiKey?: string
): Promise<{ city?: string; state?: string; country?: string }> {
  if (!apiKey) {
    return {};
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      let city, state, country;

      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      return { city, state, country };
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
  }

  return {};
}

export function getMoodColor(emotion: string): string {
  const colorMap: Record<string, string> = {
    Happy: '#FCD34D',
    Sad: '#60A5FA',
    Chill: '#A78BFA',
    Motivated: '#F97316',
    Lonely: '#E879F9',
    Angry: '#EF4444',
    Neutral: '#9CA3AF',
    Funny: '#FBBF24',
    'Festival Joy': '#F472B6',
    'Missing Home': '#818CF8',
    'Exam Stress': '#DC2626',
    'Wedding Excitement': '#EC4899',
    'Religious Peace': '#34D399',
    'Family Bonding': '#FB923C',
    'Career Anxiety': '#F59E0B',
    'Festive Nostalgia': '#C084FC',
  };
  return colorMap[emotion] || '#9CA3AF';
}

export const EMOTION_ICONS: Record<string, string> = {
  Happy: '😊',
  Sad: '😢',
  Chill: '😌',
  Motivated: '🔥',
  Lonely: '🥺',
  Angry: '😠',
  Neutral: '😐',
  Funny: '😂',
  'Festival Joy': '🎉',
  'Missing Home': '🏡',
  'Exam Stress': '📚',
  'Wedding Excitement': '💒',
  'Religious Peace': '🙏',
  'Family Bonding': '👨‍👩‍👧‍👦',
  'Career Anxiety': '💼',
  'Festive Nostalgia': '🪔',
};
