import type { Metadata } from 'next'

import { metadata as pageMetadata } from './metadata'

export const metadata: Metadata = pageMetadata

export default function TermsOfServiceShopPage() {
  return (
    <main className="min-h-dvh bg-white dark:bg-black text-black dark:text-white">
      <div className="py-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms of service (Shop) – wouter.photo</h1>

        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-10">
          <p>Chamber of Commerce (KvK): 27379554</p>
          <p>VAT (BTW): NL002024910B49</p>
          <p>Last updated: 20 March 2026</p>
        </div>

        <div className="space-y-10 text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Scope</h2>
            <p>
              These terms apply to digital products sold via the wouter.photo shop (for example Lightroom presets,
              Adobe Camera Raw presets, and plugins). Photography services and photography client deliveries are
              covered by the Dutch terms at <a className="underline underline-offset-4" href="/algemene-voorwaarden">/algemene-voorwaarden</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Definitions</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Seller</strong>: wouter.photo</li>
              <li><strong>Customer</strong>: the person or entity purchasing a digital product</li>
              <li><strong>Digital product</strong>: presets, plugins, downloadable files, and related documentation</li>
              <li><strong>Order</strong>: the purchase of one or more digital products via the shop</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Ordering & payment</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>An order is completed when payment is confirmed by the payment provider.</li>
              <li>Prices shown in the shop may include or exclude taxes depending on your location and checkout.</li>
              <li>You are responsible for providing correct billing and contact information.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Delivery</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Digital products are delivered electronically (download link and/or account access).</li>
              <li>
                If you do not receive your download email or link, first check spam/promotions, then contact
                <a className="underline underline-offset-4" href="mailto:hello@wouter.photo"> hello@wouter.photo</a>.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. License & permitted use</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Unless stated otherwise at checkout, digital products are licensed, not sold, for use by the
                purchasing customer.
              </li>
              <li>You may use the product in your own workflows and client work.</li>
              <li>
                You may not resell, redistribute, share, sublicense, or make the files publicly available (including
                uploading to preset marketplaces, file sharing platforms, or “free download” sites).
              </li>
              <li>
                If you need a studio/team license or multi-seat use, contact <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">hello@wouter.photo</a>.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Updates & compatibility</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Some products may receive updates. Availability and scope of updates can vary per product.</li>
              <li>
                Compatibility depends on your software and version (e.g. Lightroom Classic / Adobe Camera Raw).
                You are responsible for meeting the requirements listed on the product page.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Refunds</h2>
            <p>
              Refund requests are handled according to the refund policy at{' '}
              <a className="underline underline-offset-4" href="/refund-policy">/refund-policy</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Intellectual property</h2>
            <p>
              All intellectual property rights in the digital products and website content remain with wouter.photo
              (or its licensors). These terms do not transfer ownership.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Liability</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Digital products are provided “as is” to the extent permitted by applicable law.
              </li>
              <li>
                wouter.photo is not liable for indirect damages (including lost profit, lost data, or business
                interruption).
              </li>
              <li>
                If liability cannot be excluded under applicable law, it is limited to the amount you paid for the
                relevant product.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Misuse & fraud</h2>
            <p>
              wouter.photo may suspend access or refuse service in cases of fraud, abuse, chargeback fraud, or
              unauthorized distribution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Changes to these terms</h2>
            <p>
              These terms may be updated from time to time. The version published on this page applies to new
              orders from the date shown above.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">11. Governing law</h2>
            <p>
              These terms are governed by Dutch law. Any disputes will be submitted to the competent court in the
              Netherlands, unless mandatory consumer law provides otherwise.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">12. Contact</h2>
            <p>
              Questions about an order or license: <a className="underline underline-offset-4" href="mailto:hello@wouter.photo">hello@wouter.photo</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
