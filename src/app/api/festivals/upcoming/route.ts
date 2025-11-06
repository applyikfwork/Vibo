'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingFestivals, getCurrentFestivalSeason } from '@/lib/indian-festivals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '60');

    const upcomingFestivals = getUpcomingFestivals(days);
    const currentSeason = getCurrentFestivalSeason();

    return NextResponse.json({
      upcoming: upcomingFestivals,
      currentSeason,
    });
  } catch (error: any) {
    console.error('Error fetching festivals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch festivals' },
      { status: 500 }
    );
  }
}
