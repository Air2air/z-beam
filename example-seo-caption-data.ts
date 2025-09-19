// Example SEO-Optimized Caption Data Object for TypeScript Implementation
// This demonstrates the complete structure for comprehensive SEO optimization

export const exampleSEOCaptionData = {
  // Core Content
  beforeText: `Initial surface examination reveals significant contamination deposits across the aluminum substrate. 
Microscopic analysis shows organic residue, oxidation layers, and particulate matter adhering to the surface.
The contamination appears to be industrial in nature, likely from manufacturing processes.`,

  afterText: `Post-laser cleaning analysis demonstrates remarkable surface restoration with 99.7% contaminant removal efficiency.
The aluminum substrate now exhibits pristine surface characteristics with minimal thermal effects.
Microscopic examination confirms complete organic residue elimination while preserving substrate integrity.`,

  // YAML v2.0 Laser Parameters
  laserParameters: {
    wavelength: 1064,
    power: 50,
    pulse_duration: 10,
    spot_size: 100,
    frequency: 20000,
    energy_density: 2.5,
    scanning_speed: "500 mm/min",
    beam_profile: "gaussian",
    pulse_overlap: 85
  },

  // Material Information
  material: "Aluminum 6061-T6",

  // Technical Metadata
  metadata: {
    generated: "2025-09-17T14:30:00Z",
    format: "yaml",
    version: "2.0",
    analysis_method: "optical_microscopy",
    magnification: "500x",
    image_resolution: "4096x3072"
  },

  // Enhanced SEO Frontmatter
  frontmatter: {
    title: "Aluminum Surface Laser Cleaning Analysis - Industrial Contamination Removal",
    description: "Comprehensive microscopic analysis of aluminum 6061-T6 surface before and after precision laser cleaning, demonstrating 99.7% contamination removal efficiency using 1064nm wavelength laser processing.",
    
    // SEO Keywords
    keywords: [
      "laser cleaning",
      "aluminum surface treatment", 
      "industrial contamination removal",
      "microscopic surface analysis",
      "materials processing",
      "precision cleaning",
      "surface topography",
      "laser ablation",
      "aluminum 6061-T6",
      "contamination analysis"
    ],

    // Author Information
    author: "Dr. Sarah Chen",
    name: "Aluminum 6061-T6",
    
    author_object: {
      name: "Dr. Sarah Chen",
      email: "s.chen@materials-lab.com",
      affiliation: "Advanced Materials Processing Laboratory", 
      title: "Senior Materials Scientist",
      expertise: [
        "Laser Materials Processing",
        "Surface Analysis", 
        "Industrial Cleaning Technologies",
        "Microscopic Characterization"
      ]
    },

    // Technical Specifications
    technicalSpecifications: {
      wavelength: "1064 nm",
      power: "50 W",
      pulse_duration: "10 ns",
      scanning_speed: "500 mm/min",
      material: "Aluminum 6061-T6",
      beam_delivery: "fiber optic",
      focus_diameter: "100 μm",
      processing_atmosphere: "ambient air"
    },

    // Chemical Properties  
    chemicalProperties: {
      composition: "Al-Mg-Si alloy (6061-T6)",
      surface_treatment: "laser cleaning",
      contamination_type: "organic residue and oxidation",
      materialType: "aluminum alloy",
      formula: "Al₀.₉₅Mg₀.₀₃Si₀.₀₂",
      surface_finish: "Ra < 0.5 μm (post-cleaning)",
      corrosion_resistance: "excellent"
    },

    // Image Metadata
    images: {
      micro: {
        url: "/images/aluminum-laser-cleaning-micro.jpg",
        alt: "Microscopic comparison of aluminum surface before and after laser cleaning showing complete contamination removal",
        width: 800,
        height: 450,
        format: "JPEG",
        caption: "High-resolution microscopic analysis demonstrating precision laser cleaning effectiveness"
      }
    }
  },

  // SEO Enhancement Data
  seoData: {
    description: "Professional microscopic analysis of precision laser cleaning on aluminum 6061-T6, achieving complete contamination removal with preserved substrate integrity.",
    keywords: [
      "laser cleaning aluminum",
      "surface contamination removal", 
      "microscopic analysis",
      "materials processing",
      "industrial cleaning"
    ],
    author: "Dr. Sarah Chen",
    canonical_url: "https://z-beam.com/analysis/aluminum-laser-cleaning",
    og_title: "Aluminum Laser Cleaning Analysis - 99.7% Contamination Removal",
    og_description: "Professional microscopic analysis of precision laser cleaning on aluminum 6061-T6, achieving complete contamination removal with preserved substrate integrity.",
    og_image: "/images/aluminum-laser-cleaning-micro-social.jpg",
    twitter_card: "summary_large_image",
    schema_type: "AnalysisNewsArticle",
    last_modified: "2025-09-17T14:30:00Z"
  },

  // Research Context
  researchContext: {
    project: "Industrial Surface Cleaning Optimization",
    funding_source: "National Science Foundation",
    grant_number: "NSF-CMMI-2025-1234", 
    publication_status: "peer_reviewed",
    journal: "Journal of Materials Processing Technology",
    doi: "10.1016/j.jmatprotec.2025.117890"
  },

  // Quality Metrics
  qualityMetrics: {
    contamination_removal: "99.7%",
    surface_roughness_before: "Ra 2.3 μm",
    surface_roughness_after: "Ra 0.4 μm", 
    thermal_damage: "none detected",
    substrate_integrity: "100% preserved",
    processing_efficiency: "95%"
  },

  // Accessibility Information
  accessibility: {
    alt_text_detailed: "Split-screen microscopic image showing aluminum surface before laser cleaning (left) with visible contamination deposits and after cleaning (right) with pristine surface finish",
    caption_language: "en",
    technical_level: "professional",
    visual_description: "High-contrast microscopic imagery clearly showing surface transformation"
  },

  // Laboratory Information
  laboratoryInfo: {
    location: "Stanford, California, USA",
    facility: "Advanced Materials Processing Laboratory",
    equipment: "Olympus BX61 Optical Microscope",
    certification: "ISO 17025 accredited",
    temperature: "22°C ± 1°C",
    humidity: "45% ± 5% RH"
  }
};

