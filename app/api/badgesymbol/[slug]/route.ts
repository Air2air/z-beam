// app/api/badgesymbol/[slug]/route.ts
// Enhanced with GROK-compliant error handling and fail-fast validation
import { NextRequest, NextResponse } from 'next/server';
import { loadBadgeData } from '../../../utils/badgeSystem';
import { validateSlug, ValidationError, SecurityError, GenerationError, isZBeamError, getErrorDetails } from '../../../utils/errorSystem';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Fail-fast validation with specific error types
    const validatedSlug = validateSlug(slug, 'badgesymbol API');

    const badgeData = await loadBadgeData(validatedSlug);
    
    if (!badgeData) {
      return NextResponse.json(
        { 
          error: 'Badge symbol data not found',
          code: 'NOT_FOUND',
          slug: validatedSlug,
          suggestions: [
            'Check if the material slug exists in content/components/badgesymbol/',
            'Verify the slug format matches the filename pattern',
            'Ensure the badge symbol content file has valid YAML frontmatter'
          ]
        },
        { status: 404 }
      );
    }

    return NextResponse.json(badgeData);
  } catch (error) {
    // Enhanced error handling with specific error types
    if (isZBeamError(error)) {
      const errorDetails = getErrorDetails(error);
      
      // Return appropriate status based on error type
      if (error instanceof ValidationError || error instanceof SecurityError) {
        return NextResponse.json(
          {
            error: errorDetails.message,
            code: errorDetails.code,
            category: errorDetails.category,
            suggestions: errorDetails.suggestions
          },
          { status: 400 }
        );
      }
      
      if (error instanceof GenerationError) {
        return NextResponse.json(
          {
            error: errorDetails.message,
            code: errorDetails.code,
            category: errorDetails.category,
            suggestions: errorDetails.suggestions
          },
          { status: 500 }
        );
      }
    }
    
    // Fallback for unexpected errors
    console.error('Unexpected error in badgesymbol API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        suggestions: [
          'Check server logs for detailed error information',
          'Verify content directory structure and permissions',
          'Report this issue if the problem persists'
        ]
      },
      { status: 500 }
    );
  }
}
