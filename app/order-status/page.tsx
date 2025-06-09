'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/stores/cartStore'

export default function OrderStatusPage() {
  const { clearCart, toggleCart } = useCartStore()

  useEffect(() => {
    clearCart()
    toggleCart(false)
  }, [clearCart, toggleCart])

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Bedankt voor je bestelling!</h1>
      <p className="text-gray-600">
        Je betaling is ontvangen. Je ontvangt zo snel mogelijk een bevestiging per e-mail.
      </p>
    </div>
  )
}