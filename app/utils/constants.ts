// app/utils/constants.ts
// Application constants and configuration values
// 
// ⚠️ DEPRECATED: Import from @/config instead
// This file now re-exports from app/config/site.ts for backward compatibility
// New code should import from @/config or @/config/site

export {
  SITE_CONFIG,
  ANIMATION_CONFIG,
  COMPONENT_DEFAULTS,
  BREAKPOINTS
} from '../config/site';

/**
 * @deprecated Use imports from @/config instead
 * All configuration has been consolidated into app/config/site.ts
 * This file remains for backward compatibility only
 */

// Original content below (now commented out):
/*
const SITE_CONFIG_OLD = {
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
      phone: '(650) 590-5040',
      phoneHref: 'tel:+16502418510'
    },
    sales: {
      email: 'info@z-beam.com',
      phone: '(650) 590-5040',
      phoneHref: 'tel:+16502418510'
    },
    support: {
      email: 'info@z-beam.com',
      phone: '(650) 590-5040',
      phoneHref: 'tel:+16502418510',
      emergency: '24/7 for existing customers'
    }
  },
  
  // Legacy fields (for backward compatibility)
  email: 'info@z-beam.com',
  phone: '(650) 590-5040',
  
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
      baseUrl: 'https://www.youtube-nocookie.com/embed/', // Privacy-enhanced mode
      defaultParams: {
        autoplay: '1',           // Auto-play video
        mute: '1',               // Muted by default (required for autoplay)
        loop: '1',               // Loop video continuously
        controls: '0',           // Hide player controls completely
        showinfo: '0',           // Hide video title and uploader (deprecated but kept)
        rel: '0',                // Don't show related videos at end
        modestbranding: '1',     // Remove YouTube logo from control bar
        iv_load_policy: '3',     // Hide video annotations
        disablekb: '1',          // Disable keyboard controls
        fs: '0',                 // Hide fullscreen button
        playsinline: '1',        // Play inline on iOS (no fullscreen)
        cc_load_policy: '0',     // Hide closed micros by default
        color: 'white',          // Use white progress bar (less branding)
        enablejsapi: '0',        // Disable JS API (cleaner embed)
        origin: typeof window !== 'undefined' ? window.location.origin : undefined
      }
    },
    logo: {
      default: '/images/logo/logo-zbeam.png',
      width: 200,
      height: 120
    },
    favicon: {
      ico: '/favicon.ico',
      png: '/images/favicon/favicon-350.png'
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
*/

// Note: Original definitions commented out above
// All exports now come from app/config/site.ts
