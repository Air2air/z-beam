import { NextResponse } from 'next/server';
import { getArticlesWithTags } from '../../utils/tags';
import { logger } from '../../utils/logger';

export async function GET() {
  try {
    // Get all articles with their tags
    const articles = await getArticlesWithTags();
    
    // Return the articles
    return NextResponse.json({ articles });
  } catch (error) {
    logger.error('Error fetching articles', { error });
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
