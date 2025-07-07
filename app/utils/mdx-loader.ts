// app/utils/mdx-loader.ts
// MDX loader utilities for @next/mdx

import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './metadata';
import type { ArticlePost, ArticleMetadata } from 'app/types/content';

// Cache for content
const mdxCache = new Map<string, ArticlePost>();

// Get all MDX files from a directory
export function getMDXFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx');
  } catch (error) {
    console.error(`Error reading MDX files from directory ${dir}:`, error);
    return [];
  }
}

// Get MDX files recursively from categories
export function getMDXFilesRecursive(baseDir: string): Array<{
  filePath: string; 
  category: 'application' | 'author' | 'material' | 'region' | 'thesaurus'
}> {
  const results: Array<{
    filePath: string;
    category: 'application' | 'author' | 'material' | 'region' | 'thesaurus'
  }> = [];
  
  const categories: Array<'application' | 'author' | 'material' | 'region' | 'thesaurus'> = [
    'application', 'author', 'material', 'region', 'thesaurus'
  ];
  
  for (const category of categories) {
    const categoryDir = path.join(baseDir, category);
    try {
      if (fs.existsSync(categoryDir)) {
        const files = getMDXFiles(categoryDir);
        files.forEach(file => {
          results.push({
            filePath: path.join(categoryDir, file),
            category
          });
        });
      }
    } catch (error) {
      console.error(`Error reading MDX files from category ${category}:`, error);
    }
  }
  
  return results;
}

// Read and parse MDX file with frontmatter
export function readMDXFile(filePath: string) {
  // Check cache first
  if (mdxCache.has(filePath)) {
    return mdxCache.get(filePath);
  }

  // Read the file content
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const { metadata, content } = parseFrontmatter(rawContent);
  const slug = path.basename(filePath, path.extname(filePath));
  
  const category = getCategoryFromPath(filePath);
  
  const article = {
    metadata: {
      ...metadata,
      contentCategory: category,
    },
    slug,
    content,
  };
  
  // Cache the result
  mdxCache.set(filePath, article as ArticlePost);
  
  return article as ArticlePost;
}

// Helper function to determine the category from the file path
function getCategoryFromPath(filePath: string): 'application' | 'author' | 'material' | 'region' | 'thesaurus' | undefined {
  const categories: Array<'application' | 'author' | 'material' | 'region' | 'thesaurus'> = [
    'application', 'author', 'material', 'region', 'thesaurus'
  ];
  
  for (const category of categories) {
    if (filePath.includes(`/${category}/`)) {
      return category;
    }
  }
  
  return undefined;
}

// Clear the MDX cache (useful for development)
export function clearMDXCache() {
  mdxCache.clear();
}

// For use with @next/mdx - this helps with importing MDX as components
export function importMDX(slug: string): any {
  try {
    // Dynamic import of MDX files - this relies on @next/mdx's handling
    // Note: This is just a placeholder - actual implementation may vary
    // based on your project structure and build configuration
    return require(`../../content/${slug}.mdx`).default;
  } catch (error) {
    console.error(`Error importing MDX for slug ${slug}:`, error);
    return function ErrorComponent() { 
      return { 
        props: { error: true }, 
        __html: "<div>Error loading content</div>" 
      };
    };
  }
}
