// app/api/debug/route.ts
import { NextResponse } from 'next/server';
import { debugTagSystem } from '../../utils/tagDebug';

// This API serves debugging data for various system components
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || 'all';
    
    // Prepare debug data based on the requested category
    const debugData: Record<string, unknown> = {};
    
    // Always include basic system info
    debugData.system = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      nextVersion: process.env.NEXT_PUBLIC_VERSION || 'unknown',
    };
    
    // Add category-specific data
    switch (category) {
      case 'tags':
        debugData.tags = await debugTagSystem();
        break;
        
      case 'thumbnails':
        debugData.thumbnails = [
          { slug: 'test-1', url: '/images/test-1.jpg', alt: 'Test image 1' },
          { slug: 'test-2', url: '/images/test-2.jpg', alt: 'Test image 2' },
        ];
        break;
        
      case 'images':
        debugData.images = [
          { id: 1, src: '/images/sample-1.jpg', width: 800, height: 600 },
          { id: 2, src: '/images/sample-2.jpg', width: 1200, height: 800 },
        ];
        break;
        
      case 'materials':
        debugData.materials = [
          { name: 'Steel', fallback: 'metal-generic', status: 'active' },
          { name: 'Aluminum', fallback: 'light-metal', status: 'active' },
        ];
        break;
        
      case 'cards':
        debugData.cards = [
          { title: 'Card 1', type: 'material', status: 'rendered' },
          { title: 'Card 2', type: 'service', status: 'rendered' },
        ];
        break;
        
      case 'frontmatter':
        debugData.frontmatter = [
          { slug: 'home', title: 'Home Page', author: 'System' },
          { slug: 'about', title: 'About Page', author: 'Content Team' },
        ];
        break;
        
      case 'all':
        // Include sample data from all categories for overview
        debugData.tags = await debugTagSystem();
        debugData.thumbnails = [{ slug: 'test-1', url: '/images/test-1.jpg', alt: 'Test image 1' }];
        debugData.images = [{ id: 1, src: '/images/sample-1.jpg', width: 800, height: 600 }];
        debugData.materials = [{ name: 'Steel', fallback: 'metal-generic', status: 'active' }];
        debugData.cards = [{ title: 'Card 1', type: 'material', status: 'rendered' }];
        debugData.frontmatter = [{ slug: 'home', title: 'Home Page', author: 'System' }];
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid debug category' }, { status: 400 });
    }
    
    return NextResponse.json(debugData);
  } catch (error) {
    console.error('Debug API error', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
