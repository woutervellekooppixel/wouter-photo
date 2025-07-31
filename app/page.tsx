// app/page.tsx

import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Professional Concert & Event Photographer | Wouter Vellekoop",
  description: "Award-winning concert and event photographer based in the Netherlands. Specializing in live music, corporate events, and advertising photography. Trusted by MOJO, Radio 538, North Sea Jazz, and more.",
  keywords: [
    'concert photographer Netherlands',
    'event photographer',
    'live music photography',
    'professional photographer',
    'North Sea Jazz photographer',
    'Radio 538 photographer',
    'MOJO photographer',
    'corporate events photography',
    'festival photographer',
    'music venue photography'
  ],
  openGraph: {
    title: "Professional Concert & Event Photographer | Wouter Vellekoop",
    description: "Award-winning concert and event photographer based in the Netherlands. Capturing the raw energy of live performances with professional quality.",
    url: "https://wouter.photo",
    siteName: "Wouter Vellekoop Photography",
    images: [
      {
        url: "https://wouter.photo/2022_NSJF-Fri_1179.jpg",
        width: 1200,
        height: 630,
        alt: "Wouter Vellekoop - Professional Concert Photographer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Concert & Event Photographer | Wouter Vellekoop",
    description: "Award-winning concert and event photographer based in the Netherlands",
    images: ["https://wouter.photo/2022_NSJF-Fri_1179.jpg"],
  },
  alternates: {
    canonical: 'https://wouter.photo',
  },
}

export default function HomePage() {
  redirect('/portfolio')
}