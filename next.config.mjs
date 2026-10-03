/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production build optimizations and configuration
  // Prevent Next.js from bundling packages that rely on Node.js native modules,
  // WASM binaries, or dynamic require() calls. These must be loaded by the Node.js
  // runtime directly, not inlined by webpack.
  serverExternalPackages: [
    "@react-pdf/renderer",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["http://172.31.112.1:3000"],
  images: {
    // Keep in sync with ALLOWED_HOSTS in components/programs/SafeImage.tsx —
    // SafeImage renders plain <img> for hosts not listed here.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '*.gstatic.com',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern image formats for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Common device widths
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
  },
  async redirects() {
    return [
      {
        source: '/programs',
        destination: '/whatwedo',
        permanent: true,
      },
      {
        source: '/programs/:path*',
        destination: '/whatwedo/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // Stripe needs its js.stripe.com script and a frame for 3-D Secure.
            // 'unsafe-inline'/'unsafe-eval' remain for Next.js's inline runtime;
            // tighten with a nonce if the app moves to a strict CSP.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.youtube.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              // The accessibility reader plays server-synthesized speech as a
              // data: URL (lib/tts/providers/cloud-tts-provider.ts), and the
              // site serves its own video/audio files. 'self' does NOT cover
              // the data:/blob: schemes, so they must be listed explicitly —
              // without this, media is blocked and nothing is spoken aloud.
              "media-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com",
              // blob: is required because the app frames its own receipt PDF
              // preview in a blob: iframe (components/donations/receipt-preview.tsx,
              // app/demo/receipt/page.tsx) — 'self' does NOT implicitly cover
              // the blob: scheme for frame-src, it must be listed explicitly.
              "frame-src 'self' blob: https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
