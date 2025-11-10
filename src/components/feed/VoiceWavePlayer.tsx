'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceWavePlayerProps {
  audioUrl: string;
  duration?: number;
  vibeId: string;
  onProgress?: (vibeId: string, currentTime: number, duration: number) => void;
}

export function VoiceWavePlayer({ audioUrl, duration, vibeId, onProgress }: VoiceWavePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onProgress) {
        onProgress(vibeId, audio.currentTime, audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [vibeId, onProgress]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audioDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.random() * 60 + 40;
    return height;
  });

  return (
    <div className="w-full space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlayPause}
          className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/60 hover:bg-white/40 transition-colors flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" fill="white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          )}
        </motion.button>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 h-16">
            <Volume2 className="w-5 h-5 text-white/80 flex-shrink-0" />
            <div 
              className="flex-1 h-full flex items-end gap-0.5 cursor-pointer"
              onClick={handleSeek}
            >
              {waveformBars.map((height, index) => {
                const barProgress = (index / waveformBars.length) * 100;
                const isActive = barProgress <= progress;
                return (
                  <motion.div
                    key={index}
                    className={`flex-1 rounded-full transition-colors ${
                      isActive ? 'bg-white' : 'bg-white/30'
                    }`}
                    style={{ height: `${height}%` }}
                    initial={{ scaleY: 0 }}
                    animate={{ 
                      scaleY: isPlaying && isActive ? [1, 1.2, 1] : 1 
                    }}
                    transition={{
                      repeat: isPlaying && isActive ? Infinity : 0,
                      duration: 0.5,
                      delay: index * 0.05,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-between text-xs text-white/80 px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>
        </div>
      </div>

      <div 
        className="w-full h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer backdrop-blur-sm"
        onClick={handleSeek}
      >
        <motion.div 
          className="h-full bg-white rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}
