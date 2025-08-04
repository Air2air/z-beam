import { NextResponse } from 'next/server';
import { debugTagSystem } from '@/app/utils/tagDebug';

export async function GET() {
  try {
    // Run the tag system debug
    await debugTagSystem();
    
    // Return success
    return NextResponse.json({ success: true, message: 'Tag system debug completed. Check server logs for details.' });
  } catch (error) {
    console.error('Error debugging tag system:', error);
    return NextResponse.json(
      { error: 'Failed to debug tag system', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
