// test-thumbnail-fallbacks.js
console.log('Testing simplified Thumbnail component fallbacks...\n');

// Mock the Thumbnail component's getImageUrl function
function getImageUrl(alt, src, frontmatter) {
  console.log(`Testing with: alt=${alt}, src=${src || 'undefined'}`);
  console.log('Frontmatter:', JSON.stringify(frontmatter, null, 2));
  
  // 1. Direct source URL (highest priority)
  if (src) {
    console.log("Using src:", src);
    return src;
  }
  
  // 2. Frontmatter hero image
  if (frontmatter?.images?.hero?.url) {
    console.log("Using frontmatter.images.hero.url:", frontmatter.images.hero.url);
    return frontmatter.images.hero.url;
  }
  
  // 3. Category-based fallbacks
  if (frontmatter?.category) {
    const category = frontmatter.category.toLowerCase();
    console.log("Trying category fallback for:", category);
    
    if (category === 'glass') {
      return "/images/soda-lime-glass-laser-cleaning-hero.jpg";
    }
    
    if (category === 'ceramic') {
      return "/images/ceramic-laser-cleaning-hero.jpg";
    }
    
    if (category === 'metal') {
      return "/images/stainless-steel-laser-cleaning-hero.jpg";
    }
  }
  
  // 4. Default fallback
  console.log("Using default fallback");
  return "/images/Site/Logo/logo_.png";
}

// Test cases
const testCases = [
  { 
    name: "Material with category",
    alt: "Test Metal",
    src: undefined,
    frontmatter: { category: 'metal', articleType: 'material' }
  },
  { 
    name: "Material with src",
    alt: "Direct Image",
    src: "/images/test-image.jpg",
    frontmatter: { category: 'ceramic' }
  },
  { 
    name: "Material with frontmatter images",
    alt: "Test Image",
    src: undefined,
    frontmatter: { 
      category: 'ceramic',
      images: {
        hero: {
          url: "/images/hero-image.jpg"
        }
      }
    }
  },
  { 
    name: "Default fallback (no category)",
    alt: "Default Test",
    src: undefined,
    frontmatter: { articleType: 'test' }
  }
];

// Run tests
testCases.forEach((test, index) => {
  console.log(`\nTEST CASE ${index + 1}: ${test.name}`);
  const result = getImageUrl(test.alt, test.src, test.frontmatter);
  console.log("RESULT:", result);
  console.log("--------------------------------------------------");
});

console.log("\nAll tests completed!");
