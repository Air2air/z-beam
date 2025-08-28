import { loadFrontmatterData } from './app/utils/frontmatterLoader.js';

async function testImageProcessing() {
  try {
    console.log('Testing image processing for ceramic-matrix-composites-cmcs-laser-cleaning...');
    
    const result = await loadFrontmatterData('ceramic-matrix-composites-cmcs-laser-cleaning');
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result && result.images) {
      console.log('\nImage URLs:');
      console.log('Hero URL:', result.images.hero?.url);
      console.log('Micro URL:', result.images.micro?.url);
    } else {
      console.log('No images found in result');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testImageProcessing();
