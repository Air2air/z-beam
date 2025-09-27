// types/yaml-components.ts
// TypeScript interfaces for YAML component structures

export interface MaterialData {
  name: string;
  applications: Array<{
    industry: string;
    detail: string;
  }>;
  technicalSpecifications: {
    powerRange: string;
    pulseDuration: string;
    wavelength: string;
    spotSize: string;
    repetitionRate: string;
    fluenceRange: string;
    safetyClass: string;
  };
  description: string;
  author: string;
  authorObject: {
    id: string;
    name: string;
    sex: string;
    title: string;
    country: string;
    expertise: string;
    image: string | null;
  };
  keywords: string;
  category: string;
  chemicalProperties: {
    symbol: string;
    formula: string;
    materialType: string;
  };
  properties: {
    density: string;
    densityMin: string;
    densityMax: string;
    densityPercentile: number;
    meltingPoint: string;
    meltingMin: string;
    meltingMax: string;
    meltingPercentile: number;
    thermalConductivity: string;
    thermalMin: string;
    thermalMax: string;
    thermalPercentile: number;
    tensileStrength: string;
    tensileMin: string;
    tensileMax: string;
    tensilePercentile: number;
    hardness: string;
    hardnessMin: string;
    hardnessMax: string;
    hardnessPercentile: number;
    youngsModulus: string;
    modulusMin: string;
    modulusMax: string;
    modulusPercentile: number;
    laserType: string;
    wavelength: string;
    fluenceRange: string;
    chemicalFormula: string;
  };
  composition: string[];
  compatibility: string[];
  regulatoryStandards: string;
  images: {
    hero: {
      alt: string;
      url: string;
    };
    micro: {
      alt: string;
      url: string;
    };
  };
  title: string;
  headline: string;
  environmentalImpact: Array<{
    benefit: string;
    description: string;
  }>;
  outcomes: Array<{
    result: string;
    metric: string;
  }>;
}

export interface JsonLdSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  category?: string;
  manufacturer?: {
    "@type": string;
    name: string;
  };
  offers?: {
    "@type": string;
    availability: string;
    priceCurrency: string;
  };
  applicationArea?: string[];
  technicalSpecification?: {
    "@type": string;
    name: string;
    author: {
      "@type": string;
      name: string;
      jobTitle: string;
      affiliation: string;
    };
  };
}

export interface JsonLdYamlData {
  materialData: MaterialData;
  jsonldSchema: JsonLdSchema;
}

export interface SeoMetaTag {
  name: string;
  content: string;
}

export interface SeoOpenGraphTag {
  property: string;
  content: string;
}

export interface SeoTwitterTag {
  name: string;
  content: string;
}

export interface SeoAlternateLink {
  hreflang: string;
  href: string;
}

export interface SeoData {
  title: string;
  metaTags: SeoMetaTag[];
  openGraph: SeoOpenGraphTag[];
  twitter: SeoTwitterTag[];
  canonical: string;
  alternateLinks: SeoAlternateLink[];
}

export interface SeoConfig {
  breadcrumbs: Array<{
    name: string;
    url: string;
  }>;
  structuredData: {
    breadcrumbList: {
      "@context": string;
      "@type": string;
      itemListElement: Array<{
        "@type": string;
        position: number;
        name: string;
        item: string;
      }>;
    };
  };
}

export interface MetaTagsYamlData {
  seoData: SeoData;
  seoConfig: SeoConfig;
}

export interface MaterialTable {
  header: string;
  rows: Array<{
    property: string;
    value: string;
    unit: string;
    min?: string;
    max?: string;
    percentile?: number;
    htmlVisualization?: string;
  }>;
}

export interface TableYamlData {
  materialTables: {
    tables: MaterialTable[];
  };
  renderInstructions?: string;
}

// MetricsProperties interfaces
export interface MaterialProperty {
  value: number;
  unit: string;
  min: number;
  max: number;
  description: string;
  priority: number;
}

export interface MaterialProperties {
  density?: MaterialProperty;
  thermalConductivity?: MaterialProperty;
  tensileStrength?: MaterialProperty;
  youngsModulus?: MaterialProperty;
  thermalExpansion?: MaterialProperty;
  meltingPoint?: MaterialProperty;
  hardness?: MaterialProperty;
  electricalConductivity?: MaterialProperty;
  specificHeat?: MaterialProperty;
  poissonRatio?: MaterialProperty;
}

export interface MetricsPropertiesConfig {
  title?: string;
  description?: string;
  className?: string;
  variant?: 'compact' | 'advanced';
  properties: MaterialProperties;
}

export interface MetricsPropertiesYamlData {
  properties: MaterialProperties;
  title?: string;
  description?: string;
  className?: string;
  variant?: string;
}

// MetricsMachineSettings interfaces
export interface MachineSettingValue {
  value: number;
  unit: string;
  min?: number;
  max?: number;
  description?: string;
  priority?: number;
}

export interface MachineSettings {
  powerRange?: MachineSettingValue;
  wavelength?: MachineSettingValue;
  pulseDuration?: MachineSettingValue;
  spotSize?: MachineSettingValue;
  repetitionRate?: MachineSettingValue;
  fluenceRange?: MachineSettingValue;
}

export interface MetricsMachineSettingsConfig {
  title?: string;
  description?: string;
  className?: string;
  variant?: 'compact' | 'advanced';
  machineSettings: MachineSettings;
}

export interface MetricsMachineSettingsYamlData {
  machineSettings: MachineSettings;
  title?: string;
  description?: string;
  className?: string;
  variant?: string;
}
