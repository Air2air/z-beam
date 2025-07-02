// app/utils/utils.ts  (This is the correct new location)

import fs from 'fs';
import path from 'path';


type Metadata = {
  title: string;
  nameShort?: string;
  publishedAt: string | null; // Allow publishedAt to be null
  summary: string;
  description?: string; // Add for article frontmatter and generateMetadata
  image?: string;
  thumbnail?: string;
  imageCaption?: string; // Add for HeroImage
  atomicNumber?: number | null;
  chemicalSymbol?: string | null;
  materialType?: string;
  metalClass?: string;
  crystalStructure?: string;
  primaryApplication?: string;
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
    const parts = line.split(':');
    if (parts.length < 2) {
      return;
    }
    const key = parts[0].trim();
    const rawValueWithComment = parts.slice(1).join(':').trim();

    // --- START OF FIX: Strip comments from the raw value ---
    const commentIndex = rawValueWithComment.indexOf('#');
    let rawValue = rawValueWithComment;
    if (commentIndex !== -1) {
      rawValue = rawValueWithComment.substring(0, commentIndex).trim();
    }
    // --- END OF FIX ---

    let parsedValue: string | number | null;

    if (key === 'atomicNumber') {
      if (rawValue === 'null') {
        parsedValue = null;
      } else {
        parsedValue = parseInt(rawValue, 10);
        if (isNaN(parsedValue)) {
          parsedValue = null; // Treat invalid numbers as null
        }
      }
    } else if (rawValue === 'null') { // This will now correctly match "null"
      parsedValue = null;
    } else {
      parsedValue = rawValue.replace(/^['"](.*)['"]$/, '$1'); // Remove quotes
    }

    (metadata as any)[key] = parsedValue;
  });

  return { metadata: metadata as Metadata, content };
}

// --- MISSING FUNCTIONS START HERE ---

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

function extractFirstImage(markdown: string): string | null {
  let match = markdown.match(/!\[.*?\]\((.*?)\)/);
  if (match && match[1]) return match[1];

  match = markdown.match(/<Image[^>]+src=["']([^"']+)["']/);
  if (match && match[1]) return match[1];

  return null;
}

function getMDXData(dir: string) {
  let mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

    let rawImagePath = metadata.image || extractFirstImage(content);
    let thumbnail = rawImagePath;

    return {
      metadata: {
        ...metadata,
        thumbnail,
      },
      slug,
      content,
    };
  });
}

// THIS FUNCTION MUST BE EXPORTED
export function getMaterialList() {
  // Ensure this path correctly points to your MDX posts
  // It was previously `app/(materials)/posts`. If that's still the structure, keep it.
  return getMDXData(path.join(process.cwd(), 'app', '(materials)', 'posts'));
}

// --- MISSING FUNCTIONS END HERE ---


export function formatDate(date: string | null, includeRelative = false): string {
  // Add a check to ensure date is a non-null string
  if (date === null || typeof date !== 'string') {
    // Handle the case where date is null or not a string
    console.warn("Invalid date provided to formatDate:", date);
    return 'Invalid Date';
  }

  let currentDate = new Date();
  if (!date.includes('T')) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date);

  // Check if targetDate is a valid date object after parsing
  if (isNaN(targetDate.getTime())) {
    console.warn("Could not parse targetDate:", date);
    return 'Invalid Date';
  }

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