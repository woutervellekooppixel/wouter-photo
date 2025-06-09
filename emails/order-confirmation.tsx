// emails/order-confirmation.tsx
import { Html } from '@react-email/html'
import { Text } from '@react-email/text'

type Props = {
  name: string
  address: string
  cart: { name: string; quantity: number; price: number }[]
  amount: number
}

export default function OrderConfirmationEmail({ name, address, cart, amount }: Props) {
  return (
    <Html lang="nl">
      <Text>Hi {name},</Text>
      <Text>Bedankt voor je bestelling! Hieronder een overzicht:</Text>
      <Text>
        {cart.map((item, i) => (
          <div key={i}>
            - {item.quantity}× {item.name} – €{item.price.toFixed(2).replace('.', ',')}
          </div>
        ))}
      </Text>
      <Text>Totaalbedrag: €{amount.toFixed(2).replace('.', ',')}</Text>
      <Text>Bezorgadres: {address}</Text>
      <Text>Je ontvangt binnenkort je bestelling. Veel plezier ermee!</Text>
      <Text>– Wouter.Photo</Text>
    </Html>
  )
}