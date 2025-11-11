// app/components/JsonLD/SettingsJsonLD.tsx
import React from 'react';
import { SITE_CONFIG } from '../../config/site';
import { validateAndLogSchema } from '../../utils/validators';
import type { SettingsMetadata } from '@/types';

/**
 * Enhanced JSON-LD component for Settings Authority Pages
 * 
 * Generates comprehensive schema.org structured data for machine settings pages:
 * - HowTo: Step-by-step laser cleaning process with research-validated parameters
 * - TechnicalArticle: Authority content with E-E-A-T signals
 * - Person: Author credentials with expertise
 * - BreadcrumbList: Navigation hierarchy
 * - WebPage: Page metadata
 * 
 * @param settings - SettingsMetadata from getSettingsArticle()
 * @param category - Material category (metal, ceramic, polymer, etc.)
 * @param subcategory - Material subcategory (ferrous, non-ferrous, oxide, etc.)
 * @param slug - Page slug (aluminum-laser-cleaning, etc.)
 * @returns Script tag with comprehensive @graph JSON-LD structure
 * 
 * @example
 * ```tsx
 * <SettingsJsonLD 
 *   settings={settings} 
 *   category="metal" 
 *   subcategory="non-ferrous"
 *   slug="aluminum-laser-cleaning" 
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

  const siteUrl = SITE_CONFIG.url;
  const pageUrl = `${siteUrl}/settings/${category}/${subcategory}/${slug}`;
  const currentDate = new Date().toISOString();
  
  // Build @graph with multiple schema types
  const graph: any[] = [];

  // 1. HOWTO SCHEMA - Core laser cleaning process
  const howToSteps = buildHowToSteps(settings);
  if (howToSteps.length > 0) {
    graph.push({
      '@type': 'HowTo',
      '@id': `${pageUrl}#howto`,
      name: settings.title,
      description: settings.description,
      totalTime: 'PT30M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0'
      },
      step: howToSteps
    });
  }

  // 2. TECHNICAL ARTICLE SCHEMA - Authority content
  graph.push({
    '@type': 'TechnicalArticle',
    '@id': `${pageUrl}#article`,
    headline: settings.title,
    description: settings.description,
    author: settings.author ? {
      '@type': 'Person',
      name: settings.author.name
    } : undefined,
    datePublished: currentDate,
    dateModified: currentDate,
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    about: {
      '@type': 'Thing',
      name: `${settings.name} Laser Processing`,
      description: `Machine settings and parameters for laser cleaning of ${settings.name}`
    },
    keywords: settings.seo_settings_page?.keywords?.join(', '),
    articleSection: 'Laser Processing Technology'
  });

  // 3. PERSON SCHEMA - Author credentials
  if (settings.author) {
    graph.push({
      '@type': 'Person',
      '@id': `${siteUrl}#${settings.author.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: settings.author.name
    });
  }

  // 4. BREADCRUMB SCHEMA
  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Settings',
        item: `${siteUrl}/settings`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        item: `${siteUrl}/settings/${category}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: subcategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        item: `${siteUrl}/settings/${category}/${subcategory}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: settings.name,
        item: pageUrl
      }
    ]
  });

  // 5. WEBPAGE SCHEMA
  graph.push({
    '@type': 'WebPage',
    '@id': pageUrl,
    url: pageUrl,
    name: settings.title,
    description: settings.description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`
    },
    about: {
      '@type': 'Thing',
      name: 'Laser Cleaning Technology'
    }
  });

  // Complete schema with @graph
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': graph
  };

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
 * Helper Functions
 */

function buildHowToSteps(settings: SettingsMetadata): any[] {
  if (!settings.machineSettings?.essential_parameters) return [];

  const steps: any[] = [];
  const params = settings.machineSettings.essential_parameters;

  // Step 1: Parameter Configuration
  steps.push({
    '@type': 'HowToStep',
    position: 1,
    name: 'Configure Laser Parameters',
    text: 'Set essential parameters for safe and effective cleaning',
    itemListElement: Object.entries(params).map(([key, param]: [string, any]) => ({
      '@type': 'HowToDirection',
      text: `${key}: ${param.value} ${param.unit} (optimal range: ${param.optimal_range?.join(' to ') || 'N/A'})`
    }))
  });

  // Step 2: Processing
  steps.push({
    '@type': 'HowToStep',
    position: 2,
    name: 'Execute Cleaning Process',
    text: `Perform ${params.passCount?.value || 2} passes with ${params.overlapRatio?.value || 60}% overlap`
  });

  // Step 3: Quality Verification
  if (settings.machineSettings.expected_outcomes) {
    steps.push({
      '@type': 'HowToStep',
      position: 3,
      name: 'Verify Quality',
      text: 'Inspect cleaned surface against quality metrics'
    });
  }

  return steps;
}
