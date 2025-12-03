// app/settings/[category]/[subcategory]/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getSettingsArticle, getArticleBySlug } from '@/app/utils/contentAPI';
import { SettingsLayout } from '@/app/components/SettingsLayout';
import { SettingsJsonLD } from '@/app/components/JsonLD/SettingsJsonLD';
import { createMetadata, type ArticleMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config/site';
import { normalizeForUrl } from '@/app/utils/urlBuilder';
import { normalizeNumericValues } from '@/app/utils/normalizers';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface SettingsPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
}

/**
 * Generate static paths for all settings pages by reading settings directory
 * Routes: /settings/{category}/{subcategory}/{material}-settings
 */
export async function generateStaticParams() {
  const settingsDir = path.join(process.cwd(), 'frontmatter', 'settings');
  const files = fs.readdirSync(settingsDir).filter(f => f.endsWith('.yaml'));
  
  const params: Array<{ category: string; subcategory: string; slug: string }> = [];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(settingsDir, file), 'utf8');
      const data = yaml.load(content) as any;
      
      // Only include active settings with proper taxonomy
      // File format: {material}-settings.yaml
      // Route format: /settings/{category}/{subcategory}/{material}-settings
      if (data.active && data.category && data.subcategory && data.slug) {
        params.push({
          category: normalizeForUrl(data.category),
          subcategory: normalizeForUrl(data.subcategory),
          slug: `${data.slug}-settings`  // Add -settings suffix to slug for URL
        });
      }
    } catch (error) {
      console.error(`Error reading settings file ${file}:`, error);
    }
  }
  
  return params;
}

/**
 * Generate metadata for SEO with enhanced OpenGraph, Twitter cards, and canonical URLs
 * 
 * Settings pages inherit og:image from their related material page when settings.images is undefined.
 * This ensures consistent visual branding across material and settings pages.
 */
