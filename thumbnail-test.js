// thumbnail-test.js
console.log('Starting thumbnail test...');

// Function to simulate the Thumbnail component's getImageUrl logic
function getImageUrl(src, alt, frontmatter) {
  console.log('Testing with:', { src, alt, frontmatter });
  
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
  
  console.log("Checking for material-specific fallback based on subject/alt:", lowerSubject);
  
  // Glass materials
  if (lowerSubject.includes('borosilicate')) {
    console.log("Using borosilicate fallback");
    return "/images/borosilicate-glass-laser-cleaning-hero.jpg";
  }
  
  // Ceramics
  if (lowerSubject.includes('zirconia')) {
    console.log("Using zirconium fallback");
    return "/images/zirconium-laser-cleaning-hero.jpg";
  }
  
  // Composites
  if (lowerSubject.includes('urethane') || lowerSubject.includes('polyurethane')) {
    console.log("Using phenolic resin composites fallback for urethane");
    return "/images/phenolic-resin-composites-laser-cleaning-hero.jpg";
  }
  
  // Category-based fallbacks as a second layer
  if (frontmatter?.category) {
    const category = frontmatter.category.toLowerCase();
    console.log("Trying category fallback for:", category);
    
    if (category === 'ceramic') {
      return "/images/ceramic-laser-cleaning-hero.jpg";
    }
    
    if (category === 'composite') {
      return "/images/carbon-fiber-reinforced-polymer-laser-cleaning-hero.jpg";
    }
  }
  
  // Default fallback
  console.log("Using default fallback");
  return "/images/Site/Logo/logo_.png";
}

// Test cases
console.log('\nTEST CASE 1: Zirconia with failed frontmatter');
const zirconiaResult = getImageUrl(
  null, 
  'Zirconia',
  { 
    subject: 'Zirconia',
    category: 'ceramic',
    articleType: 'material',
    status: 'failed'
  }
);
console.log('Result:', zirconiaResult);

console.log('\nTEST CASE 2: Urethane with failed frontmatter');
const urethaneResult = getImageUrl(
  null,
  'Urethane Composites',
  {
    subject: 'Urethane Composites',
    category: 'composite',
    articleType: 'material'
  }
);
console.log('Result:', urethaneResult);

console.log('\nTEST CASE 3: With direct src');
const srcResult = getImageUrl(
  '/images/zirconium-laser-cleaning-hero.jpg',
  'Anything',
  null
);
console.log('Result:', srcResult);

console.log('\nTEST CASE 4: With only category');
const categoryResult = getImageUrl(
  null,
  'Unknown Material',
  { category: 'ceramic' }
);
console.log('Result:', categoryResult);

console.log('\nAll tests completed!');
