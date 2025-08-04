import { NextResponse } from 'next/server';
import { getArticlesWithTags } from '@/app/utils/tags';

export async function GET() {
  try {
    // Get all articles with their tags
    const articles = await getArticlesWithTags();
    
    // Return the articles
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
