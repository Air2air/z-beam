require("dotenv").config({
  path: require("path").resolve(process.cwd(), ".env.local"),
});
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const ora = require("ora").default;
const crypto = require("crypto"); // Import Node.js crypto module for hashing

// Helper function for console output without chalk
function log(level, message, detail = null) {
  const timestamp = new Date().toISOString();
  let prefix = "";
  switch (level) {
    case "info":
      prefix = "[INFO]";
      break;
    case "warn":
      prefix = "[WARN]";
      break;
    case "error":
      prefix = "[ERROR]";
      break;
    case "success":
      prefix = "[SUCCESS]";
      break;
    case "debug":
      prefix = "[DEBUG]";
      break;
    default:
      prefix = "[LOG]";
  }
  console.log(`${timestamp} ${prefix} ${message}`);

  if (detail) {
    if (detail instanceof Error) {
      console.error(`Error Type: ${detail.name}`);
      console.error(`Error Message: ${detail.message}`);
      if (detail.stack) {
        console.error("Stack Trace:\n", detail.stack);
      }
      if (detail.response && detail.response.data) {
        console.error("Error Response Data:\n", JSON.stringify(detail.response.data, null, 2));
      }
    } else {
      console.log("Details:\n", JSON.stringify(detail, null, 2));
    }
  }
}

// Function to calculate MD5 hash of a file
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', err => reject(err));
  });
}

function getAllImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    log("warn", `Directory '${dir}' does not exist. Skipping.`);
    return fileList;
  }
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      const supportedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".avif",
      ];
      if (supportedExtensions.includes(ext)) {
        fileList.push(filePath);
      } else {
        log("warn", `Skipping unsupported file type: ${filePath}`);
      }
    }
  });
  return fileList;
}

