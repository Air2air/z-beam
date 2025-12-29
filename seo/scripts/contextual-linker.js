#!/usr/bin/env node

/**
 * Contextual Internal Linker
 * Auto-generates contextual internal links based on entity relationships
 * Adds links to markdown content where entities are mentioned
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

class ContextualLinker {
  constructor(entityMapPath) {
    this.entityMap = JSON.parse(fs.readFileSync(entityMapPath, 'utf-8'));
    this.linksAdded = 0;
    this.filesModified = 0;
    this.linksByType = {
      material: 0,
      contaminant: 0
    };
  }
  
  /**
   * Create entity lookup map for fast searching
   */
  buildLookupMap() {
    this.entityLookup = new Map();
    
    // Materials
    this.entityMap.entities.materials.forEach(material => {
      const terms = [material.name.toLowerCase(), ...material.aliases.map(a => a.toLowerCase())];
      terms.forEach(term => {
        if (!this.entityLookup.has(term)) {
          this.entityLookup.set(term, []);
        }
        this.entityLookup.get(term).push({
          name: material.name,
          type: 'material',
          path: material.path,
          slug: material.slug
        });
      });
    });
    
    // Contaminants
    this.entityMap.entities.contaminants.forEach(contaminant => {
      const terms = [contaminant.name.toLowerCase(), ...contaminant.aliases.map(a => a.toLowerCase())];
      terms.forEach(term => {
        if (!this.entityLookup.has(term)) {
          this.entityLookup.set(term, []);
        }
        this.entityLookup.get(term).push({
          name: contaminant.name,
          type: 'contaminant',
          path: contaminant.path,
          slug: contaminant.slug
        });
      });
    });
    
    console.log(`✅ Built lookup map with ${this.entityLookup.size} searchable terms\n`);
  }
  
  /**
   * Add contextual links to markdown content
   */
  addLinksToContent(content, currentEntityName) {
    let modified = content;
    let linksAddedToFile = 0;
    const linkedTerms = new Set(); // Track what we've already linked
    
    // Sort entities by length (longest first to avoid partial matches)
    const sortedEntities = Array.from(this.entityLookup.entries())
      .sort((a, b) => b[0].length - a[0].length);
    
    sortedEntities.forEach(([term, entities]) => {
      // Skip if this is the current entity (don't self-link)
      if (entities.some(e => e.name.toLowerCase() === currentEntityName.toLowerCase())) {
        return;
      }
      
      // Skip if we've already linked this term
      if (linkedTerms.has(term)) return;
      
      // Create case-insensitive regex with word boundaries
      // Avoid linking inside existing markdown links or code blocks
      const regex = new RegExp(
        `(?<!\\[|\\(|\\]\\()\\b(${term})\\b(?![\\]\\)])`,
        'gi'
      );
      
      // Count existing links to this term
      const existingLinks = (modified.match(new RegExp(`\\[${term}\\]`, 'gi')) || []).length;
      
      // Only add first link per entity mention (avoid over-linking)
      let count = 0;
      const maxLinks = 1;
      
      modified = modified.replace(regex, (match, p1) => {
        // Don't link if inside code block, link, or already linked enough
        if (count >= maxLinks) return match;
        if (existingLinks + count >= maxLinks) return match;
        
        const entity = entities[0]; // Use first match
        count++;
        linksAddedToFile++;
        this.linksAdded++;
        this.linksByType[entity.type]++;
        linkedTerms.add(term);
        
        // Return markdown link
        return `[${match}](${entity.path})`;
      });
    });
    
    return { modified, linksAddedToFile };
  }
  
  /**
   * Process a YAML frontmatter file
   */
  processFile(filePath, entityName) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parse YAML
      const data = yaml.parse(content);
      
      // Skip if no page_description field
      if (!data.page_description || typeof data.page_description !== 'string') {
        return;
      }
      
      const originalDescription = data.page_description;
      
      // Add links to page_description
      const { modified, linksAddedToFile } = this.addLinksToContent(originalDescription, entityName);
      
      if (linksAddedToFile > 0) {
        // Update the data object
        data.page_description = modified;
        
        // Serialize back to YAML
        const newContent = yaml.stringify(data, {
          lineWidth: 120,
          indent: 2,
          defaultStringType: 'PLAIN',
          defaultKeyType: 'PLAIN',
          simpleKeys: false
        });
        
        // Backup original
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, content);
        
        // Write modified
        fs.writeFileSync(filePath, newContent);
        
        this.filesModified++;
        console.log(`✅ ${entityName}: Added ${linksAddedToFile} links to page_description`);
      }
    } catch (e) {
      console.error(`Error processing ${filePath}:`, e.message);
    }
  }
  
  /**
   * Process all materials
   */
  processMaterials() {
    console.log('🔗 Adding links to materials...\n');
    
    const materialsDir = './frontmatter/materials';
    if (!fs.existsSync(materialsDir)) return;
    
    this.entityMap.entities.materials.forEach(material => {
      const filePath = path.join(materialsDir, `${material.slug}.yaml`);
      if (fs.existsSync(filePath)) {
        this.processFile(filePath, material.name);
      }
    });
  }
  
  /**
   * Process all contaminants
   */
  processContaminants() {
    console.log('\n🔗 Adding links to contaminants...\n');
    
    const contaminantsDir = './frontmatter/contaminants';
    if (!fs.existsSync(contaminantsDir)) return;
    
    this.entityMap.entities.contaminants.forEach(contaminant => {
      const filePath = path.join(contaminantsDir, `${contaminant.slug}.yaml`);
      if (fs.existsSync(filePath)) {
        this.processFile(filePath, contaminant.name);
      }
    });
  }
  
  /**
   * Process all settings (walk directory recursively)
   */
  processSettings() {
    console.log('\n🔗 Adding links to settings...\n');
    
    const settingsDir = './frontmatter/settings';
    if (!fs.existsSync(settingsDir)) return;
    
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('-settings.yaml')) {
          // Extract material name from filename (e.g., ash-settings.yaml -> Ash)
          const materialName = file.replace('-settings.yaml', '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          this.processFile(fullPath, materialName);
        }
      });
    };
    
    walkDir(settingsDir);
  }
  
  /**
   * Print summary report
   */
  printSummary() {
    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 Contextual Linking Summary\n');
    console.log(`✅ Files modified: ${this.filesModified}`);
    console.log(`✅ Total links added: ${this.linksAdded}`);
    console.log(`   - Material links: ${this.linksByType.material}`);
    console.log(`   - Contaminant links: ${this.linksByType.contaminant}`);
    console.log(`\n💡 Average links per file: ${Math.round(this.linksAdded / this.filesModified)}`);
    console.log('\n' + '═'.repeat(60) + '\n');
    
    if (this.filesModified > 0) {
      console.log('📁 Backups created with .backup extension');
      console.log('💡 Review changes and remove .backup files when satisfied\n');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🔗 Contextual Internal Linker\n');
  
  const entityMapPath = process.argv[2] || './seo/analysis/entity-map.json';
  
  if (!fs.existsSync(entityMapPath)) {
    console.error('❌ Entity map not found. Run entity-mapper.js first:');
    console.error('   node seo/scripts/entity-mapper.js\n');
    process.exit(1);
  }
  
  const linker = new ContextualLinker(entityMapPath);
  
  linker.buildLookupMap();
  linker.processMaterials();
  linker.processContaminants();
  linker.processSettings();
  linker.printSummary();
  
  // Save linking report
  const reportPath = './seo/analysis/contextual-links-report.json';
  const report = {
    timestamp: new Date().toISOString(),
    filesModified: linker.filesModified,
    linksAdded: linker.linksAdded,
    linksByType: linker.linksByType
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📁 Report saved to: ${reportPath}\n`);
}

main().catch(console.error);
