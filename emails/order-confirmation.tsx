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
  amount: number
  address: string
  cart: { name: string; quantity: number; price: number }[]
}

export default function OrderConfirmation({
  name,
  amount,
  address,
  cart,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Bedankt voor je bestelling bij Wouter.Photo</Preview>
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
              Hoi {name},
            </Text>
            <Text>
              Bedankt voor je bestelling van{' '}
              <strong>€{amount.toFixed(2)}</strong> bij{' '}
              <strong>Wouter.Photo</strong>.
            </Text>
            <Text>
              Ik ga meteen voor je aan de slag. Je ontvangt zo snel mogelijk
              een Track & Trace code zodra de bestelling verzonden is.
            </Text>
            <Text style={{ marginTop: '32px' }}>
              <strong>Overzicht van je bestelling:</strong>
            </Text>
            <ul>
              {cart.map((item, i) => (
                <li key={i}>
                  {item.quantity} × {item.name} — €
                  {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <Text style={{ marginTop: '32px' }}>
              <strong>Factuuradres:</strong>
              <br />
              {address}
            </Text>
            <Text style={{ marginTop: '32px' }}>
              Nogmaals bedankt voor je vertrouwen!
            </Text>
            <Text>
              Met vriendelijke groet,
              <br />
              Wouter Vellekoop
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}