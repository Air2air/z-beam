#!/usr/bin/env node
/**
 * Generate Google Merchant Center XML Product Feed
 * For services/products with pricing information
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SITE_URL = 'https://www.z-beam.com';
const SITE_NAME = 'Z-Beam';

// Service pricing configuration (matches app/config/site.ts)
const SERVICE_PRICING = {
  professionalCleaning: {
    hourlyRate: 390,
    currency: 'USD',
    label: 'Professional Laser Cleaning',
    sku: 'Z-BEAM-CLEAN',
    description: 'On-site professional laser cleaning service with experienced technicians'
  },
  equipmentRental: {
    hourlyRate: 320,
    currency: 'USD',
    label: 'Equipment Rental',
    sku: 'ZB-EQUIP-RENT',
    description: 'Self-service equipment rental with training and support included'
  }
};

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate product ID from material slug and service type
 */
function generateProductId(slug, serviceType) {
  return slug;
}

/**
 * Collect all materials with service offerings
 */
function collectMaterials() {
  const materialsDir = path.join(__dirname, '../../frontmatter/materials');
  const materials = [];

  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const data = yaml.load(content);
          
          if (data && data.serviceOffering && data.serviceOffering.enabled) {
            const serviceType = data.serviceOffering.type || 'professionalCleaning';
            const pricing = SERVICE_PRICING[serviceType];
            const materialSpecific = data.serviceOffering.materialSpecific || {};
            
            // Build product URL
            const category = data.category || '';
            const subcategory = data.subcategory || '';
            const slug = path.basename(entry.name, '.yaml');
            const productUrl = `${SITE_URL}/materials/${category}/${subcategory}/${slug}`;
            
            // Calculate price range
            const hoursMin = materialSpecific.estimatedHoursMin || 1;
            const hoursTypical = materialSpecific.estimatedHoursTypical || 3;
            const minPrice = hoursMin * pricing.hourlyRate;
            const maxPrice = hoursTypical * pricing.hourlyRate;
            
            materials.push({
              id: generateProductId(slug, serviceType),
              title: data.title || slug,
              description: data.material_description || data.micro || `Professional laser cleaning service for ${data.title || slug}`,
              link: productUrl,
              imageLink: `${SITE_URL}/images/material/${slug}-hero.jpg`,
              price: `${pricing.hourlyRate} ${pricing.currency}`,
              priceUnit: 'per hour',
              minPrice: minPrice,
              maxPrice: maxPrice,
              availability: 'in stock',
              condition: 'new',
              brand: SITE_NAME,
              sku: `${pricing.sku}-${slug.toUpperCase()}`,
              serviceType: pricing.label,
              category: data.category,
              subcategory: data.subcategory,
              gtin: '', // Optional: Add if you have GTINs
              mpn: `${pricing.sku}-${slug}` // Manufacturer Part Number
            });
          }
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error.message);
        }
      }
    }
  }

  scanDirectory(materialsDir);
  return materials;
}

/**
 * Generate Google Merchant Center XML feed
 */
function generateXmlFeed(materials) {
  const timestamp = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} - Laser Cleaning Services</title>
    <link>${SITE_URL}</link>
    <description>Professional laser cleaning services for various materials</description>
    <lastBuildDate>${timestamp}</lastBuildDate>
`;

  for (const product of materials) {
    xml += `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.title)}</g:title>
      <g:description>${escapeXml(product.description)}</g:description>
      <g:link>${escapeXml(product.link)}</g:link>
      <g:image_link>${escapeXml(product.imageLink)}</g:image_link>
      <g:price>${escapeXml(product.price)}</g:price>
      <g:availability>${escapeXml(product.availability)}</g:availability>
      <g:condition>${escapeXml(product.condition)}</g:condition>
      <g:brand>${escapeXml(product.brand)}</g:brand>
      <g:mpn>${escapeXml(product.mpn)}</g:mpn>
      <g:product_type>${escapeXml(product.category.charAt(0).toUpperCase() + product.category.slice(1))}; ${escapeXml(product.subcategory.charAt(0).toUpperCase() + product.subcategory.slice(1))}</g:product_type>
      <g:google_product_category>6987</g:google_product_category>
      <g:custom_label_0>${escapeXml(product.serviceType)}</g:custom_label_0>
      <g:custom_label_1>Hourly Rate: $${product.price.split(' ')[0]}/hour</g:custom_label_1>
      <g:custom_label_2>Est. Range: $${product.minPrice}-$${product.maxPrice}</g:custom_label_2>
    </item>`;
  }

  xml += `
  </channel>
</rss>`;

  return xml;
}

/**
 * Generate CSV feed (alternative format)
 */
function generateCsvFeed(materials) {
  const headers = [
    'id', 'title', 'description', 'link', 'image_link', 'price', 
    'availability', 'condition', 'brand', 'mpn', 'product_type',
    'google_product_category', 'custom_label_0', 'custom_label_1', 'custom_label_2'
  ];
  
  let csv = headers.join('\t') + '\n';
  
  for (const product of materials) {
    const row = [
      product.id,
      product.title,
      product.description,
      product.link,
      product.imageLink,
      product.price,
      product.availability,
      product.condition,
      product.brand,
      product.mpn,
      `${product.category.charAt(0).toUpperCase() + product.category.slice(1)}; ${product.subcategory.charAt(0).toUpperCase() + product.subcategory.slice(1)}`,
      'Business & Industrial > Industrial Machinery > Cleaning Equipment',
      product.serviceType,
      `Hourly Rate: $${product.price.split(' ')[0]}/hour`,
      `Est. Range: $${product.minPrice}-$${product.maxPrice}`
    ];
    
    csv += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join('\t') + '\n';
  }
  
  return csv;
}

// Main execution
console.log('🔍 Scanning materials for service offerings...\n');
const materials = collectMaterials();

console.log(`✅ Found ${materials.length} products with services\n`);

// Generate XML feed
const xmlFeed = generateXmlFeed(materials);
const xmlPath = path.join(__dirname, '../../public/feeds/google-merchant-feed.xml');
fs.mkdirSync(path.dirname(xmlPath), { recursive: true });
fs.writeFileSync(xmlPath, xmlFeed);
console.log(`✅ XML feed generated: ${xmlPath}`);
console.log(`   URL: ${SITE_URL}/feeds/google-merchant-feed.xml\n`);

// Generate CSV feed
const csvFeed = generateCsvFeed(materials);
const csvPath = path.join(__dirname, '../../public/feeds/google-merchant-feed.csv');
fs.writeFileSync(csvPath, csvFeed);
console.log(`✅ CSV feed generated: ${csvPath}`);
console.log(`   URL: ${SITE_URL}/feeds/google-merchant-feed.csv\n`);

// Generate summary
console.log('📊 Feed Summary:');
console.log(`   Total products: ${materials.length}`);
console.log(`   Sample products:`);
materials.slice(0, 5).forEach(p => {
  console.log(`     - ${p.title} (${p.serviceType})`);
  console.log(`       SKU: ${p.sku}`);
  console.log(`       Price: ${p.price}`);
});

console.log('\n🎯 Next Steps:');
console.log('   1. Deploy your site with the feed files');
console.log('   2. Go to https://merchants.google.com');
console.log('   3. Add feed URL: https://www.z-beam.com/feeds/google-merchant-feed.xml');
console.log('   4. Wait for Google to approve (3-7 days)');
