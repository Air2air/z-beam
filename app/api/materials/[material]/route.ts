import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

export async function GET(
  request: NextRequest,
  context: { params: { material: string } }
) {
  const { params } = context;
  const materialName = params.material;
  
  try {
    // Define the base directory for material content
    const contentDir = path.join(process.cwd(), 'content', 'components', 'frontmatter');
    
    // List all files in the directory
    const allFiles = fs.readdirSync(contentDir);
    console.log(`API: All files in frontmatter directory:`, allFiles);
  
    // Clean the material name for search
    const cleanMaterialName = materialName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Try to find a matching material file (more flexible matching)
    let matchingFiles = allFiles.filter(file => 
      file.toLowerCase().includes(cleanMaterialName.toLowerCase())
    );

    console.log(`API: Searching for material ${materialName} (cleaned: ${cleanMaterialName})`);
    console.log(`API: Found ${matchingFiles.length} potential matches: ${matchingFiles.join(', ')}`);

    if (matchingFiles.length === 0) {
      return NextResponse.json(
        { error: `Material not found: ${materialName}` },
        { status: 404 }
      );
    }

    // Use the first matching file (most exact match)
    const filePath = path.join(contentDir, matchingFiles[0]);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter
    const { data: frontmatter } = matter(fileContents);

    return NextResponse.json(frontmatter);
  } catch (error) {
    console.error('Error loading material frontmatter:', error);
    return NextResponse.json(
      { error: 'Failed to load material data' },
      { status: 500 }
    );
  }
}
