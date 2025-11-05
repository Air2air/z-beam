// app/utils/normalizers.ts
// Data normalization functions for content processing

/**
 * Normalize category and subcategory fields to lowercase with hyphens
 * This ensures consistency across all frontmatter files regardless of original casing
 */
export function normalizeCategoryFields(data: any): any {
  if (!data) return data;
  
  // Valid category mappings from TitleCase/mixed to lowercase
  const CATEGORY_MAP: Record<string, string> = {
    'Metal': 'metal',
    'Ceramic': 'ceramic',
    'Composite': 'composite',
    'Polymer': 'polymer',
    'Wood': 'wood',
    'Stone': 'stone',
    'Glass': 'glass',
    'Rare-Earth': 'rare-earth',
    'Natural': 'natural',
    'Semiconductor': 'semiconductor',
    'Masonry': 'masonry',
    'Plastic': 'plastic'
  };
  
  // Normalize category
  if (data.category) {
    // First try exact mapping
    if (CATEGORY_MAP[data.category]) {
      data.category = CATEGORY_MAP[data.category];
    } else if (data.category !== data.category.toLowerCase()) {
      // Otherwise just lowercase it
      data.category = data.category.toLowerCase();
    }
  }
  
  // Normalize subcategory (ensure lowercase with hyphens)
  if (data.subcategory && typeof data.subcategory === 'string') {
    data.subcategory = data.subcategory.toLowerCase();
  }
  
  return data;
}

/**
 * Normalize all text fields to handle unicode escape sequences
 */
export function normalizeAllTextFields(data: any): any {
  if (!data) return data;
  
  const normalize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(normalize);
    }
    
    if (obj && typeof obj === 'object') {
      const normalized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        normalized[key] = normalize(value);
      }
      return normalized;
    }
    
    return obj;
  };
  
  return normalize(data);
}

/**
 * Normalize freshness timestamps (datePublished, dateModified)
 */
export function normalizeFreshnessTimestamps(data: any): any {
  if (!data) return data;
  
  const now = new Date().toISOString();
  
  // If no datePublished, set it to now
  if (!data.datePublished) {
    data.datePublished = now;
  }
  
  // If no dateModified, set it to datePublished or now
  if (!data.dateModified) {
    data.dateModified = data.datePublished || now;
  }
  
  return data;
}

/**
 * Normalize regulatory standards to resolve "Unknown" names
 */
export function normalizeRegulatoryStandards(standards: any[]): any[] {
  if (!Array.isArray(standards)) return standards;
  
  return standards.map(standard => {
    if (typeof standard === 'object' && standard !== null && standard.name === 'Unknown') {
      // Try to infer name from other fields
      if (standard.id) {
        return { ...standard, name: standard.id };
      }
      if (standard.abbreviation) {
        return { ...standard, name: standard.abbreviation };
      }
    }
    return standard;
  });
}
