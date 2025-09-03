// Script om alle producten aan te maken in LemonSqueezy wanneer account geverifieerd is
import { lemonSqueezySetup, createProduct, createVariant } from '@lemonsqueezy/lemonsqueezy.js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Product data voor je fotografie prints
const products = [
  {
    name: "Amsterdam Canals",
    description: "Prachtige opname van de iconische Amsterdamse grachten bij zonsondergang. Deze foto vangt de unieke sfeer van de stad perfect, met de historische gevels die reflecteren in het water. Perfect voor in je woonkamer of kantoor.",
    price: 2500, // €25.00 in cents
    filename: "amsterdam-canals-high-res.jpg"
  },
  {
    name: "Sunset Mountains", 
    description: "Een adembenemende zonsondergang achter de bergtoppen. De warme kleuren en dramatische luchten maken deze foto een echte eyecatcher. Ideaal voor wie van natuurfotografie houdt.",
    price: 3000, // €30.00 in cents
    filename: "sunset-mountains-high-res.jpg"
  },
  {
    name: "City Nights",
    description: "De stad die nooit slaapt - gevangen in één beeld. Nachtfotografie van stedelijke architectuur met prachtige lichtsporen en reflecties. Perfect voor moderne interieurs.",
    price: 2500, // €25.00 in cents
    filename: "city-nights-high-res.jpg"
  },
  {
    name: "Forest Path",
    description: "Een mystiek bospad dat uitnodigt tot verkenning. Deze natuurfoto brengt rust en sereniteit in elke ruimte. De subtiele kleuren en compositie maken het een tijdloze keuze.",
    price: 2000, // €20.00 in cents
    filename: "forest-path-high-res.jpg"
  },
  {
    name: "Ocean Waves",
    description: "De kracht en schoonheid van de oceaan in één beeld. Deze dynamische foto van golven tegen de rotsen brengt energie en beweging in je interieur. Voor liefhebbers van zeefotografie.",
    price: 3500, // €35.00 in cents
    filename: "ocean-waves-high-res.jpg"
  },
  {
    name: "Urban Architecture",
    description: "Moderne architectuur in perspectief. Deze compositie van lijnen, vormen en schaduwen toont de schoonheid van stedelijk design. Perfect voor contemporary interieurs.",
    price: 2500, // €25.00 in cents
    filename: "urban-architecture-high-res.jpg"
  }
]

async function createAllProducts() {
  console.log('🚀 Aanmaken van alle fotografie producten in LemonSqueezy...')
  
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY,
  })

  try {
    const storeId = parseInt(process.env.LEMONSQUEEZY_STORE_ID)
    console.log('Store ID:', storeId)
    
    for (const productData of products) {
      console.log(`\n📦 Aanmaken: ${productData.name}`)
      
      // Maak product aan
      const product = await createProduct({
        name: productData.name,
        description: productData.description,
        status: 'published',
        storeId: storeId
      })
      
      console.log(`✅ Product aangemaakt: ${product.data.id}`)
      
      // Maak variant aan (voor de prijs)
      const variant = await createVariant({
        productId: parseInt(product.data.id),
        name: `${productData.name} - High Resolution Download`,
        price: productData.price,
        isSubscription: false,
        interval: null,
        intervalCount: null,
        trialInterval: null,
        trialIntervalCount: null,
        payWhat: null,
        minPrice: null,
        suggestedPrice: null,
        status: 'published'
      })
      
      console.log(`✅ Variant aangemaakt: ${variant.data.id} - €${(productData.price / 100).toFixed(2)}`)
      console.log(`📁 Download bestand: ${productData.filename}`)
    }
    
    console.log('\n🎉 Alle producten succesvol aangemaakt!')
    console.log('\n📋 Volgende stappen:')
    console.log('1. Upload high-resolution bestanden naar /public/downloads/')
    console.log('2. Update de variant IDs in je checkout code')
    console.log('3. Test de checkout flow')
    
  } catch (error) {
    console.error('❌ Fout bij aanmaken producten:', error)
    if (error.response?.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

// Alleen uitvoeren als script direct wordt aangeroepen
if (require.main === module) {
  createAllProducts()
}

export { createAllProducts, products }
