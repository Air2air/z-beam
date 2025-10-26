/**
 * @module regulatoryStandardsNormalizer
 * @purpose Automatically resolves "Unknown" regulatory standard names by extracting
 *          organization abbreviations from descriptions
 * @dependencies None (pure function)
 * @usage Import normalizeRegulatoryStandards and apply to frontmatter.regulatoryStandards
 */

export interface RegulatoryStandard {
  name: string;
  description: string;
  url: string;
  image: string;
}

interface OrgMapping {
  name: string;
  imagePattern: string;
  patterns: string[];
}

// Organization mappings with common patterns found in descriptions
const ORG_MAPPINGS: Record<string, OrgMapping> = {
  'EPA': {
    name: 'EPA',
    imagePattern: 'logo-org-epa.png',
    patterns: ['EPA', 'Environmental Protection Agency', 'Clean Air Act']
  },
  'ASTM': {
    name: 'ASTM',
    imagePattern: 'logo-org-astm.png',
    patterns: ['ASTM', 'ASTM International']
  },
  'USDA': {
    name: 'USDA',
    imagePattern: 'logo-org-generic.png', // No USDA logo available
    patterns: ['USDA', 'U.S. Department of Agriculture']
  },
  'FSC': {
    name: 'FSC',
    imagePattern: 'logo-org-fsc.png',
    patterns: ['FSC', 'Forest Stewardship Council', 'Sustainable Forestry']
  },
  'ISO': {
    name: 'ISO',
    imagePattern: 'logo-org-iso.png',
    patterns: ['ISO ']
  },
  'ANSI': {
    name: 'ANSI',
    imagePattern: 'logo-org-ansi.png',
    patterns: ['ANSI']
  },
  'IEC': {
    name: 'IEC',
    imagePattern: 'logo-org-iec.png',
    patterns: ['IEC']
  },
  'OSHA': {
    name: 'OSHA',
    imagePattern: 'logo-org-osha.png',
    patterns: ['OSHA', 'Occupational Safety']
  },
  'FDA': {
    name: 'FDA',
    imagePattern: 'logo-org-fda.png',
    patterns: ['FDA', 'Food and Drug Administration']
  }
};

/**
 * Attempt to identify organization from description
 */
function identifyOrg(description: string): { name: string; imagePath: string } | null {
  if (!description) return null;
  
  // Check each org's patterns
  for (const [_orgKey, orgData] of Object.entries(ORG_MAPPINGS)) {
    for (const pattern of orgData.patterns) {
      if (description.includes(pattern)) {
        return {
          name: orgData.name,
          imagePath: `/images/logo/${orgData.imagePattern}`
        };
      }
    }
  }
  
  return null;
}

/**
 * Normalize regulatory standards by resolving "Unknown" names
 * @param standards - Array of regulatory standards from frontmatter
 * @returns Normalized array with Unknown entries resolved where possible
 */
export function normalizeRegulatoryStandards(
  standards: RegulatoryStandard[] | undefined
): RegulatoryStandard[] {
  if (!standards || !Array.isArray(standards)) {
    return [];
  }
  
  return standards.map(standard => {
    // Only process if name is "Unknown" and we have a description
    if (standard.name === 'Unknown' && standard.description) {
      const identified = identifyOrg(standard.description);
      
      if (identified) {
        return {
          ...standard,
          name: identified.name,
          image: identified.imagePath
        };
      }
    }
    
    return standard;
  });
}
