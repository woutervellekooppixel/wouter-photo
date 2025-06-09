// lib/sendEmails.ts
import { Resend } from 'resend'
import OrderConfirmationEmail from '@/emails/order-confirmation'
import OrderNotificationEmail from '@/emails/order-notification'

const resend = new Resend(process.env.RESEND_API_KEY)

type EmailInfo = {
  name: string
  email: string
  phone?: string
  address: string
  zip: string
  city: string
  amount: number
  cart: { name: string; quantity: number; price: number }[]
}

export async function sendEmails(info: EmailInfo) {
  const { name, email, phone, address, zip, city, amount, cart } = info
  const fullAddress = `${address}, ${zip} ${city}`

  // E-mail naar klant
  await resend.emails.send({
    from: 'Wouter.Photo <hello@wouter.photo>',
    to: email,
    subject: 'Bedankt voor je bestelling!',
    react: OrderConfirmationEmail({
      name,
      address: fullAddress,
      cart,
      amount,
    }),
  })

  // E-mail naar jou
  await resend.emails.send({
    from: 'Wouter.Photo <hello@wouter.photo>',
    to: 'hello@wouter.photo',
    subject: `Nieuwe bestelling van ${name}`,
    react: OrderNotificationEmail({
      name,
      email,
      phone,
      address,
      zip,
      city,
      cart,
      amount,
    }),
  })
}