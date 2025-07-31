import { NextRequest, NextResponse } from 'next/server'
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

// Setup Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { variantId } = await request.json()
    
    console.log('Received checkout request for variantId:', variantId)

    if (!variantId) {
      console.log('No variantId provided')
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      )
    }

    console.log('Creating checkout with store ID:', process.env.LEMONSQUEEZY_STORE_ID)
    
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        productOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/order-success`,
        },
      }
    )

    console.log('Checkout response:', checkout)
    
    const checkoutUrl = (checkout as any).data?.attributes?.url
    console.log('Checkout URL:', checkoutUrl)

    return NextResponse.json({
      checkoutUrl: checkoutUrl,
    })
  } catch (error) {
    console.error('Checkout creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout', details: String(error) },
      { status: 500 }
    )
  }
}
