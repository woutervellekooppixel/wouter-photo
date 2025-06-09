import * as React from 'react'
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Section,
} from '@react-email/components'

type Props = {
  name: string
  email: string
  phone?: string
  address: string
  zip: string
  city: string
  amount: number
  cart: { id: string; name: string; quantity: number; price: number }[]
}

export default function OrderNotification({
  name,
  email,
  phone,
  address,
  zip,
  city,
  amount,
  cart,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Nieuwe bestelling ontvangen via Wouter.Photo</Preview>
      <Body
        style={{
          backgroundColor: '#f4f4f4',
          fontFamily: 'sans-serif',
          padding: '20px',
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            maxWidth: '600px',
            margin: '0 auto',
            borderRadius: '8px',
          }}
        >
          <img
            src="https://wouter.photo/logo.svg"
            alt="Wouter.Photo"
            width="120"
            style={{ marginBottom: '20px' }}
          />

          <Section>
            <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Nieuwe bestelling van {name}
            </Text>

            <Text>
              <strong>E-mail:</strong> {email}
              <br />
              <strong>Telefoon:</strong> {phone || 'Niet opgegeven'}
              <br />
              <strong>Adres:</strong> {address}, {zip} {city}
              <br />
              <strong>Totaalbedrag:</strong> €{amount.toFixed(2)}
            </Text>

            <Text style={{ fontSize: '16px', marginTop: '24px', fontWeight: 'bold' }}>
              Bestelde items:
            </Text>
            <ul>
              {cart.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.name} — €
                  {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}