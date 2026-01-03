// app/sitemap.ts
import { SITE_CONFIG } from '@/app/config/site';
import fs from 'fs';
import path from 'path';

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

// Helper to extract full_path from YAML content
function extractFullPath(content: string): string | null {
  const match = content.match(/^full_path:\s*(.+)$/m);
  return match ? match[1].trim() : null;
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

  // Material pages - use full_path from frontmatter
  const materialPageRoutes: SitemapEntry[] = [];
  
  try {
    const frontmatterDir = path.join(process.cwd(), 'frontmatter/materials');
    const files = fs.readdirSync(frontmatterDir);
    const yamlFiles = files.filter(f => f.endsWith('.yaml') && !f.endsWith('.backup'));
    
    yamlFiles.forEach((file) => {
      const filePath = path.join(frontmatterDir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      const fullPath = extractFullPath(fileContent);
      if (fullPath) {
        materialPageRoutes.push({
          url: `${baseUrl}${fullPath}`,
          lastModified: stats.mtime,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
          alternates: getAlternates(`${baseUrl}${fullPath}`),
        });
      }
    });
  } catch (error) {
    console.error('Error generating material routes:', error);
  }

  // Settings pages - use full_path from frontmatter
  const settingsPageRoutes: SitemapEntry[] = [];
  
  try {
    const settingsDir = path.join(process.cwd(), 'frontmatter/settings');
    const settingsFiles = fs.readdirSync(settingsDir);
    const settingsYamlFiles = settingsFiles.filter(f => f.endsWith('.yaml') && !f.endsWith('.backup'));
    
    settingsYamlFiles.forEach((file) => {
      const filePath = path.join(settingsDir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      const fullPath = extractFullPath(fileContent);
      if (fullPath) {
        settingsPageRoutes.push({
          url: `${baseUrl}${fullPath}`,
          lastModified: stats.mtime,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
          alternates: getAlternates(`${baseUrl}${fullPath}`),
        });
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
          });pages - use full_path from frontmatter
  const contaminantPageRoutes: SitemapEntry[] = [];
  
  try {
    const contaminantDir = path.join(process.cwd(), 'frontmatter/contaminants');
    const contaminantFiles = fs.readdirSync(contaminantDir);
    const contaminantYamlFiles = contaminantFiles.filter(f => f.endsWith('.yaml') && !f.endsWith('.backup'));
    
    contaminantYamlFiles.forEach((file) => {
      const filePath = path.join(contaminantDir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      const fullPath = extractFullPath(fileContent);
      if (fullPath) {
        contaminantPageRoutes.push({
          url: `${baseUrl}${fullPath}`,
          lastModified: stats.mtime,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
          alternates: getAlternates(`${baseUrl}${fullPath}`egory}/${subcategory}`);
          conspages - use full_path from frontmatter
  const compoundPageRoutes: SitemapEntry[] = [];
  
  try {
    const compoundDir = path.join(process.cwd(), 'frontmatter/compounds');
    const compoundFiles = fs.readdirSync(compoundDir);
    const compoundYamlFiles = compoundFiles.filter(f => f.endsWith('.yaml') && !f.endsWith('.backup'));
    
    compoundYamlFiles.forEach((file) => {
      const filePath = path.join(compoundDir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      const fullPath = extractFullPath(fileContent);
      if (fullPath) {
        compoundPageRoutes.push({
          url: `${baseUrl}${fullPath}`,
          lastModified: stats.mtime,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
          alternates: getAlternates(`${baseUrl}${fullPath}`),
        });
      }
    });
  } catch (error) {
    console.error('Error generating compound routes:', error);
  }

  return [
    ...staticRoutes,
    ...materialPageRoutes,
    ...settingsPageRoutes,
    ...contaminantPage