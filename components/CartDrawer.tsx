'use client'

import { useCartStore } from '@/stores/cartStore'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CartDrawer() {
  const { cart, isOpen, toggleCart, removeFromCart } = useCartStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sluit drawer met Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleCart(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [toggleCart])

  if (!mounted) {
    return null
  }

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold">Winkelwagen</h2>
        <button onClick={() => toggleCart(false)}>
          <X />
        </button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-8rem)]">
        {cart.length === 0 ? (
          <p className="text-gray-600">Je winkelwagen is leeg.</p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">€ {item.price.toFixed(2)}</p>
              </div>
              <button onClick={() => removeFromCart(item.id)}>✕</button>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t">
        <button
          onClick={() => alert('Naar afrekenen...')}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Afrekenen
        </button>
      </div>
    </div>
  )
}