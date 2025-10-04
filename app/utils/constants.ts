// app/utils/constants.ts
// Application constants and configuration values

export const SITE_CONFIG = {
  name: 'Z-Beam Laser Cleaning',
  shortName: 'Z-Beam',
  description: 'Professional laser cleaning services. Specializing in industrial surface preparation, rust removal, and eco-friendly cleaning solutions.',
  url: process.env.NODE_ENV === 'production' 
    ? 'https://z-beam.com' 
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
      email: 'sales@z-beam.com',
      phone: '(650) 241-8511',
      phoneHref: 'tel:+16502418511'
    },
    support: {
      email: 'support@z-beam.com',
      phone: '(650) 241-8512',
      phoneHref: 'tel:+16502418512',
      emergency: '24/7 for existing customers'
    }
  },
  
  // Legacy fields (for backward compatibility)
  email: 'info@z-beam.com',
  phone: '(650) 241-8510',
  
  address: {
    company: 'Z-Beam Technologies',
    street: '1002 Misty Lane',
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
    facebook: 'facebook.com/profile.php?id=61573280533272',
    linkedin: 'linkedin.com/company/z-beam/',
    youtube: 'youtube.com/@Z-Beam'
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
  ]
} as const;

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

export const COMPONENT_DEFAULTS = {
  image: {
    loadingTimeMs: 300,
    placeholder: '/images/placeholder.jpg',
  },
  pagination: {
    itemsPerPage: 12,
  },
  card: {
    imageHeight: 128, // h-32 in Tailwind
    borderRadius: 'rounded-lg',
  },
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
