// app/utils/cloudinary-loader.js

// IMPORTANT: For local development, this MUST be set in your .env.local file.
// Example: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloudinary_cloud_name
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Defensive check: ensure the cloud name is present
if (!CLOUDINARY_CLOUD_NAME) {
  console.error("ERROR: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set. Cloudinary loader cannot function.");
  // In a production app, you might want a more robust fallback or error handling.
  // For now, it will just create an invalid Cloudinary URL.
}

// Base URL for Cloudinary image delivery.
// q_auto and f_auto are for automatic quality and format optimization.
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto`;

/**
 * Custom loader for next/image to fetch images from Cloudinary.
 * It transforms a local-looking path like /images/Material/my-image.jpg
 * into a Cloudinary public_id like Material/my-image.
 */
export default function cloudinaryLoader({ src, width, quality }) {
  // --- DEBUGGING CONSOLE LOGS ---
  // These will appear in your terminal where `npm run dev` is running.
  console.log("--- Cloudinary Loader INVOKED ---");
  console.log("Loader input src (from <Image src>):", src); // Expected: /images/Material/material-beryllium.jpg
  console.log("Loader input width:", width);

  // 1. Remove leading '/' from src (e.g., from '/images/Material/...')
  let publicId = src.startsWith('/') ? src.substring(1) : src;

  // 2. Remove the 'images/' directory prefix if present.
  //    This leaves the folder structure (e.g., 'Material/') and filename.
  if (publicId.startsWith('images/')) {
    publicId = publicId.substring('images/'.length); // Becomes 'Material/material-beryllium.jpg'
  }

  // 3. Remove the file extension (e.g., .jpg, .png).
  //    Cloudinary public_ids typically don't include extensions unless explicitly needed.
  const lastDotIndex = publicId.lastIndexOf('.');
  if (lastDotIndex > 0) {
    publicId = publicId.substring(0, lastDotIndex); // Becomes 'Material/material-beryllium'
  }

  // Construct the Cloudinary transformation string based on desired width and quality.
  // quality is optional and defaults to 75.
  const transformations = `w_${width},q_${quality || 75}`;

  // Build the final Cloudinary URL.
  // The 'publicId' now includes the folder structure (e.g., 'Material/material-beryllium'),
  // which Cloudinary interprets correctly as an asset within that folder.
  const finalUrl = `${CLOUDINARY_BASE_URL}/${transformations}/${publicId}`;

  // --- DEBUGGING CONSOLE LOGS ---
  console.log("Derived Cloudinary publicId (used in URL):", publicId);
  console.log("Generated FINAL Cloudinary URL:", finalUrl);
  console.log("--- Cloudinary Loader END ---");

  return finalUrl;
}
