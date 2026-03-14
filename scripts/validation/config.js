/**
 * Validation Configuration
 * Central configuration for all validation thresholds and rules
 */

module.exports = {
  // Content validation settings
  content: {
    maxFrontmatterWarnings: 150,
    maxNamingWarnings: 135,
    maxMissingImages: 5,
    requireGenerationDate: false, // Phase in gradually
    
    requiredFields: [
      'name',
      'category',
      'subcategory',
      'title',
      'description',
      'author',
      'images'
    ],
    
    imageFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    
    namingConventions: {
      frontmatter: /^[a-z0-9-]+\.yaml$/,
      images: /^[a-z0-9-]+(-(hero|micro|thumb))?\.(jpg|jpeg|png|webp)$/,
      slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/
    }
  },
  
  // Performance thresholds
  performance: {
    maxBuildSizeMB: 500,
    maxBundleSizeMB: 5,
    maxServerlessFunctionSizeMB: 50,
    maxTimeoutSeconds: 30,
    
    coreWebVitals: {
      LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
      FID: { good: 100, needsImprovement: 300 },   // First Input Delay
      CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
      FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
      TTFB: { good: 800, needsImprovement: 1800 }  // Time to First Byte
    }
  },
  
  // Accessibility settings
  accessibility: {
    wcagLevel: 'AA',
    wcagVersion: '2.2',
    
    requiredAriaRoles: [
      'navigation',
      'main',
      'complementary',
      'contentinfo',
      'banner'
    ],
    
    contrastRatio: {
      normal: 4.5,
      large: 3,
      largeTextSize: 18
    },
    
    allowedContrastExceptions: [
      // Components with decorative text that don't convey meaning
    ],
    
    requiredAttributes: {
      img: ['alt'],
      a: ['aria-label or text content'],
      button: ['aria-label or text content']
    }
  },
  
  // SEO validation
  seo: {
    title: {
      minLength: 30,
      maxLength: 60,
      required: true
    },
    
    description: {
      minLength: 120,
      maxLength: 160,
      required: true
    },
    
    canonicalUrl: {
      required: true,
      mustMatch: true
    },
    
    openGraph: {
      required: ['og:title', 'og:description', 'og:image', 'og:url'],
      imageMinWidth: 1200,
      imageMinHeight: 630
    },
    
    twitter: {
      required: ['twitter:card', 'twitter:title', 'twitter:description'],
      cardTypes: ['summary', 'summary_large_image']
    },
    
    structuredData: {
      required: true,
      validateSchema: true
    }
  },
  
  // JSON-LD schema validation
  jsonld: {
    requiredTypes: [
      'WebSite',
      'Organization',
      'BreadcrumbList'
    ],
    
    optionalTypes: [
      'Article',
      'Product',
      'Service',
      'FAQPage',
      'HowTo'
    ],
    
    validateReferences: true,
    checkSchemaOrg: true,
    allowDeprecated: false,
    
    requiredProperties: {
      WebSite: ['@type', '@id', 'name', 'url'],
      Organization: ['@type', '@id', 'name', 'url', 'logo'],
      BreadcrumbList: ['@type', 'itemListElement']
    }
  },
  
  // Build validation
  build: {
    requiredArtifacts: [
      '.next/BUILD_ID',
      '.next/server',
      '.next/static'
    ],
    
    requiredRoutes: [
      '/',
      '/about',
      '/contact',
      '/services',
      '/materials'
    ],
    
    datasetRequirements: {
      materials: { minCount: 100 },
      settings: { minCount: 50 }
    }
  },
  
  // Environment-specific settings
  environments: {
    // Scripts that require a running dev server (skip in CI)
    requiresServer: [
      'validate:a11y-tree',
      'validate:core-web-vitals',
      'validate:jsonld-rendering',
      'validate:modern-seo',
      'validate:schema-richness'
    ],
    
    // Scripts that require production build (skip in dev)
    requiresBuild: [
      'validate:urls',
      'validate:bundle-size'
    ],
    
    // Scripts that should only run locally (not in CI)
    localOnly: [
      'validate:lighthouse'
    ],
    
    // Scripts that can run in CI
    ciSafe: [
      'validate:frontmatter',
      'validate:naming',
      'validate:metadata',
      'validate:breadcrumbs',
      'verify:sitemap',
      'type-check',
      'lint',
      'test:unit',
      'test:components'
    ]
  },
  
  // Cache settings
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour
    directory: '.validation-cache',
    types: [
      'frontmatter',
      'naming',
      'metadata',
      'jsonld',
      'images'
    ]
  },
  
  // Parallel execution settings
  parallel: {
    enabled: true,
    maxConcurrent: 5,
    timeout: 120000 // 2 minutes per validation
  }
};
