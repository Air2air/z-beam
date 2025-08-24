// app/api/badgesymbol/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loadBadgeSymbolData } from '../../../utils/badgeSymbolLoader';

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

    const badgeData = await loadBadgeSymbolData(slug);
    
    if (!badgeData) {
      return NextResponse.json(
        { error: 'Badge symbol data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(badgeData);
  } catch (error) {
    console.error('Error in badgesymbol API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
