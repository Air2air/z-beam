#!/usr/bin/env node

/**
 * FRONTMATTER FRESHNESS TIMESTAMP UPDATER
 * ========================================
 * 
 * @deprecated Basic freshness timestamp initialization is now handled automatically
 *             by app/utils/normalizers/freshnessNormalizer.ts
 * 
 * This script remains useful for:
 * - Batch updates of existing files
 * - Strategic freshness rotation scheduling
 * - Manual control over update timing
 * 
 * For new materials, datePublished and dateModified are automatically added
 * at load time in contentAPI.ts
 * 
 * Updates frontmatter timestamps to signal content freshness to Google
 * while maintaining authentic modification history.
 * 
 * GOOGLE FRESHNESS SIGNALS:
 * - Content updated within 30 days: "Fresh" content boost
 * - Content updated 30-90 days: Normal ranking
 * - Content updated 90+ days: Potential "stale" penalty
 * 
 * STRATEGY:
 * 1. Add `dateModified` field to all frontmatter files
 * 2. Set initial `datePublished` if missing (use micro.generated)
 * 3. Update `dateModified` on a rotating schedule
 * 4. Track update history for authenticity
 * 
 * USAGE:
 *   npm run update-freshness              # Dry run (preview changes)
 *   npm run update-freshness -- --execute # Apply changes
 *   npm run update-freshness -- --batch=20 # Update 20 files
 *   npm run update-freshness -- --oldest   # Update oldest files first
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Directory containing frontmatter YAML files
  frontmatterDir: path.join(process.cwd(), 'frontmatter/materials'),
  
  // Freshness intervals (days)
  intervals: {
    fresh: 30,      // Google considers "fresh" within 30 days
    normal: 90,     // Normal ranking between 30-90 days
    stale: 180,     // Potentially "stale" after 180 days
  },
  
  // Update strategy
  strategy: {
    batchSize: 25,           // Files to update per run (default)
    minDaysBetweenUpdates: 7, // Minimum days between updates (authenticity)
    maxDaysBetweenUpdates: 45, // Maximum days between updates (freshness)
    
    // Priority: Update oldest files first
    sortBy: 'oldest',        // 'oldest' | 'random' | 'alphabetical'
    
    // Variation: Add slight randomness to timestamps (looks natural)
    timestampVariation: true,
    variationMinutes: 120,   // ±2 hours from exact time
  },
  
  // Tracking
  trackingFile: path.join(process.cwd(), 'content/.freshness-updates.json'),
};

// ============================================
// TIMESTAMP UTILITIES
// ============================================

/**
 * Get current ISO 8601 timestamp with optional variation
 */
function getCurrentTimestamp(withVariation = false) {
  const now = new Date();
  
  if (withVariation && CONFIG.strategy.timestampVariation) {
    // Add random variation (±variationMinutes)
    const variation = (Math.random() - 0.5) * 2 * CONFIG.strategy.variationMinutes;
    now.setMinutes(now.getMinutes() + variation);
  }
  
  return now.toISOString();
}

/**
 * Parse date string to Date object
 */
function parseDate(dateString) {
  if (!dateString) return null;
  try {
    return new Date(dateString);
  } catch (error) {
    return null;
  }
}

/**
 * Calculate days since date
 */
