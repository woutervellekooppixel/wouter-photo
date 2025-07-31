import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Voor nu, retourneer een test product
    // Later kunnen we dit vervangen met echte Lemon Squeezy API calls
    const testProducts = [
      {
        id: 'test-1',
        name: 'Test Product',
        description: 'Dit is een test product uit Lemon Squeezy',
        price: 1000, // €10.00 in cents
        priceFormatted: '€10.00',
        variantId: '925048', // Je echte variant ID
        image: '/shop/print1.jpg', // Fallback image
        status: 'published',
      }
    ]

    console.log('Returning test products:', testProducts)
    return NextResponse.json({ products: testProducts })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [] },
      { status: 500 }
    )
  }
}
