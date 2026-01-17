/**
 * Search API Route
 * Provides search functionality across content
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../utils/logger';
import { toCategorySlug } from '../../utils/formatting';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Mock search results for testing
    const mockResults = [
      {
        id: '1',
        title: `Result 1 for ${query}`,
        pageDescription: `This is a search result for query: ${query}`,
        url: `/articles/${toCategorySlug(query)}-1`,
        type: 'article',
        score: 0.95
      },
      {
        id: '2',
        title: `Result 2 for ${query}`,
        pageDescription: `Another search result for query: ${query}`,
        url: `/articles/${toCategorySlug(query)}-2`,
        type: 'page',
        score: 0.87
      }
    ];

    // Filter results based on query relevance
    const results = mockResults.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.pageDescription.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json({ 
      results,
      totalCount: results.length,
      query
    });
  } catch (error) {
    logger.error('Search API error', { error });
    return NextResponse.json(
      { error: 'Search service error' },
      { status: 500 }
    );
  }
}
