// app/utils/clientComponentLoader.ts
'use client';

/**
 * Client-side component loader - uses API endpoints
 * Use this in client components that need to load their own data
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
