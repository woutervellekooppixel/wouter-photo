import { NextRequest, NextResponse } from 'next/server'
import { getGeoFromRequest, filterProductsByGeo } from '@/utils/geolocation'

export const runtime = 'edge'

// Product categorieën
export type ProductCategory = 'concerts' | 'festivals' | 'portraits' | 'backstage' | 'limited-editions'

export async function GET(request: NextRequest) {
  try {
    // Haal geolocation data op
    const geoData = getGeoFromRequest(request)
    
    // Check of er een categorie filter is gevraagd
    const url = new URL(request.url)
    const categoryFilter = url.searchParams.get('category') as ProductCategory | null
    
    // Photography prints van Wouter Vellekoop met categorieën en geo-targeting
    const allProducts = [
      {
        id: 'print-1',
        name: 'Concert Energy - Limited Print',
        description: 'High-quality concert photography print capturing the raw energy of live performance. Professional museum-quality paper, limited edition.',
        price: 2500, // €25.00 in cents
        priceFormatted: '€25.00',
        variantId: 'print1',
        image: '/shop/print1.jpg',
        status: 'published',
        category: 'concerts' as ProductCategory,
        tags: ['live-music', 'energy', 'concert-hall'],
        geoTargeting: {
          nlOnly: true,        // 🇳🇱 Alleen zichtbaar in Nederland
          internationalOnly: false
        }
      },
      {
        id: 'print-2',
        name: 'Backstage Moment - Limited Print',
        description: 'Exclusive behind-the-scenes moment captured during a major festival. Intimate and authentic music photography.',
        price: 3000, // €30.00 in cents
        priceFormatted: '€30.00',
        variantId: 'print2',
        image: '/shop/print2.jpg',
        status: 'published',
        category: 'backstage' as ProductCategory,
        tags: ['behind-the-scenes', 'intimate', 'authentic'],
        geoTargeting: {
          nlOnly: false,
          internationalOnly: true  // 🌍 Alleen zichtbaar buiten Nederland
        }
      },
      {
        id: 'print-3',
        name: 'Dramatic Spotlights - Limited Print',
        description: 'Stunning play of light and shadow in concert photography. Professional print showcasing dramatic stage lighting.',
        price: 2500, // €25.00 in cents
        priceFormatted: '€25.00',
        variantId: 'print3',
        image: '/shop/print3.jpg',
        status: 'published',
        category: 'concerts' as ProductCategory,
        tags: ['lighting', 'dramatic', 'stage'],
        geoTargeting: {
          nlOnly: true,        // 🇳🇱 Alleen zichtbaar in Nederland
          internationalOnly: false
        }
      },
      {
        id: 'print-4',
        name: 'Artist in Action - Limited Print',
        description: 'Dynamic shot of performer in their element. High-energy concert photography at its finest.',
        price: 2750, // €27.50 in cents
        priceFormatted: '€27.50',
        variantId: 'print4',
        image: '/shop/print4.jpg',
        status: 'published',
        category: 'portraits' as ProductCategory,
        tags: ['dynamic', 'performer', 'action'],
        // Geen geo-targeting = zichtbaar overal
      },
      {
        id: 'print-5',
        name: 'Festival Overview - Limited Print',
        description: 'Wide-angle festival photography capturing the scale and atmosphere of major music events.',
        price: 3500, // €35.00 in cents
        priceFormatted: '€35.00',
        variantId: 'print5',
        image: '/shop/print5.jpg',
        status: 'published',
        category: 'festivals' as ProductCategory,
        tags: ['wide-angle', 'atmosphere', 'crowd'],
        geoTargeting: {
          nlOnly: false,
          internationalOnly: true  // 🌍 Alleen zichtbaar buiten Nederland
        }
      },
      {
        id: 'print-6',
        name: 'Intimate Portrait - Limited Print',
        description: 'Close-up artist portrait during a quiet backstage moment. Professional black & white photography.',
        price: 2500, // €25.00 in cents
        priceFormatted: '€25.00',
        variantId: 'print6',
        image: '/shop/print6.jpg',
        status: 'published',
        category: 'portraits' as ProductCategory,
        tags: ['close-up', 'intimate', 'black-white'],
        geoTargeting: {
          nlOnly: true,        // 🇳🇱 Alleen zichtbaar in Nederland
          internationalOnly: false
        }
      }
    ]

    // Filter eerst op geolocation
    let products = filterProductsByGeo(allProducts, geoData)
    
    // Dan filter op categorie als opgegeven
    if (categoryFilter) {
      products = products.filter(product => product.category === categoryFilter)
    }

    // Haal alle beschikbare categorieën op (na geo-filtering)
    const availableCategories = [...new Set(
      filterProductsByGeo(allProducts, geoData).map(p => p.category)
    )]

    console.log(`Geo: ${geoData.country || 'Unknown'} | NL: ${geoData.isNetherlands} | Category: ${categoryFilter || 'all'} | Showing: ${products.length}/${allProducts.length} products`)
    
    return NextResponse.json({ 
      products,
      categories: availableCategories,
      currentCategory: categoryFilter,
      geoData: {
        country: geoData.country,
        isNetherlands: geoData.isNetherlands,
        totalProducts: allProducts.length,
        visibleProducts: products.length
      }
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
