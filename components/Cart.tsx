// File: components/Cart.tsx

'use client'

import { useCartStore } from '@/stores/cartStore'
import { X } from 'lucide-react'
import { useState } from 'react'

export default function Cart() {
  const { cart, removeFromCart, isOpen, toggleCart, calculateTotal, clearCart } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
  })

  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const errs = []
    if (!form.name) errs.push('Naam is verplicht')
    if (!form.email || !form.email.includes('@')) errs.push('Geldig e-mailadres is verplicht')
    if (!form.address) errs.push('Adres is verplicht')
    if (!form.postalCode) errs.push('Postcode is verplicht')
    if (!form.city) errs.push('Plaats is verplicht')
    return errs
  }

  const handleCheckout = async () => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: calculateTotal(),
          cart,
        }),
      })

      const data = await response.json()
      if (data.url) {
        clearCart()
        toggleCart(false)
        window.location.href = data.url
      } else {
        alert('Er ging iets mis met de betaling.')
      }
    } catch (err) {
      console.error('Checkout fout:', err)
      alert('Er is een fout opgetreden tijdens het afrekenen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-bold">Winkelwagen</h2>
          <button onClick={() => toggleCart(false)}>
            <X />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100%-8rem)]">
          {cart.length === 0 ? (
            <p className="text-gray-600">Je winkelwagen is leeg.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Aantal: {item.quantity || 1}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Verwijder
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between font-bold mb-4">
            <span>Totaal:</span>
            <span>€ {calculateTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={cart.length === 0}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50"
          >
            Afrekenen
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl mx-4 md:mx-auto shadow-lg">
            <h2 className="text-xl font-bold mb-4">Gegevens invullen</h2>

            {errors.length > 0 && (
              <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm space-y-1">
                {errors.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}

            <div className="grid gap-3">
              <input name="name" placeholder="Naam *" value={form.name} onChange={handleInputChange} className="w-full border p-2" required />
              <input name="email" type="email" placeholder="E-mail *" value={form.email} onChange={handleInputChange} className="w-full border p-2" required />
              <input name="phone" placeholder="Telefoonnummer" value={form.phone} onChange={handleInputChange} className="w-full border p-2" />
              <input name="address" placeholder="Adres *" value={form.address} onChange={handleInputChange} className="w-full border p-2" required />
              <input name="postalCode" placeholder="Postcode *" value={form.postalCode} onChange={handleInputChange} className="w-full border p-2" required />
              <input name="city" placeholder="Plaats *" value={form.city} onChange={handleInputChange} className="w-full border p-2" required />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-300 rounded">
                Annuleren
              </button>
              <button onClick={handleCheckout} disabled={loading} className="px-4 py-2 bg-black text-white rounded">
                {loading ? 'Laden...' : 'Bevestig en betaal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}