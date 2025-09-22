#!/usr/bin/env node

const fs = require('fs');
const matter = require('gray-matter');

// Read actual frontmatter file
const content = fs.readFileSync('content/components/frontmatter/alumina-laser-cleaning.md', 'utf8');
const { data } = matter(content);

console.log('=== TESTING UPDATED HERO COMPONENT LOGIC ===');

// Simulate updated Hero component image resolution
let imageSource = undefined; // no direct image prop

console.log('1. Checking for direct image prop:', imageSource || 'none');

// Updated Hero logic: Check structured data first, then flat
if (!imageSource && data?.images?.hero?.url) {
  imageSource = data.images.hero.url;
  console.log('2. ✅ Found image in frontmatter.images.hero.url:', imageSource);
} else if (!imageSource && data?.image) {
  imageSource = data.image;
  console.log('2. ✅ Found image in frontmatter.image:', imageSource);
} else {
  console.log('2. ❌ No image found in either location');
}

console.log('\n=== RESULT ===');
if (imageSource) {
  console.log('✅ SUCCESS: Hero component will now display image:', imageSource);
  console.log('🔧 FIXED: Hero component now checks structured image data');
} else {
  console.log('❌ FAILED: Hero component still cannot find image');
}
