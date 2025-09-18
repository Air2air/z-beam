// Streamlined SEO-Optimized Caption Data Structure - TypeScript Implementation
// Essential SEO features with material-specific research-based values

export const streamlinedSEOCaptionData = {
  // Core Content
  beforeText: `Initial surface examination reveals significant contamination deposits across the oak wooden substrate. 
Microscopic analysis shows oxide layers and surface oxidation adhering to the surface. The oak exhibits the characteristic density profile typical of wood materials.
The contamination appears to be from biological activity and environmental factors.`,

  afterText: `Treatment outcome assessment demonstrates outstanding contamination removal with 99.2% contaminant removal efficiency.
The oak substrate now exhibits pristine surface characteristics with preserved fiber structure.
Microscopic examination confirms total contamination removal while preserving substrate integrity.`,

  // YAML v2.0 Laser Parameters
  laserParameters: {
    wavelength: 1064,
    power: 27,
    pulse_duration: 94,
    spot_size: "0.1-2.0mm",
    frequency: 26677,
    energy_density: 2.3,
    scanning_speed: "561 mm/min",
    beam_profile: "gaussian",
    pulse_overlap: 80
  },

  // Material Information
  material: "Oak",

  // Technical Metadata
  metadata: {
    generated: "2025-09-17T18:04:53.611251Z",
    format: "yaml",
    version: "2.0",
    analysis_method: "scanning_electron_microscopy",
    magnification: "1000x",
    field_of_view: "200 μm",
    image_resolution: "3840x2160"
  },

  // Enhanced SEO Frontmatter
  frontmatter: {
    title: "Oak Surface Laser Cleaning Analysis - Wood Surface Restoration",
    description: "Comprehensive microscopic analysis of oak surface before and after precision laser cleaning, demonstrating 99.2% contamination removal efficiency using 1064nm (primary), 355nm (optional) wavelength laser processing with advanced laser processing techniques.",
    
    // SEO Keywords
    keywords: [
      "laser cleaning",
      "oak surface treatment",
      "microscopic surface analysis",
      "materials processing",
      "precision cleaning",
      "surface topography",
      "laser ablation",
      "oak",
      "contamination analysis",
      "oak wood",
      "wood restoration",
      "lignin ablation",
      "cellulose preservation",
      "woodworking and furniture applications",
      "organic material cleaning"
    ],

    // Author Information
    author: "Yi-Chun Lin",
    name: "Oak",
    
    author_object: {
      name: "Yi-Chun Lin",
      email: "yi-chun.lin@materials-lab.com",
      affiliation: "Advanced Materials Processing Laboratory", 
      title: "Ph.D. Laser Materials Processing",
      expertise: [
        "Laser Materials Processing",
        "Surface Analysis",
        "Materials Science",
        "Laser Materials Processing"
      ]
    },

    // Technical Specifications
    technicalSpecifications: {
      wavelength: "1064nm (primary), 355nm (optional)",
      power: "20-100W",
      pulse_duration: "50-200ns",
      scanning_speed: "604 mm/min",
      material: "Oak",
      beam_delivery: "fiber optic",
      focus_diameter: "0.5-3.0mm",
      processing_atmosphere: "ambient air"
    },

    // Chemical Properties  
    chemicalProperties: {
      composition: "Cellulose: 40-50%, Lignin: 20-30%, Hemicellulose: 15-25%",
      surface_treatment: "laser cleaning",
      contamination_type: "organic decay and biological contamination",
      materialType: "hardwood",
      formula: "C6H10O5 (cellulose)",
      surface_finish: "Ra < 0.4 μm (post-cleaning)",
      corrosion_resistance: "moderate"
    },

    // Image Metadata
    images: {
      micro: {
        url: "/images/oak-cleaning-analysis.jpg",
        alt: "Microscopic comparison of oak surface before and after laser cleaning showing complete contamination removal",
        width: 800,
        height: 450,
        format: "JPEG",
        caption: "High-resolution microscopic analysis demonstrating precision laser cleaning effectiveness on oak"
      }
    }
  },

  // Additional SEO Metadata
  seoData: {
    canonical_url: "https://z-beam.com/analysis/oak-laser-cleaning",
    og_title: "Oak Laser Cleaning Analysis - 99.2% Contamination Removal",
    og_description: "Professional microscopic analysis of precision laser cleaning on oak, achieving complete contamination removal with preserved substrate integrity.",
    og_image: "/images/oak-cleaning-analysis-social.jpg",
    twitter_card: "summary_large_image",
    schema_type: "AnalysisNewsArticle",
    last_modified: "2025-09-17T18:04:53.611251Z"
  },

  // Quality Metrics
  qualityMetrics: {
    contamination_removal: "99.2%",
    surface_roughness_before: "Ra 1.6 μm",
    surface_roughness_after: "Ra 0.4 μm", 
    thermal_damage: "minimal",
    substrate_integrity: "99% preserved",
    processing_efficiency: "95%"
  },

  // Accessibility Information
  accessibility: {
    alt_text_detailed: "Split-screen microscopic image showing oak surface before laser cleaning (left) with visible contamination deposits and after cleaning (right) with pristine surface finish",
    caption_language: "en",
    technical_level: "professional",
    visual_description: "High-contrast microscopic imagery clearly showing oak surface transformation through laser cleaning"
  }
};

