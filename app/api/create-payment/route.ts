// File: app/api/create-payment/route.ts
import { NextResponse } from 'next/server'
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { sendEmails } from '@/lib/sendEmails'

// Setup LemonSqueezy API
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
})

export async function POST(req: Request) {
  const {
    name,
    email,
    phone,
    address,
    postalCode,
    city,
    amount,
    cart,
  } = await req.json()

  try {
    // Validatie
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Geldig email adres is verplicht voor downloadlinks' },
        { status: 400 }
      )
    }

    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: 'Winkelwagen is leeg' },
        { status: 400 }
      )
    }

    // Voor nu een placeholder - dit wordt vervangen door echte variant IDs
    // wanneer je LemonSqueezy account geverifieerd is
    const placeholderVariantId = "placeholder-variant-id"
    
    const checkoutData = {
      variantId: placeholderVariantId,
      customData: {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_address: address,
        customer_postal_code: postalCode,
        customer_city: city,
        cart_items: cart,
        total_amount: amount
      },
      checkoutOptions: {
        embed: false,
        media: false,
        logo: false,
        desc: false,
        discount: false,
        dark: false,
        subscription_preview: false,
        background_color: '#ffffff',
        button_color: '#10b981'
      },
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/order-success`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

    // TODO: Uncomment wanneer LemonSqueezy account actief is
    // const checkout = await createCheckout(checkoutData)
    
    // 💌 E-mail versturen (behouden van huidige functionaliteit)
    await sendEmails({
      name,
      email,
      phone,
      address,
      zip: postalCode,
      city,
      amount,
      cart,
    })

    // Tijdelijke response tijdens ontwikkelingsfase
    return NextResponse.json({ 
      success: true,
      message: "Bestelling voorbereid - LemonSqueezy account wordt geverifieerd",
      redirectUrl: '/order-success'
      // url: checkout.data.attributes.url // Dit wordt gebruikt wanneer account actief is
    })

  } catch (error) {
    console.error('LemonSqueezy checkout fout:', error)
    return NextResponse.json({ error: 'Fout bij het verwerken van bestelling' }, { status: 500 })
  }
}