import './globals.css'
import Header from '../components/Header'
import PWAHandler from '../components/PWAHandler'
import { Toaster } from '@/components/ui/toaster'
import FloatingContactWrapper from '../components/FloatingContactWrapper'
import Script from 'next/script'
import GA4PageView from '../components/GA4PageView'
import { ThemeProvider } from 'next-themes'
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://wouter.photo'),
  title: {
    default: 'Wouter Vellekoop – Concert & Event Photographer',
    template: '%s | Wouter.Photo'
  },
  description: 'Concert- en eventfotograaf in Nederland (NL/EN). Concert photography, event photography en advertising shoots – snelle delivery, consistente kwaliteit.',
  keywords: [
    // NL
    'concertfotograaf',
    'eventfotograaf',
    'muziekfotografie',
    'festivalfotograaf',
    'bedrijfsfotografie',
    'fotograaf inhuren',
    // EN
    'concert photographer',
    'event photographer', 
    'live music photography',
    'Netherlands photographer',
    'advertising photography',
    'corporate events',
    'festival photography',
    'North Sea Jazz',
    'music photography'
  ],
  authors: [{ name: 'Wouter Vellekoop' }],
  creator: 'Wouter Vellekoop',
  publisher: 'Wouter Vellekoop Photography',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    alternateLocale: ['en_US'],
    url: 'https://wouter.photo',
    siteName: 'Wouter Vellekoop Photography',
    title: 'Wouter Vellekoop – Concert & Event Photographer',
    description: 'Concert- en eventfotograaf in Nederland (NL/EN). Voor managers, marketing, productie en agencies.',
    images: [
      {
        url: '/2022_NSJF-Fri_1179.jpg',
        width: 1200,
        height: 630,
        alt: 'Wouter Vellekoop - Photographer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wouter Vellekoop – Professional Concert & Event Photographer',
    description: 'Professional concert, event, and advertising photographer based in the Netherlands.',
    images: ['/2022_NSJF-Fri_1179.jpg'],
  },
  verification: {
    // Voeg hier je Google Search Console verificatiecode toe
    // google: 'jouw-verificatie-code-hier',
  },
  alternates: {
    canonical: 'https://wouter.photo',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Gebruik Next.js usePathname hook voor correcte route-detectie (client-side)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Wouter Vellekoop',
    jobTitle: 'Photographer',
    description: 'Concert, event, and advertising photographer based in the Netherlands',
    url: 'https://wouter.photo',
    image: 'https://wouter.photo/2022_NSJF-Fri_1179.jpg',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NL',
      addressLocality: 'Netherlands'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@wouter.photo',
      contactType: 'Business Inquiries'
    },
    sameAs: [
      'https://instagram.com/woutervellekoop',
      'https://linkedin.com/in/woutervellekoop'
    ],
    knowsAbout: [
      'Concert Photography',
      'Event Photography', 
      'Live Music Photography',
      'Corporate Events',
      'Advertising Photography',
      'Festival Photography'
    ],
    hasCredential: [
      'MOJO',
      'Radio 538', 
      'North Sea Jazz',
      'Ahoy',
      'Talpa',
      'BNN VARA',
      'Residentie Orkest',
      'UNICEF Nederland'
    ]
  }

  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        
        {/* PWA Meta Tags - Cache cleared */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Wouter.Photo" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Google Analytics 4 (gtag) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SGRS9782NB"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-SGRS9782NB', { send_page_view: false });
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <GA4PageView />
          <PWAHandler />
          <Header />
          <Toaster />
          {children}
          <FloatingContactWrapper />
        </ThemeProvider>
      </body>
    </html>
  )
}