async function main() {
  log("info", "--- Starting Cloudinary Image Sync ---");

  // Verify environment variables
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    log("error", "Missing Cloudinary API credentials.");
    log(
      "error",
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local or CI/CD settings."
    );
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Scan for local images
  const imagesBaseDir = path.join(process.cwd(), "public", "images");
  log("info", `Scanning for images in: ${imagesBaseDir}`);
  const imageFiles = getAllImageFiles(imagesBaseDir);

  if (imageFiles.length === 0) {
    log("warn", "No supported image files found for upload.");
  } else {
    log("success", `Found ${imageFiles.length} image(s) for upload.`);
  }

  // Generate local public IDs and calculate local hashes
  const localImages = {}; // Map public_id to { filePath, hash }
  for (const file of imageFiles) {
    const relativePath = path.relative(imagesBaseDir, file);
    const parsedPath = path.parse(relativePath);
    const publicId = `${
      parsedPath.dir ? parsedPath.dir.replace(/\\/g, "/") + "/" : ""
    }${parsedPath.name.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const fileHash = await calculateFileHash(file);
    localImages[publicId] = { filePath: file, hash: fileHash };
  }
  const localPublicIds = Object.keys(localImages);


  // Fetch Cloudinary images and their etags
  const spinnerFetch = ora("Fetching Cloudinary images...").start();
  let cloudinaryResources = {}; // Map public_id to { etag }
  try {
    // Cloudinary API resources can fetch up to 500 at a time. Loop if more.
    let nextCursor = null;
    do {
      const result = await cloudinary.api.resources({
        resource_type: "image",
        prefix: "",
        max_results: 500,
        next_cursor: nextCursor,
      });

      result.resources.forEach((res) => {
        // Cloudinary's etag is an MD5 hash of the original file
        cloudinaryResources[res.public_id] = { etag: res.etag };
      });
      nextCursor = result.next_cursor;
    } while (nextCursor);

    spinnerFetch.succeed(
      `Fetched ${Object.keys(cloudinaryResources).length} images from Cloudinary.`
    );
  } catch (error) {
    spinnerFetch.fail(
      `Failed to fetch Cloudinary images: ${error.message}`
    );
    log("error", "Detailed error:", error);
    process.exit(1);
  }
  const cloudinaryPublicIds = Object.keys(cloudinaryResources);


  // Identify images to delete (on Cloudinary but not local)
  const toDelete = cloudinaryPublicIds.filter(
    (id) => !localPublicIds.includes(id)
  );
  log("info", `Found ${toDelete.length} images to delete from Cloudinary.`);

  // Delete unmatched images
  for (const publicId of toDelete) {
    const spinnerDelete = ora(
      `Deleting ${publicId} from Cloudinary...`
    ).start();
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
      if (result.result === "ok") {
        spinnerDelete.succeed(`Deleted ${publicId} from Cloudinary.`);
      } else {
        spinnerDelete.fail(`Failed to delete ${publicId}: ${result.result}`);
      }
    } catch (error) {
      spinnerDelete.fail(`Failed to delete ${publicId}: ${error.message}`);
      log("error", "Detailed error:", error);
    }
  }

  // Upload or update images (local images not on Cloudinary OR local hash differs from Cloudinary etag)
  const toUploadOrUpdate = localPublicIds.filter((publicId) => {
    const localImage = localImages[publicId];
    const cloudinaryImage = cloudinaryResources[publicId];

    // If image doesn't exist on Cloudinary, it needs to be uploaded
    if (!cloudinaryImage) {
      return true;
    }
    // If image exists but hashes differ, it needs to be updated
    if (cloudinaryImage.etag !== localImage.hash) {
      return true;
    }
    // Otherwise, it's already in sync, no action needed
    return false;
  });

  log("info", `Found ${toUploadOrUpdate.length} images to upload or update.`);

  for (const publicId of toUploadOrUpdate) {
    const { filePath } = localImages[publicId];
    const relativePathInImagesDir = path.relative(imagesBaseDir, filePath);
    const parsedPath = path.parse(relativePathInImagesDir);
    let cloudinaryFolder = parsedPath.dir.replace(/\\/g, "/");
    if (cloudinaryFolder === "." || cloudinaryFolder === "") {
      cloudinaryFolder = "";
    }

    log(
      "info",
      `Processing: ${relativePathInImagesDir} (Public ID: ${publicId}, Folder: ${
        cloudinaryFolder || "root"
      })`
    );

    const spinnerUpload = ora(
      `Uploading ${publicId} to folder ${cloudinaryFolder || "root"}...`
    ).start();

    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: true,
        folder: cloudinaryFolder,
        resource_type: "image",
        invalidate: true,
        transformation: [
          { width: 1200, quality: 80, fetch_format: "auto" }, // Optimize during upload
        ],
      });

      log(
        "debug",
        "Upload response:",
        {
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url,
          created_at: uploadResult.created_at,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height,
          invalidation_status:
            uploadResult.invalidation_status || "Not specified",
        }
      );

      spinnerUpload.succeed(
        `Uploaded ${publicId} to folder '${
          cloudinaryFolder || "root"
        }' (Public ID: ${uploadResult.public_id}): ${uploadResult.secure_url}`
      );
    } catch (error) {
      spinnerUpload.fail(
        `Failed to upload ${publicId} to folder '${
          cloudinaryFolder || "root"
        }': ${error.message}`
      );
      log("error", "Detailed error:", error);
    }
  }

  // Log which images were skipped (already in sync)
  const skippedImages = localPublicIds.filter((publicId) => {
    const localImage = localImages[publicId];
    const cloudinaryImage = cloudinaryResources[publicId];
    return cloudinaryImage && cloudinaryImage.etag === localImage.hash;
  });

  if (skippedImages.length > 0) {
      log("info", `Skipped ${skippedImages.length} image(s) that are already in sync.`);
      // Optional: log the skipped image public IDs for verbose debugging
      // log("debug", "Skipped images:", skippedImages);
  }

  log("info", "--- Cloudinary Image Sync Complete ---");
}

main().catch((error) => {
  log("error", "Unhandled error:", error);
  process.exit(1);
});