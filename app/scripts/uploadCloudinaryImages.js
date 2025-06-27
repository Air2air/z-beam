// scripts/uploadCloudinaryImages.js

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // For colored console output
const ora = require('ora');     // For spinner during upload

/**
 * Recursively finds all image files within a directory.
 * @param {string} dir Path to the directory to scan.
 * @param {string[]} fileList Accumulator for file paths.
 * @returns {string[]} List of absolute paths to image files.
 */
function getAllImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllImageFiles(filePath, fileList); // Recurse into subdirectories
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

async function main() {
  console.log(chalk.default.bold.blue('--- Starting Cloudinary Image Upload ---'));

  // 1. Configure Cloudinary
  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
  const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error(chalk.default.red('Error: Cloudinary API credentials are not set as environment variables.'));
    console.error(chalk.default.red('Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are configured.'));
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true, // Use HTTPS
  });

  // 2. Define image directory and find all images recursively
  const imagesBaseDir = path.join(process.cwd(), 'public', 'images'); // The base directory to scan from
  console.log(chalk.default.cyan(`Scanning for images in: ${imagesBaseDir} and its subfolders`));

  if (!fs.existsSync(imagesBaseDir)) {
    console.warn(chalk.default.yellow(`Warning: Directory '${imagesBaseDir}' does not exist. No images to upload.`));
    console.log(chalk.default.bold.blue('--- Cloudinary Image Upload Finished (No images found) ---'));
    return;
  }

  const imageFiles = getAllImageFiles(imagesBaseDir); // Get all image file full paths

  if (imageFiles.length === 0) {
    console.warn(chalk.default.yellow('No image files found in the directory or its subdirectories.'));
    console.log(chalk.default.bold.blue('--- Cloudinary Image Upload Finished (No images to upload) ---'));
    return;
  }

  console.log(chalk.default.green(`Found ${imageFiles.length} image(s) to process.`));

  // 3. Upload each image
  for (const filePath of imageFiles) { // filePath is now the full absolute path to the image
    // Determine the Cloudinary folder based on the image's local path relative to imagesBaseDir
    const relativePath = path.relative(imagesBaseDir, filePath); // e.g., 'Material/material-beryllium.jpg' or 'logo.png'
    let cloudinaryFolder = path.dirname(relativePath); // e.g., 'Material' or '.' for root files

    // If path.dirname returns '.' for files directly in imagesBaseDir, set folder to empty string
    if (cloudinaryFolder === '.' || cloudinaryFolder === '') {
      cloudinaryFolder = '';
    }

    const publicId = path.basename(filePath, path.extname(filePath)); // e.g., 'material-beryllium'

    // MODIFIED: ora.default instead of ora
    const spinner = ora.default(chalk.default.magenta(`Uploading ${relativePath}...`)).start();

    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true,
        folder: cloudinaryFolder, // Dynamically determined folder!
        resource_type: 'image',
      });

      spinner.succeed(chalk.default.green(`Uploaded ${relativePath} (Public ID: ${publicId}): ${uploadResult.secure_url}`));
    } catch (error) {
      spinner.fail(chalk.default.red(`Failed to upload ${relativePath}: ${error.message}`));
      console.error(chalk.default.red('Detailed error:', error));
      // process.exit(1);
    }
  }

  console.log(chalk.default.bold.blue('--- Cloudinary Image Upload Complete ---'));
}

main().catch(error => {
  try {
    if (chalk && chalk.default && chalk.default.red && typeof chalk.default.red.bold === 'function') {
      console.error(chalk.default.red.bold('An unhandled error occurred during upload:'), error);
    } else {
      console.error('An unhandled error occurred during upload (Chalk failed to format):', error);
    }
  } catch (logError) {
    console.error('An unhandled error occurred during upload (Chalk logging error):', error);
    console.error('Error during logging attempt:', logError);
  }
  process.exit(1);
});