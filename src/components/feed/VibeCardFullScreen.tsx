'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, MessageCircle, SkipForward, Sparkles, MapPin, Volume2, Download } from 'lucide-react';
import type { Vibe } from '@/lib/types';
import { VoiceWavePlayer } from './VoiceWavePlayer';
import { DownloadDialog } from '@/components/DownloadDialog';

interface VibeCardFullScreenProps {
  vibe: Vibe;
  onInteraction: (type: 'interest' | 'share' | 'react' | 'skip' | 'more-like-this', emoji?: string) => void;
  onListenProgress?: (vibeId: string, currentTime: number, duration: number) => void;
}

const EMOTION_GRADIENTS: Record<string, string> = {
  'Happy': 'from-yellow-400 via-orange-400 to-pink-500',
  'Sad': 'from-blue-600 via-indigo-700 to-purple-800',
  'Chill': 'from-teal-400 via-cyan-500 to-blue-500',
  'Motivated': 'from-orange-500 via-red-500 to-pink-600',
  'Lonely': 'from-indigo-500 via-purple-600 to-pink-700',
  'Angry': 'from-red-600 via-orange-700 to-red-900',
  'Neutral': 'from-gray-500 via-gray-600 to-gray-700',
  'Funny': 'from-green-400 via-yellow-400 to-orange-400',
  'Festival Joy': 'from-pink-400 via-purple-500 to-indigo-500',
  'Missing Home': 'from-blue-400 via-purple-500 to-pink-600',
  'Exam Stress': 'from-red-500 via-orange-600 to-yellow-500',
  'Wedding Excitement': 'from-pink-400 via-red-400 to-purple-500',
  'Religious Peace': 'from-amber-300 via-orange-400 to-yellow-500',
  'Family Bonding': 'from-green-400 via-teal-500 to-cyan-500',
  'Career Anxiety': 'from-indigo-600 via-blue-700 to-gray-800',
  'Festive Nostalgia': 'from-purple-400 via-pink-500 to-orange-400',
};

const EMOTION_EMOJIS: Record<string, string> = {
  'Happy': '😊',
  'Sad': '😢',
  'Chill': '😌',
  'Motivated': '🔥',
  'Lonely': '💔',
  'Angry': '😠',
  'Neutral': '😐',
  'Funny': '😂',
  'Festival Joy': '🎉',
  'Missing Home': '🏠',
  'Exam Stress': '📚',
  'Wedding Excitement': '💒',
  'Religious Peace': '🕉️',
  'Family Bonding': '👨‍👩‍👧‍👦',
  'Career Anxiety': '💼',
  'Festive Nostalgia': '🎊',
};

const REACTION_EMOJIS = ['❤️', '🙏', '💪', '😢', '😂', '🔥', '✨', '👏'];

export function VibeCardFullScreen({ vibe, onInteraction, onListenProgress }: VibeCardFullScreenProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const gradient = EMOTION_GRADIENTS[vibe.emotion] || 'from-purple-600 to-pink-600';
  const emotionEmoji = EMOTION_EMOJIS[vibe.emotion] || '💭';

  const handleReaction = (emoji: string) => {
    onInteraction('react', emoji);
    setShowReactions(false);
    setHasInteracted(true);
  };

  const handleInterest = () => {
    onInteraction('interest');
    setHasInteracted(true);
  };

  return (
    <div className={`h-full w-full bg-gradient-to-br ${gradient} relative overflow-hidden`} id={`vibe-fullscreen-${vibe.id}`}>
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative h-full flex flex-col justify-between p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
              {vibe.author.avatarUrl ? (
                <img src={vibe.author.avatarUrl} alt={vibe.author.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl">{emotionEmoji}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-lg">{vibe.author.name}</p>
              {vibe.location?.city && (
                <div className="flex items-center gap-1 text-sm opacity-90">
                  <MapPin className="w-3 h-3" />
                  <span>{vibe.location.city}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/40">
            <span className="text-xl">{emotionEmoji}</span>
            <span className="text-sm font-medium">{vibe.emotion}</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            {vibe.isVoiceNote && vibe.audioUrl ? (
              <div className="space-y-6">
                {vibe.text && (
                  <p className="text-2xl md:text-3xl font-medium leading-relaxed text-center text-white/90 mb-8">
                    {vibe.text}
                  </p>
                )}
                <VoiceWavePlayer
                  audioUrl={vibe.audioUrl}
                  duration={vibe.audioDuration}
                  vibeId={vibe.id}
                  onProgress={onListenProgress}
                />
              </div>
            ) : (
              <p className="text-3xl md:text-4xl lg:text-5xl font-medium leading-relaxed text-center">
                {vibe.text}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {vibe.viewCount && vibe.viewCount > 0 && (
            <p className="text-center text-sm opacity-80">
              {vibe.viewCount} {vibe.viewCount === 1 ? 'person' : 'people'} felt this vibe
            </p>
          )}

          <div className="flex items-center justify-around">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleInterest}
              className={`flex flex-col items-center gap-2 p-3 ${hasInteracted ? 'opacity-50' : ''}`}
              disabled={hasInteracted}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/60 hover:bg-white/30 transition-colors">
                <Heart className={`w-6 h-6 ${hasInteracted ? 'fill-red-500 text-red-500' : ''}`} />
              </div>
              <span className="text-xs font-medium">Interest</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowReactions(!showReactions)}
              className="flex flex-col items-center gap-2 p-3"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/60 hover:bg-white/30 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">React</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onInteraction('share')}
              className="flex flex-col items-center gap-2 p-3"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/60 hover:bg-white/30 transition-colors">
                <Share2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Share</span>
            </motion.button>

            <DownloadDialog
              vibe={vibe}
              trigger={
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 backdrop-blur-sm flex items-center justify-center border-2 border-purple-400/70 hover:border-pink-400/90 hover:bg-gradient-to-br hover:from-purple-500/60 hover:to-pink-500/60 transition-all duration-300">
                    <Download className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">Download</span>
                </motion.button>
              }
            />

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onInteraction('skip')}
              className="flex flex-col items-center gap-2 p-3"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/60 hover:bg-white/30 transition-colors">
                <SkipForward className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">Skip</span>
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onInteraction('more-like-this')}
            className="w-full py-3 px-4 bg-white/20 backdrop-blur-sm rounded-full border border-white/60 hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Show me more like this</span>
          </motion.button>
        </div>
      </div>

      {showReactions && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute bottom-48 left-0 right-0 flex justify-center"
        >
          <div className="bg-white/20 backdrop-blur-lg rounded-full p-3 flex gap-3 border border-white/40">
            {REACTION_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReaction(emoji)}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-2xl transition-colors"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
