// app/config/site.ts
// Unified site configuration - Single source of truth
// Consolidates: constants.ts, business-config.ts, gridConfig.ts, navigation.ts

import type { GridColumns, GridGap, GridContainer, StandardGridProps, NavItem } from '@/types';

/**
 * SITE CONFIGURATION
 * Core website information and settings
 */
export const SITE_CONFIG = {
  name: 'Z-Beam Laser Cleaning',
  shortName: 'Z-Beam',
  description: 'Professional laser cleaning services. Specializing in industrial surface preparation, rust removal, and eco-friendly cleaning solutions.',
  url: process.env.NODE_ENV === 'production' 
    ? 'https://www.z-beam.com' 
    : 'http://localhost:3000',
  author: 'Z-Beam',
  
  // Contact Information
  contact: {
    general: {
      email: 'info@z-beam.com',
      phone: '(650) 241-8510',
      phoneHref: 'tel:+16502418510'
    },
    sales: {
      email: 'info@z-beam.com',
      phone: '(650) 241-8510',
      phoneHref: 'tel:+16502418510'
    },
    support: {
      email: 'info@z-beam.com',
      phone: '(650) 241-8510',
      phoneHref: 'tel:+16502418510',
      emergency: '24/7 for existing customers'
    }
  },
  
  // Legacy fields (for backward compatibility)
  email: 'info@z-beam.com',
  phone: '(650) 241-8510',
  
  // Service Pricing (hourly rates in USD)
  pricing: {
    professionalCleaning: {
      hourlyRate: 390,
      currency: 'USD',
      label: 'Professional Laser Cleaning',
      unit: 'hour',
      description: 'On-site professional laser cleaning service with experienced technicians'
    },
    equipmentRental: {
      hourlyRate: 320,
      currency: 'USD',
      label: 'Equipment Rental',
      unit: 'hour',
      description: 'Self-service equipment rental with training and support included'
    }
  },
  
  address: {
    company: 'Z-Beam LLC',
    street: '', // Physical address private - contact for service location
    city: 'Belmont',
    state: 'CA',
    zipCode: '94002',
    country: 'United States'
  },
  
  hours: {
    weekday: 'Monday - Friday: 8:00 AM - 6:00 PM PST',
    saturday: 'Saturday: 9:00 AM - 2:00 PM PST',
    sunday: 'Sunday: Closed'
  },
  
  responseTime: {
    general: 'Within 24 hours',
    sales: 'Within 4 hours (business days)',
    support: 'Within 2 hours (business days)',
    emergency: 'Within 1 hour (24/7)'
  },
  
  social: {
    twitter: '@ZBeamLaser',
    twitterUrl: 'https://twitter.com/ZBeamLaser',
    facebook: 'facebook.com/profile.php?id=61573280533272',
    facebookUrl: 'https://facebook.com/profile.php?id=61573280533272',
    linkedin: 'linkedin.com/company/z-beam/',
    linkedinUrl: 'https://linkedin.com/company/z-beam/',
    youtube: 'youtube.com/@Z-Beam',
    youtubeUrl: 'https://youtube.com/@Z-Beam'
  },
  
  // Media Configuration
  media: {
    youtube: {
      baseUrl: 'https://www.youtube.com/embed/',
      defaultParams: {
        autoplay: '1',
        mute: '1',
        loop: '1',
        controls: '0',
        showinfo: '0',
        rel: '0',
        modestbranding: '1',
        iv_load_policy: '3',
        disablekb: '1',
        fs: '0',
        playsinline: '1'
      }
    },
    logo: {
      default: '/images/logo/avatar-600.png',
      width: 600,
      height: 600
    },
    favicon: {
      ico: '/favicon.ico',
      png: '/images/favicon/favicon-350.png'
    }
  },
  
  // Email Configuration
  emailConfig: {
    fromAddress: 'Z-Beam Contact <info@z-beam.com>',
    toAddresses: ['info@z-beam.com'],
    brandColor: '#1e40af',
    replyToMessage: 'This email was sent from the Z-Beam website contact form.'
  },
  
  // Validation Patterns
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phoneRegex: /^[\d\s\-\+\(\)]+$/
  },
  
  // User Messages
  messages: {
    contactSuccess: 'Your message has been sent successfully. We will get back to you within 24 hours.',
    contactError: 'Failed to send email. Please try again later.',
    contactValidationError: 'Please fill in all required fields correctly.',
    formMissingFields: 'Missing required fields',
    invalidEmail: 'Invalid email format',
    responseRequired: 'Please respond to this inquiry within 24 hours during business days.'
  },
  
  // Call to Action
  cta: {
    buttonText: "Let's talk"
  },
  
  // Schema.org Configuration
  schema: {
    context: 'https://schema.org',
    organizationType: 'Organization',
    websiteType: 'WebSite',
    articleType: 'Article',
    propertyValueType: 'PropertyValue'
  },
  
  keywords: [
    'laser cleaning',
    'industrial cleaning', 
    'rust removal',
    'surface preparation',
    'metal restoration',
    'paint removal',
    'coating removal',
    'corrosion treatment',
    'heritage restoration',
    'precision cleaning'
  ],
  
  // Dataset Configuration
  datasets: {
    version: '1.0',
    license: {
      type: 'CC-BY-4.0',
      name: 'Creative Commons Attribution 4.0 International',
      url: 'https://creativecommons.org/licenses/by/4.0/',
      description: 'Free to share and adapt with attribution'
    },
    publisher: {
      name: 'Z-Beam Laser Cleaning Research Lab',
      type: 'Organization',
      url: 'https://www.z-beam.com',
      email: 'info@z-beam.com',
      contactType: 'Data Support'
    },
    catalog: {
      name: 'Z-Beam Material Properties Database',
      description: 'Comprehensive laser cleaning parameters and material properties for industrial applications',
      url: 'https://www.z-beam.com/datasets'
    },
    quality: {
      verificationMethod: 'Multi-source cross-reference with industry standards',
      sources: ['ASM Handbook', 'Peer-reviewed literature', 'AI-verified research'],
      updateFrequency: 'Quarterly',
      accuracyLevel: 'High (±5%)',
      lastVerified: new Date().toISOString().split('T')[0]
    },
    attribution: {
      required: true,
      format: 'Z-Beam ({year}). {materialName} Laser Cleaning Dataset. Retrieved from {url}',
      example: 'Z-Beam (2025). Aluminum Laser Cleaning Dataset. Retrieved from https://www.z-beam.com/datasets/materials/aluminum-laser-cleaning.json'
    },
    metadata: {
      language: 'en-US',
      encoding: 'UTF-8',
      temporalCoverage: '2020/2025',
      spatialCoverage: 'Global',
      measurementTechnique: 'Laser ablation testing, material characterization, spectroscopy',
      keywords: [
        'laser cleaning',
        'material properties',
        'industrial cleaning',
        'surface preparation',
        'laser parameters',
        'material characterization',
        'thermal properties',
        'optical properties'
      ]
    },
    usageInfo: {
      allowedUses: [
        'Commercial applications',
        'Research and development',
        'Educational purposes',
        'Industrial process optimization'
      ],
      requirements: [
        'Provide attribution to Z-Beam',
        'Include link to original dataset',
        'Indicate if modifications were made'
      ],
      restrictions: [
        'Do not misrepresent the source',
        'Do not imply Z-Beam endorsement without permission'
      ]
    }
  }
} as const;

