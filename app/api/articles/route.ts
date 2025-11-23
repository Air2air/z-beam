import { NextResponse } from 'next/server';
import { loadAllArticles } from '../../utils/contentAPI';
import { logger } from '../../utils/logger';

export async function GET() {
  try {
    // Get all articles
    const articles = await loadAllArticles();
    
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
