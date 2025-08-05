// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // For local development/testing
    dangerouslyAllowSVG: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },

  // Clean build optimization
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Temporarily ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig;