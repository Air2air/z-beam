// scripts/uploadCloudinaryImages.js

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // For colored console output
const ora = require('ora');     // For spinner during upload

async function main() {
  console.log(chalk.bold.blue('--- Starting Cloudinary Image Upload ---'));

  // 1. Configure Cloudinary
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error(chalk.red('Error: Cloudinary API credentials are not set as environment variables.'));
    console.error(chalk.red('Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are configured.'));
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true, // Use HTTPS
  });

  // 2. Define image directory
  const imagesDir = path.join(process.cwd(), 'public', 'images'); // Assumes public/images in root
  console.log(chalk.cyan(`Scanning for images in: ${imagesDir}`));

  if (!fs.existsSync(imagesDir)) {
    console.warn(chalk.yellow(`Warning: Directory '${imagesDir}' does not exist. No images to upload.`));
    console.log(chalk.bold.blue('--- Cloudinary Image Upload Finished (No images found) ---'));
    return;
  }

  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext);
  });

  if (imageFiles.length === 0) {
    console.warn(chalk.yellow('No image files found in the directory.'));
    console.log(chalk.bold.blue('--- Cloudinary Image Upload Finished (No images to upload) ---'));
    return;
  }

  console.log(chalk.green(`Found ${imageFiles.length} image(s) to process.`));

  // 3. Upload each image
  for (const file of imageFiles) {
    const filePath = path.join(imagesDir, file);
    const publicId = path.basename(file, path.extname(file)); // e.g., 'beryllium-laser-cleaning-hero'

    const spinner = ora(chalk.magenta(`Uploading ${file}...`)).start();

    try {
      // Check if resource exists on Cloudinary and its current version (optional optimization)
      // This part can be complex if you want to avoid re-uploading identical files.
      // For simplicity here, we use `overwrite: true` to always ensure the latest version.
      // A more advanced script would compare local file hash to Cloudinary's Etag or version.

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true, // Always overwrite existing images with the same public_id
        folder: '', // Keep empty if you want images in the root of your Cloudinary bucket
        // If you want them in a subfolder like 'blog-assets', use folder: 'blog-assets'
        // This means your cloudinary-loader.js would also need to include 'blog-assets/' in the path.
        resource_type: 'image', // Explicitly specify resource type
      });

      spinner.succeed(chalk.green(`Uploaded ${file} (Public ID: ${publicId}): ${uploadResult.secure_url}`));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to upload ${file}: ${error.message}`));
      console.error(chalk.red('Detailed error:', error));
      // Decide if you want to exit on error or continue
      // process.exit(1);
    }
  }

  console.log(chalk.bold.blue('--- Cloudinary Image Upload Complete ---'));
}

main().catch(error => {
  // Try to use chalk, but fall back to plain console.error if chalk fails
  try {
    // Check if chalk.red and chalk.red.bold exist before using them
    if (chalk && chalk.red && typeof chalk.red.bold === 'function') {
      console.error(chalk.red.bold('An unhandled error occurred during upload:'), error);
    } else {
      console.error('An unhandled error occurred during upload (Chalk failed to format):', error);
    }
  } catch (logError) {
    // Fallback if even the chalk check fails for some reason
    console.error('An unhandled error occurred during upload (Chalk logging error):', error);
    console.error('Error during logging attempt:', logError);
  }
  process.exit(1);
});

// Add chalk and ora to package.json dependencies
// npm install chalk ora