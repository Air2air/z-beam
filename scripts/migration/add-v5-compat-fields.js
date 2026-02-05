#!/usr/bin/env node
/**
 * Add v5.0.0 backward compatibility fields to v6.0.0 migrated files
 * This allows frontend components to find fields they expect while
 * maintaining the cleaner v6.0.0 structure
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const FRONTMATTER_DIR = path.join(__dirname, '../../frontmatter');

// Domain configurations
const DOMAIN_CONFIGS = {
  contaminants: {
    dir: 'contaminants',
    imagePrefix: 'contaminant',
    basePath: '/contaminants'
  },
  compounds: {
    dir: 'compounds',
    imagePrefix: 'compound',
    basePath: '/compounds'
  },
  settings: {
    dir: 'settings',
    imagePrefix: 'settings',
    basePath: '/settings'
  }
};

// Author registry
const AUTHORS = {
  1: { id: 1, name: 'Todd Dunning' },
  2: { id: 2, name: 'Alessandro Moretti' },
  3: { id: 3, name: 'Yi-Chun Lin' },
  4: { id: 4, name: 'Ikmanda Roswati' }
};

function findAllV6Files(domainDir) {
  const files = [];
  const fullPath = path.join(FRONTMATTER_DIR, domainDir);
  
  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith('.yaml')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(fullPath);
  return files;
}

function addCompatibilityFields(filePath, domainConfig) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);
    
    // Only process v6.0.0 files
    if (data.schemaVersion !== '6.0.0') {
      return { skipped: true, reason: 'not v6.0.0' };
    }
    
    // Check if already has compatibility fields
    if (data.pageTitle && data.author && data.author.name) {
      return { skipped: true, reason: 'already has compat fields' };
    }
    
    let modified = false;
    
    // Add pageTitle and displayName if missing
    if (!data.pageTitle && data.name) {
      data.pageTitle = data.name;
      modified = true;
    }
    if (!data.displayName && data.name) {
      data.displayName = data.name;
      modified = true;
    }
    
    // Add pageDescription if missing
    if (!data.pageDescription && data.description) {
      data.pageDescription = data.description;
      modified = true;
    }
    
    // Add metaDescription if missing
    if (!data.metaDescription && data.meta && data.meta.description) {
      data.metaDescription = data.meta.description;
      modified = true;
    }
    
    // Add fullPath if missing
    if (!data.fullPath && data.category && data.subcategory) {
      const basePath = domainConfig.basePath;
      data.fullPath = `${basePath}/${data.category}/${data.subcategory}/${data.id}`;
      modified = true;
    }
    
    // Add breadcrumb if missing
    if (!data.breadcrumb && data.category && data.subcategory) {
      const categoryLabel = data.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const subcategoryLabel = data.subcategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const domainLabel = domainConfig.dir.charAt(0).toUpperCase() + domainConfig.dir.slice(1);
      
      data.breadcrumb = [
        { label: 'Home', href: '/' },
        { label: domainLabel, href: domainConfig.basePath },
        { label: categoryLabel, href: `${domainConfig.basePath}/${data.category}` },
        { label: subcategoryLabel, href: `${domainConfig.basePath}/${data.category}/${data.subcategory}` }
      ];
      modified = true;
    }
    
    // Expand images to full structure if needed
    if (data.images) {
      if (data.images.hero && typeof data.images.hero === 'string') {
        const filename = data.images.hero;
        data.images.hero = {
          url: `/images/${domainConfig.imagePrefix}/${filename}`,
          alt: `${data.name} laser cleaning visualization showing process effects`,
          width: 1200,
          height: 630
        };
        modified = true;
      }
      
      if (data.images.micro && typeof data.images.micro === 'string') {
        const filename = data.images.micro;
        data.images.micro = {
          url: `/images/${domainConfig.imagePrefix}/${filename}`,
          alt: `${data.name} microscopic detail view showing surface characteristics`,
          width: 800,
          height: 600
        };
        modified = true;
      }
    }
    
    // Expand author if needed
    if (data.authorId && !data.author) {
      const authorInfo = AUTHORS[data.authorId];
      if (authorInfo) {
        data.author = { ...authorInfo };
        modified = true;
      }
    }
    
    if (!modified) {
      return { skipped: true, reason: 'no changes needed' };
    }
    
    // Serialize back to YAML with proper field ordering
    const orderedData = {
      id: data.id,
      contentType: data.contentType,
      schemaVersion: data.schemaVersion,
      name: data.name,
      category: data.category,
      subcategory: data.subcategory,
      datePublished: data.datePublished,
      dateModified: data.dateModified,
      // v5.0.0 compatibility fields
      pageTitle: data.pageTitle,
      displayName: data.displayName,
      fullPath: data.fullPath,
      breadcrumb: data.breadcrumb,
      description: data.description,
      pageDescription: data.pageDescription,
      metaDescription: data.metaDescription,
      // v6.0.0 fields
      meta: data.meta,
      images: data.images,
      author: data.author,
      authorId: data.authorId,
      // All other fields
      ...Object.keys(data).reduce((acc, key) => {
        if (!['id', 'contentType', 'schemaVersion', 'name', 'category', 'subcategory', 
              'datePublished', 'dateModified', 'pageTitle', 'displayName', 'fullPath', 
              'breadcrumb', 'description', 'pageDescription', 'metaDescription', 
              'meta', 'images', 'author', 'authorId'].includes(key)) {
          acc[key] = data[key];
        }
        return acc;
      }, {})
    };
    
    const yamlContent = yaml.dump(orderedData, {
      lineWidth: 120,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false
    });
    
    fs.writeFileSync(filePath, yamlContent, 'utf8');
    
    return { success: true };
    
  } catch (error) {
    return { error: error.message };
  }
}

function main() {
  console.log('🔄 Adding v5.0.0 backward compatibility fields to migrated v6.0.0 files...\n');
  
  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (const [domainName, config] of Object.entries(DOMAIN_CONFIGS)) {
    console.log(`\n📂 Processing ${domainName}...`);
    const files = findAllV6Files(config.dir);
    
    let domainSuccess = 0;
    let domainSkipped = 0;
    let domainErrors = 0;
    
    for (const file of files) {
      totalProcessed++;
      const result = addCompatibilityFields(file, config);
      
      if (result.success) {
        domainSuccess++;
        totalSuccess++;
        console.log(`   ✅ ${path.basename(file)}`);
      } else if (result.skipped) {
        domainSkipped++;
        totalSkipped++;
      } else if (result.error) {
        domainErrors++;
        totalErrors++;
        console.log(`   ❌ ${path.basename(file)}: ${result.error}`);
      }
    }
    
    console.log(`\n   📊 ${domainName} Summary:`);
    console.log(`      Processed: ${files.length}`);
    console.log(`      Updated:   ${domainSuccess}`);
    console.log(`      Skipped:   ${domainSkipped}`);
    console.log(`      Errors:    ${domainErrors}`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 OVERALL SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total files processed: ${totalProcessed}`);
  console.log(`Total files updated:   ${totalSuccess}`);
  console.log(`Total files skipped:   ${totalSkipped}`);
  console.log(`Total errors:          ${totalErrors}`);
  console.log('\n✅ Backward compatibility fields added!\n');
}

main();