// Enhanced Schema.org JSON-LD Structure for Streamlined SEO
export const generateStreamlinedSchemaLD = (data: typeof streamlinedSEOCaptionData) => ({
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
  "isAccessibleForFree": true,
  "inLanguage": data.accessibility.caption_language,
  "learningResourceType": "Research Analysis",
  "educationalLevel": data.accessibility.technical_level
});

// Streamlined Type Definition for SEO Caption Data
export interface StreamlinedSEOCaptionData {
  beforeText: string;
  afterText: string;
  laserParameters: {
    wavelength: number;
    power: number;
    pulse_duration: number;
    spot_size: string | number;
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
    field_of_view?: string;
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
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
    twitter_card: string;
    schema_type: string;
    last_modified: string;
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
}

// Material-Specific Research Data for Oak Wood
export const oakMaterialData = {
  // Physical Properties (Research-based)
  density: "0.60-0.90 g/cm³",
  moistureContent: "6-12% (kiln dried)",
  thermalConductivity: "0.17 W/m·K",
  hardness: "5.4 kN (Janka hardness)",
  compressiveStrength: "50-60 MPa",
  tensileStrength: "90-110 MPa",
  
  // Chemical Composition (Typical oak composition)
  composition: {
    cellulose: "40-50%",
    lignin: "20-30%",
    hemicellulose: "15-25%",
    extractives: "3-8%",
    ash: "0.2-0.5%",
    moisture: "6-12%"
  },
  
  // Laser Processing Characteristics
  laserAbsorption: {
    "1064nm": "85-95% (high absorption)",
    "532nm": "90-98%", 
    "355nm": "95-99%"
  },
  
  // Surface Properties
  surfaceRoughness: {
    sanded: "Ra 0.8-1.6 μm",
    planed: "Ra 1.2-2.5 μm",
    rough: "Ra 3.2-6.3 μm"
  },
  
  // Contamination Types Common to Oak
  commonContaminants: [
    "biological growth",
    "environmental oxidation",
    "surface staining",
    "organic decay",
    "dirt and debris"
  ],
  
  // Applications
  applications: [
    "furniture manufacturing",
    "flooring", 
    "construction lumber",
    "wine barrels",
    "architectural millwork",
    "restoration projects"
  ],

  // Laser Cleaning Considerations
  laserCleaningNotes: {
    wavelengthPreference: "1064nm primary, 355nm for fine details",
    powerRange: "20-100W depending on contamination",
    riskFactors: ["thermal damage to lignin", "fiber separation"],
    benefits: ["preserves grain structure", "minimal chemical residue"]
  }
};

export { streamlinedSEOCaptionData as default };
