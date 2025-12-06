// next.config.js
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  compress: true, // Enables gzip compression
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  // Enable compression headers for Vercel
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA || 'development'
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

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
    minimumCacheTTL: 31536000, // 1 year cache for static images
    loader: 'default',
  },

  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: ['@vercel/analytics', '@vercel/speed-insights', 'react', 'react-dom'],
    // Enable CSS optimization
    optimizeCss: true,
    // Modern JavaScript output - no unnecessary transpilation for modern browsers
    forceSwcTransforms: true,
  },

  // Headers for caching (security headers moved to middleware.ts for CSP nonce support)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            // Preload critical resources to break dependency chains
            value: '</images/logo/logo-zbeam.png>; rel=preload; as=image; fetchpriority=high'
          }
        ]
      },
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

  // Redirects for URL structure changes
  async redirects() {
    const fs = require('fs').promises;
    const path = require('path');
    const yaml = require('js-yaml');
    
    try {
      const frontmatterDir = path.join(process.cwd(), 'frontmatter/materials');
      const files = await fs.readdir(frontmatterDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      
      // Centralized URL normalization function - MANDATORY: strips parentheses
      const normalizeForUrl = (value) => value
        .toLowerCase()
        .replace(/[()]/g, '')     // MANDATORY: Strip all parentheses
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Collapse multiple hyphens
        .replace(/^-|-$/g, '');   // Trim leading/trailing hyphens
      
      const redirects = [
        // Non-www to www redirect (redundant with vercel.json but ensures it works)
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'z-beam.com',
            },
          ],
          destination: 'https://www.z-beam.com/:path*',
          permanent: true,
        },
      ];
      
      for (const file of yamlFiles) {
        const filePath = path.join(frontmatterDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(content);
        
        if (data.category && data.subcategory) {
          const slug = file.replace(/\.(yaml|yml)$/, '');
          const category = normalizeForUrl(data.category);
          const subcategory = normalizeForUrl(data.subcategory);
          
          // Redirect old flat URLs to /materials/ structure
          redirects.push({
            source: `/${slug}`,
            destination: `/materials/${category}/${subcategory}/${slug}`,
            permanent: true // 301 redirect for SEO
          });
          
          // Redirect root-level categorized URLs back to /materials/*
          redirects.push({
            source: `/${category}/${subcategory}/${slug}`,
            destination: `/materials/${category}/${subcategory}/${slug}`,
            permanent: true // 301 redirect for SEO
          });
        }
      }
      
      // Also redirect root-level category pages to /materials
      const categories = ['metal', 'rare-earth', 'ceramic', 'composite', 'glass', 'plastic', 'stone', 'semiconductor', 'building', 'wood'];
      for (const category of categories) {
        redirects.push({
          source: `/${category}`,
          destination: `/materials/${category}`,
          permanent: true
        });
      }
      
      return redirects;
    } catch (error) {
      console.warn('Could not generate redirects:', error.message);
      return [];
    }
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
        maxSize: 100000, // Force smaller 100KB chunks
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
          // Vendor chunks - split into smaller pieces
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 20,
            minChunks: 1,
            maxSize: 100000,
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

  // SWC compiler options for modern JavaScript output
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Modern JavaScript target - reduces polyfills
  swcMinify: true,
}

module.exports = withBundleAnalyzer(nextConfig);