export async function generateMetadata({ params }: SettingsPageProps) {
  const { category, subcategory, slug } = await params;
  
  if (!slug) {
    return {
      title: `Settings Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested settings page could not be found.'
    };
  }
  
  try {
    // slug already includes -settings suffix from generateStaticParams
    const settings = await getSettingsArticle(slug);

    if (!settings) {
      return {
        title: `Settings Not Found | ${SITE_CONFIG.shortName}`,
        description: 'Machine settings page not found.',
      };
    }

    // Verify category and subcategory match
    const settingsCategory = settings.category ? normalizeForUrl(settings.category) : undefined;
    const settingsSubcategory = settings.subcategory ? normalizeForUrl(settings.subcategory) : undefined;
    
    if (settingsCategory !== category || settingsSubcategory !== subcategory) {
      // Wrong URL structure - will redirect in page component
      return {
        title: settings.title || SITE_CONFIG.shortName,
        description: settings.description || ''
      };
    }

    // Load material images when settings.images is undefined
    // Settings pages should share the same og:image as their related material page
    let images = settings.images;
    if (!images || !images.hero) {
      try {
        const baseMaterialSlug = slug.replace(/-settings$/, '');
        const materialPath = path.join(process.cwd(), 'frontmatter', 'materials', `${baseMaterialSlug}-laser-cleaning.yaml`);
        
        if (fs.existsSync(materialPath)) {
          const fileContent = fs.readFileSync(materialPath, 'utf8');
          const materialData = yaml.load(fileContent) as any;
          if (materialData?.images?.hero) {
            images = materialData.images;
          }
        }
      } catch (imageError) {
        console.error(`Error loading material images for settings ${slug}:`, imageError);
      }
    }

    // Use createMetadata for enhanced OpenGraph, Twitter cards, canonical URLs
    const baseMetadata = createMetadata({
      title: settings.seo_settings_page?.title || settings.title,
      description: settings.seo_settings_page?.description || settings.settings_description || settings.description,
      settings_description: settings.settings_description,
      keywords: settings.seo_settings_page?.keywords || [],
      slug: `settings/${category}/${subcategory}/${slug}-settings`,
      canonical: `${SITE_CONFIG.url}/settings/${category}/${subcategory}/${slug}`,
      author: settings.author,
      category: settings.category,
      name: settings.name,
      images: images,
      content_type: settings.content_type,
      machineSettings: settings.machineSettings,
    } as unknown as ArticleMetadata);
    
    // Add canonical URL via alternates
    return {
      ...baseMetadata,
      alternates: {
        canonical: `${SITE_CONFIG.url}/settings/${category}/${subcategory}/${slug}`
      }
    };
  } catch (error) {
    console.error(`Error generating metadata for settings ${slug}:`, error);
    return {
      title: SITE_CONFIG.shortName,
      description: 'Laser cleaning machine settings and parameters.'
    };
  }
}

/**
 * Settings page component with URL validation and redirects
 * 
 * Uses {material}-settings.yaml naming convention
 * Material properties auto-loaded via materialRef in settings file
 */
export default async function SettingsPage({ params }: SettingsPageProps) {
  const { category, subcategory, slug } = await params;

  if (!slug) {
    return notFound();
  }
  
  try {
    // slug already includes -settings suffix from generateStaticParams
    const settings = await getSettingsArticle(slug);
    const settingsSlug = slug;

    if (!settings) {
      notFound();
    }

    // Verify category and subcategory match - redirect to correct URL if needed
    const settingsCategory = settings.category ? normalizeForUrl(settings.category) : undefined;
    const settingsSubcategory = settings.subcategory ? normalizeForUrl(settings.subcategory) : undefined;
    
    if (settingsCategory && settingsSubcategory) {
      if (settingsCategory !== category || settingsSubcategory !== subcategory) {
        // Redirect to correct URL
        redirect(`/settings/${settingsCategory}/${settingsSubcategory}/${slug}`);
      }
    }

    // NEW: Material properties are auto-loaded via materialRef, but we can override
    // Load material data for complete schema generation (Dataset, FAQ, HowTo)
    // Load YAML file directly since getArticleBySlug only handles .md files
    let materialArticle: any = null;
    let materialProps: any = null;
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      const yaml = await import('js-yaml');
      
      // Extract base material name from slug (remove -settings suffix)
      const baseMaterialSlug = slug.replace(/-settings$/, '');
      const materialPath = path.join(process.cwd(), 'frontmatter', 'materials', `${baseMaterialSlug}-laser-cleaning.yaml`);
      
      if (fs.existsSync(materialPath)) {
        const fileContent = fs.readFileSync(materialPath, 'utf8');
        materialArticle = yaml.load(fileContent) as any;
        // Normalize numeric values for consistent PropertyBars rendering
        materialArticle = normalizeNumericValues(materialArticle);
        materialProps = materialArticle?.materialProperties;
        console.log(`[Settings Page] Material YAML loaded: ${!!materialArticle}`);
        console.log(`[Settings Page] Material properties:`, materialProps ? Object.keys(materialProps).length + ' sections' : 'none');
      } else {
        console.log(`[Settings Page] Material YAML not found: ${materialPath}`);
      }
    } catch (error) {
      console.error(`[Settings Page] Error loading material YAML:`, error);
    }
    
    console.log(`[Settings Page] Material article loaded: ${!!materialArticle}`);
    console.log(`[Settings Page] Material properties:`, materialProps ? Object.keys(materialProps).length + ' sections' : 'none');
    
    // Merge material data into settings for complete schemas
    if (materialArticle) {
      // For Dataset schema - ALWAYS set materialProperties even if undefined to avoid errors
      (settings as any).materialProperties = materialProps || {};
      
      // Copy hero image from material for SectionTitle thumbnails
      if (materialArticle.images?.hero) {
        (settings as any).images = (settings as any).images || {};
        (settings as any).images.hero = materialArticle.images.hero;
      }
      
      // For FAQPage schema (hasFAQData checks for faq, outcomeMetrics, applications, environmentalImpact)
      if (materialArticle.faq) {
        (settings as any).faq = materialArticle.faq;
      }
      if (materialArticle.outcomeMetrics) {
        (settings as any).outcomeMetrics = materialArticle.outcomeMetrics;
      }
      if (materialArticle.applications) {
        (settings as any).applications = materialArticle.applications;
      }
      if (materialArticle.environmentalImpact) {
        (settings as any).environmentalImpact = materialArticle.environmentalImpact;
      }
      if (materialArticle.regulatoryStandards) {
        (settings as any).regulatoryStandards = materialArticle.regulatoryStandards;
      }
    } else {
      // Even if materialArticle doesn't exist, initialize empty properties to avoid undefined errors
      (settings as any).materialProperties = {};
      (settings as any).faq = [];
      (settings as any).regulatoryStandards = [];
    }

    return (
      <>
        {/* Schema.org JSON-LD */}
        <SettingsJsonLD 
          settings={settings} 
          category={category}
          subcategory={subcategory}
          slug={settingsSlug}
        />

        {/* SettingsLayout handles all standard components automatically */}
        <SettingsLayout
          settings={settings}
          materialProperties={materialProps}
          category={category}
          subcategory={subcategory}
          slug={settingsSlug}
        >
          {/* Optional: Additional custom content can be added here */}
        </SettingsLayout>
      </>
    );
  } catch (error) {
    console.error(`Error rendering settings page for ${slug}:`, error);
    notFound();
  }
}
