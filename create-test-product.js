// Test het aanmaken van een nieuw product
import { lemonSqueezySetup, createProduct } from '@lemonsqueezy/lemonsqueezy.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function createTestProduct() {
  console.log('Creating test product...')
  
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  })

  try {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    console.log('Store ID:', storeId)
    
    const productData = {
      name: 'Test Fotografie Print',
      description: 'Een test product voor de migratie naar LemonSqueezy',
      status: 'draft', // Start als draft
      price: 2500, // €25.00 in cents
      buyNowUrl: null,
      storeId: parseInt(storeId)
    }
    
    console.log('Creating product with data:', productData)
    
    const newProduct = await createProduct(productData)
    console.log('✅ Product created successfully!')
    console.log('Product ID:', newProduct.data.id)
    console.log('Product Name:', newProduct.data.attributes.name)
    console.log('Product Status:', newProduct.data.attributes.status)
    
  } catch (error) {
    console.error('❌ Error creating product:', error.message)
    console.error('Error details:', error.response?.data || error)
  }
}

createTestProduct()
