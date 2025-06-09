// File: app/api/send-emails/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { name, email, phone, address, postalCode, city, cart, total } = await req.json()

  const cartSummary = cart
    .map((item: any) => `• ${item.name} — ${item.quantity || 1}x`)
    .join('\n')

  const message = `
Nieuwe bestelling via de webshop:

Naam: ${name}
E-mail: ${email}
Telefoon: ${phone || '-'}
Adres: ${address}, ${postalCode} ${city}

Bestelde items:
${cartSummary}

Totaalbedrag: € ${Number(total).toFixed(2)}
  `.trim()

  try {
    // Mail naar jou
    await resend.emails.send({
      from: 'Wouter Webshop <noreply@wouter.photo>',
      to: 'hello@wouter.photo',
      subject: `Nieuwe bestelling van ${name}`,
      text: message,
    })

    // Mail naar klant
    await resend.emails.send({
      from: 'Wouter Webshop <noreply@wouter.photo>',
      to: email,
      subject: 'Bevestiging van je bestelling bij Wouter',
      text: `Hoi ${name},\n\nBedankt voor je bestelling! We hebben de volgende gegevens ontvangen:\n\n${message}\n\nWe nemen snel contact met je op.`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('E-mailfout:', error)
    return NextResponse.json({ error: 'Fout bij verzenden e-mails' }, { status: 500 })
  }
}