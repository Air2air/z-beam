// app/components/JsonLD/SettingsJsonLD.tsx
import React from 'react';
import { SchemaFactory } from '../../utils/schemas/SchemaFactory';
import { validateAndLogSchema } from '../../utils/validators';
import type { SettingsMetadata } from '@/types';

/**
 * Enhanced JSON-LD component for Settings Authority Pages
 * 
 * Now uses SchemaFactory for comprehensive schema.org structured data generation:
 * - TechnicalArticle: Authority content with E-E-A-T signals (citations, reviewedBy)
 * - Dataset: Research-validated parameters with provenance
 * - HowTo: Step-by-step laser cleaning process
 * - FAQPage: Auto-generated from material_challenges
 * - VideoObject: Default demonstration video
 * - ImageObject: Licensed images with proper attribution
 * - Person: Author credentials with expertise
 * - Organization: Publisher identity
 * - BreadcrumbList: Navigation hierarchy
 * - WebPage: Page metadata
 * 
 * Uses same SchemaFactory as materials pages for consistency and extensibility.
 * 
 * @param settings - SettingsMetadata from getSettingsArticle()
 * @param category - Material category (metal, ceramic, polymer, etc.)
 * @param subcategory - Material subcategory (ferrous, non-ferrous, oxide, etc.)
 * @param slug - Page slug (aluminum-settings, etc.)
 * @returns Script tag with comprehensive @graph JSON-LD structure
 * 
 * @example
 * ```tsx
 * <SettingsJsonLD 
 *   settings={settings} 
 *   category="metal" 
 *   subcategory="non-ferrous"
 *   slug="aluminum-settings" 
 * />
 * ```
 */
export function SettingsJsonLD({
  settings,
  category,
  subcategory,
  slug
}: {
  settings: SettingsMetadata;
  category: string;
  subcategory: string;
  slug: string;
}) {
  if (!settings || !settings.machineSettings) {
    return null;
  }

  // Transform settings data to match SchemaFactory expectations
  const schemaData = prepareSchemaData(settings, category, subcategory);
  
  // Build full slug path for SchemaFactory
  const fullSlug = `settings/${category}/${subcategory}/${slug}`;
  
  // Generate comprehensive schemas using SchemaFactory
  const factory = new SchemaFactory(schemaData, fullSlug);
  const jsonLdSchema = factory.generate();

  if (!jsonLdSchema) {
    return null;
  }

  // Validate schema in development
  if (process.env.NODE_ENV === 'development') {
    validateAndLogSchema(jsonLdSchema, `SettingsJsonLD (${slug})`);
  }

  // Remove escaped forward slashes for cleaner markup
  const jsonString = JSON.stringify(jsonLdSchema, null, 2).replace(/\\\//g, '/');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

/**
 * Transform SettingsMetadata into SchemaFactory-compatible format
 * Enriches settings data with E-E-A-T signals and structured content
 */
function prepareSchemaData(settings: SettingsMetadata, category: string, subcategory: string): any {
  // Extract citations from research_library (it's a Record, not an array)
  const citations: any[] = [];
  if (settings.research_library) {
    Object.values(settings.research_library).forEach((citation: any) => {
      if (citation.title && citation.url) {
        citations.push({
          name: citation.title,
          url: citation.url
        });
      }
    });
  }

  // Transform diagnostic challenges into FAQ format
  const faq = transformChallengesIntoFAQ(settings.components?.diagnostic_center?.challenges);

  // Build enhanced E-E-A-T signals for TechnicalArticle
  const eeat: any = {};
  
  if (citations.length > 0) {
    eeat.citations = citations;
  }
  
  // Add reviewer information if available (not in current type but can be extended)
  if ((settings as any).reviewedBy) {
    eeat.reviewedBy = (settings as any).reviewedBy;
  }
  
  // Add source research if available
  if ((settings as any).basedOn) {
    eeat.isBasedOn = (settings as any).basedOn;
  }

  return {
    // Core metadata
    metadata: {
      title: settings.title,
      description: settings.description,
      name: settings.name,
      category: settings.category || category,
      subcategory: settings.subcategory || subcategory,
      author: settings.author,
      datePublished: settings.datePublished,
      dateModified: settings.dateModified,
      keywords: settings.seo_settings_page?.keywords || [],
      
      // Settings-specific data
      machineSettings: settings.machineSettings,
      materialProperties: {
        // Include machine settings as "properties" for Dataset schema
        parameters: settings.machineSettings
      },
      
      // Enhanced E-E-A-T signals
      eeat,
      
      // FAQ from challenges
      faq,
      
      // Images for ImageObject schema (from extended type)
      images: (settings as any).images,
      
      // Default video for VideoObject schema
      video: 't8fB3tJCfQw', // Default Z-Beam demo video
      
      // Breadcrumb structure
      breadcrumb: settings.breadcrumb || buildDefaultBreadcrumb(settings, category, subcategory)
    },
    
    // Frontmatter alias for SchemaFactory compatibility
    frontmatter: {
      title: settings.title,
      description: settings.description,
      name: settings.name,
      category: settings.category || category,
      subcategory: settings.subcategory || subcategory,
      author: settings.author,
      machineSettings: settings.machineSettings,
      materialProperties: { parameters: settings.machineSettings },
      eeat,
      faq,
      images: (settings as any).images, // Images loaded from YAML but not in type definition
      keywords: settings.seo_settings_page?.keywords || []
    }
  };
}

/**
 * Transform material_challenges into FAQ schema format
 */
function transformChallengesIntoFAQ(challenges: any): any[] {
  if (!challenges || typeof challenges !== 'object') return [];
  
  const faqs: any[] = [];
  
  Object.entries(challenges).forEach(([key, value]: [string, any]) => {
    if (typeof value === 'object' && value.challenge && value.solution) {
      faqs.push({
        question: `How do you handle ${formatChallengeKey(key)}?`,
        answer: `Challenge: ${value.challenge}. Solution: ${value.solution}`
      });
    }
  });
  
  return faqs;
}

/**
 * Format challenge key into readable text
 */
function formatChallengeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();
}

/**
 * Build default breadcrumb structure
 */
function buildDefaultBreadcrumb(settings: SettingsMetadata, category: string, subcategory: string): any[] {
  return [
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    { 
      label: category.charAt(0).toUpperCase() + category.slice(1), 
      href: `/materials/${category}` 
    },
    { 
      label: subcategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), 
      href: `/materials/${category}/${subcategory}` 
    },
    { 
      label: settings.name, 
      href: `/settings/${category}/${subcategory}/${settings.slug}` 
    }
  ];
}
