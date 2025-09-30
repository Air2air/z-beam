import 'server-only';
import fs from 'fs';
import path from 'path';

// Simple utility to load and populate comprehensive article schema
export function createJsonLdForArticle(articleData: any, slug: string) {
  const schemasDir = path.join(process.cwd(), 'app/utils/schemas');
  
  try {
    // Load comprehensive article schema template
    const schemaTemplate = JSON.parse(
      fs.readFileSync(path.join(schemasDir, 'comprehensive-article-schema.json'), 'utf8')
    );
    
    // Extract data from your article
    const metadata = articleData.metadata || {};
    const frontmatter = articleData.frontmatter || {};
    const properties = frontmatter.properties || {};
    const laserSettings = frontmatter.laserSettings || {};
    
    // Basic article info
    const title = metadata.title || frontmatter.title || 'Material Cleaning Guide';
    const description = metadata.description || frontmatter.description || `Comprehensive laser cleaning guide for ${title}`;
    const category = metadata.category || frontmatter.category || 'material';
    const keywords = metadata.keywords || frontmatter.keywords || [];
    const author = metadata.author || frontmatter.author || 'Z-Beam Technical Team';
    
    // Material properties
    const materialName = title.replace(/\s*Laser Cleaning$/i, '').replace(/\s*Cleaning$/i, '');
    const density = properties.density || '';
    const densityUnit = properties.densityUnit || 'g/cm³';
    const thermalConductivity = properties.thermalConductivity || '';
    const thermalUnit = properties.thermalConductivityUnit || 'W/m·K';
    const meltingPoint = properties.meltingPoint || '';
    const meltingPointUnit = properties.meltingPointUnit || '°C';
    
    // Laser parameters
    const laserType = laserSettings.type || 'Fiber';
    const laserPower = laserSettings.power || laserSettings.powerRange || '100';
    const laserWavelength = laserSettings.wavelength || '1064';
    
    // Process timing
    const processTime = '15';
    const cleaningTime = '10';
    
    // Applications
    const applications = frontmatter.applications || [];
    const primaryApp = applications[0] || 'Industrial Manufacturing';
    const secondaryApp = applications[1] || 'Surface Preparation';
    
    // Word count estimation (rough)
    const wordCount = articleData.content ? articleData.content.split(' ').length : 500;
    
    // Category display name
    const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1) + 's';
    
    // Get current date
    const currentDate = new Date().toISOString();
    const publishDate = metadata.datePublished || frontmatter.datePublished || currentDate;
    const modifiedDate = metadata.dateModified || frontmatter.lastModified || currentDate;
    
    // Replace all placeholders in the comprehensive schema
    const populatedSchema = JSON.stringify(schemaTemplate, null, 2)
      // Basic article info
      .replace(/{{SLUG}}/g, slug)
      .replace(/{{ARTICLE_TITLE}}/g, title)
      .replace(/{{ARTICLE_DESCRIPTION}}/g, description)
      .replace(/{{ARTICLE_CATEGORY}}/g, category)
      .replace(/{{AUTHOR_NAME}}/g, author)
      .replace(/{{KEYWORDS}}/g, Array.isArray(keywords) ? keywords.join(', ') : keywords)
      .replace(/{{DATE_PUBLISHED}}/g, publishDate)
      .replace(/{{DATE_MODIFIED}}/g, modifiedDate)
      .replace(/{{WORD_COUNT}}/g, wordCount.toString())
      
      // Material info
      .replace(/{{MATERIAL_NAME}}/g, materialName)
      .replace(/{{MATERIAL_DESCRIPTION}}/g, `Industrial laser cleaning parameters and applications for ${materialName}`)
      .replace(/{{MATERIAL_CATEGORY}}/g, category)
      .replace(/{{MATERIAL_CATEGORY_DISPLAY}}/g, categoryDisplay)
      
      // Material properties
      .replace(/{{DENSITY_VALUE}}/g, density.toString())
      .replace(/{{DENSITY_UNIT}}/g, densityUnit)
      .replace(/{{DENSITY_UNIT_CODE}}/g, densityUnit === 'g/cm³' ? 'GramPerCubicMeter' : 'GramPerCubicMeter')
      .replace(/{{THERMAL_CONDUCTIVITY}}/g, thermalConductivity.toString())
      .replace(/{{THERMAL_UNIT}}/g, thermalUnit)
      .replace(/{{THERMAL_UNIT_CODE}}/g, thermalUnit === 'W/m·K' ? 'WattPerMeterKelvin' : 'WattPerMeterKelvin')
      .replace(/{{MELTING_POINT}}/g, meltingPoint.toString())
      .replace(/{{MELTING_POINT_UNIT}}/g, meltingPointUnit)
      .replace(/{{MELTING_POINT_UNIT_CODE}}/g, meltingPointUnit === '°C' ? 'Celsius' : 'Celsius')
      
      // Laser parameters
      .replace(/{{LASER_TYPE}}/g, laserType)
      .replace(/{{LASER_POWER}}/g, laserPower.toString())
      .replace(/{{LASER_WAVELENGTH}}/g, laserWavelength.toString())
      
      // Process timing
      .replace(/{{PROCESS_TIME}}/g, processTime)
      .replace(/{{CLEANING_TIME}}/g, cleaningTime)
      
      // Applications
      .replace(/{{PRIMARY_APPLICATION}}/g, primaryApp)
      .replace(/{{SECONDARY_APPLICATION}}/g, secondaryApp);
    
    return JSON.parse(populatedSchema);
    
  } catch (error) {
    console.error('Error creating comprehensive JSON-LD schema:', error);
    return null;
  }
}

// Helper to create HTML-safe JSON-LD script content
export function createJsonLdScript(schema: any) {
  if (!schema) return '';
  
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}