// app/shop/page.tsx
'use client'

import ProductCard from '@/components/ProductCard'

const products = [
  {
    id: 'print1',
    name: 'Zwart-wit Concertfoto',
    price: 45,
    image: '/shop/print1.jpg',
    description: 'Een krachtige zwart-wit foto, gedrukt op mat papier.',
  },
  {
    id: 'print2',
    name: 'Backstage Moment',
    price: 55,
    image: '/shop/print2.jpg',
    description: 'Een uniek backstage shot, vol sfeer en details.',
  },
  {
    id: 'print3',
    name: 'Dramatische Spotlights',
    price: 60,
    image: '/shop/print3.jpg',
    description: 'Spotlights en rook zorgen voor een iconisch podiumbeeld.',
  },
  {
    id: 'print4',
    name: 'Zanger in actie',
    price: 50,
    image: '/shop/print4.jpg',
    description: 'Energie en emotie in één moment gevangen.',
  },
  {
    id: 'print5',
    name: 'Overzichtsfoto Festival',
    price: 70,
    image: '/shop/print5.jpg',
    description: 'Het hele festival in één indrukwekkend beeld.',
  },
  {
    id: 'print6',
    name: 'Intiem portret',
    price: 65,
    image: '/shop/print6.jpg',
    description: 'Een teder portret met zacht licht en diepte.',
  },
]

export default function ShopPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </main>
  )
}