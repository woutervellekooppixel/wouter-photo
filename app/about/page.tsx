'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function AboutPage() {
  const [isInNetherlands, setIsInNetherlands] = useState<boolean | null>(null)

  // Check user's location for phone number visibility
  useEffect(() => {
    async function checkLocation() {
      try {
        // Probeer eerst CloudFlare's service (sneller en betrouwbaarder)
        const cfResponse = await fetch('https://cloudflare.com/cdn-cgi/trace')
        const cfText = await cfResponse.text()
        const cfCountry = cfText.match(/loc=([A-Z]{2})/)?.[1]
        
        if (cfCountry) {
          setIsInNetherlands(cfCountry === 'NL')
          return
        }

        // Fallback naar ipapi als CloudFlare faalt
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        setIsInNetherlands(data.country_code === 'NL')
      } catch (error) {
        // Als beide falen, assumeer niet-Nederlandse bezoeker voor privacy
        console.log('Geolocation check failed, hiding phone number for privacy')
        setIsInNetherlands(false)
      }
    }
    checkLocation()
  }, [])

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Wouter Vellekoop",
            "jobTitle": "Photographer",
            "url": "https://wouter.photo",
            "sameAs": [
              "https://instagram.com/woutervellekoop.nl",
              "https://linkedin.com/in/woutervellekoop"
            ]
          })
        }}
      />

      <main className="py-20 px-6 max-w-6xl mx-auto text-black dark:text-white bg-white dark:bg-black min-h-screen">


      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* FOTO */}
        <div className="w-full relative aspect-[4/3]">
          <Image
            src="/2022_NSJF-Fri_1179.jpg"
            alt="Wouter Vellekoop - Professional Photographer"
            fill
            priority
            className="shadow-lg object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* TEKST */}
        <div className="text-lg leading-relaxed">
        <h1 className="text-3xl font-bold mb-10">ABOUT</h1>
          <p className="mb-6">
            I'm Wouter Vellekoop - a professional photographer based in the Netherlands, specializing in concert, event, conceptual, and advertising photography.  
            My passion lies in capturing the raw energy of live performances and translating atmosphere into powerful visuals.
          </p>
          <p className="mb-6">
            I’ve worked with a wide range of artists, venues, organisations and media outlets, combining speed, consistency and style.  
            Whether it's the chaos of a music festival or the intimacy of a backstage moment, I aim to tell stories that resonate.
          </p>
          <h2 className="text-xl font-semibold mb-2">Clients</h2>
          <p className="text-sm mb-4">
            MOJO, Radio 538, North Sea Jazz, Ahoy', Talpa, BNN VARA, Residentie Orkest, UNICEF Nederland and many more.
          </p>
          <p className="text-sm">
            <a href="mailto:hello@wouter.photo" className="underline hover:text-gray-600 dark:hover:text-gray-300">hello@wouter.photo</a>
            {/* Phone number only visible for Dutch visitors */}
            {isInNetherlands && (
              <>
                <br />
                +31 (0)6 16 290 418
              </>
            )}
          </p>
        </div>
      </div>
    </main>
    </>
  )
}