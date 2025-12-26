/**
 * @module regulatoryStandardsNormalizer
 * @purpose Automatically resolves "Unknown" regulatory standard names by extracting
 *          organization abbreviations from descriptions
 * @dependencies None (pure function)
 * @usage Import normalizeRegulatoryStandards and apply to metadata.regulatoryStandards
 */

import type { RegulatoryStandard } from '@/types';

interface OrgMapping {
  name: string;
  longName: string;
  imagePattern: string;
  patterns: string[];
}

// Organization mappings with common patterns found in descriptions
const ORG_MAPPINGS: Record<string, OrgMapping> = {
  'EPA': {
    name: 'EPA',
    longName: 'Environmental Protection Agency',
    imagePattern: 'logo-org-epa.png',
    patterns: ['EPA', 'Environmental Protection Agency', 'Clean Air Act']
  },
  'ASTM': {
    name: 'ASTM',
    longName: 'ASTM International',
    imagePattern: 'logo-org-astm.png',
    patterns: ['ASTM', 'ASTM International']
  },
  'USDA': {
    name: 'USDA',
    longName: 'U.S. Department of Agriculture',
    imagePattern: 'logo-org-generic.png', // No USDA logo available
    patterns: ['USDA', 'U.S. Department of Agriculture']
  },
  'FSC': {
    name: 'FSC',
    longName: 'Forest Stewardship Council',
    imagePattern: 'logo-org-fsc.png',
    patterns: ['FSC', 'Forest Stewardship Council', 'Sustainable Forestry']
  },
  'ISO': {
    name: 'ISO',
    longName: 'International Organization for Standardization',
    imagePattern: 'logo-org-iso.png',
    patterns: ['ISO ']
  },
  'ANSI': {
    name: 'ANSI',
    longName: 'American National Standards Institute',
    imagePattern: 'logo-org-ansi.png',
    patterns: ['ANSI']
  },
  'IEC': {
    name: 'IEC',
    longName: 'International Electrotechnical Commission',
    imagePattern: 'logo-org-iec.png',
    patterns: ['IEC']
  },
  'OSHA': {
    name: 'OSHA',
    longName: 'Occupational Safety and Health Administration',
    imagePattern: 'logo-org-osha.png',
    patterns: ['OSHA', 'Occupational Safety']
  },
  'FDA': {
    name: 'FDA',
    longName: 'Food and Drug Administration',
    imagePattern: 'logo-org-fda.png',
    patterns: ['FDA', 'Food and Drug Administration']
  },
  'UNESCO': {
    name: 'UNESCO',
    longName: 'United Nations Educational, Scientific and Cultural Organization',
    imagePattern: 'logo-org-unesco.png',
    patterns: ['UNESCO', 'Cultural Heritage Conservation']
  },
  'SEMI': {
    name: 'SEMI',
    longName: 'Semiconductor Equipment and Materials International',
    imagePattern: 'logo-org-semi.png',
    patterns: ['SEMI', 'SEMI M1', 'Semiconductor Equipment']
  },
  'CITES': {
    name: 'CITES',
    longName: 'Convention on International Trade in Endangered Species',
    imagePattern: 'logo-org-cites.png',
    patterns: ['CITES', 'Convention on International Trade', 'Sustainable Mahogany']
  }
};

/**
 * Attempt to identify organization from description
 */
function identifyOrg(description: string): { name: string; longName: string; imagePath: string } | null {
  if (!description) return null;
  
  // Check each org's patterns
  for (const [_orgKey, orgData] of Object.entries(ORG_MAPPINGS)) {
    for (const pattern of orgData.patterns) {
      if (description.includes(pattern)) {
        return {
          name: orgData.name,
          longName: orgData.longName,
          imagePath: `/images/logo/${orgData.imagePattern}`
        };
      }
    }
  }
  
  return null;
}

/**
 * Normalize regulatory standards by resolving "Unknown" names
 * @param standards - Array of regulatory standards from metadata
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
          longName: identified.longName,
          image: identified.imagePath
        };
      }
    }
    
    return standard;
  });
}
