// emails/order-notification.tsx
import { Html } from '@react-email/html'
import { Text } from '@react-email/text'

type Props = {
  name: string
  email: string
  phone?: string
  address: string
  zip: string
  city: string
  cart: { name: string; quantity: number; price: number }[]
  amount: number
}

export default function OrderNotificationEmail({
  name,
  email,
  phone,
  address,
  zip,
  city,
  cart,
  amount,
}: Props) {
  return (
    <Html lang="nl">
      <Text>Nieuwe bestelling ontvangen van {name}</Text>
      <Text>
        Email: {email}
        {phone && `\nTelefoon: ${phone}`}
        {'\n'}Adres: {address}, {zip} {city}
      </Text>
      <Text>
        Bestelde items:
        {cart.map((item, i) => (
          <div key={i}>
            - {item.quantity}× {item.name} – €{item.price.toFixed(2).replace('.', ',')}
          </div>
        ))}
      </Text>
      <Text>Totaalbedrag: €{amount.toFixed(2).replace('.', ',')}</Text>
    </Html>
  )
}