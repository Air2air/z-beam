// Z-Beam Business Configuration
// 
// ⚠️ DEPRECATED: Import from @/config instead
// This file now re-exports from app/config/site.ts for backward compatibility
// New code should import from @/config or @/config/site
//
// Migration Guide:
// OLD: import { BUSINESS_CONFIG } from '@/utils/business-config'
// NEW: import { BUSINESS_CONFIG } from '@/config'

export { BUSINESS_CONFIG, generateOrganizationSchema } from '../config/site';

/**
 * @deprecated Use imports from @/config instead
 * All configuration has been consolidated into app/config/site.ts
 */

// Original content below (commented out for reference):
/*
const BUSINESS_CONFIG_OLD = {
  // === BASIC BUSINESS INFORMATION ===
  legal: {
    name: "Z-Beam", // UPDATE: Your legal business name
    foundingDate: "2020", // UPDATE: Year your business was founded
    businessType: "LLC", // UPDATE: Corporation, LLC, Partnership, etc.
    industry: "Laser Cleaning",
    naicsCode: "561790", // NAICS code for Other Services to Buildings and Dwellings
    employeeCount: "2-10" // UPDATE: Your team size range
  },

  // === CONTACT INFORMATION ===
  contact: {
    // Business address - street private for security
    address: {
      street: "", // Physical address private - contact for service location
      city: "Belmont", // UPDATE: Your city
      state: "CA", // UPDATE: Your state/region
      zipCode: "94002", // UPDATE: Your postal code
      country: "US"
    },
    
    // UPDATE: Your contact details
    phone: {
      main: "+1-650-590-5040", // UPDATE: Your main phone number
      sales: "+1-650-590-5040", // UPDATE: Your sales phone number
      support: "+1-650-590-5040" // UPDATE: Your support phone number
    },
    
    email: {
      main: "info@z-beam.com", // UPDATE: Your main email
      sales: "info@z-beam.com", // UPDATE: Your sales email
      support: "info@z-beam.com" // UPDATE: Your support email
    },

    website: "https://z-beam.com" // UPDATE: Your website URL
  },

  // === SOCIAL MEDIA PROFILES ===
  social: {
    linkedin: "https://www.linkedin.com/company/z-beam/", // UPDATE: Your LinkedIn
    facebook: "https://www.facebook.com/profile.php?id=61573280533272", // UPDATE: Your Facebook
    twitter: "https://x.com/ZBeamLaser", // X.com (formerly Twitter)
    youtube: "https://www.youtube.com/@Z-Beam", // UPDATE: Your YouTube
    
    // Social media handles (without @)
    handles: {
      twitter: "ZBeamLaser", // X/Twitter handle
    }
  },

  // === SERVICES OFFERED ===
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

  // === BUSINESS HOURS ===
  hours: {
    monday: { open: "09:00", close: "18:00" },
    tuesday: { open: "09:00", close: "18:00" },
    wednesday: { open: "09:00", close: "18:00" },
    thursday: { open: "09:00", close: "18:00" },
    friday: { open: "09:00", close: "18:00" },
    saturday: { open: "10:00", close: "16:00" }, // UPDATE: Your weekend hours
    sunday: { open: "closed", close: "closed" } // UPDATE: Sunday hours
  },

  // === SERVICE AREA ===
  serviceArea: [
    {
      type: "State",
      name: "Arizona", // Expanded service area
      coverage: "Statewide",
      radius: 500, // miles from Phoenix
      priority: "secondary"
    },
    {
      type: "State",
      name: "California", // Primary service area
      coverage: "Statewide", 
      radius: 500, // miles from Bay Area
      priority: "primary"
    },
    {
      type: "State",
      name: "Nevada", // Expanded service area
      coverage: "Statewide",
      radius: 500, // miles from Las Vegas
      priority: "secondary"
    },
    {
      type: "State",
      name: "Oregon", // Expanded service area
      coverage: "Statewide",
      radius: 500, // miles from Portland
      priority: "secondary"
    },
    {
      type: "Place",
      name: "San Francisco Bay Area", // Primary metro area
      coverage: "Metro + 100 mile radius",
      cities: ["San Francisco", "Oakland", "San Jose", "Fremont", "Hayward", "Sunnyvale"],
      responseTime: "Same day available",
      priority: "primary"
    },
    {
      type: "Place", 
      name: "Los Angeles Metropolitan Area", // Major CA metro
      coverage: "Metro + 100 mile radius",
      cities: ["Los Angeles", "Long Beach", "Anaheim", "Santa Ana", "Riverside", "San Bernardino"],
      responseTime: "1-2 days",
      priority: "primary"
    },
    {
      type: "Place",
      name: "Phoenix Metropolitan Area", // Arizona metro
      coverage: "Metro + 150 mile radius", 
      cities: ["Phoenix", "Mesa", "Chandler", "Scottsdale", "Glendale", "Tempe"],
      responseTime: "2-3 days",
      priority: "secondary"
    },
    {
      type: "Place",
      name: "Portland Metropolitan Area", // Oregon metro
      coverage: "Metro + 150 mile radius",
      cities: ["Portland", "Gresham", "Hillsboro", "Beaverton", "Bend"],
      responseTime: "2-3 days", 
      priority: "secondary"
    },
    {
      type: "Place",
      name: "Las Vegas Metropolitan Area", // Nevada metro
      coverage: "Metro + 150 mile radius",
      cities: ["Las Vegas", "Henderson", "North Las Vegas", "Reno"],
      responseTime: "2-3 days",
      priority: "secondary"
    },
    {
      type: "Place",
      name: "Sacramento Metropolitan Area", // Northern CA metro
      coverage: "Metro + 100 mile radius",
      cities: ["Sacramento", "Elk Grove", "Roseville", "Folsom", "Davis"],
      responseTime: "1-2 days",
      priority: "primary"
    }
  ],

  // === BUSINESS OPERATIONS ===
  operations: {
    currency: "USD",
    priceRange: "$$$", // $, $$, $$$, $$$$
    paymentMethods: ["Credit Card", "Bank Transfer", "Check", "Invoice"],
    languages: ["English"], // UPDATE: Languages you serve
    deliveryArea: "Arizona, California, Nevada, and Oregon", // Updated delivery/service area
    
    // Travel radius for services (in miles)
    travelRadius: 500, // Updated: Expanded travel radius for multi-state coverage
    
    // Service availability by region
    serviceAvailability: {
      primary: "Same day to 2 days", // CA metro areas
      secondary: "2-3 days", // Other states
      remote: "3-5 days" // Edge of 500-mile radius
    },
    
    // Emergency/priority service
    emergencyService: {
      available: true,
      areas: ["San Francisco Bay Area", "Los Angeles Metropolitan Area"],
      responseTime: "4-6 hours",
      surcharge: "50% additional"
    }
  },

  // === PROFESSIONAL CREDENTIALS ===
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

  // === AWARDS & RECOGNITION ===
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

  // === BRAND ASSETS ===
  assets: {
    logo: {
      primary: "https://z-beam.com/images/logo-zbeam.png", // Company brand logo
      width: 400,
      height: 100
    },
    images: {
      hero: "/images/hero-image.jpg", // UPDATE: Your hero image
      ogImage: "/images/og-image.jpg", // UPDATE: Your Open Graph image
      twitterCard: "/images/twitter-card.jpg" // UPDATE: Your Twitter card image
    },
    colors: {
      primary: "#1f2937", // UPDATE: Your primary brand color
      secondary: "#3b82f6", // UPDATE: Your secondary brand color
      accent: "#10b981" // UPDATE: Your accent color
    }
  },

  // === SEO KEYWORDS ===
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
};

// Helper function to generate organization schema
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
    ].filter(Boolean), // Remove empty values
    
    "foundingDate": BUSINESS_CONFIG.legal.foundingDate,
    "numberOfEmployees": BUSINESS_CONFIG.legal.employeeCount,
    "industry": BUSINESS_CONFIG.legal.industry,
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
        },
        "price": "0",
        "priceCurrency": "USD",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "0",
          "priceCurrency": "USD",
          "valueAddedTaxIncluded": false
        },
        "availability": "https://schema.org/InStock",
        "url": BUSINESS_CONFIG.url + "/services"
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
      }
    ],
    
    "currenciesAccepted": BUSINESS_CONFIG.operations.currency,
    "paymentAccepted": BUSINESS_CONFIG.operations.paymentMethods,
    "priceRange": BUSINESS_CONFIG.operations.priceRange,
    
    ...(BUSINESS_CONFIG.credentials.length > 0 && {
      "hasCredential": BUSINESS_CONFIG.credentials.map(cred => ({
        "@type": "EducationalOccupationalCredential",
        "name": cred.name,
        "credentialCategory": cred.category
      }))
    })
  };
}
*/

// All exports now come from app/config/site.ts
