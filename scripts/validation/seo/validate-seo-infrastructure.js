#!/usr/bin/env node

/**
 * SEO Infrastructure Comprehensive Validation
 * 
 * Validates all components of the SEO Infrastructure layer:
 * - Metadata (title tags, meta descriptions)
 * - Structured Data (JSON-LD Schema.org markup)
 * - Dataset Quality (SEO-critical data completeness) ⭐ INTEGRAL TO SEO STRATEGY
 * - Sitemaps (XML crawler navigation)
 * - Open Graph (social media previews)
 * - Breadcrumbs (navigation hierarchy)
 * - Canonical URLs (deduplication)
 * 
 * This is the master validator that orchestrates all SEO Infrastructure checks
 * to ensure complete coverage of browser-based enhancements for discoverability.
 * 
 * Dataset Quality Policy:
 * Datasets are INTEGRAL to our SEO strategy. Incomplete datasets damage E-E-A-T
 * signals, user trust, and search engine credibility. This validator enforces
 * the Dataset Quality Policy by ensuring that if a Dataset schema exists on a
 * material/settings page, the underlying data meets minimum completeness standards
 * (8 required machine settings parameters with min/max values, 80%+ material properties).
 * 
 * @see docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md
 * @see docs/01-core/DATASET_QUALITY_POLICY.md
 * 
 * Usage:
 *   npm run validate:seo-infrastructure
 *   node scripts/validation/seo/validate-seo-infrastructure.js
 *   node scripts/validation/seo/validate-seo-infrastructure.js --verbose
 *   node scripts/validation/seo/validate-seo-infrastructure.js --json
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Critical SEO Infrastructure issues found (including Dataset quality violations)
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Dataset validation constants (inline to avoid TypeScript module issues)
const TIER1_REQUIRED_PARAMETERS = [
  'laserPower',
  'wavelength',
  'spotSize',
  'frequency',
  'pulseWidth',
  'scanSpeed',
  'passCount',
  'overlapRatio'
];

const TIER2_IMPORTANT_PROPERTIES = {
  thermal: ['meltingPoint', 'thermalConductivity', 'heatCapacity'],
  optical: ['absorptivity', 'reflectivity', 'emissivity'],
  mechanical: ['density', 'hardness', 'tensileStrength'],
  chemical: ['composition', 'oxidationResistance']
};

// Inline dataset validation functions
function hasMinMaxValues(paramData) {
  if (!paramData || typeof paramData !== 'object') return false;
  return (
    typeof paramData.min === 'number' &&
    typeof paramData.max === 'number' &&
    !isNaN(paramData.min) &&
    !isNaN(paramData.max)
  );
}

function calculateTier2Completeness(materialProperties) {
  if (!materialProperties || typeof materialProperties !== 'object') return 0;
  
  let totalProperties = 0;
  let completeProperties = 0;
  
  Object.entries(TIER2_IMPORTANT_PROPERTIES).forEach(([category, properties]) => {
    const categoryData = materialProperties[category];
    if (!categoryData) return;
    
    properties.forEach(prop => {
      totalProperties++;
      const propData = categoryData[prop];
      if (propData && propData.value !== undefined && propData.value !== null) {
        completeProperties++;
      }
    });
  });
  
  return totalProperties === 0 ? 0 : Math.round((completeProperties / totalProperties) * 100);
}

/**
 * Validate Dataset schema URL requirements per Google structured data guidelines
 * @see https://developers.google.com/search/docs/appearance/structured-data/dataset
 * 
 * Required Properties:
 * - name: Name of the dataset
 * - description: Description of the dataset
 * - url: URL of the dataset page (for proper indexing and deduplication)
 * 
 * Recommended Properties:
 * - distribution: Array of DataDownload with contentUrl
 * - license: URL or CreativeWork with URL
 * - creator/author: Organization or Person
 */
function validateDatasetUrlRequirements(schema, pageInfo) {
  const datasetName = schema.name || 'Unknown Dataset';
  
  // Required: url property (critical for Google indexing)
  if (!schema.url) {
    addResult('datasetQuality', 'error', 
      `Dataset "${datasetName}" missing required 'url' property on ${pageInfo.name}`, 
      pageInfo.url
    );
    addResult('datasetQuality', 'error', 
      `  ⚠️  Google requires 'url' for Dataset schema indexing`, 
      pageInfo.url
    );
  } else {
    // Validate URL format
    try {
      const url = new URL(schema.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        addResult('datasetQuality', 'warning', 
          `Dataset URL should use https:// protocol: ${schema.url}`, 
          pageInfo.url
        );
      } else {
        addResult('datasetQuality', 'passed', 
          `Dataset has valid url: ${schema.url}`, 
          pageInfo.url
        );
      }
    } catch (e) {
      addResult('datasetQuality', 'error', 
        `Dataset has invalid url format: ${schema.url}`, 
        pageInfo.url
      );
    }
  }
  
  // Required: name property
  if (!schema.name) {
    addResult('datasetQuality', 'error', 
      `Dataset missing required 'name' property on ${pageInfo.name}`, 
      pageInfo.url
    );
  }
  
  // Required: description property
  if (!schema.description) {
    addResult('datasetQuality', 'error', 
      `Dataset missing required 'description' property on ${pageInfo.name}`, 
      pageInfo.url
    );
  }
  
  // Recommended: distribution with contentUrl
  if (schema.distribution) {
    const distributions = Array.isArray(schema.distribution) 
      ? schema.distribution 
      : [schema.distribution];
    
    let hasValidDistribution = false;
    for (const dist of distributions) {
      if (dist.contentUrl) {
        hasValidDistribution = true;
        // Validate contentUrl format
        try {
          new URL(dist.contentUrl);
        } catch (e) {
          addResult('datasetQuality', 'warning', 
            `Distribution has invalid contentUrl: ${dist.contentUrl}`, 
            pageInfo.url
          );
        }
      }
    }
    
    if (hasValidDistribution) {
      addResult('datasetQuality', 'passed', 
        `Dataset has ${distributions.length} download distribution(s) with contentUrl`, 
        pageInfo.url
      );
    } else {
      addResult('datasetQuality', 'warning', 
        `Dataset distributions missing 'contentUrl' property (recommended for downloads)`, 
        pageInfo.url
      );
    }
  } else {
    addResult('datasetQuality', 'warning', 
      `Dataset missing 'distribution' property (recommended for download links)`, 
      pageInfo.url
    );
  }
  
  // Recommended: license
  if (!schema.license) {
    addResult('datasetQuality', 'warning', 
      `Dataset missing 'license' property (recommended for data provenance)`, 
      pageInfo.url
    );
  } else {
    const licenseUrl = typeof schema.license === 'string' 
      ? schema.license 
      : schema.license?.url;
    if (licenseUrl) {
      addResult('datasetQuality', 'passed', 
        `Dataset has license: ${licenseUrl}`, 
        pageInfo.url
      );
    }
  }
  
  // Recommended: creator or author
  if (!schema.creator && !schema.author) {
    addResult('datasetQuality', 'warning', 
      `Dataset missing 'creator' or 'author' property (recommended for E-E-A-T)`, 
      pageInfo.url
    );
  }
}

