'use client';

import type { Vibe } from '@/lib/types';
import { getEmotionByName } from '@/lib/data';
import type { AspectRatio } from './DownloadDialog';

interface VibeDownloadTemplateProps {
  vibe: Vibe;
  ratio: AspectRatio;
}

const ASPECT_DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  post: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
};

const EMOTION_GRADIENTS: Record<string, string> = {
  'Happy': 'linear-gradient(135deg, rgb(255, 184, 77) 0%, rgb(255, 167, 38) 50%, rgb(255, 149, 0) 100%)',
  'Sad': 'linear-gradient(135deg, rgb(100, 181, 246) 0%, rgb(66, 165, 245) 50%, rgb(33, 150, 243) 100%)',
  'Chill': 'linear-gradient(135deg, rgb(77, 208, 225) 0%, rgb(38, 198, 218) 50%, rgb(0, 188, 212) 100%)',
  'Motivated': 'linear-gradient(135deg, rgb(244, 143, 177) 0%, rgb(236, 64, 122) 50%, rgb(233, 30, 99) 100%)',
  'Lonely': 'linear-gradient(135deg, rgb(206, 147, 216) 0%, rgb(186, 104, 200) 50%, rgb(171, 71, 188) 100%)',
  'Angry': 'linear-gradient(135deg, rgb(255, 112, 67) 0%, rgb(255, 87, 34) 50%, rgb(244, 81, 30) 100%)',
  'Neutral': 'linear-gradient(135deg, rgb(144, 164, 174) 0%, rgb(120, 144, 156) 50%, rgb(96, 125, 139) 100%)',
  'Funny': 'linear-gradient(135deg, rgb(212, 225, 87) 0%, rgb(205, 220, 57) 50%, rgb(192, 202, 51) 100%)',
  'Festival Joy': 'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(168, 85, 247) 50%, rgb(124, 58, 237) 100%)',
  'Missing Home': 'linear-gradient(135deg, rgb(96, 165, 250) 0%, rgb(168, 85, 247) 50%, rgb(236, 72, 153) 100%)',
  'Exam Stress': 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(249, 115, 22) 50%, rgb(234, 179, 8) 100%)',
  'Wedding Excitement': 'linear-gradient(135deg, rgb(244, 114, 182) 0%, rgb(248, 113, 113) 50%, rgb(168, 85, 247) 100%)',
  'Religious Peace': 'linear-gradient(135deg, rgb(252, 211, 77) 0%, rgb(251, 146, 60) 50%, rgb(234, 179, 8) 100%)',
  'Family Bonding': 'linear-gradient(135deg, rgb(74, 222, 128) 0%, rgb(20, 184, 166) 50%, rgb(6, 182, 212) 100%)',
  'Career Anxiety': 'linear-gradient(135deg, rgb(79, 70, 229) 0%, rgb(29, 78, 216) 50%, rgb(55, 65, 81) 100%)',
  'Festive Nostalgia': 'linear-gradient(135deg, rgb(192, 132, 252) 0%, rgb(236, 72, 153) 50%, rgb(251, 146, 60) 100%)',
};

export function VibeDownloadTemplate({ vibe, ratio }: VibeDownloadTemplateProps) {
  const dimensions = ASPECT_DIMENSIONS[ratio];
  const emotion = getEmotionByName(vibe.emotion);
  const gradient = EMOTION_GRADIENTS[vibe.emotion] || EMOTION_GRADIENTS['Neutral'];
  const isStoryFormat = ratio === 'story';
  const isLandscape = ratio === 'landscape';

  return (
    <div
      id={`vibe-download-template-${vibe.id}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        background: gradient,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isStoryFormat ? '80px 60px' : isLandscape ? '60px 80px' : '70px 60px',
        }}
      >
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div
            style={{
              fontSize: isStoryFormat ? '180px' : isLandscape ? '140px' : '160px',
              lineHeight: 1,
              marginBottom: isStoryFormat ? '30px' : '20px',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
            }}
          >
            {vibe.emoji}
          </div>
          <h1
            style={{
              fontSize: isStoryFormat ? '80px' : isLandscape ? '70px' : '75px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginBottom: isStoryFormat ? '40px' : '30px',
              textShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            {vibe.emotion}
          </h1>
          {vibe.text && vibe.text.trim() && (
            <p
              style={{
                fontSize: isStoryFormat ? '42px' : isLandscape ? '36px' : '38px',
                fontWeight: 500,
                lineHeight: 1.6,
                maxWidth: isLandscape ? '70%' : '85%',
                margin: '0 auto',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                opacity: 0.95,
              }}
            >
              "{vibe.text}"
            </p>
          )}
          {vibe.isVoiceNote && (!vibe.text || !vibe.text.trim()) && (
            <div
              style={{
                fontSize: isStoryFormat ? '38px' : isLandscape ? '32px' : '34px',
                fontWeight: 600,
                lineHeight: 1.6,
                maxWidth: isLandscape ? '70%' : '85%',
                margin: '0 auto',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
              }}
            >
              <svg width={isStoryFormat ? '60' : '50'} height={isStoryFormat ? '60' : '50'} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="white" opacity="0.3" />
                <path
                  d="M12 6v12M8 10v4M16 10v4"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>Voice Note</span>
            </div>
          )}
        </div>

        <div
          style={{
            background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.95) 0%, rgba(236, 72, 153, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '30px',
            padding: isStoryFormat ? '32px 40px' : '28px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '3px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <svg width={isStoryFormat ? '56' : '48'} height={isStoryFormat ? '56' : '48'} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="white" opacity="0.2" />
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div
                style={{
                  fontSize: isStoryFormat ? '38px' : '34px',
                  fontWeight: 900,
                  color: 'white',
                  letterSpacing: '0.5px',
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
              >
                Made with Vibee
              </div>
              <div
                style={{
                  fontSize: isStoryFormat ? '24px' : '20px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                Express Your Emotions Freely
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: isStoryFormat ? '80px' : '70px',
              lineHeight: 1,
            }}
          >
            ✨
          </div>
        </div>
      </div>
    </div>
  );
}
