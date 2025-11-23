#!/usr/bin/env node

/**
 * Validate JSON-LD URLs match the new hierarchical structure
 * Checks that all URLs in JSON-LD schemas use /materials/[category]/[subcategory]/[slug]
 * instead of old flat /[slug] structure
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function validateJsonLdUrls() {
  console.log('🔍 Validating JSON-LD URLs in built pages...\n');
  
  const buildDir = path.join(process.cwd(), '.next', 'server', 'app', 'materials');
  const errors = [];
  const warnings = [];
  let pagesChecked = 0;
  
  function checkDirectory(dir, relativePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          checkDirectory(fullPath, path.join(relativePath, item));
        } else if (item.endsWith('.html')) {
          pagesChecked++;
          const html = fs.readFileSync(fullPath, 'utf8');
          const urlPath = `materials/${relativePath}`;
          
          validatePage(html, urlPath, fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }
  
  function validatePage(html, expectedPath, filePath) {
    // Extract JSON-LD scripts
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
    
    if (!jsonLdMatches) {
      warnings.push({
        file: filePath,
        issue: 'No JSON-LD found'
      });
      return;
    }
    
    jsonLdMatches.forEach((match, index) => {
      const jsonContent = match.replace(/<script type="application\/ld\+json">|<\/script>/g, '').trim();
      
      try {
        const schema = JSON.parse(jsonContent);
        
        // Check for material page schemas (skip organization/website schemas)
        if (schema['@graph']) {
          checkGraphUrls(schema['@graph'], expectedPath, filePath);
        } else if (schema['@id'] && schema['@id'].includes('/materials/')) {
          checkUrl(schema['@id'], expectedPath, filePath);
        }
        
        if (schema.url && typeof schema.url === 'string' && schema.url.includes('/materials/')) {
          checkUrl(schema.url, expectedPath, filePath);
        }
      } catch (error) {
        errors.push({
          file: filePath,
          issue: `Invalid JSON-LD (parse error): ${error.message}`
        });
      }
    });
  }
  
  function checkGraphUrls(graph, expectedPath, filePath) {
    graph.forEach((item, index) => {
      // Check @id
      if (item['@id'] && item['@id'].includes('materials')) {
        checkUrl(item['@id'], expectedPath, filePath, `@graph[${index}].@id`);
      }
      
      // Check url
      if (item.url && typeof item.url === 'string' && item.url.includes('materials')) {
        checkUrl(item.url, expectedPath, filePath, `@graph[${index}].url`);
      }
      
      // Check mainEntityOfPage
      if (item.mainEntityOfPage && item.mainEntityOfPage['@id']) {
        if (item.mainEntityOfPage['@id'].includes('materials')) {
          checkUrl(item.mainEntityOfPage['@id'], expectedPath, filePath, `@graph[${index}].mainEntityOfPage.@id`);
        }
      }
      
      // Check BreadcrumbList items
      if (item['@type'] === 'BreadcrumbList' && item.itemListElement) {
        item.itemListElement.forEach((listItem, liIndex) => {
          if (listItem.item && listItem.item.includes('materials')) {
            checkBreadcrumbUrl(listItem.item, expectedPath, filePath, `@graph[${index}].itemListElement[${liIndex}].item`);
          }
        });
      }
    });
  }
  
  function checkUrl(url, expectedPath, filePath, location = 'url') {
    // Extract path from URL
    const urlPath = url.replace('https://www.z-beam.com/', '').replace('https://z-beam.com/', '');
    
    // Check if it's a flat URL (old structure)
    if (urlPath.match(/^[^/]+$/) && !urlPath.match(/^(materials|services|about|contact|search|rental)/)) {
      errors.push({
        file: filePath,
        location,
        issue: `OLD FLAT URL: ${url}`,
        expected: `Should be: https://www.z-beam.com/${expectedPath}`
      });
      return;
    }
    
    // Check if URL matches expected hierarchical path
    const normalizedExpected = expectedPath.replace(/\.html$/, '').replace(/\\/g, '/');
    const normalizedUrl = urlPath.replace(/\.html$/, '').replace(/\\/g, '/');
    
    if (!normalizedUrl.includes(normalizedExpected) && normalizedUrl !== 'materials') {
      warnings.push({
        file: filePath,
        location,
        issue: `URL mismatch: ${url}`,
        expected: `Expected to include: ${normalizedExpected}`
      });
    }
  }
  
  function checkBreadcrumbUrl(url, expectedPath, filePath, location = 'breadcrumb') {
    // Extract path from URL
    const urlPath = url.replace('https://www.z-beam.com/', '').replace('https://z-beam.com/', '');
    
    // Check if it's a flat URL (old structure)
    if (urlPath.match(/^[^/]+$/) && !urlPath.match(/^(materials|services|about|contact|search|rental)/)) {
      errors.push({
        file: filePath,
        location,
        issue: `OLD FLAT URL in breadcrumb: ${url}`,
        expected: `Should use hierarchical path`
      });
      return;
    }
    
    // For breadcrumbs, validate they're hierarchical but allow parent paths
    // Expected path: materials/ceramic/carbide/silicon-carbide
    // Valid breadcrumb URLs: /materials, /materials/ceramic, /materials/ceramic/carbide, etc.
    const normalizedUrl = urlPath.replace(/\.html$/, '').replace(/\\/g, '/');
    const pathSegments = expectedPath.split('/').filter(Boolean);
    
    // Breadcrumb should be a prefix of the expected path OR be a valid parent
    const isValidParent = pathSegments.some((_, index) => {
      const parentPath = pathSegments.slice(0, index + 1).join('/');
      return normalizedUrl === parentPath || normalizedUrl.endsWith('/' + parentPath);
    });
    
    // Also allow root paths like "materials" or "/"
    const isRootPath = normalizedUrl === 'materials' || normalizedUrl === '' || normalizedUrl === '/';
    
    if (!isValidParent && !isRootPath && !normalizedUrl.startsWith('materials/')) {
      warnings.push({
        file: filePath,
        location,
        issue: `Invalid breadcrumb URL: ${url}`,
        expected: `Should be a parent path of: ${expectedPath}`
      });
    }
  }
  
  // Check if build directory exists
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run `npm run build` first.\n');
    process.exit(1);
  }
  
  checkDirectory(buildDir);
  
  // Report results
  console.log(`\n📊 Results:`);
  console.log(`   Pages checked: ${pagesChecked}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}\n`);
  
  if (errors.length > 0) {
    console.log('❌ ERRORS (Old flat URLs or critical issues):\n');
    errors.slice(0, 10).forEach(error => {
      console.log(`   File: ${path.relative(process.cwd(), error.file)}`);
      if (error.location) console.log(`   Location: ${error.location}`);
      console.log(`   Issue: ${error.issue}`);
      if (error.expected) console.log(`   Expected: ${error.expected}`);
      console.log('');
    });
    
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors\n`);
    }
  }
  
  if (warnings.length > 0 && errors.length === 0) {
    console.log('⚠️  WARNINGS (Minor issues):\n');
    warnings.slice(0, 5).forEach(warning => {
      console.log(`   File: ${path.relative(process.cwd(), warning.file)}`);
      if (warning.location) console.log(`   Location: ${warning.location}`);
      console.log(`   Issue: ${warning.issue}`);
      if (warning.expected) console.log(`   Expected: ${warning.expected}`);
      console.log('');
    });
    
    if (warnings.length > 5) {
      console.log(`   ... and ${warnings.length - 5} more warnings\n`);
    }
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All JSON-LD URLs are using the correct hierarchical structure!\n');
    console.log('   All material pages use: /materials/[category]/[subcategory]/[slug]\n');
  }
  
  // Exit with error if critical issues found
  if (errors.length > 0) {
    console.log('❌ Validation failed. Fix the errors above before deploying.\n');
    process.exit(1);
  }
}

// Run validation
validateJsonLdUrls().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
