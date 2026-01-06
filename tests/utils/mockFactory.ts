/**
 * Centralized Test Mock Factory
 * Provides consistent mock objects for testing
 * 
 * Usage:
 * import { createMockMaterial, createMockSettings } from '@/tests/utils/mockFactory';
 * 
 * const material = createMockMaterial({ name: 'Custom Material' });
 */

import type { Material, Settings, Contaminant, Author } from '@/types';

// ============================================
// AUTHOR MOCKS
// ============================================

export function createMockAuthor(overrides?: Partial<Author>): Author {
  return {
    id: 1,
    name: 'Test Author',
    country: 'US',
    country_display: 'United States',
    title: 'PhD',
    sex: 'm',
    jobTitle: 'Senior Engineer',
    expertise: ['Laser Cleaning', 'Material Science'],
    affiliation: {
      name: 'Z-Beam Technologies',
      type: 'Organization'
    },
    credentials: ['PhD in Materials Engineering'],
    email: 'test@z-beam.com',
    image: '/images/author/test-author.webp',
    imageAlt: 'Test Author photo',
    url: '/about/test-author',
    sameAs: [],
    ...overrides
  };
}

// ============================================
// MATERIAL MOCKS
// ============================================

export function createMockMaterial(overrides?: Partial<Material>): Material {
  return {
    id: 'test-material',
    name: 'Test Material',
    category: 'Metal',
    subcategory: 'Alloy',
    slug: 'test-material',
    content_type: 'materials',
    schema_version: '5.0.0',
    fullPath: '/materials/metal/alloy/test-material',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Materials', href: '/materials' },
      { label: 'Test Material', href: '/materials/metal/alloy/test-material' }
    ],
    author: createMockAuthor(),
    datePublished: '2025-01-01T00:00:00Z',
    dateModified: '2025-12-20T00:00:00Z',
    title: 'Test Material Laser Cleaning',
    description: 'Test material description for testing purposes',
    micro: 'Short test description',
    subtitle: 'Test subtitle',
    images: {
      hero: {
        url: '/images/materials/test-material-hero.webp',
        alt: 'Test Material Hero Image',
        width: 1200,
        height: 630
      },
      micro: {
        url: '/images/materials/test-material-micro.webp',
        alt: 'Test Material Micro Image',
        width: 400,
        height: 300
      }
    },
    properties: {
      thermal: {
        melting_point: { value: 1000, unit: '°C', min: 950, max: 1050 },
        thermal_conductivity: { value: 200, unit: 'W/(m·K)' }
      },
      mechanical: {
        hardness: { value: 150, unit: 'HB' },
        tensile_strength: { value: 500, unit: 'MPa' }
      },
      optical: {
        reflectivity: { value: 85, unit: '%', min: 80, max: 90 }
      }
    },
    ...overrides
  };
}

// ============================================
// SETTINGS MOCKS
// ============================================

export function createMockSettings(overrides?: Partial<Settings>): Settings {
  return {
    id: 'test-settings',
    name: 'Test Material Settings',
    category: 'Metal',
    subcategory: 'Alloy',
    slug: 'test-material-settings',
    content_type: 'settings',
    schema_version: '5.0.0',
    fullPath: '/settings/metal/alloy/test-material',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' },
      { label: 'Test Settings', href: '/settings/metal/alloy/test-material' }
    ],
    author: createMockAuthor(),
    datePublished: '2025-01-01T00:00:00Z',
    dateModified: '2025-12-20T00:00:00Z',
    machine_settings: {
      powerRange: {
        description: 'Laser power output',
        unit: 'W',
        value: 100,
        min: 50,
        max: 150
      },
      wavelength: {
        description: 'Laser wavelength',
        unit: 'nm',
        value: 1064
      },
      spotSize: {
        description: 'Laser spot diameter',
        unit: 'mm',
        value: 10,
        min: 5,
        max: 15
      },
      repetitionRate: {
        description: 'Pulse frequency',
        unit: 'kHz',
        value: 50,
        min: 20,
        max: 100
      },
      energyDensity: {
        description: 'Energy per unit area',
        unit: 'J/cm²',
        value: 2.5,
        min: 1.0,
        max: 5.0
      },
      pulseWidth: {
        description: 'Pulse duration',
        unit: 'ns',
        value: 100
      },
      scanSpeed: {
        description: 'Beam movement speed',
        unit: 'mm/s',
        value: 1000,
        min: 500,
        max: 2000
      },
      passCount: {
        description: 'Number of cleaning passes',
        unit: 'passes',
        value: 3,
        min: 1,
        max: 5
      }
    },
    ...overrides
  };
}

