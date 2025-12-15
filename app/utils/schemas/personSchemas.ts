import { SITE_CONFIG } from '@/app/config';

/**
 * Reusable Person schemas for consistent author attribution across pages
 */

export const TECHNICAL_TEAM_SCHEMA = {
  '@type': 'Person',
  '@id': `${SITE_CONFIG.url}#author-technical-team`,
  'name': 'Z-Beam Technical Team',
  'jobTitle': 'Laser Cleaning Specialists',
  'email': SITE_CONFIG.contact.general.email,
  'url': `${SITE_CONFIG.url}/about`,
  'knowsAbout': [
    'Laser cleaning technology',
    'Material science and surface treatment',
    'Industrial laser systems',
    'Material properties and characteristics'
  ],
  'worksFor': {
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}#organization`,
    'name': SITE_CONFIG.name
  },
  'hasCredential': [
    {
      '@type': 'EducationalOccupationalCredential',
      'name': 'Laser Safety Certification',
      'credentialCategory': 'Professional Certification'
    },
    {
      '@type': 'EducationalOccupationalCredential',
      'name': 'Materials Science Expertise',
      'credentialCategory': 'Professional Expertise'
    }
  ]
};

/**
 * Generate specialized Person schema for specific material categories
 */
export function generateCategoryAuthorSchema(
  category: string,
  categoryLabel: string,
  additionalExpertise?: string[]
) {
  return {
    ...TECHNICAL_TEAM_SCHEMA,
    'knowsAbout': [
      `${categoryLabel} laser cleaning`,
      `${categoryLabel} materials science`,
      'Industrial laser systems',
      'Laser ablation parameters',
      'Material properties and characteristics',
      ...(additionalExpertise || [])
    ],
    'description': `Expert team specializing in laser cleaning research, material analysis, and industrial surface treatment applications for ${category} materials.`
  };
}

/**
 * Generate Person schema for subcategory pages
 */
export function generateSubcategoryAuthorSchema(
  category: string,
  categoryLabel: string,
  subcategory?: string,
  subcategoryLabel?: string
) {
  // Format labels from slugs if not provided
  const formattedCategoryLabel = categoryLabel || formatLabel(category);
  const formattedSubcategoryLabel = subcategoryLabel || (subcategory ? formatLabel(subcategory) : '');
  
  return {
    ...TECHNICAL_TEAM_SCHEMA,
    'knowsAbout': [
      `${formattedSubcategoryLabel} ${formattedCategoryLabel} laser cleaning`,
      `${formattedCategoryLabel} materials science`,
      'Industrial laser systems',
      'Laser ablation parameters',
      `${formattedSubcategoryLabel} material properties`
    ],
    'description': `Expert team specializing in laser cleaning research, material analysis, and industrial surface treatment applications for ${formattedSubcategoryLabel.toLowerCase()} ${formattedCategoryLabel.toLowerCase()} materials.`
  };
}

/**
 * Helper to format slug into label
 */
function formatLabel(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
