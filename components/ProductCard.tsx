'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'

type Props = {
  id: string
  name: string
  price: number
  image: string
  description: string
  variantId?: string
}

export default function ProductCard({ id, name, price, image, description, variantId }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const { addToCart, toggleCart } = useCartStore()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking add to cart
    e.stopPropagation()
    
    setIsLoading(true)
    
    try {
      addToCart({
        id: id,
        name: name,
        price: price,
        quantity: 1
      })
      
      toggleCart(true)
      console.log('Product added to cart:', name)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Er ging iets mis bij het toevoegen aan de winkelwagen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-black hover:shadow-lg transition-shadow duration-300">
      <Link href={`/shop/${id}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-2">
              {name}
            </h3>
            <p className="text-xl font-bold text-black dark:text-white">
              €{price.toFixed(2)}
            </p>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="p-4 pt-0 space-y-2">
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-2 px-4 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Bezig...' : 'Toevoegen aan winkelwagen'}
        </button>
        
        <Link 
          href={`/shop/${id}`}
          className="block w-full text-center border border-gray-300 dark:border-gray-600 text-black dark:text-white py-2 px-4 rounded-md font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Bekijk details
        </Link>
      </div>
    </div>
  )
}