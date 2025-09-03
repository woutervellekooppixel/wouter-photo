'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'

type Product = {
  id: string
  name: string
  description: string
  price: number
  priceFormatted: string
  variantId: string
  image: string
  images?: string[] // Multiple images for slider
  details?: string
  specifications?: string[]
  status: string
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  
  const { addToCart, toggleCart } = useCartStore()

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        const foundProduct = data.products.find((p: Product) => p.id === params.id)
        
        if (foundProduct) {
          // Add multiple images for slider demonstration
          foundProduct.images = [
            foundProduct.image,
            foundProduct.image, // Duplicate for now, you can add more variants
            foundProduct.image
          ]
          
          // Add detailed description
          foundProduct.details = `Professional photography print captured by Wouter Vellekoop. This limited edition piece showcases the raw energy and emotion of live music performance. Each print is carefully produced using museum-quality materials and archival inks to ensure longevity and vibrant colors.

Perfect for music lovers, art collectors, and anyone who appreciates the artistry of concert photography. Limited availability makes each piece a unique addition to your collection.`
          
          foundProduct.specifications = [
            'Museum-quality archival paper',
            'Professional giclée printing',
            'Limited edition of 50 prints',
            'Signed and numbered by artist',
            'Available in 3 sizes: A4, A3, A2',
            'Shipped in protective tube'
          ]
        }
        
        setProduct(foundProduct || null)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price / 100, // Convert from cents
        quantity: 1
      })
      
      toggleCart(true)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => 
        prev === product.images!.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images!.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <p>Product aan het laden...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
        <div className="text-center text-black dark:text-white">
          <h1 className="text-2xl font-bold mb-4">Product niet gevonden</h1>
          <Link href="/shop" className="text-blue-500 hover:underline">
            Terug naar shop
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/shop" 
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Terug naar shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Slider */}
        <div className="space-y-4">
          <div className="relative aspect-[3/2] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src={product.images?.[currentImageIndex] || product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            
            {/* Navigation buttons */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-2 rounded-full shadow hover:bg-white dark:hover:bg-black transition-colors"
                >
                  <ChevronLeft size={20} className="text-black dark:text-white" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-2 rounded-full shadow hover:bg-white dark:hover:bg-black transition-colors"
                >
                  <ChevronRight size={20} className="text-black dark:text-white" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail navigation */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex 
                      ? 'border-black dark:border-white' 
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Sidebar */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold text-black dark:text-white">
              €{(product.price / 100).toFixed(2)}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
            
            {product.details && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {product.details}
                </p>
              </div>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-3">
                Specifications
              </h3>
              <ul className="space-y-1">
                {product.specifications.map((spec, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                    <span className="w-2 h-2 bg-black dark:bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="pt-4">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 px-6 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? 'Bezig...' : 'Toevoegen aan winkelwagen'}
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>✓ Gratis verzending binnen Nederland</p>
            <p>✓ 14 dagen retourrecht</p>
            <p>✓ Veilig betalen met iDEAL of creditcard</p>
          </div>
        </div>
      </div>
    </main>
  )
}
