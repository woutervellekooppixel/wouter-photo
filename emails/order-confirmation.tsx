import { Html } from '@react-email/html'
import { Head } from '@react-email/head'
import { Preview } from '@react-email/preview'
import { Body } from '@react-email/body'
import { Container } from '@react-email/container'
import { Text } from '@react-email/text'
import { Img } from '@react-email/img'

type Props = {
  name: string
  address: string
  cart: { name: string; quantity: number; price: number }[]
  amount: number
}

export default function OrderConfirmationEmail({
  name,
  address,
  cart,
  amount,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Bedankt voor je bestelling bij Wouter.Photo!</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#fff', padding: '24px' }}>
        <Container style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#fff' }}>
          <Img
            src="https://wouter.photo/logo.png"
            alt="Wouter.Photo logo"
            width={240}
            style={{ marginBottom: '32px' }}
          />

          <Text style={{ fontSize: '16px', marginBottom: '24px' }}>
            Hoi {name},<br /><br />
            Bedankt voor je bestelling bij <strong>Wouter.Photo</strong>!
          </Text>

          <Text style={{ fontSize: '16px', marginBottom: '8px' }}>
            <strong>Besteloverzicht:</strong>
          </Text>

          <ul style={{ paddingLeft: '20px', marginBottom: '24px' }}>
            {cart.map((item, index) => (
              <li key={index}>
                {item.name} (x{item.quantity}) – €{(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>

          <Text style={{ fontSize: '16px', marginBottom: '16px' }}>
            <strong>Totaal:</strong> €{amount.toFixed(2)}<br />
            <strong>Verzendadres:</strong> {address}
          </Text>

          <Text style={{ fontSize: '16px', marginBottom: '24px' }}>
            Zodra je pakketje onderweg is, krijg je een Track & Trace.
          </Text>

          <Text style={{ fontSize: '16px' }}>
            Bedankt voor je vertrouwen!<br />
            — Wouter
          </Text>
        </Container>
      </Body>
    </Html>
  )
}