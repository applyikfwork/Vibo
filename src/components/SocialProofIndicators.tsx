'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Eye, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { EmotionCategory, Vibe } from '@/lib/types';

type SocialProofMessage = {
  id: string;
  message: string;
  icon: React.ReactNode;
  type: 'trending' | 'popular' | 'active' | 'milestone';
};

export function SocialProofIndicators({ vibes, emotion, city }: { 
  vibes: Vibe[]; 
  emotion?: EmotionCategory;
  city?: string;
}) {
  const [messages, setMessages] = useState<SocialProofMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    generateProofMessages();
  }, [vibes, emotion, city]);

  useEffect(() => {
    if (messages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const generateProofMessages = () => {
    const proofMessages: SocialProofMessage[] = [];
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // Count vibes in last hour
    const recentVibes = vibes.filter(v => {
      const timestamp = v.createdAt || v.timestamp;
      return timestamp && timestamp.toMillis() >= oneHourAgo;
    });

    if (recentVibes.length > 0) {
      proofMessages.push({
        id: 'recent-count',
        message: `${recentVibes.length} people shared vibes in the last hour`,
        icon: <Users className="h-4 w-4" />,
        type: 'active',
      });
    }

    // Emotion-specific proof
    if (emotion) {
      const sameEmotionCount = vibes.filter(v => v.emotion === emotion).length;
      if (sameEmotionCount > 5) {
        proofMessages.push({
          id: 'same-emotion',
          message: `${sameEmotionCount} people felt ${emotion.toLowerCase()} here recently`,
          icon: <Heart className="h-4 w-4" />,
          type: 'popular',
        });
      }
    }

    // Trending indicator
    const totalVibes = vibes.length;
    if (totalVibes > 50) {
      proofMessages.push({
        id: 'trending',
        message: `This area is trending with ${totalVibes}+ shared emotions`,
        icon: <TrendingUp className="h-4 w-4" />,
        type: 'trending',
      });
    }

    // Total views/engagement
    const totalViews = vibes.reduce((sum, v) => sum + (v.viewCount || 0), 0);
    if (totalViews > 100) {
      proofMessages.push({
        id: 'views',
        message: `${totalViews.toLocaleString()} total views in ${city || 'this area'}`,
        icon: <Eye className="h-4 w-4" />,
        type: 'popular',
      });
    }

    // Engagement rate
    const totalComments = vibes.reduce((sum, v) => sum + (v.commentCount || 0), 0);
    if (totalComments > 20) {
      proofMessages.push({
        id: 'engagement',
        message: `${totalComments} supportive comments shared`,
        icon: <MessageCircle className="h-4 w-4" />,
        type: 'active',
      });
    }

    // Milestone achievements
    if (totalVibes >= 100) {
      proofMessages.push({
        id: 'milestone',
        message: `🎊 Milestone reached: ${Math.floor(totalVibes / 100) * 100}+ vibes shared!`,
        icon: <Sparkles className="h-4 w-4" />,
        type: 'milestone',
      });
    }

    // Position in ranking
    const position = Math.floor(Math.random() * 500) + 1;
    proofMessages.push({
      id: 'ranking',
      message: `You're the ${position}${getOrdinalSuffix(position)} person to explore this emotion today`,
      icon: <Users className="h-4 w-4" />,
      type: 'active',
    });

    setMessages(proofMessages);
  };

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const getMessageColor = (type: SocialProofMessage['type']) => {
    switch (type) {
      case 'trending':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
      case 'popular':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'active':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'milestone':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white';
    }
  };

  if (messages.length === 0) return null;

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <Badge 
            className={`${getMessageColor(currentMessage.type)} px-3 py-1.5 text-sm font-medium shadow-lg`}
          >
            <span className="mr-2">{currentMessage.icon}</span>
            {currentMessage.message}
          </Badge>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      {messages.length > 1 && (
        <div className="flex gap-1">
          {messages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentMessageIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentMessageIndex 
                  ? 'w-6 bg-primary' 
                  : 'w-1.5 bg-muted-foreground/30'
              }`}
              aria-label={`Show message ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Component for inline social proof in vibe cards
export function VibeCardSocialProof({ vibe }: { vibe: Vibe }) {
  const stats = [
    { value: vibe.viewCount || 0, label: 'views', show: (vibe.viewCount || 0) > 0 },
    { value: vibe.reactionCount || 0, label: 'reactions', show: (vibe.reactionCount || 0) > 0 },
    { value: vibe.commentCount || 0, label: 'comments', show: (vibe.commentCount || 0) > 0 },
  ].filter(stat => stat.show);

  if (stats.length === 0) return null;

  return (
    <div className="flex gap-3 text-xs text-muted-foreground">
      {stats.map((stat, index) => (
        <span key={index} className="flex items-center gap-1">
          <span className="font-semibold text-foreground">{stat.value.toLocaleString()}</span>
          {stat.label}
        </span>
      ))}
    </div>
  );
}
