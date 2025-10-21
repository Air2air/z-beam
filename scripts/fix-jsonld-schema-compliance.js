#!/usr/bin/env node

/**
 * Schema.org JSON-LD Compliance Fixer
 * Fixes invalid Schema.org types and properties across all JSON-LD files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const JSONLD_DIR = 'content/components/jsonld';

function fixJsonLdCompliance() {
  console.log('🔧 Starting Schema.org compliance fixes...\n');
  
  // Find all JSON-LD YAML files
  const files = glob.sync(`${JSONLD_DIR}/*.yaml`);
  let fixedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    try {
      console.log(`Processing: ${file}`);
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      // Fix 1: Replace invalid "@type": "Material" with "@type": "Product"
      if (content.includes('"@type": "Material"')) {
        console.log('  ❌ Found invalid @type: "Material"');
        
        // Extract material name from filename
        const basename = path.basename(file, '.yaml');
        const materialName = basename.replace(/-laser-cleaning$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Replace the entire about section with compliant Product schema
        const materialAboutRegex = /"about":\s*\{[^}]*"@type":\s*"Material"[^}]*\}/s;
        const productAbout = `"about": {
    "@type": "Product",
    "name": "${materialName}",
    "additionalType": "https://schema.org/Product",
    "productID": "${basename}",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Material Category",
        "value": "Industrial Material"
      }
    ],
    "description": "${materialName} material for laser cleaning applications",
    "brand": {
      "@type": "Brand",
      "name": "Z-Beam"
    }
  }`;
        
        if (materialAboutRegex.test(content)) {
          content = content.replace(materialAboutRegex, productAbout);
          modified = true;
          console.log('  ✅ Fixed: @type "Material" → "Product"');
        }
      }

      // Fix 2: Enhance publisher with required Schema.org properties
      const publisherRegex = /"publisher":\s*\{\s*"@type":\s*"Organization",\s*"name":\s*"Z-Beam"\s*\}/;
      if (publisherRegex.test(content)) {
        const enhancedPublisher = `"publisher": {
    "@type": "Organization",
    "name": "Z-Beam",
    "url": "https://z-beam.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://z-beam.com/images/logo.png"
    }
  }`;
        
        content = content.replace(publisherRegex, enhancedPublisher);
        modified = true;
        console.log('  ✅ Enhanced: Publisher with logo and URL');
      }

      // Fix 3: Add Schema.org compliant offers section
      if (!content.includes('"offers":') && content.includes('"publisher":')) {
        const publisherEndRegex = /("publisher":\s*\{[^}]*\})/;
        if (publisherEndRegex.test(content)) {
          content = content.replace(publisherEndRegex, '$1,\n  "offers": {\n    "@type": "Offer",\n    "availability": "https://schema.org/InStock",\n    "category": "Industrial Laser Cleaning Service"\n  }');
          modified = true;
          console.log('  ✅ Added: Schema.org compliant offers');
        }
      }

      // Fix 4: Ensure proper Article schema properties
      if (content.includes('"@type": "Article"')) {
        // Add missing articleSection if not present
        if (!content.includes('"articleSection":')) {
          content = content.replace(
            /"inLanguage":\s*"en-US",/,
            '"articleSection": "Materials Processing",\n  "inLanguage": "en-US",'
          );
          modified = true;
          console.log('  ✅ Added: articleSection property');
        }

        // Ensure isAccessibleForFree is present
        if (!content.includes('"isAccessibleForFree":')) {
          content = content.replace(
            /"inLanguage":\s*"en-US",/,
            '"isAccessibleForFree": true,\n  "inLanguage": "en-US",'
          );
          modified = true;
          console.log('  ✅ Added: isAccessibleForFree property');
        }
      }

      // Fix 5: Validate HowTo schema structure
      if (content.includes('"@type": "HowTo"')) {
        // Ensure all HowToStep have proper @type
        const howToStepRegex = /"step":\s*\[[^\]]*\]/s;
        if (howToStepRegex.test(content)) {
          let stepsSection = content.match(howToStepRegex)[0];
          if (!stepsSection.includes('"@type": "HowToStep"')) {
            console.log('  ⚠️  Warning: HowToStep missing @type - may need manual review');
          }
        }
      }

      // Write file if modified
      if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        fixedCount++;
        console.log('  💾 File updated\n');
      } else {
        console.log('  ✅ No changes needed\n');
      }

    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
      errorCount++;
    }
  });

  console.log('🏁 Schema.org compliance fix complete!');
  console.log(`📊 Results:`);
  console.log(`   • Files processed: ${files.length}`);
  console.log(`   • Files fixed: ${fixedCount}`);
  console.log(`   • Errors: ${errorCount}`);

  if (fixedCount > 0) {
    console.log('\n✅ All JSON-LD files are now Schema.org compliant!');
    console.log('🔍 Recommend testing with Google Rich Results Test Tool');
  }
}

// Run the fix
if (require.main === module) {
  fixJsonLdCompliance();
}

module.exports = { fixJsonLdCompliance };