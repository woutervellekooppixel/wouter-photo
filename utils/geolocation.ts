// Geolocation utilities voor geo-targeting
import { geolocation } from '@vercel/edge'

export interface GeoData {
  country: string | null
  isNetherlands: boolean
  isInternational: boolean
}

// Server-side geolocation (voor API routes)
export function getGeoFromRequest(request: Request): GeoData {
  try {
    const geo = geolocation(request)
    const country = geo.country || null
    const isNetherlands = country === 'NL'
    const isInternational = !isNetherlands

    return {
      country,
      isNetherlands,
      isInternational
    }
  } catch (error) {
    console.warn('Geolocation niet beschikbaar:', error)
    // Fallback: behandel als internationaal
    return {
      country: null,
      isNetherlands: false,
      isInternational: true
    }
  }
}

// Client-side geolocation (voor componenten)
export async function getClientGeoData(): Promise<GeoData> {
  try {
    const response = await fetch('/api/geo')
    if (!response.ok) throw new Error('Geo API failed')
    
    const data = await response.json()
    return data
  } catch (error) {
    console.warn('Client geolocation failed:', error)
    // Fallback: behandel als internationaal
    return {
      country: null,
      isNetherlands: false,
      isInternational: true
    }
  }
}

// Product filtering op basis van geo
export function filterProductsByGeo(products: any[], geoData: GeoData) {
  return products.filter(product => {
    // Als geen geo-targeting is ingesteld, toon altijd
    if (!product.geoTargeting) return true
    
    const { nlOnly, internationalOnly } = product.geoTargeting
    
    // Nederland-only producten
    if (nlOnly && !geoData.isNetherlands) return false
    
    // Internationaal-only producten  
    if (internationalOnly && geoData.isNetherlands) return false
    
    return true
  })
}

// Check of gebruiker toegang heeft tot product
export function hasAccessToProduct(product: any, geoData: GeoData): boolean {
  if (!product.geoTargeting) return true
  
  const { nlOnly, internationalOnly } = product.geoTargeting
  
  if (nlOnly && !geoData.isNetherlands) return false
  if (internationalOnly && geoData.isNetherlands) return false
  
  return true
}
