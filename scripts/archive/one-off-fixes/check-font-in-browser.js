/**
 * Script to verify Roboto font is loaded in the browser
 * 
 * To use: Open browser dev console and paste this code
 */

// Check if Roboto is loaded
const checkFontLoaded = async () => {
  console.log('🔍 Checking for Roboto font...\n');
  
  // Method 1: Check computed font family
  const body = document.body;
  const computedFont = window.getComputedStyle(body).fontFamily;
  console.log('✓ Body font-family:', computedFont);
  
  // Method 2: Check if font is available
  try {
    const fontCheck = await document.fonts.ready;
    console.log('✓ All fonts loaded:', document.fonts.size, 'fonts');
    
    // List all loaded fonts
    const loadedFonts = [];
    document.fonts.forEach(font => {
      loadedFonts.push(`${font.family} ${font.weight} ${font.style}`);
    });
    console.log('✓ Loaded fonts:', loadedFonts);
    
    // Check specifically for Roboto
    const hasRoboto = loadedFonts.some(font => font.includes('Roboto'));
    if (hasRoboto) {
      console.log('✅ Roboto is loaded!');
    } else {
      console.log('❌ Roboto is NOT loaded');
    }
  } catch (error) {
    console.error('Error checking fonts:', error);
  }
  
  // Method 3: Check className on body
  const bodyClasses = body.className;
  console.log('✓ Body classes:', bodyClasses);
  
  // Method 4: Visual test
  console.log('\n📝 Visual Test:');
  console.log('If you see "Roboto" in the font-family above, it\'s working!');
  console.log('Compare this text to a site using system fonts to see the difference.');
};

// Run the check
checkFontLoaded();

// Also export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkFontLoaded };
}
