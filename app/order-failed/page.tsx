'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/stores/cartStore'

export default function OrderFailedPage() {
  const { toggleCart } = useCartStore()

  useEffect(() => {
    toggleCart(false)
  }, [toggleCart])

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Betaling mislukt</h1>
      <p className="text-gray-600">
        Er ging iets mis met de betaling. Je hebt niets betaald.  
        Probeer het opnieuw of neem contact met ons op.
      </p>
    </div>
  )
}