// /app/utils/cloudinary-loader.js


const cloudinaryLoader = ({ src, width, quality }) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.error(
      'Cloudinary cloud name is not set. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables (.env.local or CI/CD settings).'
    );
    return src; // Fallback to original src to prevent broken images
  }

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/`;

  const maxWidth = Math.min(width, 1200); // Cap at 1200px for performance
  const transformations = [
    'f_auto', // Auto-format (e.g., WebP for supported browsers)
    'q_auto', // Auto-quality, overridden by quality if provided
    `w_${maxWidth}`,
    quality ? `q_${quality}` : 'q_80', // Default quality to balance size and clarity
  ].filter(Boolean).join(',');

  let publicId = src;

  // Remove leading /images/ from the src path if it exists
  if (publicId.startsWith('/images/')) {
    publicId = publicId.substring('/images/'.length);
  }

  // Append .jpg extension if missing (assumes most images are JPG)
  if (!publicId.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
    publicId += '.jpg';
  }

  // Check if the URL is already a Cloudinary URL
  if (src.includes('res.cloudinary.com')) {
    return src; // Return as-is if already a Cloudinary URL
  }

  // For non-Cloudinary URLs, apply the transformation
  const params = [`f_auto`, `q_auto`, `w_${width}`];
  if (quality) {
    params.push(`q_${quality}`);
  }

  // Only transform non-Cloudinary URLs
  return `https://res.cloudinary.com/dbzw24uge/image/upload/${params.join(',')}/${src}`;
};

module.exports = cloudinaryLoader;
