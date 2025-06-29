require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

function getAllImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.warn(chalk.default.yellow(`Directory '${dir}' does not exist.`));
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
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

async function main() {
  console.log(chalk.default.bold.blue('--- Starting Cloudinary Image Upload ---'));

  // Verify environment variables
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error(chalk.default.red('Error: Missing Cloudinary API credentials.'));
    console.error(chalk.default.red('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local or CI/CD settings.'));
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Scan for images
  const imagesBaseDir = path.join(process.cwd(), 'public', 'images');
  console.log(chalk.default.cyan(`Scanning for images in: ${imagesBaseDir}`));
  const imageFiles = getAllImageFiles(imagesBaseDir);

  if (imageFiles.length === 0) {
    console.warn(chalk.default.yellow('No image files found.'));
    console.log(chalk.default.bold.blue('--- Cloudinary Image Upload Finished ---'));
    return;
  }

  console.log(chalk.default.green(`Found ${imageFiles.length} image(s).`));

  // Upload images
  for (const filePath of imageFiles) {
    const relativePathInImagesDir = path.relative(imagesBaseDir, filePath);
    const parsedPath = path.parse(relativePathInImagesDir);
    let publicId = parsedPath.name.replace(/[^a-zA-Z0-9_-]/g, '_'); // Sanitize publicId
    let cloudinaryFolder = parsedPath.dir.replace(/\\/g, '/');
    if (cloudinaryFolder === '.' || cloudinaryFolder === '') {
      cloudinaryFolder = '';
    }

    console.log(chalk.default.cyan(`Processing: ${relativePathInImagesDir} (Public ID: ${publicId}, Folder: ${cloudinaryFolder || 'root'})`));

    const spinner = ora.default(chalk.default.magenta(`Uploading ${publicId} to folder ${cloudinaryFolder || 'root'}...`)).start();

    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true,
        folder: cloudinaryFolder,
        resource_type: 'image',
        invalidate: true, // Invalidate CDN cache
      });

      console.log(chalk.default.cyan('Upload response:', JSON.stringify({
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        created_at: uploadResult.created_at,
        bytes: uploadResult.bytes,
        invalidation_status: uploadResult.invalidation_status || 'Not specified',
      }, null, 2)));

      spinner.succeed(chalk.default.green(`Uploaded ${publicId} to folder '${cloudinaryFolder || 'root'}' (Public ID: ${uploadResult.public_id}): ${uploadResult.secure_url}`));
    } catch (error) {
      spinner.fail(chalk.default.red(`Failed to upload ${publicId} to folder '${cloudinaryFolder || 'root'}': ${error.message}`));
      console.error(chalk.default.red('Detailed error:', error));
    }
  }

  console.log(chalk.default.bold.blue('--- Cloudinary Image Upload Complete ---'));
}

main().catch(error => {
  console.error(chalk.default.red.bold('Unhandled error:', error));
  process.exit(1);
});