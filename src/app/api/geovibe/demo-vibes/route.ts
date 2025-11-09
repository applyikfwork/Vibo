import { NextRequest, NextResponse } from 'next/server';
import { demoDataService } from '@/lib/demo-data-service';
import { demoBlendingService } from '@/lib/demo-blending-service';
import { demoPersonaService } from '@/lib/demo-personas';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    const { city, count = 100, realVibes = [], realUserCount = 0, totalVibesCount = 0, useEnhanced = true } = body;

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    // Calculate actual real user metrics from provided real vibes
    const actualRealUserCount = realUserCount || realVibes.length;
    const actualTotalVibesCount = totalVibesCount || realVibes.length;

    let demoVibes: any[];
    let blendedVibes: any[];
    
    if (useEnhanced) {
      // Use new enhanced blending system
      const blendingRatio = demoBlendingService.calculateBlendingRatio({
        realUserCount: actualRealUserCount,
        totalVibesCount: actualTotalVibesCount,
        city,
      });

      // Only generate demo vibes if needed based on blending ratio
      if (blendingRatio.shouldShowDemo) {
        demoVibes = demoBlendingService.generateEnhancedDemoVibes(
          city,
          { realUserCount: actualRealUserCount, totalVibesCount: actualTotalVibesCount, city },
          realVibes
        );
        
        // Blend real and demo vibes
        blendedVibes = [...realVibes, ...demoVibes];
      } else {
        // No demo data needed, use only real vibes
        demoVibes = [];
        blendedVibes = realVibes;
      }
    } else {
      // Fallback to basic demo data
      demoVibes = demoDataService.generateDemoVibesForCity(city, count);
      blendedVibes = [...realVibes, ...demoVibes];
    }

    const emotionWaves = demoDataService.generateEmotionWaves(city);
    const blendingRatio = demoBlendingService.calculateBlendingRatio({
      realUserCount: actualRealUserCount,
      totalVibesCount: actualTotalVibesCount,
      city,
    });

    const activityMetrics = demoBlendingService.calculateActivityMetrics(blendedVibes as any, city);
    const personaStats = demoPersonaService.getPersonaStats(city);

    return NextResponse.json({
      vibes: blendedVibes,
      demoVibes,
      realVibes,
      waves: emotionWaves,
      blendingRatio,
      activityMetrics,
      personaStats,
      realCount: realVibes.length,
      demoCount: demoVibes.length,
      totalCount: blendedVibes.length,
      message: `Blended data: ${realVibes.length} real + ${demoVibes.length} demo = ${blendedVibes.length} total`,
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
