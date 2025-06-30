// /app/scripts/uploadCloudinaryImages.js

require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

function getAllImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.warn(chalk.yellow(`Directory '${dir}' does not exist. Skipping.`));
    return fileList;
  }
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
      if (supportedExtensions.includes(ext)) {
        fileList.push(filePath);
      } else {
        console.warn(chalk.yellow(`Skipping unsupported file type: ${filePath}`));
      }
    }
  });
  return fileList;
}

async function main() {
  console.log(chalk.bold.blue('--- Starting Cloudinary Image Sync ---'));

  // Verify environment variables
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error(chalk.red('Error: Missing Cloudinary API credentials.'));
    console.error(chalk.red('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local or CI/CD settings.'));
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Scan for local images
  const imagesBaseDir = path.join(process.cwd(), 'public', 'images');
  console.log(chalk.cyan(`Scanning for images in: ${imagesBaseDir}`));
  const imageFiles = getAllImageFiles(imagesBaseDir);

  if (imageFiles.length === 0) {
    console.warn(chalk.yellow('No supported image files found for upload.'));
  } else {
    console.log(chalk.green(`Found ${imageFiles.length} image(s) for upload.`));
  }

  // Generate local public IDs
  const localPublicIds = imageFiles.map(file => {
    const relativePath = path.relative(imagesBaseDir, file);
    const parsedPath = path.parse(relativePath);
    return `${parsedPath.dir ? parsedPath.dir.replace(/\\/g, '/') + '/' : ''}${parsedPath.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  });

  // Fetch Cloudinary images
  const spinnerFetch = ora(chalk.magenta('Fetching Cloudinary images...')).start();
  let cloudinaryPublicIds = [];
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      prefix: '', // Fetch all images; adjust to 'Material' or 'Site/Logo' if needed
      max_results: 500, // Adjust based on your image count
    });
    cloudinaryPublicIds = result.resources.map(res => res.public_id);
    spinnerFetch.succeed(chalk.green(`Fetched ${cloudinaryPublicIds.length} images from Cloudinary.`));
  } catch (error) {
    spinnerFetch.fail(chalk.red(`Failed to fetch Cloudinary images: ${error.message}`));
    console.error(chalk.red('Detailed error:', JSON.stringify(error, null, 2)));
    process.exit(1);
  }

  // Identify images to delete
  const toDelete = cloudinaryPublicIds.filter(id => !localPublicIds.includes(id));
  console.log(chalk.cyan(`Found ${toDelete.length} images to delete from Cloudinary.`));

  // Delete unmatched images
  for (const publicId of toDelete) {
    const spinnerDelete = ora(chalk.magenta(`Deleting ${publicId} from Cloudinary...`)).start();
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      if (result.result === 'ok') {
        spinnerDelete.succeed(chalk.green(`Deleted ${publicId} from Cloudinary.`));
      } else {
        spinnerDelete.fail(chalk.red(`Failed to delete ${publicId}: ${result.result}`));
      }
    } catch (error) {
      spinnerDelete.fail(chalk.red(`Failed to delete ${publicId}: ${error.message}`));
      console.error(chalk.red('Detailed error:', JSON.stringify(error, null, 2)));
    }
  }

  // Upload images
  for (const filePath of imageFiles) {
    const relativePathInImagesDir = path.relative(imagesBaseDir, filePath);
    const parsedPath = path.parse(relativePathInImagesDir);
    let publicId = parsedPath.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    let cloudinaryFolder = parsedPath.dir.replace(/\\/g, '/');
    if (cloudinaryFolder === '.' || cloudinaryFolder === '') {
      cloudinaryFolder = '';
    }

    console.log(chalk.cyan(`Processing: ${relativePathInImagesDir} (Public ID: ${publicId}, Folder: ${cloudinaryFolder || 'root'})`));

    const spinnerUpload = ora(chalk.magenta(`Uploading ${publicId} to folder ${cloudinaryFolder || 'root'}...`)).start();

    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true,
        folder: cloudinaryFolder,
        resource_type: 'image',
        invalidate: true,
        transformation: [
          { width: 1200, quality: 80, fetch_format: 'auto' } // Optimize during upload
        ]
      });

      console.log(chalk.cyan('Upload response:', JSON.stringify({
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        created_at: uploadResult.created_at,
        bytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        invalidation_status: uploadResult.invalidation_status || 'Not specified',
      }, null, 2)));

      spinnerUpload.succeed(chalk.green(`Uploaded ${publicId} to folder '${cloudinaryFolder || 'root'}' (Public ID: ${uploadResult.public_id}): ${uploadResult.secure_url}`));
    } catch (error) {
      spinnerUpload.fail(chalk.red(`Failed to upload ${publicId} to folder '${cloudinaryFolder || 'root'}': ${error.message}`));
      console.error(chalk.red('Detailed error:', JSON.stringify(error, null, 2)));
    }
  }

  console.log(chalk.bold.blue('--- Cloudinary Image Sync Complete ---'));
}

main().catch(error => {
  console.error(chalk.red.bold('Unhandled error:', JSON.stringify(error, null, 2)));
  process.exit(1);
});