// ============================================
// CONTAMINANT MOCKS
// ============================================

export function createMockContaminant(overrides?: Partial<Contaminant>): Contaminant {
  return {
    id: 'test-contaminant',
    name: 'Test Contaminant',
    category: 'Chemical',
    subcategory: 'Organic',
    slug: 'test-contaminant',
    content_type: 'contaminants',
    schema_version: '5.0.0',
    fullPath: '/contaminants/chemical/organic/test-contaminant',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Contaminants', href: '/contaminants' },
      { label: 'Test Contaminant', href: '/contaminants/chemical/organic/test-contaminant' }
    ],
    author: createMockAuthor(),
    datePublished: '2025-01-01T00:00:00Z',
    dateModified: '2025-12-20T00:00:00Z',
    title: 'Test Contaminant Removal',
    description: 'Test contaminant description for testing purposes',
    micro: 'Short contaminant description',
    ...overrides
  };
}

// ============================================
// FRONTMATTER MOCKS
// ============================================

export function createMockFrontmatter(overrides?: Partial<any>): any {
  return {
    id: 'test-item',
    name: 'Test Item',
    title: 'Test Title',
    description: 'Test description',
    author: createMockAuthor(),
    datePublished: '2025-01-01T00:00:00Z',
    dateModified: '2025-12-20T00:00:00Z',
    images: {
      hero: {
        url: '/images/test-hero.webp',
        alt: 'Test Hero Image'
      },
      micro: {
        url: '/images/test-micro.webp',
        alt: 'Test Micro Image'
      }
    },
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Test', href: '/test' }
    ],
    ...overrides
  };
}

// ============================================
// METADATA MOCKS
// ============================================

export function createMockMetadata(overrides?: Partial<any>): any {
  return {
    title: 'Test Page Title | Z-Beam',
    description: 'Test page description',
    canonical: 'https://z-beam.com/test',
    openGraph: {
      title: 'Test Page Title',
      description: 'Test page description',
      url: 'https://z-beam.com/test',
      type: 'website',
      images: [{
        url: '/images/test-og.webp',
        width: 1200,
        height: 630,
        alt: 'Test OG Image'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Test Page Title',
      description: 'Test page description',
      images: ['/images/test-twitter.webp']
    },
    ...overrides
  };
}

// ============================================
// SCHEMA MOCKS
// ============================================

export function createMockSchemaContext(overrides?: Partial<any>): any {
  return {
    baseUrl: 'https://z-beam.com',
    pageUrl: 'https://z-beam.com/test',
    currentDate: '2025-12-20',
    slug: 'test',
    ...overrides
  };
}

export function createMockWebPageSchema(overrides?: Partial<any>): any {
  return {
    '@type': 'WebPage',
    '@id': 'https://z-beam.com/test',
    url: 'https://z-beam.com/test',
    name: 'Test Page',
    description: 'Test page description',
    datePublished: '2025-01-01T00:00:00Z',
    dateModified: '2025-12-20T00:00:00Z',
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://z-beam.com#website'
    },
    ...overrides
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create array of mock materials
 */
export function createMockMaterialArray(count: number, baseOverrides?: Partial<Material>): Material[] {
  return Array.from({ length: count }, (_, i) => 
    createMockMaterial({ 
      id: `test-material-${i + 1}`,
      name: `Test Material ${i + 1}`,
      ...baseOverrides 
    })
  );
}

/**
 * Create array of mock settings
 */
export function createMockSettingsArray(count: number, baseOverrides?: Partial<Settings>): Settings[] {
  return Array.from({ length: count }, (_, i) => 
    createMockSettings({ 
      id: `test-settings-${i + 1}`,
      name: `Test Settings ${i + 1}`,
      ...baseOverrides 
    })
  );
}

/**
 * Create array of mock contaminants
 */
export function createMockContaminantArray(count: number, baseOverrides?: Partial<Contaminant>): Contaminant[] {
  return Array.from({ length: count }, (_, i) => 
    createMockContaminant({ 
      id: `test-contaminant-${i + 1}`,
      name: `Test Contaminant ${i + 1}`,
      ...baseOverrides 
    })
  );
}