/**
 * BUSINESS CONFIGURATION
 * Detailed business information for Schema.org and about pages
 */
export const BUSINESS_CONFIG = {
  legal: {
    name: "Z-Beam",
    foundingDate: "2020",
    businessType: "LLC",
    industry: "Laser Cleaning",
    naicsCode: "561790",
    employeeCount: "2-10"
  },

  contact: {
    address: {
      street: "",
      city: "Belmont",
      state: "CA",
      zipCode: "94002",
      country: "US"
    },
    
    phone: {
      main: "+1-650-241-8510",
      sales: "+1-650-241-8510",
      support: "+1-650-241-8510"
    },
    
    email: {
      main: "info@z-beam.com",
      sales: "info@z-beam.com",
      support: "info@z-beam.com"
    },

    website: "https://www.z-beam.com"
  },

  social: {
    linkedin: "https://www.linkedin.com/company/z-beam/",
    facebook: "https://www.facebook.com/profile.php?id=61573280533272",
    twitter: "https://x.com/ZBeamLaser",
    youtube: "https://www.youtube.com/@Z-Beam",
    
    handles: {
      twitter: "ZBeamLaser",
    }
  },

  services: [
    {
      name: "Industrial Laser Cleaning",
      description: "Advanced laser cleaning technology for industrial surface preparation, rust removal, and contamination elimination",
      category: "Industrial Cleaning"
    },
    {
      name: "Metal Surface Restoration", 
      description: "Precision laser cleaning for aluminum, steel, copper, and other metals without chemical or abrasive damage",
      category: "Metal Treatment"
    },
    {
      name: "Paint and Coating Removal",
      description: "Eco-friendly laser removal of paint, coatings, and surface treatments with precision control", 
      category: "Surface Treatment"
    },
    {
      name: "Rust and Corrosion Treatment",
      description: "Complete rust removal and corrosion treatment using state-of-the-art laser technology",
      category: "Corrosion Control"
    },
    {
      name: "Heritage and Restoration Cleaning",
      description: "Delicate laser cleaning for historical monuments, sculptures, and heritage restoration projects",
      category: "Heritage Restoration"
    },
    {
      name: "Automotive and Aerospace Cleaning",
      description: "Specialized laser cleaning services for automotive parts, aerospace components, and precision machinery",
      category: "Specialized Applications"
    }
  ],

  hours: {
    monday: { open: "09:00", close: "18:00" },
    tuesday: { open: "09:00", close: "18:00" },
    wednesday: { open: "09:00", close: "18:00" },
    thursday: { open: "09:00", close: "18:00" },
    friday: { open: "09:00", close: "18:00" },
    saturday: { open: "10:00", close: "16:00" },
    sunday: { open: "closed", close: "closed" }
  },

  serviceArea: [
    {
      type: "State",
      name: "Arizona"
    },
    {
      type: "State",
      name: "California"
    },
    {
      type: "State",
      name: "Nevada"
    },
    {
      type: "State",
      name: "Oregon"
    },
    {
      type: "Place",
      name: "San Francisco Bay Area"
    },
    {
      type: "Place",
      name: "Los Angeles Metropolitan Area"
    },
    {
      type: "Place",
      name: "Phoenix Metropolitan Area"
    },
    {
      type: "Place",
      name: "Portland Metropolitan Area"
    },
    {
      type: "Place",
      name: "Las Vegas Metropolitan Area"
    },
    {
      type: "Place",
      name: "Sacramento Metropolitan Area"
    }
  ],

  operations: {
    currency: "USD",
    priceRange: "$$$",
    paymentMethods: ["Credit Card", "Bank Transfer", "Check", "Invoice"],
    languages: ["English"],
    deliveryArea: "Arizona, California, Nevada, and Oregon",
    travelRadius: 500
  },

  credentials: [
    {
      name: "Laser Safety Officer Certification",
      issuer: "Laser Institute of America",
      category: "Safety Certification"
    },
    {
      name: "Industrial Cleaning Technology Certification", 
      issuer: "Association of Industrial Metalizers, Coaters and Laminators",
      category: "Technical Certification"
    },
    {
      name: "Environmental Safety Compliance",
      issuer: "Environmental Protection Agency",
      category: "Environmental Certification"
    }
  ] as Array<{
    name: string;
    issuer: string;
    category: string;
  }>,

  awards: [
    {
      name: "Innovation in Surface Treatment Technology",
      issuer: "California Manufacturing Technology Consulting",
      year: "2024"
    },
    {
      name: "Environmental Excellence in Industrial Cleaning",
      issuer: "Bay Area Green Business Program",
      year: "2023"
    }
  ] as Array<{
    name: string;
    issuer: string;
    year: string;
  }>,

  assets: {
    logo: {
      primary: "/images/logo/avatar-600.png",
      width: 600,
      height: 600
    },
    images: {
      hero: "/images/hero-image.jpg",
      ogImage: "/images/og-image.jpg",
      twitterCard: "/images/twitter-card.jpg"
    },
    colors: {
      primary: "#1f2937",
      secondary: "#3b82f6",
      accent: "#10b981"
    }
  },

  keywords: [
    "laser cleaning",
    "industrial cleaning", 
    "rust removal",
    "surface preparation",
    "metal restoration",
    "paint removal",
    "coating removal",
    "corrosion treatment",
    "heritage restoration",
    "precision cleaning",
    "eco-friendly cleaning",
    "non-abrasive cleaning",
    "aluminum cleaning",
    "steel cleaning",
    "copper cleaning",
    "automotive cleaning",
    "aerospace cleaning",
    "laser technology",
    "surface treatment",
    "industrial services"
  ]
} as const;

