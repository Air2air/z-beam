// app/config/contentTypes.ts
// Content type configuration for unified content management

import type { ContentType } from '@/types';
import { SITE_CONFIG } from './site';
import { getArticle, getContaminantArticle, getCompoundArticle, getSettingsArticle, getApplicationArticle } from '@/app/utils/contentAPI';
import { 
  getAllCategories as getAllMaterialCategories,
  getSubcategoryInfo as getMaterialSubcategoryInfo 
} from '@/app/utils/materialCategories';
import { 
  getAllCategories as getAllContaminantCategories,
  getSubcategoryInfo as getContaminantSubcategoryInfo 
} from '@/app/utils/contaminantCategories';
import { 
  getAllCategories as getAllCompoundCategories,
  getSubcategoryInfo as getCompoundSubcategoryInfo 
} from '@/app/utils/compoundCategories';
import { 
  getAllCategories as getAllSettingsCategories,
  getSubcategoryInfo as getSettingsSubcategoryInfo 
} from '@/app/utils/settingsCategories';
import {
  getAllCategories as getAllApplicationCategories,
  getSubcategoryInfo as getApplicationSubcategoryInfo
} from '@/app/utils/applicationCategories';

export type { ContentType };

export interface ContentTypeConfig {
  // Content type identifier
  type: ContentType;
  
  // Display names
  singular: string;        // "Material", "Contaminant"
  plural: string;          // "Materials", "Contaminants"
  
  // URL paths
  rootPath: string;        // "materials", "contaminants"
  
  // Content loading functions
  getArticle: (slug: string) => Promise<any>;
  getAllCategories: () => Promise<any[]>;
  getSubcategoryInfo: (category: string, subcategory: string) => Promise<any>;
  
  // Property names in data structures
  itemsProperty: string;   // "materials", "contaminants"
  
  // SEO text patterns
  actionText: string;      // "Laser Cleaning", "Contamination Removal"
  purposeText: string;     // "cleaning solutions for", "removal solutions for"
  
  // Schema metadata
  schemaType: string;      // "Material", "Contamination"

  // CollectionPage display helpers — drives CollectionPage without ternaries
  imageSingular: string;                            // 'material', 'contaminant', 'compound', 'setting', 'application'
  collectionSchemaSuffix: string;                   // appended to `${category.label} ` in schema item names
  collectionCardDescription: (label: string) => string;
  collectionImageAlt: (label: string) => string;

  // Index page metadata — domain-specific SEO and display text for the /domain root page
  indexMeta?: {
    title: string;           // <title> for the index page
    description: string;     // meta description
    keywords: string[];      // meta keywords
    pageTitle: string;       // H1 / visible title rendered inside CollectionPage
    pageDescription: string; // visible subtitle rendered inside CollectionPage
  };

  // Index page category normaliser — returns { slug, label, items }[] for CollectionPage
  // Not defined for domains that use a different rendering architecture (e.g. settings)
  getAllIndexCategories?: () => Promise<{ slug: string; label: string; items: any[] }[]>;

  // Optional: settings lookup (materials only)
  hasSettings?: boolean;
}

