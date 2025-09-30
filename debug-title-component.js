// Debug script to test Title component data flow
console.log('🔍 Debugging Title Component Data Flow\n');

// Sample metadata like what would come from content API
const mockMetadata = {
  title: 'Float Glass Laser Cleaning',
  description: 'Advanced laser cleaning technique for float glass materials',
  slug: 'float-glass-laser-cleaning',
  authorInfo: {
    id: 1,
    name: 'Yi-Chun Lin',
    title: 'Ph.D.',
    country: 'Taiwan',
    expertise: 'Laser Materials Processing',
    image: '/images/author/yi-chun-lin.jpg'
  }
};

console.log('📋 Mock Metadata:');
console.log('- metadata.title:', mockMetadata.title);
console.log('- metadata.description:', mockMetadata.description);
console.log('- metadata.authorInfo:', !!mockMetadata.authorInfo);
console.log('- metadata.authorInfo.name:', mockMetadata.authorInfo?.name);

console.log('\n🎯 Title Component Logic Test:');
const displayTitle = mockMetadata?.title || 'fallback title' || 'children content';
const displaySubtitle = mockMetadata?.title && mockMetadata?.description ? String(mockMetadata.description) : '';

console.log('- displayTitle:', displayTitle);
console.log('- displaySubtitle:', displaySubtitle);
console.log('- Should render Title?', !!displayTitle);
console.log('- Should render Author?', !!mockMetadata.authorInfo);

console.log('\n✅ Debug Complete - Components should render with this data');