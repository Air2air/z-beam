// app/sitemap.ts
import { SITE_CONFIG } from '@/app/config/site';
import fs from 'fs';
import path from 'path';
import { buildCategoryUrl, buildSubcategoryUrl, buildUrlFromMetadata } from './utils/urlBuilder';
import { toCategorySlug } from './utils/formatting';

// Sitemap configuration constants
const SITEMAP_PRIORITIES = {
  HOMEPAGE: 1.0,
  MONEY_PAGES: 0.95,        // services, rental
  CONTENT_HUBS: 0.9,        // materials, settings, compounds, datasets, contaminants
  CATEGORY_PAGES: 0.85,     // material/contaminant category taxonomy
  PARTNER_PAGES: 0.8,       // partners, netalux
  ITEM_PAGES: 0.8,          // material items, compound categories
  SUBCATEGORY_PAGES: 0.75,  // material/contaminant subcategories
  INFORMATIONAL: 0.7,       // about, contact, compound subcategories
  TECHNICAL_REF: 0.6,       // settings items, compounds, contaminants
  SEARCH: 0.5
} as const;

const CHANGE_FREQUENCY = {
  REAL_TIME: 'daily' as const,    // homepage, search
  HIGH_VALUE: 'weekly' as const,  // money pages, content hubs, categories
  MODERATE: 'monthly' as const,   // informational, items
} as const;

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
  // Expanded international SEO coverage: 16 locales for global reach
  const getAlternates = (url: string) => ({
    languages: {
      // English variants
      'en-US': url,
      'en-GB': url,
      'en-CA': url,
      'en-AU': url,
      // Spanish variants
      'es-MX': url,
      'es-ES': url, // Spain Spanish (NEW)
      // French
      'fr-CA': url,
      // German
      'de-DE': url,
      // Chinese
      'zh-CN': url,
      // Portuguese
      'pt-BR': url, // Brazilian Portuguese (NEW)
      // Japanese
      'ja-JP': url, // Japan (NEW)
      // Korean
      'ko-KR': url, // South Korea (NEW)
      // Italian
      'it-IT': url, // Italy (NEW)
      // Polish
      'pl-PL': url, // Poland (NEW)
      // Dutch
      'nl-NL': url, // Netherlands (NEW)
      // Default fallback
      'x-default': url,
    },
  });
  
  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.REAL_TIME,
      priority: SITEMAP_PRIORITIES.HOMEPAGE,
      alternates: getAlternates(baseUrl),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.MODERATE,
      priority: SITEMAP_PRIORITIES.INFORMATIONAL,
      alternates: getAlternates(`${baseUrl}/about`),
    },
    {
      url: `${baseUrl}/rental`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
      priority: SITEMAP_PRIORITIES.MONEY_PAGES,
      alternates: getAlternates(`${baseUrl}/rental`),
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date('2025-10-17'),
      changeFrequency: CHANGE_FREQUENCY.MODERATE,
      priority: SITEMAP_PRIORITIES.PARTNER_PAGES,
      alternates: getAlternates(`${baseUrl}/partners`),
    },
    {
      url: `${baseUrl}/netalux`,
      lastModified: new Date('2025-10-25'),
      changeFrequency: CHANGE_FREQUENCY.MODERATE,
      priority: SITEMAP_PRIORITIES.PARTNER_PAGES,
      alternates: getAlternates(`${baseUrl}/netalux`),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.MODERATE,
      priority: SITEMAP_PRIORITIES.INFORMATIONAL,
      alternates: getAlternates(`${baseUrl}/contact`),
    },
    {
      url: `${baseUrl}/datasets`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
      priority: SITEMAP_PRIORITIES.CONTENT_HUBS,
      alternates: getAlternates(`${baseUrl}/datasets`),
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.REAL_TIME,
      priority: SITEMAP_PRIORITIES.SEARCH,
      alternates: getAlternates(`${baseUrl}/search`),
    },
    {
      url: `${baseUrl}/materials`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
      priority: SITEMAP_PRIORITIES.CONTENT_HUBS,
      alternates: getAlternates(`${baseUrl}/materials`),
    },
    {
      url: `${baseUrl}/contaminants`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
      priority: SITEMAP_PRIORITIES.CONTENT_HUBS,
      alternates: getAlternates(`${baseUrl}/contaminants`),
    },
    {
      url: `${baseUrl}/compounds`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
      priority: SITEMAP_PRIORITIES.CONTENT_HUBS,
      alternates: getAlternates(`${baseUrl}/compounds`),
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
      priority: SITEMAP_PRIORITIES.CONTENT_HUBS,
      alternates: getAlternates(`${baseUrl}/settings`),
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
        const category = toCategorySlug(categoryMatch[1].trim()).replace(/'/g, '');
        const subcategory = subcategoryMatch ? toCategorySlug(subcategoryMatch[1].trim()).replace(/'/g, '') : '';
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
            changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
            priority: SITEMAP_PRIORITIES.CATEGORY_PAGES,
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
              changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
              priority: SITEMAP_PRIORITIES.SUBCATEGORY_PAGES,
              alternates: getAlternates(subcategoryUrl),
            });
          }
          
          // Add material page with full path
          const materialPageUrl = buildUrlFromMetadata({ rootPath: 'materials', category, subcategory, slug }, true);
          materialPageRoutes.push({
            url: materialPageUrl,
            lastModified: stats.mtime,
            changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
            priority: SITEMAP_PRIORITIES.ITEM_PAGES,
            alternates: getAlternates(materialPageUrl),
          });
        }
      }
    });
  } catch (error) {
    console.error('Error generating material routes:', error);
  }

  // Settings pages - use fullPath from frontmatter
  try {
    const settingsDir = path.join(process.cwd(), 'frontmatter/settings');
    const settingsFiles = fs.readdirSync(settingsDir);
    const settingsYamlFiles = settingsFiles.filter(f => f.endsWith('.yaml') && !f.endsWith('.backup'));
    
    settingsYamlFiles.forEach((file) => {
      const filePath = path.join(settingsDir, file);
      const stats = fs.statSync(filePath);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Extract fullPath from YAML (camelCase)
      const fullPathMatch = fileContent.match(/^fullPath:\s*(.+)$/m);
      
      if (fullPathMatch) {
        const fullPath = fullPathMatch[1].trim();
        const settingsPageUrl = `${baseUrl}${fullPath}`;
        
        settingsPageRoutes.push({
          url: settingsPageUrl,
          lastModified: stats.mtime,
          changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
          priority: SITEMAP_PRIORITIES.TECHNICAL_REF,
          alternates: getAlternates(settingsPageUrl),
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
        const category = toCategorySlug(categoryMatch[1].trim()).replace(/'/g, '');
        const subcategory = subcategoryMatch ? toCategorySlug(subcategoryMatch[1].trim()).replace(/'/g, '') : '';
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
            changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
            priority: SITEMAP_PRIORITIES.ITEM_PAGES,
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
            changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
            priority: SITEMAP_PRIORITIES.INFORMATIONAL,
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
          changeFrequency: CHANGE_FREQUENCY.MODERATE,
          priority: SITEMAP_PRIORITIES.TECHNICAL_REF,
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
        const category = toCategorySlug(categoryMatch[1].trim()).replace(/'/g, '');
        const subcategory = subcategoryMatch ? toCategorySlug(subcategoryMatch[1].trim()).replace(/'/g, '') : '';
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
            changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
            priority: SITEMAP_PRIORITIES.ITEM_PAGES,
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
            changeFrequency: CHANGE_FREQUENCY.HIGH_VALUE,
            priority: SITEMAP_PRIORITIES.INFORMATIONAL,
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
          changeFrequency: CHANGE_FREQUENCY.MODERATE,
          priority: SITEMAP_PRIORITIES.TECHNICAL_REF,
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
