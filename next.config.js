// next.config.js
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Disable type checking during build (we do it in predeploy)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Static optimization settings
  trailingSlash: false, // Ensure consistent URLs for static generation
  
  // Image configuration - mobile-first optimization
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF first for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Removed 2048, 3840 for faster mobile
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: process.env.NODE_ENV === 'development', // Optimize in production
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 60,
    loader: 'default',
  },

  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['@vercel/analytics', '@vercel/speed-insights'],
    // Enable CSS optimization
    optimizeCss: true,
  },

  // Headers for caching (security headers moved to middleware.ts for CSP nonce support)
  async headers() {
    return [
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/favicon/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          },
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          }
        ]
      }
    ];
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Improved tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
      
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
            maxSize: 200000 // Reduced to 200KB for better loading
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
            maxSize: 200000 // Reduced to 200KB
          },
          // Framework chunk optimization
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          }
        }
      };
      
      // Minimize bundle size
      config.optimization.minimize = true;
    }
    
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig);