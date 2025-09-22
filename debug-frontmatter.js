#!/usr/bin/env node

const fs = require('fs');
const matter = require('gray-matter');

// Read actual frontmatter file
const content = fs.readFileSync('content/components/frontmatter/alumina-laser-cleaning.md', 'utf8');
const { data } = matter(content);

console.log('=== ACTUAL FRONTMATTER STRUCTURE ===');
console.log('Has images.hero.url?', !!data?.images?.hero?.url);
console.log('images.hero.url value:', data?.images?.hero?.url);
console.log('Has flat image field?', !!data?.image);
console.log('flat image value:', data?.image);
console.log('');
console.log('Full images object:');
console.log(JSON.stringify(data.images, null, 2));

console.log('\n=== HERO COMPONENT IMAGE RESOLUTION ===');
let imageSource = undefined; // no direct image prop

// Current Hero logic
if (!imageSource && data?.image) {
  imageSource = data.image;
  console.log('✅ Hero found image in frontmatter.image:', imageSource);
} else {
  console.log('❌ Hero did NOT find image in frontmatter.image');
  
  // Check if structured data exists
  if (data?.images?.hero?.url) {
    console.log('🔍 But structured image data EXISTS at frontmatter.images.hero.url:', data.images.hero.url);
    console.log('💡 SOLUTION: Update Hero component to check frontmatter.images.hero.url');
  }
}
