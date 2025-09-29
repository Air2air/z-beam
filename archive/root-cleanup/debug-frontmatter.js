// Simple debug script to test frontmatter loading// Simple debug script to test frontmatter loading#!/usr/bin/env node

const { readFileSync, existsSync } = require('fs');

const path = require('path');import { readFileSync, existsSync } from 'fs';

const matter = require('gray-matter');

import path from 'path';const fs = require('fs');

const slug = 'brick-laser-cleaning';

const frontmatterPath = path.join(process.cwd(), 'content', 'components', 'frontmatter', `${slug}.md`);import matter from 'gray-matter';const matter = require('gray-matter');



console.log('🔍 Checking frontmatter for:', slug);

console.log('📁 Looking for file:', frontmatterPath);

console.log('📂 File exists:', existsSync(frontmatterPath));const slug = 'brick-laser-cleaning';// Read actual frontmatter file



if (existsSync(frontmatterPath)) {const frontmatterPath = path.join(process.cwd(), 'content', 'components', 'frontmatter', `${slug}.md`);const content = fs.readFileSync('content/components/frontmatter/alumina-laser-cleaning.md', 'utf8');

  const fileContent = readFileSync(frontmatterPath, 'utf8');

  console.log('📄 File content length:', fileContent.length);const { data } = matter(content);

  

  try {console.log('🔍 Checking frontmatter for:', slug);

    const { data, content } = matter(fileContent);

    console.log('✅ Parsed frontmatter data:');console.log('📁 Looking for file:', frontmatterPath);console.log('=== ACTUAL FRONTMATTER STRUCTURE ===');

    console.log('  - title:', data.title);

    console.log('  - authorInfo:', data.authorInfo);console.log('📂 File exists:', existsSync(frontmatterPath));console.log('Has images.hero.url?', !!data?.images?.hero?.url);

    console.log('  - author_object:', data.author_object);

    console.log('  - All keys:', Object.keys(data));console.log('images.hero.url value:', data?.images?.hero?.url);

  } catch (error) {

    console.error('❌ Error parsing frontmatter:', error);if (existsSync(frontmatterPath)) {console.log('Has flat image field?', !!data?.image);

  }

} else {  const fileContent = readFileSync(frontmatterPath, 'utf8');console.log('flat image value:', data?.image);

  console.log('❌ File not found');

}  console.log('📄 File content length:', fileContent.length);console.log('');

  console.log('Full images object:');

  try {console.log(JSON.stringify(data.images, null, 2));

    const { data, content } = matter(fileContent);

    console.log('✅ Parsed frontmatter data:');console.log('\n=== HERO COMPONENT IMAGE RESOLUTION ===');

    console.log('  - title:', data.title);let imageSource = undefined; // no direct image prop

    console.log('  - authorInfo:', data.authorInfo);

    console.log('  - author_object:', data.author_object);// Current Hero logic

    console.log('  - All keys:', Object.keys(data));if (!imageSource && data?.image) {

  } catch (error) {  imageSource = data.image;

    console.error('❌ Error parsing frontmatter:', error);  console.log('✅ Hero found image in frontmatter.image:', imageSource);

  }} else {

} else {  console.log('❌ Hero did NOT find image in frontmatter.image');

  console.log('❌ File not found');  

}  // Check if structured data exists
  if (data?.images?.hero?.url) {
    console.log('🔍 But structured image data EXISTS at frontmatter.images.hero.url:', data.images.hero.url);
    console.log('💡 SOLUTION: Update Hero component to check frontmatter.images.hero.url');
  }
}
