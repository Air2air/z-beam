// migrate_content.js
// Script to move MDX files to /content/ and add contentCategory field

const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDirs = [
  path.join(process.cwd(), 'app', '(materials)', 'posts'),
  path.join(process.cwd(), 'content', 'articles') // In case there are any files here
];
const destDir = path.join(process.cwd(), 'content');

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created destination directory: ${destDir}`);
}

// Function to migrate MDX files
function migrateMdxFiles() {
  let totalProcessed = 0;
  let totalMoved = 0;
  let totalModified = 0;
  let errors = 0;

  // Process each source directory
  sourceDirs.forEach(sourceDir => {
    if (!fs.existsSync(sourceDir)) {
      console.log(`Source directory doesn't exist: ${sourceDir}`);
      return;
    }

    // Get all MDX files in the source directory
    const files = fs.readdirSync(sourceDir).filter(file => path.extname(file) === '.mdx');
    console.log(`Found ${files.length} MDX files in ${sourceDir}`);

    files.forEach(file => {
      try {
        totalProcessed++;
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        let content = fs.readFileSync(sourcePath, 'utf8');

        // Check if contentCategory is already in the frontmatter
        if (!content.includes('contentCategory:')) {
          // Add contentCategory field after title
          content = content.replace(
            /(title:.*?["].*?["])/,
            '$1\ncontentCategory: "material"'
          );
          totalModified++;
        }

        // Write to destination
        fs.writeFileSync(destPath, content);
        console.log(`Processed: ${file} -> ${destPath}`);
        
        // Don't delete the source file if it's already in the content directory
        if (!sourcePath.includes(path.join('content', 'articles'))) {
          fs.unlinkSync(sourcePath);
          totalMoved++;
          console.log(`Moved: ${file} (original deleted)`);
        }
      } catch (error) {
        errors++;
        console.error(`Error processing ${file}:`, error);
      }
    });
  });

  return { totalProcessed, totalMoved, totalModified, errors };
}

// Update existing files in the content directory
function updateExistingFiles() {
  const contentDir = path.join(process.cwd(), 'content');
  
  if (!fs.existsSync(contentDir)) {
    console.log(`Content directory doesn't exist: ${contentDir}`);
    return { totalProcessed: 0, totalModified: 0, errors: 0 };
  }
  
  const files = fs.readdirSync(contentDir).filter(file => path.extname(file) === '.mdx');
  console.log(`Found ${files.length} existing MDX files in ${contentDir}`);
  
  let totalProcessed = 0;
  let totalModified = 0;
  let errors = 0;
  
  files.forEach(file => {
    try {
      totalProcessed++;
      const filePath = path.join(contentDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if contentCategory is already in the frontmatter
      if (!content.includes('contentCategory:')) {
        // Add contentCategory field after title
        content = content.replace(
          /(title:.*?["].*?["])/,
          '$1\ncontentCategory: "material"'
        );
        
        // Write back to file
        fs.writeFileSync(filePath, content);
        totalModified++;
        console.log(`Updated: ${file} (added contentCategory)`);
      }
    } catch (error) {
      errors++;
      console.error(`Error updating ${file}:`, error);
    }
  });
  
  return { totalProcessed, totalModified, errors };
}

// Run the migration
console.log('Starting content migration...');
const migrationResults = migrateMdxFiles();
console.log('Updating existing content files...');
const updateResults = updateExistingFiles();

// Print summary
console.log('\n=== Migration Summary ===');
console.log(`Total files processed: ${migrationResults.totalProcessed + updateResults.totalProcessed}`);
console.log(`Files moved to /content/: ${migrationResults.totalMoved}`);
console.log(`Files modified with contentCategory: ${migrationResults.totalModified + updateResults.totalModified}`);
console.log(`Errors encountered: ${migrationResults.errors + updateResults.errors}`);
console.log('=========================\n');

if (migrationResults.errors + updateResults.errors === 0) {
  console.log('Migration completed successfully!');
} else {
  console.log('Migration completed with errors. Please check the logs above.');
}
