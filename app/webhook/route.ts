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
      const meta = payment.metadata as any

      await sendEmails({
        to: meta.email,
        fromName: 'Wouter.Photo',
        subject: 'Bevestiging van je bestelling',
        text: `Bedankt ${meta.name} voor je bestelling van €${meta.total}.`,
        internalNote: `Bestelling ontvangen van ${meta.name}\nEmail: ${meta.email}\nTel: ${meta.phone}\nAdres: ${meta.address}, ${meta.postalCode} ${meta.city}`,
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