// test-thumbnail-fixes.js
console.log('Testing Thumbnail fallbacks for problematic materials...\n');

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
  
  // 3. Material-specific fallbacks based on subject or alt text
  const subjectText = frontmatter?.subject || alt || '';
  const lowerSubject = subjectText.toLowerCase();
  
  console.log("Checking for material-specific fallback based on:", lowerSubject);
  
  // Specific material checks for the problem cases
  if (lowerSubject.includes('hafnium')) {
    console.log("Using hafnium fallback");
    return "/images/hafnium-laser-cleaning-hero.jpg";
  }
  
  if (lowerSubject.includes('silicon carbide')) {
    console.log("Using silicon carbide fallback");
    return "/images/ceramic-laser-cleaning-hero.jpg";
  }
  
  if (lowerSubject.includes('zirconia')) {
    console.log("Using zirconium fallback");
    return "/images/zirconium-laser-cleaning-hero.jpg";
  }
  
  // Category-based fallbacks
  if (frontmatter?.category) {
    const category = frontmatter.category.toLowerCase();
    console.log("Trying category fallback for:", category);
    
    if (category === 'ceramic') {
      return "/images/ceramic-laser-cleaning-hero.jpg";
    }
    
    if (category === 'metal') {
      return "/images/stainless-steel-laser-cleaning-hero.jpg";
    }
  }
  
  // Default fallback
  console.log("Using default fallback");
  return "/images/Site/Logo/logo_.png";
}

// Test cases
const testCases = [
  { 
    name: "Hafnium with no src (fixed)",
    alt: "Hafnium",
    src: undefined,
    frontmatter: { category: 'metal', articleType: 'material' }
  },
  { 
    name: "Silicon Carbide with no src (fixed)",
    alt: "Silicon Carbide",
    src: undefined,
    frontmatter: { category: 'ceramic', articleType: 'material' }
  },
  { 
    name: "Zirconia with failed frontmatter (fixed)",
    alt: "Zirconia",
    src: undefined,
    frontmatter: { 
      category: 'ceramic', 
      articleType: 'material',
      status: 'failed'
    }
  },
  { 
    name: "Material with src (should use src)",
    alt: "Test Material",
    src: "/images/test-image.jpg",
    frontmatter: { category: 'ceramic' }
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
