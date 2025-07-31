// Script om een variant aan te maken voor je product
import { lemonSqueezySetup, listProducts, createVariant } from '@lemonsqueezy/lemonsqueezy.js'

async function createProductVariant() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  })

  try {
    // Haal eerst je producten op
    const products = await listProducts({
      filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID }
    })

    if (!products.data || products.data.length === 0) {
      console.log('Geen producten gevonden')
      return
    }

    const product = products.data[0] // Neem het eerste product
    console.log('Product gevonden:', product.attributes.name)
    console.log('Product ID:', product.id)

    // Maak een variant aan
    const variant = await createVariant(product.id, {
      name: 'Standard Print',
      price: 1000, // €10.00 in cents
      status: 'published'
    })

    console.log('Variant aangemaakt!')
    console.log('Variant ID:', variant.data.id)
    console.log('Je kunt dit ID gebruiken in je shop')

  } catch (error) {
    console.error('Error:', error)
  }
}

createProductVariant()
