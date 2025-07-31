import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

// Setup Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => {
    console.error('Lemon Squeezy error:', error)
  },
})

// Product variant IDs (je krijgt deze van Lemon Squeezy dashboard)
export const LEMON_SQUEEZY_VARIANTS = {
  print1: 'your_variant_id_here', // Zwart-wit Concertfoto
  print2: 'your_variant_id_here', // Backstage Moment
  print3: 'your_variant_id_here', // Dramatische Spotlights
  print4: 'your_variant_id_here', // Zanger in actie
  print5: 'your_variant_id_here', // Overzichtsfoto Festival
  print6: 'your_variant_id_here', // Intiem portret
} as const

export type ProductId = keyof typeof LEMON_SQUEEZY_VARIANTS
