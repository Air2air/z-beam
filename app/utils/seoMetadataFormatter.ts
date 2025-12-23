/**
 * SEO Infrastructure - Metadata Formatter
 * 
 * Part of the SEO Infrastructure layer that optimizes titles and descriptions 
 * for search engine results pages (SERPs) while maintaining professional voice.
 * 
 * This utility is part of the browser-based enhancement layer that improves
 * discoverability without appearing in visible page content.
 * 
 * Key principles:
 * - Titles: 50-60 chars with technical specs
 * - Descriptions: 155-160 chars (mobile-first, no truncation)
 * - No sales-y language (best, top, leading, revolutionary)
 * - Data-driven: wavelengths, power, material properties
 * - Professional authority signals
 * 
 * @see docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md
 */

interface MetadataConfig {
  pageType: 'material' | 'settings' | 'contaminant' | 'application';
  materialName: string;
  category?: string;
  subcategory?: string;
  
  // Frontmatter data
  materialDescription?: string;
  settingsDescription?: string;
  contaminationDescription?: string;
  machineSettings?: {
    powerRange?: { value: number; unit: string };
    wavelength?: { value: number; unit: string };
    passCount?: { value: number; unit: string };
    scanSpeed?: { value: number; unit: string };
  };
  materialProperties?: {
    material_characteristics?: {
      density?: { value: number; unit: string };
    };
  };
  
  // Optional overrides
  customTitle?: string;
  customDescription?: string;
}

/**
 * Format material page title for optimal CTR
 * Pattern: [Material] Laser Cleaning: Settings & Guide | Z-Beam
 * Target: 50-60 characters
 */
export function formatMaterialTitle(config: MetadataConfig): string {
  if (config.customTitle) return config.customTitle;
  
  const { materialName, machineSettings } = config;
  
  // Extract key specs
  const wavelength = machineSettings?.wavelength?.value;
  const power = machineSettings?.powerRange?.value;
  
  // Build title with value prop - what user gets
  if (wavelength && power) {
    const title = `${materialName} Laser Cleaning: ${wavelength}nm, ${power}W Guide`;
    return truncateTitle(title);
  }
  
  // Just wavelength
  if (wavelength) {
    const title = `${materialName} Laser Cleaning: ${wavelength}nm Settings`;
    return truncateTitle(title);
  }
  
  // Just power
  if (power) {
    const title = `${materialName} Laser Cleaning: ${power}W Settings & Guide`;
    return truncateTitle(title);
  }
  
  // Fallback - emphasize what user gets
  const title = `${materialName} Laser Cleaning: Settings & Guide`;
  return truncateTitle(title);
}

/**
 * Format settings page title for optimal CTR
 * Pattern: [Material] Laser Settings: Parameters & Guide | Z-Beam
 * Target: 50-60 characters
 */
export function formatSettingsTitle(config: MetadataConfig): string {
  if (config.customTitle) return config.customTitle;
  
  const { materialName, machineSettings } = config;
  
  // Extract key specs
  const wavelength = machineSettings?.wavelength?.value;
  const power = machineSettings?.powerRange?.value;
  const passes = machineSettings?.passCount?.value;
  
  // Build title with specs and value prop
  if (passes && wavelength && power) {
    const title = `${materialName} Laser Settings: ${passes}-Pass, ${power}W Guide`;
    return truncateTitle(title);
  }
  
  if (wavelength && power) {
    const title = `${materialName} Laser Settings: ${power}W, ${wavelength}nm Parameters`;
    return truncateTitle(title);
  }
  
  if (wavelength) {
    const title = `${materialName} Laser Settings: ${wavelength}nm Parameters`;
    return truncateTitle(title);
  }
  
  // Fallback - clear and keyword-rich
  const title = `${materialName} Laser Settings: Parameters & Guide`;
  return truncateTitle(title);
}

/**
 * Format material page description for optimal CTR
 * Structure: Use authored materialDescription (first 155-160 chars) or fallback to specs
 * Target: 155-160 characters (no mobile truncation)
 */
