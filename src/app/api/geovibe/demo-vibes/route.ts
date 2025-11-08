import { NextRequest, NextResponse } from 'next/server';
import { demoDataService } from '@/lib/demo-data-service';

export async function POST(request: NextRequest) {
  try {
    const { city, count = 20 } = await request.json();

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    const demoVibes = demoDataService.generateDemoVibesForCity(city, count);
    const emotionWaves = demoDataService.generateEmotionWaves(city);

    return NextResponse.json({
      vibes: demoVibes,
      waves: emotionWaves,
      isDemoData: true,
      message: `Demo data for ${city}`,
    });
  } catch (error) {
    console.error('Error generating demo vibes:', error);
    return NextResponse.json(
      { error: 'Failed to generate demo vibes' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    if (!city) {
      const allCities = demoDataService.getAllCities();
      return NextResponse.json({
        cities: allCities.map(c => ({ city: c.city, state: c.state })),
      });
    }

    const cityConfig = demoDataService.getCityConfig(city);
    
    if (!cityConfig) {
      return NextResponse.json(
        { error: 'City not found in demo configuration' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      city: cityConfig.city,
      state: cityConfig.state,
      locations: cityConfig.locations.map(loc => ({
        name: loc.name,
        type: loc.type,
        lat: loc.lat,
        lng: loc.lng,
      })),
    });
  } catch (error) {
    console.error('Error fetching demo city info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo city info' },
      { status: 500 }
    );
  }
}
