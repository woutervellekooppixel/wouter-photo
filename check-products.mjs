// Controleer alle producten in de store
import { lemonSqueezySetup, listProducts, listVariants } from '@lemonsqueezy/lemonsqueezy.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkProducts() {
  console.log('Checking products in store...')
  
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  })

  try {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    console.log('Store ID:', storeId)
    
    // Haal ALLE producten op zonder filter
    console.log('\n=== ALL PRODUCTS ===')
    const allProducts = await listProducts()
    console.log('Total products across all stores:', allProducts.data?.length || 0)
    
    // Haal producten op voor deze specifieke store
    console.log('\n=== STORE PRODUCTS ===')
    const storeProducts = await listProducts({
      filter: { storeId: storeId }
    })
    console.log('Products in this store:', storeProducts.data?.length || 0)
    
    if (storeProducts.data && storeProducts.data.length > 0) {
      for (const product of storeProducts.data) {
        console.log(`\n📦 Product: ${product.attributes.name}`)
        console.log(`   ID: ${product.id}`)
        console.log(`   Status: ${product.attributes.status}`)
        console.log(`   Price: ${product.attributes.price_formatted || 'N/A'}`)
        console.log(`   Description: ${product.attributes.description || 'Geen beschrijving'}`)
        
        // Haal variants op
        const variants = await listVariants({
          filter: { productId: product.id }
        })
        
        console.log(`   Variants: ${variants.data?.length || 0}`)
        for (const variant of variants.data || []) {
          console.log(`     - ${variant.attributes.name}: ${variant.attributes.price_formatted}`)
          console.log(`       Variant ID: ${variant.id}`)
        }
      }
    } else {
      console.log('Geen producten gevonden in deze store.')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Error details:', error.response?.data || error)
  }
}

checkProducts()
