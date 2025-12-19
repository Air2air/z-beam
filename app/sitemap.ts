// app/sitemap.ts
import { SITE_CONFIG } from './utils/constants';
import fs from 'fs';
import path from 'path';
import { buildCategoryUrl, buildSubcategoryUrl, buildUrlFromMetadata } from './utils/urlBuilder';

// Sitemap entry type compatible with Next.js MetadataRoute.Sitemap
interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}

export default function sitemap(): SitemapEntry[] {
  const baseUrl = SITE_CONFIG.url;
  
  // Helper to generate alternates for a URL
  const getAlternates = (url: string) => ({
    languages: {
      'en-US': url,
      'en-GB': url,
      'en-CA': url,
      'en-AU': url,
      'es-MX': url,
      'fr-CA': url,
      'de-DE': url,
      'zh-CN': url,
      'x-default': url,
    },
  });
  
  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: getAlternates(baseUrl),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: getAlternates(`${baseUrl}/about`),
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: getAlternates(`${baseUrl}/services`),
    },
    {
      url: `${baseUrl}/rental`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: getAlternates(`${baseUrl}/rental`),
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date('2025-10-17'), // Updated with SEO optimization
      changeFrequency: 'monthly' as const,
      priority: 0.8, // Increased priority for SEO-optimized page
      alternates: getAlternates(`${baseUrl}/partners`),
    },
    {
      url: `${baseUrl}/netalux`,
      lastModified: new Date('2025-10-25'), // Equipment specifications page
      changeFrequency: 'monthly' as const,
      priority: 0.8, // Equipment page with comparison tables
      alternates: getAlternates(`${baseUrl}/netalux`),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: getAlternates(`${baseUrl}/contact`),
    },
    {
      url: `${baseUrl}/datasets`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: getAlternates(`${baseUrl}/datasets`),
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
      alternates: getAlternates(`${baseUrl}/search`),
    },
    {
      url: `${baseUrl}/materials`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: getAlternates(`${baseUrl}/materials`),
    },
    {
      url: `${baseUrl}/contaminants`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: getAlternates(`${baseUrl}/contaminants`),
    },
    {
      url: `${baseUrl}/compounds`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: getAlternates(`${baseUrl}/compounds`),
    },
  ];

  // Material category and subcategory routes
  const materialRoutes: SitemapEntry[] = [];
  const materialPageRoutes: SitemapEntry[] = [];
  
  // Settings routes (parallel to materials)
  const settingsRoutes: SitemapEntry[] = [];
  const settingsPageRoutes: SitemapEntry[] = [];
  
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
          const categoryUrl = buildCategoryUrl('materials', category, true);
          materialRoutes.push({
            url: categoryUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            alternates: getAlternates(categoryUrl),
          });
        }
        
        // Add subcategory page if present and not seen before
        if (subcategory && subcategory.length > 0) {
          const subcategoryKey = `${category}/${subcategory}`;
          if (!subcategorySet.has(subcategoryKey)) {
            subcategorySet.add(subcategoryKey);
            const subcategoryUrl = buildSubcategoryUrl('materials', category, subcategory, true);
            materialRoutes.push({
              url: subcategoryUrl,
              lastModified: new Date(),
              changeFrequency: 'weekly' as const,
              priority: 0.75,
              alternates: getAlternates(subcategoryUrl),
            });
          }
          
          // Add material page with full path
          const materialPageUrl = buildUrlFromMetadata({ rootPath: 'materials', category, subcategory, slug }, true);
          materialPageRoutes.push({
            url: materialPageUrl,
            lastModified: stats.mtime,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: getAlternates(materialPageUrl),
          });
        }
      }
    });
  } catch (error) {
    console.error('Error generating material routes:', error);
  }

  // Settings pages - mirror the materials structure
  try {
    const settingsDir = path.join(process.cwd(), 'frontmatter/settings');
    const settingsFiles = fs.readdirSync(settingsDir);
    const settingsYamlFiles = settingsFiles.filter(f => f.endsWith('.yaml'));
    
    settingsYamlFiles.forEach((file) => {
      const filePath = path.join(settingsDir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Simple YAML parsing to extract category and subcategory
      const categoryMatch = fileContent.match(/^category:\s*(.+)$/m);
      const subcategoryMatch = fileContent.match(/^subcategory:\s*(.+)$/m);
      
      if (categoryMatch) {
        const category = categoryMatch[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
        const subcategory = subcategoryMatch ? subcategoryMatch[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/'/g, '') : '';
        
        // Keep the full slug including -settings suffix
        const slug = file.replace('.yaml', '');
        
        // Skip if category is empty
        if (!category) return;
        
        // Settings pages don't have category/subcategory index pages, only material pages
        // Add setting page with full path
        if (subcategory && subcategory.length > 0) {
          const settingsPageUrl = buildUrlFromMetadata({ rootPath: 'settings', category, subcategory, slug }, true);
          settingsPageRoutes.push({
            url: settingsPageUrl,
            lastModified: stats.mtime,
            changeFrequency: 'weekly' as const,
            priority: 0.7, // Slightly lower priority than materials pages
            alternates: getAlternates(settingsPageUrl),
          });
        }
      }
    });
  } catch (error) {
    console.error('Error generating settings routes:', error);
  }

  // Contaminant routes (parallel to materials/settings)
  const contaminantRoutes: SitemapEntry[] = [];
  const contaminantPageRoutes: SitemapEntry[] = [];
  
  try {
    const contaminantDir = path.join(process.cwd(), 'frontmatter/contaminants');
    const contaminantFiles = fs.readdirSync(contaminantDir);
    const contaminantYamlFiles = contaminantFiles.filter(f => f.endsWith('.yaml'));
    
    // Track categories and subcategories we've seen
    const contaminantCategorySet = new Set<string>();
    const contaminantSubcategorySet = new Set<string>();
    
    contaminantYamlFiles.forEach((file) => {
      const filePath = path.join(contaminantDir, file);
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
        if (!contaminantCategorySet.has(category)) {
          contaminantCategorySet.add(category);
          const categoryUrl = buildCategoryUrl('contaminants', category, true);
          contaminantRoutes.push({
            url: categoryUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: getAlternates(categoryUrl),
          });
        }
        
        // Add subcategory page if not seen before
        if (subcategory && !contaminantSubcategorySet.has(`${category}/${subcategory}`)) {
          contaminantSubcategorySet.add(`${category}/${subcategory}`);
          const subcategoryUrl = buildSubcategoryUrl('contaminants', category, subcategory, true);
          contaminantRoutes.push({
            url: subcategoryUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            alternates: getAlternates(subcategoryUrl),
          });
        }
        
        // Add contaminant item page
        const itemUrl = buildUrlFromMetadata(
          { rootPath: 'contaminants', category, subcategory, slug },
          true
        );
        contaminantPageRoutes.push({
          url: itemUrl,
          lastModified: stats.mtime,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
          alternates: getAlternates(itemUrl),
        });
      }
    });
  } catch (error) {
    console.error('Error generating contaminant routes:', error);
  }

  // Compound routes (parallel to materials/settings/contaminants)
  const compoundRoutes: SitemapEntry[] = [];
  const compoundPageRoutes: SitemapEntry[] = [];
  
  try {
    const compoundDir = path.join(process.cwd(), 'frontmatter/compounds');
    const compoundFiles = fs.readdirSync(compoundDir);
    const compoundYamlFiles = compoundFiles.filter(f => f.endsWith('.yaml'));
    
    // Track categories and subcategories we've seen
    const compoundCategorySet = new Set<string>();
    const compoundSubcategorySet = new Set<string>();
    
    compoundYamlFiles.forEach((file) => {
      const filePath = path.join(compoundDir, file);
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
        if (!compoundCategorySet.has(category)) {
          compoundCategorySet.add(category);
          const categoryUrl = buildCategoryUrl('compounds', category, true);
          compoundRoutes.push({
            url: categoryUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: getAlternates(categoryUrl),
          });
        }
        
        // Add subcategory page if not seen before
        if (subcategory && !compoundSubcategorySet.has(`${category}/${subcategory}`)) {
          compoundSubcategorySet.add(`${category}/${subcategory}`);
          const subcategoryUrl = buildSubcategoryUrl('compounds', category, subcategory, true);
          compoundRoutes.push({
            url: subcategoryUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            alternates: getAlternates(subcategoryUrl),
          });
        }
        
        // Add compound item page
        const itemUrl = buildUrlFromMetadata(
          { rootPath: 'compounds', category, subcategory, slug },
          true
        );
        compoundPageRoutes.push({
          url: itemUrl,
          lastModified: stats.mtime,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
          alternates: getAlternates(itemUrl),
        });
      }
    });
  } catch (error) {
    console.error('Error generating compound routes:', error);
  }

  return [
    ...staticRoutes, 
    ...materialRoutes, 
    ...materialPageRoutes, 
    ...settingsRoutes, 
    ...settingsPageRoutes,
    ...contaminantRoutes,
    ...contaminantPageRoutes,
    ...compoundRoutes,
    ...compoundPageRoutes
  ];
}
