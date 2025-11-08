'use client';

import { useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import type { Vibe, Location } from '@/lib/types';
import { getMoodColor } from '@/lib/geo-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  emotion: string;
  size: number;
  life: number;
  maxLife: number;
}

interface EmotionParticleMapProps {
  center?: Location;
  vibes: Vibe[];
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.75rem',
};

export function EmotionParticleMap({ center, vibes }: EmotionParticleMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-particles',
    googleMapsApiKey: apiKey,
  });

  const defaultCenter = center
    ? { lat: center.lat, lng: center.lng }
    : { lat: 28.6139, lng: 77.2090 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const emotionClusters = vibes.reduce((acc, vibe) => {
      if (!vibe.location) return acc;
      
      if (!acc[vibe.emotion]) {
        acc[vibe.emotion] = [];
      }
      acc[vibe.emotion].push(vibe);
      return acc;
    }, {} as Record<string, Vibe[]>);

    Object.entries(emotionClusters).forEach(([emotion, emotionVibes]) => {
      if (emotionVibes.length === 0) return;

      const centerVibe = emotionVibes[Math.floor(emotionVibes.length / 2)];
      const centerX = canvas.width * 0.5;
      const centerY = canvas.height * 0.5;

      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 100,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: getMoodColor(emotion),
          emotion,
          size: 2 + Math.random() * 4,
          life: 0,
          maxLife: 100 + Math.random() * 100,
        });
      }
    });

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        const alpha = 1 - (particle.life / particle.maxLife);
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        particlesRef.current.forEach(other => {
          if (particle === other) return;
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 50 && particle.emotion === other.emotion) {
            ctx.strokeStyle = particle.color + '30';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        return particle.life < particle.maxLife;
      });

      if (Math.random() > 0.95 && particlesRef.current.length < 200) {
        const emotions = Object.keys(emotionClusters);
        if (emotions.length > 0) {
          const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.5 + Math.random() * 1.5;

          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: getMoodColor(randomEmotion),
            emotion: randomEmotion,
            size: 2 + Math.random() * 4,
            life: 0,
            maxLife: 100 + Math.random() * 100,
          });
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [vibes]);

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>✨ Emotion Particle Flow</CardTitle>
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
          ✨ Emotion Particle Flow
        </CardTitle>
        <CardDescription>
          Animated particles representing emotional energy flowing through your city
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-lg pointer-events-none z-10"
          style={{ mixBlendMode: 'screen' }}
        />
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ lightness: -50 }],
              },
            ],
          }}
        />
      </CardContent>
    </Card>
  );
}
