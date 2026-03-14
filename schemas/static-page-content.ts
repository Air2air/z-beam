/**
 * Shared schema definitions for static-page-related configs that still have
 * live consumers in tests.
 */

export interface HomeFeaturedSection {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
}

/**
 * Schema validation for homepage featured section cards
 */
export const HomeFeaturedSectionSchema = {
  properties: {
    slug: {
      type: 'string',
      minLength: 1,
      description: 'Route segment used to build card links (e.g. applications -> /applications)'
    },
    title: {
      type: 'string',
      minLength: 1,
      description: 'Card title shown on homepage'
    },
    description: {
      type: 'string',
      minLength: 1,
      description: 'Card summary shown on homepage'
    },
    imageUrl: {
      type: 'string',
      minLength: 1,
      description: 'Card image path'
    }
  },
  required: ['slug', 'title', 'description', 'imageUrl']
} as const;

/**
 * Type guard to validate homepage featured section card structure
 */
export function isValidHomeFeaturedSection(obj: any): obj is HomeFeaturedSection {
  return (
    typeof obj === 'object' &&
    typeof obj.slug === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.imageUrl === 'string' &&
    obj.slug.trim().length > 0 &&
    obj.title.trim().length > 0 &&
    obj.description.trim().length > 0 &&
    obj.imageUrl.trim().length > 0
  );
}