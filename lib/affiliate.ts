// Centrale affiliate-configuratie. Zolang een programma nog niet is
// aangevraagd blijft de mapping leeg en blijven links gewone productlinks —
// artikelen kunnen dus live zonder dat er iets breekt.
//
// Invullen na aanmelding:
// - Amazon Associates (amazon.com): tag → bv. 'wouterphoto-20'
// - MPB (mpb.com): via hun affiliate-programma (levert meestal een
//   deeplink-prefix op; zie buildAffiliateUrl)
// - Kamera Express / CameraNU: via Daisycon/TradeTracker (deeplink-prefix)

/** Querystring-tags per hostname, bv. { 'www.amazon.com': { tag: 'xxx-20' } } */
const QUERY_TAGS: Record<string, Record<string, string>> = {
  // 'www.amazon.com': { tag: 'TODO-20' },
}

/** Deeplink-prefixes per hostname: de doel-URL wordt ge-encodeerd achter de prefix geplakt. */
const DEEPLINK_PREFIX: Record<string, string> = {
  // 'www.mpb.com': 'https://TODO-network.example/deeplink?url=',
}

export function buildAffiliateUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    const host = url.hostname

    const prefix = DEEPLINK_PREFIX[host]
    if (prefix) return `${prefix}${encodeURIComponent(url.toString())}`

    const tags = QUERY_TAGS[host]
    if (tags) {
      for (const [k, v] of Object.entries(tags)) url.searchParams.set(k, v)
      return url.toString()
    }

    return rawUrl
  } catch {
    return rawUrl
  }
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href) && !href.includes('wouter.photo')
}
