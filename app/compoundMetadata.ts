// app/compoundMetadata.ts
// SEO metadata configuration for compound category pages
import { SITE_CONFIG } from './utils/constants';
import { CategoryMetadata } from '@/types';

export const COMPOUND_CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  toxic_gas: {
    title: `Toxic Gas Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Toxic gases require comprehensive containment and monitoring systems—critical for protecting operators from volatile compounds produced during laser ablation of coatings, adhesives, and contaminated materials.",
    description: "Safety information for toxic gases produced during laser cleaning operations, including exposure limits, detection methods, and protective measures.",
    keywords: ["toxic gas safety", "laser fume hazards", "gas exposure limits", "fume extraction", "operator safety"],
    ogImage: "/images/compounds/toxic-gas-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Toxic Gas Safety Information",
      description: "Comprehensive safety data for toxic gases produced during laser cleaning operations.",
      category: "Industrial Safety Information"
    }
  },
  metal_oxide: {
    title: `Metal Oxide Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Metal oxide fumes demand particle filtration and respiratory protection—essential for safe handling of iron oxide, zinc oxide, and other metallic particulates generated during metal cleaning operations.",
    description: "Safety information for metal oxide compounds and fumes produced during laser cleaning of metallic surfaces and coatings.",
    keywords: ["metal oxide fumes", "iron oxide safety", "zinc oxide exposure", "metal particulates", "fume safety"],
    ogImage: "/images/compounds/metal-oxide-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Metal Oxide Safety Information",
      description: "Safety data for metal oxide compounds produced during laser metal cleaning.",
      category: "Industrial Safety Information"
    }
  },
  organic_vapor: {
    title: `Organic Vapor Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Organic vapors require ventilation controls and VOC monitoring—critical for managing benzene, toluene, and other volatile compounds during ablation of paints, polymers, and organic coatings.",
    description: "Safety information for organic vapors and VOCs produced during laser cleaning of organic materials, coatings, and residues.",
    keywords: ["VOC safety", "organic vapor hazards", "benzene exposure", "toluene safety", "polymer fumes"],
    ogImage: "/images/compounds/organic-vapor-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Organic Vapor Safety Information",
      description: "Comprehensive safety data for organic vapors produced during laser cleaning operations.",
      category: "Industrial Safety Information"
    }
  },
  carcinogenic: {
    title: `Carcinogenic Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Carcinogenic compounds demand maximum protection protocols—essential for handling chromium VI, PAHs, and other cancer-causing substances produced during specific laser cleaning applications.",
    description: "Critical safety information for carcinogenic compounds produced during laser cleaning, including exposure prevention and protective equipment requirements.",
    keywords: ["carcinogen safety", "chromium VI hazards", "PAH exposure", "cancer prevention", "maximum protection"],
    ogImage: "/images/compounds/carcinogenic-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Carcinogenic Compound Safety Information",
      description: "Critical safety data for carcinogenic compounds produced during laser cleaning.",
      category: "Industrial Safety Information"
    }
  },
  respiratory_irritant: {
    title: `Respiratory Irritant Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Respiratory irritants require immediate ventilation and protective equipment—critical for managing nitrogen oxides, aldehydes, and other compounds causing acute respiratory effects during laser operations.",
    description: "Safety information for respiratory irritant compounds produced during laser cleaning, including symptoms, exposure limits, and protective measures.",
    keywords: ["respiratory safety", "irritant gases", "nitrogen oxide hazards", "aldehyde exposure", "breathing protection"],
    ogImage: "/images/compounds/respiratory-irritant-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Respiratory Irritant Safety Information",
      description: "Safety data for respiratory irritant compounds from laser cleaning operations.",
      category: "Industrial Safety Information"
    }
  }
};

export const VALID_COMPOUND_CATEGORIES = Object.keys(COMPOUND_CATEGORY_METADATA);
