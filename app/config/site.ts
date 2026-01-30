// app/config/site.ts
// Unified site configuration - Single source of truth
// Consolidates: constants.ts, business-config.ts, gridConfig.ts, navigation.ts

import type { StandardGridProps, NavItem } from '@/types';

/**
 * SITE CONFIGURATION
 * Core website information and settings
 */
export const SITE_CONFIG = {
  name: 'Z-Beam Laser Cleaning',
  shortName: 'Z-Beam',
  description: 'Industrial laser cleaning equipment rental with training and support. Self-service laser systems for rust removal, surface prep, and coating removal. Hourly and project-based rental options.',
  url: process.env.NODE_ENV === 'production' 
    ? 'https://www.z-beam.com' 
    : 'http://localhost:3000',
  author: 'Z-Beam',
  
  // Contact Information
  contact: {
    general: {
      email: 'info@z-beam.com',
      phone: '(650) 590-5040',
      phoneHref: 'tel:+16505905040'
    },
    sales: {
      email: 'info@z-beam.com',
      phone: '(650) 590-5040',
      phoneHref: 'tel:+16505905040'
    },
    support: {
      email: 'info@z-beam.com',
      phone: '(650) 590-5040',
      phoneHref: 'tel:+16505905040',
      emergency: '24/7 for existing customers'
    }
  },
  
  // Legacy fields (for backward compatibility)
  email: 'info@z-beam.com',
  phone: '(650) 590-5040',
  
  // Service Pricing (hourly rates in USD)
  pricing: {
    equipmentRental: {
      hourlyRate: {
        min: 325,
        max: 475,
        standard: 390  // Most common rate
      },
      currency: 'USD',
      label: 'Equipment Rental',
      unit: 'hour',
      minimumHours: 2,
      description: 'Professional laser cleaning equipment delivered to your location with training and support included. Rates vary by location and equipment type. 2-hour minimum.',
      sku: 'ZB-EQUIP-RENT',
      rateFactors: [
        'Equipment type and power',
        'Delivery distance',
        'Duration of rental',
        'Weekend vs weekday'
      ]
    }
  },
  
  address: {
    company: 'Z-Beam LLC',
    street: '', // Physical address private - contact for service location
    city: 'Belmont',
    state: 'CA',
    zipCode: '94002',
    country: 'United States',
    geo: {
      latitude: 37.5202,
      longitude: -122.2758
    }
  },
  
  hours: {
    weekday: 'Monday - Friday: 9:00 AM - 5:00 PM PST',
    saturday: 'Saturday: Closed',
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
      example: 'Z-Beam (2025). Aluminum Laser Cleaning Dataset. Retrieved from https://www.z-beam.com/datasets/materials/aluminum-material-dataset.json'
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
  },
  
  // Image License Configuration for Schema.org ImageObject
  // @see https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
  imageLicense: {
    // Creative Commons license URL
    license: 'https://creativecommons.org/licenses/by/4.0/',
    // Page where users can acquire/request license
    acquireLicensePage: 'https://www.z-beam.com/contact',
    // Default copyright notice
    copyrightNotice: `© ${new Date().getFullYear()} Z-Beam Laser Cleaning. All rights reserved.`,
    // Default credit text (used when not specified per-image)
    creditText: 'Z-Beam Laser Cleaning'
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

  social: {
    linkedin: "https://www.linkedin.com/company/z-beam/",
    facebook: "https://www.facebook.com/profile.php?id=61573280533272",
    twitter: "https://x.com/ZBeamLaser",
    youtube: "https://www.youtube.com/@Z-Beam",
    yelp: "https://www.yelp.com/biz/z-beam-belmont",
    
    handles: {
      twitter: "ZBeamLaser",
    }
  },

  services: [
    {
      name: "Laser Cleaning Equipment Rental",
      description: "Self-service industrial laser cleaning equipment with comprehensive training, technical support, and safety guidance",
      category: "Equipment Rental"
    },
    {
      name: "Hourly Equipment Rental",
      description: "Flexible hourly rental of professional laser cleaning systems for short-term projects and testing",
      category: "Short-Term Rental"
    },
    {
      name: "Daily and Weekly Equipment Rental",
      description: "Extended rental options for larger projects with discounted daily and weekly rates",
      category: "Extended Rental"
    },
    {
      name: "On-Site Training and Setup",
      description: "Comprehensive equipment training, safety protocols, and operational guidance included with all rentals",
      category: "Training Services"
    },
    {
      name: "Technical Support and Consultation",
      description: "Remote and on-site technical support during rental period to ensure optimal results",
      category: "Support Services"
    },
    {
      name: "Equipment Delivery and Pickup",
      description: "Full-service delivery, setup, and pickup of laser cleaning equipment across California and Western states",
      category: "Logistics"
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
    travelRadius: 500,
    
    // Google Business Profile attributes
    businessAttributes: {
      accessibility: {
        wheelchairAccessible: false, // Service area business - equipment accessible
        parkingAvailable: false, // Service delivery model
        publicTransportNearby: false // Service delivery model
      },
      amenities: {
        wifiAvailable: false, // Service delivery model
        creditCardsAccepted: true,
        freeCancellation: false, // Equipment rental has cancellation terms
        onlineBooking: true,
        emergencyService: true, // 24/7 for existing customers
        freeQuotes: true,
        deliveryAvailable: true,
        pickupAvailable: true,
        mobileService: true
      },
      serviceType: {
        appointmentRequired: true,
        onlineEstimates: true,
        phoneEstimates: true,
        websiteEstimates: true,
        serviceAtYourLocation: true, // Primary service model
        pickupDelivery: true,
        consultationRequired: true
      },
      safety: {
        requiresMask: false, // Outdoor industrial work
        temperatureCheck: false,
        staffFullyVaccinated: true,
        sanitizingBetweenCustomers: true // Equipment sanitized
      }
    },
    
    // Primary Google Business category
    googleBusinessCategory: "Industrial Equipment Supplier",
    
    // Additional Google Business categories
    googleAdditionalCategories: [
      "Equipment Rental Service",
      "Industrial Cleaning Service", 
      "Safety Equipment Supplier",
      "Technical Consulting Service"
    ]
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
    
    // Google Business Profile photos
    businessPhotos: {
      logo: "/images/logo/avatar-600.png",
      cover: "/images/hero-image.jpg",
      interior: [], // Service business - no interior photos needed
      exterior: [], // Service area business
      atWork: [
        // Add photos of equipment in action
        // Add before/after project photos  
        // Add team training photos
      ],
      team: [
        // Add team member photos if desired
      ],
      products: [
        // Add laser cleaning equipment photos
        // Add result examples
      ]
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
    "precision cleaning"
  ],
  
  // Google Business Profile posts and updates
  googleBusinessPosts: {
    postTypes: ["What's New", "Events", "Offers", "Products"],
    suggestedPosts: [
      {
        type: "What's New",
        title: "New Laser Cleaning Equipment Available",
        description: "Latest generation equipment with improved safety features and efficiency"
      },
      {
        type: "Products", 
        title: "Rust Removal Services",
        description: "Professional rust removal for industrial equipment and heritage restoration"
      },
      {
        type: "Offers",
        title: "Free Equipment Delivery & Pickup", 
        description: "Mobile delivery and pickup service included. Call or visit website for estimates"
      }
    ],
    updateFrequency: "Weekly",
    contentFocus: ["Mobile delivery service", "Equipment updates", "Free estimates", "Industrial applications", "Safety training"]
  }
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
 * Unified grid system - single source of truth for all grid layouts
 * 
 * Progressive column increase starting at 2 (MAX 4 COLUMNS):
 * - XS (mobile): 2 columns
 * - SM (640px+): 3 columns  
 * - MD (768px+): 4 columns (maximum)
 */
export const GRID_CONFIGS = {
  1: "grid-cols-1",
  2: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  3: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
} as const;

// Centralized grid gap configuration - single responsive pattern for all grid types
export const GRID_GAP_RESPONSIVE = "gap-2 sm:gap-3 md:gap-4 lg:gap-6";

export const GRID_GAPS = {
  xs: "gap-1",
  sm: "gap-2", 
  md: GRID_GAP_RESPONSIVE,
  lg: GRID_GAP_RESPONSIVE,
  xl: GRID_GAP_RESPONSIVE
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
  title: "text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100",
  subtitle: "text-gray-600 dark:text-gray-400 mt-2",
  container: "mb-8"
} as const;

export const CATEGORY_HEADER_CLASSES = {
  title: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2",
  subtitle: "text-gray-600 dark:text-gray-400 mt-2", 
  container: "mb-6"
} as const;

// Centralized card header styling (matches Material Cards)
export const CARD_HEADER_CLASSES = {
  title: "card-title text-lg truncate text-primary font-medium"
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
    name: "Rentals",
    href: "/rental",
    description: "Rent professional laser cleaning equipment"
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
        name: "Contact Us",
        href: "/contact",
        description: "Get in touch with our team"
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
    borderRadius: 'rounded-md',
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
    "@type": "LocalBusiness",
    "@id": `${SITE_CONFIG.url}#organization`,
    "name": SITE_CONFIG.name,
    "legalName": BUSINESS_CONFIG.legal.name,
    "url": SITE_CONFIG.url,
    "logo": {
      "@type": "ImageObject",
      "url": BUSINESS_CONFIG.assets.logo.primary.startsWith('http') 
        ? BUSINESS_CONFIG.assets.logo.primary 
        : `${SITE_CONFIG.url}${BUSINESS_CONFIG.assets.logo.primary}`,
      "width": BUSINESS_CONFIG.assets.logo.width,
      "height": BUSINESS_CONFIG.assets.logo.height,
      "creator": SITE_CONFIG.shortName,
      "description": `${SITE_CONFIG.shortName} company logo`,
      "encodingFormat": "image/png"
    },
    "image": BUSINESS_CONFIG.assets.images.ogImage.startsWith('http')
      ? BUSINESS_CONFIG.assets.images.ogImage
      : `${SITE_CONFIG.url}${BUSINESS_CONFIG.assets.images.ogImage}`,
    "description": SITE_CONFIG.description,
    
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SITE_CONFIG.address.street,
      "addressLocality": SITE_CONFIG.address.city,
      "addressRegion": SITE_CONFIG.address.state,
      "postalCode": SITE_CONFIG.address.zipCode,
      "addressCountry": SITE_CONFIG.address.country
    },
    
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": SITE_CONFIG.address.geo.latitude,
      "longitude": SITE_CONFIG.address.geo.longitude
    },
    
    "email": "info@z-beam.com",
    
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": SITE_CONFIG.contact.general.phoneHref,
        "contactType": "customer service",
        "email": SITE_CONFIG.contact.general.email,
        "availableLanguage": BUSINESS_CONFIG.operations.languages
      },
      {
        "@type": "ContactPoint",
        "telephone": SITE_CONFIG.contact.sales.phoneHref,
        "contactType": "sales", 
        "email": SITE_CONFIG.contact.sales.email,
        "availableLanguage": BUSINESS_CONFIG.operations.languages
      }
    ],
    
    "sameAs": [
      BUSINESS_CONFIG.social.linkedin,
      BUSINESS_CONFIG.social.facebook,
      BUSINESS_CONFIG.social.twitter,
      BUSINESS_CONFIG.social.youtube,
      BUSINESS_CONFIG.social.yelp
    ].filter(Boolean),
    
    "foundingDate": BUSINESS_CONFIG.legal.foundingDate,
    "numberOfEmployees": BUSINESS_CONFIG.legal.employeeCount,
    "naics": BUSINESS_CONFIG.legal.naicsCode,
    
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Laser Cleaning Equipment Rental",
      "itemListElement": BUSINESS_CONFIG.services.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.name,
          "description": service.description
        },
        "price": String(SITE_CONFIG.pricing.equipmentRental.hourlyRate),
        "priceCurrency": SITE_CONFIG.pricing.equipmentRental.currency,
        "image": `${SITE_CONFIG.url}/images/services/${service.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": String(SITE_CONFIG.pricing.equipmentRental.hourlyRate),
          "priceCurrency": SITE_CONFIG.pricing.equipmentRental.currency,
          "unitCode": "HUR"
        },
        "availability": "https://schema.org/InStock",
        "url": `${SITE_CONFIG.url}/rental`,
        "category": "Equipment Rental Service"
      }))
    },
    
    "areaServed": BUSINESS_CONFIG.serviceArea.map(area => ({
      "@type": area.type,
      "name": area.name
    })),
    
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": BUSINESS_CONFIG.hours.monday.open,
        "closes": BUSINESS_CONFIG.hours.monday.close
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": BUSINESS_CONFIG.hours.saturday.open,
        "closes": BUSINESS_CONFIG.hours.saturday.close
      }
    ],
    
    "priceRange": BUSINESS_CONFIG.operations.priceRange,
    "currenciesAccepted": BUSINESS_CONFIG.operations.currency,
    "paymentAccepted": BUSINESS_CONFIG.operations.paymentMethods.join(", "),
    
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_CONFIG.url}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "DownloadAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_CONFIG.url}/datasets`,
          "actionPlatform": [
            "https://schema.org/DesktopWebPlatform",
            "https://schema.org/MobileWebPlatform"
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