function validateDatasetForSchema(machineSettings, materialProperties, materialName) {
  const missing = [];
  const warnings = [];
  
  // Tier 1: Check all required parameters have min/max
  for (const param of TIER1_REQUIRED_PARAMETERS) {
    const paramData = machineSettings?.[param];
    if (!hasMinMaxValues(paramData)) {
      missing.push(param);
    }
  }
  
  // Calculate Tier 2 completeness
  const tier2Completeness = materialProperties 
    ? calculateTier2Completeness(materialProperties)
    : 0;
  
  // Add warnings for low Tier 2 completeness
  if (tier2Completeness > 0 && tier2Completeness < 80) {
    warnings.push(`Low material property completeness: ${tier2Completeness}%`);
  }
  
  return {
    valid: missing.length === 0,
    missing,
    tier2Completeness,
    warnings,
    reason: missing.length > 0 
      ? `Missing required parameters: ${missing.join(', ')}`
      : undefined
  };
}

// Configuration
// Production URL Policy: Default to production domain (see docs/08-development/PRODUCTION_URL_POLICY.md)
// For local testing, use: BASE_URL=http://localhost:3000 npm run validate:seo-infrastructure
const BASE_URL = process.env.BASE_URL || 'https://www.z-beam.com';
const VERBOSE = process.argv.includes('--verbose');
const JSON_OUTPUT = process.argv.includes('--json');

// Test pages representing different content types
// URLs updated Dec 2025 to match actual route structure
const TEST_PAGES = [
  { url: '/', type: 'home', name: 'Homepage' },
  { url: '/materials/metal/non-ferrous/aluminum-laser-cleaning', type: 'material', name: 'Material Page' },
  { url: '/settings/metal/non-ferrous/aluminum-settings', type: 'settings', name: 'Settings Page' },
  { url: '/contaminants/oxidation/ferrous/rust-oxidation-contamination', type: 'contaminant', name: 'Contaminant Page' },
  { url: '/contaminants/oxidation', type: 'contaminant-category', name: 'Contaminant Category' },
  { url: '/contaminants/oxidation/ferrous', type: 'contaminant-subcategory', name: 'Contaminant Subcategory' },
  { url: '/services', type: 'service', name: 'Services Page' },
  { url: '/about', type: 'static', name: 'Static Page' }
];

// Validation thresholds
const THRESHOLDS = {
  metadata: {
    minTitleLength: 30,
    maxTitleLength: 60,
    minDescriptionLength: 120,
    maxDescriptionLength: 160
  },
  schema: {
    minSchemaTypes: 2,  // Minimum schema types per page
    requiredProperties: ['@context', '@type', 'name']
  },
  opengraph: {
    requiredTags: ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']
  },
  sitemap: {
    maxEntries: 10000,
    requirePriority: true,
    requireChangeFreq: true
  },
  dataset: {
    tier1Required: 8,  // All 8 required parameters must have min/max
    tier2Threshold: 80,  // 80%+ material properties completeness
    enforceQuality: true  // Block incomplete datasets from SEO
  }
};

