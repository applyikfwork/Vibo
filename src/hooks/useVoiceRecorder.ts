'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'finished';

export function useVoiceRecorder(maxDuration: number = 30) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(8));
  const [actualBlobSize, setActualBlobSize] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    analyserRef.current = null;
    audioChunksRef.current = [];
  }, []);

  // Analyze audio levels in real-time
  const analyzeAudioLevels = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 20 bars from the frequency data
    const barCount = 20;
    const samplesPerBar = Math.floor(dataArray.length / barCount);
    const levels = [];

    for (let i = 0; i < barCount; i++) {
      const start = i * samplesPerBar;
      const end = start + samplesPerBar;
      const slice = dataArray.slice(start, end);
      const average = slice.reduce((sum, value) => sum + value, 0) / slice.length;
      // Normalize to 8-40 pixel height range
      const height = Math.max(8, Math.min(40, (average / 255) * 40));
      levels.push(height);
    }

    setAudioLevels(levels);
    animationFrameRef.current = requestAnimationFrame(analyzeAudioLevels);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      setActualBlobSize(0); // Reset compression stats for new recording
      setAudioLevels(new Array(20).fill(8)); // Reset waveform to baseline
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Lower sample rate for compression
        } 
      });

      // Setup Web Audio API for real-time analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start analyzing audio levels
      analyzeAudioLevels();

      // Use webm for better compression (works on low internet)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 24000, // Low bitrate for compression
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        setActualBlobSize(audioBlob.size);
        setRecordingState('finished');
        stream.getTracks().forEach(track => track.stop());
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start();
      setRecordingState('recording');
      startTimeRef.current = Date.now();

      // Timer to track duration and auto-stop at max duration
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);

    } catch (error: any) {
      console.error('Error accessing microphone:', error);
      setErrorMessage('Microphone access denied. Please allow microphone permissions.');
      setRecordingState('idle');
    }
  }, [maxDuration, analyzeAudioLevels]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset recording
  const resetRecording = useCallback(() => {
    cleanup();
    setRecordingState('idle');
    setAudioBlob(null);
    setDuration(0);
    setErrorMessage(null);
    setActualBlobSize(0); // Reset compression stats
    setAudioLevels(new Array(20).fill(8)); // Reset waveform to baseline
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    recordingState,
    audioBlob,
    duration,
    errorMessage,
    audioLevels,
    actualBlobSize,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
