require("dotenv").config({
  path: require("path").resolve(process.cwd(), ".env.local"),
});
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
// const chalk = require("chalk"); // REMOVED
const ora = require("ora");

// REMOVED: No longer checking chalk version as chalk is removed

// Helper function for console output without chalk
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

  // MODIFIED SECTION HERE
  if (detail) {
    // If it's an Error object, print its stack trace
    if (detail instanceof Error) {
      console.error(`Error Type: ${detail.name}`);
      console.error(`Error Message: ${detail.message}`);
      if (detail.stack) {
        console.error("Stack Trace:\n", detail.stack);
      }
      // If the error has a response property (like HTTP errors from libraries like Axios/Requests)
      if (detail.response && detail.response.data) {
        console.error("Error Response Data:\n", JSON.stringify(detail.response.data, null, 2));
      }
    } else {
      // For plain objects or other types, stringify them
      console.log("Details:\n", JSON.stringify(detail, null, 2));
    }
  }
  // END MODIFIED SECTION
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
  log("info", "--- Starting Cloudinary Image Sync ---"); // Replaced chalk.blue(chalk.bold(...))

  // Verify environment variables
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    log("error", "Missing Cloudinary API credentials."); // Replaced chalk.red(...)
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
  log("info", `Scanning for images in: ${imagesBaseDir}`); // Replaced chalk.cyan(...)
  const imageFiles = getAllImageFiles(imagesBaseDir);

  if (imageFiles.length === 0) {
    log("warn", "No supported image files found for upload."); // Replaced chalk.yellow(...)
  } else {
    log("success", `Found ${imageFiles.length} image(s) for upload.`); // Replaced chalk.green(...)
  }

  // Generate local public IDs
  const localPublicIds = imageFiles.map((file) => {
    const relativePath = path.relative(imagesBaseDir, file);
    const parsedPath = path.parse(relativePath);
    return `${
      parsedPath.dir ? parsedPath.dir.replace(/\\/g, "/") + "/" : ""
    }${parsedPath.name.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  });

  // Fetch Cloudinary images
  // Removed chalk from ora messages, ora will still display plain spinner
  const spinnerFetch = ora("Fetching Cloudinary images...").start();
  let cloudinaryPublicIds = [];
  try {
    const result = await cloudinary.api.resources({
      resource_type: "image",
      prefix: "", // Fetch all images; adjust to 'Material' or 'Site/Logo' if needed
      max_results: 500, // Adjust based on your image count
    });
    cloudinaryPublicIds = result.resources.map((res) => res.public_id);
    spinnerFetch.succeed(`Fetched ${cloudinaryPublicIds.length} images from Cloudinary.`);
  } catch (error) {
    spinnerFetch.fail(`Failed to fetch Cloudinary images: ${error.message}`);
    log("error", "Detailed error:", error); // Replaced chalk.red(...)
    process.exit(1);
  }

  // Identify images to delete
  log("info", `Found ${toDelete.length} images to delete from Cloudinary.`); // Replaced chalk.cyan(...)

  // Delete unmatched images
  for (const publicId of toDelete) {
    const spinnerDelete = ora(`Deleting ${publicId} from Cloudinary...`).start();
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
      log("error", "Detailed error:", error); // Replaced chalk.red(...)
    }
  }

  // Upload images
  for (const filePath of imageFiles) {
    const relativePathInImagesDir = path.relative(imagesBaseDir, filePath);
    const parsedPath = path.parse(relativePathInImagesDir);
    let publicId = parsedPath.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    let cloudinaryFolder = parsedPath.dir.replace(/\\/g, "/");
    if (cloudinaryFolder === "." || cloudinaryFolder === "") {
      cloudinaryFolder = "";
    }

    log("info", `Processing: ${relativePathInImagesDir} (Public ID: ${publicId}, Folder: ${cloudinaryFolder || "root"})`); // Replaced chalk.cyan(...)

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
          invalidation_status: uploadResult.invalidation_status || "Not specified",
        }
      );

      spinnerUpload.succeed(
        `Uploaded ${publicId} to folder '${cloudinaryFolder || "root"}' (Public ID: ${uploadResult.public_id}): ${uploadResult.secure_url}`
      );
    } catch (error) {
      spinnerUpload.fail(
        `Failed to upload ${publicId} to folder '${cloudinaryFolder || "root"}': ${error.message}`
      );
      log("error", "Detailed error:", error); // Replaced chalk.red(...)
    }
  }

  log("info", "--- Cloudinary Image Sync Complete ---"); // Replaced chalk.blue(chalk.bold(...))
}

main().catch((error) => {
  // Original fallback for chalk removed, now using the new log function
  log("error", "Unhandled error:", error);
  process.exit(1);
});