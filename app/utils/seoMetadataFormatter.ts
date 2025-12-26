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
 * Structure: Challenge-focused, outcome-oriented for technical audience
 * Target: 155-160 characters (no mobile truncation)
 */
export function formatMaterialDescription(config: MetadataConfig): string {
  if (config.customDescription) return config.customDescription;
  
  const { 
    materialName, 
    machineSettings,
    category,
    subcategory
  } = config;
  
  // Extract technical specs for challenge-solution format
  const wavelength = machineSettings?.wavelength?.value;
  const power = machineSettings?.powerRange?.value;
  const passes = machineSettings?.passCount?.value;
  
  // Get material-specific challenge descriptor
  const challenge = getMaterialChallenge(materialName, category, subcategory);
  
  // Build challenge-focused description: [Challenge] → [Method] → [Outcome]
  let desc = `${materialName}: ${challenge}`;
  
  // Add technical method
  if (wavelength && power) {
    desc += ` ${wavelength}nm, ${power}W`;
  } else if (wavelength) {
    desc += ` ${wavelength}nm wavelength`;
  }
  
  // Add pass technique if available
  if (passes && desc.length < 100) {
    desc += `, ${passes}-pass technique`;
  }
  
  // Add outcome/benefit
  const outcome = getMaterialOutcome(materialName, category, subcategory);
  if (desc.length < 110) {
    desc += `. ${outcome}`;
  }
  
  return truncateDescription(desc, 160);
}

/**
 * Format settings page description for optimal CTR
 * Structure: Outcome-focused with quality metrics and damage prevention
 * Target: 155-160 characters
 */
