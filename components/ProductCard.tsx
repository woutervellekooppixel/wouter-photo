'use client'

import { useCartStore } from '@/stores/cartStore'
import Image from 'next/image'

type Props = {
  id: string
  name: string
  price: number
  image: string
}

export default function ProductCard({ id, name, price, image }: Props) {
  const { addToCart } = useCartStore()

  return (
    <div className="border rounded p-4 flex flex-col items-center space-y-4">
      <Image
        src={image}
        alt={name}
        width={400}
        height={400}
        className="object-cover max-h-64 w-full rounded"
      />
      <div className="text-center">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-gray-600 mb-2">€ {price.toFixed(2)}</p>
        <button
          onClick={() => addToCart({ id, name, price })}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Voeg toe aan winkelwagen
        </button>
      </div>
    </div>
  )
}