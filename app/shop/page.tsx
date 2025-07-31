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
}

export default function ShopPage() {
  const [products, setProducts] = useState<LemonSqueezyProduct[]>([])
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
      <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">Shop</h1>
      
      {products.length === 0 ? (
        <div className="text-center text-black dark:text-white">
          <p>Geen producten beschikbaar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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