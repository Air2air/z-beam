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
    optimizePackageImports: ['@vercel/analytics', '@vercel/speed-insights', 'react', 'react-dom'],
    // Enable CSS optimization
    optimizeCss: true,
    // Optimize font loading
    optimizeFonts: true,
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
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework (React) - critical, load first
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Vendor chunks - split more aggressively
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/)[1];
              return `vendor.${packageName.replace('@', '')}`;
            },
            priority: 20,
            minChunks: 1,
            maxSize: 100000, // Even smaller chunks: 100KB
          },
          // Common code
          common: {
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
            maxSize: 100000,
          },
        }
      };
      
      // Minimize bundle size
      config.optimization.minimize = true;
    }
    
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig);