import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Mark this route as dynamic to allow request-specific data
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');
    
    if (!type || !slug) {
      return NextResponse.json(
        { error: 'Type and slug are required' },
        { status: 400 }
      );
    }
    
    // Load component content - check for YAML first, then markdown
    let componentPath = path.join(
      process.cwd(),
      'content',
      'components',
      type,
      `${slug}.yaml`
    );
    
    const isYamlFile = fs.existsSync(componentPath);
    
    if (!isYamlFile) {
      componentPath = path.join(
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
    }
    
    const fileContent = fs.readFileSync(componentPath, 'utf8');
    
    let data: any = {};
    let content: string = '';
    
    if (isYamlFile) {
      // For YAML files, parse the entire content as data
      const yaml = require('yaml');
      // Use parseAllDocuments to handle multiple documents separated by ---
      const documents = yaml.parseAllDocuments(fileContent);
      // Get the first document which contains the actual data
      data = documents[0]?.toJS();
      content = data; // For YAML components, the data is the content
    } else {
      // For markdown files, use gray-matter
      const parsed = matter(fileContent);
      data = parsed.data;
      content = parsed.content;
    }
    
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
