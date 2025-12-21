#!/usr/bin/env node

/**
 * Automatic Schema Generation
 * 
 * Analyzes pages for content patterns and automatically generates:
 * - FAQPage schema from Q&A content
 * - HowTo schema from step-by-step content
 * - VideoObject schema from video embeds
 * - Product schema from material listings
 * 
 * Usage:
 *   npm run validate:schema-richness -- --auto-generate
 *   npm run generate:schemas
 *   npm run generate:schemas -- --dry-run
 *   npm run generate:schemas -- --page=/booking
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_PAGE = process.argv.find(arg => arg.startsWith('--page='))?.split('=')[1];

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const results = {
  generated: [],
  skipped: [],
  failed: [],
};

/**
 * Detect FAQ content
 */
async function detectFAQContent(page) {
  return page.evaluate(() => {
    const questions = [];
    
    // Strategy 1: Look for dt/dd pairs
    const dts = document.querySelectorAll('dt');
    dts.forEach(dt => {
      const dd = dt.nextElementSibling;
      if (dd && dd.tagName === 'DD') {
        questions.push({
          question: dt.textContent.trim(),
          answer: dd.textContent.trim(),
        });
      }
    });
    
    // Strategy 2: Look for heading + paragraph pairs
    if (questions.length === 0) {
      const headings = document.querySelectorAll('h2, h3, h4');
      headings.forEach(heading => {
        const text = heading.textContent.trim();
        if (text.includes('?') || text.toLowerCase().includes('how') || 
            text.toLowerCase().includes('what') || text.toLowerCase().includes('why')) {
          const next = heading.nextElementSibling;
          if (next && next.tagName === 'P') {
            questions.push({
              question: text,
              answer: next.textContent.trim(),
            });
          }
        }
      });
    }
    
    return questions.length >= 2 ? questions : null;
  });
}

/**
 * Detect HowTo content
 */
async function detectHowToContent(page) {
  return page.evaluate(() => {
    const steps = [];
    
    // Strategy 1: Ordered list items
    const ols = document.querySelectorAll('ol');
    ols.forEach(ol => {
      const items = ol.querySelectorAll('li');
      if (items.length >= 3) {
        items.forEach((item, index) => {
          steps.push({
            position: index + 1,
            name: item.textContent.trim(),
            text: item.textContent.trim(),
          });
        });
      }
    });
    
    // Strategy 2: Step headings
    if (steps.length === 0) {
      const headings = document.querySelectorAll('h2, h3');
      headings.forEach((heading, index) => {
        const text = heading.textContent.trim();
        if (text.toLowerCase().includes('step') || /^\d+\./.test(text)) {
          const next = heading.nextElementSibling;
          const description = next?.tagName === 'P' ? next.textContent.trim() : text;
          
          steps.push({
            position: index + 1,
            name: text,
            text: description,
          });
        }
      });
    }
    
    return steps.length >= 3 ? steps : null;
  });
}

/**
 * Detect Video content
 */
