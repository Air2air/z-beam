#!/usr/bin/env node

/**
 * Entity Mapper
 * Maps entities (materials, contaminants, equipment) across all content
 * Creates entity graph for contextual linking
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class EntityMapper {
  constructor() {
    this.entities = {
      materials: new Map(),
      contaminants: new Map(),
      equipment: new Set(),
      processes: new Set()
    };
    
    this.relationships = [];
    this.mentions = new Map(); // Which entities mention which other entities
  }
  
  /**
   * Load all entities from frontmatter
   */
  async loadEntities() {
    console.log('📚 Loading entities...\n');
    
    // Load materials
    const materialsDir = './frontmatter/materials';
    if (fs.existsSync(materialsDir)) {
      const files = fs.readdirSync(materialsDir);
      files.forEach(file => {
        if (!file.endsWith('.yaml') && !file.endsWith('.yml')) return;
        
        try {
          const content = fs.readFileSync(path.join(materialsDir, file), 'utf-8');
          const data = yaml.load(content);
          
          if (data.name) {
            this.entities.materials.set(data.name.toLowerCase(), {
              name: data.name,
              slug: data.slug || file.replace(/\.ya?ml$/, ''),
              path: `/materials/${data.slug || file.replace(/\.ya?ml$/, '')}`,
              aliases: data.aliases || [],
              category: data.category
            });
          }
        } catch (e) {
          console.error(`Error loading ${file}:`, e.message);
        }
      });
    }
    
    // Load contaminants
    const contaminantsDir = './frontmatter/contaminants';
    if (fs.existsSync(contaminantsDir)) {
      const files = fs.readdirSync(contaminantsDir);
      files.forEach(file => {
        if (!file.endsWith('.yaml') && !file.endsWith('.yml')) return;
        
        try {
          const content = fs.readFileSync(path.join(contaminantsDir, file), 'utf-8');
          const data = yaml.load(content);
          
          if (data.name) {
            this.entities.contaminants.set(data.name.toLowerCase(), {
              name: data.name,
              slug: data.slug || file.replace(/\.ya?ml$/, ''),
              path: `/contaminants/${data.slug || file.replace(/\.ya?ml$/, '')}`,
              aliases: data.aliases || [],
              category: data.category
            });
          }
        } catch (e) {
          console.error(`Error loading ${file}:`, e.message);
        }
      });
    }
    
    console.log(`✅ Loaded ${this.entities.materials.size} materials`);
    console.log(`✅ Loaded ${this.entities.contaminants.size} contaminants\n`);
  }
  
  /**
   * Find entity mentions in text
   */
  findMentions(text, currentEntity) {
    const mentions = new Set();
    const lowerText = text.toLowerCase();
    
    // Check materials
    this.entities.materials.forEach((entity, key) => {
      if (key === currentEntity.toLowerCase()) return; // Skip self
      
      const searchTerms = [key, ...entity.aliases.map(a => a.toLowerCase())];
      searchTerms.forEach(term => {
        // Word boundary search
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(lowerText)) {
          mentions.add({ type: 'material', ...entity });
        }
      });
    });
    
    // Check contaminants
    this.entities.contaminants.forEach((entity, key) => {
      if (key === currentEntity.toLowerCase()) return;
      
      const searchTerms = [key, ...entity.aliases.map(a => a.toLowerCase())];
      searchTerms.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(lowerText)) {
          mentions.add({ type: 'contaminant', ...entity });
        }
      });
    });
    
    return Array.from(mentions);
  }
  
  /**
   * Build entity relationship graph
   */
  buildRelationships() {
    console.log('🔗 Building entity relationships...\n');
    
    // Analyze materials
    this.entities.materials.forEach(material => {
      const filePath = `./frontmatter/materials/${material.slug}.yaml`;
      if (!fs.existsSync(filePath)) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const mentions = this.findMentions(content, material.name);
        
        if (mentions.length > 0) {
          this.mentions.set(material.name, mentions);
          
          mentions.forEach(mention => {
            this.relationships.push({
              from: material.name,
              fromType: 'material',
              fromPath: material.path,
              to: mention.name,
              toType: mention.type,
              toPath: mention.path
            });
          });
        }
      } catch (e) {
        console.error(`Error analyzing ${material.name}:`, e.message);
      }
    });
    
    // Analyze contaminants
    this.entities.contaminants.forEach(contaminant => {
      const filePath = `./frontmatter/contaminants/${contaminant.slug}.yaml`;
      if (!fs.existsSync(filePath)) return;
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const mentions = this.findMentions(content, contaminant.name);
        
        if (mentions.length > 0) {
          this.mentions.set(contaminant.name, mentions);
          
          mentions.forEach(mention => {
            this.relationships.push({
              from: contaminant.name,
              fromType: 'contaminant',
              fromPath: contaminant.path,
              to: mention.name,
              toType: mention.type,
              toPath: mention.path
            });
          });
        }
      } catch (e) {
        console.error(`Error analyzing ${contaminant.name}:`, e.message);
      }
    });
    
    console.log(`✅ Found ${this.relationships.length} entity relationships\n`);
  }
  
  /**
   * Generate entity map report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalMaterials: this.entities.materials.size,
        totalContaminants: this.entities.contaminants.size,
        totalRelationships: this.relationships.length,
        averageLinksPerEntity: Math.round(
          this.relationships.length / 
          (this.entities.materials.size + this.entities.contaminants.size)
        )
      },
      entities: {
        materials: Array.from(this.entities.materials.values()),
        contaminants: Array.from(this.entities.contaminants.values())
      },
      relationships: this.relationships,
      topLinkedEntities: this.getTopLinkedEntities(10),
      orphanedEntities: this.getOrphanedEntities()
    };
    
    return report;
  }
  
  /**
   * Get entities with most relationships
   */
  getTopLinkedEntities(limit = 10) {
    const linkCounts = new Map();
    
    this.relationships.forEach(rel => {
      linkCounts.set(rel.from, (linkCounts.get(rel.from) || 0) + 1);
      linkCounts.set(rel.to, (linkCounts.get(rel.to) || 0) + 1);
    });
    
    return Array.from(linkCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([entity, count]) => ({ entity, linkCount: count }));
  }
  
  /**
   * Get entities with no relationships
   */
  getOrphanedEntities() {
    const linkedEntities = new Set();
    this.relationships.forEach(rel => {
      linkedEntities.add(rel.from);
      linkedEntities.add(rel.to);
    });
    
    const orphaned = [];
    
    this.entities.materials.forEach(material => {
      if (!linkedEntities.has(material.name)) {
        orphaned.push({ name: material.name, type: 'material', path: material.path });
      }
    });
    
    this.entities.contaminants.forEach(contaminant => {
      if (!linkedEntities.has(contaminant.name)) {
        orphaned.push({ name: contaminant.name, type: 'contaminant', path: contaminant.path });
      }
    });
    
    return orphaned;
  }
  
  /**
   * Print summary to console
   */
  printSummary() {
    console.log('\n📊 Entity Map Summary\n');
    console.log('═'.repeat(60));
    console.log(`\n📦 Total Entities: ${this.entities.materials.size + this.entities.contaminants.size}`);
    console.log(`   Materials: ${this.entities.materials.size}`);
    console.log(`   Contaminants: ${this.entities.contaminants.size}`);
    console.log(`\n🔗 Relationships: ${this.relationships.length}`);
    console.log(`   Average per entity: ${Math.round(
      this.relationships.length / 
      (this.entities.materials.size + this.entities.contaminants.size)
    )}`);
    
    console.log('\n🏆 Top 10 Most Linked Entities:');
    this.getTopLinkedEntities(10).forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.entity} (${item.linkCount} links)`);
    });
    
    const orphaned = this.getOrphanedEntities();
    if (orphaned.length > 0) {
      console.log(`\n⚠️  Orphaned Entities (no relationships): ${orphaned.length}`);
      orphaned.slice(0, 5).forEach(entity => {
        console.log(`   - ${entity.name} (${entity.type})`);
      });
      if (orphaned.length > 5) {
        console.log(`   ... and ${orphaned.length - 5} more`);
      }
    }
    
    console.log('\n' + '═'.repeat(60) + '\n');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🗺️  Entity Mapping Tool\n');
  
  const mapper = new EntityMapper();
  
  await mapper.loadEntities();
  mapper.buildRelationships();
  
  const report = mapper.generateReport();
  mapper.printSummary();
  
  // Save report
  const outputPath = './seo/analysis/entity-map.json';
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  console.log(`📁 Entity map saved to: ${outputPath}\n`);
  
  // Save simplified link graph for visualization
  const graphPath = './seo/analysis/entity-graph.json';
  const graph = {
    nodes: [
      ...Array.from(mapper.entities.materials.values()).map(m => ({
        id: m.name,
        type: 'material',
        path: m.path
      })),
      ...Array.from(mapper.entities.contaminants.values()).map(c => ({
        id: c.name,
        type: 'contaminant',
        path: c.path
      }))
    ],
    links: mapper.relationships.map(rel => ({
      source: rel.from,
      target: rel.to
    }))
  };
  
  fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2));
  console.log(`📁 Entity graph saved to: ${graphPath}\n`);
}

main().catch(console.error);
