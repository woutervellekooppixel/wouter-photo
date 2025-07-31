// Test script om Store ID en producten op te halen
import { lemonSqueezySetup, listStores, listProducts, listVariants } from '@lemonsqueezy/lemonsqueezy.js'

async function getStoreInfo() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  })

  try {
    console.log('=== STORES ===')
    const stores = await listStores()
    
    if (stores.data && stores.data.length > 0) {
      console.log('Store ID:', stores.data[0].id)
      console.log('Store Name:', stores.data[0].attributes.name)
      
      const storeId = stores.data[0].id
      
      console.log('\n=== PRODUCTS ===')
      const products = await listProducts({ 
        filter: { storeId: storeId }
      })
      
      for (const product of products.data || []) {
        console.log(`\nProduct: ${product.attributes.name}`)
        console.log(`ID: ${product.id}`)
        console.log(`Status: ${product.attributes.status}`)
        console.log(`Description: ${product.attributes.description || 'Geen beschrijving'}`)
        
        // Haal variants op voor dit product
        const variants = await listVariants({
          filter: { productId: product.id }
        })
        
        console.log('Variants:')
        for (const variant of variants.data || []) {
          console.log(`  - Variant ID: ${variant.id}`)
          console.log(`  - Name: ${variant.attributes.name}`)
          console.log(`  - Price: ${variant.attributes.price_formatted}`)
          console.log(`  - Status: ${variant.attributes.status}`)
        }
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

getStoreInfo()
