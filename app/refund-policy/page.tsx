export default function RefundPolicyPage() {
  return (
    <main className="min-h-dvh bg-white dark:bg-black text-black dark:text-white">
      <div className="py-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Refund policy – wouter.photo</h1>

        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-10">
          <p>wouter.photo (Wouter Vellekoop)</p>
          <p>Chamber of Commerce (KvK): 27379554</p>
          <p>VAT (BTW): NL002024910B49</p>
          <p>Last updated: 20 March 2026</p>
        </div>

        <div className="space-y-10 text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Scope</h2>
            <p>
              This refund policy applies to digital products offered via wouter.photo, such as downloads.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Digital products (downloads)</h2>
            <p>
              Because digital content can be delivered immediately, refund requests are assessed on a case-by-case basis. If you run into technical
              problems, we will usually try to resolve them with you first.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. When you may be eligible for a refund</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You have a demonstrable technical issue that makes the product unusable, and we cannot resolve it.</li>
              <li>There was a duplicate payment for the same order.</li>
              <li>There was a clear delivery error (e.g. you received a different product than purchased).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. How to request a refund</h2>
            <p>
              Email{' '}
              <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">
                hello@wouter.photo
              </a>{' '}
              with:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>the email address used at checkout</li>
              <li>your order/receipt information (if available)</li>
              <li>a short description of the issue</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Processing</h2>
            <p>
              We aim to respond within a few business days. If approved, the refund will be processed to the payment method used. Processing time
              can vary per payment provider.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Contact</h2>
            <p>
              Email:{' '}
              <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">
                hello@wouter.photo
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Important</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This is a general explanation of the refund process. If you check out via an external provider, their terms may apply and the refund
              processing may (in part) be handled by that provider.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
