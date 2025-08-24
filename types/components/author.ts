// types/components/author.ts
// Simplified author component types

/**
 * Simplified author data interface
 * Based on the consistent format used in content files
 */
export interface AuthorData {
  // Required field
  author_name: string;
  
  // Optional fields from content files
  credentials?: string;        // e.g., "Ph.D."
  specialties?: string[];      // e.g., ["Materials Science and Laser Technology"]
  author_country?: string;     // e.g., "Taiwan"
  avatar?: string;            // e.g., "/images/author/yi-chun-lin.jpg"
  
  // Additional optional fields for enhanced author display
  title?: string;             // Author title/position
  bio?: string;              // Author biography
  email?: string;            // Contact email
  linkedin?: string;         // LinkedIn profile URL
  
  // Legacy compatibility (for existing code)
  name?: string;              // Alternative to author_name
  image?: string;             // Alternative to avatar
}

/**
 * Author component props interface
 */
export interface AuthorProps {
  author: AuthorData;
  showAvatar?: boolean;
  showCredentials?: boolean;
  showCountry?: boolean;
  showBio?: boolean;
  showEmail?: boolean;
  showLinkedIn?: boolean;
  showSpecialties?: boolean;
  className?: string;
}
