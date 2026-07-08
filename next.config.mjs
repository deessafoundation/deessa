/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production build optimizations and configuration
  // Prevent Next.js from bundling packages that rely on Node.js native modules,
  // WASM binaries, or dynamic require() calls. These must be loaded by the Node.js
  // runtime directly, not inlined by webpack.
  serverExternalPackages: [
    "@react-pdf/renderer",
    "jsdom",
    "isomorphic-dompurify",
    "html-encoding-sniffer",
    "@exodus/bytes",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["http://172.31.112.1:3000"],
  images: {
    remotePatterns: [
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
        hostname: '**', // Allow all HTTPS domains for flexibility
      },
    ],
    formats: ['image/avif', 'image/webp'], // Modern image formats for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Common device widths
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
  },
}

export default nextConfig
