// app/api/properties/route.ts
import { NextResponse } from 'next/server';

/**
 * Properties API Endpoint - Not Yet Implemented
 * 
 * Planned Features:
 * - Query material properties by ID
 * - Filter by property type (thermal, mechanical, optical)
 * - Return standardized property data with units
 * 
 * See: https://github.com/z-beam/z-beam/issues/XXX
 */
export async function GET() {
  return NextResponse.json({ 
    message: 'Properties API endpoint - planned for future implementation',
    status: 'not_implemented',
    docs: '/api-docs/properties'
  }, { status: 501 });
}