// Enhanced Schema.org JSON-LD Structure for SEO
export const generateSchemaLD = (data: typeof exampleSEOCaptionData) => ({
  "@context": "https://schema.org",
  "@type": "AnalysisNewsArticle",
  "headline": data.frontmatter.title,
  "description": data.frontmatter.description,
  "author": {
    "@type": "Person",
    "name": data.frontmatter.author_object.name,
    "email": data.frontmatter.author_object.email,
    "affiliation": {
      "@type": "Organization", 
      "name": data.frontmatter.author_object.affiliation
    },
    "jobTitle": data.frontmatter.author_object.title,
    "expertise": data.frontmatter.author_object.expertise
  },
  "datePublished": data.metadata.generated,
  "dateModified": data.seoData.last_modified,
  "image": {
    "@type": "ImageObject",
    "url": data.frontmatter.images.micro.url,
    "width": data.frontmatter.images.micro.width,
    "height": data.frontmatter.images.micro.height,
    "caption": data.frontmatter.images.micro.caption,
    "description": data.accessibility.alt_text_detailed
  },
  "about": {
    "@type": "TechnicalArticle",
    "name": "Laser Surface Cleaning Analysis",
    "description": "Scientific analysis of laser cleaning effectiveness on industrial surfaces",
    "keywords": data.frontmatter.keywords.join(", "),
    "materialType": data.frontmatter.chemicalProperties.materialType,
    "materialFormula": data.frontmatter.chemicalProperties.formula
  },
  "instrument": {
    "@type": "Thing",
    "name": "Laser Cleaning System",
    "description": `${data.laserParameters.wavelength}nm wavelength laser with ${data.laserParameters.power}W power`,
    "technicalSpecification": [
      {
        "@type": "PropertyValue",
        "name": "Wavelength",
        "value": `${data.laserParameters.wavelength} nm`
      },
      {
        "@type": "PropertyValue", 
        "name": "Power",
        "value": `${data.laserParameters.power} W`
      },
      {
        "@type": "PropertyValue",
        "name": "Pulse Duration", 
        "value": `${data.laserParameters.pulse_duration} ns`
      }
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": data.laboratoryInfo.facility,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": data.laboratoryInfo.location
    }
  },
  "isAccessibleForFree": true,
  "inLanguage": data.accessibility.caption_language,
  "learningResourceType": "Research Analysis",
  "educationalLevel": data.accessibility.technical_level
});

// Type Definition for Complete SEO Caption Data
export interface SEOCaptionData {
  beforeText: string;
  afterText: string;
  laserParameters: {
    wavelength: number;
    power: number;
    pulse_duration: number;
    spot_size: number;
    frequency: number;
    energy_density: number;
    scanning_speed: string;
    beam_profile: string;
    pulse_overlap: number;
  };
  material: string;
  metadata: {
    generated: string;
    format: string;
    version: string;
    analysis_method: string;
    magnification: string;
    image_resolution: string;
  };
  frontmatter: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    name: string;
    author_object: {
      name: string;
      email: string;
      affiliation: string;
      title: string;
      expertise: string[];
    };
    technicalSpecifications: {
      wavelength: string;
      power: string;
      pulse_duration: string;
      scanning_speed: string;
      material: string;
      beam_delivery: string;
      focus_diameter: string;
      processing_atmosphere: string;
    };
    chemicalProperties: {
      composition: string;
      surface_treatment: string;
      contamination_type: string;
      materialType: string;
      formula: string;
      surface_finish: string;
      corrosion_resistance: string;
    };
    images: {
      micro: {
        url: string;
        alt: string;
        width: number;
        height: number;
        format: string;
        caption: string;
      };
    };
  };
  seoData: {
    description: string;
    keywords: string[];
    author: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
    twitter_card: string;
    schema_type: string;
    last_modified: string;
  };
  researchContext: {
    project: string;
    funding_source: string;
    grant_number: string;
    publication_status: string;
    journal: string;
    doi: string;
  };
  qualityMetrics: {
    contamination_removal: string;
    surface_roughness_before: string;
    surface_roughness_after: string;
    thermal_damage: string;
    substrate_integrity: string;
    processing_efficiency: string;
  };
  accessibility: {
    alt_text_detailed: string;
    caption_language: string;
    technical_level: string;
    visual_description: string;
  };
  laboratoryInfo: {
    location: string;
    facility: string;
    equipment: string;
    certification: string;
    temperature: string;
    humidity: string;
  };
}
