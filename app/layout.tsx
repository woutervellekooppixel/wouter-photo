import './globals.css'
import Header from '../components/Header'
import PWAHandler from '../components/PWAHandler'
import { Toaster } from '@/components/ui/toaster'
import FloatingContactButton from '../components/FloatingContactButton'
import MobileFloatingContactButton from '../components/MobileFloatingContactButton'
import Script from 'next/script'
import AnalyticsInit from '../components/AnalyticsInit'
import { ThemeProvider } from 'next-themes'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://wouter.photo'),
  title: {
    default: 'Wouter Vellekoop – Professional Concert & Event Photographer',
    template: '%s | Wouter.Photo'
  },
  description: 'Professional concert, event, and advertising photographer based in the Netherlands. Capturing raw energy of live performances with speed, consistency and style.',
  keywords: [
    'concert photographer',
    'event photographer', 
    'professional photography',
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
    locale: 'en_US',
    url: 'https://wouter.photo',
    siteName: 'Wouter Vellekoop Photography',
    title: 'Wouter Vellekoop – Professional Concert & Event Photographer',
    description: 'Professional concert, event, and advertising photographer based in the Netherlands. Capturing raw energy of live performances.',
    images: [
      {
        url: '/2022_NSJF-Fri_1179.jpg',
        width: 1200,
        height: 630,
        alt: 'Wouter Vellekoop - Professional Photographer',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Wouter Vellekoop',
    jobTitle: 'Professional Photographer',
    description: 'Professional concert, event, and advertising photographer based in the Netherlands',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="canonical" href="https://wouter.photo" />
        
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
        
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-K55DF7SN');
          `}
        </Script>
        
        {/* Google Analytics 4 Direct */}
        <Script 
          src={`https://www.googletagmanager.com/gtag/js?id=G-SGRS9782NB`} 
          strategy="afterInteractive"
        />
        {/* Google Analytics initialisatie nu client-side voor hydration fix */}
        <AnalyticsInit />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-K55DF7SN"
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            ></iframe>
          </noscript>

          <PWAHandler />
          <Header />
          <Toaster />
          {children}
          <FloatingContactButton />
          <MobileFloatingContactButton />
        </ThemeProvider>
      </body>
    </html>
  )
}