export function formatMaterialDescription(config: MetadataConfig): string {
  if (config.customDescription) return config.customDescription;
  
  const { 
    materialName, 
    materialDescription,
    machineSettings,
    materialProperties,
    category,
    subcategory
  } = config;
  
  // Extract key data points
  const density = materialProperties?.material_characteristics?.density?.value;
  const wavelength = machineSettings?.wavelength?.value;
  const power = machineSettings?.powerRange?.value;
  
  // If we have authored material description, enhance it with technical details
  if (materialDescription && materialDescription.trim().length > 0) {
    let desc = materialDescription;
    
    // Add density if available and not too long
    if (density && desc.length < 100) {
      desc += ` (${density}g/cm³)`;
    }
    
    // Add page features if space permits
    if (desc.length < 120) {
      desc += '. Properties, parameters, challenges';
    }
    
    // Add industry context if space permits
    const context = getIndustryContext(category, subcategory);
    if (context && desc.length < 135) {
      desc += ` for ${context.toLowerCase()}`;
    }
    
    return truncateDescription(desc, 160);
  }
  
  // FALLBACK: Generate technical description if no authored content
  // Build description with page features
  let desc = materialName;
  
  // Add density if available
  if (density) {
    desc += ` at ${density}g/cm³`;
  }
  
  // Add what's on the page (material properties, parameters, challenges)
  desc += '. Material properties, laser parameters';
  
  // Add laser specs if space permits
  if (wavelength && power && desc.length < 100) {
    desc += ` (${wavelength}nm, ${power}W)`;
  }
  
  // Add page features
  if (desc.length < 120) {
    desc += ', cleaning challenges';
  }
  
  // Add application context if space permits
  const context = getIndustryContext(category, subcategory);
  if (context && desc.length < 135) {
    desc += ` for ${context.toLowerCase()}`;
  }
  
  // Truncate to 160 chars
  return truncateDescription(desc, 160);
}

/**
 * Format settings page description for optimal CTR
 * Structure: Use authored settingsDescription (first 155-160 chars) or fallback to specs
 * Target: 155-160 characters
 */
export function formatSettingsDescription(config: MetadataConfig): string {
  if (config.customDescription) return config.customDescription;
  
  const {
    materialName,
    settingsDescription,
    machineSettings,
    category,
    subcategory
  } = config;
  
  // Extract machine settings
  const power = machineSettings?.powerRange?.value;
  const wavelength = machineSettings?.wavelength?.value;
  const _scanSpeed = machineSettings?.scanSpeed?.value;
  const passes = machineSettings?.passCount?.value;
  
  // If we have authored settings description, enhance it with page features
  if (settingsDescription && settingsDescription.trim().length > 0) {
    let desc = settingsDescription;
    
    // Add page features if space permits
    if (desc.length < 130) {
      desc += '. Settings, speed, challenges';
    }
    
    // Add technical specs if space permits
    if (power && wavelength && desc.length < 145) {
      desc += ` (${power}W, ${wavelength}nm)`;
    }
    
    return truncateDescription(desc, 160);
  }
  
  // FALLBACK: Generate technical description if no authored content
  
  // Build description with page features
  let desc = '';
  
  // Add what's on the page first
  desc = `${materialName} laser settings: `;
  
  // Add machine specs
  if (power && wavelength) {
    desc += `${power}W, ${wavelength}nm`;
  } else {
    desc += 'power, wavelength';
  }
  
  // Add what else is on the page
  desc += ', scan speed, spot size';
  
  // Add pass count if available
  if (passes && desc.length < 100) {
    desc += `, ${passes} passes`;
  }
  
  // Add page features (challenges, thermal management)
  if (desc.length < 120) {
    desc += ', thermal challenges, safety data';
  }
  
  // Add application context if space permits
  const context = getIndustryContext(category, subcategory);
  if (context && desc.length < 140) {
    desc += ` for ${context.toLowerCase()}`;
  }
  
  // Truncate to 160 chars
  return truncateDescription(desc, 160);
}

/**
 * Extract key property from material description
 * Looks for: reflectivity, strength, conductivity, density, hardness, etc.
 */
function _extractKeyProperty(description?: string): string {
  if (!description) return '';
  
  // Property keywords to search for
  const propertyWords = [
    'reflectivity', 'reflective',
    'strength', 'strong',
    'conductivity', 'conductive',
    'density', 'dense',
    'hardness', 'hard',
    'ductility', 'ductile',
    'toughness', 'tough',
    'absorption', 'absorptive',
    'porosity', 'porous',
    'corrosion resistance',
    'thermal conductivity'
  ];
  
  const firstSentence = description.split('.')[0].trim();
  const lowerFirst = firstSentence.toLowerCase();
  
  // Find which property is mentioned
  for (const prop of propertyWords) {
    if (lowerFirst.includes(prop)) {
      // Extract phrase containing property (up to 50 chars)
      const words = firstSentence.split(' ');
      const propWords = prop.split(' ');
      
      // Find starting position
      let startIdx = -1;
      for (let i = 0; i < words.length; i++) {
        if (words[i].toLowerCase().includes(propWords[0])) {
          startIdx = i;
          break;
        }
      }
      
      if (startIdx >= 0) {
        // Take 2 words before and 3 words after
        const start = Math.max(0, startIdx - 2);
        const end = Math.min(words.length, startIdx + 4);
        const phrase = words.slice(start, end).join(' ');
        
        // Clean up and return (max 50 chars)
        return phrase.length > 50 ? phrase.substring(0, 47) + '...' : phrase;
      }
    }
  }
  
  // Fallback: first 45 chars of first sentence
  return firstSentence.length > 45 
    ? firstSentence.substring(0, 42) + '...'
    : firstSentence;
}

