// app/(materials)/utils.ts

import fs from 'fs';
import path from 'path';

type Metadata = {
  title: string;
  nameShort?: string; // This is correct
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
    // --- START OF CRUCIAL CHANGE ---
    // Split by the first colon only, then trim key and value parts separately.
    const parts = line.split(':');
    if (parts.length < 2) {
      // If a line doesn't contain a colon, it's not a valid key-value pair for frontmatter; skip it.
      return;
    }
    const key = parts[0].trim();
    // Join back the rest of the parts in case the value itself contains colons (e.g., a URL)
    const value = parts.slice(1).join(':').trim();

    // Remove quotes from the value if they exist
    metadata[key as keyof Metadata] = value.replace(/^['"](.*)['"]$/, '$1');
    // --- END OF CRUCIAL CHANGE ---
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

function extractFirstImage(markdown: string): string | null {
  // Try Markdown image syntax first
  let match = markdown.match(/!\[.*?\]\((.*?)\)/);
  if (match && match[1]) return match[1];

  // Try JSX <Image ... src="..." ... /> syntax
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

export function getMaterialList() {
  return getMDXData(path.join(process.cwd(), 'app', '(materials)', 'posts'));
}

export function formatDate(date: string, includeRelative = false) {
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