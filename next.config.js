// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    domains: ['res.cloudinary.com'],
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
}

module.exports = nextConfig;