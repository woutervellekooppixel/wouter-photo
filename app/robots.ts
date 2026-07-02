import type { MetadataRoute } from 'next'

// Next-native robots (served at /robots.txt). Replaces next-sitemap's
// generateRobotsTxt, whose postbuild hook does not run in Vercel's build.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/admin/',
          '/api/cron/',
          '/api/debug/',
          '/api/test-debug/',
          '/api/debugdelete/',
        ],
      },
    ],
    sitemap: 'https://wouter.photo/sitemap.xml',
    host: 'https://wouter.photo',
  }
}