// Results tracking
const results = {
  metadata: { passed: 0, warnings: 0, errors: 0, details: [] },
  structuredData: { passed: 0, warnings: 0, errors: 0, details: [] },
  datasetQuality: { passed: 0, warnings: 0, errors: 0, details: [] },
  sitemaps: { passed: 0, warnings: 0, errors: 0, details: [] },
  openGraph: { passed: 0, warnings: 0, errors: 0, details: [] },
  breadcrumbs: { passed: 0, warnings: 0, errors: 0, details: [] },
  canonicals: { passed: 0, warnings: 0, errors: 0, details: [] },
  opportunities: { detected: 0, suggestions: [] },
  overall: { score: 0, grade: 'F' }
};

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  if (JSON_OUTPUT) return;
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}${message}${colors.reset}`);
}

function verbose(message) {
  if (VERBOSE && !JSON_OUTPUT) {
    console.log(`  ${colors.cyan}ℹ ${message}${colors.reset}`);
  }
}

function addResult(category, type, message, context = '') {
  results[category][type === 'error' ? 'errors' : type === 'warning' ? 'warnings' : 'passed']++;
  results[category].details.push({ type, message, context });
  
  if (!JSON_OUTPUT) {
    const icon = type === 'passed' ? '✅' : type === 'warning' ? '⚠️' : '❌';
    const color = type === 'passed' ? 'green' : type === 'warning' ? 'yellow' : 'red';
    log(`   ${icon} ${message}`, color);
    if (context && VERBOSE) {
      verbose(`Context: ${context}`);
    }
  }
}

async function checkServerAvailability() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function validateMetadata(page, pageInfo) {
  verbose(`Checking metadata for ${pageInfo.name}...`);
  
  // Get title
  const title = await page.title();
  if (!title) {
    addResult('metadata', 'error', `Missing title tag on ${pageInfo.name}`, pageInfo.url);
  } else if (title.length < THRESHOLDS.metadata.minTitleLength) {
    addResult('metadata', 'warning', `Title too short (${title.length} chars) on ${pageInfo.name}: "${title}"`, pageInfo.url);
  } else if (title.length > THRESHOLDS.metadata.maxTitleLength) {
    addResult('metadata', 'warning', `Title too long (${title.length} chars) on ${pageInfo.name}: "${title}"`, pageInfo.url);
  } else {
    addResult('metadata', 'passed', `Title optimized (${title.length} chars) on ${pageInfo.name}`, pageInfo.url);
  }
  
  // Get meta description
  const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
  if (!description) {
    addResult('metadata', 'error', `Missing meta description on ${pageInfo.name}`, pageInfo.url);
  } else if (description.length < THRESHOLDS.metadata.minDescriptionLength) {
    addResult('metadata', 'warning', `Description too short (${description.length} chars) on ${pageInfo.name}`, pageInfo.url);
  } else if (description.length > THRESHOLDS.metadata.maxDescriptionLength) {
    addResult('metadata', 'warning', `Description too long (${description.length} chars) on ${pageInfo.name}`, pageInfo.url);
  } else {
    addResult('metadata', 'passed', `Description optimized (${description.length} chars) on ${pageInfo.name}`, pageInfo.url);
  }
  
  // Check viewport
  const viewport = await page.$eval('meta[name="viewport"]', el => el.content).catch(() => null);
  if (!viewport) {
    addResult('metadata', 'error', `Missing viewport meta tag on ${pageInfo.name}`, pageInfo.url);
  } else {
    addResult('metadata', 'passed', `Viewport meta tag present on ${pageInfo.name}`, pageInfo.url);
  }
}

async function validateStructuredData(page, pageInfo) {
  verbose(`Checking structured data for ${pageInfo.name}...`);
  
  const jsonldScripts = await page.$$eval('script[type="application/ld+json"]', scripts => 
    scripts.map(script => {
      try {
        return JSON.parse(script.textContent);
      } catch (e) {
        return null;
      }
    }).filter(Boolean)
  );
  
  if (jsonldScripts.length === 0) {
    addResult('structuredData', 'error', `No JSON-LD structured data found on ${pageInfo.name}`, pageInfo.url);
    await detectSchemaOpportunities(page, pageInfo);
    return;
  }
  
  verbose(`Found ${jsonldScripts.length} JSON-LD blocks`);
  
  // Collect all schema types for opportunity detection
  // Include types from both root-level schemas AND @graph schemas
  const schemaTypes = [];
  for (const schema of jsonldScripts) {
    if (schema['@type']) {
      schemaTypes.push(schema['@type']);
    }
    if (schema['@graph'] && Array.isArray(schema['@graph'])) {
      for (const graphSchema of schema['@graph']) {
        if (graphSchema['@type']) {
          schemaTypes.push(graphSchema['@type']);
        }
      }
    }
  }
  const flatSchemaTypes = schemaTypes.flat();
  
  // Validate each schema
  for (const schema of jsonldScripts) {
    // Check for @context
    if (!schema['@context']) {
      addResult('structuredData', 'error', `Missing @context in JSON-LD on ${pageInfo.name}`, pageInfo.url);
      continue;
    }
    
    // Check for @type OR @graph (both are valid JSON-LD structures)
    // @graph format contains multiple schemas in an array
    if (!schema['@type'] && !schema['@graph']) {
      addResult('structuredData', 'error', `Missing @type in JSON-LD on ${pageInfo.name}`, pageInfo.url);
      continue;
    }
    
    // Handle @graph format (array of schemas)
    if (schema['@graph']) {
      const graphSchemas = schema['@graph'];
      const graphTypes = graphSchemas.map(s => s['@type']).filter(Boolean);
      if (graphTypes.length > 0) {
        addResult('structuredData', 'passed', `Valid @graph with ${graphTypes.length} schemas (${graphTypes.join(', ')}) on ${pageInfo.name}`, pageInfo.url);
        
        // Validate Dataset schemas within @graph
        for (const graphSchema of graphSchemas) {
          if (graphSchema['@type'] === 'Dataset') {
            validateDatasetUrlRequirements(graphSchema, pageInfo);
          }
        }
      } else {
        addResult('structuredData', 'warning', `@graph found but no @type in schemas on ${pageInfo.name}`, pageInfo.url);
      }
      continue;
    }
    
    addResult('structuredData', 'passed', `Valid ${schema['@type']} schema on ${pageInfo.name}`, pageInfo.url);
    
    // Dataset URL Requirements Validation (Google structured data requirements)
    // Required: url, name, description; Recommended: distribution with contentUrl
    if (schema['@type'] === 'Dataset') {
      validateDatasetUrlRequirements(schema, pageInfo);
    }
    
    // Content-specific validation
    if (pageInfo.type === 'material' || pageInfo.type === 'settings') {
      const expectedTypes = ['TechnicalArticle', 'Dataset', 'FAQPage', 'HowTo'];
      const hasExpectedType = expectedTypes.some(type => 
        schema['@type'] === type || (Array.isArray(schema['@type']) && schema['@type'].includes(type))
      );
      
      if (hasExpectedType) {
        addResult('structuredData', 'passed', `Content-appropriate ${schema['@type']} schema on ${pageInfo.name}`, pageInfo.url);
      }
    }
  }
  
  // Check total schema richness
  if (jsonldScripts.length >= THRESHOLDS.schema.minSchemaTypes) {
    addResult('structuredData', 'passed', `Rich structured data (${jsonldScripts.length} schemas) on ${pageInfo.name}`, pageInfo.url);
  } else {
    addResult('structuredData', 'warning', `Limited structured data (${jsonldScripts.length} schemas) on ${pageInfo.name}`, pageInfo.url);
  }
  
  // Detect missing schema opportunities
  await detectSchemaOpportunities(page, pageInfo, flatSchemaTypes);
  
  // Validate Dataset quality for material/settings pages
  if (pageInfo.type === 'material' || pageInfo.type === 'settings') {
    await validateDatasetQuality(page, pageInfo, flatSchemaTypes);
  }
}

async function validateDatasetQuality(page, pageInfo, schemaTypes) {
  verbose(`Checking Dataset quality for ${pageInfo.name}...`);
  
  // Check if page has Dataset schema
  const hasDatasetSchema = schemaTypes.includes('Dataset');
  
  if (!hasDatasetSchema) {
    addResult('datasetQuality', 'warning', `No Dataset schema on ${pageInfo.name} - content may be incomplete`, pageInfo.url);
    verbose('Dataset schema missing may indicate incomplete machine settings or material properties');
    return;
  }
  
  // Extract material/settings/contaminant name from URL
  // URL structure: /materials/category/subcategory/material-slug
  // URL structure: /settings/category/subcategory/material-settings
  // URL structure: /contaminants/category/subcategory/contaminant-slug
  const pageData = await page.evaluate(() => {
    const url = window.location.pathname;
    
    // Extract the final slug from the URL path
    // /materials/metal/non-ferrous/aluminum-laser-cleaning -> aluminum-laser-cleaning
    // /settings/metal/non-ferrous/aluminum-settings -> aluminum (strip -settings suffix)
    // /contaminants/industrial/chemical/rust-contamination -> rust-contamination
    const pathParts = url.split('/').filter(Boolean);
    const lastSegment = pathParts[pathParts.length - 1];
    
    let name = null;
    let type = null;
    
    if (url.includes('/materials/')) {
      type = 'materials';
      name = lastSegment; // e.g., "aluminum-laser-cleaning"
    } else if (url.includes('/settings/')) {
      type = 'settings';
      // Settings slugs end with "-settings", extract material name
      name = lastSegment.replace(/-settings$/, '') + '-laser-cleaning'; // e.g., "aluminum-laser-cleaning"
    } else if (url.includes('/contaminants/')) {
      type = 'contaminants';
      name = lastSegment; // e.g., "rust-contamination"
    }
    
    return { name, type, url };
  });
  
  if (!pageData.name || !pageData.type) {
    addResult('datasetQuality', 'warning', `Could not extract page type/name from ${pageInfo.name}`, pageInfo.url);
    return;
  }
  
  // Load frontmatter data by type (FUNCTIONAL REQUIREMENT - Nov 29, 2025)
  // machineSettings (Tier 1): ALWAYS from settings frontmatter
  // materialProperties (Tier 2): From materials frontmatter
  
  let machineSettings = null;
  let materialProperties = null;
  let machineSettingsPath = null;
  let materialPropertiesPath = null;
  
  // Extract base material name (without -laser-cleaning suffix) for settings lookup
  // e.g., "aluminum-laser-cleaning" -> "aluminum"
  const baseMaterialName = pageData.name.replace(/-laser-cleaning$/, '');
  
  // 1. Load machineSettings from settings frontmatter
  const settingsPath = path.join(process.cwd(), 'frontmatter', 'settings', `${baseMaterialName}-settings.yaml`);
  try {
    const yamlContent = await fs.readFile(settingsPath, 'utf-8');
    const settingsData = parseSimpleYAML(yamlContent);
    machineSettings = settingsData.machineSettings || {};
    machineSettingsPath = settingsPath;
    verbose(`Loaded machineSettings from: ${path.basename(settingsPath)}`);
  } catch (error) {
    verbose(`machineSettings not found in settings frontmatter: ${path.basename(settingsPath)}`);
  }
  
  // 2. Load materialProperties from materials frontmatter
  // pageData.name already has -laser-cleaning suffix (e.g., "aluminum-laser-cleaning")
  const materialPath = path.join(process.cwd(), 'frontmatter', 'materials', `${pageData.name}.yaml`);
  try {
    const yamlContent = await fs.readFile(materialPath, 'utf-8');
    const materialData = parseSimpleYAML(yamlContent);
    materialProperties = materialData.materialProperties || materialData.properties || {};
    materialPropertiesPath = materialPath;
    verbose(`Loaded materialProperties from: ${path.basename(materialPath)}`);
  } catch (error) {
    verbose(`materialProperties not found in materials frontmatter: ${path.basename(materialPath)}`);
  }
  
  // If no data loaded, report warning
  if (!machineSettings && !materialProperties) {
    addResult('datasetQuality', 'warning', 
      `Could not load frontmatter for ${pageData.name} - checked settings and materials`, 
      pageInfo.url
    );
    verbose(`Checked: ${path.basename(settingsPath)}, ${path.basename(materialPath)}`);
    return;
  }
  
  // Validate dataset completeness
  const validation = validateDatasetForSchema(
    machineSettings || {},
    materialProperties || {},
    pageData.name
  );
  
  if (validation.valid) {
    const sources = [];
    if (machineSettingsPath) sources.push(`machineSettings: ${path.basename(machineSettingsPath)}`);
    if (materialPropertiesPath) sources.push(`materialProperties: ${path.basename(materialPropertiesPath)}`);
    
    addResult('datasetQuality', 'passed', 
      `✅ Dataset quality PASSED for ${pageData.name} (${sources.join(', ')})`, 
      pageInfo.url
    );
    verbose(`Tier 1: Complete (8/8 parameters with min/max)`);
    verbose(`Tier 2: ${validation.tier2Completeness.toFixed(1)}% material properties`);
  } else {
    const sourcesChecked = [
      `settings: ${path.basename(settingsPath)}`,
      `materials: ${path.basename(materialPath)}`
    ];
    
    addResult('datasetQuality', 'error', 
      `❌ Dataset quality FAILED for ${pageData.name} (checked: ${sourcesChecked.join(', ')})`, 
      pageInfo.url
    );
    
    // Add detailed validation errors
    if (validation.missing.length > 0) {
      addResult('datasetQuality', 'error', 
        `  Missing parameters: ${validation.missing.join(', ')}`, 
        pageInfo.url
      );
      const checkedPaths = [settingsPath, materialPath].filter(Boolean);
      if (checkedPaths.length > 0) {
        addResult('datasetQuality', 'error', 
          `  📁 Frontmatter checked: ${checkedPaths.map(p => path.basename(p)).join(', ')}`, 
          pageInfo.url
        );
      }
    }
    
    for (const warning of validation.warnings) {
      addResult('datasetQuality', 'warning', `  ${warning}`, pageInfo.url);
    }
    
    // Critical SEO policy violation
    addResult('datasetQuality', 'error', 
      `🚨 SEO POLICY VIOLATION: Dataset schema present but data quality fails minimum standards`, 
      pageInfo.url
    );
    addResult('datasetQuality', 'error', 
      `   This damages E-E-A-T signals and search engine credibility`, 
      pageInfo.url
    );
    addResult('datasetQuality', 'error', 
      `   ACTION: Complete missing data in frontmatter OR remove Dataset schema (see DATASET_SEO_POLICY.md)`, 
      pageInfo.url
    );
  }
}

// Simple YAML parser for frontmatter extraction (production should use 'yaml' package)
// Handles nested properties for machine settings and material properties
function parseSimpleYAML(content) {
  const lines = content.split('\n');
  const data = { 
    machineSettings: {}, 
    materialProperties: {},
    properties: {}  // Alternative location for properties
  };
  
  let currentSection = null;
  let currentKey = null;
  let currentSubsection = null;
  let indentLevel = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const indent = line.search(/\S/);
    
    // Top-level sections (handle both camelCase and snake_case)
    if (line.match(/^(machineSettings|machine_settings):/)) {
      currentSection = 'machineSettings';
      currentKey = null;
      currentSubsection = null;
      indentLevel = indent;
    } else if (line.match(/^materialProperties:|^properties:/)) {
      currentSection = line.includes('materialProperties') ? 'materialProperties' : 'properties';
      currentKey = null;
      currentSubsection = null;
      indentLevel = indent;
    }
    // Parameter keys (2 spaces indent from section)
    else if (currentSection && indent === indentLevel + 2 && line.includes(':')) {
      const match = line.match(/^\s+([a-zA-Z_]+):/);
      if (match) {
        currentKey = match[1];
        if (!data[currentSection][currentKey]) {
          data[currentSection][currentKey] = {};
        }
        currentSubsection = null;
      }
    }
    // Subsections like thermal, optical, etc (2 spaces indent)
    else if (currentSection === 'materialProperties' && indent === indentLevel + 2 && line.includes(':') && !line.includes('percentage')) {
      const match = line.match(/^\s+([a-zA-Z_]+):/);
      if (match && !['thermal', 'optical', 'mechanical', 'chemical', 'laser_material_interaction'].includes(match[1])) {
        currentSubsection = match[1];
        if (!data[currentSection][currentSubsection]) {
          data[currentSection][currentSubsection] = {};
        }
        currentKey = null;
      } else if (match) {
        currentSubsection = match[1];
        data[currentSection][currentSubsection] = {};
        currentKey = null;
      }
    }
    // Property values within subsections (4+ spaces indent)
    else if (currentSection && currentSubsection && indent >= indentLevel + 4) {
      const propMatch = line.match(/^\s+([a-zA-Z_]+):/);
      if (propMatch) {
        const propKey = propMatch[1];
        if (!data[currentSection][currentSubsection][propKey]) {
          data[currentSection][currentSubsection][propKey] = {};
        }
        currentKey = propKey;
      }
      // Value fields (min, max, value, unit)
      const valueMatch = line.match(/^\s+(min|max|value|unit|source):\s*(.+)/);
      if (valueMatch && currentKey) {
        const field = valueMatch[1];
        let value = valueMatch[2].trim();
        // Parse numbers
        if (!isNaN(value) && value !== '') {
          value = parseFloat(value);
        }
        data[currentSection][currentSubsection][currentKey][field] = value;
      }
    }
    // Property values directly under parameter key (4 spaces indent)
    else if (currentSection && currentKey && !currentSubsection && indent >= indentLevel + 4) {
      const valueMatch = line.match(/^\s+(min|max|value|unit|source):\s*(.+)/);
      if (valueMatch) {
        const field = valueMatch[1];
        let value = valueMatch[2].trim();
        // Parse numbers
        if (!isNaN(value) && value !== '') {
          value = parseFloat(value);
        }
        data[currentSection][currentKey][field] = value;
      }
    }
  }
  
  return data;
}

async function detectSchemaOpportunities(page, pageInfo, existingSchemaTypes = []) {
  verbose(`Scanning for schema opportunities on ${pageInfo.name}...`);
  
  const opportunities = await page.evaluate(() => {
    const found = [];
    
    // Detect FAQ patterns
    const hasFAQHeading = Array.from(document.querySelectorAll('h1, h2, h3, h4')).some(h => 
      /faq|frequently asked|common questions/i.test(h.textContent)
    );
    const questionElements = document.querySelectorAll('[aria-expanded], details, .accordion, .faq-item, h3, h4');
    const questionCount = Array.from(questionElements).filter(el => 
      /^(what|how|why|when|where|can|is|are|does|do)\b/i.test(el.textContent?.trim())
    ).length;
    
    if ((hasFAQHeading || questionCount >= 3) && questionCount >= 2) {
      found.push({
        type: 'FAQPage',
        reason: `Detected ${questionCount} question pattern(s)${hasFAQHeading ? ' and FAQ heading' : ''}`,
        benefit: 'FAQ rich snippets in search results'
      });
    }
    
    // Detect HowTo/Tutorial patterns
    const hasHowToHeading = Array.from(document.querySelectorAll('h1, h2, h3')).some(h => 
      /how to|tutorial|guide|step.by.step|instructions/i.test(h.textContent)
    );
    const orderedLists = document.querySelectorAll('ol');
    const stepPatterns = document.querySelectorAll('[class*="step"], [id*="step"]');
    const stepCount = Math.max(orderedLists.length, stepPatterns.length);
    
    if ((hasHowToHeading || stepCount >= 3) && stepCount >= 3) {
      found.push({
        type: 'HowTo',
        reason: `Detected ${stepCount} step pattern(s)${hasHowToHeading ? ' and how-to heading' : ''}`,
        benefit: 'HowTo rich snippets with step-by-step display'
      });
    }
    
    // Detect video embeds
    const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"], [class*="video"]');
    if (videos.length > 0) {
      found.push({
        type: 'VideoObject',
        reason: `Detected ${videos.length} video embed(s)`,
        benefit: 'Video rich snippets with thumbnails and duration'
      });
    }
    
    // Detect product/material indicators
    const hasPrice = document.querySelector('[itemprop="price"], .price, [class*="price"]');
    const hasRating = document.querySelector('[itemprop="rating"], .rating, [class*="rating"]');
    const hasBuyButton = Array.from(document.querySelectorAll('button, a')).some(el => 
      /buy|purchase|order|quote|rent/i.test(el.textContent)
    );
    
    if (hasPrice || hasRating || hasBuyButton) {
      found.push({
        type: 'Product',
        reason: `Detected product indicators (${[hasPrice && 'price', hasRating && 'rating', hasBuyButton && 'buy button'].filter(Boolean).join(', ')})`,
        benefit: 'Product rich snippets with price, availability, and ratings'
      });
    }
    
    // Detect article/blog patterns
    const hasArticleStructure = document.querySelector('article');
    const hasByline = document.querySelector('[class*="author"], [class*="byline"], [rel="author"]');
    const hasPublishDate = document.querySelector('time[datetime], [class*="publish"], [class*="date"]');
    
    if (hasArticleStructure && (hasByline || hasPublishDate)) {
      found.push({
        type: 'Article',
        reason: 'Detected article structure with author/date metadata',
        benefit: 'Article rich snippets with author and publish date'
      });
    }
    
    // Detect review/rating patterns
    const reviewElements = document.querySelectorAll('[class*="review"], [class*="testimonial"]');
    const starRatings = document.querySelectorAll('[class*="star"], [class*="rating"]');
    
    if (reviewElements.length >= 2 || starRatings.length >= 1) {
      found.push({
        type: 'Review/AggregateRating',
        reason: `Detected ${reviewElements.length} review(s) or ${starRatings.length} rating element(s)`,
        benefit: 'Star ratings in search results'
      });
    }
    
    return found;
  });
  
  // Filter out schemas that already exist
  const missingOpportunities = opportunities.filter(opp => 
    !existingSchemaTypes.includes(opp.type)
  );
  
  // Add opportunities to results
  for (const opportunity of missingOpportunities) {
    results.opportunities.detected++;
    results.opportunities.suggestions.push({
      page: pageInfo.name,
      url: pageInfo.url,
      ...opportunity
    });
    
    if (!JSON_OUTPUT) {
      log(`   💡 Opportunity: Add ${opportunity.type} schema`, 'cyan');
      verbose(`Reason: ${opportunity.reason}`);
      verbose(`Benefit: ${opportunity.benefit}`);
    }
  }
}

async function validateOpenGraph(page, pageInfo) {
  verbose(`Checking Open Graph tags for ${pageInfo.name}...`);
  
  const ogTags = await page.$$eval('meta[property^="og:"]', metas => 
    metas.reduce((acc, meta) => {
      acc[meta.getAttribute('property')] = meta.content;
      return acc;
    }, {})
  );
  
  for (const requiredTag of THRESHOLDS.opengraph.requiredTags) {
    if (!ogTags[requiredTag]) {
      addResult('openGraph', 'error', `Missing ${requiredTag} on ${pageInfo.name}`, pageInfo.url);
    } else {
      addResult('openGraph', 'passed', `${requiredTag} present on ${pageInfo.name}`, pageInfo.url);
    }
  }
  
  // Check Twitter Card
  const twitterCard = await page.$eval('meta[name="twitter:card"]', el => el.content).catch(() => null);
  if (!twitterCard) {
    addResult('openGraph', 'warning', `Missing Twitter Card meta tag on ${pageInfo.name}`, pageInfo.url);
  } else {
    addResult('openGraph', 'passed', `Twitter Card (${twitterCard}) present on ${pageInfo.name}`, pageInfo.url);
  }
}

async function validateBreadcrumbs(page, pageInfo) {
  verbose(`Checking breadcrumbs for ${pageInfo.name}...`);
  
  // Check for breadcrumb JSON-LD (both standalone and within @graph)
  const breadcrumbSchema = await page.$$eval('script[type="application/ld+json"]', scripts => {
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        // Check standalone BreadcrumbList
        if (data['@type'] === 'BreadcrumbList') {
          return data;
        }
        // Check BreadcrumbList inside @graph
        if (data['@graph'] && Array.isArray(data['@graph'])) {
          for (const item of data['@graph']) {
            if (item['@type'] === 'BreadcrumbList') {
              return item;
            }
          }
        }
      } catch (e) {}
    }
    return null;
  });
  
  if (!breadcrumbSchema) {
    if (pageInfo.url === '/') {
      addResult('breadcrumbs', 'passed', `Breadcrumbs not required on ${pageInfo.name}`, pageInfo.url);
    } else {
      addResult('breadcrumbs', 'warning', `No BreadcrumbList schema on ${pageInfo.name}`, pageInfo.url);
    }
  } else {
    const itemCount = breadcrumbSchema.itemListElement?.length || 0;
    addResult('breadcrumbs', 'passed', `BreadcrumbList with ${itemCount} items on ${pageInfo.name}`, pageInfo.url);
  }
  
  // Check for visible breadcrumb navigation
  const hasBreadcrumbNav = await page.$('nav[aria-label="Breadcrumb"]').catch(() => null);
  if (!hasBreadcrumbNav && pageInfo.url !== '/') {
    addResult('breadcrumbs', 'warning', `No visible breadcrumb navigation on ${pageInfo.name}`, pageInfo.url);
  } else if (hasBreadcrumbNav) {
    addResult('breadcrumbs', 'passed', `Visible breadcrumb navigation on ${pageInfo.name}`, pageInfo.url);
  }
}

async function validateCanonical(page, pageInfo) {
  verbose(`Checking canonical URL for ${pageInfo.name}...`);
  
  const canonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null);
  
  if (!canonical) {
    addResult('canonicals', 'error', `Missing canonical link tag on ${pageInfo.name}`, pageInfo.url);
  } else {
    const expectedCanonical = `${BASE_URL}${pageInfo.url}`;
    if (canonical === expectedCanonical || canonical === expectedCanonical + '/') {
      addResult('canonicals', 'passed', `Correct canonical URL on ${pageInfo.name}`, pageInfo.url);
    } else {
      addResult('canonicals', 'warning', `Canonical mismatch on ${pageInfo.name}: ${canonical}`, pageInfo.url);
    }
  }
}

async function validateSitemap() {
  log('\n🗺️  Validating Sitemaps...', 'cyan');
  
  try {
    // Check if sitemap exists
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const sitemapExists = await fs.access(sitemapPath).then(() => true).catch(() => false);
    
    if (!sitemapExists) {
      // Try to fetch from running server
      try {
        const response = await fetch(`${BASE_URL}/sitemap.xml`);
        if (!response.ok) {
          addResult('sitemaps', 'error', 'Sitemap.xml not accessible', `${BASE_URL}/sitemap.xml`);
          return;
        }
        
        const sitemapContent = await response.text();
        
        // Parse and validate
        const urlMatches = sitemapContent.match(/<url>/g);
        const urlCount = urlMatches ? urlMatches.length : 0;
        
        if (urlCount === 0) {
          addResult('sitemaps', 'error', 'Sitemap contains no URLs', '');
        } else if (urlCount > THRESHOLDS.sitemap.maxEntries) {
          addResult('sitemaps', 'warning', `Sitemap has ${urlCount} URLs (max: ${THRESHOLDS.sitemap.maxEntries})`, '');
        } else {
          addResult('sitemaps', 'passed', `Sitemap contains ${urlCount} URLs`, '');
        }
        
        // Check for required elements
        if (THRESHOLDS.sitemap.requirePriority && !sitemapContent.includes('<priority>')) {
          addResult('sitemaps', 'warning', 'Sitemap missing <priority> tags', '');
        } else if (THRESHOLDS.sitemap.requirePriority) {
          addResult('sitemaps', 'passed', 'Sitemap includes priority tags', '');
        }
        
        if (THRESHOLDS.sitemap.requireChangeFreq && !sitemapContent.includes('<changefreq>')) {
          addResult('sitemaps', 'warning', 'Sitemap missing <changefreq> tags', '');
        } else if (THRESHOLDS.sitemap.requireChangeFreq) {
          addResult('sitemaps', 'passed', 'Sitemap includes changefreq tags', '');
        }
        
        // Check for lastmod
        if (sitemapContent.includes('<lastmod>')) {
          addResult('sitemaps', 'passed', 'Sitemap includes lastmod timestamps', '');
        }
        
      } catch (fetchError) {
        addResult('sitemaps', 'error', 'Failed to fetch sitemap.xml', fetchError.message);
      }
    } else {
      addResult('sitemaps', 'passed', 'Sitemap file exists in public directory', sitemapPath);
    }
    
    // Check for robots.txt
    try {
      const response = await fetch(`${BASE_URL}/robots.txt`);
      if (response.ok) {
        const robotsContent = await response.text();
        if (robotsContent.includes('Sitemap:')) {
          addResult('sitemaps', 'passed', 'Robots.txt references sitemap', '');
        } else {
          addResult('sitemaps', 'warning', 'Robots.txt missing sitemap reference', '');
        }
      } else {
        addResult('sitemaps', 'warning', 'Robots.txt not accessible', `${BASE_URL}/robots.txt`);
      }
    } catch (error) {
      addResult('sitemaps', 'warning', 'Failed to check robots.txt', error.message);
    }
    
  } catch (error) {
    addResult('sitemaps', 'error', 'Sitemap validation failed', error.message);
  }
}

function calculateScore() {
  const categories = ['metadata', 'structuredData', 'datasetQuality', 'sitemaps', 'openGraph', 'breadcrumbs', 'canonicals'];
  let totalScore = 0;
  
  for (const category of categories) {
    const { passed, warnings, errors } = results[category];
    const total = passed + warnings + errors;
    if (total === 0) continue;
    
    // Score: 100% for passed, 50% for warnings, 0% for errors
    // Dataset quality errors are CRITICAL for SEO strategy
    const categoryScore = ((passed * 100) + (warnings * 50)) / (total * 100);
    totalScore += categoryScore;
  }
  
  results.overall.score = Math.round((totalScore / categories.length) * 100);
  
  // Assign grade
  if (results.overall.score >= 95) results.overall.grade = 'A+';
  else if (results.overall.score >= 90) results.overall.grade = 'A';
  else if (results.overall.score >= 85) results.overall.grade = 'A-';
  else if (results.overall.score >= 80) results.overall.grade = 'B+';
  else if (results.overall.score >= 75) results.overall.grade = 'B';
  else if (results.overall.score >= 70) results.overall.grade = 'B-';
  else if (results.overall.score >= 65) results.overall.grade = 'C+';
  else if (results.overall.score >= 60) results.overall.grade = 'C';
  else if (results.overall.score >= 55) results.overall.grade = 'C-';
  else if (results.overall.score >= 50) results.overall.grade = 'D';
  else results.overall.grade = 'F';
}

function printReport() {
  if (JSON_OUTPUT) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  
  log('\n' + '='.repeat(80), 'bright');
  log('📊 SEO INFRASTRUCTURE VALIDATION REPORT', 'bright');
  log('='.repeat(80) + '\n', 'bright');
  
  const categories = [
    { key: 'metadata', name: '🏷️  Metadata (Titles, Descriptions)', icon: '🏷️' },
    { key: 'structuredData', name: '📋 Structured Data (JSON-LD Schema.org)', icon: '📋' },
    { key: 'datasetQuality', name: '📊 Dataset Quality (SEO-Critical Data)', icon: '📊' },
    { key: 'sitemaps', name: '🗺️  Sitemaps (XML, robots.txt)', icon: '🗺️' },
    { key: 'openGraph', name: '🖼️  Open Graph (Social Previews)', icon: '🖼️' },
    { key: 'breadcrumbs', name: '🧭 Breadcrumbs (Navigation)', icon: '🧭' },
    { key: 'canonicals', name: '🔗 Canonical URLs (Deduplication)', icon: '🔗' }
  ];
  
  for (const { key, name } of categories) {
    const { passed, warnings, errors } = results[key];
    const total = passed + warnings + errors;
    
    if (total === 0) continue;
    
    log(`\n${name}`, 'cyan');
    log('─'.repeat(80), 'cyan');
    log(`   ✅ Passed:   ${passed}`, 'green');
    if (warnings > 0) log(`   ⚠️  Warnings: ${warnings}`, 'yellow');
    if (errors > 0) log(`   ❌ Errors:   ${errors}`, 'red');
  }
  
  // Opportunities section
  if (results.opportunities.detected > 0) {
    log('\n💡 SCHEMA OPPORTUNITIES DETECTED', 'cyan');
    log('─'.repeat(80), 'cyan');
    log(`   Found ${results.opportunities.detected} opportunities to enhance SEO with additional schemas:\n`, 'bright');
    
    const groupedByType = {};
    results.opportunities.suggestions.forEach(opp => {
      if (!groupedByType[opp.type]) {
        groupedByType[opp.type] = [];
      }
      groupedByType[opp.type].push(opp);
    });
    
    for (const [type, opportunities] of Object.entries(groupedByType)) {
      log(`   📌 ${type} Schema (${opportunities.length} page${opportunities.length > 1 ? 's' : ''})`, 'magenta');
      opportunities.forEach(opp => {
        log(`      • ${opp.page}: ${opp.reason}`, 'cyan');
        verbose(`        Benefit: ${opp.benefit}`);
      });
    }
    
    log('\n   💡 These opportunities could improve your search visibility with rich snippets.', 'yellow');
    log('   📚 See: docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md for implementation guidance\n', 'cyan');
  }
  
  // Overall summary
  log('\n' + '='.repeat(80), 'bright');
  const scoreColor = results.overall.score >= 90 ? 'green' : results.overall.score >= 70 ? 'yellow' : 'red';
  log(`🎯 OVERALL SEO INFRASTRUCTURE SCORE: ${results.overall.score}/100 (Grade: ${results.overall.grade})`, scoreColor);
  log('='.repeat(80) + '\n', 'bright');
  
  // Recommendations
  const totalErrors = Object.values(results).reduce((sum, cat) => sum + (cat.errors || 0), 0);
  const totalWarnings = Object.values(results).reduce((sum, cat) => sum + (cat.warnings || 0), 0);
  
  if (totalErrors > 0) {
    log(`❌ Found ${totalErrors} critical issues that should be fixed.`, 'red');
  }
  if (totalWarnings > 0) {
    log(`⚠️  Found ${totalWarnings} warnings that should be reviewed.`, 'yellow');
  }
  if (results.opportunities.detected > 0) {
    log(`💡 Detected ${results.opportunities.detected} opportunities to enhance SEO with additional schemas.`, 'cyan');
  }
  if (totalErrors === 0 && totalWarnings === 0 && results.opportunities.detected === 0) {
    log('✅ SEO Infrastructure is fully optimized!', 'green');
  }
  
  log('\n📚 Documentation: docs/01-core/SEO_INFRASTRUCTURE_OVERVIEW.md\n', 'cyan');
}

async function main() {
  log('🚀 SEO Infrastructure Comprehensive Validation', 'bright');
  log('   Validating: Metadata, Structured Data, Dataset Quality, Sitemaps, Open Graph, Breadcrumbs, Canonicals\n', 'cyan');
  log('   📊 Dataset Quality: INTEGRAL to SEO strategy - enforcing completeness standards\n', 'magenta');
  
  // Check if server is running
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    log(`⚠️  Dev server not running at ${BASE_URL}`, 'yellow');
    log('   Starting minimal validation (sitemaps only)...\n', 'yellow');
    
    await validateSitemap();
    calculateScore();
    printReport();
    
    log('💡 For complete validation, start the dev server:', 'cyan');
    log('   npm run dev\n', 'cyan');
    
    return results.sitemaps.errors > 0 ? 1 : 0;
  }
  
  log(`✅ Server running at ${BASE_URL}\n`, 'green');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Validate sitemap first (doesn't require page visits)
    await validateSitemap();
    
    // Validate each test page
    for (const pageInfo of TEST_PAGES) {
      log(`\n🔍 Validating ${pageInfo.name} (${pageInfo.url})...`, 'cyan');
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      try {
        await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle0', timeout: 30000 });
        
        await validateMetadata(page, pageInfo);
        await validateStructuredData(page, pageInfo);
        await validateOpenGraph(page, pageInfo);
        await validateBreadcrumbs(page, pageInfo);
        await validateCanonical(page, pageInfo);
        
      } catch (error) {
        log(`   ❌ Failed to validate ${pageInfo.name}: ${error.message}`, 'red');
        addResult('metadata', 'error', `Page load failed for ${pageInfo.name}`, error.message);
      } finally {
        await page.close();
      }
    }
    
  } catch (error) {
    log(`\n❌ Validation failed: ${error.message}`, 'red');
    return 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  calculateScore();
  printReport();
  
  // Exit with error if critical issues found
  const totalErrors = Object.values(results).reduce((sum, cat) => sum + (cat.errors || 0), 0);
  return totalErrors > 0 ? 1 : 0;
}

if (require.main === module) {
  main()
    .then(code => process.exit(code))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { main, validateMetadata, validateStructuredData, validateOpenGraph };