export const CONTENT_TYPE_CONFIGS: Record<ContentType, ContentTypeConfig> = {
  materials: {
    type: 'materials',
    singular: 'Material',
    plural: 'Materials',
    rootPath: 'materials',
    getArticle: getArticle,
    getAllCategories: getAllMaterialCategories,
    getSubcategoryInfo: getMaterialSubcategoryInfo,
    itemsProperty: 'materials',
    actionText: 'Laser Cleaning',
    purposeText: 'laser cleaning solutions for',
    schemaType: 'Material',
    imageSingular: 'material',
    collectionSchemaSuffix: 'Laser Cleaning',
    collectionCardDescription: (label) => `Laser cleaning parameters and machine settings for ${label}`,
    collectionImageAlt: (label) => `${label} laser cleaning`,
    hasSettings: true,
    indexMeta: {
      title: 'Material Categories',
      description: 'Browse our comprehensive collection of materials including metals, ceramics, composites, semiconductors, and more. Find laser cleaning parameters and machine settings for your specific material.',
      keywords: ['materials', 'laser cleaning', 'metals', 'ceramics', 'composites', 'semiconductors', 'glass', 'stone', 'wood', 'plastics'],
      pageTitle: 'Material Categories',
      pageDescription: 'Explore laser cleaning parameters and machine settings for every material type',
    },
    getAllIndexCategories: async () => {
      const categories = await getAllMaterialCategories();
      return categories.map(cat => ({ slug: cat.slug, label: cat.label, items: cat.materials }));
    },
  },
  
  contaminants: {
    type: 'contaminants',
    singular: 'Contaminant',
    plural: 'Contaminants',
    rootPath: 'contaminants',
    getArticle: getContaminantArticle,
    getAllCategories: getAllContaminantCategories,
    getSubcategoryInfo: getContaminantSubcategoryInfo,
    itemsProperty: 'contaminants',
    actionText: 'Contamination Removal',
    purposeText: 'removal solutions for',
    schemaType: 'Contamination',
    imageSingular: 'contaminant',
    collectionSchemaSuffix: 'Contamination',
    collectionCardDescription: (label) => `Laser cleaning solutions for ${label} contamination types`,
    collectionImageAlt: (label) => `${label} contamination removal`,
    hasSettings: false,
    indexMeta: {
      title: `Contaminants | ${SITE_CONFIG.shortName} Laser Cleaning`,
      description: 'Comprehensive guide to contaminant types and laser cleaning solutions for industrial applications. From oxidation to coatings, explore our extensive contamination database.',
      keywords: ['contamination types', 'laser cleaning contaminants', 'rust removal', 'paint removal', 'oxidation removal', 'coating removal'],
      pageTitle: 'Laser Cleaning Contaminants',
      pageDescription: 'Explore our comprehensive database of contaminant types and laser cleaning solutions for industrial applications.',
    },
    getAllIndexCategories: async () => {
      const categories = await getAllContaminantCategories();
      return categories.map(cat => ({ slug: cat.slug, label: cat.label, items: cat.contaminants }));
    },
  },
  
  compounds: {
    type: 'compounds',
    singular: 'Compound',
    plural: 'Compounds',
    rootPath: 'compounds',
    getArticle: getCompoundArticle,
    getAllCategories: getAllCompoundCategories,
    getSubcategoryInfo: getCompoundSubcategoryInfo,
    itemsProperty: 'compounds',
    actionText: 'Hazardous Compound',
    purposeText: 'safety information for',
    schemaType: 'Compound',
    imageSingular: 'compound',
    collectionSchemaSuffix: 'Compounds',
    collectionCardDescription: (label) => `Safety data for ${label} compounds produced during laser cleaning`,
    collectionImageAlt: (label) => `${label} compound safety information`,
    hasSettings: false,
    indexMeta: {
      title: `Hazardous Compounds | ${SITE_CONFIG.shortName} Laser Cleaning`,
      description: 'Comprehensive database of hazardous compounds produced during laser cleaning operations, including toxicity data, exposure limits, and safety guidelines.',
      keywords: ['hazardous compounds', 'laser safety', 'toxic gases', 'exposure limits', 'industrial safety'],
      pageTitle: 'Hazardous Compounds in Laser Cleaning',
      pageDescription: 'Comprehensive safety information for compounds produced during laser cleaning operations.',
    },
    getAllIndexCategories: async () => {
      const categories = await getAllCompoundCategories();
      return categories.map(cat => ({ slug: cat.slug, label: cat.label, items: cat.compounds }));
    },
  },
  
  settings: {
    type: 'settings',
    singular: 'Setting',
    plural: 'Settings',
    rootPath: 'settings',
    getArticle: getSettingsArticle,
    getAllCategories: getAllSettingsCategories,
    getSubcategoryInfo: getSettingsSubcategoryInfo,
    itemsProperty: 'settings',
    actionText: 'Machine Settings',
    purposeText: 'machine settings for',
    schemaType: 'Settings',
    imageSingular: 'setting',
    collectionSchemaSuffix: 'Settings',
    collectionCardDescription: (label) => `Optimized machine settings for ${label} laser cleaning applications`,
    collectionImageAlt: (label) => `${label} machine settings`,
    hasSettings: false,
  },
  applications: {
    type: 'applications',
    singular: 'Application',
    plural: 'Applications',
    rootPath: 'applications',
    getArticle: getApplicationArticle,
    getAllCategories: getAllApplicationCategories,
    getSubcategoryInfo: getApplicationSubcategoryInfo,
    itemsProperty: 'applications',
    actionText: 'Laser Cleaning',
    purposeText: 'laser cleaning solutions for',
    schemaType: 'Service',
    imageSingular: 'application',
    collectionSchemaSuffix: 'Applications',
    collectionCardDescription: (label) => `Laser cleaning solutions for ${label} applications`,
    collectionImageAlt: (label) => `${label} laser cleaning applications`,
    hasSettings: false,
    indexMeta: {
      title: 'Applications',
      description: 'Explore laser cleaning applications across aerospace, automotive, electronics, medical devices, and more.',
      keywords: ['laser cleaning applications', 'aerospace', 'automotive', 'electronics', 'medical devices', 'energy', 'defense'],
      pageTitle: 'Applications',
      pageDescription: 'Explore laser cleaning applications across key industries and use cases.',
    },
    getAllIndexCategories: async () => {
      const categories = await getAllApplicationCategories();
      return categories.flatMap(cat => {
        if (!cat.subcategories || cat.subcategories.length === 0) {
          return [{ slug: cat.slug, label: cat.label, items: cat.applications }];
        }
        return cat.subcategories.map(sub => ({ slug: sub.slug, label: sub.label, items: sub.applications }));
      });
    },
  },
};

/**
 * Get configuration for a content type
 */
export function getContentConfig(contentType: ContentType): ContentTypeConfig {
  const config = CONTENT_TYPE_CONFIGS[contentType];
  if (!config) {
    throw new Error(`Invalid content type: ${contentType}`);
  }
  return config;
}

/**
 * Check if a string is a valid content type
 */
export function isValidContentType(value: string): value is ContentType {
  return value === 'materials' || value === 'contaminants' || value === 'compounds' || value === 'settings' || value === 'applications';
}
