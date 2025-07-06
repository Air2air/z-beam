// app/utils/mdx.ts
// MDX file processing utilities

import fs from 'fs';
import path from 'path';
import type { MaterialPost, AuthorPost } from 'app/types';
import { parseFrontmatter, extractFirstImage } from './metadata';

export function getMDXFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
  } catch (error) {
    console.error(`Error reading MDX files from directory ${dir}:`, error);
    return [];
  }
}

export function readMDXFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseFrontmatter(rawContent);
}

export function getMDXData(dir: string): MaterialPost[] {
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

export function getAuthorMDXData(dir: string): AuthorPost[] {
  let mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));

    return {
      metadata: metadata as any, // Type assertion for author metadata
      slug,
      content,
    };
  });
}

// Author-specific functions
export function getAuthorList(): AuthorPost[] {
  return getAuthorMDXData(path.join(process.cwd(), 'app', 'authors'));
}

export function getAuthorBySlug(slug: string): AuthorPost | undefined {
  const authors = getAuthorList();
  return authors.find(author => author.slug === slug);
}

// Main function to get material list
export function getMaterialList(): MaterialPost[] {
  return getMDXData(path.join(process.cwd(), 'app', '(materials)', 'posts'));
}
