// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'custom',
    // THIS PATH IS NOW CORRECT FOR 'app/utils/cloudinary-loader.js'
    loaderFile: './app/utils/cloudinary-loader.js',
  },
  // Keep your other Next.js configurations here
};

module.exports = nextConfig;