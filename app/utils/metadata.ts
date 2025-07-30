// app/utils/metadata.ts
// Metadata parsing and processing utilities

import matter from 'gray-matter';

export function parseFrontmatter(content: string) {
  const { data: metadata, content: body } = matter(content);
  return { metadata, content: body };
}

export function extractFirstImage(content: string): string | null {
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = content.match(imageRegex);
  return match ? match[1] : null;
}
