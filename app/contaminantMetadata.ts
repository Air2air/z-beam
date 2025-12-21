// app/contaminantMetadata.ts
// SEO metadata configuration for contaminant category pages
import { SITE_CONFIG } from '@/app/config/site';
import { CategoryMetadata } from '@/types';

export const CONTAMINANT_CATEGORY_METADATA: Record<string, CategoryMetadata> = {
  oxidation: {
    title: `Oxidation Contamination Removal | ${SITE_CONFIG.shortName}`,
    subtitle: "Oxidation requires selective ablation targeting oxide layers while preserving base metal integrity—critical for rust removal, patina cleaning, and corrosion treatment in industrial and heritage applications.",
    description: "Professional laser removal of rust, oxidation, and corrosion. Industrial and restoration applications with precision cleaning technology.",
    keywords: ["rust removal", "oxidation cleaning", "corrosion treatment", "metal restoration", "iron oxide removal"],
    ogImage: "/images/contamination/rust-oxidation-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Oxidation Removal Services",
      description: "Professional laser cleaning solutions for rust, oxidation, and corrosion removal.",
      category: "Industrial Cleaning Services"
    }
  },
  metallic_coating: {
    title: `Metallic Coating Removal | ${SITE_CONFIG.shortName}`,
    subtitle: "Metallic coatings demand controlled energy delivery for selective layer removal without substrate damage—essential for plating removal, coating stripping, and surface preparation in aerospace and automotive industries.",
    description: "Precision laser removal of electroplating, anodizing, and metallic coatings with appropriate safety measures. Toxic metal coatings (lead, chromium, cadmium) require specialized extraction and severe-hazard protocols. Industrial-grade ventilation and PPE standards enforced.",
    keywords: ["plating removal", "coating stripping", "electroplating removal", "anodizing removal", "metallic coating", "toxic metal safety"],
    ogImage: "/images/contamination/metallic-coating-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Metallic Coating Removal Services",
      description: "Specialized laser cleaning for metallic coatings and plating removal.",
      category: "Industrial Cleaning Services"
    }
  },
  inorganic_coating: {
    title: `Inorganic Coating Removal | ${SITE_CONFIG.shortName}`,
    subtitle: "Inorganic coatings require precise ablation protocols for paint, ceramic coatings, and mineral deposits—critical for surface preparation, restoration, and industrial maintenance applications.",
    description: "Advanced laser removal of paint, ceramic coatings, and mineral deposits. Industrial, architectural, and heritage applications.",
    keywords: ["paint removal", "ceramic coating removal", "mineral deposit cleaning", "inorganic coating stripping"],
    ogImage: "/images/contamination/inorganic-coating-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Inorganic Coating Removal Services",
      description: "Professional cleaning solutions for inorganic coatings and mineral deposits.",
      category: "Industrial Cleaning Services"
    }
  },
  organic_residue: {
    title: `Organic Residue Removal | ${SITE_CONFIG.shortName}`,
    subtitle: "Organic residues demand temperature-controlled ablation preventing combustion and substrate damage—essential for oil, grease, adhesive, and polymer removal in manufacturing and maintenance operations.",
    description: "Comprehensive laser removal of oils, greases, adhesives, and organic contaminants with fire prevention protocols. Moderate fire/explosion risk materials require enhanced ventilation (6-10 ACH) and combustion monitoring. Temperature-controlled processing ensures substrate integrity.",
    keywords: ["oil removal", "grease cleaning", "adhesive removal", "organic contamination", "polymer residue", "fire prevention"],
    ogImage: "/images/contamination/organic-residue-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Organic Residue Removal Services",
      description: "Specialized cleaning for oils, greases, adhesives, and organic contaminants.",
      category: "Industrial Cleaning Services"
    }
  },
  chemical_residue: {
    title: `Chemical Residue Removal | ${SITE_CONFIG.shortName}`,
    subtitle: "Chemical residues require controlled ablation with fume extraction protocols—critical for hazardous material removal, pharmaceutical cleaning, and semiconductor processing applications.",
    description: "Safe laser removal of chemical residues, pharmaceutical contaminants, and hazardous materials with comprehensive safety protocols. High-hazard materials require enhanced ventilation (12+ ACH), HEPA filtration, and full respiratory protection. Professional safety assessment included.",
    keywords: ["chemical residue removal", "pharmaceutical cleaning", "hazardous material removal", "semiconductor cleaning", "safety protocols", "HEPA filtration"],
    ogImage: "/images/contamination/chemical-residue-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Chemical Residue Removal Services",
      description: "Safe cleaning solutions for chemical residues and hazardous contaminants.",
      category: "Industrial Cleaning Services"
    }
  },
  thermal_damage: {
    title: `Thermal Damage & Scale Removal | ${SITE_CONFIG.shortName}`,
    subtitle: "Thermal damage requires selective ablation targeting heat-affected zones and scale formation—essential for forge scale removal, annealing marks, and heat treatment residue in metalworking applications.",
    description: "Precision laser removal of forge scale, heat treatment residue, and thermal coatings with standard safety protocols. Low-to-moderate hazard applications. Standard ventilation (4-8 ACH) and basic PPE sufficient for most thermal scale removal operations.",
    keywords: ["forge scale removal", "heat treatment cleaning", "annealing scale", "thermal coating removal", "standard safety"],
    ogImage: "/images/contamination/thermal-damage-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Thermal Damage & Scale Removal Services",
      description: "Specialized cleaning for thermal damage, forge scale, and heat treatment residue.",
      category: "Industrial Cleaning Services"
    }
  },
  biological_growth: {
    title: `Biological Growth Removal | ${SITE_CONFIG.shortName}`,
    subtitle: "Biological growth demands gentle ablation preserving substrate porosity and texture—critical for mold, algae, and organic growth removal in heritage conservation and marine applications.",
    description: "Safe laser removal of mold, algae, biological stains, and organic growth. Heritage conservation, marine, and architectural applications.",
    keywords: ["mold removal", "algae cleaning", "biological growth removal", "organic stain removal"],
    ogImage: "/images/contamination/biological-growth-hero.jpg",
    schema: {
      "@type": "Product",
      name: "Biological Growth Removal Services",
      description: "Safe cleaning for mold, algae, and biological contaminants.",
      category: "Heritage Conservation Services"
    }
  }
};

export const VALID_CONTAMINANT_CATEGORIES = Object.keys(CONTAMINANT_CATEGORY_METADATA);
