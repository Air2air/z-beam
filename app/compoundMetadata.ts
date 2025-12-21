// app/compoundMetadata.ts
// SEO metadata configuration for compound category pages
import { SITE_CONFIG } from '@/config/site';
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
  asphyxiant: {
    title: `Asphyxiant Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Asphyxiants displace oxygen and require oxygen monitoring—critical for preventing suffocation from carbon monoxide, carbon dioxide, and other oxygen-displacing gases.",
    description: "Safety information for asphyxiant compounds that displace oxygen during laser cleaning operations.",
    keywords: ["asphyxiant safety", "carbon monoxide", "oxygen displacement", "breathing hazards", "oxygen monitoring"],
    ogImage: "/images/compounds/asphyxiant-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Asphyxiant Compound Safety Information",
      description: "Safety data for asphyxiant compounds from laser cleaning operations.",
      category: "Industrial Safety Information"
    }
  },
  carcinogen: {
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
  corrosive_gas: {
    title: `Corrosive Gas Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Corrosive gases cause tissue damage and require immediate neutralization—critical for handling hydrogen chloride, phosgene, and acids produced during polymer ablation.",
    description: "Safety information for corrosive gas compounds that cause chemical burns and tissue damage during laser cleaning operations.",
    keywords: ["corrosive gas safety", "hydrogen chloride", "chemical burns", "acid gas hazards", "tissue damage prevention"],
    ogImage: "/images/compounds/corrosive-gas-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Corrosive Gas Safety Information",
      description: "Safety data for corrosive gas compounds from laser cleaning operations.",
      category: "Industrial Safety Information"
    }
  },
  irritant: {
    title: `Irritant Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
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
  },
  metal_fume: {
    title: `Metal Fume Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Metal fumes demand particle filtration and respiratory protection—essential for safe handling of iron oxide, zinc oxide, and other metallic particulates generated during metal cleaning operations.",
    description: "Safety information for metal fume compounds and particulates produced during laser cleaning of metallic surfaces and coatings.",
    keywords: ["metal fume safety", "iron oxide", "zinc oxide exposure", "metal particulates", "fume fever prevention"],
    ogImage: "/images/compounds/metal-fume-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Metal Fume Safety Information",
      description: "Safety data for metal fume compounds produced during laser metal cleaning.",
      category: "Industrial Safety Information"
    }
  },
  solvent: {
    title: `Solvent Vapor Compounds from Laser Cleaning | ${SITE_CONFIG.shortName}`,
    subtitle: "Solvent vapors require ventilation controls and VOC monitoring—critical for managing benzene, toluene, and other volatile compounds during ablation of paints, polymers, and organic coatings.",
    description: "Safety information for solvent vapors and VOCs produced during laser cleaning of organic materials, coatings, and residues.",
    keywords: ["VOC safety", "solvent vapor hazards", "benzene exposure", "toluene safety", "polymer fumes"],
    ogImage: "/images/compounds/solvent-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Solvent Vapor Safety Information",
      description: "Comprehensive safety data for solvent vapors produced during laser cleaning operations.",
      category: "Industrial Safety Information"
    }
  }
};

export const VALID_COMPOUND_CATEGORIES = Object.keys(COMPOUND_CATEGORY_METADATA);
