// app/api/markdown/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

// Mark this route as dynamic to allow request-specific data
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');
    const convertMarkdown = searchParams.get('convertMarkdown') === 'true';
    
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
    
    // Process content if needed
    let processedContent: string = content;
    if (convertMarkdown) {
      const markedContent = marked(content);
      // Handle both Promise and string return types from marked
      processedContent = markedContent instanceof Promise 
        ? await markedContent 
        : markedContent;
    }
    
    return NextResponse.json({
      content: processedContent,
      config: data
    });
    
  } catch (error) {
    console.error('Error loading component data:', error);
    return NextResponse.json(
      { error: 'Error loading component data' },
      { status: 500 }
    );
  }
}
