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
  
  address: {
    company: 'Z-Beam LLC',
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
      default: '/images/Site/Logo/logo_.png',
      width: 200,
      height: 120
    },
    favicon: {
      ico: '/favicon.ico',
      png: '/images/Site/Favicon/favicon_350.png'
    }
  },
  
  // Email Configuration
  emailConfig: {
    fromAddress: 'Z-Beam Contact <info@z-beam.com>',
    toAddresses: ['info@z-beam.com'], // Production: use sales/support emails
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
  
  // Schema.org Configuration
  schema: {
    context: 'https://schema.org',
    organizationType: 'Organization',
    websiteType: 'WebSite',
    articleType: 'TechnicalArticle',
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
