// check-hero-images.js
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const frontmatterPath = path.join(__dirname, 'content/components/frontmatter');
const imagesPath = path.join(__dirname, 'public');

// Get all MD files from frontmatter directory
const mdFiles = fs.readdirSync(frontmatterPath)
  .filter(file => file.endsWith('.md'));

console.log(`Found ${mdFiles.length} markdown files in frontmatter directory`);

// Results arrays
const validPaths = [];
const missingImages = [];
const malformedPaths = [];
const noHeroImage = [];
const frontmatterIssues = [];

// Process each file
mdFiles.forEach(file => {
  const filePath = path.join(frontmatterPath, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract frontmatter section - standard format
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  // Try alternative formats if standard format not found
  if (!frontmatterMatch) {
    // Check if this is a special case with HTML comments
    const htmlCommentMatch = content.match(/<!--.*?-->\s*---\n([\s\S]*?)\n---/s);
    
    // Check if this is a case where the opening --- is missing
    const missingOpeningDelimiterMatch = content.match(/^\s*name:/);
    
    if (htmlCommentMatch) {
      // Handle HTML comment prefix case
      try {
        processFrontmatter(htmlCommentMatch[1], file);
      } catch (error) {
        console.error(`Error parsing frontmatter with HTML comment in ${file}:`, error.message);
        frontmatterIssues.push({ file, reason: 'Error parsing frontmatter with HTML comment' });
      }
    } else if (missingOpeningDelimiterMatch) {
      // Handle missing opening delimiter case
      console.log(`Missing opening --- delimiter in ${file}`);
      frontmatterIssues.push({ file, reason: 'Missing opening --- delimiter' });
      
      // Try to extract content anyway - find the first 200 lines or until we find a line that looks like the end of frontmatter
      const lines = content.split('\n', 200);
      let endIndex = lines.findIndex(line => line.startsWith('---->') || line.startsWith('-->'));
      if (endIndex === -1) endIndex = Math.min(lines.length, 70); // If no end marker, use first 70 lines
      
      const frontmatterContent = lines.slice(0, endIndex).join('\n');
      
      try {
        processFrontmatter(frontmatterContent, file);
      } catch (error) {
        console.error(`Error parsing content with missing delimiter in ${file}:`, error.message);
      }
    } else {
      console.log(`No frontmatter found in ${file}`);
      noHeroImage.push({ file, reason: 'No frontmatter section' });
    }
  } else {
    // Process standard frontmatter
    try {
      processFrontmatter(frontmatterMatch[1], file);
    } catch (error) {
      console.error(`Error parsing frontmatter in ${file}:`, error.message);
      frontmatterIssues.push({ file, reason: 'YAML parsing error' });
    }
  }
});

// Function to process frontmatter content
function processFrontmatter(content, file) {
  // Parse YAML
  const frontmatter = yaml.load(content);
  
  // Check for hero image path
  const heroImagePath = frontmatter?.images?.hero?.url;
  
  if (!heroImagePath) {
    noHeroImage.push({ file, reason: 'No hero image URL in frontmatter' });
    return;
  }
  
  // Validate path format (should start with /images/)
  if (!heroImagePath.startsWith('/images/')) {
    malformedPaths.push({ file, path: heroImagePath, reason: 'Path does not start with /images/' });
    return;
  }

  // Check for double dashes which could indicate a naming issue
  if (heroImagePath.includes('--')) {
    malformedPaths.push({ file, path: heroImagePath, reason: 'Path contains double dashes' });
    return;
  }
  
  // Check if file exists
  const imagePath = path.join(imagesPath, heroImagePath);
  const imageExists = fs.existsSync(imagePath);
  
  if (!imageExists) {
    missingImages.push({ file, path: heroImagePath });
    return;
  }
  
  // All checks passed
  validPaths.push({ file, path: heroImagePath });
}

// Print results
console.log('\n=== SUMMARY ===');
console.log(`Total files: ${mdFiles.length}`);
console.log(`Valid hero images: ${validPaths.length}`);
console.log(`Missing images: ${missingImages.length}`);
console.log(`Malformed paths: ${malformedPaths.length}`);
console.log(`No hero image: ${noHeroImage.length}`);
console.log(`Frontmatter issues: ${frontmatterIssues.length}`);

console.log('\n=== VALID HERO IMAGES ===');
validPaths.forEach(item => {
  console.log(`${item.file} -> ${item.path}`);
});

if (missingImages.length > 0) {
  console.log('\n=== MISSING IMAGES ===');
  missingImages.forEach(item => {
    console.log(`${item.file} -> ${item.path}`);
  });
}

if (malformedPaths.length > 0) {
  console.log('\n=== MALFORMED PATHS ===');
  malformedPaths.forEach(item => {
    console.log(`${item.file} -> ${item.path || 'N/A'} (${item.reason})`);
  });
}

if (noHeroImage.length > 0) {
  console.log('\n=== NO HERO IMAGE ===');
  noHeroImage.forEach(item => {
    console.log(`${item.file} (${item.reason})`);
  });
}

if (frontmatterIssues.length > 0) {
  console.log('\n=== FRONTMATTER ISSUES ===');
  frontmatterIssues.forEach(item => {
    console.log(`${item.file} (${item.reason})`);
  });
}
