// app/api/articles/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '../../../utils/contentAPI';
import { logger } from '../../../utils/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Fetch the article data using the same function that List component uses
    const article = await getArticleBySlug(slug);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Return the article data
    return NextResponse.json(article);
    
  } catch (error) {
    logger.error('Error fetching article', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
