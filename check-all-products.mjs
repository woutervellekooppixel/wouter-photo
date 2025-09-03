// Probeer ook draft/unpublished producten op te halen
import { lemonSqueezySetup, listProducts } from '@lemonsqueezy/lemonsqueezy.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkAllProducts() {
  console.log('Checking ALL products including drafts...')
  
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  })

  try {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    console.log('Store ID:', storeId)
    
    // Probeer verschillende filters
    const filters = [
      { name: 'Published only', filter: { storeId: storeId, status: 'published' } },
      { name: 'Draft only', filter: { storeId: storeId, status: 'draft' } },
      { name: 'All statuses', filter: { storeId: storeId } },
      { name: 'No filters', filter: {} }
    ]
    
    for (const { name, filter } of filters) {
      console.log(`\n=== ${name.toUpperCase()} ===`)
      try {
        const products = await listProducts(filter)
        console.log(`Found: ${products.data?.length || 0} products`)
        
        if (products.data && products.data.length > 0) {
          for (const product of products.data) {
            console.log(`  - ${product.attributes.name} (${product.attributes.status})`)
            console.log(`    ID: ${product.id}`)
            console.log(`    Store: ${product.attributes.store_id}`)
          }
        }
      } catch (error) {
        console.log(`  Error with ${name}: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Main Error:', error.message)
  }
}

checkAllProducts()
