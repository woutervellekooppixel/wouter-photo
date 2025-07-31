'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  id: string
  name: string
  price: number
  image: string
  description: string
  variantId?: string // Optioneel voor backwards compatibility
}

export default function ProductCard({ id, name, price, image, description, variantId }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    
    try {
      console.log('Starting purchase for variant:', variantId || id)
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          variantId: variantId || id // Gebruik variantId als beschikbaar, anders fallback naar id
        }),
      })

      const data = await response.json()
      console.log('Checkout response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout')
      }
      
      if (data.checkoutUrl) {
        console.log('Redirecting to:', data.checkoutUrl)
        // Redirect naar Lemon Squeezy checkout
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      alert(`Er ging iets mis: ${String(error)}. Check de console voor meer details.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded p-4 flex flex-col items-center space-y-4 bg-white dark:bg-black">
      <Image
        src={image}
        alt={name}
        width={400}
        height={400}
        className="object-cover max-h-64 w-full rounded"
      />
      <div className="text-center">
        <h3 className="font-semibold text-lg text-black dark:text-white">{name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-1">€ {price.toFixed(2)}</p>
        <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">{description}</p>
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Bezig...' : 'Koop nu'}
        </button>
      </div>
    </div>
  )
}