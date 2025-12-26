/**
 * @module schemaValidator
 * @purpose Runtime validation of JSON-LD structured data for SEO compliance
 * @dependencies None (pure function)
 * @usage Import validateSchema to check generated JSON-LD at runtime
 * 
 * This utility validates generated JSON-LD schemas to ensure:
 * - Valid JSON structure
 * - Required Schema.org properties present
 * - No invalid Schema.org types
 * - E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals
 */

export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  schemaType?: string;
}

// Required properties by Schema.org type
const REQUIRED_PROPERTIES: Record<string, string[]> = {
  'Article': ['headline', 'author', 'datePublished'],
  'TechArticle': ['headline', 'author', 'datePublished'],
  'TechnicalArticle': ['headline', 'author', 'datePublished'],
  'Product': ['name', 'description'],
  'HowTo': ['name', 'step'],
  'Dataset': ['name', 'description'],
  'FAQPage': ['mainEntity'],
  'Person': ['name'],
  'BreadcrumbList': ['itemListElement'],
  'WebPage': ['name', 'url'],
  'VideoObject': ['name', 'description', 'thumbnailUrl', 'uploadDate'],
};

// Invalid Schema.org types (custom types not recognized)
const INVALID_TYPES = [
  'Material', // Not a valid Schema.org type
  'LaserProcess',
  'MachineSettings',
];

/**
 * Validate ISO 8601 datetime with timezone
 * Valid formats: 2024-01-15T00:00:00Z or 2024-01-15T00:00:00+00:00
 */
function isValidIso8601WithTimezone(dateString: string): boolean {
  // Must have T separator and end with Z or timezone offset
  const iso8601WithTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;
  return iso8601WithTimezone.test(dateString);
}

/**
 * Validate a single schema object
 */
export function validateSchema(schema: any): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!schema) {
    return {
      isValid: false,
      errors: ['Schema is null or undefined'],
      warnings: [],
    };
  }
  
  // Check if it's valid JSON (should already be an object)
  if (typeof schema !== 'object') {
    return {
      isValid: false,
      errors: ['Schema is not a valid object'],
      warnings: [],
    };
  }
  
  // Extract schema type
  const schemaType = schema['@type'];
  
  if (!schemaType) {
    warnings.push('Missing @type property');
  }
  
  // Check for invalid types
  if (schemaType && INVALID_TYPES.includes(schemaType)) {
    errors.push(`Invalid @type "${schemaType}" - not a valid Schema.org type`);
  }
  
  // Check for required properties
  if (schemaType && REQUIRED_PROPERTIES[schemaType]) {
    const required = REQUIRED_PROPERTIES[schemaType];
    for (const prop of required) {
      if (!schema[prop]) {
        errors.push(`Missing required "${prop}" property for ${schemaType}`);
      }
    }
  }
  
  // E-E-A-T signals validation
  if (schemaType === 'Article' || schemaType === 'TechArticle' || schemaType === 'TechnicalArticle') {
    // Expertise: Check for author credentials
    if (schema.author && typeof schema.author === 'object') {
      if (!schema.author.jobTitle && !schema.author.description) {
        warnings.push('Author missing expertise signals (jobTitle or description)');
      }
    }
    
    // Trustworthiness: Check for dates
    if (!schema.dateModified) {
      warnings.push('Missing dateModified (freshness signal)');
    }
    
    // Authoritativeness: Check for citations/references
    if (!schema.citation && !schema.about) {
      warnings.push('Missing citation or about property (authority signal)');
    }
  }
  
  // Product schema validation
  if (schemaType === 'Product') {
    if (!schema.offers) {
      warnings.push('Product missing offers (price/availability information)');
    } else {
      // Google Rich Results required fields (December 2025)
      if (!schema.offers.hasMerchantReturnPolicy) {
        warnings.push('Product offers missing hasMerchantReturnPolicy (required for Google rich results)');
      }
      if (!schema.offers.shippingDetails) {
        warnings.push('Product offers missing shippingDetails (required for Google rich results)');
      }
    }
    if (!schema.brand) {
      warnings.push('Product missing brand');
    }
  }

  // VideoObject datetime validation
  if (schemaType === 'VideoObject') {
    if (schema.uploadDate && !isValidIso8601WithTimezone(schema.uploadDate)) {
      errors.push('VideoObject uploadDate must be ISO 8601 format with timezone (e.g., 2024-01-15T00:00:00Z)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    schemaType,
  };
}

/**
 * Validate a @graph structure with multiple schemas
 */
export function validateGraphSchemas(graphSchema: any): SchemaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!graphSchema || !graphSchema['@graph']) {
    return validateSchema(graphSchema);
  }
  
  const graphs = graphSchema['@graph'];
  
  if (!Array.isArray(graphs)) {
    errors.push('@graph must be an array');
    return { isValid: false, errors, warnings };
  }
  
  // Validate each schema in the graph
  graphs.forEach((schema: any, index: number) => {
    const result = validateSchema(schema);
    
    // Prefix errors and warnings with index
    result.errors.forEach(err => errors.push(`[${index}] ${err}`));
    result.warnings.forEach(warn => warnings.push(`[${index}] ${warn}`));
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Development-only: Log validation results
 */
export function logValidationResults(
  result: SchemaValidationResult,
  label: string = 'Schema'
): void {
  if (process.env.NODE_ENV === 'development') {
    if (result.isValid && result.warnings.length === 0) {
      console.log(`✅ ${label}: Valid`);
    } else {
      if (!result.isValid) {
        console.error(`❌ ${label}: Validation failed`);
        result.errors.forEach(err => console.error(`   • ${err}`));
      }
      if (result.warnings.length > 0) {
        console.warn(`⚠️  ${label}: Warnings`);
        result.warnings.forEach(warn => console.warn(`   • ${warn}`));
      }
    }
  }
}

/**
 * Safe schema validation wrapper
 * Validates schema and optionally logs in development
 */
export function validateAndLogSchema(
  schema: any,
  label?: string,
  logResults: boolean = true
): SchemaValidationResult {
  const result = validateGraphSchemas(schema);
  
  if (logResults) {
    logValidationResults(result, label);
  }
  
  return result;
}
