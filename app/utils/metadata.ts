// app/utils/metadata.ts
// Metadata parsing and processing utilities

import fs from 'fs';
import path from 'path';
import type { Metadata } from 'app/types';

export function parseFrontmatter(fileContent: string) {
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

    // Strip comments from the raw value
    const commentIndex = rawValueWithComment.indexOf('#');
    let rawValue = rawValueWithComment;
    if (commentIndex !== -1) {
      rawValue = rawValueWithComment.substring(0, commentIndex).trim();
    }

    // Remove quotes if present
    let value = rawValue.replace(/^["'](.*)["']$/, '$1');

    // Type conversion for specific fields
    if (key === 'atomicNumber') {
      const num = parseInt(value, 10);
      (metadata as any)[key] = isNaN(num) ? null : num;
    } else if (key === 'authorId') {
      const num = parseInt(value, 10);
      (metadata as any)[key] = isNaN(num) ? undefined : num;
    } else if (key === 'publishedAt') {
      (metadata as any)[key] = value || null;
    } else {
      (metadata as any)[key] = value;
    }
  });

  return { metadata: metadata as Metadata, content };
}

export function extractFirstImage(markdown: string): string | null {
  let match = markdown.match(/!\[.*?\]\((.*?)\)/);
  if (match && match[1]) return match[1];

  match = markdown.match(/<Image[^>]+src=["']([^"']+)["']/);
  if (match && match[1]) return match[1];

  return null;
}
