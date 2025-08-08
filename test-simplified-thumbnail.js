// test-simplified-thumbnail.js
console.log('Testing Thumbnail component with frontmatter only...\n');

// Mock the Thumbnail component's getImageUrl function
function getImageUrl(frontmatter) {
  console.log('Frontmatter:', JSON.stringify(frontmatter, null, 2));
  
  // 1. Frontmatter hero image (highest priority)
  if (frontmatter?.images?.hero?.url) {
    console.log("Using frontmatter.images.hero.url:", frontmatter.images.hero.url);
    return frontmatter.images.hero.url;
  }
  
  // 2. Default fallback
  console.log("Using default fallback");
  return "/images/Site/Logo/logo_.png";
}

// Test cases
const testCases = [
  { 
    name: "With frontmatter.images.hero.url",
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
    name: "Default fallback (no images in frontmatter)",
    frontmatter: { 
      category: 'metal',
      articleType: 'material'
    }
  }
];

// Run tests
testCases.forEach((test, index) => {
  console.log(`\nTEST CASE ${index + 1}: ${test.name}`);
  const result = getImageUrl(test.frontmatter);
  console.log("RESULT:", result);
  console.log("--------------------------------------------------");
});

console.log("\nAll tests completed!");
