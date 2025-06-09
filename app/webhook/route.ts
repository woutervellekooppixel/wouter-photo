import { NextResponse } from 'next/server'
import mollie from '@mollie/api-client'
import { sendEmails } from '@/lib/sendEmails'

const mollieClient = mollie({ apiKey: process.env.MOLLIE_API_KEY! })

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const data = new URLSearchParams(body)
    const paymentId = data.get('id')

    if (!paymentId) {
      console.warn('Geen betaling-ID ontvangen')
      return NextResponse.json({ error: 'Geen betaling-ID' }, { status: 400 })
    }

    const payment = await mollieClient.payments.get(paymentId)

    if (payment.status === 'paid') {
      const meta = payment.metadata as {
        name: string
        email: string
        phone?: string
        address: string
        postalCode: string
        city: string
        total: number
        cart: { name: string; quantity: number; price: number }[]
      }

      await sendEmails({
        name: meta.name,
        email: meta.email,
        phone: meta.phone,
        address: meta.address,
        zip: meta.postalCode,
        city: meta.city,
        amount: meta.total,
        cart: meta.cart,
      })

      console.log(`✅ E-mail verzonden voor betaling: ${paymentId}`)
    } else {
      console.log(`❌ Betaling niet voltooid: ${paymentId}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook fout:', error)
    return NextResponse.json({ error: 'Webhook fout' }, { status: 500 })
  }
}