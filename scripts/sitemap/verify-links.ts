#!/usr/bin/env tsx

import sitemap from '../../app/sitemap';
import fs from 'fs';
import path from 'path';

async function verifyLinks() {
  console.log('🔗 LINK VERIFICATION REPORT');
  console.log('='.repeat(60));
  
  const entries = sitemap();
  const issues: string[] = [];
  const urlSet = new Set<string>();
  
  // Check for duplicates
  entries.forEach(entry => {
    if (urlSet.has(entry.url)) {
      issues.push(`❌ Duplicate URL: ${entry.url}`);
    }
    urlSet.add(entry.url);
  });
  
  // Verify URL structure
  const urlPatterns = {
    valid: 0,
    invalid: [] as string[]
  };
  
  entries.forEach(entry => {
    try {
      const url = new URL(entry.url);
      
      // Check for proper URL structure
      if (!url.protocol.match(/^https?:$/)) {
        urlPatterns.invalid.push(`Invalid protocol: ${entry.url}`);
      } else if (!url.hostname) {
        urlPatterns.invalid.push(`Missing hostname: ${entry.url}`);
      } else {
        urlPatterns.valid++;
      }
      
      // Check for common issues
      if (entry.url.includes('//')) {
        const doubleSlash = entry.url.match(/([^:]\/\/)/);
        if (doubleSlash) {
          issues.push(`⚠️  Double slash in path: ${entry.url}`);
        }
      }
      
      if (entry.url.includes(' ')) {
        issues.push(`❌ Space in URL: ${entry.url}`);
      }
      
    } catch (err) {
      urlPatterns.invalid.push(entry.url);
      issues.push(`❌ Malformed URL: ${entry.url}`);
    }
  });
  
  // Verify frontmatter files exist
  console.log('\n📁 Verifying frontmatter files...');
  const frontmatterDirs = ['materials', 'contaminants', 'compounds', 'settings'];
  const fileCounts: Record<string, number> = {};
  
  frontmatterDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), 'frontmatter', dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.yaml') && !f.endsWith('.backup'));
    fileCounts[dir] = files.length;
  });
  
  // Count sitemap entries per type
  const sitemapCounts = {
    materials: entries.filter(e => e.url.includes('/materials/')).length,
    contaminants: entries.filter(e => e.url.includes('/contaminants/')).length,
    compounds: entries.filter(e => e.url.includes('/compounds/')).length,
    settings: entries.filter(e => e.url.includes('/settings/')).length,
  };
  
  // Report results
  console.log('\n📊 VERIFICATION RESULTS:');
  console.log(`Total URLs: ${entries.length}`);
  console.log(`Unique URLs: ${urlSet.size}`);
  console.log(`Valid URL structure: ${urlPatterns.valid}/${entries.length}`);
  
  if (urlPatterns.invalid.length > 0) {
    console.log(`\n❌ Invalid URLs (${urlPatterns.invalid.length}):`);
    urlPatterns.invalid.slice(0, 10).forEach(url => console.log(`  ${url}`));
    if (urlPatterns.invalid.length > 10) {
      console.log(`  ... and ${urlPatterns.invalid.length - 10} more`);
    }
  }
  
  console.log('\n📄 Content Type Coverage:');
  console.log(`  Materials:`);
  console.log(`    Frontmatter files: ${fileCounts.materials}`);
  console.log(`    Sitemap entries: ${sitemapCounts.materials}`);
  console.log(`    Coverage: ${sitemapCounts.materials >= fileCounts.materials ? '✅' : '⚠️'}`);
  
  console.log(`  Contaminants:`);
  console.log(`    Frontmatter files: ${fileCounts.contaminants}`);
  console.log(`    Sitemap entries: ${sitemapCounts.contaminants}`);
  console.log(`    Coverage: ${sitemapCounts.contaminants >= fileCounts.contaminants ? '✅' : '⚠️'}`);
  
  console.log(`  Compounds:`);
  console.log(`    Frontmatter files: ${fileCounts.compounds}`);
  console.log(`    Sitemap entries: ${sitemapCounts.compounds}`);
  console.log(`    Coverage: ${sitemapCounts.compounds >= fileCounts.compounds ? '✅' : '⚠️'}`);
  
  console.log(`  Settings:`);
  console.log(`    Frontmatter files: ${fileCounts.settings}`);
  console.log(`    Sitemap entries: ${sitemapCounts.settings}`);
  console.log(`    Coverage: ${sitemapCounts.settings >= fileCounts.settings ? '✅' : '⚠️'}`);
  
  if (issues.length > 0) {
    console.log(`\n⚠️  ISSUES FOUND (${issues.length}):`);
    issues.slice(0, 20).forEach(issue => console.log(`  ${issue}`));
    if (issues.length > 20) {
      console.log(`  ... and ${issues.length - 20} more issues`);
    }
  } else {
    console.log('\n✅ No issues found!');
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (issues.length === 0 && urlPatterns.invalid.length === 0) {
    console.log('✅ ALL LINKS VERIFIED SUCCESSFULLY');
    process.exit(0);
  } else {
    console.log('⚠️  VERIFICATION COMPLETED WITH WARNINGS');
    process.exit(0); // Don't fail the build, just warn
  }
}

verifyLinks().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
