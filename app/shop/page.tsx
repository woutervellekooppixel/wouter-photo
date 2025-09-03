// app/shop/page.tsx
'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'

type LemonSqueezyProduct = {
  id: string
  name: string
  description: string
  price: number
  priceFormatted: string
  variantId: string
  image: string
  status: string
  geoTargeting?: {
    nlOnly?: boolean
    internationalOnly?: boolean
  }
}

type GeoData = {
  country: string | null
  isNetherlands: boolean
  totalProducts: number
  visibleProducts: number
}

export default function ShopPage() {
  const [products, setProducts] = useState<LemonSqueezyProduct[]>([])
  const [geoData, setGeoData] = useState<GeoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data.products || [])
        setGeoData(data.geoData)
      } catch (err) {
        setError('Kon producten niet laden')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <h1 className="text-3xl font-bold mb-8">Shop</h1>
          <p>Producten aan het laden...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <h1 className="text-3xl font-bold mb-8">Shop</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">Photography Prints Shop</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl">
          Discover limited edition photography prints capturing the raw energy and emotion of live music. 
          Each piece is professionally printed on museum-quality materials.
        </p>
        
        {/* Geo-targeting info voor development */}
        {geoData && process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              🌍 Locatie: {geoData.country || 'Onbekend'} 
              {geoData.isNetherlands ? ' (Nederland)' : ' (Internationaal)'} | 
              Zichtbare producten: {geoData.visibleProducts}/{geoData.totalProducts}
            </p>
          </div>
        )}
      </div>
      
      {products.length === 0 ? (
        <div className="text-center text-black dark:text-white">
          <p>Geen producten beschikbaar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              price={product.price / 100} // Lemon Squeezy geeft prijs in cents
              image={product.image}
              description={product.description}
              variantId={product.variantId}
            />
          ))}
        </div>
      )}
    </main>
  )
}