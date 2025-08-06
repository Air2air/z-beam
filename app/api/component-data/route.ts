import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');
    
    if (!type || !slug) {
      return NextResponse.json(
        { error: 'Type and slug are required' },
        { status: 400 }
      );
    }
    
    // Load component content
    const componentPath = path.join(
      process.cwd(),
      'content',
      'components',
      type,
      `${slug}.md`
    );
    
    if (!fs.existsSync(componentPath)) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }
    
    const fileContent = fs.readFileSync(componentPath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Load frontmatter if it's a frontmatter request
    let frontmatterData = {};
    if (type === 'frontmatter') {
      frontmatterData = data;
    } else {
      // If it's not a frontmatter request, check if there's associated frontmatter
      const frontmatterPath = path.join(
        process.cwd(),
        'content',
        'components',
        'frontmatter',
        `${slug}.md`
      );
      
      if (fs.existsSync(frontmatterPath)) {
        const frontmatterContent = fs.readFileSync(frontmatterPath, 'utf8');
        const { data: fmData } = matter(frontmatterContent);
        frontmatterData = fmData;
      }
    }
    
    return NextResponse.json({
      content,
      config: data,
      frontmatter: frontmatterData
    });
    
  } catch (error) {
    console.error('Error loading component data:', error);
    return NextResponse.json(
      { error: 'Error loading component data' },
      { status: 500 }
    );
  }
}
