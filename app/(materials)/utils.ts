// app/(materials)/utils.ts

import fs from 'fs';
import path from 'path';

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string; // This could be a local path or a full URL
  thumbnail?: string; // This will now hold the RAW LOCAL IMAGE PATH
};

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  let match = frontmatterRegex.exec(fileContent);
  if (!match || match.length < 2) {
      throw new Error("Could not parse frontmatter from file.");
  }
  let frontMatterBlock = match![1];
  let content = fileContent.replace(frontmatterRegex, '').trim();
  let frontMatterLines = frontMatterBlock.trim().split('\n');
  let metadata: Partial<Metadata> = {};

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ');
    let value = valueArr.join(': ').trim();
    value = value.replace(/^['"](.*)['"]$/, '$1'); // Remove quotes
    metadata[key.trim() as keyof Metadata] = value;
  });

  return { metadata: metadata as Metadata, content };
}

function getMDXFiles(dir: string) {
  try {
    return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
  } catch (error) {
    console.error(`Error reading MDX files from directory ${dir}:`, error);
    return [];
  }
}

function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

// This function should extract the image path as it appears in markdown/JSX
// It should not assume it's a local path.
function extractFirstImage(markdown: string): string | null {
  // Try Markdown image syntax first
  let match = markdown.match(/!\[.*?\]\((.*?)\)/);
  if (match && match[1]) return match[1];

  // Try JSX <Image ... src="..." ... /> syntax
  match = markdown.match(/<Image[^>]+src=["']([^"']+)["']/);
  if (match && match[1]) return match[1];

  return null;
}

// --- START CHANGE HERE ---
// REMOVE THIS FUNCTION entirely, as its logic will be handled by your custom loader.
// If you absolutely need a utility for manually generating Cloudinary URLs (outside of next/image),
// then rename it to something like `_getManualCloudinaryUrl` to prevent accidental use
// for next/image `src` props.
/*
function toCloudinaryUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;

  const cloudinaryBase = 'https://res.cloudinary.com/dbzw24uge/image/upload';

  // If the imagePath is already a Cloudinary URL or a full external URL,
  // assume it's already processed or shouldn't be processed by this function.
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.includes('res.cloudinary.com')) {
    // You might want to apply transformations directly if it's already cloudinary but missing them
    // For now, return it as is to avoid double-prefixing.
    // However, if the intent is *always* to apply specific transforms, you'd need more complex logic
    // to parse and re-construct the Cloudinary URL.
    return imagePath;
  }

  // Assume imagePath is a local relative path (e.g., /images/foo.jpg)
  const cloudinaryPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  // Add transformations for a default thumbnail size
  return `${cloudinaryBase}/f_auto,q_auto,w_256/${cloudinaryPath}`;
}
*/
// --- END CHANGE HERE ---


function getMDXData(dir: string) {
  let mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

    // Determine the source for the thumbnail
    // Prioritize metadata.image if it exists and then extract from content
    let rawImagePath = metadata.image || extractFirstImage(content);

    // --- START CHANGE HERE ---
    // Instead of calling `toCloudinaryUrl`, `thumbnail` should now store the raw
    // local path (e.g., "/images/Material/material_molybdenum.jpg").
    // Your custom loader (`cloudinary-loader.js`) will then convert this
    // raw path into the proper Cloudinary URL when `next/image` requests it.
    let thumbnail = rawImagePath; // This is the crucial change!
    // --- END CHANGE HERE ---

    return {
      metadata: {
        ...metadata,
        thumbnail, // `thumbnail` now holds the raw local path for `next/image`
      },
      slug,
      content,
    };
  });
}

export function getMaterialList() {
  return getMDXData(path.join(process.cwd(), 'app', '(materials)', 'posts'));
}

export function formatDate(date: string, includeRelative = false) {
  // ... (Your formatDate function, no changes needed)
  let currentDate = new Date();
  if (!date.includes('T')) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  let daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = '';

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = 'Today';
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}