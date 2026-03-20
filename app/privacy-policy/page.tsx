export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-dvh bg-white dark:bg-black text-black dark:text-white">
      <div className="py-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy policy – wouter.photo</h1>

        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-10">
          <p>wouter.photo (Wouter Vellekoop)</p>
          <p>Chamber of Commerce (KvK): 27379554</p>
          <p>VAT (BTW): NL002024910B49</p>
          <p>Last updated: 20 March 2026</p>
        </div>

        <div className="space-y-10 text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. About this privacy policy</h2>
            <p>
              This privacy policy explains which personal data we process when you visit our website or contact us, why we do so, and which rights
              you have.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. What data we process</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Contact details</span>: if you email us or submit a form, we may process your name, email address and
                the content of your message.
              </li>
              <li>
                <span className="font-medium">Technical data</span>: such as IP address (truncated or full depending on the service), device/browser
                information and logs needed for security and operation of the site.
              </li>
              <li>
                <span className="font-medium">Usage data (analytics)</span>: we may measure how the site is used (e.g. page views) to improve the
                website.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Why we use this data (purposes)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To respond to contact requests and provide services.</li>
              <li>To secure the website and prevent abuse.</li>
              <li>For statistics and improvement of the website (analytics).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Legal bases (GDPR)</h2>
            <p>
              We process personal data only when necessary and on one or more legal bases, such as performance of a contract, legitimate interests
              (e.g. security and improvement of the website), or your consent where required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Sharing data with third parties</h2>
            <p>
              We share personal data with third parties only when necessary to provide our services (e.g. email processing, hosting or analytics)
              and when appropriate under the GDPR. Where required, we enter into data processing agreements with parties that process data on our
              behalf.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Retention</h2>
            <p>
              We do not keep personal data longer than necessary for the purposes for which it was collected, unless a legal retention obligation
              applies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Security</h2>
            <p>
              We take appropriate technical and organizational measures to protect personal data against loss and unauthorized access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Your rights</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Right of access, rectification and erasure.</li>
              <li>Right to restrict processing and object (in certain cases).</li>
              <li>Right to data portability (where applicable).</li>
              <li>Right to withdraw consent (if processing is based on consent).</li>
            </ul>
            <p>
              To submit a request, email{' '}
              <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">
                hello@wouter.photo
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Complaints</h2>
            <p>
              If you have a complaint about how we process personal data, please contact us. You also have the right to lodge a complaint with your
              local supervisory authority.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Contact</h2>
            <p>
              Email:{' '}
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
