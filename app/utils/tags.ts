// app/utils/tags.ts
// Tag data management utilities

import { getMaterialList } from './server';
import type { MaterialPost } from 'app/types';

// Cache for tags data
let tagsCache: string[] | null = null;

export function getAllTags(): string[] {
  if (tagsCache !== null) {
    return tagsCache;
  }

  try {
    const materials = getMaterialList();
    const tagSet = new Set<string>();
    
    materials.forEach(material => {
      if (material.metadata.tags && Array.isArray(material.metadata.tags)) {
        material.metadata.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            tagSet.add(tag);
          }
        });
      }
    });
    
    const tags = Array.from(tagSet).sort();
    tagsCache = tags;
    return tags;
  } catch (error) {
    console.error('Error loading tags:', error);
    return [];
  }
}

export function getTagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTagFromSlug(slug: string): string | undefined {
  const tags = getAllTags();
  return tags.find(tag => getTagSlug(tag) === slug);
}

export function getAllTagSlugs(): string[] {
  const tags = getAllTags();
  return tags.map(tag => getTagSlug(tag));
}

export function getMaterialsByTag(tag: string): MaterialPost[] {
  const materials = getMaterialList();
  return materials.filter(material => 
    material.metadata.tags && 
    material.metadata.tags.includes(tag)
  );
}

export function getTagStats(): Array<{ tag: string; slug: string; count: number }> {
  const tags = getAllTags();
  const materials = getMaterialList();
  
  return tags.map(tag => ({
    tag,
    slug: getTagSlug(tag),
    count: materials.filter(material => 
      material.metadata.tags && 
      material.metadata.tags.includes(tag)
    ).length
  })).filter(tagStat => tagStat.count > 0)
    .sort((a, b) => b.count - a.count); // Sort by count, descending
}
