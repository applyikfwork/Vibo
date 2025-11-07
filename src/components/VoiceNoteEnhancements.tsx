'use client';

import { motion } from 'framer-motion';
import { Mic, Volume2, Clock } from 'lucide-react';

interface VoiceNoteWaveformProps {
  audioLevels?: number[];
  isRecording: boolean;
}

export function VoiceNoteWaveform({ audioLevels, isRecording }: VoiceNoteWaveformProps) {
  const levels = audioLevels || new Array(20).fill(8);

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {levels.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-full"
          style={{ height: `${height}px` }}
          animate={!isRecording ? {
            height: 8,
          } : undefined}
          transition={{
            duration: 0.1,
          }}
        />
      ))}
    </div>
  );
}

export function VoiceNoteStats({ duration, actualBlobSize }: { duration: number; actualBlobSize?: number }) {
  const getCompressionLevel = () => {
    if (actualBlobSize) {
      // Show actual blob size
      const sizeInKB = actualBlobSize / 1024;
      return `${sizeInKB.toFixed(1)} KB`;
    }
    if (duration === 0) return 'N/A';
    // Fallback estimate based on bitrate (24kbps)
    const estimatedSize = (duration * 24) / 8;
    return `~${estimatedSize.toFixed(1)} KB`;
  };

  const getActualBitrate = () => {
    if (actualBlobSize && duration > 0) {
      const bitrateKbps = (actualBlobSize * 8) / (duration * 1000);
      return `${bitrateKbps.toFixed(1)} kbps`;
    }
    return '24 kbps';
  };

  const getQualityLevel = () => {
    return 'Low Data';
  };

  return (
    <div className="grid grid-cols-3 gap-2 text-center bg-purple-50 rounded-lg p-3">
      <div>
        <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-semibold">Duration</span>
        </div>
        <div className="text-sm font-bold text-purple-900">{duration}s</div>
      </div>
      <div>
        <div className="flex items-center justify-center gap-1 text-pink-600 mb-1">
          <Volume2 className="h-3 w-3" />
          <span className="text-xs font-semibold">Bitrate</span>
        </div>
        <div className="text-sm font-bold text-pink-900">{getActualBitrate()}</div>
      </div>
      <div>
        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
          <Mic className="h-3 w-3" />
          <span className="text-xs font-semibold">Size</span>
        </div>
        <div className="text-sm font-bold text-blue-900">{getCompressionLevel()}</div>
      </div>
    </div>
  );
}

export function VoiceNoteIndicator() {
  return (
    <motion.div
      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    >
      <motion.div
        className="w-2 h-2 bg-red-500 rounded-full"
        animate={{
          opacity: [1, 0.3, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />
      <span className="text-xs font-semibold text-purple-900">Voice Note</span>
    </motion.div>
  );
}
