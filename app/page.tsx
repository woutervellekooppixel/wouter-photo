// app/page.tsx

import { redirect } from 'next/navigation'

export const metadata = {
  title: "Wouter.Photo – Concert & Event Photography",
  description: "Photography portfolio by Wouter Vellekoop. Specializing in concerts, events, and more.",
  openGraph: {
    title: "Wouter.Photo – Concert & Event Photography",
    description: "Discover the work of Wouter Vellekoop, a professional concert and event photographer based in the Netherlands.",
    url: "https://wouter.photo",
    siteName: "Wouter.Photo",
    images: [
      {
        url: "https://wouter.photo/2022_NSJF-Fri_1179.jpg",
        width: 1200,
        height: 630,
        alt: "Wouter Photo preview image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wouter.Photo – Concert & Event Photography",
    description: "Photography by Wouter Vellekoop",
    images: ["https://wouter.photo/social-preview.jpg"],
  },
}

export default function HomePage() {
  redirect('/portfolio')
}