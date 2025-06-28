// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'custom',
    domains: ['res.cloudinary.com'],
    loaderFile: './app/utils/cloudinary-loader.js',
  },
};

module.exports = nextConfig;