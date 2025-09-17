// types/components/author.ts
// Simplified author component types

/**
 * Unified Author Info structure - single source of truth
 * Standardized field names to eliminate redundancy
 */
export interface AuthorInfo {
  id?: number;              // Optional ID for YAML references
  name: string;             // Standardized: was author_name/name
  title?: string;           // Standardized: was credentials/title
  expertise?: string;       // Standardized: was specialties[0]/expertise
  country?: string;         // Standardized: was author_country/country
  sex?: 'f' | 'm' | 'other';// Gender for profile completeness
  image?: string;           // Standardized: was avatar/image
  bio?: string;            // Author biography
  email?: string;          // Contact email
  linkedin?: string;       // LinkedIn profile URL
  profile?: {
    description?: string;
    expertiseAreas?: string[];
    contactNote?: string;
  };
}

/**
 * Author component props interface
 * Now uses simplified AuthorInfo structure
 */
export interface AuthorProps {
  author: AuthorInfo;
  showAvatar?: boolean;
  showCredentials?: boolean;
  showCountry?: boolean;
  showBio?: boolean;
  showEmail?: boolean;
  showLinkedIn?: boolean;
  showSpecialties?: boolean;
  className?: string;
}
