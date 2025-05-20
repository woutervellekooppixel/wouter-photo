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

export const metadata = {
  title: "About – Wouter.Photo",
  description: "Learn more about Wouter Vellekoop – professional concert and event photographer based in the Netherlands.",
}

export default function AboutPage() {
  return (
    <main className="py-20 px-6 max-w-6xl mx-auto text-black">


      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* FOTO */}
        <div className="w-full">
          <img
            src="/2022_NSJF-Fri_1179.jpg"
            alt="Wouter Vellekoop"
            className="shadow-lg w-full h-auto object-cover"
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
            <a href="mailto:hello@wouter.photo" className="underline">hello@wouter.photo</a><br />
            +31 (0)6 16 290 418
          </p>
        </div>
      </div>
    </main>
  )
}