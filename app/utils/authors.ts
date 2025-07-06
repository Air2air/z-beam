// app/utils/authors.ts
// Author data management utilities

import { getArticleList } from './content';
import type { AuthorMetadata, ArticlePost } from 'app/types';

// Cache for authors data
let authorsCache: AuthorMetadata[] | null = null;

// Clear cache on module reload in development
if (process.env.NODE_ENV === 'development') {
  authorsCache = null;
}

export function getAllAuthors(): AuthorMetadata[] {
  if (authorsCache !== null) {
    return authorsCache;
  }

  try {
    // Get all content and filter for authors
    const allContent = getArticleList();
    const authorContent = allContent.filter(content => content.metadata.contentCategory === 'author');
    
    // Convert author content to AuthorMetadata format
    const authors: AuthorMetadata[] = authorContent.map(content => {
      // Type assertion since we know this is author content with additional fields
      const metadata = content.metadata as any;
      return {
        id: typeof metadata.id === 'string' ? parseInt(metadata.id, 10) : (metadata.id || 0),
        slug: metadata.slug || content.slug, // Use metadata.slug if available, fallback to filename-based slug
        name: metadata.name || metadata.title,
        title: metadata.title,
        bio: metadata.bio || metadata.description || '',
        linkedin: metadata.linkedin,
        email: metadata.email,
        image: metadata.image,
        specialties: metadata.specialties || [],
        contentCategory: "author" as const,
        publishedArticles: metadata.publishedArticles,
        expertise: metadata.expertise,
        education: metadata.education
      };
    });
    
    authorsCache = authors;
    return authors;
  } catch (error) {
    console.error('Error loading authors data:', error);
    const emptyArray: AuthorMetadata[] = [];
    authorsCache = emptyArray;
    return emptyArray;
  }
}

export function getAuthorById(id: number): AuthorMetadata | null {
  const authors = getAllAuthors();
  return authors.find(author => author.id === id) || null;
}

export function getAuthorByName(name: string): AuthorMetadata | null {
  const authors = getAllAuthors();
  return authors.find(author => author.name === name) || null;
}

export function getAuthorsBySpecialty(specialty: string): AuthorMetadata[] {
  const authors = getAllAuthors();
  return authors.filter(author => 
    author.specialties?.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );
}

// Generate URL-friendly slug from author name
export function generateAuthorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

export function getAuthorBySlug(slug: string): AuthorMetadata | undefined {
  const authors = getAllAuthors();
  
  // First try to find by the slug field in metadata
  const bySlug = authors.find(author => author.slug === slug);
  if (bySlug) {
    return bySlug;
  }
  
  // If not found by slug, try to find by ID (in case slug is actually an ID)
  const idMatch = parseInt(slug, 10);
  if (!isNaN(idMatch)) {
    const byId = authors.find(author => author.id === idMatch);
    if (byId) {
      return byId;
    }
  }
  
  return undefined;
}

export function getAllAuthorSlugs(): string[] {
  const authors = getAllAuthors();
  return authors.map(author => author.slug);
}

// Clear cache (useful for development)
export function clearAuthorsCache(): void {
  authorsCache = null;
}
