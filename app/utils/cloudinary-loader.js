// app/utils/cloudinary-loader.js

const cloudinaryLoader = ({ src, width, quality }) => {
  // We expect src to be like "/images/Material/material_beryllium"
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  

  if (!cloudName) {
    console.error('Cloudinary cloud name is not set. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.');
    return '';
  }

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload/`;

  const transformations = [
    'f_auto',
    'q_auto',
    `w_${width}`,
    quality ? `q_${quality}` : null
  ].filter(Boolean).join(',');

  let publicId = src;

  // Remove leading /images/ from the src path if it exists
  if (publicId.startsWith('/images/')) {
    publicId = publicId.substring('/images/'.length);
  }

  // Append .jpg extension if it's missing (assuming your uploaded images are JPG)
  if (!publicId.includes('.')) {
      publicId += '.jpg';
  }

  return `${baseUrl}${transformations}/${publicId}`;
};

module.exports = cloudinaryLoader;