/**
 * ANIMATION CONFIGURATION
 * Animation timing and easing values
 */
export const ANIMATION_CONFIG = {
  durations: {
    fast: 0.3,
    normal: 0.6,
    slow: 1.0,
  },
  delays: {
    none: 0,
    short: 0.1,
    medium: 0.2,
    long: 0.3,
  },
  easing: {
    easeOut: [0.04, 0.62, 0.23, 0.98],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
  },
} as const;

/**
 * GRID CONFIGURATION
 * Responsive grid layouts and spacing
 */
/**
 * GRID CONFIGURATION
 * Responsive grid layouts and spacing
 * Unified grid system - single source of truth for all grid layouts
 */
export const GRID_CONFIGS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

export const GRID_GAPS = {
  xs: "gap-1",
  sm: "gap-2", 
  md: "gap-2 md:gap-4 lg:gap-6",
  lg: "gap-2 md:gap-6 lg:gap-8",
  xl: "gap-2 md:gap-8 lg:gap-12"
} as const;

export const GRID_CONTAINER_CLASSES = {
  standard: "auto-rows-fr",
  flexible: "",
  stretch: "min-h-0",
} as const;

export const GRID_SECTION_SPACING = {
  betweenSections: "space-y-12",
  categoryHeader: "mb-6",
  sectionHeader: "mb-8",
  gridToHeader: "mt-6"
} as const;