export function formatSettingsDescription(config: MetadataConfig): string {
  if (config.customDescription) return config.customDescription;
  
  const {
    materialName,
    machineSettings,
    category,
    subcategory
  } = config;
  
  // Extract machine settings
  const power = machineSettings?.powerRange?.value;
  const wavelength = machineSettings?.wavelength?.value;
  const scanSpeed = machineSettings?.scanSpeed?.value;
  const passes = machineSettings?.passCount?.value;
  
  // Build outcome-focused description: [Settings] → [What it removes] → [Quality outcome]
  let desc = `${materialName} settings: `;
  
  // Add parameters
  if (power && wavelength) {
    desc += `${power}W, ${wavelength}nm`;
  } else if (power) {
    desc += `${power}W power`;
  } else {
    desc += 'optimized parameters';
  }
  
  // Add what it removes (material-specific)
  const removes = getRemovalTargets(materialName, category);
  desc += ` removes ${removes}`;
  
  // Add damage prevention benefit
  const benefit = getSettingsBenefit(materialName, category);
  if (desc.length < 120) {
    desc += `. ${benefit}`;
  }
  
  // Add speed comparison if space
  if (desc.length < 140) {
    desc += '. Faster than mechanical methods';
  }
  
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
 * Get material-specific challenge for description
 */
function getMaterialChallenge(material: string, category?: string, subcategory?: string): string {
  const lower = material.toLowerCase();
  
  // High reflectivity materials
  if (lower.includes('aluminum') || lower.includes('aluminium')) {
    return 'High reflectivity (88%) requires precise wavelength';
  }
  if (lower.includes('copper')) {
    return '95% reflection requires green laser, oxidation risk';
  }
  if (lower.includes('gold') || lower.includes('silver')) {
    return 'Extreme reflectivity demands specialized parameters';
  }
  
  // High absorption materials
  if (lower.includes('steel') || lower.includes('iron')) {
    return '85% absorption enables efficient rust/scale removal';
  }
  if (lower.includes('titanium')) {
    return 'Reactive surface requires controlled parameters';
  }
  
  // Thermal sensitive materials
  if (lower.includes('plastic') || lower.includes('polymer')) {
    return 'Low melting point demands precise thermal control';
  }
  if (lower.includes('composite')) {
    return 'Multi-layer structure requires balanced parameters';
  }
  
  // Default by category
  if (category === 'metal') return 'Optical properties require wavelength optimization';
  if (category === 'ceramic') return 'Brittle nature demands gentle cleaning approach';
  if (category === 'glass') return 'Transparency requires specific wavelength selection';
  
  return 'Material properties require optimized parameters';
}

/**
 * Get material-specific outcome/benefit
 */
function getMaterialOutcome(material: string, category?: string, subcategory?: string): string {
  const lower = material.toLowerCase();
  
  // Metal outcomes
  if (lower.includes('aluminum') || lower.includes('aluminium')) {
    return 'Preserves anodized finish, no heat damage';
  }
  if (lower.includes('steel') || lower.includes('iron')) {
    return 'No warping, preserves base metal integrity';
  }
  if (lower.includes('copper')) {
    return 'Maintains conductivity, prevents oxidation';
  }
  if (lower.includes('titanium')) {
    return 'Preserves passivation layer, aerospace-grade';
  }
  if (lower.includes('stainless')) {
    return 'Maintains corrosion resistance, no re-passivation needed';
  }
  
  // Other materials
  if (lower.includes('composite')) {
    return 'No delamination, preserves fiber-matrix bond';
  }
  if (lower.includes('ceramic')) {
    return 'No thermal shock, preserves surface integrity';
  }
  if (lower.includes('glass')) {
    return 'No scratching, maintains optical clarity';
  }
  
  return 'No substrate damage, production-ready finish';
}

/**
 * Get removal targets for settings page
 */
function getRemovalTargets(material: string, category?: string): string {
  const lower = material.toLowerCase();
  
  // Metal-specific contamination
  if (lower.includes('aluminum') || lower.includes('aluminium')) {
    return 'oxide, anodizing prep';
  }
  if (lower.includes('steel') || lower.includes('iron')) {
    return 'rust, mill scale, paint';
  }
  if (lower.includes('stainless')) {
    return 'heat tint, weld oxidation';
  }
  if (lower.includes('copper') || lower.includes('brass')) {
    return 'oxidation, tarnish';
  }
  if (lower.includes('titanium')) {
    return 'oxide, contamination';
  }
  
  // Category defaults
  if (category === 'metal') return 'oxide, scale, coatings';
  if (category === 'composite') return 'paint, adhesive residue';
  if (category === 'ceramic') return 'contaminants, coatings';
  
  return 'surface contamination, coatings';
}

/**
 * Get settings benefit (damage prevention/quality outcome)
 */
function getSettingsBenefit(material: string, category?: string): string {
  const lower = material.toLowerCase();
  
  if (lower.includes('aluminum') || lower.includes('aluminium')) {
    return 'No melting, Ra <1μm finish';
  }
  if (lower.includes('steel') || lower.includes('iron')) {
    return 'No warping, minimal HAZ';
  }
  if (lower.includes('copper')) {
    return 'Preserves conductivity';
  }
  if (lower.includes('titanium')) {
    return 'Maintains passivation';
  }
  if (lower.includes('composite')) {
    return 'No delamination risk';
  }
  
  return 'No substrate damage';
}

/**
 * Get contaminant removal efficiency metrics
 */
function getContaminantEfficiency(contaminant: string): string {
  const lower = contaminant.toLowerCase();
  
  if (lower.includes('rust') || lower.includes('oxide')) {
    return '88-92% absorption, efficient removal';
  }
  if (lower.includes('paint') || lower.includes('coating')) {
    return 'Multi-layer removal, 1-5 passes';
  }
  if (lower.includes('scale') || lower.includes('mill scale')) {
    return 'High absorption, 2-4 passes for complete removal';
  }
  if (lower.includes('oil') || lower.includes('grease')) {
    return 'Surface ablation, single-pass capable';
  }
  if (lower.includes('carbon')) {
    return 'High absorption at 1064nm, complete removal';
  }
  
  return 'Efficient laser ablation';
}

/**
 * Get substrate protection benefit for contaminant removal
 */
function getSubstrateProtection(contaminant: string): string {
  const lower = contaminant.toLowerCase();
  
  if (lower.includes('rust') || lower.includes('oxide')) {
    return 'Preserves base metal, no chemical waste';
  }
  if (lower.includes('paint') || lower.includes('coating')) {
    return 'No substrate damage, no chemical stripping';
  }
  if (lower.includes('scale')) {
    return 'No warping, maintains surface finish';
  }
  if (lower.includes('carbon')) {
    return 'Selective removal, substrate intact';
  }
  
  return 'No substrate damage, environmentally safe';
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
 * Structure: Method-focused with removal efficiency and substrate protection
 * Target: 155-160 characters (no mobile truncation)
 */
export function formatContaminantDescription(config: MetadataConfig): string {
  if (config.customDescription) return config.customDescription;
  
  const { materialName, machineSettings } = config;
  
  // Extract technical specs
  const wavelength = machineSettings?.wavelength?.value;
  const passes = machineSettings?.passCount?.value;
  
  // Clean up contaminant name (remove "/" suffixes)
  const cleanName = materialName.split('/')[0].trim();
  
  // Build method-focused description: [Contaminant] → [Efficiency] → [Benefit]
  let desc = `${cleanName}: `;
  
  // Add absorption/efficiency metrics
  const efficiency = getContaminantEfficiency(cleanName);
  desc += efficiency;
  
  // Add wavelength if available
  if (wavelength && desc.length < 60) {
    desc += ` at ${wavelength}nm`;
  }
  
  // Add pass count for removal
  if (passes && desc.length < 80) {
    desc += `. ${passes} passes for complete removal`;
  } else if (desc.length < 90) {
    desc += '. Complete removal';
  }
  
  // Add substrate protection benefit
  const protection = getSubstrateProtection(cleanName);
  if (desc.length < 120) {
    desc += `. ${protection}`;
  }
  
  return truncateDescription(desc, 160);
}
