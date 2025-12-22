/**
 * Card Component Configuration
 * Centralized styling variants for MaterialCard component
 * @see app/components/Card/Card.tsx
 */

export interface CardVariantConfig {
  // Layout
  padding: string;
  imageHeight: string;
  cardHeight: string;
  
  // Typography
  titleClass: string;
  descriptionClass: string;
  
  // Appearance
  cardClass: string;
  hoverEffect: string;
  titleBarClass: string;
  transitionClass: string;
}

export type CardVariant = 'default' | 'featured' | 'relationship';

export const CARD_VARIANTS: Record<CardVariant, CardVariantConfig> = {
  default: {
    // Layout
    padding: "px-3 py-3 md:px-4 md:py-2.5",
    imageHeight: "h-[6.75rem] md:h-[7.5rem]", // Fixed height for default cards
    cardHeight: "h-full min-h-[5.25rem] md:min-h-[6.75rem] lg:min-h-[7.5rem]",
    
    // Typography
    titleClass: "card-title text-lg truncate text-primary font-medium",
    descriptionClass: "text-primary text-xs line-clamp-2",
    
    // Appearance
    cardClass: "rounded-md shadow-md overflow-hidden",
    hoverEffect: "card-enhanced-hover",
    titleBarClass: "absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm",
    
    // Enhanced transitions - targeting multiple properties for smooth hover effects
    transitionClass: "transition-all duration-300 ease-out",
  },
  featured: {
    // Layout
    padding: "px-3 py-3 md:px-4 md:py-2.5",
    imageHeight: "h-full", // Full height for featured cards - image expands to fill card
    cardHeight: "h-full min-h-[8rem] md:min-h-[10rem] lg:min-h-[12rem]",
    
    // Typography
    titleClass: "card-title text-lg truncate text-primary font-medium",
    descriptionClass: "text-primary text-xs line-clamp-2",
    
    // Appearance
    cardClass: "rounded-md shadow-md overflow-hidden",
    hoverEffect: "card-enhanced-hover",
    titleBarClass: "absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm",
    
    // Enhanced transitions - targeting multiple properties for smooth hover effects
    transitionClass: "transition-all duration-300 ease-out",
  },
  relationship: {
    // Layout - same as default for relationship cards
    padding: "px-3 py-3 md:px-4 md:py-2.5",
    imageHeight: "h-[6.75rem] md:h-[7.5rem]",
    cardHeight: "h-full min-h-[5.25rem] md:min-h-[6.75rem] lg:min-h-[7.5rem]",
    
    // Typography
    titleClass: "card-title text-lg truncate text-primary font-medium",
    descriptionClass: "text-primary text-xs line-clamp-2",
    
    // Appearance - subtle differences for relationship context
    cardClass: "rounded-md shadow-md overflow-hidden",
    hoverEffect: "card-enhanced-hover",
    titleBarClass: "absolute bottom-0 left-0 right-0 bg-tertiary bg-opacity-60 backdrop-blur-sm",
    transitionClass: "transition-all duration-300 ease-out",
  }
} as const;

/**
 * Get card variant configuration
 * @param variant - The card variant to retrieve
 * @returns CardVariantConfig for the specified variant
 */
export function getCardVariant(variant: CardVariant = 'default'): CardVariantConfig {
  return CARD_VARIANTS[variant] || CARD_VARIANTS.default;
}
