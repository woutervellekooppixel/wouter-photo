export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-dvh bg-white dark:bg-black text-black dark:text-white">
      <div className="py-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy policy – wouter.photo</h1>

        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-10">
          <p>wouter.photo (Wouter Vellekoop)</p>
          <p>KvK: 27379554</p>
          <p>BTW: NL002024910B49</p>
          <p>Laatst bijgewerkt op: 20 maart 2026</p>
        </div>

        <div className="space-y-10 text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Over deze privacy policy</h2>
            <p>
              In deze privacy policy leggen we uit welke persoonsgegevens we verwerken wanneer je onze website bezoekt of contact met ons opneemt,
              waarom we dat doen en welke rechten je hebt.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Welke gegevens we verwerken</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Contactgegevens</span>: als je ons mailt of een formulier invult kunnen we je naam, e-mailadres en de
                inhoud van je bericht verwerken.
              </li>
              <li>
                <span className="font-medium">Technische gegevens</span>: zoals IP-adres (verkort of volledig afhankelijk van de dienst),
                apparaat-/browserinformatie en loggegevens die nodig zijn voor beveiliging en het functioneren van de site.
              </li>
              <li>
                <span className="font-medium">Gebruiksgegevens (analytics)</span>: we kunnen meten hoe de site wordt gebruikt (bijv. paginaweergaven)
                om de website te verbeteren.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Waarom we deze gegevens gebruiken (doelen)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Om contactvragen te beantwoorden en dienstverlening mogelijk te maken.</li>
              <li>Voor het beveiligen van de website en het voorkomen van misbruik.</li>
              <li>Voor statistiek en verbetering van de website (analytics).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Grondslagen (AVG/GDPR)</h2>
            <p>
              We verwerken persoonsgegevens alleen wanneer dit noodzakelijk is op basis van een of meer grondslagen, zoals uitvoering van een
              overeenkomst, gerechtvaardigd belang (bijv. beveiliging en verbetering van de website), of jouw toestemming waar dat vereist is.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Delen van gegevens met derden</h2>
            <p>
              We delen persoonsgegevens alleen met derden wanneer dat nodig is voor het leveren van onze diensten (bijv. e-mailverwerking, hosting of
              analytics) en wanneer dit passend is onder de AVG. Met partijen die in onze opdracht gegevens verwerken sluiten we waar nodig
              verwerkersovereenkomsten.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Bewaartermijnen</h2>
            <p>
              We bewaren persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld, tenzij een wettelijke
              bewaarplicht geldt.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Beveiliging</h2>
            <p>
              We nemen passende technische en organisatorische maatregelen om persoonsgegevens te beveiligen tegen verlies en ongeautoriseerde
              toegang.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Jouw rechten</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Recht op inzage, correctie en verwijdering.</li>
              <li>Recht op beperking van verwerking en bezwaar (in bepaalde gevallen).</li>
              <li>Recht op dataportabiliteit (waar van toepassing).</li>
              <li>Recht om toestemming in te trekken (als verwerking daarop is gebaseerd).</li>
            </ul>
            <p>
              Wil je een verzoek doen? Mail naar{' '}
              <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">
                hello@wouter.photo
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Klachten</h2>
            <p>
              Als je een klacht hebt over de verwerking van persoonsgegevens, neem dan contact met ons op. Je hebt ook het recht een klacht in te
              dienen bij de Autoriteit Persoonsgegevens.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Contact</h2>
            <p>
              E-mail:{' '}
              <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">
                hello@wouter.photo
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
