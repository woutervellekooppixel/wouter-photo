// emails/order-confirmation.tsx
import * as React from 'react'
import { Html, Head, Preview, Body, Container, Text, Section } from '@react-email/components'

export default function OrderConfirmation({
  name,
  address,
  cart,
  amount,
}: {
  name: string
  address: string
  cart: { name: string; quantity: number; price: number }[]
  amount: number
}) {
  return (
    <Html>
      <Head />
      <Preview>Bedankt voor je bestelling bij Wouter.Photo</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'sans-serif' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', maxWidth: '600px', margin: '0 auto', borderRadius: '8px' }}>
          <img
            src="https://wouter.photo/logo.png"
            alt="Wouter.Photo"
            width="120"
            style={{ marginBottom: '20px' }}
          />

          <Section>
            <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>Hoi {name},</Text>
            <Text>Bedankt voor je bestelling bij <strong>Wouter.Photo</strong>!</Text>

            <Text style={{ marginTop: '20px', fontWeight: 'bold' }}>Besteloverzicht:</Text>
            {cart.map((item, index) => (
              <Text key={index}>• {item.name} (x{item.quantity}) – €{(item.price * item.quantity).toFixed(2)}</Text>
            ))}

            <Text style={{ marginTop: '12px' }}>
              <strong>Totaal:</strong> €{amount.toFixed(2)} <br />
              <strong>Verzendadres:</strong> {address}
            </Text>

            <Text style={{ marginTop: '32px' }}>Zodra je pakketje onderweg is, krijg je een Track & Trace.</Text>
            <Text>Bedankt voor je vertrouwen!<br />— Wouter</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}