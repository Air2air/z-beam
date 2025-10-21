// app/sitemap.ts
import { SITE_CONFIG } from './utils/constants';
import { SitemapEntry } from '@/types';
import fs from 'fs';
import path from 'path';

export default function sitemap(): SitemapEntry[] {
  const baseUrl = SITE_CONFIG.url;
  
  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rental`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date('2025-10-17'), // Updated with SEO optimization
      changeFrequency: 'monthly' as const,
      priority: 0.8, // Increased priority for SEO-optimized page
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    },
  ];

  // Material category routes
  const materialCategories = [
    'metal',
    'ceramic',
    'composite',
    'semiconductor',
    'glass',
    'stone',
    'wood',
    'masonry',
    'plastic',
  ];

  const materialRoutes = materialCategories.map((category) => ({
    url: `${baseUrl}/materials/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic article routes from frontmatter files
  const articleRoutes: SitemapEntry[] = [];
  try {
    const frontmatterDir = path.join(process.cwd(), 'content/components/frontmatter');
    const files = fs.readdirSync(frontmatterDir);
    
    files.forEach((file) => {
      if (file.endsWith('.yaml')) {
        const slug = file.replace('-laser-cleaning.yaml', '');
        const filePath = path.join(frontmatterDir, file);
        const stats = fs.statSync(filePath);
        
        articleRoutes.push({
          url: `${baseUrl}/${slug}`,
          lastModified: stats.mtime,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        });
      }
    });
  } catch (error) {
    console.error('Error reading frontmatter directory:', error);
  }

  return [...staticRoutes, ...materialRoutes, ...articleRoutes];
}
