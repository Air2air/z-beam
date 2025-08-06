// app/utils/componentDataLoader.ts
'use client';

/**
 * Loads frontmatter data for a component via API
 * This is the primary utility for components to load their own data
 */
export async function loadComponentFrontmatter(slug: string): Promise<any | null> {
  try {
    const response = await fetch(`/api/component-data?type=frontmatter&slug=${slug}`);
    
    if (!response.ok) {
      console.error(`Error loading frontmatter for ${slug}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.frontmatter;
  } catch (error) {
    console.error(`Error loading frontmatter for ${slug}:`, error);
    return null;
  }
}

/**
 * Gets a specific nested property from frontmatter data
 */
export async function getComponentData<T>(
  slug: string, 
  dataPath: string
): Promise<T | null> {
  try {
    const frontmatter = await loadComponentFrontmatter(slug);
    
    if (!frontmatter) {
      return null;
    }
    
    // Navigate through the nested path (e.g., "images.hero")
    const pathParts = dataPath.split('.');
    let result: any = frontmatter;
    
    for (const part of pathParts) {
      if (!result[part]) {
        return null;
      }
      result = result[part];
    }
    
    return result as T;
  } catch (error) {
    console.error(`Error getting component data for ${slug}:`, error);
    return null;
  }
}
