import { NextResponse } from 'next/server';
import { getAllTags } from '../../utils/tags';
import { logger } from '../../utils/logger';

export async function GET() {
  try {
    // Force tag cache invalidation
    // Uncomment the next line if you want to force refresh on each request
    // await invalidateTagCache();
    
    // Get all tags
    const tags = await getAllTags();
    
    // Return the tags
    return NextResponse.json({ tags });
  } catch (error) {
    logger.error('Error fetching tags', { error });
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