export const SECTION_HEADER_CLASSES = {
  title: "text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2",
  subtitle: "text-gray-600 dark:text-gray-400 mt-2",
  container: "mb-8"
} as const;

export const CATEGORY_HEADER_CLASSES = {
  title: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2",
  subtitle: "text-gray-600 dark:text-gray-400 mt-2", 
  container: "mb-6"
} as const;

export function getGridClasses({ 
  columns = 3, 
  gap = "md", 
  container = "standard", 
  className = "" 
}: StandardGridProps = {}) {
  return `grid ${GRID_CONFIGS[columns]} ${GRID_GAPS[gap]} ${GRID_CONTAINER_CLASSES[container]} ${className}`.trim();
}

export function createSectionHeader(title: string, subtitle?: string) {
  return {
    title,
    subtitle,
    titleClass: SECTION_HEADER_CLASSES.title,
    subtitleClass: SECTION_HEADER_CLASSES.subtitle,
    containerClass: SECTION_HEADER_CLASSES.container
  };
}

export function createCategoryHeader(title: string, itemCount: number) {
  const subtitle = `${itemCount} ${itemCount === 1 ? 'article' : 'articles'}`;
  return {
    title,
    subtitle,
    titleClass: CATEGORY_HEADER_CLASSES.title,
    subtitleClass: CATEGORY_HEADER_CLASSES.subtitle, 
    containerClass: CATEGORY_HEADER_CLASSES.container
  };
}

/**
 * NAVIGATION CONFIGURATION
 * Site navigation structure
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    name: "Services",
    href: "/services",
    description: "Explore our laser cleaning services",
    dropdown: [
      {
        name: "Rental",
        href: "/rental",
        description: "Rent professional laser cleaning equipment"
      },
      {
        name: "Services",
        href: "/services",
        description: "Our laser cleaning services"
      },
    ]
  },
  {
    name: "About Us",
    href: "/about",
    description: "Learn more about Z-Beam",
    dropdown: [
      {
        name: "Partners",
        href: "/partners",
        description: "Our trusted partners"
      },
      {
        name: "About",
        href: "/about",
        description: "About Z-Beam"
      },
    ]
  },
];

/**
 * COMPONENT DEFAULTS
 * Default values for components
 */
