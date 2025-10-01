// Debug script to understand caption data flow
const fs = require('fs');
const path = require('path');

// Check if there are any content files with caption data
function searchForCaptionData() {
  const contentDir = path.join(__dirname, 'content');
  const files = [];
  
  function walkDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      });
    } catch (err) {
      console.log(`Could not read directory: ${dir}`);
    }
  }
  
  if (fs.existsSync(contentDir)) {
    walkDir(contentDir);
  }
  
  console.log(`Found ${files.length} markdown files`);
  
  // Check for frontmatter with caption data
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('caption:')) {
        console.log(`Found caption data in: ${file}`);
        // Extract frontmatter
        const frontmatterMatch = content.match(/^---([\s\S]*?)---/);
        if (frontmatterMatch) {
          console.log('Frontmatter:', frontmatterMatch[1]);
        }
      }
    } catch (err) {
      console.log(`Could not read file: ${file}`);
    }
  });
}

searchForCaptionData();