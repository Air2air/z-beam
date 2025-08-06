// app/utils/componentLoader.ts
'use client';

/**
 * Load component data via API instead of direct file access
 * This ensures client components can load their data without 'fs' module
 */
export async function loadComponent(
  type: string,
  slug: string,
  options: {
    convertMarkdown?: boolean;
  } = {}
) {
  try {
    const response = await fetch(`/api/component-data?type=${type}&slug=${slug}`);
    
    if (!response.ok) {
      console.error(`Error loading ${type} for ${slug}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error loading ${type} for ${slug}:`, error);
    return null;
  }
}
