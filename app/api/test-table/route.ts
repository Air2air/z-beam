// app/api/test-table/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loadComponent, loadAllComponents } from '../../utils/contentAPI';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug') || 'copper-laser-cleaning';
    
    // Test loading just the table component
    const tableComponent = await loadComponent('table', slug);
    
    // Test loading all components
    const allComponents = await loadAllComponents(slug);
    
    return NextResponse.json({
      slug,
      tableComponent: {
        exists: !!tableComponent,
        contentLength: tableComponent?.content?.length || 0,
        contentPreview: tableComponent?.content?.substring(0, 200),
        config: tableComponent?.config
      },
      allComponents: {
        availableTypes: Object.keys(allComponents),
        tableExists: !!allComponents.table,
        tableContentLength: allComponents.table?.content?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
