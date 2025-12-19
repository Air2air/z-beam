// app/config/contentTypes.ts
// Content type configuration for unified content management

import type { ContentType } from '@/types';
import { getArticle, getContaminantArticle, getCompoundArticle, getSettingsArticle } from '@/app/utils/contentAPI';
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
    hasSettings: true,
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
    hasSettings: false,
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
    hasSettings: false,
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
    hasSettings: false,
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
  return value === 'materials' || value === 'contaminants' || value === 'compounds' || value === 'settings';
}
