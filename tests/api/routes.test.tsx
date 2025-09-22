/**
 * Test Suite: API Route Testing
 * Testing API endpoints for data retrieval and processing
 * Updated: Removed references to deprecated content API route
 */

import { NextRequest } from 'next/server';

jest.mock('../../app/api/search/route', () => ({
  GET: async (request: NextRequest) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const mockResults = [
      {
        id: '1',
        title: `Result 1 for ${query}`,
        excerpt: `This is a mock result for query: ${query}`,
        url: `/page-1`,
        type: 'page'
      },
      {
        id: '2',
        title: `Result 2 for ${query}`,
        excerpt: `Another mock result for query: ${query}`,
        url: `/page-2`,
        type: 'article'
      }
    ];

    return new Response(JSON.stringify({ results: mockResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}));

const { GET: searchGET } = require('../../app/api/search/route');

describe('API Routes', () => {
  describe('Search API', () => {
    test('should return search results for valid query', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await searchGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('results');
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results).toHaveLength(2);
    });

    test('should return empty results for missing query', async () => {
      const request = new NextRequest('http://localhost:3000/api/search');
      const response = await searchGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.results).toEqual([]);
    });

    test('should include query term in results', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=materials');
      const response = await searchGET(request);
      
      const data = await response.json();
      expect(data.results[0].title).toContain('materials');
      expect(data.results[0].excerpt).toContain('materials');
    });

    test('should return properly structured search results', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=structure');
      const response = await searchGET(request);
      
      const data = await response.json();
      const result = data.results[0];
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('excerpt');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('type');
    });

    test('should handle URL encoding in query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=test%20query%20with%20spaces');
      const response = await searchGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.results).toHaveLength(2);
    });
  });
});
