#!/usr/bin/env node

console.log('=== HERO IMAGE DEBUGGING ===');

// Test metadata structure (what gets passed to Hero component)
const testMetadata = {
  images: {
    hero: {
      url: '/images/alumina-laser-cleaning-hero.jpg',
      alt: 'Alumina surface undergoing laser cleaning'
    }
  },
  image: '/images/alumina-laser-cleaning-hero.jpg' // This might not exist
};

console.log('Test metadata structure:');
console.log(JSON.stringify(testMetadata, null, 2));

// Simulate Hero component image resolution logic
let imageSource = undefined; // no direct image prop

console.log('\n=== HERO COMPONENT LOGIC ===');
console.log('1. Looking for direct image prop:', imageSource);

// Hero component currently looks for frontmatter?.image (flat structure)
if (!imageSource && testMetadata?.image) {
  imageSource = testMetadata.image;
  console.log('2. Found image in frontmatter.image:', imageSource);
} else {
  console.log('2. No image found in frontmatter.image');
}

console.log('\n=== THUMBNAIL COMPONENT LOGIC ===');
// Thumbnail logic: frontmatter?.images?.hero?.url (structured)
const thumbnailImageSource = testMetadata?.images?.hero?.url;
console.log('Thumbnail finds image in frontmatter.images.hero.url:', thumbnailImageSource);

console.log('\n=== DIAGNOSIS ===');
console.log('Hero component result:', imageSource || 'NO IMAGE FOUND');
console.log('Thumbnail component result:', thumbnailImageSource || 'NO IMAGE FOUND');

if (thumbnailImageSource && !imageSource) {
  console.log('❌ ISSUE CONFIRMED: Hero component cannot find structured image data!');
  console.log('✅ FIX: Update Hero component to check frontmatter.images.hero.url');
} else {
  console.log('✅ Both components should find the image');
}