/**
 * Extract key consideration from settings description
 * Looks for: challenges, considerations, requirements
 */
function _extractKeyConsideration(description?: string): string {
  if (!description) return '';
  
  // Keywords indicating important considerations
  const keywords = [
    'counter', 'prevent', 'avoid', 'requires', 'controlled',
    'gradual', 'careful', 'monitor', 'watch', 'tends to'
  ];
  
  const sentences = description.split('.').map(s => s.trim()).filter(s => s);
  
  // Find sentence with consideration keyword
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Return this sentence if short enough
        if (sentence.length <= 50) {
          return sentence;
        }
        // Otherwise truncate
        return sentence.substring(0, 47) + '...';
      }
    }
  }
  
  // Fallback: return nothing (let other parts fill the description)
  return '';
}

/**
 * Get industry/application context based on category
 */
function getIndustryContext(category?: string, subcategory?: string): string {
  const contexts: Record<string, string> = {
    // Metal contexts
    'metal-non-ferrous': 'Aerospace applications',
    'metal-ferrous': 'Automotive/construction',
    'metal-precious': 'Electronics/jewelry',
    'metal-reactive': 'Aerospace/chemical',
    
    // Other material contexts
    'ceramic-oxide': 'Semiconductor/high-temp',
    'ceramic-non-oxide': 'Technical ceramics',
    'glass': 'Laboratory/precision optics',
    'composite': 'Aerospace/marine',
    'plastic': 'Medical/automotive',
    'semiconductor': 'Electronics manufacturing',
    'stone': 'Heritage restoration',
    'wood': 'Furniture/architectural',
    'masonry': 'Building conservation',
    
    // Fallback by category only
    'metal': 'Industrial applications',
    'ceramic': 'High-temperature applications',
    'rare-earth': 'High-tech manufacturing'
  };
  
  // Try subcategory combo first
  const key = subcategory ? `${category}-${subcategory}` : category;
  return contexts[key || ''] || '';
}

/**
 * Get category-specific title suffix
 */
function getCategoryTitleSuffix(category?: string): string {
  const suffixes: Record<string, string> = {
    'metal': 'Industrial Parameters',
    'ceramic': 'Technical Specifications',
    'glass': 'Precision Settings',
    'composite': 'Advanced Parameters',
    'plastic': 'Processing Settings',
    'semiconductor': 'Cleanroom Specifications',
    'stone': 'Conservation Parameters',
    'wood': 'Restoration Settings',
    'masonry': 'Building Parameters',
    'rare-earth': 'High-Tech Settings'
  };
  
  return suffixes[category || ''] || 'Technical Parameters';
}

/**
 * Truncate title to optimal length for SERP display
 * Layout template adds " | Z-Beam" (9 chars)
 * Target total: 50-60 chars for optimal CTR
 */
function truncateTitle(title: string): string {
  const maxLength = 50; // 50 + 9 (suffix) = 59 chars total
  
  if (title.length <= maxLength) return title;
  
  // Truncate at word boundary
  const truncated = title.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace);
}

/**
 * Truncate description to specified limit at word boundary
 */
function truncateDescription(text: string, limit: number): string {
  if (text.length <= limit) return text;
  
  // Truncate at word boundary with ellipsis
  const truncated = text.substring(0, limit - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Format contaminant page title for optimal CTR
 * Pattern: [Contaminant] Removal: Laser Cleaning Guide | Z-Beam
 * Target: 50-60 characters
 */
export function formatContaminantTitle(config: MetadataConfig): string {
  if (config.customTitle) return config.customTitle;
  
  const { materialName } = config;
  
  // Remove awkward suffixes like "/ Iron Oxide Formation"
  const cleanName = materialName.split('/')[0].trim();
  
  // Build concise, natural title
  const title = `${cleanName} Removal: Laser Cleaning Guide`;
  return truncateTitle(title);
}

/**
 * Format contaminant page description for optimal CTR
 * Structure: Use authored contaminationDescription (first 155-160 chars)
 * Target: 155-160 characters (no mobile truncation)
 */
export function formatContaminantDescription(config: MetadataConfig): string {
  if (config.customDescription) return config.customDescription;
  
  const { contaminationDescription, materialName } = config;
  
  // Use authored description if available
  if (contaminationDescription && contaminationDescription.trim().length > 0) {
    return truncateDescription(contaminationDescription, 160);
  }
  
  // Fallback
  return truncateDescription(
    `Professional laser cleaning for ${materialName} removal. Technical specifications, parameters, and industrial methods for effective contamination removal.`,
    160
  );
}
