/**
 * Schema Data Access Helpers
 * 
 * Provides normalized access to frontmatter/metadata across different data structures.
 * Handles inconsistency between contentAPI (returns metadata) and static pages (use frontmatter).
 */

/**
 * Safely access frontmatter/metadata from various data structures
 */
export function getMetadata(data: any): Record<string, unknown> {
  return (data.metadata || data.frontmatter || data.pageConfig || data) as Record<string, unknown>;
}

/**
 * Check if material has product data for Product schema
 */
export function hasProductData(data: any): boolean {
  const meta = getMetadata(data);
  return !!(
    data.needle100_150 ||
    data.needle200_300 ||
    data.jangoSpecs ||
    meta.materialProperties ||
    data.products
  );
}

/**
 * Check if material has machine settings for HowTo schema
 */
export function hasMachineSettings(data: any): boolean {
  const meta = getMetadata(data);
  return !!(meta.machineSettings || data.steps);
}

/**
 * Check if material has material properties for Dataset schema
 */
export function hasMaterialProperties(data: any): boolean {
  const meta = getMetadata(data);
  return !!meta.materialProperties;
}

/**
 * Check if has author for Person schema
 */
export function hasAuthor(data: any): boolean {
  const meta = getMetadata(data);
  return !!(meta.author || data.author);
}

/**
 * Check if has FAQ data for FAQ schema
 */
export function hasFAQData(data: any): boolean {
  const meta = getMetadata(data);
  if (data.faq || meta.faq) return true;
  
  // Check for FAQ-generating frontmatter (used by MaterialFAQ component)
  return !!(meta.outcomeMetrics || meta.applications || meta.environmentalImpact);
}

/**
 * Check if has service data
 */
export function hasServiceData(data: any): boolean {
  const title = typeof data.title === 'string' ? data.title : '';
  return !!(
    data.services ||
    data.serviceOfferings ||
    (data.contentCards && title.toLowerCase().includes('service'))
  );
}

/**
 * Check if has multiple products for ItemList schema
 */
export function hasMultipleProducts(data: any): boolean {
  const productCount = [
    data.needle100_150,
    data.needle200_300,
    data.jangoSpecs
  ].filter(Boolean).length;
  const products = Array.isArray(data.products) ? data.products : [];
  return productCount > 1 || products.length > 1;
}

/**
 * Check if has multiple services for ItemList schema
 */
export function hasMultipleServices(data: any): boolean {
  const services = Array.isArray(data.services) ? data.services : [];
  const offerings = Array.isArray(data.serviceOfferings) ? data.serviceOfferings : [];
  return services.length > 1 || offerings.length > 1;
}

/**
 * Check if has regulatory standards for Certification schema
 */
export function hasRegulatoryStandards(data: any): boolean {
  const meta = getMetadata(data);
  return !!meta.regulatoryStandards;
}

/**
 * Check if has video data for VideoObject schema
 */
export function hasVideoData(data: any): boolean {
  const meta = getMetadata(data);
  // Always include video for material pages (default video: t8fB3tJCfQw)
  const isMaterialPage = meta.materialProperties || meta.category;
  return !!(data.video || data.youtubeUrl || meta.video || isMaterialPage);
}

/**
 * Check if has image data for ImageObject schema
 */
export function hasImageData(data: any): boolean {
  const meta = getMetadata(data);
  return !!(data.images || meta.images);
}
