import { NextRequest, NextResponse } from 'next/server';
import { demoDataService } from '@/lib/demo-data-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    const waves = demoDataService.generateEmotionWaves(city);

    return NextResponse.json({
      waves,
      city,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching emotion waves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emotion waves' },
      { status: 500 }
    );
  }
}
