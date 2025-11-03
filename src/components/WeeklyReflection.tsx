'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Heart, Sparkles, Calendar } from 'lucide-react';
import type { WeeklyReflectionOutput } from '@/ai/flows/generate-weekly-reflection';

type WeeklyReflectionProps = {
  userId: string;
};

export function WeeklyReflection({ userId }: WeeklyReflectionProps) {
  const [reflection, setReflection] = useState<WeeklyReflectionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReflection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reflection/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reflection');
      }

      const data = await response.json();
      setReflection(data.reflection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lastReflectionDate = localStorage.getItem(`lastReflection_${userId}`);
    const today = new Date().toDateString();
    
    if (!lastReflectionDate || lastReflectionDate !== today) {
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0) {
        loadReflection();
        localStorage.setItem(`lastReflection_${userId}`, today);
      }
    }
  }, [userId]);

  if (!reflection && !isLoading && !error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Weekly Reflection</h3>
              <p className="text-sm text-gray-600">Get insights into your emotional journey</p>
            </div>
          </div>
          <button
            onClick={loadReflection}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Generate Reflection
          </button>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
          <p className="text-gray-600">Analyzing your emotional week...</p>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 mb-8">
        <p className="text-red-600">Failed to generate reflection: {error}</p>
      </div>
    );
  }

  if (!reflection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-8 mb-8 shadow-xl border border-purple-100"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Weekly Reflection
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">Summary</h3>
          <p className="text-gray-700 leading-relaxed">{reflection.summary}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-lg text-gray-800">Emotional Pattern</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{reflection.emotionalPattern}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {reflection.dominantEmotions.map((emotion, i) => (
              <span 
                key={i}
                className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>

        {reflection.growthMoments.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <h3 className="font-semibold text-lg text-gray-800">Growth Moments</h3>
            </div>
            <ul className="space-y-2">
              {reflection.growthMoments.map((moment, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-pink-500 mt-1">•</span>
                  <span>{moment}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reflection.healingInsights.length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-lg text-gray-800">What Helped You</h3>
            </div>
            <ul className="space-y-2">
              {reflection.healingInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-5">
          <h3 className="font-semibold text-lg mb-2 text-purple-800">Looking Ahead</h3>
          <p className="text-purple-700 leading-relaxed italic">{reflection.encouragement}</p>
        </div>

        <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-xl p-4">
          <span className="text-gray-700 font-medium">Emotional Connection Score</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-8 rounded-sm ${
                    i < reflection.connectionScore
                      ? 'bg-gradient-to-t from-purple-500 to-pink-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-purple-600">{reflection.connectionScore}/10</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
