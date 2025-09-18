/**
 * Content API Route
 * Provides unified access to content by slug
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Mock content response for testing
    const mockContent = {
      slug,
      title: `Content for ${slug}`,
      type: 'page',
      content: `Mock content for ${slug}`,
      metadata: {
        lastModified: new Date().toISOString(),
        author: 'System',
        tags: [slug, 'content'],
        description: `Description for ${slug}`
      }
    };

    return NextResponse.json(mockContent);
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
