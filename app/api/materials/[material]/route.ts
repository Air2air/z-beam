import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { safeMatterParse } from '../../../utils/yamlSanitizer';
import { logger } from '../../../utils/logger';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ material: string }> }
) {
  const params = await context.params;
  const materialName = params.material;
  
  try {
    // Define the base directory for material content
    const contentDir = path.join(process.cwd(), 'content', 'components', 'frontmatter');
    
    // List all files in the directory
    const allFiles = fs.readdirSync(contentDir);
  
    // Clean the material name for search
    const cleanMaterialName = materialName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Try to find a matching material file (more flexible matching)
    const matchingFiles = allFiles.filter(file => 
      file.toLowerCase().includes(cleanMaterialName.toLowerCase())
    );

    if (matchingFiles.length === 0) {
      return NextResponse.json(
        { error: `Material not found: ${materialName}` },
        { status: 404 }
      );
    }

    // Use the first matching file (most exact match)
    const filePath = path.join(contentDir, matchingFiles[0]);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter using safe parser
    const { data: frontmatter } = safeMatterParse(fileContents);

    return NextResponse.json(frontmatter);
  } catch (error) {
    logger.error('Error loading material frontmatter', { error, material: materialName });
    return NextResponse.json(
      { error: 'Failed to load material data' },
      { status: 500 }
    );
  }
}
