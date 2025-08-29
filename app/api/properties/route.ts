// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllPropertyNames, 
  getValuesForProperty, 
  searchByPropertyValue,
  getPopularPropertyValues,
  searchByAnyProperty
} from '../../utils/propertySearch';

// Mark this route as dynamic to allow request-specific data
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const property = searchParams.get('property');
    const value = searchParams.get('value');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');

    switch (action) {
      case 'getAllPropertyNames':
        const propertyNames = await getAllPropertyNames();
        return NextResponse.json({ propertyNames });

      case 'getValuesForProperty':
        if (!property) {
          return NextResponse.json(
            { error: 'Property parameter is required' },
            { status: 400 }
          );
        }
        const values = await getValuesForProperty(property);
        return NextResponse.json({ values });

      case 'searchByPropertyValue':
        if (!property || !value) {
          return NextResponse.json(
            { error: 'Property and value parameters are required' },
            { status: 400 }
          );
        }
        const articles = await searchByPropertyValue(property, value);
        return NextResponse.json({ articles });

      case 'getPopularPropertyValues':
        const popularValues = await getPopularPropertyValues(limit);
        return NextResponse.json({ popularValues });

      case 'searchByAnyProperty':
        if (!search) {
          return NextResponse.json(
            { error: 'Search parameter is required' },
            { status: 400 }
          );
        }
        const searchResults = await searchByAnyProperty(search);
        return NextResponse.json({ articles: searchResults });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: getAllPropertyNames, getValuesForProperty, searchByPropertyValue, getPopularPropertyValues, searchByAnyProperty' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in properties API:', error);
    return NextResponse.json(
      { error: 'Error processing property search request' },
      { status: 500 }
    );
  }
}
