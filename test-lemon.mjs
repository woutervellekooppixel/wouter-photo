// Quick test van LemonSqueezy API
import { lemonSqueezySetup, listStores } from '@lemonsqueezy/lemonsqueezy.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testLemon() {
  console.log('Testing LemonSqueezy connection...')
  console.log('API Key:', process.env.LEMONSQUEEZY_API_KEY ? 'Found' : 'Missing')
  
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  })

  try {
    const stores = await listStores()
    console.log('✅ API Response received!')
    console.log('Store count:', stores.data?.length || 0)
    
    if (stores.data && stores.data.length > 0) {
      console.log('Store ID:', stores.data[0].id)
      console.log('Store Name:', stores.data[0].attributes.name)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testLemon()
