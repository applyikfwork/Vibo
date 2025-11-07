'use client';

import { useState } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, StopCircle, RotateCcw, Play, Pause } from 'lucide-react';
import { EmotionCategory } from '@/lib/types';
import { emotions } from '@/lib/data';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number, selectedEmotion: EmotionCategory) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const {
    recordingState,
    audioBlob,
    duration,
    errorMessage,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder(30);

  const [selectedEmotion, setSelectedEmotion] = useState<EmotionCategory>('Happy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioBlob) return;

    if (!audioElement) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSubmit = () => {
    if (audioBlob && selectedEmotion) {
      onRecordingComplete(audioBlob, duration, selectedEmotion);
    }
  };

  const progressPercentage = (duration / 30) * 100;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-purple-600" />
          🎙️ Voice Vibe Recorder
        </CardTitle>
        <CardDescription>
          Record your emotional voice note (max 30 seconds) and select how you're feeling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* Recording Status */}
        <AnimatePresence mode="wait">
          {recordingState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="mb-4 text-6xl animate-pulse">🎤</div>
              <p className="text-gray-600 mb-6">Ready to share your voice vibe!</p>
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            </motion.div>
          )}

          {recordingState === 'recording' && (
            <motion.div
              key="recording"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="text-center py-8"
            >
              <div className="mb-4">
                <div className="text-6xl animate-bounce mb-2">🔴</div>
                <p className="text-red-600 font-bold">Recording...</p>
              </div>
              <div className="mb-4">
                <p className="text-3xl font-mono font-bold text-purple-600">
                  {formatTime(duration)}
                </p>
                <p className="text-sm text-gray-500">/ {formatTime(30)}</p>
              </div>
              <Progress value={progressPercentage} className="h-2 mb-4" />
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
              >
                <StopCircle className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            </motion.div>
          )}

          {recordingState === 'finished' && audioBlob && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <div className="text-5xl mb-2">✅</div>
                <p className="text-green-600 font-semibold">Recording Complete!</p>
                <p className="text-sm text-gray-600">Duration: {formatTime(duration)}</p>
              </div>

              {/* Preview Playback */}
              <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Preview:</span>
                  <Button
                    onClick={handlePlayPause}
                    size="sm"
                    variant="outline"
                  >
                    {isPlaying ? (
                      <><Pause className="mr-2 h-4 w-4" /> Pause</>
                    ) : (
                      <><Play className="mr-2 h-4 w-4" /> Play</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Emotion Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  How are you feeling in this voice note?
                </label>
                <Select value={selectedEmotion} onValueChange={(value) => setSelectedEmotion(value as EmotionCategory)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    {emotions.map((emotion) => (
                      <SelectItem key={emotion.name} value={emotion.name}>
                        <span className="flex items-center gap-2">
                          <span>{emotion.emoji}</span>
                          <span>{emotion.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={resetRecording}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Re-record
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Post Voice Vibe
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Button */}
        {recordingState === 'idle' && (
          <div className="text-center">
            <Button onClick={onCancel} variant="ghost" size="sm">
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
