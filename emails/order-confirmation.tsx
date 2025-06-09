import * as React from 'react'
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Section,
  Img,
} from '@react-email/components'

export default function OrderConfirmationEmail({
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
        <Container
          style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            maxWidth: '600px',
            margin: '0 auto',
            borderRadius: '8px',
          }}
        >
          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Img
              src="https://wouter.photo/logo.png"
              alt="Wouter.Photo"
              width="180"
              style={{ margin: '0 auto' }}
            />
          </Section>

          <Section>
            <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Hoi {name},
            </Text>
            <Text>
              Bedankt voor je bestelling bij <strong>Wouter.Photo</strong>!
            </Text>

            <Text style={{ marginTop: '24px', fontWeight: 'bold' }}>
              Besteloverzicht:
            </Text>
            <ul style={{ paddingLeft: '20px', margin: '16px 0' }}>
              {cart.map((item, index) => (
                <li key={index} style={{ marginBottom: '6px' }}>
                  {item.name} (x{item.quantity}) – €
                  {Number(item.price).toFixed(2)}
                </li>
              ))}
            </ul>

            <Text>
              <strong>Totaal:</strong> €{amount.toFixed(2)}
              <br />
              <strong>Verzendadres:</strong> {address}
            </Text>

            <Text style={{ marginTop: '24px' }}>
              Zodra je pakketje onderweg is, krijg je een Track & Trace.
            </Text>

            <Text>
              Bedankt voor je vertrouwen!
              <br />— Wouter
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}