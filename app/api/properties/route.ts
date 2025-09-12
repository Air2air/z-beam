// app/api/properties/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement properties API endpoint
  return NextResponse.json({ message: 'Properties API endpoint - not implemented yet' }, { status: 501 });
}