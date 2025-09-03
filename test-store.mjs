// Test specifieke store
import { lemonSqueezySetup, getStore, listProducts } from '@lemonsqueezy/lemonsqueezy.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testStore() {
  console.log('Testing specific store...')
  
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  })

  try {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    console.log('Store ID from env:', storeId)
    
    // Test direct store access
    const store = await getStore(storeId)
    console.log('✅ Store found!')
    console.log('Store data structure:', JSON.stringify(store, null, 2))
    
    if (store.data && store.data.attributes) {
      console.log('Store Name:', store.data.attributes.name)
      console.log('Store Domain:', store.data.attributes.domain)
    }
    
    // Test products in this store
    const products = await listProducts({
      filter: { storeId: storeId }
    })
    console.log('Product count:', products.data?.length || 0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Error details:', error.response?.data || error)
  }
}

testStore()
