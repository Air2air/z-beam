#!/usr/bin/env tsx

import { getSitemapEntries } from '../../app/sitemap.xml/route';

async function analyzeSitemap() {
  console.log('📊 SITEMAP ANALYSIS');
  console.log('='.repeat(60));
  
  const entries = getSitemapEntries();
  const domains = new Set<string>();
  const contentTypes = {
    static: [] as string[],
    materials: [] as string[],
    contaminants: [] as string[],
    compounds: [] as string[],
    settings: [] as string[],
  };

  entries.forEach(entry => {
    const url = new URL(entry.url);
    domains.add(url.origin);
    
    if (url.pathname === '/' || url.pathname.match(/^\/(about|services|rental|partners|netalux|contact|datasets|search)$/)) {
      contentTypes.static.push(url.pathname);
    } else if (url.pathname.startsWith('/materials')) {
      contentTypes.materials.push(url.pathname);
    } else if (url.pathname.startsWith('/contaminants')) {
      contentTypes.contaminants.push(url.pathname);
    } else if (url.pathname.startsWith('/compounds')) {
      contentTypes.compounds.push(url.pathname);
    } else if (url.pathname.startsWith('/settings')) {
      contentTypes.settings.push(url.pathname);
    }
  });

  console.log(`\nTotal Entries: ${entries.length}`);
  console.log(`Domains: ${Array.from(domains).join(', ')}`);
  console.log('\n📄 Content Breakdown:');
  console.log(`  Static Pages: ${contentTypes.static.length}`);
  console.log(`  Materials: ${contentTypes.materials.length}`);
  console.log(`  Contaminants: ${contentTypes.contaminants.length}`);
  console.log(`  Compounds: ${contentTypes.compounds.length}`);
  console.log(`  Settings: ${contentTypes.settings.length}`);
  
  // Verify file counts match
  console.log('\n📁 Frontmatter File Counts (expected):');
  console.log('  Materials: 153 files');
  console.log('  Contaminants: 98 files');
  console.log('  Compounds: 34 files');
  console.log('  Settings: 153 files');
  
  // Check for missing pages
  const warnings = [];
  
  if (contentTypes.materials.length < 153) {
    warnings.push(`⚠️  Materials: Only ${contentTypes.materials.length}/153 in sitemap`);
  }
  if (contentTypes.contaminants.length < 98) {
    warnings.push(`⚠️  Contaminants: Only ${contentTypes.contaminants.length}/98 in sitemap`);
  }
  if (contentTypes.compounds.length < 34) {
    warnings.push(`⚠️  Compounds: Only ${contentTypes.compounds.length}/34 in sitemap`);
  }
  if (contentTypes.settings.length < 153) {
    warnings.push(`⚠️  Settings: Only ${contentTypes.settings.length}/153 in sitemap`);
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(w => console.log(`  ${w}`));
  } else {
    console.log('\n✅ All pages accounted for in sitemap');
  }
  
  // Check domain consistency
  if (domains.size === 1) {
    console.log('✅ All URLs use consistent domain');
  } else {
    console.log(`❌ Multiple domains found: ${Array.from(domains).join(', ')}`);
  }
  
  // Sample URLs
  console.log('\n🔗 Sample URLs:');
  console.log(`  Homepage: ${entries[0].url}`);
  console.log(`  Material: ${contentTypes.materials[0] || 'N/A'}`);
  console.log(`  Contaminant: ${contentTypes.contaminants[0] || 'N/A'}`);
  console.log(`  Compound: ${contentTypes.compounds[0] || 'N/A'}`);
  console.log(`  Settings: ${contentTypes.settings[0] || 'N/A'}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ SITEMAP ANALYSIS COMPLETE');
}

analyzeSitemap().catch(console.error);
