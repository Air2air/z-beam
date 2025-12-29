#!/usr/bin/env node
/**
 * Fix Material Breadcrumbs - Sets href for item 2 to full_path
 * Issue: All 153 material frontmatter files have breadcrumb item 2 with empty href
 * Solution: Set href to full_path value for the material page
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const MATERIALS_DIR = path.join(__dirname, '../frontmatter/materials');

function fixBreadcrumbs() {
  const files = fs.readdirSync(MATERIALS_DIR).filter(f => f.endsWith('.yaml'));
  
  let fixed = 0;
  let errors = 0;

  files.forEach(file => {
    const filePath = path.join(MATERIALS_DIR, file);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);
      
      // Check if breadcrumb exists and has item with empty href
      if (data.breadcrumb && Array.isArray(data.breadcrumb)) {
        let needsFix = false;
        
        data.breadcrumb.forEach((item, index) => {
          // Item 2 (index 2) should use full_path
          if (index === 2 && (!item.href || item.href === '')) {
            if (data.full_path) {
              item.href = data.full_path;
              needsFix = true;
            }
          }
        });
        
        if (needsFix) {
          const yamlContent = yaml.dump(data, {
            indent: 2,
            lineWidth: 120,
            noRefs: true,
            sortKeys: false
          });
          
          fs.writeFileSync(filePath, yamlContent, 'utf8');
          fixed++;
          console.log(`✅ Fixed: ${file}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      errors++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${files.length}`);
}

fixBreadcrumbs();