function daysSince(dateString) {
  const date = parseDate(dateString);
  if (!date) return Infinity;
  
  const now = new Date();
  const diffMs = now - date;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get freshness status
 */
function getFreshnessStatus(dateString) {
  const days = daysSince(dateString);
  
  if (days <= CONFIG.intervals.fresh) return 'fresh';
  if (days <= CONFIG.intervals.normal) return 'normal';
  if (days <= CONFIG.intervals.stale) return 'stale';
  return 'very_stale';
}

// ============================================
// FILE OPERATIONS
// ============================================

/**
 * Load all frontmatter YAML files
 */
async function loadFrontmatterFiles() {
  const files = await fs.readdir(CONFIG.frontmatterDir);
  const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  
  const fileData = [];
  
  for (const filename of yamlFiles) {
    const filepath = path.join(CONFIG.frontmatterDir, filename);
    const content = await fs.readFile(filepath, 'utf8');
    
    try {
      const data = yaml.load(content);
      
      fileData.push({
        filename,
        filepath,
        content,
        data,
        slug: filename.replace(/\.(yaml|yml)$/, ''),
      });
    } catch (error) {
      console.error(`❌ Error parsing ${filename}:`, error.message);
    }
  }
  
  return fileData;
}

/**
 * Load update tracking data
 */
async function loadTrackingData() {
  try {
    const content = await fs.readFile(CONFIG.trackingFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist yet, return empty tracking
    return {
      lastRun: null,
      updates: {},
      totalUpdates: 0,
    };
  }
}

/**
 * Save update tracking data
 */
async function saveTrackingData(tracking) {
  await fs.writeFile(
    CONFIG.trackingFile,
    JSON.stringify(tracking, null, 2),
    'utf8'
  );
}

/**
 * Update frontmatter file with new timestamps
 */
async function updateFrontmatterFile(file, updates) {
  const lines = file.content.split('\n');
  const updatedLines = [...lines];
  
  // Find insertion points for datePublished and dateModified
  let datePublishedLine = -1;
  let dateModifiedLine = -1;
  let materialDescriptionLine = -1;
  let descriptionLine = -1;
  let nextTopLevelAfterMaterialDescription = -1;
  let nextTopLevelAfterDescription = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Track top-level keys (no leading spaces)
    const isTopLevel = line.match(/^[a-zA-Z]/);
    
    if (line.startsWith('datePublished:')) {
      datePublishedLine = i;
    }
    if (line.startsWith('dateModified:')) {
      dateModifiedLine = i;
    }
    if (line.startsWith('description:')) {
      descriptionLine = i;
    }
    
    // Find next top-level key after description
    if (descriptionLine >= 0 && nextTopLevelAfterMaterialDescription === -1 && isTopLevel && i > descriptionLine) {
      nextTopLevelAfterMaterialDescription = i;
    }
    
    // Find next top-level key after description
    if (descriptionLine >= 0 && nextTopLevelAfterDescription === -1 && isTopLevel && i > descriptionLine) {
      nextTopLevelAfterDescription = i;
    }
  }
  
  // Update or insert datePublished
  if (updates.datePublished) {
    const publishedLine = `datePublished: '${updates.datePublished}'`;
    
    if (datePublishedLine >= 0) {
      updatedLines[datePublishedLine] = publishedLine;
    } else {
      // Insert before next top-level key after description
      let insertBefore = -1;
      if (nextTopLevelAfterMaterialDescription >= 0) {
        insertBefore = nextTopLevelAfterMaterialDescription;
      } else if (nextTopLevelAfterDescription >= 0) {
        insertBefore = nextTopLevelAfterDescription;
      } else if (materialDescriptionLine >= 0) {
        insertBefore = materialDescriptionLine + 1;
      } else if (descriptionLine >= 0) {
        insertBefore = descriptionLine + 1;
      } else {
        insertBefore = 1; // After name/title
      }
      
      updatedLines.splice(insertBefore, 0, publishedLine);
      
      // Adjust line numbers after insertion
      if (datePublishedLine >= insertBefore) datePublishedLine++;
      if (materialDescriptionLine >= insertBefore) materialDescriptionLine++;
      if (descriptionLine >= insertBefore) descriptionLine++;
      if (nextTopLevelAfterMaterialDescription >= insertBefore) nextTopLevelAfterMaterialDescription++;
      if (nextTopLevelAfterDescription >= insertBefore) nextTopLevelAfterDescription++;
    }
  }
  
  // Update or insert dateModified
  if (updates.dateModified) {
    const modifiedLine = `dateModified: '${updates.dateModified}'`;
    
    if (dateModifiedLine >= 0) {
      updatedLines[dateModifiedLine] = modifiedLine;
    } else {
      // Insert after datePublished, or before next top-level key after subtitle
      let insertBefore = -1;
      
      // Recalculate datePublished line in updated content
      const currentDatePublishedLine = updatedLines.findIndex(l => l.startsWith('datePublished:'));
      
      if (currentDatePublishedLine >= 0) {
        // Insert right after datePublished
        insertBefore = currentDatePublishedLine + 1;
      } else if (nextTopLevelAfterSubtitle >= 0) {
        insertBefore = nextTopLevelAfterSubtitle;
      } else if (nextTopLevelAfterDescription >= 0) {
        insertBefore = nextTopLevelAfterDescription;
      } else if (subtitleLine >= 0) {
        insertBefore = subtitleLine + 1;
      } else if (descriptionLine >= 0) {
        insertBefore = descriptionLine + 1;
      } else {
        insertBefore = 1;
      }
      
      updatedLines.splice(insertBefore, 0, modifiedLine);
    }
  }
  
  // Write updated content
  await fs.writeFile(file.filepath, updatedLines.join('\n'), 'utf8');
}

// ============================================
// UPDATE LOGIC
// ============================================

/**
 * Determine which files need updating
 */
function selectFilesForUpdate(files, tracking, options = {}) {
  const batchSize = options.batch || CONFIG.strategy.batchSize;
  const sortBy = options.oldest ? 'oldest' : CONFIG.strategy.sortBy;
  
  // Calculate update priority for each file
  const priorities = files.map(file => {
    const { data, slug } = file;
    
    // Get existing dates
    const datePublished = data.datePublished || data.micro?.generated;
    const dateModified = data.dateModified;
    
    // Get last update from tracking
    const lastUpdate = tracking.updates[slug]?.lastUpdate;
    const updateCount = tracking.updates[slug]?.count || 0;
    
    // Calculate days since last modification
    const daysSincePublished = daysSince(datePublished);
    const daysSinceModified = daysSince(dateModified);
    const daysSinceLastUpdate = daysSince(lastUpdate);
    
    // Determine if file needs update
    const needsPublished = !datePublished;
    const needsModified = !dateModified;
    const isStale = daysSinceModified > CONFIG.intervals.normal;
    const canUpdate = daysSinceLastUpdate >= CONFIG.strategy.minDaysBetweenUpdates;
    
    return {
      file,
      slug,
      datePublished,
      dateModified,
      daysSincePublished,
      daysSinceModified,
      daysSinceLastUpdate,
      updateCount,
      needsPublished,
      needsModified,
      isStale,
      canUpdate,
      priority: calculatePriority(daysSinceModified, updateCount, needsModified),
    };
  });
  
  // Filter to files that can be updated
  const updateable = priorities.filter(p => 
    p.canUpdate && (p.needsPublished || p.needsModified || p.isStale)
  );
  
  // Sort by strategy
  let sorted;
  if (sortBy === 'oldest') {
    sorted = updateable.sort((a, b) => b.daysSinceModified - a.daysSinceModified);
  } else if (sortBy === 'random') {
    sorted = updateable.sort(() => Math.random() - 0.5);
  } else {
    sorted = updateable.sort((a, b) => a.slug.localeCompare(b.slug));
  }
  
  // Take batch
  return sorted.slice(0, batchSize);
}

/**
 * Calculate priority score for updates
 */
function calculatePriority(daysSinceModified, updateCount, needsModified) {
  let priority = 0;
  
  // Higher priority for files that have never been updated
  if (needsModified) priority += 1000;
  
  // Higher priority for stale content
  if (daysSinceModified > CONFIG.intervals.stale) priority += 500;
  else if (daysSinceModified > CONFIG.intervals.normal) priority += 250;
  
  // Slightly lower priority for frequently updated files
  priority -= updateCount * 10;
  
  // Add days since modified to prioritize oldest
  priority += daysSinceModified;
  
  return priority;
}

/**
 * Generate updates for a file
 */
function generateUpdates(file, tracking) {
  const { data, slug } = file;
  const updates = {};
  
  // Set datePublished if missing (use micro.generated or current time)
  if (!data.datePublished) {
    updates.datePublished = data.micro?.generated || getCurrentTimestamp(false);
  }
  
  // Set or update dateModified
  updates.dateModified = getCurrentTimestamp(true);
  
  return updates;
}

// ============================================
// REPORTING
// ============================================

/**
 * Generate update report
 */
function generateReport(filesToUpdate, tracking) {
  console.log('\n📊 FRESHNESS UPDATE REPORT');
  console.log('='.repeat(60));
  
  // Overall stats
  console.log('\n📈 Overall Statistics:');
  console.log(`   Total frontmatter files: ${tracking.totalFiles || 0}`);
  console.log(`   Files in this batch: ${filesToUpdate.length}`);
  console.log(`   Total updates performed: ${tracking.totalUpdates || 0}`);
  
  // Freshness breakdown
  const fresh = filesToUpdate.filter(f => f.daysSinceModified <= CONFIG.intervals.fresh);
  const normal = filesToUpdate.filter(f => 
    f.daysSinceModified > CONFIG.intervals.fresh && 
    f.daysSinceModified <= CONFIG.intervals.normal
  );
  const stale = filesToUpdate.filter(f => f.daysSinceModified > CONFIG.intervals.normal);
  
  console.log('\n🎯 Freshness Status:');
  console.log(`   Fresh (≤30 days): ${fresh.length} files`);
  console.log(`   Normal (30-90 days): ${normal.length} files`);
  console.log(`   Stale (>90 days): ${stale.length} files`);
  
  // Files to update
  console.log('\n📝 Files to Update:');
  filesToUpdate.forEach((item, index) => {
    const { slug, daysSinceModified, needsPublished, needsModified } = item;
    const status = getFreshnessStatus(item.dateModified);
    const statusIcon = {
      fresh: '🟢',
      normal: '🟡',
      stale: '🟠',
      very_stale: '🔴',
    }[status] || '⚪';
    
    const flags = [];
    if (needsPublished) flags.push('NEW_PUBLISHED');
    if (needsModified) flags.push('NEW_MODIFIED');
    
    console.log(
      `   ${(index + 1).toString().padStart(2)}. ${statusIcon} ${slug.padEnd(50)} ` +
      `${daysSinceModified.toString().padStart(3)} days ago ${flags.length ? `[${flags.join(', ')}]` : ''}`
    );
  });
  
  console.log('\n' + '='.repeat(60));
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const batch = args.find(a => a.startsWith('--batch='))?.split('=')[1];
  const oldest = args.includes('--oldest');
  
  console.log('\n🚀 FRONTMATTER FRESHNESS TIMESTAMP UPDATER');
  console.log('='.repeat(60));
  console.log(`Mode: ${execute ? '✅ EXECUTE' : '👁️  DRY RUN (preview only)'}`);
  console.log(`Batch size: ${batch || CONFIG.strategy.batchSize}`);
  console.log(`Strategy: ${oldest ? 'Update oldest first' : CONFIG.strategy.sortBy}`);
  
  // Load files and tracking
  const files = await loadFrontmatterFiles();
  const tracking = await loadTrackingData();
  
  console.log(`\n📁 Loaded ${files.length} frontmatter files`);
  
  // Select files to update
  const filesToUpdate = selectFilesForUpdate(files, tracking, { batch, oldest });
  
  if (filesToUpdate.length === 0) {
    console.log('\n✅ No files need updating at this time.');
    console.log('   (All files are within freshness interval)');
    return;
  }
  
  // Generate report
  generateReport(filesToUpdate, {
    ...tracking,
    totalFiles: files.length,
  });
  
  if (!execute) {
    console.log('\n👁️  DRY RUN - No changes made');
    console.log('   Run with --execute flag to apply changes:');
    console.log('   npm run update-freshness -- --execute');
    return;
  }
  
  // Execute updates
  console.log('\n⚡ Executing updates...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of filesToUpdate) {
    const { file, slug } = item;
    
    try {
      const updates = generateUpdates(file, tracking);
      await updateFrontmatterFile(file, updates);
      
      // Update tracking
      if (!tracking.updates[slug]) {
        tracking.updates[slug] = {
          count: 0,
          history: [],
        };
      }
      
      tracking.updates[slug].count++;
      tracking.updates[slug].lastUpdate = updates.dateModified;
      tracking.updates[slug].history.push({
        date: updates.dateModified,
        fields: Object.keys(updates),
      });
      
      console.log(`   ✅ ${slug}`);
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ ${slug}: ${error.message}`);
      errorCount++;
    }
  }
  
  // Update global tracking
  tracking.lastRun = getCurrentTimestamp(false);
  tracking.totalUpdates = (tracking.totalUpdates || 0) + successCount;
  
  // Save tracking
  await saveTrackingData(tracking);
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Complete: ${successCount} updated, ${errorCount} errors`);
  console.log(`📝 Tracking saved to: ${CONFIG.trackingFile}`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Review changes: git diff frontmatter/materials/');
  console.log('   2. Test build: npm run build');
  console.log('   3. Commit: git add . && git commit -m "chore: update content freshness timestamps"');
  console.log('   4. Deploy: ./smart-deploy.sh deploy');
  console.log('\n🔄 Schedule this script to run weekly for optimal freshness!');
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
