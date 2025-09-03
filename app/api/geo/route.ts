// API endpoint voor client-side geolocation
import { NextRequest, NextResponse } from 'next/server'
import { getGeoFromRequest } from '@/utils/geolocation'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const geoData = getGeoFromRequest(request)
    
    return NextResponse.json({
      ...geoData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Geo API error:', error)
    
    // Fallback response
    return NextResponse.json({
      country: null,
      isNetherlands: false,
      isInternational: true,
      error: 'Geolocation not available'
    })
  }
}
