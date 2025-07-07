// app/utils/mdx-imports.ts
// Utility for importing MDX files using @next/mdx

import { readMDXFile, getMDXFilesRecursive } from './mdx-loader';
import path from 'path';
import fs from 'fs';
import type { ArticlePost, ArticleMetadata, ContentType } from 'app/types/content';

// Cache for imported MDX content
const mdxImportCache = new Map<string, any>();

// Base content directory
const CONTENT_DIR = path.join(process.cwd(), 'content');

// Get all MDX file paths
export function getAllMDXFilePaths() {
  return getMDXFilesRecursive(CONTENT_DIR);
}

// Get article by slug - works with @next/mdx compiled content
export async function getArticleContent(slug: string) {
  try {
    // First try to find the file path for this slug
    const allFiles = getAllMDXFilePaths();
    const filePath = allFiles.find(file => 
      path.basename(file.filePath, path.extname(file.filePath)) === slug
    )?.filePath;
    
    if (!filePath) {
      console.error(`No MDX file found for slug: ${slug}`);
      return null;
    }
    
    // Get metadata and content using the existing readMDXFile function
    const article = readMDXFile(filePath) as ArticlePost;
    
    if (!article) {
      console.error(`Could not read MDX file for slug: ${slug}`);
      return null;
    }
    
    // With @next/mdx, we can dynamically import the compiled MDX components
    // This is a placeholder for the actual import mechanism
    // In real implementation, this would return the React component for the MDX
    let compiledMdx;
    
    try {
      // This is a placeholder. The actual implementation would depend on how
      // @next/mdx compiles your content and where it outputs the compiled files
      compiledMdx = { 
        code: () => ({ __html: article.content }),
        frontmatter: article.metadata 
      };
    } catch (err) {
      console.error(`Error importing compiled MDX for ${slug}:`, err);
      compiledMdx = null;
    }
    
    return {
      ...article,
      compiledMdx
    };
  } catch (error) {
    console.error(`Error getting article content for slug ${slug}:`, error);
    return null;
  }
}

// Get all article slugs
export function getAllArticleSlugs() {
  const allFiles = getAllMDXFilePaths();
  return allFiles.map(file => 
    path.basename(file.filePath, path.extname(file.filePath))
  );
}
