const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Load the frontmatter
const frontmatterPath = path.join(process.cwd(), 'frontmatter', 'materials', 'polycarbonate-laser-cleaning.yaml');
const frontmatterContent = fs.readFileSync(frontmatterPath, 'utf8');
const frontmatterData = yaml.load(frontmatterContent);

console.log('=== FRONTMATTER DATA ===');
console.log('Has images:', !!frontmatterData.images);
console.log('Has images.hero:', !!frontmatterData.images?.hero);
console.log('Has images.hero.url:', !!frontmatterData.images?.hero?.url);
console.log('Hero URL:', frontmatterData.images?.hero?.url);
console.log('');

// Simulate what getArticle returns
const articleData = {
  metadata: frontmatterData,
  components: {}
};

console.log('=== ARTICLE DATA STRUCTURE ===');
console.log('Has metadata:', !!articleData.metadata);
console.log('Has metadata.images:', !!articleData.metadata?.images);
console.log('Has metadata.images.hero:', !!articleData.metadata?.images?.hero);
console.log('Has metadata.images.hero.url:', !!articleData.metadata?.images?.hero?.url);
console.log('');

// Simulate getMetadata function
function getMetadata(data) {
  return (data.metadata || data.frontmatter || data.pageConfig || data);
}

console.log('=== GETMETADATA OUTPUT ===');
const metadata = getMetadata(articleData);
console.log('Has images:', !!metadata.images);
console.log('Has images.hero:', !!metadata.images?.hero);
console.log('Has images.hero.url:', !!metadata.images?.hero?.url);
console.log('Hero URL:', metadata.images?.hero?.url);
console.log('');

// Simulate getMainImage logic
function getMainImage(data) {
  const frontmatter = getMetadata(data);
  
  if (frontmatter.images?.hero?.url) {
    const hero = frontmatter.images.hero;
    return {
      '@type': 'ImageObject',
      'url': `https://www.z-beam.com${hero.url}`,
      'width': hero.width || 1200,
      'height': hero.height || 630,
      'micro': hero.alt
    };
  }
  
  return null;
}

console.log('=== GETMAINIMAGE OUTPUT ===');
const mainImage = getMainImage(articleData);
console.log('Result:', JSON.stringify(mainImage, null, 2));
