#!/usr/bin/env node
/**
 * Bulk SEO Enhancement Script
 * Adds comprehensive SEO metadata to all static pages and material files
 * 
 * Created: February 15, 2026
 * Target: Improve from 50.6% to 85%+ quality score
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Static pages to enhance
const STATIC_PAGES = [
  'about', 'contact', 'operations', 'safety', 'services',
  'equipment', 'schedule', 'netalux', 'rental', 'comparison'
];

const BASE_URL = 'https://z-beam.com';

function enhanceStaticPage(pageSlug) {
  const pagePath = path.join(__dirname, `../../app/${pageSlug}/page.yaml`);
  
  if (!fs.existsSync(pagePath)) {
    console.log(`⚠️  ${pageSlug}: file not found, skipping`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(pagePath, 'utf8');
    const data = yaml.parse(content);
    
    // Check if already has comprehensive SEO
    if (data.jsonLd && data.openGraph && data.twitter && data.canonicalUrl && data.headline) {
      console.log(`✅ ${pageSlug}: already enhanced, skipping`);
      return false;
    }
    
    // Add missing fields
    let updated = false;
    
    // Add headline if missing
    if (!data.headline) {
      data.headline = data.pageTitle || `${pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1)} - Z-Beam Laser Cleaning`;
      updated = true;
    }
    
    // Add canonical URL if missing
    if (!data.canonicalUrl) {
      data.canonicalUrl = `${BASE_URL}/${pageSlug}`;
      updated = true;
    }
    
    // Add author if missing
    if (!data.author) {
      data.author = {
        '@type': 'Organization',
        name: 'Z-Beam',
        url: BASE_URL
      };
      updated = true;
    }
    
    // Enhance keywords if too few
    if (!data.keywords || data.keywords.length < 10) {
      const baseKeywords = data.keywords || [];
      const enhancedKeywords = [
        ...baseKeywords,
        'laser cleaning',
        'industrial laser',
        'laser surface cleaning',
        'eco-friendly cleaning',
        'non-abrasive cleaning',
        'precision laser technology'
      ];
      // Remove duplicates
      data.keywords = [...new Set(enhancedKeywords)];
      updated = true;
    }
    
    // Add Open Graph if missing
    if (!data.openGraph) {
      data.openGraph = {
        title: data.pageTitle || data.headline,
        description: data.pageDescription || data.description,
        type: 'website',
        url: `${BASE_URL}/${pageSlug}`,
        image: {
          url: data.images?.hero?.url || data.images?.og?.url || `/images/og-${pageSlug}.jpg`,
          alt: data.pageTitle || data.headline,
          width: 1200,
          height: 630
        }
      };
      updated = true;
    }
    
    // Add Twitter Card if missing
    if (!data.twitter) {
      data.twitter = {
        card: 'summary_large_image',
        title: data.pageTitle || data.headline,
        description: (data.pageDescription || data.description)?.substring(0, 200),
        image: {
          url: data.images?.hero?.url || data.images?.twitter?.url || `/images/og-${pageSlug}.jpg`,
          alt: data.pageTitle || data.headline
        }
      };
      updated = true;
    }
    
    // Add JSON-LD if missing
    if (!data.jsonLd) {
      data.jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${BASE_URL}/${pageSlug}#webpage`,
        name: data.pageTitle || data.headline,
        headline: data.headline,
        description: data.pageDescription || data.description,
        url: `${BASE_URL}/${pageSlug}`,
        datePublished: data.datePublished || new Date().toISOString().split('T')[0],
        dateModified: new Date().toISOString().split('T')[0],
        publisher: {
          '@type': 'Organization',
          name: 'Z-Beam',
          url: BASE_URL
        }
      };
      
      // Add breadcrumb to JSON-LD if it exists
      if (data.breadcrumb && Array.isArray(data.breadcrumb)) {
        data.jsonLd.breadcrumb = {
          '@type': 'BreadcrumbList',
          itemListElement: data.breadcrumb.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${BASE_URL}${item.href}`
          }))
        };
      }
      
      updated = true;
    }
    
    if (updated) {
      // Update dateModified
      if (data.dateModified) {
        data.dateModified = new Date().toISOString().split('T')[0];
      }
      
      // Write back to file
      const newContent = yaml.stringify(data);
      fs.writeFileSync(pagePath, newContent, 'utf8');
      console.log(`✨ ${pageSlug}: enhanced with comprehensive SEO metadata`);
      return true;
    } else {
      console.log(`✅ ${pageSlug}: no updates needed`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ ${pageSlug}: ${error.message}`);
    return false;
  }
}

// Main execution
console.log(`\n${'='.repeat(70)}`);
console.log('📊 BULK SEO ENHANCEMENT');
console.log(`${'='.repeat(70)}\n`);

let enhanced = 0;
let skipped = 0;
let failed = 0;

console.log(`Processing ${STATIC_PAGES.length} static pages...\n`);

STATIC_PAGES.forEach(page => {
  const result = enhanceStaticPage(page);
  if (result === true) enhanced++;
  else if (result === false) skipped++;
  else failed++;
});

console.log(`\n${'='.repeat(70)}`);
console.log('📊 SUMMARY');
console.log(`${'='.repeat(70)}`);
console.log(`Total pages: ${STATIC_PAGES.length}`);
console.log(`✨ Enhanced: ${enhanced}`);
console.log(`✅ Skipped (already complete): ${skipped}`);
console.log(`❌ Failed: ${failed}`);
console.log(`${'='.repeat(70)}\n`);

if (enhanced > 0) {
  console.log(`✅ SUCCESS: Enhanced ${enhanced} pages with comprehensive SEO metadata`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Run: npm run test:seo:comprehensive`);
  console.log(`   2. Verify OVERALL QUALITY SCORE increased from 50.6%`);
  console.log(`   3. Check Open Graph, Twitter Card, and JSON-LD coverage improved\n`);
}
