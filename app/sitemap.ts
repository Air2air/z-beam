// app/sitemap.ts
import { SITE_CONFIG } from './utils/constants';
import { SitemapEntry } from '@/types';
import fs from 'fs';
import path from 'path';
import { buildCategoryUrl, buildSubcategoryUrl, buildUrlFromMetadata } from './utils/urlBuilder';

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
      url: `${baseUrl}/netalux`,
      lastModified: new Date('2025-10-25'), // Equipment specifications page
      changeFrequency: 'monthly' as const,
      priority: 0.8, // Equipment page with comparison tables
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/datasets`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/materials`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ];

  // Material category and subcategory routes
  const materialRoutes: SitemapEntry[] = [];
  const materialPageRoutes: SitemapEntry[] = [];
  
  try {
    const frontmatterDir = path.join(process.cwd(), 'frontmatter/materials');
    const files = fs.readdirSync(frontmatterDir);
    const yamlFiles = files.filter(f => f.endsWith('.yaml'));
    
    // Track categories and subcategories we've seen
    const categorySet = new Set<string>();
    const subcategorySet = new Set<string>();
    
    yamlFiles.forEach((file) => {
      const filePath = path.join(frontmatterDir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Simple YAML parsing to extract category and subcategory
      const categoryMatch = fileContent.match(/^category:\s*(.+)$/m);
      const subcategoryMatch = fileContent.match(/^subcategory:\s*(.+)$/m);
      
      if (categoryMatch) {
        const category = categoryMatch[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
        const subcategory = subcategoryMatch ? subcategoryMatch[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/'/g, '') : '';
        const slug = file.replace('.yaml', '');
        
        // Skip if category is empty
        if (!category) return;
        
        // Add category page if not seen before
        if (!categorySet.has(category)) {
          categorySet.add(category);
          materialRoutes.push({
            url: buildCategoryUrl('materials', category, true),
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          });
        }
        
        // Add subcategory page if present and not seen before
        if (subcategory && subcategory.length > 0) {
          const subcategoryKey = `${category}/${subcategory}`;
          if (!subcategorySet.has(subcategoryKey)) {
            subcategorySet.add(subcategoryKey);
            materialRoutes.push({
              url: buildSubcategoryUrl('materials', category, subcategory, true),
              lastModified: new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.75,
            });
          }
          
          // Add material page with full path
          materialPageRoutes.push({
            url: buildUrlFromMetadata({ rootPath: 'materials', category, subcategory, slug }, true),
            lastModified: stats.mtime,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          });
        }
      }
    });
  } catch (error) {
    console.error('Error generating material routes:', error);
  }

  return [...staticRoutes, ...materialRoutes, ...materialPageRoutes];
}
