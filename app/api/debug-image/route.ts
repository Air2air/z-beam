// app/api/debug-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const imagePath = url.searchParams.get('path');
  
  if (!imagePath) {
    return NextResponse.json({ error: 'No image path provided' }, { status: 400 });
  }
  
  // Try to find the image in the public directory
  const fullPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
  const publicDir = path.join(process.cwd(), 'public');
  
  try {
    const exists = fs.existsSync(fullPath);
    const stats = exists ? fs.statSync(fullPath) : null;
    
    // List similar files
    let similarFiles: string[] = [];
    try {
      // Get base name without extension
      const baseName = path.basename(imagePath, path.extname(imagePath));
      const pattern = baseName.split('-')[0]; // Get first part of filename
      
      // Find similar files
      const findCommand = `find ${publicDir}/images -type f -name "*${pattern}*" | sort`;
      const findResult = execSync(findCommand).toString().trim().split('\n');
      
      similarFiles = findResult.map(file => file.replace(publicDir, ''));
    } catch (err) {
      similarFiles = [`Error finding similar files: ${err.message}`];
    }
    
    return NextResponse.json({
      path: imagePath,
      fullPath,
      exists,
      fileSize: stats ? stats.size : null,
      isFile: stats ? stats.isFile() : null,
      similarFiles
    });
  } catch (error) {
    return NextResponse.json({ 
      error: `Error checking image: ${error.message}`,
      path: imagePath,
      fullPath
    }, { status: 500 });
  }
}