export const COMPONENT_DEFAULTS = {
  image: {
    loadingTimeMs: 300,
    placeholder: '/images/placeholder.jpg',
  },
  pagination: {
    itemsPerPage: 12,
  },
  card: {
    imageHeight: 128,
    borderRadius: 'rounded-lg',
  },
} as const;

/**
 * BREAKPOINTS
 * Responsive design breakpoints
 */
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * SCHEMA HELPER
 * Generate Schema.org organization markup
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BUSINESS_CONFIG.contact.website}#organization`,
    "name": "Z-Beam Laser Cleaning",
    "legalName": BUSINESS_CONFIG.legal.name,
    "url": BUSINESS_CONFIG.contact.website,
    "logo": {
      "@type": "ImageObject",
      "url": BUSINESS_CONFIG.assets.logo.primary.startsWith('http') 
        ? BUSINESS_CONFIG.assets.logo.primary 
        : `${BUSINESS_CONFIG.contact.website}${BUSINESS_CONFIG.assets.logo.primary}`,
      "width": BUSINESS_CONFIG.assets.logo.width,
      "height": BUSINESS_CONFIG.assets.logo.height
    },
    "image": BUSINESS_CONFIG.assets.images.ogImage.startsWith('http')
      ? BUSINESS_CONFIG.assets.images.ogImage
      : `${BUSINESS_CONFIG.contact.website}${BUSINESS_CONFIG.assets.images.ogImage}`,
    "description": "Professional laser cleaning company specializing in industrial surface preparation, rust removal, metal restoration, and eco-friendly cleaning solutions.",
    
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_CONFIG.contact.address.street,
      "addressLocality": BUSINESS_CONFIG.contact.address.city,
      "addressRegion": BUSINESS_CONFIG.contact.address.state,
      "postalCode": BUSINESS_CONFIG.contact.address.zipCode,
      "addressCountry": BUSINESS_CONFIG.contact.address.country
    },
    
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": BUSINESS_CONFIG.contact.phone.main,
        "contactType": "customer service",
        "email": BUSINESS_CONFIG.contact.email.main,
        "availableLanguage": BUSINESS_CONFIG.operations.languages
      },
      {
        "@type": "ContactPoint",
        "telephone": BUSINESS_CONFIG.contact.phone.sales,
        "contactType": "sales", 
        "email": BUSINESS_CONFIG.contact.email.sales,
        "availableLanguage": BUSINESS_CONFIG.operations.languages
      }
    ],
    
    "sameAs": [
      BUSINESS_CONFIG.social.linkedin,
      BUSINESS_CONFIG.social.facebook,
      BUSINESS_CONFIG.social.twitter,
      BUSINESS_CONFIG.social.youtube
    ].filter(Boolean),
    
    "foundingDate": BUSINESS_CONFIG.legal.foundingDate,
    "numberOfEmployees": BUSINESS_CONFIG.legal.employeeCount,
    "naics": BUSINESS_CONFIG.legal.naicsCode,
    
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Laser Cleaning Services",
      "itemListElement": BUSINESS_CONFIG.services.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.name,
          "description": service.description
        }
      }))
    },
    
    "areaServed": BUSINESS_CONFIG.serviceArea.map(area => ({
      "@type": area.type,
      "name": area.name
    })),
    
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BUSINESS_CONFIG.contact.website}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "DownloadAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${BUSINESS_CONFIG.contact.website}/datasets`,
          "actionPlatform": [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform"
          ]
        },
        "object": {
          "@type": "DataCatalog",
          "name": "Laser Cleaning Materials Database",
          "description": "Free and open-source database of laser cleaning parameters for 132+ materials"
        }
      }
    ]
    
    // Note: hasCredential removed - it's a Person property, not valid for Organization per Schema.org
  };
}

// Default export for backward compatibility
export default {
  SITE_CONFIG,
  BUSINESS_CONFIG,
  ANIMATION_CONFIG,
  GRID_CONFIGS,
  MAIN_NAV_ITEMS,
  generateOrganizationSchema
};
