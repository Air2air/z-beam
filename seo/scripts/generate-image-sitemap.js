#!/usr/bin/env node
/**
 * Generate Image Sitemap for Z-Beam
 * 
 * Creates an image sitemap from all images in the public/images directory
 * and related images used throughout the site.
 * 
 * Google Image Sitemap requirements:
 * - Image URL (required)
 * - Caption (optional, but recommended)
 * - Title (optional, but recommended)
 * - License (optional)
 * - Geo-location (optional)
 * 
 * Usage: node scripts/seo/generate-image-sitemap.js
 */

const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

// Configuration
const { BASE_URL } = require('../../config/urls');
// Provides environment-aware URL resolution
const PUBLIC_DIR = path.join(__dirname, '../../public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'image-sitemap.xml');

// Image extensions to include
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

/**
 * Recursively find all image files in a directory
 */
async function findImages(dir, baseDir = dir, images = []) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip icon, icons, application, favicon, author directories
        if (entry.name === 'icon' || entry.name === 'icons' || entry.name === 'application' || entry.name === 'favicon' || entry.name === 'author') {
          continue;
        }
        await findImages(fullPath, baseDir, images);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          const relativePath = path.relative(PUBLIC_DIR, fullPath);
          const urlPath = '/' + relativePath.split(path.sep).join('/');
          
          // Skip icon, icons, application, favicon, author images
          if (relativePath.includes('/icon/') || relativePath.includes('/icons/') || 
              relativePath.includes('/application/') || relativePath.includes('/favicon/') ||
              relativePath.includes('/author/')) {
            continue;
          }
          
          // Get file stats for lastmod
          const stats = await fs.stat(fullPath);
          
          images.push({
            loc: urlPath,
            lastmod: stats.mtime.toISOString().split('T')[0],
            title: generateTitle(entry.name),
            caption: generateCaption(relativePath, entry.name),
          });
        }
      }
    }
    
    return images;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
    return images;
  }
}

/**
 * Generate a readable title from filename
 */
function generateTitle(filename) {
  return filename
    .replace(/\.(jpg|jpeg|png|gif|webp|svg)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/ Hero$/i, '')  // Remove 'Hero' suffix
    .replace(/ Micro$/i, ' 1000x');  // Replace 'Micro' with '1000x'
}

/**
 * Generate a caption based on the image path and filename
 */
function generateCaption(relativePath, filename) {
  const parts = relativePath.split(path.sep);
  const baseName = filename.replace(/\.(jpg|jpeg|png|gif|webp|svg)$/i, '');
  
  // Extract context from filename for more descriptive captions
  const readableName = baseName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/ Hero$/i, '')
    .replace(/ Micro$/i, ' 1000x magnification');
  
  // Add context based on path
  if (parts.includes('materials')) {
    return `${readableName} - Laser cleaning solution for industrial materials`;
  } else if (parts.includes('contaminants')) {
    return `${readableName} - Contamination removal using laser technology`;
  } else if (parts.includes('equipment')) {
    return `${readableName} - Industrial laser cleaning equipment`;
  } else if (parts.includes('services')) {
    return `${readableName} - Professional laser cleaning services`;
  } else if (parts.includes('safety')) {
    return `${readableName} - Laser cleaning safety and compliance`;
  } else if (parts.includes('compounds')) {
    return `${readableName} - Hazardous compound identification and safety data`;
  }
  
  return `${readableName} - Z-Beam industrial laser cleaning technology`;
}

/**
 * Build image sitemap XML
 */
function buildImageSitemap(images) {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
  
  const footer = `</urlset>`;
  
  // Group images by page URL (use homepage for global images)
  const pageImages = new Map();
  
  images.forEach(image => {
    // Determine which page this image belongs to
    const pathParts = image.loc.split('/').filter(p => p);
    let pageUrl = BASE_URL; // Default to homepage
    
    if (pathParts.length > 1 && pathParts[0] === 'images') {
      if (pathParts[1] === 'materials' || pathParts[1] === 'contaminants' || 
          pathParts[1] === 'compounds' || pathParts[1] === 'services') {
        // Use category page
        pageUrl = `${BASE_URL}/${pathParts[1]}`;
      }
    }
    
    if (!pageImages.has(pageUrl)) {
      pageImages.set(pageUrl, []);
    }
    pageImages.get(pageUrl).push(image);
  });
  
  // Build URL entries with image data
  const urlEntries = Array.from(pageImages.entries()).map(([pageUrl, imgs]) => {
    const imageElements = imgs.map(img => `
    <image:image>
      <image:loc>${BASE_URL}${img.loc}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>`).join('');
    
    return `  <url>
    <loc>${pageUrl}</loc>${imageElements}
  </url>`;
  }).join('\n');
  
  return `${header}\n${urlEntries}\n${footer}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Z-Beam Image Sitemap Generator');
  console.log('═══════════════════════════════════════\n');
  
  try {
    // Check if images directory exists
    try {
      await fs.access(IMAGES_DIR);
    } catch {
      console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
      process.exit(1);
    }
    
    // Find all images
    console.log('📁 Scanning for images...');
    const images = await findImages(IMAGES_DIR);
    console.log(`✅ Found ${images.length} images\n`);
    
    if (images.length === 0) {
      console.log('⚠️  No images found. Exiting...');
      process.exit(0);
    }
    
    // Build sitemap
    console.log('🔨 Building image sitemap...');
    const sitemap = buildImageSitemap(images);
    
    // Write to file
    await fs.writeFile(OUTPUT_FILE, sitemap, 'utf-8');
    console.log(`✅ Image sitemap created: ${OUTPUT_FILE}`);
    console.log(`📊 Total entries: ${images.length} images\n`);
    
    // Show summary by category
    const categories = images.reduce((acc, img) => {
      const category = img.caption;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Images by category:');
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   • ${category}: ${count}`);
      });
    
    console.log('\n✨ Next steps:');
    console.log('   1. Add image-sitemap.xml to sitemap index');
    console.log('   2. Deploy to production');
    console.log('   3. Submit to Google Search Console');
    console.log('   4. Monitor indexing status\n');
    
  } catch (error) {
    console.error('❌ Error generating image sitemap:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { findImages, buildImageSitemap, generateTitle, generateCaption };
