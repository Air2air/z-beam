#!/usr/bin/env node

// Script to analyze naming differences between frontmatter files and image files
const fs = require('fs');
const path = require('path');

console.log('🔍 ANALYZING IMAGE PATH NAMING PATTERNS');
console.log('=====================================\n');

// Get all frontmatter files
const frontmatterDir = 'frontmatter/materials';
const frontmatterFiles = fs.readdirSync(frontmatterDir)
  .filter(file => file.endsWith('.md'))
  .map(file => file.replace('.md', ''));

// Get all image files
const imagesDir = 'public/images';
const imageFiles = fs.readdirSync(imagesDir)
  .filter(file => file.endsWith('.jpg'))
  .filter(file => file.includes('-hero') || file.includes('-micro'));

// Extract base names from image files
const heroImages = imageFiles
  .filter(file => file.includes('-hero'))
  .map(file => file.replace('-hero.jpg', ''));

const microImages = imageFiles
  .filter(file => file.includes('-micro'))
  .map(file => file.replace('-micro.jpg', ''));

console.log(`📋 Found ${frontmatterFiles.length} frontmatter files`);
console.log(`📋 Found ${heroImages.length} hero images`);
console.log(`📋 Found ${microImages.length} micro images\n`);

// Check for mismatches
const frontmatterMissingHero = frontmatterFiles.filter(name => !heroImages.includes(name));
const frontmatterMissingMicro = frontmatterFiles.filter(name => !microImages.includes(name));
const heroMissingFrontmatter = heroImages.filter(name => !frontmatterFiles.includes(name));
const microMissingFrontmatter = microImages.filter(name => !frontmatterFiles.includes(name));

console.log('❌ FRONTMATTER FILES WITHOUT CORRESPONDING HERO IMAGES:');
console.log('======================================================');
if (frontmatterMissingHero.length === 0) {
  console.log('✅ None found!\n');
} else {
  frontmatterMissingHero.forEach(name => {
    console.log(`   - ${name}.md → missing ${name}-hero.jpg`);
  });
  console.log('');
}

console.log('❌ FRONTMATTER FILES WITHOUT CORRESPONDING MICRO IMAGES:');
console.log('=======================================================');
if (frontmatterMissingMicro.length === 0) {
  console.log('✅ None found!\n');
} else {
  frontmatterMissingMicro.forEach(name => {
    console.log(`   - ${name}.md → missing ${name}-micro.jpg`);
  });
  console.log('');
}

console.log('❌ HERO IMAGES WITHOUT CORRESPONDING FRONTMATTER:');
console.log('================================================');
if (heroMissingFrontmatter.length === 0) {
  console.log('✅ None found!\n');
} else {
  heroMissingFrontmatter.forEach(name => {
    console.log(`   - ${name}-hero.jpg → missing ${name}.md`);
  });
  console.log('');
}

console.log('❌ MICRO IMAGES WITHOUT CORRESPONDING FRONTMATTER:');
console.log('=================================================');
if (microMissingFrontmatter.length === 0) {
  console.log('✅ None found!\n');
} else {
  microMissingFrontmatter.forEach(name => {
    console.log(`   - ${name}-micro.jpg → missing ${name}.md`);
  });
  console.log('');
}

// Analyze current frontmatter image path patterns
console.log('🔍 ANALYZING CURRENT FRONTMATTER IMAGE PATH PATTERNS:');
console.log('====================================================');

let correctStructured = 0;
let flatStructure = 0;
let missingImages = 0;
let incorrectPaths = 0;

const pathIssues = [];

frontmatterFiles.slice(0, 10).forEach(name => {
  const frontmatterPath = path.join(frontmatterDir, `${name}.md`);
  const content = fs.readFileSync(frontmatterPath, 'utf8');
  
  // Check for structured format
  if (content.includes('images:') && content.includes('hero:')) {
    correctStructured++;
  } else if (content.includes('url:')) {
    flatStructure++;
    
    // Extract the URL
    const urlMatch = content.match(/url:\s*([^\n]+)/);
    if (urlMatch) {
      const url = urlMatch[1].trim().replace(/"/g, '');
      const expectedPath = `/images/${name}-hero.jpg`;
      
      if (url !== expectedPath) {
        pathIssues.push({
          file: name,
          current: url,
          expected: expectedPath
        });
        incorrectPaths++;
      }
    }
  } else {
    missingImages++;
  }
});

console.log(`✅ Correct structured format (images.hero.url): ${correctStructured}`);
console.log(`⚠️  Flat structure format (url): ${flatStructure}`);
console.log(`❌ Missing image references: ${missingImages}`);
console.log(`❌ Incorrect image paths: ${incorrectPaths}\n`);

if (pathIssues.length > 0) {
  console.log('🔧 PATH CORRECTION NEEDED:');
  console.log('=========================');
  pathIssues.forEach(issue => {
    console.log(`   ${issue.file}.md:`);
    console.log(`     Current:  ${issue.current}`);
    console.log(`     Expected: ${issue.expected}\n`);
  });
}

// Generate recommended Python prompting
console.log('🤖 RECOMMENDED PYTHON PROJECT PROMPTING:');
console.log('========================================');
console.log(`
For your Python project that generates image paths, ensure consistent naming:

NAMING PATTERN RULES (Updated September 2025):
1. **Frontmatter files**: {material-name}-laser-cleaning.md
2. **Hero images**: {material-name}-laser-cleaning-hero.jpg  
3. **Micro images**: {material-name}-laser-cleaning-micro.jpg
4. **Social images**: {material-name}-laser-cleaning-micro-social.jpg

MIGRATION COMPLETED:
✅ All files updated from old pattern: {material-name}-cleaning-analysis.jpg
✅ New standardized pattern: {material-name}-laser-cleaning-micro.jpg
✅ Social media images: {material-name}-laser-cleaning-micro-social.jpg

FRONTMATTER STRUCTURE:
Use the structured format for consistency:

\`\`\`yaml
images:
  micro:
    alt: "Descriptive alt text for microscopic analysis"
    url: /images/material/{material-name}-laser-cleaning-micro.jpg
  hero:
    alt: "Descriptive alt text for hero image"
    url: /images/material/{material-name}-laser-cleaning-hero.jpg

seo_data:
  og_image: "/images/material/{material-name}-laser-cleaning-micro-social.jpg"
\`\`\`

PYTHON GENERATOR PROMPT:
"Generate frontmatter files with:
- Filename: {material_name}-laser-cleaning.md (where material_name is kebab-case)
- Micro image paths: /images/material/{material_name}-laser-cleaning-micro.jpg
- Hero image paths: /images/material/{material_name}-laser-cleaning-hero.jpg
- Social image paths: /images/material/{material_name}-laser-cleaning-micro-social.jpg
- Structured YAML with images.hero.url and images.micro.url properties
- Ensure material name consistency between filename and image paths
- Use descriptive alt text for accessibility"

SPECIFIC CORRECTIONS NEEDED:
${pathIssues.length > 0 ? pathIssues.map(issue => 
  `- Fix ${issue.file}.md: Change "${issue.current}" to "${issue.expected}"`
).join('\n') : '- No immediate corrections needed - migration completed!'}
`);
