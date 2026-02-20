/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
  // Optimize bundle
  compress: true,

  async redirects() {
    return [
      {
        source: '/plugins/sliceeveryx',
        destination: '/plugins/export-every-x',
        permanent: true,
      },
      {
        source: '/plugins/crop-every-x',
        destination: '/plugins/export-every-x',
        permanent: true,
      },
      {
        source: '/plugins/slice-every-x',
        destination: '/plugins/export-every-x',
        permanent: true,
      },
      {
        source: '/plugins/export-slices',
        destination: '/plugins/export-every-x',
        permanent: true,
      },
      {
        source: '/plugins/batch-crop',
        destination: '/plugins/batchcrop',
        permanent: true,
      },
      {
        source: '/plugins/bulk-crop',
        destination: '/plugins/batchcrop',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
