'use server';

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyHoroscope } from '@/ai/flows/generate-daily-horoscope';
import type { ZodiacSign, EmotionCategory } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zodiacSign, currentMood } = body as {
      zodiacSign: ZodiacSign;
      currentMood?: EmotionCategory;
    };

    if (!zodiacSign) {
      return NextResponse.json(
        { error: 'Zodiac sign is required' },
        { status: 400 }
      );
    }

    const horoscope = await generateDailyHoroscope({
      zodiacSign,
      currentMood,
    });

    return NextResponse.json(horoscope);
  } catch (error: any) {
    console.error('Error generating horoscope:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate horoscope' },
      { status: 500 }
    );
  }
}
