// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    providerImportSource: "@mdx-js/react",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack optimization to prevent common errors
  webpack: (config, { dev, isServer }) => {
    // Prevent vendor chunk corruption
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.vendor = {
        name: 'vendor',
        test: /[\\/]node_modules[\\/]/,
        chunks: 'all',
        enforce: true,
      }
    }

    // Resolve module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    return config
  },

  // Image configuration
  images: {
    loader: 'custom',
    domains: ['res.cloudinary.com'],
    loaderFile: './app/utils/cloudinary-loader.js',
  },

  // Configure features
  turbopack: {
    // Turbopack configuration options
    resolveAlias: {},
  },
  experimental: {
    serverActions: {
      // Server Actions configuration
      bodySizeLimit: '2mb'
    },
  },
  serverExternalPackages: [],

  // Clean build optimization
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
}

// Configure page extensions to include mdx files
nextConfig.pageExtensions = ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'];

// Export the combined config
module.exports = withMDX(nextConfig);