async function detectVideoContent(page) {
  return page.evaluate(() => {
    const videos = [];
    
    // Look for video elements or iframes
    const videoElements = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    
    videoElements.forEach(element => {
      let videoData = {
        name: '',
        description: '',
        thumbnailUrl: '',
        uploadDate: '',
        duration: '',
        contentUrl: '',
      };
      
      if (element.tagName === 'VIDEO') {
        videoData.name = element.getAttribute('title') || element.getAttribute('aria-label') || 'Video';
        videoData.contentUrl = element.src || element.querySelector('source')?.src || '';
        videoData.thumbnailUrl = element.poster || '';
      } else if (element.tagName === 'IFRAME') {
        videoData.name = element.getAttribute('title') || 'Embedded Video';
        videoData.contentUrl = element.src;
        
        // Extract YouTube/Vimeo ID for thumbnail
        const youtubeMatch = element.src.match(/youtube\.com\/embed\/([^?]+)/);
        const vimeoMatch = element.src.match(/vimeo\.com\/video\/(\d+)/);
        
        if (youtubeMatch) {
          videoData.thumbnailUrl = `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
        }
      }
      
      // Try to find description from nearby content
      let current = element.parentElement;
      while (current && !videoData.description) {
        const figcaption = current.querySelector('figcaption');
        if (figcaption) {
          videoData.description = figcaption.textContent.trim();
        }
        current = current.parentElement;
      }
      
      if (videoData.contentUrl) {
        videos.push(videoData);
      }
    });
    
    return videos.length > 0 ? videos : null;
  });
}

/**
 * Generate FAQPage schema
 */
function generateFAQSchema(questions, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * Generate HowTo schema
 */
function generateHowToSchema(steps, url, title) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title || 'How-To Guide',
    step: steps.map(step => ({
      '@type': 'HowToStep',
      position: step.position,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Generate VideoObject schema
 */
function generateVideoSchema(video, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description || video.name,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate || new Date().toISOString().split('T')[0],
    contentUrl: video.contentUrl,
  };
}

/**
 * Write schema to page file
 */
async function writeSchemaToPage(pagePath, schema, schemaType) {
  const pageFilePath = path.join(process.cwd(), 'app', pagePath, 'page.tsx');
  
  try {
    const content = await fs.readFile(pageFilePath, 'utf8');
    
    // Check if schema already exists
    if (content.includes(`"@type": "${schemaType}"`)) {
      return { success: false, message: `${schemaType} schema already exists` };
    }
    
    // Find where to insert schema
    // Strategy: Look for existing schema, or add after metadata
    const schemaJson = JSON.stringify(schema, null, 2);
    
    // Create schema component
    const schemaComponent = `
// Auto-generated ${schemaType} Schema
const ${schemaType.toLowerCase()}Schema = ${schemaJson};
`;
    
    // Insert before export default
    const updated = content.replace(
      /export default function/,
      `${schemaComponent}\nexport default function`
    );
    
    if (updated === content) {
      return { success: false, message: 'Could not find insertion point' };
    }
    
    // Also need to add schema to page head
    const withSchemaTag = updated.replace(
      /<div/,
      `<>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(${schemaType.toLowerCase()}Schema) }}
      />
      <div`
    ).replace(
      /<\/div>\s*\)/,
      `</div>
      </>`
    );
    
    await fs.writeFile(pageFilePath, withSchemaTag, 'utf8');
    
    return { 
      success: true, 
      message: `Generated ${schemaType} schema`,
      file: pageFilePath.replace(process.cwd(), ''),
    };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Process a single page
 */
async function processPage(browser, pagePath) {
  const url = `${BASE_URL}${pagePath}`;
  log(`\n🔍 Analyzing: ${url}`, 'cyan');
  
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Get page title
    const title = await page.title();
    
    // Detect content patterns
    const faqContent = await detectFAQContent(page);
    const howtoContent = await detectHowToContent(page);
    const videoContent = await detectVideoContent(page);
    
    // Generate schemas
    if (faqContent) {
      log(`  Found ${faqContent.length} FAQ items`, 'green');
      
      if (DRY_RUN) {
        log('  [DRY RUN] Would generate FAQPage schema', 'yellow');
        results.skipped.push({ page: pagePath, type: 'FAQPage', reason: 'Dry run' });
      } else {
        const schema = generateFAQSchema(faqContent, url);
        const result = await writeSchemaToPage(pagePath, schema, 'FAQPage');
        
        if (result.success) {
          log(`  ✓ ${result.message}`, 'green');
          results.generated.push({ page: pagePath, type: 'FAQPage', file: result.file });
        } else {
          log(`  ⊘ ${result.message}`, 'yellow');
          results.skipped.push({ page: pagePath, type: 'FAQPage', reason: result.message });
        }
      }
    }
    
    if (howtoContent) {
      log(`  Found ${howtoContent.length} how-to steps`, 'green');
      
      if (DRY_RUN) {
        log('  [DRY RUN] Would generate HowTo schema', 'yellow');
        results.skipped.push({ page: pagePath, type: 'HowTo', reason: 'Dry run' });
      } else {
        const schema = generateHowToSchema(howtoContent, url, title);
        const result = await writeSchemaToPage(pagePath, schema, 'HowTo');
        
        if (result.success) {
          log(`  ✓ ${result.message}`, 'green');
          results.generated.push({ page: pagePath, type: 'HowTo', file: result.file });
        } else {
          log(`  ⊘ ${result.message}`, 'yellow');
          results.skipped.push({ page: pagePath, type: 'HowTo', reason: result.message });
        }
      }
    }
    
    if (videoContent) {
      log(`  Found ${videoContent.length} video(s)`, 'green');
      
      for (const video of videoContent) {
        if (DRY_RUN) {
          log(`  [DRY RUN] Would generate VideoObject schema for "${video.name}"`, 'yellow');
          results.skipped.push({ page: pagePath, type: 'VideoObject', reason: 'Dry run' });
        } else {
          const schema = generateVideoSchema(video, url);
          const result = await writeSchemaToPage(pagePath, schema, 'VideoObject');
          
          if (result.success) {
            log(`  ✓ ${result.message}`, 'green');
            results.generated.push({ page: pagePath, type: 'VideoObject', file: result.file });
          } else {
            log(`  ⊘ ${result.message}`, 'yellow');
            results.skipped.push({ page: pagePath, type: 'VideoObject', reason: result.message });
          }
        }
      }
    }
    
    if (!faqContent && !howtoContent && !videoContent) {
      log('  No schema opportunities detected', 'reset');
    }
    
  } catch (error) {
    log(`  ✗ Error: ${error.message}`, 'red');
    results.failed.push({ page: pagePath, error: error.message });
  } finally {
    await page.close();
  }
}

/**
 * Main generation function
 */
async function generateSchemas() {
  log('\n' + '='.repeat(60), 'bright');
  log('  Automatic Schema Generation', 'bright');
  log('='.repeat(60) + '\n', 'bright');
  
  if (DRY_RUN) {
    log('⚠️  DRY RUN MODE - No schemas will be generated\n', 'yellow');
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    // Define pages to check
    const pagesToCheck = TARGET_PAGE 
      ? [TARGET_PAGE]
      : [
          '/',
          '/about',
          '/schedule',
          '/rental',
          '/services',
          '/contact',
          '/materials',
        ];
    
    for (const pagePath of pagesToCheck) {
      await processPage(browser, pagePath);
    }
    
    // Generate report
    log('\n' + '='.repeat(60), 'bright');
    log('  Schema Generation Summary', 'bright');
    log('='.repeat(60) + '\n', 'bright');
    
    log(`Schemas generated: ${results.generated.length}`, 'green');
    log(`Skipped: ${results.skipped.length}`, 'yellow');
    log(`Failed: ${results.failed.length}`, 'red');
    
    if (results.generated.length > 0) {
      log('\n✓ Generated Schemas:', 'green');
      results.generated.forEach(item => {
        log(`  • ${item.type} for ${item.page}`, 'reset');
        log(`    File: ${item.file}`, 'cyan');
      });
    }
    
    if (results.skipped.length > 0) {
      log('\n⊘ Skipped:', 'yellow');
      results.skipped.forEach(item => {
        log(`  • ${item.type} for ${item.page}: ${item.reason}`, 'reset');
      });
    }
    
    if (results.failed.length > 0) {
      log('\n✗ Failed:', 'red');
      results.failed.forEach(item => {
        log(`  • ${item.page}: ${item.error}`, 'reset');
      });
    }
    
    if (DRY_RUN) {
      log('\n💡 Run without --dry-run to generate schemas\n', 'cyan');
    } else if (results.generated.length > 0) {
      log('\n✅ Schema generation complete - review changes and commit\n', 'green');
    } else {
      log('\n✓ No schemas generated - all pages already have schemas or lack content patterns\n', 'cyan');
    }
    
    process.exit(results.failed.length > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n✗ Schema generation error: ${error.message}`, 'red');
    console.error(error);
    process.exit(2);
  } finally {
    await browser.close();
  }
}

// Run schema generation
generateSchemas();
