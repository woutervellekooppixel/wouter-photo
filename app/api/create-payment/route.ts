// File: app/api/create-payment/route.ts
import { NextResponse } from 'next/server'
import mollie from '@mollie/api-client'
import { sendEmails } from '@/lib/sendEmails'

const mollieClient = mollie({ apiKey: process.env.MOLLIE_API_KEY! })

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
    const payment = await mollieClient.payments.create({
      amount: {
        value: amount.toFixed(2),
        currency: 'EUR',
      },
      description: `Bestelling van ${name}`,
      redirectUrl: 'https://wouter.photo/order-status',
      metadata: {
        name,
        email,
        phone,
        address,
        postalCode,
        city,
        total: amount,
        cart,
      },
    })

    // 💌 E-mail versturen vóór redirect
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

    return NextResponse.json({ url: payment.getCheckoutUrl() })
  } catch (error) {
    console.error('Mollie fout:', error)
    return NextResponse.json({ error: 'Fout bij betaling' }, { status: 500 })
  }
}