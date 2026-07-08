import type { MetadataRoute } from 'next'

const BASE = 'https://www.wouter.photo'

// Next-native sitemap (served at /sitemap.xml). Replaces next-sitemap, which
// relied on a `postbuild` hook that does not run in Vercel's `next build`.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const entries: Array<{
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  }> = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/portfolio', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/portfolio/concerts', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/portfolio/events', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/portfolio/misc', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/portfolio/commercial', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/portfolio/all', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/shop', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/shop/batchcrop', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/shop/export-every-x', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/shop/stage-fix-v6', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/algemene-voorwaarden', priority: 0.3, changeFrequency: 'yearly' },
  ]

  return entries.map((e) => ({
    url: `${BASE}${e.path}`,
    lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }))
}
