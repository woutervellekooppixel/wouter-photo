export default function RefundPolicyPage() {
  return (
    <main className="min-h-dvh bg-white dark:bg-black text-black dark:text-white">
      <div className="py-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Refund policy – wouter.photo</h1>

        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-10">
          <p>wouter.photo (Wouter Vellekoop)</p>
          <p>KvK: 27379554</p>
          <p>BTW: NL002024910B49</p>
          <p>Laatst bijgewerkt op: 20 maart 2026</p>
        </div>

        <div className="space-y-10 text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Toepassing</h2>
            <p>
              Dit refund policy is van toepassing op digitale producten die via wouter.photo worden aangeboden, zoals downloads.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Digitale producten (downloads)</h2>
            <p>
              Omdat het om digitale content gaat die direct geleverd kan worden, beoordelen we refund-verzoeken per geval. Als je tegen technische
              problemen aanloopt, lossen we dat in de meeste gevallen eerst met je op.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Wanneer je in aanmerking kunt komen voor refund</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Je hebt aantoonbaar een technisch probleem waardoor het product niet bruikbaar is, en we kunnen dit niet oplossen.</li>
              <li>Er is sprake van een dubbele betaling voor dezelfde bestelling.</li>
              <li>Er is sprake van een duidelijke fout in de levering (bijv. je hebt een ander product ontvangen dan gekocht).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Hoe vraag je een refund aan?</h2>
            <p>
              Mail naar{' '}
              <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">
                hello@wouter.photo
              </a>{' '}
              met:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>het e-mailadres waarmee je hebt afgerekend</li>
              <li>je order/receipt informatie (indien beschikbaar)</li>
              <li>een korte omschrijving van het probleem</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Afhandeling</h2>
            <p>
              We streven ernaar om binnen enkele werkdagen te reageren. Bij goedkeuring wordt de refund verwerkt via de betaalmethode waarmee je
              betaald hebt. De verwerkingstijd kan per betalingsprovider variëren.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Contact</h2>
            <p>
              E-mail:{' '}
              <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">
                hello@wouter.photo
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Belangrijk</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Dit is een algemene uitleg van het refund proces. Als je via een externe checkout-provider afrekent, kunnen de voorwaarden en
              verwerking van refunds (deels) via die provider verlopen.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
